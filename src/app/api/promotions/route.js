import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromotionPackage from '@/lib/models/PromotionPackage';
import { fetchRemoteFallback } from '@/lib/api-fallback';

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

    // Auto-sync check
    const count = await PromotionPackage.countDocuments();
    const starter = await PromotionPackage.findOne({ id: 'pkg-kite-smart-starter' });
    if (count < 9 || !starter) {
      if (storePromos && storePromos.length > 0) {
        for (const p of storePromos) {
          await PromotionPackage.findOneAndUpdate(
            { id: p.id },
            { $set: p },
            { upsert: true, new: true }
          );
        }
      }
    }

    const query = onlyActive ? { isActive: true } : {};
    const promos = await PromotionPackage.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    if (promos && promos.length >= 9) {
      return NextResponse.json(promos);
    }
    if (promos && promos.length > 0) {
      const map = new Map();
      storePromos.filter(p => !onlyActive || p.isActive !== false).forEach(p => map.set(p.id, p));
      promos.forEach(p => map.set(p.id, p));
      return NextResponse.json(Array.from(map.values()));
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
