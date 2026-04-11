'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircleMore,
  PhoneCall,
  Sparkles,
  SunMedium,
  Users2,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import type { Booking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

type TimelineStage = 'next' | 'queue' | 'done' | 'new';
type TimelinePeriod = 'morning' | 'day' | 'evening';
type TimelineFilter = 'all' | TimelinePeriod;

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
}

interface DayInsight {
  nextUp?: TimelineItem;
  busiestPeriod: TimelineFilter;
  freeWindowLabel: string;
  completionLabel: string;
}

function toLocalIsoDate(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map((value) => Number.parseInt(value, 10));
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function getTimelinePeriod(timeMinutes: number): TimelinePeriod {
  if (timeMinutes < 12 * 60) return 'morning';
  if (timeMinutes < 17 * 60) return 'day';
  return 'evening';
}

function mapBookingToTimelineItem(booking: Booking, now: Date, locale: 'ru' | 'en'): TimelineItem {
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
  };
}

function getTimelineBounds(items: TimelineItem[]) {
  if (!items.length) {
    return { start: 8 * 60, end: 20 * 60, span: 12 * 60 };
  }

  const first = Math.min(...items.map((item) => item.timeMinutes));
  const last = Math.max(...items.map((item) => item.timeMinutes));
  const start = Math.max(8 * 60, first - 50);
  const end = Math.min(22 * 60, last + 80);
  return { start, end, span: Math.max(1, end - start) };
}

function getTimelineNodeOffset(timeMinutes: number, bounds: ReturnType<typeof getTimelineBounds>) {
  return `${((timeMinutes - bounds.start) / bounds.span) * 100}%`;
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

  const busiestPeriod = (Object.entries(counts).filter(([key]) => key !== 'all') as [TimelinePeriod, number][])
    .sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'day';

  const nextUp = items.find((item) => item.stage === 'next' || item.stage === 'queue' || item.stage === 'new');
  const completionRate = items.length
    ? Math.round((items.filter((item) => item.stage === 'done').length / items.length) * 100)
    : 0;

  const freeWindowLabel = (() => {
    if (items.length < 2) {
      return locale === 'ru' ? 'Свободные окна появятся после первых записей' : 'Free windows appear after the first bookings';
    }

    const sorted = [...items].sort((left, right) => left.timeMinutes - right.timeMinutes);
    let bestGap = 0;

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];
      bestGap = Math.max(bestGap, current.timeMinutes - previous.timeMinutes - 60);
    }

    if (bestGap <= 0) {
      return locale === 'ru' ? 'День плотный, свободных окон почти нет' : 'Packed day, almost no free windows';
    }

    const hours = Math.floor(bestGap / 60);
    const minutes = bestGap % 60;
    if (locale === 'ru') {
      return hours > 0 ? `${hours} ч ${minutes} мин до следующего плотного блока` : `${minutes} мин между визитами`;
    }
    return hours > 0 ? `${hours}h ${minutes}m before the next dense block` : `${minutes}m between visits`;
  })();

  return {
    nextUp,
    busiestPeriod,
    freeWindowLabel,
    completionLabel: locale === 'ru' ? `${completionRate}% дня уже закрыто` : `${completionRate}% of the day completed`,
  };
}

export default function DashboardTodayPage() {
  const { hasHydrated, ownedProfile, bookings, locale, demoMode } = useOwnedWorkspaceData();
  const isMobile = useMobile();
  const [selectedFilter, setSelectedFilter] = useState<TimelineFilter>('all');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const timelineScrollAreaRef = useRef<HTMLDivElement | null>(null);

  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);
  const now = useMemo(() => new Date(), []);
  const nowMinutes = useMemo(() => now.getHours() * 60 + now.getMinutes(), [now]);

  const todayItems = useMemo(() => {
    return bookings
      .filter((booking) => booking.date === todayIso)
      .sort((left, right) => left.time.localeCompare(right.time))
      .map((booking) => mapBookingToTimelineItem(booking, now, locale));
  }, [bookings, locale, now, todayIso]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'all') return todayItems;
    return todayItems.filter((item) => item.period === selectedFilter);
  }, [selectedFilter, todayItems]);

  const timelineBounds = useMemo(() => getTimelineBounds(filteredItems), [filteredItems]);
  const dayInsight = useMemo(() => buildDayInsight(todayItems, locale), [locale, todayItems]);

  useEffect(() => {
    if (!filteredItems.length) {
      setActiveItemId(null);
      return;
    }

    if (!activeItemId || !filteredItems.some((item) => item.id === activeItemId)) {
      setActiveItemId(filteredItems[0].id);
    }
  }, [activeItemId, filteredItems]);

  const labels = locale === 'ru'
    ? {
        badge: 'Сегодня / лента дня',
        title: 'Записи на сегодня',
        description: demoMode
          ? 'Записи, статусы и контакты на день.'
          : 'Записи, статусы и контакты на день.',
        emptyTitle: 'Сначала настройте профиль мастера',
        emptyAction: 'Создать профиль',
        heroBadge: demoMode ? 'Демо-режим' : 'Рабочий день',
        heroTitle: demoMode ? 'Записи на день' : 'Записи на день',
        heroDescription: demoMode
          ? 'Главные записи и очередь на день.'
          : 'Главные записи и очередь на день.',
        timelineTitle: 'Таймлайн дня',
        timelineDescription: 'Лента записей по времени.',
        timelineHint: 'Прокручивается плавно — карточки привязываются по шагам.',
        callClient: 'Позвонить',
        openChat: 'Открыть чат',
        noBookingsTitle: 'На сегодня записей нет',
        noBookingsText: demoMode
          ? 'Пока записей нет.'
          : 'Пока записей нет.',
        openAvailability: 'Открыть график',
        openServices: 'Проверить услуги',
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
        filters: {
          all: 'Весь день',
          morning: 'Утро',
          day: 'День',
          evening: 'Вечер',
        },
        overviewTitle: 'План дня',
        overviewText: 'Нажмите на отметку времени, чтобы быстро перейти к нужной записи.',
        busiest: 'Самый плотный блок',
        nextUp: 'Следующий визит',
        freeWindow: 'Свободные окна',
        completion: 'Прогресс дня',
        liveDay: 'Сводка дня',
        liveDayText: demoMode
          ? 'Карточки записей на день.'
          : 'Карточки записей на день.',
        quickActionsTitle: 'Быстрые действия',
        quickActionsText: 'Нужные действия на день.',
      }
    : {
        badge: 'Сегодня / лента дня',
        title: 'Today bookings',
        description: demoMode
          ? 'Bookings, statuses, and contacts for the day.'
          : 'Bookings, statuses, and contacts for the day.',
        emptyTitle: 'Create the master profile first',
        emptyAction: 'Create profile',
        heroBadge: demoMode ? 'Demo mode' : 'Workday',
        heroTitle: demoMode ? 'Bookings for the day' : 'Bookings for the day',
        heroDescription: demoMode
          ? 'Main bookings and queue for the day.'
          : 'Main bookings and queue for the day.',
        timelineTitle: 'Day timeline',
        timelineDescription: 'Timeline of bookings by time.',
        timelineHint: 'Smooth horizontal scroll with snap-to-card behavior.',
        callClient: 'Call',
        openChat: 'Open chat',
        noBookingsTitle: 'No bookings for today yet',
        noBookingsText: demoMode
          ? 'No bookings yet.'
          : 'No bookings yet.',
        openAvailability: 'Open availability',
        openServices: 'Review services',
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
        filters: {
          all: 'All day',
          morning: 'Morning',
          day: 'Day',
          evening: 'Evening',
        },
        overviewTitle: 'Day map',
        overviewText: 'Tap any point to jump to the booking. Left to right covers the full day.',
        busiest: 'Busiest block',
        nextUp: 'Next visit',
        freeWindow: 'Free windows',
        completion: 'Day progress',
        liveDay: 'Live day flow',
        liveDayText: demoMode
          ? 'Booking cards for the day.'
          : 'Booking cards for the day.',
        quickActionsTitle: 'Quick actions',
        quickActionsText: 'Main actions for the day.',
      };

  const metrics = {
    total: todayItems.length,
    next: todayItems.filter((item) => item.stage === 'next' || item.stage === 'queue').length,
    newRequests: todayItems.filter((item) => item.stage === 'new').length,
    done: todayItems.filter((item) => item.stage === 'done').length,
  };
  const activeItem = filteredItems.find((item) => item.id === activeItemId) ?? filteredItems[0] ?? null;

  function scrollTimeline(direction: 'left' | 'right') {
    const viewport = timelineScrollAreaRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;

    viewport.scrollBy({
      left: direction === 'right' ? 360 : -360,
      behavior: 'smooth',
    });
  }

  function focusItem(itemId: string) {
    setActiveItemId(itemId);

    if (typeof document === 'undefined') return;
    const card = document.getElementById(`timeline-card-${itemId}`);
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  if (!hasHydrated) return null;

  if (!ownedProfile) {
    return (
      <WorkspaceShell>
        <div className="workspace-page">
          <div className="workspace-card rounded-[22px] p-8 text-center">
            <div className="text-[18px] font-semibold text-foreground">{labels.emptyTitle}</div>
            <div className="mt-4">
              <Button asChild>
                <Link href="/create-profile">{labels.emptyAction}</Link>
              </Button>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide workspace-page-today space-y-5">
        <DashboardHeader
          badge={labels.badge}
          title={labels.title}
          description={labels.description}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/chats">
                  <MessageCircleMore className="size-4" />
                  {locale === 'ru' ? 'Чаты' : 'Chats'}
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/m/${ownedProfile.slug}`}>
                  <ArrowRight className="size-4" />
                  {locale === 'ru' ? 'Публичная страница' : 'Public page'}
                </Link>
              </Button>
            </>
          }
        />

        <SectionCard
          title={labels.heroTitle}
          description={labels.heroDescription}
          actions={<span className="workspace-pill">{labels.heroBadge}</span>}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label={labels.metrics.total} value={String(metrics.total)} icon={CalendarClock} />
            <MetricCard label={labels.metrics.next} value={String(metrics.next)} icon={Clock3} />
            <MetricCard label={labels.metrics.newRequests} value={String(metrics.newRequests)} icon={Users2} />
            <MetricCard label={labels.metrics.done} value={String(metrics.done)} icon={CheckCircle2} />
          </div>
        </SectionCard>

        {todayItems.length === 0 ? (
          <Empty className="rounded-[34px]">
            <EmptyHeader>
              <EmptyTitle>{labels.noBookingsTitle}</EmptyTitle>
              <EmptyDescription>{labels.noBookingsText}</EmptyDescription>
            </EmptyHeader>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/dashboard/availability">{labels.openAvailability}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/services">{labels.openServices}</Link>
              </Button>
            </div>
          </Empty>
        ) : isMobile ? (
          <SectionCard
            title={labels.timelineTitle}
            description={labels.liveDayText}
            actions={<span className="workspace-pill">{labels.timelineHint}</span>}
          >
            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-[14px] border border-border/80 bg-accent/24 px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{labels.nextUp}</div>
                  <div className="mt-1 text-[12px] font-semibold text-foreground">
                    {dayInsight.nextUp ? `${dayInsight.nextUp.time} · ${dayInsight.nextUp.clientName}` : '—'}
                  </div>
                </div>
                <div className="rounded-[14px] border border-border/80 bg-accent/24 px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{labels.freeWindow}</div>
                  <div className="mt-1 text-[12px] font-semibold text-foreground">{dayInsight.freeWindowLabel}</div>
                </div>
                <div className="rounded-[14px] border border-border/80 bg-accent/24 px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{labels.completion}</div>
                  <div className="mt-1 text-[12px] font-semibold text-foreground">{dayInsight.completionLabel}</div>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['all', 'morning', 'day', 'evening'] as TimelineFilter[]).map((filterKey) => {
                  const isActive = selectedFilter === filterKey;
                  const count = filterKey === 'all'
                    ? todayItems.length
                    : todayItems.filter((item) => item.period === filterKey).length;

                  return (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setSelectedFilter(filterKey)}
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10.5px] font-medium transition',
                        isActive
                          ? 'border-border bg-accent/55 text-foreground'
                          : 'border-border bg-background/55 text-muted-foreground',
                      )}
                    >
                      <span>{labels.filters[filterKey]}</span>
                      <span className={cn('rounded-full px-1.5 py-0.5 text-[9px]', isActive ? 'bg-card text-foreground' : 'bg-accent text-foreground/80')}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeItem ? (
                <div className="rounded-[16px] border border-border/80 bg-card/78 px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-[16px] font-semibold text-foreground">{activeItem.time}</div>
                        <span className="chip-muted">{labels.stages[activeItem.stage]}</span>
                      </div>
                      <div className="mt-1 text-[13px] font-semibold text-foreground">{activeItem.clientName}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{activeItem.service}</div>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground">{activeItem.durationLabel}</div>
                  </div>

                  {activeItem.note ? (
                    <div className="mt-2 rounded-[12px] border border-border/70 bg-background/68 px-3 py-2 text-[10.5px] text-muted-foreground">
                      {activeItem.note}
                    </div>
                  ) : null}

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm" className="h-8 rounded-[12px]">
                      <Link href={`tel:${activeItem.phone}`}>
                        <PhoneCall className="size-3.5" />
                        {labels.callClient}
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="h-8 rounded-[12px]">
                      <Link href="/dashboard/chats">
                        <MessageCircleMore className="size-3.5" />
                        {labels.openChat}
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveItemId(item.id)}
                    className={cn(
                      'w-full rounded-[16px] border px-3 py-2.5 text-left transition',
                      item.id === activeItemId ? 'border-primary/24 bg-primary/8' : 'border-border/80 bg-card/72',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-[13px] font-semibold text-foreground">{item.time}</div>
                          <span className="chip-muted">{labels.stages[item.stage]}</span>
                        </div>
                        <div className="mt-1 truncate text-[12px] font-medium text-foreground">{item.clientName}</div>
                        <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">{item.service}</div>
                      </div>
                      <div className="text-[9.5px] text-muted-foreground">{item.durationLabel}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title={labels.timelineTitle}
            description={labels.timelineDescription}
            actions={<span className="workspace-pill">{labels.timelineHint}</span>}
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_320px]">
              <div className="workspace-card rounded-[28px] border border-border/80 bg-card/62 p-4 shadow-[0_20px_52px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col gap-4 border-b border-border/70 pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="chip-muted">{labels.overviewTitle}</div>
                    <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{labels.overviewText}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(['all', 'morning', 'day', 'evening'] as TimelineFilter[]).map((filterKey) => {
                      const isActive = selectedFilter === filterKey;
                      const count = filterKey === 'all'
                        ? todayItems.length
                        : todayItems.filter((item) => item.period === filterKey).length;

                      return (
                        <button
                          key={filterKey}
                          type="button"
                          onClick={() => setSelectedFilter(filterKey)}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-medium transition',
                            isActive
                              ? 'border-border bg-accent/55 text-foreground shadow-none'
                              : 'border-border bg-background/55 text-muted-foreground hover:border-border hover:text-foreground',
                          )}
                        >
                          <span>{labels.filters[filterKey]}</span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[11px]',
                              isActive ? 'bg-card text-foreground' : 'bg-accent text-foreground/80',
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    <div className="ml-1 flex items-center gap-2">
                      <Button type="button" variant="outline" size="icon" className="size-9 rounded-full" onClick={() => scrollTimeline('left')}>
                        <ChevronLeft className="size-4" />
                      </Button>
                      <Button type="button" variant="outline" size="icon" className="size-9 rounded-full" onClick={() => scrollTimeline('right')}>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-border/80 bg-background/50 p-4">
                  <div className="relative overflow-hidden rounded-[20px] border border-border/70 bg-gradient-to-br from-background via-background/80 to-card/70 px-4 py-5">
                    <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-border/30 via-border/60 to-border/30" />
                    <div className="absolute inset-x-4 top-1/2 h-[66px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_72%)]" />

                    {nowMinutes >= timelineBounds.start && nowMinutes <= timelineBounds.end ? (
                      <div
                        className="pointer-events-none absolute inset-y-3 z-[1]"
                        style={{ left: getTimelineNodeOffset(nowMinutes, timelineBounds) }}
                      >
                        <div className="flex h-full flex-col items-center">
                          <div className="rounded-full border border-border bg-background/80 px-2 py-1 text-[10px] font-medium text-foreground">
                            {locale === 'ru' ? 'Сейчас' : 'Now'}
                          </div>
                          <div className="mt-2 h-full w-px bg-gradient-to-b from-border via-border/70 to-transparent" />
                        </div>
                      </div>
                    ) : null}

                    <div className="relative z-[2] flex min-h-[138px] items-center">
                      {filteredItems.map((item) => {
                        const isActive = item.id === activeItemId;
                        return (
                          <button
                            key={`node-${item.id}`}
                            type="button"
                            onClick={() => focusItem(item.id)}
                            className="group absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                            style={{ left: getTimelineNodeOffset(item.timeMinutes, timelineBounds) }}
                          >
                            <span
                              className={cn(
                                'flex size-12 items-center justify-center rounded-full border text-[11px] font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition',
                                item.stage === 'done'
                                  ? 'border-emerald-500/30 bg-emerald-500/14 text-emerald-200'
                                  : item.stage === 'new'
                                    ? 'border-amber-500/32 bg-amber-500/14 text-amber-200'
                                    : 'border-border bg-background text-foreground',
                                isActive && 'scale-105',
                              )}
                            >
                              {item.time}
                            </span>
                            <span
                              className={cn(
                                'mt-3 max-w-[128px] rounded-full border px-3 py-1 text-[11px] font-medium transition',
                                isActive
                                  ? 'border-border bg-accent/55 text-foreground'
                                  : 'border-border bg-background/72 text-muted-foreground group-hover:border-border group-hover:text-foreground',
                              )}
                            >
                              {item.clientName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4" ref={timelineScrollAreaRef}>
                  <ScrollArea className="w-full">
                    <div className="flex min-w-max gap-4 pb-4 pt-1">
                      {filteredItems.map((item) => {
                        const isActive = item.id === activeItemId;
                        return (
                          <article
                            key={item.id}
                            id={`timeline-card-${item.id}`}
                            className={cn(
                              'w-[340px] shrink-0 snap-start rounded-[26px] border p-5 transition',
                              isActive
                                ? 'border-border bg-card shadow-[0_24px_56px_rgba(0,0,0,0.22)]'
                                : 'border-border/80 bg-card/78 shadow-[0_16px_40px_rgba(0,0,0,0.18)]',
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">{item.time}</div>
                                <div className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-foreground">{item.clientName}</div>
                                <div className="mt-1 text-[13px] text-muted-foreground">{item.service}</div>
                              </div>

                              <span
                                className={cn(
                                  'rounded-full border px-3 py-1.5 text-[11px] font-medium',
                                  item.stage === 'done'
                                    ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-200'
                                    : item.stage === 'new'
                                      ? 'border-amber-500/30 bg-amber-500/12 text-amber-200'
                                      : 'border-border bg-background text-foreground',
                                )}
                              >
                                {labels.stages[item.stage]}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3">
                              <div className="rounded-[18px] border border-border/80 bg-background/55 p-3.5">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                  {locale === 'ru' ? 'Комментарий' : 'Note'}
                                </div>
                                <div className="mt-2 text-[13px] leading-6 text-foreground/88">{item.note ?? '—'}</div>
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2">
                                <div className="rounded-[18px] border border-border/70 bg-background/40 p-3">
                                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                    {locale === 'ru' ? 'Длительность' : 'Duration'}
                                  </div>
                                  <div className="mt-2 text-[14px] font-medium text-foreground">{item.durationLabel}</div>
                                </div>
                                <div className="rounded-[18px] border border-border/70 bg-background/40 p-3">
                                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                                    {locale === 'ru' ? 'Статус дня' : 'Day state'}
                                  </div>
                                  <div className="mt-2 text-[14px] font-medium text-foreground">{labels.filters[item.period]}</div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                              <Button asChild variant="outline" className="justify-start shadow-none">
                                <Link href={`tel:${item.phone}`}>
                                  <PhoneCall className="size-4" />
                                  {labels.callClient}
                                </Link>
                              </Button>

                              <Button asChild className="justify-start">
                                <Link href="/dashboard/chats">
                                  <MessageCircleMore className="size-4" />
                                  {labels.openChat}
                                </Link>
                              </Button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </div>

              <div className="workspace-card rounded-[28px] border border-border/80 bg-card/68 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="chip-muted">{labels.liveDay}</div>
                    <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{labels.liveDayText}</div>
                  </div>
                  {demoMode ? <span className="workspace-pill border-border bg-background text-foreground">{locale === 'ru' ? 'демо' : 'demo'}</span> : null}
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-[20px] border border-border/80 bg-background/55 p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{labels.busiest}</div>
                    <div className="mt-2 text-[16px] font-semibold text-foreground">{labels.filters[dayInsight.busiestPeriod]}</div>
                  </div>

                  <div className="rounded-[20px] border border-border/80 bg-background/55 p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{labels.nextUp}</div>
                    <div className="mt-2 text-[16px] font-semibold text-foreground">
                      {dayInsight.nextUp ? `${dayInsight.nextUp.time} · ${dayInsight.nextUp.clientName}` : '—'}
                    </div>
                    <div className="mt-1 text-[13px] text-muted-foreground">{dayInsight.nextUp?.service ?? '—'}</div>
                  </div>

                  <div className="rounded-[20px] border border-border/80 bg-background/55 p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{labels.freeWindow}</div>
                    <div className="mt-2 text-[14px] leading-6 text-foreground">{dayInsight.freeWindowLabel}</div>
                  </div>

                  <div className="rounded-[20px] border border-border/80 bg-background/55 p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{labels.completion}</div>
                    <div className="mt-2 text-[16px] font-semibold text-foreground">{dayInsight.completionLabel}</div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-foreground/45 via-foreground/75 to-foreground/60"
                        style={{ width: `${Math.max(10, metrics.total ? (metrics.done / metrics.total) * 100 : 10)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        <SectionCard title={labels.quickActionsTitle} description={labels.quickActionsText}>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { href: '/dashboard/chats', label: locale === 'ru' ? 'Чаты' : 'Chats', icon: MessageCircleMore },
              { href: '/dashboard/services', label: locale === 'ru' ? 'Услуги' : 'Services', icon: Sparkles },
              { href: '/dashboard/availability', label: locale === 'ru' ? 'График' : 'Availability', icon: SunMedium },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="workspace-card workspace-card-hover flex items-center gap-3 rounded-[20px] p-4"
                >
                  <div className="flex size-11 items-center justify-center rounded-[14px] border border-border bg-accent/55 text-muted-foreground">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="text-[14px] font-medium text-foreground">{item.label}</div>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
