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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  MessageCircleMore,
  PhoneCall,
  Plus,
  Scissors,
  Sparkles,
  SquarePen,
  X,
} from 'lucide-react';

import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { Button } from '@/components/ui/button';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useApp } from '@/lib/app-context';
import { useAppearance } from '@/lib/appearance-context';
import { accentPalette } from '@/lib/appearance-palette';
import {
  findAvailabilityDay,
  minutesToTime,
  normalizeAvailabilityDays,
  timeToMinutes,
  type BookingAvailabilityDay,
} from '@/lib/availability';
import type { Booking, BookingStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';
type CalendarView = 'day' | 'week' | 'month';
type SlotTone = 'free' | 'busy' | 'break' | 'outside';

interface SlotSegment {
  start: number;
  end: number;
  label: string;
  raw: string;
}

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

interface BookingLayout extends CalendarBooking {
  lane: number;
  laneCount: number;
}

interface DayPlan {
  iso: string;
  date: Date;
  day: BookingAvailabilityDay | null;
  slots: SlotSegment[];
  breaks: SlotSegment[];
  isDayOff: boolean;
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

const ROW_HEIGHT = 38;
const MIN_SLOT_STEP = 30;
const FALLBACK_ROWS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => hour * 60);

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
    'inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] border transition-[background,border-color,color,transform] duration-150 active:scale-[0.965]',
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

function bookingStyle(color: string, light: boolean, active = false): CSSProperties {
  return {
    background: light
      ? `linear-gradient(135deg, color-mix(in srgb, ${color} 13%, #ffffff), color-mix(in srgb, ${color} 5%, #ffffff))`
      : `linear-gradient(135deg, color-mix(in srgb, ${color} 22%, #151515), color-mix(in srgb, ${color} 8%, #101010))`,
    borderColor: light
      ? `color-mix(in srgb, ${color} 38%, rgba(0,0,0,0.08))`
      : `color-mix(in srgb, ${color} 42%, rgba(255,255,255,0.08))`,
    boxShadow: active
      ? light
        ? `0 10px 26px color-mix(in srgb, ${color} 16%, transparent), inset 0 0 0 1px color-mix(in srgb, ${color} 16%, transparent)`
        : `0 12px 30px color-mix(in srgb, ${color} 20%, transparent), inset 0 0 0 1px color-mix(in srgb, ${color} 18%, transparent)`
      : undefined,
  };
}

function slotToneClass(tone: SlotTone, light: boolean) {
  if (tone === 'busy') {
    return light ? 'bg-black/[0.018]' : 'bg-white/[0.022]';
  }

  if (tone === 'break') {
    return light
      ? 'bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.035)_0,rgba(0,0,0,0.035)_6px,transparent_6px,transparent_12px)]'
      : 'bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.045)_0,rgba(255,255,255,0.045)_6px,transparent_6px,transparent_12px)]';
  }

  if (tone === 'outside') {
    return light ? 'bg-black/[0.018] opacity-60' : 'bg-white/[0.012] opacity-60';
  }

  return light ? 'bg-white/60' : 'bg-white/[0.018]';
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

function parseInterval(value: string): SlotSegment | null {
  const [startRaw, endRaw] = value
    .replace(/—/g, '–')
    .replace(/-/g, '–')
    .split('–')
    .map((part) => part.trim());

  const start = timeToMinutes(startRaw ?? '');
  const end = timeToMinutes(endRaw ?? '');

  if (start === null || end === null || end <= start) return null;

  return {
    start,
    end,
    label: `${minutesToTime(start)}–${minutesToTime(end)}`,
    raw: value,
  };
}

function splitLongSlot(slot: SlotSegment) {
  const duration = slot.end - slot.start;

  if (duration <= 90) return [slot];

  const pieces: SlotSegment[] = [];
  for (let current = slot.start; current < slot.end; current += 60) {
    const end = Math.min(slot.end, current + 60);
    pieces.push({
      start: current,
      end,
      label: `${minutesToTime(current)}–${minutesToTime(end)}`,
      raw: slot.raw,
    });
  }

  return pieces;
}

function normalizeSlots(values?: string[]) {
  const unique = new Map<string, SlotSegment>();

  for (const value of values ?? []) {
    const interval = parseInterval(value);
    if (!interval) continue;

    for (const slot of splitLongSlot(interval)) {
      unique.set(`${slot.start}-${slot.end}`, slot);
    }
  }

  return [...unique.values()].sort((left, right) => left.start - right.start || left.end - right.end);
}

function normalizeBreaks(values?: string[]) {
  return (values ?? [])
    .map(parseInterval)
    .filter((item): item is SlotSegment => Boolean(item))
    .sort((left, right) => left.start - right.start || left.end - right.end);
}

function overlaps(left: { start: number; end: number }, right: { start: number; end: number }) {
  return left.start < right.end && right.start < left.end;
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

function getShortWeekday(date: Date, locale: 'ru' | 'en') {
  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'short',
    })
      .format(date)
      .replace('.', '')
      .replace(/^[a-zа-яё]/i, (char) => char.toUpperCase());
  } catch {
    return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][(date.getDay() + 6) % 7] ?? '';
  }
}

function getRangeTitle(view: CalendarView, selectedDate: Date, locale: 'ru' | 'en') {
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

function bookingAmount(booking: Booking) {
  return typeof booking.priceAmount === 'number' && Number.isFinite(booking.priceAmount)
    ? booking.priceAmount
    : 0;
}

function isActiveBooking(booking: Booking | CalendarBooking) {
  const status = 'source' in booking ? booking.status : booking.status;
  return status !== 'cancelled' && status !== 'no_show';
}

function isCompletedBooking(booking: CalendarBooking) {
  return booking.status === 'completed';
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return undefined;
}

function numberValue(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }

  return undefined;
}

function normalizeColor(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const color = value.trim();

  if (
    /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color) ||
    /^rgba?\(/i.test(color) ||
    /^hsla?\(/i.test(color)
  ) {
    return color;
  }

  return undefined;
}

function serviceMapFromSources(datasetServices: unknown, workspaceServices: unknown) {
  const source = Array.isArray(workspaceServices)
    ? workspaceServices
    : Array.isArray(datasetServices)
      ? datasetServices
      : [];
  const map = new Map<string, Record<string, unknown>>();

  for (const item of source) {
    const record = objectRecord(item);
    const name = stringValue(record, ['name', 'title', 'label']);
    if (name) map.set(name.trim().toLowerCase(), record ?? {});
  }

  return map;
}

function getServiceRecord(serviceMap: Map<string, Record<string, unknown>>, name: string) {
  return serviceMap.get(name.trim().toLowerCase()) ?? null;
}

function getBookingDuration(booking: Booking, serviceMap: Map<string, Record<string, unknown>>) {
  if (
    typeof booking.durationMinutes === 'number' &&
    Number.isFinite(booking.durationMinutes) &&
    booking.durationMinutes > 0
  ) {
    return Math.max(15, Math.round(booking.durationMinutes));
  }

  const service = getServiceRecord(serviceMap, booking.service);
  const duration = numberValue(service, ['duration', 'durationMinutes', 'minutes']);

  if (typeof duration === 'number' && duration > 0) return Math.max(15, Math.round(duration));

  return 60;
}

function getBookingColor(
  booking: Booking,
  serviceMap: Map<string, Record<string, unknown>>,
  accentColor: string,
  publicAccentColor: string,
) {
  const metadata = objectRecord(booking.metadata);
  const metadataColor = normalizeColor(
    stringValue(metadata, ['color', 'serviceColor', 'calendarColor', 'accentColor']),
  );
  if (metadataColor) return metadataColor;

  const service = getServiceRecord(serviceMap, booking.service);
  const serviceColor = normalizeColor(
    stringValue(service, ['color', 'serviceColor', 'calendarColor', 'accentColor']),
  );
  if (serviceColor) return serviceColor;

  if (booking.status === 'new') return publicAccentColor;
  if (booking.status === 'confirmed') return accentColor;

  return AUTO_SERVICE_COLORS[hashString(booking.service || booking.id) % AUTO_SERVICE_COLORS.length] ?? accentColor;
}

function mapBooking(
  booking: Booking,
  serviceMap: Map<string, Record<string, unknown>>,
  accentColor: string,
  publicAccentColor: string,
): CalendarBooking {
  const startMinutes = timeToMinutes(booking.time) ?? 0;
  const durationMinutes = getBookingDuration(booking, serviceMap);
  const endMinutes = Math.min(24 * 60 - 1, startMinutes + durationMinutes);

  return {
    id: booking.id,
    source: booking,
    clientName: booking.clientName,
    service: booking.service,
    phone: booking.clientPhone,
    date: booking.date,
    start: minutesToTime(startMinutes),
    end: minutesToTime(endMinutes),
    startMinutes,
    endMinutes,
    durationMinutes,
    status: booking.status,
    note: booking.comment || undefined,
    sourceLabel: booking.source ?? booking.channel,
    amount: bookingAmount(booking),
    color: getBookingColor(booking, serviceMap, accentColor, publicAccentColor),
  };
}

function getVisibleDates(view: CalendarView, selectedDate: Date) {
  if (view === 'day') return [selectedDate];

  if (view === 'week') {
    const start = startOfWeekMonday(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }

  const first = startOfMonth(selectedDate);
  const gridStart = startOfWeekMonday(first);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function getDayPlan(date: Date, availability: BookingAvailabilityDay[]): DayPlan {
  const iso = toLocalIsoDate(date);
  const day = findAvailabilityDay(availability, iso);
  const isDayOff = !day || day.status === 'day-off';

  return {
    iso,
    date,
    day,
    isDayOff,
    slots: isDayOff ? [] : normalizeSlots(day?.slots),
    breaks: isDayOff ? [] : normalizeBreaks(day?.breaks),
  };
}

function buildRows(plans: DayPlan[], bookings: CalendarBooking[], includeFallback = true) {
  const rows = new Set<number>();

  for (const plan of plans) {
    for (const slot of plan.slots) rows.add(slot.start);
  }

  for (const booking of bookings) rows.add(booking.startMinutes);

  if (!rows.size && includeFallback) {
    for (const row of FALLBACK_ROWS) rows.add(row);
  }

  return [...rows].sort((left, right) => left - right);
}

function getNextRow(rows: number[], index: number) {
  return rows[index + 1] ?? rows[index] + 60;
}

function rowSpanForBooking(rows: number[], booking: CalendarBooking) {
  const startIndex = Math.max(0, rows.findIndex((row) => row === booking.startMinutes));
  const safeStartIndex = startIndex === -1 ? 0 : startIndex;
  let span = 1;

  for (let index = safeStartIndex + 1; index < rows.length; index += 1) {
    if (rows[index] >= booking.endMinutes) break;
    span += 1;
  }

  return { startIndex: safeStartIndex, span };
}

function layoutBookings(items: CalendarBooking[]) {
  const sorted = [...items].sort((left, right) => {
    if (left.startMinutes === right.startMinutes) return right.endMinutes - left.endMinutes;
    return left.startMinutes - right.startMinutes;
  });

  const result: BookingLayout[] = [];
  let group: CalendarBooking[] = [];
  let groupEnd = -1;

  function flush() {
    if (!group.length) return;

    const laneEnds: number[] = [];
    const groupResult: BookingLayout[] = [];

    for (const item of group) {
      let lane = laneEnds.findIndex((end) => end <= item.startMinutes);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(item.endMinutes);
      } else {
        laneEnds[lane] = item.endMinutes;
      }

      groupResult.push({ ...item, lane, laneCount: 1 });
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

    flush();
    group = [item];
    groupEnd = item.endMinutes;
  }

  flush();
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

function statusColor(booking: CalendarBooking, light: boolean) {
  if (booking.status === 'completed') return light ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.35)';
  if (booking.status === 'cancelled' || booking.status === 'no_show') return light ? '#B64A4A' : '#FF8585';
  return booking.color;
}

function slotTone(plan: DayPlan, rowStart: number, rowEnd: number, bookings: CalendarBooking[]) {
  const cell = { start: rowStart, end: rowEnd };
  const hasSlot = plan.slots.some((slot) => slot.start === rowStart || overlaps(slot, cell));
  const hasBreak = plan.breaks.some((item) => overlaps(item, cell));
  const hasBusy = bookings.some((booking) => overlaps(booking, cell));

  if (hasBreak) return 'break';
  if (hasBusy) return 'busy';
  if (hasSlot) return 'free';
  return 'outside';
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
  return <section className={cn('rounded-[11px] border', cardTone(light), className)}>{children}</section>;
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
    <div className={cn('flex min-h-[54px] items-center justify-between gap-4 border-b px-4 py-3', borderTone(light))}>
      <div className="min-w-0">
        <h2 className={cn('truncate text-[13px] font-semibold tracking-[-0.018em]', pageText(light))}>{title}</h2>
        {description ? <p className={cn('mt-1 truncate text-[11px]', mutedText(light))}>{description}</p> : null}
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
  return <div className={cn('rounded-[10px] border', insetTone(light), className)}>{children}</div>;
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
        light ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-white/[0.045]',
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
        compact ? 'h-8 min-w-[50px] px-3' : 'h-10 min-w-[72px] px-4',
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

function EmptyState({ children, light, className }: { children: ReactNode; light: boolean; className?: string }) {
  return (
    <div className={cn('rounded-[10px] border px-4 py-5 text-[12px]', insetTone(light), mutedText(light), className)}>
      {children}
    </div>
  );
}

function TinyMetric({ label, value, hint, light }: { label: string; value: string | number; hint?: string; light: boolean }) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-[10px] border px-3 py-2.5 transition-colors duration-150',
        light
          ? 'border-black/[0.07] bg-white hover:bg-black/[0.018]'
          : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.055]',
      )}
    >
      <div className={cn('truncate text-[10.5px] font-medium', mutedText(light))}>{label}</div>
      <div className={cn('mt-1.5 truncate text-[18px] font-semibold leading-none tracking-[-0.055em] tabular-nums', pageText(light))}>{value}</div>
      {hint ? <div className={cn('mt-1 truncate text-[10px]', faintText(light))}>{hint}</div> : null}
    </div>
  );
}

function SlotLegend({ light, locale }: { light: boolean; locale: 'ru' | 'en' }) {
  const items = locale === 'ru'
    ? [
        ['free', 'свободно'],
        ['busy', 'занято'],
        ['break', 'перерыв'],
      ]
    : [
        ['free', 'free'],
        ['busy', 'busy'],
        ['break', 'break'],
      ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(([tone, label]) => (
        <span key={tone} className={cn('inline-flex h-6 items-center gap-1.5 rounded-[8px] border px-2 text-[10px] font-medium', light ? 'border-black/[0.07] bg-white text-black/42' : 'border-white/[0.07] bg-white/[0.04] text-white/42')}>
          <span className={cn('size-1.5 rounded-full', tone === 'free' ? 'bg-emerald-400/70' : tone === 'busy' ? 'bg-current' : 'bg-amber-400/70')} />
          {label}
        </span>
      ))}
    </div>
  );
}

function BookingBlock({
  booking,
  top,
  height,
  left,
  width,
  light,
  locale,
  active,
  compact,
  onClick,
}: {
  booking: CalendarBooking;
  top: number;
  height: number;
  left: string;
  width: string;
  light: boolean;
  locale: 'ru' | 'en';
  active: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  const dot = statusColor(booking, light);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        top,
        left,
        width,
        height: Math.max(compact ? 29 : 31, height - 4),
        ...bookingStyle(booking.color, light, active),
      }}
      className={cn(
        'absolute z-10 overflow-hidden rounded-[9px] border px-2.5 py-1.5 text-left transition-[box-shadow,transform,filter] duration-150 hover:-translate-y-px',
        active && 'z-20',
      )}
    >
      <span style={{ background: dot }} className="absolute inset-y-1.5 left-1 w-1 rounded-full" />
      <div className="min-w-0 pl-2">
        <div className={cn('truncate font-semibold tracking-[-0.018em]', compact ? 'text-[10.5px]' : 'text-[11.5px]', pageText(light))}>{booking.clientName}</div>
        <div className={cn('mt-0.5 truncate font-medium', compact ? 'text-[9.5px]' : 'text-[10px]', light ? 'text-black/52' : 'text-white/52')}>
          {booking.start} · {booking.service}
        </div>
        {!compact && height >= 58 ? (
          <div className={cn('mt-1 truncate text-[9.5px]', faintText(light))}>
            {bookingStatusLabel(booking.status, locale)}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function DaySlotView({
  plan,
  rows,
  bookings,
  selectedId,
  todayIso,
  nowMinutes,
  light,
  locale,
  onSelect,
}: {
  plan: DayPlan;
  rows: number[];
  bookings: CalendarBooking[];
  selectedId: string | null;
  todayIso: string;
  nowMinutes: number;
  light: boolean;
  locale: 'ru' | 'en';
  onSelect: (booking: CalendarBooking) => void;
}) {
  const laidOut = useMemo(() => layoutBookings(bookings), [bookings]);
  const rowIndexByStart = useMemo(() => new Map(rows.map((row, index) => [row, index])), [rows]);
  const height = rows.length * ROW_HEIGHT;

  return (
    <Panel light={light} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <div className={cn('text-[13px] font-semibold tracking-[-0.018em]', pageText(light))}>{formatCompactDate(plan.date, locale)}</div>
          <div className={cn('mt-0.5 text-[11px]', mutedText(light))}>
            {plan.isDayOff
              ? locale === 'ru'
                ? 'выходной'
                : 'day off'
              : locale === 'ru'
                ? `${plan.slots.length} слотов · ${bookings.length} записей`
                : `${plan.slots.length} slots · ${bookings.length} bookings`}
          </div>
        </div>
        <SlotLegend light={light} locale={locale} />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px] px-3 py-3 pl-[78px]">
          <div className="relative" style={{ height }}>
            {rows.map((row, index) => {
              const next = getNextRow(rows, index);
              const rowBookings = bookings.filter((booking) => booking.startMinutes === row);
              const tone = slotTone(plan, row, next, rowBookings);
              const isNow = plan.iso === todayIso && nowMinutes >= row && nowMinutes < next;

              return (
                <div
                  key={row}
                  className={cn('absolute left-0 right-0 rounded-[8px] border', borderTone(light), slotToneClass(tone, light))}
                  style={{ top: index * ROW_HEIGHT, height: ROW_HEIGHT - 4 }}
                >
                  <div className={cn('absolute -left-[64px] top-1.5 w-12 text-right text-[10.5px] font-medium tabular-nums', faintText(light))}>{minutesToTime(row)}</div>
                  {isNow ? (
                    <div className="absolute inset-y-1 left-1 z-20 flex items-center">
                      <span className="size-1.5 rounded-full bg-current" />
                      <span className={cn('ml-1 rounded-[6px] px-1.5 py-0.5 text-[9px] font-semibold', light ? 'bg-black text-white' : 'bg-white text-black')}>{locale === 'ru' ? 'сейчас' : 'now'}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {laidOut.map((booking) => {
              const startIndex = rowIndexByStart.get(booking.startMinutes) ?? 0;
              const { span } = rowSpanForBooking(rows, booking);
              const gap = 6;

              return (
                <BookingBlock
                  key={booking.id}
                  booking={booking}
                  top={startIndex * ROW_HEIGHT}
                  height={span * ROW_HEIGHT}
                  left={`calc(${(100 / booking.laneCount) * booking.lane}% + ${gap / 2}px)`}
                  width={`calc(${100 / booking.laneCount}% - ${gap}px)`}
                  light={light}
                  locale={locale}
                  active={selectedId === booking.id}
                  onClick={() => onSelect(booking)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {!bookings.length ? (
        <div className="px-4 pb-4">
          <EmptyState light={light}>
            {plan.slots.length
              ? locale === 'ru'
                ? 'Слоты есть, записей пока нет.'
                : 'Slots are open, no bookings yet.'
              : locale === 'ru'
                ? 'На этот день нет рабочих слотов.'
                : 'No working slots for this day.'}
          </EmptyState>
        </div>
      ) : null}
    </Panel>
  );
}

function WeekSlotView({
  plans,
  rows,
  bookingsByDate,
  selectedId,
  todayIso,
  nowMinutes,
  light,
  locale,
  onSelect,
  onDateClick,
}: {
  plans: DayPlan[];
  rows: number[];
  bookingsByDate: Map<string, CalendarBooking[]>;
  selectedId: string | null;
  todayIso: string;
  nowMinutes: number;
  light: boolean;
  locale: 'ru' | 'en';
  onSelect: (booking: CalendarBooking) => void;
  onDateClick: (date: Date) => void;
}) {
  const height = rows.length * ROW_HEIGHT;

  return (
    <Panel light={light} className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className={cn('grid border-b', borderTone(light))} style={{ gridTemplateColumns: '68px repeat(7, minmax(120px, 1fr))' }}>
            <div className={cn('px-3 py-3 text-[10.5px] font-medium', mutedText(light))}>{locale === 'ru' ? 'Слот' : 'Slot'}</div>
            {plans.map((plan) => {
              const isToday = plan.iso === todayIso;
              const count = bookingsByDate.get(plan.iso)?.length ?? 0;

              return (
                <button
                  type="button"
                  key={plan.iso}
                  onClick={() => onDateClick(plan.date)}
                  className={cn(
                    'border-l px-2.5 py-2 text-left transition-colors',
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
                    <span className={cn('text-[11px] font-semibold', pageText(light))}>{getShortWeekday(plan.date, locale)}</span>
                    <span className={cn('grid size-6 place-items-center rounded-[8px] text-[11px] font-semibold', isToday ? (light ? 'bg-black text-white' : 'bg-white text-black') : pageText(light))}>{plan.date.getDate()}</span>
                  </div>
                  <div className={cn('mt-1 text-[10px]', faintText(light))}>
                    {plan.isDayOff
                      ? locale === 'ru'
                        ? 'выходной'
                        : 'off'
                      : `${plan.slots.length} / ${count}`}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid" style={{ gridTemplateColumns: '68px repeat(7, minmax(120px, 1fr))' }}>
            <div className="relative" style={{ height }}>
              {rows.map((row, index) => (
                <div key={row} className={cn('absolute left-0 right-0 border-t px-3 text-[10.5px] font-medium tabular-nums', borderTone(light), faintText(light))} style={{ top: index * ROW_HEIGHT, height: ROW_HEIGHT }}>
                  <span className="relative top-1.5">{minutesToTime(row)}</span>
                </div>
              ))}
            </div>

            {plans.map((plan) => {
              const dayBookings = bookingsByDate.get(plan.iso) ?? [];
              const laidOut = layoutBookings(dayBookings);
              const rowIndexByStart = new Map(rows.map((row, index) => [row, index]));

              return (
                <div key={plan.iso} className={cn('relative border-l', borderTone(light))} style={{ height }}>
                  {rows.map((row, index) => {
                    const next = getNextRow(rows, index);
                    const rowBookings = dayBookings.filter((booking) => booking.startMinutes === row);
                    const tone = slotTone(plan, row, next, rowBookings);
                    const isNow = plan.iso === todayIso && nowMinutes >= row && nowMinutes < next;

                    return (
                      <div
                        key={row}
                        className={cn('absolute left-1 right-1 rounded-[8px] border', borderTone(light), slotToneClass(tone, light))}
                        style={{ top: index * ROW_HEIGHT, height: ROW_HEIGHT - 4 }}
                      >
                        {isNow ? <span className="absolute left-1 top-1/2 z-20 size-1.5 -translate-y-1/2 rounded-full bg-current" /> : null}
                      </div>
                    );
                  })}

                  {laidOut.map((booking) => {
                    const startIndex = rowIndexByStart.get(booking.startMinutes) ?? 0;
                    const { span } = rowSpanForBooking(rows, booking);
                    const gap = 5;

                    return (
                      <BookingBlock
                        key={booking.id}
                        booking={booking}
                        top={startIndex * ROW_HEIGHT}
                        height={span * ROW_HEIGHT}
                        left={`calc(${(100 / booking.laneCount) * booking.lane}% + ${gap / 2 + 4}px)`}
                        width={`calc(${100 / booking.laneCount}% - ${gap + 8}px)`}
                        light={light}
                        locale={locale}
                        compact
                        active={selectedId === booking.id}
                        onClick={() => onSelect(booking)}
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

function MonthView({
  plans,
  selectedDate,
  bookingsByDate,
  selectedId,
  todayIso,
  light,
  locale,
  onSelect,
  onDateClick,
}: {
  plans: DayPlan[];
  selectedDate: Date;
  bookingsByDate: Map<string, CalendarBooking[]>;
  selectedId: string | null;
  todayIso: string;
  light: boolean;
  locale: 'ru' | 'en';
  onSelect: (booking: CalendarBooking) => void;
  onDateClick: (date: Date) => void;
}) {
  const monthKey = toLocalIsoDate(selectedDate).slice(0, 7);

  return (
    <Panel light={light} className="overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {Array.from({ length: 7 }, (_, index) => {
          const date = addDays(startOfWeekMonday(new Date()), index);
          return (
            <div key={index} className={cn('border-r px-2.5 py-2 text-[10.5px] font-semibold last:border-r-0', borderTone(light), mutedText(light))}>
              {getShortWeekday(date, locale)}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-7">
        {plans.map((plan) => {
          const dayBookings = bookingsByDate.get(plan.iso) ?? [];
          const isToday = plan.iso === todayIso;
          const inMonth = plan.iso.startsWith(monthKey);

          return (
            <button
              key={plan.iso}
              type="button"
              onClick={() => onDateClick(plan.date)}
              className={cn(
                'min-h-[116px] border-r border-t p-2 text-left transition-colors last:border-r-0',
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
                <span className={cn('grid size-6 place-items-center rounded-[8px] text-[11px] font-semibold', isToday ? (light ? 'bg-black text-white' : 'bg-white text-black') : pageText(light))}>{plan.date.getDate()}</span>
                <span className={cn('text-[10px] font-medium', faintText(light))}>
                  {plan.isDayOff ? '—' : `${plan.slots.length}`}
                </span>
              </div>

              <div className="mb-1.5 flex gap-0.5">
                {Array.from({ length: Math.min(10, Math.max(0, plan.slots.length)) }, (_, index) => (
                  <span key={index} className={cn('h-1 flex-1 rounded-full', light ? 'bg-black/16' : 'bg-white/18')} />
                ))}
              </div>

              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking) => (
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
                    style={bookingStyle(booking.color, light, selectedId === booking.id)}
                    className="block rounded-[7px] border px-1.5 py-1"
                  >
                    <span className={cn('block truncate text-[10px] font-semibold', pageText(light))}>{booking.start} · {booking.clientName}</span>
                  </span>
                ))}

                {dayBookings.length > 3 ? <span className={cn('block pt-0.5 text-[10px] font-medium', mutedText(light))}>+{dayBookings.length - 3}</span> : null}
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function DetailSheet({
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
  const tone = statusColor(booking, light);
  const closed = booking.status === 'completed' || booking.status === 'no_show' || booking.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/30 p-3 backdrop-blur-[2px] md:items-center">
      <button type="button" aria-label={locale === 'ru' ? 'Закрыть' : 'Close'} className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className={cn('relative w-full max-w-[430px] overflow-hidden rounded-[18px] border shadow-[0_24px_90px_rgba(0,0,0,0.32)]', light ? 'border-black/[0.08] bg-[#fbfbfa]' : 'border-white/[0.09] bg-[#101010]')}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <MicroLabel light={light} active accentColor={tone}>
                <StatusDot light={light} active accentColor={tone} />
                {bookingStatusLabel(booking.status, locale)} · {bookingStatusHint(booking.status, locale)}
              </MicroLabel>

              <div className={cn('mt-3 truncate text-[24px] font-semibold tracking-[-0.065em]', pageText(light))}>{booking.clientName}</div>
              <div className={cn('mt-1 flex items-center gap-1.5 truncate text-[12px]', mutedText(light))}>
                <Scissors className="size-3.5" />
                <span className="truncate">{booking.service}</span>
              </div>
            </div>

            <button type="button" onClick={onClose} className={iconButtonBase(light)}>
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              [locale === 'ru' ? 'Время' : 'Time', `${booking.start}–${booking.end}`],
              [locale === 'ru' ? 'Длительность' : 'Duration', `${booking.durationMinutes} ${locale === 'ru' ? 'мин' : 'min'}`],
              [locale === 'ru' ? 'Сумма' : 'Amount', booking.amount ? formatCurrencyCompact(booking.amount, locale) : '—'],
              [locale === 'ru' ? 'Источник' : 'Source', booking.sourceLabel || 'Web'],
            ].map(([label, value]) => (
              <Panel key={label} light={light} className="p-3">
                <div className={cn('text-[10.5px] font-medium', faintText(light))}>{label}</div>
                <div className={cn('mt-1 truncate text-[13px] font-semibold', pageText(light))}>{value}</div>
              </Panel>
            ))}
          </div>

          <Panel light={light} className="mt-2 p-3">
            <div className={cn('text-[10.5px] font-medium', faintText(light))}>{locale === 'ru' ? 'Комментарий' : 'Note'}</div>
            <div className={cn('mt-1 text-[12px] leading-5', pageText(light))}>{booking.note || '—'}</div>
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
                {locale === 'ru' ? 'График' : 'Schedule'}
              </Link>
            </Button>

            {!closed ? (
              <Button type="button" className={cn('justify-start', buttonBase(light, true))} onClick={() => onStatusChange('completed')} disabled={actionLoading !== null}>
                <CheckCircle2 className="size-3.5" />
                {actionLoading === 'completed' ? '…' : locale === 'ru' ? 'Пришёл' : 'Arrived'}
              </Button>
            ) : null}

            {!closed ? (
              <Button type="button" className={cn('col-span-2 justify-start', buttonBase(light))} onClick={() => onStatusChange('no_show')} disabled={actionLoading !== null}>
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
  const { hasHydrated, ownedProfile, bookings, dataset, locale, workspaceData, demoMode } = useOwnedWorkspaceData();
  const { resolvedTheme } = useTheme();
  const { settings } = useAppearance();

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<BookingStatus | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedBookingId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedBookingId(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedBookingId]);

  const currentTheme: ThemeMode = mounted ? (resolvedTheme === 'light' ? 'light' : 'dark') : 'dark';
  const isLight = currentTheme === 'light';

  const accentColor = accentPalette[settings.accentTone].solid;
  const publicAccentColor = accentPalette[settings.publicAccent].solid;
  const todayIso = useMemo(() => toLocalIsoDate(now), [now]);
  const nowMinutes = useMemo(() => now.getHours() * 60 + now.getMinutes(), [now]);

  const serviceMap = useMemo(
    () => serviceMapFromSources(dataset?.services, workspaceData?.services),
    [dataset?.services, workspaceData?.services],
  );

  const availability = useMemo(
    () => normalizeAvailabilityDays(workspaceData?.availability ?? dataset?.availability),
    [dataset?.availability, workspaceData?.availability],
  );

  const calendarBookings = useMemo(
    () =>
      bookings
        .map((booking) => mapBooking(booking, serviceMap, accentColor, publicAccentColor))
        .sort((left, right) => `${left.date}T${left.start}`.localeCompare(`${right.date}T${right.start}`)),
    [accentColor, bookings, publicAccentColor, serviceMap],
  );

  const visibleDates = useMemo(() => getVisibleDates(view, selectedDate), [selectedDate, view]);
  const visiblePlans = useMemo(() => visibleDates.map((date) => getDayPlan(date, availability)), [availability, visibleDates]);
  const visibleIsoSet = useMemo(() => new Set(visiblePlans.map((plan) => plan.iso)), [visiblePlans]);
  const visibleBookings = useMemo(
    () => calendarBookings.filter((booking) => visibleIsoSet.has(booking.date)),
    [calendarBookings, visibleIsoSet],
  );

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const booking of visibleBookings) {
      const current = map.get(booking.date) ?? [];
      current.push(booking);
      map.set(booking.date, current.sort((left, right) => left.startMinutes - right.startMinutes));
    }
    return map;
  }, [visibleBookings]);

  const selectedBooking = useMemo(
    () => calendarBookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [calendarBookings, selectedBookingId],
  );

  const rows = useMemo(() => buildRows(visiblePlans, visibleBookings), [visibleBookings, visiblePlans]);
  const selectedPlan = useMemo(() => getDayPlan(selectedDate, availability), [availability, selectedDate]);
  const selectedDayRows = useMemo(
    () => buildRows([selectedPlan], calendarBookings.filter((booking) => booking.date === selectedPlan.iso)),
    [calendarBookings, selectedPlan],
  );

  const nextBooking = useMemo(
    () =>
      calendarBookings.find(
        (booking) =>
          isActiveBooking(booking) &&
          `${booking.date}T${booking.start}` >= `${todayIso}T${minutesToTime(nowMinutes)}`,
      ) ?? null,
    [calendarBookings, nowMinutes, todayIso],
  );

  const rangeTitle = useMemo(() => getRangeTitle(view, selectedDate, locale), [locale, selectedDate, view]);
  const selectedDateIso = useMemo(() => toLocalIsoDate(selectedDate), [selectedDate]);

  const metrics = useMemo(() => {
    const active = visibleBookings.filter(isActiveBooking);
    const completed = visibleBookings.filter(isCompletedBooking);
    const revenue = visibleBookings.reduce((sum, booking) => sum + booking.amount, 0);
    const slotCount = visiblePlans.reduce((sum, plan) => sum + plan.slots.length, 0);
    const load = slotCount ? Math.round((active.length / slotCount) * 100) : 0;

    return [
      {
        label: locale === 'ru' ? 'Слоты' : 'Slots',
        value: slotCount,
        hint: locale === 'ru' ? `${load}% занято` : `${load}% busy`,
      },
      {
        label: locale === 'ru' ? 'Записи' : 'Bookings',
        value: active.length,
        hint: locale === 'ru' ? `${completed.length} закрыто` : `${completed.length} closed`,
      },
      {
        label: locale === 'ru' ? 'Выручка' : 'Revenue',
        value: formatCurrencyCompact(revenue, locale),
        hint: locale === 'ru' ? 'за период' : 'in range',
      },
      {
        label: locale === 'ru' ? 'Ближайшая' : 'Next',
        value: nextBooking?.start ?? '—',
        hint: nextBooking ? `${nextBooking.clientName} · ${nextBooking.service}` : locale === 'ru' ? 'пусто' : 'empty',
      },
    ];
  }, [locale, nextBooking, visibleBookings, visiblePlans]);

  const copy =
    locale === 'ru'
      ? {
          title: 'Сегодня',
          description: 'Живой календарь по реальным слотам: запись совпадает с графиком, без визуального шума.',
          createTitle: 'Сначала настройте профиль мастера',
          createDescription: 'Создайте профиль, чтобы открыть календарь, реальные слоты, записи и быстрые действия.',
          createProfile: 'Создать профиль',
          profileMissing: 'Профиль не настроен',
          calendar: 'Календарь слотов',
          calendarDescription: 'Сетка построена по графику мастера. Клик по записи открывает карточку.',
          today: 'Сегодня',
          day: 'День',
          week: 'Неделя',
          month: 'Месяц',
          live: 'Рабочий режим',
          demo: 'Демо',
          freeSlot: 'Свободный слот',
          newBooking: 'Новая запись',
          setupCards: {
            calendar: 'Реальные слоты',
            calendarText: 'Календарь берёт интервалы из графика, а не рисует случайные часы.',
            clients: 'Карточка клиента',
            clientsText: 'Контакт, статус, комментарий и действия открываются в мини-окне.',
            public: 'Онлайн-запись',
            publicText: 'Клиенты записываются в свободные окна публичной страницы.',
          },
        }
      : {
          title: 'Today',
          description: 'Live calendar based on real slots: bookings match availability without visual noise.',
          createTitle: 'Create the master profile first',
          createDescription: 'Create a profile to unlock calendar, real slots, bookings, and quick actions.',
          createProfile: 'Create profile',
          profileMissing: 'Profile missing',
          calendar: 'Slot calendar',
          calendarDescription: 'The grid is built from availability. Click a booking to open the card.',
          today: 'Today',
          day: 'Day',
          week: 'Week',
          month: 'Month',
          live: 'Work mode',
          demo: 'Demo',
          freeSlot: 'Free slot',
          newBooking: 'New booking',
          setupCards: {
            calendar: 'Real slots',
            calendarText: 'The calendar uses availability intervals instead of random hours.',
            clients: 'Client card',
            clientsText: 'Contact, status, note, and actions open in a compact sheet.',
            public: 'Online booking',
            publicText: 'Clients book into free windows from the public page.',
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

  function handleDateClick(date: Date) {
    setSelectedDate(date);
    if (view === 'month') setView('day');
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
        <main className={cn('min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6', pageBg(isLight))}>
          <div className="mx-auto w-full max-w-[var(--page-max-width)]">
            <div className="mb-5 md:mb-6">
              <h1 className={cn('text-[28px] font-semibold tracking-[-0.075em] md:text-[36px]', pageText(isLight))}>{copy.title}</h1>
              <p className={cn('mt-2 max-w-[680px] text-[13px] leading-5', mutedText(isLight))}>{copy.description}</p>
            </div>

            <Card light={isLight} className="overflow-hidden">
              <div className="grid min-h-[300px] place-items-center px-5 py-10 text-center">
                <div className="mx-auto max-w-[500px]">
                  <MicroLabel light={isLight}>
                    <StatusDot light={isLight} />
                    {copy.profileMissing}
                  </MicroLabel>

                  <h2 className={cn('mt-5 text-[26px] font-semibold tracking-[-0.065em] md:text-[34px]', pageText(isLight))}>{copy.createTitle}</h2>
                  <p className={cn('mt-3 text-[13px] leading-5', mutedText(isLight))}>{copy.createDescription}</p>

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
                  <div className={cn('mt-4 text-[13px] font-semibold', pageText(isLight))}>{copy.calendar}</div>
                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>{copy.setupCards.calendarText}</p>
                </div>
              </Card>

              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <MessageCircleMore className="size-3.5" />
                    {copy.setupCards.clients}
                  </MicroLabel>
                  <div className={cn('mt-4 text-[13px] font-semibold', pageText(isLight))}>{locale === 'ru' ? 'Мини-окно' : 'Mini sheet'}</div>
                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>{copy.setupCards.clientsText}</p>
                </div>
              </Card>

              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <Globe2 className="size-3.5" />
                    {copy.setupCards.public}
                  </MicroLabel>
                  <div className={cn('mt-4 text-[13px] font-semibold', pageText(isLight))}>{locale === 'ru' ? 'Публичная' : 'Public'}</div>
                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>{copy.setupCards.publicText}</p>
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
      <main className={cn('min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6', pageBg(isLight))}>
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
                  {minutesToTime(nowMinutes)}
                </MicroLabel>
              </div>

              <h1 className={cn('mt-3 text-[28px] font-semibold tracking-[-0.075em] md:text-[36px]', pageText(isLight))}>{copy.title}</h1>
              <p className={cn('mt-1.5 max-w-[720px] text-[13px] leading-5', mutedText(isLight))}>{copy.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ControlGroup light={isLight} className="h-9">
                <FilterChip label={copy.day} active={view === 'day'} onClick={() => setView('day')} light={isLight} accentColor={accentColor} compact />
                <FilterChip label={copy.week} active={view === 'week'} onClick={() => setView('week')} light={isLight} accentColor={accentColor} compact />
                <FilterChip label={copy.month} active={view === 'month'} onClick={() => setView('month')} light={isLight} accentColor={accentColor} compact />
              </ControlGroup>

              <div className="flex items-center gap-1.5">
                <button type="button" onClick={goPrevious} className={iconButtonBase(isLight)}>
                  <ChevronLeft className="size-4" />
                </button>
                <button type="button" onClick={goToday} className={buttonBase(isLight)}>{copy.today}</button>
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
                          ? 'День'
                          : 'Day'
                        : view === 'week'
                          ? locale === 'ru'
                            ? 'Неделя'
                            : 'Week'
                          : locale === 'ru'
                            ? 'Месяц'
                            : 'Month'}
                    </div>
                    <div className={cn('mt-1.5 text-[24px] font-semibold tracking-[-0.065em] md:text-[30px]', pageText(isLight))}>{rangeTitle}</div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:w-[560px] xl:grid-cols-4">
                    {metrics.map((metric) => (
                      <TinyMetric key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} light={isLight} />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card light={isLight}>
              <CardTitle
                title={copy.calendar}
                description={copy.calendarDescription}
                light={isLight}
                action={
                  <div className="hidden items-center gap-2 md:flex">
                    <MicroLabel light={isLight}>
                      <Sparkles className="size-3.5" />
                      {view === 'day' ? selectedDateIso : `${visibleBookings.length} ${locale === 'ru' ? 'зап.' : 'bk.'}`}
                    </MicroLabel>
                    <Button asChild className={buttonBase(isLight, true)}>
                      <Link href="/dashboard/availability">
                        <Plus className="size-3.5" />
                        {locale === 'ru' ? 'График' : 'Schedule'}
                      </Link>
                    </Button>
                  </div>
                }
              />

              <div className="p-3 md:p-4">
                {view === 'day' ? (
                  <DaySlotView
                    plan={selectedPlan}
                    rows={selectedDayRows}
                    bookings={calendarBookings.filter((booking) => booking.date === selectedPlan.iso)}
                    selectedId={selectedBookingId}
                    todayIso={todayIso}
                    nowMinutes={nowMinutes}
                    light={isLight}
                    locale={locale}
                    onSelect={(booking) => setSelectedBookingId(booking.id)}
                  />
                ) : null}

                {view === 'week' ? (
                  <WeekSlotView
                    plans={visiblePlans}
                    rows={rows}
                    bookingsByDate={bookingsByDate}
                    selectedId={selectedBookingId}
                    todayIso={todayIso}
                    nowMinutes={nowMinutes}
                    light={isLight}
                    locale={locale}
                    onSelect={(booking) => setSelectedBookingId(booking.id)}
                    onDateClick={handleDateClick}
                  />
                ) : null}

                {view === 'month' ? (
                  <MonthView
                    plans={visiblePlans}
                    selectedDate={selectedDate}
                    bookingsByDate={bookingsByDate}
                    selectedId={selectedBookingId}
                    todayIso={todayIso}
                    light={isLight}
                    locale={locale}
                    onSelect={(booking) => setSelectedBookingId(booking.id)}
                    onDateClick={handleDateClick}
                  />
                ) : null}
              </div>
            </Card>
          </div>
        </div>

        {selectedBooking ? (
          <DetailSheet
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
