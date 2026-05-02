'use client';

import { useState, type FormEvent } from 'react';
import { useTheme } from 'next-themes';
import { CheckCircle2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function pageBg(light: boolean) {
  return light ? 'bg-[#f4f4f2]' : 'bg-[#090909]';
}

function pageText(light: boolean) {
  return light ? 'text-[#0e0e0e]' : 'text-white';
}

function mutedText(light: boolean) {
  return light ? 'text-black/48' : 'text-white/42';
}

function cardTone(light: boolean) {
  return light
    ? 'border-black/[0.08] bg-[#fbfbfa]'
    : 'border-white/[0.08] bg-[#101010]';
}

function inputCss(light: boolean) {
  return cn(
    'h-11 rounded-[10px] border px-3 text-[13px] shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
    light
      ? 'border-black/[0.08] bg-white text-black placeholder:text-black/28'
      : 'border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/25',
  );
}

export function BookingReviewPage({ token, profileSlug }: { token?: string; profileSlug?: string }) {
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme === 'light';
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(token ? '/api/reviews/booking' : '/api/reviews/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token ? { token, author, text, rating } : { slug: profileSlug, author, text, rating }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'review_failed');
      }

      setDone(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'review_failed';
      setError(
        message === 'already_submitted'
          ? 'Отзыв по этой ссылке уже отправлен.'
          : message === 'expired'
            ? 'Ссылка для отзыва устарела.'
            : 'Не удалось отправить отзыв. Попробуйте ещё раз.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={cn('min-h-screen px-4 py-8', pageBg(light), pageText(light))}>
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[640px] items-center">
        <section className={cn('w-full rounded-[18px] border p-5 shadow-none md:p-6', cardTone(light))}>
          {done ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-[14px] border border-current/10">
                <CheckCircle2 className="size-6" />
              </div>
              <h1 className="mt-5 text-[32px] font-semibold leading-none tracking-[-0.075em]">
                Спасибо за отзыв
              </h1>
              <p className={cn('mx-auto mt-3 max-w-[420px] text-[13px] leading-6', mutedText(light))}>
                Он уже отправлен мастеру и появится в публичном профиле.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <div className={cn('text-[10px] font-medium uppercase tracking-[0.16em]', mutedText(light))}>
                  КликБук · отзыв
                </div>
                <h1 className="mt-3 text-[34px] font-semibold leading-none tracking-[-0.08em]">
                  Оставьте отзыв о визите
                </h1>
                <p className={cn('mt-3 text-[13px] leading-6', mutedText(light))}>
                  Отзыв подтянется в профиль мастера. Напишите коротко, что понравилось и за какую услугу.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
                <label className="block">
                  <span className={cn('mb-2 block text-[11px] font-medium', mutedText(light))}>
                    Имя
                  </span>
                  <Input
                    value={author}
                    className={inputCss(light)}
                    onChange={(event) => setAuthor(event.target.value)}
                    placeholder="Например: Анна"
                  />
                </label>

                <label className="block">
                  <span className={cn('mb-2 block text-[11px] font-medium', mutedText(light))}>
                    Оценка
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={0.5}
                    value={rating}
                    className={inputCss(light)}
                    onChange={(event) => setRating(Number(event.target.value))}
                  />
                </label>
              </div>

              <label className="block">
                <span className={cn('mb-2 block text-[11px] font-medium', mutedText(light))}>
                  Текст отзыва
                </span>
                <Textarea
                  value={text}
                  className={cn(inputCss(light), 'min-h-[132px] resize-none py-3')}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Например: всё аккуратно, быстро, мастер помог подобрать вариант и объяснил детали."
                />
              </label>

              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(index + 1)}
                    className={cn(
                      'flex size-9 items-center justify-center rounded-[10px] border transition active:scale-[0.97]',
                      index < Math.round(rating)
                        ? light
                          ? 'border-black/[0.12] bg-black text-white'
                          : 'border-white/[0.16] bg-white text-black'
                        : light
                          ? 'border-black/[0.08] bg-white text-black/26 hover:text-black'
                          : 'border-white/[0.08] bg-white/[0.04] text-white/26 hover:text-white',
                    )}
                  >
                    <Star className="size-4" />
                  </button>
                ))}
              </div>

              {error ? <div className="text-[12px] text-destructive">{error}</div> : null}

              <Button
                type="submit"
                disabled={loading || !text.trim()}
                className={cn(
                  'h-11 w-full rounded-[10px] border text-[13px] font-semibold shadow-none',
                  light ? 'bg-black text-white hover:bg-black/90' : 'bg-white text-black hover:bg-white/90',
                )}
              >
                {loading ? 'Отправляем…' : 'Отправить отзыв'}
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
