'use client';

import Link from 'next/link';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  Chrome,
  KeyRound,
  LockKeyhole,
  Mail,
  MessageCircleMore,
  Send,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

type AuthView = 'login' | 'register';
type LoginMode = 'password' | 'magic';

function MicroLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/42 dark:text-white/38">
      {children}
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[11px] border border-black/[0.08] bg-[#fbfbfa] text-[#0e0e0e] shadow-none dark:border-white/[0.08] dark:bg-[#101010] dark:text-white',
        className,
      )}
    >
      {children}
    </div>
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
        'rounded-[10px] border border-black/[0.08] bg-black/[0.025] dark:border-white/[0.08] dark:bg-white/[0.035]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function AuthTab({
  active,
  icon,
  children,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 items-center justify-center gap-2 rounded-[9px] px-3 text-[12px] font-semibold transition active:scale-[0.985]',
        active
          ? 'cb-neutral-primary'
          : 'text-black/58 hover:bg-black/[0.04] hover:text-black dark:text-white/52 dark:hover:bg-white/[0.06] dark:hover:text-white',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function ModeChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-8 rounded-[9px] px-3 text-[11px] font-semibold transition active:scale-[0.985]',
        active
          ? 'bg-black/[0.055] text-black dark:bg-white/[0.075] dark:text-white'
          : 'text-black/45 hover:bg-black/[0.035] hover:text-black/72 dark:text-white/42 dark:hover:bg-white/[0.055] dark:hover:text-white/72',
      )}
    >
      {children}
      {active ? (
        <span className="absolute bottom-1 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-black/55 dark:bg-white/60" />
      ) : null}
    </button>
  );
}

function SocialButton({
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
      className="group flex min-h-11 items-center justify-between gap-3 rounded-[10px] border border-black/[0.08] bg-white/55 px-3 text-left transition active:scale-[0.99] hover:border-black/[0.13] hover:bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.035] dark:hover:border-white/[0.14] dark:hover:bg-white/[0.06]"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[8px] border border-black/[0.07] bg-black/[0.025] text-black/60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/58">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold text-black/78 dark:text-white/76">
            {label}
          </span>
          <span className="block truncate text-[10.5px] text-black/38 dark:text-white/35">
            {hint}
          </span>
        </span>
      </span>

      <ArrowRight className="size-3.5 shrink-0 text-black/26 transition group-hover:translate-x-0.5 group-hover:text-black/48 dark:text-white/24 dark:group-hover:text-white/46" />
    </button>
  );
}

const inputClass =
  'h-10 rounded-[10px] border-black/[0.08] bg-white/65 pl-9 text-[13px] text-black shadow-none outline-none placeholder:text-black/28 focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-white/[0.09] dark:bg-white/[0.055] dark:text-white dark:placeholder:text-white/26';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useBrowserSearchParams();

  const redirectTo = useMemo(
    () => searchParams.get('redirectTo') || '/dashboard',
    [searchParams],
  );

  const [view, setView] = useState<AuthView>('login');
  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();

      if (view === 'register') {
        const origin = window.location.origin;

        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
              redirectTo,
            )}`,
          },
        });

        if (signUpError) throw signUpError;

        setMessage('Проверьте почту: мы отправили письмо для подтверждения входа.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;

        if (remember) {
          window.localStorage.setItem('klikbuk-last-login', email.trim());
        }

        router.replace(redirectTo);
        router.refresh();
      }
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Не удалось выполнить вход.',
      );
    } finally {
      setBusy(false);
    }
  };

  const submitMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
            redirectTo,
          )}`,
        },
      });

      if (otpError) throw otpError;

      setMessage('Письмо для входа отправлено. Откройте ссылку из письма.');
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Не удалось отправить ссылку.',
      );
    } finally {
      setBusy(false);
    }
  };

  const submitHandler = mode === 'password' ? submitPassword : submitMagicLink;

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
                  Добавьте публичные переменные в <code>.env.local</code>, затем
                  перезапустите проект. После этого страница входа откроется в
                  рабочем режиме.
                </p>

                <div className="mt-4 rounded-[10px] border border-black/[0.08] bg-[#fbfbfa]/72 p-3 font-mono text-[11px] leading-6 text-black/54 dark:border-white/[0.08] dark:bg-[#101010]/72 dark:text-white/50">
                  <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                  <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
                  <div>NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
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
                <MicroLabel>
                  {view === 'login' ? 'Возвращение в кабинет' : 'Новый кабинет'}
                </MicroLabel>

                <h1 className="mt-3 text-[38px] font-semibold leading-[0.95] tracking-[-0.085em] sm:text-[54px]">
                  {view === 'login' ? 'Войти в ClickBook' : 'Создать кабинет'}
                </h1>

                <p className="mt-4 max-w-[390px] text-[13px] leading-6 text-black/52 dark:text-white/48">
                  {view === 'login'
                    ? 'Откройте рабочий экран мастера: записи, клиенты, услуги, чаты и настройки публичной страницы.'
                    : 'Создайте аккаунт мастера и соберите базовый кабинет для онлайн-записи клиентов.'}
                </p>

                <div className="mt-5 grid gap-2">
                  <div className="flex items-center justify-between rounded-[10px] border border-black/[0.07] bg-[#fbfbfa]/60 px-3 py-2.5 dark:border-white/[0.08] dark:bg-[#101010]/60">
                    <div>
                      <div className="text-[12px] font-semibold">После входа</div>
                      <div className="mt-0.5 text-[11px] text-black/38 dark:text-white/35">
                        Откроется рабочий dashboard
                      </div>
                    </div>
                    <div className="max-w-[150px] truncate text-[11px] font-semibold text-black/48 dark:text-white/42">
                      {redirectTo}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-[10px] border border-black/[0.07] bg-[#fbfbfa]/60 px-3 py-2.5 dark:border-white/[0.08] dark:bg-[#101010]/60">
                    <div>
                      <div className="text-[12px] font-semibold">Доступ</div>
                      <div className="mt-0.5 text-[11px] text-black/38 dark:text-white/35">
                        Пароль или email-ссылка
                      </div>
                    </div>
                    <LockKeyhole className="size-4 text-black/32 dark:text-white/30" />
                  </div>
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
                <div className="grid grid-cols-2 gap-1.5">
                  <AuthTab
                    active={view === 'login'}
                    icon={<ArrowRight className="size-3.5" />}
                    onClick={() => {
                      setView('login');
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    Вход
                  </AuthTab>

                  <AuthTab
                    active={view === 'register'}
                    icon={<UserPlus className="size-3.5" />}
                    onClick={() => {
                      setView('register');
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    Регистрация
                  </AuthTab>
                </div>
              </Panel>

              <Panel className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <MicroLabel>Быстрый вход</MicroLabel>
                    <div className="mt-1 text-[12px] text-black/42 dark:text-white/38">
                      Варианты можно подключить через Supabase OAuth
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  <SocialButton
                    icon={<Chrome className="size-3.5" />}
                    label="Google"
                    hint="OAuth"
                  />
                  <SocialButton
                    icon={<Send className="size-3.5" />}
                    label="Telegram"
                    hint="Mini App"
                  />
                  <SocialButton
                    icon={<MessageCircleMore className="size-3.5" />}
                    label="MAX"
                    hint="Позже"
                  />
                </div>
              </Panel>

              <Panel className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <MicroLabel>
                      {view === 'login' ? 'Авторизация' : 'Регистрация'}
                    </MicroLabel>
                    <div className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.065em]">
                      {view === 'login' ? 'Данные для входа' : 'Новый аккаунт'}
                    </div>
                  </div>

                  <div className="flex rounded-[10px] border border-black/[0.08] bg-[#fbfbfa]/60 p-1 dark:border-white/[0.08] dark:bg-[#101010]/60">
                    <ModeChip active={mode === 'password'} onClick={() => setMode('password')}>
                      Пароль
                    </ModeChip>
                    <ModeChip active={mode === 'magic'} onClick={() => setMode('magic')}>
                      Email-ссылка
                    </ModeChip>
                  </div>
                </div>

                <form className="mt-5 space-y-4" onSubmit={submitHandler}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/42 dark:text-white/38"
                    >
                      Email
                    </Label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-black/30 dark:text-white/28" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={inputClass}
                        placeholder="hello@klikbuk.ru"
                      />
                    </div>
                  </div>

                  {mode === 'password' ? (
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/42 dark:text-white/38"
                      >
                        Пароль
                      </Label>

                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-black/30 dark:text-white/28" />
                        <Input
                          id="password"
                          type="password"
                          autoComplete={
                            view === 'login' ? 'current-password' : 'new-password'
                          }
                          required
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className={inputClass}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setRemember((current) => !current)}
                      className={cn(
                        'inline-flex h-8 items-center gap-2 rounded-[9px] border px-2.5 text-[11px] font-semibold transition active:scale-[0.985]',
                        remember
                          ? 'border-black/[0.10] bg-black/[0.055] text-black dark:border-white/[0.10] dark:bg-white/[0.075] dark:text-white'
                          : 'border-black/[0.08] bg-transparent text-black/46 hover:bg-black/[0.035] dark:border-white/[0.08] dark:text-white/42 dark:hover:bg-white/[0.055]',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-4 items-center justify-center rounded-[5px] border',
                          remember
                            ? 'border-black/15 bg-black text-white dark:border-white/16 dark:bg-white dark:text-black'
                            : 'border-black/12 dark:border-white/12',
                        )}
                      >
                        {remember ? <Check className="size-3" /> : null}
                      </span>
                      Запомнить
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('magic');
                        setMessage('Введите email — отправим ссылку для входа без пароля.');
                        setError(null);
                      }}
                      className="text-[11px] font-semibold text-black/42 transition hover:text-black dark:text-white/38 dark:hover:text-white"
                    >
                      Восстановить доступ
                    </button>
                  </div>

                  {error ? (
                    <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-[12px] leading-5 text-red-700 dark:text-red-100">
                      {error}
                    </div>
                  ) : null}

                  {message ? (
                    <div className="rounded-[10px] border border-black/[0.08] bg-[#fbfbfa]/70 px-3 py-2.5 text-[12px] leading-5 text-black/62 dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white/68">
                      {message}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={
                      busy ||
                      !email.trim() ||
                      (mode === 'password' && !password.trim())
                    }
                    className="h-10 w-full rounded-[9px] cb-neutral-primary"
                  >
                    {view === 'login'
                      ? mode === 'password'
                        ? 'Войти в кабинет'
                        : 'Отправить ссылку'
                      : mode === 'password'
                        ? 'Создать кабинет'
                        : 'Получить ссылку'}
                    <ArrowRight className="size-4" />
                  </Button>
                </form>
              </Panel>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
