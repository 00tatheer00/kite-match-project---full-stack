import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, context) {
  const { params } = context;
  const id = (await params)?.id;
  if (!id) {
    return NextResponse.json({ message: 'Promotion ID required' }, { status: 400 });
  }

  // Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      const { data } = await sb.from('promotions').select('*').eq('id', id).single();
      if (data) return NextResponse.json(data);
    } catch {}
  }

  // Fallback to store
  try {
    const { getPromotionById } = await import('@/lib/store');
    const promo = getPromotionById(id);
    if (promo) return NextResponse.json(promo);
  } catch {}

  // Fallback to remote
  try {
    const { fetchRemoteFallback } = await import('@/lib/api-fallback');
    const remoteData = await fetchRemoteFallback(`/promotions/${id}`);
    if (remoteData) return NextResponse.json(remoteData);
  } catch {}

  return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });
}
