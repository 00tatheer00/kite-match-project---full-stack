import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/models/Product';
import { fetchRemoteFallback } from '@/lib/api-fallback';

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

  try {
    await connectToDatabase();
    let product = await Product.findOne({
      $or: [{ id: targetId }, { id: requested }, { slug: targetId }, { slug: requested }, { _id: targetId }, { _id: requested }],
    }).lean();

    if (!product) {
      const candidates = await Product.find().lean();
      product =
        candidates.find((item) => {
          const idMatch = normalizeIdentifier(item.id) === targetNormalized || normalizeIdentifier(item.id) === normalizedRequested;
          const slugMatch = normalizeIdentifier(item.slug) === targetNormalized || normalizeIdentifier(item.slug) === normalizedRequested;
          const titleMatch = normalizeIdentifier(item.title) === targetNormalized || normalizeIdentifier(item.title) === normalizedRequested;
          return idMatch || slugMatch || titleMatch;
        }) || null;
    }

    if (product) {
      return NextResponse.json(product);
    }
  } catch (err) {
    // Database offline
  }

  // Check persistent store
  try {
    const { getAllProducts, getProductById } = await import('@/lib/store');
    let product = getProductById(targetId) || getProductById(requested);
    if (!product) {
      const storeProducts = getAllProducts();
      product =
        storeProducts.find((item) => {
          const idMatch = normalizeIdentifier(item.id) === targetNormalized || normalizeIdentifier(item.id) === normalizedRequested;
          const slugMatch = normalizeIdentifier(item.slug) === targetNormalized || normalizeIdentifier(item.slug) === normalizedRequested;
          const titleMatch = normalizeIdentifier(item.title) === targetNormalized || normalizeIdentifier(item.title) === normalizedRequested;
          return idMatch || slugMatch || titleMatch;
        }) || null;
    }
    if (product) {
      return NextResponse.json(product);
    }
  } catch {}

  // Fallback to remote backend
  const remoteData = await fetchRemoteFallback(`/products/${requested}`);
  if (remoteData) {
    return NextResponse.json(remoteData);
  }

  return NextResponse.json({ message: 'Product not found' }, { status: 404 });
}
