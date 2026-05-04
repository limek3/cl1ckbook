'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Copy,
  ExternalLink,
  Home,
  Loader2,
  MessageCircleMore,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
  UserRound,
  Users2,
  X,
  type LucideIcon,
} from 'lucide-react';

import { BrandLogo } from '@/components/brand/brand-logo';
import {
  authorizeTelegramMiniAppSession,
  getTelegramAppSessionHeaders,
  hasTelegramMiniAppRuntime,
} from '@/lib/telegram-miniapp-auth-client';
import { cn, parseServices, slugify } from '@/lib/utils';
import type { Booking, BookingStatus, MasterProfile } from '@/lib/types';
import type { WorkspaceSections, WorkspaceSnapshot } from '@/lib/workspace-store';

type MiniMode = 'checking' | 'desktop' | 'mobile';
type MiniTab = 'today' | 'bookings' | 'chats' | 'clients' | 'more';
type LoadState = 'loading' | 'ready' | 'profile_required' | 'auth_required' | 'error';
type ProfileStep = 0 | 1 | 2 | 3;

type ServiceLike = {
  id?: string;
  name?: string;
  price?: number;
  duration?: number;
  visible?: boolean;
  status?: string;
  bookings?: number;
  revenue?: number;
  popularity?: number;
};

type MiniProfileDraft = {
  name: string;
  profession: string;
  city: string;
  slug: string;
  bio: string;
  servicesText: string;
  phone: string;
  telegram: string;
  whatsapp: string;
  avatar: string;
  address: string;
};

const emptyDraft: MiniProfileDraft = {
  name: '',
  profession: '',
  city: '',
  slug: '',
  bio: '',
  servicesText: '',
  phone: '',
  telegram: '',
  whatsapp: '',
  avatar: '',
  address: '',
};

const statusCopy: Record<BookingStatus, { label: string; dot: string; tone: string }> = {
  new: {
    label: 'Новая',
    dot: 'bg-sky-400',
    tone: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
  },
  confirmed: {
    label: 'Запланирована',
    dot: 'bg-[#2f81ff]',
    tone: 'border-[#2f81ff]/25 bg-[#2f81ff]/10 text-blue-100',
  },
  completed: {
    label: 'Пришла',
    dot: 'bg-emerald-400',
    tone: 'border-emerald-400/22 bg-emerald-400/10 text-emerald-100',
  },
  no_show: {
    label: 'Не пришла',
    dot: 'bg-amber-400',
    tone: 'border-amber-400/22 bg-amber-400/10 text-amber-100',
  },
  cancelled: {
    label: 'Отмена',
    dot: 'bg-rose-400',
    tone: 'border-rose-400/22 bg-rose-400/10 text-rose-100',
  },
};

const tabs: Array<{ id: MiniTab; label: string; icon: LucideIcon }> = [
  { id: 'today', label: 'Сегодня', icon: Home },
  { id: 'bookings', label: 'Записи', icon: CalendarClock },
  { id: 'chats', label: 'Чаты', icon: MessageCircleMore },
  { id: 'clients', label: 'Клиенты', icon: Users2 },
  { id: 'more', label: 'Ещё', icon: MoreHorizontal },
];

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value || 0)) + ' ₽';
}

function parseDateTime(booking: Booking) {
  const value = new Date(`${booking.date}T${booking.time || '00:00'}:00`);
  return Number.isNaN(value.getTime()) ? new Date(booking.createdAt) : value;
}

function sortBookings(bookings: Booking[]) {
  return [...bookings].sort((a, b) => parseDateTime(a).getTime() - parseDateTime(b).getTime());
}

function bookingRevenue(booking: Booking, services: ServiceLike[]) {
  if (typeof booking.priceAmount === 'number') return booking.priceAmount;
  const service = services.find((item) => item.name === booking.service);
  return Number(service?.price ?? 0);
}

function getServices(sections?: WorkspaceSections | null, profile?: MasterProfile | null): ServiceLike[] {
  const dataServices = Array.isArray(sections?.services) ? (sections?.services as ServiceLike[]) : [];

  if (dataServices.length > 0) {
    return dataServices.filter((item) => item.visible !== false && item.status !== 'draft');
  }

  return (profile?.services ?? []).map((name, index) => ({
    id: `profile-service-${index}`,
    name,
    price: 0,
    duration: 60,
  }));
}

function initials(name?: string | null) {
  const parts = String(name || 'КБ').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'КБ';
}

function normalizeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Не удалось загрузить данные.';
}

function buildProfile(draft: MiniProfileDraft, previous?: MasterProfile | null): MasterProfile {
  const name = draft.name.trim() || 'Мастер';
  const slug = slugify(draft.slug || name) || `master-${Date.now().toString(36)}`;
  const services = parseServices(draft.servicesText);

  return {
    id: previous?.id ?? crypto.randomUUID(),
    slug,
    name,
    profession: draft.profession.trim() || 'Специалист',
    city: draft.city.trim() || 'Город',
    bio: draft.bio.trim() || 'Запишитесь онлайн на удобное время.',
    services: services.length > 0 ? services : ['Консультация'],
    phone: draft.phone.trim() || undefined,
    telegram: draft.telegram.trim() || undefined,
    whatsapp: draft.whatsapp.trim() || undefined,
    locationMode: draft.address.trim() ? 'address' : 'online',
    address: draft.address.trim() || undefined,
    avatar: draft.avatar.trim() || undefined,
    hidePhone: false,
    hideTelegram: false,
    hideWhatsapp: false,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
  };
}

async function readJsonSafe<T>(response: Response) {
  const text = await response.text();
  if (!text) return null as T | null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T | null;
  }
}

function MiniButton({
  children,
  onClick,
  href,
  primary = false,
  disabled = false,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const classes = cn(
    'inline-flex h-10 items-center justify-center gap-2 rounded-[13px] border px-3 text-[12px] font-semibold tracking-[-0.02em] transition active:scale-[0.985]',
    primary
      ? 'border-white/[0.12] bg-white text-black hover:bg-white/90'
      : 'border-white/[0.085] bg-white/[0.055] text-white/78 hover:border-white/[0.14] hover:bg-white/[0.085] hover:text-white',
    disabled && 'pointer-events-none opacity-45',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

function MiniCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        'rounded-[20px] border border-white/[0.08] bg-[#101010]/86 shadow-none backdrop-blur-[18px]',
        className,
      )}
    >
      {children}
    </section>
  );
}

function MiniHeader({
  title,
  subtitle,
  profile,
  right,
}: {
  title: string;
  subtitle?: string;
  profile?: MasterProfile | null;
  right?: ReactNode;
}) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3 px-1">
      <div className="min-w-0">
        <div className="mb-3 flex items-center gap-2 text-white/48">
          <div className="flex size-7 items-center justify-center overflow-hidden rounded-[9px] border border-white/[0.09] bg-white/[0.045]">
            {profile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-white/78">{initials(profile?.name)}</span>
            )}
          </div>
          <span className="truncate text-[12px] font-semibold tracking-[-0.03em] text-white/72">
            {profile?.name || 'КликБук'}
          </span>
        </div>

        <h1 className="text-[28px] font-semibold leading-[0.95] tracking-[-0.075em] text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-[320px] text-[12.5px] leading-5 text-white/42">
            {subtitle}
          </p>
        ) : null}
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

function StatusPill({ status }: { status: BookingStatus }) {
  const item = statusCopy[status] ?? statusCopy.new;
  return (
    <span className={cn('inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10.5px] font-semibold', item.tone)}>
      <span className={cn('size-1.5 rounded-full', item.dot)} />
      {item.label}
    </span>
  );
}

function BookingCard({
  booking,
  services,
  onOpen,
}: {
  booking: Booking;
  services: ServiceLike[];
  onOpen: (booking: Booking) => void;
}) {
  const revenue = bookingRevenue(booking, services);

  return (
    <button
      type="button"
      onClick={() => onOpen(booking)}
      className="w-full rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:bg-white/[0.055] active:scale-[0.992]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-semibold tracking-[-0.06em] text-white">
              {booking.time}
            </span>
            <StatusPill status={booking.status} />
          </div>
          <div className="mt-2 truncate text-[15px] font-semibold tracking-[-0.04em] text-white/92">
            {booking.clientName}
          </div>
          <div className="mt-1 truncate text-[12px] text-white/42">
            {booking.service}{revenue ? ` · ${formatMoney(revenue)}` : ''}
          </div>
        </div>

        <ChevronRight className="mt-1 size-4 shrink-0 text-white/26" />
      </div>
    </button>
  );
}

function MetricTile({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/28">{label}</div>
      <div className="mt-2 text-[19px] font-semibold tracking-[-0.06em] text-white">{value}</div>
      {caption ? <div className="mt-0.5 truncate text-[10.5px] text-white/32">{caption}</div> : null}
    </div>
  );
}

function MiniBottomNav({ tab, setTab }: { tab: MiniTab; setTab: (tab: MiniTab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[520px] px-3 pb-[calc(var(--tg-safe-bottom)+10px)]">
      <div className="grid grid-cols-5 rounded-[22px] border border-white/[0.09] bg-[#101010]/88 p-1 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-[24px]">
        {tabs.map((item) => {
          const active = tab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'relative flex h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[17px] text-[10.5px] font-semibold transition',
                active
                  ? 'bg-white/[0.075] text-white'
                  : 'text-white/42 hover:bg-white/[0.04] hover:text-white/72',
              )}
            >
              <Icon className="size-[18px]" />
              <span className="truncate leading-none">{item.label}</span>
              {active ? <span className="absolute bottom-1.5 size-1 rounded-full bg-white/78" /> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TodayScreen({
  profile,
  bookings,
  services,
  onOpenBooking,
  onRefresh,
}: {
  profile: MasterProfile;
  bookings: Booking[];
  services: ServiceLike[];
  onOpenBooking: (booking: Booking) => void;
  onRefresh: () => void;
}) {
  const today = todayIso();
  const todaysBookings = useMemo(
    () => sortBookings(bookings.filter((booking) => booking.date === today && booking.status !== 'cancelled')),
    [bookings, today],
  );
  const nearest = todaysBookings.find((booking) => booking.status !== 'completed' && booking.status !== 'no_show') ?? todaysBookings[0];
  const revenue = todaysBookings.reduce((sum, booking) => sum + bookingRevenue(booking, services), 0);
  const riskCount = todaysBookings.filter((booking) => booking.status === 'new' || booking.status === 'no_show').length;

  return (
    <>
      <MiniHeader
        title="Сегодня"
        subtitle="Быстрый пульт мастера: ближайшая запись, статусы, клиенты и действия на день."
        profile={profile}
        right={
          <button
            type="button"
            onClick={onRefresh}
            className="grid size-10 place-items-center rounded-[13px] border border-white/[0.08] bg-white/[0.045] text-white/62 transition hover:bg-white/[0.075] hover:text-white"
          >
            <RefreshCw className="size-4" />
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-2">
        <MetricTile label="Записи" value={String(todaysBookings.length)} caption="на сегодня" />
        <MetricTile label="Доход" value={formatMoney(revenue)} caption="по услугам" />
        <MetricTile label="Риск" value={String(riskCount)} caption="проверить" />
      </div>

      <MiniCard className="mt-3 overflow-hidden p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
              Ближайшая
            </div>
            <div className="mt-1 text-[13px] text-white/42">что нужно сделать сейчас</div>
          </div>
          <MiniButton href="/dashboard/today" className="h-8 px-2.5 text-[10.5px]">
            ПК
            <ExternalLink className="size-3" />
          </MiniButton>
        </div>

        {nearest ? (
          <div className="mt-4 rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[34px] font-semibold leading-none tracking-[-0.08em] text-white">
                  {nearest.time}
                </div>
                <div className="mt-3 truncate text-[20px] font-semibold tracking-[-0.06em] text-white">
                  {nearest.clientName}
                </div>
                <div className="mt-1 text-[12.5px] text-white/44">
                  {nearest.service}
                </div>
              </div>
              <StatusPill status={nearest.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniButton onClick={() => onOpenBooking(nearest)} primary>
                Открыть
              </MiniButton>
              <MiniButton href={`tel:${nearest.clientPhone}`}>
                <Phone className="size-3.5" />
                Позвонить
              </MiniButton>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border border-dashed border-white/[0.09] bg-white/[0.025] p-5 text-center">
            <div className="mx-auto grid size-11 place-items-center rounded-[14px] bg-white/[0.045] text-white/42">
              <CalendarClock className="size-5" />
            </div>
            <div className="mt-3 text-[16px] font-semibold tracking-[-0.045em] text-white">На сегодня пусто</div>
            <p className="mx-auto mt-1 max-w-[240px] text-[12px] leading-5 text-white/38">
              Когда клиент запишется, ближайшая заявка появится здесь.
            </p>
          </div>
        )}
      </MiniCard>

      <MiniCard className="mt-3 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.045em] text-white">День</div>
            <div className="mt-0.5 text-[11.5px] text-white/36">все записи компактным списком</div>
          </div>
        </div>

        <div className="grid gap-2">
          {todaysBookings.slice(0, 8).map((booking) => (
            <BookingCard key={booking.id} booking={booking} services={services} onOpen={onOpenBooking} />
          ))}
        </div>
      </MiniCard>
    </>
  );
}

function BookingsScreen({
  profile,
  bookings,
  services,
  onOpenBooking,
}: {
  profile: MasterProfile;
  bookings: Booking[];
  services: ServiceLike[];
  onOpenBooking: (booking: Booking) => void;
}) {
  const upcoming = useMemo(
    () => sortBookings(bookings.filter((booking) => booking.status !== 'cancelled')).slice(0, 30),
    [bookings],
  );

  return (
    <>
      <MiniHeader
        title="Записи"
        subtitle="Короткий список клиентов. Нажмите на запись, чтобы сменить статус или связаться."
        profile={profile}
        right={
          <MiniButton href="/dashboard/today" className="h-10 px-3">
            <Plus className="size-4" />
          </MiniButton>
        }
      />

      <div className="grid gap-2">
        {upcoming.map((booking) => (
          <BookingCard key={booking.id} booking={booking} services={services} onOpen={onOpenBooking} />
        ))}
      </div>

      {upcoming.length === 0 ? <EmptyState title="Записей пока нет" text="Новые заявки будут появляться здесь." /> : null}
    </>
  );
}

function ChatsScreen({
  profile,
  bookings,
  onOpenBooking,
}: {
  profile: MasterProfile;
  bookings: Booking[];
  onOpenBooking: (booking: Booking) => void;
}) {
  const threads = useMemo(() => {
    const map = new Map<string, Booking>();

    for (const booking of sortBookings(bookings).reverse()) {
      const key = booking.clientPhone || booking.clientName;
      if (!map.has(key)) map.set(key, booking);
    }

    return Array.from(map.values()).slice(0, 20);
  }, [bookings]);

  return (
    <>
      <MiniHeader
        title="Чаты"
        subtitle="Быстрые карточки коммуникаций. Полный чат можно открыть в веб-кабинете."
        profile={profile}
        right={<MiniButton href="/dashboard/chats" className="h-10 px-3"><ExternalLink className="size-4" /></MiniButton>}
      />

      <div className="grid gap-2">
        {threads.map((booking) => (
          <button
            key={`${booking.id}-chat`}
            type="button"
            onClick={() => onOpenBooking(booking)}
            className="flex items-center gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:bg-white/[0.055]"
          >
            <div className="grid size-11 shrink-0 place-items-center rounded-[15px] border border-white/[0.08] bg-white/[0.045] text-[13px] font-semibold text-white/80">
              {initials(booking.clientName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold tracking-[-0.035em] text-white">{booking.clientName}</div>
              <div className="mt-1 truncate text-[11.5px] text-white/38">
                {booking.service} · {booking.date} {booking.time}
              </div>
            </div>
            <ChevronRight className="size-4 text-white/26" />
          </button>
        ))}
      </div>

      {threads.length === 0 ? <EmptyState title="Чатов пока нет" text="Когда появятся записи, здесь будут быстрые карточки клиентов." /> : null}
    </>
  );
}

function ClientsScreen({
  profile,
  bookings,
  onOpenBooking,
}: {
  profile: MasterProfile;
  bookings: Booking[];
  onOpenBooking: (booking: Booking) => void;
}) {
  const clients = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number; last: Booking }>();

    for (const booking of sortBookings(bookings)) {
      const key = booking.clientPhone || booking.clientName;
      const current = map.get(key);
      map.set(key, {
        name: booking.clientName,
        phone: booking.clientPhone,
        count: (current?.count ?? 0) + 1,
        last: booking,
      });
    }

    return Array.from(map.values()).reverse().slice(0, 30);
  }, [bookings]);

  return (
    <>
      <MiniHeader
        title="Клиенты"
        subtitle="Клиентская база без таблиц: история, контакт и последняя запись."
        profile={profile}
        right={<MiniButton href="/dashboard/clients" className="h-10 px-3"><ExternalLink className="size-4" /></MiniButton>}
      />

      <div className="grid gap-2">
        {clients.map((client) => (
          <button
            key={client.phone || client.name}
            type="button"
            onClick={() => onOpenBooking(client.last)}
            className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:bg-white/[0.055]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold tracking-[-0.04em] text-white">{client.name}</div>
                <div className="mt-1 truncate text-[11.5px] text-white/38">{client.count} визит(а) · {client.last.service}</div>
              </div>
              <div className="text-right text-[11px] text-white/34">
                <div>{client.last.date}</div>
                <div>{client.last.time}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {clients.length === 0 ? <EmptyState title="Клиентов пока нет" text="После первой записи клиент появится здесь." /> : null}
    </>
  );
}

function MoreScreen({ profile, services, bookings }: { profile: MasterProfile; services: ServiceLike[]; bookings: Booking[] }) {
  const revenue = bookings.reduce((sum, booking) => sum + bookingRevenue(booking, services), 0);
  const menu = [
    { label: 'Профиль', caption: 'публичная страница', href: '/dashboard/profile', icon: CircleUserRound },
    { label: 'Услуги', caption: `${services.length} активных`, href: '/dashboard/services', icon: ClipboardList },
    { label: 'Аналитика', caption: formatMoney(revenue), href: '/dashboard/stats', icon: BarChart3 },
    { label: 'Внешний вид', caption: 'цвета и тема', href: '/dashboard/appearance', icon: Sparkles },
    { label: 'Настройки', caption: 'уведомления и доступ', href: '/dashboard/notifications', icon: Settings2 },
    { label: 'Веб-кабинет', caption: 'полная версия', href: '/dashboard', icon: ExternalLink },
  ];

  return (
    <>
      <MiniHeader title="Ещё" subtitle="Разделы кабинета в спокойном индексном меню." profile={profile} />

      <MiniCard className="overflow-hidden p-2">
        {menu.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-[17px] px-3 py-3 transition hover:bg-white/[0.055]"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/[0.09] text-[10px] font-semibold text-white/42 group-hover:text-white/78">
                {index + 1}
              </span>
              <Icon className="size-4 shrink-0 text-white/32 group-hover:text-white/62" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold tracking-[-0.04em] text-white/82 group-hover:text-white">
                  {item.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-white/32">{item.caption}</span>
              </span>
              <ChevronRight className="size-4 text-white/22 group-hover:text-white/50" />
            </Link>
          );
        })}
      </MiniCard>

      <MiniCard className="mt-3 p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Публичная ссылка</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="min-w-0 flex-1 truncate text-[18px] font-semibold tracking-[-0.06em] text-white">/m/{profile.slug}</div>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/m/${profile.slug}`).catch(() => {})}
            className="grid size-9 place-items-center rounded-[12px] border border-white/[0.08] bg-white/[0.045] text-white/58"
          >
            <Copy className="size-4" />
          </button>
        </div>
      </MiniCard>
    </>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-white/[0.09] bg-white/[0.025] p-6 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-[16px] bg-white/[0.045] text-white/40">
        <Sparkles className="size-5" />
      </div>
      <div className="mt-3 text-[16px] font-semibold tracking-[-0.045em] text-white">{title}</div>
      <p className="mx-auto mt-1 max-w-[260px] text-[12px] leading-5 text-white/38">{text}</p>
    </div>
  );
}

function BookingSheet({
  booking,
  services,
  updatingStatus,
  onClose,
  onStatus,
}: {
  booking: Booking | null;
  services: ServiceLike[];
  updatingStatus: boolean;
  onClose: () => void;
  onStatus: (bookingId: string, status: BookingStatus) => void;
}) {
  if (!booking) return null;

  const revenue = bookingRevenue(booking, services);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 px-3 pb-[calc(var(--tg-safe-bottom)+10px)] backdrop-blur-[10px]">
      <div className="w-full max-w-[520px] overflow-hidden rounded-t-[28px] border border-white/[0.10] bg-[#101010] shadow-[0_-30px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusPill status={booking.status} />
              <span className="text-[11px] text-white/34">{booking.date} · {booking.time}</span>
            </div>
            <div className="mt-3 truncate text-[25px] font-semibold leading-none tracking-[-0.075em] text-white">
              {booking.clientName}
            </div>
            <div className="mt-2 text-[12.5px] text-white/42">
              {booking.service}{revenue ? ` · ${formatMoney(revenue)}` : ''}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-[14px] border border-white/[0.08] bg-white/[0.045] text-white/58"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <MiniButton href={`tel:${booking.clientPhone}`}>
              <Phone className="size-4" />
              Позвонить
            </MiniButton>
            <MiniButton href="/dashboard/chats">
              <MessageCircleMore className="size-4" />
              Чат
            </MiniButton>
          </div>

          {booking.comment ? (
            <div className="mt-3 rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/28">Комментарий</div>
              <div className="mt-2 text-[12.5px] leading-5 text-white/56">{booking.comment}</div>
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniButton disabled={updatingStatus} primary onClick={() => onStatus(booking.id, 'completed')}>
              {updatingStatus ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Пришла
            </MiniButton>
            <MiniButton disabled={updatingStatus} onClick={() => onStatus(booking.id, 'confirmed')}>
              Подтвердить
            </MiniButton>
            <MiniButton disabled={updatingStatus} onClick={() => onStatus(booking.id, 'no_show')}>
              Не пришла
            </MiniButton>
            <MiniButton disabled={updatingStatus} onClick={() => onStatus(booking.id, 'cancelled')}>
              Отмена
            </MiniButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileLoginRequired({ error }: { error?: string }) {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim();
  const botUrl = botUsername ? `https://t.me/${botUsername}?startapp=dashboard` : null;

  return (
    <main className="cb-mini-app-root min-h-screen bg-[#090909] px-4 text-white">
      <div className="mx-auto flex min-h-[72vh] w-full max-w-[520px] flex-col justify-center">
        <MiniCard className="overflow-hidden p-5">
          <BrandLogo className="w-[104px]" />
          <div className="mt-6 text-[28px] font-semibold leading-[0.95] tracking-[-0.075em] text-white">
            Откройте кабинет
          </div>
          <p className="mt-3 text-[12.5px] leading-5 text-white/42">
            На телефоне кабинет работает как быстрый пульт мастера. Для входа используйте Telegram Mini App или сайт.
          </p>
          {error ? <p className="mt-3 rounded-[14px] border border-amber-400/20 bg-amber-400/10 p-3 text-[12px] leading-5 text-amber-100/80">{error}</p> : null}
          <div className="mt-5 grid gap-2">
            {botUrl ? (
              <a
                href={botUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-white px-4 text-[12px] font-semibold text-black"
              >
                <Send className="size-4" />
                Открыть в Telegram
              </a>
            ) : null}
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-white/[0.09] bg-white/[0.055] px-4 text-[12px] font-semibold text-white/76"
            >
              Войти на сайте
            </Link>
          </div>
        </MiniCard>
      </div>
    </main>
  );
}

function ProfileWizard({
  saving,
  error,
  onSave,
}: {
  saving: boolean;
  error: string | null;
  onSave: (profile: MasterProfile) => void;
}) {
  const [step, setStep] = useState<ProfileStep>(0);
  const [draft, setDraft] = useState<MiniProfileDraft>(emptyDraft);

  const update = (key: keyof MiniProfileDraft) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === 'name' && !current.slug ? { slug: slugify(value) } : {}),
    }));
  };

  const steps = [
    { title: 'Основное', caption: 'имя, профессия и город' },
    { title: 'Услуги', caption: 'что смогут выбрать клиенты' },
    { title: 'Контакты', caption: 'куда писать и звонить' },
    { title: 'Готово', caption: 'проверка и сохранение' },
  ] as const;

  const canGoNext =
    step === 0 ? Boolean(draft.name.trim() && draft.profession.trim() && draft.city.trim()) :
    step === 1 ? parseServices(draft.servicesText).length > 0 :
    step === 2 ? Boolean(draft.phone.trim() || draft.telegram.trim() || draft.whatsapp.trim()) :
    true;

  const submit = () => {
    if (step < 3) {
      setStep((current) => Math.min(3, current + 1) as ProfileStep);
      return;
    }

    onSave(buildProfile(draft));
  };

  return (
    <main className="cb-mini-app-root min-h-screen bg-[#090909] px-4 text-white">
      <div className="mx-auto w-full max-w-[520px]">
        <MiniHeader title="Создание профиля" subtitle="Заполните минимум. Остальное можно спокойно настроить позже." />

        <MiniCard className="overflow-hidden">
          <div className="border-b border-white/[0.08] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Шаг {step + 1} из 4</div>
                <div className="mt-2 text-[20px] font-semibold tracking-[-0.06em] text-white">{steps[step].title}</div>
                <div className="mt-1 text-[12px] text-white/38">{steps[step].caption}</div>
              </div>
              <div className="flex gap-1.5">
                {steps.map((item, index) => (
                  <span
                    key={item.title}
                    className={cn('size-2 rounded-full', index === step ? 'bg-white' : 'bg-white/[0.16]')}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4">
            {step === 0 ? (
              <>
                <MiniInput label="Имя мастера" value={draft.name} onChange={update('name')} placeholder="Например, Борис" />
                <MiniInput label="Специализация" value={draft.profession} onChange={update('profession')} placeholder="Барбер, мастер маникюра, тренер" />
                <MiniInput label="Город" value={draft.city} onChange={update('city')} placeholder="Москва" />
                <MiniInput label="Ссылка" value={draft.slug} onChange={update('slug')} placeholder="admin" prefix="/m/" />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <MiniTextarea label="Услуги" value={draft.servicesText} onChange={update('servicesText')} placeholder={'Маникюр — 2500 ₽\nПедикюр — 3000 ₽\nКонсультация — 1500 ₽'} rows={6} />
                <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3 text-[12px] leading-5 text-white/42">
                  Пишите каждую услугу с новой строки. Потом в веб-кабинете можно настроить длительность, цену и расписание точнее.
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <MiniInput label="Телефон" value={draft.phone} onChange={update('phone')} placeholder="+7 999 000-00-00" />
                <MiniInput label="Telegram" value={draft.telegram} onChange={update('telegram')} placeholder="@username" />
                <MiniInput label="WhatsApp / VK" value={draft.whatsapp} onChange={update('whatsapp')} placeholder="ссылка или номер" />
                <MiniInput label="Адрес" value={draft.address} onChange={update('address')} placeholder="можно оставить пустым" />
              </>
            ) : null}

            {step === 3 ? (
              <>
                <MiniTextarea label="Короткое описание" value={draft.bio} onChange={update('bio')} placeholder="Расскажите клиентам, чем вы занимаетесь и как проходит запись." rows={5} />
                <MiniInput label="Фото / аватар" value={draft.avatar} onChange={update('avatar')} placeholder="ссылка на изображение, можно позже" />
                <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/28">Проверка</div>
                  <div className="mt-2 text-[15px] font-semibold tracking-[-0.04em] text-white">{draft.name || 'Имя мастера'}</div>
                  <div className="mt-1 text-[12px] text-white/42">{draft.profession || 'Специализация'} · {draft.city || 'Город'}</div>
                  <div className="mt-2 text-[12px] text-white/38">/m/{draft.slug || slugify(draft.name) || 'profile'}</div>
                </div>
              </>
            ) : null}

            {error ? <div className="rounded-[14px] border border-rose-400/20 bg-rose-400/10 p-3 text-[12px] leading-5 text-rose-100/80">{error}</div> : null}
          </div>
        </MiniCard>

        <div className="sticky bottom-[calc(var(--tg-safe-bottom)+12px)] mt-4 grid grid-cols-[92px_1fr] gap-2">
          <MiniButton disabled={saving || step === 0} onClick={() => setStep((current) => Math.max(0, current - 1) as ProfileStep)}>
            Назад
          </MiniButton>
          <MiniButton primary disabled={saving || !canGoNext} onClick={submit}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {step === 3 ? 'Сохранить профиль' : 'Далее'}
            {!saving ? <ArrowRight className="size-4" /> : null}
          </MiniButton>
        </div>
      </div>
    </main>
  );
}

function MiniInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">{label}</span>
      <span className="flex h-11 items-center rounded-[14px] border border-white/[0.08] bg-white/[0.045] px-3 transition focus-within:border-white/[0.16]">
        {prefix ? <span className="mr-1.5 text-[13px] font-semibold text-white/34">{prefix}</span> : null}
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-semibold tracking-[-0.025em] text-white outline-none placeholder:text-white/22"
        />
      </span>
    </label>
  );
}

function MiniTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-[14px] border border-white/[0.08] bg-white/[0.045] px-3 py-3 text-[14px] font-semibold leading-5 tracking-[-0.025em] text-white outline-none transition placeholder:text-white/22 focus:border-white/[0.16]"
      />
    </label>
  );
}

function MobileDashboard({
  snapshot,
  setSnapshot,
  onRefresh,
}: {
  snapshot: WorkspaceSnapshot;
  setSnapshot: (snapshot: WorkspaceSnapshot) => void;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<MiniTab>('today');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const profile = snapshot.profile;
  const sections = snapshot.data ?? {};
  const bookings = useMemo(() => Array.isArray(sections.bookings) ? sections.bookings : [], [sections.bookings]);
  const services = useMemo(() => getServices(sections, profile), [sections, profile]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    setUpdatingStatus(true);

    const optimisticBookings = bookings.map((booking) => booking.id === bookingId ? { ...booking, status } : booking);
    setSnapshot({
      ...snapshot,
      data: {
        ...(snapshot.data ?? {}),
        bookings: optimisticBookings,
      },
    });
    setSelectedBooking((current) => current?.id === bookingId ? { ...current, status } : current);

    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...getTelegramAppSessionHeaders(),
        },
        body: JSON.stringify({ bookingId, status }),
      });

      if (!response.ok) throw new Error('booking_status_update_failed');
      const payload = await readJsonSafe<{ booking?: Booking }>(response);
      const updated = payload?.booking;

      if (updated) {
        const confirmedBookings = optimisticBookings.map((booking) => booking.id === bookingId ? updated : booking);
        setSnapshot({
          ...snapshot,
          data: {
            ...(snapshot.data ?? {}),
            bookings: confirmedBookings,
          },
        });
        setSelectedBooking(updated);
      }
    } catch {
      onRefresh();
    } finally {
      setUpdatingStatus(false);
    }
  }, [bookings, onRefresh, setSnapshot, snapshot]);

  return (
    <main className="cb-mini-app-root min-h-screen bg-[#090909] px-3 text-white">
      <div className="mx-auto w-full max-w-[520px] pb-24">
        {tab === 'today' ? (
          <TodayScreen profile={profile} bookings={bookings} services={services} onOpenBooking={setSelectedBooking} onRefresh={onRefresh} />
        ) : null}
        {tab === 'bookings' ? (
          <BookingsScreen profile={profile} bookings={bookings} services={services} onOpenBooking={setSelectedBooking} />
        ) : null}
        {tab === 'chats' ? (
          <ChatsScreen profile={profile} bookings={bookings} onOpenBooking={setSelectedBooking} />
        ) : null}
        {tab === 'clients' ? (
          <ClientsScreen profile={profile} bookings={bookings} onOpenBooking={setSelectedBooking} />
        ) : null}
        {tab === 'more' ? (
          <MoreScreen profile={profile} services={services} bookings={bookings} />
        ) : null}
      </div>

      <MiniBottomNav tab={tab} setTab={setTab} />
      <BookingSheet
        booking={selectedBooking}
        services={services}
        updatingStatus={updatingStatus}
        onClose={() => setSelectedBooking(null)}
        onStatus={updateBookingStatus}
      />
    </main>
  );
}

function LoadingScreen({ text = 'Загружаем кабинет...' }: { text?: string }) {
  return (
    <main className="cb-mini-app-root min-h-screen bg-[#090909] px-4 text-white">
      <div className="mx-auto grid min-h-[74vh] w-full max-w-[520px] place-items-center">
        <div className="text-center">
          <div className="mx-auto grid size-13 place-items-center rounded-[18px] border border-white/[0.08] bg-white/[0.045] text-white/58">
            <Loader2 className="size-5 animate-spin" />
          </div>
          <div className="mt-4 text-[17px] font-semibold tracking-[-0.045em] text-white">{text}</div>
          <div className="mt-1 text-[12px] text-white/34">КликБук Mini App</div>
        </div>
      </div>
    </main>
  );
}

export function MiniAppEntry({ desktopRedirectTo = '/dashboard' }: { desktopRedirectTo?: string }) {
  const [mode, setMode] = useState<MiniMode>('checking');
  const [state, setState] = useState<LoadState>('loading');
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    const response = await fetch('/api/workspace', {
      credentials: 'include',
      cache: 'no-store',
      headers: getTelegramAppSessionHeaders(),
    });

    if (response.status === 401) {
      setState('auth_required');
      return;
    }

    if (response.status === 404) {
      setState('profile_required');
      setSnapshot(null);
      return;
    }

    if (!response.ok) {
      const payload = await readJsonSafe<{ error?: string }>(response);
      throw new Error(payload?.error || 'workspace_fetch_failed');
    }

    const nextSnapshot = await readJsonSafe<WorkspaceSnapshot>(response);

    if (!nextSnapshot?.profile) {
      setState('profile_required');
      setSnapshot(null);
      return;
    }

    setSnapshot(nextSnapshot);
    setState('ready');
  }, []);

  const refresh = useCallback(async () => {
    try {
      await fetchWorkspace();
    } catch (nextError) {
      setError(normalizeError(nextError));
      setState('error');
    }
  }, [fetchWorkspace]);

  useEffect(() => {
    let cancelled = false;

    const detectAndLoad = async () => {
      const telegram = hasTelegramMiniAppRuntime();
      const phone = window.matchMedia('(max-width: 820px)').matches;

      if (!telegram && !phone) {
        setMode('desktop');
        window.location.replace(desktopRedirectTo || '/dashboard');
        return;
      }

      setMode('mobile');
      setState('loading');

      try {
        if (telegram) {
          const auth = await authorizeTelegramMiniAppSession({ waitMs: 3200 });

          if (cancelled) return;

          if (!auth.ok) {
            setError(auth.error || 'telegram_miniapp_auth_failed');
            setState('auth_required');
            return;
          }
        }

        await fetchWorkspace();
      } catch (nextError) {
        if (cancelled) return;
        setError(normalizeError(nextError));
        setState('error');
      }
    };

    void detectAndLoad();

    return () => {
      cancelled = true;
    };
  }, [desktopRedirectTo, fetchWorkspace]);

  const saveProfile = useCallback(async (profile: MasterProfile) => {
    setSavingProfile(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...getTelegramAppSessionHeaders(),
        },
        body: JSON.stringify({
          profile,
          locale: 'ru',
        }),
      });

      if (response.status === 409) {
        setError('Эта ссылка уже занята. Измените поле «Ссылка».');
        return;
      }

      if (response.status === 401) {
        setState('auth_required');
        setError('Сессия истекла. Откройте Mini App заново из Telegram.');
        return;
      }

      if (!response.ok) {
        const payload = await readJsonSafe<{ error?: string }>(response);
        throw new Error(payload?.error || 'profile_save_failed');
      }

      const nextSnapshot = await readJsonSafe<WorkspaceSnapshot>(response);

      if (nextSnapshot?.profile) {
        setSnapshot(nextSnapshot);
        setState('ready');
        return;
      }

      await fetchWorkspace();
    } catch (nextError) {
      setError(normalizeError(nextError));
    } finally {
      setSavingProfile(false);
    }
  }, [fetchWorkspace]);

  if (mode === 'checking' || mode === 'desktop') {
    return <LoadingScreen text="Открываем кабинет..." />;
  }

  if (state === 'loading') {
    return <LoadingScreen />;
  }

  if (state === 'auth_required') {
    return <MobileLoginRequired error={error ?? undefined} />;
  }

  if (state === 'profile_required') {
    return <ProfileWizard saving={savingProfile} error={error} onSave={saveProfile} />;
  }

  if (state === 'error') {
    return (
      <main className="cb-mini-app-root min-h-screen bg-[#090909] px-4 text-white">
        <div className="mx-auto flex min-h-[72vh] w-full max-w-[520px] flex-col justify-center">
          <MiniCard className="p-5 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-[16px] border border-rose-400/20 bg-rose-400/10 text-rose-100">
              <BadgeCheck className="size-5" />
            </div>
            <div className="mt-4 text-[22px] font-semibold tracking-[-0.065em] text-white">Не загрузилось</div>
            <p className="mt-2 text-[12.5px] leading-5 text-white/42">{error || 'Попробуйте обновить кабинет.'}</p>
            <div className="mt-5 grid gap-2">
              <MiniButton primary onClick={refresh}>Обновить</MiniButton>
              <MiniButton href="/dashboard">Открыть веб-кабинет</MiniButton>
            </div>
          </MiniCard>
        </div>
      </main>
    );
  }

  if (!snapshot) {
    return <ProfileWizard saving={savingProfile} error={error} onSave={saveProfile} />;
  }

  return <MobileDashboard snapshot={snapshot} setSnapshot={setSnapshot} onRefresh={refresh} />;
}
