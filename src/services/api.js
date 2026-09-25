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
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  return handleResponse(res);
}

export async function getProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  return handleResponse(res);
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
  const res = await fetch(`${API_BASE_URL}/admin/products`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function adminCreateProduct(data) {
  const res = await fetch(`${API_BASE_URL}/admin/products`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: buildProductFormData(data),
  });
  return handleResponse(res);
}

export async function adminUpdateProduct(id, data) {
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: "PUT",
    headers: { ...getAuthHeaders() },
    body: buildProductFormData(data),
  });
  return handleResponse(res);
}

export async function adminDeleteProduct(id) {
  const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function adminGetPromotions() {
  const res = await fetch(`${API_BASE_URL}/admin/promotions`, {
    headers: { ...getAuthHeaders() },
  });
  return handleResponse(res);
}

export async function adminCreatePromotion(data) {
  const res = await fetch(`${API_BASE_URL}/admin/promotions`, {
    method: "POST",
    headers: { ...getAuthHeaders() },
    body: buildPromotionFormData(data),
  });
  return handleResponse(res);
}

export async function adminUpdatePromotion(id, data) {
  const res = await fetch(`${API_BASE_URL}/admin/promotions/${id}`, {
    method: "PUT",
    headers: { ...getAuthHeaders() },
    body: buildPromotionFormData(data),
  });
  return handleResponse(res);
}

export async function getPromotions() {
  const res = await fetch(`${API_BASE_URL}/promotions`);
  return handleResponse(res);
}

export async function getSettings() {
  const res = await fetch(`${API_BASE_URL}/settings`);
  return handleResponse(res);
}

export async function adminUpdateSettings(data) {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
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

export async function adminDeletePromotion(id) {
  const res = await fetch(`${API_BASE_URL}/admin/promotions/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
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
