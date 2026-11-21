import { NextResponse } from 'next/server';
import { findOrder } from '@/lib/orders';
import { handleRouteError, jsonError, NO_STORE_HEADERS, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/admin/orders/:id  (UUID or KT-xxx order number)
export async function GET(request, context) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const id = (await context.params)?.id;
  if (!id) return jsonError('Order ID required', 400);

  try {
    const order = await findOrder(id);
    if (!order) return jsonError('Order not found', 404);
    return NextResponse.json(order, { headers: NO_STORE_HEADERS });
  } catch (err) {
    return handleRouteError(err, 'get admin order');
  }
}
