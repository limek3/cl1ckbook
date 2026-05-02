'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Chrome, Loader2, Send } from 'lucide-react';

import { TelegramLoginButton } from '@/components/auth/telegram-login-button';
import { VkLoginButton } from '@/components/auth/vk-login-button';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
import { createClient } from '@/lib/supabase/client';
import { clearTelegramAppSessionToken } from '@/lib/telegram-miniapp-auth-client';
import { cn } from '@/lib/utils';

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

type OAuthProvider = 'google';

function MicroLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/42 dark:text-white/38">
      {children}
    </div>
  );
}

function ShellCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[18px] border border-black/[0.08] bg-[#fbfbfa]/88 text-[#0e0e0e] shadow-[0_30px_100px_rgba(15,15,15,0.10)] backdrop-blur-[22px] dark:border-white/[0.09] dark:bg-[#101010]/88 dark:text-white dark:shadow-[0_34px_110px_rgba(0,0,0,0.62)]',
        className,
      )}
    >
      {children}
    </section>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[13px] border border-black/[0.08] bg-white/54 dark:border-white/[0.08] dark:bg-white/[0.04]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function ProviderButton({
  icon,
  label,
  hint,
  onClick,
  loading,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group flex min-h-[54px] items-center justify-between gap-3 rounded-[12px] border border-black/[0.07] bg-white/46 px-3 text-left transition hover:border-black/[0.12] hover:bg-white/78 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 dark:border-white/[0.07] dark:bg-white/[0.035] dark:hover:border-white/[0.13] dark:hover:bg-white/[0.065]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-black/[0.07] bg-black/[0.025] text-black/48 transition group-hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/44 dark:group-hover:text-white">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : icon}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold tracking-[-0.005em] text-black/70 dark:text-white/70">
            {label}
          </span>
          <span className="block truncate text-[10.5px] text-black/38 dark:text-white/34">
            {hint}
          </span>
        </span>
      </span>

      <ArrowRight className="size-3.5 shrink-0 text-black/28 transition group-hover:translate-x-0.5 group-hover:text-black/56 dark:text-white/28 dark:group-hover:text-white/56" />
    </button>
  );
}

export default function LoginPage() {
  const searchParams = useBrowserSearchParams();

  useEffect(() => {
    // When the user intentionally opens /login, drop old local Telegram app
    // tokens so they cannot override a fresh Google/VK/Supabase session.
    clearTelegramAppSessionToken();
  }, []);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const redirectTo = useMemo(
    () => searchParams.get('redirectTo') || '/dashboard',
    [searchParams],
  );


  const incomingError = useMemo(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error');

    if (message) return message;
    if (error === 'vk_not_configured') return 'VK OAuth не настроен. Добавьте VK_ID_CLIENT_ID и VK_ID_CLIENT_SECRET в Vercel.';
    if (error === 'vk_auth_failed') return 'Не удалось войти через VK. Попробуйте ещё раз.';
    if (error === 'auth_callback_failed') return 'Не удалось завершить вход. Попробуйте ещё раз.';
    return null;
  }, [searchParams]);

  const botUrl = useMemo(() => {
    const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim();
    return username ? `https://t.me/${username}?startapp=dashboard` : null;
  }, []);

  const startOAuth = async (provider: OAuthProvider) => {
    try {
      setOauthError(null);
      setLoadingProvider(provider);

      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', redirectTo);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      setLoadingProvider(null);
      setOauthError(
        error instanceof Error
          ? error.message
          : 'Не удалось открыть авторизацию. Проверьте OAuth provider в Supabase.',
      );
    }
  };


  if (!authConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f4f2] px-4 py-8 text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
        <ShellCard className="w-full max-w-[480px]">
          <div className="border-b border-black/[0.08] p-5 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <BrandLogo className="w-[74px] shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold tracking-[-0.005em]">
                  Кабинет мастера
                </div>
                <div className="mt-0.5 text-[11px] text-black/42 dark:text-white/38">
                  Авторизация ещё не настроена
                </div>
              </div>
            </div>
          </div>

          <div className="p-5">
            <Panel className="p-4">
              <MicroLabel>Setup</MicroLabel>
              <div className="mt-3 text-[25px] font-semibold leading-[1.02] tracking-[-0.025em]">
                Подключите Supabase и Telegram
              </div>
              <p className="mt-3 text-[12.5px] leading-5 text-black/52 dark:text-white/48">
                Добавьте переменные в Vercel Production и сделайте Redeploy without cache.
              </p>
              <div className="mt-4 rounded-[11px] border border-black/[0.08] bg-[#fbfbfa]/72 p-3 font-mono text-[10.5px] leading-5 text-black/54 dark:border-white/[0.08] dark:bg-[#101010]/72 dark:text-white/50">
                <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
                <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
                <div>TELEGRAM_BOT_TOKEN=...</div>
                <div>TELEGRAM_WEBHOOK_SECRET=...</div>
                <div>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...</div>
              </div>
              <Button asChild className="mt-4 h-9 rounded-[10px] cb-neutral-primary">
                <Link href="/about">
                  О платформе
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Panel>
          </div>
        </ShellCard>
      </main>
    );
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f4f4f2] px-4 py-8 text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] mx-auto h-[440px] max-w-[720px] rounded-full bg-black/[0.035] blur-3xl dark:bg-white/[0.045]" />
      <div className="pointer-events-none absolute bottom-[-260px] right-[-180px] h-[520px] w-[520px] rounded-full bg-black/[0.025] blur-3xl dark:bg-white/[0.035]" />

      <ShellCard className="relative z-10 w-full max-w-[460px]">
        <div className="border-b border-black/[0.08] px-5 py-4 dark:border-white/[0.08]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="w-[72px] shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold tracking-[-0.005em]">
                  Кабинет мастера
                </div>
                <div className="mt-0.5 text-[11px] text-black/42 dark:text-white/38">
                  Telegram, Google и VK-бот
                </div>
              </div>
            </div>

            <div className="rounded-[9px] border border-black/[0.08] bg-white/56 px-2.5 py-1.5 text-[10.5px] font-semibold text-black/42 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/38">
              Auth
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <MicroLabel>Вход и регистрация</MicroLabel>
            <h1 className="mt-2 text-[30px] font-semibold leading-[0.98] tracking-[-0.035em] sm:text-[34px]">
              Войти в КликБук
            </h1>
            <p className="mt-3 text-[12.5px] leading-5 text-black/52 dark:text-white/48">
              Выберите удобный способ входа. После авторизации кабинет откроется автоматически.
            </p>
          </div>

          <Panel className="p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold text-black/72 dark:text-white/72">
                  Telegram Mini App
                </div>
                <div className="mt-0.5 text-[10.5px] text-black/38 dark:text-white/35">
                  быстрый вход через бота
                </div>
              </div>
              <Send className="size-4 text-black/32 dark:text-white/30" />
            </div>

            {botUrl ? (
              <a
                href={botUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[11px] border border-[#2692d8] bg-[#2ea6ff] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2299f0] active:scale-[0.99]"
              >
                <Send className="size-4" />
                Открыть Mini App в Telegram
              </a>
            ) : null}

            <div className="my-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/30 dark:text-white/28">
                веб-вход
              </span>
              <span className="h-px flex-1 bg-black/[0.08] dark:bg-white/[0.08]" />
            </div>

            <TelegramLoginButton redirectTo={redirectTo} />
          </Panel>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <ProviderButton
              icon={<Chrome className="size-3.5" />}
              label="Google"
              hint="войти через Google"
              loading={loadingProvider === 'google'}
              onClick={() => startOAuth('google')}
            />
            <VkLoginButton redirectTo={redirectTo} />
          </div>

          {(oauthError || incomingError) ? (
            <div className="mt-3 rounded-[11px] border border-red-500/15 bg-red-500/[0.06] px-3 py-2 text-[11px] leading-4 text-red-600 dark:text-red-300">
              {oauthError || incomingError}
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/[0.08] pt-4 text-[11px] text-black/36 dark:border-white/[0.08] dark:text-white/34">
            <span className="truncate">После входа: {redirectTo}</span>
            <Link
              href="/about"
              className="shrink-0 font-semibold text-black/48 transition hover:text-black dark:text-white/44 dark:hover:text-white"
            >
              О платформе
            </Link>
          </div>
        </div>
      </ShellCard>
    </main>
  );
}
