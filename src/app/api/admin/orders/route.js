import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyAdminAuth } from '@/lib/auth';

// GET /api/admin/orders
export async function GET(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    if (orders && orders.length > 0) {
      return NextResponse.json(orders);
    }
  } catch (err) {
    // MongoDB offline or error
  }

  // Use local persistent store
  try {
    const { getAllOrders } = await import('@/lib/store');
    const storeOrders = getAllOrders();
    if (storeOrders && storeOrders.length > 0) {
      return NextResponse.json(storeOrders);
    }
  } catch (e) {
    console.warn('Store read failed for orders:', e.message);
  }

  try {
    const { fetchRemoteFallback } = await import('@/lib/api-fallback');
    const auth = request.headers.get('authorization') || '';
    const remoteOrders = await fetchRemoteFallback('/admin/orders', auth ? { Authorization: auth } : {});
    if (remoteOrders && Array.isArray(remoteOrders)) {
      return NextResponse.json(remoteOrders);
    }
  } catch (e) {
    console.warn('Remote fallback unavailable for admin orders:', e.message);
  }
  return NextResponse.json([]);
}
