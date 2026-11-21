import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { handleRouteError, jsonError, NO_STORE_HEADERS, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/orders — all orders, newest first (Supabase is the only source).
export async function GET(request) {
  const { response } = requireAdmin(request);
  if (response) return response;

  try {
    const sb = getSupabaseAdmin();
    if (!sb) return jsonError('Database is not configured', 503);
    const { data, error } = await sb.from('orders').select('*').order('createdAt', { ascending: false }).limit(2000);
    if (error) {
      console.error('[admin/orders] fetch failed:', error.message);
      return jsonError('Failed to load orders', 503);
    }
    return NextResponse.json(data || [], { headers: NO_STORE_HEADERS });
  } catch (err) {
    return handleRouteError(err, 'list orders');
  }
}
