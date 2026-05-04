'use client';

import { useEffect } from 'react';
import { BrandLogo } from '@/components/brand/brand-logo';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ClickBook /app route]', error);
  }, [error]);

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#090909] px-5 text-white">
      <div className="w-full max-w-[340px] rounded-[18px] border border-white/[0.10] bg-[#101010] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
        <BrandLogo />
        <div className="mt-5 text-[22px] font-semibold leading-none tracking-[-0.08em]">
          Mini app перезагрузилась
        </div>
        <div className="mt-3 text-[12px] leading-5 text-white/45">
          Ошибка поймана внутри мобильной оболочки. Нажми кнопку — экран откроется заново.
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-5 h-10 w-full rounded-[10px] border border-white/[0.12] bg-white text-[12px] font-bold text-black active:scale-[0.985]"
        >
          Открыть снова
        </button>
      </div>
    </main>
  );
}
