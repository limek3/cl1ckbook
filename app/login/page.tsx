'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { ArrowRight, Chrome, LockKeyhole, MessageCircleMore, Send, ShieldCheck } from 'lucide-react';

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

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-black/[0.08] bg-[#fbfbfa] text-[#0e0e0e] shadow-[0_28px_90px_rgba(15,15,15,0.08)] dark:border-white/[0.08] dark:bg-[#101010] dark:text-white dark:shadow-[0_34px_100px_rgba(0,0,0,0.52)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[11px] border border-black/[0.08] bg-black/[0.025] dark:border-white/[0.08] dark:bg-white/[0.035]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function StatusLine({
  title,
  description,
  right,
}: {
  title: string;
  description: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 rounded-[10px] border border-black/[0.07] bg-[#fbfbfa]/60 px-3 py-2.5 dark:border-white/[0.08] dark:bg-[#101010]/60">
      <div className="min-w-0">
        <div className="truncate text-[12px] font-semibold text-black/78 dark:text-white/78">
          {title}
        </div>
        <div className="mt-0.5 truncate text-[11px] text-black/38 dark:text-white/35">
          {description}
        </div>
      </div>

      {right ? <div className="shrink-0 text-black/34 dark:text-white/32">{right}</div> : null}
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
      className="flex min-h-11 items-center justify-between gap-3 rounded-[10px] border border-black/[0.07] bg-white/42 px-3 text-left opacity-65 dark:border-white/[0.07] dark:bg-white/[0.03]"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[8px] border border-black/[0.07] bg-black/[0.025] text-black/42 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/42">
          {icon}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold text-black/56 dark:text-white/52">
            {label}
          </span>
          <span className="block truncate text-[10.5px] text-black/34 dark:text-white/32">
            {hint}
          </span>
        </span>
      </span>

      <span className="rounded-[7px] border border-black/[0.07] bg-black/[0.025] px-2 py-1 text-[10px] font-semibold text-black/34 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/32">
        позже
      </span>
    </button>
  );
}

function AuthChoiceCard({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <Panel className="overflow-hidden p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <MicroLabel>{label}</MicroLabel>
          <div className="mt-1 text-[12px] leading-5 text-black/42 dark:text-white/38">
            Telegram создаёт аккаунт автоматически, если его ещё нет
          </div>
        </div>

        {badge ? (
          <div className="rounded-[9px] border border-black/[0.08] bg-white/60 px-2.5 py-1.5 text-[10.5px] font-semibold text-black/42 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/38">
            {badge}
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-[11px] border border-black/[0.08] bg-white/48 p-3 dark:border-white/[0.08] dark:bg-white/[0.035]">
        {children}
      </div>
    </Panel>
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
      <main className="min-h-screen bg-[#f4f4f2] px-3 py-4 text-[#0e0e0e] dark:bg-[#090909] dark:text-white sm:px-5 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[760px] items-center justify-center sm:min-h-[calc(100svh-4rem)]">
          <Card className="w-full overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.08] p-4 dark:border-white/[0.08] sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <BrandLogo className="w-[74px] shrink-0 sm:w-[82px]" />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold tracking-[-0.02em]">
                    Кабинет мастера
                  </div>
                  <div className="mt-0.5 text-[11px] text-black/42 dark:text-white/38">
                    Авторизация ещё не настроена
                  </div>
                </div>
              </div>

              <div className="rounded-[9px] border border-black/[0.08] bg-black/[0.025] px-2.5 py-1.5 text-[11px] font-semibold text-black/48 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/44">
                Setup
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <Panel className="p-4 sm:p-5">
                <MicroLabel>Supabase Auth</MicroLabel>
                <div className="mt-3 text-[28px] font-semibold leading-[0.98] tracking-[-0.075em] sm:text-[36px]">
                  Подключите ключи проекта
                </div>
                <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-black/52 dark:text-white/48">
                  Добавьте публичные переменные в Vercel или <code>.env.local</code>, затем пересоберите проект.
                </p>
                <div className="mt-4 rounded-[10px] border border-black/[0.08] bg-[#fbfbfa]/72 p-3 font-mono text-[11px] leading-6 text-black/54 dark:border-white/[0.08] dark:bg-[#101010]/72 dark:text-white/50">
                  <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                  <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
                  <div>TELEGRAM_BOT_TOKEN=...</div>
                  <div>TELEGRAM_WEBHOOK_SECRET=...</div>
                  <div>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=...</div>
                </div>
                <Button asChild className="mt-4 h-9 rounded-[9px] cb-neutral-primary">
                  <Link href="/about">
                    Открыть страницу о платформе
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </Panel>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f2] px-3 py-4 text-[#0e0e0e] dark:bg-[#090909] dark:text-white sm:px-5 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[980px] items-center justify-center sm:min-h-[calc(100svh-4rem)]">
        <Card className="w-full overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-black/[0.08] p-4 dark:border-white/[0.08] sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="w-[74px] shrink-0 sm:w-[82px]" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold tracking-[-0.02em]">
                  Кабинет мастера
                </div>
                <div className="mt-0.5 text-[11px] text-black/42 dark:text-white/38">
                  Записи · клиенты · публичная страница
                </div>
              </div>
            </div>

            <div className="hidden rounded-[9px] border border-black/[0.08] bg-black/[0.025] px-2.5 py-1.5 text-[11px] font-semibold text-black/48 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/44 sm:block">
              Auth
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(380px,1fr)]">
            <Panel className="flex flex-col justify-between overflow-hidden p-4 sm:p-5">
              <div>
                <MicroLabel>Вход в кабинет</MicroLabel>
                <h1 className="mt-3 text-[40px] font-semibold leading-[0.93] tracking-[-0.085em] sm:text-[58px]">
                  Войти в ClickBook
                </h1>
                <p className="mt-4 max-w-[400px] text-[13px] leading-6 text-black/52 dark:text-white/48">
                  Один быстрый вход для мастера: профиль, записи, услуги, клиенты и публичная страница.
                </p>

                <div className="mt-5 grid gap-2">
                  <StatusLine
                    title="После входа"
                    description="Откроется рабочий dashboard"
                    right={<span className="max-w-[150px] truncate text-[11px] font-semibold">{redirectTo}</span>}
                  />
                  <StatusLine
                    title="Telegram"
                    description="Вход и регистрация через бота"
                    right={<Send className="size-4" />}
                  />
                  <StatusLine
                    title="Без email-формы"
                    description="Аккаунт создаётся автоматически"
                    right={<LockKeyhole className="size-4" />}
                  />
                </div>
              </div>

              <div className="mt-5 border-t border-black/[0.08] pt-4 dark:border-white/[0.08]">
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-black/38 dark:text-white/35">
                  <span>ClickBook workspace</span>
                  <Link
                    href="/about"
                    className="font-semibold text-black/52 transition hover:text-black dark:text-white/48 dark:hover:text-white"
                  >
                    О платформе
                  </Link>
                </div>
              </div>
            </Panel>

            <div className="grid gap-4">
              <Panel className="p-2">
                <div className="grid grid-cols-1 gap-1.5">
                  <div className="flex h-8 items-center justify-center gap-2 rounded-[9px] cb-neutral-primary px-3 text-[12px] font-semibold">
                    <ArrowRight className="size-3.5" />
                    Вход и регистрация
                  </div>
                </div>
              </Panel>

              <AuthChoiceCard label="Быстрый вход" badge="основной способ">
                <TelegramLoginButton redirectTo={redirectTo} />
              </AuthChoiceCard>

              <Panel className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <MicroLabel>Скоро</MicroLabel>
                    <div className="mt-1 text-[12px] leading-5 text-black/42 dark:text-white/38">
                      Остальные способы оставлены в интерфейсе, но пока не активны
                    </div>
                  </div>
                  <ShieldCheck className="size-4 text-black/28 dark:text-white/26" />
                </div>

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
              </Panel>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
