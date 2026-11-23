import { NextResponse } from 'next/server';
import { listProducts } from '@/lib/data';
import { handleRouteError } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/products — active products only (inactive items are admin-only).
export async function GET() {
  try {
    const products = await listProducts({ activeOnly: true });
    return NextResponse.json(products, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err) {
    return handleRouteError(err, 'list products');
  }
}
