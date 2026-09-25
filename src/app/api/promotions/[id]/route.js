import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromotionPackage from '@/lib/models/PromotionPackage';
import { fetchRemoteFallback } from '@/lib/api-fallback';

export async function GET(request, context) {
  const { params } = context;
  const id = (await params)?.id;
  if (!id) {
    return NextResponse.json({ message: 'Promotion ID required' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const promo = await PromotionPackage.findOne({ id }).lean();
    if (!promo) {
      const remoteData = await fetchRemoteFallback(`/promotions/${id}`);
      if (remoteData) {
        return NextResponse.json(remoteData);
      }
      return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json(promo);
  } catch (err) {
    console.warn('Local database unavailable, falling back to remote API for /api/promotions/[id]:', err.message);
    const remoteData = await fetchRemoteFallback(`/promotions/${id}`);
    if (remoteData) {
      return NextResponse.json(remoteData);
    }
    return NextResponse.json({ message: 'Promotion not found or failed to fetch' }, { status: 404 });
  }
}
