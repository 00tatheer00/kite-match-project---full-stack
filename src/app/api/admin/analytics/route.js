import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/analytics';
import { handleRouteError, NO_STORE_HEADERS, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/analytics (admin only)
export async function GET(request) {
  const { response } = requireAdmin(request);
  if (response) return response;
  try {
    return NextResponse.json(await getAnalyticsSummary(), { headers: NO_STORE_HEADERS });
  } catch (err) {
    return handleRouteError(err, 'get analytics');
  }
}
