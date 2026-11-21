import { NextResponse } from 'next/server';
import { requireAdmin, NO_STORE_HEADERS } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/admin/session — used by the admin UI to check whether the session cookie is valid.
export async function GET(request) {
  const { admin, response } = requireAdmin(request);
  if (response) return response;
  return NextResponse.json({ authenticated: true, email: admin.email }, { headers: NO_STORE_HEADERS });
}
