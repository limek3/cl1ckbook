import { NextResponse, type NextRequest } from 'next/server';

import {
  buildVkAuthorizeUrl,
  createRandomToken,
} from '@/lib/server/vk-id';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'clickbook_vk_oauth_state';
const NEXT_COOKIE = 'clickbook_vk_oauth_next';
const MODE_COOKIE = 'clickbook_vk_oauth_mode';

function shouldUseSecureCookies() {
  return process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://');
}

function safeRelativePath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

function safeMode(value: string | null) {
  return value === 'link' ? 'link' : 'login';
}

export async function GET(request: NextRequest) {
  try {
    const state = createRandomToken(24);
    const authUrl = buildVkAuthorizeUrl({ state });

    const response = NextResponse.redirect(authUrl);
    const secure = shouldUseSecureCookies();
    const cookieOptions = {
      httpOnly: true,
      secure,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 10,
    };

    response.cookies.set(STATE_COOKIE, state, cookieOptions);
    response.cookies.set(NEXT_COOKIE, safeRelativePath(request.nextUrl.searchParams.get('next')), cookieOptions);
    response.cookies.set(MODE_COOKIE, safeMode(request.nextUrl.searchParams.get('mode')), cookieOptions);

    return response;
  } catch (error) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'vk_not_configured');
    loginUrl.searchParams.set(
      'message',
      error instanceof Error ? error.message : 'VK OAuth authorization is not configured',
    );

    return NextResponse.redirect(loginUrl);
  }
}
