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
import {
  findAvailabilityDay,
  normalizeAvailabilityDays,
  timeToMinutes,
  type BookingAvailabilityDay,
} from '@/lib/availability';
import type { Booking, BookingStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';
type CalendarView = 'day' | 'week' | 'month';
type SlotState = 'free' | 'busy' | 'break' | 'outside';

interface SlotSegment {
  start: number;
  end: number;
  label: string;
  source: string;
  kind: 'work' | 'break' | 'external';
}

interface CalendarBooking {
  id: string;
  raw: Booking;
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
  servicePrice?: number;
}

interface DayPlan {
  iso: string;
  date: Date;
  source: BookingAvailabilityDay | null;
  slots: SlotSegment[];
  breaks: SlotSegment[];
  isDayOff: boolean;
}

interface CalendarMetrics {
  slots: number;
  busy: number;
  free: number;
  load: number;
  revenue: number;
  next: CalendarBooking | null;
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

const ROW_HEIGHT = 46;
const DEFAULT_SLOT_MINUTES = 60;
const WEEKDAY_SHORT_FALLBACK_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAY_SHORT_FALLBACK_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

function bookingSurfaceStyle(color: string, light: boolean, active = false): CSSProperties {
  return {
    background: light
      ? `linear-gradient(135deg, color-mix(in srgb, ${color} 11%, #ffffff), color-mix(in srgb, ${color} 4%, #ffffff))`
      : `linear-gradient(135deg, color-mix(in srgb, ${color} 20%, #131313), color-mix(in srgb, ${color} 7%, #101010))`,
    borderColor: light
      ? `color-mix(in srgb, ${color} 32%, rgba(0,0,0,0.08))`
      : `color-mix(in srgb, ${color} 38%, rgba(255,255,255,0.08))`,
    boxShadow: active
      ? light
        ? `0 10px 26px color-mix(in srgb, ${color} 14%, transparent), inset 0 0 0 1px color-mix(in srgb, ${color} 14%, transparent)`
        : `0 12px 28px color-mix(in srgb, ${color} 16%, transparent), inset 0 0 0 1px color-mix(in srgb, ${color} 18%, transparent)`
      : undefined,
  };
}

function slotStateClass(state: SlotState, light: boolean) {
  if (state === 'busy') {
    return light
      ? 'border-black/[0.08] bg-white/75'
      : 'border-white/[0.08] bg-white/[0.035]';
  }

  if (state === 'free') {
    return light
      ? 'border-black/[0.06] bg-white/45 hover:bg-white/75'
      : 'border-white/[0.055] bg-white/[0.018] hover:bg-white/[0.032]';
  }

  if (state === 'break') {
    return light
      ? 'border-dashed border-black/[0.08] bg-black/[0.018]'
      : 'border-dashed border-white/[0.075] bg-white/[0.018]';
  }

  return light
    ? 'border-black/[0.04] bg-black/[0.012]'
    : 'border-white/[0.04] bg-white/[0.01]';
}

function toLocalIsoDate(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function parseDate(iso: string) {
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

function formatTime(minutes: number) {
  const normalized = Math.max(0, Math.min(24 * 60, Math.round(minutes)));
  const hours = Math.floor(normalized / 60).toString().padStart(2, '0');
  const mins = (normalized % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

function parseBookingTime(time: string) {
  return timeToMinutes(time) ?? 0;
}

function splitIntervalText(value: string) {
  const [startRaw, endRaw] = value
    .replace(/—/g, '–')
    .replace(/-/g, '–')
    .split('–')
    .map((item) => item.trim());

  const start = timeToMinutes(startRaw ?? '');
  const end = timeToMinutes(endRaw ?? '');

  if (start === null || end === null || end <= start) return null;

  return { start, end };
}

function buildSlotSegments(values: string[] | undefined, kind: SlotSegment['kind']) {
  const segments = new Map<string, SlotSegment>();

  for (const value of values ?? []) {
    const interval = splitIntervalText(value);
    if (!interval) continue;

    const duration = interval.end - interval.start;
    const step = duration <= DEFAULT_SLOT_MINUTES ? duration : DEFAULT_SLOT_MINUTES;

    for (let current = interval.start; current < interval.end; current += step) {
      const end = Math.min(interval.end, current + step);
      const key = `${current}-${end}-${kind}`;
      segments.set(key, {
        start: current,
        end,
        label: `${formatTime(current)}–${formatTime(end)}`,
        source: value,
        kind,
      });
    }
  }

  return [...segments.values()].sort((left, right) => left.start - right.start || left.end - right.end);
}

function overlaps(
  left: Pick<SlotSegment, 'start' | 'end'>,
  right: Pick<SlotSegment, 'start' | 'end'>,
) {
  return left.start < right.end && right.start < left.end;
}

function getDayPlan(date: Date, availability: BookingAvailabilityDay[]): DayPlan {
  const iso = toLocalIsoDate(date);
  const source = findAvailabilityDay(availability, iso);
  const isDayOff = source?.status === 'day-off';

  return {
    iso,
    date,
    source,
    slots: isDayOff ? [] : buildSlotSegments(source?.slots, 'work'),
    breaks: isDayOff ? [] : buildSlotSegments(source?.breaks, 'break'),
    isDayOff,
  };
}

function getWeekDates(date: Date) {
  const start = startOfWeekMonday(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function getMonthDates(date: Date) {
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeekMonday(monthStart);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function getVisibleDates(view: CalendarView, selectedDate: Date) {
  if (view === 'day') return [selectedDate];
  if (view === 'week') return getWeekDates(selectedDate);
  return getMonthDates(selectedDate);
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
    const index = (date.getDay() + 6) % 7;
    return locale === 'ru' ? WEEKDAY_SHORT_FALLBACK_RU[index] ?? '' : WEEKDAY_SHORT_FALLBACK_EN[index] ?? '';
  }
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

function formatRangeTitle(view: CalendarView, date: Date, locale: 'ru' | 'en') {
  if (view === 'day') {
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

  if (view === 'week') {
    const start = startOfWeekMonday(date);
    const end = addDays(start, 6);
    return `${formatCompactDate(start, locale)} — ${formatCompactDate(end, locale)}`;
  }

  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return toLocalIsoDate(date);
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

function getString(record: Record<string, unknown> | null, keys: string[]) {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return undefined;
}

function getNumber(record: Record<string, unknown> | null, keys: string[]) {
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

function buildServiceMap(datasetServices: unknown, workspaceServices: unknown) {
  const source = Array.isArray(workspaceServices)
    ? workspaceServices
    : Array.isArray(datasetServices)
      ? datasetServices
      : [];

  const map = new Map<string, Record<string, unknown>>();

  for (const item of source) {
    const record = getObject(item);
    const name = getString(record, ['name', 'title', 'label']);
    if (name && record) map.set(name, record);
  }

  return map;
}

function getServiceColor(
  booking: Booking,
  services: Map<string, Record<string, unknown>>,
  accentColor: string,
  publicAccentColor: string,
) {
  const metadata = getObject(booking.metadata);
  const metadataColor = normalizeColor(
    getString(metadata, ['color', 'serviceColor', 'calendarColor', 'accentColor']),
  );
  if (metadataColor) return metadataColor;

  const service = services.get(booking.service);
  const serviceColor = normalizeColor(
    getString(service ?? null, ['color', 'serviceColor', 'calendarColor', 'accentColor']),
  );
  if (serviceColor) return serviceColor;

  if (booking.status === 'new') return publicAccentColor;
  if (booking.status === 'confirmed') return accentColor;

  const index = hashString(booking.service || booking.id) % AUTO_SERVICE_COLORS.length;
  return AUTO_SERVICE_COLORS[index] ?? accentColor;
}

function getServiceDuration(booking: Booking, services: Map<string, Record<string, unknown>>) {
  if (
    typeof booking.durationMinutes === 'number' &&
    Number.isFinite(booking.durationMinutes) &&
    booking.durationMinutes > 0
  ) {
    return booking.durationMinutes;
  }

  const service = services.get(booking.service);
  const duration = getNumber(service ?? null, ['duration', 'durationMinutes']);
  return duration && duration > 0 ? duration : DEFAULT_SLOT_MINUTES;
}

function getServicePrice(booking: Booking, services: Map<string, Record<string, unknown>>) {
  if (typeof booking.priceAmount === 'number' && Number.isFinite(booking.priceAmount)) {
    return booking.priceAmount;
  }

  const service = services.get(booking.service);
  return getNumber(service ?? null, ['price', 'priceAmount']);
}

function mapBooking(
  booking: Booking,
  services: Map<string, Record<string, unknown>>,
  accentColor: string,
  publicAccentColor: string,
): CalendarBooking {
  const startMinutes = parseBookingTime(booking.time);
  const durationMinutes = getServiceDuration(booking, services);
  const endMinutes = startMinutes + durationMinutes;
  const amount = getServicePrice(booking, services) ?? 0;

  return {
    id: booking.id,
    raw: booking,
    clientName: booking.clientName,
    service: booking.service,
    phone: booking.clientPhone,
    date: booking.date,
    start: booking.time,
    end: formatTime(endMinutes),
    startMinutes,
    endMinutes,
    durationMinutes,
    status: booking.status,
    note: booking.comment || undefined,
    sourceLabel: booking.source ?? booking.channel,
    amount,
    servicePrice: amount,
    color: getServiceColor(booking, services, accentColor, publicAccentColor),
  };
}

function isActiveBooking(booking: CalendarBooking) {
  return booking.status !== 'cancelled' && booking.status !== 'no_show';
}

function isClosedBooking(booking: CalendarBooking) {
  return booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'no_show';
}

function getBookingsForDate(bookings: CalendarBooking[], iso: string) {
  return bookings
    .filter((booking) => booking.date === iso)
    .sort((left, right) => left.startMinutes - right.startMinutes || left.clientName.localeCompare(right.clientName));
}

function bookingsInSlot(bookings: CalendarBooking[], slot: SlotSegment) {
  return bookings.filter((booking) =>
    overlaps(
      { start: booking.startMinutes, end: Math.max(booking.endMinutes, booking.startMinutes + 1) },
      slot,
    ),
  );
}

function getExternalRows(plan: DayPlan, bookings: CalendarBooking[]) {
  const rows = new Map<string, SlotSegment>();

  for (const booking of bookings) {
    const inWorkSlot = plan.slots.some((slot) =>
      overlaps(
        { start: booking.startMinutes, end: Math.max(booking.endMinutes, booking.startMinutes + 1) },
        slot,
      ),
    );

    if (!inWorkSlot) {
      const start = booking.startMinutes;
      const end = Math.max(booking.endMinutes, start + DEFAULT_SLOT_MINUTES);
      rows.set(`${start}-${end}`, {
        start,
        end,
        label: `${formatTime(start)}–${formatTime(end)}`,
        source: booking.id,
        kind: 'external',
      });
    }
  }

  return [...rows.values()];
}

function buildRowsForPlan(plan: DayPlan, bookings: CalendarBooking[]) {
  return [...plan.slots, ...plan.breaks, ...getExternalRows(plan, bookings)].sort(
    (left, right) => left.start - right.start || left.end - right.end,
  );
}

function buildWeekRows(plans: DayPlan[], bookings: CalendarBooking[]) {
  const rows = new Map<string, SlotSegment>();

  for (const plan of plans) {
    const dayBookings = getBookingsForDate(bookings, plan.iso);
    for (const row of buildRowsForPlan(plan, dayBookings)) {
      rows.set(`${row.start}-${row.end}`, {
        ...row,
        kind: row.kind === 'external' ? 'external' : 'work',
      });
    }
  }

  if (rows.size === 0) {
    for (let hour = 9; hour <= 18; hour += 1) {
      const start = hour * 60;
      const end = start + DEFAULT_SLOT_MINUTES;
      rows.set(`${start}-${end}`, {
        start,
        end,
        label: `${formatTime(start)}–${formatTime(end)}`,
        source: 'fallback',
        kind: 'external',
      });
    }
  }

  return [...rows.values()].sort((left, right) => left.start - right.start || left.end - right.end);
}

function getSlotState(plan: DayPlan, row: SlotSegment, bookings: CalendarBooking[]): SlotState {
  const rowRange = { start: row.start, end: row.end };
  const hasBooking = bookingsInSlot(bookings, row).some(isActiveBooking);
  if (hasBooking) return 'busy';

  const isBreak = plan.breaks.some((slot) => overlaps(slot, rowRange));
  if (isBreak || row.kind === 'break') return 'break';

  const isWork = plan.slots.some((slot) => overlaps(slot, rowRange));
  if (isWork) return 'free';

  return 'outside';
}

function buildMetrics(
  visibleBookings: CalendarBooking[],
  plans: DayPlan[],
  nowIso: string,
  nowMinutes: number,
): CalendarMetrics {
  const slots = plans.reduce((sum, plan) => sum + plan.slots.length, 0);
  const active = visibleBookings.filter(isActiveBooking);
  const busy = active.length;
  const free = Math.max(0, slots - busy);
  const revenue = visibleBookings.reduce((sum, booking) => sum + booking.amount, 0);
  const next = [...visibleBookings]
    .filter((booking) => isActiveBooking(booking) && `${booking.date}T${booking.start}` >= `${nowIso}T${formatTime(nowMinutes)}`)
    .sort((left, right) => `${left.date}T${left.start}`.localeCompare(`${right.date}T${right.start}`))[0] ?? null;

  return {
    slots,
    busy,
    free,
    load: slots ? Math.min(100, Math.round((busy / slots) * 100)) : 0,
    revenue,
    next,
  };
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
  if (booking.status === 'completed') return light ? 'rgba(0,0,0,0.34)' : 'rgba(255,255,255,0.38)';
  if (booking.status === 'no_show' || booking.status === 'cancelled') return light ? '#B64A4A' : '#FF8585';
  return booking.color;
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

function BookingPill({
  booking,
  light,
  locale,
  selected,
  compact,
  onClick,
}: {
  booking: CalendarBooking;
  light: boolean;
  locale: 'ru' | 'en';
  selected?: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  const tone = statusColor(booking, light);

  return (
    <button
      type="button"
      onClick={onClick}
      style={bookingSurfaceStyle(booking.color, light, selected)}
      className={cn(
        'group relative w-full min-w-0 overflow-hidden rounded-[9px] border text-left transition-[box-shadow,transform,filter] duration-150 hover:-translate-y-px',
        compact ? 'px-2 py-1.5' : 'px-2.5 py-2',
      )}
    >
      <span
        style={{ background: tone }}
        className={cn('absolute inset-y-1.5 left-1 rounded-full', compact ? 'w-[3px]' : 'w-1')}
      />

      <div className="min-w-0 pl-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span
            className={cn(
              'truncate font-semibold tracking-[-0.018em]',
              compact ? 'text-[10.5px]' : 'text-[11.5px]',
              pageText(light),
            )}
          >
            {booking.clientName}
          </span>
          <span className={cn('shrink-0 text-[9.5px] font-medium tabular-nums', mutedText(light))}>
            {booking.start}
          </span>
        </div>

        <div
          className={cn(
            'mt-0.5 truncate font-medium',
            compact ? 'text-[9.5px]' : 'text-[10px]',
            light ? 'text-black/52' : 'text-white/52',
          )}
        >
          {booking.service}
        </div>

        {!compact ? (
          <div className={cn('mt-1 flex items-center gap-1.5 text-[9.5px]', faintText(light))}>
            <span>{booking.durationMinutes} {locale === 'ru' ? 'мин' : 'min'}</span>
            <span>·</span>
            <span>{bookingStatusHint(booking.status, locale)}</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}

function SlotCell({
  state,
  light,
  children,
  className,
}: {
  state: SlotState;
  light: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-h-[46px] rounded-[9px] border px-1.5 py-1.5 transition-colors duration-150',
        slotStateClass(state, light),
        className,
      )}
    >
      {children}
    </div>
  );
}

function FreeSlotHint({ light, label }: { light: boolean; label: string }) {
  return (
    <div className="flex h-full min-h-[31px] items-center justify-center">
      <span className={cn('text-[10px] font-medium', faintText(light))}>{label}</span>
    </div>
  );
}

function DayPlanner({
  plan,
  bookings,
  selectedBookingId,
  nowMinutes,
  todayIso,
  light,
  locale,
  onSelectBooking,
}: {
  plan: DayPlan;
  bookings: CalendarBooking[];
  selectedBookingId: string | null;
  nowMinutes: number;
  todayIso: string;
  light: boolean;
  locale: 'ru' | 'en';
  onSelectBooking: (booking: CalendarBooking) => void;
}) {
  const rows = useMemo(() => buildRowsForPlan(plan, bookings), [bookings, plan]);
  const currentRow = plan.iso === todayIso
    ? rows.find((row) => nowMinutes >= row.start && nowMinutes < row.end)
    : null;

  if (!rows.length) {
    return (
      <EmptyState light={light} className="min-h-[180px]">
        {locale === 'ru'
          ? 'На этот день нет рабочих слотов. Добавьте график или выберите другой день.'
          : 'No working slots for this day. Add availability or choose another day.'}
      </EmptyState>
    );
  }

  return (
    <Panel light={light} className="overflow-hidden">
      <div className={cn('grid divide-y', divideTone(light))}>
        {rows.map((row) => {
          const rowBookings = bookingsInSlot(bookings, row);
          const state = getSlotState(plan, row, rowBookings);
          const isCurrent = currentRow?.start === row.start && currentRow?.end === row.end;

          return (
            <div
              key={`${row.kind}-${row.start}-${row.end}`}
              className={cn(
                'grid grid-cols-[76px_minmax(0,1fr)] gap-2 px-2 py-2 md:grid-cols-[86px_minmax(0,1fr)] md:px-3',
                isCurrent && (light ? 'bg-black/[0.015]' : 'bg-white/[0.02]'),
              )}
            >
              <div className="flex items-start justify-end pt-1 text-right">
                <div>
                  <div className={cn('text-[11px] font-semibold tabular-nums', pageText(light))}>
                    {formatTime(row.start)}
                  </div>
                  <div className={cn('mt-0.5 text-[9.5px] tabular-nums', faintText(light))}>
                    {formatTime(row.end)}
                  </div>
                </div>
              </div>

              <SlotCell state={state} light={light}>
                {state === 'break' ? (
                  <FreeSlotHint light={light} label={locale === 'ru' ? 'перерыв' : 'break'} />
                ) : rowBookings.length ? (
                  <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                    {rowBookings.map((booking) => (
                      <BookingPill
                        key={booking.id}
                        booking={booking}
                        light={light}
                        locale={locale}
                        selected={selectedBookingId === booking.id}
                        onClick={() => onSelectBooking(booking)}
                      />
                    ))}
                  </div>
                ) : state === 'free' ? (
                  <FreeSlotHint light={light} label={locale === 'ru' ? 'свободно' : 'free'} />
                ) : (
                  <FreeSlotHint light={light} label={locale === 'ru' ? 'вне графика' : 'outside'} />
                )}
              </SlotCell>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function WeekPlanner({
  plans,
  bookings,
  selectedBookingId,
  nowMinutes,
  todayIso,
  light,
  locale,
  onSelectBooking,
  onSelectDate,
}: {
  plans: DayPlan[];
  bookings: CalendarBooking[];
  selectedBookingId: string | null;
  nowMinutes: number;
  todayIso: string;
  light: boolean;
  locale: 'ru' | 'en';
  onSelectBooking: (booking: CalendarBooking) => void;
  onSelectDate: (date: Date) => void;
}) {
  const rows = useMemo(() => buildWeekRows(plans, bookings), [bookings, plans]);
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const plan of plans) {
      map.set(plan.iso, getBookingsForDate(bookings, plan.iso));
    }
    return map;
  }, [bookings, plans]);

  return (
    <Panel light={light} className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1020px]">
          <div
            className={cn('grid border-b', borderTone(light))}
            style={{ gridTemplateColumns: '76px repeat(7, minmax(128px, 1fr))' }}
          >
            <div className={cn('px-3 py-2.5 text-[10.5px] font-medium', mutedText(light))}>
              {locale === 'ru' ? 'Слот' : 'Slot'}
            </div>

            {plans.map((plan) => {
              const count = bookingsByDate.get(plan.iso)?.length ?? 0;
              const isToday = plan.iso === todayIso;

              return (
                <button
                  key={plan.iso}
                  type="button"
                  onClick={() => onSelectDate(plan.date)}
                  className={cn(
                    'border-l px-2.5 py-2 text-left transition-colors duration-150',
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
                      {getShortWeekday(plan.date, locale)}
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
                      {plan.date.getDate()}
                    </span>
                  </div>
                  <div className={cn('mt-1 text-[10px]', faintText(light))}>
                    {plan.isDayOff
                      ? locale === 'ru'
                        ? 'выходной'
                        : 'off'
                      : `${plan.slots.length}/${count}`}
                  </div>
                </button>
              );
            })}
          </div>

          <div className={cn('grid divide-y', divideTone(light))}>
            {rows.map((row) => (
              <div
                key={`${row.start}-${row.end}`}
                className="grid px-2 py-1.5"
                style={{ gridTemplateColumns: '66px repeat(7, minmax(128px, 1fr))' }}
              >
                <div className="flex items-center justify-end pr-2 text-right">
                  <div>
                    <div className={cn('text-[10.5px] font-semibold tabular-nums', pageText(light))}>
                      {formatTime(row.start)}
                    </div>
                    <div className={cn('mt-0.5 text-[9px] tabular-nums', faintText(light))}>
                      {formatTime(row.end)}
                    </div>
                  </div>
                </div>

                {plans.map((plan) => {
                  const dayBookings = bookingsByDate.get(plan.iso) ?? [];
                  const rowBookings = bookingsInSlot(dayBookings, row);
                  const state = getSlotState(plan, row, rowBookings);
                  const isCurrent = plan.iso === todayIso && nowMinutes >= row.start && nowMinutes < row.end;

                  return (
                    <div key={`${plan.iso}-${row.start}-${row.end}`} className="px-1">
                      <SlotCell
                        state={state}
                        light={light}
                        className={cn('min-h-[42px]', isCurrent && 'ring-1 ring-current/20')}
                      >
                        {rowBookings.length ? (
                          <div className="grid gap-1">
                            {rowBookings.slice(0, 2).map((booking) => (
                              <BookingPill
                                key={booking.id}
                                booking={booking}
                                light={light}
                                locale={locale}
                                selected={selectedBookingId === booking.id}
                                compact
                                onClick={() => onSelectBooking(booking)}
                              />
                            ))}
                            {rowBookings.length > 2 ? (
                              <div className={cn('px-1 text-[10px] font-medium', mutedText(light))}>
                                +{rowBookings.length - 2}
                              </div>
                            ) : null}
                          </div>
                        ) : state === 'free' ? (
                          <FreeSlotHint light={light} label={locale === 'ru' ? 'св.' : 'free'} />
                        ) : state === 'break' ? (
                          <FreeSlotHint light={light} label={locale === 'ru' ? 'перерыв' : 'break'} />
                        ) : (
                          <FreeSlotHint light={light} label="—" />
                        )}
                      </SlotCell>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MonthPlanner({
  selectedDate,
  plans,
  bookings,
  todayIso,
  light,
  locale,
  accentColor,
  onSelectBooking,
  onSelectDate,
}: {
  selectedDate: Date;
  plans: DayPlan[];
  bookings: CalendarBooking[];
  todayIso: string;
  light: boolean;
  locale: 'ru' | 'en';
  accentColor: string;
  onSelectBooking: (booking: CalendarBooking) => void;
  onSelectDate: (date: Date) => void;
}) {
  const monthKey = toLocalIsoDate(selectedDate).slice(0, 7);
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const plan of plans) {
      map.set(plan.iso, getBookingsForDate(bookings, plan.iso));
    }
    return map;
  }, [bookings, plans]);

  return (
    <Panel light={light} className="overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {getWeekDates(new Date()).map((date) => (
          <div
            key={getShortWeekday(date, locale)}
            className={cn('border-r px-2.5 py-2 text-[10.5px] font-semibold last:border-r-0', borderTone(light), mutedText(light))}
          >
            {getShortWeekday(date, locale)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {plans.map((plan) => {
          const dayBookings = bookingsByDate.get(plan.iso) ?? [];
          const inMonth = plan.iso.startsWith(monthKey);
          const isToday = plan.iso === todayIso;
          const active = dayBookings.filter(isActiveBooking).length;
          const load = plan.slots.length ? Math.min(100, Math.round((active / plan.slots.length) * 100)) : 0;

          return (
            <button
              key={plan.iso}
              type="button"
              onClick={() => onSelectDate(plan.date)}
              className={cn(
                'min-h-[116px] border-r border-t p-2 text-left transition-colors duration-150 last:border-r-0',
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
              <div className="flex items-center justify-between gap-2">
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
                  {plan.date.getDate()}
                </span>

                <span className={cn('text-[10px] font-medium', faintText(light))}>
                  {plan.isDayOff ? '—' : `${active}/${plan.slots.length}`}
                </span>
              </div>

              <div
                className={cn('mt-2 h-1 overflow-hidden rounded-full', light ? 'bg-black/[0.045]' : 'bg-white/[0.055]')}
              >
                <span
                  style={{ width: `${load}%`, background: accentColor }}
                  className="block h-full rounded-full"
                />
              </div>

              <div className="mt-2 space-y-1">
                {dayBookings.slice(0, 3).map((booking) => (
                  <span
                    key={booking.id}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectBooking(booking);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        onSelectBooking(booking);
                      }
                    }}
                    style={bookingSurfaceStyle(booking.color, light)}
                    className="block rounded-[7px] border px-1.5 py-1"
                  >
                    <span className={cn('block truncate text-[10px] font-semibold', pageText(light))}>
                      {booking.start} · {booking.clientName}
                    </span>
                  </span>
                ))}

                {dayBookings.length > 3 ? (
                  <span className={cn('block pt-0.5 text-[10px] font-medium', mutedText(light))}>
                    +{dayBookings.length - 3}
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
  const tone = statusColor(booking, light);
  const closed = isClosedBooking(booking);

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
          'relative w-full max-w-[430px] overflow-hidden rounded-[18px] border shadow-[0_24px_90px_rgba(0,0,0,0.32)]',
          light ? 'border-black/[0.08] bg-[#fbfbfa]' : 'border-white/[0.09] bg-[#101010]',
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <MicroLabel light={light} active accentColor={tone}>
                <StatusDot light={light} active accentColor={tone} />
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
              <a href={`tel:${booking.phone}`}>
                <PhoneCall className="size-3.5" />
                {locale === 'ru' ? 'Позвонить' : 'Call'}
              </a>
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

            {!closed ? (
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrevious();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }

      if (event.key.toLowerCase() === 't' || event.key.toLowerCase() === 'е') {
        event.preventDefault();
        goToday();
      }

      if (event.key === '1') setView('day');
      if (event.key === '2') setView('week');
      if (event.key === '3') setView('month');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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

  const availability = useMemo(
    () => normalizeAvailabilityDays(workspaceData?.availability ?? dataset?.availability),
    [dataset?.availability, workspaceData?.availability],
  );

  const serviceMap = useMemo(
    () => buildServiceMap(dataset?.services, workspaceData?.services),
    [dataset?.services, workspaceData?.services],
  );

  const calendarBookings = useMemo(
    () =>
      bookings
        .map((booking) => mapBooking(booking, serviceMap, accentColor, publicAccentColor))
        .sort((left, right) => `${left.date}T${left.start}`.localeCompare(`${right.date}T${right.start}`)),
    [accentColor, bookings, publicAccentColor, serviceMap],
  );

  const visibleDates = useMemo(() => getVisibleDates(view, selectedDate), [selectedDate, view]);
  const visiblePlans = useMemo(
    () => visibleDates.map((date) => getDayPlan(date, availability)),
    [availability, visibleDates],
  );
  const visibleDateSet = useMemo(
    () => new Set(visiblePlans.map((plan) => plan.iso)),
    [visiblePlans],
  );
  const visibleBookings = useMemo(
    () => calendarBookings.filter((booking) => visibleDateSet.has(booking.date)),
    [calendarBookings, visibleDateSet],
  );
  const selectedPlan = useMemo(
    () => getDayPlan(selectedDate, availability),
    [availability, selectedDate],
  );
  const selectedDayBookings = useMemo(
    () => getBookingsForDate(calendarBookings, selectedPlan.iso),
    [calendarBookings, selectedPlan.iso],
  );
  const selectedBooking = useMemo(
    () => calendarBookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [calendarBookings, selectedBookingId],
  );
  const rangeTitle = useMemo(
    () => formatRangeTitle(view, selectedDate, locale),
    [locale, selectedDate, view],
  );
  const metrics = useMemo(
    () => buildMetrics(visibleBookings, visiblePlans, todayIso, nowMinutes),
    [nowMinutes, todayIso, visibleBookings, visiblePlans],
  );

  const copy =
    locale === 'ru'
      ? {
          title: 'Сегодня',
          description:
            'Профессиональный календарь по реальным слотам: свободно, занято, перерыв и записи в одном рабочем экране.',
          createTitle: 'Сначала настройте профиль мастера',
          createDescription:
            'Создайте профиль, чтобы открыть календарь, реальные слоты, записи и быстрые действия.',
          createProfile: 'Создать профиль',
          profileMissing: 'Профиль не настроен',
          calendar: 'Рабочий календарь',
          calendarDescription: 'Сетка построена по графику мастера. Клик по записи открывает карточку.',
          today: 'Сегодня',
          day: 'День',
          week: 'Неделя',
          month: 'Месяц',
          live: 'Рабочий режим',
          demo: 'Демо',
          selectedDay: 'Выбранный день',
          selectedWeek: 'Выбранная неделя',
          selectedMonth: 'Выбранный месяц',
          slots: 'Слоты',
          busy: 'Занято',
          free: 'Свободно',
          load: 'Загрузка',
          revenue: 'Выручка',
          next: 'Ближайшая',
          noNext: 'пока пусто',
          slotUnit: 'по графику',
          monthHint: 'Нажмите на день, чтобы открыть его расписание.',
          setupCards: {
            calendar: 'Реальные слоты',
            calendarText: 'Календарь строится из графика мастера, а не из случайной сетки часов.',
            clients: 'Карточка записи',
            clientsText: 'Контакты, комментарии, сумма и быстрые статусы в одном мини-окне.',
            public: 'Онлайн-запись',
            publicText: 'Клиенты видят только доступные слоты и не попадают вне графика.',
          },
        }
      : {
          title: 'Today',
          description:
            'Professional real-slot calendar: free, busy, breaks, and bookings in one work screen.',
          createTitle: 'Create the master profile first',
          createDescription:
            'Create a profile to unlock calendar, real slots, bookings, and quick actions.',
          createProfile: 'Create profile',
          profileMissing: 'Profile missing',
          calendar: 'Work calendar',
          calendarDescription: 'The grid is built from master availability. Click a booking to open its card.',
          today: 'Today',
          day: 'Day',
          week: 'Week',
          month: 'Month',
          live: 'Work mode',
          demo: 'Demo',
          selectedDay: 'Selected day',
          selectedWeek: 'Selected week',
          selectedMonth: 'Selected month',
          slots: 'Slots',
          busy: 'Busy',
          free: 'Free',
          load: 'Load',
          revenue: 'Revenue',
          next: 'Next',
          noNext: 'empty',
          slotUnit: 'from schedule',
          monthHint: 'Click a day to open its schedule.',
          setupCards: {
            calendar: 'Real slots',
            calendarText: 'The calendar uses master availability, not a random hour grid.',
            clients: 'Booking card',
            clientsText: 'Contacts, notes, amount, and quick statuses in one small sheet.',
            public: 'Online booking',
            publicText: 'Clients see only available slots and do not land outside schedule.',
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

              <p className={cn('mt-2 max-w-[720px] text-[13px] leading-5', mutedText(isLight))}>
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
                    {copy.calendar}
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
                    {locale === 'ru' ? 'Детали' : 'Details'}
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
                    {locale === 'ru' ? 'Публичная' : 'Public'}
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
          <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <h1
                className={cn(
                  'text-[28px] font-semibold tracking-[-0.075em] md:text-[36px]',
                  pageText(isLight),
                )}
              >
                {copy.title}
              </h1>

              <p className={cn('mt-1.5 max-w-[780px] text-[13px] leading-5', mutedText(isLight))}>
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
                  className={iconButtonBase(isLight)}
                  aria-label={locale === 'ru' ? 'Перейти к текущему периоду' : 'Go to current period'}
                  title={locale === 'ru' ? 'Текущий период' : 'Current period'}
                >
                  <CalendarClock className="size-4" />
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
                        ? copy.selectedDay
                        : view === 'week'
                          ? copy.selectedWeek
                          : copy.selectedMonth}
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

                  <div className="grid gap-2 sm:grid-cols-2 xl:w-[680px] xl:grid-cols-5">
                    <MetricTile label={copy.slots} value={metrics.slots} hint={copy.slotUnit} light={isLight} />
                    <MetricTile label={copy.busy} value={metrics.busy} hint={locale === 'ru' ? 'записей' : 'bookings'} light={isLight} />
                    <MetricTile label={copy.free} value={metrics.free} hint={locale === 'ru' ? 'окон' : 'windows'} light={isLight} />
                    <MetricTile label={copy.load} value={`${metrics.load}%`} hint={locale === 'ru' ? 'занятости' : 'occupied'} light={isLight} />
                    <MetricTile
                      label={copy.next}
                      value={metrics.next?.start ?? '—'}
                      hint={metrics.next ? `${metrics.next.clientName} · ${metrics.next.service}` : copy.noNext}
                      light={isLight}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card light={isLight}>
              <CardTitle
                title={copy.calendar}
                description={view === 'month' ? copy.monthHint : copy.calendarDescription}
                light={isLight}
              />

              <div className="p-3 md:p-4">
                {view === 'day' ? (
                  <DayPlanner
                    plan={selectedPlan}
                    bookings={selectedDayBookings}
                    selectedBookingId={selectedBookingId}
                    nowMinutes={nowMinutes}
                    todayIso={todayIso}
                    light={isLight}
                    locale={locale}
                    onSelectBooking={(booking) => setSelectedBookingId(booking.id)}
                  />
                ) : null}

                {view === 'week' ? (
                  <WeekPlanner
                    plans={visiblePlans}
                    bookings={visibleBookings}
                    selectedBookingId={selectedBookingId}
                    nowMinutes={nowMinutes}
                    todayIso={todayIso}
                    light={isLight}
                    locale={locale}
                    onSelectBooking={(booking) => setSelectedBookingId(booking.id)}
                    onSelectDate={handleSelectDate}
                  />
                ) : null}

                {view === 'month' ? (
                  <MonthPlanner
                    selectedDate={selectedDate}
                    plans={visiblePlans}
                    bookings={visibleBookings}
                    todayIso={todayIso}
                    light={isLight}
                    locale={locale}
                    accentColor={accentColor}
                    onSelectBooking={(booking) => setSelectedBookingId(booking.id)}
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
