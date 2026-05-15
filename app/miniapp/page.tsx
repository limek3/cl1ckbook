'use client';

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

export default function TelegramDisabledPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080808] px-5 text-white">
      <div className="w-full max-w-[380px] rounded-[24px] border border-white/[0.10] bg-[#141414]/94 p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
        <BrandLogo className="mx-auto w-[134px]" />
        <div className="mx-auto mt-6 grid size-12 place-items-center rounded-2xl bg-white/[0.08] text-white/72">
          <ShieldOff className="size-5" />
        </div>
        <h1 className="mt-5 text-[26px] font-semibold leading-none tracking-[-0.075em]">
          Telegram временно отключён
        </h1>
        <p className="mt-3 text-[12.5px] leading-5 text-white/48">
          Этот маршрут отключён для чистой проверки обычного сайта без Telegram SDK, Mini App и bot-зависимостей.
        </p>
        <div className="mt-6 grid gap-2">
          <Link className="inline-flex h-11 items-center justify-center rounded-[13px] bg-white text-[12px] font-bold text-black" href="/login">
            Войти в веб-кабинет
          </Link>
          <Link className="inline-flex h-10 items-center justify-center rounded-[13px] border border-white/[0.12] text-[12px] font-semibold text-white/70" href="/dashboard">
            Открыть dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
