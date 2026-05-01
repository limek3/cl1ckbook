import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  APP_SESSION_COOKIE_NAME,
  CLICKBOOK_AUTH_COOKIE_LEGACY,
} from '@/lib/server/app-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Telegram app-session может жить без Supabase session.
  }

  const redirectUrl = new URL('/login', url.origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(APP_SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
  });

  response.cookies.set(CLICKBOOK_AUTH_COOKIE_LEGACY, '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Telegram app-session может жить без Supabase session.
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(APP_SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
  });

  response.cookies.set(CLICKBOOK_AUTH_COOKIE_LEGACY, '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}