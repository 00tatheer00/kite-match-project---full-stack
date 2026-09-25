import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/models/Product';
import { fetchRemoteFallback } from '@/lib/api-fallback';

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

  try {
    await connectToDatabase();
    const normalizedRequested = normalizeIdentifier(requested);

    let product = await Product.findOne({
      $or: [{ id: requested }, { slug: requested }],
    }).lean();

    if (!product) {
      const candidates = await Product.find().lean();
      product =
        candidates.find((item) => {
          const idMatch = normalizeIdentifier(item.id) === normalizedRequested;
          const slugMatch = normalizeIdentifier(item.slug) === normalizedRequested;
          const titleMatch = normalizeIdentifier(item.title) === normalizedRequested;
          return idMatch || slugMatch || titleMatch;
        }) || null;
    }

    if (!product) {
      const remoteData = await fetchRemoteFallback(`/products/${requested}`);
      if (remoteData) {
        return NextResponse.json(remoteData);
      }
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.warn('Local database unavailable, falling back to remote API for /api/products/[id]:', err.message);
    const remoteData = await fetchRemoteFallback(`/products/${requested}`);
    if (remoteData) {
      return NextResponse.json(remoteData);
    }
    return NextResponse.json({ message: 'Product not found or failed to fetch' }, { status: 404 });
  }
}
