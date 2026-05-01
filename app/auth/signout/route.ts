import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { clearTelegramAppSessionCookies } from '@/lib/server/app-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const response = NextResponse.redirect(new URL('/login', url.origin));
  return clearTelegramAppSessionCookies(response);
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearTelegramAppSessionCookies(response);
}