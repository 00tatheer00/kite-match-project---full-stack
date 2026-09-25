import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromotionPackage from '@/lib/models/PromotionPackage';
import { fetchRemoteFallback } from '@/lib/api-fallback';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') !== 'false';
    const query = onlyActive ? { isActive: true } : {};
    const promos = await PromotionPackage.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    if (promos && promos.length > 0) {
      return NextResponse.json(promos);
    }
  } catch (err) {
    // MongoDB offline or error
  }

  try {
    const { getAllPromotions } = await import('@/lib/store');
    const storePromos = getAllPromotions();
    if (storePromos && storePromos.length > 0) {
      return NextResponse.json(storePromos);
    }
  } catch {}

  const remoteData = await fetchRemoteFallback('/promotions');
  if (remoteData) {
    return NextResponse.json(remoteData);
  }
  return NextResponse.json([]);
}
