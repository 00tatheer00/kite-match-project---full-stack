import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import { fetchRemoteFallback } from '@/lib/api-fallback';

// GET /api/orders/[id]
export async function GET(request, context) {
  const { params } = context;
  const id = (await params)?.id;
  if (!id) {
    return NextResponse.json({ message: 'Order ID required' }, { status: 400 });
  }

  try {
    try {
      await connectToDatabase();
      let order = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(id).lean();
      }
      if (!order) {
        order = await Order.findOne({ orderNumber: id }).lean();
      }

      if (order) {
        return NextResponse.json(order);
      }
    } catch (dbErr) {
      // Database offline or query error
    }

    try {
      const { getOrderById } = await import('@/lib/store');
      const storeOrder = getOrderById(id);
      if (storeOrder) {
        return NextResponse.json(storeOrder);
      }
    } catch {}

    const remoteOrder = await fetchRemoteFallback(`/orders/${id}`);
    if (remoteOrder) {
      return NextResponse.json(remoteOrder);
    }
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }
}
