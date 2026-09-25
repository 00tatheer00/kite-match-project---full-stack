import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
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

    await connectToDatabase();
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Fire-and-forget status update email
    sendStatusUpdateEmail(order.toObject ? order.toObject() : order).catch((err) => {
      console.error('[Email Error] Failed to send status update email:', err);
    });

    try {
      const { updateOrderStatus } = await import('@/lib/store');
      updateOrderStatus(id, status);
    } catch {}

    return NextResponse.json(order);
  } catch (err) {
    console.warn('Local update failed, checking store or remote fallback for order status:', err.message);
    try {
      const { updateOrderStatus } = await import('@/lib/store');
      const updatedInStore = updateOrderStatus(id, status);
      if (updatedInStore) {
        return NextResponse.json(updatedInStore);
      }
    } catch {}

    try {
      const { forwardRemoteRequest } = await import('@/lib/api-fallback');
      const auth = request.headers.get('authorization') || '';
      const res = await forwardRemoteRequest(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: auth ? { Authorization: auth } : {},
        body: { status },
      });
      if (res.ok && res.data) {
        return NextResponse.json(res.data);
      }
    } catch (e) {
      console.error('Remote status update fallback failed:', e);
    }
    return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
  }
}

export { PATCH as PUT };
