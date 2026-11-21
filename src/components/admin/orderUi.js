// Shared helpers for the admin Orders screens.

export const ORDER_FLOW = ['pending', 'confirmed', 'shipped'];
export const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'cancelled'];

export const STATUS_META = {
  pending: { label: 'Pending', dot: 'bg-amber-500', light: 'bg-amber-50 text-amber-700 ring-amber-600/20', dark: 'bg-amber-500/10 text-amber-300 ring-amber-500/30' },
  confirmed: { label: 'Confirmed', dot: 'bg-sky-500', light: 'bg-sky-50 text-sky-700 ring-sky-600/20', dark: 'bg-sky-500/10 text-sky-300 ring-sky-500/30' },
  shipped: { label: 'Shipped', dot: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dark: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30' },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-500', light: 'bg-rose-50 text-rose-700 ring-rose-600/20', dark: 'bg-rose-500/10 text-rose-300 ring-rose-500/30' },
};

// The next step in the normal flow (pending → confirmed → shipped).
export const NEXT_STEP = {
  pending: { status: 'confirmed', label: 'Confirm order' },
  confirmed: { status: 'shipped', label: 'Mark as shipped' },
};

export const orderKeyOf = (o) => o?.id || o?._id || o?.orderNumber;

export const rs = (n) => (n == null || n === '' ? '—' : `Rs ${Number(n).toLocaleString('en-PK')}`);

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Karachi' })
    : '—';

export const relativeTime = (value, now = Date.now()) => {
  if (!value) return '';
  const diff = Math.max(0, now - new Date(value).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
};

export const karachiDay = (value) =>
  value ? new Date(value).toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }) : '';

// 03001234567 / +923001234567 → 923001234567 (for wa.me links)
export const whatsappNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return digits;
};

export const initials = (name) =>
  String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

export const itemCount = (o) =>
  Array.isArray(o?.items) && o.items.length > 0
    ? o.items.reduce((s, it) => s + (Number(it.quantity) || 0), 0)
    : Number(o?.quantity) || 1;

export const itemLabel = (it) => {
  const name = it?.title || it?.brandName || it?.productId || it?.promotionId || 'Item';
  const brand = it?.brandName && it.brandName !== it.title ? ` (${it.brandName})` : '';
  const size = it?.itemType !== 'promotion' && it?.selectedVariant ? ` - ${it.selectedVariant}` : '';
  return `${name}${brand}${size}`;
};

export const orderSummaryLine = (o) => {
  if (Array.isArray(o?.items) && o.items.length > 0) {
    const first = itemLabel(o.items[0]);
    return o.items.length > 1 ? `${first} +${o.items.length - 1} more` : first;
  }
  return o?.selectedSkuOrSize || o?.productId || o?.promotionId || '—';
};

// Plain text for the courier / WhatsApp (copy button).
export const courierText = (o) =>
  [
    `Order ${o.orderNumber || ''}`.trim(),
    `Name: ${o.customerName || ''}`,
    `Phone: ${o.phone || ''}`,
    `City: ${o.city || ''}`,
    `Address: ${o.address || ''}`,
    ...(Array.isArray(o.items) && o.items.length
      ? o.items.map((it) => `- ${itemLabel(it)} x ${it.quantity}`)
      : [`- ${o.selectedSkuOrSize || o.productId || o.promotionId || 'Item'} x ${o.quantity || 1}`]),
    `Total (COD): ${rs(o.totalAmount)}`,
    o.note ? `Note: ${o.note}` : '',
  ]
    .filter(Boolean)
    .join('\n');
