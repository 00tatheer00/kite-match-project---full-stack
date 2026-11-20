/**
 * Sync local data/db.json with Supabase data so offline/local fallbacks match
 * Run: node scripts/sync-local-from-supabase.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pslpiogqgohiznkasrmz.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('Fetching latest data from Supabase...');
  const [pRes, prRes, oRes, sRes] = await Promise.all([
    supabase.from('products').select('*').order('displayOrder', { ascending: true }),
    supabase.from('promotions').select('*').order('displayOrder', { ascending: true }),
    supabase.from('orders').select('*').order('createdAt', { ascending: false }),
    supabase.from('settings').select('*').eq('id', 1).single(),
  ]);

  const dbPath = path.join(__dirname, '..', 'data', 'db.json');
  let current = {};
  if (fs.existsSync(dbPath)) {
    try {
      current = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch {}
  }

  const updated = {
    ...current,
    products: pRes.data || current.products || [],
    promotions: prRes.data || current.promotions || [],
    orders: oRes.data || current.orders || [],
    settings: sRes.data || current.settings || { defaultShippingCost: 200 },
  };

  fs.writeFileSync(dbPath, JSON.stringify(updated, null, 2), 'utf-8');
  console.log(`Synced data/db.json successfully! Products: ${updated.products.length}, Promotions: ${updated.promotions.length}, Orders: ${updated.orders.length}`);
}

main().catch(console.error);
