'use client';

import { useEffect } from 'react';

type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
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

function setCssVar(name: string, value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return;
  document.documentElement.style.setProperty(name, `${Math.max(0, Math.round(value))}px`);
}

export function TelegramMiniAppViewport() {
  useEffect(() => {
    const webApp = (window as TelegramWindow).Telegram?.WebApp;

    const applyViewport = () => {
      const safe = webApp?.safeAreaInset ?? {};
      const contentSafe = webApp?.contentSafeAreaInset ?? {};
      setCssVar('--tg-safe-top', Math.max(safe.top ?? 0, contentSafe.top ?? 0));
      setCssVar('--tg-safe-bottom', Math.max(safe.bottom ?? 0, contentSafe.bottom ?? 0));
      setCssVar('--tg-viewport-height', webApp?.viewportStableHeight ?? webApp?.viewportHeight);
    };

    try {
      webApp?.ready?.();
      webApp?.expand?.();
      webApp?.disableVerticalSwipes?.();
    } catch {}

    applyViewport();
    webApp?.onEvent?.('viewportChanged', applyViewport);
    webApp?.onEvent?.('safeAreaChanged', applyViewport);
    webApp?.onEvent?.('contentSafeAreaChanged', applyViewport);

    return () => {
      webApp?.offEvent?.('viewportChanged', applyViewport);
      webApp?.offEvent?.('safeAreaChanged', applyViewport);
      webApp?.offEvent?.('contentSafeAreaChanged', applyViewport);
    };
  }, []);

  return null;
}
