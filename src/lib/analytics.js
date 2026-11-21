import { getSupabaseAdmin } from './supabase';

export const EMPTY_ANALYTICS = {
  totalVisitors: 0,
  todayVisitors: 0,
  totalPageviews: 0,
  sources: {},
  devices: {},
  cities: {},
  countries: {},
  topPages: {},
  recentVisits: [],
  lastUpdated: null,
};

const SUMMARY_KEY = 'global_summary';

export async function getAnalyticsSummary() {
  const sb = getSupabaseAdmin();
  if (!sb) return { ...EMPTY_ANALYTICS };
  const { data, error } = await sb.from('analytics').select('*').eq('key', SUMMARY_KEY).maybeSingle();
  if (error) {
    console.error('[analytics] read failed:', error.message);
    return { ...EMPTY_ANALYTICS };
  }
  const summary = { ...EMPTY_ANALYTICS, ...(data || {}) };
  // todayVisitors is only valid for the current Karachi calendar day.
  if (karachiDay(summary.lastUpdated) !== karachiDay(new Date())) summary.todayVisitors = 0;
  return summary;
}

export function karachiDay(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
}

export async function resetAnalytics() {
  const sb = getSupabaseAdmin();
  if (!sb) throw Object.assign(new Error('Database is not configured'), { status: 503 });
  const now = new Date().toISOString();
  const { error } = await sb
    .from('analytics')
    .upsert({ id: 1, key: SUMMARY_KEY, ...EMPTY_ANALYTICS, lastUpdated: now, updatedAt: now }, { onConflict: 'id' });
  if (error) throw Object.assign(new Error('Failed to reset analytics'), { status: 503 });
  return { ...EMPTY_ANALYTICS, lastUpdated: now };
}
