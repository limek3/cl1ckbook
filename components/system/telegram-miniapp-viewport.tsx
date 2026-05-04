'use client';

import { useEffect } from 'react';

type TelegramWebAppLike = {
  ready?: () => void;
  expand?: () => void;
  onEvent?: (event: string, callback: () => void) => void;
  offEvent?: (event: string, callback: () => void) => void;
  contentSafeAreaInset?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  safeAreaInset?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebAppLike;
    };
  }
}

export function TelegramMiniAppViewport() {
  useEffect(() => {
    const root = document.documentElement;

    const applyInsets = () => {
      const webApp = window.Telegram?.WebApp;

      if (!webApp) {
        root.dataset.tgMiniapp = 'false';
        root.style.setProperty('--tg-safe-top', '0px');
        root.style.setProperty('--tg-safe-bottom', '0px');
        return;
      }

      webApp.ready?.();
      webApp.expand?.();

      root.dataset.tgMiniapp = 'true';

      const topInset = Number(
        webApp.contentSafeAreaInset?.top ?? webApp.safeAreaInset?.top ?? 0,
      );

      const bottomInset = Number(
        webApp.contentSafeAreaInset?.bottom ?? webApp.safeAreaInset?.bottom ?? 0,
      );

      root.style.setProperty('--tg-safe-top', `${Math.max(82, topInset + 28)}px`);
      root.style.setProperty('--tg-safe-bottom', `${Math.max(16, bottomInset + 10)}px`);
    };

    applyInsets();

    const webApp = window.Telegram?.WebApp;

    webApp?.onEvent?.('viewportChanged', applyInsets);
    window.addEventListener('resize', applyInsets);

    return () => {
      webApp?.offEvent?.('viewportChanged', applyInsets);
      window.removeEventListener('resize', applyInsets);
    };
  }, []);

  return null;
}