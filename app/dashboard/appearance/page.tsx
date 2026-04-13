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
        'appearance-segment-shell relative isolate w-full max-w-[380px] rounded-[12px] border p-1 shadow-none',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="appearance-segment-indicator pointer-events-none absolute inset-y-1 left-1 rounded-[9px] border transition-transform duration-300 ease-out"
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
                'appearance-segment-button inline-flex h-7 items-center justify-center gap-1.5 rounded-[9px] px-2 text-[11px] font-medium transition-colors duration-200',
              )}
              aria-pressed={active}
              data-active={active ? 'true' : 'false'}
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
  const options: Array<Option<ThemeOption>> = [
    {
      value: 'light',
      label: locale === 'ru' ? 'Светлая' : 'Light',
      icon: <SunMedium className="size-3.5" />,
    },
    {
      value: 'dark',
      label: locale === 'ru' ? 'Тёмная' : 'Dark',
      icon: <MoonStar className="size-3.5" />,
    },
    {
      value: 'system',
      label: locale === 'ru' ? 'Авто' : 'Auto',
      icon: <MonitorSmartphone className="size-3.5" />,
    },
  ];

  return <SegmentedControl value={value} options={options} onChange={onChange} className="max-w-[360px]" />;
}

function ThemeLookCards({
  locale,
  activeKey,
  onApply,
}: {
  locale: 'ru' | 'en';
  activeKey: string | null;
  onApply: (key: string) => void;
}) {
  const options = [
    {
      key: 'graphite',
      label: locale === 'ru' ? 'Графит' : 'Graphite',
      preview: 'dark' as const,
      accent: 'cobalt' as const,
      neutral: 'zinc' as const,
    },
    {
      key: 'velvet',
      label: locale === 'ru' ? 'Вельвет' : 'Velvet',
      preview: 'dark' as const,
      accent: 'violet' as const,
      neutral: 'pearl' as const,
    },
    {
      key: 'mist',
      label: locale === 'ru' ? 'Туман' : 'Mist',
      preview: 'light' as const,
      accent: 'sky' as const,
      neutral: 'slate' as const,
    },
    {
      key: 'linen',
      label: locale === 'ru' ? 'Лён' : 'Linen',
      preview: 'light' as const,
      accent: 'amber' as const,
      neutral: 'sand' as const,
    },
    {
      key: 'sage',
      label: locale === 'ru' ? 'Шалфей' : 'Sage',
      preview: 'light' as const,
      accent: 'teal' as const,
      neutral: 'sage' as const,
    },
    {
      key: 'rose',
      label: locale === 'ru' ? 'Пудра' : 'Powder',
      preview: 'light' as const,
      accent: 'rose' as const,
      neutral: 'pearl' as const,
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {locale === 'ru' ? 'Цветовые темы' : 'Color themes'}
      </div>
      <div className="appearance-look-grid">
        {options.map((option) => {
          const active = option.key === activeKey;
          const accent = accentPalette[option.accent];

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onApply(option.key)}
              className="appearance-look-card text-left"
              data-active={active ? 'true' : 'false'}
              data-preview={option.preview}
            >
              <div className="appearance-look-card-preview">
                <span className="appearance-look-card-topbar" />
                <div className="appearance-look-card-body">
                  <span className="appearance-look-card-side" />
                  <span className="appearance-look-card-line" />
                  <span className="appearance-look-card-line appearance-look-card-line-short" />
                </div>
                <span className="appearance-look-card-accent" style={{ background: accent.solid }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-foreground">{option.label}</span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full ring-1 ring-black/5" style={{ background: accent.solid }} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
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
              'appearance-chip-button relative flex size-[22px] items-center justify-center rounded-full border transition-transform duration-150 hover:scale-[1.04]',
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
  locale,
  onChange,
}: {
  value: AppearanceSettings['neutralTone'];
  locale: 'ru' | 'en';
  onChange: (value: AppearanceSettings['neutralTone']) => void;
}) {
  const options: Array<Option<AppearanceSettings['neutralTone']>> = [
    { value: 'zinc', label: locale === 'ru' ? 'Цинк' : 'Zinc' },
    { value: 'slate', label: locale === 'ru' ? 'Сланец' : 'Slate' },
    { value: 'stone', label: locale === 'ru' ? 'Камень' : 'Stone' },
    { value: 'pearl', label: locale === 'ru' ? 'Жемчуг' : 'Pearl' },
    { value: 'sage', label: locale === 'ru' ? 'Шалфей' : 'Sage' },
    { value: 'sand', label: locale === 'ru' ? 'Песок' : 'Sand' },
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
                  option.value === 'sand'
                    ? '#d2b89b'
                    : option.value === 'sage'
                      ? '#9db39f'
                      : option.value === 'pearl'
                        ? '#b6a8cf'
                        : option.value === 'stone'
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

function AppearancePresetCard({
  label,
  description,
  accent,
  publicAccent,
  onApply,
}: {
  label: string;
  description: string;
  accent: AppearanceSettings['accentTone'];
  publicAccent: AppearanceSettings['publicAccent'];
  onApply: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onApply}
      className="appearance-preset-card group text-left"
    >
      <span
        aria-hidden="true"
        className="appearance-preset-card-glow"
        style={{
          background: `linear-gradient(135deg, ${accentPalette[accent].soft}, ${accentPalette[publicAccent].soft})`,
        }}
      />
      <div className="appearance-preset-card-preview">
        <span className="appearance-preset-card-preview-top" />
        <div className="appearance-preset-card-preview-body">
          <span className="appearance-preset-card-preview-accent" style={{ background: accentPalette[accent].solid }} />
          <span className="appearance-preset-card-preview-line" />
          <span className="appearance-preset-card-preview-line appearance-preset-card-preview-line-short" />
        </div>
      </div>
      <div className="appearance-preset-card-head">
        <div className="appearance-preset-card-title">{label}</div>
        <div className="appearance-preset-card-swatches">
          <span style={{ background: accentPalette[accent].solid }} />
          <span style={{ background: accentPalette[publicAccent].solid }} />
        </div>
      </div>
      <div className="appearance-preset-card-description">{description}</div>
      <div className="appearance-preset-card-foot">
        <span>{accent}</span>
        <span>{publicAccent}</span>
      </div>
    </button>
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
        quickPresetsDescription: '10 аккуратных наборов для кабинета и публичной страницы.',
        activeStack: 'Сейчас активно',
        activeStackDescription: 'Активные настройки.',
        quickAccess: 'Быстрый доступ',
        quickAccessDescription: 'Цвет, нейтральная база и быстрые действия.',
        presetStudio: 'Студия',
        presetBalanced: 'Баланс',
        presetSoft: 'Мягко',
        quickReset: 'Сбросить',
        quickOpen: 'Открыть страницу',
        workspaceAction: 'Фокус-кабинет',
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
        quickPresetsDescription: '10 curated combinations for the workspace and public page.',
        activeStack: 'Current stack',
        activeStackDescription: 'Small snapshot of active choices.',
        quickAccess: 'Quick access',
        quickAccessDescription: 'Palette, neutrals, and a few fast actions.',
        presetStudio: 'Studio',
        presetBalanced: 'Balanced',
        presetSoft: 'Soft',
        quickReset: 'Reset',
        quickOpen: 'Open page',
        workspaceAction: 'Focus workspace',
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
    { value: 'flat', label: locale === 'ru' ? 'Плоско' : 'Flat' },
    { value: 'soft', label: locale === 'ru' ? 'Мягко' : 'Soft' },
    { value: 'glass', label: locale === 'ru' ? 'Стекло' : 'Glass' },
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


  const themeLookActiveKey = useMemo(() => {
    if (currentTheme === 'dark' && settings.accentTone === 'cobalt' && settings.neutralTone === 'zinc') return 'graphite';
    if (currentTheme === 'dark' && settings.accentTone === 'violet' && settings.neutralTone === 'pearl') return 'velvet';
    if (currentTheme === 'light' && settings.accentTone === 'sky' && settings.neutralTone === 'slate') return 'mist';
    if (currentTheme === 'light' && settings.accentTone === 'amber' && settings.neutralTone === 'sand') return 'linen';
    if (currentTheme === 'light' && settings.accentTone === 'teal' && settings.neutralTone === 'sage') return 'sage';
    if (currentTheme === 'light' && settings.accentTone === 'rose' && settings.neutralTone === 'pearl') return 'rose';
    return null;
  }, [currentTheme, settings.accentTone, settings.neutralTone]);

  const applyThemeLook = (key: string) => {
    if (key === 'graphite') {
      setTheme('dark');
      setSettingsBatch({ accentTone: 'cobalt', publicAccent: 'cobalt', neutralTone: 'zinc', cardStyle: 'flat' });
      return;
    }
    if (key === 'velvet') {
      setTheme('dark');
      setSettingsBatch({ accentTone: 'violet', publicAccent: 'rose', neutralTone: 'pearl', cardStyle: 'soft' });
      return;
    }
    if (key === 'mist') {
      setTheme('light');
      setSettingsBatch({ accentTone: 'sky', publicAccent: 'emerald', neutralTone: 'slate', cardStyle: 'soft' });
      return;
    }
    if (key === 'linen') {
      setTheme('light');
      setSettingsBatch({ accentTone: 'amber', publicAccent: 'peach', neutralTone: 'sand', cardStyle: 'soft' });
      return;
    }
    if (key === 'sage') {
      setTheme('light');
      setSettingsBatch({ accentTone: 'teal', publicAccent: 'emerald', neutralTone: 'sage', cardStyle: 'soft' });
      return;
    }
    if (key === 'rose') {
      setTheme('light');
      setSettingsBatch({ accentTone: 'rose', publicAccent: 'peach', neutralTone: 'pearl', cardStyle: 'soft' });
    }
  };

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
      key: 'graphite',
      label: locale === 'ru' ? 'Графит' : 'Graphite',
      description: locale === 'ru' ? 'Тёмный, собранный, без лишнего шума.' : 'Dark, tight, and clean.',
      accent: 'cobalt' as const,
      publicAccent: 'cobalt' as const,
      apply: () => {
        setTheme('dark');
        setSettingsBatch({
          accentTone: 'cobalt',
          publicAccent: 'cobalt',
          neutralTone: 'zinc',
          motion: 'fast',
          density: 'compact',
          platformWidth: 'focused',
          sidebarDensity: 'tight',
          topbarDensity: 'tight',
          radius: 'medium',
          cardStyle: 'flat',
          publicSurface: 'contrast',
          publicSectionStyle: 'dividers',
        });
      },
    },
    {
      key: 'velvet',
      label: locale === 'ru' ? 'Вельвет' : 'Velvet',
      description: locale === 'ru' ? 'Глубокая тёмная база и мягкий фиолет.' : 'Deep dark base with a soft violet accent.',
      accent: 'violet' as const,
      publicAccent: 'rose' as const,
      apply: () => {
        setTheme('dark');
        setSettingsBatch({
          accentTone: 'violet',
          publicAccent: 'rose',
          neutralTone: 'zinc',
          motion: 'smooth',
          density: 'standard',
          platformWidth: 'balanced',
          sidebarDensity: 'balanced',
          topbarDensity: 'balanced',
          radius: 'soft',
          cardStyle: 'soft',
          publicButtonStyle: 'pill',
          publicSurface: 'soft',
          publicSectionStyle: 'cards',
        });
      },
    },
    {
      key: 'mist',
      label: locale === 'ru' ? 'Туман' : 'Mist',
      description: locale === 'ru' ? 'Светлая база с холодным небесным акцентом.' : 'Light base with a cool sky accent.',
      accent: 'sky' as const,
      publicAccent: 'emerald' as const,
      apply: () => {
        setTheme('light');
        setSettingsBatch({
          accentTone: 'sky',
          publicAccent: 'emerald',
          neutralTone: 'slate',
          motion: 'smooth',
          density: 'standard',
          platformWidth: 'wide',
          sidebarDensity: 'balanced',
          topbarDensity: 'roomy',
          radius: 'soft',
          cardStyle: 'soft',
          publicHeroLayout: 'centered',
          publicButtonStyle: 'pill',
          publicSectionStyle: 'cards',
        });
      },
    },
    {
      key: 'linen',
      label: locale === 'ru' ? 'Лён' : 'Linen',
      description: locale === 'ru' ? 'Светлый, спокойный и чуть теплее.' : 'Light, calm, and slightly warmer.',
      accent: 'amber' as const,
      publicAccent: 'peach' as const,
      apply: () => {
        setTheme('light');
        setSettingsBatch({
          accentTone: 'amber',
          publicAccent: 'peach',
          neutralTone: 'stone',
          motion: 'smooth',
          density: 'airy',
          platformWidth: 'wide',
          sidebarDensity: 'roomy',
          topbarDensity: 'roomy',
          radius: 'soft',
          cardStyle: 'soft',
          publicHeroLayout: 'centered',
          publicButtonStyle: 'rounded',
          publicSurface: 'soft',
        });
      },
    },
    {
      key: 'mint',
      label: locale === 'ru' ? 'Мята' : 'Mint',
      description: locale === 'ru' ? 'Чистый зелёный набор для светлой страницы.' : 'Fresh green set for a lighter public page.',
      accent: 'emerald' as const,
      publicAccent: 'teal' as const,
      apply: () => {
        setTheme('light');
        setSettingsBatch({
          accentTone: 'emerald',
          publicAccent: 'teal',
          neutralTone: 'stone',
          motion: 'fast',
          density: 'standard',
          platformWidth: 'balanced',
          sidebarDensity: 'balanced',
          topbarDensity: 'balanced',
          radius: 'medium',
          cardStyle: 'soft',
          publicButtonStyle: 'pill',
          publicCover: 'gradient',
          publicSectionStyle: 'cards',
        });
      },
    },
    {
      key: 'noir',
      label: locale === 'ru' ? 'Нуар' : 'Noir',
      description: locale === 'ru' ? 'Контрастный тёмный интерфейс с сухими карточками.' : 'Contrast dark UI with dry, clean cards.',
      accent: 'ruby' as const,
      publicAccent: 'amber' as const,
      apply: () => {
        setTheme('dark');
        setSettingsBatch({
          accentTone: 'ruby',
          publicAccent: 'amber',
          neutralTone: 'zinc',
          motion: 'fast',
          density: 'compact',
          platformWidth: 'focused',
          sidebarDensity: 'tight',
          topbarDensity: 'tight',
          radius: 'tight',
          cardStyle: 'flat',
          publicButtonStyle: 'contrast',
          publicSurface: 'contrast',
          publicSectionStyle: 'dividers',
        });
      },
    },
    {
      key: 'powder',
      label: locale === 'ru' ? 'Пудра' : 'Powder',
      description: locale === 'ru' ? 'Светлая база и мягкие розово-персиковые акценты.' : 'Soft light base with muted pink-peach accents.',
      accent: 'rose' as const,
      publicAccent: 'peach' as const,
      apply: () => {
        setTheme('light');
        setSettingsBatch({
          accentTone: 'rose',
          publicAccent: 'peach',
          neutralTone: 'stone',
          motion: 'smooth',
          density: 'standard',
          platformWidth: 'balanced',
          sidebarDensity: 'balanced',
          topbarDensity: 'balanced',
          radius: 'soft',
          cardStyle: 'soft',
          publicButtonStyle: 'pill',
          publicHeroLayout: 'centered',
          publicSurface: 'soft',
        });
      },
    },
    {
      key: 'ocean',
      label: locale === 'ru' ? 'Океан' : 'Ocean',
      description: locale === 'ru' ? 'Холодный тёмный набор с сине-бирюзовой связкой.' : 'Cool dark setup with blue-teal accents.',
      accent: 'cobalt' as const,
      publicAccent: 'cyan' as const,
      apply: () => {
        setTheme('dark');
        setSettingsBatch({
          accentTone: 'cobalt',
          publicAccent: 'cyan',
          neutralTone: 'slate',
          motion: 'smooth',
          density: 'standard',
          platformWidth: 'balanced',
          sidebarDensity: 'balanced',
          topbarDensity: 'balanced',
          radius: 'medium',
          cardStyle: 'soft',
          publicButtonStyle: 'rounded',
          publicSurface: 'glass',
        });
      },
    },
    {
      key: 'forest',
      label: locale === 'ru' ? 'Лес' : 'Forest',
      description: locale === 'ru' ? 'Глубокий зелёный акцент и более тёплая нейтраль.' : 'Deep green accent with a warmer neutral base.',
      accent: 'teal' as const,
      publicAccent: 'lime' as const,
      apply: () => {
        setTheme('dark');
        setSettingsBatch({
          accentTone: 'teal',
          publicAccent: 'lime',
          neutralTone: 'stone',
          motion: 'smooth',
          density: 'standard',
          platformWidth: 'wide',
          sidebarDensity: 'roomy',
          topbarDensity: 'balanced',
          radius: 'soft',
          cardStyle: 'soft',
          publicButtonStyle: 'pill',
          publicHeroLayout: 'split',
          publicSectionStyle: 'cards',
        });
      },
    },
    {
      key: 'mono',
      label: locale === 'ru' ? 'Моно' : 'Mono',
      description: locale === 'ru' ? 'Нейтральный режим для тех, кто любит минимум акцента.' : 'Neutral mode with restrained accent usage.',
      accent: 'indigo' as const,
      publicAccent: 'sky' as const,
      apply: () => {
        setTheme('light');
        setSettingsBatch({
          accentTone: 'indigo',
          publicAccent: 'sky',
          neutralTone: 'slate',
          motion: 'off',
          density: 'compact',
          platformWidth: 'focused',
          sidebarDensity: 'tight',
          topbarDensity: 'tight',
          radius: 'medium',
          cardStyle: 'flat',
          publicButtonStyle: 'contrast',
          publicSurface: 'contrast',
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

        <section>
          <SectionCard title={labels.general} description={labels.generalDescription}>
            <div className="space-y-5">
              <CompactPanel title={labels.quickPresets} description={labels.quickPresetsDescription}>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                  {workspacePresets.map((preset) => (
                    <AppearancePresetCard
                      key={preset.key}
                      label={preset.label}
                      description={preset.description}
                      accent={preset.accent}
                      publicAccent={preset.publicAccent}
                      onApply={preset.apply}
                    />
                  ))}
                </div>
              </CompactPanel>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                  <SettingRow label={labels.theme} description={labels.themeDescription}>
                    <div className="space-y-3">
                      <ThemeCards value={currentTheme} locale={locale} onChange={setTheme} />
                      <ThemeLookCards locale={locale} activeKey={themeLookActiveKey} onApply={applyThemeLook} />
                    </div>
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
                      <div>
                        <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{labels.neutral}</div>
                        <NeutralTonePicker value={settings.neutralTone} locale={locale} onChange={(next) => setSetting('neutralTone', next)} />
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
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <SectionCard
            title={labels.app}
            description={labels.appDescription}
            actions={<Palette className="size-4 text-primary" />}
            className="h-fit"
          >
            <SettingRow label={labels.accent} description={labels.accentDescription}>
              <AccentPalettePicker value={settings.accentTone} onChange={(next) => setSetting('accentTone', next)} />
            </SettingRow>

            <SettingRow label={labels.neutral} description={labels.neutralDescription}>
              <NeutralTonePicker value={settings.neutralTone} locale={locale} onChange={(next) => setSetting('neutralTone', next)} />
            </SettingRow>

            <SettingRow label={labels.cards} description={labels.cardsDescription} noBorder>
              <SegmentedControl value={settings.cardStyle} options={cardOptions} onChange={(next) => setSetting('cardStyle', next)} className="max-w-none sm:max-w-[360px]" />
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
