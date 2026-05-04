'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { useTheme } from 'next-themes';
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
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Scissors,
  Send,
  Settings,
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
import type {
  AvailabilityDayInsight,
  ClientInsight,
  ServiceInsight,
  WorkspaceDataset,
} from '@/lib/master-workspace';
import type { ChatThreadListResponse, ChatThreadRecord } from '@/lib/chat-types';
import type { Booking, BookingStatus, MasterProfile, MasterProfileFormValues } from '@/lib/types';

type MiniScreen = 'workday' | 'calendar' | 'catalog' | 'dialogs' | 'hub' | 'clients' | 'analytics' | 'profile';
type ThemeTone = { light: boolean; accent: string };
type UpdateWorkspaceSection = <T>(section: string, value: T) => Promise<boolean>;
type SaveProfile = (values: MiniProfileSaveValues) => Promise<{ success: boolean; error?: string; profile?: MasterProfile }>;

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

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: 'Новая',
  confirmed: 'В плане',
  completed: 'Пришла',
  no_show: 'Не пришла',
  cancelled: 'Отмена',
};

const STATUS_DOT: Record<BookingStatus, string> = {
  new: '#8bbcff',
  confirmed: '#b8c7ff',
  completed: '#9ed7b7',
  no_show: '#e9c077',
  cancelled: '#eba3a3',
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

function asNumber(value: unknown, fallback = 0) {
  const number = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(number) ? number : fallback;
}

function makeId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
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

function formatDateHuman(dateIso: string, long = false) {
  const date = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString('ru-RU', {
    weekday: long ? 'long' : 'short',
    day: 'numeric',
    month: 'short',
  });
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

function activeStatus(status: BookingStatus) {
  return status === 'new' || status === 'confirmed' || status === 'completed';
}

function revenueStatus(status: BookingStatus) {
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

function resolveAccent(workspaceData: Record<string, unknown>) {
  const appearance = safeRecord(workspaceData.appearance);
  const raw = String(appearance.accentTone || appearance.publicAccent || appearance.accent || '').toLowerCase();
  if (raw.includes('blue')) return '#8bbcff';
  if (raw.includes('rose') || raw.includes('pink')) return '#f0a7bd';
  if (raw.includes('gold') || raw.includes('warm')) return '#e8c77a';
  if (raw.includes('sage') || raw.includes('green')) return '#a8d5ba';
  if (raw.includes('violet') || raw.includes('purple')) return '#c1adff';
  return '#d8d8d1';
}

function toneClasses(light: boolean) {
  return {
    page: light ? 'bg-[#f4f4f2] text-[#0e0e0e]' : 'bg-[#090909] text-white',
    card: light ? 'border-black/[0.08] bg-[#fbfbfa]' : 'border-white/[0.08] bg-[#101010]',
    panel: light ? 'border-black/[0.07] bg-black/[0.025]' : 'border-white/[0.07] bg-white/[0.035]',
    line: light ? 'border-black/[0.08]' : 'border-white/[0.08]',
    text: light ? 'text-[#0e0e0e]' : 'text-white',
    muted: light ? 'text-black/48' : 'text-white/42',
    faint: light ? 'text-black/32' : 'text-white/26',
    input: light
      ? 'border-black/[0.08] bg-white/70 text-black placeholder:text-black/28 focus:border-black/[0.18] focus:bg-white'
      : 'border-white/[0.08] bg-white/[0.045] text-white placeholder:text-white/24 focus:border-white/[0.18] focus:bg-white/[0.065]',
    ghost: light
      ? 'border-black/[0.08] bg-white/70 text-black/58 hover:border-black/[0.14] hover:bg-white hover:text-black'
      : 'border-white/[0.08] bg-white/[0.04] text-white/55 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white',
  };
}

function accentStyle(color: string, light: boolean, amount = 20): CSSProperties {
  return {
    background: light
      ? `color-mix(in srgb, ${color} ${amount}%, #ffffff)`
      : `color-mix(in srgb, ${color} ${Math.min(42, amount + 14)}%, #101010)`,
    borderColor: light
      ? `color-mix(in srgb, ${color} 34%, rgba(0,0,0,0.08))`
      : `color-mix(in srgb, ${color} 42%, rgba(255,255,255,0.08))`,
    color: light
      ? `color-mix(in srgb, ${color} 66%, #101010)`
      : `color-mix(in srgb, ${color} 14%, #ffffff)`,
  };
}

function MiniLabel({ children, light }: { children: ReactNode; light: boolean }) {
  const tone = toneClasses(light);
  return <div className={cn('text-[9px] font-bold uppercase tracking-[0.22em]', tone.faint)}>{children}</div>;
}

function MiniCard({ children, className, light, onClick }: { children: ReactNode; className?: string; light: boolean; onClick?: () => void }) {
  const tone = toneClasses(light);
  return (
    <section
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={cn('rounded-[11px] border shadow-none', tone.card, onClick && 'active:scale-[0.99]', className)}
    >
      {children}
    </section>
  );
}

function MiniPanel({ children, className, light }: { children: ReactNode; className?: string; light: boolean }) {
  const tone = toneClasses(light);
  return <div className={cn('rounded-[10px] border', tone.panel, className)}>{children}</div>;
}

function MiniButton({
  children,
  onClick,
  disabled,
  variant = 'secondary',
  className,
  type = 'button',
  theme,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  theme: ThemeTone;
}) {
  const tone = toneClasses(theme.light);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={variant === 'primary' ? accentStyle(theme.accent, theme.light, 22) : undefined}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-[9px] border px-3 text-[12px] font-semibold tracking-[-0.035em] transition active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45',
        variant === 'secondary' && tone.ghost,
        variant === 'ghost' && cn('border-transparent bg-transparent', tone.muted),
        variant === 'danger' && (theme.light ? 'border-rose-300/35 bg-rose-50 text-rose-700' : 'border-rose-300/15 bg-rose-400/10 text-rose-100'),
        className,
      )}
    >
      {children}
    </button>
  );
}

function MiniInput({ className, light, ...props }: InputHTMLAttributes<HTMLInputElement> & { light: boolean }) {
  const tone = toneClasses(light);
  return (
    <input
      {...props}
      className={cn(
        'h-10 w-full rounded-[9px] border px-3 text-[13px] font-medium tracking-[-0.03em] outline-none transition',
        tone.input,
        className,
      )}
    />
  );
}

function MiniTextarea({ className, light, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { light: boolean }) {
  const tone = toneClasses(light);
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-[86px] w-full resize-none rounded-[9px] border px-3 py-2.5 text-[13px] font-medium leading-5 tracking-[-0.03em] outline-none transition',
        tone.input,
        className,
      )}
    />
  );
}

function AvatarMark({ profile, light, className }: { profile?: MasterProfile | null; light: boolean; className?: string }) {
  const tone = toneClasses(light);
  return (
    <div className={cn('flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border', tone.panel, className)}>
      {profile?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar} alt="" className="size-full object-cover" />
      ) : (
        <span className="text-[11px] font-black tracking-[-0.05em]">{getInitials(profile?.name)}</span>
      )}
    </div>
  );
}

function StatusPill({ status, theme }: { status: BookingStatus; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  return (
    <span className={cn('inline-flex h-7 items-center gap-1.5 rounded-[9px] border px-2.5 text-[10px] font-bold tracking-[-0.02em]', tone.panel)}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[status] ?? theme.accent }} />
      {STATUS_LABELS[status] ?? 'Статус'}
    </span>
  );
}

function StatBox({ label, value, theme, hint }: { label: string; value: ReactNode; theme: ThemeTone; hint?: string }) {
  const tone = toneClasses(theme.light);
  return (
    <MiniPanel light={theme.light} className="p-3">
      <div className={cn('text-[10px] font-semibold tracking-[-0.02em]', tone.faint)}>{label}</div>
      <div className={cn('mt-1 text-[19px] font-semibold leading-none tracking-[-0.075em]', tone.text)}>{value}</div>
      {hint ? <div className={cn('mt-1 truncate text-[10px]', tone.faint)}>{hint}</div> : null}
    </MiniPanel>
  );
}

function EmptyBlock({ title, text, icon, theme }: { title: string; text: string; icon: ReactNode; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  return (
    <MiniCard light={theme.light} className="flex flex-col items-center px-5 py-8 text-center">
      <div className={cn('flex size-12 items-center justify-center rounded-[10px] border', tone.panel, tone.muted)}>{icon}</div>
      <div className={cn('mt-4 text-[17px] font-semibold tracking-[-0.06em]', tone.text)}>{title}</div>
      <div className={cn('mt-2 max-w-[270px] text-[12px] leading-5', tone.muted)}>{text}</div>
    </MiniCard>
  );
}

function MiniLoading() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#090909] px-5 text-white">
      <div className="w-full max-w-[330px] rounded-[14px] border border-white/[0.08] bg-[#101010] px-5 py-6 text-center">
        <BrandLogo />
        <div className="mx-auto mt-5 size-8 animate-spin rounded-full border border-white/[0.12] border-t-white/70" />
        <div className="mt-5 text-[16px] font-semibold tracking-[-0.06em]">Открываем mini app</div>
        <div className="mt-2 text-[12px] leading-5 text-white/42">Подтягиваем профиль, записи, услуги, график и чаты.</div>
      </div>
    </main>
  );
}

function MiniShell({
  screen,
  setScreen,
  profile,
  theme,
  onRefresh,
  children,
}: {
  screen: MiniScreen;
  setScreen: (screen: MiniScreen) => void;
  profile: MasterProfile;
  theme: ThemeTone;
  onRefresh: () => void;
  children: ReactNode;
}) {
  const tone = toneClasses(theme.light);
  const moreActive = screen === 'hub' || screen === 'clients' || screen === 'analytics' || screen === 'profile';
  const nav = [
    { id: 'workday' as const, label: 'Сегодня', icon: <LayoutDashboard className="size-4" /> },
    { id: 'calendar' as const, label: 'График', icon: <Clock3 className="size-4" /> },
    { id: 'catalog' as const, label: 'Услуги', icon: <Scissors className="size-4" /> },
    { id: 'dialogs' as const, label: 'Чаты', icon: <MessageCircle className="size-4" /> },
    { id: 'hub' as const, label: 'Ещё', icon: <MoreHorizontal className="size-4" /> },
  ];

  return (
    <main className={cn('min-h-[100svh]', tone.page)} style={{ '--mini-accent': theme.accent } as CSSProperties}>
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[440px] flex-col px-3 pb-[calc(var(--tg-safe-bottom,0px)+92px)] pt-[calc(var(--tg-safe-top,0px)+10px)]">
        <header className={cn('sticky top-0 z-30 -mx-3 border-b px-3 pb-2 pt-[calc(var(--tg-safe-top,0px)+8px)] backdrop-blur-[18px]', tone.page, tone.line)}>
          <div className="flex items-center gap-3">
            <AvatarMark profile={profile} light={theme.light} />
            <div className="min-w-0 flex-1">
              <div className={cn('truncate text-[14px] font-semibold tracking-[-0.055em]', tone.text)}>{profile.name}</div>
              <div className={cn('mt-0.5 flex items-center gap-1.5 text-[10px] font-medium', tone.muted)}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                <span className="truncate">@{profile.slug} · mini app</span>
              </div>
            </div>
            <button type="button" onClick={onRefresh} className={cn('flex size-9 items-center justify-center rounded-[9px] border transition active:scale-[0.985]', tone.ghost)}>
              <RefreshCcw className="size-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 py-3">{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)]">
        <div className={cn('mx-auto grid h-[64px] max-w-[440px] grid-cols-5 gap-1 rounded-[16px] border p-1 shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-[22px]', theme.light ? 'border-black/[0.08] bg-[#fbfbfa]/88' : 'border-white/[0.10] bg-[#101010]/88')}>
          {nav.map((item) => {
            const active = item.id === 'hub' ? moreActive : screen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={cn(
                  'flex min-h-0 flex-col items-center justify-center gap-1 rounded-[12px] text-[9.5px] font-bold tracking-[-0.04em] transition active:scale-[0.97]',
                  active ? (theme.light ? 'bg-black/[0.045] text-black' : 'bg-white/[0.075] text-white') : tone.faint,
                )}
              >
                <span style={active ? { color: theme.accent } : undefined}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function BookingRow({ booking, onOpen, services, theme }: { booking: Booking; onOpen: (booking: Booking) => void; services: ServiceInsight[]; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  return (
    <button type="button" onClick={() => onOpen(booking)} className={cn('flex w-full items-center gap-3 rounded-[10px] border p-2.5 text-left transition active:scale-[0.99]', tone.panel)}>
      <div className={cn('flex w-[58px] shrink-0 flex-col items-center rounded-[9px] border py-2', tone.panel)}>
        <div className={cn('text-[15px] font-semibold leading-none tracking-[-0.06em]', tone.text)}>{formatTime(booking.time)}</div>
        <div className={cn('mt-1 text-[9px] font-bold uppercase tracking-[0.12em]', tone.faint)}>{formatDateHuman(booking.date).split(',')[0]}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className={cn('truncate text-[14px] font-semibold tracking-[-0.045em]', tone.text)}>{booking.clientName}</div>
            <div className={cn('mt-1 truncate text-[11px]', tone.muted)}>{booking.service}</div>
          </div>
          <StatusPill status={booking.status} theme={theme} />
        </div>
        <div className={cn('mt-2 flex items-center justify-between gap-2 text-[10px] font-semibold tracking-[-0.02em]', tone.faint)}>
          <span className="truncate">{booking.source || booking.channel || 'Клиент'}</span>
          <span>{getBookingAmount(booking, services) > 0 ? RUB.format(getBookingAmount(booking, services)) : '—'}</span>
        </div>
      </div>
      <ChevronRight className={cn('size-4 shrink-0', tone.faint)} />
    </button>
  );
}

function DayStrip({ selectedDate, onSelect, theme }: { selectedDate: string; onSelect: (date: string) => void; theme: ThemeTone }) {
  const today = todayIso();
  const tone = toneClasses(theme.light);
  const days = Array.from({ length: 7 }, (_, index) => addDaysIso(today, index));
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((date) => {
        const active = date === selectedDate;
        const parsed = new Date(`${date}T12:00:00`);
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            style={active ? accentStyle(theme.accent, theme.light, 20) : undefined}
            className={cn('min-w-[58px] rounded-[10px] border px-2 py-2 text-center transition active:scale-[0.98]', active ? '' : tone.panel)}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] opacity-60">{parsed.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '')}</div>
            <div className="mt-1 text-[17px] font-semibold leading-none tracking-[-0.07em]">{parsed.getDate()}</div>
          </button>
        );
      })}
    </div>
  );
}

function WorkdayScreen({
  profile,
  bookings,
  dataset,
  onOpenBooking,
  setScreen,
  getPublicPath,
  theme,
}: {
  profile: MasterProfile;
  bookings: Booking[];
  dataset: WorkspaceDataset;
  onOpenBooking: (booking: Booking) => void;
  setScreen: (screen: MiniScreen) => void;
  getPublicPath: (slug: string) => string;
  theme: ThemeTone;
}) {
  const tone = toneClasses(theme.light);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const today = todayIso();
  const selectedBookings = bookings.filter((booking) => booking.date === selectedDate).sort(sortByDateTime);
  const activeSelected = selectedBookings.filter((booking) => activeStatus(booking.status));
  const completedSelected = selectedBookings.filter((booking) => booking.status === 'completed');
  const revenueSelected = completedSelected.reduce((sum, booking) => sum + getBookingAmount(booking, dataset.services), 0);
  const upcoming = bookings
    .filter((booking) => `${booking.date} ${booking.time}` >= `${today} 00:00` && booking.status !== 'cancelled')
    .sort(sortByDateTime);
  const nextBooking = upcoming[0];

  async function copyPublicLink() {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    await copyText(`${origin}${getPublicPath(profile.slug)}`);
  }

  return (
    <div className="space-y-3">
      <MiniCard light={theme.light} className="overflow-hidden">
        <div className={cn('border-b px-4 py-3', tone.line)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <MiniLabel light={theme.light}>рабочий экран</MiniLabel>
              <div className={cn('mt-2 text-[30px] font-semibold leading-[0.95] tracking-[-0.095em]', tone.text)}>Сегодня</div>
              <div className={cn('mt-2 text-[12px] leading-5', tone.muted)}>Записи, ближайший клиент и быстрые действия без лишних страниц.</div>
            </div>
            <button type="button" onClick={copyPublicLink} className={cn('flex h-8 shrink-0 items-center gap-1.5 rounded-[9px] border px-2.5 text-[10px] font-bold', tone.ghost)}>
              <Copy className="size-3.5" /> ссылка
            </button>
          </div>
        </div>

        <div className="p-3">
          <DayStrip selectedDate={selectedDate} onSelect={setSelectedDate} theme={theme} />
        </div>
      </MiniCard>

      {nextBooking ? (
        <MiniCard light={theme.light} className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <MiniLabel light={theme.light}>следующая запись</MiniLabel>
              <div className={cn('mt-2 flex items-baseline gap-2', tone.text)}>
                <span className="text-[28px] font-semibold leading-none tracking-[-0.09em]">{formatTime(nextBooking.time)}</span>
                <span className={cn('truncate text-[12px] font-medium', tone.muted)}>{formatDateHuman(nextBooking.date)}</span>
              </div>
              <div className={cn('mt-2 truncate text-[15px] font-semibold tracking-[-0.055em]', tone.text)}>{nextBooking.clientName}</div>
              <div className={cn('mt-1 truncate text-[12px]', tone.muted)}>{nextBooking.service}</div>
            </div>
            <MiniButton theme={theme} variant="primary" onClick={() => onOpenBooking(nextBooking)} className="shrink-0">
              Открыть
            </MiniButton>
          </div>
        </MiniCard>
      ) : (
        <EmptyBlock theme={theme} title="Ближайших записей нет" text="Открой график и услуги — клиент сможет выбрать свободное окно на публичной странице." icon={<CalendarClock className="size-5" />} />
      )}

      <div className="grid grid-cols-3 gap-2">
        <StatBox theme={theme} label="Записей" value={activeSelected.length} hint={formatDateHuman(selectedDate)} />
        <StatBox theme={theme} label="Пришли" value={completedSelected.length} />
        <StatBox theme={theme} label="Выручка" value={RUB.format(revenueSelected)} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => setScreen('calendar')} className={cn('rounded-[10px] border p-3 text-left transition active:scale-[0.98]', tone.panel)}>
          <Clock3 className={cn('size-4', tone.muted)} />
          <div className={cn('mt-3 text-[12px] font-semibold tracking-[-0.045em]', tone.text)}>График</div>
          <div className={cn('mt-1 text-[10px]', tone.faint)}>слоты</div>
        </button>
        <button type="button" onClick={() => setScreen('catalog')} className={cn('rounded-[10px] border p-3 text-left transition active:scale-[0.98]', tone.panel)}>
          <Scissors className={cn('size-4', tone.muted)} />
          <div className={cn('mt-3 text-[12px] font-semibold tracking-[-0.045em]', tone.text)}>Услуги</div>
          <div className={cn('mt-1 text-[10px]', tone.faint)}>цены</div>
        </button>
        <button type="button" onClick={() => setScreen('dialogs')} className={cn('rounded-[10px] border p-3 text-left transition active:scale-[0.98]', tone.panel)}>
          <MessageCircle className={cn('size-4', tone.muted)} />
          <div className={cn('mt-3 text-[12px] font-semibold tracking-[-0.045em]', tone.text)}>Чаты</div>
          <div className={cn('mt-1 text-[10px]', tone.faint)}>ответы</div>
        </button>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <MiniLabel light={theme.light}>{selectedDate === today ? 'лента сегодня' : formatDateHuman(selectedDate)}</MiniLabel>
          <div className={cn('text-[10px] font-semibold', tone.faint)}>{selectedBookings.length} записей</div>
        </div>
        {selectedBookings.length > 0 ? (
          <div className="space-y-2">
            {selectedBookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} services={dataset.services} onOpen={onOpenBooking} theme={theme} />
            ))}
          </div>
        ) : (
          <MiniCard light={theme.light} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('flex size-10 items-center justify-center rounded-[10px] border', tone.panel, tone.muted)}><Bell className="size-4" /></div>
              <div>
                <div className={cn('text-[14px] font-semibold tracking-[-0.05em]', tone.text)}>На этот день пусто</div>
                <div className={cn('mt-1 text-[11px] leading-4', tone.muted)}>Новые записи появятся здесь автоматически.</div>
              </div>
            </div>
          </MiniCard>
        )}
      </section>
    </div>
  );
}

function CalendarScreen({ availability, updateWorkspaceSection, theme }: { availability: AvailabilityDayInsight[]; updateWorkspaceSection: UpdateWorkspaceSection; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  const [days, setDays] = useState(() => normalizeWeekAvailability(availability));
  const [activeId, setActiveId] = useState('mon');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDays(normalizeWeekAvailability(availability));
  }, [availability]);

  const activeDay = days.find((day) => day.id === activeId) ?? days[0];

  function patchDay(id: string, patch: Partial<WeekdayEditor>) {
    setDays((current) => current.map((day) => (day.id === id ? { ...day, ...patch } : day)));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const ok = await updateWorkspaceSection('availability', serializeWeekAvailability(days));
    setSaving(false);
    setSaved(ok);
  }

  function applyWeekPreset() {
    setDays((current) => current.map((day) => (day.weekdayIndex <= 4 ? { ...day, status: 'workday', start: '10:00', end: '20:00', breakStart: '14:00', breakEnd: '15:00' } : { ...day, status: 'day-off' })));
    setSaved(false);
  }

  return (
    <div className="space-y-3">
      <MiniCard light={theme.light} className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <MiniLabel light={theme.light}>график</MiniLabel>
            <div className={cn('mt-2 text-[28px] font-semibold leading-none tracking-[-0.085em]', tone.text)}>Рабочая неделя</div>
            <div className={cn('mt-2 text-[12px] leading-5', tone.muted)}>Один день — одно рабочее окно. Перерыв не отдаётся клиентам как свободный слот.</div>
          </div>
          <MiniButton theme={theme} variant="secondary" onClick={applyWeekPreset} className="h-8 px-2.5 text-[10px]">шаблон</MiniButton>
        </div>
      </MiniCard>

      <MiniCard light={theme.light} className="p-3">
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const active = day.id === activeId;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setActiveId(day.id)}
                style={active ? accentStyle(theme.accent, theme.light, 18) : undefined}
                className={cn('rounded-[9px] border px-1 py-2 text-center transition active:scale-[0.98]', active ? '' : tone.panel)}
              >
                <div className="text-[10px] font-bold">{day.short}</div>
                <div className="mt-1 flex justify-center"><span className="size-1.5 rounded-full" style={{ backgroundColor: day.status === 'day-off' ? (theme.light ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.22)') : theme.accent }} /></div>
              </button>
            );
          })}
        </div>
      </MiniCard>

      <MiniCard light={theme.light} className="overflow-hidden">
        <div className={cn('border-b px-4 py-3', tone.line)}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className={cn('text-[18px] font-semibold tracking-[-0.07em]', tone.text)}>{activeDay.label}</div>
              <div className={cn('mt-1 text-[11px]', tone.muted)}>{activeDay.status === 'day-off' ? 'выходной' : `${activeDay.start}–${activeDay.end}`}</div>
            </div>
            <div className="flex gap-1.5">
              {(['workday', 'short', 'day-off'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => patchDay(activeDay.id, { status })}
                  style={activeDay.status === status ? accentStyle(theme.accent, theme.light, 18) : undefined}
                  className={cn('h-8 rounded-[9px] border px-2 text-[10px] font-bold', activeDay.status === status ? '' : tone.ghost)}
                >
                  {status === 'workday' ? 'день' : status === 'short' ? 'коротко' : 'выход'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1.5">
              <span className={cn('text-[10px] font-bold uppercase tracking-[0.14em]', tone.faint)}>начало</span>
              <MiniInput light={theme.light} type="time" value={activeDay.start} onChange={(event) => patchDay(activeDay.id, { start: event.target.value })} disabled={activeDay.status === 'day-off'} />
            </label>
            <label className="space-y-1.5">
              <span className={cn('text-[10px] font-bold uppercase tracking-[0.14em]', tone.faint)}>конец</span>
              <MiniInput light={theme.light} type="time" value={activeDay.end} onChange={(event) => patchDay(activeDay.id, { end: event.target.value })} disabled={activeDay.status === 'day-off'} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1.5">
              <span className={cn('text-[10px] font-bold uppercase tracking-[0.14em]', tone.faint)}>перерыв с</span>
              <MiniInput light={theme.light} type="time" value={activeDay.breakStart} onChange={(event) => patchDay(activeDay.id, { breakStart: event.target.value })} disabled={activeDay.status === 'day-off'} />
            </label>
            <label className="space-y-1.5">
              <span className={cn('text-[10px] font-bold uppercase tracking-[0.14em]', tone.faint)}>до</span>
              <MiniInput light={theme.light} type="time" value={activeDay.breakEnd} onChange={(event) => patchDay(activeDay.id, { breakEnd: event.target.value })} disabled={activeDay.status === 'day-off'} />
            </label>
          </div>

          <MiniPanel light={theme.light} className="p-3">
            <div className={cn('text-[11px] leading-5', tone.muted)}>
              Клиент увидит рабочее окно <b className={tone.text}>{activeDay.status === 'day-off' ? 'закрыто' : `${activeDay.start}–${activeDay.end}`}</b>{activeDay.breakStart && activeDay.breakEnd ? <> без перерыва <b className={tone.text}>{activeDay.breakStart}–{activeDay.breakEnd}</b></> : null}.
            </div>
          </MiniPanel>

          <MiniButton theme={theme} variant="primary" onClick={() => void save()} disabled={saving} className="w-full">
            <Save className="size-4" /> {saved ? 'Сохранено' : saving ? 'Сохраняю' : 'Сохранить график'}
          </MiniButton>
        </div>
      </MiniCard>
    </div>
  );
}

function normalizeEditableServices(profile: MasterProfile, services: ServiceInsight[]): EditableService[] {
  if (services.length > 0) {
    return services.map((service, index) => ({
      id: service.id || `service-${index}`,
      name: service.name,
      duration: service.duration || 60,
      price: service.price || 0,
      category: service.category || 'Основное',
      status: service.status || 'active',
      visible: service.visible !== false,
    }));
  }

  return profile.services.map((name, index) => ({
    id: `profile-service-${index}`,
    name,
    duration: 60,
    price: 0,
    category: 'Основное',
    status: 'active',
    visible: true,
  }));
}

function CatalogScreen({
  profile,
  services,
  onSaveProfile,
  updateWorkspaceSection,
  theme,
}: {
  profile: MasterProfile;
  services: ServiceInsight[];
  onSaveProfile: SaveProfile;
  updateWorkspaceSection: UpdateWorkspaceSection;
  theme: ThemeTone;
}) {
  const tone = toneClasses(theme.light);
  const [items, setItems] = useState(() => normalizeEditableServices(profile, services));
  const [draft, setDraft] = useState({ name: '', price: '', duration: '60', category: 'Основное' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setItems(normalizeEditableServices(profile, services));
  }, [profile, services]);

  function updateItem(id: string, patch: Partial<EditableService>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setSaved(false);
  }

  function addService() {
    const name = draft.name.trim();
    if (!name) return;
    setItems((current) => [
      {
        id: makeId('service'),
        name,
        duration: Math.max(15, asNumber(draft.duration, 60)),
        price: Math.max(0, asNumber(draft.price, 0)),
        category: draft.category.trim() || 'Основное',
        status: 'active',
        visible: true,
      },
      ...current,
    ]);
    setDraft({ name: '', price: '', duration: '60', category: 'Основное' });
    setSaved(false);
  }

  async function save() {
    const clean = items
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        duration: Math.max(15, asNumber(item.duration, 60)),
        price: Math.max(0, asNumber(item.price, 0)),
        category: item.category.trim() || 'Основное',
      }))
      .filter((item) => item.name);

    setSaving(true);
    const ok = await updateWorkspaceSection('services', clean);
    await onSaveProfile(profileSavePayload(profile, { servicesText: clean.filter((item) => item.visible).map((item) => item.name).join('\n') }));
    setSaving(false);
    setSaved(ok);
  }

  return (
    <div className="space-y-3">
      <MiniCard light={theme.light} className="p-4">
        <MiniLabel light={theme.light}>услуги</MiniLabel>
        <div className={cn('mt-2 text-[28px] font-semibold leading-none tracking-[-0.085em]', tone.text)}>Каталог</div>
        <div className={cn('mt-2 text-[12px] leading-5', tone.muted)}>Эти услуги сохраняются в общий профиль и подтягиваются на публичную страницу клиента.</div>
      </MiniCard>

      <MiniCard light={theme.light} className="p-3">
        <div className="grid grid-cols-[1fr_92px] gap-2">
          <MiniInput light={theme.light} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Название услуги" />
          <MiniInput light={theme.light} value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} placeholder="Цена" inputMode="numeric" />
        </div>
        <div className="mt-2 grid grid-cols-[1fr_92px] gap-2">
          <MiniInput light={theme.light} value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} placeholder="Категория" />
          <MiniInput light={theme.light} value={draft.duration} onChange={(event) => setDraft((current) => ({ ...current, duration: event.target.value }))} placeholder="Мин" inputMode="numeric" />
        </div>
        <MiniButton theme={theme} variant="primary" onClick={addService} disabled={!draft.name.trim()} className="mt-2 w-full">
          <Plus className="size-4" /> Добавить услугу
        </MiniButton>
      </MiniCard>

      <div className="space-y-2">
        {items.length === 0 ? (
          <EmptyBlock theme={theme} title="Каталог пустой" text="Добавь первую услугу, чтобы клиент понимал цену, длительность и мог записаться." icon={<Scissors className="size-5" />} />
        ) : (
          items.map((item) => (
            <MiniCard key={item.id} light={theme.light} className="p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <MiniInput light={theme.light} value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} />
                  <div className="grid grid-cols-[1fr_82px_82px] gap-2">
                    <MiniInput light={theme.light} value={item.category} onChange={(event) => updateItem(item.id, { category: event.target.value })} />
                    <MiniInput light={theme.light} value={String(item.duration)} onChange={(event) => updateItem(item.id, { duration: asNumber(event.target.value, 60) })} inputMode="numeric" />
                    <MiniInput light={theme.light} value={String(item.price)} onChange={(event) => updateItem(item.id, { price: asNumber(event.target.value, 0) })} inputMode="numeric" />
                  </div>
                </div>
                <button type="button" onClick={() => setItems((current) => current.filter((service) => service.id !== item.id))} className={cn('flex size-10 shrink-0 items-center justify-center rounded-[9px] border', tone.ghost)}>
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <button type="button" onClick={() => updateItem(item.id, { visible: !item.visible })} className={cn('h-8 rounded-[9px] border px-2.5 text-[10px] font-bold', tone.ghost)}>
                  {item.visible ? 'видно клиенту' : 'скрыто'}
                </button>
                <div className={cn('text-[11px] font-semibold', tone.muted)}>{item.duration} мин · {item.price ? RUB.format(item.price) : 'цена не указана'}</div>
              </div>
            </MiniCard>
          ))
        )}
      </div>

      <MiniButton theme={theme} variant="primary" onClick={() => void save()} disabled={saving} className="w-full">
        <Save className="size-4" /> {saved ? 'Сохранено' : saving ? 'Сохраняю' : 'Сохранить каталог'}
      </MiniButton>
    </div>
  );
}

function DialogsScreen({ theme }: { theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  const [threads, setThreads] = useState<ChatThreadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ChatThreadRecord | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch('/api/chats', {
        credentials: 'include',
        cache: 'no-store',
        headers: getTelegramAppSessionHeaders(),
      });
      if (!response.ok) throw new Error('failed');
      const payload = (await response.json()) as ChatThreadListResponse;
      const next = Array.isArray(payload.threads) ? payload.threads : [];
      setThreads(next);
      return next;
    } catch {
      setThreads([]);
      return [];
    } finally {
      if (showLoader) setLoading(false);
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
      const next = await load(false);
      setActive((current) => next.find((thread) => thread.id === current?.id) ?? current);
    } catch {
      // draft stays in input
    } finally {
      setSending(false);
    }
  }

  const ordered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...threads]
      .filter((thread) => `${thread.clientName} ${thread.clientPhone} ${thread.lastMessagePreview ?? ''}`.toLowerCase().includes(search))
      .sort((a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime());
  }, [query, threads]);

  if (loading) {
    return <EmptyBlock theme={theme} title="Загружаю чаты" text="Проверяю сообщения и заявки из Telegram, VK и публичной страницы." icon={<MessageCircle className="size-5" />} />;
  }

  return (
    <div className="space-y-3">
      <MiniCard light={theme.light} className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <MiniLabel light={theme.light}>чаты</MiniLabel>
            <div className={cn('mt-2 text-[28px] font-semibold leading-none tracking-[-0.085em]', tone.text)}>Диалоги</div>
            <div className={cn('mt-2 text-[12px] leading-5', tone.muted)}>Короткая мобильная лента всех клиентов.</div>
          </div>
          <MiniButton theme={theme} variant="secondary" className="h-8 px-2.5" onClick={() => void load()}>
            <RefreshCcw className="size-4" />
          </MiniButton>
        </div>
        <div className="mt-3">
          <MiniInput light={theme.light} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по клиенту или сообщению" />
        </div>
      </MiniCard>

      {ordered.length === 0 ? (
        <EmptyBlock theme={theme} title="Чатов пока нет" text="Когда клиент напишет или появится запись, диалог подтянется сюда." icon={<MessageCircle className="size-5" />} />
      ) : (
        <div className="space-y-2">
          {ordered.map((thread) => {
            const lastMessage = thread.lastMessagePreview || thread.messages?.[thread.messages.length - 1]?.body || 'Диалог открыт';
            return (
              <button key={thread.id} type="button" onClick={() => setActive(thread)} className={cn('flex w-full items-center gap-3 rounded-[10px] border p-3 text-left transition active:scale-[0.99]', tone.panel)}>
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-[10px] border text-[11px] font-black tracking-[-0.05em]', tone.panel)}>{getInitials(thread.clientName)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className={cn('truncate text-[14px] font-semibold tracking-[-0.05em]', tone.text)}>{thread.clientName}</div>
                    <span className={cn('rounded-[8px] border px-2 py-1 text-[9px] font-bold', tone.panel, tone.faint)}>{thread.channel}</span>
                  </div>
                  <div className={cn('mt-1 truncate text-[11px]', tone.muted)}>{lastMessage}</div>
                </div>
                {thread.unreadCount > 0 ? <span className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold" style={accentStyle(theme.accent, theme.light, 24)}>{thread.unreadCount}</span> : null}
              </button>
            );
          })}
        </div>
      )}

      {active ? (
        <BottomSheet theme={theme} onClose={() => setActive(null)} title={active.clientName} subtitle={active.clientPhone || active.channel}>
          <div className="flex max-h-[58svh] flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {(active.messages ?? []).length === 0 ? (
                <div className={cn('py-8 text-center text-[12px]', tone.faint)}>Сообщений пока нет</div>
              ) : (
                active.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'max-w-[86%] rounded-[10px] px-3 py-2 text-[12px] leading-5',
                      message.author === 'master'
                        ? 'ml-auto'
                        : message.author === 'system'
                          ? 'mx-auto'
                          : '',
                      message.author === 'master'
                        ? (theme.light ? 'bg-black text-white' : 'bg-white text-black')
                        : cn(tone.panel, 'border'),
                    )}
                  >
                    {message.body}
                  </div>
                ))
              )}
            </div>
            <div className={cn('border-t p-3', tone.line)}>
              <div className="flex gap-2">
                <MiniInput light={theme.light} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ответ клиенту" onKeyDown={(event) => { if (event.key === 'Enter') void send(); }} />
                <MiniButton theme={theme} variant="primary" disabled={sending || !draft.trim()} onClick={() => void send()} className="h-10 w-11 shrink-0 px-0">
                  <Send className="size-4" />
                </MiniButton>
              </div>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}

function HubScreen({ profile, dataset, setScreen, getPublicPath, theme }: { profile: MasterProfile; dataset: WorkspaceDataset; setScreen: (screen: MiniScreen) => void; getPublicPath: (slug: string) => string; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  async function copyPublicLink() {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    await copyText(`${origin}${getPublicPath(profile.slug)}`);
  }

  const tiles = [
    { id: 'clients' as const, title: 'Клиенты', text: `${dataset.clients.length} в базе`, icon: <Users2 className="size-4" /> },
    { id: 'analytics' as const, title: 'Аналитика', text: RUB.format(dataset.totals.revenue || 0), icon: <BarChart3 className="size-4" /> },
    { id: 'profile' as const, title: 'Профиль', text: `@${profile.slug}`, icon: <UserRound className="size-4" /> },
  ];

  return (
    <div className="space-y-3">
      <MiniCard light={theme.light} className="p-4">
        <MiniLabel light={theme.light}>ещё</MiniLabel>
        <div className={cn('mt-2 text-[28px] font-semibold leading-none tracking-[-0.085em]', tone.text)}>Центр управления</div>
        <div className={cn('mt-2 text-[12px] leading-5', tone.muted)}>Всё второстепенное убрано сюда, чтобы основные экраны не были перегружены.</div>
      </MiniCard>

      <div className="grid grid-cols-1 gap-2">
        {tiles.map((tile) => (
          <button key={tile.id} type="button" onClick={() => setScreen(tile.id)} className={cn('flex items-center gap-3 rounded-[10px] border p-3 text-left transition active:scale-[0.99]', tone.panel)}>
            <div className={cn('flex size-10 items-center justify-center rounded-[9px] border', tone.panel)} style={{ color: theme.accent }}>{tile.icon}</div>
            <div className="min-w-0 flex-1">
              <div className={cn('text-[14px] font-semibold tracking-[-0.05em]', tone.text)}>{tile.title}</div>
              <div className={cn('mt-1 text-[11px]', tone.muted)}>{tile.text}</div>
            </div>
            <ChevronRight className={cn('size-4', tone.faint)} />
          </button>
        ))}
      </div>

      <MiniCard light={theme.light} className="p-3">
        <div className="grid grid-cols-2 gap-2">
          <MiniButton theme={theme} variant="secondary" onClick={copyPublicLink} className="w-full">
            <Copy className="size-4" /> Ссылка
          </MiniButton>
          <MiniButton theme={theme} variant="secondary" className="w-full" onClick={() => setScreen('profile')}>
            <Settings className="size-4" /> Настроить
          </MiniButton>
        </div>
        <MiniButton theme={theme} variant="primary" className="mt-2 w-full" onClick={() => { if (typeof window !== 'undefined') window.location.href = '/dashboard'; }}>
          <ExternalLink className="size-4" /> Открыть полный кабинет
        </MiniButton>
      </MiniCard>
    </div>
  );
}

function ClientsScreen({ clients, workspaceData, updateWorkspaceSection, theme }: { clients: ClientInsight[]; workspaceData: Record<string, unknown>; updateWorkspaceSection: UpdateWorkspaceSection; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
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
    <div className="space-y-3">
      <MiniCard light={theme.light} className="p-4">
        <MiniLabel light={theme.light}>клиенты</MiniLabel>
        <div className={cn('mt-2 text-[28px] font-semibold leading-none tracking-[-0.085em]', tone.text)}>База</div>
        <div className="mt-3"><MiniInput light={theme.light} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, телефону, услуге" /></div>
      </MiniCard>

      {filtered.length === 0 ? (
        <EmptyBlock theme={theme} title="Клиентов нет" text="База появится после первых записей и сообщений." icon={<Users2 className="size-5" />} />
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => (
            <button key={client.id} type="button" onClick={() => setSelected(client)} className={cn('flex w-full items-center gap-3 rounded-[10px] border p-3 text-left transition active:scale-[0.99]', tone.panel)}>
              <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-[10px] border text-[11px] font-black tracking-[-0.05em]', tone.panel)}>{getInitials(client.name)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className={cn('truncate text-[14px] font-semibold tracking-[-0.05em]', tone.text)}>{client.name}</div>
                  {(favorites[client.id] || client.favorite) ? <Star className="size-3.5 fill-current" style={{ color: theme.accent }} /> : null}
                </div>
                <div className={cn('mt-1 truncate text-[11px]', tone.muted)}>{client.visits} визитов · {client.service || 'услуга'} · {client.phone}</div>
              </div>
              <ChevronRight className={cn('size-4 shrink-0', tone.faint)} />
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <ClientSheet client={selected} note={notes[selected.id] ?? selected.note ?? ''} favorite={Boolean(favorites[selected.id] ?? selected.favorite)} onClose={() => setSelected(null)} onFavorite={() => void toggleFavorite(selected)} onSaveNote={(note) => void saveNote(selected, note)} theme={theme} />
      ) : null}
    </div>
  );
}

function ClientSheet({ client, note, favorite, onClose, onFavorite, onSaveNote, theme }: { client: ClientInsight; note: string; favorite: boolean; onClose: () => void; onFavorite: () => void; onSaveNote: (note: string) => void; theme: ThemeTone }) {
  const [draft, setDraft] = useState(note);
  useEffect(() => setDraft(note), [note]);
  return (
    <BottomSheet theme={theme} onClose={onClose} title={client.name} subtitle={client.phone}>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          <StatBox theme={theme} label="Визиты" value={client.visits} />
          <StatBox theme={theme} label="Чек" value={client.averageCheck ? RUB.format(client.averageCheck) : '—'} />
          <StatBox theme={theme} label="Сумма" value={client.totalRevenue ? RUB.format(client.totalRevenue) : '—'} />
        </div>
        <MiniTextarea light={theme.light} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Заметка по клиенту" />
        <div className="grid grid-cols-2 gap-2">
          <MiniButton theme={theme} variant="secondary" onClick={onFavorite}>{favorite ? <Star className="size-4 fill-current" /> : <Star className="size-4" />}{favorite ? 'VIP' : 'В VIP'}</MiniButton>
          <MiniButton theme={theme} variant="primary" onClick={() => onSaveNote(draft)}>Сохранить</MiniButton>
        </div>
      </div>
    </BottomSheet>
  );
}

function AnalyticsScreen({ dataset, theme }: { dataset: WorkspaceDataset; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  const maxDaily = Math.max(1, ...dataset.daily.map((day) => day.requests));
  const channels = dataset.channels.filter((channel) => channel.visitors > 0 || channel.bookings > 0).slice(0, 4);

  return (
    <div className="space-y-3">
      <MiniCard light={theme.light} className="p-4">
        <MiniLabel light={theme.light}>аналитика</MiniLabel>
        <div className={cn('mt-2 text-[28px] font-semibold leading-none tracking-[-0.085em]', tone.text)}>Пульс</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <StatBox theme={theme} label="Записи" value={dataset.totals.bookings} />
          <StatBox theme={theme} label="Выручка" value={RUB.format(dataset.totals.revenue || 0)} />
          <StatBox theme={theme} label="Средний чек" value={dataset.totals.averageCheck ? RUB.format(dataset.totals.averageCheck) : '—'} />
          <StatBox theme={theme} label="Возврат" value={`${dataset.totals.returnRate || 0}%`} />
        </div>
      </MiniCard>

      <MiniCard light={theme.light} className="p-4">
        <MiniLabel light={theme.light}>по дням</MiniLabel>
        <div className="mt-4 space-y-3">
          {(dataset.daily.length ? dataset.daily.slice(-7) : []).map((day) => (
            <div key={day.date} className="grid grid-cols-[74px_1fr_36px] items-center gap-2">
              <div className={cn('text-[10px] font-semibold', tone.muted)}>{day.label}</div>
              <div className={cn('h-2 overflow-hidden rounded-full', theme.light ? 'bg-black/[0.06]' : 'bg-white/[0.06]')}><div className="h-full rounded-full" style={{ width: `${Math.max(5, (day.requests / maxDaily) * 100)}%`, backgroundColor: theme.accent }} /></div>
              <div className={cn('text-right text-[10px] font-semibold', tone.muted)}>{day.requests}</div>
            </div>
          ))}
          {dataset.daily.length === 0 ? <div className={cn('text-[12px]', tone.muted)}>Данных пока нет.</div> : null}
        </div>
      </MiniCard>

      <MiniCard light={theme.light} className="p-4">
        <MiniLabel light={theme.light}>каналы</MiniLabel>
        <div className="mt-3 space-y-2">
          {(channels.length ? channels : dataset.channels.slice(0, 4)).map((channel) => (
            <div key={channel.id} className={cn('flex items-center justify-between rounded-[10px] border px-3 py-2.5', tone.panel)}>
              <div>
                <div className={cn('text-[13px] font-semibold tracking-[-0.045em]', tone.text)}>{channel.label}</div>
                <div className={cn('mt-1 text-[10px]', tone.faint)}>{channel.visitors} визитов · {channel.conversion}%</div>
              </div>
              <div className={cn('text-[12px] font-semibold', tone.text)}>{channel.bookings}</div>
            </div>
          ))}
        </div>
      </MiniCard>
    </div>
  );
}

function ProfileScreen({ profile, onSave, getPublicPath, theme }: { profile: MasterProfile; onSave: SaveProfile; getPublicPath: (slug: string) => string; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  const [form, setForm] = useState(() => profileSavePayload(profile, {}));
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setForm(profileSavePayload(profile, {}));
  }, [profile]);

  async function save() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  async function copyLink() {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const ok = await copyText(`${origin}${getPublicPath(form.slug || profile.slug)}`);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="space-y-3">
      <MiniCard light={theme.light} className="p-4">
        <MiniLabel light={theme.light}>профиль</MiniLabel>
        <div className={cn('mt-2 text-[28px] font-semibold leading-none tracking-[-0.085em]', tone.text)}>Публичная карточка</div>
        <div className="mt-3 flex gap-2">
          <MiniButton theme={theme} variant="secondary" onClick={copyLink} className="flex-1"><Copy className="size-4" />{copied ? 'Скопировано' : 'Ссылка'}</MiniButton>
          <MiniButton theme={theme} variant="secondary" className="flex-1" onClick={() => { if (typeof window !== 'undefined') window.open(getPublicPath(profile.slug), '_blank'); }}><ExternalLink className="size-4" />Открыть</MiniButton>
        </div>
      </MiniCard>

      <MiniCard light={theme.light} className="space-y-2 p-3">
        <MiniInput light={theme.light} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Имя" />
        <MiniInput light={theme.light} value={form.profession} onChange={(event) => setForm((current) => ({ ...current, profession: event.target.value }))} placeholder="Специализация" />
        <MiniInput light={theme.light} value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="Город" />
        <MiniInput light={theme.light} value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="slug" />
        <MiniTextarea light={theme.light} value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} placeholder="Описание для клиента" />
        <div className="grid grid-cols-2 gap-2">
          <MiniInput light={theme.light} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Телефон" />
          <MiniInput light={theme.light} value={form.telegram} onChange={(event) => setForm((current) => ({ ...current, telegram: event.target.value }))} placeholder="Telegram" />
        </div>
        <MiniButton theme={theme} variant="primary" onClick={() => void save()} disabled={saving} className="w-full"><Save className="size-4" />{saving ? 'Сохраняю' : 'Сохранить профиль'}</MiniButton>
      </MiniCard>
    </div>
  );
}

function BottomSheet({ children, theme, onClose, title, subtitle }: { children: ReactNode; theme: ThemeTone; onClose: () => void; title: string; subtitle?: string }) {
  const tone = toneClasses(theme.light);
  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/45 px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)] backdrop-blur-[8px]">
      <div className={cn('mx-auto max-h-[86svh] w-full max-w-[440px] overflow-hidden rounded-[16px] border shadow-[0_28px_90px_rgba(0,0,0,0.38)]', theme.light ? 'border-black/[0.09] bg-[#fbfbfa] text-black' : 'border-white/[0.10] bg-[#101010] text-white')}>
        <div className={cn('flex items-start justify-between gap-3 border-b p-4', tone.line)}>
          <div className="min-w-0">
            <div className={cn('text-[19px] font-semibold leading-none tracking-[-0.075em]', tone.text)}>{title}</div>
            {subtitle ? <div className={cn('mt-1.5 truncate text-[11px]', tone.muted)}>{subtitle}</div> : null}
          </div>
          <button type="button" onClick={onClose} className={cn('flex size-9 shrink-0 items-center justify-center rounded-[9px] border', tone.ghost)}><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BookingSheet({ booking, onClose, onStatus, services, theme }: { booking: Booking | null; onClose: () => void; onStatus: (bookingId: string, status: BookingStatus) => Promise<void>; services: ServiceInsight[]; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  const [saving, setSaving] = useState<BookingStatus | null>(null);

  if (!booking) return null;

  async function changeStatus(status: BookingStatus) {
    setSaving(status);
    await onStatus(booking.id, status);
    setSaving(null);
    onClose();
  }

  return (
    <BottomSheet theme={theme} onClose={onClose} title={booking.clientName} subtitle={`${formatDateHuman(booking.date, true)} · ${formatTime(booking.time)}`}>
      <div className="space-y-3 p-4">
        <MiniPanel light={theme.light} className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <MiniLabel light={theme.light}>услуга</MiniLabel>
              <div className={cn('mt-2 text-[16px] font-semibold tracking-[-0.06em]', tone.text)}>{booking.service}</div>
              <div className={cn('mt-1 text-[11px]', tone.muted)}>{booking.clientPhone || 'телефон не указан'}</div>
            </div>
            <StatusPill status={booking.status} theme={theme} />
          </div>
          {booking.comment ? <div className={cn('mt-3 rounded-[9px] border p-3 text-[12px] leading-5', tone.panel, tone.muted)}>{booking.comment}</div> : null}
          <div className={cn('mt-3 flex items-center justify-between text-[12px] font-semibold', tone.text)}>
            <span>Сумма</span>
            <span>{getBookingAmount(booking, services) ? RUB.format(getBookingAmount(booking, services)) : '—'}</span>
          </div>
        </MiniPanel>

        <div className="grid grid-cols-2 gap-2">
          <MiniButton theme={theme} variant="primary" disabled={Boolean(saving)} onClick={() => void changeStatus('completed')}><CheckCircle2 className="size-4" />Пришла</MiniButton>
          <MiniButton theme={theme} variant="secondary" disabled={Boolean(saving)} onClick={() => void changeStatus('confirmed')}><Check className="size-4" />В плане</MiniButton>
          <MiniButton theme={theme} variant="secondary" disabled={Boolean(saving)} onClick={() => void changeStatus('no_show')}><XCircle className="size-4" />Не пришла</MiniButton>
          <MiniButton theme={theme} variant="danger" disabled={Boolean(saving)} onClick={() => void changeStatus('cancelled')}><X className="size-4" />Отмена</MiniButton>
        </div>

        {booking.clientPhone ? (
          <a href={`tel:${booking.clientPhone}`} className={cn('flex h-10 items-center justify-center gap-2 rounded-[9px] border text-[12px] font-semibold', tone.ghost)}><Phone className="size-4" />Позвонить клиенту</a>
        ) : null}
      </div>
    </BottomSheet>
  );
}

function MiniOnboarding({ onSave, theme }: { onSave: SaveProfile; theme: ThemeTone }) {
  const tone = toneClasses(theme.light);
  const [form, setForm] = useState<MiniProfileSaveValues>({
    name: '',
    profession: '',
    city: '',
    bio: '',
    servicesText: '',
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

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave({
      ...form,
      profession: form.profession.trim() || 'Специалист',
      city: form.city.trim() || 'Город',
      bio: form.bio.trim() || 'Онлайн-запись через КликБук',
      servicesText: form.servicesText.trim() || 'Консультация',
      slug: form.slug.trim() || form.name,
    });
    setSaving(false);
  }

  return (
    <main className={cn('min-h-[100svh] px-4 py-[calc(var(--tg-safe-top,0px)+16px)]', tone.page)}>
      <div className="mx-auto w-full max-w-[440px] space-y-3">
        <MiniCard light={theme.light} className="p-5">
          <BrandLogo />
          <div className={cn('mt-5 text-[30px] font-semibold leading-[0.95] tracking-[-0.095em]', tone.text)}>Создай мобильный профиль</div>
          <div className={cn('mt-3 text-[12px] leading-5', tone.muted)}>Мини-апп подключится к тем же услугам, графику, заявкам и чатам.</div>
        </MiniCard>
        <MiniCard light={theme.light} className="space-y-2 p-3">
          <MiniInput light={theme.light} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Имя или название" />
          <MiniInput light={theme.light} value={form.profession} onChange={(event) => setForm((current) => ({ ...current, profession: event.target.value }))} placeholder="Специализация" />
          <MiniInput light={theme.light} value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="Город" />
          <MiniTextarea light={theme.light} value={form.servicesText} onChange={(event) => setForm((current) => ({ ...current, servicesText: event.target.value }))} placeholder={'Услуги, каждая с новой строки'} />
          <MiniButton theme={theme} variant="primary" onClick={() => void save()} disabled={saving || !form.name.trim()} className="w-full"><Sparkles className="size-4" />{saving ? 'Создаю' : 'Создать профиль'}</MiniButton>
        </MiniCard>
      </div>
    </main>
  );
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
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme !== 'dark';
  const [screen, setScreen] = useState<MiniScreen>('workday');
  const [bootState, setBootState] = useState<'loading' | 'ready'>('loading');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const bootedRef = useRef(false);

  const workspaceRecord = safeRecord(workspaceData);
  const theme = useMemo<ThemeTone>(() => ({ light, accent: resolveAccent(workspaceRecord) }), [light, workspaceRecord]);

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
    return <MiniOnboarding onSave={saveProfile} theme={theme} />;
  }

  return (
    <>
      <MiniShell screen={screen} setScreen={setScreen} profile={ownedProfile} theme={theme} onRefresh={() => void refreshWorkspace()}>
        {screen === 'workday' ? (
          <WorkdayScreen profile={ownedProfile} bookings={orderedBookings} dataset={dataset} onOpenBooking={setSelectedBooking} setScreen={setScreen} getPublicPath={getPublicPath} theme={theme} />
        ) : null}
        {screen === 'calendar' ? (
          <CalendarScreen availability={dataset.availability} updateWorkspaceSection={updateWorkspaceSection} theme={theme} />
        ) : null}
        {screen === 'catalog' ? (
          <CatalogScreen profile={ownedProfile} services={dataset.services} onSaveProfile={saveProfile} updateWorkspaceSection={updateWorkspaceSection} theme={theme} />
        ) : null}
        {screen === 'dialogs' ? <DialogsScreen theme={theme} /> : null}
        {screen === 'hub' ? <HubScreen profile={ownedProfile} dataset={dataset} setScreen={setScreen} getPublicPath={getPublicPath} theme={theme} /> : null}
        {screen === 'clients' ? <ClientsScreen clients={dataset.clients} workspaceData={workspaceRecord} updateWorkspaceSection={updateWorkspaceSection} theme={theme} /> : null}
        {screen === 'analytics' ? <AnalyticsScreen dataset={dataset} theme={theme} /> : null}
        {screen === 'profile' ? <ProfileScreen profile={ownedProfile} onSave={saveProfile} getPublicPath={getPublicPath} theme={theme} /> : null}
      </MiniShell>
      <BookingSheet booking={selectedBooking} onClose={() => setSelectedBooking(null)} onStatus={updateBookingStatus} services={dataset.services} theme={theme} />
    </>
  );
}
