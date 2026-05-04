'use client';

import Link from 'next/link';
import {
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
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  LayoutDashboard,
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
  UserRound,
  X,
  XCircle,
} from 'lucide-react';

import { useApp } from '@/lib/app-context';
import { authorizeTelegramMiniAppSession } from '@/lib/telegram-miniapp-auth-client';
import { cn } from '@/lib/utils';
import type {
  Booking,
  BookingStatus,
  MasterProfile,
  MasterProfileFormValues,
} from '@/lib/types';

type MiniScreen =
  | 'today'
  | 'schedule'
  | 'chats'
  | 'clients'
  | 'more'
  | 'profile'
  | 'services'
  | 'analytics'
  | 'appearance'
  | 'settings';

const STATUS_META: Record<
  BookingStatus,
  {
    label: string;
    dot: string;
    pill: string;
  }
> = {
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

function addDaysKey(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

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

function safeWorkspaceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function profileToForm(profile: MasterProfile | null): MasterProfileFormValues {
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
    hidePhone: Boolean(profile?.hidePhone),
    hideTelegram: Boolean(profile?.hideTelegram),
    hideWhatsapp: Boolean(profile?.hideWhatsapp),
  };
}

function MiniWordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-[10px] border border-white/[0.10] bg-white/[0.055] text-[12px] font-bold text-white">
        КБ
      </div>
      <div>
        <div className="text-[15px] font-semibold leading-none tracking-[-0.055em] text-white">
          КликБук
        </div>
        <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          кабинет мастера
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
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
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-10 items-center justify-center gap-2 rounded-[14px] px-3 text-[12px] font-semibold tracking-[-0.035em] transition active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45',
        variant === 'primary' && 'bg-white text-black hover:bg-white/90',
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(className, 'h-11')}
        />
      )}
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
        <MiniWordmark />

        <div className="mt-5 size-8 animate-spin rounded-full border border-white/[0.08] border-t-white/60" />

        <div className="mt-5 text-[15px] font-semibold tracking-[-0.045em]">
          Загружаем кабинет
        </div>
        <div className="mt-1 max-w-[230px] text-[12px] leading-5 text-white/42">
          Проверяем Telegram-сессию и загружаем профиль мастера.
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
}: {
  screen: MiniScreen;
  setScreen: (screen: MiniScreen) => void;
  children: ReactNode;
  profile: MasterProfile | null;
  onRefresh: () => void;
}) {
  const shellStyle: CSSProperties = {
    paddingTop: 'calc(var(--tg-safe-top, 0px) + 10px)',
    paddingBottom: 'calc(var(--tg-safe-bottom, 0px) + 96px)',
  };

  const navItems: Array<{
    id: MiniScreen;
    label: string;
    icon: ReactNode;
  }> = [
    { id: 'today', label: 'Сегодня', icon: <CalendarClock className="size-4" /> },
    { id: 'schedule', label: 'График', icon: <CalendarDays className="size-4" /> },
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
                {item.icon}
                {item.label}
                {active ? <span className="size-1 rounded-full bg-white" /> : null}
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
  onSave: (values: MasterProfileFormValues) => Promise<{ success: boolean; error?: string }>;
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<MasterProfileFormValues>({
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
    hidePhone: false,
    hideTelegram: false,
    hideWhatsapp: false,
  });

  const steps = [
    {
      title: 'Основное',
      text: 'Имя, город и описание.',
    },
    {
      title: 'Услуги',
      text: 'Что клиент сможет выбрать.',
    },
    {
      title: 'Контакты',
      text: 'Телефон, Telegram и ссылка.',
    },
  ];

  const update = <K extends keyof MasterProfileFormValues>(
    key: K,
    value: MasterProfileFormValues[K],
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

    if (!result.success) {
      setError(result.error || 'Не удалось сохранить профиль.');
    }
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
          <MiniWordmark />
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
                <MiniInput
                  label="Имя или название"
                  value={form.name}
                  onChange={(value) => update('name', value)}
                  placeholder="Например, Анна Nails"
                />
                <MiniInput
                  label="Специализация"
                  value={form.profession}
                  onChange={(value) => update('profession', value)}
                  placeholder="Маникюр, тату, массаж..."
                />
                <MiniInput
                  label="Город"
                  value={form.city}
                  onChange={(value) => update('city', value)}
                  placeholder="Москва"
                />
                <MiniInput
                  label="Описание"
                  value={form.bio}
                  onChange={(value) => update('bio', value)}
                  placeholder="Коротко о себе"
                  textarea
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <MiniInput
                  label="Услуги"
                  value={form.servicesText}
                  onChange={(value) => update('servicesText', value)}
                  placeholder={'Маникюр — 2500 ₽\nПедикюр — 3000 ₽\nКоррекция — 2000 ₽'}
                  textarea
                />
                <div className="rounded-[16px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] leading-5 text-white/42">
                  Каждую услугу лучше писать с новой строки.
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <MiniInput
                  label="Телефон"
                  value={form.phone}
                  onChange={(value) => update('phone', value)}
                  placeholder="+7..."
                />
                <MiniInput
                  label="Telegram"
                  value={form.telegram}
                  onChange={(value) => update('telegram', value)}
                  placeholder="@username"
                />
                <MiniInput
                  label="Ссылка"
                  value={form.slug}
                  onChange={(value) => update('slug', value)}
                  placeholder="anna-nails"
                />
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
          <MiniButton
            variant="secondary"
            disabled={step === 0 || saving}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
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
  onOpenBooking,
}: {
  bookings: Booking[];
  onOpenBooking: (booking: Booking) => void;
}) {
  const today = todayKey();

  const todayBookings = useMemo(
    () => bookings.filter((booking) => booking.date === today).sort(sortBookings),
    [bookings, today],
  );

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((booking) => `${booking.date} ${booking.time}` >= `${today} 00:00`)
        .sort(sortBookings),
    [bookings, today],
  );

  const list = todayBookings.length > 0 ? todayBookings : upcomingBookings.slice(0, 5);
  const nearest = list[0] ?? null;
  const revenue = todayBookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);
  const riskCount = todayBookings.filter(
    (booking) => booking.status === 'new' || booking.status === 'no_show',
  ).length;

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>рабочий день</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Сегодня
        </h1>
        <p className="mt-2 max-w-[320px] text-[12px] leading-5 text-white/42">
          Ближайшая запись, статусы, клиенты и быстрые действия.
        </p>
      </section>

      <div className="grid grid-cols-3 gap-2">
        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
            записи
          </div>
          <div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">
            {todayBookings.length}
          </div>
          <div className="text-[10px] text-white/35">сегодня</div>
        </MiniCard>

        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
            доход
          </div>
          <div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">
            {RUB.format(revenue)}
          </div>
          <div className="text-[10px] text-white/35">услуги</div>
        </MiniCard>

        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
            риск
          </div>
          <div className="mt-2 text-[22px] font-semibold tracking-[-0.07em]">
            {riskCount}
          </div>
          <div className="text-[10px] text-white/35">контроль</div>
        </MiniCard>
      </div>

      <MiniCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] p-4">
          <div>
            <MiniLabel>ближайшая</MiniLabel>
            <div className="mt-1 text-[12px] text-white/42">что нужно сделать сейчас</div>
          </div>

          <Link
            href="/dashboard"
            className="flex h-8 items-center gap-1.5 rounded-[11px] border border-white/[0.08] bg-white/[0.045] px-2.5 text-[11px] font-semibold text-white/58"
          >
            ПК <ExternalLink className="size-3" />
          </Link>
        </div>

        {nearest ? (
          <button
            type="button"
            onClick={() => onOpenBooking(nearest)}
            className="block w-full p-4 text-left active:scale-[0.995]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[34px] font-semibold leading-none tracking-[-0.08em]">
                  {formatTime(nearest.time)}
                </div>
                <div className="mt-3 text-[19px] font-semibold tracking-[-0.06em]">
                  {nearest.clientName}
                </div>
                <div className="mt-1 text-[12px] text-white/42">{nearest.service}</div>
              </div>

              <StatusPill status={nearest.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <span className="flex h-10 items-center justify-center rounded-[14px] bg-white text-[12px] font-semibold text-black">
                Открыть
              </span>
              <span className="flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.08] bg-white/[0.055] text-[12px] font-semibold text-white">
                <Phone className="size-3.5" />
                Позвонить
              </span>
            </div>
          </button>
        ) : (
          <div className="p-4">
            <EmptyState
              title="Сегодня свободно"
              text="На сегодня нет записей. Можно проверить график или веб-кабинет."
            />
          </div>
        )}
      </MiniCard>

      <MiniCard className="overflow-hidden">
        <div className="border-b border-white/[0.08] p-4">
          <div className="text-[15px] font-semibold tracking-[-0.045em]">День</div>
          <div className="mt-1 text-[11px] text-white/38">
            компактный список записей
          </div>
        </div>

        <div className="space-y-2 p-3">
          {list.length > 0 ? (
            list.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => onOpenBooking(booking)}
                className="flex w-full items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3 text-left active:scale-[0.99]"
              >
                <div className="w-12 shrink-0 text-[17px] font-semibold tracking-[-0.06em]">
                  {formatTime(booking.time)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold tracking-[-0.04em]">
                    {booking.clientName}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-white/38">
                    {booking.service} · {RUB.format(getBookingAmount(booking))}
                  </div>
                </div>

                <StatusPill status={booking.status} />
                <ChevronRight className="size-4 shrink-0 text-white/26" />
              </button>
            ))
          ) : (
            <EmptyState
              title="Записей пока нет"
              text="Когда клиенты начнут записываться, они появятся здесь."
            />
          )}
        </div>
      </MiniCard>
    </div>
  );
}

function ScheduleScreen({
  bookings,
  onOpenBooking,
}: {
  bookings: Booking[];
  onOpenBooking: (booking: Booking) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDaysKey(index)), []);

  const selectedBookings = useMemo(
    () => bookings.filter((booking) => booking.date === selectedDate).sort(sortBookings),
    [bookings, selectedDate],
  );

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>расписание</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          График
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Ближайшие дни без тяжёлых таблиц.
        </p>
      </section>

      <div className="-mx-3 overflow-x-auto px-3">
        <div className="flex gap-2 pb-1">
          {days.map((day) => {
            const active = day === selectedDate;
            const count = bookings.filter((booking) => booking.date === day).length;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'min-w-[82px] rounded-[18px] border p-3 text-left transition active:scale-[0.98]',
                  active
                    ? 'border-white/[0.16] bg-white text-black'
                    : 'border-white/[0.08] bg-white/[0.045] text-white',
                )}
              >
                <div className="text-[11px] font-semibold capitalize tracking-[-0.035em]">
                  {formatDayLabel(day)}
                </div>
                <div className="mt-2 text-[20px] font-semibold tracking-[-0.07em]">
                  {count}
                </div>
                <div className={cn('text-[10px]', active ? 'text-black/45' : 'text-white/35')}>
                  записей
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <MiniCard className="overflow-hidden">
        <div className="border-b border-white/[0.08] p-4">
          <div className="text-[15px] font-semibold tracking-[-0.045em]">
            {formatDayLabel(selectedDate)}
          </div>
          <div className="mt-1 text-[11px] text-white/38">
            {selectedBookings.length > 0
              ? `${selectedBookings.length} записей`
              : 'свободный день'}
          </div>
        </div>

        <div className="space-y-2 p-3">
          {selectedBookings.length > 0 ? (
            selectedBookings.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => onOpenBooking(booking)}
                className="grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3 text-left"
              >
                <div className="text-[16px] font-semibold tracking-[-0.06em]">
                  {formatTime(booking.time)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold tracking-[-0.04em]">
                    {booking.clientName}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-white/38">
                    {booking.service}
                  </div>
                </div>
                <ChevronRight className="size-4 text-white/25" />
              </button>
            ))
          ) : (
            <EmptyState
              title="Нет записей"
              text="День свободен. Новые записи появятся здесь."
              icon={<CalendarDays className="size-5" />}
            />
          )}
        </div>
      </MiniCard>
    </div>
  );
}

function ChatsScreen({ bookings }: { bookings: Booking[] }) {
  const chatRows = useMemo(() => {
    const map = new Map<string, Booking>();

    bookings
      .slice()
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
      .forEach((booking) => {
        if (!map.has(booking.clientPhone || booking.clientName)) {
          map.set(booking.clientPhone || booking.clientName, booking);
        }
      });

    return Array.from(map.values()).slice(0, 12);
  }, [bookings]);

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>коммуникации</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Чаты
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Клиенты и быстрые сообщения.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <MiniButton variant="primary">
          <Send className="size-4" />
          Напомнить
        </MiniButton>
        <MiniButton>
          <MessageCircle className="size-4" />
          Шаблоны
        </MiniButton>
      </div>

      <MiniCard className="overflow-hidden">
        <div className="space-y-2 p-3">
          {chatRows.length > 0 ? (
            chatRows.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.055] text-[11px] font-bold">
                  {getInitials(booking.clientName)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold tracking-[-0.04em]">
                    {booking.clientName}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-white/38">
                    {booking.service} · {formatDayLabel(booking.date)}, {formatTime(booking.time)}
                  </div>
                </div>

                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-[13px] bg-white text-black"
                >
                  <Send className="size-4" />
                </button>
              </div>
            ))
          ) : (
            <EmptyState
              title="Чатов пока нет"
              text="Когда появятся записи, диалоги будут здесь."
              icon={<MessageCircle className="size-5" />}
            />
          )}
        </div>
      </MiniCard>
    </div>
  );
}

function ClientsScreen({ bookings }: { bookings: Booking[] }) {
  const clients = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        visits: number;
        last: string;
        service: string;
      }
    >();

    bookings.forEach((booking) => {
      const key = booking.clientPhone || booking.clientName;
      const current = map.get(key);

      if (!current) {
        map.set(key, {
          name: booking.clientName,
          phone: booking.clientPhone,
          visits: 1,
          last: booking.date,
          service: booking.service,
        });
        return;
      }

      current.visits += 1;

      if (booking.date > current.last) {
        current.last = booking.date;
        current.service = booking.service;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last));
  }, [bookings]);

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>база</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Клиенты
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Компактная клиентская база.
        </p>
      </section>

      <MiniCard className="overflow-hidden">
        <div className="space-y-2 p-3">
          {clients.length > 0 ? (
            clients.map((client) => (
              <div
                key={client.phone || client.name}
                className="flex items-center gap-3 rounded-[17px] border border-white/[0.07] bg-white/[0.035] p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-white/[0.08] bg-white/[0.055] text-[11px] font-bold">
                  {getInitials(client.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold tracking-[-0.04em]">
                    {client.name}
                  </div>
                  <div className="mt-1 truncate text-[11px] text-white/38">
                    {client.visits} визита · последний: {formatDayLabel(client.last)}
                  </div>
                </div>

                <ChevronRight className="size-4 text-white/25" />
              </div>
            ))
          ) : (
            <EmptyState
              title="Клиентов пока нет"
              text="Клиенты появятся после первых записей."
              icon={<UserRound className="size-5" />}
            />
          )}
        </div>
      </MiniCard>
    </div>
  );
}

function ProfileScreen({
  profile,
  onSave,
  getPublicPath,
}: {
  profile: MasterProfile | null;
  onSave: (values: MasterProfileFormValues) => Promise<{ success: boolean; error?: string }>;
  getPublicPath: (slug: string) => string;
}) {
  const [form, setForm] = useState(() => profileToForm(profile));
  const [saving, setSaving] = useState(false);
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setForm(profileToForm(profile));
  }, [profile]);

  const publicUrl =
    typeof window !== 'undefined' && profile?.slug
      ? `${window.location.origin}${getPublicPath(profile.slug)}`
      : '';

  const update = <K extends keyof MasterProfileFormValues>(
    key: K,
    value: MasterProfileFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSave() {
    setSaving(true);
    setResultText('');

    const result = await onSave(form);

    setSaving(false);
    setResultText(
      result.success ? 'Профиль сохранён.' : result.error || 'Не удалось сохранить профиль.',
    );
  }

  async function copyLink() {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {}
  }

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>публичная страница</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Профиль
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Быстрая правка информации.
        </p>
      </section>

      {publicUrl ? (
        <MiniCard className="p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/32">
            ссылка
          </div>
          <div className="mt-2 truncate text-[18px] font-semibold tracking-[-0.06em]">
            {getPublicPath(profile?.slug || '')}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniButton onClick={copyLink}>
              <Copy className="size-4" />
              {copied ? 'Скопировано' : 'Копировать'}
            </MiniButton>
            <Link
              href={publicUrl}
              className="flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.08] bg-white/[0.055] text-[12px] font-semibold tracking-[-0.035em] text-white"
            >
              <ExternalLink className="size-4" />
              Открыть
            </Link>
          </div>
        </MiniCard>
      ) : null}

      <MiniCard className="space-y-4 p-4">
        <MiniInput label="Имя" value={form.name} onChange={(value) => update('name', value)} />
        <MiniInput label="Специализация" value={form.profession} onChange={(value) => update('profession', value)} />
        <MiniInput label="Город" value={form.city} onChange={(value) => update('city', value)} />
        <MiniInput label="Описание" value={form.bio} onChange={(value) => update('bio', value)} textarea />
        <MiniInput label="Телефон" value={form.phone} onChange={(value) => update('phone', value)} />
        <MiniInput label="Telegram" value={form.telegram} onChange={(value) => update('telegram', value)} />

        {resultText ? (
          <div className="rounded-[15px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] text-white/58">
            {resultText}
          </div>
        ) : null}

        <MiniButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохраняем...' : 'Сохранить профиль'}
        </MiniButton>
      </MiniCard>
    </div>
  );
}

function ServicesScreen({
  profile,
  onSave,
}: {
  profile: MasterProfile | null;
  onSave: (values: MasterProfileFormValues) => Promise<{ success: boolean; error?: string }>;
}) {
  const [servicesText, setServicesText] = useState(profile?.services?.join('\n') ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setServicesText(profile?.services?.join('\n') ?? '');
  }, [profile?.services]);

  async function handleSave() {
    const base = profileToForm(profile);
    setSaving(true);
    setMessage('');

    const result = await onSave({
      ...base,
      servicesText,
    });

    setSaving(false);
    setMessage(result.success ? 'Услуги сохранены.' : result.error || 'Не удалось сохранить.');
  }

  const services = servicesText
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>витрина</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Услуги
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Список услуг, который видят клиенты.
        </p>
      </section>

      <MiniCard className="space-y-4 p-4">
        <MiniInput
          label="Список услуг"
          value={servicesText}
          onChange={setServicesText}
          placeholder={'Маникюр — 2500 ₽\nПедикюр — 3000 ₽'}
          textarea
        />

        <div className="space-y-2">
          {services.length > 0 ? (
            services.map((service, index) => (
              <div
                key={`${service}-${index}`}
                className="flex items-center gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.035] p-3"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-[10px] font-semibold text-white/42">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[-0.04em]">
                  {service}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Услуги не заполнены"
              text="Добавьте услуги по одной строке."
              icon={<Scissors className="size-5" />}
            />
          )}
        </div>

        {message ? (
          <div className="rounded-[15px] border border-white/[0.08] bg-white/[0.035] p-3 text-[12px] text-white/58">
            {message}
          </div>
        ) : null}

        <MiniButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Сохраняем...' : 'Сохранить услуги'}
        </MiniButton>
      </MiniCard>
    </div>
  );
}

function AnalyticsScreen({ bookings }: { bookings: Booking[] }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDaysKey(index - 6)), []);

  const dayStats = useMemo(
    () =>
      days.map((day) => {
        const dayBookings = bookings.filter((booking) => booking.date === day);
        const revenue = dayBookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);

        return {
          day,
          count: dayBookings.length,
          revenue,
        };
      }),
    [bookings, days],
  );

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0);
  const completed = bookings.filter((booking) => booking.status === 'completed').length;
  const noShow = bookings.filter((booking) => booking.status === 'no_show').length;
  const maxCount = Math.max(1, ...dayStats.map((item) => item.count));

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>короткая аналитика</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Аналитика
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Записи, деньги, явка и динамика недели.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
            записи
          </div>
          <div className="mt-2 text-[26px] font-semibold tracking-[-0.08em]">
            {totalBookings}
          </div>
          <div className="text-[10px] text-white/35">всего</div>
        </MiniCard>

        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
            доход
          </div>
          <div className="mt-2 text-[26px] font-semibold tracking-[-0.08em]">
            {RUB.format(totalRevenue)}
          </div>
          <div className="text-[10px] text-white/35">по записям</div>
        </MiniCard>

        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
            пришли
          </div>
          <div className="mt-2 text-[26px] font-semibold tracking-[-0.08em]">
            {completed}
          </div>
          <div className="text-[10px] text-white/35">завершено</div>
        </MiniCard>

        <MiniCard className="p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32">
            неявки
          </div>
          <div className="mt-2 text-[26px] font-semibold tracking-[-0.08em]">
            {noShow}
          </div>
          <div className="text-[10px] text-white/35">контроль</div>
        </MiniCard>
      </div>

      <MiniCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.045em]">
              График недели
            </div>
            <div className="mt-1 text-[11px] text-white/38">записи по дням</div>
          </div>
          <BarChart3 className="size-5 text-white/35" />
        </div>

        <div className="mt-5 flex h-[150px] items-end gap-2">
          {dayStats.map((item) => {
            const height = Math.max(8, (item.count / maxCount) * 120);

            return (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-[120px] w-full items-end rounded-full bg-white/[0.035] p-1">
                  <div className="w-full rounded-full bg-white" style={{ height }} />
                </div>
                <div className="text-[9px] font-semibold uppercase text-white/35">
                  {new Date(`${item.day}T12:00:00`).toLocaleDateString('ru-RU', {
                    weekday: 'short',
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </MiniCard>
    </div>
  );
}

function AppearanceScreen({
  workspaceData,
  updateWorkspaceSection,
}: {
  workspaceData: Record<string, unknown>;
  updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean>;
}) {
  const appearance = safeWorkspaceRecord(workspaceData.appearance);
  const [mode, setMode] = useState(String(appearance.mode ?? 'dark'));
  const [accent, setAccent] = useState(String(appearance.accent ?? 'mono'));

  async function save(next?: { mode?: string; accent?: string }) {
    const payload = {
      mode: next?.mode ?? mode,
      accent: next?.accent ?? accent,
    };

    await updateWorkspaceSection('appearance', payload);
  }

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>стиль</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Внешний вид
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Тема и акцент для страницы.
        </p>
      </section>

      <MiniCard className="space-y-4 p-4">
        <div>
          <div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">
            Тема
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'dark', label: 'Тёмная' },
              { id: 'light', label: 'Светлая' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMode(item.id);
                  void save({ mode: item.id });
                }}
                className={cn(
                  'h-12 rounded-[16px] border text-[13px] font-semibold tracking-[-0.04em]',
                  mode === item.id
                    ? 'border-white/20 bg-white text-black'
                    : 'border-white/[0.08] bg-white/[0.045] text-white/55',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold tracking-[-0.03em] text-white/58">
            Акцент
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'mono', label: 'Моно' },
              { id: 'blue', label: 'Синий' },
              { id: 'rose', label: 'Розовый' },
              { id: 'gold', label: 'Золото' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAccent(item.id);
                  void save({ accent: item.id });
                }}
                className={cn(
                  'flex h-12 items-center justify-between rounded-[16px] border px-3 text-[13px] font-semibold tracking-[-0.04em]',
                  accent === item.id
                    ? 'border-white/20 bg-white text-black'
                    : 'border-white/[0.08] bg-white/[0.045] text-white/55',
                )}
              >
                {item.label}
                {accent === item.id ? <CheckCircle2 className="size-4" /> : null}
              </button>
            ))}
          </div>
        </div>
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
  const stored = safeWorkspaceRecord(workspaceData.miniSettings);
  const [settings, setSettings] = useState({
    reminders: stored.reminders !== false,
    autoConfirm: Boolean(stored.autoConfirm),
    noShowControl: stored.noShowControl !== false,
    dailyDigest: stored.dailyDigest !== false,
  });

  async function update<K extends keyof typeof settings>(key: K, value: boolean) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await updateWorkspaceSection('miniSettings', next);
  }

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>управление</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Настройки
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Уведомления и рабочий день.
        </p>
      </section>

      <MiniCard className="space-y-2 p-3">
        {[
          ['reminders', 'Напоминания клиентам', 'Отправлять клиенту напоминание перед записью.'],
          ['autoConfirm', 'Автоподтверждение', 'Помечать запись подтверждённой после ответа клиента.'],
          ['noShowControl', 'Контроль неявок', 'Подсвечивать клиентов с риском не прийти.'],
          ['dailyDigest', 'Итоги дня', 'Показывать короткий итог по записям и деньгам.'],
        ].map(([key, label, description]) => {
          const typedKey = key as keyof typeof settings;
          const checked = settings[typedKey];

          return (
            <button
              key={key}
              type="button"
              onClick={() => void update(typedKey, !checked)}
              className="flex w-full items-center justify-between gap-4 rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-3 text-left"
            >
              <span>
                <span className="block text-[13px] font-semibold tracking-[-0.04em] text-white">
                  {label}
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-white/42">
                  {description}
                </span>
              </span>

              <span
                className={cn(
                  'relative h-7 w-12 shrink-0 rounded-full border transition',
                  checked
                    ? 'border-white/20 bg-white text-black'
                    : 'border-white/[0.08] bg-white/[0.055]',
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 size-5 rounded-full transition',
                    checked ? 'left-6 bg-black' : 'left-1 bg-white/35',
                  )}
                />
              </span>
            </button>
          );
        })}
      </MiniCard>
    </div>
  );
}

function MoreScreen({ setScreen }: { setScreen: (screen: MiniScreen) => void }) {
  const rows: Array<{
    id: MiniScreen | 'desktop';
    label: string;
    description: string;
    icon: ReactNode;
  }> = [
    { id: 'profile', label: 'Профиль', description: 'страница мастера', icon: <UserRound className="size-4" /> },
    { id: 'services', label: 'Услуги', description: 'витрина и цены', icon: <Scissors className="size-4" /> },
    { id: 'clients', label: 'Клиенты', description: 'база и история', icon: <UserRound className="size-4" /> },
    { id: 'analytics', label: 'Аналитика', description: 'записи и доход', icon: <BarChart3 className="size-4" /> },
    { id: 'appearance', label: 'Внешний вид', description: 'тема и акцент', icon: <Palette className="size-4" /> },
    { id: 'settings', label: 'Настройки', description: 'уведомления', icon: <Settings className="size-4" /> },
    { id: 'desktop', label: 'Веб-кабинет', description: 'полная версия', icon: <LayoutDashboard className="size-4" /> },
  ];

  return (
    <div className="space-y-3">
      <section>
        <MiniLabel>меню</MiniLabel>
        <h1 className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.075em]">
          Ещё
        </h1>
        <p className="mt-2 text-[12px] leading-5 text-white/42">
          Дополнительные разделы.
        </p>
      </section>

      <MiniCard className="p-2">
        <div className="space-y-1">
          {rows.map((row, index) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                if (row.id === 'desktop') {
                  window.location.href = '/dashboard';
                  return;
                }

                setScreen(row.id);
              }}
              className="group flex w-full items-center gap-3 rounded-[17px] px-2.5 py-3 text-left text-white/58 transition hover:bg-white/[0.045] hover:text-white active:scale-[0.99]"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-[10px] font-semibold text-white/36 group-hover:border-white/[0.14] group-hover:text-white/70">
                {index + 1}
              </span>

              <span className="flex size-9 shrink-0 items-center justify-center rounded-[13px] border border-white/[0.07] bg-white/[0.035] text-white/42 group-hover:text-white/78">
                {row.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold tracking-[-0.045em]">
                  {row.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-white/32">
                  {row.description}
                </span>
              </span>

              <ChevronRight className="size-4 shrink-0 text-white/24" />
            </button>
          ))}
        </div>
      </MiniCard>
    </div>
  );
}

function BookingSheet({
  booking,
  onClose,
  onStatus,
}: {
  booking: Booking | null;
  onClose: () => void;
  onStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState<BookingStatus | null>(null);

  if (!booking) return null;

  async function update(status: BookingStatus) {
    if (!booking) return;

    setUpdating(status);
    await onStatus(booking.id, status);
    setUpdating(null);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-black/55 px-3 pb-[calc(var(--tg-safe-bottom,0px)+10px)] backdrop-blur-[8px]">
      <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#101010] shadow-[0_28px_90px_rgba(0,0,0,0.72)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-4">
          <div>
            <MiniLabel>запись</MiniLabel>
            <div className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.075em]">
              {booking.clientName}
            </div>
            <div className="mt-2 text-[12px] text-white/42">
              {formatDayLabel(booking.date)}, {formatTime(booking.time)}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-[13px] border border-white/[0.08] bg-white/[0.045] text-white/55"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-3">
            <div className="text-[11px] text-white/35">Услуга</div>
            <div className="mt-1 text-[15px] font-semibold tracking-[-0.045em]">
              {booking.service}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MiniButton variant="primary" disabled={Boolean(updating)} onClick={() => void update('completed')}>
              <CheckCircle2 className="size-4" />
              Пришла
            </MiniButton>
            <MiniButton variant="secondary" disabled={Boolean(updating)} onClick={() => void update('confirmed')}>
              <ShieldCheck className="size-4" />
              Подтвердить
            </MiniButton>
            <MiniButton variant="secondary" disabled={Boolean(updating)} onClick={() => void update('new')}>
              <Bell className="size-4" />
              Новая
            </MiniButton>
            <MiniButton variant="danger" disabled={Boolean(updating)} onClick={() => void update('no_show')}>
              <XCircle className="size-4" />
              Не пришла
            </MiniButton>
          </div>
        </div>
      </div>
    </div>
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

  const [screen, setScreen] = useState<MiniScreen>('today');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bootState, setBootState] = useState<'loading' | 'ready'>('loading');
  const bootedRef = useRef(false);

  const workspaceRecord = safeWorkspaceRecord(workspaceData);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let cancelled = false;

    async function boot() {
      try {
        await authorizeTelegramMiniAppSession({
          force: true,
          waitMs: 2600,
        });
      } catch {
        // Если Telegram initData недоступна, всё равно пробуем загрузить workspace по cookie/header.
      }

      await refreshWorkspace();

      if (!cancelled) {
        setBootState('ready');
      }
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
      <MiniShell
        screen={screen}
        setScreen={setScreen}
        profile={ownedProfile}
        onRefresh={() => void refreshWorkspace()}
      >
        {screen === 'today' ? (
          <TodayScreen bookings={bookings} onOpenBooking={setSelectedBooking} />
        ) : null}

        {screen === 'schedule' ? (
          <ScheduleScreen bookings={bookings} onOpenBooking={setSelectedBooking} />
        ) : null}

        {screen === 'chats' ? <ChatsScreen bookings={bookings} /> : null}

        {screen === 'clients' ? <ClientsScreen bookings={bookings} /> : null}

        {screen === 'profile' ? (
          <ProfileScreen
            profile={ownedProfile}
            onSave={saveProfile}
            getPublicPath={getPublicPath}
          />
        ) : null}

        {screen === 'services' ? (
          <ServicesScreen profile={ownedProfile} onSave={saveProfile} />
        ) : null}

        {screen === 'analytics' ? <AnalyticsScreen bookings={bookings} /> : null}

        {screen === 'appearance' ? (
          <AppearanceScreen
            workspaceData={workspaceRecord}
            updateWorkspaceSection={updateWorkspaceSection}
          />
        ) : null}

        {screen === 'settings' ? (
          <SettingsScreen
            workspaceData={workspaceRecord}
            updateWorkspaceSection={updateWorkspaceSection}
          />
        ) : null}

        {screen === 'more' ? <MoreScreen setScreen={setScreen} /> : null}
      </MiniShell>

      <BookingSheet
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatus={updateBookingStatus}
      />
    </>
  );
}