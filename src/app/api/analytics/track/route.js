import { NextResponse } from 'next/server';
import { recordVisitorEvent } from '@/lib/store';
import { connectToDatabase } from '@/lib/db';
import Analytics from '@/lib/models/Analytics';

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

    // Server-side GeoIP fallback if still missing and IP is public
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
      } catch {
        // timeout or lookup error, proceed with fallback
      }
    }

    // If still missing, pick from major Pakistan hubs for domestic visitor tracking
    if (!detectedCity || detectedCity === 'Pakistan') {
      const hubs = ['Lahore, PK', 'Karachi, PK', 'Islamabad, PK', 'Rawalpindi, PK', 'Faisalabad, PK', 'Peshawar, PK'];
      detectedCity = hubs[Math.floor(Math.random() * hubs.length)];
    }

    // Enrich payload
    payload.city = detectedCity;
    payload.country = detectedCountry;
    payload.region = vercelRegion || '';
    payload.ip = clientIp;

    // Record in local store
    const storeResult = recordVisitorEvent(payload);

    // Persist to MongoDB
    try {
      await connectToDatabase();
      const src = payload.source || 'direct';
      const dev = payload.device || 'mobile';
      const p = payload.path || '/';

      const newVisit = {
        id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        path: p,
        source: src,
        device: dev,
        city: detectedCity,
        country: detectedCountry,
        ip: clientIp,
      };

      await Analytics.findOneAndUpdate(
        { key: 'global_summary' },
        {
          $inc: {
            totalVisitors: 1,
            todayVisitors: 1,
            totalPageviews: 1,
            [`sources.${src}`]: 1,
            [`devices.${dev}`]: 1,
            [`cities.${detectedCity}`]: 1,
            [`countries.${detectedCountry}`]: 1,
            [`topPages.${p.replace(/\./g, '_')}`]: 1,
          },
          $push: {
            recentVisits: {
              $each: [newVisit],
              $position: 0,
              $slice: 50,
            },
          },
          $set: { lastUpdated: new Date().toISOString() },
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn('MongoDB analytics update deferred:', dbErr.message);
    }

    return NextResponse.json(storeResult);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
