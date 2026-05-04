'use client';

import { useEffect } from 'react';

type TelegramColorMap = Partial<
  Record<
    | 'bg_color'
    | 'secondary_bg_color'
    | 'text_color'
    | 'hint_color'
    | 'link_color'
    | 'button_color'
    | 'button_text_color',
    string
  >
>;

type TelegramInset = Partial<Record<'top' | 'bottom' | 'left' | 'right', number>>;

type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
  onEvent?: (event: string, handler: () => void) => void;
  offEvent?: (event: string, handler: () => void) => void;
  themeParams?: TelegramColorMap;
  viewportHeight?: number;
  viewportStableHeight?: number;
  backgroundColor?: string;
  headerColor?: string;
  setBackgroundColor?: (color: string) => void;
  setHeaderColor?: (color: string) => void;
  safeAreaInset?: TelegramInset;
  contentSafeAreaInset?: TelegramInset;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

function getTelegramWebApp() {
  if (typeof window === 'undefined') return undefined;
  return (window as TelegramWindow).Telegram?.WebApp;
}

function setCssVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function resolveInset(value: number | undefined, fallback: string) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value}px` : fallback;
}

function applyTheme(webApp?: TelegramWebApp) {
  const root = document.documentElement;
  const theme = webApp?.themeParams ?? {};

  root.dataset.tgMiniapp = webApp ? 'true' : 'false';

  setCssVar('--tg-safe-top', resolveInset(webApp?.contentSafeAreaInset?.top ?? webApp?.safeAreaInset?.top, 'env(safe-area-inset-top, 0px)'));
  setCssVar('--tg-safe-bottom', resolveInset(webApp?.contentSafeAreaInset?.bottom ?? webApp?.safeAreaInset?.bottom, 'env(safe-area-inset-bottom, 0px)'));
  setCssVar('--tg-safe-left', resolveInset(webApp?.contentSafeAreaInset?.left ?? webApp?.safeAreaInset?.left, 'env(safe-area-inset-left, 0px)'));
  setCssVar('--tg-safe-right', resolveInset(webApp?.contentSafeAreaInset?.right ?? webApp?.safeAreaInset?.right, 'env(safe-area-inset-right, 0px)'));

  const viewportHeight =
    typeof webApp?.viewportStableHeight === 'number'
      ? webApp.viewportStableHeight
      : typeof webApp?.viewportHeight === 'number'
        ? webApp.viewportHeight
        : window.innerHeight;

  setCssVar('--tg-viewport-height', `${Math.max(0, Math.round(viewportHeight))}px`);

  if (theme.bg_color) {
    setCssVar('--tg-bg-color', theme.bg_color);
  }

  if (theme.secondary_bg_color) {
    setCssVar('--tg-secondary-bg-color', theme.secondary_bg_color);
  }

  if (theme.text_color) {
    setCssVar('--tg-text-color', theme.text_color);
  }

  if (theme.hint_color) {
    setCssVar('--tg-hint-color', theme.hint_color);
  }

  if (theme.button_color) {
    setCssVar('--tg-button-color', theme.button_color);
  }

  if (theme.button_text_color) {
    setCssVar('--tg-button-text-color', theme.button_text_color);
  }

  if (webApp?.setBackgroundColor && theme.bg_color) {
    webApp.setBackgroundColor(theme.bg_color);
  }

  if (webApp?.setHeaderColor && (theme.secondary_bg_color || theme.bg_color)) {
    webApp.setHeaderColor(theme.secondary_bg_color || theme.bg_color || '#090909');
  }
}

export function TelegramMiniAppViewport() {
  useEffect(() => {
    const webApp = getTelegramWebApp();

    try {
      webApp?.ready?.();
      webApp?.expand?.();
    } catch {}

    const syncViewport = () => applyTheme(getTelegramWebApp());
    syncViewport();

    window.addEventListener('resize', syncViewport);

    if (webApp?.onEvent) {
      webApp.onEvent('themeChanged', syncViewport);
      webApp.onEvent('viewportChanged', syncViewport);
    }

    return () => {
      window.removeEventListener('resize', syncViewport);

      if (webApp?.offEvent) {
        webApp.offEvent('themeChanged', syncViewport);
        webApp.offEvent('viewportChanged', syncViewport);
      }
    };
  }, []);

  return null;
}
