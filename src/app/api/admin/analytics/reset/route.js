import { NextResponse } from 'next/server';
import { resetAnalytics } from '@/lib/store';
import { verifyAdminAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resetData = resetAnalytics();
    return NextResponse.json({ success: true, message: 'Analytics reset to 0', data: resetData });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
