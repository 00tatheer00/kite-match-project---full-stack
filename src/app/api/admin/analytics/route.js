import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/store';
import { connectToDatabase } from '@/lib/db';
import Analytics from '@/lib/models/Analytics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let summary = getAnalyticsSummary();
    try {
      await connectToDatabase();
      const dbAnalytics = await Analytics.findOne({ key: 'global_summary' }).lean();
      if (dbAnalytics && dbAnalytics.totalVisitors > 0) {
        summary = {
          ...dbAnalytics,
          sources: dbAnalytics.sources || summary.sources,
          devices: dbAnalytics.devices || summary.devices,
          cities: dbAnalytics.cities || summary.cities,
          countries: dbAnalytics.countries || summary.countries,
          recentVisits: dbAnalytics.recentVisits?.length ? dbAnalytics.recentVisits : summary.recentVisits,
        };
      } else {
        await Analytics.findOneAndUpdate(
          { key: 'global_summary' },
          { $set: summary },
          { upsert: true }
        );
      }
    } catch {
      // local store is fallback
    }

    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
