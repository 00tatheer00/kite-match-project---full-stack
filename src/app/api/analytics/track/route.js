import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { karachiDay } from '@/lib/analytics';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const SOURCES = new Set(['direct', 'whatsapp', 'facebook', 'instagram', 'google', 'tiktok', 'referral']);
const DEVICES = new Set(['mobile', 'desktop', 'tablet']);
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|vercel/i;

function cleanPath(value) {
  const p = String(value || '/').split('?')[0].split('#')[0].slice(0, 120);
  return p.startsWith('/') ? p : '/';
}

function headerLocation(req) {
  const decode = (v) => {
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  const vercelCity = req.headers.get('x-vercel-ip-city');
  const country = (req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || '').slice(0, 2).toUpperCase();
  const cfCity = req.headers.get('cf-ipcity');
  const cityName = vercelCity ? decode(vercelCity) : cfCity || '';
  return {
    city: cityName ? `${cityName.slice(0, 60)}, ${country || 'PK'}` : 'Unknown',
    country: country || 'Unknown',
  };
}

function bump(obj, key) {
  const next = obj && typeof obj === 'object' ? { ...obj } : {};
  next[key] = (Number(next[key]) || 0) + 1;
  return next;
}

// POST /api/analytics/track — anonymous page-view counter (no IP addresses are stored).
export async function POST(req) {
  const limit = rateLimit(`track:${getClientIp(req)}`, { limit: 300, windowMs: 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });

  let payload = {};
  try {
    const text = await req.text();
    if (text && text.length < 4000) payload = JSON.parse(text);
  } catch {
    payload = {};
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: true });

  // Count people, not search-engine crawlers, link previewers or uptime monitors.
  const ua = req.headers.get('user-agent') || '';
  if (!ua || BOT_UA.test(ua)) return NextResponse.json({ ok: true });

  const path = cleanPath(payload.path);
  if (path.startsWith('/admin') || path.startsWith('/api')) return NextResponse.json({ ok: true });

  const source = SOURCES.has(payload.source) ? payload.source : 'direct';
  const device = DEVICES.has(payload.device) ? payload.device : 'desktop';
  const isNewVisitor = payload.newVisitor !== false; // older clients don't send the flag
  const { city, country } = headerLocation(req);

  // Preferred: atomic Postgres function (supabase/migrations/20261121_security_hardening.sql).
  if (!globalThis.__kiteNoTrackRpc) {
    const visit = { id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString(), path, source, device, city, country };
    const { error: rpcError } = await sb.rpc('track_page_view', {
      p_path: path,
      p_source: source,
      p_device: device,
      p_city: city,
      p_country: country,
      p_new_visitor: isNewVisitor,
      p_visit: visit,
    });
    if (!rpcError) return NextResponse.json({ ok: true });
    if (rpcError.code === 'PGRST202' || /could not find the function/i.test(rpcError.message || '')) {
      globalThis.__kiteNoTrackRpc = true; // migration not applied yet → use fallback below
    } else {
      console.warn('[analytics] track_page_view failed:', rpcError.message);
      return NextResponse.json({ ok: true });
    }
  }

  try {
    const { data: current, error } = await sb.from('analytics').select('*').eq('key', 'global_summary').maybeSingle();
    if (error) throw error;

    const nowIso = new Date().toISOString();
    const base = current || { id: 1, key: 'global_summary' };
    const sameDay = karachiDay(base.lastUpdated) === karachiDay(nowIso);

    const recent = Array.isArray(base.recentVisits) ? base.recentVisits : [];
    const row = {
      id: base.id ?? 1,
      key: 'global_summary',
      totalPageviews: (Number(base.totalPageviews) || 0) + 1,
      totalVisitors: (Number(base.totalVisitors) || 0) + (isNewVisitor ? 1 : 0),
      todayVisitors: (sameDay ? Number(base.todayVisitors) || 0 : 0) + (isNewVisitor ? 1 : 0),
      sources: isNewVisitor ? bump(base.sources, source) : base.sources || {},
      devices: isNewVisitor ? bump(base.devices, device) : base.devices || {},
      cities: isNewVisitor ? bump(base.cities, city) : base.cities || {},
      countries: isNewVisitor ? bump(base.countries, country) : base.countries || {},
      topPages: bump(base.topPages, path),
      recentVisits: [
        { id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: nowIso, path, source, device, city, country },
        ...recent.map(({ ip: _ip, ...rest }) => rest), // drop legacy IP fields
      ].slice(0, 50),
      lastUpdated: nowIso,
      updatedAt: nowIso,
    };

    // Fallback (read-modify-write): a few counts can be lost under heavy concurrency.
    // Apply the SQL migration to switch to the atomic function above.
    const { error: writeError } = await sb.from('analytics').upsert(row, { onConflict: 'id' });
    if (writeError) throw writeError;
  } catch (err) {
    console.warn('[analytics] track failed:', err.message);
  }

  return NextResponse.json({ ok: true });
}
