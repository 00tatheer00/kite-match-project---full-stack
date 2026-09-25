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
    await connectToDatabase();
    let order = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id }).lean();
    }

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.warn('Local database unavailable for /api/orders/[id], attempting fallback:', err.message);
    const remoteOrder = await fetchRemoteFallback(`/orders/${id}`);
    if (remoteOrder) {
      return NextResponse.json(remoteOrder);
    }
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }
}
