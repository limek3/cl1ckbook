import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';

const PROTECTED_PREFIXES = ['/dashboard', '/create-profile'];
const APP_SESSION_COOKIES = ['clickbook_app_session', 'clickbook_auth_session'];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function decodeBase64Url(value: string) {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );

    return JSON.parse(atob(padded)) as {
      sub?: string;
      userId?: string;
      telegramId?: number;
      exp?: number;
    };
  } catch {
    return null;
  }
}

function hasLikelyActiveAppSession(request: NextRequest) {
  for (const cookieName of APP_SESSION_COOKIES) {
    const raw = request.cookies.get(cookieName)?.value;

    if (!raw) continue;

    const payloadPart = raw.split('.')[0];

    if (!payloadPart) continue;

    const payload = decodeBase64Url(payloadPart);

    if (!payload?.exp) continue;

    const hasUser = Boolean(payload.userId || payload.sub);
    const isActive = payload.exp > Math.floor(Date.now() / 1000);

    if (hasUser && isActive) return true;
  }

  return false;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  let hasSupabaseUser = false;

  try {
    const supabase = createServerClient(
      getSupabaseUrl(),
      getSupabasePublishableKey(),
      {
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
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    hasSupabaseUser = Boolean(user);
  } catch {
    hasSupabaseUser = false;
  }

  const hasAppSession = hasLikelyActiveAppSession(request);
  const isAuthed = Boolean(hasSupabaseUser || hasAppSession);
  const { pathname, search } = request.nextUrl;

  if (!isAuthed && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', `${pathname}${search}`);

    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthed && pathname === '/login') {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = '/dashboard';
    redirectUrl.search = '';

    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}