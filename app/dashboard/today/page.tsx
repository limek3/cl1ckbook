// app/dashboard/today/page.tsx
'use client';

import Link from 'next/link';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTheme } from 'next-themes';
import {
  Ban,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Globe2,
  MessageCircleMore,
  PhoneCall,
  SquarePen,
  X,
} from 'lucide-react';

import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { Button } from '@/components/ui/button';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useApp } from '@/lib/app-context';
import { useAppearance } from '@/lib/appearance-context';
import { accentPalette } from '@/lib/appearance-palette';
import type { Booking, BookingStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';
type CalendarView = 'day' | 'week' | 'month';

interface CalendarBooking {
  id: string;
  source: Booking;
  clientName: string;
  service: string;
  phone: string;
  date: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  status: BookingStatus;
  note?: string;
  sourceLabel?: string;
  amount: number;
  color: string;
}

interface LaidOutBooking extends CalendarBooking {
  lane: number;
  laneCount: number;
}

const AUTO_SERVICE_COLORS = [
  '#58A6FF',
  '#F472B6',
  '#A78BFA',
  '#34D399',
  '#FBBF24',
  '#22D3EE',
  '#FB7185',
  '#60A5FA',
  '#C084FC',
  '#2DD4BF',
];

const HOUR_HEIGHT = 44;
const FALLBACK_START_HOUR = 8;
const FALLBACK_END_HOUR = 22;

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
    : 'border-white/[0.08] bg-[#101010]';
}

function insetTone(light: boolean) {
  return light
    ? 'border-black/[0.07] bg-black/[0.025]'
    : 'border-white/[0.07] bg-white/[0.035]';
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

function iconButtonBase(light: boolean) {
  return cn(
    'inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] border text-[12px] transition-[background,border-color,color,transform] duration-150 active:scale-[0.965]',
    light
      ? 'border-black/[0.08] bg-white text-black/54 hover:border-black/[0.14] hover:bg-black/[0.035] hover:text-black'
      : 'border-white/[0.08] bg-white/[0.04] text-white/54 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white',
  );
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

function bookingCardStyle(color: string, light: boolean, active = false): CSSProperties {
  return {
    background: light
      ? `linear-gradient(135deg, color-mix(in srgb, ${color} 13%, #ffffff), color-mix(in srgb, ${color} 6%, #ffffff))`
      : `linear-gradient(135deg, color-mix(in srgb, ${color} 24%, #141414), color-mix(in srgb, ${color} 10%, #101010))`,
    borderColor: light
      ? `color-mix(in srgb, ${color} 36%, rgba(0,0,0,0.08))`
      : `color-mix(in srgb, ${color} 42%, rgba(255,255,255,0.08))`,
    boxShadow: active
      ? light
        ? `0 12px 30px color-mix(in srgb, ${color} 16%, transparent), inset 0 0 0 1px color-mix(in srgb, ${color} 16%, transparent)`
        : `0 12px 30px color-mix(in srgb, ${color} 18%, transparent), inset 0 0 0 1px color-mix(in srgb, ${color} 18%, transparent)`
      : undefined,
  };
}

function toLocalIsoDate(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function parseIsoDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function addMonths(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + amount);
  return copy;
}

function startOfWeekMonday(date: Date) {
  const copy = new Date(date);
  const weekday = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - weekday);
  return copy;
}

function startOfMonth(date: Date) {
  const copy = new Date(date);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time
    .split(':')
    .map((value) => Number.parseInt(value, 10));

  return (
    (Number.isFinite(hours) ? hours : 0) * 60 +
    (Number.isFinite(minutes) ? minutes : 0)
  );
}

function formatMinutesAsTime(totalMinutes: number) {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, totalMinutes));
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (normalized % 60).toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

function formatCompactDate(date: Date, locale: 'ru' | 'en') {
  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
    })
      .format(date)
      .replace('.', '');
  } catch {
    return toLocalIsoDate(date);
  }
}

function formatLongDate(date: Date, locale: 'ru' | 'en') {
  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
    }).format(date);
  } catch {
    return toLocalIsoDate(date);
  }
}

function formatRangeTitle(view: CalendarView, selectedDate: Date, locale: 'ru' | 'en') {
  if (view === 'day') return formatLongDate(selectedDate, locale);

  if (view === 'week') {
    const start = startOfWeekMonday(selectedDate);
    const end = addDays(start, 6);
    return `${formatCompactDate(start, locale)} — ${formatCompactDate(end, locale)}`;
  }

  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(selectedDate);
  } catch {
    return selectedDate.toLocaleDateString();
  }
}

function getShortWeekday(date: Date, locale: 'ru' | 'en') {
  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'short',
    })
      .format(date)
      .replace('.', '')
      .replace(/^[a-zа-яё]/i, (char) => char.toUpperCase());
  } catch {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][(date.getDay() + 6) % 7] ?? '';
  }
}

function formatCurrencyCompact(value: number, locale: 'ru' | 'en') {
  try {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);
  } catch {
    return `${Math.round(value)} ₽`;
  }
}

function isActiveBooking(booking: Booking) {
  return booking.status !== 'cancelled' && booking.status !== 'no_show';
}

function isDoneBooking(booking: Booking) {
  return booking.status === 'completed';
}

function getBookingAmount(booking: Booking) {
  return typeof booking.priceAmount === 'number' && Number.isFinite(booking.priceAmount)
    ? booking.priceAmount
    : 0;
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getStringFromRecord(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return undefined;
}

function normalizeColor(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const color = value.trim();
  if (!color) return undefined;

  if (
    /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color) ||
    /^rgba?\(/i.test(color) ||
    /^hsla?\(/i.test(color)
  ) {
    return color;
  }

  return undefined;
}

function buildServiceMap(datasetServices: unknown, workspaceServices: unknown) {
  const source = Array.isArray(workspaceServices)
    ? workspaceServices
    : Array.isArray(datasetServices)
      ? datasetServices
      : [];

  const map = new Map<string, Record<string, unknown>>();

  for (const item of source) {
    const record = getObject(item);
    if (!record) continue;

    const name = getStringFromRecord(record, ['name', 'title', 'label']);
    if (name) map.set(name, record);
  }

  return map;
}

function getServiceColor(
  booking: Booking,
  serviceMap: Map<string, Record<string, unknown>>,
  accentColor: string,
  publicAccentColor: string,
) {
  const metadata = getObject(booking.metadata);
  const metadataColor = normalizeColor(
    getStringFromRecord(metadata, ['color', 'serviceColor', 'calendarColor', 'accentColor']),
  );

  if (metadataColor) return metadataColor;

  const service = serviceMap.get(booking.service);
  const serviceColor = normalizeColor(
    getStringFromRecord(service ?? null, ['color', 'serviceColor', 'accentColor', 'calendarColor']),
  );

  if (serviceColor) return serviceColor;

  if (booking.status === 'new') return publicAccentColor;
  if (booking.status === 'confirmed') return accentColor;

  const index = hashString(booking.service || booking.id) % AUTO_SERVICE_COLORS.length;
  return AUTO_SERVICE_COLORS[index] ?? accentColor;
}

function getServiceDuration(
  booking: Booking,
  serviceMap: Map<string, Record<string, unknown>>,
) {
  if (
    typeof booking.durationMinutes === 'number' &&
    Number.isFinite(booking.durationMinutes) &&
    booking.durationMinutes > 0
  ) {
    return booking.durationMinutes;
  }

  const service = serviceMap.get(booking.service);
  const duration = service?.duration;

  if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0) {
    return duration;
  }

  return 60;
}

function mapBookingToCalendarBooking(
  booking: Booking,
  serviceMap: Map<string, Record<string, unknown>>,
  accentColor: string,
  publicAccentColor: string,
): CalendarBooking {
  const startMinutes = parseTimeToMinutes(booking.time);
  const durationMinutes = getServiceDuration(booking, serviceMap);
  const endMinutes = startMinutes + durationMinutes;

  return {
    id: booking.id,
    source: booking,
    clientName: booking.clientName,
    service: booking.service,
    phone: booking.clientPhone,
    date: booking.date,
    start: booking.time,
    end: formatMinutesAsTime(endMinutes),
    startMinutes,
    endMinutes,
    durationMinutes,
    status: booking.status,
    note: booking.comment || undefined,
    sourceLabel: booking.source ?? booking.channel,
    amount: getBookingAmount(booking),
    color: getServiceColor(booking, serviceMap, accentColor, publicAccentColor),
  };
}

function getVisibleDates(view: CalendarView, selectedDate: Date) {
  if (view === 'day') return [selectedDate];

  if (view === 'week') {
    const start = startOfWeekMonday(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }

  const monthStart = startOfMonth(selectedDate);
  const gridStart = startOfWeekMonday(monthStart);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function getHoursRange(items: CalendarBooking[]) {
  if (!items.length) {
    return { startHour: FALLBACK_START_HOUR, endHour: FALLBACK_END_HOUR };
  }

  const minStart = Math.min(...items.map((item) => item.startMinutes));
  const maxEnd = Math.max(...items.map((item) => item.endMinutes));

  return {
    startHour: Math.max(0, Math.min(FALLBACK_START_HOUR, Math.floor(minStart / 60))),
    endHour: Math.min(24, Math.max(FALLBACK_END_HOUR, Math.ceil(maxEnd / 60))),
  };
}

function layoutOverlaps(items: CalendarBooking[]): LaidOutBooking[] {
  const sorted = [...items].sort((left, right) => {
    if (left.startMinutes === right.startMinutes) return right.endMinutes - left.endMinutes;
    return left.startMinutes - right.startMinutes;
  });

  const result: LaidOutBooking[] = [];
  let group: CalendarBooking[] = [];
  let groupEnd = -1;

  function flushGroup() {
    if (!group.length) return;

    const laneEnds: number[] = [];
    const groupResult: LaidOutBooking[] = [];

    for (const item of group) {
      let lane = laneEnds.findIndex((end) => end <= item.startMinutes);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(item.endMinutes);
      } else {
        laneEnds[lane] = item.endMinutes;
      }

      groupResult.push({
        ...item,
        lane,
        laneCount: 1,
      });
    }

    const laneCount = Math.max(1, laneEnds.length);
    result.push(...groupResult.map((item) => ({ ...item, laneCount })));
    group = [];
    groupEnd = -1;
  }

  for (const item of sorted) {
    if (!group.length) {
      group = [item];
      groupEnd = item.endMinutes;
      continue;
    }

    if (item.startMinutes < groupEnd) {
      group.push(item);
      groupEnd = Math.max(groupEnd, item.endMinutes);
      continue;
    }

    flushGroup();
    group = [item];
    groupEnd = item.endMinutes;
  }

  flushGroup();
  return result;
}

function bookingStatusLabel(status: BookingStatus, locale: 'ru' | 'en') {
  if (locale === 'ru') {
    if (status === 'new') return 'Новая';
    if (status === 'confirmed') return 'Подтверждена';
    if (status === 'completed') return 'Пришёл';
    if (status === 'no_show') return 'Не пришёл';
    if (status === 'cancelled') return 'Отменена';
  }

  if (status === 'new') return 'New';
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'completed') return 'Arrived';
  if (status === 'no_show') return 'No-show';
  if (status === 'cancelled') return 'Cancelled';

  return status;
}

function bookingStatusHint(status: BookingStatus, locale: 'ru' | 'en') {
  if (locale === 'ru') {
    if (status === 'new') return 'ожидает';
    if (status === 'confirmed') return 'в графике';
    if (status === 'completed') return 'закрыта';
    if (status === 'no_show') return 'пропуск';
    if (status === 'cancelled') return 'снята';
  }

  if (status === 'new') return 'waiting';
  if (status === 'confirmed') return 'scheduled';
  if (status === 'completed') return 'closed';
  if (status === 'no_show') return 'missed';
  if (status === 'cancelled') return 'cancelled';

  return 'status';
}

function statusTone(status: BookingStatus, color: string, light: boolean) {
  if (status === 'completed') return light ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.34)';
  if (status === 'no_show' || status === 'cancelled') return light ? '#B64A4A' : '#FF8585';
  return color;
}

function PageAction({
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
    <Button asChild className={buttonBase(light, active)}>
      <Link href={href}>{children}</Link>
    </Button>
  );
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
  action,
}: {
  title: string;
  description?: string;
  light: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[56px] items-center justify-between gap-4 border-b px-4 py-3',
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

      {action ? <div className="shrink-0">{action}</div> : null}
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
  label,
  active,
  onClick,
  light,
  accentColor,
  compact,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  light: boolean;
  accentColor: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex shrink-0 items-center justify-center border-r text-[11px] font-semibold tracking-[-0.015em] transition-colors duration-150 last:border-r-0 active:scale-[0.985]',
        compact ? 'h-8 min-w-[48px] px-3' : 'h-10 min-w-[72px] px-4',
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

function MetricTile({
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
        'min-w-0 rounded-[10px] border px-3 py-2.5 transition-colors duration-150',
        light
          ? 'border-black/[0.07] bg-white hover:bg-black/[0.018]'
          : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.055]',
      )}
    >
      <div className={cn('truncate text-[10.5px] font-medium', mutedText(light))}>
        {label}
      </div>
      <div
        className={cn(
          'mt-1.5 truncate text-[18px] font-semibold leading-none tracking-[-0.055em] tabular-nums',
          pageText(light),
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className={cn('mt-1 truncate text-[10px]', faintText(light))}>{hint}</div>
      ) : null}
    </div>
  );
}

function EmptyState({
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
        'rounded-[10px] border px-4 py-5 text-[12px]',
        insetTone(light),
        mutedText(light),
        className,
      )}
    >
      {children}
    </div>
  );
}

function TimeGrid({
  startHour,
  endHour,
  light,
}: {
  startHour: number;
  endHour: number;
  light: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: endHour - startHour + 1 }, (_, index) => {
        const hour = startHour + index;

        return (
          <div
            key={hour}
            className={cn('absolute left-0 right-0 border-t', borderTone(light))}
            style={{ top: index * HOUR_HEIGHT }}
          >
            <div
              className={cn(
                'absolute -left-[62px] -top-[7px] w-12 text-right text-[10.5px] font-medium tabular-nums',
                faintText(light),
              )}
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BookingBlock({
  booking,
  top,
  height,
  light,
  locale,
  compact,
  active,
  onClick,
  style,
}: {
  booking: CalendarBooking;
  top: number;
  height: number;
  light: boolean;
  locale: 'ru' | 'en';
  compact?: boolean;
  active?: boolean;
  onClick: () => void;
  style?: CSSProperties;
}) {
  const statusColor = statusTone(booking.status, booking.color, light);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        top,
        height: Math.max(compact ? 28 : 34, height - 4),
        ...bookingCardStyle(booking.color, light, active),
        ...style,
      }}
      className={cn(
        'absolute overflow-hidden rounded-[9px] border px-2.5 py-1.5 text-left transition-[box-shadow,transform,filter] duration-150 hover:-translate-y-px',
        active && 'z-20',
      )}
    >
      <span
        style={{ background: statusColor }}
        className="absolute inset-y-1.5 left-1 w-1 rounded-full"
      />

      <div className="min-w-0 pl-2">
        <div
          className={cn(
            'truncate font-semibold tracking-[-0.018em]',
            compact ? 'text-[10.5px]' : 'text-[11.5px]',
            pageText(light),
          )}
        >
          {booking.clientName}
        </div>
        <div
          className={cn(
            'mt-0.5 truncate font-medium',
            compact ? 'text-[9.5px]' : 'text-[10px]',
            light ? 'text-black/52' : 'text-white/52',
          )}
        >
          {booking.start} · {booking.service}
        </div>
        {!compact && height >= 54 ? (
          <div className={cn('mt-1 truncate text-[9.5px]', faintText(light))}>
            {bookingStatusLabel(booking.status, locale)}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function StatusBadge({
  booking,
  locale,
  light,
}: {
  booking: CalendarBooking;
  locale: 'ru' | 'en';
  light: boolean;
}) {
  const color = statusTone(booking.status, booking.color, light);

  return (
    <MicroLabel light={light} active accentColor={color}>
      <StatusDot light={light} active accentColor={color} />
      {bookingStatusLabel(booking.status, locale)}
    </MicroLabel>
  );
}

function DayCalendar({
  items,
  selectedId,
  selectedDate,
  nowMinutes,
  todayIso,
  startHour,
  endHour,
  light,
  locale,
  onSelect,
}: {
  items: CalendarBooking[];
  selectedId: string | null;
  selectedDate: Date;
  nowMinutes: number;
  todayIso: string;
  startHour: number;
  endHour: number;
  light: boolean;
  locale: 'ru' | 'en';
  onSelect: (booking: CalendarBooking) => void;
}) {
  const iso = toLocalIsoDate(selectedDate);
  const dayItems = useMemo(
    () => layoutOverlaps(items.filter((item) => item.date === iso)),
    [iso, items],
  );

  const height = (endHour - startHour) * HOUR_HEIGHT;
  const offset = startHour * 60;
  const showNow = iso === todayIso && nowMinutes >= offset && nowMinutes <= endHour * 60;

  return (
    <Panel light={light} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 md:px-5">
        <div className="min-w-0">
          <div className={cn('text-[13px] font-semibold tracking-[-0.018em]', pageText(light))}>
            {formatCompactDate(selectedDate, locale)}
          </div>
          <div className={cn('mt-0.5 text-[11px]', mutedText(light))}>
            {dayItems.length
              ? locale === 'ru'
                ? `${dayItems.length} записей`
                : `${dayItems.length} bookings`
              : locale === 'ru'
                ? 'свободный день'
                : 'free day'}
          </div>
        </div>
        <MicroLabel light={light}>
          <Clock3 className="size-3.5" />
          {formatMinutesAsTime(startHour * 60)}–{formatMinutesAsTime(endHour * 60)}
        </MicroLabel>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px] px-4 pb-4 pl-[82px] pr-3 pt-3 md:px-5 md:pl-[88px]">
          <div className="relative" style={{ height }}>
            <TimeGrid startHour={startHour} endHour={endHour} light={light} />

            {showNow ? (
              <div
                className="pointer-events-none absolute left-0 right-0 z-10"
                style={{ top: ((nowMinutes - offset) / 60) * HOUR_HEIGHT }}
              >
                <div className="relative h-px bg-current text-current">
                  <span className="absolute -left-1 -top-[3px] size-1.5 rounded-full bg-current" />
                </div>
              </div>
            ) : null}

            <div className="absolute inset-0">
              {dayItems.map((booking) => {
                const top = ((booking.startMinutes - offset) / 60) * HOUR_HEIGHT;
                const heightPx = ((booking.endMinutes - booking.startMinutes) / 60) * HOUR_HEIGHT;
                const gap = 6;
                const width = `calc(${100 / booking.laneCount}% - ${gap}px)`;
                const left = `calc(${(100 / booking.laneCount) * booking.lane}% + ${gap / 2}px)`;

                return (
                  <BookingBlock
                    key={booking.id}
                    booking={booking}
                    top={top}
                    height={heightPx}
                    light={light}
                    locale={locale}
                    active={selectedId === booking.id}
                    onClick={() => onSelect(booking)}
                    style={{ left, width }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {!dayItems.length ? (
        <div className="px-4 pb-4 md:px-5">
          <EmptyState light={light}>
            {locale === 'ru'
              ? 'На выбранный день пока нет записей.'
              : 'No bookings for the selected day yet.'}
          </EmptyState>
        </div>
      ) : null}
    </Panel>
  );
}

function WeekCalendar({
  items,
  selectedId,
  selectedDate,
  nowMinutes,
  todayIso,
  startHour,
  endHour,
  light,
  locale,
  onSelect,
  onSelectDate,
}: {
  items: CalendarBooking[];
  selectedId: string | null;
  selectedDate: Date;
  nowMinutes: number;
  todayIso: string;
  startHour: number;
  endHour: number;
  light: boolean;
  locale: 'ru' | 'en';
  onSelect: (booking: CalendarBooking) => void;
  onSelectDate: (date: Date) => void;
}) {
  const days = useMemo(() => {
    const start = startOfWeekMonday(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [selectedDate]);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const item of items) {
      const current = map.get(item.date) ?? [];
      current.push(item);
      map.set(item.date, current);
    }
    return map;
  }, [items]);

  const height = (endHour - startHour) * HOUR_HEIGHT;
  const offset = startHour * 60;

  return (
    <Panel light={light} className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[940px]">
          <div
            className={cn(
              'grid border-b',
              borderTone(light),
            )}
            style={{ gridTemplateColumns: '70px repeat(7, minmax(116px, 1fr))' }}
          >
            <div className={cn('px-3 py-3 text-[10.5px] font-medium', mutedText(light))}>
              {locale === 'ru' ? 'Время' : 'Time'}
            </div>

            {days.map((date) => {
              const iso = toLocalIsoDate(date);
              const isToday = iso === todayIso;
              const count = itemsByDate.get(iso)?.length ?? 0;

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    'border-l px-2 py-2 text-left transition-colors',
                    borderTone(light),
                    isToday
                      ? light
                        ? 'bg-black/[0.025]'
                        : 'bg-white/[0.035]'
                      : light
                        ? 'hover:bg-black/[0.018]'
                        : 'hover:bg-white/[0.026]',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-[11px] font-semibold', pageText(light))}>
                      {getShortWeekday(date, locale)}
                    </span>
                    <span
                      className={cn(
                        'grid size-6 place-items-center rounded-[8px] text-[11px] font-semibold',
                        isToday
                          ? light
                            ? 'bg-black text-white'
                            : 'bg-white text-black'
                          : mutedText(light),
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <div className={cn('mt-1 text-[10px]', faintText(light))}>
                    {count
                      ? locale === 'ru'
                        ? `${count} зап.`
                        : `${count} bk.`
                      : '—'}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className="grid"
            style={{ gridTemplateColumns: '70px repeat(7, minmax(116px, 1fr))' }}
          >
            <div className="relative" style={{ height }}>
              {Array.from({ length: endHour - startHour + 1 }, (_, index) => {
                const hour = startHour + index;

                return (
                  <div
                    key={hour}
                    className={cn(
                      'absolute left-0 right-0 border-t px-3 text-[10.5px] font-medium tabular-nums',
                      borderTone(light),
                      faintText(light),
                    )}
                    style={{ top: index * HOUR_HEIGHT }}
                  >
                    <span className="relative -top-[7px]">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                );
              })}
            </div>

            {days.map((date) => {
              const iso = toLocalIsoDate(date);
              const dayItems = layoutOverlaps(itemsByDate.get(iso) ?? []);
              const showNow =
                iso === todayIso && nowMinutes >= offset && nowMinutes <= endHour * 60;

              return (
                <div
                  key={iso}
                  className={cn('relative border-l', borderTone(light))}
                  style={{ height }}
                >
                  {Array.from({ length: endHour - startHour + 1 }, (_, index) => (
                    <div
                      key={index}
                      className={cn('absolute left-0 right-0 border-t', borderTone(light))}
                      style={{ top: index * HOUR_HEIGHT }}
                    />
                  ))}

                  {showNow ? (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-10 h-px bg-current text-current"
                      style={{ top: ((nowMinutes - offset) / 60) * HOUR_HEIGHT }}
                    />
                  ) : null}

                  {dayItems.map((booking) => {
                    const top = ((booking.startMinutes - offset) / 60) * HOUR_HEIGHT;
                    const heightPx = ((booking.endMinutes - booking.startMinutes) / 60) * HOUR_HEIGHT;
                    const gap = 4;
                    const width = `calc(${100 / booking.laneCount}% - ${gap}px)`;
                    const left = `calc(${(100 / booking.laneCount) * booking.lane}% + ${gap / 2}px)`;

                    return (
                      <BookingBlock
                        key={booking.id}
                        booking={booking}
                        top={top}
                        height={heightPx}
                        light={light}
                        locale={locale}
                        compact
                        active={selectedId === booking.id}
                        onClick={() => onSelect(booking)}
                        style={{ left, width }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MonthCalendar({
  items,
  selectedDate,
  selectedId,
  todayIso,
  light,
  locale,
  onSelect,
  onSelectDate,
}: {
  items: CalendarBooking[];
  selectedDate: Date;
  selectedId: string | null;
  todayIso: string;
  light: boolean;
  locale: 'ru' | 'en';
  onSelect: (booking: CalendarBooking) => void;
  onSelectDate: (date: Date) => void;
}) {
  const days = useMemo(() => getVisibleDates('month', selectedDate), [selectedDate]);
  const monthKey = toLocalIsoDate(selectedDate).slice(0, 7);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const item of items) {
      const current = map.get(item.date) ?? [];
      current.push(item);
      map.set(item.date, current.sort((left, right) => left.start.localeCompare(right.start)));
    }
    return map;
  }, [items]);

  return (
    <Panel light={light} className="overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {Array.from({ length: 7 }, (_, index) => {
          const date = addDays(startOfWeekMonday(new Date()), index);
          return (
            <div
              key={index}
              className={cn(
                'border-r px-2.5 py-2 text-[10.5px] font-semibold last:border-r-0',
                borderTone(light),
                mutedText(light),
              )}
            >
              {getShortWeekday(date, locale)}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7">
        {days.map((date) => {
          const iso = toLocalIsoDate(date);
          const dayItems = itemsByDate.get(iso) ?? [];
          const inMonth = iso.startsWith(monthKey);
          const isToday = iso === todayIso;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                'min-h-[112px] border-r border-t p-2 text-left transition-colors last:border-r-0',
                borderTone(light),
                inMonth
                  ? light
                    ? 'bg-white/50 hover:bg-black/[0.018]'
                    : 'bg-white/[0.018] hover:bg-white/[0.032]'
                  : light
                    ? 'bg-black/[0.018] text-black/32'
                    : 'bg-white/[0.012] text-white/28',
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'grid size-6 place-items-center rounded-[8px] text-[11px] font-semibold',
                    isToday
                      ? light
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                      : pageText(light),
                  )}
                >
                  {date.getDate()}
                </span>
                {dayItems.length ? (
                  <span className={cn('text-[10px] font-medium', faintText(light))}>
                    {dayItems.length}
                  </span>
                ) : null}
              </div>

              <div className="space-y-1">
                {dayItems.slice(0, 3).map((booking) => (
                  <span
                    key={booking.id}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(booking);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        onSelect(booking);
                      }
                    }}
                    style={bookingCardStyle(booking.color, light, selectedId === booking.id)}
                    className="block rounded-[7px] border px-1.5 py-1"
                  >
                    <span className={cn('block truncate text-[10px] font-semibold', pageText(light))}>
                      {booking.start} · {booking.clientName}
                    </span>
                  </span>
                ))}

                {dayItems.length > 3 ? (
                  <span className={cn('block pt-0.5 text-[10px] font-medium', mutedText(light))}>
                    +{dayItems.length - 3}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function BookingDetails({
  booking,
  locale,
  light,
  actionLoading,
  onClose,
  onStatusChange,
}: {
  booking: CalendarBooking;
  locale: 'ru' | 'en';
  light: boolean;
  actionLoading: BookingStatus | null;
  onClose: () => void;
  onStatusChange: (status: BookingStatus) => void;
}) {
  const statusColor = statusTone(booking.status, booking.color, light);
  const isClosed =
    booking.status === 'completed' ||
    booking.status === 'no_show' ||
    booking.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] md:items-center">
      <button
        type="button"
        aria-label={locale === 'ru' ? 'Закрыть' : 'Close'}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full max-w-[420px] overflow-hidden rounded-[18px] border shadow-[0_24px_90px_rgba(0,0,0,0.32)]',
          light ? 'border-black/[0.08] bg-[#fbfbfa]' : 'border-white/[0.09] bg-[#101010]',
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <MicroLabel light={light} active accentColor={statusColor}>
                <StatusDot light={light} active accentColor={statusColor} />
                {bookingStatusLabel(booking.status, locale)}
              </MicroLabel>

              <div
                className={cn(
                  'mt-3 truncate text-[24px] font-semibold tracking-[-0.065em]',
                  pageText(light),
                )}
              >
                {booking.clientName}
              </div>

              <div className={cn('mt-1 truncate text-[12px]', mutedText(light))}>
                {booking.service}
              </div>
            </div>

            <button type="button" onClick={onClose} className={iconButtonBase(light)}>
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Panel light={light} className="p-3">
              <div className={cn('text-[10.5px] font-medium', faintText(light))}>
                {locale === 'ru' ? 'Время' : 'Time'}
              </div>
              <div className={cn('mt-1 text-[13px] font-semibold', pageText(light))}>
                {booking.start}–{booking.end}
              </div>
            </Panel>

            <Panel light={light} className="p-3">
              <div className={cn('text-[10.5px] font-medium', faintText(light))}>
                {locale === 'ru' ? 'Длительность' : 'Duration'}
              </div>
              <div className={cn('mt-1 text-[13px] font-semibold', pageText(light))}>
                {booking.durationMinutes} {locale === 'ru' ? 'мин' : 'min'}
              </div>
            </Panel>

            <Panel light={light} className="p-3">
              <div className={cn('text-[10.5px] font-medium', faintText(light))}>
                {locale === 'ru' ? 'Сумма' : 'Amount'}
              </div>
              <div className={cn('mt-1 text-[13px] font-semibold', pageText(light))}>
                {booking.amount ? formatCurrencyCompact(booking.amount, locale) : '—'}
              </div>
            </Panel>

            <Panel light={light} className="p-3">
              <div className={cn('text-[10.5px] font-medium', faintText(light))}>
                {locale === 'ru' ? 'Источник' : 'Source'}
              </div>
              <div className={cn('mt-1 truncate text-[13px] font-semibold', pageText(light))}>
                {booking.sourceLabel || 'Web'}
              </div>
            </Panel>
          </div>

          <Panel light={light} className="mt-2 p-3">
            <div className={cn('text-[10.5px] font-medium', faintText(light))}>
              {locale === 'ru' ? 'Комментарий' : 'Note'}
            </div>
            <div className={cn('mt-1 text-[12px] leading-5', pageText(light))}>
              {booking.note || '—'}
            </div>
          </Panel>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button asChild className={cn('justify-start', buttonBase(light))}>
              <Link href={`tel:${booking.phone}`}>
                <PhoneCall className="size-3.5" />
                {locale === 'ru' ? 'Позвонить' : 'Call'}
              </Link>
            </Button>

            <Button asChild className={cn('justify-start', buttonBase(light, true))}>
              <Link href="/dashboard/chats">
                <MessageCircleMore className="size-3.5" />
                {locale === 'ru' ? 'Чат' : 'Chat'}
              </Link>
            </Button>

            <Button asChild className={cn('justify-start', buttonBase(light))}>
              <Link href="/dashboard/availability">
                <CalendarClock className="size-3.5" />
                {locale === 'ru' ? 'Перенести' : 'Reschedule'}
              </Link>
            </Button>

            {!isClosed ? (
              <Button
                type="button"
                className={cn('justify-start', buttonBase(light, true))}
                onClick={() => onStatusChange('completed')}
                disabled={actionLoading !== null}
              >
                <CheckCircle2 className="size-3.5" />
                {actionLoading === 'completed' ? '…' : locale === 'ru' ? 'Пришёл' : 'Arrived'}
              </Button>
            ) : null}

            {!isClosed ? (
              <Button
                type="button"
                className={cn('col-span-2 justify-start', buttonBase(light))}
                onClick={() => onStatusChange('no_show')}
                disabled={actionLoading !== null}
              >
                <Ban className="size-3.5" />
                {actionLoading === 'no_show' ? '…' : locale === 'ru' ? 'Не пришёл' : 'No-show'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardTodayPage() {
  const { updateBookingStatus } = useApp();
  const {
    hasHydrated,
    ownedProfile,
    bookings,
    dataset,
    locale,
    workspaceData,
    demoMode,
  } = useOwnedWorkspaceData();
  const { resolvedTheme } = useTheme();
  const { settings } = useAppearance();

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<BookingStatus | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedBookingId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedBookingId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBookingId]);

  const currentTheme: ThemeMode = mounted
    ? resolvedTheme === 'light'
      ? 'light'
      : 'dark'
    : 'dark';

  const isLight = currentTheme === 'light';

  const accentColor = accentPalette[settings.accentTone].solid;
  const publicAccentColor = accentPalette[settings.publicAccent].solid;

  const todayIso = useMemo(() => toLocalIsoDate(now), [now]);
  const nowMinutes = useMemo(() => now.getHours() * 60 + now.getMinutes(), [now]);

  const serviceMap = useMemo(
    () => buildServiceMap(dataset?.services, workspaceData?.services),
    [dataset?.services, workspaceData?.services],
  );

  const calendarBookings = useMemo(
    () =>
      bookings
        .map((booking) =>
          mapBookingToCalendarBooking(booking, serviceMap, accentColor, publicAccentColor),
        )
        .sort((left, right) => `${left.date}T${left.start}`.localeCompare(`${right.date}T${right.start}`)),
    [accentColor, bookings, publicAccentColor, serviceMap],
  );

  const visibleDates = useMemo(() => getVisibleDates(view, selectedDate), [selectedDate, view]);
  const visibleDateSet = useMemo(
    () => new Set(visibleDates.map((date) => toLocalIsoDate(date))),
    [visibleDates],
  );

  const visibleBookings = useMemo(
    () => calendarBookings.filter((booking) => visibleDateSet.has(booking.date)),
    [calendarBookings, visibleDateSet],
  );

  const calendarWorkRange = useMemo(
    () => getHoursRange(view === 'month' ? calendarBookings : visibleBookings),
    [calendarBookings, view, visibleBookings],
  );

  const selectedBooking = useMemo(
    () => calendarBookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [calendarBookings, selectedBookingId],
  );

  const rangeTitle = useMemo(
    () => formatRangeTitle(view, selectedDate, locale),
    [locale, selectedDate, view],
  );

  const selectedDateIso = useMemo(() => toLocalIsoDate(selectedDate), [selectedDate]);

  const nextBooking = useMemo(
    () =>
      calendarBookings.find(
        (booking) =>
          isActiveBooking(booking.source) &&
          `${booking.date}T${booking.start}` >= `${todayIso}T${formatMinutesAsTime(nowMinutes)}`,
      ) ?? null,
    [calendarBookings, nowMinutes, todayIso],
  );

  const metrics = useMemo(() => {
    const active = visibleBookings.filter((booking) => isActiveBooking(booking.source));
    const done = visibleBookings.filter((booking) => isDoneBooking(booking.source));
    const revenue = visibleBookings.reduce((sum, booking) => sum + booking.amount, 0);

    return [
      {
        label: locale === 'ru' ? 'Записи' : 'Bookings',
        value: active.length,
        hint: locale === 'ru' ? 'в периоде' : 'in range',
      },
      {
        label: locale === 'ru' ? 'Завершено' : 'Completed',
        value: done.length,
        hint: `${visibleBookings.filter((booking) => booking.status === 'no_show').length} ${
          locale === 'ru' ? 'не пришли' : 'no-show'
        }`,
      },
      {
        label: locale === 'ru' ? 'Выручка' : 'Revenue',
        value: formatCurrencyCompact(revenue, locale),
        hint: locale === 'ru' ? 'по записям' : 'from bookings',
      },
      {
        label: locale === 'ru' ? 'Ближайшая' : 'Next',
        value: nextBooking?.start ?? '—',
        hint: nextBooking ? `${nextBooking.clientName} · ${nextBooking.service}` : locale === 'ru' ? 'пока пусто' : 'empty',
      },
    ];
  }, [locale, nextBooking, visibleBookings]);

  const copy =
    locale === 'ru'
      ? {
          title: 'Сегодня',
          description: 'Компактный календарь записей: день, неделя, месяц и быстрые действия.',
          createTitle: 'Сначала настройте профиль мастера',
          createDescription:
            'Создайте профиль, чтобы открыть календарь, записи, чаты и быстрые действия.',
          createProfile: 'Создать профиль',
          profileMissing: 'Профиль не настроен',
          schedule: 'Календарь',
          scheduleDescription: 'Нажмите на запись, чтобы открыть мини-карточку клиента.',
          today: 'Сегодня',
          day: 'День',
          week: 'Неделя',
          month: 'Месяц',
          demo: 'Демо',
          live: 'Рабочий режим',
          setupCards: {
            calendar: 'Календарь',
            calendarText: 'После настройки здесь появится сетка записей мастера.',
            clients: 'Клиенты',
            clientsText: 'В карточке записи будут контакты, комментарии и статусы.',
            public: 'Онлайн-запись',
            publicText: 'Клиенты смогут записываться по публичной ссылке.',
          },
        }
      : {
          title: 'Today',
          description: 'Compact booking calendar: day, week, month, and quick actions.',
          createTitle: 'Create the master profile first',
          createDescription:
            'Create a profile to unlock calendar, bookings, chats, and quick actions.',
          createProfile: 'Create profile',
          profileMissing: 'Profile missing',
          schedule: 'Calendar',
          scheduleDescription: 'Click a booking to open a compact client card.',
          today: 'Today',
          day: 'Day',
          week: 'Week',
          month: 'Month',
          demo: 'Demo',
          live: 'Work mode',
          setupCards: {
            calendar: 'Calendar',
            calendarText: 'After setup, the master booking grid will appear here.',
            clients: 'Clients',
            clientsText: 'The booking card will show contacts, notes, and statuses.',
            public: 'Online booking',
            publicText: 'Clients will be able to book through the public link.',
          },
        };

  function goPrevious() {
    setSelectedDate((current) => {
      if (view === 'day') return addDays(current, -1);
      if (view === 'week') return addDays(current, -7);
      return addMonths(current, -1);
    });
  }

  function goNext() {
    setSelectedDate((current) => {
      if (view === 'day') return addDays(current, 1);
      if (view === 'week') return addDays(current, 7);
      return addMonths(current, 1);
    });
  }

  function goToday() {
    setSelectedDate(new Date());
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    if (view === 'month') setView('day');
  }

  function handleSelectBooking(booking: CalendarBooking) {
    setSelectedBookingId(booking.id);
  }

  async function handleStatusChange(status: BookingStatus) {
    if (!selectedBooking) return;

    setActionLoading(status);

    try {
      await updateBookingStatus(selectedBooking.id, status);
    } finally {
      setActionLoading(null);
    }
  }

  if (!hasHydrated || !mounted) return null;

  if (!ownedProfile) {
    return (
      <WorkspaceShell>
        <main
          className={cn(
            'min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6',
            pageBg(isLight),
          )}
        >
          <div className="mx-auto w-full max-w-[var(--page-max-width)]">
            <div className="mb-5 md:mb-6">
              <h1
                className={cn(
                  'text-[28px] font-semibold tracking-[-0.075em] md:text-[36px]',
                  pageText(isLight),
                )}
              >
                {copy.title}
              </h1>

              <p className={cn('mt-2 max-w-[680px] text-[13px] leading-5', mutedText(isLight))}>
                {copy.description}
              </p>
            </div>

            <Card light={isLight} className="overflow-hidden">
              <div className="grid min-h-[300px] place-items-center px-5 py-10 text-center">
                <div className="mx-auto max-w-[500px]">
                  <MicroLabel light={isLight}>
                    <StatusDot light={isLight} />
                    {copy.profileMissing}
                  </MicroLabel>

                  <h2
                    className={cn(
                      'mt-5 text-[26px] font-semibold tracking-[-0.065em] md:text-[34px]',
                      pageText(isLight),
                    )}
                  >
                    {copy.createTitle}
                  </h2>

                  <p className={cn('mt-3 text-[13px] leading-5', mutedText(isLight))}>
                    {copy.createDescription}
                  </p>

                  <div className="mt-6 flex justify-center">
                    <PageAction href="/create-profile" light={isLight} active>
                      <SquarePen className="size-3.5" />
                      {copy.createProfile}
                    </PageAction>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <CalendarClock className="size-3.5" />
                    {copy.setupCards.calendar}
                  </MicroLabel>
                  <div className={cn('mt-4 text-[13px] font-semibold', pageText(isLight))}>
                    {copy.schedule}
                  </div>
                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {copy.setupCards.calendarText}
                  </p>
                </div>
              </Card>

              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <MessageCircleMore className="size-3.5" />
                    {copy.setupCards.clients}
                  </MicroLabel>
                  <div className={cn('mt-4 text-[13px] font-semibold', pageText(isLight))}>
                    {locale === 'ru' ? 'Карточка записи' : 'Booking card'}
                  </div>
                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {copy.setupCards.clientsText}
                  </p>
                </div>
              </Card>

              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <Globe2 className="size-3.5" />
                    {copy.setupCards.public}
                  </MicroLabel>
                  <div className={cn('mt-4 text-[13px] font-semibold', pageText(isLight))}>
                    {locale === 'ru' ? 'Публичная страница' : 'Public page'}
                  </div>
                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {copy.setupCards.publicText}
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
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <MicroLabel light={isLight} active accentColor={accentColor}>
                  <StatusDot light={isLight} active accentColor={accentColor} />
                  {demoMode ? copy.demo : copy.live}
                </MicroLabel>

                <MicroLabel light={isLight}>
                  <Clock3 className="size-3.5" />
                  {formatMinutesAsTime(nowMinutes)}
                </MicroLabel>
              </div>

              <h1
                className={cn(
                  'mt-3 text-[28px] font-semibold tracking-[-0.075em] md:text-[36px]',
                  pageText(isLight),
                )}
              >
                {copy.title}
              </h1>

              <p className={cn('mt-1.5 max-w-[720px] text-[13px] leading-5', mutedText(isLight))}>
                {copy.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ControlGroup light={isLight} className="h-9">
                <FilterChip
                  label={copy.day}
                  active={view === 'day'}
                  onClick={() => setView('day')}
                  light={isLight}
                  accentColor={accentColor}
                  compact
                />
                <FilterChip
                  label={copy.week}
                  active={view === 'week'}
                  onClick={() => setView('week')}
                  light={isLight}
                  accentColor={accentColor}
                  compact
                />
                <FilterChip
                  label={copy.month}
                  active={view === 'month'}
                  onClick={() => setView('month')}
                  light={isLight}
                  accentColor={accentColor}
                  compact
                />
              </ControlGroup>

              <div className="flex items-center gap-1.5">
                <button type="button" onClick={goPrevious} className={iconButtonBase(isLight)}>
                  <ChevronLeft className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={goToday}
                  className={cn(buttonBase(isLight), 'h-8')}
                >
                  {copy.today}
                </button>

                <button type="button" onClick={goNext} className={iconButtonBase(isLight)}>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <Card light={isLight} className="overflow-hidden">
              <div className="p-4 md:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                  <div className="min-w-0">
                    <div className={cn('text-[11px] font-medium', mutedText(isLight))}>
                      {view === 'day'
                        ? locale === 'ru'
                          ? 'Выбранный день'
                          : 'Selected day'
                        : view === 'week'
                          ? locale === 'ru'
                            ? 'Выбранная неделя'
                            : 'Selected week'
                          : locale === 'ru'
                            ? 'Выбранный месяц'
                            : 'Selected month'}
                    </div>

                    <div
                      className={cn(
                        'mt-1.5 text-[24px] font-semibold tracking-[-0.065em] md:text-[30px]',
                        pageText(isLight),
                      )}
                    >
                      {rangeTitle}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:w-[560px] xl:grid-cols-4">
                    {metrics.map((metric) => (
                      <MetricTile
                        key={metric.label}
                        label={metric.label}
                        value={metric.value}
                        hint={metric.hint}
                        light={isLight}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card light={isLight}>
              <CardTitle
                title={copy.schedule}
                description={copy.scheduleDescription}
                light={isLight}
                action={
                  <MicroLabel light={isLight}>
                    {view === 'day'
                      ? selectedDateIso
                      : `${formatMinutesAsTime(calendarWorkRange.startHour * 60)}–${formatMinutesAsTime(calendarWorkRange.endHour * 60)}`}
                  </MicroLabel>
                }
              />

              <div className="p-3 md:p-4">
                {view === 'day' ? (
                  <DayCalendar
                    items={calendarBookings}
                    selectedId={selectedBookingId}
                    selectedDate={selectedDate}
                    nowMinutes={nowMinutes}
                    todayIso={todayIso}
                    startHour={calendarWorkRange.startHour}
                    endHour={calendarWorkRange.endHour}
                    light={isLight}
                    locale={locale}
                    onSelect={handleSelectBooking}
                  />
                ) : null}

                {view === 'week' ? (
                  <WeekCalendar
                    items={calendarBookings}
                    selectedId={selectedBookingId}
                    selectedDate={selectedDate}
                    nowMinutes={nowMinutes}
                    todayIso={todayIso}
                    startHour={calendarWorkRange.startHour}
                    endHour={calendarWorkRange.endHour}
                    light={isLight}
                    locale={locale}
                    onSelect={handleSelectBooking}
                    onSelectDate={handleSelectDate}
                  />
                ) : null}

                {view === 'month' ? (
                  <MonthCalendar
                    items={calendarBookings}
                    selectedDate={selectedDate}
                    selectedId={selectedBookingId}
                    todayIso={todayIso}
                    light={isLight}
                    locale={locale}
                    onSelect={handleSelectBooking}
                    onSelectDate={handleSelectDate}
                  />
                ) : null}
              </div>
            </Card>
          </div>
        </div>

        {selectedBooking ? (
          <BookingDetails
            booking={selectedBooking}
            locale={locale}
            light={isLight}
            actionLoading={actionLoading}
            onClose={() => setSelectedBookingId(null)}
            onStatusChange={(status) => void handleStatusChange(status)}
          />
        ) : null}
      </main>
    </WorkspaceShell>
  );
}
