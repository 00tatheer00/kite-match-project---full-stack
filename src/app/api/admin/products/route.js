import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';
import { uploadImageBuffer } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

function parseVariantImagesField(value) {
  const parsed = parseJsonField(value, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => ({
      name: String(item?.name || '').trim(),
      image: parseImage(item?.image),
    }))
    .filter((item) => item.name || item.image);
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

export async function parseProductRequest(request) {
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

  const payload = {
    id: body.id,
    title: body.title,
    category: body.category,
    productType: body.productType || 'general',
    navGroup: body.navGroup || '',
    iconType: body.iconType || null,
    description: body.description || '',
    image: parseImage(body.image),
    images: parseImagesField(body.images),
    color: body.color || '',
    tagline: body.tagline || '',
    features: parseJsonField(body.features, []),
    variants: parseJsonField(body.variants, []),
    variantImages: parseVariantImagesField(body.variantImages),
    brands: parseJsonField(body.brands, []),
    sizes: parseJsonField(body.sizes, []),
    skus: parseJsonField(body.skus, []),
    facilities: parseJsonField(body.facilities, []),
    services: body.services || '',
    displayOrder: toNumber(body.displayOrder, 0),
    carouselOrder: toNumber(body.carouselOrder, 0),
    isActive: toBoolean(body.isActive, true),
    showOnLanding: toBoolean(body.showOnLanding, true),
    showInProductsPage: toBoolean(body.showInProductsPage, true),
    showInNavbar: toBoolean(body.showInNavbar, true),
  };

  if (files.length > 0) {
    const productImages = files.filter((f) => f.fieldname === 'productImages');
    const singleImage = files.find((f) => f.fieldname === 'image');
    const galleryFiles = files.filter((f) => f.fieldname === 'images');

    const primaryFile = productImages[0]?.file || singleImage?.file;
    const additionalFiles = productImages.length > 1
      ? productImages.slice(1).map((f) => f.file)
      : galleryFiles.map((f) => f.file);

    if (primaryFile) {
      payload.image = await uploadImageBuffer(primaryFile, { folder: 'kite/products' });
    }

    if (additionalFiles.length > 0) {
      payload.images = await Promise.all(
        additionalFiles.map((f) => uploadImageBuffer(f, { folder: 'kite/products/gallery' }))
      );
    }

    const variantFiles = files.filter((f) => /^variantImageFile_\d+$/i.test(f.fieldname));
    if (variantFiles.length > 0) {
      const nextVariantImages = Array.isArray(payload.variantImages)
        ? [...payload.variantImages]
        : [];
      for (const item of variantFiles) {
        const idx = Number(item.fieldname.split('_').pop());
        const uploadedUrl = await uploadImageBuffer(item.file, { folder: 'kite/products/variants' });
        nextVariantImages[idx] = {
          name: String(nextVariantImages[idx]?.name || '').trim(),
          image: uploadedUrl,
        };
      }
      payload.variantImages = nextVariantImages.filter((it) => it?.name || it?.image);
    }

    const brandFiles = files.filter((f) => /^brandImageFile_\d+$/i.test(f.fieldname));
    if (brandFiles.length > 0) {
      const nextBrands = Array.isArray(payload.brands) ? [...payload.brands] : [];
      for (const item of brandFiles) {
        const idx = Number(item.fieldname.split('_').pop());
        const uploadedUrl = await uploadImageBuffer(item.file, { folder: 'kite/products/brands' });
        nextBrands[idx] = {
          ...(nextBrands[idx] || {}),
          image: uploadedUrl,
        };
      }
      payload.brands = nextBrands;
    }
  }

  return { payload, hasBodyVariantImages: Object.prototype.hasOwnProperty.call(body, 'variantImages') };
}

// GET /api/admin/products
export async function GET(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data, error } = await sb
        .from('products')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch (err) {
      console.warn('Supabase products fetch failed:', err.message);
    }
  }

  // Fallback to local store
  try {
    const { getAllProducts } = await import('@/lib/store');
    const storeProducts = getAllProducts();
    if (storeProducts && storeProducts.length > 0) {
      return NextResponse.json(storeProducts);
    }
  } catch (e) {
    console.warn('Store read failed:', e.message);
  }

  // Fallback to remote backend
  try {
    const { fetchRemoteFallback } = await import('@/lib/api-fallback');
    const publicProducts = await fetchRemoteFallback('/products');
    if (publicProducts && Array.isArray(publicProducts)) {
      return NextResponse.json(publicProducts);
    }
  } catch (e) {
    console.warn('Remote fallback failed:', e.message);
  }

  return NextResponse.json([]);
}

// POST /api/admin/products
export async function POST(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await parseProductRequest(request);

    if (!payload.id || !payload.title || !payload.category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Save to Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const row = {
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const { data, error } = await sb
          .from('products')
          .upsert(row, { onConflict: 'id' })
          .select()
          .single();
        if (!error && data) {
          // Also save to local store as backup
          try {
            const { createProduct } = await import('@/lib/store');
            createProduct(payload);
          } catch {}
          return NextResponse.json(data, { status: 201 });
        }
        if (error) console.warn('Supabase insert failed:', error.message);
      } catch (sbErr) {
        console.warn('Supabase error:', sbErr.message);
      }
    }

    // Fallback: save to local store
    const { createProduct } = await import('@/lib/store');
    const createdInStore = createProduct(payload);
    return NextResponse.json(createdInStore, { status: 201 });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json({ message: err.message || 'Failed to create product' }, { status: 500 });
  }
}
