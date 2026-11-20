import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/orders
export async function GET(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let sbOrders = [];
  let storeOrders = [];

  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) sbOrders = data;
    } catch (err) {
      console.warn('Supabase orders fetch failed:', err.message);
    }
  }

  // Also get local store orders
  try {
    const { getAllOrders } = await import('@/lib/store');
    storeOrders = getAllOrders();
  } catch (e) {
    console.warn('Store read failed:', e.message);
  }

  // Deduplicate and merge
  const ordersMap = new Map();
  [...sbOrders, ...storeOrders].forEach((o) => {
    const key = o.orderNumber || o.id || o._id;
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
