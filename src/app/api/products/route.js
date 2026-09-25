import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/lib/models/Product';
import { fetchRemoteFallback } from '@/lib/api-fallback';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') !== 'false';
    const query = onlyActive ? { isActive: true } : {};
    const products = await Product.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    if (products && products.length > 0) {
      return NextResponse.json(products);
    }
  } catch (err) {
    // MongoDB offline or error
  }

  try {
    const { getAllProducts } = await import('@/lib/store');
    const storeProducts = getAllProducts();
    if (storeProducts && storeProducts.length > 0) {
      return NextResponse.json(storeProducts);
    }
  } catch {}

  const remoteData = await fetchRemoteFallback('/products');
  if (remoteData) {
    return NextResponse.json(remoteData);
  }
  return NextResponse.json([]);
}
