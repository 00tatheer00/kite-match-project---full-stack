import { NextResponse } from 'next/server';
import { getAllProducts, getAllOrders, getAnalyticsSummary } from '@/lib/store';
import { verifyAdminAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const products = getAllProducts();
    const orders = getAllOrders();
    const analytics = getAnalyticsSummary();

    // Order statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || !o.status).length;
    const approvedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'dispatched' || o.status === 'completed').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    // Product statistics
    const matchesProducts = products.filter(p => p.category === 'Safety Matches' || p.productType === 'safety-matches').length;
    const detergentProducts = products.filter(p => p.category === 'Detergents' || p.category === 'Dish Wash').length;

    // Geographic / Cities tracking
    const cities = analytics.cities || {};
    const countries = analytics.countries || {};

    return NextResponse.json({
      overview: {
        totalOrders,
        pendingOrders,
        approvedOrders,
        totalRevenue,
        totalProducts: products.length,
        matchesProducts,
        detergentProducts,
        totalVisitors: analytics.totalVisitors || 0,
        todayVisitors: analytics.todayVisitors || 0,
        totalPageviews: analytics.totalPageviews || 0,
      },
      analytics: {
        ...analytics,
        cities,
        countries,
      },
      recentOrders: orders.slice(0, 6),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
