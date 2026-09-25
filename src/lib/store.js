import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const CACHE_PATH = path.join(process.cwd(), 'data', 'seed-cache.json');

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadInitialData() {
  ensureDataDir();
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Failed to parse db.json, using fallback:', e.message);
    }
  }

  // Fallback to seed cache
  let products = [];
  let promotions = [];
  if (fs.existsSync(CACHE_PATH)) {
    try {
      const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
      products = cache.products || [];
      promotions = cache.promotions || [];
    } catch {}
  }

  const initial = {
    products,
    promotions,
    orders: [],
    settings: { defaultShippingCost: 150 }
  };

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write initial db.json:', e.message);
  }

  return initial;
}

function getDb() {
  return loadInitialData();
}

function saveDb(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save db.json:', e.message);
  }
}

// ─── Products CRUD ──────────────────────────────────────────

export function getAllProducts() {
  const db = getDb();
  return db.products || [];
}

export function getProductById(id) {
  const db = getDb();
  return (db.products || []).find((p) => p.id === id || p._id === id) || null;
}

export function createProduct(payload) {
  const db = getDb();
  const id = payload.id || `prod-${Date.now()}`;
  const newProduct = {
    ...payload,
    id,
    _id: payload._id || `local_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.products = db.products || [];
  const existingIndex = db.products.findIndex((p) => p.id === id);
  if (existingIndex >= 0) {
    throw new Error('Product with this id already exists');
  }

  db.products.unshift(newProduct);
  saveDb(db);
  return newProduct;
}

export function updateProduct(id, payload) {
  const db = getDb();
  db.products = db.products || [];
  const idx = db.products.findIndex((p) => p.id === id || p._id === id);
  if (idx < 0) {
    return null;
  }

  const existing = db.products[idx];
  const updated = {
    ...existing,
    ...payload,
    id: existing.id,
    _id: existing._id,
    updatedAt: new Date().toISOString(),
  };

  db.products[idx] = updated;
  saveDb(db);
  return updated;
}

export function deleteProduct(id) {
  const db = getDb();
  db.products = db.products || [];
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id && p._id !== id);
  if (db.products.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

// ─── Promotions CRUD ────────────────────────────────────────

export function getAllPromotions() {
  const db = getDb();
  return db.promotions || [];
}

export function getPromotionById(id) {
  const db = getDb();
  return (db.promotions || []).find((p) => p.id === id || p._id === id) || null;
}

export function createPromotion(payload) {
  const db = getDb();
  const id = payload.id || `promo-${Date.now()}`;
  const newPromo = {
    ...payload,
    id,
    _id: payload._id || `local_promo_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.promotions = db.promotions || [];
  const existingIndex = db.promotions.findIndex((p) => p.id === id);
  if (existingIndex >= 0) {
    throw new Error('Promotion with this id already exists');
  }

  db.promotions.unshift(newPromo);
  saveDb(db);
  return newPromo;
}

export function updatePromotion(id, payload) {
  const db = getDb();
  db.promotions = db.promotions || [];
  const idx = db.promotions.findIndex((p) => p.id === id || p._id === id);
  if (idx < 0) {
    return null;
  }

  const existing = db.promotions[idx];
  const updated = {
    ...existing,
    ...payload,
    id: existing.id,
    _id: existing._id,
    updatedAt: new Date().toISOString(),
  };

  db.promotions[idx] = updated;
  saveDb(db);
  return updated;
}

export function deletePromotion(id) {
  const db = getDb();
  db.promotions = db.promotions || [];
  const initialLen = db.promotions.length;
  db.promotions = db.promotions.filter((p) => p.id !== id && p._id !== id);
  if (db.promotions.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

// ─── Orders CRUD ────────────────────────────────────────────

export function getAllOrders() {
  const db = getDb();
  return db.orders || [];
}

export function getOrderById(id) {
  const db = getDb();
  return (db.orders || []).find(
    (o) => o._id === id || o.id === id || o.orderNumber === id
  ) || null;
}

export function createOrder(payload) {
  const db = getDb();
  db.orders = db.orders || [];

  const count = db.orders.length + 1;
  const orderNumber = payload.orderNumber || `KT-${String(count).padStart(3, '0')}`;
  const newOrder = {
    ...payload,
    _id: payload._id || `ord_${Date.now()}`,
    orderNumber,
    status: payload.status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);
  saveDb(db);
  return newOrder;
}

export function updateOrderStatus(id, status) {
  const db = getDb();
  db.orders = db.orders || [];
  const idx = db.orders.findIndex(
    (o) => o._id === id || o.id === id || o.orderNumber === id
  );
  if (idx < 0) {
    return null;
  }

  db.orders[idx].status = status;
  db.orders[idx].updatedAt = new Date().toISOString();
  saveDb(db);
  return db.orders[idx];
}

// ─── Settings ───────────────────────────────────────────────

export function getSettings() {
  const db = getDb();
  return db.settings || { defaultShippingCost: 150 };
}

export function updateSettings(payload) {
  const db = getDb();
  db.settings = { ...(db.settings || {}), ...payload };
  saveDb(db);
  return db.settings;
}

// ─── Visitor Traffic & Analytics (Meeting Point 6) ───────────

export function getAnalyticsSummary() {
  const db = getDb();
  if (!db.analytics) {
    db.analytics = {
      totalVisitors: 0,
      todayVisitors: 0,
      totalPageviews: 0,
      sources: {
        whatsapp: 0,
        facebook: 0,
        instagram: 0,
        google: 0,
        direct: 0,
        other: 0,
      },
      devices: {
        mobile: 0,
        desktop: 0,
        tablet: 0,
      },
      topPages: {},
      recentVisits: [],
      lastUpdated: new Date().toISOString(),
    };
    saveDb(db);
  }
  return db.analytics;
}

export function resetAnalytics() {
  const db = getDb();
  db.analytics = {
    totalVisitors: 0,
    todayVisitors: 0,
    totalPageviews: 0,
    sources: {
      whatsapp: 0,
      facebook: 0,
      instagram: 0,
      google: 0,
      direct: 0,
      other: 0,
    },
    devices: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    topPages: {},
    recentVisits: [],
    lastUpdated: new Date().toISOString(),
  };
  saveDb(db);
  return db.analytics;
}

export function recordVisitorEvent(payload = {}) {
  const db = getDb();
  if (!db.analytics) {
    getAnalyticsSummary();
  }

  const analytics = db.analytics;
  analytics.totalVisitors = (analytics.totalVisitors || 0) + 1;
  analytics.todayVisitors = (analytics.todayVisitors || 0) + 1;
  analytics.totalPageviews = (analytics.totalPageviews || 0) + 1;

  const src = payload.source || 'direct';
  analytics.sources = analytics.sources || {};
  analytics.sources[src] = (analytics.sources[src] || 0) + 1;

  const dev = payload.device || 'mobile';
  analytics.devices = analytics.devices || {};
  analytics.devices[dev] = (analytics.devices[dev] || 0) + 1;

  const p = payload.path || '/';
  analytics.topPages = analytics.topPages || {};
  analytics.topPages[p] = (analytics.topPages[p] || 0) + 1;

  analytics.recentVisits = analytics.recentVisits || [];
  analytics.recentVisits.unshift({
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    path: p,
    source: src,
    device: dev,
    city: payload.city || 'Pakistan',
  });

  if (analytics.recentVisits.length > 50) {
    analytics.recentVisits = analytics.recentVisits.slice(0, 50);
  }

  analytics.lastUpdated = new Date().toISOString();
  saveDb(db);
  return { ok: true, totalVisitors: analytics.totalVisitors };
}
