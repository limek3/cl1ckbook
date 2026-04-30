'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Send, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type TelegramStartResponse = {
  token?: string;
  botUrl?: string;
  expiresIn?: number;
  error?: string;
};

type TelegramStatusResponse = {
  status: 'pending' | 'confirmed' | 'expired' | 'consumed' | 'invalid' | 'not_found' | 'error';
  access_token?: string;
  refresh_token?: string;
  error?: string;
};

export function TelegramLoginButton({
  redirectTo = '/dashboard',
  className,
}: {
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const pollTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const [token, setToken] = useState<string | null>(null);
  const [botUrl, setBotUrl] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'opening' | 'waiting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const clearPoll = () => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearPoll();
  }, []);

  const finishLogin = async (payload: TelegramStatusResponse) => {
    if (!payload.access_token || !payload.refresh_token) {
      throw new Error('telegram_session_missing');
    }

    const supabase = createClient();
    const { error } = await supabase.auth.setSession({
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
    });

    if (error) throw error;

    setState('success');
    setMessage('Готово. Открываем кабинет...');

    window.setTimeout(() => {
      router.replace(redirectTo);
      router.refresh();
    }, 350);
  };

  const pollStatus = async (nextToken: string) => {
    const response = await fetch(
      `/api/auth/telegram/status?token=${encodeURIComponent(nextToken)}`,
      {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      },
    );

    const payload = (await response.json()) as TelegramStatusResponse;

    if (!response.ok || payload.status === 'error') {
      throw new Error(payload.error || 'telegram_status_failed');
    }

    if (payload.status === 'pending') {
      if (Date.now() - startedAtRef.current > 10 * 60 * 1000) {
        clearPoll();
        setState('error');
        setMessage('Время входа истекло. Нажмите кнопку ещё раз.');
      }
      return;
    }

    if (payload.status === 'confirmed') {
      clearPoll();
      await finishLogin(payload);
      return;
    }

    clearPoll();
    setState('error');
    setMessage(
      payload.status === 'expired'
        ? 'Ссылка входа устарела. Нажмите кнопку ещё раз.'
        : payload.status === 'consumed'
          ? 'Эта ссылка уже использована. Нажмите кнопку ещё раз.'
          : 'Не удалось подтвердить вход. Нажмите кнопку ещё раз.',
    );
  };

  const startLogin = async () => {
    clearPoll();
    setState('opening');
    setMessage(null);
    setToken(null);
    setBotUrl(null);

    try {
      const response = await fetch('/api/auth/telegram/start', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });

      const payload = (await response.json()) as TelegramStartResponse;

      if (!response.ok || !payload.token || !payload.botUrl) {
        throw new Error(payload.error || 'telegram_start_failed');
      }

      setToken(payload.token);
      setBotUrl(payload.botUrl);
      setState('waiting');
      setMessage('Откроется бот. Нажмите Start — вход завершится автоматически.');
      startedAtRef.current = Date.now();

      window.open(payload.botUrl, '_blank', 'noopener,noreferrer');

      pollTimerRef.current = window.setInterval(() => {
        void pollStatus(payload.token as string).catch((error) => {
          clearPoll();
          setState('error');
          setMessage(
            error instanceof Error
              ? error.message
              : 'Не удалось проверить подтверждение Telegram.',
          );
        });
      }, 1800);

      window.setTimeout(() => {
        void pollStatus(payload.token as string).catch(() => {});
      }, 900);
    } catch (error) {
      clearPoll();
      setState('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось начать вход через Telegram.',
      );
    }
  };

  const loading = state === 'opening' || state === 'waiting';
  const success = state === 'success';
  const failed = state === 'error';

  return (
    <div className={cn('grid gap-2', className)}>
      <button
        type="button"
        onClick={startLogin}
        disabled={loading || success}
        className={cn(
          'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border px-4 text-[13px] font-semibold shadow-none transition-[background,border-color,color,opacity,transform] duration-150 active:scale-[0.99] disabled:pointer-events-none',
          success
            ? 'border-emerald-500/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-100'
            : failed
              ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-100'
              : 'border-[#2692d8] bg-[#2ea6ff] text-white hover:bg-[#2299f0] dark:border-[#2692d8]',
          loading ? 'opacity-85' : '',
        )}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : success ? (
          <Check className="size-4" />
        ) : failed ? (
          <X className="size-4" />
        ) : (
          <Send className="size-4" />
        )}

        {success
          ? 'Telegram подтверждён'
          : failed
            ? 'Повторить вход через Telegram'
            : loading
              ? 'Ждём подтверждение в Telegram'
              : 'Войти через Telegram'}
      </button>

      {message ? (
        <div
          className={cn(
            'rounded-[9px] border px-3 py-2 text-[11px] leading-4',
            failed
              ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-100'
              : success
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100'
                : 'border-black/[0.08] bg-white/50 text-black/48 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/46',
          )}
        >
          {message}

          {botUrl && state === 'waiting' ? (
            <a
              href={botUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 font-semibold underline underline-offset-2"
            >
              Открыть ещё раз
            </a>
          ) : null}
        </div>
      ) : null}

      {token && state === 'waiting' ? (
        <div className="text-center text-[10.5px] text-black/34 dark:text-white/30">
          Вход активен 10 минут.
        </div>
      ) : null}
    </div>
  );
}
