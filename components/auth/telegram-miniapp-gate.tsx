'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Loader2, Send, ShieldCheck } from 'lucide-react';
import {
  authorizeTelegramMiniAppSession,
  hasTelegramMiniAppInitData,
} from '@/lib/telegram-miniapp-auth-client';
import { cn } from '@/lib/utils';

type MiniAppAuthState = 'checking' | 'success' | 'outside' | 'error';

function getBotUsername() {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim() || '';
}

function normalizeTelegramMiniAppError(error?: string) {
  if (!error) return 'Не удалось войти через Telegram Mini App.';

  if (error.includes('telegram_init_data_expired')) {
    return 'Telegram-сессия устарела. Закройте Mini App и откройте кабинет заново из бота.';
  }

  if (error.includes('telegram_init_hash_invalid')) {
    return 'Telegram не подтвердил подпись входа. Проверьте TELEGRAM_BOT_TOKEN в Vercel.';
  }

  if (error.includes('sloty_telegram_accounts')) {
    return 'Не найдена таблица Telegram-аккаунтов. Выполните свежий SQL из архива в Supabase.';
  }

  return error;
}

export function TelegramMiniAppGate({
  redirectTo = '/dashboard',
  className,
}: {
  redirectTo?: string;
  className?: string;
}) {
  const [state, setState] = useState<MiniAppAuthState>('checking');
  const [message, setMessage] = useState('Проверяем Telegram-сессию...');

  const botUrl = useMemo(() => {
    const botUsername = getBotUsername();
    return botUsername ? `https://t.me/${botUsername}?startapp=dashboard` : null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function authorizeMiniApp() {
      if (!hasTelegramMiniAppInitData()) {
        if (!cancelled) {
          setState('outside');
          setMessage('Откройте кабинет через Telegram-бота. В браузере можно пользоваться веб-входом через кнопку ниже.');
        }
        return;
      }

      const payload = await authorizeTelegramMiniAppSession({ force: true });

      if (cancelled) return;

      if (!payload.ok) {
        setState('error');
        setMessage(normalizeTelegramMiniAppError(payload.error));
        return;
      }

      setState('success');
      setMessage('Готово. Открываем кабинет...');

      window.setTimeout(() => {
        window.location.replace(redirectTo);
      }, 280);
    }

    void authorizeMiniApp();

    return () => {
      cancelled = true;
    };
  }, [redirectTo]);

  const loading = state === 'checking';
  const success = state === 'success';
  const error = state === 'error';

  return (
    <div
      className={cn(
        'rounded-[14px] border border-black/[0.08] bg-white/58 p-4 text-center dark:border-white/[0.08] dark:bg-white/[0.04]',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto grid size-12 place-items-center rounded-[13px] border',
          success
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100'
            : error
              ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-100'
              : 'border-black/[0.08] bg-black/[0.025] text-black/48 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/48',
        )}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : success ? (
          <CheckCircle2 className="size-5" />
        ) : error ? (
          <ShieldCheck className="size-5" />
        ) : (
          <Send className="size-5" />
        )}
      </div>

      <div className="mt-4 text-[18px] font-semibold tracking-[-0.045em] text-black dark:text-white">
        {success
          ? 'Telegram подтверждён'
          : error
            ? 'Не удалось войти'
            : state === 'outside'
              ? 'Откройте через Telegram'
              : 'Входим через Telegram'}
      </div>

      <p className="mx-auto mt-2 max-w-[320px] text-[12px] leading-5 text-black/50 dark:text-white/46">
        {message}
      </p>

      {state === 'outside' ? (
        <div className="mt-4 grid gap-2">
          {botUrl ? (
            <a
              href={botUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#2692d8] bg-[#2ea6ff] px-4 text-[12px] font-semibold text-white transition hover:bg-[#2299f0] active:scale-[0.99]"
            >
              <Send className="size-4" />
              Открыть Mini App в Telegram
            </a>
          ) : null}

          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-black/[0.08] bg-white px-3 text-[11px] font-semibold text-black/54 transition hover:bg-black/[0.035] hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/54 dark:hover:bg-white/[0.07] dark:hover:text-white"
          >
            <ExternalLink className="size-3.5" />
            Войти на сайте
          </Link>
        </div>
      ) : null}
    </div>
  );
}
