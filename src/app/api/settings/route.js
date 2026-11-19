import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { verifyAdminAuth } from '@/lib/auth';
import { fetchRemoteFallback } from '@/lib/api-fallback';
import { uploadImageBuffer } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_SETTINGS = {
  defaultShippingCost: 200,
  smallPackageShippingCost: 200,
  freeShippingBundleIds: [
    'pkg-glow-family-pack',
    'pkg-glow-bachat-mega',
    'pkg-vero-family-pack',
  ],
  bannerType: 'video', // 'image' or 'video'
  bannerImage: '',
  bannerMobileImage: '',
  bannerTitle: 'Kite Brand Pakistan',
  bannerLink: '/online-order',
};

// GET /api/settings (public for checkout & frontend)
export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create(DEFAULT_SETTINGS);
      }
      return NextResponse.json(settings);
    }
  } catch (error) {
    // Database offline
  }

  try {
    const { getSettings } = await import('@/lib/store');
    const storeSettings = getSettings();
    if (storeSettings) {
      return NextResponse.json({ ...DEFAULT_SETTINGS, ...storeSettings });
    }
  } catch {}

  return NextResponse.json(DEFAULT_SETTINGS);
}

// PUT /api/settings (admin only)
export async function PUT(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let payload = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function' && value.size > 0) {
          if (key === 'bannerImageFile') {
            payload.bannerImage = await uploadImageBuffer(value, { folder: 'kite/banners' });
          } else if (key === 'bannerMobileImageFile') {
            payload.bannerMobileImage = await uploadImageBuffer(value, { folder: 'kite/banners' });
          }
        } else {
          payload[key] = value;
        }
      }
      if (typeof payload.freeShippingBundleIds === 'string') {
        try {
          payload.freeShippingBundleIds = JSON.parse(payload.freeShippingBundleIds);
        } catch {
          payload.freeShippingBundleIds = payload.freeShippingBundleIds
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    } else {
      payload = await request.json();
    }

    if (payload.defaultShippingCost !== undefined) {
      payload.defaultShippingCost = Number(payload.defaultShippingCost) || 200;
    }
    if (payload.smallPackageShippingCost !== undefined) {
      payload.smallPackageShippingCost = Number(payload.smallPackageShippingCost) || 200;
    }

    // Always update store file (db.json) for persistence across reloads
    try {
      const { updateSettings } = await import('@/lib/store');
      updateSettings(payload);
    } catch (e) {
      console.warn('Could not update local store:', e.message);
    }

    try {
      const conn = await connectToDatabase();
      if (conn) {
        let settings = await Settings.findOne();
        if (!settings) {
          settings = new Settings({ ...DEFAULT_SETTINGS, ...payload });
        } else {
          Object.assign(settings, payload);
        }
        await settings.save();
        return NextResponse.json(settings);
      }
    } catch (dbErr) {
      console.warn('Could not persist settings to MongoDB:', dbErr.message);
    }

    try {
      const { getSettings } = await import('@/lib/store');
      return NextResponse.json({ ...DEFAULT_SETTINGS, ...getSettings() });
    } catch {
      return NextResponse.json({ ...DEFAULT_SETTINGS, ...payload });
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
