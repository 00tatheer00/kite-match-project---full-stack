// Google Analytics 4 helpers (gtag is loaded in app/layout.js).
// Safe to call anywhere: no-ops on the server or when GA is blocked.

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    // never break the page for analytics
  }
}

/** Cart line → GA4 ecommerce item. */
export function toGaItem(item) {
  if (!item) return null;
  const isPromo = item.itemType === "promotion";
  return {
    item_id: String(isPromo ? item.promotionId : item.productId || ""),
    item_name: String(isPromo ? item.promotionTitle : item.brandName || item.productTitle || "Item"),
    item_variant: item.selectedVariant ? String(item.selectedVariant) : undefined,
    item_category: isPromo ? "Package" : undefined,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
  };
}

export function cartValue(items = []) {
  return items.reduce((sum, i) => sum + (Number(i?.price) || 0) * (Number(i?.quantity) || 0), 0);
}
