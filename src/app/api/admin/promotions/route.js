import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromotionPackage from '@/lib/models/PromotionPackage';
import { verifyAdminAuth } from '@/lib/auth';
import { uploadImageBuffer, isCloudinaryConfigured } from '@/lib/cloudinary';

function parseJsonField(value, fallback = []) {
  if (value == null || value === '') return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseImage(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function parseImagesField(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  const parsed = parseJsonField(value, []);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item || '').trim()).filter(Boolean);
  }
  return [];
}

function toBoolean(value, defaultValue = true) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}

function toNumber(value, defaultValue = 0) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

export async function parsePromotionRequest(request) {
  const contentType = request.headers.get('content-type') || '';
  let body = {};
  const files = [];

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function' && value.size > 0) {
        files.push({ fieldname: key, file: value });
      } else {
        body[key] = value;
      }
    }
  } else {
    body = await request.json();
  }

  const items = parseJsonField(body.items, []);
  const totalQuantityFromItems = items.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0),
    0
  );
  const totalPriceFromItems = items.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.price) || 0),
    0
  );

  const payload = {
    id: body.id,
    title: body.title,
    category: body.category,
    description: body.description || '',
    image: parseImage(body.image),
    images: parseImagesField(body.images),
    items,
    totalQuantity: items.length ? totalQuantityFromItems : toNumber(body.totalQuantity, 0),
    totalPrice: items.length ? totalPriceFromItems : toNumber(body.totalPrice, 0),
    originalPrice: body.originalPrice === "" || body.originalPrice == null ? null : toNumber(body.originalPrice, 0),
    discount: body.discount === "" || body.discount == null ? null : toNumber(body.discount, 0),
    shippingCost: body.shippingCost === "" || body.shippingCost == null ? null : toNumber(body.shippingCost, 0),
    displayOrder: toNumber(body.displayOrder, 0),
    isActive: toBoolean(body.isActive, true),
  };

  let hasPrimaryUpload = false;
  let hasGalleryUpload = false;

  if (files.length > 0) {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary credentials are missing.');
    }

    const promotionImages = files.filter((f) => f.fieldname === 'promotionImages');
    const singleImage = files.find((f) => f.fieldname === 'image');
    const galleryFiles = files.filter((f) => f.fieldname === 'images');

    const primaryFile = promotionImages[0]?.file || singleImage?.file;
    const additionalFiles = promotionImages.length > 1
      ? promotionImages.slice(1).map((f) => f.file)
      : galleryFiles.map((f) => f.file);

    if (primaryFile) {
      payload.image = await uploadImageBuffer(primaryFile, { folder: 'kite/promotions' });
      hasPrimaryUpload = true;
    }

    if (additionalFiles.length > 0) {
      payload.images = await Promise.all(
        additionalFiles.map((f) => uploadImageBuffer(f, { folder: 'kite/promotions/gallery' }))
      );
      hasGalleryUpload = true;
    }
  }

  return { payload, hasPrimaryUpload, hasGalleryUpload };
}

// GET /api/admin/promotions
export async function GET(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const forceSync = searchParams.get('sync') === 'true';

  // Always have local store packages ready as source of truth
  let storePromos = [];
  try {
    const { getAllPromotions } = await import('@/lib/store');
    storePromos = getAllPromotions();
  } catch (e) {
    console.warn('Store read failed for promotions:', e.message);
  }

  try {
    await connectToDatabase();

    // Auto-sync if requested or if database is missing packages
    const count = await PromotionPackage.countDocuments();
    const starter = await PromotionPackage.findOne({ id: 'pkg-kite-smart-starter' });

    if (forceSync || count < 9 || !starter) {
      if (storePromos && storePromos.length > 0) {
        for (const p of storePromos) {
          await PromotionPackage.findOneAndUpdate(
            { id: p.id },
            { $set: p },
            { upsert: true, new: true }
          );
        }
      }
    }

    const promos = await PromotionPackage.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    if (promos && promos.length >= 9) {
      return NextResponse.json(promos);
    }
    if (promos && promos.length > 0) {
      // Merge with store promos so all 9 packages are present
      const map = new Map();
      storePromos.forEach((p) => map.set(p.id, p));
      promos.forEach((p) => map.set(p.id, p));
      return NextResponse.json(Array.from(map.values()));
    }
  } catch (err) {
    // MongoDB offline or connecting
  }

  // Use local persistent store
  if (storePromos && storePromos.length > 0) {
    return NextResponse.json(storePromos);
  }

  // Fallback to remote backend
  try {
    const { fetchRemoteFallback } = await import('@/lib/api-fallback');
    const publicPromos = await fetchRemoteFallback('/promotions');
    if (publicPromos && Array.isArray(publicPromos)) {
      return NextResponse.json(publicPromos);
    }
  } catch (e) {
    console.warn('Remote fallback failed for admin promotions:', e.message);
  }

  return NextResponse.json([]);
}

// POST /api/admin/promotions
export async function POST(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await parsePromotionRequest(request);

    if (!payload.id || !payload.title || !payload.category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Save in local persistent store
    const { createPromotion } = await import('@/lib/store');
    const createdInStore = createPromotion(payload);

    // Also attempt saving to MongoDB if reachable
    try {
      await connectToDatabase();
      const existing = await PromotionPackage.findOne({ id: payload.id });
      if (!existing) {
        await PromotionPackage.create(payload);
      }
    } catch (dbErr) {
      console.warn('Could not persist to MongoDB, saved to local store:', dbErr.message);
    }

    return NextResponse.json(createdInStore, { status: 201 });
  } catch (err) {
    console.error('Error creating promotion:', err);
    return NextResponse.json({ message: err.message || 'Failed to create promotion' }, { status: 500 });
  }
}
