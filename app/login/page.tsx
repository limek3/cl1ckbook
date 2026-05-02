'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Bell,
  Bot,
  Chrome,
  Loader2,
  MessageCircleMore,
  Send,
  ShieldCheck,
  Sparkles,
  Users2,
} from 'lucide-react';

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

function ChannelCard({
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <Panel className="p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-[11px] border border-black/[0.08] bg-black/[0.025] text-black/54 dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white/58">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold tracking-[-0.015em] text-black/76 dark:text-white/76">
              {title}
            </div>
            <div className="mt-0.5 text-[10.5px] leading-4 text-black/40 dark:text-white/36">
              {subtitle}
            </div>
          </div>
        </div>
        <span className="shrink-0 rounded-[8px] border border-black/[0.07] bg-white/58 px-2 py-1 text-[10px] font-semibold text-black/42 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/38">
          {badge}
        </span>
      </div>
      {children}
    </Panel>
  );
}

function FeatureLine({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-[12px] border border-black/[0.07] bg-white/42 p-3 dark:border-white/[0.07] dark:bg-white/[0.035]">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[9px] border border-black/[0.07] bg-black/[0.025] text-black/46 dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white/46">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-black/72 dark:text-white/72">{title}</div>
        <div className="mt-1 text-[11px] leading-4 text-black/44 dark:text-white/40">{text}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const searchParams = useBrowserSearchParams();

  useEffect(() => {
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
    if (error === 'vk_not_configured') return 'VK-вход не настроен. Проверьте VK_BOT_GROUP_ID и VK_BOT_ACCESS_TOKEN в Vercel.';
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
                Подключите Supabase, Telegram и VK
              </div>
              <p className="mt-3 text-[12.5px] leading-5 text-black/52 dark:text-white/48">
                Добавьте переменные в Vercel Production и сделайте Redeploy without cache.
              </p>
              <div className="mt-4 rounded-[11px] border border-black/[0.08] bg-[#fbfbfa]/72 p-3 font-mono text-[10.5px] leading-5 text-black/54 dark:border-white/[0.08] dark:bg-[#101010]/72 dark:text-white/50">
                <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
                <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
                <div>TELEGRAM_BOT_TOKEN=...</div>
                <div>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...</div>
                <div>VK_BOT_GROUP_ID=...</div>
                <div>VK_BOT_ACCESS_TOKEN=...</div>
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
    <main className="relative min-h-screen overflow-hidden bg-[#f4f4f2] px-4 py-6 text-[#0e0e0e] dark:bg-[#090909] dark:text-white sm:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-[-240px] mx-auto h-[520px] max-w-[900px] rounded-full bg-black/[0.035] blur-3xl dark:bg-white/[0.045]" />
      <div className="pointer-events-none absolute bottom-[-260px] right-[-180px] h-[520px] w-[520px] rounded-full bg-black/[0.025] blur-3xl dark:bg-white/[0.035]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1060px] items-center">
        <ShellCard className="grid w-full lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-black/[0.08] p-5 dark:border-white/[0.08] lg:border-b-0 lg:border-r lg:p-6">
            <div className="flex items-center justify-between gap-4">
              <BrandLogo className="w-[78px] shrink-0" />
              <span className="rounded-[9px] border border-black/[0.08] bg-white/56 px-2.5 py-1.5 text-[10.5px] font-semibold text-black/42 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/38">
                КликБук Auth
              </span>
            </div>

            <div className="mt-9">
              <MicroLabel>Единый вход</MicroLabel>
              <h1 className="mt-3 max-w-[420px] text-[42px] font-semibold leading-[0.92] tracking-[-0.075em] sm:text-[54px]">
                Вход через бота, без лишних окон
              </h1>
              <p className="mt-5 max-w-[420px] text-[13px] leading-5 text-black/52 dark:text-white/46">
                Telegram и VK работают как рабочие каналы КликБук: вход, подтверждения, уведомления и быстрые действия по записям.
              </p>
            </div>

            <div className="mt-6 grid gap-2">
              <FeatureLine
                icon={<ShieldCheck className="size-3.5" />}
                title="Без ручных кодов"
                text="В VK достаточно нажать кнопку в боте. Кабинет откроется в этой же вкладке."
              />
              <FeatureLine
                icon={<Bell className="size-3.5" />}
                title="Уведомления там же"
                text="Новые записи, переносы и важные события приходят в Telegram или VK."
              />
              <FeatureLine
                icon={<Users2 className="size-3.5" />}
                title="Для мастеров и студий"
                text="Один вход для кабинета, публичного профиля, клиентов и аналитики."
              />
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <MicroLabel>Вход и регистрация</MicroLabel>
                <h2 className="mt-2 text-[28px] font-semibold leading-[0.98] tracking-[-0.06em] sm:text-[34px]">
                  Выберите канал
                </h2>
                <p className="mt-2 max-w-[520px] text-[12.5px] leading-5 text-black/50 dark:text-white/44">
                  VK откроется в этой же вкладке. После кнопки «Открыть кабинет» бот вернёт вас обратно в КликБук.
                </p>
              </div>
              <Sparkles className="mt-1 size-4 shrink-0 text-black/28 dark:text-white/26" />
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <ChannelCard
                icon={<Send className="size-4" />}
                title="Telegram"
                subtitle="Mini App и веб-вход через бота"
                badge="Bot"
              >
                {botUrl ? (
                  <a
                    href={botUrl}
                    className="mb-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[11px] border border-[#2692d8] bg-[#2ea6ff] px-4 text-[12.5px] font-semibold text-white transition hover:bg-[#2299f0] active:scale-[0.99]"
                  >
                    <Send className="size-4" />
                    Открыть Telegram Mini App
                  </a>
                ) : null}
                <TelegramLoginButton redirectTo={redirectTo} />
              </ChannelCard>

              <ChannelCard
                icon={<MessageCircleMore className="size-4" />}
                title="VK"
                subtitle="бот сообщества с меню и уведомлениями"
                badge="Bot"
              >
                <VkLoginButton redirectTo={redirectTo} />
              </ChannelCard>
            </div>

            <Panel className="mt-3 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[12px] font-semibold text-black/72 dark:text-white/72">
                    Остальные способы
                  </div>
                  <div className="mt-0.5 text-[10.5px] text-black/38 dark:text-white/35">
                    запасной вход, если мессенджеры недоступны
                  </div>
                </div>
                <Bot className="size-4 text-black/30 dark:text-white/28" />
              </div>

              <ProviderButton
                icon={<Chrome className="size-3.5" />}
                label="Google"
                hint="войти через Google"
                loading={loadingProvider === 'google'}
                onClick={() => startOAuth('google')}
              />
            </Panel>

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
      </div>
    </main>
  );
}
