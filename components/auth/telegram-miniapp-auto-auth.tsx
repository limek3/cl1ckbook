'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
import {
  authorizeTelegramMiniAppSession,
  hasTelegramMiniAppInitData,
} from '@/lib/telegram-miniapp-auth-client';

function normalizeRedirect(value: string | null) {
  if (!value) return '/dashboard';

  try {
    const decoded = decodeURIComponent(value);
    return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '/dashboard';
  } catch {
    return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
  }
}

function shouldForceTelegramSession(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/create-profile' ||
    pathname.startsWith('/create-profile/')
  );
}

export function TelegramMiniAppAutoAuth() {
  const pathname = usePathname();
  const searchParams = useBrowserSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!hasTelegramMiniAppInitData()) return;

    let cancelled = false;

    (async () => {
      const result = await authorizeTelegramMiniAppSession({
        force: shouldForceTelegramSession(pathname),
      });
      if (cancelled || !result.ok) return;

      if (pathname === '/login') {
        window.location.replace(normalizeRedirect(searchParams.get('redirectTo')));
        return;
      }

      router.refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  return null;
}
