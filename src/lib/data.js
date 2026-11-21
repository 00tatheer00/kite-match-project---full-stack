import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import { DEFAULT_SETTINGS } from './constants';

/**
 * Catalog data access (products, promotions, settings).
 *
 * Supabase is the single source of truth. When Supabase is NOT configured
 * (local development without env vars) we fall back to the read-only seed
 * file `data/db.json`. We never fall back to the seed when Supabase is
 * configured but returns an error or an empty result — that used to resurrect
 * deleted products and hide real outages.
 */

export class DataError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.status = status;
  }
}

let seedCache = null;
function readSeed() {
  if (seedCache) return seedCache;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'db.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    seedCache = {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      promotions: Array.isArray(parsed.promotions) ? parsed.promotions : [],
      settings: parsed.settings || {},
    };
  } catch {
    seedCache = { products: [], promotions: [], settings: {} };
  }
  return seedCache;
}

function db() {
  const sb = getSupabaseAdmin();
  if (!sb) throw new DataError('Database is not configured');
  return sb;
}

function sortCatalog(list) {
  return [...list].sort(
    (a, b) =>
      (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) ||
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

function ensure(result, what) {
  if (result.error) {
    console.error(`[data] ${what} failed:`, result.error.message);
    throw new DataError(`Failed to load ${what}`);
  }
  return result.data;
}

// ---------- Products ----------

export async function listProducts({ activeOnly = true } = {}) {
  if (!isSupabaseConfigured()) {
    const list = readSeed().products;
    return sortCatalog(activeOnly ? list.filter((p) => p.isActive !== false) : list);
  }
  let query = db()
    .from('products')
    .select('*')
    .order('displayOrder', { ascending: true })
    .order('createdAt', { ascending: false });
  if (activeOnly) query = query.eq('isActive', true);
  return ensure(await query, 'products') || [];
}

export async function getProductById(id) {
  if (!id) return null;
  if (!isSupabaseConfigured()) {
    return readSeed().products.find((p) => p.id === id) || null;
  }
  const data = ensure(await db().from('products').select('*').eq('id', id).maybeSingle(), 'product');
  return data || null;
}

const PRODUCT_ALIASES = {
  tanga: 'safety-matches',
  'tanga-matches': 'safety-matches',
  'kite-matches': 'safety-matches',
  olympia: 'safety-matches',
  party: 'safety-matches',
  bird: 'safety-matches',
};

export function normalizeIdentifier(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolve a product from a URL segment: exact id, known alias, or a slugified id/title match.
 */
export async function resolveProduct(requested) {
  const raw = String(requested || '').slice(0, 200);
  if (!raw) return null;
  const normalized = normalizeIdentifier(raw);

  const direct = await getProductById(raw);
  if (direct) return direct;

  const alias = PRODUCT_ALIASES[raw] || PRODUCT_ALIASES[normalized];
  if (alias) {
    const aliased = await getProductById(alias);
    if (aliased) return aliased;
  }

  // Slug/title match: fetch only lightweight columns, then load the single match.
  let candidates;
  if (!isSupabaseConfigured()) {
    candidates = readSeed().products;
  } else {
    candidates = ensure(await db().from('products').select('id,title'), 'products') || [];
  }
  const match = candidates.find(
    (item) => normalizeIdentifier(item.id) === normalized || normalizeIdentifier(item.title) === normalized
  );
  return match ? getProductById(match.id) : null;
}

// ---------- Promotions ----------

export async function listPromotions({ activeOnly = true } = {}) {
  if (!isSupabaseConfigured()) {
    const list = readSeed().promotions;
    return sortCatalog(activeOnly ? list.filter((p) => p.isActive !== false) : list);
  }
  let query = db()
    .from('promotions')
    .select('*')
    .order('displayOrder', { ascending: true })
    .order('createdAt', { ascending: false });
  if (activeOnly) query = query.eq('isActive', true);
  return ensure(await query, 'promotions') || [];
}

export async function getPromotionById(id) {
  if (!id) return null;
  if (!isSupabaseConfigured()) {
    return readSeed().promotions.find((p) => p.id === id) || null;
  }
  const data = ensure(await db().from('promotions').select('*').eq('id', id).maybeSingle(), 'promotion');
  return data || null;
}

// ---------- Settings ----------

export async function getSettings() {
  if (!isSupabaseConfigured()) {
    return { ...DEFAULT_SETTINGS, ...readSeed().settings };
  }
  const data = ensure(await db().from('settings').select('*').eq('id', 1).maybeSingle(), 'settings');
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
}

// ---------- Safe wrappers for server-rendered pages ----------
// Pages should render (with empty data) instead of crashing on a DB hiccup;
// the client components re-fetch from the API afterwards.

export async function safeListProducts() {
  try {
    return await listProducts({ activeOnly: true });
  } catch {
    return [];
  }
}

export async function safeListPromotions() {
  try {
    return await listPromotions({ activeOnly: true });
  } catch {
    return [];
  }
}

export async function safeGetProduct(id) {
  try {
    return await resolveProduct(id);
  } catch {
    return null;
  }
}
