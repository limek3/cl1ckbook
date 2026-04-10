'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MonitorSmartphone, Moon, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/locale-context';

interface ThemeToggleProps {
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
  minimal?: boolean;
}

type ThemeOption = 'light' | 'dark' | 'system';

const thumbTransition = {
  type: 'spring',
  stiffness: 560,
  damping: 38,
  mass: 0.72,
};

export function ThemeToggle({
  compact = false,
  iconOnly = false,
  className,
  minimal = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { copy, locale } = useLocale();
  const [mounted, setMounted] = useState(false);
  const layoutId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? ((theme || 'system') as ThemeOption) : 'system';
  const displayTheme = mounted ? (resolvedTheme === 'light' ? 'light' : 'dark') : 'dark';

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setTheme(displayTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'rounded-full border-0 bg-transparent text-muted-foreground shadow-none transition-colors duration-300 hover:bg-foreground/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]',
          className,
        )}
        aria-label={copy.app.theme}
        title={`${copy.app.theme}: ${displayTheme === 'dark' ? copy.app.dark : copy.app.light}`}
      >
        {displayTheme === 'dark' ? <SunMedium className="size-4" /> : <Moon className="size-4" />}
      </Button>
    );
  }

  const options: Array<{ value: ThemeOption; label: string; shortLabel: string; icon: ReactNode }> = [
    {
      value: 'light',
      label: copy.app.light,
      shortLabel: locale === 'ru' ? 'Светлая' : 'Light',
      icon: <SunMedium className={cn(minimal ? 'size-3' : 'size-3.25')} />,
    },
    {
      value: 'dark',
      label: copy.app.dark,
      shortLabel: locale === 'ru' ? 'Тёмная' : 'Dark',
      icon: <Moon className={cn(minimal ? 'size-3' : 'size-3.25')} />,
    },
    {
      value: 'system',
      label: locale === 'ru' ? 'Системная' : 'System',
      shortLabel: locale === 'ru' ? 'Авто' : 'Auto',
      icon: <MonitorSmartphone className={cn(minimal ? 'size-3' : 'size-3.25')} />,
    },
  ];

  return (
    <div
      className={cn(
        'inline-grid grid-cols-3 rounded-full backdrop-blur-sm',
        minimal
          ? 'gap-0 bg-foreground/[0.03] p-[2px] shadow-none dark:bg-white/[0.035]'
          : 'gap-0.5 bg-foreground/[0.04] p-[3px] shadow-none dark:bg-white/[0.04]',
        compact ? (minimal ? 'min-w-[92px]' : 'min-w-[82px]') : 'min-w-[214px]',
        className,
      )}
    >
      {options.map((option) => {
        const active = currentTheme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              'relative inline-flex items-center justify-center rounded-full px-1.5 font-medium transition-[color,opacity] duration-250',
              compact ? (minimal ? 'h-7 text-[9px]' : 'h-[26px] text-[10px]') : 'h-8 text-[10px]',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
          >
            {active ? (
              <motion.span
                layoutId={`theme-thumb-${layoutId}`}
                transition={thumbTransition}
                className={cn(
                  'absolute inset-0 rounded-full',
                  minimal
                    ? 'bg-background/[0.98] shadow-[0_4px_10px_rgba(15,23,42,0.05)] dark:bg-[rgba(18,20,24,0.92)] dark:shadow-[0_6px_12px_rgba(0,0,0,0.16)]'
                    : 'bg-background/[0.96] shadow-[0_6px_14px_rgba(15,23,42,0.08)] dark:bg-[rgba(18,20,24,0.94)] dark:shadow-[0_8px_14px_rgba(0,0,0,0.22)]',
                )}
              />
            ) : null}
            <span className="relative z-10 inline-flex items-center justify-center gap-0.5">
              {option.icon}
              {!compact ? <span>{option.shortLabel}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
