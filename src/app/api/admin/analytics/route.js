import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAnalyticsSummary } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let summary = getAnalyticsSummary();

    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const { data, error } = await sb
          .from('analytics')
          .select('*')
          .eq('key', 'global_summary')
          .single();

        if (!error && data && data.totalVisitors > 0) {
          summary = {
            ...data,
            sources: data.sources || summary.sources,
            devices: data.devices || summary.devices,
            cities: data.cities || summary.cities,
            countries: data.countries || summary.countries,
            recentVisits: data.recentVisits?.length ? data.recentVisits : summary.recentVisits,
          };
        } else {
          // Upsert current summary into Supabase
          await sb.from('analytics').upsert({
            id: 1,
            key: 'global_summary',
            ...summary,
            updatedAt: new Date().toISOString(),
          }, { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('Supabase analytics fetch note:', e.message);
      }
    }

    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
