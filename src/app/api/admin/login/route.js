import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { ADMIN_COOKIE, adminCookieOptions, getJwtSecret, signAdminToken, isSameOriginRequest } from '@/lib/auth';
import { getClientIp, rateLimit, resetRateLimit } from '@/lib/rate-limit';
import { jsonError } from '@/lib/http';

export const dynamic = 'force-dynamic';

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) {
    crypto.timingSafeEqual(ab, ab); // keep timing roughly constant
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

async function checkPassword(password) {
  const hash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
  if (hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }
  const plain = process.env.ADMIN_PASSWORD || '';
  if (!plain) return false;
  return safeEqual(password, plain);
}

// POST /api/admin/login
export async function POST(request) {
  if (!isSameOriginRequest(request)) return jsonError('Forbidden', 403);

  const ip = getClientIp(request);
  // 10 wrong attempts per 15 min per connection; a successful login clears the counter.
  const limit = rateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { message: `Too many login attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!configuredEmail || !getJwtSecret() || (!process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD)) {
    console.error('[login] Admin login is not configured. Set ADMIN_EMAIL, ADMIN_JWT_SECRET and ADMIN_PASSWORD_HASH (or ADMIN_PASSWORD).');
    return jsonError('Admin login is not configured on the server.', 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 254);
  const password = String(body?.password || '').slice(0, 200);

  const emailOk = safeEqual(email, configuredEmail);
  const passwordOk = await checkPassword(password);
  if (!emailOk || !passwordOk) {
    return jsonError('Invalid email or password', 401);
  }

  resetRateLimit(`login:${ip}`);
  const token = signAdminToken(configuredEmail);
  if (!token) return jsonError('Admin login is not configured on the server.', 503);

  const res = NextResponse.json({ success: true, email: configuredEmail });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}
