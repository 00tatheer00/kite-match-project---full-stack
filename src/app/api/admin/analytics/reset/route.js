import { NextResponse } from 'next/server';
import { resetAnalytics } from '@/lib/analytics';
import { handleRouteError, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';

// POST /api/admin/analytics/reset (admin only)
export async function POST(request) {
  const { response } = requireAdmin(request);
  if (response) return response;
  try {
    const data = await resetAnalytics();
    return NextResponse.json({ success: true, message: 'Analytics reset to 0', data });
  } catch (err) {
    return handleRouteError(err, 'reset analytics');
  }
}
