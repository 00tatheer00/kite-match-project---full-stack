/**
 * Frontend API client.
 *
 * - The server (Supabase) is the single source of truth. There is no localStorage
 *   "overlay" any more: if a save fails, the admin sees the error instead of a fake success.
 * - Admin auth uses an httpOnly cookie set by /api/admin/login; it is sent automatically
 *   with same-origin requests and is never readable from JavaScript.
 */

const API_BASE_URL = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function normalizeAssetUrlForHttps(url) {
  if (typeof url !== 'string' || typeof window === 'undefined') return url;
  const trimmed = url.trim();
  if (window.location.protocol === 'https:' && /^http:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (!['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
        parsed.protocol = 'https:';
        return parsed.toString();
      }
    } catch {
      return trimmed.replace(/^http:\/\//i, 'https://');
    }
  }
  return trimmed;
}

function sanitizePayloadUrls(payload) {
  if (Array.isArray(payload)) return payload.map(sanitizePayloadUrls);
  if (!payload || typeof payload !== 'object') return payload;
  const next = { ...payload };
  if (typeof next.image === 'string') next.image = normalizeAssetUrlForHttps(next.image);
  if (Array.isArray(next.images)) next.images = next.images.map(normalizeAssetUrlForHttps);
  Object.keys(next).forEach((key) => {
    if (next[key] && typeof next[key] === 'object') next[key] = sanitizePayloadUrls(next[key]);
  });
  return next;
}

async function handleResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data);
  }
  return sanitizePayloadUrls(data);
}

/**
 * Admin request helper: sends the session cookie and redirects to the login page on 401.
 */
async function adminFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options,
  });
  if (res.status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
    window.location.href = '/admin/login';
  }
  return handleResponse(res);
}

function jsonBody(method, data) {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}

function buildProductFormData(data = {}) {
  const fd = new FormData();
  [
    'id', 'title', 'category', 'productType', 'navGroup', 'iconType', 'description', 'image', 'color',
    'tagline', 'services', 'displayOrder', 'carouselOrder', 'isActive', 'showOnLanding',
    'showInProductsPage', 'showInNavbar',
  ].forEach((key) => {
    if (data[key] !== undefined) fd.append(key, data[key] === null ? '' : String(data[key])); // empty values clear the field
  });
  if (data.shippingCost !== undefined) fd.append('shippingCost', data.shippingCost === null ? '' : String(data.shippingCost));

  ['features', 'variants', 'variantImages', 'brands', 'sizes', 'skus', 'facilities', 'images'].forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) fd.append(key, JSON.stringify(data[key]));
  });

  if (Array.isArray(data.productImages)) {
    data.productImages.forEach((file) => fd.append('productImages', file));
  } else {
    if (data.imageFile) fd.append('image', data.imageFile);
    if (Array.isArray(data.galleryFiles)) data.galleryFiles.forEach((file) => fd.append('images', file));
  }
  if (Array.isArray(data.variantImageFiles)) {
    data.variantImageFiles.forEach((file, index) => file && fd.append(`variantImageFile_${index}`, file));
  }
  if (Array.isArray(data.brandImageFiles)) {
    data.brandImageFiles.forEach((file, index) => file && fd.append(`brandImageFile_${index}`, file));
  }
  return fd;
}

function buildPromotionFormData(data = {}) {
  const fd = new FormData();
  ['id', 'title', 'category', 'description', 'image', 'totalQuantity', 'totalPrice', 'originalPrice', 'discount', 'shippingCost', 'displayOrder', 'isActive'].forEach(
    (key) => {
      if (data[key] !== undefined) fd.append(key, data[key] === null ? '' : String(data[key])); // empty values clear the field
    }
  );
  ['items', 'images'].forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) fd.append(key, JSON.stringify(data[key]));
  });
  if (Array.isArray(data.promotionImages)) data.promotionImages.forEach((file) => fd.append('promotionImages', file));
  return fd;
}

// ---------------------------------------------------------------- Auth

export async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE_URL}/admin/login`, {
    ...jsonBody('POST', { email, password }),
    credentials: 'same-origin',
  });
  return handleResponse(res);
}

export async function adminLogout() {
  try {
    await fetch(`${API_BASE_URL}/admin/logout`, { method: 'POST', credentials: 'same-origin' });
  } catch {
    // ignore network errors on logout
  }
  try {
    // Clean up tokens/caches left by older versions of the admin panel.
    ['adminToken', 'kite_admin_products_v2', 'kite_admin_promotions_v2', 'kite_deleted_products_v2', 'kite_deleted_promos_v2', 'kite_admin_orders_v2'].forEach(
      (k) => localStorage.removeItem(k)
    );
  } catch {
    // ignore
  }
}

/** @returns {Promise<boolean>} */
export async function adminCheckSession() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/session`, { credentials: 'same-origin', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- Public catalog

let productsCache = null;
let productsCacheTime = 0;
let productsInFlightPromise = null;
const PRODUCTS_CACHE_TTL = 15 * 1000;

export function invalidateProductsCache() {
  productsCache = null;
  productsCacheTime = 0;
  productsInFlightPromise = null;
}

export async function getProducts({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && productsCache && now - productsCacheTime < PRODUCTS_CACHE_TTL) return productsCache;
  if (productsInFlightPromise && !forceRefresh) return productsInFlightPromise;

  productsInFlightPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
      const data = await handleResponse(res);
      productsCache = Array.isArray(data) ? data : [];
      productsCacheTime = Date.now();
      return productsCache;
    } catch (err) {
      if (productsCache) return productsCache; // serve last good data on a transient failure
      throw err;
    } finally {
      productsInFlightPromise = null;
    }
  })();
  return productsInFlightPromise;
}

function normalizeIdentifier(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getProduct(id) {
  const normalized = normalizeIdentifier(id);
  try {
    const products = await getProducts();
    const matched = products.find(
      (item) => normalizeIdentifier(item?.id) === normalized || normalizeIdentifier(item?.title) === normalized
    );
    if (matched) return matched;
  } catch {
    // fall back to direct lookup
  }
  const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`);
  return handleResponse(res);
}

export async function getPromotions() {
  const res = await fetch(`${API_BASE_URL}/promotions`, { cache: 'no-store' });
  const data = await handleResponse(res);
  return Array.isArray(data) ? data : [];
}

export async function getSettings() {
  const res = await fetch(`${API_BASE_URL}/settings`);
  return handleResponse(res);
}

// ---------------------------------------------------------------- Orders (customer)

/** Authoritative price breakdown from the server. */
export async function quoteOrder(payload) {
  const res = await fetch(`${API_BASE_URL}/orders/quote`, jsonBody('POST', payload));
  return handleResponse(res);
}

export async function createOrder(payload) {
  const res = await fetch(`${API_BASE_URL}/orders`, jsonBody('POST', payload));
  const data = await handleResponse(res);
  try {
    // Session-scoped (cleared when the tab closes) so customer details don't linger on shared devices.
    sessionStorage.setItem('lastOrder', JSON.stringify(data));
    localStorage.removeItem('lastOrder');
  } catch {
    // ignore storage errors
  }
  return data;
}

// ---------------------------------------------------------------- Admin

export const adminGetProducts = () => adminFetch('/admin/products');

export async function adminCreateProduct(data) {
  invalidateProductsCache();
  return adminFetch('/admin/products', { method: 'POST', body: buildProductFormData(data) });
}

export async function adminUpdateProduct(id, data) {
  invalidateProductsCache();
  return adminFetch(`/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', body: buildProductFormData(data) });
}

export async function adminDeleteProduct(id) {
  invalidateProductsCache();
  return adminFetch(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export const adminGetPromotions = () => adminFetch('/admin/promotions');

export async function adminCreatePromotion(data) {
  return adminFetch('/admin/promotions', { method: 'POST', body: buildPromotionFormData(data) });
}

export async function adminUpdatePromotion(id, data) {
  return adminFetch(`/admin/promotions/${encodeURIComponent(id)}`, { method: 'PUT', body: buildPromotionFormData(data) });
}

export async function adminDeletePromotion(id) {
  return adminFetch(`/admin/promotions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function adminUpdateSettings(data) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  return adminFetch('/settings', isFormData ? { method: 'PUT', body: data } : jsonBody('PUT', data));
}

export async function adminGetOrders() {
  const data = await adminFetch('/admin/orders');
  return Array.isArray(data) ? data : [];
}

export const adminGetOrder = (id) => adminFetch(`/admin/orders/${encodeURIComponent(id)}`);

export const adminDeleteOrder = (id) => adminFetch(`/admin/orders/${encodeURIComponent(id)}`, { method: 'DELETE' });

export const adminUpdateOrderStatus = (id, status) =>
  adminFetch(`/admin/orders/${encodeURIComponent(id)}/status`, jsonBody('PATCH', { status }));

export const adminGetAnalytics = () => adminFetch('/admin/analytics');

export const adminResetAnalytics = () => adminFetch('/admin/analytics/reset', { method: 'POST' });

export const adminGetDashboard = () => adminFetch('/admin/dashboard');
