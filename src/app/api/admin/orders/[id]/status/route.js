import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { findOrder } from '@/lib/orders';
import { sendStatusUpdateEmail } from '@/lib/email';
import { ORDER_STATUSES } from '@/lib/constants';
import { handleRouteError, jsonError, readJson, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/orders/:id/status   body: { status }
export async function PATCH(request, context) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const id = (await context.params)?.id;
  if (!id) return jsonError('Order ID required', 400);

  try {
    const { status } = await readJson(request);
    if (!ORDER_STATUSES.includes(status)) {
      return jsonError(`Invalid status. Allowed: ${ORDER_STATUSES.join(', ')}`, 400);
    }

    const existing = await findOrder(id);
    if (!existing) return jsonError('Order not found', 404);

    // No-op: don't touch the row or email the customer again.
    if (existing.status === status) return NextResponse.json(existing);

    const sb = getSupabaseAdmin();
    const { data: order, error } = await sb
      .from('orders')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error || !order) {
      console.error('[admin/orders/status] update failed:', error?.message);
      return jsonError('Failed to update order status', 503);
    }

    // Awaited so the email is not cut off when the serverless function freezes.
    const emailed = await sendStatusUpdateEmail(order).catch((err) => {
      console.error('[admin/orders/status] email failed:', err);
      return false;
    });

    return NextResponse.json({ ...order, customerNotified: Boolean(emailed) });
  } catch (err) {
    return handleRouteError(err, 'update order status');
  }
}

export { PATCH as PUT };
