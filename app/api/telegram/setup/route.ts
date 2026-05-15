import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'telegram_disabled' },
    { status: 410 },
  );
}
