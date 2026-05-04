'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type FormEvent,
} from 'react';
import {
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  Eye,
  Heart,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Palette,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Scissors,
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

import { BrandLogo } from '@/components/brand/brand-logo';
import { useApp } from '@/lib/app-context';
import { useLocale } from '@/lib/locale-context';
import { buildWorkspaceDatasetFromStored } from '@/lib/workspace-store';
import {
  authorizeTelegramMiniAppSession,
  getTelegramAppSessionHeaders,
  hasTelegramMiniAppRuntime,
} from '@/lib/telegram-miniapp-auth-client';
import { cn } from '@/lib/utils';
import type { AvailabilityDayInsight, ClientInsight, ServiceInsight, WorkspaceDataset } from '@/lib/master-workspace';
import type { ChatThreadListResponse, ChatThreadRecord } from '@/lib/chat-types';
import type { Booking, BookingStatus, MasterProfile, MasterProfileFormValues } from '@/lib/types';

type MiniScreen =
  | 'today'
  | 'schedule'
  | 'services'
  | 'chats'
  | 'more'
  | 'clients'
  | 'analytics'
  | 'profile'
  | 'settings';

type MiniProfileSaveValues = MasterProfileFormValues &
  Partial<
    Pick<
      MasterProfile,
      | 'priceHint'
      | 'experienceLabel'
      | 'responseTime'
      | 'workGallery'
      | 'reviews'
      | 'rating'
      | 'reviewCount'
      | 'locationMode'
      | 'address'
      | 'mapUrl'
    >
  >;

type EditableService = {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  status: 'active' | 'seasonal' | 'draft';
  visible: boolean;
};

type WeekdayEditor = {
  id: string;
  label: string;
  short: string;
  weekdayIndex: number;
  status: 'workday' | 'short' | 'day-off';
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
};

const RUB = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const STATUS_META: Record<BookingStatus, { label: string; dot: string; border: string; bg: string }> = {
  new: { label: 'Новая', dot: 'bg-sky-400', border: 'border-sky-300/20', bg: 'bg-sky-400/10 text-sky-100' },
  confirmed: { label: 'В плане', dot: 'bg-blue-400', border: 'border-blue-300/20', bg: 'bg-blue-400/10 text-blue-100' },
  completed: { label: 'Пришла', dot: 'bg-emerald-400', border: 'border-emerald-300/20', bg: 'bg-emerald-400/10 text-emerald-100' },
  no_show: { label: 'Не пришла', dot: 'bg-orange-400', border: 'border-orange-300/20', bg: 'bg-orange-400/10 text-orange-100' },
  cancelled: { label: 'Отмена', dot: 'bg-rose-400', border: 'border-rose-300/20', bg: 'bg-rose-400/10 text-rose-100' },
};

const WEEKDAYS: WeekdayEditor[] = [
  { id: 'mon', label: 'Понедельник', short: 'Пн', weekdayIndex: 0, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'tue', label: 'Вторник', short: 'Вт', weekdayIndex: 1, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'wed', label: 'Среда', short: 'Ср', weekdayIndex: 2, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'thu', label: 'Четверг', short: 'Чт', weekdayIndex: 3, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'fri', label: 'Пятница', short: 'Пт', weekdayIndex: 4, status: 'workday', start: '10:00', end: '19:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 'sat', label: 'Суббота', short: 'Сб', weekdayIndex: 5, status: 'short', start: '11:00', end: '17:00', breakStart: '', breakEnd: '' },
  { id: 'sun', label: 'Воскресенье', short: 'Вс', weekdayIndex: 6, status: 'day-off', start: '11:00', end: '16:00', breakStart: '', breakEnd: '' },
];

const FALLBACK_DATASET: WorkspaceDataset = {
  services: [],
  clients: [],
  daily: [],
  channels: [],
  weeklyLoad: [],
  peakHours: [],
  templates: [],
  availability: [],
  integrations: [],
  notifications: [],
  payments: [],
  plans: [],
  subscription: {
    id: null,
    planId: 'start',
    planName: 'Start',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: null,
    currentPeriodEnd: null,
    nextChargeLabel: '—',
    paymentMethodLabel: '—',
    cancelAtPeriodEnd: false,
    provider: 'manual',
  },
  limits: [],
  totals: {
    bookings: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
    visitors: 0,
    conversion: 0,
    averageCheck: 0,
    newClients: 0,
    returnRate: 0,
  },
};

function safeRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : typeof value === 'number' && Number.isFinite(value) ? String(value) : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const number = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(number) ? number : fallback;
}

function todayIso() {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function addDaysIso(base: string, days: number) {
  const date = new Date(`${base}T12:00:00`);
  date.setDate(date.getDate() + days);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function formatDay(dateIso: string) {
  const date = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(value?: string | null) {
  return (value || '').slice(0, 5) || '—';
}

function sortByDateTime(a: Booking, b: Booking) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}

function descByCreated(a: Booking, b: Booking) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function countsAsActive(status: BookingStatus) {
  return status === 'new' || status === 'confirmed' || status === 'completed';
}

function countsAsRevenue(status: BookingStatus) {
  return status === 'completed';
}

function getBookingAmount(booking: Booking, services: ServiceInsight[]) {
  if (typeof booking.priceAmount === 'number' && Number.isFinite(booking.priceAmount)) return booking.priceAmount;
  return services.find((service) => service.name === booking.service)?.price ?? 0;
}

function getInitials(name?: string | null) {
  const source = (name || 'КБ').trim();
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function splitInterval(value?: string | null) {
  const normalized = String(value ?? '').replace(/—/g, '–').replace(/-/g, '–');
  const [start, end] = normalized.split('–').map((item) => item.trim());
  return { start: (start || '10:00').slice(0, 5), end: (end || '20:00').slice(0, 5) };
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function validTimeRange(start: string, end: string) {
  const left = timeToMinutes(start);
  const right = timeToMinutes(end);
  return left !== null && right !== null && right > left;
}

function normalizeWeekAvailability(items: AvailabilityDayInsight[]) {
  const byIndex = new Map<number, AvailabilityDayInsight>();
  items.forEach((item) => {
    const record = safeRecord(item);
    const index = typeof record.weekdayIndex === 'number'
      ? record.weekdayIndex
      : WEEKDAYS.find((day) => day.id === item.id || day.label === item.label || day.short === item.label)?.weekdayIndex;
    if (typeof index === 'number' && index >= 0 && index <= 6 && !record.date) byIndex.set(index, item);
  });

  return WEEKDAYS.map((fallback) => {
    const stored = byIndex.get(fallback.weekdayIndex);
    if (!stored) return fallback;
    const work = splitInterval(stored.slots?.[0]);
    const pause = splitInterval(stored.breaks?.[0]);
    return {
      ...fallback,
      status: stored.status ?? fallback.status,
      start: work.start || fallback.start,
      end: work.end || fallback.end,
      breakStart: stored.breaks?.[0] ? pause.start : '',
      breakEnd: stored.breaks?.[0] ? pause.end : '',
    } satisfies WeekdayEditor;
  });
}

function serializeWeekAvailability(days: WeekdayEditor[]) {
  return days.map((day) => ({
    id: day.id,
    label: day.label,
    weekdayIndex: day.weekdayIndex,
    status: day.status,
    slots: day.status === 'day-off' || !validTimeRange(day.start, day.end) ? [] : [`${day.start}–${day.end}`],
    breaks: day.status === 'day-off' || !validTimeRange(day.breakStart, day.breakEnd) ? [] : [`${day.breakStart}–${day.breakEnd}`],
  }));
}

function profileSavePayload(profile: MasterProfile, patch: Partial<MiniProfileSaveValues>): MiniProfileSaveValues {
  return {
    name: profile.name,
    profession: profile.profession,
    city: profile.city,
    bio: profile.bio,
    servicesText: profile.services.join('\n'),
    phone: profile.phone ?? '',
    telegram: profile.telegram ?? '',
    whatsapp: profile.whatsapp ?? '',
    locationMode: profile.locationMode ?? 'online',
    address: profile.address ?? '',
    mapUrl: profile.mapUrl ?? '',
    hidePhone: Boolean(profile.hidePhone),
    hideTelegram: Boolean(profile.hideTelegram),
    hideWhatsapp: Boolean(profile.hideWhatsapp),
    slug: profile.slug,
    avatar: profile.avatar ?? '',
    priceHint: profile.priceHint,
    experienceLabel: profile.experienceLabel,
    responseTime: profile.responseTime,
    workGallery: profile.workGallery,
    reviews: profile.reviews,
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    ...patch,
  };
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const input = document.createElement('textarea');
      input.value = value;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(input);
      return ok;
    } catch {
      return false;
    }
  }
}

function MiniLabel({ children }: { children: ReactNode }) {
  return <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/32">{children}</div>;
}

function MiniCard({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(
        'rounded-[22px] border border-white/[0.075] bg-[#101010]/92 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-[22px]',
        onClick && 'active:scale-[0.99]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function MiniPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-[18px] border border-white/[0.07] bg-white/[0.035]', className)}>{children}</div>;
}

function MiniButton({
  children,
  onClick,
  disabled,
  variant = 'secondary',
  className,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-[15px] px-4 text-[12px] font-semibold tracking-[-0.035em] transition active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45',
        variant === 'primary' && 'bg-white text-black shadow-[0_14px_36px_rgba(255,255,255,0.10)]',
        variant === 'secondary' && 'border border-white/[0.08] bg-white/[0.045] text-white/78 hover:bg-white/[0.065]',
        variant === 'danger' && 'border border-rose-300/15 bg-rose-400/10 text-rose-100',
        variant === 'ghost' && 'text-white/48 hover:bg-white/[0.04] hover:text-white/80',
        className,
      )}
    >
      {children}
    </button>
  );
}

function MiniInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-11 w-full rounded-[15px] border border-white/[0.08] bg-white/[0.045] px-3 text-[13px] font-medium tracking-[-0.03em] text-white outline-none placeholder:text-white/24 focus:border-white/[0.18] focus:bg-white/[0.065]',
        className,
      )}
    />
  );
}

function MiniTextarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-[88px] w-full resize-none rounded-[15px] border border-white/[0.08] bg-white/[0.045] px-3 py-3 text-[13px] font-medium leading-5 tracking-[-0.03em] text-white outline-none placeholder:text-white/24 focus:border-white/[0.18] focus:bg-white/[0.065]',
        className,
      )}
    />
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.new;
  return (
    <span className={cn('inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-bold tracking-[-0.02em]', meta.border, meta.bg)}>
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <MiniPanel className="p-3">
      <div className="text-[10px] font-semibold tracking-[-0.025em] text-white/34">{label}</div>
      <div className="mt-1 text-[20px] font-semibold leading-none tracking-[-0.075em] text-white">{value}</div>
      {hint ? <div className="mt-1.5 truncate text-[10px] text-white/28">{hint}</div> : null}
    </MiniPanel>
  );
}

function EmptyBlock({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <MiniCard className="flex flex-col items-center px-5 py-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.045] text-white/42">{icon}</div>
      <div className="mt-4 text-[17px] font-semibold tracking-[-0.06em] text-white">{title}</div>
      <div className="mt-2 max-w-[260px] text-[12px] leading-5 text-white/38">{text}</div>
    </MiniCard>
  );
}

function MiniLoading() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#090909] px-5 text-white">
      <MiniCard className="w-full max-w-[330px] px-5 py-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.045]">
          <div className="size-5 animate-spin rounded-full border border-white/[0.12] border-t-white/70" />
        </div>
        <div className="mt-4 text-[17px] font-semibold tracking-[-0.06em]">Открываем mini app</div>
        <div className="mt-2 text-[12px] leading-5 text-white/38">Подтягиваем профиль, записи, услуги, чаты и график.</div>
      </MiniCard>
    </main>
  );
}

function AvatarMark({ profile, size = 'md' }: { profile?: MasterProfile | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'size-16 rounded-[22px]' : size === 'sm' ? 'size-10 rounded-[15px]' : 'size-12 rounded-[18px]';
  return (
    <div className={cn('flex shrink-0 items-center justify-center overflow-hidden border border-white/[0.08] bg-white/[0.055]', sizeClass)}>
      {profile?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar} alt="" className="size-full object-cover" />
      ) : (
        <span className="text-[11px] font-black tracking-[-0.05em] text-white">{getInitials(profile?.name)}</span>
      )}
    </div>
  );
}

function MiniShell({
  screen,
  setScreen,
  profile,
  accent,
  onRefresh,
  children,
}: {
  screen: MiniScreen;
  setScreen: (screen: MiniScreen) => void;
  profile: MasterProfile;
  accent: string;
  onRefresh: () => void;
  children: ReactNode;
}) {
  const nav = [
    { id: 'today' as const, label: 'Сегодня', icon: <LayoutDashboard className="size-4" /> },
    { id: 'schedule' as const, label: 'График', icon: <Clock3 className="size-4" /> },
    { id: 'services' as const, label: 'Услуги', icon: <Scissors className="size-4" /> },
    { id: 'chats' as const, label: 'Чаты', icon: <MessageCircle className="size-4" /> },
    { id: 'more' as const, label: 'Ещё', icon: <MoreHorizontal className="size-4" /> },
  ];

  const moreActive = ['more', 'clients', 'analytics', 'profile', 'settings'].includes(screen);

  return (
    <main
      className="min-h-[100svh] bg-[#090909] px-3 pt-[calc(var(--tg-safe-top,0px)+12px)] text-white"
      style={{ '--mini-accent': accent } as CSSProperties}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.065),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_24%)]" />
      <div className="relative mx-auto w-full max-w-[430px] pb-[calc(var(--tg-safe-bottom,0px)+96px)]">
        <header className="mb-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => setScreen('profile')} className="flex min-w-0 items-center gap-2.5 text-left active:scale-[0.99]">
            <AvatarMark profile={profile} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold tracking-[-0.055em] text-white">{profile.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-[-0.03em] text-white/34">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.10)]" />
                mini app мастера
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/m/${profile.slug}`}
              className="flex size-9 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.045] text-white/55 active:scale-95"
            >
              <Eye className="size-4" />
            </Link>
            <button
              type="button"
              onClick={onRefresh}
              className="flex size-9 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.045] text-white/55 active:scale-95"
            >
              <RefreshCcw className="size-4" />
            </button>
          </div>
        </header>

        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)]">
        <div className="grid grid-cols-5 gap-1 rounded-[24px] border border-white/[0.09] bg-[#101010]/88 p-1.5 shadow-[0_18px_70px_rgba(0,0,0,0.52)] backdrop-blur-[26px]">
          {nav.map((item) => {
            const active = item.id === 'more' ? moreActive : screen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={cn(
                  'flex h-[52px] min-h-[52px] flex-col items-center justify-center gap-1 rounded-[18px] text-[9.5px] font-bold tracking-[-0.04em] transition active:scale-[0.97]',
                  active ? 'bg-white/[0.075] text-white' : 'text-white/36 hover:bg-white/[0.035] hover:text-white/64',
                )}
              >
                <span style={active ? { color: 'var(--mini-accent)' } : undefined}>{item.icon}</span>
                <span>{item.label}</span>
                <span className={cn('size-1 rounded-full', active ? 'opacity-100' : 'opacity-0')} style={{ backgroundColor: 'var(--mini-accent)' }} />
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function BookingRow({ booking, onOpen, services }: { booking: Booking; onOpen: (booking: Booking) => void; services: ServiceInsight[] }) {
  return (
    <button type="button" onClick={() => onOpen(booking)} className="group flex w-full items-center gap-3 rounded-[18px] border border-white/[0.06] bg-white/[0.026] p-3 text-left active:scale-[0.99]">
      <div className="flex w-[58px] shrink-0 flex-col items-center rounded-[14px] border border-white/[0.07] bg-white/[0.035] py-2">
        <div className="text-[15px] font-semibold leading-none tracking-[-0.06em] text-white">{formatTime(booking.time)}</div>
        <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/28">{formatDay(booking.date).split(',')[0]}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold tracking-[-0.045em] text-white">{booking.clientName}</div>
            <div className="mt-1 truncate text-[11px] text-white/36">{booking.service}</div>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold tracking-[-0.02em] text-white/28">
          <span className="truncate">{booking.source || booking.channel || 'Клиент'}</span>
          <span>{getBookingAmount(booking, services) > 0 ? RUB.format(getBookingAmount(booking, services)) : '—'}</span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-white/18 group-hover:text-white/40" />
    </button>
  );
}

function TodayScreen({
  profile,
  bookings,
  dataset,
  onOpenBooking,
  setScreen,
}: {
  profile: MasterProfile;
  bookings: Booking[];
  dataset: WorkspaceDataset;
  onOpenBooking: (booking: Booking) => void;
  setScreen: (screen: MiniScreen) => void;
}) {
  const today = todayIso();
  const todayBookings = bookings.filter((booking) => booking.date === today).sort(sortByDateTime);
  const tomorrowBookings = bookings.filter((booking) => booking.date === addDaysIso(today, 1)).sort(sortByDateTime);
  const upcoming = bookings
    .filter((booking) => `${booking.date} ${booking.time}` >= `${today} 00:00` && booking.status !== 'cancelled')
    .sort(sortByDateTime)
    .slice(0, 8);
  const completedToday = todayBookings.filter((booking) => booking.status === 'completed').length;
  const activeToday = todayBookings.filter((booking) => countsAsActive(booking.status)).length;
  const revenueToday = todayBookings.filter((booking) => countsAsRevenue(booking.status)).reduce((sum, booking) => sum + getBookingAmount(booking, dataset.services), 0);
  const nextBooking = upcoming[0];

  return (
    <div className="space-y-3.5">
      <MiniCard className="overflow-hidden p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <MiniLabel>сегодня</MiniLabel>
            <div className="mt-2 text-[34px] font-semibold leading-[0.9] tracking-[-0.095em] text-white">{activeToday}</div>
            <div className="mt-2 text-[12px] leading-5 text-white/40">активных записей на {formatDay(today)}</div>
          </div>
          <div className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-2 text-[10px] font-bold tracking-[-0.02em] text-white/54">
            @{profile.slug}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatTile label="Пришли" value={completedToday} />
          <StatTile label="Выручка" value={RUB.format(revenueToday)} />
          <StatTile label="Конверсия" value={`${dataset.totals.conversion || 0}%`} />
        </div>
      </MiniCard>

      {nextBooking ? (
        <MiniCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <MiniLabel>следующая запись</MiniLabel>
              <div className="mt-2 text-[20px] font-semibold tracking-[-0.07em] text-white">{nextBooking.clientName}</div>
              <div className="mt-1 text-[12px] text-white/38">{formatDay(nextBooking.date)} · {formatTime(nextBooking.time)} · {nextBooking.service}</div>
            </div>
            <MiniButton variant="primary" onClick={() => onOpenBooking(nextBooking)} className="h-10 px-3">
              Открыть
            </MiniButton>
          </div>
        </MiniCard>
      ) : (
        <MiniCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.045] text-white/42">
              <CalendarClock className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold tracking-[-0.055em]">Свободный день</div>
              <div className="mt-1 text-[11px] leading-4 text-white/35">Открой график или услуги, чтобы клиент видел свободное время.</div>
            </div>
          </div>
        </MiniCard>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => setScreen('schedule')} className="rounded-[20px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.98]">
          <Clock3 className="size-4 text-white/44" />
          <div className="mt-3 text-[12px] font-semibold tracking-[-0.045em]">График</div>
          <div className="mt-1 text-[10px] text-white/30">слоты</div>
        </button>
        <button type="button" onClick={() => setScreen('services')} className="rounded-[20px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.98]">
          <Scissors className="size-4 text-white/44" />
          <div className="mt-3 text-[12px] font-semibold tracking-[-0.045em]">Услуги</div>
          <div className="mt-1 text-[10px] text-white/30">цены</div>
        </button>
        <button type="button" onClick={() => setScreen('chats')} className="rounded-[20px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.98]">
          <MessageCircle className="size-4 text-white/44" />
          <div className="mt-3 text-[12px] font-semibold tracking-[-0.045em]">Чаты</div>
          <div className="mt-1 text-[10px] text-white/30">ответы</div>
        </button>
      </div>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <MiniLabel>лента записей</MiniLabel>
          <div className="text-[10px] font-semibold text-white/30">завтра: {tomorrowBookings.length}</div>
        </div>
        {upcoming.length > 0 ? (
          <div className="space-y-2">
            {upcoming.map((booking) => (
              <BookingRow key={booking.id} booking={booking} services={dataset.services} onOpen={onOpenBooking} />
            ))}
          </div>
        ) : (
          <EmptyBlock title="Записей пока нет" text="Когда клиент запишется через публичную ссылку, запись появится здесь сразу." icon={<Bell className="size-5" />} />
        )}
      </section>
    </div>
  );
}

function ScheduleScreen({ availability, updateWorkspaceSection }: { availability: AvailabilityDayInsight[]; updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean> }) {
  const [days, setDays] = useState(() => normalizeWeekAvailability(availability));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDays(normalizeWeekAvailability(availability));
  }, [availability]);

  const updateDay = useCallback((id: string, patch: Partial<WeekdayEditor>) => {
    setDays((current) => current.map((day) => (day.id === id ? { ...day, ...patch } : day)));
    setSaved(false);
  }, []);

  async function save() {
    setSaving(true);
    const ok = await updateWorkspaceSection('availability', serializeWeekAvailability(days));
    setSaving(false);
    setSaved(ok);
  }

  function openWeekdays() {
    setDays((current) => current.map((day) => (day.weekdayIndex <= 4 ? { ...day, status: 'workday', start: day.start || '10:00', end: day.end || '20:00' } : day)));
    setSaved(false);
  }

  function closeWeekend() {
    setDays((current) => current.map((day) => (day.weekdayIndex >= 5 ? { ...day, status: 'day-off' } : day)));
    setSaved(false);
  }

  const openDays = days.filter((day) => day.status !== 'day-off').length;
  const totalSlots = days.reduce((sum, day) => (day.status === 'day-off' ? sum : sum + 1), 0);

  return (
    <div className="space-y-3.5">
      <MiniCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <MiniLabel>график</MiniLabel>
            <div className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.085em]">Неделя</div>
            <div className="mt-2 text-[12px] leading-5 text-white/38">Одна понятная сетка для клиента: рабочее окно + перерыв.</div>
          </div>
          <div className="text-right text-[10px] font-semibold text-white/32">
            {openDays} дн. открыто<br />{totalSlots} окон
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniButton variant="secondary" onClick={openWeekdays}>Будни открыть</MiniButton>
          <MiniButton variant="secondary" onClick={closeWeekend}>Выходные закрыть</MiniButton>
        </div>
      </MiniCard>

      <div className="space-y-2.5">
        {days.map((day) => (
          <MiniCard key={day.id} className="p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn('flex size-10 items-center justify-center rounded-[15px] border text-[12px] font-bold', day.status === 'day-off' ? 'border-white/[0.06] bg-white/[0.025] text-white/28' : 'border-white/[0.08] bg-white/[0.055] text-white')}>
                  {day.short}
                </div>
                <div>
                  <div className="text-[14px] font-semibold tracking-[-0.05em]">{day.label}</div>
                  <div className="mt-0.5 text-[10px] text-white/30">{day.status === 'day-off' ? 'закрыто' : `${day.start}–${day.end}`}</div>
                </div>
              </div>
              <select
                value={day.status}
                onChange={(event) => updateDay(day.id, { status: event.target.value as WeekdayEditor['status'] })}
                className="h-9 rounded-[13px] border border-white/[0.08] bg-[#171717] px-2 text-[11px] font-semibold text-white outline-none"
              >
                <option value="workday">рабочий</option>
                <option value="short">короткий</option>
                <option value="day-off">выходной</option>
              </select>
            </div>
            {day.status !== 'day-off' ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniInput type="time" value={day.start} onChange={(event) => updateDay(day.id, { start: event.target.value })} />
                <MiniInput type="time" value={day.end} onChange={(event) => updateDay(day.id, { end: event.target.value })} />
                <MiniInput type="time" value={day.breakStart} onChange={(event) => updateDay(day.id, { breakStart: event.target.value })} placeholder="перерыв с" />
                <MiniInput type="time" value={day.breakEnd} onChange={(event) => updateDay(day.id, { breakEnd: event.target.value })} placeholder="перерыв до" />
              </div>
            ) : null}
          </MiniCard>
        ))}
      </div>

      <MiniButton variant="primary" className="sticky bottom-[92px] z-20 w-full" onClick={() => void save()} disabled={saving}>
        <Save className="size-4" />
        {saving ? 'Сохраняю...' : saved ? 'Сохранено' : 'Сохранить график'}
      </MiniButton>
    </div>
  );
}

function normalizeServices(profile: MasterProfile, services: ServiceInsight[]) {
  const source = services.length > 0
    ? services
    : profile.services.map((name, index) => ({
        id: `service-${index}`,
        name,
        duration: 60,
        price: 0,
        category: 'Основное',
        status: 'active' as const,
        visible: true,
        bookings: 0,
        revenue: 0,
        popularity: 0,
      }));

  return source.map((service, index) => ({
    id: service.id || `service-${index}`,
    name: service.name || `Услуга ${index + 1}`,
    duration: Number.isFinite(service.duration) ? service.duration : 60,
    price: Number.isFinite(service.price) ? service.price : 0,
    category: service.category || 'Основное',
    status: service.status === 'draft' || service.status === 'seasonal' ? service.status : 'active',
    visible: service.visible !== false,
  } satisfies EditableService));
}

function ServicesScreen({
  profile,
  services,
  onSaveProfile,
  updateWorkspaceSection,
}: {
  profile: MasterProfile;
  services: ServiceInsight[];
  onSaveProfile: (values: MiniProfileSaveValues) => Promise<{ success: boolean; error?: string }>;
  updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean>;
}) {
  const [items, setItems] = useState(() => normalizeServices(profile, services));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setItems(normalizeServices(profile, services));
  }, [profile, services]);

  function updateItem(id: string, patch: Partial<EditableService>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setMessage('');
  }

  function addService() {
    setItems((current) => [
      ...current,
      {
        id: `service-${Date.now()}`,
        name: 'Новая услуга',
        duration: 60,
        price: 0,
        category: 'Основное',
        status: 'draft',
        visible: true,
      },
    ]);
    setMessage('');
  }

  async function save() {
    const cleaned = items
      .map((item, index) => ({
        id: item.id || `service-${index}`,
        name: item.name.trim(),
        duration: Math.max(15, Math.round(item.duration || 60)),
        price: Math.max(0, Math.round(item.price || 0)),
        category: item.category.trim() || 'Основное',
        status: item.status,
        visible: item.visible,
        bookings: 0,
        revenue: 0,
        popularity: 0,
      }))
      .filter((item) => item.name);

    if (cleaned.length === 0) {
      setMessage('Добавь хотя бы одну услугу.');
      return;
    }

    setSaving(true);
    const ok = await updateWorkspaceSection('services', cleaned);
    const profileResult = await onSaveProfile(profileSavePayload(profile, {
      servicesText: cleaned.map((item) => item.name).join('\n'),
    }));
    setSaving(false);
    setMessage(ok && profileResult.success ? 'Услуги сохранены и попадут на страницу клиента.' : profileResult.error || 'Не получилось сохранить услуги.');
  }

  const activeCount = items.filter((item) => item.visible && item.status !== 'draft').length;
  const averagePrice = activeCount > 0 ? Math.round(items.filter((item) => item.visible && item.status !== 'draft').reduce((sum, item) => sum + item.price, 0) / activeCount) : 0;

  return (
    <div className="space-y-3.5">
      <MiniCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <MiniLabel>услуги</MiniLabel>
            <div className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.085em]">Прайс</div>
            <div className="mt-2 text-[12px] leading-5 text-white/38">То, что клиент выбирает на публичной странице.</div>
          </div>
          <MiniButton variant="secondary" onClick={addService} className="h-10 px-3">
            <Plus className="size-4" />
            Добавить
          </MiniButton>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatTile label="Видимых" value={activeCount} />
          <StatTile label="Средний чек" value={averagePrice > 0 ? RUB.format(averagePrice) : '—'} />
        </div>
      </MiniCard>

      <div className="space-y-2.5">
        {items.map((item) => (
          <MiniCard key={item.id} className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <MiniInput value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} placeholder="Название услуги" />
              </div>
              <button type="button" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} className="flex size-11 shrink-0 items-center justify-center rounded-[15px] border border-white/[0.08] bg-white/[0.045] text-white/40 active:scale-95">
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <MiniInput inputMode="numeric" value={item.price ? String(item.price) : ''} onChange={(event) => updateItem(item.id, { price: asNumber(event.target.value) })} placeholder="Цена" />
              <MiniInput inputMode="numeric" value={String(item.duration)} onChange={(event) => updateItem(item.id, { duration: asNumber(event.target.value, 60) })} placeholder="Минут" />
            </div>
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
              <MiniInput value={item.category} onChange={(event) => updateItem(item.id, { category: event.target.value })} placeholder="Категория" />
              <select value={item.status} onChange={(event) => updateItem(item.id, { status: event.target.value as EditableService['status'] })} className="h-11 rounded-[15px] border border-white/[0.08] bg-[#171717] px-3 text-[11px] font-semibold text-white outline-none">
                <option value="active">активна</option>
                <option value="seasonal">сезон</option>
                <option value="draft">черновик</option>
              </select>
            </div>
            <button type="button" onClick={() => updateItem(item.id, { visible: !item.visible })} className="mt-2 flex h-10 w-full items-center justify-between rounded-[14px] border border-white/[0.07] bg-white/[0.032] px-3 text-[11px] font-semibold text-white/56">
              <span>{item.visible ? 'Показывается клиентам' : 'Скрыта со страницы клиента'}</span>
              <span className={cn('size-2 rounded-full', item.visible ? 'bg-emerald-400' : 'bg-white/20')} />
            </button>
          </MiniCard>
        ))}
      </div>

      {message ? <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[12px] text-white/50">{message}</div> : null}
      <MiniButton variant="primary" className="sticky bottom-[92px] z-20 w-full" onClick={() => void save()} disabled={saving}>
        <Save className="size-4" />
        {saving ? 'Сохраняю...' : 'Сохранить услуги'}
      </MiniButton>
    </div>
  );
}

function ChatsScreen() {
  const [threads, setThreads] = useState<ChatThreadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ChatThreadRecord | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chats', {
        credentials: 'include',
        cache: 'no-store',
        headers: getTelegramAppSessionHeaders(),
      });
      if (!response.ok) throw new Error('failed');
      const payload = (await response.json()) as ChatThreadListResponse;
      setThreads(Array.isArray(payload.threads) ? payload.threads : []);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function send() {
    const text = draft.trim();
    if (!active || !text) return;
    setSending(true);
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...getTelegramAppSessionHeaders(),
        },
        body: JSON.stringify({
          threadId: active.id,
          body: text,
          author: 'master',
          viaBot: true,
          clientMessageKey: `${active.id}-${Date.now()}`,
        }),
      });
      if (!response.ok) throw new Error('send_failed');
      setDraft('');
      await load();
      setActive((current) => threads.find((thread) => thread.id === current?.id) ?? current);
    } catch {
      // stay in the chat, user keeps the draft
    } finally {
      setSending(false);
    }
  }

  const ordered = useMemo(() => [...threads].sort((a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime()), [threads]);

  if (loading) {
    return <EmptyBlock title="Загружаю чаты" text="Проверяю сообщения и заявки из Telegram, VK и публичной страницы." icon={<MessageCircle className="size-5" />} />;
  }

  return (
    <div className="space-y-3.5">
      <MiniCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <MiniLabel>чаты</MiniLabel>
            <div className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.085em]">Диалоги</div>
            <div className="mt-2 text-[12px] leading-5 text-white/38">Все заявки и сообщения в короткой мобильной ленте.</div>
          </div>
          <MiniButton variant="secondary" className="h-10 px-3" onClick={() => void load()}>
            <RefreshCcw className="size-4" />
          </MiniButton>
        </div>
      </MiniCard>

      {ordered.length === 0 ? (
        <EmptyBlock title="Чатов пока нет" text="Когда появится запись или клиент напишет через бота, диалог подтянется сюда." icon={<MessageCircle className="size-5" />} />
      ) : (
        <div className="space-y-2">
          {ordered.map((thread) => (
            <button key={thread.id} type="button" onClick={() => setActive(thread)} className="flex w-full items-center gap-3 rounded-[20px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.99]">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.045] text-[11px] font-black tracking-[-0.05em] text-white">
                {getInitials(thread.clientName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-[14px] font-semibold tracking-[-0.05em]">{thread.clientName}</div>
                  <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[9px] font-bold text-white/36">{thread.channel}</span>
                </div>
                <div className="mt-1 truncate text-[11px] text-white/34">{thread.lastMessagePreview || thread.messages?.at(-1)?.body || 'Диалог открыт'}</div>
              </div>
              {thread.unreadCount > 0 ? <span className="flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">{thread.unreadCount}</span> : null}
            </button>
          ))}
        </div>
      )}

      {active ? (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/55 px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)] backdrop-blur-[8px]">
          <div className="mx-auto flex max-h-[82svh] w-full max-w-[430px] flex-col overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.72)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] p-4">
              <div className="min-w-0">
                <div className="text-[17px] font-semibold tracking-[-0.06em]">{active.clientName}</div>
                <div className="mt-1 text-[11px] text-white/34">{active.clientPhone || active.channel}</div>
              </div>
              <button type="button" onClick={() => setActive(null)} className="flex size-9 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.045] text-white/52">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {(active.messages ?? []).length === 0 ? (
                <div className="py-8 text-center text-[12px] text-white/32">Сообщений пока нет</div>
              ) : (
                active.messages.map((message) => (
                  <div key={message.id} className={cn('max-w-[86%] rounded-[18px] px-3 py-2 text-[12px] leading-5', message.author === 'master' ? 'ml-auto bg-white text-black' : message.author === 'system' ? 'mx-auto bg-white/[0.05] text-white/42' : 'bg-white/[0.055] text-white/76')}>
                    {message.body}
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-white/[0.08] p-3">
              <div className="flex gap-2">
                <MiniInput value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ответ клиенту" onKeyDown={(event) => {
                  if (event.key === 'Enter') void send();
                }} />
                <MiniButton variant="primary" disabled={sending || !draft.trim()} onClick={() => void send()} className="h-11 w-12 shrink-0 px-0">
                  <Send className="size-4" />
                </MiniButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClientsScreen({ clients, updateWorkspaceSection, workspaceData }: { clients: ClientInsight[]; updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean>; workspaceData: Record<string, unknown> }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ClientInsight | null>(null);
  const notes = safeRecord(workspaceData.clientNotes) as Record<string, string>;
  const favorites = safeRecord(workspaceData.clientFavorites) as Record<string, boolean>;
  const filtered = clients.filter((client) => `${client.name} ${client.phone} ${client.service}`.toLowerCase().includes(query.toLowerCase().trim()));

  async function toggleFavorite(client: ClientInsight) {
    await updateWorkspaceSection('clientFavorites', { ...favorites, [client.id]: !favorites[client.id] });
  }

  async function saveNote(client: ClientInsight, note: string) {
    await updateWorkspaceSection('clientNotes', { ...notes, [client.id]: note });
  }

  return (
    <div className="space-y-3.5">
      <MiniCard className="p-4">
        <MiniLabel>клиенты</MiniLabel>
        <div className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.085em]">База</div>
        <div className="mt-4"><MiniInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, телефону, услуге" /></div>
      </MiniCard>

      {filtered.length === 0 ? (
        <EmptyBlock title="Клиентов нет" text="Клиенты появятся после первых записей и сообщений." icon={<Users2 className="size-5" />} />
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => (
            <button key={client.id} type="button" onClick={() => setSelected(client)} className="flex w-full items-center gap-3 rounded-[20px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.99]">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.045] text-[11px] font-black tracking-[-0.05em]">{getInitials(client.name)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-[14px] font-semibold tracking-[-0.05em]">{client.name}</div>
                  {(favorites[client.id] || client.favorite) ? <Star className="size-3.5 fill-white text-white" /> : null}
                </div>
                <div className="mt-1 truncate text-[11px] text-white/34">{client.visits} визитов · {client.service || 'услуга'} · {client.phone}</div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-white/20" />
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <ClientSheet client={selected} note={notes[selected.id] ?? selected.note ?? ''} favorite={Boolean(favorites[selected.id] ?? selected.favorite)} onClose={() => setSelected(null)} onFavorite={() => void toggleFavorite(selected)} onSaveNote={(note) => void saveNote(selected, note)} />
      ) : null}
    </div>
  );
}

function ClientSheet({ client, note, favorite, onClose, onFavorite, onSaveNote }: { client: ClientInsight; note: string; favorite: boolean; onClose: () => void; onFavorite: () => void; onSaveNote: (note: string) => void }) {
  const [draft, setDraft] = useState(note);
  useEffect(() => setDraft(note), [note]);
  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/55 px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)] backdrop-blur-[8px]">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.72)]">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] p-4">
          <div>
            <MiniLabel>клиент</MiniLabel>
            <div className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.08em]">{client.name}</div>
            <div className="mt-2 text-[12px] text-white/40">{client.phone}</div>
          </div>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.045] text-white/52"><X className="size-4" /></button>
        </div>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            <StatTile label="Визиты" value={client.visits} />
            <StatTile label="Чек" value={client.averageCheck ? RUB.format(client.averageCheck) : '—'} />
            <StatTile label="Выручка" value={client.totalRevenue ? RUB.format(client.totalRevenue) : '—'} />
          </div>
          <MiniTextarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Заметка по клиенту" />
          <div className="grid grid-cols-2 gap-2">
            <MiniButton variant="secondary" onClick={onFavorite}>{favorite ? <Star className="size-4 fill-white" /> : <Star className="size-4" />}{favorite ? 'VIP' : 'В VIP'}</MiniButton>
            <MiniButton variant="primary" onClick={() => onSaveNote(draft)}>Сохранить</MiniButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen({ dataset }: { dataset: WorkspaceDataset }) {
  const maxDaily = Math.max(1, ...dataset.daily.map((day) => day.requests));
  const channels = dataset.channels.filter((channel) => channel.visitors > 0 || channel.bookings > 0).slice(0, 4);

  return (
    <div className="space-y-3.5">
      <MiniCard className="p-4">
        <MiniLabel>аналитика</MiniLabel>
        <div className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.085em]">Пульс</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatTile label="Записи" value={dataset.totals.bookings} />
          <StatTile label="Выручка" value={RUB.format(dataset.totals.revenue || 0)} />
          <StatTile label="Средний чек" value={dataset.totals.averageCheck ? RUB.format(dataset.totals.averageCheck) : '—'} />
          <StatTile label="Возврат" value={`${dataset.totals.returnRate || 0}%`} />
        </div>
      </MiniCard>

      <MiniCard className="p-4">
        <div className="flex items-center justify-between"><MiniLabel>по дням</MiniLabel><span className="text-[10px] text-white/30">последние дни</span></div>
        <div className="mt-4 space-y-3">
          {dataset.daily.slice(-7).map((day) => (
            <div key={day.date} className="grid grid-cols-[74px_1fr_36px] items-center gap-2">
              <div className="text-[10px] font-semibold text-white/34">{day.label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.055]"><div className="h-full rounded-full bg-white/60" style={{ width: `${Math.max(5, (day.requests / maxDaily) * 100)}%` }} /></div>
              <div className="text-right text-[10px] font-semibold text-white/44">{day.requests}</div>
            </div>
          ))}
        </div>
      </MiniCard>

      <MiniCard className="p-4">
        <MiniLabel>каналы</MiniLabel>
        <div className="mt-3 space-y-2">
          {(channels.length ? channels : dataset.channels.slice(0, 4)).map((channel) => (
            <div key={channel.id} className="flex items-center justify-between rounded-[16px] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <div>
                <div className="text-[13px] font-semibold tracking-[-0.045em]">{channel.label}</div>
                <div className="mt-0.5 text-[10px] text-white/30">{channel.visitors} визитов · {channel.conversion}%</div>
              </div>
              <div className="text-right text-[13px] font-semibold tracking-[-0.045em]">{channel.bookings}</div>
            </div>
          ))}
        </div>
      </MiniCard>
    </div>
  );
}

function ProfileScreen({ profile, onSave, getPublicPath }: { profile: MasterProfile; onSave: (values: MiniProfileSaveValues) => Promise<{ success: boolean; error?: string }>; getPublicPath: (slug: string) => string }) {
  const [form, setForm] = useState(() => profileSavePayload(profile, {}));
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => setForm(profileSavePayload(profile, {})), [profile]);

  const publicUrl = typeof window === 'undefined' ? getPublicPath(profile.slug) : `${window.location.origin}${getPublicPath(profile.slug)}`;

  function patch(value: Partial<MiniProfileSaveValues>) {
    setForm((current) => ({ ...current, ...value }));
    setMessage('');
  }

  async function save() {
    setSaving(true);
    const result = await onSave(form);
    setSaving(false);
    setMessage(result.success ? 'Профиль сохранён.' : result.error || 'Не удалось сохранить профиль.');
  }

  async function copyLink() {
    const ok = await copyText(publicUrl);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-3.5">
      <MiniCard className="p-4">
        <div className="flex items-center gap-3">
          <AvatarMark profile={profile} size="lg" />
          <div className="min-w-0 flex-1">
            <MiniLabel>профиль</MiniLabel>
            <div className="mt-2 truncate text-[24px] font-semibold leading-none tracking-[-0.085em]">{profile.name}</div>
            <div className="mt-2 flex items-center gap-2 rounded-[14px] border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[11px] text-white/40">
              <span className="min-w-0 flex-1 truncate">{publicUrl}</span>
              <button type="button" onClick={() => void copyLink()} className="text-white/62"><Copy className="size-3.5" /></button>
            </div>
            {copied ? <div className="mt-1 text-[10px] text-white/38">Ссылка скопирована</div> : null}
          </div>
        </div>
      </MiniCard>

      <MiniCard className="space-y-2 p-4">
        <MiniInput value={form.name} onChange={(event) => patch({ name: event.target.value })} placeholder="Имя" />
        <MiniInput value={form.profession} onChange={(event) => patch({ profession: event.target.value })} placeholder="Специализация" />
        <MiniInput value={form.city} onChange={(event) => patch({ city: event.target.value })} placeholder="Город" />
        <MiniTextarea value={form.bio} onChange={(event) => patch({ bio: event.target.value })} placeholder="Краткое описание" />
        <MiniInput value={form.avatar} onChange={(event) => patch({ avatar: event.target.value })} placeholder="Ссылка на аватар" />
      </MiniCard>

      <MiniCard className="space-y-2 p-4">
        <MiniLabel>контакты</MiniLabel>
        <MiniInput value={form.phone} onChange={(event) => patch({ phone: event.target.value })} placeholder="Телефон" />
        <MiniInput value={form.telegram} onChange={(event) => patch({ telegram: event.target.value })} placeholder="Telegram" />
        <MiniInput value={form.whatsapp} onChange={(event) => patch({ whatsapp: event.target.value })} placeholder="WhatsApp / VK" />
      </MiniCard>

      {message ? <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[12px] text-white/50">{message}</div> : null}
      <MiniButton variant="primary" className="sticky bottom-[92px] z-20 w-full" onClick={() => void save()} disabled={saving}>
        <Save className="size-4" />
        {saving ? 'Сохраняю...' : 'Сохранить профиль'}
      </MiniButton>
    </div>
  );
}

function SettingsScreen({ workspaceData, updateWorkspaceSection }: { workspaceData: Record<string, unknown>; updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean> }) {
  const [saving, setSaving] = useState<string | null>(null);
  const quietHours = workspaceData.quietHours === true;
  const fallbackEmail = workspaceData.fallbackEmail !== false;
  const miniSettings = safeRecord(workspaceData.miniSettings);

  async function toggle(section: string, value: boolean) {
    setSaving(section);
    await updateWorkspaceSection(section, value);
    setSaving(null);
  }

  async function saveMini(key: string, value: boolean) {
    setSaving(key);
    await updateWorkspaceSection('miniSettings', { ...miniSettings, [key]: value });
    setSaving(null);
  }

  return (
    <div className="space-y-3.5">
      <MiniCard className="p-4">
        <MiniLabel>настройки</MiniLabel>
        <div className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.085em]">Mini app</div>
        <div className="mt-2 text-[12px] leading-5 text-white/38">Тихие и аккуратные настройки без лишних экранов.</div>
      </MiniCard>
      <div className="space-y-2">
        <SettingRow title="Тихие часы" text="Не шуметь уведомлениями ночью" enabled={quietHours} loading={saving === 'quietHours'} onClick={() => void toggle('quietHours', !quietHours)} />
        <SettingRow title="Запасной email" text="Подстраховка, если бот не доставил сообщение" enabled={fallbackEmail} loading={saving === 'fallbackEmail'} onClick={() => void toggle('fallbackEmail', !fallbackEmail)} />
        <SettingRow title="Компактный режим" text="Меньше текста, больше быстрых действий" enabled={miniSettings.compactMode === true} loading={saving === 'compactMode'} onClick={() => void saveMini('compactMode', miniSettings.compactMode !== true)} />
      </div>
    </div>
  );
}

function SettingRow({ title, text, enabled, loading, onClick }: { title: string; text: string; enabled: boolean; loading?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.99] disabled:opacity-60">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold tracking-[-0.05em]">{title}</div>
        <div className="mt-1 text-[11px] text-white/34">{text}</div>
      </div>
      <div className={cn('flex h-7 w-12 items-center rounded-full border p-1 transition', enabled ? 'border-white/[0.12] bg-white' : 'border-white/[0.08] bg-white/[0.045]')}>
        <span className={cn('size-5 rounded-full transition', enabled ? 'translate-x-5 bg-black' : 'bg-white/30')} />
      </div>
    </button>
  );
}

function MoreScreen({ setScreen, dataset }: { setScreen: (screen: MiniScreen) => void; dataset: WorkspaceDataset }) {
  const rows: Array<{ screen: MiniScreen; title: string; text: string; icon: ReactNode; value?: string | number }> = [
    { screen: 'clients', title: 'Клиенты', text: 'База, VIP и заметки', icon: <Users2 className="size-4" />, value: dataset.clients.length },
    { screen: 'analytics', title: 'Аналитика', text: 'Выручка, каналы, дни', icon: <BarChart3 className="size-4" />, value: dataset.totals.bookings },
    { screen: 'profile', title: 'Профиль', text: 'Имя, контакты, ссылка', icon: <UserRound className="size-4" /> },
    { screen: 'settings', title: 'Настройки', text: 'Уведомления и режимы', icon: <Settings className="size-4" /> },
  ];

  return (
    <div className="space-y-3.5">
      <MiniCard className="p-4">
        <MiniLabel>ещё</MiniLabel>
        <div className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.085em]">Управление</div>
        <div className="mt-2 text-[12px] leading-5 text-white/38">Всё второстепенное собрали сюда, чтобы главный экран не был перегружен.</div>
      </MiniCard>
      <div className="space-y-2">
        {rows.map((row) => (
          <button key={row.screen} type="button" onClick={() => setScreen(row.screen)} className="flex w-full items-center gap-3 rounded-[20px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.99]">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.045] text-white/46">{row.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold tracking-[-0.05em]">{row.title}</span>
              <span className="mt-1 block truncate text-[11px] text-white/34">{row.text}</span>
            </span>
            {row.value !== undefined ? <span className="text-[12px] font-semibold text-white/40">{row.value}</span> : null}
            <ChevronRight className="size-4 shrink-0 text-white/20" />
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniOnboarding({ onSave }: { onSave: (values: MiniProfileSaveValues) => Promise<{ success: boolean; error?: string }> }) {
  const [form, setForm] = useState<MiniProfileSaveValues>({
    name: '',
    profession: '',
    city: '',
    bio: '',
    servicesText: 'Консультация\nОсновная услуга',
    phone: '',
    telegram: '',
    whatsapp: '',
    locationMode: 'online',
    address: '',
    mapUrl: '',
    hidePhone: false,
    hideTelegram: false,
    hideWhatsapp: false,
    slug: '',
    avatar: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function patch(value: Partial<MiniProfileSaveValues>) {
    setForm((current) => ({ ...current, ...value }));
    setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const result = await onSave(form);
    setSaving(false);
    if (!result.success) setError(result.error || 'Не получилось создать профиль.');
  }

  return (
    <main className="min-h-[100svh] bg-[#090909] px-3 py-[calc(var(--tg-safe-top,0px)+14px)] text-white">
      <div className="mx-auto w-full max-w-[430px] space-y-3.5 pb-[calc(var(--tg-safe-bottom,0px)+20px)]">
        <MiniCard className="p-5">
          <BrandLogo />
          <div className="mt-5 text-[31px] font-semibold leading-[0.93] tracking-[-0.095em]">Соберём профиль для mini app</div>
          <div className="mt-3 text-[12px] leading-5 text-white/40">Минимум полей, чтобы запустить страницу клиента, услуги и запись.</div>
        </MiniCard>
        <form onSubmit={(event) => void submit(event)} className="space-y-3">
          <MiniCard className="space-y-2 p-4">
            <MiniInput value={form.name} onChange={(event) => patch({ name: event.target.value })} placeholder="Имя мастера / салона" />
            <MiniInput value={form.profession} onChange={(event) => patch({ profession: event.target.value })} placeholder="Специализация" />
            <MiniInput value={form.city} onChange={(event) => patch({ city: event.target.value })} placeholder="Город" />
            <MiniTextarea value={form.bio} onChange={(event) => patch({ bio: event.target.value })} placeholder="Коротко о себе" />
            <MiniTextarea value={form.servicesText} onChange={(event) => patch({ servicesText: event.target.value })} placeholder="Услуги, каждая с новой строки" />
          </MiniCard>
          {error ? <div className="rounded-[16px] border border-rose-300/15 bg-rose-400/10 px-3 py-2 text-[12px] text-rose-100">{error}</div> : null}
          <MiniButton type="submit" variant="primary" className="w-full" disabled={saving}>
            {saving ? 'Создаю...' : 'Создать mini app'}
          </MiniButton>
        </form>
      </div>
    </main>
  );
}

function BookingSheet({ booking, onClose, onStatus, services }: { booking: Booking | null; onClose: () => void; onStatus: (id: string, status: BookingStatus) => Promise<void>; services: ServiceInsight[] }) {
  const [updating, setUpdating] = useState<BookingStatus | null>(null);
  if (!booking) return null;

  async function update(status: BookingStatus) {
    setUpdating(status);
    await onStatus(booking.id, status);
    setUpdating(null);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-black/55 px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)] backdrop-blur-[8px]">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.72)]">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] p-4">
          <div className="min-w-0">
            <MiniLabel>запись</MiniLabel>
            <div className="mt-2 truncate text-[26px] font-semibold leading-none tracking-[-0.085em]">{booking.clientName}</div>
            <div className="mt-2 text-[12px] text-white/40">{formatDay(booking.date)} · {formatTime(booking.time)}</div>
          </div>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.045] text-white/52"><X className="size-4" /></button>
        </div>
        <div className="space-y-3 p-4">
          <MiniPanel className="p-3">
            <div className="text-[11px] text-white/32">Услуга</div>
            <div className="mt-1 text-[15px] font-semibold tracking-[-0.045em]">{booking.service}</div>
            <div className="mt-1 text-[11px] text-white/32">{getBookingAmount(booking, services) > 0 ? RUB.format(getBookingAmount(booking, services)) : 'без цены'} · {booking.clientPhone}</div>
          </MiniPanel>
          {booking.comment ? <MiniPanel className="p-3 text-[12px] leading-5 text-white/50">{booking.comment}</MiniPanel> : null}
          <div className="grid grid-cols-2 gap-2">
            <MiniButton variant="primary" disabled={Boolean(updating)} onClick={() => void update('completed')}><CheckCircle2 className="size-4" />Пришла</MiniButton>
            <MiniButton variant="secondary" disabled={Boolean(updating)} onClick={() => void update('confirmed')}><ShieldCheck className="size-4" />Подтвердить</MiniButton>
            <MiniButton variant="secondary" disabled={Boolean(updating)} onClick={() => void update('new')}><Bell className="size-4" />Новая</MiniButton>
            <MiniButton variant="danger" disabled={Boolean(updating)} onClick={() => void update('no_show')}><XCircle className="size-4" />Не пришла</MiniButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function resolveAccent(workspaceData: Record<string, unknown>) {
  const appearance = safeRecord(workspaceData.appearance);
  const raw = String(appearance.accentTone || appearance.publicAccent || appearance.accent || '').toLowerCase();
  if (raw.includes('blue')) return '#8bbcff';
  if (raw.includes('rose') || raw.includes('pink')) return '#f5a3bd';
  if (raw.includes('gold') || raw.includes('warm')) return '#e8c77a';
  if (raw.includes('sage') || raw.includes('green')) return '#a8d5ba';
  return '#ffffff';
}

export function MiniAppEntry() {
  const {
    hasHydrated,
    ownedProfile,
    bookings,
    workspaceData,
    saveProfile,
    updateBookingStatus,
    updateWorkspaceSection,
    refreshWorkspace,
    getPublicPath,
  } = useApp();
  const { locale } = useLocale();
  const [screen, setScreen] = useState<MiniScreen>('today');
  const [bootState, setBootState] = useState<'loading' | 'ready'>('loading');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const bootedRef = useRef(false);

  const workspaceRecord = safeRecord(workspaceData);
  const accent = resolveAccent(workspaceRecord);

  const dataset = useMemo(() => {
    if (!ownedProfile) return FALLBACK_DATASET;
    try {
      return buildWorkspaceDatasetFromStored(ownedProfile, bookings, locale, workspaceData);
    } catch {
      return FALLBACK_DATASET;
    }
  }, [bookings, locale, ownedProfile, workspaceData]);

  const orderedBookings = useMemo(() => [...bookings].sort(descByCreated), [bookings]);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    let cancelled = false;

    async function boot() {
      if (hasTelegramMiniAppRuntime()) {
        await authorizeTelegramMiniAppSession({ force: true, waitMs: 1800 }).catch(() => null);
      }
      await refreshWorkspace();
      if (!cancelled) setBootState('ready');
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [refreshWorkspace]);

  if (!hasHydrated || bootState === 'loading') {
    return <MiniLoading />;
  }

  if (!ownedProfile) {
    return <MiniOnboarding onSave={saveProfile} />;
  }

  return (
    <>
      <MiniShell screen={screen} setScreen={setScreen} profile={ownedProfile} accent={accent} onRefresh={() => void refreshWorkspace()}>
        {screen === 'today' ? (
          <TodayScreen profile={ownedProfile} bookings={orderedBookings} dataset={dataset} onOpenBooking={setSelectedBooking} setScreen={setScreen} />
        ) : null}
        {screen === 'schedule' ? (
          <ScheduleScreen availability={dataset.availability} updateWorkspaceSection={updateWorkspaceSection} />
        ) : null}
        {screen === 'services' ? (
          <ServicesScreen profile={ownedProfile} services={dataset.services} onSaveProfile={saveProfile} updateWorkspaceSection={updateWorkspaceSection} />
        ) : null}
        {screen === 'chats' ? <ChatsScreen /> : null}
        {screen === 'more' ? <MoreScreen setScreen={setScreen} dataset={dataset} /> : null}
        {screen === 'clients' ? <ClientsScreen clients={dataset.clients} workspaceData={workspaceRecord} updateWorkspaceSection={updateWorkspaceSection} /> : null}
        {screen === 'analytics' ? <AnalyticsScreen dataset={dataset} /> : null}
        {screen === 'profile' ? <ProfileScreen profile={ownedProfile} onSave={saveProfile} getPublicPath={getPublicPath} /> : null}
        {screen === 'settings' ? <SettingsScreen workspaceData={workspaceRecord} updateWorkspaceSection={updateWorkspaceSection} /> : null}
      </MiniShell>
      <BookingSheet booking={selectedBooking} onClose={() => setSelectedBooking(null)} onStatus={updateBookingStatus} services={dataset.services} />
    </>
  );
}
