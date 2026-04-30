import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function safeRelativePath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeRelativePath(requestUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('redirectTo', next);
      loginUrl.searchParams.set('error', 'auth_callback_failed');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
