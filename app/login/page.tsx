'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  Chrome,
  Globe2,
  Loader2,
  MessageCircleMore,
  Send,
  ShieldCheck,
  Sparkles,
  Users2,
  X,
  type LucideIcon,
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
type AuthChannel = 'telegram' | 'vk' | 'google';

const authChannels: Array<{
  id: AuthChannel;
  title: string;
  label: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
}> = [
  {
    id: 'telegram',
    title: 'Telegram',
    label: 'Mini App + бот',
    description: 'Быстрый вход, уведомления и возврат в кабинет.',
    longDescription:
      'Подходит для основного сценария: вход, подтверждения записей, переносы, напоминания и быстрые действия остаются в одном Telegram-канале.',
    icon: Send,
  },
  {
    id: 'vk',
    title: 'VK',
    label: 'Бот сообщества',
    description: 'Вход через VK и рабочие уведомления клиентам.',
    longDescription:
      'VK откроется в этой же вкладке, а бот вернёт вас обратно в кабинет. Удобно для мастеров, которые работают через группу или личную аудиторию во ВКонтакте.',
    icon: MessageCircleMore,
  },
  {
    id: 'google',
    title: 'Google',
    label: 'Резервный вход',
    description: 'Запасной способ, если мессенджеры недоступны.',
    longDescription:
      'Google нужен как спокойный резерв: если Telegram или VK временно недоступны, кабинет можно открыть через обычный OAuth-вход.',
    icon: Chrome,
  },
];

function MicroLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40 dark:text-white/36',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        'rounded-[22px] border border-black/[0.08] bg-[#fbfbfa]/88 text-[#0e0e0e] shadow-[0_34px_110px_rgba(15,15,15,0.10)] backdrop-blur-[24px] dark:border-white/[0.09] dark:bg-[#101010]/88 dark:text-white dark:shadow-[0_40px_120px_rgba(0,0,0,0.58)]',
        className,
      )}
    >
      {children}
    </section>
  );
}

function SoftPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-black/[0.075] bg-black/[0.025] dark:border-white/[0.08] dark:bg-white/[0.035]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function SetupMissingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f4f2] px-4 py-8 text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
      <Surface className="w-full max-w-[560px] overflow-hidden">
        <div className="border-b border-black/[0.08] p-5 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-[112px] shrink-0" />
            <div className="min-w-0">
              <MicroLabel>Setup</MicroLabel>
              <div className="mt-1 text-[20px] font-semibold tracking-[-0.055em]">
                Авторизация не настроена
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <SoftPanel className="p-4">
            <div className="text-[27px] font-semibold leading-[1.02] tracking-[-0.075em]">
              Подключите Supabase, Telegram и VK
            </div>
            <p className="mt-3 text-[12.5px] leading-5 text-black/52 dark:text-white/46">
              Добавьте переменные в Vercel Production и сделайте Redeploy without cache.
            </p>
            <div className="mt-4 rounded-[12px] border border-black/[0.08] bg-[#fbfbfa]/72 p-3 font-mono text-[10.5px] leading-5 text-black/54 dark:border-white/[0.08] dark:bg-[#101010]/72 dark:text-white/50">
              <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
              <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
              <div>TELEGRAM_BOT_TOKEN=...</div>
              <div>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...</div>
              <div>VK_BOT_GROUP_ID=...</div>
              <div>VK_BOT_ACCESS_TOKEN=...</div>
            </div>
            <Button asChild className="mt-4 h-10 rounded-[11px] cb-neutral-primary">
              <Link href="/about">
                О платформе
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </SoftPanel>
        </div>
      </Surface>
    </main>
  );
}

function AuthChannelCard({
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
        'group relative w-full overflow-hidden rounded-[16px] border p-4 text-left transition duration-300 active:scale-[0.99]',
        active
          ? 'border-black/[0.16] bg-[#fbfbfa] shadow-[0_18px_55px_rgba(15,15,15,0.10)] dark:border-white/[0.16] dark:bg-white/[0.07] dark:shadow-[0_22px_70px_rgba(0,0,0,0.36)]'
          : 'border-black/[0.075] bg-black/[0.022] hover:border-black/[0.13] hover:bg-black/[0.035] dark:border-white/[0.075] dark:bg-white/[0.032] dark:hover:border-white/[0.13] dark:hover:bg-white/[0.052]',
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute inset-x-4 top-0 h-px opacity-0 transition group-hover:opacity-100',
          active && 'opacity-100',
        )}
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
        }}
      />

      <span className="flex items-start justify-between gap-4">
        <span className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-[13px] border transition',
              active
                ? 'border-black/[0.12] bg-black text-white dark:border-white/[0.14] dark:bg-white dark:text-black'
                : 'border-black/[0.08] bg-[#fbfbfa] text-black/52 group-hover:text-black dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/48 dark:group-hover:text-white',
            )}
          >
            <Icon className="size-4" />
          </span>

          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold tracking-[-0.035em] text-black/82 dark:text-white/82">
                {channel.title}
              </span>
              <span className="rounded-full border border-black/[0.07] bg-white/58 px-2 py-0.5 text-[10px] font-semibold text-black/38 dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white/35">
                {channel.label}
              </span>
            </span>
            <span className="mt-1.5 block text-[12px] leading-5 text-black/48 dark:text-white/40">
              {channel.description}
            </span>
          </span>
        </span>

        <span
          className={cn(
            'mt-1 grid size-7 shrink-0 place-items-center rounded-[10px] border transition',
            active
              ? 'border-black/[0.1] bg-black text-white dark:border-white/[0.1] dark:bg-white dark:text-black'
              : 'border-black/[0.07] bg-white/54 text-black/32 group-hover:text-black/58 dark:border-white/[0.075] dark:bg-white/[0.04] dark:text-white/28 dark:group-hover:text-white/58',
          )}
        >
          <ChevronRight className="size-3.5" />
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
      className="group flex min-h-[54px] w-full items-center justify-between gap-3 rounded-[13px] border border-black/[0.08] bg-[#fbfbfa]/70 px-3 text-left transition hover:border-black/[0.13] hover:bg-white active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 dark:border-white/[0.08] dark:bg-[#101010]/72 dark:hover:border-white/[0.13] dark:hover:bg-white/[0.06]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[12px] border border-black/[0.08] bg-black/[0.025] text-black/48 transition group-hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/44 dark:group-hover:text-white">
          {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold tracking-[-0.005em] text-black/72 dark:text-white/72">
            {label}
          </span>
          <span className="block truncate text-[11px] text-black/40 dark:text-white/36">
            {hint}
          </span>
        </span>
      </span>

      <ArrowRight className="size-3.5 shrink-0 text-black/28 transition group-hover:translate-x-0.5 group-hover:text-black/56 dark:text-white/28 dark:group-hover:text-white/56" />
    </button>
  );
}

function LoginPreviewCard({ selectedChannel }: { selectedChannel: AuthChannel | null }) {
  const steps = [
    {
      icon: selectedChannel === 'vk' ? MessageCircleMore : selectedChannel === 'google' ? Chrome : Send,
      title: selectedChannel === 'vk' ? 'VK' : selectedChannel === 'google' ? 'Google' : 'Telegram',
      text:
        selectedChannel === 'vk'
          ? 'Бот сообщества'
          : selectedChannel === 'google'
            ? 'Резервный OAuth'
            : 'Mini App и бот',
    },
    {
      icon: Users2,
      title: 'Клиенты',
      text: 'Единая база',
    },
    {
      icon: Bell,
      title: 'Уведомления',
      text: 'Записи и переносы',
    },
  ];

  return (
    <SoftPanel className="relative overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_260px_at_40%_0%,rgba(0,0,0,0.06),transparent_62%)] dark:bg-[radial-gradient(520px_260px_at_40%_0%,rgba(255,255,255,0.07),transparent_62%)]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <MicroLabel>После входа</MicroLabel>
          <span className="rounded-full border border-black/[0.07] bg-white/58 px-2 py-1 text-[10px] font-semibold text-black/40 dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white/36">
            /dashboard
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={`${step.title}-${selectedChannel ?? 'idle'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.045, duration: 0.22 }}
                className="flex items-center gap-3 rounded-[13px] border border-black/[0.07] bg-[#fbfbfa]/72 p-3 dark:border-white/[0.075] dark:bg-[#101010]/72"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[12px] border border-black/[0.08] bg-black/[0.025] text-black/48 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/45">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-semibold text-black/74 dark:text-white/72">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-black/40 dark:text-white/34">
                    {step.text}
                  </span>
                </span>
                {index === 0 ? <CheckCircle2 className="size-4 text-black/42 dark:text-white/38" /> : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </SoftPanel>
  );
}

function AuthDrawer({
  activeChannel,
  redirectTo,
  botUrl,
  loadingProvider,
  startOAuth,
  onClose,
}: {
  activeChannel: AuthChannel | null;
  redirectTo: string;
  botUrl: string | null;
  loadingProvider: OAuthProvider | null;
  startOAuth: (provider: OAuthProvider) => void;
  onClose: () => void;
}) {
  const channel = authChannels.find((item) => item.id === activeChannel) ?? null;

  return (
    <AnimatePresence mode="wait">
      {channel ? (
        <motion.div
          key={channel.id}
          initial={{ opacity: 0, x: 34, filter: 'blur(8px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 22, filter: 'blur(6px)' }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          <Surface className="relative h-full overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-70" />
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[15px] border border-black/[0.08] bg-black text-white dark:border-white/[0.1] dark:bg-white dark:text-black">
                    <channel.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <MicroLabel>Выбранный канал</MicroLabel>
                    <div className="mt-1 text-[28px] font-semibold leading-[1] tracking-[-0.075em]">
                      {channel.title}
                    </div>
                    <p className="mt-2 max-w-[430px] text-[12.5px] leading-5 text-black/50 dark:text-white/42">
                      {channel.longDescription}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-9 shrink-0 place-items-center rounded-[11px] border border-black/[0.08] bg-white/58 text-black/42 transition hover:bg-white hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/38 dark:hover:bg-white/[0.07] dark:hover:text-white"
                  aria-label="Закрыть"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-5">
                {channel.id === 'telegram' ? (
                  <div className="grid gap-3">
                    {botUrl ? (
                      <a
                        href={botUrl}
                        className="group relative inline-flex min-h-12 w-full items-center justify-center overflow-hidden rounded-[13px] border border-black/[0.08] bg-black px-4 text-[13px] font-semibold text-white transition active:scale-[0.99] dark:border-white/[0.1] dark:bg-white dark:text-black"
                      >
                        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_160px_at_20%_0%,rgba(255,255,255,0.28),transparent_54%)] opacity-80 dark:bg-[radial-gradient(520px_160px_at_20%_0%,rgba(0,0,0,0.16),transparent_54%)]" />
                        <span className="relative z-10 inline-flex items-center gap-2">
                          <Send className="size-4" />
                          Открыть Telegram Mini App
                          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                        </span>
                      </a>
                    ) : null}

                    <TelegramLoginButton redirectTo={redirectTo} />

                    <SoftPanel className="p-3">
                      <div className="text-[12px] font-semibold text-black/70 dark:text-white/68">
                        Что произойдёт после входа
                      </div>
                      <div className="mt-1.5 text-[11.5px] leading-5 text-black/44 dark:text-white/38">
                        Кабинет откроется в Telegram-сценарии, а уведомления по записям и переносам будут возвращать мастера обратно в рабочий экран.
                      </div>
                    </SoftPanel>
                  </div>
                ) : null}

                {channel.id === 'vk' ? (
                  <div className="grid gap-3">
                    <VkLoginButton redirectTo={redirectTo} />

                    <SoftPanel className="p-3">
                      <div className="text-[12px] font-semibold text-black/70 dark:text-white/68">
                        Как работает VK-вход
                      </div>
                      <div className="mt-1.5 text-[11.5px] leading-5 text-black/44 dark:text-white/38">
                        VK откроется в этой же вкладке. После подтверждения бот вернёт вас в кабинет, а аккаунт можно будет использовать как рабочий канал связи.
                      </div>
                    </SoftPanel>
                  </div>
                ) : null}

                {channel.id === 'google' ? (
                  <div className="grid gap-3">
                    <ProviderButton
                      icon={<Chrome className="size-4" />}
                      label="Войти через Google"
                      hint="резервный вход через OAuth"
                      loading={loadingProvider === 'google'}
                      onClick={() => startOAuth('google')}
                    />

                    <SoftPanel className="p-3">
                      <div className="text-[12px] font-semibold text-black/70 dark:text-white/68">
                        Резервный доступ
                      </div>
                      <div className="mt-1.5 text-[11.5px] leading-5 text-black/44 dark:text-white/38">
                        Используйте Google, если мессенджеры временно недоступны. Основные рабочие сценарии лучше вести через Telegram или VK.
                      </div>
                    </SoftPanel>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  ['Кабинет', 'после входа'],
                  ['Клиенты', 'единая база'],
                  ['Уведомления', 'боты и web'],
                ].map(([title, hint]) => (
                  <SoftPanel key={title} className="p-3">
                    <div className="text-[13px] font-semibold tracking-[-0.035em] text-black/72 dark:text-white/70">
                      {title}
                    </div>
                    <div className="mt-1 text-[10.5px] text-black/38 dark:text-white/32">
                      {hint}
                    </div>
                  </SoftPanel>
                ))}
              </div>
            </div>
          </Surface>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.24 }}
          className="h-full"
        >
          <Surface className="flex h-full min-h-[430px] items-center justify-center overflow-hidden p-5">
            <div className="max-w-[360px] text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-[18px] border border-black/[0.08] bg-black/[0.025] text-black/48 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/44">
                <Sparkles className="size-5" />
              </div>
              <div className="mt-5 text-[31px] font-semibold leading-[0.98] tracking-[-0.075em]">
                Выберите канал входа
              </div>
              <p className="mt-3 text-[12.5px] leading-5 text-black/46 dark:text-white/40">
                Нажмите Telegram, VK или Google — справа откроется отдельная авторизация под выбранный сценарий.
              </p>
            </div>
          </Surface>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LoginPage() {
  const searchParams = useBrowserSearchParams();

  useEffect(() => {
    clearTelegramAppSessionToken();
  }, []);

  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<AuthChannel | null>(null);

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
    return <SetupMissingScreen />;
  }

  const selectedChannel = authChannels.find((channel) => channel.id === activeChannel) ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f4f2] px-4 py-4 text-[#0e0e0e] dark:bg-[#090909] dark:text-white sm:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-black/[0.035] blur-3xl dark:bg-white/[0.045]" />
        <div className="absolute bottom-[-280px] right-[-180px] h-[520px] w-[520px] rounded-full bg-black/[0.035] blur-3xl dark:bg-white/[0.035]" />
        <div className="absolute inset-0 opacity-[0.45] dark:opacity-[0.25]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:38px_38px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-32px)] w-full max-w-[1180px] grid-rows-[auto_1fr_auto] gap-4 sm:min-h-[calc(100vh-48px)]">
        <header className="flex items-center justify-between gap-4 rounded-[18px] border border-black/[0.07] bg-[#fbfbfa]/58 px-4 py-3 backdrop-blur-[22px] dark:border-white/[0.08] dark:bg-[#101010]/58">
          <Link href="/about" className="flex min-w-0 items-center gap-3">
            <BrandLogo className="w-[116px] shrink-0 sm:w-[132px]" />
            <span className="hidden text-[11px] font-medium text-black/38 dark:text-white/34 sm:block">
              платформа для мастера
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/about"
              className="hidden h-9 items-center justify-center rounded-[11px] border border-black/[0.08] bg-white/50 px-3 text-[11px] font-semibold text-black/50 transition hover:bg-white hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/44 dark:hover:bg-white/[0.07] dark:hover:text-white sm:inline-flex"
            >
              О платформе
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-[11px] border border-black/[0.08] bg-white/50 px-3 text-[11px] font-semibold text-black/50 transition hover:bg-white hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/44 dark:hover:bg-white/[0.07] dark:hover:text-white"
            >
              /dashboard
            </Link>
          </div>
        </header>

        <section className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
          <Surface className="relative overflow-hidden p-4 sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-black/[0.035] blur-3xl dark:bg-white/[0.055]" />

            <div className="relative z-10 flex h-full min-h-[560px] flex-col">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <MicroLabel>ClickBook Auth Hub</MicroLabel>
                  <h1 className="mt-4 max-w-[720px] text-[46px] font-semibold leading-[0.92] tracking-[-0.09em] text-black dark:text-white sm:text-[64px] xl:text-[74px]">
                    Вход без лишних экранов.
                  </h1>
                  <p className="mt-5 max-w-[620px] text-[13.5px] leading-7 text-black/52 dark:text-white/44 sm:text-[14px]">
                    Выберите канал — и авторизация аккуратно выедет рядом. Telegram и VK работают как полноценные рабочие каналы, Google остаётся резервным способом входа.
                  </p>
                </div>

                <div className="rounded-[13px] border border-black/[0.08] bg-black/[0.025] px-3 py-2 text-[11px] font-semibold text-black/42 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/36">
                  {selectedChannel ? selectedChannel.label : 'Выберите канал'}
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                {authChannels.map((channel) => (
                  <AuthChannelCard
                    key={channel.id}
                    channel={channel}
                    active={activeChannel === channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                  />
                ))}
              </div>

              <div className="mt-auto pt-6">
                <LoginPreviewCard selectedChannel={activeChannel} />
              </div>
            </div>
          </Surface>

          <div className="min-h-[430px] lg:sticky lg:top-6 lg:h-[calc(100vh-120px)] lg:min-h-0">
            <AuthDrawer
              activeChannel={activeChannel}
              redirectTo={redirectTo}
              botUrl={botUrl}
              loadingProvider={loadingProvider}
              startOAuth={startOAuth}
              onClose={() => setActiveChannel(null)}
            />
          </div>
        </section>

        {(oauthError || incomingError) ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[14px] border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-[11.5px] leading-5 text-red-600 dark:text-red-300"
          >
            {oauthError || incomingError}
          </motion.div>
        ) : (
          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-black/[0.06] bg-[#fbfbfa]/42 px-4 py-3 text-[11px] text-black/36 backdrop-blur-[18px] dark:border-white/[0.07] dark:bg-[#101010]/42 dark:text-white/32">
            <span>После входа: {redirectTo}</span>
            <span>КликБук / ClickBook</span>
          </footer>
        )}
      </div>
    </main>
  );
}
