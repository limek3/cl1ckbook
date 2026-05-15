import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await request.json().catch(() => null);
    return NextResponse.json({ ok: true, delivery: 'disabled_telegram_report_sink' });
  } catch {
    return NextResponse.json({ ok: false, error: 'report_failed' }, { status: 500 });
  }
}
