'use client';

import type * as React from 'react';
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  LayoutDashboard,
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Scissors,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  Users2,
  X,
  XCircle,
} from 'lucide-react';

type Json = Record<string, unknown>;

type Screen =
  | 'today'
  | 'schedule'
  | 'services'
  | 'chats'
  | 'chat'
  | 'more'
  | 'clients'
  | 'analytics'
  | 'profile'
  | 'settings';

type BookingStatus = 'new' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
type DayStatus = 'workday' | 'short' | 'day-off';
type ServiceStatus = 'active' | 'seasonal' | 'draft';
type ClientSegment = 'all' | 'vip' | 'transfer' | 'no_show' | 'new';

type Profile = {
  id: string;
  slug: string;
  name: string;
  profession: string;
  city: string;
  bio: string;
  phone: string;
  telegram: string;
  whatsapp: string;
  services: string[];
};

type Booking = {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  comment: string;
  createdAt: string;
  priceAmount: number;
  source: string;
  channel: string;
  transferRequested: boolean;
  transferReason: string;
  transferRequestedAt: string;
  transferStatus: 'none' | 'requested' | 'accepted' | 'declined' | 'done';
  clientNote: string;
};

type Service = {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  status: ServiceStatus;
  visible: boolean;
};

type WorkDay = {
  id: string;
  label: string;
  short: string;
  weekdayIndex: number;
  status: DayStatus;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
};

type ChatMessage = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

type ChatThread = {
  id: string;
  clientName: string;
  clientPhone: string;
  channel: string;
  unreadCount: number;
  messages: ChatMessage[];
  lastMessage: string;
  updatedAt: string;
};

type Client = {
  id: string;
  name: string;
  phone: string;
  visits: number;
  revenue: number;
  lastVisit: string;
  note: string;
  favorite: boolean;
  bookingsCount: number;
  transferCount: number;
  noShowCount: number;
  cancelledCount: number;
  lastStatus: BookingStatus;
  hasTransferRequest: boolean;
  lastService: string;
};

type MiniSettings = {
  publicBookingEnabled: boolean;
  autoConfirmBookings: boolean;
  allowClientReschedule: boolean;
  reschedulePolicy: string;
  reminderBeforeHours: number;
  reminderTelegram: boolean;
  reminderVk: boolean;
  reminderWeb: boolean;
  noShowAction: 'keep' | 'sleep' | 'blacklist_note';
  bookingNotice: string;
};

type QuickBookingPreset = {
  clientName?: string;
  clientPhone?: string;
  service?: string;
  date?: string;
  time?: string;
  comment?: string;
};

type TgWindow = Window & {
  Telegram?: {
    WebApp?: {
      initData?: string;
      ready?: () => void;
      expand?: () => void;
    };
  };
};

const DEFAULT_PROFILE: Profile = {
  id: 'profile',
  slug: 'master',
  name: '',
  profession: '',
  city: '',
  bio: '',
  phone: '',
  telegram: '',
  whatsapp: '',
  services: [],
};

const DEFAULT_SETTINGS: MiniSettings = {
  publicBookingEnabled: true,
  autoConfirmBookings: false,
  allowClientReschedule: true,
  reschedulePolicy: 'Клиент может запросить перенос. Мастер подтверждает новое время вручную.',
  reminderBeforeHours: 3,
  reminderTelegram: true,
  reminderVk: true,
  reminderWeb: true,
  noShowAction: 'sleep',
  bookingNotice: 'Пожалуйста, приходите вовремя. Если нужно перенести запись — напишите заранее.',
};

const DEFAULT_WEEK: WorkDay[] = [
  { id: 'mon', label: 'Понедельник', short: 'Пн', weekdayIndex: 0, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'tue', label: 'Вторник', short: 'Вт', weekdayIndex: 1, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'wed', label: 'Среда', short: 'Ср', weekdayIndex: 2, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'thu', label: 'Четверг', short: 'Чт', weekdayIndex: 3, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'fri', label: 'Пятница', short: 'Пт', weekdayIndex: 4, status: 'workday', start: '10:00', end: '19:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'sat', label: 'Суббота', short: 'Сб', weekdayIndex: 5, status: 'short', start: '11:00', end: '17:00', breakStart: '', breakEnd: '' },
  { id: 'sun', label: 'Воскресенье', short: 'Вс', weekdayIndex: 6, status: 'day-off', start: '11:00', end: '16:00', breakStart: '', breakEnd: '' },
];

const STATUS_LABEL: Record<BookingStatus, string> = {
  new: 'Новая',
  confirmed: 'В плане',
  completed: 'Пришла',
  no_show: 'Не пришла',
  cancelled: 'Отмена',
};

const STATUS_DOT: Record<BookingStatus, string> = {
  new: '#9fbdf6',
  confirmed: '#c8b98f',
  completed: '#96d2aa',
  no_show: '#e2b169',
  cancelled: '#e59b9b',
};

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ');
}

function obj(value: unknown): Json {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : {};
}

function list<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function len(value: unknown) {
  return Array.isArray(value) || typeof value === 'string' ? value.length : 0;
}

function text(value: unknown, fallback = '') {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function bool(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'да'].includes(normalized)) return true;
    if (['false', '0', 'no', 'нет'].includes(normalized)) return false;
  }
  return fallback;
}

function moneyNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  const parsed = Number(
    String(value ?? '')
      .replace(/[^\d.,-]/g, '')
      .replace(',', '.'),
  );

  return Number.isFinite(parsed) ? parsed : fallback;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function today() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function weekdayIndexFromDate(date: string) {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return 0;
  return (d.getDay() + 6) % 7;
}

function dateLabel(value: string, long = false) {
  const safe = text(value, today()).slice(0, 10);
  const d = new Date(`${safe}T12:00:00`);

  if (Number.isNaN(d.getTime())) return safe;

  return d.toLocaleDateString('ru-RU', {
    weekday: long ? 'long' : 'short',
    day: 'numeric',
    month: 'short',
  });
}

function timeLabel(value: unknown) {
  const raw = text(value, '10:00');
  return /^\d{2}:\d{2}/.test(raw) ? raw.slice(0, 5) : '10:00';
}

function timeFromDate(value: unknown) {
  const raw = text(value);
  const d = raw ? new Date(raw) : null;

  if (!d || Number.isNaN(d.getTime())) return '';

  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function rub(value: unknown) {
  return `${Math.round(moneyNumber(value)).toLocaleString('ru-RU')} ₽`;
}

function initials(value: unknown) {
  const raw = text(value, 'Клиент');
  const parts = raw.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();

  return raw.slice(0, 2).toUpperCase();
}

function slugify(value: unknown) {
  const raw = text(value, 'master').toLowerCase();
  const latin = raw
    .replace(/[а]/g, 'a').replace(/[б]/g, 'b').replace(/[в]/g, 'v').replace(/[г]/g, 'g')
    .replace(/[д]/g, 'd').replace(/[её]/g, 'e').replace(/[ж]/g, 'zh').replace(/[з]/g, 'z')
    .replace(/[и]/g, 'i').replace(/[й]/g, 'y').replace(/[к]/g, 'k').replace(/[л]/g, 'l')
    .replace(/[м]/g, 'm').replace(/[н]/g, 'n').replace(/[о]/g, 'o').replace(/[п]/g, 'p')
    .replace(/[р]/g, 'r').replace(/[с]/g, 's').replace(/[т]/g, 't').replace(/[у]/g, 'u')
    .replace(/[ф]/g, 'f').replace(/[х]/g, 'h').replace(/[ц]/g, 'c').replace(/[ч]/g, 'ch')
    .replace(/[ш]/g, 'sh').replace(/[щ]/g, 'sch').replace(/[ы]/g, 'y').replace(/[э]/g, 'e')
    .replace(/[ю]/g, 'yu').replace(/[я]/g, 'ya').replace(/[ьъ]/g, '');

  return latin
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'master';
}

function toMinutes(value: string) {
  const [hours, minutes] = timeLabel(value).split(':').map((part) => Number(part));
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function fromMinutes(value: number) {
  const safe = Math.max(0, Math.min(24 * 60, Math.round(value)));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function normalizeStatus(value: unknown): BookingStatus {
  return value === 'confirmed' ||
    value === 'completed' ||
    value === 'no_show' ||
    value === 'cancelled' ||
    value === 'new'
    ? value
    : 'new';
}

function normalizeProfile(value: unknown): Profile | null {
  const row = obj(value);
  const name = text(row.name ?? row.title ?? row.masterName);

  if (!name && Object.keys(row).length === 0) return null;

  const serviceNames = list(row.services)
    .map((item) => (typeof item === 'string' ? item : text(obj(item).name ?? obj(item).title)))
    .filter(Boolean);

  return {
    id: text(row.id, 'profile'),
    slug: slugify(row.slug || name || 'master'),
    name: name || 'Мастер',
    profession: text(row.profession ?? row.specialization, 'Специалист'),
    city: text(row.city, ''),
    bio: text(row.bio ?? row.description, 'Онлайн-запись через КликБук'),
    phone: text(row.phone),
    telegram: text(row.telegram),
    whatsapp: text(row.whatsapp),
    services: serviceNames,
  };
}

function normalizeBooking(value: unknown, index: number): Booking | null {
  const row = obj(value);

  if (Object.keys(row).length === 0) return null;

  const metadata = obj(row.metadata);
  const transfer = obj(row.transfer ?? row.reschedule ?? row.rescheduleRequest ?? metadata.transfer ?? metadata.reschedule);
  const date = text(row.date, today()).slice(0, 10);
  const time = timeLabel(row.time);

  const transferRequested =
    bool(row.transferRequested) ||
    bool(row.transfer_requested) ||
    bool(row.rescheduleRequested) ||
    bool(row.reschedule_requested) ||
    bool(metadata.transferRequested) ||
    bool(metadata.rescheduleRequested) ||
    text(transfer.status) === 'requested' ||
    text(row.status) === 'transfer_requested';

  const rawTransferStatus = text(
    row.transferStatus ??
      row.transfer_status ??
      row.rescheduleStatus ??
      row.reschedule_status ??
      transfer.status ??
      metadata.transferStatus ??
      metadata.rescheduleStatus,
    transferRequested ? 'requested' : 'none',
  );

  return {
    id: text(row.id, `booking-${index}-${date}-${time}`),
    clientName: text(row.clientName ?? row.client_name ?? row.name, 'Клиент'),
    clientPhone: text(row.clientPhone ?? row.client_phone ?? row.phone),
    service: text(row.service ?? row.serviceName ?? row.service_name, 'Услуга'),
    date,
    time,
    status: normalizeStatus(row.status),
    comment: text(row.comment),
    createdAt: text(row.createdAt ?? row.created_at, new Date().toISOString()),
    priceAmount: moneyNumber(row.priceAmount ?? row.price_amount, 0),
    source: text(row.source, 'Mini App'),
    channel: text(row.channel ?? row.sourceChannel ?? row.source_channel, 'web'),
    transferRequested,
    transferReason: text(
      row.transferReason ??
        row.transfer_reason ??
        row.rescheduleReason ??
        row.reschedule_reason ??
        transfer.reason ??
        metadata.transferReason,
    ),
    transferRequestedAt: text(
      row.transferRequestedAt ??
        row.transfer_requested_at ??
        row.rescheduleRequestedAt ??
        row.reschedule_requested_at ??
        transfer.createdAt ??
        transfer.created_at ??
        metadata.transferRequestedAt,
    ),
    transferStatus:
      rawTransferStatus === 'accepted' ||
      rawTransferStatus === 'declined' ||
      rawTransferStatus === 'done' ||
      rawTransferStatus === 'requested'
        ? rawTransferStatus
        : rawTransferStatus === 'offered'
          ? 'requested'
          : 'none',
    clientNote: text(row.clientNote ?? row.client_note ?? metadata.clientNote),
  };
}

function normalizeServices(profile: Profile | null, data: Json): Service[] {
  const stored = list(data.services)
    .map((item, index) => {
      const row = obj(item);
      const name = text(row.name ?? row.title ?? row.service);

      if (!name) return null;

      const rawStatus = text(row.status, 'active');

      return {
        id: text(row.id, `service-${index}-${slugify(name)}`),
        name,
        category: text(row.category, 'Основное'),
        duration: Math.max(15, moneyNumber(row.duration ?? row.durationMinutes ?? row.duration_minutes, 60)),
        price: Math.max(0, moneyNumber(row.price ?? row.priceAmount ?? row.price_amount, 0)),
        status: (rawStatus === 'draft' || rawStatus === 'seasonal' ? rawStatus : 'active') as ServiceStatus,
        visible: row.visible === false ? false : true,
      } satisfies Service;
    })
    .filter((item): item is Service => Boolean(item));

  if (len(stored) > 0) return stored;

  return list<string>(profile?.services).map((name, index) => ({
    id: `profile-service-${index}-${slugify(name)}`,
    name,
    category: 'Основное',
    duration: 60,
    price: 0,
    status: 'active',
    visible: true,
  }));
}

function normalizeWeek(data: Json): WorkDay[] {
  const stored = list(data.availability);

  if (len(stored) === 0) return DEFAULT_WEEK;

  return DEFAULT_WEEK.map((base) => {
    const found = stored.find((item) => {
      const row = obj(item);

      return text(row.id) === base.id ||
        moneyNumber(row.weekdayIndex ?? row.weekday_index, -1) === base.weekdayIndex;
    });

    if (!found) return base;

    const row = obj(found);
    const rawStatus = text(row.status, base.status);

    const slots = list<string>(row.slots);
    const firstSlot = slots[0] ?? '';
    const lastSlot = slots[slots.length - 1] ?? '';
    const firstStart = firstSlot.includes('–') ? firstSlot.split('–')[0] : '';
    const lastEnd = lastSlot.includes('–') ? lastSlot.split('–')[1] : '';
    const breaks = list<string>(row.breaks);
    const firstBreak = breaks[0] ?? '';
    const breakStart = firstBreak.includes('–') ? firstBreak.split('–')[0] : '';
    const breakEnd = firstBreak.includes('–') ? firstBreak.split('–')[1] : '';

    return {
      ...base,
      status: (rawStatus === 'day-off' || rawStatus === 'short' ? rawStatus : 'workday') as DayStatus,
      start: timeLabel((row.start ?? row.startTime ?? row.start_time ?? firstStart) || base.start),
      end: timeLabel((row.end ?? row.endTime ?? row.end_time ?? lastEnd) || base.end),
      breakStart: text(row.breakStart ?? row.break_start ?? breakStart)
        ? timeLabel(row.breakStart ?? row.break_start ?? breakStart)
        : '',
      breakEnd: text(row.breakEnd ?? row.break_end ?? breakEnd)
        ? timeLabel(row.breakEnd ?? row.break_end ?? breakEnd)
        : '',
    };
  });
}

function normalizeThread(value: unknown, index: number): ChatThread {
  const row = obj(value);

  const messages = list(row.messages)
    .map((message, messageIndex) => {
      const msg = obj(message);

      return {
        id: text(msg.id, `msg-${index}-${messageIndex}`),
        author: text(msg.author, 'client'),
        body: text(msg.body ?? msg.text ?? msg.message),
        createdAt: text(msg.createdAt ?? msg.created_at, new Date().toISOString()),
      } satisfies ChatMessage;
    })
    .filter((message) => Boolean(message.body));

  const last = messages[messages.length - 1];

  return {
    id: text(row.id, `thread-${index}`),
    clientName: text(row.clientName ?? row.client_name ?? row.name, 'Клиент'),
    clientPhone: text(row.clientPhone ?? row.client_phone ?? row.phone),
    channel: text(row.channel, 'Web'),
    unreadCount: moneyNumber(row.unreadCount ?? row.unread_count, 0),
    messages,
    lastMessage: text(row.lastMessage ?? row.last_message, last?.body || 'Диалог без сообщений'),
    updatedAt: text(row.updatedAt ?? row.updated_at, last?.createdAt || new Date().toISOString()),
  };
}

function normalizeSettings(data: Json): MiniSettings {
  const source = obj(data.settings ?? data.miniSettings ?? data.bookingSettings ?? {});
  const reminders = obj(source.reminders ?? source.reminderChannels ?? {});

  const rawNoShow = text(source.noShowAction, DEFAULT_SETTINGS.noShowAction);

  return {
    publicBookingEnabled: bool(source.publicBookingEnabled ?? source.public_booking_enabled, DEFAULT_SETTINGS.publicBookingEnabled),
    autoConfirmBookings: bool(source.autoConfirmBookings ?? source.auto_confirm_bookings, DEFAULT_SETTINGS.autoConfirmBookings),
    allowClientReschedule: bool(source.allowClientReschedule ?? source.allow_client_reschedule, DEFAULT_SETTINGS.allowClientReschedule),
    reschedulePolicy: text(source.reschedulePolicy ?? source.reschedule_policy, DEFAULT_SETTINGS.reschedulePolicy),
    reminderBeforeHours: Math.max(1, moneyNumber(source.reminderBeforeHours ?? source.reminder_before_hours, DEFAULT_SETTINGS.reminderBeforeHours)),
    reminderTelegram: bool(reminders.telegram ?? source.reminderTelegram, DEFAULT_SETTINGS.reminderTelegram),
    reminderVk: bool(reminders.vk ?? source.reminderVk, DEFAULT_SETTINGS.reminderVk),
    reminderWeb: bool(reminders.web ?? source.reminderWeb, DEFAULT_SETTINGS.reminderWeb),
    noShowAction:
      rawNoShow === 'keep' || rawNoShow === 'blacklist_note' || rawNoShow === 'sleep'
        ? rawNoShow
        : DEFAULT_SETTINGS.noShowAction,
    bookingNotice: text(source.bookingNotice ?? source.booking_notice, DEFAULT_SETTINGS.bookingNotice),
  };
}

function buildClients(bookings: Booking[], services: Service[]): Client[] {
  const prices = new Map(services.map((service) => [service.name, service.price]));
  const map = new Map<string, Client>();

  for (const booking of bookings) {
    const key = booking.clientPhone || booking.clientName;

    if (!key) continue;

    const prev = map.get(key);
    const isCompleted = booking.status === 'completed';
    const isNoShow = booking.status === 'no_show';
    const isCancelled = booking.status === 'cancelled';
    const revenue = isCompleted ? booking.priceAmount || prices.get(booking.service) || 0 : 0;
    const lastVisit = `${booking.date} ${booking.time}`;
    const isNewer = !prev || lastVisit > prev.lastVisit;

    map.set(key, {
      id: key,
      name: booking.clientName,
      phone: booking.clientPhone,
      visits: (prev?.visits ?? 0) + (isCompleted ? 1 : 0),
      revenue: (prev?.revenue ?? 0) + revenue,
      lastVisit: isNewer ? lastVisit : prev?.lastVisit ?? lastVisit,
      note: prev?.note || booking.clientNote || booking.comment,
      favorite: prev?.favorite || revenue > 0,
      bookingsCount: (prev?.bookingsCount ?? 0) + 1,
      transferCount: (prev?.transferCount ?? 0) + (booking.transferRequested ? 1 : 0),
      noShowCount: (prev?.noShowCount ?? 0) + (isNoShow ? 1 : 0),
      cancelledCount: (prev?.cancelledCount ?? 0) + (isCancelled ? 1 : 0),
      lastStatus: isNewer ? booking.status : prev?.lastStatus ?? booking.status,
      hasTransferRequest: Boolean(prev?.hasTransferRequest || booking.transferRequested),
      lastService: isNewer ? booking.service : prev?.lastService ?? booking.service,
    });
  }

  return Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
}

function buildSlots(date: string, week: WorkDay[], services: Service[], bookings: Booking[]) {
  const day = week.find((item) => item.weekdayIndex === weekdayIndexFromDate(date)) ?? DEFAULT_WEEK[0];

  if (day.status === 'day-off') return [];

  const activeServices = services.filter((service) => service.visible && service.status !== 'draft');
  const step = Math.max(30, Math.min(120, activeServices[0]?.duration || 60));
  const start = toMinutes(day.start);
  const end = toMinutes(day.end);
  const breakStart = day.breakStart ? toMinutes(day.breakStart) : -1;
  const breakEnd = day.breakEnd ? toMinutes(day.breakEnd) : -1;
  const busy = new Set(
    bookings
      .filter((booking) => booking.date === date && booking.status !== 'cancelled')
      .map((booking) => booking.time),
  );

  const slots: Array<{ time: string; busy: boolean; breakTime: boolean }> = [];

  for (let current = start; current + step <= end; current += step) {
    const time = fromMinutes(current);
    const inBreak = breakStart >= 0 && breakEnd >= 0 && current >= breakStart && current < breakEnd;

    slots.push({
      time,
      busy: busy.has(time),
      breakTime: inBreak,
    });
  }

  return slots;
}

async function parseJson(response: Response): Promise<Json> {
  const body = await response.text().catch(() => '');

  if (!body) return {};

  try {
    return obj(JSON.parse(body));
  } catch {
    return { error: body };
  }
}

function storedToken() {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem('clickbook_app_session_token') || '';
  } catch {
    return '';
  }
}

function apiHeaders(json = false) {
  const token = storedToken();

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'X-ClickBook-App-Session': token } : {}),
  };
}

async function authorizeTelegram() {
  if (typeof window === 'undefined') return;

  const webApp = (window as TgWindow).Telegram?.WebApp;
  const initData = text(webApp?.initData);

  try {
    webApp?.ready?.();
  } catch {}

  try {
    webApp?.expand?.();
  } catch {}

  if (!initData) return;

  const response = await fetch('/api/auth/telegram-miniapp', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData }),
  }).catch(() => null);

  if (!response?.ok) return;

  const payload = await parseJson(response);
  const token = text(payload.appSessionToken ?? payload.app_session_token ?? payload.token);

  if (!token) return;

  try {
    window.localStorage.setItem('clickbook_app_session_token', token);
  } catch {}
}

function isLightTheme() {
  if (typeof document === 'undefined') return false;

  return !document.documentElement.classList.contains('dark') &&
    !document.body.classList.contains('dark');
}

function getAccent(data: Json) {
  const appearance = obj(data.appearance);

  return text(appearance.accentColor ?? appearance.accent ?? data.accentColor, '#d7c7aa');
}

function ui(light: boolean) {
  return {
    page: light ? 'bg-[#f4f4f2] text-[#090909]' : 'bg-[#090909] text-white',
    card: light
      ? 'border-black/[0.08] bg-[#fbfbfa] text-[#090909]'
      : 'border-white/[0.08] bg-[#101010] text-white',
    panel: light
      ? 'border-black/[0.07] bg-black/[0.025]'
      : 'border-white/[0.08] bg-white/[0.035]',
    input: light
      ? 'border-black/[0.08] bg-white/75 text-black placeholder:text-black/35'
      : 'border-white/[0.09] bg-white/[0.055] text-white placeholder:text-white/35',
    ghost: light
      ? 'border-black/[0.08] bg-white/60 text-black'
      : 'border-white/[0.09] bg-white/[0.055] text-white',
    muted: light ? 'text-black/48' : 'text-white/45',
    soft: light ? 'text-black/62' : 'text-white/62',
    divider: light ? 'border-black/[0.07]' : 'border-white/[0.08]',
  };
}

function Logo({ light }: { light: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cx(
          'grid size-8 place-items-center rounded-[10px] border',
          light ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-white/[0.04]',
        )}
      >
        <div className={cx('size-3.5 rounded-[4px] border', light ? 'border-black' : 'border-white')} />
      </div>
      <div className="text-[15px] font-semibold tracking-[-0.06em]">КликБук</div>
    </div>
  );
}

function Card({
  light,
  className,
  children,
}: {
  light: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx('rounded-[14px] border shadow-none', ui(light).card, className)}>{children}</div>;
}

function Micro({ children }: { children: ReactNode }) {
  return <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">{children}</div>;
}

function Button({
  light,
  primary,
  danger,
  className,
  children,
  disabled,
  onClick,
}: {
  light: boolean;
  primary?: boolean;
  danger?: boolean;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-3 text-[12px] font-bold transition active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45',
        primary
          ? light
            ? 'border-black bg-black text-white'
            : 'border-white bg-white text-black'
          : danger
            ? light
              ? 'border-rose-300/40 bg-rose-50 text-rose-700'
              : 'border-rose-300/15 bg-rose-400/10 text-rose-100'
            : ui(light).ghost,
        className,
      )}
    >
      {children}
    </button>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { light: boolean }) {
  const { light, className, ...rest } = props;

  return (
    <input
      {...rest}
      className={cx(
        'h-10 w-full rounded-[10px] border px-3 text-[13px] font-medium outline-none',
        ui(light).input,
        className,
      )}
    />
  );
}

function Area(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { light: boolean }) {
  const { light, className, ...rest } = props;

  return (
    <textarea
      {...rest}
      className={cx(
        'min-h-[84px] w-full resize-none rounded-[10px] border px-3 py-2 text-[13px] font-medium leading-5 outline-none',
        ui(light).input,
        className,
      )}
    />
  );
}

function Empty({ light, title, text: body }: { light: boolean; title: string; text: string }) {
  return (
    <div className={cx('rounded-[12px] border p-4 text-center', ui(light).panel)}>
      <div className="text-[13px] font-bold tracking-[-0.03em]">{title}</div>
      <div className={cx('mt-1 text-[11px] leading-4', ui(light).muted)}>{body}</div>
    </div>
  );
}

function Stat({ light, label, value }: { light: boolean; label: string; value: string }) {
  return (
    <div className={cx('rounded-[11px] border p-3', ui(light).panel)}>
      <div className={cx('text-[10px] font-bold uppercase tracking-[0.14em]', ui(light).muted)}>{label}</div>
      <div className="mt-1 truncate text-[17px] font-semibold tracking-[-0.06em]">{value}</div>
    </div>
  );
}

function Badge({
  light,
  children,
  tone = 'neutral',
}: {
  light: boolean;
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent';
}) {
  const className =
    tone === 'success'
      ? light
        ? 'border-emerald-300/35 bg-emerald-50 text-emerald-700'
        : 'border-emerald-300/15 bg-emerald-400/10 text-emerald-100'
      : tone === 'warning'
        ? light
          ? 'border-amber-300/35 bg-amber-50 text-amber-700'
          : 'border-amber-300/15 bg-amber-400/10 text-amber-100'
        : tone === 'danger'
          ? light
            ? 'border-rose-300/35 bg-rose-50 text-rose-700'
            : 'border-rose-300/15 bg-rose-400/10 text-rose-100'
          : tone === 'accent'
            ? light
              ? 'border-black/[0.08] bg-black text-white'
              : 'border-white/[0.12] bg-white text-black'
            : light
              ? 'border-black/[0.08] bg-white/70 text-black/65'
              : 'border-white/[0.09] bg-white/[0.055] text-white/65';

  return (
    <span className={cx('inline-flex h-6 items-center rounded-full border px-2 text-[10px] font-bold', className)}>
      {children}
    </span>
  );
}

function BookingBadges({ light, booking }: { light: boolean; booking: Booking }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {booking.transferRequested ? <Badge light={light} tone="warning">Просит перенос</Badge> : null}
      {booking.status === 'new' ? <Badge light={light} tone="accent">Новая</Badge> : null}
      {booking.status === 'confirmed' ? <Badge light={light}>В плане</Badge> : null}
      {booking.status === 'completed' ? <Badge light={light} tone="success">Пришла</Badge> : null}
      {booking.status === 'no_show' ? <Badge light={light} tone="warning">Не пришла</Badge> : null}
      {booking.status === 'cancelled' ? <Badge light={light} tone="danger">Отмена</Badge> : null}
      {booking.channel ? <Badge light={light}>{booking.channel}</Badge> : null}
    </div>
  );
}

function Shell({
  light,
  accent,
  profile,
  screen,
  setScreen,
  refresh,
  children,
}: {
  light: boolean;
  accent: string;
  profile: Profile;
  screen: Screen;
  setScreen: (value: Screen) => void;
  refresh: () => void;
  children: ReactNode;
}) {
  const t = ui(light);
  const isChatOpen = screen === 'chat';

  const tabs: Array<{ id: Screen; label: string; icon: ReactNode }> = [
    { id: 'today', label: 'Сегодня', icon: <CalendarClock className="size-4" /> },
    { id: 'schedule', label: 'График', icon: <Clock3 className="size-4" /> },
    { id: 'chats', label: 'Чаты', icon: <MessageCircle className="size-4" /> },
    { id: 'clients', label: 'Клиенты', icon: <Users2 className="size-4" /> },
    { id: 'more', label: 'Ещё', icon: <Settings className="size-4" /> },
  ];

  return (
    <main
      className={cx(
        'min-h-screen overflow-x-hidden pt-[calc(var(--tg-safe-top,0px)+8px)]',
        isChatOpen ? 'pb-0' : 'pb-[calc(84px+var(--tg-safe-bottom,0px))]',
        t.page,
      )}
      style={{ '--mini-accent': accent } as CSSProperties}
    >
      <div className={cx('mx-auto flex w-full max-w-[460px] flex-col gap-3 px-3', isChatOpen ? 'px-0' : '')}>
        {!isChatOpen ? (
          <header className="sticky top-0 z-20 -mx-3 bg-inherit px-3 pb-2 pt-[calc(var(--tg-safe-top,0px)+8px)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Logo light={light} />
                <div className={cx('mt-1 truncate text-[10px] font-semibold', t.muted)}>
                  {profile.name || 'Мастер'} · {profile.profession || 'Mini app'}
                </div>
              </div>
              <button
                type="button"
                onClick={refresh}
                className={cx('grid size-9 place-items-center rounded-[10px] border', t.ghost)}
              >
                <RefreshCcw className="size-4" />
              </button>
            </div>
          </header>
        ) : null}

        {children}
      </div>

      {!isChatOpen ? (
        <nav
          className={cx(
            'fixed inset-x-0 bottom-0 z-40 border-t px-3 pb-[calc(var(--tg-safe-bottom,0px)+8px)] pt-2 backdrop-blur-[20px]',
            light ? 'border-black/[0.08] bg-[#f4f4f2]/92' : 'border-white/[0.08] bg-[#090909]/92',
          )}
        >
          <div className="mx-auto grid max-w-[460px] grid-cols-5 gap-1">
            {tabs.map((tab) => {
              const currentScreen = screen as string;
              const currentTab = tab.id as string;
              const active = currentTab === 'chats'
                ? currentScreen === 'chats' || currentScreen === 'chat'
                : currentTab === 'more'
                  ? ['services', 'analytics', 'profile', 'settings', 'more'].includes(currentScreen)
                  : currentScreen === currentTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setScreen(tab.id)}
                  className={cx(
                    'flex h-12 flex-col items-center justify-center gap-1 rounded-[11px] text-[10px] font-bold transition active:scale-[0.98]',
                    active ? (light ? 'bg-black text-white' : 'bg-white text-black') : t.muted,
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-6 text-white">
      <div className="w-full max-w-[340px] rounded-[18px] border border-white/[0.10] bg-[#101010] p-5 text-center">
        <Logo light={false} />
        <div className="mt-5 text-[24px] font-semibold tracking-[-0.08em]">Загружаю mini app</div>
        <div className="mt-2 text-[12px] leading-5 text-white/45">Профиль, записи, услуги, график и чаты.</div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-white/70" />
        </div>
      </div>
    </main>
  );
}

function BookingRow({ light, booking, onClick }: { light: boolean; booking: Booking; onClick: () => void }) {
  const t = ui(light);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex w-full items-start gap-3 rounded-[12px] border p-3 text-left transition active:scale-[0.995]',
        booking.transferRequested
          ? light
            ? 'border-amber-300/35 bg-amber-50/70'
            : 'border-amber-300/15 bg-amber-400/[0.075]'
          : t.panel,
      )}
    >
      <div className="w-[56px] shrink-0">
        <div className="text-[18px] font-semibold tracking-[-0.07em]">{timeLabel(booking.time)}</div>
        <div className={cx('mt-1 flex items-center gap-1 text-[10px] font-bold', t.muted)}>
          <span className="size-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[booking.status] }} />
          {STATUS_LABEL[booking.status]}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold tracking-[-0.03em]">{booking.clientName}</div>
        <div className={cx('mt-1 truncate text-[11px]', t.muted)}>{booking.service}</div>
        <BookingBadges light={light} booking={booking} />

        {booking.transferRequested ? (
          <div className={cx('mt-2 rounded-[9px] border px-2 py-1.5 text-[11px] leading-4', light ? 'border-amber-300/30 bg-white/60 text-amber-800' : 'border-amber-300/15 bg-black/10 text-amber-100')}>
            Клиент просит перенос{booking.transferReason ? `: ${booking.transferReason}` : ''}
          </div>
        ) : null}
      </div>

      <ChevronRight className={cx('mt-1 size-4 shrink-0', t.muted)} />
    </button>
  );
}

function ReadyRow({
  light,
  done,
  title,
  text: body,
  onClick,
}: {
  light: boolean;
  done: boolean;
  title: string;
  text: string;
  onClick: () => void;
}) {
  const t = ui(light);

  return (
    <button type="button" onClick={onClick} className={cx('flex w-full items-center gap-3 rounded-[11px] border p-3 text-left', t.panel)}>
      <span
        className={cx(
          'grid size-8 shrink-0 place-items-center rounded-[9px]',
          done ? (light ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-400/10 text-emerald-200') : t.ghost,
        )}
      >
        {done ? <Check className="size-4" /> : <ChevronRight className="size-4" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-bold tracking-[-0.03em]">{title}</span>
        <span className={cx('mt-0.5 block text-[11px]', t.muted)}>{body}</span>
      </span>
    </button>
  );
}

function TodayScreen({
  light,
  profile,
  bookings,
  services,
  week,
  settings,
  setScreen,
  openBooking,
  openQuick,
  openChatForBooking,
  publicUrl,
}: {
  light: boolean;
  profile: Profile;
  bookings: Booking[];
  services: Service[];
  week: WorkDay[];
  settings: MiniSettings;
  setScreen: (value: Screen) => void;
  openBooking: (booking: Booking) => void;
  openQuick: (preset?: QuickBookingPreset) => void;
  openChatForBooking: (booking: Booking) => void;
  publicUrl: string;
}) {
  const t = ui(light);
  const [date, setDate] = useState(today());

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(today(), index)), []);
  const dayBookings = bookings.filter((booking) => booking.date === date).sort((a, b) => a.time.localeCompare(b.time));
  const active = dayBookings.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show');
  const completed = dayBookings.filter((booking) => booking.status === 'completed');
  const transferQueue = bookings
    .filter((booking) => booking.transferRequested && booking.transferStatus !== 'done' && booking.transferStatus !== 'declined')
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const revenue = completed.reduce(
    (sum, booking) => sum + (booking.priceAmount || services.find((service) => service.name === booking.service)?.price || 0),
    0,
  );

  const ready = [
    len(services) > 0,
    week.some((day) => day.status !== 'day-off'),
    Boolean(profile.phone || profile.telegram || profile.whatsapp),
    settings.publicBookingEnabled,
  ];

  return (
    <>
      <Card light={light} className="overflow-hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Micro>Рабочий пульт</Micro>
            <div className="mt-2 text-[32px] font-semibold leading-[0.9] tracking-[-0.095em]">Сегодня</div>
            <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Записи, переносы, касса и быстрые действия.</div>
          </div>
          <div className={cx('rounded-full border px-2.5 py-1 text-[10px] font-bold', t.ghost)}>
            {ready.filter(Boolean).length}/4
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat light={light} label="Записей" value={String(len(active))} />
          <Stat light={light} label="Переносы" value={String(len(transferQueue))} />
          <Stat light={light} label="Касса" value={rub(revenue)} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button light={light} primary onClick={() => openQuick()}>
            <Plus className="size-4" />
            Запись
          </Button>
          <Button light={light} onClick={() => navigator.clipboard?.writeText(publicUrl).catch(() => null)}>
            <Copy className="size-4" />
            Ссылка
          </Button>
        </div>
      </Card>

      {len(transferQueue) > 0 ? (
        <Card light={light} className={cx('p-3', light ? 'border-amber-300/35 bg-amber-50/70' : 'border-amber-300/15 bg-amber-400/[0.075]')}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Micro>Требуют внимания</Micro>
              <div className="mt-1 text-[15px] font-bold tracking-[-0.04em]">Клиенты просят перенос</div>
            </div>
            <Badge light={light} tone="warning">{len(transferQueue)}</Badge>
          </div>

          <div className="mt-3 space-y-2">
            {transferQueue.slice(0, 3).map((booking) => (
              <div key={booking.id} className={cx('rounded-[11px] border p-3', light ? 'border-amber-300/25 bg-white/65' : 'border-amber-300/15 bg-black/10')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold">{booking.clientName}</div>
                    <div className={cx('mt-1 text-[11px]', t.muted)}>
                      {dateLabel(booking.date)} · {booking.time} · {booking.service}
                    </div>
                    <div className="mt-2 text-[11px] leading-4 opacity-75">
                      {booking.transferReason || 'Клиент запросил другое время.'}
                    </div>
                  </div>
                  <button type="button" onClick={() => openBooking(booking)} className={cx('grid size-9 shrink-0 place-items-center rounded-[10px] border', t.ghost)}>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button light={light} onClick={() => openChatForBooking(booking)}>Открыть чат</Button>
                  <Button light={light} primary onClick={() => openBooking(booking)}>
                    Разобрать перенос
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((day) => {
          const isActive = day === date;
          const count = bookings.filter((booking) => booking.date === day).length;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setDate(day)}
              className={cx(
                'min-w-[78px] rounded-[12px] border p-2 text-left transition',
                isActive ? (light ? 'border-black bg-black text-white' : 'border-white bg-white text-black') : t.ghost,
              )}
            >
              <div className="text-[11px] font-bold capitalize">{dateLabel(day)}</div>
              <div className="mt-1 text-[10px] opacity-55">{count} записей</div>
            </button>
          );
        })}
      </div>

      <Card light={light} className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <Micro>Лента дня</Micro>
            <div className="mt-1 text-[15px] font-bold tracking-[-0.04em]">{dateLabel(date, true)}</div>
          </div>
          <Button light={light} className="h-8 px-2" onClick={() => openQuick({ date })}>
            <Plus className="size-3.5" />
          </Button>
        </div>

        <div className="space-y-2">
          {len(dayBookings) === 0 ? (
            <Empty light={light} title="Записей нет" text="Добавь запись вручную или отправь клиенту ссылку." />
          ) : (
            dayBookings.map((booking) => (
              <BookingRow key={booking.id} light={light} booking={booking} onClick={() => openBooking(booking)} />
            ))
          )}
        </div>
      </Card>

      <Card light={light} className="p-3">
        <Micro>Готовность</Micro>
        <div className="mt-3 space-y-2">
          <ReadyRow
            light={light}
            done={ready[0]}
            title="Услуги"
            text={len(services) > 0 ? `${len(services)} услуг в каталоге` : 'Добавь услуги и цены'}
            onClick={() => setScreen('services')}
          />
          <ReadyRow
            light={light}
            done={ready[1]}
            title="График"
            text="Рабочие дни и перерывы"
            onClick={() => setScreen('schedule')}
          />
          <ReadyRow
            light={light}
            done={ready[2]}
            title="Контакты"
            text="Телефон, Telegram или WhatsApp"
            onClick={() => setScreen('profile')}
          />
          <ReadyRow
            light={light}
            done={ready[3]}
            title="Публичная запись"
            text={settings.publicBookingEnabled ? 'Клиенты могут записываться' : 'Запись временно выключена'}
            onClick={() => setScreen('settings')}
          />
        </div>
      </Card>
    </>
  );
}

function ScheduleScreen({
  light,
  workspaceId,
  days,
  bookings,
  services,
  setDays,
  reload,
}: {
  light: boolean;
  workspaceId: string;
  days: WorkDay[];
  bookings: Booking[];
  services: Service[];
  setDays: (days: WorkDay[]) => void;
  reload: () => Promise<void>;
}) {
  const t = ui(light);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());

  const selectedBookings = bookings.filter((booking) => booking.date === selectedDate && booking.status !== 'cancelled');
  const previewSlots = buildSlots(selectedDate, days, services, bookings);

  const update = (dayId: string, patch: Partial<WorkDay>) => {
    setDays(days.map((day) => (day.id === dayId ? { ...day, ...patch } : day)));
  };

  const preset = (mode: '5/2' | '2/2' | '7/0' | 'weekends') => {
    setDays(
      DEFAULT_WEEK.map((day) => {
        if (mode === '7/0') return { ...day, status: 'workday' };
        if (mode === 'weekends') return { ...day, status: day.weekdayIndex >= 5 ? 'workday' : 'day-off', start: '11:00', end: '18:00' };
        if (mode === '2/2') return { ...day, status: day.weekdayIndex === 0 || day.weekdayIndex === 1 || day.weekdayIndex === 4 || day.weekdayIndex === 5 ? 'workday' : 'day-off' };
        return { ...day, status: day.weekdayIndex < 5 ? 'workday' : 'day-off' };
      }),
    );
  };

  const save = async () => {
    setSaving(true);

    await fetch('/api/workspace/section', {
      method: 'PATCH',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        workspaceId,
        section: 'availability',
        value: days.map((day) => ({
          id: day.id,
          label: day.label,
          weekdayIndex: day.weekdayIndex,
          status: day.status,
          slots: day.status === 'day-off' ? [] : [`${day.start}–${day.end}`],
          breaks: day.breakStart && day.breakEnd ? [`${day.breakStart}–${day.breakEnd}`] : [],
          custom: false,
        })),
      }),
    }).catch(() => null);

    await reload();
    setSaving(false);
  };

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>График</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">Рабочие окна</div>
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Дни, время, перерывы и предпросмотр свободных слотов.</div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Button light={light} onClick={() => preset('5/2')}>5/2</Button>
          <Button light={light} onClick={() => preset('2/2')}>2/2</Button>
          <Button light={light} onClick={() => preset('7/0')}>7/0</Button>
          <Button light={light} onClick={() => preset('weekends')}>Вых</Button>
        </div>
        <Button light={light} primary disabled={saving} onClick={() => void save()} className="mt-2 w-full">
          <Save className="size-4" />
          {saving ? 'Сохраняю' : 'Сохранить график'}
        </Button>
      </Card>

      <Card light={light} className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Micro>Предпросмотр</Micro>
            <div className="mt-1 text-[15px] font-bold tracking-[-0.04em]">Свободные слоты</div>
          </div>
          <Field light={light} type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="max-w-[145px]" />
        </div>

        {len(selectedBookings) > 0 ? (
          <div className={cx('mt-3 rounded-[11px] border p-3 text-[11px] leading-4', light ? 'border-amber-300/35 bg-amber-50 text-amber-800' : 'border-amber-300/15 bg-amber-400/10 text-amber-100')}>
            На эту дату уже есть {len(selectedBookings)} записей. Если поменяешь график, проверь, чтобы не сломать существующие слоты.
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {len(previewSlots) === 0 ? (
            <Badge light={light} tone="danger">Выходной или нет слотов</Badge>
          ) : (
            previewSlots.map((slot) => (
              <span
                key={slot.time}
                className={cx(
                  'inline-flex h-8 items-center rounded-[9px] border px-2.5 text-[11px] font-bold',
                  slot.busy
                    ? light
                      ? 'border-rose-300/35 bg-rose-50 text-rose-700'
                      : 'border-rose-300/15 bg-rose-400/10 text-rose-100'
                    : slot.breakTime
                      ? light
                        ? 'border-amber-300/35 bg-amber-50 text-amber-700'
                        : 'border-amber-300/15 bg-amber-400/10 text-amber-100'
                      : light
                        ? 'border-black/[0.08] bg-white/70 text-black/70'
                        : 'border-white/[0.09] bg-white/[0.055] text-white/70',
                )}
              >
                {slot.time}
              </span>
            ))
          )}
        </div>
      </Card>

      <div className="space-y-2">
        {days.map((day) => (
          <Card light={light} key={day.id} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[15px] font-bold tracking-[-0.04em]">{day.label}</div>
                <div className={cx('mt-1 text-[11px]', t.muted)}>
                  {day.status === 'day-off'
                    ? 'Выходной'
                    : `${day.start}–${day.end}${day.breakStart ? ` · перерыв ${day.breakStart}–${day.breakEnd}` : ''}`}
                </div>
              </div>
              <select
                value={day.status}
                onChange={(event) => update(day.id, { status: event.target.value as DayStatus })}
                className={cx('h-9 rounded-[10px] border px-2 text-[11px] font-bold outline-none', t.input)}
              >
                <option value="workday">Рабочий</option>
                <option value="short">Короткий</option>
                <option value="day-off">Выходной</option>
              </select>
            </div>

            {day.status !== 'day-off' ? (
              <div className="mt-3 grid grid-cols-4 gap-2">
                <Field light={light} type="time" value={day.start} onChange={(event) => update(day.id, { start: event.target.value })} />
                <Field light={light} type="time" value={day.end} onChange={(event) => update(day.id, { end: event.target.value })} />
                <Field light={light} type="time" value={day.breakStart} onChange={(event) => update(day.id, { breakStart: event.target.value })} />
                <Field light={light} type="time" value={day.breakEnd} onChange={(event) => update(day.id, { breakEnd: event.target.value })} />
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}

function ServicesScreen({
  light,
  profile,
  workspaceId,
  services,
  bookings,
  setServices,
  reload,
}: {
  light: boolean;
  profile: Profile;
  workspaceId: string;
  services: Service[];
  bookings: Booking[];
  setServices: (services: Service[]) => void;
  reload: () => Promise<void>;
}) {
  const t = ui(light);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | ServiceStatus | 'hidden'>('all');
  const categories = Array.from(new Set(services.map((service) => service.category || 'Основное')));

  const filteredServices = services.filter((service) => {
    if (filter === 'all') return true;
    if (filter === 'hidden') return !service.visible;
    return service.status === filter;
  });

  const statsFor = (service: Service) => {
    const rows = bookings.filter((booking) => booking.service === service.name);
    return {
      all: len(rows),
      completed: rows.filter((booking) => booking.status === 'completed').length,
      transfer: rows.filter((booking) => booking.transferRequested).length,
      revenue: rows.reduce((sum, booking) => sum + (booking.status === 'completed' ? booking.priceAmount || service.price : 0), 0),
    };
  };

  const update = (serviceId: string, patch: Partial<Service>) => {
    setServices(services.map((service) => (service.id === serviceId ? { ...service, ...patch } : service)));
  };

  const remove = (serviceId: string) => {
    setServices(services.filter((service) => service.id !== serviceId));
  };

  const add = () => {
    setServices([
      {
        id: makeId('service'),
        name: 'Новая услуга',
        category: categories[0] || 'Основное',
        duration: 60,
        price: 0,
        status: 'active',
        visible: true,
      },
      ...services,
    ]);
  };

  const save = async () => {
    setSaving(true);

    const value = services
      .filter((service) => text(service.name))
      .map((service) => ({
        ...service,
        name: text(service.name),
      }));

    await fetch('/api/workspace/section', {
      method: 'PATCH',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        workspaceId,
        section: 'services',
        value,
      }),
    }).catch(() => null);

    await fetch('/api/profile', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        workspaceId,
        locale: 'ru',
        profile: {
          ...profile,
          services: value
            .filter((service) => service.visible && service.status !== 'draft')
            .map((service) => service.name),
        },
      }),
    }).catch(() => null);

    await reload();
    setSaving(false);
  };

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>Услуги</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">Каталог</div>
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Цены, длительность, видимость и статистика по каждой услуге.</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button light={light} onClick={add}>
            <Plus className="size-4" />
            Добавить
          </Button>
          <Button light={light} primary disabled={saving} onClick={() => void save()}>
            <Save className="size-4" />
            {saving ? '...' : 'Сохранить'}
          </Button>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          ['all', 'Все'],
          ['active', 'Активные'],
          ['seasonal', 'Сезонные'],
          ['draft', 'Черновики'],
          ['hidden', 'Скрытые'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id as typeof filter)}
            className={cx(
              'shrink-0 rounded-full border px-3 py-2 text-[11px] font-bold',
              filter === id ? (light ? 'border-black bg-black text-white' : 'border-white bg-white text-black') : ui(light).ghost,
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {len(filteredServices) === 0 ? (
          <Empty light={light} title="Услуг нет" text="Добавь первую услугу, чтобы клиенты могли записываться." />
        ) : (
          filteredServices.map((service) => {
            const stat = statsFor(service);

            return (
              <Card light={light} key={service.id} className="p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Field light={light} value={service.name} onChange={(event) => update(service.id, { name: event.target.value })} placeholder="Название" />
                    <div className="grid grid-cols-2 gap-2">
                      <Field light={light} value={service.category} onChange={(event) => update(service.id, { category: event.target.value })} placeholder="Категория" />
                      <Field light={light} type="number" value={service.price} onChange={(event) => update(service.id, { price: Number(event.target.value) })} placeholder="Цена" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field light={light} type="number" value={service.duration} onChange={(event) => update(service.id, { duration: Number(event.target.value) })} placeholder="Минут" />
                      <select
                        value={service.status}
                        onChange={(event) => update(service.id, { status: event.target.value as ServiceStatus })}
                        className={cx('h-10 rounded-[10px] border px-3 text-[12px] font-bold outline-none', t.input)}
                      >
                        <option value="active">Активна</option>
                        <option value="seasonal">Сезонная</option>
                        <option value="draft">Черновик</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <Stat light={light} label="Записи" value={String(stat.all)} />
                      <Stat light={light} label="Пришли" value={String(stat.completed)} />
                      <Stat light={light} label="Перенос" value={String(stat.transfer)} />
                      <Stat light={light} label="Доход" value={rub(stat.revenue)} />
                    </div>

                    <label className={cx('flex items-center gap-2 text-[11px] font-bold', t.muted)}>
                      <input type="checkbox" checked={service.visible} onChange={(event) => update(service.id, { visible: event.target.checked })} />
                      Показывать клиентам
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(service.id)}
                    className={cx('grid size-10 shrink-0 place-items-center rounded-[10px] border', t.ghost)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}

function ChatAvatar({ light, name }: { light: boolean; name: string }) {
  return (
    <div
      className={cx(
        'grid size-11 shrink-0 place-items-center rounded-full border text-[12px] font-black tracking-[-0.04em]',
        light ? 'border-black/[0.08] bg-black text-white' : 'border-white/[0.10] bg-white text-black',
      )}
    >
      {initials(name)}
    </div>
  );
}

function ChatsScreen({
  light,
  threads,
  loading,
  openChat,
  reloadChats,
}: {
  light: boolean;
  threads: ChatThread[];
  loading: boolean;
  openChat: (threadId: string) => void;
  reloadChats: () => Promise<void>;
}) {
  const t = ui(light);
  const [query, setQuery] = useState('');

  const filtered = threads.filter((thread) => {
    const needle = query.toLowerCase().trim();

    if (!needle) return true;

    return `${thread.clientName} ${thread.clientPhone} ${thread.channel} ${thread.lastMessage}`
      .toLowerCase()
      .includes(needle);
  });

  return (
    <>
      <Card light={light} className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Micro>Чаты</Micro>
            <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">Диалоги</div>
            <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Список диалогов как в Telegram и отдельная страница чата.</div>
          </div>
          <button
            type="button"
            onClick={() => void reloadChats()}
            className={cx('grid size-9 place-items-center rounded-[10px] border', t.ghost)}
          >
            <RefreshCcw className="size-4" />
          </button>
        </div>

        <div className={cx('mt-4 flex h-10 items-center gap-2 rounded-[11px] border px-3', t.input)}>
          <Search className="size-4 shrink-0 opacity-45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по клиентам и сообщениям"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:opacity-55"
          />
        </div>
      </Card>

      <Card light={light} className="overflow-hidden">
        {loading ? (
          <div className="p-3">
            <Empty light={light} title="Загружаю чаты" text="Собираю диалоги клиентов." />
          </div>
        ) : len(filtered) === 0 ? (
          <div className="p-3">
            <Empty light={light} title="Чатов нет" text="Когда клиент напишет или запишется, диалог появится здесь." />
          </div>
        ) : (
          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
            {filtered.map((thread) => {
              const lastTime = timeFromDate(thread.updatedAt);

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openChat(thread.id)}
                  className={cx(
                    'flex w-full items-center gap-3 px-3 py-3 text-left transition active:scale-[0.995]',
                    light ? 'hover:bg-black/[0.025]' : 'hover:bg-white/[0.035]',
                  )}
                >
                  <ChatAvatar light={light} name={thread.clientName} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-[14px] font-bold tracking-[-0.04em]">{thread.clientName}</div>
                      <div className={cx('shrink-0 text-[10px] font-semibold', t.muted)}>{lastTime}</div>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className={cx('truncate text-[12px]', t.muted)}>{thread.lastMessage}</div>
                      {thread.unreadCount > 0 ? (
                        <span
                          className={cx(
                            'ml-auto grid min-w-5 shrink-0 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-black',
                            light ? 'bg-black text-white' : 'bg-white text-black',
                          )}
                        >
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <div className={cx('mt-1 text-[10px] font-bold uppercase tracking-[0.12em]', t.muted)}>
                      {thread.channel}
                      {thread.clientPhone ? ` · ${thread.clientPhone}` : ''}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

function ChatDetailScreen({
  light,
  thread,
  goBack,
  sendMessage,
  reloadChats,
}: {
  light: boolean;
  thread: ChatThread | null;
  goBack: () => void;
  sendMessage: (threadId: string, body: string) => Promise<void>;
  reloadChats: () => Promise<void>;
}) {
  const t = ui(light);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messages = list<ChatMessage>(thread?.messages);
  const quickReplies = [
    'Здравствуйте! Подтверждаю запись.',
    'Напишите, пожалуйста, удобное время для переноса.',
    'Спасибо, буду ждать вас.',
    'Подскажите, пожалуйста, услугу и удобный день.',
  ];

  const submit = async (body = message) => {
    const finalBody = text(body);

    if (!thread || !finalBody || sending) return;

    setSending(true);
    setMessage('');
    await sendMessage(thread.id, finalBody);
    setSending(false);
  };

  if (!thread) {
    return (
      <div className="flex min-h-screen flex-col px-3 py-[calc(var(--tg-safe-top,0px)+12px)]">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goBack} className={cx('grid size-10 place-items-center rounded-full border', t.ghost)}>
            <ArrowLeft className="size-5" />
          </button>
          <div className="text-[15px] font-bold">Чат не найден</div>
        </div>
        <div className="mt-4">
          <Empty light={light} title="Диалог не найден" text="Вернись к списку чатов и открой диалог заново." />
        </div>
      </div>
    );
  }

  return (
    <section className={cx('flex min-h-screen flex-col', t.page)}>
      <header
        className={cx(
          'sticky top-0 z-30 border-b px-3 pb-2 pt-[calc(var(--tg-safe-top,0px)+8px)] backdrop-blur-[20px]',
          light ? 'border-black/[0.08] bg-[#f4f4f2]/92' : 'border-white/[0.08] bg-[#090909]/92',
        )}
      >
        <div className="flex items-center gap-2">
          <button type="button" onClick={goBack} className={cx('grid size-10 place-items-center rounded-full border', t.ghost)}>
            <ArrowLeft className="size-5" />
          </button>

          <ChatAvatar light={light} name={thread.clientName} />

          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold tracking-[-0.045em]">{thread.clientName}</div>
            <div className={cx('mt-0.5 truncate text-[11px]', t.muted)}>
              {thread.channel}
              {thread.clientPhone ? ` · ${thread.clientPhone}` : ''}
            </div>
          </div>

          {thread.clientPhone ? (
            <a href={`tel:${thread.clientPhone}`} className={cx('grid size-10 place-items-center rounded-full border', t.ghost)}>
              <Phone className="size-4" />
            </a>
          ) : null}

          <button type="button" onClick={() => void reloadChats()} className={cx('grid size-10 place-items-center rounded-full border', t.ghost)}>
            <MoreVertical className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-2 px-3 py-3">
        {len(messages) === 0 ? (
          <div className="pt-12">
            <Empty light={light} title="Сообщений нет" text="Напиши клиенту первым сообщением." />
          </div>
        ) : (
          messages.map((item) => {
            const mine = item.author === 'master' || item.author === 'me' || item.author === 'owner';

            return (
              <div key={item.id} className={cx('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cx(
                    'max-w-[82%] rounded-[18px] border px-3 py-2 text-[13px] leading-5 shadow-none',
                    mine
                      ? light
                        ? 'rounded-br-[6px] border-black bg-black text-white'
                        : 'rounded-br-[6px] border-white bg-white text-black'
                      : light
                        ? 'rounded-bl-[6px] border-black/[0.07] bg-white text-black'
                        : 'rounded-bl-[6px] border-white/[0.08] bg-white/[0.055] text-white',
                  )}
                >
                  <div>{item.body}</div>
                  <div className="mt-1 text-right text-[9px] font-semibold opacity-45">{timeFromDate(item.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer
        className={cx(
          'sticky bottom-0 z-30 border-t px-3 pb-[calc(var(--tg-safe-bottom,0px)+8px)] pt-2 backdrop-blur-[20px]',
          light ? 'border-black/[0.08] bg-[#f4f4f2]/92' : 'border-white/[0.08] bg-[#090909]/92',
        )}
      >
        <div className="mb-2 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickReplies.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void submit(item)}
              className={cx('shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold', t.ghost)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="Сообщение"
            rows={1}
            className={cx(
              'max-h-28 min-h-11 flex-1 resize-none rounded-[16px] border px-3 py-3 text-[13px] font-medium leading-5 outline-none',
              t.input,
            )}
          />
          <button
            type="button"
            disabled={!text(message) || sending}
            onClick={() => void submit()}
            className={cx(
              'grid size-11 shrink-0 place-items-center rounded-full border transition active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35',
              light ? 'border-black bg-black text-white' : 'border-white bg-white text-black',
            )}
          >
            <Send className="size-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}

function MoreScreen({
  light,
  profile,
  clients,
  bookings,
  services,
  publicUrl,
  setScreen,
}: {
  light: boolean;
  profile: Profile;
  clients: Client[];
  bookings: Booking[];
  services: Service[];
  publicUrl: string;
  setScreen: (value: Screen) => void;
}) {
  const t = ui(light);

  const items: Array<{ screen: Screen; title: string; info: string; icon: ReactNode }> = [
    { screen: 'services', title: 'Услуги', info: `${len(services)} позиций`, icon: <Scissors className="size-4" /> },
    { screen: 'analytics', title: 'Аналитика', info: `${len(bookings)} заявок`, icon: <BarChart3 className="size-4" /> },
    { screen: 'profile', title: 'Профиль', info: `/${profile.slug}`, icon: <UserRound className="size-4" /> },
    { screen: 'settings', title: 'Настройки записи', info: 'Переносы, напоминания, правила', icon: <ShieldCheck className="size-4" /> },
  ];

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>Ещё</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">Управление</div>
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Клиенты, аналитика, профиль, настройки и полный кабинет.</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button light={light} onClick={() => navigator.clipboard?.writeText(publicUrl).catch(() => null)}>
            <Copy className="size-4" />
            Ссылка
          </Button>
          <a
            href="/dashboard"
            className={cx('inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-3 text-[12px] font-bold', t.ghost)}
          >
            <LayoutDashboard className="size-4" />
            Кабинет
          </a>
        </div>
      </Card>

      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.screen}
            type="button"
            onClick={() => setScreen(item.screen)}
            className={cx('flex w-full items-center gap-3 rounded-[13px] border p-3 text-left', t.card)}
          >
            <span className={cx('grid size-10 place-items-center rounded-[10px] border', t.panel)}>{item.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold tracking-[-0.04em]">{item.title}</span>
              <span className={cx('mt-1 block text-[11px]', t.muted)}>{item.info}</span>
            </span>
            <ChevronRight className={cx('size-4', t.muted)} />
          </button>
        ))}
      </div>

      <Card light={light} className="p-3">
        <Micro>Состояние</Micro>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat light={light} label="Услуги" value={String(len(services))} />
          <Stat light={light} label="Клиенты" value={String(len(clients))} />
          <Stat light={light} label="Заявки" value={String(len(bookings))} />
        </div>
      </Card>
    </>
  );
}

function ClientsScreen({
  light,
  clients,
  bookings,
  openChatForClient,
  openQuick,
}: {
  light: boolean;
  clients: Client[];
  bookings: Booking[];
  openChatForClient: (client: Client) => void;
  openQuick: (preset?: QuickBookingPreset) => void;
}) {
  const t = ui(light);
  const [segment, setSegment] = useState<ClientSegment>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = clients.filter((client) => {
    const needle = query.toLowerCase().trim();
    const matchesSearch = !needle || `${client.name} ${client.phone} ${client.lastService}`.toLowerCase().includes(needle);

    if (!matchesSearch) return false;

    if (segment === 'vip') return client.favorite;
    if (segment === 'transfer') return client.hasTransferRequest;
    if (segment === 'no_show') return client.noShowCount > 0;
    if (segment === 'new') return client.bookingsCount <= 1;
    return true;
  });

  const selectedBookings = selected
    ? bookings
        .filter((booking) => booking.clientPhone === selected.phone || booking.clientName === selected.name)
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
    : [];

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>Клиенты</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">База</div>
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Сегменты, история записей, переносы, no-show и быстрые действия.</div>

        <div className={cx('mt-4 flex h-10 items-center gap-2 rounded-[11px] border px-3', t.input)}>
          <Search className="size-4 shrink-0 opacity-45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск клиента"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:opacity-55"
          />
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          ['all', 'Все'],
          ['vip', 'VIP'],
          ['transfer', 'Переносы'],
          ['no_show', 'No-show'],
          ['new', 'Новые'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSegment(id as ClientSegment)}
            className={cx(
              'shrink-0 rounded-full border px-3 py-2 text-[11px] font-bold',
              segment === id ? (light ? 'border-black bg-black text-white' : 'border-white bg-white text-black') : t.ghost,
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {len(filtered) === 0 ? (
          <Empty light={light} title="Клиентов нет" text="Попробуй другой сегмент или дождись первых записей." />
        ) : (
          filtered.map((client) => (
            <Card light={light} key={client.id} className="p-3">
              <button type="button" onClick={() => setSelected(client)} className="flex w-full items-center gap-3 text-left">
                <div className={cx('grid size-10 place-items-center rounded-[10px] border', t.panel)}>
                  {client.favorite ? <Star className="size-4" /> : <UserRound className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold tracking-[-0.04em]">{client.name}</div>
                  <div className={cx('mt-1 truncate text-[11px]', t.muted)}>
                    {client.phone || 'без телефона'} · {client.bookingsCount} записей · {rub(client.revenue)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {client.favorite ? <Badge light={light} tone="accent">VIP</Badge> : null}
                    {client.hasTransferRequest ? <Badge light={light} tone="warning">Просит перенос</Badge> : null}
                    {client.noShowCount > 0 ? <Badge light={light} tone="warning">No-show {client.noShowCount}</Badge> : null}
                    {client.cancelledCount > 0 ? <Badge light={light} tone="danger">Отмены {client.cancelledCount}</Badge> : null}
                  </div>
                </div>
                <ChevronRight className={cx('size-4', t.muted)} />
              </button>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className={cx('inline-flex h-9 items-center justify-center rounded-[9px] border text-[11px] font-bold', t.ghost)}>
                    Звонок
                  </a>
                ) : (
                  <Button light={light} className="h-9" disabled>Звонок</Button>
                )}
                <Button light={light} className="h-9" onClick={() => openChatForClient(client)}>Чат</Button>
                <Button light={light} primary className="h-9" onClick={() => openQuick({ clientName: client.name, clientPhone: client.phone, service: client.lastService })}>Запись</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {selected ? (
        <Sheet light={light} title={selected.name} onClose={() => setSelected(null)}>
          <div className="space-y-3">
            <div className={cx('rounded-[12px] border p-3', t.panel)}>
              <div className="flex items-center gap-3">
                <div className={cx('grid size-11 place-items-center rounded-full border text-[12px] font-black', light ? 'border-black bg-black text-white' : 'border-white bg-white text-black')}>
                  {initials(selected.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[17px] font-semibold tracking-[-0.06em]">{selected.name}</div>
                  <div className={cx('mt-1 text-[12px]', t.muted)}>{selected.phone || 'без телефона'}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Stat light={light} label="Записи" value={String(selected.bookingsCount)} />
                <Stat light={light} label="Визиты" value={String(selected.visits)} />
                <Stat light={light} label="Доход" value={rub(selected.revenue)} />
              </div>

              {selected.note ? <div className={cx('mt-3 rounded-[10px] border p-2 text-[11px] leading-4', t.panel)}>{selected.note}</div> : null}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button light={light} onClick={() => openChatForClient(selected)}>Открыть чат</Button>
              <Button light={light} primary onClick={() => openQuick({ clientName: selected.name, clientPhone: selected.phone, service: selected.lastService })}>
                Создать запись
              </Button>
            </div>

            <Card light={light} className="p-3">
              <Micro>История</Micro>
              <div className="mt-3 space-y-2">
                {len(selectedBookings) === 0 ? (
                  <Empty light={light} title="Истории нет" text="У клиента пока нет записей." />
                ) : (
                  selectedBookings.map((booking) => <BookingRow key={booking.id} light={light} booking={booking} onClick={() => undefined} />)
                )}
              </div>
            </Card>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}

function AnalyticsScreen({
  light,
  bookings,
  services,
  clients,
}: {
  light: boolean;
  bookings: Booking[];
  services: Service[];
  clients: Client[];
}) {
  const t = ui(light);
  const completed = bookings.filter((booking) => booking.status === 'completed');
  const cancelled = bookings.filter((booking) => booking.status === 'cancelled' || booking.status === 'no_show');
  const transfers = bookings.filter((booking) => booking.transferRequested);
  const revenue = clients.reduce((sum, client) => sum + client.revenue, 0);
  const conversion = len(bookings) > 0 ? Math.round((len(completed) / len(bookings)) * 100) : 0;
  const topServices = services
    .map((service) => ({
      ...service,
      count: bookings.filter((booking) => booking.service === service.name).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>Аналитика</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">Показатели</div>
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Короткий мобильный срез по заявкам, клиентам и услугам.</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat light={light} label="Выручка" value={rub(revenue)} />
          <Stat light={light} label="Конверсия" value={`${conversion}%`} />
          <Stat light={light} label="Пришли" value={String(len(completed))} />
          <Stat light={light} label="Переносы" value={String(len(transfers))} />
          <Stat light={light} label="Срывы" value={String(len(cancelled))} />
          <Stat light={light} label="Клиенты" value={String(len(clients))} />
        </div>
      </Card>

      <Card light={light} className="p-3">
        <Micro>Топ услуг</Micro>
        <div className="mt-3 space-y-2">
          {len(topServices) === 0 ? (
            <Empty light={light} title="Нет данных" text="Статистика появится после первых записей." />
          ) : (
            topServices.map((service) => (
              <div key={service.id} className={cx('rounded-[11px] border p-3', t.panel)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold">{service.name}</div>
                    <div className={cx('mt-1 text-[11px]', t.muted)}>
                      {rub(service.price)} · {service.duration} мин
                    </div>
                  </div>
                  <div className="text-[18px] font-semibold tracking-[-0.06em]">{service.count}</div>
                </div>
                <div className={cx('mt-2 h-1.5 overflow-hidden rounded-full', light ? 'bg-black/[0.06]' : 'bg-white/[0.08]')}>
                  <div className="h-full rounded-full bg-[var(--mini-accent)]" style={{ width: `${Math.min(100, service.count * 18)}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}

function ProfileScreen({
  light,
  profile,
  workspaceId,
  publicUrl,
  reload,
}: {
  light: boolean;
  profile: Profile;
  workspaceId: string;
  publicUrl: string;
  reload: () => Promise<void>;
}) {
  const t = ui(light);
  const [form, setForm] = useState({ ...profile, servicesText: list<string>(profile.services).join('\n') });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const next: Profile = {
      ...profile,
      ...form,
      slug: slugify(form.slug || form.name),
      services: text(form.servicesText)
        .split('\n')
        .map((item) => text(item))
        .filter(Boolean),
    };

    setSaving(true);

    await fetch('/api/profile', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        workspaceId,
        locale: 'ru',
        profile: next,
      }),
    }).catch(() => null);

    await reload();
    setSaving(false);
  };

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>Профиль</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">Анкета</div>
        <div className={cx('mt-2 break-all text-[12px] leading-5', t.muted)}>{publicUrl}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button light={light} onClick={() => navigator.clipboard?.writeText(publicUrl).catch(() => null)}>
            <Copy className="size-4" />
            Копировать
          </Button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className={cx('inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-3 text-[12px] font-bold', t.ghost)}
          >
            <ExternalLink className="size-4" />
            Открыть
          </a>
        </div>
      </Card>

      <Card light={light} className="space-y-2 p-3">
        <Field light={light} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Имя" />
        <Field light={light} value={form.profession} onChange={(event) => setForm({ ...form, profession: event.target.value })} placeholder="Специализация" />
        <Field light={light} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Город" />
        <Field light={light} value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="slug" />

        <div className="grid grid-cols-2 gap-2">
          <Field light={light} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Телефон" />
          <Field light={light} value={form.telegram} onChange={(event) => setForm({ ...form, telegram: event.target.value })} placeholder="Telegram" />
        </div>

        <Field light={light} value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} placeholder="WhatsApp" />
        <Area light={light} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Описание" />

        <Button light={light} primary disabled={saving || !text(form.name)} onClick={() => void save()} className="w-full">
          <Save className="size-4" />
          {saving ? 'Сохраняю' : 'Сохранить профиль'}
        </Button>
      </Card>
    </>
  );
}

function SettingsScreen({
  light,
  workspaceId,
  settings,
  setSettings,
  reload,
}: {
  light: boolean;
  workspaceId: string;
  settings: MiniSettings;
  setSettings: (settings: MiniSettings) => void;
  reload: () => Promise<void>;
}) {
  const t = ui(light);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);

    await fetch('/api/workspace/section', {
      method: 'PATCH',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        workspaceId,
        section: 'settings',
        value: settings,
      }),
    }).catch(() => null);

    await reload();
    setSaving(false);
  };

  const toggle = (key: keyof MiniSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>Настройки</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">Правила записи</div>
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Публичная запись, переносы, напоминания и поведение при no-show.</div>
        <Button light={light} primary disabled={saving} onClick={() => void save()} className="mt-4 w-full">
          <Save className="size-4" />
          {saving ? 'Сохраняю' : 'Сохранить настройки'}
        </Button>
      </Card>

      <Card light={light} className="p-3">
        <Micro>Публичная запись</Micro>
        <div className="mt-3 space-y-2">
          <SettingSwitch light={light} title="Клиенты могут записываться" text="Показывать свободные слоты на публичной странице." checked={settings.publicBookingEnabled} onClick={() => toggle('publicBookingEnabled')} />
          <SettingSwitch light={light} title="Автоподтверждение" text="Новая запись сразу попадает в план без ручного подтверждения." checked={settings.autoConfirmBookings} onClick={() => toggle('autoConfirmBookings')} />
          <SettingSwitch light={light} title="Разрешить переносы" text="Клиент может нажать «Перенести», а ты увидишь плашку в mini app." checked={settings.allowClientReschedule} onClick={() => toggle('allowClientReschedule')} />
        </div>
      </Card>

      <Card light={light} className="p-3">
        <Micro>Напоминания</Micro>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <SettingChip light={light} active={settings.reminderTelegram} label="Telegram" onClick={() => toggle('reminderTelegram')} />
          <SettingChip light={light} active={settings.reminderVk} label="VK" onClick={() => toggle('reminderVk')} />
          <SettingChip light={light} active={settings.reminderWeb} label="Web" onClick={() => toggle('reminderWeb')} />
        </div>
        <div className="mt-3">
          <Field
            light={light}
            type="number"
            value={settings.reminderBeforeHours}
            onChange={(event) => setSettings({ ...settings, reminderBeforeHours: Number(event.target.value) })}
            placeholder="За сколько часов напоминать"
          />
        </div>
      </Card>

      <Card light={light} className="space-y-2 p-3">
        <Micro>Тексты и политика</Micro>
        <Area
          light={light}
          value={settings.reschedulePolicy}
          onChange={(event) => setSettings({ ...settings, reschedulePolicy: event.target.value })}
          placeholder="Политика переносов"
        />
        <Area
          light={light}
          value={settings.bookingNotice}
          onChange={(event) => setSettings({ ...settings, bookingNotice: event.target.value })}
          placeholder="Текст для клиента перед записью"
        />
        <select
          value={settings.noShowAction}
          onChange={(event) => setSettings({ ...settings, noShowAction: event.target.value as MiniSettings['noShowAction'] })}
          className={cx('h-10 w-full rounded-[10px] border px-3 text-[12px] font-bold outline-none', t.input)}
        >
          <option value="sleep">После no-show помечать как спящий</option>
          <option value="blacklist_note">Добавлять заметку риска</option>
          <option value="keep">Ничего не делать</option>
        </select>
      </Card>
    </>
  );
}

function SettingSwitch({
  light,
  title,
  text: body,
  checked,
  onClick,
}: {
  light: boolean;
  title: string;
  text: string;
  checked: boolean;
  onClick: () => void;
}) {
  const t = ui(light);

  return (
    <button type="button" onClick={onClick} className={cx('flex w-full items-center gap-3 rounded-[11px] border p-3 text-left', t.panel)}>
      <span className={cx('relative h-6 w-10 rounded-full border transition', checked ? (light ? 'border-black bg-black' : 'border-white bg-white') : t.ghost)}>
        <span className={cx('absolute top-1 size-4 rounded-full transition', checked ? 'left-5 bg-white dark:bg-black' : 'left-1 bg-black/35 dark:bg-white/35')} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold tracking-[-0.03em]">{title}</span>
        <span className={cx('mt-0.5 block text-[11px] leading-4', t.muted)}>{body}</span>
      </span>
    </button>
  );
}

function SettingChip({ light, active, label, onClick }: { light: boolean; active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'h-10 rounded-[10px] border text-[11px] font-bold',
        active ? (light ? 'border-black bg-black text-white' : 'border-white bg-white text-black') : ui(light).ghost,
      )}
    >
      {label}
    </button>
  );
}

function Sheet({
  light,
  title,
  onClose,
  children,
}: {
  light: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const t = ui(light);

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-black/45 px-2 pb-2 backdrop-blur-[10px]" onClick={onClose}>
      <div
        className={cx('mx-auto max-h-[88vh] w-full max-w-[460px] overflow-y-auto rounded-[18px] border p-4', t.card)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-[20px] font-semibold tracking-[-0.07em]">{title}</div>
          <button type="button" onClick={onClose} className={cx('grid size-9 place-items-center rounded-[10px] border', t.ghost)}>
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BookingSheet({
  light,
  booking,
  services,
  onClose,
  updateStatus,
  updateTransfer,
  offerTransfer,
  openChat,
  openQuick,
}: {
  light: boolean;
  booking: Booking | null;
  services: Service[];
  onClose: () => void;
  updateStatus: (id: string, status: BookingStatus) => Promise<void>;
  updateTransfer: (id: string, transferStatus: Booking['transferStatus']) => Promise<void>;
  offerTransfer: (id: string, date: string, time: string) => Promise<void>;
  openChat: (booking: Booking) => void;
  openQuick: (preset?: QuickBookingPreset) => void;
}) {
  const t = ui(light);
  const [proposedDate, setProposedDate] = useState(today());
  const [proposedTime, setProposedTime] = useState('12:00');
  const [offering, setOffering] = useState(false);

  if (!booking) return null;

  const price = booking.priceAmount || services.find((service) => service.name === booking.service)?.price || 0;
  const reminder = `${booking.clientName}, напоминаю про запись ${dateLabel(booking.date)} в ${booking.time}: ${booking.service}.`;

  return (
    <Sheet light={light} title="Запись" onClose={onClose}>
      <div className="space-y-3">
        <div className={cx('rounded-[12px] border p-3', t.panel)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[18px] font-semibold tracking-[-0.06em]">{booking.clientName}</div>
              <div className={cx('mt-1 text-[12px]', t.muted)}>{booking.clientPhone || 'без телефона'}</div>
            </div>
            <BookingBadges light={light} booking={booking} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat light={light} label="Дата" value={dateLabel(booking.date)} />
            <Stat light={light} label="Время" value={booking.time} />
            <Stat light={light} label="Услуга" value={booking.service} />
            <Stat light={light} label="Цена" value={rub(price)} />
          </div>

          {booking.comment ? <div className={cx('mt-3 rounded-[10px] border p-2 text-[12px] leading-5', t.panel)}>{booking.comment}</div> : null}

          {booking.transferRequested ? (
            <div className={cx('mt-3 rounded-[11px] border p-3 text-[12px] leading-5', light ? 'border-amber-300/35 bg-amber-50 text-amber-800' : 'border-amber-300/15 bg-amber-400/10 text-amber-100')}>
              <div className="font-bold">Клиент просит перенос</div>
              <div className="mt-1 opacity-80">{booking.transferReason || 'Причина не указана.'}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Field light={light} type="date" value={proposedDate} onChange={(event) => setProposedDate(event.target.value)} />
                <Field light={light} type="time" value={proposedTime} onChange={(event) => setProposedTime(event.target.value)} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button light={light} onClick={() => void updateTransfer(booking.id, 'declined').then(onClose)}>Отклонить</Button>
                <Button
                  light={light}
                  primary
                  disabled={offering}
                  onClick={() => {
                    setOffering(true);
                    void offerTransfer(booking.id, proposedDate, proposedTime).then(() => {
                      setOffering(false);
                      onClose();
                    });
                  }}
                >
                  {offering ? 'Отправляю' : 'Предложить время'}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button light={light} primary onClick={() => void updateStatus(booking.id, 'completed').then(onClose)}>
            <CheckCircle2 className="size-4" />
            Пришла
          </Button>
          <Button light={light} danger onClick={() => void updateStatus(booking.id, 'no_show').then(onClose)}>
            <XCircle className="size-4" />
            Не пришла
          </Button>
          <Button light={light} onClick={() => void updateStatus(booking.id, 'confirmed').then(onClose)}>
            В плане
          </Button>
          <Button light={light} onClick={() => void updateStatus(booking.id, 'cancelled').then(onClose)}>
            Освободить слот
          </Button>
          <Button light={light} onClick={() => navigator.clipboard?.writeText(reminder).catch(() => null)}>
            <Copy className="size-4" />
            Напомнить
          </Button>
          <Button light={light} onClick={() => openChat(booking)}>
            <MessageCircle className="size-4" />
            Чат
          </Button>
        </div>

        {booking.clientPhone ? (
          <a href={`tel:${booking.clientPhone}`} className={cx('inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border text-[12px] font-bold', t.ghost)}>
            <Phone className="size-4" />
            Позвонить
          </a>
        ) : null}
      </div>
    </Sheet>
  );
}

function QuickBookingSheet({
  light,
  profile,
  services,
  preset,
  onClose,
  reload,
}: {
  light: boolean;
  profile: Profile;
  services: Service[];
  preset?: QuickBookingPreset;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const t = ui(light);
  const availableServices = services.filter((service) => service.visible && service.status !== 'draft');
  const [form, setForm] = useState({
    clientName: preset?.clientName || '',
    clientPhone: preset?.clientPhone || '',
    service: preset?.service || availableServices[0]?.name || profile.services[0] || '',
    date: preset?.date || today(),
    time: preset?.time || '12:00',
    comment: preset?.comment || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    setError('');
    setSaving(true);

    const response = await fetch('/api/bookings', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        masterSlug: profile.slug,
        source: 'Mini App',
        sourceChannel: 'telegram',
        values: form,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      const payload = (response ? await parseJson(response).catch(() => ({})) : {}) as Json;
      setError(text(payload.error, 'Не удалось создать запись. Проверь услугу, график и телефон.'));
      setSaving(false);
      return;
    }

    await reload();
    setSaving(false);
    onClose();
  };

  return (
    <Sheet light={light} title="Новая запись" onClose={onClose}>
      <div className="space-y-2">
        <Field light={light} value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} placeholder="Имя клиента" />
        <Field light={light} value={form.clientPhone} onChange={(event) => setForm({ ...form, clientPhone: event.target.value })} inputMode="tel" placeholder="Телефон" />

        <select
          value={form.service}
          onChange={(event) => setForm({ ...form, service: event.target.value })}
          className={cx('h-10 w-full rounded-[10px] border px-3 text-[13px] font-medium outline-none', t.input)}
        >
          {len(availableServices) === 0 ? <option value="">Сначала добавь услугу</option> : null}
          {availableServices.map((service) => (
            <option key={service.id} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <Field light={light} type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <Field light={light} type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
        </div>

        <Area light={light} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Комментарий" />

        {error ? (
          <div className={cx('rounded-[10px] border px-3 py-2 text-[11px] leading-4', light ? 'border-rose-300/35 bg-rose-50 text-rose-700' : 'border-rose-300/15 bg-rose-400/10 text-rose-100')}>
            {error}
          </div>
        ) : null}

        <Button light={light} primary disabled={saving || !text(form.clientName) || !text(form.clientPhone) || !text(form.service)} onClick={() => void create()} className="w-full">
          <Plus className="size-4" />
          {saving ? 'Создаю' : 'Создать запись'}
        </Button>
      </div>
    </Sheet>
  );
}

function Onboarding({ light, reload }: { light: boolean; reload: () => Promise<void> }) {
  const t = ui(light);
  const [form, setForm] = useState({
    name: '',
    profession: '',
    city: '',
    phone: '',
    services: 'Консультация',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const name = text(form.name);

    if (!name) return;

    const profile: Profile = {
      ...DEFAULT_PROFILE,
      id: makeId('profile'),
      name,
      slug: slugify(name),
      profession: text(form.profession, 'Специалист'),
      city: text(form.city),
      phone: text(form.phone),
      services: text(form.services)
        .split('\n')
        .map((item) => text(item))
        .filter(Boolean),
      bio: 'Онлайн-запись через КликБук',
    };

    setSaving(true);

    await fetch('/api/profile', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        workspaceId: null,
        locale: 'ru',
        profile,
      }),
    }).catch(() => null);

    await reload();
    setSaving(false);
  };

  return (
    <main className={cx('min-h-screen px-4 py-[calc(var(--tg-safe-top,0px)+16px)]', t.page)}>
      <div className="mx-auto w-full max-w-[440px] space-y-3">
        <Card light={light} className="p-5">
          <Logo light={light} />
          <div className="mt-5 text-[30px] font-semibold leading-[0.95] tracking-[-0.095em]">Создай профиль</div>
          <div className={cx('mt-3 text-[12px] leading-5', t.muted)}>Mini app подключит услуги, график, заявки и чаты.</div>
        </Card>

        <Card light={light} className="space-y-2 p-3">
          <Field light={light} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Имя или название" />
          <Field light={light} value={form.profession} onChange={(event) => setForm({ ...form, profession: event.target.value })} placeholder="Специализация" />
          <Field light={light} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Город" />
          <Field light={light} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Телефон" />
          <Area light={light} value={form.services} onChange={(event) => setForm({ ...form, services: event.target.value })} placeholder="Услуги, каждая с новой строки" />

          <Button light={light} primary disabled={saving || !text(form.name)} onClick={() => void save()} className="w-full">
            <Sparkles className="size-4" />
            Создать профиль
          </Button>
        </Card>
      </div>
    </main>
  );
}

export function MiniAppEntry() {
  const [screen, setScreen] = useState<Screen>('today');
  const [loading, setLoading] = useState(true);
  const [light, setLight] = useState(false);
  const [workspaceId, setWorkspaceId] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [data, setData] = useState<Json>({});
  const [settings, setSettings] = useState<MiniSettings>(DEFAULT_SETTINGS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [week, setWeek] = useState<WorkDay[]>(DEFAULT_WEEK);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickPreset, setQuickPreset] = useState<QuickBookingPreset | undefined>(undefined);
  const [error, setError] = useState('');

  const accent = useMemo(() => getAccent(data), [data]);

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    [bookings],
  );

  const clients = useMemo(() => buildClients(bookings, services), [bookings, services]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );

  const publicUrl = useMemo(() => {
    const path = `/m/${profile?.slug || 'master'}`;

    if (typeof window === 'undefined') return path;

    return `${window.location.origin}${path}`;
  }, [profile?.slug]);

  const loadChats = useCallback(async () => {
    setThreadsLoading(true);

    const response = await fetch('/api/chats', {
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(false),
    }).catch(() => null);

    if (response?.ok) {
      const payload = await parseJson(response);
      const nextThreads = list(payload.threads).map((item, index) => normalizeThread(item, index));

      setThreads(nextThreads);
      setActiveThreadId((current) => current || nextThreads[0]?.id || '');
    }

    setThreadsLoading(false);
  }, []);

  const load = useCallback(async () => {
    setError('');
    setLight(isLightTheme());

    try {
      await authorizeTelegram().catch(() => null);

      const response = await fetch('/api/workspace', {
        credentials: 'include',
        cache: 'no-store',
        headers: apiHeaders(false),
      });

      if (response.status === 404) {
        setWorkspaceId('');
        setProfile(null);
        setData({});
        setSettings(DEFAULT_SETTINGS);
        setBookings([]);
        setServices([]);
        setWeek(DEFAULT_WEEK);
        return;
      }

      if (response.status === 401) {
        setError('Не удалось авторизоваться. Закрой mini app и открой заново из бота.');
        return;
      }

      if (!response.ok) {
        const payload = (await parseJson(response).catch(() => ({}))) as Json;
        throw new Error(text(payload.error, 'workspace_load_failed'));
      }

      const workspace = await parseJson(response);
      const nextData = obj(workspace.data);
      const nextProfile = normalizeProfile(workspace.profile) ?? null;
      const nextBookings = list(nextData.bookings)
        .map((item, index) => normalizeBooking(item, index))
        .filter((item): item is Booking => Boolean(item));
      const nextServices = normalizeServices(nextProfile, nextData);
      const nextWeek = normalizeWeek(nextData);
      const nextSettings = normalizeSettings(nextData);

      setWorkspaceId(text(workspace.id));
      setProfile(nextProfile);
      setData(nextData);
      setBookings(nextBookings);
      setServices(nextServices);
      setWeek(nextWeek);
      setSettings(nextSettings);

      void loadChats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mini app не загрузилась');
    } finally {
      setLoading(false);
    }
  }, [loadChats]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setBookings((current) =>
      current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)),
    );

    await fetch('/api/bookings', {
      method: 'PATCH',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        bookingId,
        status,
      }),
    }).catch(() => null);

    await load();
  };

  const updateTransfer = async (bookingId: string, transferStatus: Booking['transferStatus']) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              transferStatus,
              transferRequested: transferStatus === 'requested',
            }
          : booking,
      ),
    );

    await fetch('/api/bookings', {
      method: 'PATCH',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        bookingId,
        action: transferStatus === 'declined' ? 'decline_reschedule' : transferStatus === 'requested' ? 'request_reschedule' : undefined,
        transferStatus,
        transferRequested: transferStatus === 'requested',
      }),
    }).catch(() => null);

    await load();
  };

  const offerTransfer = async (bookingId: string, date: string, time: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              transferRequested: true,
              transferStatus: 'requested',
            }
          : booking,
      ),
    );

    await fetch('/api/bookings', {
      method: 'PATCH',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        bookingId,
        action: 'offer_reschedule',
        proposedDate: date,
        proposedTime: time,
      }),
    }).catch(() => null);

    await load();
    await loadChats();
  };

  const sendChatMessage = async (threadId: string, body: string) => {
    const finalBody = text(body);

    if (!threadId || !finalBody) return;

    const optimistic: ChatMessage = {
      id: makeId('msg'),
      author: 'master',
      body: finalBody,
      createdAt: new Date().toISOString(),
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: [...list<ChatMessage>(thread.messages), optimistic],
              lastMessage: finalBody,
              updatedAt: optimistic.createdAt,
            }
          : thread,
      ),
    );

    await fetch('/api/chats', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: apiHeaders(true),
      body: JSON.stringify({
        threadId,
        body: finalBody,
        author: 'master',
        viaBot: true,
        clientMessageKey: `${threadId}-${Date.now()}`,
      }),
    }).catch(() => null);

    await loadChats();
  };

  const openQuick = (preset?: QuickBookingPreset) => {
    setQuickPreset(preset);
    setQuickOpen(true);
  };

  const openChat = (threadId: string) => {
    setActiveThreadId(threadId);
    setScreen('chat');
  };

  const openChatForBooking = (booking: Booking) => {
    const found = threads.find((thread) => {
      const phoneMatch = booking.clientPhone && thread.clientPhone && booking.clientPhone === thread.clientPhone;
      const nameMatch = booking.clientName && thread.clientName && booking.clientName.toLowerCase() === thread.clientName.toLowerCase();
      return phoneMatch || nameMatch;
    });

    if (found) {
      openChat(found.id);
      setSelectedBooking(null);
      return;
    }

    setScreen('chats');
    setSelectedBooking(null);
  };

  const openChatForClient = (client: Client) => {
    const found = threads.find((thread) => {
      const phoneMatch = client.phone && thread.clientPhone && client.phone === thread.clientPhone;
      const nameMatch = client.name && thread.clientName && client.name.toLowerCase() === thread.clientName.toLowerCase();
      return phoneMatch || nameMatch;
    });

    if (found) {
      openChat(found.id);
      return;
    }

    setScreen('chats');
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-white">
        <div className="w-full max-w-[350px] rounded-[18px] border border-white/[0.10] bg-[#101010] p-5 text-center">
          <Logo light={false} />
          <div className="mt-5 text-[22px] font-semibold tracking-[-0.08em]">Mini app не загрузилась</div>
          <div className="mt-3 rounded-[10px] border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-left text-[11px] leading-5 text-white/55">
            {error}
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void load();
            }}
            className="mt-5 h-10 w-full rounded-[10px] border border-white/[0.12] bg-white text-[12px] font-bold text-black active:scale-[0.985]"
          >
            Повторить
          </button>
        </div>
      </main>
    );
  }

  if (!profile) return <Onboarding light={light} reload={load} />;

  return (
    <>
      <Shell
        light={light}
        accent={accent}
        profile={profile}
        screen={screen}
        setScreen={setScreen}
        refresh={() => void load()}
      >
        {screen === 'today' ? (
          <TodayScreen
            light={light}
            profile={profile}
            bookings={sortedBookings}
            services={services}
            week={week}
            settings={settings}
            setScreen={setScreen}
            openBooking={setSelectedBooking}
            openQuick={openQuick}
            openChatForBooking={openChatForBooking}
            publicUrl={publicUrl}
          />
        ) : null}

        {screen === 'schedule' ? (
          <ScheduleScreen
            light={light}
            workspaceId={workspaceId}
            days={week}
            bookings={bookings}
            services={services}
            setDays={setWeek}
            reload={load}
          />
        ) : null}

        {screen === 'services' ? (
          <ServicesScreen
            light={light}
            profile={profile}
            workspaceId={workspaceId}
            services={services}
            bookings={bookings}
            setServices={setServices}
            reload={load}
          />
        ) : null}

        {screen === 'chats' ? (
          <ChatsScreen
            light={light}
            threads={threads}
            loading={threadsLoading}
            openChat={openChat}
            reloadChats={loadChats}
          />
        ) : null}

        {screen === 'chat' ? (
          <ChatDetailScreen
            light={light}
            thread={activeThread}
            goBack={() => setScreen('chats')}
            sendMessage={sendChatMessage}
            reloadChats={loadChats}
          />
        ) : null}

        {screen === 'more' ? (
          <MoreScreen
            light={light}
            profile={profile}
            clients={clients}
            bookings={bookings}
            services={services}
            publicUrl={publicUrl}
            setScreen={setScreen}
          />
        ) : null}

        {screen === 'clients' ? (
          <ClientsScreen
            light={light}
            clients={clients}
            bookings={bookings}
            openChatForClient={openChatForClient}
            openQuick={openQuick}
          />
        ) : null}

        {screen === 'analytics' ? (
          <AnalyticsScreen
            light={light}
            bookings={bookings}
            services={services}
            clients={clients}
          />
        ) : null}

        {screen === 'profile' ? (
          <ProfileScreen
            light={light}
            profile={profile}
            workspaceId={workspaceId}
            publicUrl={publicUrl}
            reload={load}
          />
        ) : null}

        {screen === 'settings' ? (
          <SettingsScreen
            light={light}
            workspaceId={workspaceId}
            settings={settings}
            setSettings={setSettings}
            reload={load}
          />
        ) : null}
      </Shell>

      <BookingSheet
        light={light}
        booking={selectedBooking}
        services={services}
        onClose={() => setSelectedBooking(null)}
        updateStatus={updateBookingStatus}
        updateTransfer={updateTransfer}
        offerTransfer={offerTransfer}
        openChat={openChatForBooking}
        openQuick={openQuick}
      />

      {quickOpen ? (
        <QuickBookingSheet
          key={`${quickPreset?.clientPhone || ''}-${quickPreset?.date || ''}-${quickPreset?.time || ''}-${quickPreset?.comment || ''}`}
          light={light}
          profile={profile}
          services={services}
          preset={quickPreset}
          onClose={() => {
            setQuickOpen(false);
            setQuickPreset(undefined);
          }}
          reload={load}
        />
      ) : null}
    </>
  );
}