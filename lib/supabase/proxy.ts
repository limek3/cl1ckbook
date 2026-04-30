import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';

const PROTECTED_PREFIXES = ['/dashboard', '/create-profile'];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let url: string;
  let publishableKey: string;

  try {
    url = getSupabaseUrl();
    publishableKey = getSupabasePublishableKey();
  } catch {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname === '/login') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
