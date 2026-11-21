import { getSupabaseAdmin } from './supabase';
import { DataError } from './data';

/**
 * Order persistence helpers (Supabase only — orders are never written to the local filesystem).
 */

function parseOrderSeq(orderNumber) {
  const m = /^KT-(\d+)$/.exec(String(orderNumber || ''));
  return m ? Number(m[1]) : 0;
}

async function nextOrderNumber(sb) {
  // Use the highest existing number (not the row count) so deletions never cause reuse.
  const { data, error } = await sb
    .from('orders')
    .select('orderNumber')
    .order('createdAt', { ascending: false })
    .limit(200);
  if (error) throw new DataError('Could not generate order number');
  const max = (data || []).reduce((m, row) => Math.max(m, parseOrderSeq(row.orderNumber)), 0);
  return `KT-${String(max + 1).padStart(3, '0')}`;
}

/**
 * Insert an order with a unique sequential number. Retries on unique-constraint
 * collisions (two customers checking out at the same moment).
 */
export async function insertOrder(fields) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new DataError('Ordering is temporarily unavailable. Please call or WhatsApp us to place your order.');

  for (let attempt = 0; attempt < 5; attempt++) {
    let orderNumber = await nextOrderNumber(sb);
    if (attempt > 0) {
      // Spread concurrent retries apart.
      orderNumber = `KT-${String(parseOrderSeq(orderNumber) + attempt).padStart(3, '0')}`;
    }
    const now = new Date().toISOString();
    const { data, error } = await sb
      .from('orders')
      .insert({ ...fields, orderNumber, status: 'pending', createdAt: now, updatedAt: now })
      .select()
      .single();

    if (!error) return data;
    if (error.code !== '23505') {
      console.error('[orders] Insert failed:', error.message);
      throw new DataError('We could not save your order. Please try again or call/WhatsApp us.');
    }
  }
  throw new DataError('We could not save your order. Please try again.');
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value) {
  return UUID_REGEX.test(String(value || ''));
}

/**
 * Find an order by UUID or order number (admin use).
 */
export async function findOrder(idOrNumber) {
  const sb = getSupabaseAdmin();
  if (!sb) throw new DataError('Database is not configured');
  const column = isUuid(idOrNumber) ? 'id' : 'orderNumber';
  const { data, error } = await sb.from('orders').select('*').eq(column, String(idOrNumber).slice(0, 100)).maybeSingle();
  if (error) throw new DataError('Failed to load order');
  return data || null;
}

function maskPhone(phone) {
  const p = String(phone || '');
  return p.length > 4 ? `${p.slice(0, 4)}*****${p.slice(-2)}` : '';
}

/**
 * Fields safe to show on the public order-confirmation page.
 */
export function toPublicOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    type: order.type,
    status: order.status,
    items: order.items || [],
    productId: order.productId,
    promotionId: order.promotionId,
    selectedSkuOrSize: order.selectedSkuOrSize,
    quantity: order.quantity,
    totalAmount: order.totalAmount,
    shippingCost: order.shippingCost,
    paymentMethod: order.paymentMethod,
    customerName: order.customerName,
    city: order.city,
    phone: maskPhone(order.phone),
    createdAt: order.createdAt,
  };
}
