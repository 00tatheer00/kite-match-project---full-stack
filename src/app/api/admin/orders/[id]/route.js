import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
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

    // Try Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        // Try by UUID id
        let { data } = await sb.from('orders').select('*').eq('id', id).single();
        if (!data) {
          // Try by orderNumber
          const res = await sb.from('orders').select('*').eq('orderNumber', id).single();
          data = res.data;
        }
        if (data) return NextResponse.json(data);
      } catch {}
    }

    // Fallback to store
    try {
      const { getOrderById } = await import('@/lib/store');
      const stored = getOrderById(id);
      if (stored) return NextResponse.json(stored);
    } catch {}

    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  } catch (err) {
    console.error('Error fetching admin order:', err);
    return NextResponse.json({ message: 'Failed to fetch order' }, { status: 500 });
  }
}
