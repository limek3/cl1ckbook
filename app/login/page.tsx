'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, KeyRound, Mail, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

const authConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      setError(error instanceof Error ? error.message : 'Could not sign in.');
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

      setMessage('Письмо для входа отправлено. Откройте ссылку из email.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not send the magic link.');
    } finally {
      setBusy(false);
    }
  };

  if (!authConfigured) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[920px] items-center justify-center">
          <div className="grid w-full gap-5 rounded-[32px] border border-border bg-card/72 p-6 shadow-[var(--shadow-soft)] lg:grid-cols-[1.05fr_420px] lg:p-8">
            <div className="space-y-5">
              <BrandLogo className="w-[92px]" />
              <div>
                <div className="text-[28px] font-semibold tracking-tight text-foreground">КликБук auth setup</div>
                <div className="mt-3 max-w-[520px] text-[14px] leading-7 text-muted-foreground">
                  Добавьте публичные Supabase-переменные в <code>.env.local</code>, затем перезапустите dev-server.
                </div>
              </div>

              <div className="rounded-[24px] border border-border bg-background/70 p-5">
                <div className="text-[13px] font-medium text-foreground">Нужно заполнить</div>
                <div className="mt-3 space-y-2 font-mono text-[12px] leading-6 text-muted-foreground">
                  <div>NEXT_PUBLIC_SUPABASE_URL=...</div>
                  <div>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=...</div>
                  <div>NEXT_PUBLIC_APP_URL=http://localhost:3000</div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-dashed border-border bg-background/60 p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/40 px-3 py-1 text-[12px] text-muted-foreground">
                <Sparkles className="size-3.5" />
                Auth is not configured yet
              </div>
              <div className="mt-4 text-[22px] font-semibold text-foreground">Подключите Supabase Auth</div>
              <div className="mt-3 text-[14px] leading-7 text-muted-foreground">
                После добавления переменных эта страница переключится на форму входа.
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
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[980px] items-center justify-center">
        <div className="grid w-full gap-5 rounded-[32px] border border-border bg-card/72 p-6 shadow-[var(--shadow-soft)] lg:grid-cols-[1.08fr_420px] lg:p-8">
          <div className="space-y-6">
            <BrandLogo className="w-[92px]" />
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[12px] text-muted-foreground">
                <Sparkles className="size-3.5" />
                Авторизация и рабочее пространство
              </div>
              <div className="mt-4 text-[30px] font-semibold tracking-tight text-foreground">Вход в кабинет КликБук</div>
              <div className="mt-3 max-w-[520px] text-[14px] leading-7 text-muted-foreground">
                После входа вам будут доступны кабинет, профиль, шаблоны и чаты с сохранением всех рабочих данных.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Вход', text: 'безопасная сессия' },
                { title: 'Кабинет', text: 'одно рабочее пространство' },
                { title: 'Чаты', text: 'бот, переносы и шаблоны' },
              ].map((item) => (
                <div key={item.title} className="rounded-[22px] border border-border bg-background/70 p-4">
                  <div className="text-[12px] text-muted-foreground">{item.title}</div>
                  <div className="mt-2 text-[14px] font-medium text-foreground">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-background/70 p-5">
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
                Email-ссылка
              </button>
            </div>

            <div className="mt-5">
              <div className="text-[22px] font-semibold text-foreground">
                {mode === 'password' ? 'Вход по email и паролю' : 'Вход по email-ссылке'}
              </div>
              <div className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {mode === 'password'
                  ? 'Используйте свой аккаунт для входа в кабинет.'
                  : 'Мы отправим безопасную ссылку для входа в кабинет.'}
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
                    placeholder="name@example.com"
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
