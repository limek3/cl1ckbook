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
  CheckCircle2,
  Clock3,
  Globe2,
  MessageCircleMore,
  PhoneCall,
  Sparkles,
  SquarePen,
} from 'lucide-react';

import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { Button } from '@/components/ui/button';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useApp } from '@/lib/app-context';
import { useAppearance } from '@/lib/appearance-context';
import { accentPalette } from '@/lib/appearance-palette';
import type { Booking, BookingStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

type ThemeMode = 'light' | 'dark';
type TimelineStage = 'next' | 'queue' | 'done' | 'new';
type TimelinePeriod = 'morning' | 'day' | 'evening';
type TimelineFilter = 'all' | TimelinePeriod;
type TimelineSource = 'booking' | 'mock';

interface TimelineItem {
  id: string;
  time: string;
  timeMinutes: number;
  clientName: string;
  service: string;
  phone: string;
  stage: TimelineStage;
  period: TimelinePeriod;
  note?: string;
  durationLabel: string;
  source: TimelineSource;
  bookingStatus?: BookingStatus;
}

interface DayInsight {
  nextUp?: TimelineItem;
  busiestPeriod: TimelinePeriod;
  freeWindowLabel: string;
  completionLabel: string;
}

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

function toLocalIsoDate(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
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
  const normalized = Math.max(0, totalMinutes);
  const hours = Math.floor(normalized / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (normalized % 60).toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

function getTimelinePeriod(timeMinutes: number): TimelinePeriod {
  if (timeMinutes < 12 * 60) return 'morning';
  if (timeMinutes < 17 * 60) return 'day';
  return 'evening';
}

function mapBookingToTimelineItem(
  booking: Booking,
  now: Date,
  locale: 'ru' | 'en',
): TimelineItem {
  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const diff = bookingDateTime.getTime() - now.getTime();
  const timeMinutes = parseTimeToMinutes(booking.time);

  const stage: TimelineStage =
    booking.status === 'completed'
      ? 'done'
      : booking.status === 'new'
        ? 'new'
        : diff <= 45 * 60 * 1000
          ? 'next'
          : 'queue';

  return {
    id: booking.id,
    time: booking.time,
    timeMinutes,
    clientName: booking.clientName,
    service: booking.service,
    phone: booking.clientPhone,
    stage,
    period: getTimelinePeriod(timeMinutes),
    note: booking.comment || undefined,
    durationLabel: locale === 'ru' ? '60 мин' : '60 min',
    source: 'booking',
    bookingStatus: booking.status,
  };
}

function buildMockTimeline(locale: 'ru' | 'en'): TimelineItem[] {
  const entries =
    locale === 'ru'
      ? [
          {
            id: 'mock-1',
            time: '09:30',
            clientName: 'Алина Морозова',
            service: 'Маникюр + покрытие',
            phone: '+7 999 240-00-11',
            note: 'Первый визит. Любит спокойную палитру и короткую форму.',
            stage: 'next' as TimelineStage,
          },
          {
            id: 'mock-2',
            time: '11:00',
            clientName: 'Софья Жукова',
            service: 'Снятие + укрепление',
            phone: '+7 999 240-00-12',
            note: 'Нужно короткое напоминание за 30 минут.',
            stage: 'new' as TimelineStage,
          },
          {
            id: 'mock-3',
            time: '13:00',
            clientName: 'Елизавета Новикова',
            service: 'Дизайн + коррекция',
            phone: '+7 999 240-00-13',
            note: 'Принесёт референс, лучше сразу показать 2 оттенка.',
            stage: 'queue' as TimelineStage,
          },
          {
            id: 'mock-4',
            time: '15:30',
            clientName: 'Марина Орлова',
            service: 'Смарт-педикюр',
            phone: '+7 999 240-00-14',
            note: 'Постоянный клиент. Можно предложить следующее окно после визита.',
            stage: 'queue' as TimelineStage,
          },
          {
            id: 'mock-5',
            time: '18:00',
            clientName: 'Ксения Белова',
            service: 'Экспресс-уход',
            phone: '+7 999 240-00-15',
            note: 'Вечерний слот, любит быстрый чек-аут без лишних вопросов.',
            stage: 'done' as TimelineStage,
          },
        ]
      : [
          {
            id: 'mock-1',
            time: '09:30',
            clientName: 'Alina Morozova',
            service: 'Manicure + coating',
            phone: '+7 999 240-00-11',
            note: 'First visit. Prefers calm tones and a short shape.',
            stage: 'next' as TimelineStage,
          },
          {
            id: 'mock-2',
            time: '11:00',
            clientName: 'Sofia Zhukova',
            service: 'Removal + strengthening',
            phone: '+7 999 240-00-12',
            note: 'Needs a short reminder 30 minutes before.',
            stage: 'new' as TimelineStage,
          },
          {
            id: 'mock-3',
            time: '13:00',
            clientName: 'Elizaveta Novikova',
            service: 'Design + correction',
            phone: '+7 999 240-00-13',
            note: 'Will bring a reference. Better to prepare two tones in advance.',
            stage: 'queue' as TimelineStage,
          },
          {
            id: 'mock-4',
            time: '15:30',
            clientName: 'Marina Orlova',
            service: 'Smart pedicure',
            phone: '+7 999 240-00-14',
            note: 'Regular client. Offer the next slot right after the visit.',
            stage: 'queue' as TimelineStage,
          },
          {
            id: 'mock-5',
            time: '18:00',
            clientName: 'Kseniya Belova',
            service: 'Express care',
            phone: '+7 999 240-00-15',
            note: 'Evening slot, prefers a very fast checkout.',
            stage: 'done' as TimelineStage,
          },
        ];

  return entries.map((entry) => {
    const timeMinutes = parseTimeToMinutes(entry.time);

    return {
      ...entry,
      timeMinutes,
      period: getTimelinePeriod(timeMinutes),
      durationLabel: locale === 'ru' ? '60 мин' : '60 min',
      source: 'mock' as TimelineSource,
    };
  });
}

function buildDayInsight(items: TimelineItem[], locale: 'ru' | 'en'): DayInsight {
  const counts = items.reduce<Record<TimelineFilter, number>>(
    (accumulator, item) => {
      accumulator.all += 1;
      accumulator[item.period] += 1;
      return accumulator;
    },
    { all: 0, morning: 0, day: 0, evening: 0 },
  );

  const busiestPeriod =
    (
      Object.entries(counts).filter(([key]) => key !== 'all') as [
        TimelinePeriod,
        number,
      ][]
    ).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'day';

  const nextUp = items.find(
    (item) => item.stage === 'next' || item.stage === 'queue' || item.stage === 'new',
  );

  const completionRate = items.length
    ? Math.round((items.filter((item) => item.stage === 'done').length / items.length) * 100)
    : 0;

  const freeWindowLabel = (() => {
    if (items.length < 2) {
      return locale === 'ru'
        ? 'Свободные окна появятся после первых записей'
        : 'Free windows appear after the first bookings';
    }

    const sorted = [...items].sort(
      (left, right) => left.timeMinutes - right.timeMinutes,
    );

    let bestGap = 0;

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      bestGap = Math.max(bestGap, current.timeMinutes - previous.timeMinutes - 60);
    }

    if (bestGap <= 0) {
      return locale === 'ru'
        ? 'День плотный, свободных окон почти нет'
        : 'Packed day, almost no free windows';
    }

    const hours = Math.floor(bestGap / 60);
    const minutes = bestGap % 60;

    if (locale === 'ru') {
      return hours > 0
        ? `${hours} ч ${minutes} мин до следующего плотного блока`
        : `${minutes} мин между визитами`;
    }

    return hours > 0
      ? `${hours}h ${minutes}m before the next dense block`
      : `${minutes}m between visits`;
  })();

  return {
    nextUp,
    busiestPeriod,
    freeWindowLabel,
    completionLabel:
      locale === 'ru'
        ? `${completionRate}% дня уже закрыто`
        : `${completionRate}% of the day completed`,
  };
}

function getNowMarkerIndex(items: TimelineItem[], nowMinutes: number) {
  if (!items.length) return null;
  if (nowMinutes <= items[0].timeMinutes) return 0;

  for (let index = 1; index < items.length; index += 1) {
    if (nowMinutes <= items[index].timeMinutes) {
      return index;
    }
  }

  return nowMinutes <= items[items.length - 1].timeMinutes + 60
    ? items.length
    : null;
}

function stageColor(
  stage: TimelineStage,
  accentColor: string,
  publicAccentColor: string,
  light: boolean,
) {
  if (stage === 'next') return accentColor;
  if (stage === 'new') return publicAccentColor;
  if (stage === 'queue') return light ? 'rgba(0,0,0,0.42)' : 'rgba(255,255,255,0.46)';
  return light ? 'rgba(0,0,0,0.26)' : 'rgba(255,255,255,0.28)';
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
}: {
  title: string;
  description?: string;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[58px] items-center justify-between gap-4 border-b px-4 py-3',
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

function StatTile({
  label,
  value,
  hint,
  icon,
  light,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  light: boolean;
}) {
  return (
    <div className="min-w-0 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn('text-[11px] font-medium', mutedText(light))}>
            {label}
          </div>

          <div
            className={cn(
              'mt-2 truncate text-[25px] font-semibold tracking-[-0.065em]',
              pageText(light),
            )}
          >
            {value}
          </div>

          {hint ? (
            <div className={cn('mt-1 truncate text-[11px]', faintText(light))}>
              {hint}
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] border',
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

function HeroStat({
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
        'min-w-0 rounded-[10px] border px-3.5 py-3 transition-colors duration-150',
        light
          ? 'border-black/[0.07] bg-white hover:bg-black/[0.018]'
          : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.055]',
      )}
    >
      <div className="grid min-h-[34px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <div className={cn('truncate text-[10.5px] font-medium', mutedText(light))}>
            {label}
          </div>

          {hint ? (
            <div className={cn('mt-0.5 truncate text-[10px]', faintText(light))}>
              {hint}
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'min-w-[54px] max-w-[170px] truncate text-right text-[18px] font-semibold leading-none tracking-[-0.055em] tabular-nums',
            pageText(light),
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function ListBox({
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
        'overflow-hidden rounded-[10px] border divide-y',
        insetTone(light),
        divideTone(light),
        className,
      )}
    >
      {children}
    </div>
  );
}

function ListRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('px-4 py-3.5', className)}>{children}</div>;
}

function KeyValue({
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
        'flex min-h-10 items-center justify-between gap-3 rounded-[9px] border px-3',
        insetTone(light),
      )}
    >
      <span className={cn('text-[11px] font-medium', mutedText(light))}>
        {label}
      </span>

      <span
        className={cn(
          'truncate text-right text-[11.5px] font-medium',
          pageText(light),
        )}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  children,
  light,
}: {
  children: ReactNode;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-[10px] border px-4 py-5 text-[12px]',
        insetTone(light),
        mutedText(light),
      )}
    >
      {children}
    </div>
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
  count,
  active,
  onClick,
  light,
  accentColor,
}: {
  label: string;
  count?: number;
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
        'group relative inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center gap-2 border-r px-4 text-[11px] font-semibold tracking-[-0.015em] transition-colors duration-150 last:border-r-0 active:scale-[0.985]',
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

      {typeof count === 'number' ? (
        <span
          className={cn(
            'relative z-10 rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold',
            active
              ? light
                ? 'bg-black/[0.06] text-black/60'
                : 'bg-white/[0.075] text-white/62'
              : light
                ? 'bg-black/[0.035] text-black/34'
                : 'bg-white/[0.045] text-white/34',
          )}
        >
          {count}
        </span>
      ) : null}

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

function TimelineStatus({
  stage,
  label,
  hint,
  light,
  accentColor,
  publicAccentColor,
  className,
}: {
  stage: TimelineStage;
  label: string;
  hint: string;
  light: boolean;
  accentColor: string;
  publicAccentColor: string;
  className?: string;
}) {
  const color = stageColor(stage, accentColor, publicAccentColor, light);

  return (
    <div className={cn('flex min-w-[128px] items-center justify-end gap-2', className)}>
      <div className="min-w-0 text-right">
        <div
          className={cn(
            'text-[11.5px] font-semibold leading-none tracking-[-0.018em]',
            light ? 'text-black/72' : 'text-white/74',
          )}
        >
          {label}
        </div>

        <div
          className={cn(
            'mt-1 text-[9.5px] font-medium uppercase tracking-[0.12em]',
            light ? 'text-black/32' : 'text-white/28',
          )}
        >
          {hint}
        </div>
      </div>

      <span
        style={{
          background: color,
          boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 14%, transparent)`,
        }}
        className="size-2 shrink-0 rounded-full"
      />
    </div>
  );
}

function TimeRangeCell({
  start,
  end,
  light,
}: {
  start: string;
  end: string;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'grid min-w-[150px] grid-cols-[46px_12px_46px] items-center justify-end text-[11.5px] font-medium tabular-nums',
        light ? 'text-black/48' : 'text-white/42',
      )}
    >
      <span className="truncate text-right">{start}</span>

      <span className={cn('text-center', light ? 'text-black/22' : 'text-white/18')}>
        —
      </span>

      <span className="text-left">{end}</span>
    </div>
  );
}

export default function DashboardTodayPage() {
  const { updateBookingStatus } = useApp();
  const { hasHydrated, ownedProfile, bookings, locale, demoMode } =
    useOwnedWorkspaceData();
  const { resolvedTheme } = useTheme();
  const { settings } = useAppearance();
  const isMobile = useMobile();

  const [mounted, setMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<TimelineFilter>('all');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<BookingStatus | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

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

  const todayBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.date === todayIso)
        .sort((left, right) => left.time.localeCompare(right.time)),
    [bookings, todayIso],
  );

  const hasRealBookings = todayBookings.length > 0;

  const todayItems = useMemo(() => {
    if (hasRealBookings) {
      return todayBookings.map((booking) =>
        mapBookingToTimelineItem(booking, now, locale),
      );
    }

    return buildMockTimeline(locale);
  }, [hasRealBookings, locale, now, todayBookings]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'all') return todayItems;
    return todayItems.filter((item) => item.period === selectedFilter);
  }, [selectedFilter, todayItems]);

  const dayInsight = useMemo(
    () => buildDayInsight(todayItems, locale),
    [locale, todayItems],
  );

  const nowMarkerIndex = useMemo(
    () => getNowMarkerIndex(filteredItems, nowMinutes),
    [filteredItems, nowMinutes],
  );

  useEffect(() => {
    if (!filteredItems.length) {
      setActiveItemId(null);
      return;
    }

    if (!activeItemId || !filteredItems.some((item) => item.id === activeItemId)) {
      const preferred =
        filteredItems.find((item) => item.stage === 'next' || item.stage === 'new') ??
        filteredItems[0];

      setActiveItemId(preferred.id);
    }
  }, [activeItemId, filteredItems]);

  const labels =
    locale === 'ru'
      ? {
          title: 'Записи на сегодня',
          description:
            'Рабочий день мастера: таймлайн, статусы, быстрые действия и карточка клиента.',
          emptyTitle: 'Сначала настройте профиль мастера',
          emptyDescription:
            'Создайте профиль, чтобы открыть рабочий день, ленту записей, чаты и быстрые действия.',
          emptyAction: 'Создать профиль',
          preview: hasRealBookings ? (demoMode ? 'Демо-режим' : 'Рабочий день') : 'Предпросмотр',
          overviewTitle: 'Сводка дня',
          overviewDescription: hasRealBookings
            ? 'Ближайшие визиты, статусы и ритм дня в одном спокойном экране.'
            : 'Демонстрационные записи для визуальной проверки таймлайна.',
          timelineTitle: 'Таймлайн дня',
          timelineDescription:
            'Список визитов сверху вниз: видно, кто следующий, где плотный блок и где есть окно.',
          callClient: 'Позвонить',
          openChat: 'Открыть чат',
          metrics: {
            total: 'На сегодня',
            next: 'Ближайшие',
            newRequests: 'Новые заявки',
            done: 'Завершено',
          },
          stages: {
            next: 'Скоро',
            queue: 'В очереди',
            done: 'Завершено',
            new: 'Новая',
          },
          stageHints: {
            next: 'следующая',
            queue: 'ожидает',
            done: 'готово',
            new: 'новая',
          },
          filters: {
            all: 'Весь день',
            morning: 'Утро',
            day: 'День',
            evening: 'Вечер',
          },
          busiest: 'Самый плотный блок',
          nextUp: 'Следующий визит',
          freeWindow: 'Свободные окна',
          completion: 'Прогресс дня',
          liveDay: 'Карточка визита',
          liveDayText: 'Контакт, заметка и статус выбранной записи.',
          sampleBadge: 'Демо / мок-данные',
          confirm: 'Подтвердить',
          complete: 'Завершить',
          activeBooking: 'Активная запись',
          sampleCopy: 'Это мок-данные для предпросмотра. Они не сохраняются.',
          note: 'Комментарий',
          phone: 'Телефон',
          time: 'Время',
          dayState: 'Статус',
          currentMoment: 'Текущий момент дня',
          now: 'Сейчас',
          emptyFilter: 'В этом фильтре пока пусто.',
          selectBooking: 'Выберите запись из ленты.',
          setupCards: {
            timeline: 'Таймлайн',
            timelineText: 'После создания профиля здесь появятся записи на день.',
            chats: 'Чаты',
            chatsText: 'Быстрый переход к перепискам и напоминаниям клиентам.',
            public: 'Публичная',
            publicText: 'Профиль создаст ссылку, которую можно отправлять клиентам.',
          },
        }
      : {
          title: 'Today bookings',
          description:
            'A clean workday view: timeline, statuses, quick actions, and client card.',
          emptyTitle: 'Create the master profile first',
          emptyDescription:
            'Create a profile to unlock the day flow, booking timeline, chats, and quick actions.',
          emptyAction: 'Create profile',
          preview: hasRealBookings ? (demoMode ? 'Demo mode' : 'Workday') : 'Preview',
          overviewTitle: 'Day summary',
          overviewDescription: hasRealBookings
            ? 'Upcoming visits, statuses, and the whole day rhythm in one calm screen.'
            : 'Demo bookings so the timeline always has a polished preview.',
          timelineTitle: 'Day timeline',
          timelineDescription:
            'A top-to-bottom visit list: next client, dense blocks, and free windows stay visible.',
          callClient: 'Call',
          openChat: 'Open chat',
          metrics: {
            total: 'Today',
            next: 'Next up',
            newRequests: 'New requests',
            done: 'Completed',
          },
          stages: {
            next: 'Soon',
            queue: 'In queue',
            done: 'Done',
            new: 'New',
          },
          stageHints: {
            next: 'next',
            queue: 'waiting',
            done: 'done',
            new: 'new',
          },
          filters: {
            all: 'All day',
            morning: 'Morning',
            day: 'Day',
            evening: 'Evening',
          },
          busiest: 'Busiest block',
          nextUp: 'Next visit',
          freeWindow: 'Free windows',
          completion: 'Day progress',
          liveDay: 'Visit card',
          liveDayText: 'Contact, note, and current status for the selected booking.',
          sampleBadge: 'Demo / mock data',
          confirm: 'Confirm',
          complete: 'Complete',
          activeBooking: 'Active booking',
          sampleCopy: 'This is preview data only and it is not saved.',
          note: 'Note',
          phone: 'Phone',
          time: 'Time',
          dayState: 'Status',
          currentMoment: 'Current moment of the day',
          now: 'Now',
          emptyFilter: 'Nothing in this filter yet.',
          selectBooking: 'Select a visit from the timeline.',
          setupCards: {
            timeline: 'Timeline',
            timelineText: 'After profile setup, daily bookings will appear here.',
            chats: 'Chats',
            chatsText: 'Quick access to conversations and client reminders.',
            public: 'Public',
            publicText: 'The profile creates a public booking link for clients.',
          },
        };

  const metrics = {
    total: todayItems.length,
    next: todayItems.filter((item) => item.stage === 'next' || item.stage === 'queue')
      .length,
    newRequests: todayItems.filter((item) => item.stage === 'new').length,
    done: todayItems.filter((item) => item.stage === 'done').length,
  };

  const summaryItems = [
    {
      label: labels.nextUp,
      value: dayInsight.nextUp ? dayInsight.nextUp.time : '—',
      hint: dayInsight.nextUp
        ? `${dayInsight.nextUp.clientName} · ${dayInsight.nextUp.service}`
        : locale === 'ru'
          ? 'Нет ближайшей записи'
          : 'No upcoming visit',
      icon: <Clock3 className="size-4" />,
    },
    {
      label: labels.busiest,
      value: labels.filters[dayInsight.busiestPeriod],
      hint: dayInsight.freeWindowLabel,
      icon: <CalendarClock className="size-4" />,
    },
    {
      label: labels.freeWindow,
      value:
        todayItems.length > 1
          ? locale === 'ru'
            ? 'Есть окно'
            : 'Window found'
          : locale === 'ru'
            ? 'Пока пусто'
            : 'Not enough data',
      hint: dayInsight.freeWindowLabel,
      icon: <Sparkles className="size-4" />,
    },
    {
      label: labels.completion,
      value: dayInsight.completionLabel,
      hint: `${metrics.done}/${metrics.total}`,
      icon: <CheckCircle2 className="size-4" />,
    },
  ];

  const activeItem =
    filteredItems.find((item) => item.id === activeItemId) ?? filteredItems[0] ?? null;

  const activeBooking =
    activeItem?.source === 'booking'
      ? todayBookings.find((booking) => booking.id === activeItem.id) ?? null
      : null;

  async function handleStatusChange(status: BookingStatus) {
    if (!activeBooking) return;

    setActionLoading(status);

    try {
      await updateBookingStatus(activeBooking.id, status);
    } finally {
      setActionLoading(null);
    }
  }

  function renderNowMarker(key: string) {
    return (
      <ListRow
        key={key}
        className={cn(
          'px-4 py-2',
          isLight ? 'bg-black/[0.012]' : 'bg-white/[0.018]',
        )}
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_150px] md:items-center">
          <div className={cn('text-[11px] font-medium', mutedText(isLight))}>
            {labels.currentMoment}
          </div>

          <TimeRangeCell
            start={formatMinutesAsTime(nowMinutes)}
            end={formatMinutesAsTime(nowMinutes)}
            light={isLight}
          />

          <TimelineStatus
            stage="queue"
            label={labels.now}
            hint={locale === 'ru' ? 'момент' : 'moment'}
            light={isLight}
            accentColor={accentColor}
            publicAccentColor={publicAccentColor}
            className="md:justify-self-end"
          />
        </div>
      </ListRow>
    );
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
            <div className="mb-6 md:mb-7">
              <div className="min-w-0">
                <h1
                  className={cn(
                    'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                    pageText(isLight),
                  )}
                >
                  {labels.title}
                </h1>

                <p
                  className={cn(
                    'mt-2 max-w-[760px] text-[13px] leading-5',
                    mutedText(isLight),
                  )}
                >
                  {labels.description}
                </p>
              </div>
            </div>

            <Card light={isLight} className="overflow-hidden">
              <div className="grid min-h-[320px] place-items-center px-5 py-12 text-center">
                <div className="mx-auto max-w-[520px]">
                  <MicroLabel light={isLight}>
                    <StatusDot light={isLight} />
                    {locale === 'ru' ? 'Профиль не настроен' : 'Profile missing'}
                  </MicroLabel>

                  <h2
                    className={cn(
                      'mt-5 text-[28px] font-semibold tracking-[-0.065em] md:text-[36px]',
                      pageText(isLight),
                    )}
                  >
                    {labels.emptyTitle}
                  </h2>

                  <p className={cn('mt-3 text-[13px] leading-5', mutedText(isLight))}>
                    {labels.emptyDescription}
                  </p>

                  <div className="mt-6 flex justify-center">
                    <PageAction href="/create-profile" light={isLight} active>
                      <SquarePen className="size-3.5" />
                      {labels.emptyAction}
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
                    {labels.setupCards.timeline}
                  </MicroLabel>

                  <div
                    className={cn(
                      'mt-4 text-[13px] font-semibold tracking-[-0.018em]',
                      pageText(isLight),
                    )}
                  >
                    {locale === 'ru' ? 'Рабочий день' : 'Workday'}
                  </div>

                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {labels.setupCards.timelineText}
                  </p>
                </div>
              </Card>

              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <MessageCircleMore className="size-3.5" />
                    {labels.setupCards.chats}
                  </MicroLabel>

                  <div
                    className={cn(
                      'mt-4 text-[13px] font-semibold tracking-[-0.018em]',
                      pageText(isLight),
                    )}
                  >
                    {locale === 'ru' ? 'Связь с клиентами' : 'Client communication'}
                  </div>

                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {labels.setupCards.chatsText}
                  </p>
                </div>
              </Card>

              <Card light={isLight}>
                <div className="p-4">
                  <MicroLabel light={isLight}>
                    <Globe2 className="size-3.5" />
                    {labels.setupCards.public}
                  </MicroLabel>

                  <div
                    className={cn(
                      'mt-4 text-[13px] font-semibold tracking-[-0.018em]',
                      pageText(isLight),
                    )}
                  >
                    {locale === 'ru' ? 'Онлайн-запись' : 'Online booking'}
                  </div>

                  <p className={cn('mt-1 text-[11px] leading-4', mutedText(isLight))}>
                    {labels.setupCards.publicText}
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
          <div className="mb-6 md:mb-7">
            <div className="min-w-0">
              <h1
                className={cn(
                  'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                  pageText(isLight),
                )}
              >
                {labels.title}
              </h1>

              <p
                className={cn(
                  'mt-2 max-w-[760px] text-[13px] leading-5',
                  mutedText(isLight),
                )}
              >
                {labels.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Card light={isLight} className="overflow-hidden">
              <div className="p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <MicroLabel light={isLight} active accentColor={accentColor}>
                    <StatusDot light={isLight} active accentColor={accentColor} />
                    {hasRealBookings ? labels.preview : labels.sampleBadge}
                  </MicroLabel>

                  <MicroLabel light={isLight}>
                    <StatusDot light={isLight} />
                    {labels.timelineTitle}
                  </MicroLabel>

                  {demoMode ? (
                    <MicroLabel light={isLight}>
                      <StatusDot light={isLight} />
                      {locale === 'ru' ? 'Демо' : 'Demo'}
                    </MicroLabel>
                  ) : null}
                </div>

                <div
                  className={cn(
                    'mt-8 text-[32px] font-semibold tracking-[-0.08em] md:text-[44px]',
                    pageText(isLight),
                  )}
                >
                  {dayInsight.nextUp
                    ? `${dayInsight.nextUp.time} · ${dayInsight.nextUp.clientName}`
                    : labels.overviewTitle}
                </div>

                <p
                  className={cn(
                    'mt-3 max-w-[760px] text-[12.5px] leading-6',
                    mutedText(isLight),
                  )}
                >
                  {labels.overviewDescription}
                </p>

                <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <HeroStat
                    label={labels.metrics.total}
                    value={metrics.total}
                    hint={labels.preview}
                    light={isLight}
                  />

                  <HeroStat
                    label={labels.metrics.next}
                    value={metrics.next}
                    hint={dayInsight.nextUp?.service ?? '—'}
                    light={isLight}
                  />

                  <HeroStat
                    label={labels.metrics.newRequests}
                    value={metrics.newRequests}
                    hint={labels.stages.new}
                    light={isLight}
                  />

                  <HeroStat
                    label={labels.metrics.done}
                    value={metrics.done}
                    hint={dayInsight.completionLabel}
                    light={isLight}
                  />
                </div>
              </div>
            </Card>

            <Card light={isLight}>
              <CardTitle
                title={labels.overviewTitle}
                description={labels.overviewDescription}
                light={isLight}
              />

              <div
                className={cn(
                  'grid divide-y md:grid-cols-4 md:divide-x md:divide-y-0',
                  divideTone(isLight),
                )}
              >
                {summaryItems.map((item) => (
                  <StatTile
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    hint={item.hint}
                    icon={item.icon}
                    light={isLight}
                  />
                ))}
              </div>
            </Card>

            <Card light={isLight}>
              <CardTitle
                title={labels.timelineTitle}
                description={labels.timelineDescription}
                light={isLight}
              />

              <div className="space-y-4 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <p
                    className={cn(
                      'max-w-[680px] text-[12px] leading-6',
                      mutedText(isLight),
                    )}
                  >
                    {locale === 'ru'
                      ? 'Клик по записи открывает карточку клиента. Таймлайн обновляется по времени и показывает текущий момент.'
                      : 'Click a visit to open the client card. The timeline updates with time and shows the current moment.'}
                  </p>

                  <ControlGroup light={isLight} className="max-w-full overflow-x-auto">
                    {(['all', 'morning', 'day', 'evening'] as TimelineFilter[]).map(
                      (filterKey) => {
                        const count =
                          filterKey === 'all'
                            ? todayItems.length
                            : todayItems.filter((item) => item.period === filterKey).length;

                        return (
                          <FilterChip
                            key={filterKey}
                            label={labels.filters[filterKey]}
                            count={count}
                            active={selectedFilter === filterKey}
                            onClick={() => setSelectedFilter(filterKey)}
                            light={isLight}
                            accentColor={accentColor}
                          />
                        );
                      },
                    )}
                  </ControlGroup>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
                  <div>
                    {filteredItems.length ? (
                      <ListBox light={isLight}>
                        {filteredItems.map((item, index) => {
                          const isActive = item.id === activeItemId;
                          const showMarkerBefore = nowMarkerIndex === index;
                          const color = stageColor(
                            item.stage,
                            accentColor,
                            publicAccentColor,
                            isLight,
                          );

                          return (
                            <div key={item.id}>
                              {showMarkerBefore ? renderNowMarker(`now-${item.id}`) : null}

                              <ListRow
                                className={cn(
                                  'relative overflow-hidden px-0 py-0 transition-colors duration-150',
                                  isActive
                                    ? isLight
                                      ? 'bg-black/[0.018]'
                                      : 'bg-white/[0.032]'
                                    : isLight
                                      ? 'hover:bg-black/[0.018]'
                                      : 'hover:bg-white/[0.028]',
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => setActiveItemId(item.id)}
                                  className="grid min-h-[72px] w-full grid-cols-[4px_minmax(0,1fr)] text-left"
                                >
                                  <span
                                    style={{ background: color }}
                                    className={cn(
                                      'h-full w-full',
                                      item.stage === 'done' && 'opacity-50',
                                    )}
                                  />

                                  <div className="grid gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1fr)_170px_150px] md:items-center">
                                    <div className="min-w-0">
                                      <div
                                        className={cn(
                                          'truncate text-[12.5px] font-semibold tracking-[-0.018em]',
                                          pageText(isLight),
                                        )}
                                      >
                                        {item.clientName}
                                      </div>

                                      <div
                                        className={cn(
                                          'mt-1.5 truncate text-[11px] leading-4',
                                          mutedText(isLight),
                                        )}
                                      >
                                        {item.service}
                                        {item.note ? ` · ${item.note}` : ''}
                                      </div>
                                    </div>

                                    <TimeRangeCell
                                      start={item.time}
                                      end={formatMinutesAsTime(item.timeMinutes + 60)}
                                      light={isLight}
                                    />

                                    <TimelineStatus
                                      stage={item.stage}
                                      label={labels.stages[item.stage]}
                                      hint={labels.stageHints[item.stage]}
                                      light={isLight}
                                      accentColor={accentColor}
                                      publicAccentColor={publicAccentColor}
                                      className="md:justify-self-end"
                                    />
                                  </div>
                                </button>
                              </ListRow>

                              {index === filteredItems.length - 1 &&
                              nowMarkerIndex === filteredItems.length
                                ? renderNowMarker('now-end')
                                : null}
                            </div>
                          );
                        })}
                      </ListBox>
                    ) : (
                      <EmptyState light={isLight}>{labels.emptyFilter}</EmptyState>
                    )}
                  </div>

                  <Panel light={isLight} className="p-4">
                    <div>
                      <div
                        className={cn(
                          'text-[13px] font-semibold tracking-[-0.018em]',
                          pageText(isLight),
                        )}
                      >
                        {labels.liveDay}
                      </div>

                      <p className={cn('mt-1 text-[11px] leading-5', mutedText(isLight))}>
                        {labels.liveDayText}
                      </p>
                    </div>

                    {activeItem ? (
                      <div className="mt-4 space-y-3">
                        <Card light={isLight} className="p-4">
                          <div className={cn('text-[10.5px] font-medium', mutedText(isLight))}>
                            {labels.activeBooking}
                          </div>

                          <div
                            className={cn(
                              'mt-2 text-[21px] font-semibold tracking-[-0.045em]',
                              pageText(isLight),
                            )}
                          >
                            {activeItem.clientName}
                          </div>

                          <div className={cn('mt-1 text-[13px]', mutedText(isLight))}>
                            {activeItem.service}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            <MicroLabel light={isLight}>
                              {activeItem.time}–
                              {formatMinutesAsTime(activeItem.timeMinutes + 60)}
                            </MicroLabel>

                            <MicroLabel light={isLight}>
                              {activeItem.durationLabel}
                            </MicroLabel>

                            <MicroLabel light={isLight}>
                              {labels.filters[activeItem.period]}
                            </MicroLabel>
                          </div>
                        </Card>

                        <div className="grid gap-2">
                          <KeyValue
                            label={labels.time}
                            value={`${activeItem.time}–${formatMinutesAsTime(
                              activeItem.timeMinutes + 60,
                            )}`}
                            light={isLight}
                          />

                          <KeyValue
                            label={labels.phone}
                            value={activeItem.phone}
                            light={isLight}
                          />

                          <KeyValue
                            label={labels.dayState}
                            value={labels.stages[activeItem.stage]}
                            light={isLight}
                          />
                        </div>

                        <Card light={isLight} className="p-4">
                          <div className={cn('text-[10.5px] font-medium', mutedText(isLight))}>
                            {labels.note}
                          </div>

                          <div className={cn('mt-2 text-[13px] leading-6', pageText(isLight))}>
                            {activeItem.note ?? '—'}
                          </div>
                        </Card>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button asChild className={cn('justify-start', buttonBase(isLight))}>
                            <Link href={`tel:${activeItem.phone}`}>
                              <PhoneCall className="size-3.5" />
                              {labels.callClient}
                            </Link>
                          </Button>

                          <Button
                            asChild
                            className={cn('justify-start', buttonBase(isLight, true))}
                          >
                            <Link href="/dashboard/chats">
                              <MessageCircleMore className="size-3.5" />
                              {labels.openChat}
                            </Link>
                          </Button>
                        </div>

                        {activeBooking ? (
                          <div className="grid gap-2">
                            {activeBooking.status === 'new' ? (
                              <Button
                                type="button"
                                className={cn('justify-start', buttonBase(isLight))}
                                onClick={() => void handleStatusChange('confirmed')}
                                disabled={actionLoading !== null}
                              >
                                <CheckCircle2 className="size-3.5" />
                                {actionLoading === 'confirmed' ? '…' : labels.confirm}
                              </Button>
                            ) : null}

                            {activeBooking.status !== 'completed' ? (
                              <Button
                                type="button"
                                className={cn('justify-start', buttonBase(isLight, true))}
                                onClick={() => void handleStatusChange('completed')}
                                disabled={actionLoading !== null}
                              >
                                <CheckCircle2 className="size-3.5" />
                                {actionLoading === 'completed' ? '…' : labels.complete}
                              </Button>
                            ) : null}
                          </div>
                        ) : (
                          <EmptyState light={isLight}>{labels.sampleCopy}</EmptyState>
                        )}
                      </div>
                    ) : (
                      <EmptyState light={isLight}>{labels.selectBooking}</EmptyState>
                    )}
                  </Panel>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </WorkspaceShell>
  );
}