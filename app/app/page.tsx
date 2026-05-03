import Link from 'next/link';
import { ArrowRight, Send } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { TelegramMiniAppGate } from '@/components/auth/telegram-miniapp-gate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeRedirect(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string' || !raw) return '/dashboard';

  try {
    const decoded = decodeURIComponent(raw);
    return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '/dashboard';
  } catch {
    return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
  }
}

export default async function TelegramMiniAppEntryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const redirectTo = normalizeRedirect(params.redirectTo ?? params.to);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f4f4f2] px-4 py-8 text-[#0e0e0e] dark:bg-[#090909] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] mx-auto h-[440px] max-w-[720px] rounded-full bg-black/[0.035] blur-3xl dark:bg-white/[0.045]" />
      <div className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[18px] border border-black/[0.08] bg-[#fbfbfa]/88 shadow-[0_30px_100px_rgba(15,15,15,0.10)] backdrop-blur-[22px] dark:border-white/[0.09] dark:bg-[#101010]/88 dark:shadow-[0_34px_110px_rgba(0,0,0,0.62)]">
        <div className="border-b border-black/[0.08] px-5 py-4 dark:border-white/[0.08]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="w-[96px] shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold tracking-[-0.02em]">
                  КликБук Mini App
                </div>
                <div className="mt-0.5 text-[11px] text-black/42 dark:text-white/38">
                  кабинет мастера в Telegram
                </div>
              </div>
            </div>

            <div className="rounded-[9px] border border-black/[0.08] bg-white/56 px-2.5 py-1.5 text-[10.5px] font-semibold text-black/42 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/38">
              Telegram
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/42 dark:text-white/38">
              Быстрый вход
            </div>
            <h1 className="mt-2 text-[30px] font-semibold leading-[0.98] tracking-[-0.075em] sm:text-[34px]">
              Открываем кабинет
            </h1>
            <p className="mt-3 text-[12.5px] leading-5 text-black/52 dark:text-white/48">
              Если вы открыли страницу из Telegram, вход выполнится автоматически. На обычном сайте используйте вход через бота.
            </p>
          </div>

          <TelegramMiniAppGate redirectTo={redirectTo} />

          <Link
            href="/"
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border border-black/[0.08] bg-white/58 px-3 text-[11px] font-semibold text-black/50 transition hover:bg-black/[0.035] hover:text-black dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/48 dark:hover:bg-white/[0.07] dark:hover:text-white"
          >
            <Send className="size-3.5" />
            На главную
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
