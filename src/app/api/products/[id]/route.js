import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRODUCT_ALIASES = {
  tanga: 'safety-matches',
  'tanga-matches': 'safety-matches',
  'kite-matches': 'safety-matches',
  olympia: 'safety-matches',
  party: 'safety-matches',
  bird: 'safety-matches',
};

function normalizeIdentifier(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request, context) {
  const { params } = context;
  const requested = (await params)?.id;
  if (!requested) {
    return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
  }

  const normalizedRequested = normalizeIdentifier(requested);
  const targetId = PRODUCT_ALIASES[requested] || PRODUCT_ALIASES[normalizedRequested] || requested;
  const targetNormalized = normalizeIdentifier(targetId);

  // Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseAdmin();
      // Direct lookup
      let { data } = await sb.from('products').select('*').eq('id', targetId).single();
      if (!data && targetId !== requested) {
        const res = await sb.from('products').select('*').eq('id', requested).single();
        data = res.data;
      }
      // Fuzzy search
      if (!data) {
        const { data: all } = await sb.from('products').select('*');
        if (all) {
          data = all.find((item) => {
            const idMatch = normalizeIdentifier(item.id) === targetNormalized || normalizeIdentifier(item.id) === normalizedRequested;
            const titleMatch = normalizeIdentifier(item.title) === targetNormalized || normalizeIdentifier(item.title) === normalizedRequested;
            return idMatch || titleMatch;
          }) || null;
        }
      }
      if (data) return NextResponse.json(data);
    } catch (err) {
      console.warn('Supabase product fetch failed:', err.message);
    }
  }

  // Fallback to store
  try {
    const { getAllProducts, getProductById } = await import('@/lib/store');
    let product = getProductById(targetId) || getProductById(requested);
    if (!product) {
      const storeProducts = getAllProducts();
      product = storeProducts.find((item) => {
        const idMatch = normalizeIdentifier(item.id) === targetNormalized || normalizeIdentifier(item.id) === normalizedRequested;
        const slugMatch = normalizeIdentifier(item.slug) === targetNormalized || normalizeIdentifier(item.slug) === normalizedRequested;
        const titleMatch = normalizeIdentifier(item.title) === targetNormalized || normalizeIdentifier(item.title) === normalizedRequested;
        return idMatch || slugMatch || titleMatch;
      }) || null;
    }
    if (product) return NextResponse.json(product);
  } catch {}

  // Fallback to remote
  try {
    const { fetchRemoteFallback } = await import('@/lib/api-fallback');
    const remoteData = await fetchRemoteFallback(`/products/${requested}`);
    if (remoteData) return NextResponse.json(remoteData);
  } catch {}

  return NextResponse.json({ message: 'Product not found' }, { status: 404 });
}
