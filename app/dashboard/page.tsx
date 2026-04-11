'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  CalendarClock,
  Globe2,
  MessageCircleMore,
  Package2,
  PiggyBank,
  SquarePen,
  Sparkles,
  TrendingUp,
  Users2,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, PublicPageHero, SectionCard } from '@/components/dashboard/workspace-ui';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

type TrendMetric = 'revenue' | 'requests' | 'visitors';

export default function DashboardPage() {
  const { hasHydrated, ownedProfile, bookings, dataset, locale } = useOwnedWorkspaceData();
  const isMobile = useMobile();
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('revenue');

  const upcomingBookings = useMemo(() => {
    return [...bookings]
      .sort((left, right) => {
        const a = new Date(`${left.date}T${left.time}:00`).getTime();
        const b = new Date(`${right.date}T${right.time}:00`).getTime();
        return a - b;
      })
      .slice(0, 5);
  }, [bookings]);

  const weekRevenue = useMemo(
    () => dataset?.daily.slice(-7).reduce((total, item) => total + item.revenue, 0) ?? 0,
    [dataset],
  );

  const todayActivity = useMemo(() => dataset?.daily.at(-1), [dataset]);
  const favoriteClients = useMemo(() => dataset?.clients.filter((item) => item.favorite).slice(0, 4) ?? [], [dataset]);
  const topServices = useMemo(() => dataset?.services.slice(0, 4) ?? [], [dataset]);

  const weekTrendData = useMemo(
    () =>
      dataset?.daily.slice(-7).map((item) => ({
        ...item,
        avgCheck: item.confirmed ? Math.round(item.revenue / item.confirmed) : 0,
      })) ?? [],
    [dataset],
  );

  const trendSummary = useMemo(() => {
    if (!dataset) return null;
    const lastSeven = dataset.daily.slice(-7);
    const previousSeven = dataset.daily.slice(-14, -7);

    const currentRevenue = lastSeven.reduce((total, item) => total + item.revenue, 0);
    const previousRevenue = previousSeven.reduce((total, item) => total + item.revenue, 0);
    const currentRequests = lastSeven.reduce((total, item) => total + item.requests, 0);
    const currentVisitors = lastSeven.reduce((total, item) => total + item.visitors, 0);
    const currentConfirmed = lastSeven.reduce((total, item) => total + item.confirmed, 0);

    const revenueDelta =
      previousRevenue > 0
        ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
        : currentRevenue > 0
          ? 100
          : 0;

    return {
      revenueDelta,
      requests: currentRequests,
      visitors: currentVisitors,
      confirmed: currentConfirmed,
      conversion: Math.round((currentConfirmed / Math.max(1, currentVisitors)) * 1000) / 10,
    };
  }, [dataset]);

  const chartConfig = useMemo(
    () => ({
      revenue: { label: locale === 'ru' ? 'Доход' : 'Revenue', color: 'var(--chart-1)' },
      requests: { label: locale === 'ru' ? 'Запросы' : 'Requests', color: 'var(--chart-2)' },
      visitors: { label: locale === 'ru' ? 'Посетители' : 'Visitors', color: 'var(--chart-3)' },
    }),
    [locale],
  );

  const quickActions = [
    { href: '/dashboard/chats', label: locale === 'ru' ? 'Открыть чаты' : 'Open chats', icon: MessageCircleMore },
    { href: '/dashboard/services', label: locale === 'ru' ? 'Настроить услуги' : 'Edit services', icon: Package2 },
    { href: '/dashboard/appearance', label: locale === 'ru' ? 'Внешний вид' : 'Appearance', icon: Sparkles },
    { href: '/dashboard/profile', label: locale === 'ru' ? 'Профиль мастера' : 'Master profile', icon: SquarePen },
  ];

  if (!hasHydrated) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <div className="workspace-page">
          <div className="workspace-card rounded-[22px] p-8 text-center">
            <div className="text-[18px] font-semibold text-foreground">
              {locale === 'ru' ? 'Сначала создайте профиль мастера' : 'Create a master profile first'}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/create-profile">{locale === 'ru' ? 'Создать профиль' : 'Create profile'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  const metrics = [
    {
      label: locale === 'ru' ? 'Заявки сегодня' : 'Requests today',
      value: String(todayActivity?.requests ?? 0),
      hint: locale === 'ru' ? `${todayActivity?.confirmed ?? 0} подтверждено` : `${todayActivity?.confirmed ?? 0} confirmed`,
      icon: CalendarClock,
    },
    {
      label: locale === 'ru' ? 'Доход за неделю' : 'Weekly revenue',
      value: formatCurrency(weekRevenue, locale),
      hint: locale === 'ru' ? `средний чек ${formatCurrency(dataset.totals.averageCheck, locale)}` : `avg check ${formatCurrency(dataset.totals.averageCheck, locale)}`,
      icon: PiggyBank,
    },
    {
      label: locale === 'ru' ? 'Просмотры страницы' : 'Page visits',
      value: String(dataset.totals.visitors),
      hint: `${dataset.totals.conversion}% ${locale === 'ru' ? 'конверсия' : 'conversion'}`,
      icon: Globe2,
    },
    {
      label: locale === 'ru' ? 'Повторные клиенты' : 'Returning clients',
      value: `${dataset.totals.returnRate}%`,
      hint: locale === 'ru' ? `${dataset.totals.newClients} новых за 30 дней` : `${dataset.totals.newClients} new in 30 days`,
      icon: Users2,
    },
  ] as const;

  const bookingStatusLabel = (status: string) => {
    if (locale === 'ru') {
      if (status === 'new') return 'Новая';
      if (status === 'confirmed') return 'Подтверждена';
      if (status === 'completed') return 'Завершена';
      if (status === 'cancelled') return 'Отменена';
      return status;
    }

    if (status === 'new') return 'New';
    if (status === 'confirmed') return 'Confirmed';
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    return status;
  };

  const formatBookingSlot = (date: string, time: string) => {
    try {
      return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(`${date}T${time}:00`)) + ` · ${time}`;
    } catch {
      return `${date} · ${time}`;
    }
  };

  const primaryBooking = upcomingBookings[0] ?? null;
  const secondaryBookings = primaryBooking ? upcomingBookings.slice(1, 4) : upcomingBookings.slice(0, 3);
  const topSource = dataset.channels[0]?.label ?? '—';
  const compactWeekRows = [...weekTrendData].slice(-3).reverse();
  const compactTrendMetrics = [
    {
      label: locale === 'ru' ? 'Неделя' : 'Week',
      value: formatCurrency(weekRevenue, locale),
      hint:
        trendSummary && trendSummary.revenueDelta >= 0
          ? `+${trendSummary.revenueDelta}%`
          : `${trendSummary?.revenueDelta ?? 0}%`,
    },
    {
      label: locale === 'ru' ? 'Подтв.' : 'Conf.',
      value: String(trendSummary?.confirmed ?? 0),
      hint: `${trendSummary?.conversion ?? 0}%`,
    },
    {
      label: locale === 'ru' ? 'Источник' : 'Source',
      value: topSource,
      hint: `${trendSummary?.visitors ?? 0} ${locale === 'ru' ? 'визитов' : 'visits'}`,
    },
  ] as const;
  const trendMetricOptions = [
    { value: 'revenue', label: locale === 'ru' ? 'Доход' : 'Revenue' },
    { value: 'requests', label: locale === 'ru' ? 'Заявки' : 'Requests' },
    { value: 'visitors', label: locale === 'ru' ? 'Трафик' : 'Traffic' },
  ] as const;

  if (isMobile) {
    return (
      <WorkspaceShell>
        <div className="workspace-page workspace-page-overview dashboard-mobile-home space-y-3.5">
          <DashboardHeader
            badge={locale === 'ru' ? 'Рабочий обзор' : 'Workspace overview'}
            title={locale === 'ru' ? 'Главная' : 'Home'}
            description={
              locale === 'ru'
                ? 'Главное по дню и неделе.'
                : 'Nearest work, weekly pulse, and fast actions.'
            }
            actions={
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/today">
                    <CalendarClock className="size-4" />
                    {locale === 'ru' ? 'Сегодня' : 'Today'}
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/m/${ownedProfile.slug}`}>
                    <Globe2 className="size-4" />
                    {locale === 'ru' ? 'Страница' : 'Page'}
                  </Link>
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-2 gap-2.5">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <SectionCard
            title={locale === 'ru' ? 'Ближайшие записи' : 'Upcoming bookings'}
            description={
              locale === 'ru'
                ? 'Следующий визит и короткая очередь.'
                : 'Next visit first, then a short compact queue.'
            }
            actions={
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard/today">
                  {locale === 'ru' ? 'Все записи' : 'All bookings'}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
            className="dashboard-mobile-card"
          >
            {primaryBooking ? (
              <div className="dashboard-mobile-booking-feature">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="dashboard-mobile-kicker">
                      {locale === 'ru' ? 'Следующий визит' : 'Next visit'}
                    </div>
                    <div className="truncate text-[15px] font-semibold tracking-[-0.03em] text-foreground">
                      {primaryBooking.clientName}
                    </div>
                    <div className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      {primaryBooking.service}
                    </div>
                  </div>
                  <span className="workspace-pill whitespace-nowrap">
                    {bookingStatusLabel(primaryBooking.status)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="dashboard-mobile-meta-chip">
                    {formatBookingSlot(primaryBooking.date, primaryBooking.time)}
                  </div>
                  <div className="dashboard-mobile-meta-chip">
                    {primaryBooking.clientPhone}
                  </div>
                </div>

                {primaryBooking.comment ? (
                  <div className="mt-2 text-[11px] leading-5 text-muted-foreground line-clamp-2">
                    {primaryBooking.comment}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[14px] border border-dashed border-border/80 bg-accent/18 px-3 py-3 text-[11px] leading-5 text-muted-foreground">
                {locale === 'ru'
                  ? 'Пока нет записей. Можно открыть страницу и принять первую заявку.'
                  : 'No bookings yet. Open the page and collect the first request.'}
              </div>
            )}

            {secondaryBookings.length ? (
              <div className="mt-2.5 space-y-2">
                {secondaryBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="dashboard-mobile-list-row"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium text-foreground">
                        {booking.clientName}
                      </div>
                      <div className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                        {booking.service}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[11px] font-medium text-foreground">
                        {booking.time}
                      </div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatBookingSlot(booking.date, booking.time).split(' · ')[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/chats">
                  <MessageCircleMore className="size-4" />
                  {locale === 'ru' ? 'Чаты' : 'Chats'}
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/clients">
                  <Users2 className="size-4" />
                  {locale === 'ru' ? 'Клиенты' : 'Clients'}
                </Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title={locale === 'ru' ? 'Динамика недели' : 'Week pulse'}
            description={
              locale === 'ru'
                ? 'Короткая картина недели.'
                : 'A lighter weekly snapshot without a heavy analytics panel.'
            }
            actions={
              <div className="dashboard-mobile-trend-switch">
                {trendMetricOptions.map((item) => (
                  <Button
                    key={item.value}
                    type="button"
                    variant={trendMetric === item.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrendMetric(item.value)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            }
            className="dashboard-mobile-card"
          >
            <div className="grid grid-cols-3 gap-2">
              {compactTrendMetrics.map((item) => (
                <div key={item.label} className="dashboard-mobile-trend-card">
                  <div className="text-[10px] text-muted-foreground">{item.label}</div>
                  <div className="mt-1 truncate text-[13px] font-semibold tracking-[-0.03em] text-foreground">
                    {item.value}
                  </div>
                  <div className="mt-1 truncate text-[10px] text-muted-foreground">{item.hint}</div>
                </div>
              ))}
            </div>

            <div className="dashboard-mobile-chart-shell mt-2.5">
              <ChartContainer config={chartConfig} className="h-[176px] w-full">
                {trendMetric === 'revenue' ? (
                  <AreaChart data={weekTrendData}>
                    <defs>
                      <linearGradient id="dashboardWeekRevenueMobile" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
                    <YAxis tickLine={false} axisLine={false} width={30} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#dashboardWeekRevenueMobile)" strokeWidth={2.1} />
                  </AreaChart>
                ) : null}

                {trendMetric === 'requests' ? (
                  <BarChart data={weekTrendData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
                    <YAxis tickLine={false} axisLine={false} width={30} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="requests" fill="var(--color-requests)" radius={[8, 8, 4, 4]} maxBarSize={20} />
                  </BarChart>
                ) : null}

                {trendMetric === 'visitors' ? (
                  <LineChart data={weekTrendData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
                    <YAxis tickLine={false} axisLine={false} width={30} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2.1} dot={false} />
                  </LineChart>
                ) : null}
              </ChartContainer>
            </div>

            <div className="mt-2.5 space-y-2">
              {compactWeekRows.map((item) => (
                <div key={item.date} className="dashboard-mobile-list-row">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-foreground">{item.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.requests} {locale === 'ru' ? 'запр.' : 'req'} · {item.visitors} {locale === 'ru' ? 'виз.' : 'vis'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-medium text-foreground">{formatCurrency(item.revenue, locale)}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.confirmed} {locale === 'ru' ? 'подтв.' : 'conf.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="dashboard-mobile-action-card"
                >
                  <div className="flex size-8 items-center justify-center rounded-[12px] border border-border/80 bg-accent/28 text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-medium text-foreground">{item.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.href.includes('appearance')
                        ? locale === 'ru' ? 'Оформление' : 'Look & feel'
                        : item.href.includes('services')
                          ? locale === 'ru' ? 'Прайс и длительность' : 'Price and duration'
                          : item.href.includes('profile')
                            ? locale === 'ru' ? 'Контакты и био' : 'Contacts and bio'
                            : locale === 'ru' ? 'Работа с заявками' : 'Message flow'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <SectionCard
            title={locale === 'ru' ? 'Страница и конверсия' : 'Page and conversion'}
            description={
              locale === 'ru'
                ? 'Страница, конверсия и заявки.'
                : 'Public page health without a large hero block.'
            }
            className="dashboard-mobile-card"
          >
            <div className="space-y-2">
              {[
                { label: locale === 'ru' ? 'Публичная страница' : 'Public page', value: locale === 'ru' ? 'Активна' : 'Active' },
                { label: locale === 'ru' ? 'Конверсия' : 'Conversion', value: `${dataset.totals.conversion}%` },
                { label: locale === 'ru' ? 'Новые клиенты' : 'New clients', value: String(dataset.totals.newClients) },
                { label: locale === 'ru' ? 'Лучший источник' : 'Top source', value: topSource },
              ].map((item) => (
                <div key={item.label} className="dashboard-mobile-list-row">
                  <span className="text-[10.5px] text-muted-foreground">{item.label}</span>
                  <span className="max-w-[55%] truncate text-right text-[11px] font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/m/${ownedProfile.slug}`}>
                  <Globe2 className="size-4" />
                  {locale === 'ru' ? 'Открыть' : 'Open'}
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/appearance">
                  <Sparkles className="size-4" />
                  {locale === 'ru' ? 'Стиль' : 'Style'}
                </Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title={locale === 'ru' ? 'Услуги и клиенты' : 'Services and clients'}
            description={
              locale === 'ru'
                ? 'Услуги и важные клиенты.'
                : 'Fast view of what sells and who needs attention.'
            }
            className="dashboard-mobile-card"
          >
            <div className="space-y-2">
              {topServices.slice(0, 3).map((service, index) => (
                <div key={service.id} className="dashboard-mobile-list-row">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-foreground">
                      #{index + 1} · {service.name}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {service.bookings} {locale === 'ru' ? 'записей' : 'bookings'}
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-medium text-foreground">
                    {formatCurrency(service.revenue, locale)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2.5 space-y-2">
              {favoriteClients.slice(0, 3).map((client) => (
                <div key={client.id} className="dashboard-mobile-list-row">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-medium text-foreground">{client.name}</div>
                    <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{client.note}</div>
                  </div>
                  <span className="workspace-pill whitespace-nowrap">{client.segment}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </WorkspaceShell>
    );
  }


  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide workspace-page-overview space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Главная / обзор' : 'Overview / dashboard'}
          title={locale === 'ru' ? 'Кабинет мастера' : 'Master dashboard'}
          description={
            locale === 'ru'
              ? 'Главное по записи, неделе и странице.'
              : 'Upcoming bookings, revenue, conversion, quick actions, and public page status in one overview.'
          }
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/stats">
                  <TrendingUp className="size-4" />
                  {locale === 'ru' ? 'Статистика' : 'Statistics'}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/profile">
                  <SquarePen className="size-4" />
                  {locale === 'ru' ? 'Профиль' : 'Profile'}
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/m/${ownedProfile.slug}`}>
                  <Globe2 className="size-4" />
                  {locale === 'ru' ? 'Публичная страница' : 'Public page'}
                </Link>
              </Button>
            </>
          }
        />

        <div className={cn(isMobile ? "" : "lg:sticky lg:top-4 lg:z-20")}>
          <PublicPageHero profile={ownedProfile} alignTop />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.2fr)_400px]">
          <div className="space-y-5">
            <SectionCard
              title={locale === 'ru' ? 'Ближайшие записи' : 'Upcoming bookings'}
              description={
                locale === 'ru'
                  ? 'Ближайшие записи и очередь.'
                  : 'The nearest visits so the workday is visible right after sign-in.'
              }
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard/chats">
                    {locale === 'ru' ? 'Открыть чаты' : 'Open chats'}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              }
            >
              <div className="grid gap-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="grid gap-3 rounded-[18px] border border-border/80 bg-accent/25 p-4 md:grid-cols-[1fr_auto_auto]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold text-foreground">{booking.clientName}</div>
                      <div className="mt-1 text-[12px] text-muted-foreground">{booking.service}</div>
                    </div>
                    <div className="rounded-[12px] border border-border/80 bg-card/80 px-3 py-2 text-[12px] text-foreground">
                      {booking.date} · {booking.time}
                    </div>
                    <div className="rounded-[12px] border border-border/80 bg-card/80 px-3 py-2 text-[12px] text-muted-foreground">
                      {booking.status}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title={locale === 'ru' ? 'Динамика недели' : 'Week trend'}
              description={
                locale === 'ru'
                  ? 'Компактная недельная динамика.'
                  : 'A compact analytics block with a readable scale, metric switches, and a fast weekly snapshot.'
              }
              actions={
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'revenue', label: locale === 'ru' ? 'Доход' : 'Revenue' },
                    { value: 'requests', label: locale === 'ru' ? 'Запросы' : 'Requests' },
                    { value: 'visitors', label: locale === 'ru' ? 'Посетители' : 'Visitors' },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant={trendMetric === item.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrendMetric(item.value as TrendMetric)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              }
            >
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_320px]">
                <div className="rounded-[22px] border border-border/80 bg-card/72 p-3">
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    {trendMetric === 'revenue' ? (
                      <AreaChart data={weekTrendData}>
                        <defs>
                          <linearGradient id="dashboardWeekRevenue" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.24} />
                            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                        <YAxis tickLine={false} axisLine={false} width={36} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#dashboardWeekRevenue)" strokeWidth={2.4} />
                      </AreaChart>
                    ) : null}

                    {trendMetric === 'requests' ? (
                      <BarChart data={weekTrendData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                        <YAxis tickLine={false} axisLine={false} width={36} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="requests" fill="var(--color-requests)" radius={[12, 12, 4, 4]} maxBarSize={34} />
                      </BarChart>
                    ) : null}

                    {trendMetric === 'visitors' ? (
                      <LineChart data={weekTrendData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                        <YAxis tickLine={false} axisLine={false} width={36} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2.4} dot={false} />
                      </LineChart>
                    ) : null}
                  </ChartContainer>

                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    {[
                      {
                        label: locale === 'ru' ? 'Доход за 7 дней' : 'Revenue in 7 days',
                        value: formatCurrency(weekRevenue, locale),
                        hint:
                          trendSummary && trendSummary.revenueDelta >= 0
                            ? `+${trendSummary.revenueDelta}%`
                            : `${trendSummary?.revenueDelta ?? 0}%`,
                      },
                      {
                        label: locale === 'ru' ? 'Подтверждено' : 'Confirmed',
                        value: String(trendSummary?.confirmed ?? 0),
                        hint: `${trendSummary?.conversion ?? 0}% ${locale === 'ru' ? 'конверсия' : 'conversion'}`,
                      },
                      {
                        label: locale === 'ru' ? 'Средний чек' : 'Average check',
                        value: formatCurrency(dataset.totals.averageCheck, locale),
                        hint: `${trendSummary?.requests ?? 0} ${locale === 'ru' ? 'запросов' : 'requests'}`,
                      },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[18px] border border-border/80 bg-accent/22 p-4">
                        <div className="text-[11px] text-muted-foreground">{item.label}</div>
                        <div className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-foreground">{item.value}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">{item.hint}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-[20px] border border-border/80 bg-accent/18 p-4">
                    <div className="text-[14px] font-semibold text-foreground">
                      {locale === 'ru' ? 'Состояние страницы' : 'Page health'}
                    </div>
                    <div className="mt-3 space-y-3">
                      {[
                        {
                          label: locale === 'ru' ? 'Публичная ссылка' : 'Public link',
                          value: locale === 'ru' ? 'Активна' : 'Active',
                        },
                        {
                          label: locale === 'ru' ? 'Конверсия' : 'Conversion',
                          value: `${dataset.totals.conversion}%`,
                        },
                        {
                          label: locale === 'ru' ? 'Новые клиенты' : 'New clients',
                          value: String(dataset.totals.newClients),
                        },
                        {
                          label: locale === 'ru' ? 'Посетители за неделю' : 'Visitors this week',
                          value: String(trendSummary?.visitors ?? 0),
                        },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-[16px] border border-border/80 bg-card/80 px-4 py-3">
                          <span className="text-[12px] text-muted-foreground">{item.label}</span>
                          <span className="text-[13px] font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-border/80 bg-card/80 p-4">
                    <div className="text-[14px] font-semibold text-foreground">
                      {locale === 'ru' ? 'Последние дни' : 'Last days'}
                    </div>
                    <div className="mt-3 space-y-2">
                      {weekTrendData.slice(-4).map((item) => (
                        <div key={item.date} className="rounded-[16px] border border-border/80 bg-accent/25 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[12px] font-medium text-foreground">{item.label}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">
                                {item.requests} {locale === 'ru' ? 'запросов' : 'requests'} · {item.visitors} {locale === 'ru' ? 'визитов' : 'visits'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[13px] font-semibold text-foreground">{formatCurrency(item.revenue, locale)}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">{item.confirmed} {locale === 'ru' ? 'подтв.' : 'confirmed'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard
              title={locale === 'ru' ? 'Быстрые действия' : 'Quick actions'}
              description={
                locale === 'ru'
                  ? 'Основные разделы и действия.'
                  : 'Core settings and daily workflows without a long trip through the menu.'
              }
            >
              <div className="grid gap-3">
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-[18px] border border-border/80 bg-card/80 px-4 py-3 transition hover:bg-accent/35"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-[14px] border border-border/80 bg-accent/35 text-muted-foreground">
                          <Icon className="size-4" />
                        </div>
                        <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title={locale === 'ru' ? 'Популярные услуги' : 'Top services'}
              description={
                locale === 'ru'
                  ? 'Популярные услуги и выручка.'
                  : 'What clients choose most and where the revenue comes from.'
              }
            >
              <div className="space-y-3">
                {topServices.map((service, index) => (
                  <div
                    key={service.id}
                    className="rounded-[18px] border border-border/80 bg-accent/25 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="chip-muted">#{index + 1}</span>
                          <div className="truncate text-[13px] font-semibold text-foreground">{service.name}</div>
                        </div>
                        <div className="mt-2 text-[12px] text-muted-foreground">
                          {service.bookings} {locale === 'ru' ? 'записей' : 'bookings'} · {service.duration} мин
                        </div>
                      </div>
                      <div className="text-right text-[13px] font-semibold text-foreground">
                        {formatCurrency(service.revenue, locale)}
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, service.popularity)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title={locale === 'ru' ? 'VIP и заметки' : 'VIP and notes'}
              description={
                locale === 'ru'
                  ? 'Постоянные клиенты и заметки.'
                  : 'Repeat clients and context worth remembering before the visit.'
              }
            >
              <div className="space-y-3">
                {favoriteClients.map((client) => (
                  <div
                    key={client.id}
                    className={cn(
                      'rounded-[18px] border border-border/80 bg-card/80 p-4',
                      client.favorite && 'shadow-[var(--shadow-soft)]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">{client.name}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {client.visits} {locale === 'ru' ? 'визитов' : 'visits'} · {formatCurrency(client.averageCheck, locale)}
                        </div>
                      </div>
                      <span className="chip-muted">{client.segment}</span>
                    </div>
                    <p className="mt-3 text-[12px] leading-6 text-muted-foreground">{client.note}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
