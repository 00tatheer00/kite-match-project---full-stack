import { NextResponse } from 'next/server';
import { findOrder, isUuid, toPublicOrder } from '@/lib/orders';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { handleRouteError, jsonError, NO_STORE_HEADERS } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/orders/:id — public order confirmation lookup.
// Only accepts the unguessable order UUID (not the sequential KT-xxx number)
// and returns a reduced field set without email/address/full phone.
export async function GET(request, context) {
  const limit = rateLimit(`order-lookup:${getClientIp(request)}`, { limit: 30, windowMs: 60 * 1000 });
  if (!limit.ok) return jsonError('Too many requests', 429);

  const id = (await context.params)?.id;
  if (!isUuid(id)) return jsonError('Order not found', 404);

  try {
    const order = await findOrder(id);
    if (!order) return jsonError('Order not found', 404);
    return NextResponse.json(toPublicOrder(order), { headers: NO_STORE_HEADERS });
  } catch (err) {
    return handleRouteError(err, 'get order');
  }
}
