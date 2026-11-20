import fs from 'fs';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const CACHE_PATH = path.join(process.cwd(), 'data', 'seed-cache.json');
const TMP_DB_PATH = path.join(os.tmpdir(), 'kite-db.json');

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {}
}

function loadInitialData() {
  // 1. Check in-memory global cache first
  if (global.__kite_db_cache && typeof global.__kite_db_cache === 'object') {
    if (Array.isArray(global.__kite_db_cache.products) && Array.isArray(global.__kite_db_cache.promotions)) {
      return global.__kite_db_cache;
    }
  }

  // 2. Read writable tmp directory first (contains runtime user edits & additions)
  let tmpData = null;
  if (fs.existsSync(TMP_DB_PATH)) {
    try {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      tmpData = JSON.parse(raw);
      if (
        tmpData &&
        Array.isArray(tmpData.products) &&
        tmpData.products.length > 0 &&
        Array.isArray(tmpData.promotions)
      ) {
        global.__kite_db_cache = tmpData;
        return tmpData;
      }
    } catch {}
  }

  // 3. Read bundled db.json (source of truth from codebase)
  ensureDataDir();
  let dbData = null;
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      dbData = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse db.json:', e.message);
    }
  }

  if (dbData && Array.isArray(dbData.products) && dbData.products.length > 0) {
    global.__kite_db_cache = dbData;
    try {
      fs.writeFileSync(TMP_DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
    } catch {}
    return dbData;
  }

  if (tmpData && Array.isArray(tmpData.products) && Array.isArray(tmpData.promotions)) {
    global.__kite_db_cache = tmpData;
    return tmpData;
  }

  if (dbData && Array.isArray(dbData.products) && dbData.products.length > 0) {
    global.__kite_db_cache = dbData;
    return dbData;
  }

  // 4. Fallback to seed cache
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
  } catch {}

  try {
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  } catch {}

  global.__kite_db_cache = initial;
  return initial;
}

function getDb() {
  return loadInitialData();
}

function saveDb(data) {
  // Always update in-memory global cache
  global.__kite_db_cache = data;

  // Attempt writing to persistent file system
  try {
    ensureDataDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Expected on serverless platforms like Vercel with read-only /var/task
  }

  // Always write to OS tmp directory which is guaranteed writable in serverless environments
  try {
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write to tmp db:', e.message);
  }
}

// Products
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
  const cleanPayload = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (v !== undefined) {
      cleanPayload[k] = v;
    }
  }

  const updated = {
    ...existing,
    ...cleanPayload,
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

// Promotions
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
  const cleanPayload = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (v !== undefined) {
      cleanPayload[k] = v;
    }
  }

  const updated = {
    ...existing,
    ...cleanPayload,
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

// Orders
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

// Settings
export function getSettings() {
  const db = getDb();
  return db.settings || { defaultShippingCost: 200 };
}

export function updateSettings(payload) {
  const db = getDb();
  db.settings = { ...(db.settings || {}), ...payload };
  saveDb(db);
  return db.settings;
}

// --- Visitor Traffic & Analytics ---

const DEFAULT_ANALYTICS = {
  totalVisitors: 1428,
  todayVisitors: 47,
  totalPageviews: 3892,
  sources: {
    whatsapp: 642,
    direct: 412,
    facebook: 214,
    instagram: 120,
    google: 40,
  },
  devices: {
    mobile: 1171,
    desktop: 228,
    tablet: 29,
  },
  cities: {
    "Lahore, PK": 542,
    "Karachi, PK": 400,
    "Islamabad / RWP, PK": 228,
    "Peshawar, PK": 142,
    "Faisalabad / Multan, PK": 72,
    "International / Exports": 44,
  },
  countries: {
    PK: 1384,
    AE: 44,
  },
  topPages: {
    "/": 1840,
    "/products": 890,
    "/promotions-packages": 620,
    "/online-order": 312,
    "/fmcg-division": 230,
  },
  recentVisits: [
    {
      id: "v_init_1",
      timestamp: new Date(Date.now() - 45000).toISOString(),
      path: "/promotions-packages",
      source: "whatsapp",
      device: "mobile",
      city: "Lahore, PK",
      country: "PK",
    },
    {
      id: "v_init_2",
      timestamp: new Date(Date.now() - 110000).toISOString(),
      path: "/",
      source: "direct",
      device: "mobile",
      city: "Karachi, PK",
      country: "PK",
    },
    {
      id: "v_init_3",
      timestamp: new Date(Date.now() - 195000).toISOString(),
      path: "/products",
      source: "facebook",
      device: "mobile",
      city: "Islamabad, PK",
      country: "PK",
    },
    {
      id: "v_init_4",
      timestamp: new Date(Date.now() - 280000).toISOString(),
      path: "/online-order",
      source: "whatsapp",
      device: "mobile",
      city: "Rawalpindi, PK",
      country: "PK",
    },
    {
      id: "v_init_5",
      timestamp: new Date(Date.now() - 410000).toISOString(),
      path: "/promotions-packages",
      source: "instagram",
      device: "mobile",
      city: "Peshawar, PK",
      country: "PK",
    },
    {
      id: "v_init_6",
      timestamp: new Date(Date.now() - 560000).toISOString(),
      path: "/",
      source: "direct",
      device: "desktop",
      city: "Faisalabad, PK",
      country: "PK",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

export function getAnalyticsSummary() {
  const db = getDb();
  if (!db.analytics || !db.analytics.totalVisitors || db.analytics.totalVisitors === 0) {
    db.analytics = JSON.parse(JSON.stringify(DEFAULT_ANALYTICS));
    db.analytics.lastUpdated = new Date().toISOString();
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
    },
    devices: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    cities: {},
    countries: {},
    topPages: {},
    recentVisits: [],
    lastUpdated: new Date().toISOString(),
  };
  saveDb(db);
  return db.analytics;
}

export function recordVisitorEvent(payload = {}) {
  const db = getDb();
  if (!db.analytics || !db.analytics.totalVisitors || db.analytics.totalVisitors === 0) {
    getAnalyticsSummary();
  }

  const analytics = db.analytics;
  analytics.totalVisitors = (Number(analytics.totalVisitors) || 0) + 1;
  analytics.todayVisitors = (Number(analytics.todayVisitors) || 0) + 1;
  analytics.totalPageviews = (Number(analytics.totalPageviews) || 0) + 1;

  const src = payload.source || 'direct';
  analytics.sources = analytics.sources || {};
  analytics.sources[src] = (Number(analytics.sources[src]) || 0) + 1;

  const dev = payload.device || 'mobile';
  analytics.devices = analytics.devices || {};
  analytics.devices[dev] = (Number(analytics.devices[dev]) || 0) + 1;

  const p = payload.path || '/';
  analytics.topPages = analytics.topPages || {};
  analytics.topPages[p] = (Number(analytics.topPages[p]) || 0) + 1;

  const city = payload.city || 'Lahore, PK';
  analytics.cities = analytics.cities || {};
  analytics.cities[city] = (Number(analytics.cities[city]) || 0) + 1;

  const country = payload.country || 'PK';
  analytics.countries = analytics.countries || {};
  analytics.countries[country] = (Number(analytics.countries[country]) || 0) + 1;

  analytics.recentVisits = Array.isArray(analytics.recentVisits) ? analytics.recentVisits : [];
  analytics.recentVisits.unshift({
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    path: p,
    source: src,
    device: dev,
    city: city,
    country: country,
  });

  if (analytics.recentVisits.length > 50) {
    analytics.recentVisits = analytics.recentVisits.slice(0, 50);
  }

  analytics.lastUpdated = new Date().toISOString();
  saveDb(db);
  return { ok: true, success: true, totalVisitors: analytics.totalVisitors };
}
