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
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircleMore,
  PhoneCall,
  Sparkles,
  SquarePen,
  UserRound,
  Wallet,
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
type CalendarViewMode = 'day' | 'week' | 'month';

type ServiceLike = {
  name: string;
  duration?: number;
  color?: string;
  category?: string;
};

interface CalendarBooking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  status: BookingStatus;
  phone: string;
  note?: string;
  source?: string;
  color: string;
  amount: number;
  raw: Booking;
}

interface LaidOutBooking extends CalendarBooking {
  lane: number;
  lanes: number;
}

interface WorkWindow {
  startMinutes: number;
  endMinutes: number;
  hours: number[];
}

const DEFAULT_WORK_START = 8 * 60;
const DEFAULT_WORK_END = 22 * 60;
const DAY_HOUR_HEIGHT = 78;
const WEEK_HOUR_HEIGHT = 66;

const SERVICE_COLORS = [
  '#4f8cff',
  '#f45d8f',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
  '#ec4899',
  '#6366f1',
];

function pageBg(light: boolean) {
  return light ? 'bg-[#f4f4f2]' : 'bg-[#090909]';
}

function pageText(light: boolean) {
  return light ? 'text-[#0e0e0e]' : 'text-white';
}

function mutedText(light: boolean) {
  return light ? 'text-black/50' : 'text-white/46';
}

function faintText(light: boolean) {
  return light ? 'text-black/34' : 'text-white/30';
}

function borderTone(light: boolean) {
  return light ? 'border-black/[0.08]' : 'border-white/[0.08]';
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
    'inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold shadow-none transition-[background,border-color,color,opacity,transform] duration-150 active:scale-[0.985]',
    active
      ? light
        ? 'cb-neutral-primary cb-neutral-primary-light hover:opacity-[0.98]'
        : 'cb-neutral-primary cb-neutral-primary-dark hover:opacity-[0.98]'
      : light
        ? 'border-black/[0.08] bg-white text-black/62 hover:border-black/[0.14] hover:bg-black/[0.035] hover:text-black'
        : 'border-white/[0.08] bg-white/[0.04] text-white/62 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white',
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
      ? `color-mix(in srgb, ${color} 74%, #111111)`
      : `color-mix(in srgb, ${color} 16%, #ffffff)`,
    boxShadow:
      strength === 'strong'
        ? light
          ? `0 10px 28px color-mix(in srgb, ${color} 12%, transparent)`
          : `0 14px 34px color-mix(in srgb, ${color} 18%, transparent)`
        : undefined,
  };
}

function bookingCardStyle(color: string, light: boolean): CSSProperties {
  return {
    background: light
      ? `linear-gradient(180deg, color-mix(in srgb, ${color} 16%, #ffffff), color-mix(in srgb, ${color} 8%, #ffffff))`
      : `linear-gradient(180deg, color-mix(in srgb, ${color} 30%, #151515), color-mix(in srgb, ${color} 18%, #111111))`,
    borderColor: light
      ? `color-mix(in srgb, ${color} 42%, rgba(0,0,0,.12))`
      : `color-mix(in srgb, ${color} 54%, rgba(255,255,255,.16))`,
    color: light
      ? `color-mix(in srgb, ${color} 70%, #080808)`
      : `color-mix(in srgb, ${color} 10%, #ffffff)`,
    boxShadow: light
      ? `0 12px 30px color-mix(in srgb, ${color} 12%, transparent)`
      : `0 18px 42px color-mix(in srgb, ${color} 18%, transparent)`,
  };
}

function toLocalIsoDate(date: Date) {
  const copy = new Date(date);
  const timezoneOffset = copy.getTimezoneOffset() * 60000;
  return new Date(copy.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfWeekMonday(date: Date) {
  const copy = startOfDay(date);
  const weekday = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - weekday);
  return copy;
}

function startOfMonth(date: Date) {
  const copy = startOfDay(date);
  copy.setDate(1);
  return copy;
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

function isSameDay(left: Date, right: Date) {
  return toLocalIsoDate(left) === toLocalIsoDate(right);
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
  const normalized = Math.max(0, Math.min(24 * 60, totalMinutes));
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (normalized % 60).toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

function formatMoney(value: number, locale: 'ru' | 'en') {
  try {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} ₽`;
  }
}

function formatShortDate(date: Date, locale: 'ru' | 'en') {
  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return toLocalIsoDate(date);
  }
}

function formatWeekday(date: Date, locale: 'ru' | 'en') {
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

function formatFullDate(date: Date, locale: 'ru' | 'en') {
  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return toLocalIsoDate(date);
  }
}

function formatCalendarRange(view: CalendarViewMode, selectedDate: Date, locale: 'ru' | 'en') {
  if (view === 'day') return formatFullDate(selectedDate, locale);

  if (view === 'week') {
    const start = startOfWeekMonday(selectedDate);
    const end = addDays(start, 6);
    return `${formatShortDate(start, locale)} — ${formatShortDate(end, locale)}`;
  }

  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(selectedDate);
  } catch {
    return selectedDate.toISOString().slice(0, 7);
  }
}

function getRangeDates(view: CalendarViewMode, selectedDate: Date) {
  if (view === 'day') return [startOfDay(selectedDate)];
  if (view === 'week') {
    const start = startOfWeekMonday(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }

  const first = startOfWeekMonday(startOfMonth(selectedDate));
  return Array.from({ length: 42 }, (_, index) => addDays(first, index));
}

function getRangeIsoBounds(view: CalendarViewMode, selectedDate: Date) {
  if (view === 'day') {
    const iso = toLocalIsoDate(selectedDate);
    return { startIso: iso, endIso: iso };
  }

  if (view === 'week') {
    const start = startOfWeekMonday(selectedDate);
    return {
      startIso: toLocalIsoDate(start),
      endIso: toLocalIsoDate(addDays(start, 6)),
    };
  }

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = addDays(addMonths(monthStart, 1), -1);
  return {
    startIso: toLocalIsoDate(monthStart),
    endIso: toLocalIsoDate(monthEnd),
  };
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isCssColor(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getServiceColor(
  booking: Booking,
  serviceMap: Map<string, ServiceLike>,
  accentColor: string,
) {
  const metadata = booking.metadata && typeof booking.metadata === 'object'
    ? booking.metadata as Record<string, unknown>
    : null;
  const service = serviceMap.get(booking.service);
  const fromData = metadata?.color ?? metadata?.serviceColor ?? service?.color;

  if (isCssColor(fromData)) return fromData;

  const seed = service?.category ? `${service.category}:${booking.service}` : booking.service;
  return SERVICE_COLORS[hashString(seed || accentColor) % SERVICE_COLORS.length] ?? accentColor;
}

function sourceLabel(booking: Booking, locale: 'ru' | 'en') {
  const raw = String(booking.source ?? booking.channel ?? '').toLowerCase();
  if (!raw) return locale === 'ru' ? 'Сайт' : 'Web';
  if (raw.includes('tg') || raw.includes('telegram') || raw.includes('тг')) return locale === 'ru' ? 'Телеграм' : 'Telegram';
  if (raw.includes('vk') || raw.includes('вк')) return locale === 'ru' ? 'ВК' : 'VK';
  if (raw.includes('inst')) return locale === 'ru' ? 'Инстаграм' : 'Instagram';
  return String(booking.source ?? booking.channel ?? 'Web');
}

function mapBookingToCalendarBooking(
  booking: Booking,
  serviceMap: Map<string, ServiceLike>,
  accentColor: string,
  locale: 'ru' | 'en',
): CalendarBooking {
  const service = serviceMap.get(booking.service);
  const startMinutes = parseTimeToMinutes(booking.time);
  const durationMinutes = Math.max(15, booking.durationMinutes ?? service?.duration ?? 60);
  const endMinutes = startMinutes + durationMinutes;

  return {
    id: booking.id,
    clientName: booking.clientName || (locale === 'ru' ? 'Клиент' : 'Client'),
    service: booking.service || (locale === 'ru' ? 'Услуга' : 'Service'),
    date: booking.date,
    start: booking.time,
    end: formatMinutesAsTime(endMinutes),
    startMinutes,
    endMinutes,
    durationMinutes,
    status: booking.status,
    phone: booking.clientPhone,
    note: booking.comment || undefined,
    source: sourceLabel(booking, locale),
    color: getServiceColor(booking, serviceMap, accentColor),
    amount: typeof booking.priceAmount === 'number' && Number.isFinite(booking.priceAmount)
      ? booking.priceAmount
      : 0,
    raw: booking,
  };
}

function activeBooking(booking: Booking | CalendarBooking) {
  const status = 'raw' in booking ? booking.status : booking.status;
  return status !== 'cancelled' && status !== 'no_show';
}

function deriveWorkWindow(bookings: CalendarBooking[]): WorkWindow {
  const starts = bookings.map((booking) => booking.startMinutes);
  const ends = bookings.map((booking) => booking.endMinutes);
  const earliest = starts.length ? Math.min(...starts) : DEFAULT_WORK_START;
  const latest = ends.length ? Math.max(...ends) : DEFAULT_WORK_END;

  const startMinutes = Math.max(0, Math.min(DEFAULT_WORK_START, Math.floor(earliest / 60) * 60));
  const endMinutes = Math.min(24 * 60, Math.max(DEFAULT_WORK_END, Math.ceil(latest / 60) * 60));

  const hours: number[] = [];
  for (let minute = startMinutes; minute <= endMinutes; minute += 60) {
    hours.push(minute);
  }

  return { startMinutes, endMinutes, hours };
}

function layoutBookings(bookings: CalendarBooking[]): LaidOutBooking[] {
  const sorted = [...bookings].sort((left, right) => {
    if (left.startMinutes !== right.startMinutes) return left.startMinutes - right.startMinutes;
    return right.endMinutes - left.endMinutes;
  });

  const laneEnds: number[] = [];
  const result: Array<CalendarBooking & { lane: number }> = [];

  for (const booking of sorted) {
    let lane = laneEnds.findIndex((end) => end <= booking.startMinutes);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(booking.endMinutes);
    } else {
      laneEnds[lane] = booking.endMinutes;
    }

    result.push({ ...booking, lane });
  }

  const lanes = Math.max(1, laneEnds.length);
  return result.map((booking) => ({ ...booking, lanes }));
}

function groupByDate(bookings: CalendarBooking[]) {
  const map = new Map<string, CalendarBooking[]>();
  for (const booking of bookings) {
    const current = map.get(booking.date) ?? [];
    current.push(booking);
    map.set(booking.date, current);
  }

  for (const [key, value] of map) {
    map.set(key, value.sort((left, right) => left.startMinutes - right.startMinutes));
  }

  return map;
}

function statusLabel(status: BookingStatus, locale: 'ru' | 'en') {
  if (locale === 'ru') {
    if (status === 'new') return 'Новая';
    if (status === 'confirmed') return 'Подтверждена';
    if (status === 'completed') return 'Завершена';
    if (status === 'no_show') return 'Не пришёл';
    return 'Отменена';
  }

  if (status === 'new') return 'New';
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'completed') return 'Completed';
  if (status === 'no_show') return 'No-show';
  return 'Cancelled';
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
    <section className={cn('rounded-[18px] border', cardTone(light), className)}>
      {children}
    </section>
  );
}

function MicroLabel({
  children,
  light,
  active,
  color,
  className,
}: {
  children: ReactNode;
  light: boolean;
  active?: boolean;
  color?: string;
  className?: string;
}) {
  return (
    <span
      style={active && color ? accentPillStyle(color, light, 'soft') : undefined}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-[9px] border px-2.5 text-[10.5px] font-semibold',
        active && !color
          ? light
            ? 'border-black/[0.1] bg-black/[0.045] text-black/68'
            : 'border-white/[0.11] bg-white/[0.075] text-white/72'
          : !active
            ? light
              ? 'border-black/[0.08] bg-white text-black/52'
              : 'border-white/[0.08] bg-white/[0.04] text-white/48'
            : '',
        className,
      )}
    >
      {children}
    </span>
  );
}

function StatusDot({ color }: { color: string }) {
  return <span style={{ background: color }} className="size-1.5 shrink-0 rounded-full" />;
}

function IconButton({
  children,
  onClick,
  light,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  light: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-[10px] border transition-all duration-150 active:scale-[0.97]',
        light
          ? 'border-black/[0.08] bg-white text-black/62 hover:bg-black/[0.035] hover:text-black'
          : 'border-white/[0.08] bg-white/[0.04] text-white/62 hover:bg-white/[0.07] hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function SegmentButton({
  label,
  active,
  onClick,
  light,
  accentColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  light: boolean;
  accentColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex h-9 min-w-[78px] items-center justify-center rounded-[10px] px-3 text-[11px] font-semibold tracking-[-0.015em] transition-all duration-150 active:scale-[0.985]',
        active
          ? light
            ? 'text-black'
            : 'text-white'
          : light
            ? 'text-black/45 hover:text-black/72'
            : 'text-white/42 hover:text-white/72',
      )}
    >
      {active ? (
        <span
          style={accentPillStyle(accentColor, light, 'soft')}
          className="absolute inset-0 rounded-[10px] border"
        />
      ) : null}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  light,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-[14px] border px-4 py-3.5',
        light ? 'border-black/[0.07] bg-white' : 'border-white/[0.07] bg-white/[0.04]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn('truncate text-[10.5px] font-semibold', mutedText(light))}>
            {label}
          </div>
          <div
            className={cn(
              'mt-2 truncate text-[24px] font-semibold leading-none tracking-[-0.065em]',
              pageText(light),
            )}
          >
            {value}
          </div>
          {hint ? (
            <div className={cn('mt-1.5 truncate text-[10.5px]', faintText(light))}>
              {hint}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-[11px] border',
            light
              ? 'border-black/[0.07] bg-black/[0.025] text-black/38'
              : 'border-white/[0.07] bg-white/[0.035] text-white/38',
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function BookingBlock({
  booking,
  light,
  workWindow,
  hourHeight,
  onSelect,
  compact,
}: {
  booking: LaidOutBooking;
  light: boolean;
  workWindow: WorkWindow;
  hourHeight: number;
  onSelect: (booking: CalendarBooking) => void;
  compact?: boolean;
}) {
  const top = ((booking.startMinutes - workWindow.startMinutes) / 60) * hourHeight + 4;
  const height = Math.max(46, ((booking.endMinutes - booking.startMinutes) / 60) * hourHeight - 8);
  const gap = 4;
  const width = `calc(${100 / booking.lanes}% - ${gap}px)`;
  const left = `calc(${(booking.lane * 100) / booking.lanes}% + ${booking.lane ? gap / 2 : 0}px)`;
  const inactive = booking.status === 'cancelled' || booking.status === 'no_show';
  const done = booking.status === 'completed';

  return (
    <button
      type="button"
      onClick={() => onSelect(booking)}
      style={{
        ...bookingCardStyle(booking.color, light),
        top,
        height,
        left,
        width,
      }}
      className={cn(
        'absolute z-10 overflow-hidden rounded-[13px] border px-2.5 py-2 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]',
        inactive && 'opacity-55 saturate-50',
        done && 'opacity-72',
      )}
    >
      <span
        style={{ background: booking.color }}
        className="absolute left-0 top-0 h-full w-[3px]"
      />
      <span
        style={{ background: booking.color }}
        className="absolute right-2 top-2 size-1.5 rounded-full opacity-80"
      />

      <div className="min-w-0 pl-1.5">
        <div className="truncate text-[12px] font-bold leading-tight tracking-[-0.02em]">
          {booking.clientName}
        </div>
        <div className="mt-1 truncate text-[10.5px] font-semibold opacity-78">
          {booking.service}
        </div>
        {!compact || height > 58 ? (
          <div className="mt-1.5 truncate text-[10px] font-semibold opacity-62">
            {booking.start}–{booking.end}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function EmptyCalendarState({
  light,
  title,
  text,
}: {
  light: boolean;
  title: string;
  text: string;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute left-1/2 top-16 z-20 w-[min(420px,calc(100%-32px))] -translate-x-1/2 rounded-[16px] border px-4 py-4 text-center shadow-sm',
        light
          ? 'border-black/[0.08] bg-white/88 text-black backdrop-blur-xl'
          : 'border-white/[0.08] bg-[#111]/88 text-white backdrop-blur-xl',
      )}
    >
      <div className="text-[13px] font-semibold tracking-[-0.018em]">{title}</div>
      <div className={cn('mt-1 text-[11px] leading-5', mutedText(light))}>{text}</div>
    </div>
  );
}

function DayCalendar({
  date,
  bookings,
  workWindow,
  now,
  light,
  locale,
  onSelect,
}: {
  date: Date;
  bookings: CalendarBooking[];
  workWindow: WorkWindow;
  now: Date;
  light: boolean;
  locale: 'ru' | 'en';
  onSelect: (booking: CalendarBooking) => void;
}) {
  const dayBookings = layoutBookings(bookings.filter((booking) => booking.date === toLocalIsoDate(date)));
  const height = ((workWindow.endMinutes - workWindow.startMinutes) / 60) * DAY_HOUR_HEIGHT;
  const showNow = isSameDay(date, now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - workWindow.startMinutes) / 60) * DAY_HOUR_HEIGHT;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div
          className={cn(
            'grid grid-cols-[82px_minmax(0,1fr)] overflow-hidden rounded-[16px] border',
            light ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-white/[0.025]',
          )}
        >
          <div className={cn('border-r', borderTone(light))} style={{ height }}>
            <div className="relative h-full">
              {workWindow.hours.map((hour) => (
                <div
                  key={hour}
                  style={{ top: ((hour - workWindow.startMinutes) / 60) * DAY_HOUR_HEIGHT - 7 }}
                  className={cn('absolute right-3 text-[11px] font-semibold tabular-nums', mutedText(light))}
                >
                  {formatMinutesAsTime(hour)}
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative"
            style={{
              height,
              backgroundImage: light
                ? 'linear-gradient(to bottom, rgba(0,0,0,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.035) 1px, transparent 1px)'
                : 'linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px)',
              backgroundSize: `100% ${DAY_HOUR_HEIGHT}px, 100% ${DAY_HOUR_HEIGHT / 2}px`,
            }}
          >
            {showNow && nowMinutes >= workWindow.startMinutes && nowMinutes <= workWindow.endMinutes ? (
              <div
                style={{ top: nowTop }}
                className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
              >
                <span className="size-2 rounded-full bg-red-500" />
                <span className="h-px flex-1 bg-red-500/80" />
                <span className="mr-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {locale === 'ru' ? 'Сейчас' : 'Now'}
                </span>
              </div>
            ) : null}

            {dayBookings.map((booking) => (
              <BookingBlock
                key={booking.id}
                booking={booking}
                light={light}
                workWindow={workWindow}
                hourHeight={DAY_HOUR_HEIGHT}
                onSelect={onSelect}
              />
            ))}

            {!dayBookings.length ? (
              <EmptyCalendarState
                light={light}
                title={locale === 'ru' ? 'Записей на этот день нет' : 'No bookings for this day'}
                text={locale === 'ru' ? 'Свободный день. Новые заявки появятся здесь автоматически.' : 'Free day. New requests will appear here automatically.'}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekCalendar({
  dates,
  bookingsByDate,
  workWindow,
  now,
  todayIso,
  selectedDate,
  light,
  locale,
  onSelect,
  onDateSelect,
}: {
  dates: Date[];
  bookingsByDate: Map<string, CalendarBooking[]>;
  workWindow: WorkWindow;
  now: Date;
  todayIso: string;
  selectedDate: Date;
  light: boolean;
  locale: 'ru' | 'en';
  onSelect: (booking: CalendarBooking) => void;
  onDateSelect: (date: Date) => void;
}) {
  const height = ((workWindow.endMinutes - workWindow.startMinutes) / 60) * WEEK_HOUR_HEIGHT;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - workWindow.startMinutes) / 60) * WEEK_HOUR_HEIGHT;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1080px]">
        <div
          className={cn(
            'overflow-hidden rounded-[16px] border',
            light ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-white/[0.025]',
          )}
        >
          <div
            className={cn(
              'sticky top-0 z-40 grid grid-cols-[74px_repeat(7,minmax(132px,1fr))] border-b backdrop-blur-xl',
              borderTone(light),
              light ? 'bg-white/92' : 'bg-[#101010]/92',
            )}
          >
            <div className={cn('border-r px-3 py-3 text-[11px] font-semibold', borderTone(light), mutedText(light))}>
              {locale === 'ru' ? 'Время' : 'Time'}
            </div>
            {dates.map((date) => {
              const iso = toLocalIsoDate(date);
              const isToday = iso === todayIso;
              const isSelected = isSameDay(date, selectedDate);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onDateSelect(date)}
                  className={cn(
                    'border-r px-2 py-2 text-left transition-colors last:border-r-0',
                    borderTone(light),
                    isSelected
                      ? light
                        ? 'bg-black/[0.045]'
                        : 'bg-white/[0.06]'
                      : light
                        ? 'hover:bg-black/[0.025]'
                        : 'hover:bg-white/[0.04]',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-[11px] font-semibold', pageText(light))}>
                      {formatWeekday(date, locale)}
                    </span>
                    <span
                      className={cn(
                        'grid size-7 place-items-center rounded-[9px] text-[11px] font-bold',
                        isToday
                          ? 'bg-red-500 text-white'
                          : light
                            ? 'bg-black/[0.035] text-black/60'
                            : 'bg-white/[0.05] text-white/60',
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[74px_repeat(7,minmax(132px,1fr))]">
            <div className={cn('relative border-r', borderTone(light))} style={{ height }}>
              {workWindow.hours.map((hour) => (
                <div
                  key={hour}
                  style={{ top: ((hour - workWindow.startMinutes) / 60) * WEEK_HOUR_HEIGHT - 7 }}
                  className={cn('absolute right-3 text-[11px] font-semibold tabular-nums', mutedText(light))}
                >
                  {formatMinutesAsTime(hour)}
                </div>
              ))}
            </div>

            {dates.map((date) => {
              const iso = toLocalIsoDate(date);
              const dayBookings = layoutBookings(bookingsByDate.get(iso) ?? []);
              const showNow = iso === todayIso && nowMinutes >= workWindow.startMinutes && nowMinutes <= workWindow.endMinutes;

              return (
                <div
                  key={iso}
                  className={cn('relative border-r last:border-r-0', borderTone(light))}
                  style={{
                    height,
                    backgroundImage: light
                      ? 'linear-gradient(to bottom, rgba(0,0,0,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.035) 1px, transparent 1px)'
                      : 'linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px)',
                    backgroundSize: `100% ${WEEK_HOUR_HEIGHT}px, 100% ${WEEK_HOUR_HEIGHT / 2}px`,
                  }}
                >
                  {showNow ? (
                    <div
                      style={{ top: nowTop }}
                      className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
                    >
                      <span className="h-px flex-1 bg-red-500/80" />
                    </div>
                  ) : null}

                  {dayBookings.map((booking) => (
                    <BookingBlock
                      key={booking.id}
                      booking={booking}
                      light={light}
                      workWindow={workWindow}
                      hourHeight={WEEK_HOUR_HEIGHT}
                      onSelect={onSelect}
                      compact
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthCalendar({
  dates,
  selectedDate,
  bookingsByDate,
  light,
  locale,
  onDateSelect,
  onSelect,
}: {
  dates: Date[];
  selectedDate: Date;
  bookingsByDate: Map<string, CalendarBooking[]>;
  light: boolean;
  locale: 'ru' | 'en';
  onDateSelect: (date: Date) => void;
  onSelect: (booking: CalendarBooking) => void;
}) {
  const currentMonth = selectedDate.getMonth();
  const weekdays = Array.from({ length: 7 }, (_, index) => addDays(startOfWeekMonday(new Date(2024, 0, 1)), index));

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[16px] border',
        light ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-white/[0.025]',
      )}
    >
      <div className="grid grid-cols-7 border-b">
        {weekdays.map((date) => (
          <div
            key={date.getDay()}
            className={cn('border-r px-3 py-2 text-[11px] font-semibold last:border-r-0', borderTone(light), mutedText(light))}
          >
            {formatWeekday(date, locale)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dates.map((date) => {
          const iso = toLocalIsoDate(date);
          const dayBookings = bookingsByDate.get(iso) ?? [];
          const outside = date.getMonth() !== currentMonth;
          const selected = isSameDay(date, selectedDate);
          const visible = dayBookings.slice(0, 3);
          const hidden = Math.max(0, dayBookings.length - visible.length);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDateSelect(date)}
              className={cn(
                'min-h-[138px] border-r border-b p-2.5 text-left transition-colors last:border-r-0',
                borderTone(light),
                selected
                  ? light
                    ? 'bg-black/[0.04]'
                    : 'bg-white/[0.055]'
                  : light
                    ? 'hover:bg-black/[0.018]'
                    : 'hover:bg-white/[0.035]',
                outside && 'opacity-45',
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'grid size-7 place-items-center rounded-[9px] text-[11px] font-bold',
                    selected
                      ? light
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                      : light
                        ? 'bg-black/[0.035] text-black/58'
                        : 'bg-white/[0.045] text-white/58',
                  )}
                >
                  {date.getDate()}
                </span>
                {dayBookings.length ? (
                  <span className={cn('text-[10px] font-semibold', mutedText(light))}>
                    {dayBookings.length}
                  </span>
                ) : null}
              </div>

              <div className="space-y-1.5">
                {visible.map((booking) => (
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
                    style={accentPillStyle(booking.color, light, 'soft')}
                    className="block rounded-[9px] border px-2 py-1.5 text-[10.5px] font-semibold"
                  >
                    <span className="block truncate">{booking.start} · {booking.clientName}</span>
                    <span className="mt-0.5 block truncate text-[9.5px] opacity-72">{booking.service}</span>
                  </span>
                ))}

                {hidden ? (
                  <span className={cn('block px-1 pt-1 text-[10.5px] font-semibold', mutedText(light))}>
                    +{hidden}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingDialog({
  booking,
  light,
  locale,
  actionLoading,
  onClose,
  onStatusChange,
}: {
  booking: CalendarBooking | null;
  light: boolean;
  locale: 'ru' | 'en';
  actionLoading: BookingStatus | null;
  onClose: () => void;
  onStatusChange: (status: BookingStatus) => void;
}) {
  if (!booking) return null;

  const canClose = booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'no_show';

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[6px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'fixed bottom-0 left-0 right-0 rounded-t-[24px] border p-4 shadow-2xl sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[420px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[22px] sm:p-5',
          light
            ? 'border-black/[0.08] bg-[#fbfbfa] text-black'
            : 'border-white/[0.1] bg-[#101010] text-white',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <MicroLabel light={light} active color={booking.color}>
              <StatusDot color={booking.color} />
              {booking.service}
            </MicroLabel>
            <h2 className="mt-4 truncate text-[28px] font-semibold tracking-[-0.07em]">
              {booking.clientName}
            </h2>
            <p className={cn('mt-1 text-[12px]', mutedText(light))}>
              {statusLabel(booking.status, locale)} · {booking.source}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              'inline-flex size-9 shrink-0 items-center justify-center rounded-[11px] border transition-colors',
              light
                ? 'border-black/[0.08] bg-white text-black/50 hover:text-black'
                : 'border-white/[0.08] bg-white/[0.04] text-white/52 hover:text-white',
            )}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-2">
          <InfoRow
            light={light}
            label={locale === 'ru' ? 'Дата и время' : 'Date and time'}
            value={`${booking.date} · ${booking.start}–${booking.end}`}
          />
          <InfoRow
            light={light}
            label={locale === 'ru' ? 'Длительность' : 'Duration'}
            value={locale === 'ru' ? `${booking.durationMinutes} мин` : `${booking.durationMinutes} min`}
          />
          <InfoRow
            light={light}
            label={locale === 'ru' ? 'Телефон' : 'Phone'}
            value={booking.phone || '—'}
          />
          <InfoRow
            light={light}
            label={locale === 'ru' ? 'Сумма' : 'Amount'}
            value={booking.amount > 0 ? formatMoney(booking.amount, locale) : '—'}
          />
        </div>

        <div
          className={cn(
            'mt-3 rounded-[14px] border px-3.5 py-3',
            light ? 'border-black/[0.07] bg-white' : 'border-white/[0.08] bg-white/[0.04]',
          )}
        >
          <div className={cn('text-[10.5px] font-semibold', mutedText(light))}>
            {locale === 'ru' ? 'Комментарий' : 'Note'}
          </div>
          <div className="mt-1.5 text-[13px] leading-5">
            {booking.note || '—'}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
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
          {canClose ? (
            <Button
              type="button"
              className={cn('justify-start', buttonBase(light, true))}
              onClick={() => onStatusChange('completed')}
              disabled={actionLoading !== null}
            >
              <CheckCircle2 className="size-3.5" />
              {actionLoading === 'completed' ? '…' : locale === 'ru' ? 'Завершить' : 'Complete'}
            </Button>
          ) : null}
          {canClose ? (
            <Button
              type="button"
              className={cn('col-span-2 justify-start', buttonBase(light))}
              onClick={() => onStatusChange('no_show')}
              disabled={actionLoading !== null}
            >
              <X className="size-3.5" />
              {actionLoading === 'no_show' ? '…' : locale === 'ru' ? 'Клиент не пришёл' : 'Mark no-show'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
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
        'flex min-h-10 items-center justify-between gap-3 rounded-[12px] border px-3',
        light ? 'border-black/[0.07] bg-white' : 'border-white/[0.08] bg-white/[0.04]',
      )}
    >
      <span className={cn('text-[11px] font-semibold', mutedText(light))}>{label}</span>
      <span className="truncate text-right text-[11.5px] font-semibold">{value}</span>
    </div>
  );
}

export default function DashboardTodayPage() {
  const { updateBookingStatus } = useApp();
  const { hasHydrated, ownedProfile, bookings, dataset, locale, demoMode } = useOwnedWorkspaceData();
  const { resolvedTheme } = useTheme();
  const { settings } = useAppearance();

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [actionLoading, setActionLoading] = useState<BookingStatus | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedBooking) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedBooking(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedBooking]);

  const currentTheme: ThemeMode = mounted
    ? resolvedTheme === 'light'
      ? 'light'
      : 'dark'
    : 'dark';

  const isLight = currentTheme === 'light';
  const accentColor = accentPalette[settings.accentTone].solid;
  const todayIso = useMemo(() => toLocalIsoDate(now), [now]);

  const labels = locale === 'ru'
    ? {
        title: 'Расписание',
        description: 'День, неделя и месяц в одном календаре. Цвет записи зависит от услуги.',
        emptyTitle: 'Сначала настройте профиль мастера',
        emptyDescription: 'Создайте профиль, чтобы открыть календарь, записи, чаты и быстрые действия.',
        emptyAction: 'Создать профиль',
        profileMissing: 'Профиль не настроен',
        calendar: 'Календарь записей',
        today: 'Сегодня',
        previous: 'Назад',
        next: 'Вперёд',
        day: 'День',
        week: 'Неделя',
        month: 'Месяц',
        bookings: 'Записей',
        confirmed: 'Активных',
        completed: 'Завершено',
        revenue: 'Выручка',
        nearest: 'Ближайшая',
        quiet: 'Пока пусто',
        live: demoMode ? 'Демо-режим' : 'Рабочий календарь',
        setupTimeline: 'Календарь',
        setupTimelineText: 'После создания профиля здесь появится рабочее расписание.',
        setupChats: 'Чаты',
        setupChatsText: 'Быстрый переход к перепискам и напоминаниям.',
        setupPublic: 'Онлайн-запись',
        setupPublicText: 'Публичная ссылка для клиентов создаст новые записи.',
      }
    : {
        title: 'Schedule',
        description: 'Day, week, and month in one calendar. Booking color follows the service.',
        emptyTitle: 'Create the master profile first',
        emptyDescription: 'Create a profile to unlock calendar, bookings, chats, and quick actions.',
        emptyAction: 'Create profile',
        profileMissing: 'Profile missing',
        calendar: 'Booking calendar',
        today: 'Today',
        previous: 'Previous',
        next: 'Next',
        day: 'Day',
        week: 'Week',
        month: 'Month',
        bookings: 'Bookings',
        confirmed: 'Active',
        completed: 'Completed',
        revenue: 'Revenue',
        nearest: 'Next up',
        quiet: 'Quiet for now',
        live: demoMode ? 'Demo mode' : 'Live calendar',
        setupTimeline: 'Calendar',
        setupTimelineText: 'After profile setup, the work schedule will appear here.',
        setupChats: 'Chats',
        setupChatsText: 'Quick access to conversations and reminders.',
        setupPublic: 'Online booking',
        setupPublicText: 'A public client link creates new bookings.',
      };

  const serviceMap = useMemo(() => {
    const map = new Map<string, ServiceLike>();
    for (const service of dataset?.services ?? []) {
      const item = service as ServiceLike;
      map.set(item.name, item);
    }
    return map;
  }, [dataset]);

  const calendarBookings = useMemo(
    () => bookings
      .map((booking) => mapBookingToCalendarBooking(booking, serviceMap, accentColor, locale))
      .sort((left, right) => `${left.date}T${left.start}`.localeCompare(`${right.date}T${right.start}`)),
    [accentColor, bookings, locale, serviceMap],
  );

  const rangeDates = useMemo(() => getRangeDates(viewMode, selectedDate), [selectedDate, viewMode]);
  const { startIso, endIso } = useMemo(
    () => getRangeIsoBounds(viewMode, selectedDate),
    [selectedDate, viewMode],
  );

  const rangeBookings = useMemo(
    () => calendarBookings.filter((booking) => booking.date >= startIso && booking.date <= endIso),
    [calendarBookings, endIso, startIso],
  );

  const bookingsByDate = useMemo(() => groupByDate(calendarBookings), [calendarBookings]);
  const workWindow = useMemo(() => deriveWorkWindow(rangeBookings), [rangeBookings]);

  const nearestBooking = useMemo(
    () => calendarBookings.find((booking) => activeBooking(booking) && `${booking.date}T${booking.start}` >= `${todayIso}T00:00`) ?? null,
    [calendarBookings, todayIso],
  );

  const stats = useMemo(() => {
    const active = rangeBookings.filter(activeBooking);
    const completed = rangeBookings.filter((booking) => booking.status === 'completed');
    const revenue = rangeBookings.reduce((sum, booking) => sum + booking.amount, 0);

    return {
      total: rangeBookings.length,
      active: active.length,
      completed: completed.length,
      revenue,
    };
  }, [rangeBookings]);

  function shiftPeriod(direction: -1 | 1) {
    setSelectedDate((date) => {
      if (viewMode === 'day') return addDays(date, direction);
      if (viewMode === 'week') return addDays(date, direction * 7);
      return addMonths(date, direction);
    });
  }

  function goToday() {
    setSelectedDate(startOfDay(new Date()));
  }

  async function handleStatusChange(status: BookingStatus) {
    if (!selectedBooking) return;

    setActionLoading(status);
    try {
      await updateBookingStatus(selectedBooking.id, status);
      setSelectedBooking((current) => current ? { ...current, status } : current);
    } finally {
      setActionLoading(null);
    }
  }

  if (!hasHydrated || !mounted) return null;

  if (!ownedProfile) {
    return (
      <WorkspaceShell>
        <main className={cn('min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6', pageBg(isLight))}>
          <div className="mx-auto w-full max-w-[var(--page-max-width)]">
            <div className="mb-6 md:mb-7">
              <h1 className={cn('text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]', pageText(isLight))}>
                {labels.title}
              </h1>
              <p className={cn('mt-2 max-w-[760px] text-[13px] leading-5', mutedText(isLight))}>
                {labels.description}
              </p>
            </div>

            <Card light={isLight} className="overflow-hidden">
              <div className="grid min-h-[320px] place-items-center px-5 py-12 text-center">
                <div className="mx-auto max-w-[520px]">
                  <MicroLabel light={isLight}>
                    <StatusDot color={accentColor} />
                    {labels.profileMissing}
                  </MicroLabel>
                  <h2 className={cn('mt-5 text-[28px] font-semibold tracking-[-0.065em] md:text-[36px]', pageText(isLight))}>
                    {labels.emptyTitle}
                  </h2>
                  <p className={cn('mt-3 text-[13px] leading-5', mutedText(isLight))}>
                    {labels.emptyDescription}
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Button asChild className={buttonBase(isLight, true)}>
                      <Link href="/create-profile">
                        <SquarePen className="size-3.5" />
                        {labels.emptyAction}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                [labels.setupTimeline, labels.setupTimelineText, <CalendarDays key="calendar" className="size-3.5" />],
                [labels.setupChats, labels.setupChatsText, <MessageCircleMore key="chat" className="size-3.5" />],
                [labels.setupPublic, labels.setupPublicText, <Sparkles key="public" className="size-3.5" />],
              ].map(([title, text, icon]) => (
                <Card key={String(title)} light={isLight}>
                  <div className="p-4">
                    <MicroLabel light={isLight}>{icon}{title}</MicroLabel>
                    <p className={cn('mt-4 text-[12px] leading-5', mutedText(isLight))}>{text}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <main className={cn('min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6', pageBg(isLight))}>
        <div className="mx-auto w-full max-w-[var(--page-max-width)]">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <MicroLabel light={isLight} active color={accentColor}>
                  <StatusDot color={accentColor} />
                  {labels.live}
                </MicroLabel>
                <MicroLabel light={isLight}>{formatCalendarRange(viewMode, selectedDate, locale)}</MicroLabel>
              </div>
              <h1 className={cn('mt-4 text-[32px] font-semibold tracking-[-0.078em] md:text-[44px]', pageText(isLight))}>
                {labels.title}
              </h1>
              <p className={cn('mt-2 max-w-[760px] text-[13px] leading-5', mutedText(isLight))}>
                {labels.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className={cn('inline-flex items-center gap-1 rounded-[12px] border p-1', isLight ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-white/[0.045]')}>
                <IconButton light={isLight} label={labels.previous} onClick={() => shiftPeriod(-1)}>
                  <ChevronLeft className="size-4" />
                </IconButton>
                <Button type="button" onClick={goToday} className={buttonBase(isLight)}>
                  {labels.today}
                </Button>
                <IconButton light={isLight} label={labels.next} onClick={() => shiftPeriod(1)}>
                  <ChevronRight className="size-4" />
                </IconButton>
              </div>

              <div className={cn('inline-flex max-w-full items-center gap-1 rounded-[12px] border p-1', isLight ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-white/[0.045]')}>
                <SegmentButton label={labels.day} active={viewMode === 'day'} onClick={() => setViewMode('day')} light={isLight} accentColor={accentColor} />
                <SegmentButton label={labels.week} active={viewMode === 'week'} onClick={() => setViewMode('week')} light={isLight} accentColor={accentColor} />
                <SegmentButton label={labels.month} active={viewMode === 'month'} onClick={() => setViewMode('month')} light={isLight} accentColor={accentColor} />
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label={labels.bookings} value={stats.total} hint={formatCalendarRange(viewMode, selectedDate, locale)} icon={<CalendarClock className="size-4" />} light={isLight} />
            <StatCard label={labels.confirmed} value={stats.active} hint={locale === 'ru' ? 'без отмен и неявок' : 'excluding missed'} icon={<UserRound className="size-4" />} light={isLight} />
            <StatCard label={labels.completed} value={stats.completed} hint={locale === 'ru' ? 'закрытые визиты' : 'closed visits'} icon={<CheckCircle2 className="size-4" />} light={isLight} />
            <StatCard label={labels.revenue} value={formatMoney(stats.revenue, locale)} hint={locale === 'ru' ? 'по выбранному периоду' : 'selected period'} icon={<Wallet className="size-4" />} light={isLight} />
            <StatCard label={labels.nearest} value={nearestBooking?.start ?? '—'} hint={nearestBooking ? `${nearestBooking.clientName} · ${nearestBooking.service}` : labels.quiet} icon={<Clock3 className="size-4" />} light={isLight} />
          </div>

          <Card light={isLight} className="mt-4 overflow-hidden">
            <div className={cn('flex min-h-[58px] flex-col gap-3 border-b px-4 py-3 md:flex-row md:items-center md:justify-between', borderTone(isLight))}>
              <div className="min-w-0">
                <h2 className={cn('truncate text-[14px] font-semibold tracking-[-0.018em]', pageText(isLight))}>
                  {labels.calendar}
                </h2>
                <p className={cn('mt-1 text-[11px]', mutedText(isLight))}>
                  {locale === 'ru'
                    ? 'Клик по записи открывает мини-карточку с действиями.'
                    : 'Click a booking to open a quick action card.'}
                </p>
              </div>
              <MicroLabel light={isLight}>
                {formatMinutesAsTime(workWindow.startMinutes)}–{formatMinutesAsTime(workWindow.endMinutes)}
              </MicroLabel>
            </div>

            <div className="p-3 md:p-4">
              {viewMode === 'day' ? (
                <DayCalendar
                  date={selectedDate}
                  bookings={calendarBookings}
                  workWindow={workWindow}
                  now={now}
                  light={isLight}
                  locale={locale}
                  onSelect={setSelectedBooking}
                />
              ) : null}

              {viewMode === 'week' ? (
                <WeekCalendar
                  dates={rangeDates.slice(0, 7)}
                  bookingsByDate={bookingsByDate}
                  workWindow={workWindow}
                  now={now}
                  todayIso={todayIso}
                  selectedDate={selectedDate}
                  light={isLight}
                  locale={locale}
                  onSelect={setSelectedBooking}
                  onDateSelect={(date) => setSelectedDate(startOfDay(date))}
                />
              ) : null}

              {viewMode === 'month' ? (
                <MonthCalendar
                  dates={rangeDates}
                  selectedDate={selectedDate}
                  bookingsByDate={bookingsByDate}
                  light={isLight}
                  locale={locale}
                  onDateSelect={(date) => {
                    setSelectedDate(startOfDay(date));
                    setViewMode('day');
                  }}
                  onSelect={setSelectedBooking}
                />
              ) : null}
            </div>
          </Card>
        </div>
      </main>

      <BookingDialog
        booking={selectedBooking}
        light={isLight}
        locale={locale}
        actionLoading={actionLoading}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={(status) => void handleStatusChange(status)}
      />
    </WorkspaceShell>
  );
}
