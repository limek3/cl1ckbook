'use client';

import { useEffect } from 'react';
import { MiniApp } from '@/components/mini/mini-app-shell';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
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
    }
  }, []);

  // Inherit Telegram color scheme on mount (fallback dark)
  const initialMode = (typeof window !== 'undefined' && window.Telegram?.WebApp?.colorScheme === 'light')
    ? 'light' : 'dark';

  return <MiniApp mode={initialMode} />;
}
