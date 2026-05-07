'use client';

import { useEffect } from 'react';

type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
  requestFullscreen?: () => void;
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

export function TelegramMiniAppViewport() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const webApp = (window as TelegramWindow).Telegram?.WebApp;

    const apply = () => {
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