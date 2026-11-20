import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { resetAnalytics } from '@/lib/store';
import { verifyAdminAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resetData = resetAnalytics();

    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        await sb.from('analytics').upsert({
          id: 1,
          key: 'global_summary',
          ...resetData,
          updatedAt: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Supabase analytics reset note:', e.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Analytics reset to 0', data: resetData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
