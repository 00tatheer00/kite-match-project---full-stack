import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyAdminAuth } from '@/lib/auth';

// GET /api/admin/orders/:id
export async function GET(request, context) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { params } = context;
    const id = (await params)?.id;
    if (!id) {
      return NextResponse.json({ message: 'Order ID required' }, { status: 400 });
    }

    try {
      await connectToDatabase();
      const order = await Order.findById(id).lean();
      if (order) {
        return NextResponse.json(order);
      }
    } catch {}

    const { getOrderById } = await import('@/lib/store');
    const stored = getOrderById(id);
    if (stored) {
      return NextResponse.json(stored);
    }

    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  } catch (err) {
    console.error('Error fetching admin order:', err);
    return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 });
  }
}
