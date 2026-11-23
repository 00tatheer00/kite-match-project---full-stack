import { NextResponse } from 'next/server';
import { resolveProduct } from '@/lib/data';
import { handleRouteError, jsonError } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/products/:id — by id, alias (e.g. "kite-matches") or slugified title.
export async function GET(request, context) {
  const requested = (await context.params)?.id;
  if (!requested) return jsonError('Product ID required', 400);

  try {
    const product = await resolveProduct(requested);
    if (!product || product.isActive === false) return jsonError('Product not found', 404);
    return NextResponse.json(product, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err) {
    return handleRouteError(err, 'get product');
  }
}
