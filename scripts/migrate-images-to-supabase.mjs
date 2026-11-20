/**
 * Migrate all Cloudinary images to Supabase Storage bucket 'kite-images'
 * and update image URLs in Supabase PostgreSQL database
 * Run: node scripts/migrate-images-to-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pslpiogqgohiznkasrmz.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const cache = new Map();

async function transferImage(url, folder = 'migrated') {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http')) return trimmed;
  // If already on Supabase Storage, skip
  if (trimmed.includes('supabase.co/storage')) return trimmed;

  if (cache.has(trimmed)) {
    return cache.get(trimmed);
  }

  try {
    console.log(`  Downloading: ${trimmed.slice(0, 60)}...`);
    const res = await fetch(trimmed, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.warn(`  Failed to fetch: ${res.status}`);
      return trimmed;
    }

    const contentType = res.headers.get('content-type') || 'image/webp';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract filename from URL
    const cleanUrl = trimmed.split('?')[0];
    const rawName = cleanUrl.split('/').pop() || `img_${Date.now()}`;
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folder}/${Date.now()}_${safeName}`;

    const { error: upErr } = await supabase.storage
      .from('kite-images')
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      });

    if (upErr) {
      console.warn('  Upload failed:', upErr.message);
      return trimmed;
    }

    const { data: urlData } = supabase.storage
      .from('kite-images')
      .getPublicUrl(storagePath);

    const publicUrl = urlData?.publicUrl || trimmed;
    console.log(`  ✓ Transferred -> ${publicUrl.slice(0, 70)}...`);
    cache.set(trimmed, publicUrl);
    return publicUrl;
  } catch (err) {
    console.warn(`  Transfer failed for ${trimmed}:`, err.message);
    return trimmed;
  }
}

async function migrateAllImages() {
  console.log('=== Migrating Images from Cloudinary to Supabase Storage ===\n');

  // 1. Products
  const { data: products, error: pErr } = await supabase.from('products').select('*');
  if (pErr) console.error('Failed to get products:', pErr);
  else {
    console.log(`Processing ${products.length} products...`);
    for (const p of products) {
      console.log(`\nProduct: ${p.title} (${p.id})`);
      const newMainImage = await transferImage(p.image, 'products');

      let newImages = [];
      if (Array.isArray(p.images) && p.images.length > 0) {
        for (const img of p.images) {
          newImages.push(await transferImage(img, 'products/gallery'));
        }
      }

      let newVariantImages = [];
      if (Array.isArray(p.variantImages) && p.variantImages.length > 0) {
        for (const vi of p.variantImages) {
          const newViUrl = await transferImage(vi.image, 'products/variants');
          newVariantImages.push({ ...vi, image: newViUrl });
        }
      }

      let newBrands = [];
      if (Array.isArray(p.brands) && p.brands.length > 0) {
        for (const b of p.brands) {
          const newBrandUrl = await transferImage(b.image, 'products/brands');
          newBrands.push({ ...b, image: newBrandUrl });
        }
      }

      const { error: updErr } = await supabase.from('products').update({
        image: newMainImage,
        images: newImages,
        variantImages: newVariantImages,
        brands: newBrands,
        updatedAt: new Date().toISOString(),
      }).eq('id', p.id);

      if (updErr) console.error(`  Update failed for product ${p.id}:`, updErr.message);
      else console.log(`  ✓ Product ${p.id} updated with Supabase Storage URLs.`);
    }
  }

  // 2. Promotions
  const { data: promos, error: prErr } = await supabase.from('promotions').select('*');
  if (prErr) console.error('Failed to get promotions:', prErr);
  else {
    console.log(`\nProcessing ${promos.length} promotions...`);
    for (const pr of promos) {
      console.log(`\nPromotion: ${pr.title} (${pr.id})`);
      const newMainImage = await transferImage(pr.image, 'promotions');

      let newImages = [];
      if (Array.isArray(pr.images) && pr.images.length > 0) {
        for (const img of pr.images) {
          newImages.push(await transferImage(img, 'promotions/gallery'));
        }
      }

      const { error: updErr } = await supabase.from('promotions').update({
        image: newMainImage,
        images: newImages,
        updatedAt: new Date().toISOString(),
      }).eq('id', pr.id);

      if (updErr) console.error(`  Update failed for promo ${pr.id}:`, updErr.message);
      else console.log(`  ✓ Promotion ${pr.id} updated with Supabase Storage URLs.`);
    }
  }

  // 3. Settings
  const { data: settings } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (settings) {
    console.log('\nProcessing Settings banners...');
    const bannerImage = await transferImage(settings.bannerImage, 'banners');
    const bannerMobileImage = await transferImage(settings.bannerMobileImage, 'banners');

    await supabase.from('settings').update({
      bannerImage,
      bannerMobileImage,
      updatedAt: new Date().toISOString(),
    }).eq('id', 1);
    console.log('  ✓ Settings updated with Supabase Storage URLs.');
  }

  console.log(`\n=== All Images Transferred! (${cache.size} unique images migrated) ===`);
}

migrateAllImages().catch(console.error);
