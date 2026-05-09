'use client';

import { useEffect } from 'react';

type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
  requestFullscreen?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  viewportHeight?: number;
  viewportStableHeight?: number;
  safeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number };
  contentSafeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number };
  onEvent?: (event: string, callback: () => void) => void;
  offEvent?: (event: string, callback: () => void) => void;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

function safe(action: () => void) {
  try {
    action();
  } catch {}
}

function setPx(name: string, value: unknown) {
  if (typeof document === 'undefined') return;
  const number = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  document.documentElement.style.setProperty(name, `${Math.max(0, Math.round(number))}px`);
}

function upsertThemeColor(color: string) {
  if (typeof document === 'undefined') return;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = color;
}

function applyDarkMiniChrome(webApp?: TelegramWebApp) {
  if (typeof document === 'undefined') return;
  const bg = '#0a0a0a';
  const root = document.documentElement;
  root.dataset.tgMiniapp = 'true';
  root.style.backgroundColor = bg;
  root.style.colorScheme = 'dark';
  document.body.style.backgroundColor = bg;
  document.body.style.colorScheme = 'dark';
  upsertThemeColor(bg);
  safe(() => webApp?.setHeaderColor?.(bg));
  safe(() => webApp?.setBackgroundColor?.(bg));
  safe(() => webApp?.setBottomBarColor?.(bg));
}

export function TelegramMiniAppViewport() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const webApp = (window as TelegramWindow).Telegram?.WebApp;
    const isMiniApp = Boolean(webApp?.initData || webApp?.initDataUnsafe?.user);

    if (!isMiniApp) {
      return;
    }

    const apply = () => {
      applyDarkMiniChrome(webApp);

      const safeArea = webApp?.safeAreaInset ?? {};
      const contentSafeArea = webApp?.contentSafeAreaInset ?? {};

      // Для контента внутри Telegram WebView важен contentSafeAreaInset.
      // safeAreaInset часто включает системный статус-бар/нативную шапку Telegram,
      // из-за этого наша верхняя плашка получала двойной отступ и уезжала вниз.
      const contentTop = contentSafeArea.top ?? 0;
      const contentBottom = contentSafeArea.bottom ?? safeArea.bottom ?? 0;

      setPx('--tg-safe-top', contentTop);
      setPx('--tg-safe-bottom', contentBottom);
      setPx('--tg-content-safe-top', contentTop);
      setPx('--tg-content-safe-bottom', contentBottom);
      setPx('--tg-device-safe-top', safeArea.top ?? 0);
      setPx('--tg-device-safe-bottom', safeArea.bottom ?? 0);
      setPx('--tg-viewport-height', webApp?.viewportStableHeight ?? webApp?.viewportHeight ?? window.innerHeight);
    };

    safe(() => window.setTimeout(() => webApp?.ready?.(), 0));
    safe(() => window.setTimeout(() => webApp?.expand?.(), 0));
    safe(() => window.setTimeout(() => webApp?.requestFullscreen?.(), 0));
    safe(() => window.setTimeout(() => webApp?.disableVerticalSwipes?.(), 0));
    safe(apply);

    const handler = () => safe(apply);
    safe(() => webApp?.onEvent?.('viewportChanged', handler));
    window.addEventListener('resize', handler);
    window.addEventListener('orientationchange', handler);

    return () => {
      safe(() => webApp?.offEvent?.('viewportChanged', handler));
      window.removeEventListener('resize', handler);
      window.removeEventListener('orientationchange', handler);
    };
  }, []);

  return null;
}