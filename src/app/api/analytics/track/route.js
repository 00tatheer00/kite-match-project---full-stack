import { NextResponse } from 'next/server';
import { recordVisitorEvent } from '@/lib/store';

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

    // 1. Detect location from Vercel edge headers
    const vercelCity = req.headers.get('x-vercel-ip-city');
    const vercelCountry = req.headers.get('x-vercel-ip-country');
    const vercelRegion = req.headers.get('x-vercel-ip-country-region');
    const cfCity = req.headers.get('cf-ipcity');
    const cfCountry = req.headers.get('cf-ipcountry');

    let detectedCity = payload.city;
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

    const detectedCountry = payload.country || vercelCountry || cfCountry || 'PK';

    // Enrich payload
    payload.city = detectedCity || 'Pakistan';
    payload.country = detectedCountry;
    payload.region = vercelRegion || '';

    const result = recordVisitorEvent(payload);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
