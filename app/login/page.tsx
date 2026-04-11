'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, KeyRound, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useMobile } from '@/hooks/use-mobile';

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMobile();
  const redirectTo = useMemo(() => searchParams.get('redirectTo') || '/dashboard', [searchParams]);
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось выполнить вход.');
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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage('Ссылка для входа отправлена на почту. Откройте письмо и продолжите вход.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось отправить ссылку.');
    } finally {
      setBusy(false);
    }
  };

  const featureItems = [
    {
      title: 'Быстрый вход',
      text: 'Откройте кабинет за пару секунд и сразу продолжайте рабочий день.',
      icon: Sparkles,
    },
    {
      title: 'Безопасная сессия',
      text: 'Вход и доступ к данным защищены через авторизацию Supabase.',
      icon: ShieldCheck,
    },
    {
      title: 'Все в одном месте',
      text: 'Записи, шаблоны, чаты и публичная страница доступны в одном кабинете.',
      icon: CheckCircle2,
    },
  ];

  if (!authConfigured) {
    return (
      <main className="min-h-screen bg-background px-3 py-4 text-foreground md:px-4 md:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[920px] items-center justify-center md:min-h-[calc(100vh-4rem)]">
          <div className="grid w-full gap-4 rounded-[28px] border border-border bg-card/72 p-4 shadow-[var(--shadow-soft)] md:gap-5 md:rounded-[32px] md:p-6 lg:grid-cols-[1.05fr_420px] lg:p-8">
            <div className="space-y-4">
              <BrandLogo className={isMobile ? 'w-[76px]' : 'w-[92px]'} />
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[12px] text-muted-foreground">
                  <Sparkles className="size-3.5" />
                  КликБук
                </div>
                <div className="mt-4 text-[24px] font-semibold tracking-tight text-foreground md:text-[30px]">
                  Вход пока не настроен
                </div>
                <div className="mt-3 max-w-[520px] text-[14px] leading-7 text-muted-foreground">
                  Добавьте параметры Supabase в <code>.env.local</code>, затем перезапустите dev-сервер.
                </div>
              </div>

              <div className="rounded-[22px] border border-border bg-background/70 p-4 md:p-5">
                <div className="text-[13px] font-medium text-foreground">Что нужно заполнить</div>
                <div className="mt-3 space-y-2 font-mono text-[12px] leading-6 text-muted-foreground">
                  <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                  <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
                  <div>NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-dashed border-border bg-background/60 p-5 md:rounded-[28px] md:p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/40 px-3 py-1 text-[12px] text-muted-foreground">
                <Sparkles className="size-3.5" />
                Подключение авторизации
              </div>
              <div className="mt-4 text-[22px] font-semibold text-foreground">После настройки откроется форма входа</div>
              <div className="mt-3 text-[14px] leading-7 text-muted-foreground">
                Как только переменные будут добавлены, вы сможете входить по паролю или по ссылке из письма.
              </div>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/">Вернуться на сайт</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-3 py-4 text-foreground md:px-4 md:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[980px] items-center justify-center md:min-h-[calc(100vh-4rem)]">
        <div className="grid w-full gap-4 rounded-[28px] border border-border bg-card/72 p-4 shadow-[var(--shadow-soft)] md:gap-5 md:rounded-[32px] md:p-6 lg:grid-cols-[1.02fr_420px] lg:p-8">
          <div className="space-y-5">
            <BrandLogo className={isMobile ? 'w-[76px]' : 'w-[92px]'} />

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[12px] text-muted-foreground">
                <Sparkles className="size-3.5" />
                Кабинет КликБук
              </div>
              <div className="mt-4 text-[26px] font-semibold tracking-tight text-foreground md:text-[30px]">
                Войдите в кабинет
              </div>
              <div className="mt-3 max-w-[520px] text-[14px] leading-7 text-muted-foreground">
                Управляйте записями, сообщениями и публичной страницей в одном рабочем пространстве.
              </div>
            </div>

            <div className={isMobile ? 'grid gap-2' : 'grid gap-3 sm:grid-cols-3'}>
              {featureItems.map((item) => (
                <div key={item.title} className="rounded-[20px] border border-border bg-background/70 p-4">
                  <div className="inline-flex size-9 items-center justify-center rounded-[14px] border border-border bg-card/80 text-muted-foreground">
                    <item.icon className="size-4" />
                  </div>
                  <div className="mt-3 text-[14px] font-medium text-foreground">{item.title}</div>
                  <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-background/72 p-4 md:rounded-[28px] md:p-5">
            <div className="inline-flex rounded-full border border-border bg-card/80 p-1">
              <button
                type="button"
                onClick={() => setMode('password')}
                className={`rounded-full px-3.5 py-2 text-[12px] font-medium transition ${mode === 'password' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
              >
                Пароль
              </button>
              <button
                type="button"
                onClick={() => setMode('magic')}
                className={`rounded-full px-3.5 py-2 text-[12px] font-medium transition ${mode === 'magic' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
              >
                Ссылка на вход
              </button>
            </div>

            <div className="mt-5">
              <div className="text-[22px] font-semibold text-foreground">
                {mode === 'password' ? 'Вход по email и паролю' : 'Вход по ссылке из письма'}
              </div>
              <div className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {mode === 'password'
                  ? 'Используйте существующий аккаунт КликБук.'
                  : 'Мы отправим письмо со ссылкой для безопасного входа в кабинет.'}
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={mode === 'password' ? submitPassword : submitMagicLink}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-9"
                    placeholder="hello@klikbuk.rf"
                  />
                </div>
              </div>

              {mode === 'password' ? (
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-9"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[18px] border border-red-500/30 bg-red-500/8 px-4 py-3 text-[12px] text-red-200">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-[18px] border border-primary/30 bg-primary/10 px-4 py-3 text-[12px] text-foreground">
                  {message}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={busy || !email.trim() || (mode === 'password' && !password)}>
                {mode === 'password' ? 'Войти' : 'Отправить ссылку'}
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="mt-4 text-[12px] leading-6 text-muted-foreground">
              После входа откроется <span className="text-foreground">{redirectTo}</span>.
            </div>

            <div className="mt-6">
              <Button asChild variant="outline" className="w-full shadow-none">
                <Link href="/">Вернуться на сайт</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
