import { uploadImageBuffer } from './storage';

/**
 * Parse admin product/promotion create/update requests (JSON or multipart).
 * Only allow-listed fields are copied into the payload that goes to the database.
 */

export class PayloadError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

const ID_REGEX = /^[a-z0-9][a-z0-9-_]{0,99}$/i;

function parseJsonField(value, fallback = []) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function asArray(value) {
  const parsed = parseJsonField(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

function text(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

function imageUrl(value) {
  const v = text(value, 2000);
  if (!v) return '';
  // Allow site-relative paths and http(s) URLs only (blocks javascript:, data: etc.)
  if (v.startsWith('/') && !v.startsWith('//')) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return '';
}

function imageList(value) {
  return asArray(value).map(imageUrl).filter(Boolean).slice(0, 30);
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

function nullableNonNegative(value) {
  if (value === '' || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function variants(value) {
  return asArray(value)
    .filter((v) => v && typeof v === 'object')
    .map((v) => ({
      ...v,
      name: text(v.name, 200),
      price: Math.max(0, toNumber(v.price, 0)),
    }));
}

async function readRequest(request) {
  const contentType = request.headers.get('content-type') || '';
  const files = [];
  let body = {};
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    for (const [key, value] of formData.entries()) {
      if (value && typeof value === 'object' && typeof value.arrayBuffer === 'function') {
        if (value.size > 0) files.push({ fieldname: key, file: value });
      } else {
        body[key] = value;
      }
    }
  } else {
    try {
      body = await request.json();
    } catch {
      throw new PayloadError('Invalid request body');
    }
  }
  return { body: body || {}, files };
}

// On create (requireId) title and category are mandatory. On update they are only
// checked when sent, so a quick edit (e.g. just a price) does not need the whole record.
function validateIdentity(payload, { requireId, sentKeys }) {
  if (requireId) {
    if (!payload.id || !ID_REGEX.test(payload.id)) {
      throw new PayloadError('ID is required and may only contain letters, numbers, "-" and "_".');
    }
  }
  const mustHave = (key) => requireId || !sentKeys || sentKeys.has(key);
  if (mustHave('title') && !payload.title) throw new PayloadError('Title is required.');
  if (mustHave('category') && !payload.category) throw new PayloadError('Category is required.');
}

export async function parseProductRequest(request, { requireId = true } = {}) {
  const { body, files } = await readRequest(request);
  const sentKeys = new Set(Object.keys(body));
  const uploadedKeys = new Set();

  const payload = {
    id: text(body.id, 100),
    title: text(body.title, 200),
    category: text(body.category, 100),
    productType: text(body.productType, 50) || 'general',
    navGroup: text(body.navGroup, 100),
    iconType: text(body.iconType, 50) || null,
    description: text(body.description, 10000),
    image: imageUrl(body.image),
    images: imageList(body.images),
    color: text(body.color, 50),
    tagline: text(body.tagline, 300),
    features: asArray(body.features),
    variants: variants(body.variants),
    variantImages: asArray(body.variantImages)
      .map((item) => ({ name: text(item?.name, 200), image: imageUrl(item?.image) }))
      .filter((item) => item.name || item.image),
    brands: asArray(body.brands).map((b) => ({
      ...(b && typeof b === 'object' ? b : {}),
      name: text(b?.name, 200),
      image: imageUrl(b?.image),
      variants: variants(b?.variants),
    })),
    sizes: asArray(body.sizes),
    skus: asArray(body.skus),
    facilities: asArray(body.facilities),
    services: typeof body.services === 'string' ? text(body.services, 5000) : body.services || '',
    shippingCost: nullableNonNegative(body.shippingCost),
    displayOrder: toNumber(body.displayOrder, 0),
    carouselOrder: toNumber(body.carouselOrder, 0),
    isActive: toBoolean(body.isActive, true),
    showOnLanding: toBoolean(body.showOnLanding, true),
    showInProductsPage: toBoolean(body.showInProductsPage, true),
    showInNavbar: toBoolean(body.showInNavbar, true),
  };
  // Only overwrite shippingCost when the client actually sent it.
  if (!Object.prototype.hasOwnProperty.call(body, 'shippingCost')) delete payload.shippingCost;

  validateIdentity(payload, { requireId, sentKeys });

  if (files.length > 0) {
    const productImages = files.filter((f) => f.fieldname === 'productImages');
    const singleImage = files.find((f) => f.fieldname === 'image');
    const galleryFiles = files.filter((f) => f.fieldname === 'images');

    const primaryFile = productImages[0]?.file || singleImage?.file;
    const additionalFiles = productImages.length > 1 ? productImages.slice(1).map((f) => f.file) : galleryFiles.map((f) => f.file);

    if (primaryFile) {
      payload.image = await uploadImageBuffer(primaryFile, { folder: 'products' });
      uploadedKeys.add('image');
    }
    if (additionalFiles.length > 0) {
      payload.images = await Promise.all(additionalFiles.map((f) => uploadImageBuffer(f, { folder: 'products/gallery' })));
      uploadedKeys.add('images');
    }

    for (const item of files.filter((f) => /^variantImageFile_\d+$/i.test(f.fieldname))) {
      const idx = Number(item.fieldname.split('_').pop());
      if (idx > 100) continue;
      const url = await uploadImageBuffer(item.file, { folder: 'products/variants' });
      payload.variantImages[idx] = { name: payload.variantImages[idx]?.name || '', image: url };
      uploadedKeys.add('variantImages');
    }
    payload.variantImages = payload.variantImages.filter((it) => it?.name || it?.image);

    for (const item of files.filter((f) => /^brandImageFile_\d+$/i.test(f.fieldname))) {
      const idx = Number(item.fieldname.split('_').pop());
      if (idx > 100) continue;
      const url = await uploadImageBuffer(item.file, { folder: 'products/brands' });
      payload.brands[idx] = { ...(payload.brands[idx] || {}), image: url };
      uploadedKeys.add('brands');
    }
    payload.brands = payload.brands.filter(Boolean);
  }

  return {
    payload,
    sentKeys,
    uploadedKeys,
    hasBodyVariantImages: sentKeys.has('variantImages'),
  };
}

export async function parsePromotionRequest(request, { requireId = true } = {}) {
  const { body, files } = await readRequest(request);
  const sentKeys = new Set(Object.keys(body));
  const uploadedKeys = new Set();

  const items = asArray(body.items)
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      ...item,
      product: text(item.product, 200),
      quantity: Math.max(0, toNumber(item.quantity, 0)),
      price: Math.max(0, toNumber(item.price, 0)),
    }));

  const totalQuantityFromItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPriceFromItems = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const explicitTotal = toNumber(body.totalPrice, NaN);

  const payload = {
    id: text(body.id, 100),
    title: text(body.title, 200),
    category: text(body.category, 100),
    description: text(body.description, 10000),
    image: imageUrl(body.image),
    images: imageList(body.images),
    items,
    totalQuantity: items.length ? totalQuantityFromItems : Math.max(0, toNumber(body.totalQuantity, 0)),
    // Bundle price = sum of the (discounted) item prices; explicit price only when no items are listed.
    totalPrice: items.length ? totalPriceFromItems : Math.max(0, Number.isFinite(explicitTotal) ? explicitTotal : 0),
    originalPrice: nullableNonNegative(body.originalPrice),
    discount: nullableNonNegative(body.discount),
    shippingCost: nullableNonNegative(body.shippingCost),
    displayOrder: toNumber(body.displayOrder, 0),
    isActive: toBoolean(body.isActive, true),
  };

  validateIdentity(payload, { requireId, sentKeys });

  let hasPrimaryUpload = false;
  let hasGalleryUpload = false;
  if (files.length > 0) {
    const promotionImages = files.filter((f) => f.fieldname === 'promotionImages');
    const singleImage = files.find((f) => f.fieldname === 'image');
    const galleryFiles = files.filter((f) => f.fieldname === 'images');
    const primaryFile = promotionImages[0]?.file || singleImage?.file;
    const additionalFiles = promotionImages.length > 1 ? promotionImages.slice(1).map((f) => f.file) : galleryFiles.map((f) => f.file);

    if (primaryFile) {
      payload.image = await uploadImageBuffer(primaryFile, { folder: 'promotions' });
      hasPrimaryUpload = true;
      uploadedKeys.add('image');
    }
    if (additionalFiles.length > 0) {
      payload.images = await Promise.all(additionalFiles.map((f) => uploadImageBuffer(f, { folder: 'promotions/gallery' })));
      hasGalleryUpload = true;
      uploadedKeys.add('images');
    }
  }

  // totalQuantity/totalPrice are derived from items, so they count as sent when items are sent.
  if (sentKeys.has('items')) {
    sentKeys.add('totalQuantity');
    sentKeys.add('totalPrice');
  }
  return { payload, sentKeys, uploadedKeys, hasPrimaryUpload, hasGalleryUpload };
}

/**
 * For partial updates: drop fields the client did not send (and no upload produced),
 * so existing database values are kept instead of being reset to defaults.
 */
export function keepOnlySentFields(payload, sentKeys, uploadedKeys) {
  for (const key of Object.keys(payload)) {
    if (key === 'id') continue;
    if (!sentKeys.has(key) && !uploadedKeys.has(key)) delete payload[key];
  }
  return payload;
}
