import jwt from 'jsonwebtoken';

/**
 * Admin authentication.
 *
 * - Tokens are HS256 JWTs signed with ADMIN_JWT_SECRET (no fallbacks, no hardcoded secrets).
 * - Tokens are delivered in an httpOnly cookie (not readable by page JavaScript).
 * - Expiry is enforced.
 * - State-changing requests (POST/PUT/PATCH/DELETE) must come from the same origin (CSRF guard).
 */

export const ADMIN_COOKIE = 'adminToken';
export const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours

const MIN_SECRET_LENGTH = 32;

export function getJwtSecret() {
  const secret = (process.env.ADMIN_JWT_SECRET || '').trim();
  if (secret.length < MIN_SECRET_LENGTH) {
    if (process.env.NODE_ENV !== 'production' && secret.length > 0) {
      // Allow short secrets only in local development, with a loud warning.
      console.warn('[auth] ADMIN_JWT_SECRET is shorter than 32 characters. Use a long random value in production.');
      return secret;
    }
    console.error('[auth] ADMIN_JWT_SECRET is missing or too short (min 32 chars). Admin auth is disabled.');
    return null;
  }
  return secret;
}

export function signAdminToken(email) {
  const secret = getJwtSecret();
  if (!secret) return null;
  return jwt.sign({ email, role: 'admin' }, secret, {
    algorithm: 'HS256',
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function adminCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge,
  };
}

function readToken(request) {
  // 1. httpOnly cookie (primary)
  const cookieVal = request.cookies?.get?.(ADMIN_COOKIE)?.value;
  if (cookieVal) return String(cookieVal).trim();

  // 2. Bearer header (for scripts / API tools)
  const authHeader = (request.headers.get('authorization') || '').trim();
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Reject cross-site state-changing requests. Browsers always send Origin on
 * cross-origin POST/PUT/PATCH/DELETE, so a mismatch means a forged request.
 */
export function isSameOriginRequest(request) {
  if (SAFE_METHODS.has(request.method)) return true;
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser clients (curl, server-to-server) — still need a valid token
  try {
    const originHost = new URL(origin).host;
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    return Boolean(host) && originHost === host;
  } catch {
    return false;
  }
}

/**
 * Returns `{ email, role }` for a valid admin session, otherwise `null`.
 */
export function verifyAdminAuth(request) {
  if (!request) return null;
  if (!isSameOriginRequest(request)) return null;

  const token = readToken(request);
  if (!token) return null;

  const secret = getJwtSecret();
  if (!secret) return null;

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (!decoded || typeof decoded !== 'object' || decoded.role !== 'admin' || !decoded.email) {
      return null;
    }
    return { email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}
