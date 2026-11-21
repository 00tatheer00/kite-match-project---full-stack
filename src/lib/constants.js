// Single source of truth for business constants shared by server and client.

export const DEFAULT_SHIPPING_COST = 200;

// Used only when the settings row does not define freeShippingBundleIds.
export const DEFAULT_FREE_SHIPPING_BUNDLE_IDS = [
  'pkg-glow-family-pack',
  'pkg-glow-bachat-mega',
  'pkg-vero-family-pack',
];

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'cancelled'];

// Statuses that count towards revenue on the dashboard.
export const REVENUE_STATUSES = ['confirmed', 'shipped'];

export const PAYMENT_METHODS = ['COD', 'Easypaisa', 'JazzCash'];

export const MAX_ITEM_QUANTITY = 1000;
export const MAX_CART_LINES = 50;

export const DEFAULT_SETTINGS = {
  defaultShippingCost: DEFAULT_SHIPPING_COST,
  smallPackageShippingCost: DEFAULT_SHIPPING_COST,
  freeShippingBundleIds: DEFAULT_FREE_SHIPPING_BUNDLE_IDS,
  bannerType: 'video',
  bannerImage: '',
  bannerMobileImage: '',
  bannerTitle: 'Kite Brand Pakistan',
  bannerLink: '/online-order',
};
