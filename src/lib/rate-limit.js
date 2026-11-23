/**
 * Small in-memory fixed-window rate limiter.
 *
 * On serverless platforms each warm instance keeps its own counters, so this is a
 * best-effort brake against brute force / spam rather than a hard global limit.
 * For a hard limit, back this with Upstash Redis or Vercel Firewall rules.
 */

const buckets = globalThis.__kiteRateLimitBuckets || new Map();
globalThis.__kiteRateLimitBuckets = buckets;

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * @returns {{ ok: boolean, retryAfter: number }}
 */
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) {
        if (now >= v.resetAt) buckets.delete(k);
      }
    }
    return { ok: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Forget a key's attempts (e.g. after a successful login, so only failed attempts count). */
export function resetRateLimit(key) {
  buckets.delete(key);
}
