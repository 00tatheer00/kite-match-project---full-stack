import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/auth';
import { getAllProducts, getAllOrders, getAnalyticsSummary, getAllPromotions } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let products = [];
    let orders = [];
    let promotions = [];
    let analytics = null;

    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const [pRes, oRes, prRes, aRes] = await Promise.all([
          sb.from('products').select('*').order('createdAt', { ascending: false }),
          sb.from('orders').select('*').order('createdAt', { ascending: false }),
          sb.from('promotions').select('*').order('displayOrder', { ascending: true }),
          sb.from('analytics').select('*').eq('key', 'global_summary').single(),
        ]);

        if (!pRes.error && pRes.data) products = pRes.data;
        if (!oRes.error && oRes.data) orders = oRes.data;
        if (!prRes.error && prRes.data) promotions = prRes.data;
        if (!aRes.error && aRes.data) analytics = aRes.data;
      } catch (e) {
        console.warn('Supabase dashboard fetch note:', e.message);
      }
    }

    // Fallbacks
    if (!products.length) products = getAllProducts();
    if (!promotions.length) promotions = getAllPromotions();

    const storeOrders = getAllOrders();
    const orderMap = new Map();
    [...orders, ...storeOrders].forEach((o) => {
      const key = o.orderNumber || o.id || o._id;
      if (key && !orderMap.has(key)) orderMap.set(key, o);
    });
    orders = Array.from(orderMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    if (!analytics) {
      analytics = getAnalyticsSummary();
    }

    // Order statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending' || !o.status).length;
    const approvedOrders = orders.filter((o) => o.status === 'confirmed' || o.status === 'dispatched' || o.status === 'completed' || o.status === 'shipped').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount || o.totalPrice) || 0), 0);

    // Product statistics
    const matchesProducts = products.filter((p) => p.category === 'Safety Matches' || p.productType === 'safety-matches').length;
    const detergentProducts = products.filter((p) => p.category === 'Detergents' || p.category === 'Dish Wash').length;

    // Promotion statistics
    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter((p) => p.isActive !== false).length;
    const freeShippingPromotions = promotions.filter((p) => p.shippingCost === 0).length;

    const cities = analytics.cities || {};
    const countries = analytics.countries || {};

    return NextResponse.json({
      productCount: products.length,
      orderCount: totalOrders,
      promotionsCount: totalPromotions,
      overview: {
        totalOrders,
        pendingOrders,
        approvedOrders,
        totalRevenue,
        totalProducts: products.length,
        totalPromotions,
        activePromotions,
        freeShippingPromotions,
        matchesProducts,
        detergentProducts,
        totalVisitors: analytics.totalVisitors || 0,
        todayVisitors: analytics.todayVisitors || 0,
        totalPageviews: analytics.totalPageviews || 0,
      },
      promotions: promotions.slice(0, 9),
      analytics: {
        ...analytics,
        cities,
        countries,
      },
      recentOrders: orders.slice(0, 10),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
