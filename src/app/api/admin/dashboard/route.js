import { NextResponse } from 'next/server';
import { getAllProducts, getAllOrders, getAnalyticsSummary, getAllPromotions } from '@/lib/store';
import { verifyAdminAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import PromotionPackage from '@/lib/models/PromotionPackage';
import Analytics from '@/lib/models/Analytics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const products = getAllProducts();
    const orders = getAllOrders();

    // Persistent Analytics from DB with Store fallback
    let analytics = getAnalyticsSummary();
    try {
      await connectToDatabase();
      const dbAnalytics = await Analytics.findOne({ key: 'global_summary' }).lean();
      if (dbAnalytics && dbAnalytics.totalVisitors > 0) {
        analytics = {
          ...dbAnalytics,
          sources: dbAnalytics.sources || analytics.sources,
          devices: dbAnalytics.devices || analytics.devices,
          cities: dbAnalytics.cities || analytics.cities,
          countries: dbAnalytics.countries || analytics.countries,
          recentVisits: dbAnalytics.recentVisits?.length ? dbAnalytics.recentVisits : analytics.recentVisits,
        };
      } else {
        await Analytics.findOneAndUpdate(
          { key: 'global_summary' },
          { $set: analytics },
          { upsert: true }
        );
      }
    } catch {
      // local store
    }

    // Promotions data
    let promotions = [];
    try {
      await connectToDatabase();
      const dbPromos = await PromotionPackage.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
      if (dbPromos && dbPromos.length >= 9) {
        promotions = dbPromos;
      } else {
        const storePromos = getAllPromotions();
        // Upsert missing store promos to db
        for (const p of storePromos) {
          await PromotionPackage.findOneAndUpdate({ id: p.id }, { $set: p }, { upsert: true });
        }
        promotions = storePromos;
      }
    } catch {
      promotions = getAllPromotions();
    }

    if (!promotions || promotions.length === 0) {
      promotions = getAllPromotions();
    }

    // Order statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || !o.status).length;
    const approvedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'dispatched' || o.status === 'completed').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    // Product statistics
    const matchesProducts = products.filter(p => p.category === 'Safety Matches' || p.productType === 'safety-matches').length;
    const detergentProducts = products.filter(p => p.category === 'Detergents' || p.category === 'Dish Wash').length;

    // Promotion statistics
    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter(p => p.isActive !== false).length;
    const freeShippingPromotions = promotions.filter(p => p.shippingCost === 0).length;

    // Geographic / Cities tracking
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
      recentOrders: orders.slice(0, 6),
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
