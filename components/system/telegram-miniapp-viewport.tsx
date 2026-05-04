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

function safeRun(action: () => void) {
  try {
    action();
  } catch {
    // Telegram WebView versions differ. Some methods/events exist in typings
    // but throw inside older mobile clients. Never let viewport helpers crash app.
  }
}

function setCssVar(name: string, value?: number) {
  if (typeof document === 'undefined') return;
  if (typeof value !== 'number' || !Number.isFinite(value)) return;
  document.documentElement.style.setProperty(name, `${Math.max(0, Math.round(value))}px`);
}

function subscribe(webApp: TelegramWebApp | undefined, event: string, callback: () => void) {
  safeRun(() => webApp?.onEvent?.(event, callback));
}

function unsubscribe(webApp: TelegramWebApp | undefined, event: string, callback: () => void) {
  safeRun(() => webApp?.offEvent?.(event, callback));
}

export function TelegramMiniAppViewport() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const webApp = (window as TelegramWindow).Telegram?.WebApp;

    const applyViewport = () => {
      safeRun(() => {
        const safe = webApp?.safeAreaInset ?? {};
        const contentSafe = webApp?.contentSafeAreaInset ?? {};
        setCssVar('--tg-safe-top', Math.max(safe.top ?? 0, contentSafe.top ?? 0));
        setCssVar('--tg-safe-bottom', Math.max(safe.bottom ?? 0, contentSafe.bottom ?? 0));
        setCssVar('--tg-viewport-height', webApp?.viewportStableHeight ?? webApp?.viewportHeight);
      });
    };

    safeRun(() => webApp?.ready?.());
    safeRun(() => webApp?.expand?.());
    safeRun(() => webApp?.disableVerticalSwipes?.());

    applyViewport();

    // viewportChanged is the stable Telegram event. The safe-area events are
    // wrapped because older Telegram mobile clients may throw on unknown events.
    subscribe(webApp, 'viewportChanged', applyViewport);
    subscribe(webApp, 'safeAreaChanged', applyViewport);
    subscribe(webApp, 'contentSafeAreaChanged', applyViewport);

    return () => {
      unsubscribe(webApp, 'viewportChanged', applyViewport);
      unsubscribe(webApp, 'safeAreaChanged', applyViewport);
      unsubscribe(webApp, 'contentSafeAreaChanged', applyViewport);
    };
  }, []);

  return null;
}
