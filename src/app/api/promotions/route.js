import { NextResponse } from 'next/server';
import { listPromotions } from '@/lib/data';
import { handleRouteError } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/promotions — active promotion packages only.
export async function GET() {
  try {
    const promotions = await listPromotions({ activeOnly: true });
    return NextResponse.json(promotions, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err) {
    return handleRouteError(err, 'list promotions');
  }
}
