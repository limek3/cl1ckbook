'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { ArrowRight, Chrome, MessageCircleMore, Send, ShieldCheck } from 'lucide-react';

import { TelegramLoginButton } from '@/components/auth/telegram-login-button';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
import { cn } from '@/lib/utils';

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

function MicroLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/42 dark:text-white/38">
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

function DisabledAuthOption({
  icon,
  label,
  hint,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      disabled
      className="flex min-h-[54px] items-center justify-between gap-3 rounded-[12px] border border-black/[0.07] bg-white/46 px-3 text-left opacity-65 dark:border-white/[0.07] dark:bg-white/[0.035]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-black/[0.07] bg-black/[0.025] text-black/40 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/40">
          {icon}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold text-black/54 dark:text-white/52">
            {label}
          </span>
          <span className="block truncate text-[10.5px] text-black/34 dark:text-white/32">
            {hint}
          </span>
        </span>
      </span>

      <span className="rounded-[8px] border border-black/[0.07] bg-black/[0.025] px-2 py-1 text-[10px] font-semibold text-black/34 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/32">
        скоро
      </span>
    </button>
  );
}

export default function LoginPage() {
  const searchParams = useBrowserSearchParams();
  const redirectTo = useMemo(
    () => searchParams.get('redirectTo') || '/dashboard',
    [searchParams],
  );

  if (!authConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f4f2] px-4 py-8 text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
        <ShellCard className="w-full max-w-[480px]">
          <div className="border-b border-black/[0.08] p-5 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <BrandLogo className="w-[74px] shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold tracking-[-0.02em]">
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
              <div className="mt-3 text-[25px] font-semibold leading-[1.02] tracking-[-0.065em]">
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

      <ShellCard className="relative z-10 w-full max-w-[440px]">
        <div className="border-b border-black/[0.08] px-5 py-4 dark:border-white/[0.08]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="w-[72px] shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold tracking-[-0.02em]">
                  Кабинет мастера
                </div>
                <div className="mt-0.5 text-[11px] text-black/42 dark:text-white/38">
                  Вход через Telegram
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
            <h1 className="mt-2 text-[30px] font-semibold leading-[0.98] tracking-[-0.075em] sm:text-[34px]">
              Войти в ClickBook
            </h1>
            <p className="mt-3 text-[12.5px] leading-5 text-black/52 dark:text-white/48">
              Нажмите кнопку, откройте бота и подтвердите вход. Аккаунт создастся автоматически.
            </p>
          </div>

          <Panel className="p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold text-black/72 dark:text-white/72">
                  Telegram
                </div>
                <div className="mt-0.5 text-[10.5px] text-black/38 dark:text-white/35">
                  основной способ входа
                </div>
              </div>
              <Send className="size-4 text-black/32 dark:text-white/30" />
            </div>

            <TelegramLoginButton redirectTo={redirectTo} />
          </Panel>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <DisabledAuthOption
              icon={<Chrome className="size-3.5" />}
              label="Google"
              hint="OAuth позже"
            />
            <DisabledAuthOption
              icon={<MessageCircleMore className="size-3.5" />}
              label="MAX"
              hint="Интеграция позже"
            />
          </div>

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
