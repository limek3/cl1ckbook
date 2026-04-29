'use client';

import Link from 'next/link';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Chrome, KeyRound, Mail, MessageCircleMore, Send, UserPlus } from 'lucide-react';
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
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

type AuthView = 'login' | 'register';
type LoginMode = 'password' | 'magic';

function SocialButton({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex h-12 items-center justify-center gap-2 rounded-[18px] border px-4 text-[14px] font-medium transition-[background,border-color,color,box-shadow,transform] active:scale-[0.98] cb-menu-button-quiet"
    >
      {icon}
      {label}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useBrowserSearchParams();
  const redirectTo = useMemo(() => searchParams.get('redirectTo') || '/dashboard', [searchParams]);

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
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
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
      setError(nextError instanceof Error ? nextError.message : 'Не удалось выполнить вход.');
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
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (otpError) throw otpError;
      setMessage('Письмо для входа отправлено. Откройте ссылку из письма, чтобы продолжить.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не удалось отправить ссылку.');
    } finally {
      setBusy(false);
    }
  };

  const submitHandler = mode === 'password' ? submitPassword : submitMagicLink;

  if (!authConfigured) {
    return (
      <main className="login-shell min-h-screen bg-background px-3 py-4 text-foreground sm:px-4 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[760px] items-center justify-center sm:min-h-[calc(100svh-4rem)]">
          <div className="login-card w-full rounded-[28px] border border-border bg-card/82 p-4 shadow-[var(--shadow-card)] sm:p-6">
            <div className="flex items-center gap-3 border-b border-border/70 pb-4">
              <BrandLogo className="w-[72px] sm:w-[82px]" />
              <div>
                <div className="text-[15px] font-medium text-foreground">Кабинет мастера</div>
                <div className="mt-1 text-[12px] text-muted-foreground">Авторизация ещё не настроена</div>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-border bg-background/70 p-4">
              <div className="text-[22px] font-semibold tracking-[-0.03em] text-foreground">Подключите Supabase Auth</div>
              <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
                Добавьте публичные ключи в <code>.env.local</code>, затем перезапустите проект.
              </p>
              <div className="mt-4 space-y-2 rounded-[20px] border border-border/80 bg-card/60 p-4 font-mono text-[12px] leading-6 text-muted-foreground">
                <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
                <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
                <div>NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
              </div>
              <Button asChild className="mt-5 w-full rounded-[18px]">
                <Link href="/about">Открыть страницу о платформе</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="login-shell min-h-screen bg-background px-3 py-4 text-foreground sm:px-4 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[760px] items-center justify-center sm:min-h-[calc(100svh-4rem)]">
        <div className="login-card w-full rounded-[30px] border border-border bg-card/82 p-4 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="w-[74px] sm:w-[82px]" />
              <div className="min-w-0">
                <div className="truncate text-[15px] font-medium text-foreground">Кабинет мастера</div>
              </div>
            </div>
            <div className="rounded-full border border-border/80 bg-background/72 px-3 py-1.5 text-[12px] text-muted-foreground">
              Вход
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-border/80 bg-background/65 p-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setView('login')}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-[16px] text-[14px] font-medium transition',
                  view === 'login' ? 'cb-neutral-primary' : 'cb-menu-button-quiet',
                )}
              >
                <ArrowRight className="size-4" />
                Вход
              </button>
              <button
                type="button"
                onClick={() => setView('register')}
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-[16px] text-[14px] font-medium transition',
                  view === 'register' ? 'cb-neutral-primary' : 'cb-menu-button-quiet',
                )}
              >
                <UserPlus className="size-4" />
                Регистрация
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-border/80 bg-background/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[12px] font-medium tracking-[0.28em] text-muted-foreground">
                БЫСТРЫЙ ВХОД
              </div>
              <div className="text-[12px] text-muted-foreground">Google · Телеграм · MAX</div>
            </div>

            <div className="mt-4 grid gap-3">
              <SocialButton icon={<Chrome className="size-4" />} label="Google" />
              <SocialButton icon={<Send className="size-4" />} label="Телеграм" />
              <SocialButton icon={<MessageCircleMore className="size-4" />} label="MAX" />
            </div>
          </div>

          <div className="mt-5 rounded-[28px] border border-border/80 bg-[#0c0d11]/92 p-5 text-white sm:p-6">
            <div className="text-[36px] font-semibold tracking-[-0.05em] leading-[1.02] text-white sm:text-[44px]">
              {view === 'login' ? 'Войти в кабинет' : 'Создать кабинет'}
            </div>
            <p className="mt-4 max-w-[420px] text-[15px] leading-8 text-white/64">
              {view === 'login'
                ? 'Откройте кабинет и продолжайте рабочий день без лишних шагов.'
                : 'Создайте аккаунт и откройте кабинет с записями, чатами и публичной страницей.'}
            </p>

            <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => setMode('password')}
                className={cn(
                  'rounded-full px-3 py-2 text-[12px] font-medium transition',
                  mode === 'password' ? 'cb-neutral-primary' : 'cb-menu-button-quiet-dark',
                )}
              >
                Пароль
              </button>
              <button
                type="button"
                onClick={() => setMode('magic')}
                className={cn(
                  'rounded-full px-3 py-2 text-[12px] font-medium transition',
                  mode === 'magic' ? 'cb-neutral-primary' : 'cb-menu-button-quiet-dark',
                )}
              >
                Email-ссылка
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={submitHandler}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] tracking-[0.22em] text-white/55">
                  EMAIL
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-14 rounded-[18px] border-white/8 bg-white/[0.03] pl-11 text-white placeholder:text-white/28"
                    placeholder="hello@klikbuk.rf"
                  />
                </div>
              </div>

              {mode === 'password' ? (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[11px] tracking-[0.22em] text-white/55">
                    ПАРОЛЬ
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-14 rounded-[18px] border-white/8 bg-white/[0.03] pl-11 text-white placeholder:text-white/28"
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
                    'inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-[13px] transition',
                    remember ? 'cb-neutral-primary' : 'cb-menu-button-quiet-dark',
                  )}
                >
                  <span className={cn('flex size-5 items-center justify-center rounded-[8px] border', remember ? 'border-white/20 bg-white text-black' : 'border-white/12 bg-transparent')} >
                    ✓
                  </span>
                  Запомнить меня
                </button>

                <button type="button" className="text-[13px] text-white/64 transition hover:text-white">
                  Восстановить доступ
                </button>
              </div>

              {error ? (
                <div className="rounded-[18px] border border-red-500/26 bg-red-500/10 px-4 py-3 text-[13px] text-red-100">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-[18px] border border-primary/24 bg-primary/12 px-4 py-3 text-[13px] text-white">
                  {message}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={busy || !email.trim() || (mode === 'password' && !password.trim())}
                className="mt-2 h-14 w-full rounded-[18px]"
              >
                {view === 'login'
                  ? mode === 'password'
                    ? 'Войти'
                    : 'Отправить ссылку'
                  : mode === 'password'
                    ? 'Создать кабинет'
                    : 'Получить ссылку'}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[12px] text-muted-foreground">
            <div>После входа откроется {redirectTo}.</div>
            <Link href="/about" className="transition hover:text-foreground">
              О платформе
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
