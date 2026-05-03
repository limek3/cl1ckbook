// app/dashboard/clients/page.tsx
'use client';

import Link from 'next/link';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Clock3,
  MessageCircleMore,
  NotebookPen,
  Phone,
  Search,
  Sparkles,
  SquarePen,
  Star,
  TriangleAlert,
  TrendingUp,
  Users2,
  Wallet,
  X,
} from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useWorkspaceSection } from '@/hooks/use-workspace-section';
import { useAppearance } from '@/lib/appearance-context';
import { accentPalette } from '@/lib/appearance-palette';
import { type ClientInsight, formatCurrency } from '@/lib/master-workspace';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';
type ClientFilter = 'all' | 'new' | 'regular' | 'sleeping' | 'favorite';
type ClientSort = 'recent' | 'spent' | 'name';
type ClientReminderState = { text?: string; remindAt?: string; updatedAt?: string };

const EMPTY_CLIENT_NOTES: Record<string, string> = {};
const EMPTY_CLIENT_REMINDERS: Record<string, ClientReminderState> = {};
const EMPTY_CLIENT_FAVORITES: Record<string, boolean> = {};

type ClientTimelineItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  tone: 'default' | 'accent' | 'warning';
};

const tableGridClass =
  'lg:grid-cols-[minmax(240px,1.25fr)_142px_86px_132px_150px_minmax(260px,1fr)_28px]';

function pageBg(light: boolean) {
  return light ? 'bg-[#f4f4f2]' : 'bg-[#090909]';
}

function pageText(light: boolean) {
  return light ? 'text-[#0e0e0e]' : 'text-white';
}

function mutedText(light: boolean) {
  return light ? 'text-black/48' : 'text-white/42';
}

function faintText(light: boolean) {
  return light ? 'text-black/32' : 'text-white/26';
}

function borderTone(light: boolean) {
  return light ? 'border-black/[0.08]' : 'border-white/[0.08]';
}

function divideTone(light: boolean) {
  return light ? 'divide-black/[0.08]' : 'divide-white/[0.08]';
}

function cardTone(light: boolean) {
  return light
    ? 'border-black/[0.08] bg-[#fbfbfa]'
    : 'border-white/[0.08] bg-[#090909]';
}

function insetTone(light: boolean) {
  return light
    ? 'border-black/[0.07] bg-black/[0.025]'
    : 'border-white/[0.08] bg-[#101010]';
}

function fieldClass(light: boolean) {
  return light
    ? 'border-black/[0.08] bg-white text-black placeholder:text-black/32'
    : 'border-white/[0.08] bg-[#101010] text-white placeholder:text-white/30';
}

function buttonBase(light: boolean, active = false) {
  return cn(
    'inline-flex h-8 items-center justify-center gap-2 rounded-[9px] border px-3 text-[12px] font-medium shadow-none transition-[background,border-color,color,opacity,transform] duration-150 active:scale-[0.985]',
    active
      ? light
        ? 'cb-neutral-primary cb-neutral-primary-light hover:opacity-[0.98]'
        : 'cb-neutral-primary cb-neutral-primary-dark hover:opacity-[0.98]'
      : light
        ? 'border-black/[0.08] bg-white text-black/58 hover:border-black/[0.14] hover:bg-black/[0.035] hover:text-black'
        : 'border-white/[0.08] bg-white/[0.04] text-white/55 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white',
  );
}

function disabledButtonClass() {
  return 'disabled:pointer-events-none disabled:opacity-40';
}

function iconBoxClass(light: boolean) {
  return light
    ? 'border-black/[0.07] bg-black/[0.025] text-black/38'
    : 'border-white/[0.07] bg-white/[0.035] text-white/38';
}

function accentPillStyle(
  color: string,
  light: boolean,
  strength: 'soft' | 'strong' = 'strong',
): CSSProperties {
  const bgAmount = strength === 'strong' ? (light ? 18 : 34) : light ? 10 : 22;
  const borderAmount = strength === 'strong' ? (light ? 34 : 48) : light ? 22 : 34;

  return {
    background: light
      ? `color-mix(in srgb, ${color} ${bgAmount}%, #ffffff)`
      : `color-mix(in srgb, ${color} ${bgAmount}%, #141414)`,
    borderColor: light
      ? `color-mix(in srgb, ${color} ${borderAmount}%, rgba(0,0,0,0.1))`
      : `color-mix(in srgb, ${color} ${borderAmount}%, rgba(255,255,255,0.1))`,
    color: light
      ? `color-mix(in srgb, ${color} 70%, #101010)`
      : `color-mix(in srgb, ${color} 18%, #ffffff)`,
    boxShadow:
      strength === 'strong'
        ? light
          ? `0 0 0 1px color-mix(in srgb, ${color} 10%, transparent)`
          : `0 0 0 1px color-mix(in srgb, ${color} 14%, transparent)`
        : undefined,
  };
}

function formatClientDate(locale: 'ru' | 'en', value?: string) {
  if (!value) return '—';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}


function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayIsoDate() {
  return toLocalIsoDate(new Date());
}

function splitReminderDateTime(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
  const time = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) ? value.slice(11, 16) : '';
  return { date, time };
}

function buildReminderDateTime(date: string, time: string) {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIsoDate();
  const safeTime = /^\d{2}:\d{2}$/.test(time) ? time : '12:30';
  return `${safeDate}T${safeTime}`;
}

function formatPickerDateLabel(value: string, locale: 'ru' | 'en') {
  if (!value) return locale === 'ru' ? 'Дата' : 'Date';
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
  }).format(parsed);
}

function calendarPopoverClass(light: boolean) {
  return cn(
    'z-[80] w-auto overflow-hidden rounded-[12px] border p-1 shadow-none backdrop-blur-[24px]',
    light
      ? 'border-black/[0.09] bg-[#fbfbfa]/92 text-black shadow-[0_24px_80px_rgba(15,15,15,0.12)]'
      : 'border-white/[0.10] bg-[#101010]/92 text-white shadow-[0_28px_90px_rgba(0,0,0,0.58)]',
  );
}

function getClientSegmentLabel(locale: 'ru' | 'en', segment: ClientInsight['segment']) {
  if (segment === 'regular') return locale === 'ru' ? 'Постоянный' : 'Regular';
  if (segment === 'sleeping') return locale === 'ru' ? 'Спящий' : 'Sleeping';
  return locale === 'ru' ? 'Новый' : 'New';
}

function getClientSegmentHint(locale: 'ru' | 'en', segment: ClientInsight['segment']) {
  if (segment === 'regular') return locale === 'ru' ? 'повторный' : 'repeat';
  if (segment === 'sleeping') return locale === 'ru' ? 'вернуть' : 'reactivate';
  return locale === 'ru' ? 'первичный' : 'first';
}

function getClientInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'C'
  );
}

function segmentColor(
  segment: ClientInsight['segment'],
  favorite: boolean,
  accentColor: string,
  publicAccentColor: string,
  light: boolean,
) {
  if (favorite) return accentColor;
  if (segment === 'regular') return publicAccentColor;
  if (segment === 'new') return light ? 'rgba(0,0,0,0.44)' : 'rgba(255,255,255,0.48)';
  return light ? 'rgba(0,0,0,0.24)' : 'rgba(255,255,255,0.26)';
}

function buildClientTimeline(client: ClientInsight, locale: 'ru' | 'en') {
  const timeline: ClientTimelineItem[] = [];

  if (client.nextVisit) {
    timeline.push({
      id: `${client.id}-next`,
      title: locale === 'ru' ? 'Следующая запись' : 'Next booking',
      subtitle: client.service,
      date: formatClientDate(locale, client.nextVisit),
      tone: 'accent',
    });
  }

  const lastVisit = new Date(client.lastVisit);
  const safeLastVisit = Number.isNaN(lastVisit.getTime()) ? new Date() : lastVisit;

  if (client.hasReschedule) {
    timeline.push({
      id: `${client.id}-reschedule`,
      title: locale === 'ru'
        ? `Был перенос${client.rescheduleCount && client.rescheduleCount > 1 ? ` ×${client.rescheduleCount}` : ''}`
        : `Rescheduled${client.rescheduleCount && client.rescheduleCount > 1 ? ` ×${client.rescheduleCount}` : ''}`,
      subtitle: locale === 'ru' ? 'Клиент запрашивал перенос — проверьте чат' : 'Client requested reschedule — check chat',
      date: formatClientDate(locale, client.nextVisit || client.lastVisit),
      tone: 'warning',
    });
  }

  if (client.visits <= 1) {
    timeline.push({
      id: `${client.id}-first`,
      title: locale === 'ru' ? 'Первый визит' : 'First visit',
      subtitle: client.service,
      date: formatClientDate(locale, client.lastVisit),
      tone: 'default',
    });

    return timeline;
  }

  timeline.push({
    id: `${client.id}-last`,
    title: locale === 'ru' ? 'Последний визит' : 'Last visit',
    subtitle: client.service,
    date: formatClientDate(locale, client.lastVisit),
    tone: 'default',
  });

  const firstVisit = new Date(safeLastVisit);
  firstVisit.setDate(safeLastVisit.getDate() - Math.max(1, client.visits - 1) * 21);

  timeline.push({
    id: `${client.id}-first`,
    title: locale === 'ru' ? 'Первый визит' : 'First visit',
    subtitle: client.service,
    date: formatClientDate(locale, firstVisit.toISOString()),
    tone: 'default',
  });

  if (client.visits > 2) {
    const previousVisit = new Date(safeLastVisit);
    previousVisit.setDate(safeLastVisit.getDate() - 21);

    timeline.splice(1, 0, {
      id: `${client.id}-previous`,
      title: locale === 'ru' ? 'Предыдущий визит' : 'Previous visit',
      subtitle: client.service,
      date: formatClientDate(locale, previousVisit.toISOString()),
      tone: 'default',
    });
  }

  return timeline;
}

function Card({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <section className={cn('rounded-[11px] border', cardTone(light), className)}>
      {children}
    </section>
  );
}

function CardTitle({
  title,
  description,
  light,
}: {
  title: string;
  description?: string;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[58px] items-center justify-between gap-4 border-b px-4 py-3',
        borderTone(light),
      )}
    >
      <div className="min-w-0">
        <h2
          className={cn(
            'truncate text-[13px] font-semibold tracking-[-0.018em]',
            pageText(light),
          )}
        >
          {title}
        </h2>

        {description ? (
          <p className={cn('mt-1 truncate text-[11px]', mutedText(light))}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Panel({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[10px] border', insetTone(light), className)}>
      {children}
    </div>
  );
}

function MicroLabel({
  children,
  light,
  active,
  accentColor,
  className,
}: {
  children: ReactNode;
  light: boolean;
  active?: boolean;
  accentColor?: string;
  className?: string;
}) {
  return (
    <span
      style={active && accentColor ? accentPillStyle(accentColor, light, 'soft') : undefined}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-[9px] border px-2.5 text-[10.5px] font-medium',
        active && !accentColor
          ? light
            ? 'border-black/[0.1] bg-black/[0.045] text-black/62'
            : 'border-white/[0.11] bg-white/[0.075] text-white/68'
          : !active
            ? light
              ? 'border-black/[0.08] bg-white text-black/50'
              : 'border-white/[0.08] bg-white/[0.04] text-white/42'
            : '',
        className,
      )}
    >
      {children}
    </span>
  );
}

function StatusDot({
  light,
  active,
  accentColor,
}: {
  light: boolean;
  active?: boolean;
  accentColor?: string;
}) {
  return (
    <span
      style={active && accentColor ? { background: accentColor } : undefined}
      className={cn(
        'size-1.5 shrink-0 rounded-full',
        !(active && accentColor) &&
          (active ? 'bg-current' : light ? 'bg-black/24' : 'bg-white/22'),
      )}
    />
  );
}

function KeyValue({
  label,
  value,
  light,
}: {
  label: string;
  value: string;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-h-10 items-center justify-between gap-3 rounded-[9px] border px-3',
        insetTone(light),
      )}
    >
      <span className={cn('text-[11px] font-medium', mutedText(light))}>{label}</span>

      <span
        className={cn(
          'truncate text-right text-[11.5px] font-medium',
          pageText(light),
        )}
      >
        {value}
      </span>
    </div>
  );
}

function HeroStat({
  label,
  value,
  hint,
  light,
}: {
  label: string;
  value: string | number;
  hint?: string;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-[10px] border px-3.5 py-3 transition-colors duration-150',
        light
          ? 'border-black/[0.07] bg-white hover:bg-black/[0.018]'
          : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.055]',
      )}
    >
      <div className="grid min-h-[34px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <div className={cn('truncate text-[10.5px] font-medium', mutedText(light))}>
            {label}
          </div>

          {hint ? (
            <div className={cn('mt-0.5 truncate text-[10px]', faintText(light))}>
              {hint}
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'min-w-[54px] max-w-[150px] truncate text-right text-[18px] font-semibold leading-none tracking-[-0.055em] tabular-nums',
            pageText(light),
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function InsightTile({
  label,
  value,
  hint,
  icon,
  light,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  light: boolean;
}) {
  return (
    <div className="min-w-0 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn('text-[11px] font-medium', mutedText(light))}>
            {label}
          </div>

          <div
            className={cn(
              'mt-2 truncate text-[20px] font-semibold tracking-[-0.055em]',
              pageText(light),
            )}
          >
            {value}
          </div>

          <div className={cn('mt-1 truncate text-[11px]', faintText(light))}>
            {hint}
          </div>
        </div>

        <div
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] border',
            iconBoxClass(light),
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ListBox({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[10px] border divide-y',
        insetTone(light),
        divideTone(light),
        className,
      )}
    >
      {children}
    </div>
  );
}

function ListRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('px-4 py-3.5', className)}>{children}</div>;
}

function EmptyState({
  children,
  light,
}: {
  children: ReactNode;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-[10px] border px-4 py-5 text-[12px]',
        insetTone(light),
        mutedText(light),
      )}
    >
      {children}
    </div>
  );
}

function ControlGroup({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex max-w-full shrink-0 items-center overflow-hidden rounded-[12px] border p-0',
        light
          ? 'border-black/[0.08] bg-white'
          : 'border-white/[0.08] bg-white/[0.045]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
  light,
  accentColor,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  light: boolean;
  accentColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center gap-2 border-r px-4 text-[11px] font-semibold tracking-[-0.015em] transition-colors duration-150 last:border-r-0 active:scale-[0.985]',
        light ? 'border-black/[0.07]' : 'border-white/[0.07]',
        active
          ? light
            ? 'text-black'
            : 'text-white'
          : light
            ? 'text-black/40 hover:text-black/70'
            : 'text-white/36 hover:text-white/70',
      )}
    >
      <span className="relative z-10">{label}</span>

      {typeof count === 'number' ? (
        <span
          className={cn(
            'relative z-10 rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold',
            active
              ? light
                ? 'bg-black/[0.06] text-black/60'
                : 'bg-white/[0.075] text-white/62'
              : light
                ? 'bg-black/[0.035] text-black/34'
                : 'bg-white/[0.045] text-white/34',
          )}
        >
          {count}
        </span>
      ) : null}

      <span
        style={active ? { background: accentColor } : undefined}
        className={cn(
          'absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-200',
          active
            ? 'opacity-100'
            : light
              ? 'bg-black/0 opacity-0 group-hover:bg-black/18 group-hover:opacity-100'
              : 'bg-white/0 opacity-0 group-hover:bg-white/18 group-hover:opacity-100',
        )}
      />
    </button>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
  light,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  light: boolean;
}) {
  return (
    <label
      className={cn(
        'flex h-10 w-full items-center gap-2 rounded-[12px] border px-3 lg:w-[320px]',
        fieldClass(light),
      )}
    >
      <Search className={cn('size-3.5 shrink-0', mutedText(light))} />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-[12px] outline-none"
      />
    </label>
  );
}

function ClientAvatar({
  name,
  light,
  large,
}: {
  name: string;
  light: boolean;
  large?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[9px] border font-semibold',
        large ? 'size-12 text-[16px]' : 'size-9 text-[12px]',
        iconBoxClass(light),
      )}
    >
      {getClientInitials(name)}
    </span>
  );
}

function SegmentStatus({
  client,
  locale,
  light,
  accentColor,
  publicAccentColor,
  className,
}: {
  client: ClientInsight;
  locale: 'ru' | 'en';
  light: boolean;
  accentColor: string;
  publicAccentColor: string;
  className?: string;
}) {
  const color = segmentColor(
    client.segment,
    client.favorite,
    accentColor,
    publicAccentColor,
    light,
  );

  return (
    <div className={cn('flex w-full min-w-0 items-center justify-end gap-2', className)}>
      <div className="min-w-0 text-right">
        <div
          className={cn(
            'truncate text-[11.5px] font-semibold leading-none tracking-[-0.018em]',
            light ? 'text-black/72' : 'text-white/74',
          )}
        >
          {client.favorite
            ? locale === 'ru'
              ? 'Избранный'
              : 'Favorite'
            : getClientSegmentLabel(locale, client.segment)}
        </div>

        <div
          className={cn(
            'mt-1 truncate text-[9.5px] font-medium uppercase tracking-[0.12em]',
            light ? 'text-black/32' : 'text-white/28',
          )}
        >
          {client.favorite
            ? locale === 'ru'
              ? 'важный'
              : 'priority'
            : getClientSegmentHint(locale, client.segment)}
        </div>
      </div>

      <span
        style={{
          background: color,
          boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 14%, transparent)`,
        }}
        className="size-2 shrink-0 rounded-full"
      />
    </div>
  );
}

function ClientDateCell({
  date,
  locale,
  light,
}: {
  date?: string;
  locale: 'ru' | 'en';
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-center justify-center text-center text-[11.5px] font-medium tabular-nums',
        light ? 'text-black/48' : 'text-white/42',
      )}
    >
      <span className="block max-w-full truncate whitespace-nowrap">
        {formatClientDate(locale, date)}
      </span>
    </div>
  );
}

function ActionLink({
  href,
  children,
  light,
  active,
}: {
  href: string;
  children: ReactNode;
  light: boolean;
  active?: boolean;
}) {
  return (
    <Link href={href} className={buttonBase(light, active)}>
      {children}
    </Link>
  );
}

function ActionAnchor({
  href,
  children,
  light,
  active,
}: {
  href: string;
  children: ReactNode;
  light: boolean;
  active?: boolean;
}) {
  return (
    <a href={href} className={buttonBase(light, active)}>
      {children}
    </a>
  );
}

function ActionButton({
  children,
  light,
  active,
}: {
  children: ReactNode;
  light: boolean;
  active?: boolean;
}) {
  return (
    <button type="button" className={buttonBase(light, active)}>
      {children}
    </button>
  );
}

function MobileClientCard({
  client,
  locale,
  onOpen,
  light,
  accentColor,
  publicAccentColor,
  noteValue,
  reminderValue,
  onSaveNote,
  onSaveReminder,
  onToggleFavorite,
}: {
  client: ClientInsight;
  locale: 'ru' | 'en';
  onOpen: () => void;
  light: boolean;
  accentColor: string;
  publicAccentColor: string;
  noteValue?: string;
  reminderValue?: ClientReminderState;
  onSaveNote?: (clientId: string, note: string) => void;
  onSaveReminder?: (clientId: string, reminder: ClientReminderState) => void;
  onToggleFavorite?: (clientId: string, favorite: boolean) => void;
}) {
  const color = segmentColor(
    client.segment,
    client.favorite,
    accentColor,
    publicAccentColor,
    light,
  );

  return (
    <button type="button" onClick={onOpen} className="w-full text-left lg:hidden">
      <div
        className={cn(
          'grid overflow-hidden rounded-[10px] border grid-cols-[4px_minmax(0,1fr)]',
          insetTone(light),
        )}
      >
        <span style={{ background: color }} className="h-full w-full" />

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <ClientAvatar name={client.name} light={light} />

              <div className="min-w-0">
                <div className={cn('truncate text-[13px] font-semibold', pageText(light))}>
                  {client.name}
                </div>

                <div className={cn('mt-1 text-[11px]', mutedText(light))}>
                  {client.phone}
                </div>
              </div>
            </div>

            <SegmentStatus
              client={client}
              locale={locale}
              light={light}
              accentColor={accentColor}
              publicAccentColor={publicAccentColor}
              className="max-w-[132px]"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <KeyValue
              label={locale === 'ru' ? 'Визиты' : 'Visits'}
              value={String(client.visits)}
              light={light}
            />

            <KeyValue
              label={locale === 'ru' ? 'Чек' : 'Check'}
              value={formatCurrency(client.averageCheck, locale)}
              light={light}
            />
          </div>

          <div
            className={cn(
              'mt-3 flex items-center justify-between gap-3 border-t pt-3',
              borderTone(light),
            )}
          >
            <div className="min-w-0">
              <div className={cn('text-[11px]', mutedText(light))}>
                {[client.service, client.source].filter(Boolean).join(' · ')}
              </div>

              <div className={cn('mt-1 line-clamp-1 text-[11.5px]', pageText(light))}>
                {client.note || (locale === 'ru' ? 'Заметка не добавлена' : 'No note yet')}
              </div>
            </div>

            <ArrowRight className={cn('size-3.5 shrink-0', faintText(light))} />
          </div>
        </div>
      </div>
    </button>
  );
}

function ClientTableRow({
  client,
  locale,
  onOpen,
  light,
  accentColor,
  publicAccentColor,
  noteValue,
  reminderValue,
  onSaveNote,
  onSaveReminder,
  onToggleFavorite,
}: {
  client: ClientInsight;
  locale: 'ru' | 'en';
  onOpen: () => void;
  light: boolean;
  accentColor: string;
  publicAccentColor: string;
  noteValue?: string;
  reminderValue?: ClientReminderState;
  onSaveNote?: (clientId: string, note: string) => void;
  onSaveReminder?: (clientId: string, reminder: ClientReminderState) => void;
  onToggleFavorite?: (clientId: string, favorite: boolean) => void;
}) {
  const color = segmentColor(
    client.segment,
    client.favorite,
    accentColor,
    publicAccentColor,
    light,
  );

  return (
    <ListRow
      className={cn(
        'relative overflow-hidden px-0 py-0 transition-colors duration-150',
        light ? 'hover:bg-black/[0.018]' : 'hover:bg-white/[0.028]',
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="grid min-h-[76px] w-full grid-cols-[4px_minmax(0,1fr)] text-left"
      >
        <span style={{ background: color }} className="h-full w-full" />

        <div
          className={cn(
            'grid gap-4 px-4 py-3.5',
            tableGridClass,
            'lg:items-center',
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            <ClientAvatar name={client.name} light={light} />

            <div className="min-w-0">
              <div className={cn('truncate text-[13px] font-semibold', pageText(light))}>
                {client.name}
              </div>

              <div className={cn('mt-1 truncate text-[11px]', mutedText(light))}>
                {client.phone}
              </div>
            </div>
          </div>

          <SegmentStatus
            client={client}
            locale={locale}
            light={light}
            accentColor={accentColor}
            publicAccentColor={publicAccentColor}
          />

          <div className="flex w-full min-w-0 flex-col items-center justify-center text-center">
            <div className={cn('text-[12.5px] font-semibold tabular-nums', pageText(light))}>
              {client.visits}
            </div>

            <div className={cn('mt-1 text-[10.5px]', mutedText(light))}>
              {locale === 'ru' ? 'визитов' : 'visits'}
            </div>
          </div>

          <div
            className={cn(
              'w-full min-w-0 truncate text-right text-[12.5px] font-semibold tabular-nums',
              pageText(light),
            )}
          >
            {formatCurrency(client.averageCheck, locale)}
          </div>

          <ClientDateCell date={client.lastVisit} locale={locale} light={light} />

          <div className="min-w-0">
            <div className={cn('truncate text-[11px] leading-4', mutedText(light))}>
              {[client.source, client.note].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>

          <div className="flex justify-end">
            <ArrowRight className={cn('size-3.5', faintText(light))} />
          </div>
        </div>
      </button>
    </ListRow>
  );
}

function ClientCrmDialog({
  open,
  client,
  locale,
  light,
  onClose,
  accentColor,
  publicAccentColor,
  noteValue,
  reminderValue,
  onSaveNote,
  onSaveReminder,
  onToggleFavorite,
}: {
  open: boolean;
  client: ClientInsight | null;
  locale: 'ru' | 'en';
  light: boolean;
  onClose: () => void;
  accentColor: string;
  publicAccentColor: string;
  noteValue?: string;
  reminderValue?: ClientReminderState;
  onSaveNote?: (clientId: string, note: string) => void;
  onSaveReminder?: (clientId: string, reminder: ClientReminderState) => void;
  onToggleFavorite?: (clientId: string, favorite: boolean) => void;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  const [draftNote, setDraftNote] = useState(noteValue ?? client?.note ?? '');
  const [draftReminderText, setDraftReminderText] = useState(reminderValue?.text ?? '');
  const [draftReminderAt, setDraftReminderAt] = useState(reminderValue?.remindAt ?? '');
  const [activeMiniDialog, setActiveMiniDialog] = useState<'note' | 'reminder' | null>(null);
  const [timelinePage, setTimelinePage] = useState(0);

  useEffect(() => {
    if (!client) return;
    setDraftNote(noteValue ?? client.note ?? '');
    setDraftReminderText(reminderValue?.text ?? '');
    setDraftReminderAt(reminderValue?.remindAt ?? '');
    setActiveMiniDialog(null);
    setTimelinePage(0);
  }, [client, noteValue, reminderValue?.remindAt, reminderValue?.text]);

  if (!open || !client || typeof document === 'undefined') return null;

  const timeline = buildClientTimeline(client, locale);
  const timelinePageSize = 2;
  const totalTimelinePages = Math.max(1, Math.ceil(timeline.length / timelinePageSize));
  const safeTimelinePage = Math.min(timelinePage, totalTimelinePages - 1);
  const visibleTimeline = timeline.slice(
    safeTimelinePage * timelinePageSize,
    safeTimelinePage * timelinePageSize + timelinePageSize,
  );
  const segmentAccent = segmentColor(
    client.segment,
    client.favorite,
    accentColor,
    publicAccentColor,
    light,
  );

  const copy =
    locale === 'ru'
      ? {
          title: 'CRM-карточка',
          description:
            'Контакты, визиты, заметка, LTV и быстрые действия по выбранному клиенту.',
          close: 'Закрыть',
          done: 'Готово',
          statusFavorite: 'Избранный клиент',
          statusDefault: getClientSegmentLabel(locale, client.segment),
          primaryService: 'Основная услуга',
          source: 'Источник',
          phone: 'Телефон',
          visits: 'Визиты',
          averageCheck: 'Средний чек',
          revenue: 'Выручка',
          lastVisit: 'Последний визит',
          nextVisit: 'Следующая запись',
          note: 'Заметка',
          timeline: 'История визитов',
          call: 'Позвонить',
          chat: 'Открыть чат',
          schedule: 'Запланировать',
          addNote: 'Заметка',
          remind: 'Напомнить',
          details: 'Данные клиента',
          makeFavorite: client.favorite ? 'Убрать из VIP' : 'Сделать VIP',
          previousPage: 'Назад',
          nextPage: 'Дальше',
          page: 'Страница',
        }
      : {
          title: 'CRM record',
          description:
            'Contacts, visits, note, LTV, and quick actions for the selected client.',
          close: 'Close',
          done: 'Done',
          statusFavorite: 'Favorite client',
          statusDefault: getClientSegmentLabel(locale, client.segment),
          primaryService: 'Primary service',
          source: 'Source',
          phone: 'Phone',
          visits: 'Visits',
          averageCheck: 'Average check',
          revenue: 'Revenue',
          lastVisit: 'Last visit',
          nextVisit: 'Next booking',
          note: 'Note',
          timeline: 'Visit history',
          call: 'Call',
          chat: 'Open chat',
          schedule: 'Schedule',
          addNote: 'Note',
          remind: 'Remind',
          details: 'Client details',
          makeFavorite: client.favorite ? 'Remove VIP' : 'Make VIP',
          previousPage: 'Previous',
          nextPage: 'Next',
          page: 'Page',
        };

  function ModalRow({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 border-b py-3 last:border-b-0',
          borderTone(light),
        )}
      >
        <div className={cn('text-[12px]', mutedText(light))}>{label}</div>

        <div
          className={cn(
            'max-w-[150px] truncate rounded-[8px] px-2.5 py-1 text-right text-[12px] font-semibold',
            light ? 'bg-black/[0.025] text-[#0e0e0e]' : 'bg-white/[0.04] text-white',
          )}
        >
          {value}
        </div>
      </div>
    );
  }

  function ModalActionButton({
    icon,
    label,
    href,
    onClick,
    active,
  }: {
    icon: ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }) {
    const className = active
      ? cn('w-full justify-between', buttonBase(light, true), 'h-11 rounded-[10px]')
      : cn(
          'flex h-11 w-full items-center justify-between gap-3 rounded-[10px] border px-3 text-left text-[12px] font-medium transition-colors active:scale-[0.992]',
          light
            ? 'border-black/[0.08] bg-white text-black/62 hover:bg-black/[0.025] hover:text-black'
            : 'border-white/[0.08] bg-[#101010] text-white/58 hover:bg-white/[0.06] hover:text-white',
        );

    const content = (
      <>
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn('shrink-0', active ? '' : mutedText(light))}>{icon}</span>
          <span className="truncate">{label}</span>
        </span>

        <ArrowRight className={cn('size-3.5 shrink-0', active ? '' : mutedText(light))} />
      </>
    );

    if (href) {
      return (
        <Link href={href} onClick={onClose} className={className}>
          {content}
        </Link>
      );
    }

    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[10px]" />

      <div
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          'relative w-full max-w-[620px] overflow-hidden rounded-[18px] border',
          'max-h-[calc(100dvh-32px)]',
          light
            ? 'border-black/[0.09] bg-[var(--cb-surface)] text-[#0e0e0e] shadow-[0_34px_90px_rgba(0,0,0,0.18)]'
            : 'border-white/[0.10] bg-[#101010] text-white shadow-[0_34px_90px_rgba(0,0,0,0.55)]',
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: light
              ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.16), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          }}
        />

        <div className={cn('flex items-start justify-between gap-4 border-b p-5', borderTone(light))}>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <ClientAvatar name={client.name} light={light} />

              <div className="min-w-0">
                <h2 className="truncate text-[26px] font-semibold leading-none tracking-[-0.07em]">
                  {client.name}
                </h2>

                <p className={cn('mt-1 truncate text-[12.5px]', mutedText(light))}>
                  {client.phone}
                </p>
              </div>
            </div>

            <p className={cn('mt-3 max-w-[460px] text-[12.5px] leading-5', mutedText(light))}>
              {copy.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-[10px] border transition-colors',
              light
                ? 'border-black/[0.08] bg-white text-black/42 hover:bg-black/[0.035] hover:text-black'
                : 'border-white/[0.08] bg-white/[0.04] text-white/42 hover:bg-white/[0.07] hover:text-white',
            )}
            aria-label={copy.close}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-190px)] overflow-y-auto">
          <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <Panel light={light} className="overflow-hidden">
                <div className={cn('border-b px-4 py-3', borderTone(light))}>
                  <div className={cn('text-[11px] font-medium', mutedText(light))}>
                    {copy.primaryService}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className={cn('truncate text-[15px] font-semibold', pageText(light))}>
                        {client.service}
                      </div>

                      <div className={cn('mt-0.5 truncate text-[10px]', mutedText(light))}>
                        {copy.source}: {client.source}
                      </div>
                    </div>

                    <div className="size-2 rounded-full" style={{ background: segmentAccent }} />
                  </div>
                </div>

                <div className="px-4">
                  <ModalRow label={copy.visits} value={String(client.visits)} />
                  <ModalRow
                    label={copy.averageCheck}
                    value={formatCurrency(client.averageCheck, locale)}
                  />
                  <ModalRow
                    label={copy.revenue}
                    value={formatCurrency(client.totalRevenue, locale)}
                  />
                  <ModalRow
                    label={copy.lastVisit}
                    value={formatClientDate(locale, client.lastVisit)}
                  />
                  <ModalRow
                    label={copy.nextVisit}
                    value={formatClientDate(locale, client.nextVisit)}
                  />
                </div>
              </Panel>

              <Panel light={light} className="overflow-hidden">
                <div className={cn('border-b px-4 py-3', borderTone(light))}>
                  <div className={cn('text-[12.5px] font-semibold', pageText(light))}>
                    {copy.timeline}
                  </div>
                </div>

                <div className={cn('min-h-[142px] divide-y', divideTone(light))}>
                  {visibleTimeline.map((item) => {
                    const color =
                      item.tone === 'accent'
                        ? segmentAccent
                        : item.tone === 'warning'
                          ? light
                            ? 'rgba(245,158,11,0.78)'
                            : 'rgba(251,191,36,0.72)'
                          : light
                            ? 'rgba(0,0,0,0.22)'
                            : 'rgba(255,255,255,0.24)';

                    return (
                      <div key={item.id} className="grid min-h-[58px] grid-cols-[4px_minmax(0,1fr)]">
                        <span style={{ background: color }} className="h-full w-full" />

                        <div className="grid gap-2 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_112px] sm:items-center">
                          <div className="min-w-0">
                            <div className={cn('flex min-w-0 items-center gap-1.5 truncate text-[12px] font-semibold', pageText(light))}>
                              {item.tone === 'warning' ? (
                                <TriangleAlert
                                  className="size-3.5 shrink-0"
                                  style={{ color }}
                                />
                              ) : null}
                              <span className="truncate">{item.title}</span>
                            </div>

                            <div className={cn('mt-1 truncate text-[11px]', mutedText(light))}>
                              {item.subtitle}
                            </div>
                          </div>

                          <div className={cn('text-[11px] font-medium sm:text-right', mutedText(light))}>
                            {item.date}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {visibleTimeline.length === 0 ? (
                    <div className={cn('px-3 py-4 text-[11px]', mutedText(light))}>
                      —
                    </div>
                  ) : null}
                </div>

                {timeline.length > timelinePageSize ? (
                  <div className={cn('flex items-center justify-between gap-2 border-t px-3 py-2.5', borderTone(light))}>
                    <button
                      type="button"
                      onClick={() => setTimelinePage((current) => Math.max(0, current - 1))}
                      disabled={safeTimelinePage === 0}
                      className={cn(buttonBase(light, false), disabledButtonClass(), 'h-8 rounded-[9px]')}
                    >
                      {copy.previousPage}
                    </button>

                    <div className={cn('text-[10.5px] font-medium', mutedText(light))}>
                      {copy.page} {safeTimelinePage + 1} / {totalTimelinePages}
                    </div>

                    <button
                      type="button"
                      onClick={() => setTimelinePage((current) => Math.min(totalTimelinePages - 1, current + 1))}
                      disabled={safeTimelinePage >= totalTimelinePages - 1}
                      className={cn(buttonBase(light, false), disabledButtonClass(), 'h-8 rounded-[9px]')}
                    >
                      {copy.nextPage}
                    </button>
                  </div>
                ) : null}
              </Panel>
            </div>

            <div className="space-y-3">
              <Panel light={light} className="overflow-hidden px-4">
                <ModalRow label={copy.phone} value={client.phone} />
                <ModalRow label={copy.source} value={client.source} />
                <ModalRow
                  label="LTV"
                  value={formatCurrency(client.totalRevenue, locale)}
                />
              </Panel>

              <div className="space-y-2">
                <a
                  href={`tel:${client.phone.replace(/\D+/g, '') || client.phone}`}
                  className={cn(
                    'flex h-11 w-full items-center justify-between gap-3 rounded-[10px] border px-3 text-left text-[12px] font-medium transition-colors active:scale-[0.992]',
                    light
                      ? 'border-black/[0.08] bg-white text-black/62 hover:bg-black/[0.025] hover:text-black'
                      : 'border-white/[0.08] bg-[#101010] text-white/58 hover:bg-white/[0.06] hover:text-white',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Phone className={cn('size-4 shrink-0', mutedText(light))} />
                    <span className="truncate">{copy.call}</span>
                  </span>

                  <ArrowRight className={cn('size-3.5 shrink-0', mutedText(light))} />
                </a>

                <ModalActionButton
                  icon={<MessageCircleMore className="size-4" />}
                  label={copy.chat}
                  href="/dashboard/chats"
                />

                <ModalActionButton
                  icon={<CalendarClock className="size-4" />}
                  label={copy.schedule}
                  href="/dashboard/today"
                />

                <ModalActionButton
                  icon={<NotebookPen className="size-4" />}
                  label={copy.addNote}
                  onClick={() => setActiveMiniDialog('note')}
                />

                <ModalActionButton
                  icon={<Sparkles className="size-4" />}
                  label={copy.remind}
                  onClick={() => setActiveMiniDialog('reminder')}
                />

                <ModalActionButton
                  icon={<Star className="size-4" />}
                  label={copy.makeFavorite}
                  onClick={() => onToggleFavorite?.(client.id, !client.favorite)}
                />

                <button
                  type="button"
                  onClick={onClose}
                  className={cn('mt-3 w-full', buttonBase(light, true), 'h-11 rounded-[10px]')}
                >
                  {copy.done}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      {activeMiniDialog ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[8px]">
          <div
            className={cn(
              'w-full max-w-[420px] rounded-[16px] border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)]',
              light ? 'border-black/[0.09] bg-[#fbfbfa]' : 'border-white/[0.10] bg-[#101010]',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className={cn('text-[18px] font-semibold tracking-[-0.055em]', pageText(light))}>
                  {activeMiniDialog === 'note' ? copy.note : copy.remind}
                </div>
                <p className={cn('mt-1 text-[12px] leading-5', mutedText(light))}>
                  {activeMiniDialog === 'note'
                    ? locale === 'ru'
                      ? 'Зафиксируйте важную деталь по клиенту.'
                      : 'Save an important detail about this client.'
                    : locale === 'ru'
                      ? 'Поставьте дату, время и текст напоминания.'
                      : 'Set the date, time, and reminder text.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMiniDialog(null)}
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-[10px] border transition-colors',
                  light
                    ? 'border-black/[0.08] bg-white text-black/42 hover:bg-black/[0.035] hover:text-black'
                    : 'border-white/[0.08] bg-white/[0.04] text-white/42 hover:bg-white/[0.07] hover:text-white',
                )}
                aria-label={copy.close}
              >
                <X className="size-4" />
              </button>
            </div>

            {activeMiniDialog === 'reminder' ? (() => {
              const reminderParts = splitReminderDateTime(draftReminderAt);

              return (
                <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_132px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'flex h-10 w-full items-center justify-between gap-3 rounded-[10px] border px-3 text-left text-[12px] font-medium outline-none transition active:scale-[0.985]',
                          light
                            ? 'border-black/[0.08] bg-white text-black hover:border-black/[0.14]'
                            : 'border-white/[0.08] bg-[#101010] text-white hover:border-white/[0.14]',
                        )}
                      >
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <CalendarDays className={cn('size-4 shrink-0', mutedText(light))} />
                          <span className="truncate">
                            {formatPickerDateLabel(reminderParts.date, locale)}
                          </span>
                        </span>
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      className={calendarPopoverClass(light)}
                    >
                      <Calendar
                        mode="single"
                        selected={reminderParts.date ? new Date(`${reminderParts.date}T00:00:00`) : undefined}
                        onSelect={(date) => {
                          if (!date) return;
                          setDraftReminderAt(buildReminderDateTime(toLocalIsoDate(date), reminderParts.time));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <label
                    className={cn(
                      'flex h-10 items-center gap-2 rounded-[10px] border px-3',
                      light
                        ? 'border-black/[0.08] bg-white text-black'
                        : 'border-white/[0.08] bg-[#101010] text-white',
                    )}
                  >
                    <Clock3 className={cn('size-4 shrink-0', mutedText(light))} />
                    <input
                      type="time"
                      step="1800"
                      value={reminderParts.time || '12:30'}
                      onChange={(event) => setDraftReminderAt(buildReminderDateTime(reminderParts.date, event.target.value))}
                      className="min-w-0 flex-1 bg-transparent text-[12px] font-medium outline-none"
                    />
                  </label>
                </div>
              );
            })() : null}

            <textarea
              value={activeMiniDialog === 'note' ? draftNote : draftReminderText}
              onChange={(event) =>
                activeMiniDialog === 'note'
                  ? setDraftNote(event.target.value)
                  : setDraftReminderText(event.target.value)
              }
              rows={activeMiniDialog === 'note' ? 5 : 3}
              className={cn(
                'mt-3 w-full resize-none rounded-[10px] border px-3 py-2 text-[12px] leading-5 outline-none transition-colors',
                light
                  ? 'border-black/[0.08] bg-white text-black placeholder:text-black/28 focus:border-black/[0.16]'
                  : 'border-white/[0.08] bg-[#101010] text-white placeholder:text-white/28 focus:border-white/[0.16]',
              )}
              placeholder={
                activeMiniDialog === 'note'
                  ? locale === 'ru'
                    ? 'Что важно помнить о клиенте...'
                    : 'What should be remembered about this client...'
                  : locale === 'ru'
                    ? 'Например: напомнить о повторной записи'
                    : 'Example: remind about the next booking'
              }
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveMiniDialog(null)}
                className={cn(buttonBase(light, false), 'h-9 rounded-[10px]')}
              >
                {copy.close}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeMiniDialog === 'note') {
                    onSaveNote?.(client.id, draftNote);
                  } else {
                    onSaveReminder?.(client.id, {
                      text: draftReminderText,
                      remindAt: draftReminderAt,
                      updatedAt: new Date().toISOString(),
                    });
                  }
                  setActiveMiniDialog(null);
                }}
                className={cn(buttonBase(light, true), 'h-9 rounded-[10px]')}
              >
                {locale === 'ru' ? 'Сохранить' : 'Save'}
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      </div>
    </div>,
    document.body,
  );
}

export default function ClientsPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const { resolvedTheme } = useTheme();
  const { settings } = useAppearance();
  const [clientNotes, setClientNotes] = useWorkspaceSection<Record<string, string>>(
    'clientNotes',
    EMPTY_CLIENT_NOTES,
  );
  const [clientReminders, setClientReminders] = useWorkspaceSection<Record<string, ClientReminderState>>(
    'clientReminders',
    EMPTY_CLIENT_REMINDERS,
  );
  const [clientFavorites, setClientFavorites] = useWorkspaceSection<Record<string, boolean>>(
    'clientFavorites',
    EMPTY_CLIENT_FAVORITES,
  );

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('all');
  const [sortBy, setSortBy] = useState<ClientSort>('recent');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme: ThemeMode = mounted
    ? resolvedTheme === 'light'
      ? 'light'
      : 'dark'
    : 'dark';

  const isLight = currentTheme === 'light';

  const accentColor = accentPalette[settings.accentTone].solid;
  const publicAccentColor = accentPalette[settings.publicAccent].solid;

  const clients = useMemo(() => {
    if (!dataset) return [];

    const normalized = query.trim().toLowerCase();

    const sourceClients = dataset.clients.map((client) => ({
      ...client,
      favorite: clientFavorites[client.id] ?? clientFavorites[client.phone] ?? client.favorite,
      note: clientNotes[client.id] ?? clientNotes[client.phone] ?? client.note,
    }));

    const filtered = sourceClients.filter((client) => {
      const matchesQuery =
        !normalized ||
        [client.name, client.phone, client.note, client.service, client.source].some((value) =>
          value.toLowerCase().includes(normalized),
        );

      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'favorite'
            ? client.favorite
            : client.segment === filter;

      return matchesQuery && matchesFilter;
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === 'name') {
        return left.name.localeCompare(right.name, locale === 'ru' ? 'ru' : 'en');
      }

      if (sortBy === 'spent') {
        return right.totalRevenue - left.totalRevenue;
      }

      return new Date(right.lastVisit).getTime() - new Date(left.lastVisit).getTime();
    });
  }, [clientFavorites, clientNotes, dataset, filter, locale, query, sortBy]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  const allClients = useMemo(() =>
    (dataset?.clients ?? []).map((client) => ({
      ...client,
      favorite: clientFavorites[client.id] ?? clientFavorites[client.phone] ?? client.favorite,
      note: clientNotes[client.id] ?? clientNotes[client.phone] ?? client.note,
    })),
    [clientFavorites, clientNotes, dataset?.clients],
  );
  const totalClients = allClients.length;
  const regularClients = allClients.filter((item) => item.segment === 'regular').length;
  const newClients = allClients.filter((item) => item.segment === 'new').length;
  const sleepingClients = allClients.filter((item) => item.segment === 'sleeping').length;
  const favoriteClients = allClients.filter((item) => item.favorite).length;
  const totalRevenue = allClients.reduce((sum, item) => sum + item.totalRevenue, 0);

  const regularRate = totalClients ? Math.round((regularClients / totalClients) * 100) : 0;
  const favoriteRate = totalClients ? Math.round((favoriteClients / totalClients) * 100) : 0;

  const topSource = useMemo(() => {
    const sourceMap = new Map<string, number>();

    for (const client of dataset?.clients ?? []) {
      sourceMap.set(client.source, (sourceMap.get(client.source) ?? 0) + 1);
    }

    return [...sourceMap.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? '—';
  }, [dataset?.clients]);

  const latestClient = useMemo(() => {
    return [...(dataset?.clients ?? [])].sort(
      (left, right) =>
        new Date(right.lastVisit).getTime() - new Date(left.lastVisit).getTime(),
    )[0];
  }, [dataset?.clients]);

  const copy =
    locale === 'ru'
      ? {
          title: 'Клиенты',
          description:
            'Клиентская база, визиты, заметки, средний чек и быстрый доступ к CRM-карточке.',
          createProfileTitle: 'Сначала настройте профиль мастера',
          createProfileDescription:
            'После создания профиля появится клиентская база, история визитов, заметки и карточки клиентов.',
          createProfileButton: 'Создать профиль',

          snapshotDescription: 'Сводка по клиентам, постоянным, избранным и среднему чеку.',
          baseReady: 'База активна',
          crmReady: 'CRM готова',
          notesReady: 'Заметки',

          totalClients: 'Всего клиентов',
          regular: 'Постоянные',
          newClients: 'Новые клиенты',
          sleeping: 'Спящие',
          favorites: 'Избранные',
          averageCheck: 'Средний чек',
          totalRevenue: 'Выручка базы',
          topSource: 'Главный источник',
          latestVisit: 'Последний визит',
          clientsWord: 'клиентов',
          visitsWord: 'повторная база',
          favoriteWord: 'в избранном',
          avgWord: 'средний',

          portrait: 'Портрет базы',
          portraitDescription:
            'Не дублирует верхний итог: показывает сегменты, деньги, источник и последнюю активность.',
          sourceHint: 'чаще всего приводит клиентов',
          latestHint: 'последняя активность в базе',
          newHint: 'потенциал для повторного касания',
          sleepingHint: 'нужно вернуть в запись',
          revenueHint: 'суммарно по клиентам',

          clientBase: 'Список клиентов',
          clientBaseDescription: 'Поиск по имени, телефону, услуге, источнику или заметке.',
          search: 'Поиск клиента',

          all: 'Все',
          new: 'Новые',
          recent: 'Сначала свежие',
          spent: 'По выручке',
          name: 'По имени',

          client: 'Клиент',
          segment: 'Сегмент',
          visits: 'Визиты',
          source: 'Источник',
          note: 'Источник / заметка',
          lastVisit: 'Последний',
          noClients: 'Ничего не найдено.',

          setupCards: {
            base: 'База клиентов',
            baseText: 'После запуска профиля здесь появятся клиенты и история визитов.',
            crm: 'CRM-карточки',
            crmText: 'В каждой карточке будут заметки, LTV, визиты и быстрые действия.',
            notes: 'Заметки',
            notesText: 'Фиксируйте предпочтения клиента и возвращайте его на повторный визит.',
          },
        }
      : {
          title: 'Clients',
          description:
            'Client base, visits, notes, average check, and quick access to the CRM record.',
          createProfileTitle: 'Create the master profile first',
          createProfileDescription:
            'After creating the profile, the client base, visit history, notes, and client records will appear.',
          createProfileButton: 'Create profile',

          snapshotDescription: 'Summary of clients, regulars, favorites, and average check.',
          baseReady: 'Base active',
          crmReady: 'CRM ready',
          notesReady: 'Notes',

          totalClients: 'Total clients',
          regular: 'Regular',
          newClients: 'New clients',
          sleeping: 'Sleeping',
          favorites: 'Favorites',
          averageCheck: 'Average check',
          totalRevenue: 'Client revenue',
          topSource: 'Top source',
          latestVisit: 'Latest visit',
          clientsWord: 'clients',
          visitsWord: 'repeat base',
          favoriteWord: 'favorite',
          avgWord: 'average',

          portrait: 'Client base portrait',
          portraitDescription:
            'Not a duplicate of the summary: shows segments, revenue, source, and latest activity.',
          sourceHint: 'most common acquisition channel',
          latestHint: 'latest activity in the base',
          newHint: 'potential for repeat touch',
          sleepingHint: 'needs reactivation',
          revenueHint: 'total across clients',

          clientBase: 'Client list',
          clientBaseDescription: 'Search by name, phone, service, source, or note.',
          search: 'Search client',

          all: 'All',
          new: 'New',
          recent: 'Recent first',
          spent: 'By revenue',
          name: 'By name',

          client: 'Client',
          segment: 'Segment',
          visits: 'Visits',
          source: 'Source',
          note: 'Source / note',
          lastVisit: 'Last',
          noClients: 'No clients found.',

          setupCards: {
            base: 'Client base',
            baseText: 'After profile setup, clients and visit history will appear here.',
            crm: 'CRM records',
            crmText: 'Each card will contain notes, LTV, visits, and quick actions.',
            notes: 'Notes',
            notesText: 'Capture preferences and bring clients back for repeat visits.',
          },
        };

  const filterCounts: Record<ClientFilter, number> = {
    all: allClients.length,
    new: newClients,
    regular: regularClients,
    sleeping: sleepingClients,
    favorite: favoriteClients,
  };

  const filterOptions: Array<{ value: ClientFilter; label: string }> = [
    { value: 'all', label: copy.all },
    { value: 'new', label: copy.new },
    { value: 'regular', label: copy.regular },
    { value: 'sleeping', label: copy.sleeping },
    { value: 'favorite', label: copy.favorites },
  ];

  const sortOptions: Array<{ value: ClientSort; label: string }> = [
    { value: 'recent', label: copy.recent },
    { value: 'spent', label: copy.spent },
    { value: 'name', label: copy.name },
  ];

  const portraitItems = [
    {
      label: copy.newClients,
      value: String(newClients),
      hint: copy.newHint,
      icon: <Users2 className="size-4" />,
    },
    {
      label: copy.sleeping,
      value: String(sleepingClients),
      hint: copy.sleepingHint,
      icon: <Star className="size-4" />,
    },
    {
      label: copy.totalRevenue,
      value: formatCurrency(totalRevenue, locale),
      hint: copy.revenueHint,
      icon: <Wallet className="size-4" />,
    },
    {
      label: copy.topSource,
      value: topSource,
      hint: copy.sourceHint,
      icon: <TrendingUp className="size-4" />,
    },
  ];

  if (!hasHydrated || !mounted) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <main
          className={cn(
            'min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6',
            pageBg(isLight),
          )}
        >
          <div className="mx-auto w-full max-w-[var(--page-max-width)]">
            <div className="mb-6 md:mb-7">
              <div className="min-w-0">
                <h1
                  className={cn(
                    'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                    pageText(isLight),
                  )}
                >
                  {copy.title}
                </h1>

                <p
                  className={cn(
                    'mt-2 max-w-[760px] text-[13px] leading-5',
                    mutedText(isLight),
                  )}
                >
                  {copy.description}
                </p>
              </div>
            </div>

            <Card light={isLight} className="overflow-hidden">
              <div className="grid min-h-[320px] place-items-center px-5 py-12 text-center">
                <div className="mx-auto max-w-[520px]">
                  <MicroLabel light={isLight}>
                    <StatusDot light={isLight} />
                    {locale === 'ru' ? 'Профиль не настроен' : 'Profile missing'}
                  </MicroLabel>

                  <h2
                    className={cn(
                      'mt-5 text-[28px] font-semibold tracking-[-0.065em] md:text-[36px]',
                      pageText(isLight),
                    )}
                  >
                    {copy.createProfileTitle}
                  </h2>

                  <p className={cn('mt-3 text-[13px] leading-5', mutedText(isLight))}>
                    {copy.createProfileDescription}
                  </p>

                  <div className="mt-6 flex justify-center">
                    <ActionLink href="/create-profile" light={isLight} active>
                      <SquarePen className="size-3.5" />
                      {copy.createProfileButton}
                    </ActionLink>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <Users2 className="size-3.5" />
                    {copy.setupCards.base}
                  </MicroLabel>

                  <div
                    className={cn(
                      'mt-4 text-[13px] font-semibold tracking-[-0.018em]',
                      pageText(isLight),
                    )}
                  >
                    {locale === 'ru' ? 'Клиентская база' : 'Client base'}
                  </div>

                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {copy.setupCards.baseText}
                  </p>
                </div>
              </Card>

              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <NotebookPen className="size-3.5" />
                    {copy.setupCards.crm}
                  </MicroLabel>

                  <div
                    className={cn(
                      'mt-4 text-[13px] font-semibold tracking-[-0.018em]',
                      pageText(isLight),
                    )}
                  >
                    CRM
                  </div>

                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {copy.setupCards.crmText}
                  </p>
                </div>
              </Card>

              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <Sparkles className="size-3.5" />
                    {copy.setupCards.notes}
                  </MicroLabel>

                  <div
                    className={cn(
                      'mt-4 text-[13px] font-semibold tracking-[-0.018em]',
                      pageText(isLight),
                    )}
                  >
                    {locale === 'ru' ? 'Повторные визиты' : 'Repeat visits'}
                  </div>

                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {copy.setupCards.notesText}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <main
        className={cn(
          'min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6',
          pageBg(isLight),
        )}
      >
        <div className="mx-auto w-full max-w-[var(--page-max-width)]">
          <div className="mb-6 md:mb-7">
            <div className="min-w-0">
              <h1
                className={cn(
                  'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                  pageText(isLight),
                )}
              >
                {copy.title}
              </h1>

              <p
                className={cn(
                  'mt-2 max-w-[760px] text-[13px] leading-5',
                  mutedText(isLight),
                )}
              >
                {copy.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Card light={isLight} className="overflow-hidden">
              <div className="p-5 md:p-6">
                <div
                  className={cn(
                    'text-[32px] font-semibold tracking-[-0.08em] md:text-[44px]',
                    pageText(isLight),
                  )}
                >
                  {totalClients} {copy.clientsWord}
                </div>

                <p
                  className={cn(
                    'mt-3 max-w-[680px] text-[12.5px] leading-6',
                    mutedText(isLight),
                  )}
                >
                  {copy.snapshotDescription}
                </p>

                <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <HeroStat
                    label={copy.totalClients}
                    value={totalClients}
                    hint={copy.clientsWord}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.regular}
                    value={`${regularRate}%`}
                    hint={`${regularClients} ${copy.visitsWord}`}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.favorites}
                    value={`${favoriteRate}%`}
                    hint={`${favoriteClients} ${copy.favoriteWord}`}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.averageCheck}
                    value={formatCurrency(dataset.totals.averageCheck, locale)}
                    hint={copy.avgWord}
                    light={isLight}
                  />
                </div>
              </div>
            </Card>

            <Card light={isLight}>
              <CardTitle
                title={copy.portrait}
                description={copy.portraitDescription}
                light={isLight}
              />

              <div
                className={cn(
                  'grid divide-y md:grid-cols-4 md:divide-x md:divide-y-0',
                  divideTone(isLight),
                )}
              >
                {portraitItems.map((item) => (
                  <InsightTile
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    hint={item.hint}
                    icon={item.icon}
                    light={isLight}
                  />
                ))}
              </div>

              <div className={cn('border-t p-4', borderTone(isLight))}>
                <div className="grid gap-2 md:grid-cols-3">
                  <KeyValue
                    label={copy.latestVisit}
                    value={
                      latestClient
                        ? `${latestClient.name} · ${formatClientDate(locale, latestClient.lastVisit)}`
                        : '—'
                    }
                    light={isLight}
                  />

                  <KeyValue
                    label={copy.regular}
                    value={`${regularClients}/${totalClients}`}
                    light={isLight}
                  />

                  <KeyValue
                    label={copy.favorites}
                    value={`${favoriteClients}/${totalClients}`}
                    light={isLight}
                  />
                </div>
              </div>
            </Card>

            <Card light={isLight}>
              <CardTitle
                title={copy.clientBase}
                description={copy.clientBaseDescription}
                light={isLight}
              />

              <div className="space-y-4 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <SearchBox
                    value={query}
                    onChange={setQuery}
                    placeholder={copy.search}
                    light={isLight}
                  />

                  <ControlGroup light={isLight} className="max-w-full overflow-x-auto">
                    {sortOptions.map((option) => (
                      <FilterChip
                        key={option.value}
                        active={sortBy === option.value}
                        label={option.label}
                        onClick={() => setSortBy(option.value)}
                        light={isLight}
                        accentColor={accentColor}
                      />
                    ))}
                  </ControlGroup>
                </div>

                <ControlGroup light={isLight} className="max-w-full overflow-x-auto">
                  {filterOptions.map((option) => (
                    <FilterChip
                      key={option.value}
                      active={filter === option.value}
                      label={option.label}
                      count={filterCounts[option.value]}
                      onClick={() => setFilter(option.value)}
                      light={isLight}
                      accentColor={accentColor}
                    />
                  ))}
                </ControlGroup>

                <div className="grid gap-2.5 lg:hidden">
                  {clients.map((client) => (
                    <MobileClientCard
                      key={client.id}
                      client={client}
                      locale={locale}
                      onOpen={() => setSelectedClientId(client.id)}
                      light={isLight}
                      accentColor={accentColor}
                      publicAccentColor={publicAccentColor}
                    />
                  ))}

                  {!clients.length ? (
                    <EmptyState light={isLight}>{copy.noClients}</EmptyState>
                  ) : null}
                </div>

                <ListBox light={isLight} className="hidden lg:block">
                  <div className="hidden lg:block">
                    <div className="grid min-h-[40px] grid-cols-[4px_minmax(0,1fr)]">
                      <div />

                      <div
                        className={cn(
                          'grid gap-4 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em]',
                          tableGridClass,
                          faintText(isLight),
                        )}
                      >
                        <div>{copy.client}</div>
                        <div className="text-right">{copy.segment}</div>
                        <div className="text-center">{copy.visits}</div>
                        <div className="text-right">{copy.averageCheck}</div>
                        <div className="text-center">{copy.lastVisit}</div>
                        <div>{copy.note}</div>
                        <div />
                      </div>
                    </div>
                  </div>

                  {clients.map((client) => (
                    <ClientTableRow
                      key={client.id}
                      client={client}
                      locale={locale}
                      onOpen={() => setSelectedClientId(client.id)}
                      light={isLight}
                      accentColor={accentColor}
                      publicAccentColor={publicAccentColor}
                    />
                  ))}

                  {!clients.length ? (
                    <ListRow>
                      <div className="py-4 text-center">
                        <div className={cn('text-[12px]', mutedText(isLight))}>
                          {copy.noClients}
                        </div>
                      </div>
                    </ListRow>
                  ) : null}
                </ListBox>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <ClientCrmDialog
        open={Boolean(selectedClient)}
        client={selectedClient}
        locale={locale}
        light={isLight}
        accentColor={accentColor}
        publicAccentColor={publicAccentColor}
        noteValue={
          selectedClient
            ? clientNotes[selectedClient.id] ?? clientNotes[selectedClient.phone] ?? selectedClient.note
            : ''
        }
        reminderValue={
          selectedClient
            ? clientReminders[selectedClient.id] ?? clientReminders[selectedClient.phone]
            : undefined
        }
        onSaveNote={(clientId, note) => {
          if (!selectedClient) return;
          setClientNotes((current) => ({
            ...current,
            [clientId]: note,
            [selectedClient.phone]: note,
          }));
        }}
        onSaveReminder={(clientId, reminder) => {
          if (!selectedClient) return;
          setClientReminders((current) => ({
            ...current,
            [clientId]: reminder,
            [selectedClient.phone]: reminder,
          }));
        }}
        onToggleFavorite={(clientId, favorite) => {
          if (!selectedClient) return;
          setClientFavorites((current) => ({
            ...current,
            [clientId]: favorite,
            [selectedClient.phone]: favorite,
          }));
        }}
        onClose={() => setSelectedClientId(null)}
      />
    </WorkspaceShell>
  );
}