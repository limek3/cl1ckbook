'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Chrome,
  Loader2,
  MessageCircleMore,
  Send,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import { TelegramLoginButton } from '@/components/auth/telegram-login-button';
import { VkLoginButton } from '@/components/auth/vk-login-button';
import { BrandLogo } from '@/components/brand/brand-logo';
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
type AuthChannel = 'telegram' | 'vk' | 'google';

const authChannels: Array<{
  id: AuthChannel;
  title: string;
  helper: string;
  icon: LucideIcon;
}> = [
  {
    id: 'telegram',
    title: 'Telegram',
    helper: 'Mini App и бот',
    icon: Send,
  },
  {
    id: 'vk',
    title: 'VK',
    helper: 'Вход через бота',
    icon: MessageCircleMore,
  },
  {
    id: 'google',
    title: 'Google',
    helper: 'Резервный вход',
    icon: Chrome,
  },
];

function MicroLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'text-[10px] font-semibold uppercase tracking-[0.16em] text-black/38 dark:text-white/34',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Surface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-[18px] border border-black/[0.08] bg-[#fbfbfa] text-[#0e0e0e] shadow-none dark:border-white/[0.09] dark:bg-[#101010] dark:text-white',
        className,
      )}
    >
      {children}
    </section>
  );
}

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-black/[0.075] bg-black/[0.025] dark:border-white/[0.08] dark:bg-white/[0.035]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function AuthMethodTab({
  channel,
  active,
  onClick,
}: {
  channel: (typeof authChannels)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = channel.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[10px] px-2.5 py-2 text-left transition active:scale-[0.985]',
        active
          ? 'bg-[#fbfbfa] text-black shadow-[0_8px_24px_rgba(15,15,15,0.055)] dark:bg-white/[0.08] dark:text-white dark:shadow-none'
          : 'text-black/42 hover:bg-black/[0.025] hover:text-black/68 dark:text-white/34 dark:hover:bg-white/[0.045] dark:hover:text-white/68',
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-[11.5px] font-semibold leading-4">
          {channel.title}
        </span>
      </span>
    </button>
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
      className="group flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[12px] border border-black/[0.08] bg-[#fbfbfa] px-3 text-left transition hover:border-black/[0.14] hover:bg-white active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 dark:border-white/[0.08] dark:bg-[#101010] dark:hover:border-white/[0.15] dark:hover:bg-white/[0.055]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-black/[0.08] bg-black/[0.025] text-black/48 transition group-hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/44 dark:group-hover:text-white">
          {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold tracking-[-0.01em] text-black/74 dark:text-white/74">
            {label}
          </span>
          <span className="block truncate text-[11px] text-black/40 dark:text-white/36">
            {hint}
          </span>
        </span>
      </span>

      <ArrowRight className="size-3.5 shrink-0 text-black/28 transition group-hover:translate-x-0.5 group-hover:text-black/56 dark:text-white/26 dark:group-hover:text-white/56" />
    </button>
  );
}

function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[12px] border border-red-500/15 bg-red-500/[0.055] px-3 py-2.5 text-[11.5px] leading-5 text-red-600 dark:text-red-300"
    >
      {children}
    </motion.div>
  );
}

function SetupMissingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f4f2] px-4 py-8 text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
      <Surface className="w-full max-w-[430px] overflow-hidden">
        <div className="border-b border-black/[0.08] p-5 dark:border-white/[0.08]">
          <BrandLogo className="w-[118px]" />
          <div className="mt-5">
            <MicroLabel>Setup</MicroLabel>
            <h1 className="mt-2 text-[28px] font-semibold leading-[0.98] tracking-[-0.075em]">
              Авторизация не настроена
            </h1>
            <p className="mt-3 text-[12.5px] leading-5 text-black/48 dark:text-white/42">
              Добавьте переменные окружения в Vercel и сделайте redeploy without cache.
            </p>
          </div>
        </div>

        <div className="p-5">
          <Panel className="p-3">
            <div className="grid gap-1.5 font-mono text-[10.5px] leading-5 text-black/50 dark:text-white/44">
              <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
              <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
              <div>TELEGRAM_BOT_TOKEN=...</div>
              <div>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...</div>
              <div>VK_BOT_GROUP_ID=...</div>
              <div>VK_BOT_ACCESS_TOKEN=...</div>
            </div>
          </Panel>
        </div>
      </Surface>
    </main>
  );
}

function TelegramAuthContent({
  redirectTo,
  botUrl,
}: {
  redirectTo: string;
  botUrl: string | null;
}) {
  return (
    <div className="grid gap-3">
      {botUrl ? (
        <a
          href={botUrl}
          className="group flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[12px] border border-black/[0.08] bg-black px-3 text-left text-white transition hover:bg-black/88 active:scale-[0.99] dark:border-white/[0.1] dark:bg-white dark:text-black dark:hover:bg-white/88"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-white/15 bg-white/[0.08] text-white dark:border-black/[0.08] dark:bg-black/[0.04] dark:text-black">
              <Send className="size-4" />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-semibold tracking-[-0.01em]">
                Открыть Telegram Mini App
              </span>
              <span className="block truncate text-[11px] text-white/52 dark:text-black/48">
                вход через рабочий бот
              </span>
            </span>
          </span>

          <ArrowRight className="size-3.5 shrink-0 opacity-55 transition group-hover:translate-x-0.5 group-hover:opacity-90" />
        </a>
      ) : null}

      <TelegramLoginButton redirectTo={redirectTo} />
    </div>
  );
}

function VkAuthContent({ redirectTo }: { redirectTo: string }) {
  return (
    <div className="grid gap-3">
      <VkLoginButton redirectTo={redirectTo} />

      <Panel className="p-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-black/36 dark:text-white/34" />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-black/68 dark:text-white/66">
              Вход через VK
            </div>
            <div className="mt-1 text-[11.5px] leading-5 text-black/42 dark:text-white/36">
              После подтверждения аккаунт будет связан с кабинетом.
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function GoogleAuthContent({
  loadingProvider,
  startOAuth,
}: {
  loadingProvider: OAuthProvider | null;
  startOAuth: (provider: OAuthProvider) => void;
}) {
  return (
    <div className="grid gap-3">
      <ProviderButton
        icon={<Chrome className="size-4" />}
        label="Войти через Google"
        hint="резервный способ доступа"
        loading={loadingProvider === 'google'}
        onClick={() => startOAuth('google')}
      />

      <Panel className="p-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-black/36 dark:text-white/34" />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-black/68 dark:text-white/66">
              Резервный вход
            </div>
            <div className="mt-1 text-[11.5px] leading-5 text-black/42 dark:text-white/36">
              Используйте Google, если вход через мессенджеры временно недоступен.
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default function LoginPage() {
  const searchParams = useBrowserSearchParams();

  useEffect(() => {
    clearTelegramAppSessionToken();
  }, []);

  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null,
  );
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<AuthChannel>('telegram');

  const redirectTo = useMemo(
    () => searchParams.get('redirectTo') || '/dashboard',
    [searchParams],
  );

  const incomingError = useMemo(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error');

    if (message) return message;

    if (error === 'vk_not_configured') {
      return 'VK-вход не настроен. Проверьте VK_BOT_GROUP_ID и VK_BOT_ACCESS_TOKEN в Vercel.';
    }

    if (error === 'vk_auth_failed') {
      return 'Не удалось войти через VK. Попробуйте ещё раз.';
    }

    if (error === 'auth_callback_failed') {
      return 'Не удалось завершить вход. Попробуйте ещё раз.';
    }

    return null;
  }, [searchParams]);

  const botUrl = useMemo(() => {
    const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(
      /^@/,
      '',
    ).trim();

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
    return <SetupMissingScreen />;
  }

  const activeChannelData =
    authChannels.find((channel) => channel.id === activeChannel) ??
    authChannels[0];

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f4f2] px-4 py-8 text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
      <div className="w-full max-w-[430px]">
        <Surface className="overflow-hidden">
          <div className="border-b border-black/[0.08] p-5 dark:border-white/[0.08]">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex min-w-0 items-center">
                <BrandLogo className="w-[118px] shrink-0" />
              </Link>

              <div className="rounded-full border border-black/[0.07] bg-black/[0.025] px-2.5 py-1 text-[10px] font-semibold text-black/38 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/34">
                auth
              </div>
            </div>

            <div className="mt-6">
              <MicroLabel>Вход</MicroLabel>
              <h1 className="mt-2 text-[31px] font-semibold leading-[0.96] tracking-[-0.075em]">
                Войти в кабинет
              </h1>
              <p className="mt-3 text-[12.5px] leading-5 text-black/46 dark:text-white/40">
                Выберите удобный способ авторизации.
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-[13px] border border-black/[0.075] bg-black/[0.025] p-1 dark:border-white/[0.08] dark:bg-white/[0.035]">
              <div className="flex gap-1">
                {authChannels.map((channel) => (
                  <AuthMethodTab
                    key={channel.id}
                    channel={channel}
                    active={activeChannel === channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Panel className="overflow-hidden">
                <div className="border-b border-black/[0.07] px-4 py-3 dark:border-white/[0.075]">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-black/[0.08] bg-[#fbfbfa] text-black/48 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/44">
                      <activeChannelData.icon className="size-3.5" />
                    </span>

                    <div className="min-w-0">
                      <div className="text-[12.5px] font-semibold tracking-[-0.01em] text-black/72 dark:text-white/72">
                        {activeChannelData.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-black/38 dark:text-white/34">
                        {activeChannelData.helper}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fbfbfa]/52 p-3 dark:bg-[#101010]/52">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeChannel}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                    >
                      {activeChannel === 'telegram' ? (
                        <TelegramAuthContent
                          redirectTo={redirectTo}
                          botUrl={botUrl}
                        />
                      ) : null}

                      {activeChannel === 'vk' ? (
                        <VkAuthContent redirectTo={redirectTo} />
                      ) : null}

                      {activeChannel === 'google' ? (
                        <GoogleAuthContent
                          loadingProvider={loadingProvider}
                          startOAuth={startOAuth}
                        />
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Panel>
            </div>

            {(oauthError || incomingError) ? (
              <div className="mt-4">
                <ErrorBanner>{oauthError || incomingError}</ErrorBanner>
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-black/34 dark:text-white/30">
              <span>После входа</span>
              <span className="max-w-[220px] truncate text-right">
                {redirectTo}
              </span>
            </div>
          </div>
        </Surface>
      </div>
    </main>
  );
}