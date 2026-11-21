import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSettings } from '@/lib/data';
import { uploadImageBuffer } from '@/lib/storage';
import { DEFAULT_SETTINGS, DEFAULT_SHIPPING_COST } from '@/lib/constants';
import { handleRouteError, jsonError, requireAdmin, revalidateCatalog } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/settings (public: shipping rules & banner for checkout/home)
export async function GET() {
  try {
    return NextResponse.json(await getSettings());
  } catch {
    // Settings are non-critical for rendering; serve defaults on a DB hiccup.
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

function linkOrPath(value) {
  const v = String(value ?? '').trim().slice(0, 2000);
  if (!v) return '';
  if (v.startsWith('/') && !v.startsWith('//')) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return null; // invalid
}

function shippingCost(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_SHIPPING_COST;
}

// Only these keys can be written by the admin settings page.
function sanitizeSettings(raw) {
  const out = {};
  if (raw.defaultShippingCost !== undefined) out.defaultShippingCost = shippingCost(raw.defaultShippingCost);
  if (raw.smallPackageShippingCost !== undefined) out.smallPackageShippingCost = shippingCost(raw.smallPackageShippingCost);

  if (raw.freeShippingBundleIds !== undefined) {
    let ids = raw.freeShippingBundleIds;
    if (typeof ids === 'string') {
      try {
        ids = JSON.parse(ids);
      } catch {
        ids = ids.split(',');
      }
    }
    out.freeShippingBundleIds = (Array.isArray(ids) ? ids : [])
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 100);
  }

  if (raw.bannerType !== undefined) {
    if (!['image', 'video'].includes(raw.bannerType)) throw Object.assign(new Error('bannerType must be "image" or "video"'), { status: 400 });
    out.bannerType = raw.bannerType;
  }
  if (raw.bannerTitle !== undefined) out.bannerTitle = String(raw.bannerTitle).trim().slice(0, 200);

  for (const key of ['bannerImage', 'bannerMobileImage', 'bannerLink']) {
    if (raw[key] !== undefined) {
      const v = linkOrPath(raw[key]);
      if (v === null) throw Object.assign(new Error(`${key} must be a /path or https:// URL`), { status: 400 });
      out[key] = v;
    }
  }
  return out;
}

// PUT /api/settings (admin only)
export async function PUT(request) {
  const { response } = requireAdmin(request);
  if (response) return response;

  try {
    const contentType = request.headers.get('content-type') || '';
    let raw = {};
    const uploads = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
          if (value.size > 0 && (key === 'bannerImageFile' || key === 'bannerMobileImageFile')) uploads[key] = value;
        } else {
          raw[key] = value;
        }
      }
    } else {
      try {
        raw = await request.json();
      } catch {
        return jsonError('Invalid request body', 400);
      }
    }

    const update = sanitizeSettings(raw || {});
    if (uploads.bannerImageFile) update.bannerImage = await uploadImageBuffer(uploads.bannerImageFile, { folder: 'banners' });
    if (uploads.bannerMobileImageFile) update.bannerMobileImage = await uploadImageBuffer(uploads.bannerMobileImageFile, { folder: 'banners' });

    const sb = getSupabaseAdmin();
    if (!sb) return jsonError('Database is not configured', 503);

    const { data, error } = await sb
      .from('settings')
      .upsert({ ...update, id: 1, updatedAt: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.error('[settings] update failed:', error.message);
      return jsonError('Failed to save settings', 503);
    }

    revalidateCatalog();
    return NextResponse.json({ ...DEFAULT_SETTINGS, ...data });
  } catch (err) {
    return handleRouteError(err, 'update settings');
  }
}
