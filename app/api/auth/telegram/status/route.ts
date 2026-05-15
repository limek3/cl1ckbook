import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'disabled', error: 'telegram_disabled' },
    { status: 410 },
  );
}
