import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromotionPackage from '@/lib/models/PromotionPackage';
import { fetchRemoteFallback } from '@/lib/api-fallback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  let storePromos = [];
  try {
    const { getAllPromotions } = await import('@/lib/store');
    storePromos = getAllPromotions();
  } catch {}

  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') !== 'false';

    // Seed initial packages only if database is completely empty
    const count = await PromotionPackage.countDocuments();
    if (count === 0 && storePromos && storePromos.length > 0) {
      for (const p of storePromos) {
        await PromotionPackage.findOneAndUpdate(
          { id: p.id },
          { $set: p },
          { upsert: true, new: true }
        );
      }
    }

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

  if (storePromos && storePromos.length > 0) {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') !== 'false';
    const filtered = onlyActive ? storePromos.filter(p => p.isActive !== false) : storePromos;
    return NextResponse.json(filtered);
  }

  const remoteData = await fetchRemoteFallback('/promotions');
  if (remoteData) {
    return NextResponse.json(remoteData);
  }
  return NextResponse.json([]);
}
