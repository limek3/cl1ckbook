'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { MiniAppEntry } from '@/components/mini/mini-app-entry';
import {
  authorizeTelegramMiniAppSession,
  hasTelegramMiniAppRuntime,
} from '@/lib/telegram-miniapp-auth-client';

type AppMode = 'checking' | 'mobile';

function isPhoneViewport() {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search || '');
  if (params.get('mini') === '1' || params.has('tgWebAppData') || hasTelegramMiniAppRuntime()) return true;

  const viewportWidth = window.innerWidth || 0;
  const screenWidth = window.screen?.width || viewportWidth;
  const width = Math.min(viewportWidth, screenWidth);

  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const smallViewport = viewportWidth <= 820;
  const phoneScreen = width <= 820;

  return smallViewport || (coarsePointer && phoneScreen);
}

function getDashboardTarget() {
  if (typeof window === 'undefined') return '/dashboard';

  const params = new URLSearchParams(window.location.search || '');

  if (params.get('demo') === '1') {
    return '/dashboard?demo=1';
  }

  return '/dashboard';
}

export default function AppPage() {
  const [mode, setMode] = useState<AppMode>('checking');

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const phone = isPhoneViewport();

      if (!phone) {
        try {
          if (hasTelegramMiniAppRuntime()) {
            await authorizeTelegramMiniAppSession({
              waitMs: 2200,
            });
          }
        } catch {}

        if (!cancelled) {
          window.location.replace(getDashboardTarget());
        }

        return;
      }

      if (!cancelled) {
        setMode('mobile');
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === 'mobile') {
    return <MiniAppEntry />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-6 text-white">
      <div className="flex w-full max-w-[320px] flex-col items-center rounded-[22px] border border-white/[0.08] bg-[#101010]/92 px-5 py-6 text-center backdrop-blur-[22px]">
        <BrandLogo />

        <div className="mt-5 size-9 animate-spin rounded-full border border-white/[0.08] border-t-white/60" />

        <div className="mt-5 text-[15px] font-semibold tracking-[-0.045em]">
          Открываем кабинет
        </div>
        <div className="mt-1 max-w-[230px] text-[12px] leading-5 text-white/42">
          Проверяем устройство и открываем нужную версию.
        </div>
      </div>
    </main>
  );
}