import { NextResponse } from 'next/server';
import { quoteOrder } from '@/lib/pricing';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { handleRouteError, readJson } from '@/lib/http';

export const dynamic = 'force-dynamic';

// POST /api/orders/quote — returns the authoritative price breakdown for a cart/product/package
// so checkout always shows exactly what the customer will be charged.
export async function POST(request) {
  const limit = rateLimit(`quote:${getClientIp(request)}`, { limit: 300, windowMs: 60 * 1000 });
  if (!limit.ok) return NextResponse.json({ message: 'Too many requests' }, { status: 429 });

  try {
    const body = await readJson(request);
    const quote = await quoteOrder(body);
    return NextResponse.json(quote);
  } catch (err) {
    return handleRouteError(err, 'quote order');
  }
}
