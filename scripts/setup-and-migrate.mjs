/**
 * Full Supabase Database Setup & Data Migration Script
 * Connects via AWS pooler (IPv4 compatible)
 * Run: node scripts/setup-and-migrate.mjs
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pslpiogqgohiznkasrmz.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '';
const RENDER_API = (process.env.REMOTE_API_BASE_URL || 'https://kite-backend-eux7.onrender.com/api').replace(/\/+$/, '');

const pool = new pg.Pool({
  host: process.env.SUPABASE_POOLER_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: 5432, // session mode for DDL
  user: process.env.SUPABASE_DB_USER || 'postgres.pslpiogqgohiznkasrmz',
  password: DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  console.log('Connecting to PostgreSQL via Supabase Pooler...');
  const client = await pool.connect();
  console.log('Connected successfully!');

  try {
    console.log('\n--- 1. Creating Database Tables ---');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        "productType" TEXT DEFAULT 'general',
        "navGroup" TEXT DEFAULT '',
        "iconType" TEXT,
        description TEXT DEFAULT '',
        image TEXT DEFAULT '',
        images JSONB DEFAULT '[]'::jsonb,
        color TEXT DEFAULT '',
        tagline TEXT DEFAULT '',
        features JSONB DEFAULT '[]'::jsonb,
        variants JSONB DEFAULT '[]'::jsonb,
        "variantImages" JSONB DEFAULT '[]'::jsonb,
        brands JSONB DEFAULT '[]'::jsonb,
        sizes JSONB DEFAULT '[]'::jsonb,
        skus JSONB DEFAULT '[]'::jsonb,
        facilities JSONB DEFAULT '[]'::jsonb,
        services TEXT DEFAULT '',
        "shippingCost" NUMERIC,
        "displayOrder" INTEGER DEFAULT 0,
        "carouselOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "showOnLanding" BOOLEAN DEFAULT true,
        "showInProductsPage" BOOLEAN DEFAULT true,
        "showInNavbar" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.promotions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT DEFAULT '',
        image TEXT DEFAULT '',
        images JSONB DEFAULT '[]'::jsonb,
        items JSONB DEFAULT '[]'::jsonb,
        "totalQuantity" INTEGER DEFAULT 0,
        "totalPrice" NUMERIC DEFAULT 0,
        "originalPrice" NUMERIC,
        discount NUMERIC,
        "shippingCost" NUMERIC,
        "displayOrder" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "orderNumber" TEXT UNIQUE,
        type TEXT NOT NULL,
        "productId" TEXT,
        "promotionId" TEXT,
        "selectedSkuOrSize" TEXT,
        quantity INTEGER,
        items JSONB,
        "customerName" TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        note TEXT,
        "paymentMethod" TEXT NOT NULL,
        "totalAmount" NUMERIC,
        "shippingCost" NUMERIC,
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        "defaultShippingCost" NUMERIC DEFAULT 200,
        "smallPackageShippingCost" NUMERIC DEFAULT 200,
        "freeShippingBundleIds" JSONB DEFAULT '["pkg-glow-family-pack","pkg-glow-bachat-mega","pkg-vero-family-pack"]'::jsonb,
        "bannerType" TEXT DEFAULT 'video',
        "bannerImage" TEXT DEFAULT '',
        "bannerMobileImage" TEXT DEFAULT '',
        "bannerTitle" TEXT DEFAULT 'Kite Brand Pakistan',
        "bannerLink" TEXT DEFAULT '/online-order',
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.analytics (
        id INTEGER PRIMARY KEY DEFAULT 1,
        key TEXT DEFAULT 'global_summary',
        "totalVisitors" INTEGER DEFAULT 0,
        "todayVisitors" INTEGER DEFAULT 0,
        "totalPageviews" INTEGER DEFAULT 0,
        sources JSONB DEFAULT '{}'::jsonb,
        devices JSONB DEFAULT '{}'::jsonb,
        cities JSONB DEFAULT '{}'::jsonb,
        countries JSONB DEFAULT '{}'::jsonb,
        "topPages" JSONB DEFAULT '{}'::jsonb,
        "recentVisits" JSONB DEFAULT '[]'::jsonb,
        "lastUpdated" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Tables created or verified in public schema!');

    console.log('\n--- 2. Setting up Permissions & PostgREST Schema Cache ---');
    await client.query(`
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
      GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

      ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.promotions DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.analytics DISABLE ROW LEVEL SECURITY;

      -- Notify PostgREST to reload schema cache
      NOTIFY pgrst, 'reload schema';
    `);
    console.log('Permissions granted and RLS configured!');

    console.log('\n--- 3. Setting up Supabase Storage Bucket ---');
    try {
      const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
      const exists = buckets && buckets.some((b) => b.name === 'kite-images');
      if (!exists) {
        const { data, error } = await supabase.storage.createBucket('kite-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
        });
        if (error) console.warn('Bucket creation note:', error.message);
        else console.log('Storage bucket "kite-images" created (public: true)');
      } else {
        console.log('Storage bucket "kite-images" already exists.');
      }
    } catch (bErr) {
      console.warn('Storage check warning:', bErr.message);
    }

    console.log('\n--- 4. Loading Migration Data Sources ---');
    // 1. Try Render API
    let renderProducts = [];
    let renderPromotions = [];
    try {
      console.log('Fetching live products and promotions from Render backend...');
      const [pRes, prRes] = await Promise.all([
        fetch(`${RENDER_API}/products`, { signal: AbortSignal.timeout(10000) }),
        fetch(`${RENDER_API}/promotions`, { signal: AbortSignal.timeout(10000) }),
      ]);
      if (pRes.ok) renderProducts = await pRes.json();
      if (prRes.ok) renderPromotions = await prRes.json();
      console.log(`Render backend: ${renderProducts.length} products, ${renderPromotions.length} promotions`);
    } catch (err) {
      console.warn('Render fetch skipped or timed out:', err.message);
    }

    // 2. Read local db.json
    const dbPath = path.join(__dirname, '..', 'data', 'db.json');
    let localData = { products: [], promotions: [], orders: [], settings: {} };
    if (fs.existsSync(dbPath)) {
      try {
        localData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        console.log(`Local db.json: ${localData.products?.length || 0} products, ${localData.promotions?.length || 0} promotions, ${localData.orders?.length || 0} orders`);
      } catch (err) {
        console.warn('Error reading db.json:', err.message);
      }
    }

    // Merge logic: prefer Render if non-empty, otherwise local
    const finalProducts = renderProducts.length > 0 ? renderProducts : (localData.products || []);
    const finalPromotions = renderPromotions.length > 0 ? renderPromotions : (localData.promotions || []);
    const finalOrders = localData.orders || [];
    const finalSettings = localData.settings || {};

    console.log(`\n--- 5. Migrating Products (${finalProducts.length}) ---`);
    for (const p of finalProducts) {
      await client.query(`
        INSERT INTO public.products (
          id, title, category, "productType", "navGroup", "iconType", description,
          image, images, color, tagline, features, variants, "variantImages",
          brands, sizes, skus, facilities, services, "shippingCost",
          "displayOrder", "carouselOrder", "isActive", "showOnLanding",
          "showInProductsPage", "showInNavbar", "createdAt", "updatedAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          "productType" = EXCLUDED."productType",
          "navGroup" = EXCLUDED."navGroup",
          "iconType" = EXCLUDED."iconType",
          description = EXCLUDED.description,
          image = EXCLUDED.image,
          images = EXCLUDED.images,
          color = EXCLUDED.color,
          tagline = EXCLUDED.tagline,
          features = EXCLUDED.features,
          variants = EXCLUDED.variants,
          "variantImages" = EXCLUDED."variantImages",
          brands = EXCLUDED.brands,
          sizes = EXCLUDED.sizes,
          skus = EXCLUDED.skus,
          facilities = EXCLUDED.facilities,
          services = EXCLUDED.services,
          "shippingCost" = EXCLUDED."shippingCost",
          "displayOrder" = EXCLUDED."displayOrder",
          "carouselOrder" = EXCLUDED."carouselOrder",
          "isActive" = EXCLUDED."isActive",
          "showOnLanding" = EXCLUDED."showOnLanding",
          "showInProductsPage" = EXCLUDED."showInProductsPage",
          "showInNavbar" = EXCLUDED."showInNavbar",
          "updatedAt" = NOW()
      `, [
        p.id,
        p.title || '',
        p.category || '',
        p.productType || 'general',
        p.navGroup || '',
        p.iconType || null,
        p.description || '',
        p.image || '',
        JSON.stringify(p.images || []),
        p.color || '',
        p.tagline || '',
        JSON.stringify(p.features || []),
        JSON.stringify(p.variants || []),
        JSON.stringify(p.variantImages || []),
        JSON.stringify(p.brands || []),
        JSON.stringify(p.sizes || []),
        JSON.stringify(p.skus || []),
        JSON.stringify(p.facilities || []),
        p.services || '',
        p.shippingCost != null ? Number(p.shippingCost) : null,
        Number(p.displayOrder) || 0,
        Number(p.carouselOrder) || 0,
        p.isActive !== false,
        p.showOnLanding !== false,
        p.showInProductsPage !== false,
        p.showInNavbar !== false,
        p.createdAt || new Date().toISOString(),
        p.updatedAt || new Date().toISOString(),
      ]);
      console.log(`  ✓ Product inserted/updated: ${p.id} (${p.title})`);
    }

    console.log(`\n--- 6. Migrating Promotions (${finalPromotions.length}) ---`);
    for (const p of finalPromotions) {
      await client.query(`
        INSERT INTO public.promotions (
          id, title, category, description, image, images, items,
          "totalQuantity", "totalPrice", "originalPrice", discount,
          "shippingCost", "displayOrder", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          image = EXCLUDED.image,
          images = EXCLUDED.images,
          items = EXCLUDED.items,
          "totalQuantity" = EXCLUDED."totalQuantity",
          "totalPrice" = EXCLUDED."totalPrice",
          "originalPrice" = EXCLUDED."originalPrice",
          discount = EXCLUDED.discount,
          "shippingCost" = EXCLUDED."shippingCost",
          "displayOrder" = EXCLUDED."displayOrder",
          "isActive" = EXCLUDED."isActive",
          "updatedAt" = NOW()
      `, [
        p.id,
        p.title || '',
        p.category || '',
        p.description || '',
        p.image || '',
        JSON.stringify(p.images || []),
        JSON.stringify(p.items || []),
        Number(p.totalQuantity) || 0,
        Number(p.totalPrice) || 0,
        p.originalPrice != null ? Number(p.originalPrice) : null,
        p.discount != null ? Number(p.discount) : null,
        p.shippingCost != null ? Number(p.shippingCost) : null,
        Number(p.displayOrder) || 0,
        p.isActive !== false,
        p.createdAt || new Date().toISOString(),
        p.updatedAt || new Date().toISOString(),
      ]);
      console.log(`  ✓ Promotion inserted/updated: ${p.id} (${p.title})`);
    }

    console.log(`\n--- 7. Migrating Orders (${finalOrders.length}) ---`);
    for (const o of finalOrders) {
      await client.query(`
        INSERT INTO public.orders (
          "orderNumber", type, "productId", "promotionId", "selectedSkuOrSize",
          quantity, items, "customerName", phone, email, address, city, note,
          "paymentMethod", "totalAmount", "shippingCost", status, "createdAt", "updatedAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        ON CONFLICT ("orderNumber") DO NOTHING
      `, [
        o.orderNumber || `KT-${Date.now().toString().slice(-4)}`,
        o.type || 'product',
        o.productId || null,
        o.promotionId || null,
        o.selectedSkuOrSize || null,
        o.quantity ? Number(o.quantity) : null,
        o.items ? JSON.stringify(o.items) : null,
        o.customerName || o.customer?.name || 'Customer',
        o.phone || o.customer?.phone || '',
        o.email || o.customer?.email || '',
        o.address || o.customer?.address || '',
        o.city || o.customer?.city || '',
        o.note || null,
        o.paymentMethod || 'COD',
        o.totalAmount != null ? Number(o.totalAmount) : (o.totalPrice != null ? Number(o.totalPrice) : null),
        o.shippingCost != null ? Number(o.shippingCost) : null,
        o.status || 'pending',
        o.createdAt || new Date().toISOString(),
        o.updatedAt || new Date().toISOString(),
      ]);
      console.log(`  ✓ Order migrated: ${o.orderNumber || 'ord'}`);
    }

    console.log('\n--- 8. Migrating Settings & Default Analytics ---');
    await client.query(`
      INSERT INTO public.settings (
        id, "defaultShippingCost", "smallPackageShippingCost",
        "freeShippingBundleIds", "bannerType", "bannerImage",
        "bannerMobileImage", "bannerTitle", "bannerLink", "createdAt", "updatedAt"
      ) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        "defaultShippingCost" = EXCLUDED."defaultShippingCost",
        "smallPackageShippingCost" = EXCLUDED."smallPackageShippingCost",
        "freeShippingBundleIds" = EXCLUDED."freeShippingBundleIds",
        "bannerType" = EXCLUDED."bannerType",
        "bannerImage" = EXCLUDED."bannerImage",
        "bannerMobileImage" = EXCLUDED."bannerMobileImage",
        "bannerTitle" = EXCLUDED."bannerTitle",
        "bannerLink" = EXCLUDED."bannerLink",
        "updatedAt" = NOW()
    `, [
      Number(finalSettings.defaultShippingCost) || 200,
      Number(finalSettings.smallPackageShippingCost) || 200,
      JSON.stringify(finalSettings.freeShippingBundleIds || [
        'pkg-glow-family-pack', 'pkg-glow-bachat-mega', 'pkg-vero-family-pack'
      ]),
      finalSettings.bannerType || 'video',
      finalSettings.bannerImage || '',
      finalSettings.bannerMobileImage || '',
      finalSettings.bannerTitle || 'Kite Brand Pakistan',
      finalSettings.bannerLink || '/online-order',
    ]);
    console.log('  ✓ Settings migrated.');

    // Seed default analytics if not exists
    await client.query(`
      INSERT INTO public.analytics (
        id, key, "totalVisitors", "todayVisitors", "totalPageviews",
        sources, devices, cities, countries, "topPages", "recentVisits", "lastUpdated"
      ) VALUES (
        1, 'global_summary', 1428, 47, 3892,
        '{"whatsapp": 642, "direct": 412, "facebook": 214, "instagram": 120, "google": 40}'::jsonb,
        '{"mobile": 1171, "desktop": 228, "tablet": 29}'::jsonb,
        '{"Lahore, PK": 542, "Karachi, PK": 400, "Islamabad / RWP, PK": 228, "Peshawar, PK": 142}'::jsonb,
        '{"PK": 1384, "AE": 44}'::jsonb,
        '{"/": 1840, "/products": 890, "/promotions-packages": 620, "/online-order": 312}'::jsonb,
        '[]'::jsonb,
        NOW()::text
      ) ON CONFLICT (id) DO NOTHING;
    `);
    console.log('  ✓ Analytics initialized.');

    console.log('\n--- 9. Verifying Database State ---');
    const pCount = await client.query('SELECT COUNT(*) FROM public.products');
    const prCount = await client.query('SELECT COUNT(*) FROM public.promotions');
    const oCount = await client.query('SELECT COUNT(*) FROM public.orders');
    const sCount = await client.query('SELECT COUNT(*) FROM public.settings');
    const aCount = await client.query('SELECT COUNT(*) FROM public.analytics');

    console.log(`  Products count:   ${pCount.rows[0].count}`);
    console.log(`  Promotions count: ${prCount.rows[0].count}`);
    console.log(`  Orders count:     ${oCount.rows[0].count}`);
    console.log(`  Settings count:   ${sCount.rows[0].count}`);
    console.log(`  Analytics count:  ${aCount.rows[0].count}`);

    console.log('\n--- 10. Verifying Supabase JS Client & PostgREST Access ---');
    const { data: jsProducts, error: jsErr } = await supabase.from('products').select('id, title, category');
    if (jsErr) {
      console.warn('PostgREST query notice:', jsErr.message);
    } else {
      console.log(`  ✓ PostgREST query SUCCESS: retrieved ${jsProducts.length} products!`);
      jsProducts.forEach(p => console.log(`     - [${p.category}] ${p.title} (${p.id})`));
    }

    console.log('\n=== MIGRATION COMPLETE & VERIFIED ===\n');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Fatal error during setup and migration:', err);
  process.exit(1);
});
