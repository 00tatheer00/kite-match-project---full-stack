import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/store';

export async function GET() {
  try {
    const summary = getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
