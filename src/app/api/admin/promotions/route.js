import { NextResponse } from 'next/server';
import { parsePromotionRequest } from '@/lib/admin-payloads';
import { createOne, listAll } from '@/lib/admin-catalog';
import { handleRouteError, NO_STORE_HEADERS, requireAdmin, revalidateCatalog } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/promotions — all promotions including inactive ones.
export async function GET(request) {
  const { response } = requireAdmin(request);
  if (response) return response;
  try {
    return NextResponse.json(await listAll('promotions'), { headers: NO_STORE_HEADERS });
  } catch (err) {
    return handleRouteError(err, 'list admin promotions');
  }
}

// POST /api/admin/promotions — create (409 if the ID already exists).
export async function POST(request) {
  const { response } = requireAdmin(request);
  if (response) return response;
  try {
    const { payload } = await parsePromotionRequest(request);
    const created = await createOne('promotions', payload);
    revalidateCatalog();
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleRouteError(err, 'create promotion');
  }
}
