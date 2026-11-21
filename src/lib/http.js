import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminAuth } from './auth';

export const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ message, ...extra }, { status });
}

/**
 * Map known error types (DataError, PricingError, UploadError…) to a JSON response.
 * Unknown errors are logged and returned as a generic 500 without internal details.
 */
export function handleRouteError(err, context = 'request') {
  if (err && typeof err.status === 'number' && err.status >= 400 && err.status < 600) {
    return jsonError(err.message, err.status);
  }
  console.error(`[api] ${context} failed:`, err);
  return jsonError('Something went wrong. Please try again.', 500);
}

export function requireAdmin(request) {
  const admin = verifyAdminAuth(request);
  if (!admin) return { admin: null, response: jsonError('Unauthorized', 401) };
  return { admin, response: null };
}

/**
 * Refresh server-rendered pages after catalog/settings changes so the public
 * site reflects admin edits immediately.
 */
export function revalidateCatalog() {
  try {
    revalidatePath('/', 'layout');
  } catch (err) {
    console.warn('[api] revalidatePath failed:', err.message);
  }
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    const err = new Error('Invalid JSON body');
    err.status = 400;
    throw err;
  }
}
