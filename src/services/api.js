const API_BASE_URL = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api';

function normalizeAssetUrlForHttps(url) {
  if (typeof url !== "string") return url;
  if (typeof window === "undefined") return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (window.location.protocol === "https:" && /^http:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const isLocalHost =
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1";
      if (!isLocalHost) {
        parsed.protocol = "https:";
        return parsed.toString();
      }
    } catch {
      return trimmed.replace(/^http:\/\//i, "https://");
    }
  }

  return trimmed;
}

function sanitizePayloadUrls(payload) {
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayloadUrls(item));
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const next = { ...payload };
  if (typeof next.image === "string") {
    next.image = normalizeAssetUrlForHttps(next.image);
  }
  if (Array.isArray(next.images)) {
    next.images = next.images.map((item) => normalizeAssetUrlForHttps(item));
  }

  Object.keys(next).forEach((key) => {
    const value = next[key];
    if (value && typeof value === "object") {
      next[key] = sanitizePayloadUrls(value);
    }
  });

  return next;
}

async function handleResponse(res) {
  if (!res.ok) {
    let message = "Request failed";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // Ignore response parsing errors
    }
    throw new Error(message);
  }
  const data = await res.json();
  return sanitizePayloadUrls(data);
}

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  let token = localStorage.getItem("adminToken");
  if (!token && typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (match) {
      try {
        token = decodeURIComponent(match[1]);
        localStorage.setItem("adminToken", token);
      } catch {}
    }
  }
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    'x-admin-token': token,
  };
}

function buildProductFormData(data = {}) {
  const fd = new FormData();
  const fields = [
    "id",
    "title",
    "category",
    "productType",
    "navGroup",
    "iconType",
    "description",
    "image",
    "color",
    "tagline",
    "services",
    "displayOrder",
    "carouselOrder",
    "isActive",
    "showOnLanding",
    "showInProductsPage",
    "showInNavbar",
  ];

  fields.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      fd.append(key, String(data[key]));
    }
  });

  [
    "features",
    "variants",
    "variantImages",
    "brands",
    "sizes",
    "skus",
    "facilities",
    "images",
  ].forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      fd.append(key, JSON.stringify(data[key]));
    }
  });

  if (Array.isArray(data.productImages)) {
    data.productImages.forEach((file) => fd.append("productImages", file));
  } else {
    if (data.imageFile) fd.append("image", data.imageFile);
    if (Array.isArray(data.galleryFiles)) {
      data.galleryFiles.forEach((file) => fd.append("images", file));
    }
  }
  if (Array.isArray(data.variantImageFiles)) {
    data.variantImageFiles.forEach((file, index) => {
      if (file) fd.append(`variantImageFile_${index}`, file);
    });
  }
  if (Array.isArray(data.brandImageFiles)) {
    data.brandImageFiles.forEach((file, index) => {
      if (file) fd.append(`brandImageFile_${index}`, file);
    });
  }
  return fd;
}

function buildPromotionFormData(data = {}) {
  const fd = new FormData();
  const fields = [
    "id",
    "title",
    "category",
    "description",
    "image",
    "totalQuantity",
    "totalPrice",
    "originalPrice",
    "discount",
    "shippingCost",
    "displayOrder",
    "isActive",
  ];
  fields.forEach((key) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      fd.append(key, String(data[key]));
    }
  });

  ["items", "images"].forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      fd.append(key, JSON.stringify(data[key]));
    }
  });

  if (Array.isArray(data.promotionImages)) {
    data.promotionImages.forEach((file) => fd.append("promotionImages", file));
  }
  return fd;
}

export async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  if (data?.token && typeof window !== 'undefined') {
    localStorage.setItem("adminToken", data.token);
    try {
      document.cookie = `adminToken=${encodeURIComponent(data.token)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }
  return data;
}

const LS_PRODUCTS_KEY = "kite_admin_products_v2";
const LS_PROMOTIONS_KEY = "kite_admin_promotions_v2";
const LS_DELETED_PRODUCTS_KEY = "kite_deleted_products_v2";
const LS_DELETED_PROMOS_KEY = "kite_deleted_promos_v2";

export function getLocalProducts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalProducts(products) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn("Failed to save products to localStorage:", e);
  }
}

export function getLocalPromotions() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_PROMOTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalPromotions(promos) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PROMOTIONS_KEY, JSON.stringify(promos));
  } catch (e) {
    console.warn("Failed to save promotions to localStorage:", e);
  }
}

export function mergeProductsWithLocal(serverProducts = []) {
  if (typeof window === "undefined") return serverProducts;
  try {
    const local = getLocalProducts();
    const deletedRaw = localStorage.getItem(LS_DELETED_PRODUCTS_KEY);
    const deletedIds = new Set(deletedRaw ? JSON.parse(deletedRaw) : []);

    if (!local || !local.length) {
      if (serverProducts && serverProducts.length) {
        saveLocalProducts(serverProducts);
      }
      return serverProducts.filter((p) => !deletedIds.has(p.id));
    }

    const mergedMap = new Map();
    (serverProducts || []).forEach((p) => {
      if (!deletedIds.has(p.id)) {
        mergedMap.set(p.id, p);
      }
    });

    local.forEach((lp) => {
      if (!deletedIds.has(lp.id)) {
        const existing = mergedMap.get(lp.id);
        if (!existing) {
          mergedMap.set(lp.id, lp);
        } else {
          const localTime = lp.updatedAt ? new Date(lp.updatedAt).getTime() : 0;
          const serverTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
          if (localTime >= serverTime) {
            mergedMap.set(lp.id, { ...existing, ...lp });
          }
        }
      }
    });

    const result = Array.from(mergedMap.values());
    saveLocalProducts(result);
    return result;
  } catch (e) {
    console.warn("mergeProductsWithLocal error:", e);
    return serverProducts;
  }
}

export function mergePromotionsWithLocal(serverPromos = []) {
  if (typeof window === "undefined") return serverPromos;
  try {
    const local = getLocalPromotions();
    const deletedRaw = localStorage.getItem(LS_DELETED_PROMOS_KEY);
    const deletedIds = new Set(deletedRaw ? JSON.parse(deletedRaw) : []);

    if (!local || !local.length) {
      if (serverPromos && serverPromos.length) {
        saveLocalPromotions(serverPromos);
      }
      return serverPromos.filter((p) => !deletedIds.has(p.id));
    }

    const mergedMap = new Map();
    (serverPromos || []).forEach((p) => {
      if (!deletedIds.has(p.id)) {
        mergedMap.set(p.id, p);
      }
    });

    local.forEach((lp) => {
      if (!deletedIds.has(lp.id)) {
        const existing = mergedMap.get(lp.id);
        if (!existing) {
          mergedMap.set(lp.id, lp);
        } else {
          const localTime = lp.updatedAt ? new Date(lp.updatedAt).getTime() : 0;
          const serverTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
          if (localTime >= serverTime) {
            mergedMap.set(lp.id, { ...existing, ...lp });
          }
        }
      }
    });

    const result = Array.from(mergedMap.values());
    saveLocalPromotions(result);
    return result;
  } catch (e) {
    console.warn("mergePromotionsWithLocal error:", e);
    return serverPromos;
  }
}

let productsCache = null;
let productsCacheTime = 0;
let productsInFlightPromise = null;
const PRODUCTS_CACHE_TTL = 15 * 1000;

export function invalidateProductsCache() {
  productsCache = null;
  productsCacheTime = 0;
  productsInFlightPromise = null;
}

export async function getProducts(options = {}) {
  const { forceRefresh = false } = options;
  const now = Date.now();

  if (!forceRefresh && productsCache && now - productsCacheTime < PRODUCTS_CACHE_TTL) {
    return mergeProductsWithLocal(productsCache);
  }

  if (productsInFlightPromise && !forceRefresh) {
    return productsInFlightPromise;
  }

  productsInFlightPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, { cache: 'no-store' });
      const data = await handleResponse(res);
      if (Array.isArray(data)) {
        productsCache = data;
        productsCacheTime = Date.now();
      }
      return mergeProductsWithLocal(Array.isArray(data) ? data : []);
    } catch (err) {
      if (productsCache) return mergeProductsWithLocal(productsCache);
      const local = getLocalProducts();
      if (local && local.length) return local;
      throw err;
    } finally {
      productsInFlightPromise = null;
    }
  })();

  return productsInFlightPromise;
}

function normalizeIdentifier(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getProduct(id) {
  const productIdAliases = {
    tanga: "tanga-matches",
  };

  const requestedId = productIdAliases[id] || id;
  const normalizedRequested = normalizeIdentifier(requestedId);

  try {
    const products = await getProducts();
    const matched = products.find((item) => {
      const byId = normalizeIdentifier(item?.id) === normalizedRequested;
      const bySlug = normalizeIdentifier(item?.slug) === normalizedRequested;
      const byTitle = normalizeIdentifier(item?.title) === normalizedRequested;
      return byId || bySlug || byTitle;
    });

    if (matched) {
      return matched;
    }
  } catch {
    // Fall back to direct fetch
  }

  let res = await fetch(`${API_BASE_URL}/products/${requestedId}`);
  if (res.ok) return handleResponse(res);

  if (requestedId !== id) {
    res = await fetch(`${API_BASE_URL}/products/${id}`);
  }
  return handleResponse(res);
}

export async function adminGetProducts() {
  let serverData = [];
  try {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      headers: { ...getAuthHeaders() },
      cache: "no-store",
    });
    serverData = await handleResponse(res);
  } catch (err) {
    console.warn("adminGetProducts network fetch error, will use local overlay:", err.message);
  }
  return mergeProductsWithLocal(Array.isArray(serverData) ? serverData : []);
}

export async function adminCreateProduct(data) {
  invalidateProductsCache();
  let result = null;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: buildProductFormData(data),
    });
    result = await handleResponse(res);
  } catch (err) {
    console.warn("adminCreateProduct server error, saving locally:", err.message);
  }

  const newProduct = {
    ...data,
    id: data.id || result?.id,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const local = getLocalProducts().filter((p) => p.id !== newProduct.id);
    local.unshift(newProduct);
    saveLocalProducts(local);
  }

  return result || newProduct;
}

export async function adminUpdateProduct(id, data) {
  invalidateProductsCache();
  // Update local storage immediately so it NEVER reverts after 5 seconds
  if (typeof window !== "undefined") {
    const local = getLocalProducts();
    const idx = local.findIndex((p) => p.id === id);
    const existing = idx >= 0 ? local[idx] : {};
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      local[idx] = updated;
    } else {
      local.push(updated);
    }
    saveLocalProducts(local);
  }

  let result = null;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: "PUT",
      headers: { ...getAuthHeaders() },
      body: buildProductFormData(data),
    });
    result = await handleResponse(res);
  } catch (err) {
    console.warn("adminUpdateProduct network warning (saved locally):", err.message);
  }

  return result || { ...data, id, updatedAt: new Date().toISOString() };
}

export async function adminDeleteProduct(id) {
  invalidateProductsCache();
  if (typeof window !== "undefined") {
    const local = getLocalProducts().filter((p) => p.id !== id);
    saveLocalProducts(local);
    try {
      const deletedRaw = localStorage.getItem(LS_DELETED_PRODUCTS_KEY);
      const set = new Set(deletedRaw ? JSON.parse(deletedRaw) : []);
      set.add(id);
      localStorage.setItem(LS_DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("adminDeleteProduct network warning (deleted locally):", err.message);
    return { message: "Product deleted" };
  }
}

export async function adminGetPromotions() {
  let serverData = [];
  try {
    const res = await fetch(`${API_BASE_URL}/admin/promotions`, {
      headers: { ...getAuthHeaders() },
      cache: "no-store",
    });
    serverData = await handleResponse(res);
  } catch (err) {
    console.warn("adminGetPromotions network fetch error, will use local overlay:", err.message);
  }
  return mergePromotionsWithLocal(Array.isArray(serverData) ? serverData : []);
}

export async function adminCreatePromotion(data) {
  invalidateProductsCache();
  let result = null;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/promotions`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: buildPromotionFormData(data),
    });
    result = await handleResponse(res);
  } catch (err) {
    console.warn("adminCreatePromotion server warning, saving locally:", err.message);
  }

  const newPromo = {
    ...data,
    id: data.id || result?.id,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const local = getLocalPromotions().filter((p) => p.id !== newPromo.id);
    local.unshift(newPromo);
    saveLocalPromotions(local);
  }

  return result || newPromo;
}

export async function adminUpdatePromotion(id, data) {
  invalidateProductsCache();
  if (typeof window !== "undefined") {
    const local = getLocalPromotions();
    const idx = local.findIndex((p) => p.id === id);
    const existing = idx >= 0 ? local[idx] : {};
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      local[idx] = updated;
    } else {
      local.push(updated);
    }
    saveLocalPromotions(local);
  }

  let result = null;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/promotions/${id}`, {
      method: "PUT",
      headers: { ...getAuthHeaders() },
      body: buildPromotionFormData(data),
    });
    result = await handleResponse(res);
  } catch (err) {
    console.warn("adminUpdatePromotion network warning (saved locally):", err.message);
  }

  return result || { ...data, id, updatedAt: new Date().toISOString() };
}

export async function adminDeletePromotion(id) {
  invalidateProductsCache();
  if (typeof window !== "undefined") {
    const local = getLocalPromotions().filter((p) => p.id !== id);
    saveLocalPromotions(local);
    try {
      const deletedRaw = localStorage.getItem(LS_DELETED_PROMOS_KEY);
      const set = new Set(deletedRaw ? JSON.parse(deletedRaw) : []);
      set.add(id);
      localStorage.setItem(LS_DELETED_PROMOS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  try {
    const res = await fetch(`${API_BASE_URL}/admin/promotions/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("adminDeletePromotion network warning (deleted locally):", err.message);
    return { message: "Promotion deleted" };
  }
}

export async function getPromotions() {
  let serverData = [];
  try {
    const res = await fetch(`${API_BASE_URL}/promotions`, { cache: 'no-store' });
    serverData = await handleResponse(res);
  } catch (err) {
    console.warn("getPromotions network warning, using local overlay:", err.message);
  }
  return mergePromotionsWithLocal(Array.isArray(serverData) ? serverData : []);
}

export async function getSettings() {
  const res = await fetch(`${API_BASE_URL}/settings`);
  return handleResponse(res);
}

export async function adminUpdateSettings(data) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const headers = { ...getAuthHeaders() };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function createOrder(payload) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function adminGetOrders() {
  const res = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function adminUpdateOrderStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function adminGetOrder(id) {
  const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function adminGetAnalytics() {
  const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function adminGetDashboard() {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}
