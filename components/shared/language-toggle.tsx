'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/locale-context';

interface LanguageToggleProps {
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
  minimal?: boolean;
}

const thumbTransition = {
  type: 'spring',
  stiffness: 560,
  damping: 38,
  mass: 0.72,
};

export function LanguageToggle({
  compact = false,
  iconOnly = false,
  className,
  minimal = false,
}: LanguageToggleProps) {
  const { locale, setLocale } = useLocale();
  const layoutId = useId();

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setLocale(locale === 'ru' ? 'en' : 'ru')}
        className={cn(
          'rounded-full border-0 bg-transparent text-muted-foreground shadow-none transition-colors duration-300 hover:bg-foreground/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]',
          className,
        )}
        aria-label="Language"
        title="Language"
      >
        <Languages className="size-4" />
      </Button>
    );
  }

  const options = compact
    ? [
        { value: 'ru' as const, label: 'RU' },
        { value: 'en' as const, label: 'EN' },
      ]
    : [
        { value: 'ru' as const, label: 'Русский' },
        { value: 'en' as const, label: 'English' },
      ];

  return (
    <div
      className={cn(
        'inline-grid grid-cols-2 rounded-full backdrop-blur-sm',
        minimal
          ? 'gap-0 bg-foreground/[0.03] p-[2px] shadow-none dark:bg-white/[0.035]'
          : 'gap-0.5 bg-foreground/[0.04] p-[3px] shadow-none dark:bg-white/[0.04]',
        compact ? (minimal ? 'min-w-[64px]' : 'min-w-[58px]') : 'min-w-[178px]',
        className,
      )}
    >
      {options.map((option) => {
        const active = locale === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            className={cn(
              'relative inline-flex items-center justify-center rounded-full px-1.5 font-semibold tracking-[0.05em] transition-[color,opacity] duration-250',
              compact ? (minimal ? 'h-7 text-[8.5px]' : 'h-[26px] text-[9px]') : 'h-8 text-[9px]',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
          >
            {active ? (
              <motion.span
                layoutId={`locale-thumb-${layoutId}`}
                transition={thumbTransition}
                className={cn(
                  'absolute inset-0 rounded-full',
                  minimal
                    ? 'bg-background/[0.98] shadow-[0_4px_10px_rgba(15,23,42,0.05)] dark:bg-[rgba(18,20,24,0.92)] dark:shadow-[0_6px_12px_rgba(0,0,0,0.16)]'
                    : 'bg-background/[0.96] shadow-[0_6px_14px_rgba(15,23,42,0.08)] dark:bg-[rgba(18,20,24,0.94)] dark:shadow-[0_8px_14px_rgba(0,0,0,0.22)]',
                )}
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
