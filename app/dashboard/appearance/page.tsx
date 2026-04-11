'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import {
  Brush,
  Globe2,
  LayoutTemplate,
  MonitorSmartphone,
  MoonStar,
  Palette,
  PanelsTopLeft,
  RotateCcw,
  Sparkles,
  SunMedium,
  WandSparkles,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, SectionCard } from '@/components/dashboard/workspace-ui';
import { Button } from '@/components/ui/button';
import { useAppearance, type AppearanceSettings } from '@/lib/appearance-context';
import { useApp } from '@/lib/app-context';
import { useLocale } from '@/lib/locale-context';
import { accentPalette, accentToneValues } from '@/lib/appearance-palette';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

type ThemeOption = 'light' | 'dark' | 'system';

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
};

function SettingRow({
  label,
  description,
  children,
  noBorder = false,
}: {
  label: string;
  description?: string;
  children: ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        'settings-row grid gap-3 py-3.5 lg:grid-cols-[minmax(0,180px)_1fr] lg:items-center',
        !noBorder && 'border-b border-border/80',
      )}
    >
      <div>
        <div className="settings-label text-[13px] font-semibold text-foreground">{label}</div>
        {description ? <div className="settings-caption mt-1 text-[11px] leading-5 text-muted-foreground">{description}</div> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <div
      className={cn(
        'relative isolate w-full max-w-[380px] rounded-[12px] border border-border/80 bg-card/78 p-1 shadow-none',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 rounded-[9px] border border-border/80 bg-background shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-transform duration-300 ease-out"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />

      <div
        className="relative z-10 grid w-full"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex h-7 items-center justify-center gap-1.5 rounded-[9px] px-2 text-[11px] font-medium transition-colors duration-200',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={active}
            >
              {option.icon}
              <span className="truncate"><span className="min-w-0 break-words">{option.label}</span></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeCards({
  value,
  locale,
  onChange,
}: {
  value: ThemeOption;
  locale: 'ru' | 'en';
  onChange: (value: ThemeOption) => void;
}) {
  const options: Array<Option<ThemeOption> & { previewTheme: 'light' | 'dark' | 'system' }> = [
    {
      value: 'light',
      label: locale === 'ru' ? 'Светлая' : 'Light',
      icon: <SunMedium className="size-3.5" />,
      previewTheme: 'light',
    },
    {
      value: 'dark',
      label: locale === 'ru' ? 'Тёмная' : 'Dark',
      icon: <MoonStar className="size-3.5" />,
      previewTheme: 'dark',
    },
    {
      value: 'system',
      label: locale === 'ru' ? 'Автоматически' : 'Auto',
      icon: <MonitorSmartphone className="size-3.5" />,
      previewTheme: 'system',
    },
  ];

  return (
    <div className="appearance-theme-grid grid grid-cols-3 gap-2">
      {options.map((option) => {
        const active = option.value === value;
        const isDarkPreview = option.previewTheme === 'dark';

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'appearance-theme-option min-w-0 rounded-[16px] border p-2.5 text-left transition-[background-color,border-color,box-shadow] duration-200',
              active
                ? 'border-border bg-accent/34 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'
                : 'border-border/80 bg-card/80 hover:bg-accent/18',
            )}
          >
            <div
              className={cn(
                'relative h-12 overflow-hidden rounded-[12px] border',
                isDarkPreview ? 'border-white/8 bg-[#07090c]' : 'border-black/8 bg-[#f4f5f7]',
              )}
            >
              <div className={cn('absolute inset-x-0 top-0 h-3.5', isDarkPreview ? 'bg-[#10141a]' : 'bg-white')} />
              <div className="absolute left-2.5 top-1.5 flex items-center gap-1">
                <span className={cn('size-1.5 rounded-full', isDarkPreview ? 'bg-white/28' : 'bg-black/18')} />
                <span className={cn('size-1.5 rounded-full', isDarkPreview ? 'bg-white/18' : 'bg-black/12')} />
                <span className={cn('size-1.5 rounded-full', isDarkPreview ? 'bg-white/18' : 'bg-black/12')} />
              </div>
              <div className="absolute inset-x-2.5 bottom-2.5 grid grid-cols-[18px_1fr] gap-2">
                <div className={cn('rounded-[7px]', isDarkPreview ? 'bg-white/6' : 'bg-black/6')} />
                <div className="space-y-1.5">
                  <div className={cn('h-1.5 rounded-full', isDarkPreview ? 'bg-white/10' : 'bg-black/8')} />
                  <div className={cn('h-1.5 w-3/4 rounded-full', isDarkPreview ? 'bg-white/8' : 'bg-black/6')} />
                </div>
              </div>
            </div>

            <div className="appearance-theme-option-label mt-2 flex min-w-0 items-center gap-1.5 text-[12px] font-medium leading-tight text-foreground">
              {option.icon}
              <span className="min-w-0 break-words">{option.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AccentPalettePicker({
  value,
  onChange,
}: {
  value: AppearanceSettings['accentTone'];
  onChange: (value: AppearanceSettings['accentTone']) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {accentToneValues.map((tone) => {
        const active = tone === value;
        const palette = accentPalette[tone];

        return (
          <button
            key={tone}
            type="button"
            onClick={() => onChange(tone)}
            className={cn(
              'relative flex size-[22px] items-center justify-center rounded-full border transition-transform duration-150 hover:scale-[1.04]',
              active
                ? 'border-white/80 shadow-[0_0_0_2px_color-mix(in_srgb,var(--foreground)_12%,transparent)]'
                : 'border-transparent',
            )}
            style={{ background: palette.solid }}
            aria-label={tone}
            title={tone}
          >
            {active ? <span className="size-1.5 rounded-full bg-white/90" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function NeutralTonePicker({
  value,
  onChange,
}: {
  value: AppearanceSettings['neutralTone'];
  onChange: (value: AppearanceSettings['neutralTone']) => void;
}) {
  const options: Array<Option<AppearanceSettings['neutralTone']>> = [
    { value: 'zinc', label: locale === 'ru' ? 'Цинк' : 'Zinc' },
    { value: 'slate', label: locale === 'ru' ? 'Сланец' : 'Slate' },
    { value: 'stone', label: locale === 'ru' ? 'Камень' : 'Stone' },
  ];

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-7 items-center gap-2 rounded-full border px-3 text-[11px] font-medium transition',
              active
                ? 'border-border bg-background text-foreground shadow-none'
                : 'border-border/80 bg-card/80 text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <span
              className="size-2.5 rounded-full border border-black/10"
              style={{
                background:
                  option.value === 'stone'
                    ? '#b4a494'
                    : option.value === 'slate'
                      ? '#94a3b8'
                      : '#a1a1aa',
              }}
            />
            <span className="min-w-0 break-words">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CompactPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-border/80 bg-background/44 p-3">
      <div className="text-[12px] font-semibold text-foreground">{title}</div>
      {description ? <div className="mt-1 text-[10.5px] leading-5 text-muted-foreground">{description}</div> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SummaryBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-border/80 bg-card/72 px-3 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[11px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function WorkspacePreview({
  settings,
  displayTheme,
  locale,
}: {
  settings: AppearanceSettings;
  displayTheme: 'light' | 'dark';
  locale: 'ru' | 'en';
}) {
  const isDark = displayTheme === 'dark';
  const accent = accentPalette[settings.accentTone];

  return (
    <div className={cn('rounded-[20px] border p-3.5', isDark ? 'border-white/8 bg-[#07090c]' : 'border-black/8 bg-[#f5f6f8]')}>
      <div className={cn('rounded-[16px] border p-3', isDark ? 'border-white/8 bg-[#0b0e13]' : 'border-black/8 bg-white')}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={cn('text-[11px] font-semibold', isDark ? 'text-white/92' : 'text-black/88')}>
              {locale === 'ru' ? 'Кабинет' : 'Dashboard'}
            </div>
            <div className={cn('text-[10px]', isDark ? 'text-white/46' : 'text-black/46')}>
              {locale === 'ru' ? 'Предпросмотр' : 'Preview'}
            </div>
          </div>
          <span className="rounded-full px-2 py-1 text-[9px] font-medium text-white" style={{ background: accent.solid }}>
            {settings.accentTone}
          </span>
        </div>

        <div className="mt-3 grid gap-2 grid-cols-3">
          {[42, 58, 34].map((width, index) => (
            <div
              key={`${width}-${index}`}
              className={cn('h-8 rounded-[10px]', isDark ? 'bg-white/6' : 'bg-black/[0.05]')}
              style={index === 0 ? { background: accent.soft } : undefined}
            />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[74px_1fr] gap-3">
          <div className={cn('rounded-[12px] border p-2', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-black/[0.02]')}>
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={cn('h-7 rounded-[9px]', item === 2 ? '' : isDark ? 'bg-white/6' : 'bg-black/[0.05]')}
                  style={item === 2 ? { background: accent.soft } : undefined}
                />
              ))}
            </div>
          </div>

          <div className={cn('rounded-[12px] border p-3', isDark ? 'border-white/8 bg-white/[0.03]' : 'border-black/8 bg-black/[0.02]')}>
            <div className="flex h-16 items-end gap-2">
              {[22, 38, 30, 52, 28, 44].map((height, index) => (
                <div
                  key={`${height}-${index}`}
                  className="flex-1 rounded-full"
                  style={{
                    height: Math.max(16, Math.round(height * 0.72)),
                    background: index % 2 === 0 ? accent.solid : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(13,16,22,0.08)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicPreview({
  settings,
  locale,
}: {
  settings: AppearanceSettings;
  locale: 'ru' | 'en';
}) {
  const accent = accentPalette[settings.publicAccent];

  return (
    <div className="rounded-[20px] border border-border/80 bg-card/88 p-3.5">
      <div className="rounded-[16px] p-3.5" style={{ background: accent.gradient }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[12px] font-semibold text-white">Anna Petrova</div>
            <div className="text-[10px] text-white/70">
              {locale === 'ru' ? 'Страница мастера' : 'Master page'}
            </div>
          </div>
          <span className="rounded-full border border-white/18 bg-white/12 px-2 py-1 text-[9px] font-medium text-white">
            {settings.publicAccent}
          </span>
        </div>

        <div className="mt-3 rounded-[16px] border border-white/18 bg-white/90 p-3.5 text-black/80 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
          <div className="grid grid-cols-2 gap-2">
            {[locale === 'ru' ? 'Маникюр' : 'Manicure', locale === 'ru' ? 'Окрашивание' : 'Color', locale === 'ru' ? 'Уход' : 'Care', locale === 'ru' ? 'Укладка' : 'Styling'].map((item) => (
              <div key={item} className="rounded-[11px] border border-black/8 bg-white px-3 py-2 text-[9.5px]">
                {item}
              </div>
            ))}
          </div>

          <button
            type="button"
            className={cn(
              'mt-3 w-full px-4 py-2 text-[10px] font-semibold text-white',
              settings.publicButtonStyle === 'pill'
                ? 'rounded-full'
                : settings.publicButtonStyle === 'rounded'
                  ? 'rounded-[14px]'
                  : 'rounded-[11px]',
            )}
            style={{ background: settings.publicButtonStyle === 'contrast' ? '#0d1016' : accent.solid }}
          >
            {locale === 'ru' ? 'Открыть запись' : 'Open booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardAppearancePage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { settings, setSetting, setSettingsBatch, resetSettings } = useAppearance();
  const { locale } = useLocale();
  const { ownedProfile } = useApp();
  const isMobile = useMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (mounted ? theme || 'system' : 'system') as ThemeOption;
  const displayTheme = mounted ? (resolvedTheme === 'light' ? 'light' : 'dark') : 'dark';
  const publicHref = ownedProfile ? `/m/${ownedProfile.slug}` : '/create-profile';

  const labels = locale === 'ru'
    ? {
        badge: 'Настройки / интерфейс',
        title: 'Внешний вид',
        description: 'Тема, акцент и стиль страницы.',
        general: 'Общие настройки',
        generalDescription: 'Базовые параметры интерфейса приложения.',
        app: 'Внешний вид приложения',
        appDescription: 'Тема, акцент и текущее состояние.',
        publicPage: 'Публичная страница',
        publicDescription: 'Стиль страницы и записи.',
        theme: 'Тема',
        themeDescription: 'Светлая, тёмная или системная тема.',
        platformWidth: 'Ширина платформы',
        platformWidthDescription: 'Ширина кабинета.',
        sidebarDensity: 'Боковое меню',
        sidebarDensityDescription: 'Плотность меню.',
        topbarDensity: 'Верхняя панель',
        topbarDensityDescription: 'Высота верхней полосы.',
        motion: 'Анимация отклика',
        motionDescription: 'Анимации интерфейса.',
        density: 'Плотность',
        densityDescription: 'Плотность интерфейса.',
        radius: 'Радиус',
        radiusDescription: 'Радиус карточек и контролов.',
        cards: 'Карточки',
        cardsDescription: 'Характер поверхностей на фоне холста.',
        accent: 'Цвет темы',
        accentDescription: 'Акцентный цвет.',
        neutral: 'Нейтральный цвет',
        neutralDescription: 'База для фона и карточек.',
        cover: 'Обложка',
        coverDescription: 'Обложка страницы.',
        publicAccent: 'Акцент страницы',
        publicAccentDescription: 'Цвет записи и акцентов.',
        publicButton: 'Кнопка записи',
        publicButtonDescription: 'Форма кнопки записи.',
        publicCard: 'Карточка мастера',
        publicCardDescription: 'Стиль главного блока.',
        services: 'Услуги',
        servicesDescription: 'Вид списка услуг.',
        booking: 'Блок записи',
        bookingDescription: 'Выделение записи.',
        hero: 'Верхний блок',
        heroDescription: 'Структура верхнего блока.',
        surface: 'Характер секций',
        surfaceDescription: 'Общее ощущение вторичных секций.',
        sections: 'Вторичные секции',
        sectionsDescription: 'Контакты, отзывы и секции.',
        gallery: 'Галерея работ',
        galleryDescription: 'Показ работ.',
        reset: 'Сбросить всё',
        openPage: 'Открыть страницу',
        workspacePreview: 'Предпросмотр кабинета',
        workspacePreviewDescription: 'Предпросмотр кабинета.',
        pagePreview: 'Предпросмотр страницы',
        pagePreviewDescription: 'Предпросмотр страницы.',
        quickPresets: 'Готовые наборы',
        quickPresetsDescription: 'Быстрые пресеты.',
        activeStack: 'Сейчас активно',
        activeStackDescription: 'Активные настройки.',
        quickAccess: 'Быстрый доступ',
        quickAccessDescription: 'Главные настройки без прокрутки.',
        presetStudio: 'Студия',
        presetBalanced: 'Баланс',
        presetSoft: 'Мягко',
        quickReset: 'Сбросить настройки',
        quickOpen: 'Открыть страницу',
        workspaceAction: 'Тёмный кабинет',
        publicAction: 'Мягкая страница',
      }
    : {
        badge: locale === 'ru' ? 'Настройки / оформление' : 'Settings / interface',
        title: 'Appearance',
        description: 'A calmer and more minimal page for theme, palette, and public page settings.',
        general: 'General settings',
        generalDescription: 'Core application interface settings.',
        app: 'Application appearance',
        appDescription: 'Accent color, quick recipes, and a live snapshot of the current interface state.',
        publicPage: locale === 'ru' ? 'Публичная страница' : 'Public page',
        publicDescription: 'Master page and booking block styling.',
        theme: 'Theme',
        themeDescription: 'Choose light, dark, or system mode.',
        platformWidth: 'Platform width',
        platformWidthDescription: 'How wide the workspace canvas opens up.',
        sidebarDensity: 'Sidebar rhythm',
        sidebarDensityDescription: 'Density of menu links and spacing between groups.',
        topbarDensity: 'Top bar',
        topbarDensityDescription: 'Height and breathing room in the top controls row.',
        motion: 'Response animation',
        motionDescription: 'Hover, dropdown, and other transitions.',
        density: 'Density',
        densityDescription: 'Control height and spacing rhythm.',
        radius: 'Radius',
        radiusDescription: 'How soft card and control corners feel.',
        cards: 'Cards',
        cardsDescription: 'Surface character on the canvas.',
        accent: 'Theme color',
        accentDescription: 'Changes buttons, accents, and active states.',
        neutral: 'Neutral tone',
        neutralDescription: 'Base for canvas and cards.',
        cover: 'Cover',
        coverDescription: 'First impression of the public page.',
        publicAccent: 'Page accent',
        publicAccentDescription: 'Main color for booking CTA and highlight blocks.',
        publicButton: 'Booking button',
        publicButtonDescription: 'Shape of the primary CTA.',
        publicCard: 'Master card',
        publicCardDescription: 'Presentation of the main hero block.',
        services: 'Services',
        servicesDescription: 'How to present the service list.',
        booking: 'Booking block',
        bookingDescription: 'How prominent the booking scenario feels.',
        hero: 'Hero layout',
        heroDescription: 'Top section composition.',
        surface: 'Surface mood',
        surfaceDescription: 'Overall feeling of secondary sections.',
        sections: 'Secondary sections',
        sectionsDescription: 'FAQ, contacts, reviews, and support blocks.',
        gallery: 'Work gallery',
        galleryDescription: 'How portfolio images are displayed.',
        reset: 'Reset all',
        openPage: 'Open page',
        workspacePreview: 'Workspace preview',
        workspacePreviewDescription: 'Dark mode no longer tints menu surfaces when the accent changes.',
        pagePreview: 'Page preview',
        pagePreviewDescription: 'Quick look at the public card.',
        quickPresets: 'Quick presets',
        quickPresetsDescription: 'Useful combinations without tweaking one by one.',
        activeStack: 'Current stack',
        activeStackDescription: 'Small snapshot of active choices.',
        quickAccess: 'Quick access',
        quickAccessDescription: 'Primary controls without extra scrolling.',
        presetStudio: 'Studio',
        presetBalanced: 'Balanced',
        presetSoft: 'Soft',
        quickReset: 'Reset defaults',
        quickOpen: 'Open page',
        workspaceAction: 'Dark workspace',
        publicAction: 'Soft page',
      };

  const motionOptions = useMemo<Array<Option<AppearanceSettings['motion']>>>(() => [
    { value: 'off', label: locale === 'ru' ? 'Отключено' : 'Off' },
    { value: 'fast', label: locale === 'ru' ? 'Быстро' : 'Fast' },
    { value: 'smooth', label: locale === 'ru' ? 'Плавно' : 'Smooth' },
  ], [locale]);

  const densityOptions = useMemo<Array<Option<AppearanceSettings['density']>>>(() => [
    { value: 'compact', label: locale === 'ru' ? 'Компактно' : 'Compact' },
    { value: 'standard', label: locale === 'ru' ? 'Стандартно' : 'Standard' },
    { value: 'airy', label: locale === 'ru' ? 'Свободно' : 'Airy' },
  ], [locale]);

  const platformWidthOptions = useMemo<Array<Option<AppearanceSettings['platformWidth']>>>(() => [
    { value: 'focused', label: locale === 'ru' ? 'Фокус' : 'Focused' },
    { value: 'balanced', label: locale === 'ru' ? 'Баланс' : 'Balanced' },
    { value: 'wide', label: locale === 'ru' ? 'Широко' : 'Wide' },
  ], [locale]);

  const sidebarDensityOptions = useMemo<Array<Option<AppearanceSettings['sidebarDensity']>>>(() => [
    { value: 'tight', label: locale === 'ru' ? 'Плотно' : 'Tight' },
    { value: 'balanced', label: locale === 'ru' ? 'Спокойно' : 'Balanced' },
    { value: 'roomy', label: locale === 'ru' ? 'Свободно' : 'Roomy' },
  ], [locale]);

  const topbarDensityOptions = useMemo<Array<Option<AppearanceSettings['topbarDensity']>>>(() => [
    { value: 'tight', label: locale === 'ru' ? 'Компактно' : 'Compact' },
    { value: 'balanced', label: locale === 'ru' ? 'Баланс' : 'Balanced' },
    { value: 'roomy', label: locale === 'ru' ? 'Воздух' : 'Airy' },
  ], [locale]);

  const radiusOptions = useMemo<Array<Option<AppearanceSettings['radius']>>>(() => [
    { value: 'tight', label: locale === 'ru' ? 'Плотно' : 'Tight' },
    { value: 'medium', label: locale === 'ru' ? 'Средне' : 'Medium' },
    { value: 'soft', label: locale === 'ru' ? 'Мягкий' : 'Soft' },
  ], [locale]);

  const cardOptions = useMemo<Array<Option<AppearanceSettings['cardStyle']>>>(() => [
    { value: 'flat', label: locale === 'ru' ? 'Плоские' : 'Flat' },
    { value: 'soft', label: locale === 'ru' ? 'Мягкие' : 'Soft' },
    { value: 'glass', label: locale === 'ru' ? 'Лёгкое стекло' : 'Glass-lite' },
  ], [locale]);

  const publicCoverOptions = useMemo<Array<Option<AppearanceSettings['publicCover']>>>(() => [
    { value: 'gradient', label: locale === 'ru' ? 'Градиент' : 'Gradient' },
    { value: 'portrait', label: locale === 'ru' ? 'Портрет' : 'Portrait' },
    { value: 'minimal', label: locale === 'ru' ? 'Минимально' : 'Minimal' },
  ], [locale]);

  const publicButtonOptions = useMemo<Array<Option<AppearanceSettings['publicButtonStyle']>>>(() => [
    { value: 'pill', label: locale === 'ru' ? 'Капсула' : 'Pill' },
    { value: 'rounded', label: locale === 'ru' ? 'Скруглённая' : 'Rounded' },
    { value: 'contrast', label: locale === 'ru' ? 'Контрастная' : 'Contrast' },
  ], [locale]);

  const publicCardOptions = useMemo<Array<Option<AppearanceSettings['publicCardStyle']>>>(() => [
    { value: 'editorial', label: locale === 'ru' ? 'Редакционная' : 'Editorial' },
    { value: 'soft', label: locale === 'ru' ? 'Мягкая' : 'Soft' },
    { value: 'compact', label: locale === 'ru' ? 'Компактная' : 'Compact' },
  ], [locale]);

  const publicServicesOptions = useMemo<Array<Option<AppearanceSettings['publicServicesStyle']>>>(() => [
    { value: 'grid', label: locale === 'ru' ? 'Сетка' : 'Grid' },
    { value: 'chips', label: locale === 'ru' ? 'Чипы' : 'Chips' },
    { value: 'stacked', label: locale === 'ru' ? 'Список' : 'Stacked' },
  ], [locale]);

  const publicBookingOptions = useMemo<Array<Option<AppearanceSettings['publicBookingStyle']>>>(() => [
    { value: 'panel', label: locale === 'ru' ? 'Панель' : 'Panel' },
    { value: 'step', label: locale === 'ru' ? 'Шаги' : 'Step' },
    { value: 'minimal', label: locale === 'ru' ? 'Минимальный' : 'Minimal' },
  ], [locale]);

  const heroOptions = useMemo<Array<Option<AppearanceSettings['publicHeroLayout']>>>(() => [
    { value: 'split', label: locale === 'ru' ? 'Разделённый' : 'Split' },
    { value: 'centered', label: locale === 'ru' ? 'По центру' : 'Centered' },
    { value: 'compact', label: locale === 'ru' ? 'Компактный' : 'Compact' },
  ], [locale]);

  const surfaceOptions = useMemo<Array<Option<AppearanceSettings['publicSurface']>>>(() => [
    { value: 'soft', label: locale === 'ru' ? 'Мягкая' : 'Soft' },
    { value: 'contrast', label: locale === 'ru' ? 'Контрастная' : 'Contrast' },
    { value: 'glass', label: locale === 'ru' ? 'Стекло' : 'Glass' },
  ], [locale]);

  const sectionOptions = useMemo<Array<Option<AppearanceSettings['publicSectionStyle']>>>(() => [
    { value: 'cards', label: locale === 'ru' ? 'Карточки' : 'Cards' },
    { value: 'dividers', label: locale === 'ru' ? 'Разделители' : 'Dividers' },
    { value: 'minimal', label: locale === 'ru' ? 'Минимально' : 'Minimal' },
  ], [locale]);

  const galleryOptions = useMemo<Array<Option<AppearanceSettings['publicGalleryStyle']>>>(() => [
    { value: 'grid', label: locale === 'ru' ? 'Сетка' : 'Grid' },
    { value: 'editorial', label: locale === 'ru' ? 'Редакционная' : 'Editorial' },
    { value: 'compact', label: locale === 'ru' ? 'Компактная' : 'Compact' },
  ], [locale]);

  const optionMaps = {
    platformWidth: Object.fromEntries(platformWidthOptions.map((option) => [option.value, option.label])),
    sidebarDensity: Object.fromEntries(sidebarDensityOptions.map((option) => [option.value, option.label])),
    topbarDensity: Object.fromEntries(topbarDensityOptions.map((option) => [option.value, option.label])),
    motion: Object.fromEntries(motionOptions.map((option) => [option.value, option.label])),
    density: Object.fromEntries(densityOptions.map((option) => [option.value, option.label])),
    radius: Object.fromEntries(radiusOptions.map((option) => [option.value, option.label])),
    cardStyle: Object.fromEntries(cardOptions.map((option) => [option.value, option.label])),
  } as const;

  const workspacePresets = [
    {
      key: 'studio',
      label: labels.presetStudio,
      apply: () => {
        setTheme('dark');
        setSettingsBatch({
          motion: 'fast',
          density: 'compact',
          platformWidth: 'focused',
          sidebarDensity: 'tight',
          topbarDensity: 'tight',
          radius: 'tight',
          cardStyle: 'flat',
          neutralTone: 'zinc',
          publicSurface: 'contrast',
          publicSectionStyle: 'dividers',
        });
      },
    },
    {
      key: 'balanced',
      label: labels.presetBalanced,
      apply: () => {
        setTheme('dark');
        setSettingsBatch({
          motion: 'smooth',
          density: 'standard',
          platformWidth: 'balanced',
          sidebarDensity: 'balanced',
          topbarDensity: 'balanced',
          radius: 'medium',
          cardStyle: 'soft',
          neutralTone: 'zinc',
          publicSurface: 'soft',
          publicSectionStyle: 'cards',
        });
      },
    },
    {
      key: 'soft',
      label: labels.presetSoft,
      apply: () => {
        setTheme('dark');
        setSettingsBatch({
          motion: 'smooth',
          density: 'standard',
          platformWidth: 'wide',
          sidebarDensity: 'roomy',
          topbarDensity: 'balanced',
          radius: 'soft',
          cardStyle: 'soft',
          neutralTone: 'stone',
          publicSurface: 'soft',
          publicButtonStyle: 'pill',
        });
      },
    },
  ];

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide dashboard-mobile-appearance space-y-4 md:space-y-5">
        <DashboardHeader
          badge={labels.badge}
          title={labels.title}
          description={isMobile ? (locale === 'ru' ? 'Тема, плотность, акцент и пресеты.' : 'Theme, density, accent, presets.') : labels.description}
          actions={(
            <>
              <Button type="button" variant="outline" onClick={resetSettings} className="shadow-none">
                <RotateCcw className="size-4" />
                {labels.reset}
              </Button>
              <Button asChild>
                <Link href={publicHref}>
                  <Globe2 className="size-4" />
                  {labels.openPage}
                </Link>
              </Button>
            </>
          )}
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SectionCard title={labels.general} description={labels.generalDescription}>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div>
                <SettingRow label={labels.theme} description={labels.themeDescription}>
                  <ThemeCards value={currentTheme} locale={locale} onChange={setTheme} />
                </SettingRow>

                <SettingRow label={labels.platformWidth} description={labels.platformWidthDescription}>
                  <SegmentedControl value={settings.platformWidth} options={platformWidthOptions} onChange={(next) => setSetting('platformWidth', next)} />
                </SettingRow>

                <SettingRow label={labels.sidebarDensity} description={labels.sidebarDensityDescription}>
                  <SegmentedControl value={settings.sidebarDensity} options={sidebarDensityOptions} onChange={(next) => setSetting('sidebarDensity', next)} />
                </SettingRow>

                <SettingRow label={labels.topbarDensity} description={labels.topbarDensityDescription}>
                  <SegmentedControl value={settings.topbarDensity} options={topbarDensityOptions} onChange={(next) => setSetting('topbarDensity', next)} />
                </SettingRow>

                <SettingRow label={labels.motion} description={labels.motionDescription}>
                  <SegmentedControl value={settings.motion} options={motionOptions} onChange={(next) => setSetting('motion', next)} />
                </SettingRow>

                <SettingRow label={labels.density} description={labels.densityDescription}>
                  <SegmentedControl value={settings.density} options={densityOptions} onChange={(next) => setSetting('density', next)} />
                </SettingRow>

                <SettingRow label={labels.radius} description={labels.radiusDescription} noBorder>
                  <SegmentedControl value={settings.radius} options={radiusOptions} onChange={(next) => setSetting('radius', next)} />
                </SettingRow>
              </div>

              <div className="space-y-3">
                <CompactPanel title={labels.quickPresets} description={labels.quickPresetsDescription}>
                  <div className="grid gap-2">
                    {workspacePresets.map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={preset.apply}
                        className="inline-flex h-8 items-center justify-between rounded-[10px] border border-border/80 bg-card/76 px-3 text-[11px] font-medium text-foreground transition hover:bg-accent/50"
                      >
                        <span>{preset.label}</span>
                        <WandSparkles className="size-3.5 text-primary" />
                      </button>
                    ))}
                  </div>
                </CompactPanel>

                <CompactPanel title={labels.activeStack} description={labels.activeStackDescription}>
                  <div className="grid gap-2">
                    <SummaryBadge label={labels.platformWidth} value={optionMaps.platformWidth[settings.platformWidth]} />
                    <SummaryBadge label={labels.sidebarDensity} value={optionMaps.sidebarDensity[settings.sidebarDensity]} />
                    <SummaryBadge label={labels.topbarDensity} value={optionMaps.topbarDensity[settings.topbarDensity]} />
                    <SummaryBadge label={labels.motion} value={optionMaps.motion[settings.motion]} />
                    <SummaryBadge label={labels.density} value={optionMaps.density[settings.density]} />
                    <SummaryBadge label={labels.radius} value={optionMaps.radius[settings.radius]} />
                  </div>
                </CompactPanel>

                <CompactPanel title={labels.quickAccess} description={labels.quickAccessDescription}>
                  <div className="space-y-3">
                    <div>
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{labels.accent}</div>
                      <AccentPalettePicker value={settings.accentTone} onChange={(next) => setSetting('accentTone', next)} />
                    </div>
                    <div>
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{labels.publicAccent}</div>
                      <AccentPalettePicker value={settings.publicAccent} onChange={(next) => setSetting('publicAccent', next)} />
                    </div>
                    <div className="grid gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTheme('dark');
                          setSetting('platformWidth', 'focused');
                          setSetting('sidebarDensity', 'tight');
                          setSetting('topbarDensity', 'tight');
                        }}
                        className="inline-flex h-9 items-center justify-between rounded-[12px] border border-border/80 bg-card/76 px-3 text-[11px] font-medium text-foreground transition hover:bg-accent/50"
                      >
                        <span>{labels.workspaceAction}</span>
                        <PanelsTopLeft className="size-3.5 text-primary" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTheme('light');
                          setSetting('platformWidth', 'wide');
                          setSetting('publicHeroLayout', 'centered');
                          setSetting('publicButtonStyle', 'pill');
                        }}
                        className="inline-flex h-9 items-center justify-between rounded-[12px] border border-border/80 bg-card/76 px-3 text-[11px] font-medium text-foreground transition hover:bg-accent/50"
                      >
                        <span>{labels.publicAction}</span>
                        <LayoutTemplate className="size-3.5 text-primary" />
                      </button>
                    </div>
                  </div>
                </CompactPanel>
              </div>
            </div>
          </SectionCard>

          <div className="space-y-5">
            <SectionCard title={labels.workspacePreview} description={labels.workspacePreviewDescription}>
              <WorkspacePreview settings={settings} displayTheme={displayTheme} locale={locale} />
            </SectionCard>

            <SectionCard title={labels.pagePreview} description={labels.pagePreviewDescription}>
              <PublicPreview settings={settings} locale={locale} />
            </SectionCard>

            <SectionCard
              title={locale === 'ru' ? 'Пульт пресетов' : 'Preset rack'}
              description={locale === 'ru' ? 'Быстрые сценарии для кабинета и публичной страницы без лишней прокрутки.' : 'Fast scenarios for the workspace and public page without extra scrolling.'}
              actions={<Sparkles className="size-4 text-primary" />}
            >
              <div className="grid gap-2">
                {workspacePresets.map((preset) => (
                  <Button key={preset.key} type="button" variant="outline" className="justify-between shadow-none" onClick={preset.apply}>
                    {preset.label}
                    <WandSparkles className="size-4 text-primary" />
                  </Button>
                ))}

                <Button type="button" variant="outline" className="justify-between shadow-none" onClick={resetSettings}>
                  {labels.reset}
                  <RotateCcw className="size-4 text-primary" />
                </Button>

                <Button asChild variant="outline" className="justify-between shadow-none">
                  <Link href={publicHref}>
                    {labels.openPage}
                    <Globe2 className="size-4 text-primary" />
                  </Link>
                </Button>
              </div>
            </SectionCard>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <SectionCard
            title={labels.app}
            description={labels.appDescription}
            actions={<Palette className="size-4 text-primary" />}
            className="h-fit"
          >
            <SettingRow label={labels.accent} description={labels.accentDescription} noBorder>
              <AccentPalettePicker value={settings.accentTone} onChange={(next) => setSetting('accentTone', next)} />
            </SettingRow>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[16px] border border-border bg-accent/20 p-4">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {locale === 'ru' ? 'Текущий режим' : 'Current mode'}
                </div>
                <div className="mt-2 text-[14px] font-semibold text-foreground">
                  {displayTheme === 'dark' ? (locale === 'ru' ? 'Тёмный кабинет' : 'Dark workspace') : (locale === 'ru' ? 'Светлый режим' : 'Light mode')}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="workspace-pill">{optionMaps.platformWidth[settings.platformWidth]}</span>
                  <span className="workspace-pill">{optionMaps.sidebarDensity[settings.sidebarDensity]}</span>
                  <span className="workspace-pill">{optionMaps.radius[settings.radius]}</span>
                </div>
              </div>

              <div className="rounded-[16px] border border-border bg-accent/20 p-4">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {locale === 'ru' ? 'Публичная страница' : 'Public page'}
                </div>
                <div className="mt-2 text-[14px] font-semibold text-foreground">
                  {optionMaps.motion[settings.motion]} · {optionMaps.density[settings.density]}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="workspace-pill">{settings.publicHeroLayout}</span>
                  <span className="workspace-pill">{settings.publicButtonStyle}</span>
                  <span className="workspace-pill">{settings.publicSectionStyle}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="justify-start shadow-none"
                onClick={() => {
                  setTheme('dark');
                  setSetting('cardStyle', 'soft');
                  setSetting('platformWidth', 'focused');
                  setSetting('sidebarDensity', 'tight');
                  setSetting('topbarDensity', 'tight');
                  setSetting('publicAccent', settings.accentTone);
                }}
              >
                <PanelsTopLeft className="size-4" />
                {labels.workspaceAction}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="justify-start shadow-none"
                onClick={() => {
                  setTheme('light');
                  setSetting('platformWidth', 'wide');
                  setSetting('sidebarDensity', 'balanced');
                  setSetting('topbarDensity', 'roomy');
                  setSetting('publicButtonStyle', 'pill');
                  setSetting('publicCover', 'gradient');
                }}
              >
                <LayoutTemplate className="size-4" />
                {labels.publicAction}
              </Button>

              <Button type="button" variant="outline" className="justify-start shadow-none" onClick={resetSettings}>
                <RotateCcw className="size-4" />
                {labels.quickReset}
              </Button>

              <Button asChild variant="outline" className="justify-start shadow-none">
                <Link href={publicHref}>
                  <Globe2 className="size-4" />
                  {labels.quickOpen}
                </Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title={labels.publicPage}
            description={labels.publicDescription}
            actions={<Brush className="size-4 text-primary" />}
          >
            <div className="grid gap-x-8 xl:grid-cols-2">
              <div>
                <SettingRow label={labels.cover} description={labels.coverDescription}>
                  <SegmentedControl value={settings.publicCover} options={publicCoverOptions} onChange={(next) => setSetting('publicCover', next)} />
                </SettingRow>

                <SettingRow label={labels.publicAccent} description={labels.publicAccentDescription}>
                  <AccentPalettePicker value={settings.publicAccent} onChange={(next) => setSetting('publicAccent', next)} />
                </SettingRow>

                <SettingRow label={labels.publicButton} description={labels.publicButtonDescription}>
                  <SegmentedControl value={settings.publicButtonStyle} options={publicButtonOptions} onChange={(next) => setSetting('publicButtonStyle', next)} />
                </SettingRow>

                <SettingRow label={labels.publicCard} description={labels.publicCardDescription}>
                  <SegmentedControl value={settings.publicCardStyle} options={publicCardOptions} onChange={(next) => setSetting('publicCardStyle', next)} />
                </SettingRow>

                <SettingRow label={labels.services} description={labels.servicesDescription} noBorder>
                  <SegmentedControl value={settings.publicServicesStyle} options={publicServicesOptions} onChange={(next) => setSetting('publicServicesStyle', next)} />
                </SettingRow>
              </div>

              <div>
                <SettingRow label={labels.booking} description={labels.bookingDescription}>
                  <SegmentedControl value={settings.publicBookingStyle} options={publicBookingOptions} onChange={(next) => setSetting('publicBookingStyle', next)} />
                </SettingRow>

                <SettingRow label={labels.hero} description={labels.heroDescription}>
                  <SegmentedControl value={settings.publicHeroLayout} options={heroOptions} onChange={(next) => setSetting('publicHeroLayout', next)} />
                </SettingRow>

                <SettingRow label={labels.surface} description={labels.surfaceDescription}>
                  <SegmentedControl value={settings.publicSurface} options={surfaceOptions} onChange={(next) => setSetting('publicSurface', next)} />
                </SettingRow>

                <SettingRow label={labels.sections} description={labels.sectionsDescription}>
                  <SegmentedControl value={settings.publicSectionStyle} options={sectionOptions} onChange={(next) => setSetting('publicSectionStyle', next)} />
                </SettingRow>

                <SettingRow label={labels.gallery} description={labels.galleryDescription} noBorder>
                  <SegmentedControl value={settings.publicGalleryStyle} options={galleryOptions} onChange={(next) => setSetting('publicGalleryStyle', next)} />
                </SettingRow>
              </div>
            </div>
          </SectionCard>
        </section>

      </div>
    </WorkspaceShell>
  );
}
