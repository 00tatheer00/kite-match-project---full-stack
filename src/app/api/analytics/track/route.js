import { NextResponse } from 'next/server';
import { recordVisitorEvent } from '@/lib/store';

export async function POST(req) {
  try {
    let payload = {};
    const text = await req.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = {};
      }
    }
    const result = recordVisitorEvent(payload);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
