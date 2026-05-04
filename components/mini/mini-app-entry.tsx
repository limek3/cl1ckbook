'use client';

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
  | 'profile';

type BookingStatus = 'new' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
type DayStatus = 'workday' | 'short' | 'day-off';
type ServiceStatus = 'active' | 'seasonal' | 'draft';

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

  const date = text(row.date, today()).slice(0, 10);
  const time = timeLabel(row.time);

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

    return {
      ...base,
      status: (rawStatus === 'day-off' || rawStatus === 'short' ? rawStatus : 'workday') as DayStatus,
      start: timeLabel(row.start ?? row.startTime ?? row.start_time ?? base.start),
      end: timeLabel(row.end ?? row.endTime ?? row.end_time ?? base.end),
      breakStart: text(row.breakStart ?? row.break_start)
        ? timeLabel(row.breakStart ?? row.break_start)
        : '',
      breakEnd: text(row.breakEnd ?? row.break_end)
        ? timeLabel(row.breakEnd ?? row.break_end)
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

function buildClients(bookings: Booking[], services: Service[]): Client[] {
  const prices = new Map(services.map((service) => [service.name, service.price]));
  const map = new Map<string, Client>();

  for (const booking of bookings) {
    const key = booking.clientPhone || booking.clientName;

    if (!key) continue;

    const prev = map.get(key);
    const revenue =
      booking.status === 'completed'
        ? booking.priceAmount || prices.get(booking.service) || 0
        : 0;

    map.set(key, {
      id: key,
      name: booking.clientName,
      phone: booking.clientPhone,
      visits: (prev?.visits ?? 0) + (booking.status === 'completed' ? 1 : 0),
      revenue: (prev?.revenue ?? 0) + revenue,
      lastVisit:
        !prev || `${booking.date} ${booking.time}` > prev.lastVisit
          ? `${booking.date} ${booking.time}`
          : prev.lastVisit,
      note: prev?.note || booking.comment,
      favorite: prev?.favorite || revenue > 0,
    });
  }

  return Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
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

function theme(light: boolean) {
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
  return <div className={cx('rounded-[14px] border shadow-none', theme(light).card, className)}>{children}</div>;
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
            : theme(light).ghost,
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
        theme(light).input,
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
        theme(light).input,
        className,
      )}
    />
  );
}

function Empty({ light, title, text: body }: { light: boolean; title: string; text: string }) {
  return (
    <div className={cx('rounded-[12px] border p-4 text-center', theme(light).panel)}>
      <div className="text-[13px] font-bold tracking-[-0.03em]">{title}</div>
      <div className={cx('mt-1 text-[11px] leading-4', theme(light).muted)}>{body}</div>
    </div>
  );
}

function Stat({ light, label, value }: { light: boolean; label: string; value: string }) {
  return (
    <div className={cx('rounded-[11px] border p-3', theme(light).panel)}>
      <div className={cx('text-[10px] font-bold uppercase tracking-[0.14em]', theme(light).muted)}>{label}</div>
      <div className="mt-1 truncate text-[17px] font-semibold tracking-[-0.06em]">{value}</div>
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
  const t = theme(light);
  const isChatOpen = screen === 'chat';

  const tabs: Array<{ id: Screen; label: string; icon: ReactNode }> = [
    { id: 'today', label: 'Сегодня', icon: <CalendarClock className="size-4" /> },
    { id: 'schedule', label: 'График', icon: <Clock3 className="size-4" /> },
    { id: 'services', label: 'Услуги', icon: <Scissors className="size-4" /> },
    { id: 'chats', label: 'Чаты', icon: <MessageCircle className="size-4" /> },
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
              const active =
                screen === tab.id ||
                (tab.id === 'chats' && screen === 'chat') ||
                (tab.id === 'more' && ['clients', 'analytics', 'profile'].includes(screen));

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

function TodayScreen({
  light,
  profile,
  bookings,
  services,
  week,
  setScreen,
  openBooking,
  openQuick,
  publicUrl,
}: {
  light: boolean;
  profile: Profile;
  bookings: Booking[];
  services: Service[];
  week: WorkDay[];
  setScreen: (value: Screen) => void;
  openBooking: (booking: Booking) => void;
  openQuick: () => void;
  publicUrl: string;
}) {
  const t = theme(light);
  const [date, setDate] = useState(today());

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(today(), index)), []);
  const dayBookings = bookings.filter((booking) => booking.date === date).sort((a, b) => a.time.localeCompare(b.time));
  const active = dayBookings.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show');
  const completed = dayBookings.filter((booking) => booking.status === 'completed');
  const revenue = completed.reduce(
    (sum, booking) => sum + (booking.priceAmount || services.find((service) => service.name === booking.service)?.price || 0),
    0,
  );

  const ready = [
    len(services) > 0,
    week.some((day) => day.status !== 'day-off'),
    Boolean(profile.phone || profile.telegram || profile.whatsapp),
  ];

  return (
    <>
      <Card light={light} className="overflow-hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Micro>Рабочий пульт</Micro>
            <div className="mt-2 text-[32px] font-semibold leading-[0.9] tracking-[-0.095em]">Сегодня</div>
            <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Записи, касса, быстрые действия и готовность профиля.</div>
          </div>
          <div className={cx('rounded-full border px-2.5 py-1 text-[10px] font-bold', t.ghost)}>
            {ready.filter(Boolean).length}/3
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat light={light} label="Записей" value={String(len(active))} />
          <Stat light={light} label="Пришли" value={String(len(completed))} />
          <Stat light={light} label="Касса" value={rub(revenue)} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button light={light} primary onClick={openQuick}>
            <Plus className="size-4" />
            Запись
          </Button>
          <Button light={light} onClick={() => navigator.clipboard?.writeText(publicUrl).catch(() => null)}>
            <Copy className="size-4" />
            Ссылка
          </Button>
        </div>
      </Card>

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
          <Button light={light} className="h-8 px-2" onClick={openQuick}>
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
        </div>
      </Card>
    </>
  );
}

function BookingRow({ light, booking, onClick }: { light: boolean; booking: Booking; onClick: () => void }) {
  const t = theme(light);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx('flex w-full items-center gap-3 rounded-[12px] border p-3 text-left', t.panel)}
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
      </div>
      <ChevronRight className={cx('size-4 shrink-0', t.muted)} />
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
  const t = theme(light);

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

function ScheduleScreen({
  light,
  workspaceId,
  days,
  setDays,
  reload,
}: {
  light: boolean;
  workspaceId: string;
  days: WorkDay[];
  setDays: (days: WorkDay[]) => void;
  reload: () => Promise<void>;
}) {
  const t = theme(light);
  const [saving, setSaving] = useState(false);

  const update = (dayId: string, patch: Partial<WorkDay>) => {
    setDays(days.map((day) => (day.id === dayId ? { ...day, ...patch } : day)));
  };

  const preset = (mode: '5/2' | '7/0') => {
    setDays(
      DEFAULT_WEEK.map((day) => ({
        ...day,
        status: mode === '7/0' || day.weekdayIndex < 5 ? 'workday' : 'day-off',
      })),
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
        value: days,
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
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Дни, время и перерывы для записи клиентов.</div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button light={light} onClick={() => preset('5/2')}>
            5/2
          </Button>
          <Button light={light} onClick={() => preset('7/0')}>
            7 дней
          </Button>
          <Button light={light} primary disabled={saving} onClick={() => void save()}>
            <Save className="size-4" />
            {saving ? '...' : 'Сохранить'}
          </Button>
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
  setServices,
  reload,
}: {
  light: boolean;
  profile: Profile;
  workspaceId: string;
  services: Service[];
  setServices: (services: Service[]) => void;
  reload: () => Promise<void>;
}) {
  const t = theme(light);
  const [saving, setSaving] = useState(false);

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
        category: 'Основное',
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
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Цены, длительность и видимость для клиентов.</div>
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

      <div className="space-y-2">
        {len(services) === 0 ? (
          <Empty light={light} title="Услуг нет" text="Добавь первую услугу, чтобы клиенты могли записываться." />
        ) : (
          services.map((service) => (
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
          ))
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
  const t = theme(light);
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
            <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>
              Как в Telegram: список диалогов, быстрый вход и отдельная страница чата.
            </div>
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
  const t = theme(light);
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
                  <div className={cx('mt-1 text-right text-[9px] font-semibold opacity-45')}>{timeFromDate(item.createdAt)}</div>
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
  const t = theme(light);

  const items: Array<{ screen: Screen; title: string; info: string; icon: ReactNode }> = [
    { screen: 'clients', title: 'Клиенты', info: `${len(clients)} карточек`, icon: <Users2 className="size-4" /> },
    { screen: 'analytics', title: 'Аналитика', info: `${len(bookings)} заявок`, icon: <BarChart3 className="size-4" /> },
    { screen: 'profile', title: 'Профиль', info: `/${profile.slug}`, icon: <UserRound className="size-4" /> },
  ];

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>Ещё</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">Управление</div>
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Клиенты, аналитика, профиль и полный кабинет.</div>
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

function ClientsScreen({ light, clients }: { light: boolean; clients: Client[] }) {
  const t = theme(light);

  return (
    <>
      <Card light={light} className="p-4">
        <Micro>Клиенты</Micro>
        <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.09em]">База</div>
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Карточки собираются из записей.</div>
      </Card>

      <div className="space-y-2">
        {len(clients) === 0 ? (
          <Empty light={light} title="Клиентов пока нет" text="Новые клиенты появятся после записей." />
        ) : (
          clients.map((client) => (
            <Card light={light} key={client.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className={cx('grid size-10 place-items-center rounded-[10px] border', t.panel)}>
                  {client.favorite ? <Star className="size-4" /> : <UserRound className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold tracking-[-0.04em]">{client.name}</div>
                  <div className={cx('mt-1 truncate text-[11px]', t.muted)}>
                    {client.phone || 'без телефона'} · {client.visits} визитов · {rub(client.revenue)}
                  </div>
                </div>
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className={cx('grid size-9 place-items-center rounded-[10px] border', t.ghost)}>
                    <Phone className="size-4" />
                  </a>
                ) : null}
              </div>

              {client.note ? <div className={cx('mt-3 rounded-[10px] border p-2 text-[11px] leading-4', t.panel)}>{client.note}</div> : null}
            </Card>
          ))
        )}
      </div>
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
  const t = theme(light);
  const completed = bookings.filter((booking) => booking.status === 'completed');
  const cancelled = bookings.filter((booking) => booking.status === 'cancelled' || booking.status === 'no_show');
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
        <div className={cx('mt-2 text-[12px] leading-5', t.muted)}>Короткий мобильный срез.</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat light={light} label="Выручка" value={rub(revenue)} />
          <Stat light={light} label="Конверсия" value={`${conversion}%`} />
          <Stat light={light} label="Пришли" value={String(len(completed))} />
          <Stat light={light} label="Срывы" value={String(len(cancelled))} />
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
  const t = theme(light);
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
  const t = theme(light);

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
}: {
  light: boolean;
  booking: Booking | null;
  services: Service[];
  onClose: () => void;
  updateStatus: (id: string, status: BookingStatus) => Promise<void>;
}) {
  const t = theme(light);

  if (!booking) return null;

  const price = booking.priceAmount || services.find((service) => service.name === booking.service)?.price || 0;
  const reminder = `${booking.clientName}, напоминаю про запись ${dateLabel(booking.date)} в ${booking.time}: ${booking.service}.`;

  return (
    <Sheet light={light} title="Запись" onClose={onClose}>
      <div className="space-y-3">
        <div className={cx('rounded-[12px] border p-3', t.panel)}>
          <div className="text-[18px] font-semibold tracking-[-0.06em]">{booking.clientName}</div>
          <div className={cx('mt-1 text-[12px]', t.muted)}>{booking.clientPhone || 'без телефона'}</div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat light={light} label="Дата" value={dateLabel(booking.date)} />
            <Stat light={light} label="Время" value={booking.time} />
            <Stat light={light} label="Услуга" value={booking.service} />
            <Stat light={light} label="Цена" value={rub(price)} />
          </div>

          {booking.comment ? <div className={cx('mt-3 rounded-[10px] border p-2 text-[12px] leading-5', t.panel)}>{booking.comment}</div> : null}
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
          <Button light={light} onClick={() => navigator.clipboard?.writeText(reminder).catch(() => null)}>
            <Copy className="size-4" />
            Напомнить
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
  onClose,
  reload,
}: {
  light: boolean;
  profile: Profile;
  services: Service[];
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const t = theme(light);
  const availableServices = services.filter((service) => service.visible && service.status !== 'draft');
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    service: availableServices[0]?.name || profile.services[0] || '',
    date: today(),
    time: '12:00',
    comment: '',
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
      const payload = response ? await parseJson(response).catch(() => ({})) : {};
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
  const t = theme(light);
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [week, setWeek] = useState<WorkDay[]>(DEFAULT_WEEK);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
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

      if (!activeThreadId && nextThreads[0]) {
        setActiveThreadId(nextThreads[0].id);
      }
    }

    setThreadsLoading(false);
  }, [activeThreadId]);

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
        const payload = await parseJson(response).catch(() => ({}));
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

      setWorkspaceId(text(workspace.id));
      setProfile(nextProfile);
      setData(nextData);
      setBookings(nextBookings);
      setServices(nextServices);
      setWeek(nextWeek);

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

  const openChat = (threadId: string) => {
    setActiveThreadId(threadId);
    setScreen('chat');
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
            setScreen={setScreen}
            openBooking={setSelectedBooking}
            openQuick={() => setQuickOpen(true)}
            publicUrl={publicUrl}
          />
        ) : null}

        {screen === 'schedule' ? (
          <ScheduleScreen
            light={light}
            workspaceId={workspaceId}
            days={week}
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

        {screen === 'clients' ? <ClientsScreen light={light} clients={clients} /> : null}

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
      </Shell>

      <BookingSheet
        light={light}
        booking={selectedBooking}
        services={services}
        onClose={() => setSelectedBooking(null)}
        updateStatus={updateBookingStatus}
      />

      {quickOpen ? (
        <QuickBookingSheet
          light={light}
          profile={profile}
          services={services}
          onClose={() => setQuickOpen(false)}
          reload={load}
        />
      ) : null}
    </>
  );
}