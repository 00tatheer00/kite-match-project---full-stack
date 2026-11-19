import { NextResponse } from 'next/server';
import { resetAnalytics } from '@/lib/store';
import { verifyAdminAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Analytics from '@/lib/models/Analytics';

export async function POST(request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resetData = resetAnalytics();

    try {
      await connectToDatabase();
      await Analytics.findOneAndUpdate(
        { key: 'global_summary' },
        { $set: resetData },
        { upsert: true }
      );
    } catch {
      // ignore db error
    }

    return NextResponse.json({ success: true, message: 'Analytics reset to 0', data: resetData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
