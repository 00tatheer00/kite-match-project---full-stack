import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { searchParams } = new URL(request.url);
      const onlyActive = searchParams.get('active') !== 'false';

      let query = sb.from('products').select('*')
        .order('displayOrder', { ascending: true })
        .order('createdAt', { ascending: false });

      if (onlyActive) {
        query = query.eq('isActive', true);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch (err) {
      console.warn('Supabase products fetch failed:', err.message);
    }
  }

  // Fallback to store
  try {
    const { getAllProducts } = await import('@/lib/store');
    const storeProducts = getAllProducts();
    if (storeProducts && storeProducts.length > 0) {
      return NextResponse.json(storeProducts);
    }
  } catch {}

  // Fallback to remote
  try {
    const { fetchRemoteFallback } = await import('@/lib/api-fallback');
    const remoteData = await fetchRemoteFallback('/products');
    if (remoteData) return NextResponse.json(remoteData);
  } catch {}

  return NextResponse.json([]);
}
