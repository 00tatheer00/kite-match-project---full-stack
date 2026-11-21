import { getProductById, getPromotionById, getSettings } from './data';
import { cleanText, parseQuantity } from './validation';
import {
  DEFAULT_FREE_SHIPPING_BUNDLE_IDS,
  DEFAULT_SHIPPING_COST,
  MAX_CART_LINES,
  MAX_ITEM_QUANTITY,
} from './constants';

/**
 * Server-side pricing. Prices ALWAYS come from the database — anything the
 * client sends as `price`, `totalAmount` or `shippingCost` is ignored.
 *
 * Throws PricingError (HTTP 400/404) for invalid input.
 */

export class PricingError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function toPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function findVariant(list, name, key = 'name') {
  if (!Array.isArray(list) || !name) return null;
  const wanted = String(name).trim().toLowerCase();
  return list.find((v) => String(v?.[key] ?? '').trim().toLowerCase() === wanted) || null;
}

/**
 * Unit price for a product given brand + variant/size.
 * Order: brand-specific variants → product variants → product SKUs (by size).
 * If no variant is requested, the first product variant is used (legacy single-product flow).
 */
export function resolveProductUnitPrice(product, { brandName, variantName } = {}) {
  const brand = brandName ? findVariant(product.brands, brandName) : null;
  // Products with sub-brands (safety matches) are only sold per brand: a brand's
  // own sizes are the only valid options, never the parent product's sizes.
  if (Array.isArray(product.brands) && product.brands.length > 0 && !brand) {
    throw new PricingError(`Please choose a brand for ${product.title}.`);
  }

  if (variantName) {
    const match = brand
      ? findVariant(brand.variants, variantName)
      : findVariant(product.variants, variantName) || findVariant(product.skus, variantName, 'size');
    if (!match) throw new PricingError(`"${variantName}" is not available for ${product.title}.`);
    const price = toPositiveNumber(match.price);
    if (!price) throw new PricingError(`${product.title} (${variantName}) is not available for online order.`);
    return { unitPrice: price, variantName: match.name ?? match.size ?? variantName, brandName: brand?.name || null };
  }

  const first = ((brand ? brand.variants : product.variants) || [])[0];
  const price = toPositiveNumber(first?.price);
  if (!price) throw new PricingError(`Please select a size/variant for ${product.title}.`);
  return { unitPrice: price, variantName: first.name || null, brandName: brand?.name || null };
}

async function loadShippingRules() {
  const settings = await getSettings();
  const defaultShipping = Number(settings?.defaultShippingCost) || DEFAULT_SHIPPING_COST;
  const freeBundles =
    Array.isArray(settings?.freeShippingBundleIds) && settings.freeShippingBundleIds.length > 0
      ? settings.freeShippingBundleIds
      : DEFAULT_FREE_SHIPPING_BUNDLE_IDS;
  return { defaultShipping, freeBundles };
}

function productShipping(product, rules) {
  return product.shippingCost !== null && product.shippingCost !== undefined
    ? Math.max(0, Number(product.shippingCost) || 0)
    : rules.defaultShipping;
}

function promotionShipping(promo, rules) {
  if (rules.freeBundles.includes(promo.id)) return 0;
  return promo.shippingCost !== null && promo.shippingCost !== undefined
    ? Math.max(0, Number(promo.shippingCost) || 0)
    : DEFAULT_SHIPPING_COST;
}

async function priceProductLine({ productId, brandName, variantName, quantity }, rules) {
  const product = await getProductById(cleanText(productId, 200));
  if (!product || product.isActive === false) throw new PricingError('Product not found or no longer available.', 404);
  const resolved = resolveProductUnitPrice(product, { brandName: cleanText(brandName, 200), variantName: cleanText(variantName, 200) });
  return {
    itemType: 'product',
    productId: product.id,
    title: product.title,
    brandName: resolved.brandName,
    selectedVariant: resolved.variantName,
    quantity,
    price: resolved.unitPrice,
    lineTotal: resolved.unitPrice * quantity,
    shippingCost: productShipping(product, rules),
    image: product.image || null,
  };
}

async function pricePromotionLine({ promotionId, quantity }, rules) {
  const promo = await getPromotionById(cleanText(promotionId, 200));
  if (!promo || promo.isActive === false) throw new PricingError('Package not found or no longer available.', 404);
  const price = toPositiveNumber(promo.totalPrice);
  if (!price) throw new PricingError(`${promo.title} is not available for online order.`);
  return {
    itemType: 'promotion',
    promotionId: promo.id,
    title: promo.title,
    quantity,
    price,
    lineTotal: price * quantity,
    shippingCost: promotionShipping(promo, rules),
    image: promo.image || null,
  };
}

/**
 * Build an authoritative quote from an order request body.
 * Accepts the three legacy shapes: type=product | promotion | cart.
 *
 * @returns {Promise<{ type, items, subtotal, shippingCost, totalAmount, productId?, promotionId?, selectedSkuOrSize?, quantity? }>}
 */
export async function quoteOrder(body = {}) {
  const items = Array.isArray(body.items) ? body.items : null;
  const type = body.type || (items?.length ? 'cart' : body.productId ? 'product' : body.promotionId ? 'promotion' : null);
  if (!['product', 'promotion', 'cart'].includes(type)) throw new PricingError('Invalid order type.');

  const rules = await loadShippingRules();
  let lines;

  if (type === 'cart') {
    if (!items || items.length === 0) throw new PricingError('Your cart is empty.');
    if (items.length > MAX_CART_LINES) throw new PricingError(`A single order can contain at most ${MAX_CART_LINES} items.`);
    lines = await Promise.all(
      items.map((item) => {
        const quantity = parseQuantity(item?.quantity, MAX_ITEM_QUANTITY);
        if (!quantity) throw new PricingError(`Quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}.`);
        const isPromo = item?.itemType === 'promotion' || Boolean(item?.promotionId && !item?.productId);
        return isPromo
          ? pricePromotionLine({ promotionId: item.promotionId || item.id, quantity }, rules)
          : priceProductLine(
              { productId: item.productId || item.id, brandName: item.brandName, variantName: item.selectedVariant, quantity },
              rules
            );
      })
    );
  } else {
    const quantity = parseQuantity(body.quantity, MAX_ITEM_QUANTITY);
    if (!quantity) throw new PricingError(`Quantity must be a whole number between 1 and ${MAX_ITEM_QUANTITY}.`);
    if (type === 'product') {
      if (!body.productId) throw new PricingError('productId is required.');
      lines = [await priceProductLine({ productId: body.productId, variantName: body.selectedSkuOrSize, brandName: body.brandName, quantity }, rules)];
    } else {
      if (!body.promotionId) throw new PricingError('promotionId is required.');
      lines = [await pricePromotionLine({ promotionId: body.promotionId, quantity }, rules)];
    }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  // Shipping is charged once per order: the highest shipping fee among items that need shipping.
  const shippingCost = lines.reduce((max, l) => Math.max(max, l.shippingCost), 0);
  const totalAmount = subtotal + shippingCost;

  if (!(totalAmount > 0)) throw new PricingError('Order total is invalid.');

  return {
    type,
    items: lines,
    subtotal,
    shippingCost,
    totalAmount,
    ...(type === 'product' && {
      productId: lines[0].productId,
      selectedSkuOrSize: lines[0].selectedVariant,
      quantity: lines[0].quantity,
    }),
    ...(type === 'promotion' && { promotionId: lines[0].promotionId, quantity: lines[0].quantity }),
  };
}
