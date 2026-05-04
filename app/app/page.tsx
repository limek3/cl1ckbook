'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { MiniAppEntry } from '@/components/mini/mini-app-entry';
import {
  authorizeTelegramMiniAppSession,
  hasTelegramMiniAppRuntime,
} from '@/lib/telegram-miniapp-auth-client';

type AppMode = 'checking' | 'mobile';

type MiniRouteErrorBoundaryProps = {
  children: ReactNode;
};

type MiniRouteErrorBoundaryState = {
  hasError: boolean;
};

class MiniRouteErrorBoundary extends Component<MiniRouteErrorBoundaryProps, MiniRouteErrorBoundaryState> {
  state: MiniRouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[ClickBook mini app]', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#090909] px-5 text-white">
        <div className="w-full max-w-[340px] rounded-[18px] border border-white/[0.10] bg-[#101010] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <BrandLogo />
          <div className="mt-5 text-[22px] font-semibold leading-none tracking-[-0.08em]">
            Mini app перезагрузилась
          </div>
          <div className="mt-3 text-[12px] leading-5 text-white/45">
            Telegram WebView поймал ошибку интерфейса. Нажми кнопку ниже — приложение откроется заново без белого экрана.
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 h-10 w-full rounded-[10px] border border-white/[0.12] bg-white text-[12px] font-bold text-black active:scale-[0.985]"
          >
            Перезагрузить
          </button>
        </div>
      </main>
    );
  }
}


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
    return (
      <MiniRouteErrorBoundary>
        <MiniAppEntry />
      </MiniRouteErrorBoundary>
    );
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