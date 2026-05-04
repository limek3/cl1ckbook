'use client';

import { useEffect } from 'react';

type TelegramWebAppLike = {
  initData?: string;
  initDataUnsafe?: {
    user?: unknown;
    auth_date?: number;
    start_param?: string;
  };
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

function hasTelegramRuntime(webApp?: TelegramWebAppLike) {
  if (!webApp) return false;
  if (webApp.initData && webApp.initData.length > 10) return true;
  if (webApp.initDataUnsafe?.user) return true;

  try {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get('tgWebAppData') || params.get('tgWebAppStartParam'));
  } catch {
    return false;
  }
}

export function TelegramMiniAppViewport() {
  useEffect(() => {
    const root = document.documentElement;

    const applyInsets = () => {
      const webApp = window.Telegram?.WebApp;
      const active = hasTelegramRuntime(webApp);

      if (!active) {
        root.dataset.tgMiniapp = 'false';
        root.style.setProperty('--tg-safe-top', '0px');
        root.style.setProperty('--tg-safe-bottom', '0px');
        return;
      }

      webApp?.ready?.();
      webApp?.expand?.();

      root.dataset.tgMiniapp = 'true';

      const topInset = Number(
        webApp?.contentSafeAreaInset?.top ?? webApp?.safeAreaInset?.top ?? 0,
      );
      const bottomInset = Number(
        webApp?.contentSafeAreaInset?.bottom ?? webApp?.safeAreaInset?.bottom ?? 0,
      );

      root.style.setProperty('--tg-safe-top', `${Math.max(84, topInset + 28)}px`);
      root.style.setProperty('--tg-safe-bottom', `${Math.max(16, bottomInset + 10)}px`);
    };

    applyInsets();

    const webApp = window.Telegram?.WebApp;
    webApp?.onEvent?.('viewportChanged', applyInsets);
    webApp?.onEvent?.('themeChanged', applyInsets);
    window.addEventListener('resize', applyInsets);
    window.setTimeout(applyInsets, 350);
    window.setTimeout(applyInsets, 1000);

    return () => {
      webApp?.offEvent?.('viewportChanged', applyInsets);
      webApp?.offEvent?.('themeChanged', applyInsets);
      window.removeEventListener('resize', applyInsets);
    };
  }, []);

  return null;
}
