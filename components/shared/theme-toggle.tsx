'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { MonitorSmartphone, Moon, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
  minimal?: boolean;
}

type ThemeOption = 'light' | 'dark' | 'system';

function ActiveDot() {
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-[1px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-black dark:bg-white"
    />
  );
}

export function ThemeToggle({
  compact = false,
  iconOnly = false,
  className,
  minimal = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { copy, locale } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? ((theme || 'system') as ThemeOption) : 'system';

  const displayTheme = mounted
    ? resolvedTheme === 'light'
      ? 'light'
      : 'dark'
    : 'dark';

  if (iconOnly) {
    const Icon = displayTheme === 'dark' ? SunMedium : Moon;

    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setTheme(displayTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'relative size-8 shrink-0 rounded-none border-0 bg-transparent p-0 shadow-none',
          'text-black/42 transition-[color,opacity,transform] duration-200',
          'hover:bg-transparent hover:text-black/80 active:scale-[0.96]',
          'dark:text-white/42 dark:hover:bg-transparent dark:hover:text-white/82',
          className,
        )}
        aria-label={copy.app.theme}
        title={`${copy.app.theme}: ${
          displayTheme === 'dark' ? copy.app.dark : copy.app.light
        }`}
      >
        <Icon className="size-[15px] stroke-[1.8]" />
      </Button>
    );
  }

  const options: Array<{
    value: ThemeOption;
    label: string;
    shortLabel: string;
    icon: ReactNode;
  }> = [
    {
      value: 'light',
      label: copy.app.light,
      shortLabel: locale === 'ru' ? 'Свет' : 'Light',
      icon: <SunMedium className="size-[13.5px] stroke-[1.8]" />,
    },
    {
      value: 'dark',
      label: copy.app.dark,
      shortLabel: locale === 'ru' ? 'Тёмная' : 'Dark',
      icon: <Moon className="size-[13.5px] stroke-[1.8]" />,
    },
    {
      value: 'system',
      label: locale === 'ru' ? 'Системная' : 'System',
      shortLabel: locale === 'ru' ? 'Авто' : 'Auto',
      icon: <MonitorSmartphone className="size-[13.5px] stroke-[1.8]" />,
    },
  ];

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center',
        minimal ? 'h-7' : 'h-8',
        'border-l border-black/[0.08] pl-1.5 dark:border-white/[0.09]',
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
              'relative inline-flex shrink-0 items-center justify-center',
              'rounded-none border-0 bg-transparent outline-none',
              'transition-[color,opacity,transform] duration-200',
              'hover:bg-transparent active:scale-[0.96]',
              compact ? 'h-8 w-8' : 'h-8 px-2',
              active
                ? 'text-black dark:text-white'
                : 'text-black/34 hover:text-black/78 dark:text-white/34 dark:hover:text-white/82',
            )}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              {option.icon}

              {!compact ? (
                <span className="text-[10.5px] font-medium leading-none tracking-[-0.01em]">
                  {option.shortLabel}
                </span>
              ) : null}
            </span>

            {active ? <ActiveDot /> : null}
          </button>
        );
      })}
    </div>
  );
}