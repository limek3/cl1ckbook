import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { CLICKBOOK_AUTH_COOKIE } from '@/lib/server/app-session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set(CLICKBOOK_AUTH_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
