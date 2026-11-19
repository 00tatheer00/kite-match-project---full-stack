import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromotionPackage from '@/lib/models/PromotionPackage';
import { fetchRemoteFallback } from '@/lib/api-fallback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, context) {
  const { params } = context;
  const id = (await params)?.id;
  if (!id) {
    return NextResponse.json({ message: 'Promotion ID required' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const promo = await PromotionPackage.findOne({ $or: [{ id }, { _id: id }] }).lean();
    if (promo) {
      return NextResponse.json(promo);
    }
  } catch (err) {
    // Database offline
  }

  try {
    const { getPromotionById } = await import('@/lib/store');
    const promo = getPromotionById(id);
    if (promo) {
      return NextResponse.json(promo);
    }
  } catch {}

  const remoteData = await fetchRemoteFallback(`/promotions/${id}`);
  if (remoteData) {
    return NextResponse.json(remoteData);
  }

  return NextResponse.json({ message: 'Promotion not found' }, { status: 404 });
}
