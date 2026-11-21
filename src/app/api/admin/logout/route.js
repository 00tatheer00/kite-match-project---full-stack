import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/admin/logout — clears the httpOnly session cookie.
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', adminCookieOptions(0));
  return res;
}
