'use client';

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TelegramMiniAppGate({
  redirectTo = '/dashboard',
  className,
}: {
  redirectTo?: string;
  className?: string;
}) {
  return (
    <main className={cn('grid min-h-screen place-items-center bg-[#080808] px-5 text-white', className)}>
      <div className="w-full max-w-[360px] rounded-[22px] border border-white/[0.10] bg-[#141414] p-5 text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-white/[0.08] text-white/70">
          <ShieldOff className="size-5" />
        </div>
        <div className="mt-4 text-[22px] font-semibold tracking-[-0.06em]">Telegram временно отключён</div>
        <p className="mt-2 text-[12px] leading-5 text-white/48">
          Mini App и Telegram-вход убраны из тестовой сборки. Откройте обычный веб-кабинет.
        </p>
        <Link
          href={redirectTo}
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-[12px] bg-white text-[12px] font-bold text-black"
        >
          Открыть кабинет
        </Link>
      </div>
    </main>
  );
}
