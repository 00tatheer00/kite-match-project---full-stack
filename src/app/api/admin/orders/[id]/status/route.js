import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';
import { sendStatusUpdateEmail } from '@/lib/email';

// PATCH /api/admin/orders/:id/status
export async function PATCH(request, context) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let id;
  let status;
  try {
    const { params } = context;
    id = (await params)?.id;
    if (!id) {
      return NextResponse.json({ message: 'Order ID required' }, { status: 400 });
    }

    const body = await request.json();
    status = body?.status;
    const allowed = ['pending', 'confirmed', 'shipped', 'cancelled'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    let order = null;

    // Try Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        // Try by UUID
        let res = await sb
          .from('orders')
          .update({ status, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!res.data) {
          // Try by orderNumber
          res = await sb
            .from('orders')
            .update({ status, updatedAt: new Date().toISOString() })
            .eq('orderNumber', id)
            .select()
            .single();
        }
        if (res.data) order = res.data;
      } catch {}
    }

    // Also update local store
    try {
      const { updateOrderStatus } = await import('@/lib/store');
      const storeOrder = updateOrderStatus(id, status);
      if (!order) order = storeOrder;
    } catch {}

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Fire-and-forget status update email
    sendStatusUpdateEmail(order).catch((err) => {
      console.error('[Email Error] Failed to send status update email:', err);
    });

    return NextResponse.json(order);
  } catch (err) {
    console.warn('Order status update error:', err.message);
    // Fallback to store
    try {
      const { updateOrderStatus } = await import('@/lib/store');
      const updatedInStore = updateOrderStatus(id, status);
      if (updatedInStore) return NextResponse.json(updatedInStore);
    } catch {}

    return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
  }
}

export { PATCH as PUT };
