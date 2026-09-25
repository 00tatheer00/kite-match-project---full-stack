import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { verifyAdminAuth } from '@/lib/auth';
import { fetchRemoteFallback } from '@/lib/api-fallback';

// GET /api/settings (public for checkout)
export async function GET() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ defaultShippingCost: 150 });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.warn('Local database unavailable, falling back to remote API for /api/settings:', error.message);
    const remoteData = await fetchRemoteFallback('/settings');
    if (remoteData) {
      return NextResponse.json(remoteData);
    }
    // Return sensible fallback settings rather than 500
    return NextResponse.json({ defaultShippingCost: 150, freeShippingThreshold: 2000 });
  }
}

// PUT /api/settings (admin only)
export async function PUT(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(body);
    } else {
      Object.assign(settings, body);
    }
    await settings.save();
    return NextResponse.json(settings);
  } catch (error) {
    console.warn('Local database unavailable, updating store and remote fallback for PUT /api/settings:', error.message);
    try {
      const body = await request.clone().json().catch(() => null);
      if (body) {
        const { updateSettings } = await import('@/lib/store');
        const updated = updateSettings(body);
        return NextResponse.json(updated);
      }
    } catch {}

    try {
      const { forwardRemoteRequest } = await import('@/lib/api-fallback');
      const auth = request.headers.get('authorization') || '';
      const body = await request.clone().json().catch(() => null);
      const res = await forwardRemoteRequest('/settings', {
        method: 'PUT',
        headers: auth ? { Authorization: auth } : {},
        body,
      });
      if (res.ok && res.data) {
        return NextResponse.json(res.data);
      }
    } catch (e) {
      console.error('Remote settings fallback failed:', e);
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
