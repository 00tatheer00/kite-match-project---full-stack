import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/orders/[id]
export async function GET(request, context) {
  const { params } = context;
  const id = (await params)?.id;
  if (!id) {
    return NextResponse.json({ message: 'Order ID required' }, { status: 400 });
  }

  try {
    // Try Supabase
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        let { data } = await sb.from('orders').select('*').eq('id', id).single();
        if (!data) {
          const res = await sb.from('orders').select('*').eq('orderNumber', id).single();
          data = res.data;
        }
        if (data) return NextResponse.json(data);
      } catch {}
    }

    // Fallback to store
    try {
      const { getOrderById } = await import('@/lib/store');
      const storeOrder = getOrderById(id);
      if (storeOrder) return NextResponse.json(storeOrder);
    } catch {}

    // Fallback to remote
    try {
      const { fetchRemoteFallback } = await import('@/lib/api-fallback');
      const remoteOrder = await fetchRemoteFallback(`/orders/${id}`);
      if (remoteOrder) return NextResponse.json(remoteOrder);
    } catch {}

    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }
}
