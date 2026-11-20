import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/orders
export async function GET(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let dbOrders = [];
  try {
    await connectToDatabase();
    dbOrders = await Order.find().sort({ createdAt: -1 }).lean();
  } catch (err) {
    // MongoDB offline or error
  }

  let storeOrders = [];
  try {
    const { getAllOrders } = await import('@/lib/store');
    storeOrders = getAllOrders();
  } catch (e) {
    console.warn('Store read failed for orders:', e.message);
  }

  // Deduplicate and merge
  const ordersMap = new Map();
  [...(dbOrders || []), ...(storeOrders || [])].forEach((o) => {
    const key = o.orderNumber || o._id || o.id;
    if (key && !ordersMap.has(key)) {
      ordersMap.set(key, o);
    }
  });

  const merged = Array.from(ordersMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  return NextResponse.json(merged, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
