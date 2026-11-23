import { NextResponse } from 'next/server';
import { getPromotionById } from '@/lib/data';
import { handleRouteError, jsonError, NO_STORE_HEADERS } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/promotions/:id
export async function GET(request, context) {
  const id = (await context.params)?.id;
  if (!id) return jsonError('Promotion ID required', 400);

  try {
    const promo = await getPromotionById(String(id).slice(0, 200));
    if (!promo || promo.isActive === false) return jsonError('Promotion not found', 404);
    return NextResponse.json(promo, { headers: NO_STORE_HEADERS });
  } catch (err) {
    return handleRouteError(err, 'get promotion');
  }
}
