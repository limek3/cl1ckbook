'use client';

import { useEffect } from 'react';
import { MiniApp } from '@/components/mini/mini-app-shell';
import { TelegramMiniAppViewport } from '@/components/system/telegram-miniapp-viewport';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        setBottomBarColor?: (color: string) => void;
        colorScheme?: 'light' | 'dark';
      };
    };
  }
}

export default function MiniAppPage() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      try { tg.setHeaderColor?.('#0a0a0a'); } catch {}
      try { tg.setBackgroundColor?.('#0a0a0a'); } catch {}
      try { tg.setBottomBarColor?.('#0a0a0a'); } catch {}
    }
    document.documentElement.dataset.tgMiniapp = 'true';
    document.documentElement.style.backgroundColor = '#0a0a0a';
    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#0a0a0a';
    document.body.style.colorScheme = 'dark';
  }, []);

  // Start dark by default to avoid Telegram/WebView native white chrome on first paint.
  const initialMode = 'dark';

  return (
    <>
      <TelegramMiniAppViewport />
      <MiniApp mode={initialMode} />
    </>
  );
}
