'use client';

import { ShieldOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TelegramLoginButton({ className }: { redirectTo?: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-[54px] w-full items-center gap-3 rounded-[13px] border border-[var(--cb-border)] bg-[var(--cb-surface)] px-3 text-left opacity-70',
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-[12px] border border-[var(--cb-border)] bg-[var(--cb-soft-surface)] text-black/42 dark:text-white/38">
        <ShieldOff className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[12.5px] font-semibold text-black/68 dark:text-white/66">
          Telegram временно отключён
        </span>
        <span className="block truncate text-[11px] text-black/40 dark:text-white/36">
          Проверяем загрузку обычного сайта без Telegram-зависимостей.
        </span>
      </span>
    </div>
  );
}
