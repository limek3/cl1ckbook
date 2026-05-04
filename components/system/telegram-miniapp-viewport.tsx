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
  LayoutDashboard,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Palette,
  Phone,
  Plus,
  RefreshCcw,
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
import { useAppearance } from '@/lib/appearance-context';
import { accentPalette, accentToneValues, type AccentTone } from '@/lib/appearance-palette';
import { useLocale } from '@/lib/locale-context';
import { buildWorkspaceDatasetFromStored } from '@/lib/workspace-store';
import {
  authorizeTelegramMiniAppSession,
  getTelegramAppSessionHeaders,
} from '@/lib/telegram-miniapp-auth-client';
import { cn } from '@/lib/utils';
import type {
  AvailabilityDayInsight,
  ClientInsight,
  ServiceInsight,
} from '@/lib/master-workspace';
import type { ChatThreadListResponse, ChatThreadRecord } from '@/lib/chat-types';
import type {
  Booking,
  BookingStatus,
  MasterProfile,
  MasterProfileFormValues,
  ReviewItem,
  WorkGalleryItem,
} from '@/lib/types';

type MiniScreen =
  | 'today'
  | 'availability'
  | 'chats'
  | 'clients'
  | 'more'
  | 'profile'
  | 'services'
  | 'analytics'
  | 'appearance'
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
    >
  >;

const STATUS_META: Record<BookingStatus, { label: string; dot: string; pill: string }> = {
  new: {
    label: 'Новая',
    dot: 'bg-sky-400',
    pill: 'bg-sky-400/12 text-sky-100 border-sky-300/20',
  },
  confirmed: {
    label: 'Запланирована',
    dot: 'bg-blue-400',
    pill: 'bg-blue-400/12 text-blue-100 border-blue-300/20',
  },
  completed: {
    label: 'Пришла',
    dot: 'bg-emerald-400',
    pill: 'bg-emerald-400/12 text-emerald-100 border-emerald-300/20',
  },
  no_show: {
    label: 'Не пришла',
    dot: 'bg-orange-400',
    pill: 'bg-orange-400/12 text-orange-100 border-orange-300/20',
  },
  cancelled: {
    label: 'Отмена',
    dot: 'bg-rose-400',
    pill: 'bg-rose-400/12 text-rose-100 border-rose-300/20',
  },
};

const RUB = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

function todayKey() {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(value: string) {
  return value?.slice(0, 5) || '—';
}

function getBookingAmount(booking: Booking) {
  return typeof booking.priceAmount === 'number' && Number.isFinite(booking.priceAmount)
    ? booking.priceAmount
    : 0;
}

function getInitials(name?: string | null) {
  const safe = (name || 'КБ').trim();
  return safe
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function sortBookings(a: Booking, b: Booking) {
  return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
}

function safeRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function profileToForm(profile: MasterProfile | null): MiniProfileSaveValues {
  return {
    name: profile?.name ?? '',
    profession: profile?.profession ?? '',
    city: profile?.city ?? '',
    bio: profile?.bio ?? '',
    servicesText: profile?.services?.join('\n') ?? '',
    slug: profile?.slug ?? '',
    phone: profile?.phone ?? '',
    telegram: profile?.telegram ?? '',
    whatsapp: profile?.whatsapp ?? '',
    avatar: profile?.avatar ?? '',
    locationMode: profile?.locationMode ?? 'online',
    address: profile?.address ?? '',
    mapUrl: profile?.mapUrl ?? '',
    hidePhone: Boolean(profile?.hidePhone),
    hideTelegram: Boolean(profile?.hideTelegram),
    hideWhatsapp: Boolean(profile?.hideWhatsapp),
    priceHint: profile?.priceHint ?? '',
    experienceLabel: profile?.experienceLabel ?? '',
    responseTime: profile?.responseTime ?? '',
    workGallery: profile?.workGallery ?? [],
    reviews: profile?.reviews ?? [],
    rating: profile?.rating,
    reviewCount: profile?.reviewCount,
  };
}

function serviceToPublicLine(service: ServiceInsight) {
  const price = service.price ? ` — ${service.price} ₽` : '';
  return `${service.name}${price}`.trim();
}

function normalizeThread(value: unknown): ChatThreadRecord {
  const row = safeRecord(value);
  const messages = Array.isArray(row.messages) ? row.messages : [];

  return {
    id: String(row.id || `thread-${Date.now()}`),
    workspaceId: String(row.workspaceId || ''),
    clientName: String(row.clientName || row.client_name || 'Клиент'),
    clientPhone: String(row.clientPhone || row.client_phone || ''),
    channel:
      row.channel === 'VK' || row.channel === 'Instagram' || row.channel === 'Web'
        ? row.channel
        : 'Telegram',
    segment: row.segment === 'active' || row.segment === 'followup' ? row.segment : 'new',
    source: typeof row.source === 'string' ? row.source : null,
    nextVisit: typeof row.nextVisit === 'string' ? row.nextVisit : null,
    isPriority: Boolean(row.isPriority),
    botConnected: Boolean(row.botConnected),
    lastMessagePreview:
      typeof row.lastMessagePreview === 'string'
        ? row.lastMessagePreview
        : typeof row.lastMessage === 'string'
          ? row.lastMessage
          : null,
    lastMessageAt: String(row.lastMessageAt || row.updatedAt || new Date().toISOString()),
    unreadCount: Number(row.unreadCount || 0),
    createdAt: String(row.createdAt || new Date().toISOString()),
    updatedAt: String(row.updatedAt || new Date().toISOString()),
    metadata: safeRecord(row.metadata),
    messages: messages
      .filter((item) => item && typeof item === 'object')
      .map((item, index) => {
        const message = item as Record<string, unknown>;
        return {
          id: String(message.id || `message-${index}`),
          threadId: String(message.threadId || row.id || ''),
          author:
            message.author === 'master' || message.author === 'system'
              ? message.author
              : 'client',
          body: String(message.body || message.text || ''),
          deliveryState:
            message.deliveryState === 'queued' ||
            message.deliveryState === 'sent' ||
            message.deliveryState === 'delivered' ||
            message.deliveryState === 'read' ||
            message.deliveryState === 'failed'
              ? message.deliveryState
              : null,
          viaBot: Boolean(message.viaBot),
          createdAt: String(message.createdAt || new Date().toISOString()),
          metadata: safeRecord(message.metadata),
        };
      }),
  };
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function fetchMini(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  Object.entries(getTelegramAppSessionHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return fetch(path, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers,
  });
}

function MiniCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        'rounded-[20px] border border-white/[0.08] bg-[#101010]/92 shadow-none backdrop-blur-[18px]',
        className,
      )}
    >
      {children}
    </section>
  );
}

function MiniLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
      {children}
    </div>
  );
}

function MiniButton({
  children,
  onClick,
  variant = 'secondary',
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-10 items-center justify-center gap-2 rounded-[14px] px-3 text-[12px] font-semibold tracking-[-0.035em] transition active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45',
        variant === 'primary' && 'bg-white text-black hover:bg-white/90',
        variant === 'accent' && 'bg-[var(--mini-accent)] text-black hover:opacity-90',
        variant === 'secondary' &&
          'border border-white/[0.08] bg-white/[0.055] text-white hover:bg-white/[0.08]',
        variant === 'danger' &&
          'border border-rose-300/15 bg-rose-400/10 text-rose-100 hover:bg-rose-400/14',
        variant === 'ghost' &&
          'bg-transparent text-white/55 hover:bg-white/[0.05] hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: BookingStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.new;

  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-[10px] font-semibold tracking-[-0.03em]',
        meta.pill,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

function MiniInput({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  const className =
    'w-full rounded-[15px] border border-white/[0.08] !bg-[#141414] px-3 text-[14px] font-medium tracking-[-0.035em] !text-white outline-none placeholder:!text-white/25 focus:border-white/[0.16] focus:!bg-[#171717]';

  return (
    <label className="block">
      <div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">
        {label}
      </div>

      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className={cn(className, 'min-h-[112px] resize-none py-3')}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(className, 'h-11')}
        />
      )}
    </label>
  );
}

function MiniSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">
        {label}
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[15px] border border-white/[0.08] bg-[#141414] px-3 text-[14px] font-medium tracking-[-0.035em] text-white outline-none focus:border-white/[0.16]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#141414] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-white/[0.08] bg-white/[0.025] px-5 py-7 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.045] text-white/55">
        {icon ?? <CalendarClock className="size-5" />}
      </div>
      <div className="text-[15px] font-semibold tracking-[-0.045em] text-white">
        {title}
      </div>
      <div className="mt-1 max-w-[230px] text-[12px] leading-5 text-white/42">
        {text}
      </div>
    </div>
  );
}

function MiniLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-6 text-white">
      <div className="flex w-full max-w-[310px] flex-col items-center rounded-[22px] border border-white/[0.08] bg-[#101010]/92 px-5 py-6 text-center">
        <BrandLogo />
        <div className="mt-5 size-8 animate-spin rounded-full border border-white/[0.08] border-t-white/60" />
        <div className="mt-5 text-[15px] font-semibold tracking-[-0.045em]">
          Загружаем кабинет
        </div>
        <div className="mt-1 max-w-[230px] text-[12px] leading-5 text-white/42">
          Проверяем Telegram-сессию и подтягиваем реальные данные кабинета.
        </div>
      </div>
    </main>
  );
}

function MiniShell({
  screen,
  setScreen,
  children,
  profile,
  onRefresh,
  accent,
}: {
  screen: MiniScreen;
  setScreen: (screen: MiniScreen) => void;
  children: ReactNode;
  profile: MasterProfile | null;
  onRefresh: () => void;
  accent: { solid: string; soft: string };
}) {
  const shellStyle = {
    paddingTop: 'calc(var(--tg-safe-top, 0px) + 10px)',
    paddingBottom: 'calc(var(--tg-safe-bottom, 0px) + 96px)',
    '--mini-accent': accent.solid,
    '--mini-accent-soft': accent.soft,
  } as CSSProperties & Record<string, string>;

  const navItems: Array<{ id: MiniScreen; label: string; icon: ReactNode }> = [
    { id: 'today', label: 'Сегодня', icon: <CalendarClock className="size-4" /> },
    { id: 'availability', label: 'График', icon: <Clock3 className="size-4" /> },
    { id: 'chats', label: 'Чаты', icon: <MessageCircle className="size-4" /> },
    { id: 'more', label: 'Ещё', icon: <MoreHorizontal className="size-4" /> },
  ];

  return (
    <main
      style={shellStyle}
      className="cb-mini-app-root min-h-screen bg-[#090909] px-3 text-white"
    >
      <div className="mx-auto w-full max-w-[430px]">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[11px] border border-white/[0.08] bg-white/[0.055]">
              {profile?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-white">
                  {getInitials(profile?.name)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold tracking-[-0.045em] text-white">
                {profile?.name || 'КликБук'}
              </div>
              <div className="truncate text-[10px] font-semibold tracking-[-0.03em] text-white/35">
                кабинет мастера
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="flex size-8 items-center justify-center rounded-[11px] border border-white/[0.08] bg-white/[0.045] text-white/55 active:scale-95"
          >
            <RefreshCcw className="size-3.5" />
          </button>
        </header>

        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)]">
        <div className="grid grid-cols-4 gap-1 rounded-[22px] border border-white/[0.08] bg-[#101010]/90 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-[24px]">
          {navItems.map((item) => {
            const active =
              screen === item.id ||
              (item.id === 'more' &&
                ['more', 'profile', 'services', 'analytics', 'appearance', 'settings', 'clients'].includes(screen));

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                className={cn(
                  'flex h-12 flex-col items-center justify-center gap-1 rounded-[16px] text-[10px] font-semibold tracking-[-0.04em] transition active:scale-[0.98]',
                  active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/42 hover:bg-white/[0.04] hover:text-white/72',
                )}
              >
                <span className={cn(active && 'text-[var(--mini-accent)]')}>{item.icon}</span>
                {item.label}
                {active ? (
                  <span className="size-1 rounded-full bg-[var(--mini-accent)]" />
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function MiniOnboarding({
  onSave,
}: {
  onSave: (values: MiniProfileSaveValues) => Promise<{ success: boolean; error?: string }>;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<MiniProfileSaveValues>({
    name: '',
    profession: '',
    city: '',
    bio: '',
    servicesText: '',
    slug: '',
    phone: '',
    telegram: '',
    whatsapp: '',
    avatar: '',
    locationMode: 'online',
    address: '',
    mapUrl: '',
    hidePhone: false,
    hideTelegram: false,
    hideWhatsapp: false,
  });

  const steps = [
    { title: 'Основное', text: 'Имя, город и описание.' },
    { title: 'Услуги', text: 'Что клиент сможет выбрать.' },
    { title: 'Контакты', text: 'Телефон, Telegram и ссылка.' },
  ];

  const update = <K extends keyof MiniProfileSaveValues>(
    key: K,
    value: MiniProfileSaveValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleNext() {
    setError('');

    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    const result = await onSave({
      ...form,
      slug: form.slug || form.name,
      bio: form.bio || 'Онлайн-запись к мастеру через КликБук.',
    });
    setSaving(false);

    if (!result.success) setError(result.error || 'Не удалось сохранить профиль.');
  }

  return (
    <main
      className="cb-mini-app-root min-h-screen bg-[#090909] px-3 text-white"
      style={{
        paddingTop: 'calc(var(--tg-safe-top, 0px) + 10px)',
        paddingBottom: 'calc(var(--tg-safe-bottom, 0px) + 24px)',
      }}
    >
      <div className="mx-auto w-full max-w-[430px]">
        <header className="mb-5 flex items-center justify-between">
          <BrandLogo />
          <div className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1 text-[10px] font-semibold text-white/52">
            {step + 1}/{steps.length}
          </div>
        </header>

        <section className="mb-4">
          <MiniLabel>быстрый старт</MiniLabel>
          <h1 className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.075em]">
            Создадим страницу
          </h1>
          <p className="mt-2 max-w-[320px] text-[13px] leading-5 text-white/45">
            Заполните минимум. Остальное можно донастроить позже.
          </p>
        </section>

        <MiniCard className="overflow-hidden">
          <div className="border-b border-white/[0.08] p-4">
            <div className="text-[20px] font-semibold tracking-[-0.06em]">
              {steps[step].title}
            </div>
            <div className="mt-1 text-[12px] leading-5 text-white/42">
              {steps[step].text}
            </div>
          </div>

          <div className="space-y-4 p-4">
            {step === 0 ? (
              <>
                <MiniInput label="Имя или название" value={form.name} onChange={(value) => update('name', value)} placeholder="Например, Анна Nails" />
                <MiniInput label="Специализация" value={form.profession} onChange={(value) => update('profession', value)} placeholder="Маникюр, тату, массаж..." />
                <MiniInput label="Город" value={form.city} onChange={(value) => update('city', value)} placeholder="Москва" />
                <MiniInput label="Описание" value={form.bio} onChange={(value) => update('bio', value)} placeholder="Коротко о себе" textarea />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <MiniInput label="Услуги" value={form.servicesText} onChange={(value) => update('servicesText', value)} placeholder={'Маникюр — 2500 ₽\nПедикюр — 3000 ₽\nКоррекция — 2000 ₽'} textarea />
                <div className="rounded-[16px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] leading-5 text-white/42">
                  Каждую услугу лучше писать с новой строки.
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <MiniInput label="Телефон" value={form.phone} onChange={(value) => update('phone', value)} placeholder="+7..." />
                <MiniInput label="Telegram" value={form.telegram} onChange={(value) => update('telegram', value)} placeholder="@username" />
                <MiniInput label="Ссылка" value={form.slug} onChange={(value) => update('slug', value)} placeholder="anna-nails" />
              </>
            ) : null}

            {error ? (
              <div className="rounded-[16px] border border-rose-300/15 bg-rose-400/10 p-3 text-[12px] leading-5 text-rose-100">
                {error}
              </div>
            ) : null}
          </div>
        </MiniCard>

        <div className="mt-4 grid grid-cols-[96px_1fr] gap-2">
          <MiniButton variant="secondary" disabled={step === 0 || saving} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            Назад
          </MiniButton>
          <MiniButton variant="primary" disabled={saving} onClick={handleNext}>
            {saving ? 'Сохраняем...' : step === steps.length - 1 ? 'Сохранить' : 'Далее'}
          </MiniButton>
        </div>
      </div>
    </main>
  );
}

function TodayScreen({
  bookings,
  dataset,
  onOpenBooking,
}: {
  bookings: Booking[];
  dataset: ReturnType<typeof buildWorkspaceDatasetFromStored>;
  onOpenBooking: (booking: Booking) => void;
}) {
  const today = todayKey();
  const todayBookings = useMemo(
    () => bookings.filter((booking) => booking.date === today).sort(sortBookings),
    [bookings, today],
  );
  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => `${booking.date} ${booking.time}` >= `${today} 00:00`).sort(sortBookings),
    [bookings, today],
  );

  const list = todayBookings.length > 0 ? todayBookings : upcomingBookings.slice(0, 5);
  const nearest = list[0] ?? null;
  const revenue = todayBookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);
  const riskCount = todayBookings.filter((booking) => booking.status === 'new' || booking.status === 'no_show').length;

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>рабочий день</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Сегодня</h1>
        <p className="mt-2 max-w-[320px] text-[12px] leading-5 text-white/42">
          Реальные записи, клиенты и показатели из основного кабинета.
        </p>
      </section>

      <div className="grid grid-cols-3 gap-2">
        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">записи</div>
          <div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">{todayBookings.length}</div>
          <div className="text-[10px] text-white/35">сегодня</div>
        </MiniCard>
        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">доход</div>
          <div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">{RUB.format(revenue)}</div>
          <div className="text-[10px] text-white/35">сегодня</div>
        </MiniCard>
        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">риск</div>
          <div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">{riskCount}</div>
          <div className="text-[10px] text-white/35">контроль</div>
        </MiniCard>
      </div>

      <MiniCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] p-4">
          <div>
            <MiniLabel>ближайшая</MiniLabel>
            <div className="mt-1 text-[12px] text-white/42">что нужно сделать сейчас</div>
          </div>
          <Link href="/dashboard" className="flex h-8 items-center gap-1.5 rounded-[11px] border border-white/[0.08] bg-white/[0.045] px-2.5 text-[11px] font-semibold text-white/58">
            ПК <ExternalLink className="size-3" />
          </Link>
        </div>

        {nearest ? (
          <button type="button" onClick={() => onOpenBooking(nearest)} className="block w-full p-4 text-left active:scale-[0.995]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[34px] font-semibold leading-none tracking-[-0.08em]">{formatTime(nearest.time)}</div>
                <div className="mt-3 text-[19px] font-semibold tracking-[-0.06em]">{nearest.clientName}</div>
                <div className="mt-1 text-[12px] text-white/42">{nearest.service}</div>
              </div>
              <StatusPill status={nearest.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <span className="flex h-10 items-center justify-center rounded-[14px] bg-white text-[12px] font-semibold text-black">Открыть</span>
              <span className="flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.08] bg-white/[0.055] text-[12px] font-semibold text-white"><Phone className="size-3.5" /> Позвонить</span>
            </div>
          </button>
        ) : (
          <div className="p-4">
            <EmptyState title="Сегодня свободно" text="На сегодня нет записей. Проверьте график или веб-кабинет." />
          </div>
        )}
      </MiniCard>

      <MiniCard className="overflow-hidden">
        <div className="border-b border-white/[0.08] p-4">
          <div className="text-[15px] font-semibold tracking-[-0.045em]">День</div>
          <div className="mt-1 text-[11px] text-white/38">компактный список записей</div>
        </div>
        <div className="space-y-2 p-3">
          {list.length > 0 ? list.map((booking) => (
            <button key={booking.id} type="button" onClick={() => onOpenBooking(booking)} className="flex w-full items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.99]">
              <div className="w-12 shrink-0 text-[17px] font-semibold tracking-[-0.06em]">{formatTime(booking.time)}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold tracking-[-0.04em]">{booking.clientName}</div>
                <div className="mt-1 truncate text-[11px] text-white/38">{booking.service} · {RUB.format(getBookingAmount(booking))}</div>
              </div>
              <StatusPill status={booking.status} />
              <ChevronRight className="size-4 shrink-0 text-white/26" />
            </button>
          )) : (
            <EmptyState title="Записей пока нет" text="Когда клиенты начнут записываться, они появятся здесь." />
          )}
        </div>
      </MiniCard>

      <MiniCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.045em]">Состояние кабинета</div>
            <div className="mt-1 text-[11px] text-white/38">реальные totals из dashboard</div>
          </div>
          <BarChart3 className="size-5 text-white/35" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/30">заявки</div>
            <div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">{dataset.totals.bookings}</div>
          </div>
          <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/30">конверсия</div>
            <div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">{dataset.totals.conversion}%</div>
          </div>
        </div>
      </MiniCard>
    </div>
  );
}

function AvailabilityScreen({
  availability,
  updateWorkspaceSection,
}: {
  availability: AvailabilityDayInsight[];
  updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean>;
}) {
  const [days, setDays] = useState<AvailabilityDayInsight[]>(availability);
  const [selectedId, setSelectedId] = useState(availability[0]?.id ?? 'mon');
  const [newSlot, setNewSlot] = useState('');
  const [newBreak, setNewBreak] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDays(availability);
    setSelectedId((current) => availability.some((day) => day.id === current) ? current : availability[0]?.id ?? 'mon');
  }, [availability]);

  const selectedDay = days.find((day) => day.id === selectedId) ?? days[0];

  function patchDay(patch: Partial<AvailabilityDayInsight>) {
    setDays((current) => current.map((day) => day.id === selectedDay.id ? { ...day, ...patch } : day));
  }

  async function save(nextDays = days) {
    setSaving(true);
    setMessage('');
    const ok = await updateWorkspaceSection('availability', nextDays);
    setSaving(false);
    setMessage(ok ? 'График сохранён.' : 'Не удалось сохранить график.');
  }

  function addSlot() {
    const slot = newSlot.trim();
    if (!slot) return;
    const nextSlots = Array.from(new Set([...selectedDay.slots, slot])).sort();
    patchDay({ slots: nextSlots, status: selectedDay.status === 'day-off' ? 'workday' : selectedDay.status });
    setNewSlot('');
  }

  function removeSlot(slot: string) {
    patchDay({ slots: selectedDay.slots.filter((item) => item !== slot) });
  }

  function addBreak() {
    const value = newBreak.trim();
    if (!value) return;
    patchDay({ breaks: Array.from(new Set([...selectedDay.breaks, value])) });
    setNewBreak('');
  }

  function removeBreak(value: string) {
    patchDay({ breaks: selectedDay.breaks.filter((item) => item !== value) });
  }

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>слоты клиента</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">График</h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">Реальные дни, слоты и перерывы из кабинета.</p>
      </section>

      <div className="-mx-3 overflow-x-auto px-3">
        <div className="flex gap-2 pb-1">
          {days.map((day) => {
            const active = day.id === selectedDay.id;
            return (
              <button key={day.id} type="button" onClick={() => setSelectedId(day.id)} className={cn('min-w-[76px] rounded-[18px] border p-3 text-left transition active:scale-[0.98]', active ? 'border-white/[0.16] bg-white text-black' : 'border-white/[0.08] bg-white/[0.045] text-white')}>
                <div className="text-[12px] font-semibold tracking-[-0.04em]">{day.label.slice(0, 2)}</div>
                <div className="mt-2 text-[20px] font-semibold tracking-[-0.07em]">{day.status === 'day-off' ? '—' : day.slots.length}</div>
                <div className={cn('text-[10px]', active ? 'text-black/45' : 'text-white/35')}>слотов</div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay ? (
        <MiniCard className="overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] p-4">
            <div>
              <div className="text-[20px] font-semibold tracking-[-0.06em]">{selectedDay.label}</div>
              <div className="mt-1 text-[12px] text-white/42">{selectedDay.status === 'day-off' ? 'выходной' : `${selectedDay.slots.length} слотов`}</div>
            </div>
            <select value={selectedDay.status} onChange={(event) => patchDay({ status: event.target.value as AvailabilityDayInsight['status'] })} className="h-9 rounded-[12px] border border-white/[0.08] bg-[#141414] px-2 text-[12px] font-semibold text-white outline-none">
              <option value="workday">Рабочий</option>
              <option value="short">Короткий</option>
              <option value="day-off">Выходной</option>
            </select>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">Слоты</div>
              <div className="flex flex-wrap gap-2">
                {selectedDay.slots.length > 0 ? selectedDay.slots.map((slot) => (
                  <button key={slot} type="button" onClick={() => removeSlot(slot)} className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-[12px] font-semibold text-white/72 active:scale-95">
                    {slot} ×
                  </button>
                )) : (
                  <div className="rounded-[16px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] text-white/42">В этот день нет слотов.</div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-[1fr_92px] gap-2">
                <input value={newSlot} onChange={(event) => setNewSlot(event.target.value)} placeholder="10:30" className="h-10 rounded-[14px] border border-white/[0.08] bg-[#141414] px-3 text-[13px] text-white outline-none placeholder:text-white/25" />
                <MiniButton variant="accent" onClick={addSlot}>Добавить</MiniButton>
              </div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">Перерывы</div>
              <div className="flex flex-wrap gap-2">
                {selectedDay.breaks.length > 0 ? selectedDay.breaks.map((item) => (
                  <button key={item} type="button" onClick={() => removeBreak(item)} className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-[12px] font-semibold text-white/72 active:scale-95">
                    {item} ×
                  </button>
                )) : (
                  <div className="text-[12px] text-white/35">Без перерывов</div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-[1fr_92px] gap-2">
                <input value={newBreak} onChange={(event) => setNewBreak(event.target.value)} placeholder="14:00–15:00" className="h-10 rounded-[14px] border border-white/[0.08] bg-[#141414] px-3 text-[13px] text-white outline-none placeholder:text-white/25" />
                <MiniButton onClick={addBreak}>Добавить</MiniButton>
              </div>
            </div>

            {message ? <div className="rounded-[15px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] text-white/58">{message}</div> : null}
            <MiniButton variant="accent" disabled={saving} onClick={() => void save()}>{saving ? 'Сохраняем...' : 'Сохранить график'}</MiniButton>
          </div>
        </MiniCard>
      ) : null}
    </div>
  );
}

function ChatsScreen() {
  const [threads, setThreads] = useState<ChatThreadRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [error, setError] = useState('');

  const selectedThread = threads.find((thread) => thread.id === selectedId) ?? null;

  const loadChats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchMini('/api/chats');
      if (!response.ok) throw new Error('chats_load_failed');
      const payload = await parseJsonSafe<ChatThreadListResponse>(response);
      const normalized = (payload?.threads ?? []).map(normalizeThread);
      setThreads(normalized);
      setSelectedId((current) => current ?? normalized[0]?.id ?? null);
    } catch {
      setError('Не удалось загрузить чаты. Проверьте подключение бота.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  async function sendMessage(text = messageText) {
    const clean = text.trim();
    if (!clean || !selectedThread) return;

    const optimistic = {
      id: `local-${Date.now()}`,
      threadId: selectedThread.id,
      author: 'master' as const,
      body: clean,
      deliveryState: 'queued' as const,
      viaBot: true,
      createdAt: new Date().toISOString(),
      metadata: {},
    };

    setThreads((current) => current.map((thread) => thread.id === selectedThread.id ? { ...thread, lastMessagePreview: clean, lastMessageAt: optimistic.createdAt, messages: [...thread.messages, optimistic] } : thread));
    setMessageText('');

    try {
      const response = await fetchMini('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'message', threadId: selectedThread.id, body: clean, author: 'master', viaBot: true }),
      });
      if (!response.ok) throw new Error('message_send_failed');
      await loadChats();
    } catch {
      setError('Сообщение добавлено локально, но API чата не ответил.');
    }
  }

  async function createThread() {
    const clientName = newClientName.trim();
    const clientPhone = newClientPhone.trim();
    if (!clientName || !clientPhone) return;

    try {
      const response = await fetchMini('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'thread', clientName, clientPhone, channel: 'Telegram' }),
      });
      if (!response.ok) throw new Error('thread_create_failed');
      const payload = await parseJsonSafe<{ thread?: ChatThreadRecord }>(response);
      await loadChats();
      if (payload?.thread?.id) setSelectedId(payload.thread.id);
      setNewClientName('');
      setNewClientPhone('');
    } catch {
      setError('Не удалось создать чат. Нужны имя и телефон клиента.');
    }
  }

  async function togglePriority(thread: ChatThreadRecord) {
    const next = !thread.isPriority;
    setThreads((current) => current.map((item) => item.id === thread.id ? { ...item, isPriority: next } : item));
    await fetchMini('/api/chats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: thread.id, patch: { isPriority: next } }),
    }).catch(() => undefined);
  }

  if (selectedThread) {
    return (
      <div className="space-y-3">
        <section className="flex items-start justify-between gap-3">
          <div>
            <MiniLabel>диалог</MiniLabel>
            <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">{selectedThread.clientName}</h1>
            <p className="mt-2 text-[12px] leading-5 text-white/42">{selectedThread.clientPhone || 'контакт не указан'} · {selectedThread.channel}</p>
          </div>
          <button type="button" onClick={() => setSelectedId(null)} className="flex size-9 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.045] text-white/55"><X className="size-4" /></button>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <MiniButton variant={selectedThread.isPriority ? 'accent' : 'secondary'} onClick={() => void togglePriority(selectedThread)}>
            <Star className="size-4" /> {selectedThread.isPriority ? 'Важный' : 'Важный'}
          </MiniButton>
          <MiniButton><Phone className="size-4" /> Позвонить</MiniButton>
        </div>

        <MiniCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] p-3">
            <div className="flex items-center gap-2"><span className={cn('size-2 rounded-full', selectedThread.botConnected ? 'bg-emerald-400' : 'bg-white/25')} /><span className="text-[11px] font-semibold text-white/48">{selectedThread.botConnected ? 'бот подключен' : 'бот не подключен'}</span></div>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2 py-1 text-[10px] font-semibold text-white/45">{selectedThread.segment}</span>
          </div>

          <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">
            {selectedThread.messages.length > 0 ? selectedThread.messages.map((message) => {
              const mine = message.author === 'master';
              return (
                <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[78%] rounded-[17px] px-3 py-2 text-[13px] leading-5', mine ? 'bg-[var(--mini-accent)] text-black' : message.author === 'system' ? 'border border-white/[0.08] bg-white/[0.035] text-white/45' : 'bg-white/[0.065] text-white')}>
                    {message.body}
                  </div>
                </div>
              );
            }) : <EmptyState title="Сообщений нет" text="Напишите клиенту или выберите шаблон." icon={<MessageCircle className="size-5" />} />}
          </div>

          <div className="border-t border-white/[0.08] p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto">
              {['Подтверждаю запись', 'Напомню адрес', 'Пришлите удобное время', 'Спасибо за визит'].map((template) => (
                <button key={template} type="button" onClick={() => void sendMessage(template)} className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold text-white/55">{template}</button>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_44px] gap-2">
              <input value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Сообщение клиенту..." className="h-11 rounded-[15px] border border-white/[0.08] bg-[#141414] px-3 text-[14px] font-medium text-white outline-none placeholder:text-white/25" />
              <button type="button" onClick={() => void sendMessage()} className="flex h-11 items-center justify-center rounded-[15px] bg-[var(--mini-accent)] text-black"><Send className="size-4" /></button>
            </div>
          </div>
        </MiniCard>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>коммуникации</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Чаты</h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">Реальные чаты из /api/chats, сообщения и шаблоны.</p>
      </section>

      <MiniCard className="space-y-3 p-4">
        <div className="text-[15px] font-semibold tracking-[-0.045em]">Новый диалог</div>
        <MiniInput label="Имя клиента" value={newClientName} onChange={setNewClientName} placeholder="Анна" />
        <MiniInput label="Телефон" value={newClientPhone} onChange={setNewClientPhone} placeholder="+7..." />
        <MiniButton variant="accent" onClick={() => void createThread()}><Plus className="size-4" /> Создать чат</MiniButton>
      </MiniCard>

      <MiniCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] p-4">
          <div><div className="text-[15px] font-semibold tracking-[-0.045em]">Диалоги</div><div className="mt-1 text-[11px] text-white/38">{loading ? 'загружаем...' : `${threads.length} чатов`}</div></div>
          <button type="button" onClick={() => void loadChats()} className="flex size-8 items-center justify-center rounded-[11px] border border-white/[0.08] bg-white/[0.045] text-white/55"><RefreshCcw className="size-3.5" /></button>
        </div>
        <div className="space-y-2 p-3">
          {threads.length > 0 ? threads.map((thread) => (
            <button key={thread.id} type="button" onClick={() => setSelectedId(thread.id)} className="flex w-full items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3 text-left">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.055] text-[11px] font-bold">{getInitials(thread.clientName)}</div>
              <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold tracking-[-0.04em]">{thread.clientName}</div><div className="mt-1 truncate text-[11px] text-white/38">{thread.lastMessagePreview || 'Открыть диалог'}</div></div>
              {thread.isPriority ? <Star className="size-3 fill-[var(--mini-accent)] text-[var(--mini-accent)]" /> : null}
              <ChevronRight className="size-4 text-white/25" />
            </button>
          )) : <EmptyState title={error || 'Чатов пока нет'} text="Создайте диалог или дождитесь первого сообщения от клиента." icon={<MessageCircle className="size-5" />} />}
        </div>
      </MiniCard>
    </div>
  );
}

function ClientsScreen({
  clients,
  notes,
  favorites,
  updateWorkspaceSection,
}: {
  clients: ClientInsight[];
  notes: Record<string, string>;
  favorites: Record<string, boolean>;
  updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState(notes);
  const [localFavorites, setLocalFavorites] = useState(favorites);

  useEffect(() => setLocalNotes(notes), [notes]);
  useEffect(() => setLocalFavorites(favorites), [favorites]);

  const selectedClient = clients.find((client) => client.id === selectedId) ?? null;

  async function saveNote(client: ClientInsight, value: string) {
    const next = { ...localNotes, [client.id]: value, [client.phone]: value };
    setLocalNotes(next);
    await updateWorkspaceSection('clientNotes', next);
  }

  async function toggleFavorite(client: ClientInsight) {
    const nextValue = !localFavorites[client.id] && !localFavorites[client.phone];
    const next = { ...localFavorites, [client.id]: nextValue, [client.phone]: nextValue };
    setLocalFavorites(next);
    await updateWorkspaceSection('clientFavorites', next);
  }

  if (selectedClient) {
    const favorite = Boolean(localFavorites[selectedClient.id] ?? localFavorites[selectedClient.phone] ?? selectedClient.favorite);
    const note = localNotes[selectedClient.id] ?? localNotes[selectedClient.phone] ?? selectedClient.note ?? '';

    return (
      <div className="space-y-3">
        <section className="flex items-start justify-between gap-3">
          <div><MiniLabel>карточка клиента</MiniLabel><h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">{selectedClient.name}</h1><p className="mt-2 text-[12px] leading-5 text-white/42">{selectedClient.visits} визитов · {RUB.format(selectedClient.totalRevenue)}</p></div>
          <button type="button" onClick={() => setSelectedId(null)} className="flex size-9 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.045] text-white/55"><X className="size-4" /></button>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <MiniButton variant={favorite ? 'accent' : 'secondary'} onClick={() => void toggleFavorite(selectedClient)}><Star className="size-4" /> {favorite ? 'VIP' : 'В VIP'}</MiniButton>
          <MiniButton><Phone className="size-4" /> Позвонить</MiniButton>
        </div>

        <MiniCard className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/30">сегмент</div><div className="mt-2 text-[16px] font-semibold tracking-[-0.05em]">{selectedClient.segment}</div></div>
            <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/30">средний чек</div><div className="mt-2 text-[16px] font-semibold tracking-[-0.05em]">{RUB.format(selectedClient.averageCheck)}</div></div>
          </div>
          <MiniInput label="Заметка мастера" value={note} onChange={(value) => void saveNote(selectedClient, value)} placeholder="Предпочтения, нюансы, что важно помнить..." textarea />
        </MiniCard>

        <MiniCard className="overflow-hidden">
          <div className="border-b border-white/[0.08] p-4"><div className="text-[15px] font-semibold tracking-[-0.045em]">История</div><div className="mt-1 text-[11px] text-white/38">записи клиента</div></div>
          <div className="space-y-2 p-3">
            {(selectedClient.bookings ?? []).map((booking) => (
              <div key={booking.id} className="rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3">
                <div className="flex items-center justify-between gap-2"><div className="text-[13px] font-semibold tracking-[-0.04em]">{booking.service}</div><StatusPill status={booking.status} /></div>
                <div className="mt-1 text-[11px] text-white/38">{formatDayLabel(booking.date)} · {formatTime(booking.time)}</div>
              </div>
            ))}
          </div>
        </MiniCard>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <section><MiniLabel>база</MiniLabel><h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Клиенты</h1><p className="mt-2 text-[12px] leading-5 text-white/42">Реальная клиентская база из dashboard.</p></section>
      <div className="grid grid-cols-3 gap-2">
        <MiniCard className="p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/32">всего</div><div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">{clients.length}</div></MiniCard>
        <MiniCard className="p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/32">VIP</div><div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">{clients.filter((client) => localFavorites[client.id] ?? localFavorites[client.phone] ?? client.favorite).length}</div></MiniCard>
        <MiniCard className="p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/32">доход</div><div className="mt-2 text-[20px] font-semibold tracking-[-0.07em]">{RUB.format(clients.reduce((sum, client) => sum + client.totalRevenue, 0))}</div></MiniCard>
      </div>
      <MiniCard className="overflow-hidden"><div className="space-y-2 p-3">{clients.length > 0 ? clients.map((client) => {
        const favorite = localFavorites[client.id] ?? localFavorites[client.phone] ?? client.favorite;
        return <button key={client.id} type="button" onClick={() => setSelectedId(client.id)} className="flex w-full items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3 text-left"><div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.055] text-[11px] font-bold">{getInitials(client.name)}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><div className="truncate text-[13px] font-semibold tracking-[-0.04em]">{client.name}</div>{favorite ? <Star className="size-3 fill-[var(--mini-accent)] text-[var(--mini-accent)]" /> : null}</div><div className="mt-1 truncate text-[11px] text-white/38">{client.visits} визитов · {RUB.format(client.totalRevenue)} · {client.segment}</div></div><ChevronRight className="size-4 text-white/25" /></button>;
      }) : <EmptyState title="Клиентов пока нет" text="Клиенты появятся после первых записей." icon={<Users2 className="size-5" />} />}</div></MiniCard>
    </div>
  );
}

function ProfileScreen({
  profile,
  onSave,
  getPublicPath,
}: {
  profile: MasterProfile | null;
  onSave: (values: MiniProfileSaveValues) => Promise<{ success: boolean; error?: string }>;
  getPublicPath: (slug: string) => string;
}) {
  const [tab, setTab] = useState<'base' | 'place' | 'portfolio' | 'reviews' | 'contacts'>('base');
  const [form, setForm] = useState<MiniProfileSaveValues>(() => profileToForm(profile));
  const [portfolioText, setPortfolioText] = useState((profile?.workGallery ?? []).map((item) => `${item.title || 'Работа'} | ${item.image || ''}`).join('\n'));
  const [reviewsText, setReviewsText] = useState((profile?.reviews ?? []).map((item) => `${item.author}: ${item.text}`).join('\n'));
  const [saving, setSaving] = useState(false);
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setForm(profileToForm(profile));
    setPortfolioText((profile?.workGallery ?? []).map((item) => `${item.title || 'Работа'} | ${item.image || ''}`).join('\n'));
    setReviewsText((profile?.reviews ?? []).map((item) => `${item.author}: ${item.text}`).join('\n'));
  }, [profile]);

  const publicUrl = typeof window !== 'undefined' && profile?.slug ? `${window.location.origin}${getPublicPath(profile.slug)}` : '';

  const update = <K extends keyof MiniProfileSaveValues>(key: K, value: MiniProfileSaveValues[K]) => setForm((current) => ({ ...current, [key]: value }));

  function parsePortfolio(): WorkGalleryItem[] {
    return portfolioText.split('\n').map((line, index) => {
      const [title, image] = line.split('|').map((part) => part.trim());
      if (!title && !image) return null;
      return { id: `work-${index}`, title: title || `Работа ${index + 1}`, image: image || '' };
    }).filter((item): item is WorkGalleryItem => Boolean(item));
  }

  function parseReviews(): ReviewItem[] {
    return reviewsText.split('\n').map((line, index) => {
      const [author, ...rest] = line.split(':');
      const text = rest.join(':').trim();
      if (!author.trim() && !text) return null;
      return { id: `review-${index}`, author: author.trim() || 'Клиент', text: text || line.trim(), rating: 5 };
    }).filter((item): item is ReviewItem => Boolean(item));
  }

  async function handleSave() {
    setSaving(true);
    setResultText('');
    const reviews = parseReviews();
    const result = await onSave({ ...form, workGallery: parsePortfolio(), reviews, reviewCount: reviews.length || form.reviewCount });
    setSaving(false);
    setResultText(result.success ? 'Профиль сохранён.' : result.error || 'Не удалось сохранить профиль.');
  }

  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {}
  }

  const tabs = [
    { id: 'base', label: 'Основа' },
    { id: 'place', label: 'Место' },
    { id: 'portfolio', label: 'Портфолио' },
    { id: 'reviews', label: 'Отзывы' },
    { id: 'contacts', label: 'Контакты' },
  ] as const;

  return (
    <div className="space-y-3">
      <section><MiniLabel>публичная страница</MiniLabel><h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Профиль</h1><p className="mt-2 text-[12px] leading-5 text-white/42">Мобильная версия основного редактора профиля.</p></section>
      {publicUrl ? <MiniCard className="p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/32">ссылка</div><div className="mt-2 truncate text-[18px] font-semibold tracking-[-0.06em]">{getPublicPath(profile?.slug || '')}</div><div className="mt-3 grid grid-cols-2 gap-2"><MiniButton onClick={copyLink}><Copy className="size-4" />{copied ? 'Скопировано' : 'Копировать'}</MiniButton><Link href={publicUrl} className="flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.08] bg-white/[0.055] text-[12px] font-semibold tracking-[-0.035em] text-white"><ExternalLink className="size-4" />Открыть</Link></div></MiniCard> : null}
      <div className="-mx-3 overflow-x-auto px-3"><div className="flex gap-2 pb-1">{tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn('h-9 shrink-0 rounded-full border px-3 text-[12px] font-semibold tracking-[-0.035em]', tab === item.id ? 'border-[var(--mini-accent)] bg-[var(--mini-accent-soft)] text-white' : 'border-white/[0.08] bg-white/[0.045] text-white/45')}>{item.label}</button>)}</div></div>
      <MiniCard className="space-y-4 p-4">
        {tab === 'base' ? <><MiniInput label="Фото / аватар" value={form.avatar} onChange={(value) => update('avatar', value)} placeholder="URL изображения" /><MiniInput label="Имя" value={form.name} onChange={(value) => update('name', value)} /><MiniInput label="Специализация" value={form.profession} onChange={(value) => update('profession', value)} /><MiniInput label="Город" value={form.city} onChange={(value) => update('city', value)} /><MiniInput label="Описание" value={form.bio} onChange={(value) => update('bio', value)} textarea /><MiniInput label="Опыт" value={getString(form.experienceLabel)} onChange={(value) => update('experienceLabel', value)} placeholder="5 лет опыта" /><MiniInput label="Средний чек / цена" value={getString(form.priceHint)} onChange={(value) => update('priceHint', value)} placeholder="от 2500 ₽" /></> : null}
        {tab === 'place' ? <><MiniSelect label="Формат работы" value={form.locationMode} onChange={(value) => update('locationMode', value as MasterProfile['locationMode'])} options={[{ value: 'online', label: 'Без адреса / онлайн' }, { value: 'address', label: 'Показывать адрес' }]} /><MiniInput label="Адрес" value={form.address} onChange={(value) => update('address', value)} placeholder="Город, улица, дом" /><MiniInput label="Ссылка на карту" value={form.mapUrl} onChange={(value) => update('mapUrl', value)} placeholder="https://..." /></> : null}
        {tab === 'portfolio' ? <><MiniInput label="Портфолио" value={portfolioText} onChange={setPortfolioText} placeholder={'Маникюр нюд | https://...\nРабота после коррекции | https://...'} textarea /><div className="rounded-[16px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] leading-5 text-white/42">Формат: название работы | ссылка на изображение.</div></> : null}
        {tab === 'reviews' ? <><MiniInput label="Отзывы" value={reviewsText} onChange={setReviewsText} placeholder={'Анна: Очень аккуратная работа\nМария: Всё понравилось'} textarea /><div className="rounded-[16px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] leading-5 text-white/42">Формат: имя клиента: текст отзыва.</div></> : null}
        {tab === 'contacts' ? <><MiniInput label="Телефон" value={form.phone} onChange={(value) => update('phone', value)} /><MiniInput label="Telegram" value={form.telegram} onChange={(value) => update('telegram', value)} /><MiniInput label="WhatsApp / VK" value={form.whatsapp} onChange={(value) => update('whatsapp', value)} /><MiniInput label="Ссылка" value={form.slug} onChange={(value) => update('slug', value)} /><MiniInput label="Скорость ответа" value={getString(form.responseTime)} onChange={(value) => update('responseTime', value)} placeholder="обычно отвечаю за 15 минут" /></> : null}
        {resultText ? <div className="rounded-[15px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] text-white/58">{resultText}</div> : null}
        <MiniButton variant="accent" onClick={handleSave} disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить профиль'}</MiniButton>
      </MiniCard>
    </div>
  );
}

function ServicesScreen({
  services,
  profile,
  onSave,
  updateWorkspaceSection,
}: {
  services: ServiceInsight[];
  profile: MasterProfile | null;
  onSave: (values: MiniProfileSaveValues) => Promise<{ success: boolean; error?: string }>;
  updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean>;
}) {
  const [items, setItems] = useState<ServiceInsight[]>(services);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => setItems(services), [services]);

  function updateItem(id: string, patch: Partial<ServiceInsight>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function addItem() {
    setItems((current) => [...current, { id: `service-${Date.now()}`, name: '', duration: 60, price: 0, status: 'active', visible: true, bookings: 0, revenue: 0, popularity: 0, category: 'Основное' }]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    const cleaned = items.filter((item) => item.name.trim());
    const ok = await updateWorkspaceSection('services', cleaned);
    const result = await onSave({ ...profileToForm(profile), servicesText: cleaned.map(serviceToPublicLine).join('\n') });
    setSaving(false);
    setMessage(ok && result.success ? 'Услуги сохранены.' : result.error || 'Не удалось сохранить.');
  }

  return (
    <div className="space-y-3">
      <section><MiniLabel>витрина</MiniLabel><h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Услуги</h1><p className="mt-2 text-[12px] leading-5 text-white/42">Реальный каталог услуг из кабинета.</p></section>
      <MiniButton variant="accent" onClick={addItem}><Plus className="size-4" />Добавить услугу</MiniButton>
      <div className="space-y-3">{items.length > 0 ? items.map((item, index) => <MiniCard key={item.id} className="space-y-3 p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-full border border-white/[0.08] text-[10px] font-semibold text-white/42">{index + 1}</span><div><div className="text-[14px] font-semibold tracking-[-0.045em]">{item.name || 'Новая услуга'}</div><div className="mt-0.5 text-[11px] text-white/35">{item.bookings} записей · {RUB.format(item.revenue)}</div></div></div><button type="button" onClick={() => removeItem(item.id)} className="flex size-8 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.035] text-white/45"><Trash2 className="size-3.5" /></button></div><MiniInput label="Название" value={item.name} onChange={(value) => updateItem(item.id, { name: value })} /><div className="grid grid-cols-2 gap-3"><MiniInput label="Цена" value={String(item.price || '')} onChange={(value) => updateItem(item.id, { price: Number(value.replace(/\D+/g, '')) || 0 })} placeholder="2500" /><MiniInput label="Минут" value={String(item.duration || '')} onChange={(value) => updateItem(item.id, { duration: Number(value.replace(/\D+/g, '')) || 60 })} placeholder="60" /></div><MiniInput label="Категория" value={item.category} onChange={(value) => updateItem(item.id, { category: value })} placeholder="Основное" /><MiniSelect label="Статус" value={item.status} onChange={(value) => updateItem(item.id, { status: value as ServiceInsight['status'] })} options={[{ value: 'active', label: 'Активная' }, { value: 'seasonal', label: 'Сезонная' }, { value: 'draft', label: 'Черновик' }]} /><button type="button" onClick={() => updateItem(item.id, { visible: !item.visible })} className={cn('flex h-10 items-center justify-center gap-2 rounded-[14px] border text-[12px] font-semibold', item.visible ? 'border-[var(--mini-accent)] bg-[var(--mini-accent-soft)] text-white' : 'border-white/[0.08] bg-white/[0.035] text-white/45')}><Eye className="size-4" />{item.visible ? 'Показывать клиентам' : 'Скрыто'}</button></MiniCard>) : <EmptyState title="Услуги не заполнены" text="Добавьте услуги, чтобы клиенты могли записываться." icon={<Scissors className="size-5" />} />}</div>
      {message ? <div className="rounded-[15px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] text-white/58">{message}</div> : null}
      <MiniButton variant="accent" onClick={handleSave} disabled={saving}>{saving ? 'Сохраняем...' : 'Сохранить услуги'}</MiniButton>
    </div>
  );
}

function AnalyticsScreen({ dataset }: { dataset: ReturnType<typeof buildWorkspaceDatasetFromStored> }) {
  const daily = dataset.daily.slice(-7);
  const maxValue = Math.max(1, ...daily.map((item) => item.confirmed), ...dataset.channels.map((item) => item.bookings));

  return (
    <div className="space-y-3">
      <section><MiniLabel>аналитика</MiniLabel><h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Аналитика</h1><p className="mt-2 text-[12px] leading-5 text-white/42">Те же цифры, что в dashboard, но в мобильном виде.</p></section>
      <div className="grid grid-cols-2 gap-2"><MiniCard className="p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/32">записи</div><div className="mt-2 text-[26px] font-semibold tracking-[-0.08em]">{dataset.totals.bookings}</div><div className="text-[10px] text-white/35">всего</div></MiniCard><MiniCard className="p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/32">доход</div><div className="mt-2 text-[26px] font-semibold tracking-[-0.08em]">{RUB.format(dataset.totals.revenue)}</div><div className="text-[10px] text-white/35">по завершённым</div></MiniCard><MiniCard className="p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/32">конверсия</div><div className="mt-2 text-[26px] font-semibold tracking-[-0.08em]">{dataset.totals.conversion}%</div><div className="text-[10px] text-white/35">заявка → запись</div></MiniCard><MiniCard className="p-3"><div className="text-[10px] uppercase tracking-[0.16em] text-white/32">средний чек</div><div className="mt-2 text-[26px] font-semibold tracking-[-0.08em]">{RUB.format(dataset.totals.averageCheck)}</div><div className="text-[10px] text-white/35">по оплатам</div></MiniCard></div>
      <MiniCard className="p-4"><div className="flex items-center justify-between"><div><div className="text-[15px] font-semibold tracking-[-0.045em]">Неделя</div><div className="mt-1 text-[11px] text-white/38">подтверждённые записи</div></div><BarChart3 className="size-5 text-white/35" /></div><div className="mt-5 flex h-[150px] items-end gap-2">{daily.map((item) => { const height = Math.max(8, (item.confirmed / maxValue) * 120); return <div key={item.date} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-[120px] w-full items-end rounded-full bg-white/[0.035] p-1"><div className="w-full rounded-full bg-[var(--mini-accent)]" style={{ height }} /></div><div className="text-[9px] font-semibold uppercase text-white/35">{item.label}</div></div>; })}</div></MiniCard>
      <MiniCard className="p-4"><div className="text-[15px] font-semibold tracking-[-0.045em]">Каналы</div><div className="mt-4 space-y-3">{dataset.channels.map((channel) => { const width = `${Math.max(4, (channel.bookings / maxValue) * 100)}%`; return <div key={channel.id}><div className="mb-1 flex justify-between text-[11px] font-semibold text-white/45"><span>{channel.label}</span><span>{channel.bookings} · {channel.conversion}%</span></div><div className="h-2 rounded-full bg-white/[0.045]"><div className="h-2 rounded-full bg-[var(--mini-accent)]" style={{ width }} /></div></div>; })}</div></MiniCard>
      <MiniCard className="p-4"><div className="text-[15px] font-semibold tracking-[-0.045em]">Популярные услуги</div><div className="mt-3 space-y-2">{dataset.services.slice(0, 5).map((service, index) => <div key={service.id} className="flex items-center gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-[10px] font-semibold text-white/42">{index + 1}</span><div className="min-w-0 flex-1"><div className="truncate text-[13px] font-semibold tracking-[-0.04em]">{service.name}</div><div className="mt-1 text-[11px] text-white/38">{service.bookings} записей · {RUB.format(service.revenue)}</div></div></div>)}</div></MiniCard>
    </div>
  );
}

function AppearanceScreen() {
  const { settings, setSetting, setSettingsBatch } = useAppearance();

  return (
    <div className="space-y-3">
      <section><MiniLabel>стиль</MiniLabel><h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Внешний вид</h1><p className="mt-2 text-[12px] leading-5 text-white/42">Реальные настройки из основного кабинета.</p></section>
      <MiniCard className="space-y-5 p-4">
        <div><div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">Акцент кабинета</div><div className="grid grid-cols-2 gap-2">{accentToneValues.map((tone) => <button key={tone} type="button" onClick={() => setSettingsBatch({ accentTone: tone, publicAccent: tone })} className={cn('flex h-12 items-center justify-between rounded-[16px] border px-3 text-[13px] font-semibold tracking-[-0.04em]', settings.accentTone === tone ? 'border-white/20 bg-white text-black' : 'border-white/[0.08] bg-white/[0.045] text-white/55')}><span className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ backgroundColor: accentPalette[tone].solid }} />{tone}</span>{settings.accentTone === tone ? <CheckCircle2 className="size-4" /> : null}</button>)}</div></div>
        <div><div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">Плотность</div><div className="grid grid-cols-3 gap-2">{(['compact', 'standard', 'airy'] as const).map((value) => <button key={value} type="button" onClick={() => setSetting('density', value)} className={cn('h-11 rounded-[15px] border text-[12px] font-semibold', settings.density === value ? 'border-[var(--mini-accent)] bg-[var(--mini-accent-soft)] text-white' : 'border-white/[0.08] bg-white/[0.045] text-white/45')}>{value}</button>)}</div></div>
        <div><div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">Карточки</div><div className="grid grid-cols-3 gap-2">{(['flat', 'soft', 'glass'] as const).map((value) => <button key={value} type="button" onClick={() => setSetting('cardStyle', value)} className={cn('h-11 rounded-[15px] border text-[12px] font-semibold', settings.cardStyle === value ? 'border-[var(--mini-accent)] bg-[var(--mini-accent-soft)] text-white' : 'border-white/[0.08] bg-white/[0.045] text-white/45')}>{value}</button>)}</div></div>
        <MiniCard className="border-white/[0.06] bg-white/[0.035] p-4"><div className="flex items-center justify-between"><div><div className="text-[14px] font-semibold tracking-[-0.045em]">Превью</div><div className="mt-1 text-[11px] text-white/38">Активные элементы Mini App теперь берут этот цвет.</div></div><div className="flex size-10 items-center justify-center rounded-[14px] bg-[var(--mini-accent)] text-black"><Sparkles className="size-4" /></div></div></MiniCard>
      </MiniCard>
    </div>
  );
}

function SettingsScreen({
  workspaceData,
  updateWorkspaceSection,
}: {
  workspaceData: Record<string, unknown>;
  updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean>;
}) {
  const stored = safeRecord(workspaceData.miniSettings);
  const [settings, setSettings] = useState({ reminders: stored.reminders !== false, autoConfirm: Boolean(stored.autoConfirm), noShowControl: stored.noShowControl !== false, dailyDigest: stored.dailyDigest !== false });

  async function update<K extends keyof typeof settings>(key: K, value: boolean) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await updateWorkspaceSection('miniSettings', next);
  }

  return <div className="space-y-3"><section><MiniLabel>управление</MiniLabel><h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Настройки</h1><p className="mt-2 text-[12px] leading-5 text-white/42">Уведомления и рабочий день.</p></section><MiniCard className="space-y-2 p-3">{[
    ['reminders', 'Напоминания клиентам', 'Отправлять клиенту напоминание перед записью.'],
    ['autoConfirm', 'Автоподтверждение', 'Помечать запись подтверждённой после ответа клиента.'],
    ['noShowControl', 'Контроль неявок', 'Подсвечивать клиентов с риском не прийти.'],
    ['dailyDigest', 'Итоги дня', 'Показывать короткий итог по записям и деньгам.'],
  ].map(([key, label, description]) => { const typedKey = key as keyof typeof settings; const checked = settings[typedKey]; return <button key={key} type="button" onClick={() => void update(typedKey, !checked)} className="flex w-full items-center justify-between gap-4 rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-3 text-left"><span><span className="block text-[13px] font-semibold tracking-[-0.04em] text-white">{label}</span><span className="mt-1 block text-[11px] leading-4 text-white/42">{description}</span></span><span className={cn('relative h-7 w-12 shrink-0 rounded-full border transition', checked ? 'border-[var(--mini-accent)] bg-[var(--mini-accent)] text-black' : 'border-white/[0.08] bg-white/[0.055]')}><span className={cn('absolute top-1 size-5 rounded-full transition', checked ? 'left-6 bg-black' : 'left-1 bg-white/35')} /></span></button>; })}</MiniCard></div>;
}

function MoreScreen({ setScreen }: { setScreen: (screen: MiniScreen) => void }) {
  const rows: Array<{ id: MiniScreen | 'desktop'; label: string; description: string; icon: ReactNode }> = [
    { id: 'profile', label: 'Профиль', description: 'страница мастера', icon: <UserRound className="size-4" /> },
    { id: 'services', label: 'Услуги', description: 'витрина и цены', icon: <Scissors className="size-4" /> },
    { id: 'clients', label: 'Клиенты', description: 'база и история', icon: <Users2 className="size-4" /> },
    { id: 'analytics', label: 'Аналитика', description: 'записи и доход', icon: <BarChart3 className="size-4" /> },
    { id: 'appearance', label: 'Внешний вид', description: 'тема и акцент', icon: <Palette className="size-4" /> },
    { id: 'settings', label: 'Настройки', description: 'уведомления', icon: <Settings className="size-4" /> },
    { id: 'desktop', label: 'Веб-кабинет', description: 'полная версия', icon: <LayoutDashboard className="size-4" /> },
  ];

  return <div className="space-y-3"><section><MiniLabel>меню</MiniLabel><h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">Ещё</h1><p className="mt-2 text-[12px] leading-5 text-white/42">Дополнительные разделы.</p></section><MiniCard className="p-2"><div className="space-y-1">{rows.map((row, index) => <button key={row.id} type="button" onClick={() => { if (row.id === 'desktop') { window.location.href = '/dashboard'; return; } setScreen(row.id); }} className="group flex w-full items-center gap-3 rounded-[17px] px-2.5 py-3 text-left text-white/58 transition hover:bg-white/[0.045] hover:text-white active:scale-[0.99]"><span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-[10px] font-semibold text-white/36 group-hover:border-white/[0.14] group-hover:text-white/70">{index + 1}</span><span className="flex size-9 shrink-0 items-center justify-center rounded-[13px] border border-white/[0.07] bg-white/[0.035] text-white/42 group-hover:text-white/78">{row.icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold tracking-[-0.045em]">{row.label}</span><span className="mt-0.5 block truncate text-[11px] text-white/32">{row.description}</span></span><ChevronRight className="size-4 shrink-0 text-white/24" /></button>)}</div></MiniCard></div>;
}

function BookingSheet({ booking, onClose, onStatus }: { booking: Booking | null; onClose: () => void; onStatus: (bookingId: string, status: BookingStatus) => Promise<void> }) {
  const [updating, setUpdating] = useState<BookingStatus | null>(null);
  if (!booking) return null;
  async function update(status: BookingStatus) { if (!booking) return; setUpdating(status); await onStatus(booking.id, status); setUpdating(null); }

  return <div className="fixed inset-0 z-[80] flex items-end bg-black/55 px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)] backdrop-blur-[8px]"><div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.72)]"><div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-4"><div><MiniLabel>запись</MiniLabel><div className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.075em]">{booking.clientName}</div><div className="mt-2 text-[12px] text-white/42">{formatDayLabel(booking.date)}, {formatTime(booking.time)}</div></div><button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.045] text-white/55"><X className="size-4" /></button></div><div className="space-y-3 p-4"><div className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-3"><div className="text-[11px] text-white/35">Услуга</div><div className="mt-1 text-[15px] font-semibold tracking-[-0.045em]">{booking.service}</div></div><div className="grid grid-cols-2 gap-2"><MiniButton variant="accent" disabled={Boolean(updating)} onClick={() => void update('completed')}><CheckCircle2 className="size-4" />Пришла</MiniButton><MiniButton variant="secondary" disabled={Boolean(updating)} onClick={() => void update('confirmed')}><ShieldCheck className="size-4" />Подтвердить</MiniButton><MiniButton variant="secondary" disabled={Boolean(updating)} onClick={() => void update('new')}><Bell className="size-4" />Новая</MiniButton><MiniButton variant="danger" disabled={Boolean(updating)} onClick={() => void update('no_show')}><XCircle className="size-4" />Не пришла</MiniButton></div></div></div></div>;
}

export function MiniAppEntry() {
  const { locale } = useLocale();
  const { settings } = useAppearance();
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

  const [screen, setScreen] = useState<MiniScreen>('today');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bootState, setBootState] = useState<'loading' | 'ready'>('loading');
  const bootedRef = useRef(false);

  const workspaceRecord = safeRecord(workspaceData);
  const dataset = useMemo(
    () => ownedProfile ? buildWorkspaceDatasetFromStored(ownedProfile, bookings, locale, workspaceData) : null,
    [bookings, locale, ownedProfile, workspaceData],
  );
  const accentTone: AccentTone = settings.accentTone;
  const accent = accentPalette[accentTone];

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let cancelled = false;

    async function boot() {
      try {
        await authorizeTelegramMiniAppSession({ force: true, waitMs: 2600 });
      } catch {}

      await refreshWorkspace();
      if (!cancelled) setBootState('ready');
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [refreshWorkspace]);

  if (!hasHydrated || bootState === 'loading') return <MiniLoading />;

  if (!ownedProfile || !dataset) return <MiniOnboarding onSave={saveProfile} />;

  return (
    <>
      <MiniShell screen={screen} setScreen={setScreen} profile={ownedProfile} onRefresh={() => void refreshWorkspace()} accent={accent}>
        {screen === 'today' ? <TodayScreen bookings={bookings} dataset={dataset} onOpenBooking={setSelectedBooking} /> : null}
        {screen === 'availability' ? <AvailabilityScreen availability={dataset.availability} updateWorkspaceSection={updateWorkspaceSection} /> : null}
        {screen === 'chats' ? <ChatsScreen /> : null}
        {screen === 'clients' ? <ClientsScreen clients={dataset.clients} notes={safeRecord(workspaceRecord.clientNotes) as Record<string, string>} favorites={safeRecord(workspaceRecord.clientFavorites) as Record<string, boolean>} updateWorkspaceSection={updateWorkspaceSection} /> : null}
        {screen === 'profile' ? <ProfileScreen profile={ownedProfile} onSave={saveProfile} getPublicPath={getPublicPath} /> : null}
        {screen === 'services' ? <ServicesScreen services={dataset.services} profile={ownedProfile} onSave={saveProfile} updateWorkspaceSection={updateWorkspaceSection} /> : null}
        {screen === 'analytics' ? <AnalyticsScreen dataset={dataset} /> : null}
        {screen === 'appearance' ? <AppearanceScreen /> : null}
        {screen === 'settings' ? <SettingsScreen workspaceData={workspaceRecord} updateWorkspaceSection={updateWorkspaceSection} /> : null}
        {screen === 'more' ? <MoreScreen setScreen={setScreen} /> : null}
      </MiniShell>

      <BookingSheet booking={selectedBooking} onClose={() => setSelectedBooking(null)} onStatus={updateBookingStatus} />
    </>
  );
}
