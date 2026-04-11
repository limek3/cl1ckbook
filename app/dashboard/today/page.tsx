'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
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
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import type { Booking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

type TimelineStage = 'next' | 'queue' | 'done' | 'new';

interface TimelineItem {
  id: string;
  time: string;
  clientName: string;
  service: string;
  phone: string;
  stage: TimelineStage;
  note?: string;
  durationLabel: string;
}

function toLocalIsoDate(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function mapBookingToTimelineItem(booking: Booking, now: Date, locale: 'ru' | 'en'): TimelineItem {
  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const diff = bookingDateTime.getTime() - now.getTime();

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
    clientName: booking.clientName,
    service: booking.service,
    phone: booking.clientPhone,
    stage,
    note: booking.comment || undefined,
    durationLabel: locale === 'ru' ? '1 час' : '1 hour',
  };
}

export default function DashboardTodayPage() {
  const { hasHydrated, ownedProfile, bookings, locale } = useOwnedWorkspaceData();
  const isMobile = useMobile();

  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);
  const now = useMemo(() => new Date(), []);

  const todayItems = useMemo(() => {
    return bookings
      .filter((booking) => booking.date === todayIso)
      .sort((left, right) => left.time.localeCompare(right.time))
      .map((booking) => mapBookingToTimelineItem(booking, now, locale));
  }, [bookings, locale, now, todayIso]);

  const labels = locale === 'ru'
    ? {
        badge: 'Таймлайн дня',
        title: 'Записи на сегодня',
        description: isMobile ? 'План дня в компактной ленте.' : 'Ближайшие визиты, очередь и быстрые действия на один экран.',
        emptyTitle: 'Сначала настройте профиль мастера',
        emptyAction: 'Создать профиль',
        heroBadge: 'Рабочий день',
        heroTitle: isMobile ? 'План дня' : 'Весь день в одном таймлайне',
        heroDescription: isMobile ? 'Выберите время и быстро откройте нужную запись.' : 'Переходите к нужной записи в один тап и держите весь день под рукой.',
        noBookingsTitle: 'На сегодня записей нет',
        noBookingsText: 'Когда клиенты начнут бронировать реальные слоты, здесь появится живая лента без моков.',
        openAvailability: 'Открыть график',
        openServices: 'Проверить услуги',
        metrics: {
          total: 'На сегодня',
          next: 'Ближайшие',
          newRequests: 'Новые заявки',
          done: 'Завершено',
        },
        stages: {
          next: 'Следующая',
          queue: 'В очереди',
          done: 'Завершено',
          new: 'Новая',
        },
      }
    : {
        badge: 'Таймлайн дня',
        title: 'Today bookings',
        description: 'A calm workday timeline with upcoming visits, queue visibility, and fast contact actions.',
        emptyTitle: 'Create the master profile first',
        emptyAction: 'Create profile',
        heroBadge: 'Workday',
        heroTitle: 'The whole day in one timeline',
        heroDescription: 'Track the queue, keep new requests visible, and jump into the chat when needed.',
        noBookingsTitle: 'No bookings for today yet',
        noBookingsText: 'Once clients start booking real slots, this screen will show the live workday timeline without mocks.',
        openAvailability: 'Open availability',
        openServices: 'Review services',
        metrics: {
          total: 'Today',
          next: 'Next up',
          newRequests: 'New requests',
          done: 'Completed',
        },
        stages: {
          next: 'Next',
          queue: 'Queue',
          done: 'Done',
          new: 'New',
        },
      };

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

  const metrics = {
    total: todayItems.length,
    next: todayItems.filter((item) => item.stage === 'next' || item.stage === 'queue').length,
    newRequests: todayItems.filter((item) => item.stage === 'new').length,
    done: todayItems.filter((item) => item.stage === 'done').length,
  };

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide space-y-5">
        <DashboardHeader
          badge={labels.badge}
          title={labels.title}
          description={labels.description}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/chats">
                  <MessageCircleMore className="size-4" />
                  Чаты
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/m/${ownedProfile.slug}`}>
                  <ArrowRight className="size-4" />
                  Публичная страница
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
          <section className="workspace-card rounded-[22px] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[20px] font-semibold tracking-[-0.04em] text-foreground">{locale === 'ru' ? 'Таймлайн дня' : 'Day timeline'}</div>
                <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {locale === 'ru' ? 'Компактная лента записей на сегодня.' : 'A compact list of bookings for today.'}
                </div>
              </div>
              <span className="workspace-pill">{labels.heroBadge}</span>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {todayItems.map((item) => (
                <div
                  key={`${item.id}-time`}
                  className="workspace-soft-panel shrink-0 rounded-full px-3 py-2 text-left shadow-none"
                >
                  <div className="text-[13px] font-semibold text-foreground">{item.time}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2.5">
              {todayItems.map((item) => (
                <div key={item.id} className="workspace-soft-panel rounded-[18px] border-border/80 p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex w-[58px] shrink-0 flex-col items-center">
                      <div className="text-[15px] font-semibold text-foreground">{item.time}</div>
                      <div className="mt-2 h-full w-px min-h-[42px] bg-border/70" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[16px] font-semibold tracking-[-0.03em] text-foreground">{item.clientName}</div>
                          <div className="mt-0.5 text-[12px] text-muted-foreground">{item.service}</div>
                        </div>
                        <span className="workspace-pill border-border bg-accent/40 text-foreground">{labels.stages[item.stage]}</span>
                      </div>

                      <div className="mt-2 text-[12px] leading-5 text-muted-foreground">
                        {item.note ?? (locale === 'ru' ? 'Без комментария.' : 'No note yet.')}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Button asChild variant="outline" className="h-9 rounded-[12px] px-3 shadow-none">
                          <Link href={`tel:${item.phone}`}>
                            <PhoneCall className="size-4" />
                            {locale === 'ru' ? 'Позвонить' : 'Call'}
                          </Link>
                        </Button>

                        <Button asChild className="h-9 rounded-[12px] px-3">
                          <Link href="/dashboard/chats">
                            <MessageCircleMore className="size-4" />
                            {locale === 'ru' ? 'Открыть чат' : 'Open chat'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="grid gap-4">
            {todayItems.map((item) => (
              <SectionCard
                key={item.id}
                className="border-border/80 bg-card/72"
                title={`${item.time} · ${item.clientName}`}
                description={item.service}
                actions={
                  <span
                    className={cn(
                      'workspace-pill border-border bg-accent/40 text-foreground',
                    )}
                  >
                    {labels.stages[item.stage]}
                  </span>
                }
              >
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground">{item.durationLabel}</div>
                    <div className="mt-1 text-[12px] leading-6 text-muted-foreground">{item.note ?? '—'}</div>
                  </div>

                  <Button asChild variant="outline" className="shadow-none">
                    <Link href={`tel:${item.phone}`}>
                      <PhoneCall className="size-4" />
                      {item.phone}
                    </Link>
                  </Button>

                  <Button asChild>
                    <Link href="/dashboard/chats">
                      <MessageCircleMore className="size-4" />
                      {locale === 'ru' ? 'Чат' : 'Chat'}
                    </Link>
                  </Button>
                </div>
              </SectionCard>
            ))}
          </div>
        )}

        <SectionCard
          title={locale === 'ru' ? 'Быстрые действия' : 'Quick actions'}
          description={locale === 'ru' ? 'Самые частые переходы для рабочего дня.' : 'Most common jumps for the workday.'}
        >
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
