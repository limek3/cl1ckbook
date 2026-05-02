'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Loader2, MessageCircleMore, X } from 'lucide-react';
import { storeTelegramAppSessionToken } from '@/lib/telegram-miniapp-auth-client';
import { cn } from '@/lib/utils';

type VkStartResponse = {
  token?: string;
  vkUrl?: string;
  dialogUrl?: string;
  prefillUrl?: string;
  command?: string;
  expiresIn?: number;
  error?: string;
};

type VkStatusResponse = {
  status: 'pending' | 'confirmed' | 'expired' | 'consumed' | 'invalid' | 'not_found' | 'error';
  app_session?: boolean;
  appSessionToken?: string;
  error?: string;
};

async function readJsonSafe<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return { error: text } as T;
  }
}

function humanVkError(value?: string) {
  if (!value) return 'Не удалось завершить вход через VK.';

  if (value.includes('sloty_vk_login_requests')) {
    return 'Не найдена таблица VK-входа. Выполните SQL migration 20260502_0022_clickbook_vk_bot_auth.sql.';
  }

  if (value.includes('Missing VK_BOT_ACCESS_TOKEN')) {
    return 'Не задан VK_BOT_ACCESS_TOKEN в Vercel.';
  }

  if (value.includes('Missing VK_BOT_GROUP_ID') || value.includes('VK_BOT_SCREEN_NAME')) {
    return 'Не задан VK_BOT_GROUP_ID или VK_BOT_SCREEN_NAME в Vercel.';
  }

  return value;
}

export function VkLoginButton({
  redirectTo = '/dashboard',
  mode = 'login',
  className,
}: {
  redirectTo?: string;
  mode?: 'login' | 'link';
  className?: string;
}) {
  const pollTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const [token, setToken] = useState<string | null>(null);
  const [vkUrl, setVkUrl] = useState<string | null>(null);
  const [prefillUrl, setPrefillUrl] = useState<string | null>(null);
  const [command, setCommand] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'opening' | 'waiting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const clearPoll = () => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => () => clearPoll(), []);

  const finishLogin = async (payload: VkStatusResponse) => {
    if (!payload.app_session) throw new Error('vk_session_missing');

    storeTelegramAppSessionToken(payload.appSessionToken);
    setState('success');
    setMessage(mode === 'link' ? 'VK подключён.' : 'VK подтверждён. Открываем кабинет...');

    if (mode === 'login') {
      window.setTimeout(() => {
        window.location.assign(redirectTo);
      }, 350);
    } else {
      window.setTimeout(() => {
        window.location.assign(redirectTo || '/dashboard/profile');
      }, 650);
    }
  };

  const pollStatus = async (nextToken: string) => {
    const response = await fetch(`/api/auth/vk/status?token=${encodeURIComponent(nextToken)}`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const payload = await readJsonSafe<VkStatusResponse>(response);

    if (!response.ok || payload.status === 'error') {
      throw new Error(humanVkError(payload.error || 'vk_status_failed'));
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
        ? 'Ссылка устарела. Нажмите кнопку ещё раз.'
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
    setVkUrl(null);
    setPrefillUrl(null);
    setCommand(null);
    setCopiedCommand(false);

    try {
      const url = new URL('/api/auth/vk/start', window.location.origin);
      url.searchParams.set('next', redirectTo);
      url.searchParams.set('mode', mode);

      const response = await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });

      const payload = await readJsonSafe<VkStartResponse>(response);

      if (!response.ok || !payload.token || !payload.vkUrl) {
        throw new Error(humanVkError(payload.error || 'vk_start_failed'));
      }

      setToken(payload.token);
      setVkUrl(payload.vkUrl);
      setPrefillUrl(payload.prefillUrl ?? null);
      setCommand(payload.command ?? `auth_${payload.token}`);
      setState('waiting');
      setMessage('Открыл VK-диалог. Код входа уже зашит в ссылку. Просто отправьте любое сообщение, например «Начать». Если VK не передаст код, ниже есть запасная кнопка с готовым текстом.');
      startedAtRef.current = Date.now();

      window.open(payload.vkUrl, '_blank', 'noopener,noreferrer');

      pollTimerRef.current = window.setInterval(() => {
        void pollStatus(payload.token as string).catch((error) => {
          clearPoll();
          setState('error');
          setMessage(error instanceof Error ? error.message : 'Не удалось проверить VK-вход.');
        });
      }, 1600);

      window.setTimeout(() => {
        void pollStatus(payload.token as string).catch(() => {});
      }, 800);
    } catch (error) {
      clearPoll();
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Не удалось начать вход через VK.');
    }
  };

  const copyCommand = async () => {
    if (!command) return;

    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(true);
      window.setTimeout(() => setCopiedCommand(false), 1400);
    } catch {
      setCopiedCommand(false);
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
          'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[11px] border px-4 text-[13px] font-semibold shadow-none transition-[background,border-color,color,opacity,transform] duration-150 active:scale-[0.99] disabled:pointer-events-none',
          success
            ? 'border-emerald-500/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-100'
            : failed
              ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-100'
              : 'border-[#2787f5]/35 bg-[#2787f5] text-white hover:bg-[#1f78dc]',
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
          <MessageCircleMore className="size-4" />
        )}

        {success
          ? 'VK подтверждён'
          : failed
            ? 'Повторить вход через VK'
            : loading
              ? 'Ждём подтверждение в VK'
              : mode === 'link'
                ? 'Подключить VK'
                : 'Войти через VK'}
      </button>

      {message ? (
        <div
          className={cn(
            'rounded-[10px] border px-3 py-2 text-[11px] leading-4',
            failed
              ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-100'
              : success
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100'
                : 'border-black/[0.08] bg-white/58 text-black/48 dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white/46',
          )}
        >
          {message}
        </div>
      ) : null}

      {vkUrl && state === 'waiting' ? (
        <div className="grid gap-2 rounded-[11px] border border-black/[0.08] bg-white/50 p-2 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <a
            href={vkUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-[9px] border border-black/[0.08] bg-white text-[11px] font-semibold text-black/56 transition hover:bg-black/[0.035] hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/56 dark:hover:bg-white/[0.07] dark:hover:text-white"
          >
            <ExternalLink className="size-3.5" />
            Открыть VK-диалог
          </a>

          {prefillUrl ? (
            <a
              href={prefillUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center justify-center gap-2 rounded-[9px] border border-black/[0.08] bg-white text-[11px] font-semibold text-black/56 transition hover:bg-black/[0.035] hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/56 dark:hover:bg-white/[0.07] dark:hover:text-white"
            >
              <MessageCircleMore className="size-3.5" />
              Запасной вариант с текстом
            </a>
          ) : null}

          {command ? (
            <button
              type="button"
              onClick={copyCommand}
              className="inline-flex min-h-8 items-center justify-center gap-2 rounded-[9px] border border-black/[0.08] bg-white px-2 text-[10.5px] font-semibold text-black/50 transition hover:bg-black/[0.035] hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/50 dark:hover:bg-white/[0.07] dark:hover:text-white"
            >
              {copiedCommand ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copiedCommand ? 'Код скопирован' : 'Скопировать код вручную'}
            </button>
          ) : null}
        </div>
      ) : null}

      {token && state === 'waiting' ? (
        <div className="text-center text-[10.5px] text-black/34 dark:text-white/30">
          Вход активен 10 минут. Уведомления и подтверждения будут приходить от сообщества ClickBook.
        </div>
      ) : null}
    </div>
  );
}
