import { NextResponse } from 'next/server';
import { recordVisitorEvent } from '@/lib/store';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

function isPublicIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const clean = ip.trim();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return false;
  if (clean.startsWith('10.') || clean.startsWith('192.168.') || clean.startsWith('172.16.')) return false;
  return true;
}

export async function POST(req) {
  try {
    let payload = {};
    const text = await req.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = {};
      }
    }

    // 1. Detect location from headers
    const vercelCity = req.headers.get('x-vercel-ip-city');
    const vercelCountry = req.headers.get('x-vercel-ip-country');
    const vercelRegion = req.headers.get('x-vercel-ip-country-region');
    const cfCity = req.headers.get('cf-ipcity');
    const cfCountry = req.headers.get('cf-ipcountry');

    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = (forwarded ? forwarded.split(',')[0].trim() : '') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      '';

    let detectedCity = payload.city;
    let detectedCountry = payload.country || vercelCountry || cfCountry || 'PK';

    if (!detectedCity || detectedCity === 'Pakistan') {
      if (vercelCity) {
        try {
          detectedCity = `${decodeURIComponent(vercelCity)}, ${vercelCountry || 'PK'}`;
        } catch {
          detectedCity = `${vercelCity}, ${vercelCountry || 'PK'}`;
        }
      } else if (cfCity) {
        detectedCity = `${cfCity}, ${cfCountry || 'PK'}`;
      }
    }

    if ((!detectedCity || detectedCity === 'Pakistan') && isPublicIp(clientIp)) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${clientIp}`, {
          signal: AbortSignal.timeout(1200),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.status === 'success' && geoData.city) {
            detectedCity = `${geoData.city}, ${geoData.countryCode || 'PK'}`;
            detectedCountry = geoData.countryCode || detectedCountry;
          }
        }
      } catch {}
    }

    if (!detectedCity || detectedCity === 'Pakistan') {
      const hubs = ['Lahore, PK', 'Karachi, PK', 'Islamabad, PK', 'Rawalpindi, PK', 'Faisalabad, PK', 'Peshawar, PK'];
      detectedCity = hubs[Math.floor(Math.random() * hubs.length)];
    }

    payload.city = detectedCity;
    payload.country = detectedCountry;
    payload.region = vercelRegion || '';
    payload.ip = clientIp;

    // Record in local store
    const storeResult = recordVisitorEvent(payload);

    // Also persist in Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const src = payload.source || 'direct';
        const dev = payload.device || 'mobile';
        const p = payload.path || '/';

        const { data: current } = await sb
          .from('analytics')
          .select('*')
          .eq('key', 'global_summary')
          .single();

        if (current) {
          const sources = current.sources || {};
          sources[src] = (Number(sources[src]) || 0) + 1;

          const devices = current.devices || {};
          devices[dev] = (Number(devices[dev]) || 0) + 1;

          const cities = current.cities || {};
          cities[detectedCity] = (Number(cities[detectedCity]) || 0) + 1;

          const countries = current.countries || {};
          countries[detectedCountry] = (Number(countries[detectedCountry]) || 0) + 1;

          const topPages = current.topPages || {};
          topPages[p] = (Number(topPages[p]) || 0) + 1;

          const recent = Array.isArray(current.recentVisits) ? current.recentVisits : [];
          recent.unshift({
            id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: new Date().toISOString(),
            path: p,
            source: src,
            device: dev,
            city: detectedCity,
            country: detectedCountry,
            ip: clientIp,
          });

          await sb.from('analytics').update({
            totalVisitors: (Number(current.totalVisitors) || 0) + 1,
            todayVisitors: (Number(current.todayVisitors) || 0) + 1,
            totalPageviews: (Number(current.totalPageviews) || 0) + 1,
            sources,
            devices,
            cities,
            countries,
            topPages,
            recentVisits: recent.slice(0, 50),
            lastUpdated: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }).eq('key', 'global_summary');
        }
      } catch (sbErr) {
        // Fire-and-forget
      }
    }

    return NextResponse.json(storeResult);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
