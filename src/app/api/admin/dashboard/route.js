import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAnalyticsSummary } from '@/lib/analytics';
import { REVENUE_STATUSES } from '@/lib/constants';
import { handleRouteError, jsonError, NO_STORE_HEADERS, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/dashboard — overview numbers (Supabase only; no demo data).
export async function GET(request) {
  const { response } = requireAdmin(request);
  if (response) return response;

  try {
    const sb = getSupabaseAdmin();
    if (!sb) return jsonError('Database is not configured', 503);

    const [pRes, oRes, prRes, analytics] = await Promise.all([
      sb.from('products').select('id,category,productType,isActive'),
      sb.from('orders').select('*').order('createdAt', { ascending: false }).limit(2000),
      sb.from('promotions').select('*').order('displayOrder', { ascending: true }),
      getAnalyticsSummary(),
    ]);
    const failed = [pRes, oRes, prRes].find((r) => r.error);
    if (failed) {
      console.error('[admin/dashboard] query failed:', failed.error.message);
      return jsonError('Failed to load dashboard data', 503);
    }

    const products = pRes.data || [];
    const orders = oRes.data || [];
    const promotions = prRes.data || [];

    const countBy = (status) => orders.filter((o) => (o.status || 'pending') === status).length;
    const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pipelineValue = orders
      .filter((o) => (o.status || 'pending') === 'pending')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const matchesProducts = products.filter((p) => p.category === 'Safety Matches' || p.productType === 'safety-matches').length;
    const detergentProducts = products.filter((p) => p.category === 'Detergents' || p.category === 'Dish Wash').length;

    return NextResponse.json(
      {
        productCount: products.length,
        orderCount: orders.length,
        promotionsCount: promotions.length,
        overview: {
          totalOrders: orders.length,
          pendingOrders: countBy('pending'),
          approvedOrders: countBy('confirmed') + countBy('shipped'),
          shippedOrders: countBy('shipped'),
          cancelledOrders: countBy('cancelled'),
          totalRevenue, // confirmed + shipped only (cancelled/pending excluded)
          pipelineValue, // value of pending orders
          totalProducts: products.length,
          totalPromotions: promotions.length,
          activePromotions: promotions.filter((p) => p.isActive !== false).length,
          freeShippingPromotions: promotions.filter((p) => Number(p.shippingCost) === 0).length,
          matchesProducts,
          detergentProducts,
          totalVisitors: analytics.totalVisitors || 0,
          todayVisitors: analytics.todayVisitors || 0,
          totalPageviews: analytics.totalPageviews || 0,
        },
        promotions: promotions.slice(0, 9),
        analytics,
        recentOrders: orders.slice(0, 10),
        lastUpdated: new Date().toISOString(),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    return handleRouteError(err, 'dashboard');
  }
}
