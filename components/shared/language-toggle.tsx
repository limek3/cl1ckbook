'use client';

import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
  minimal?: boolean;
}

function ActiveDot() {
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-[1px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-black dark:bg-white"
    />
  );
}

export function LanguageToggle({
  compact = false,
  iconOnly = false,
  className,
  minimal = false,
}: LanguageToggleProps) {
  const { locale, setLocale } = useLocale();

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setLocale(locale === 'ru' ? 'en' : 'ru')}
        className={cn(
          'relative size-8 shrink-0 rounded-none border-0 bg-transparent p-0 shadow-none',
          'text-black/42 transition-[color,opacity,transform] duration-200',
          'hover:bg-transparent hover:text-black/80 active:scale-[0.96]',
          'dark:text-white/42 dark:hover:bg-transparent dark:hover:text-white/82',
          className,
        )}
        aria-label={locale === 'ru' ? 'Язык' : 'Language'}
        title={locale === 'ru' ? 'Переключить на английский' : 'Switch to Russian'}
      >
        <Languages className="size-[15px] stroke-[1.8]" />
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
        'inline-flex shrink-0 items-center gap-4',
        minimal ? 'h-7' : 'h-8',
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
              'relative inline-flex items-center justify-center rounded-none bg-transparent p-0 outline-none',
              'transition-[color,opacity,transform] duration-200 active:scale-[0.96]',
              compact
                ? 'h-8 px-0.5 text-[10.5px] font-semibold tracking-[0.08em]'
                : 'h-8 px-0.5 text-[10.5px] font-medium',
              active
                ? 'text-black dark:text-white'
                : 'text-black/34 hover:text-black/78 dark:text-white/34 dark:hover:text-white/82',
            )}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
          >
            {option.label}

            {active ? <ActiveDot /> : null}
          </button>
        );
      })}
    </div>
  );
}