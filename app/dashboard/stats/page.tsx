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
import { Globe2, LayoutDashboard, Sparkles, SquarePen } from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, PublicPageHero, SectionCard } from '@/components/dashboard/workspace-ui';
import { BookingsList } from '@/components/booking/bookings-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { getDashboardDemoAnalyticsFeed, getDashboardDemoAnalyticsHighlights } from '@/lib/demo-data';
import { formatCurrency } from '@/lib/master-workspace';

type MetricView = 'revenue' | 'bookings' | 'visitors' | 'conversion';

export default function DashboardPage() {
  const { hasHydrated, ownedProfile, bookings, dataset, locale, demoMode } = useOwnedWorkspaceData();
  const [metricView, setMetricView] = useState<MetricView>('revenue');
  const [analyticsView, setAnalyticsView] = useState<MetricView>('bookings');

  const chartData = useMemo(() => {
    if (!dataset) return [];

    return dataset.daily.map((item) => ({
      ...item,
      conversion: Number(((item.confirmed / Math.max(1, item.visitors)) * 100).toFixed(1)),
    }));
  }, [dataset]);

  const demoHighlights = useMemo(
    () => (demoMode ? getDashboardDemoAnalyticsHighlights(locale) : []),
    [demoMode, locale],
  );
  const demoFeed = useMemo(
    () => (demoMode ? getDashboardDemoAnalyticsFeed(locale) : []),
    [demoMode, locale],
  );

  if (!hasHydrated) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <div className="workspace-page">
          <div className="workspace-card rounded-[18px] p-8 text-center">
            <div className="text-[18px] font-semibold text-foreground">
              {locale === 'ru' ? 'Сначала создайте профиль мастера' : 'Create a master profile first'}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/create-profile">{locale === 'ru' ? 'Создать профиль' : 'Create profile'}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/create-profile">{locale === 'ru' ? 'Открыть конструктор' : 'Open builder'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  const topServices = dataset.services.slice(0, 5);
  const topChannels = dataset.channels.slice(0, 5);
  const kpis = [
    {
      label: locale === 'ru' ? 'Записи за 30 дней' : 'Bookings in 30 days',
      value: String(dataset.totals.bookings),
      hint: locale === 'ru' ? `${dataset.totals.confirmed} подтверждено` : `${dataset.totals.confirmed} confirmed`,
    },
    {
      label: locale === 'ru' ? 'Доход за 30 дней' : 'Revenue in 30 days',
      value: formatCurrency(dataset.daily.reduce((total, item) => total + item.revenue, 0), locale),
      hint: locale === 'ru' ? `средний чек ${formatCurrency(dataset.totals.averageCheck, locale)}` : `avg check ${formatCurrency(dataset.totals.averageCheck, locale)}`,
    },
    {
      label: locale === 'ru' ? 'Просмотры страницы' : 'Page visits',
      value: String(dataset.totals.visitors),
      hint: `${dataset.totals.conversion}% ${locale === 'ru' ? 'конверсия' : 'conversion'}`,
    },
    {
      label: locale === 'ru' ? 'Новые клиенты' : 'New clients',
      value: String(dataset.totals.newClients),
      hint: `${dataset.totals.returnRate}% ${locale === 'ru' ? 'возвратных' : 'returning'}`,
    },
  ] as const;

  const metricConfig = {
    revenue: { label: locale === 'ru' ? 'Доход' : 'Revenue', color: 'var(--chart-1)' },
    confirmed: { label: locale === 'ru' ? 'Подтверждения' : 'Confirmed', color: 'var(--chart-2)' },
    visitors: { label: locale === 'ru' ? 'Посетители' : 'Visitors', color: 'var(--chart-3)' },
    conversion: { label: locale === 'ru' ? 'Конверсия' : 'Conversion', color: 'var(--chart-4)' },
  };

  return (
    <WorkspaceShell>
      <div className="workspace-page space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Analytics / statistics' : 'Analytics / statistics'}
          title={locale === 'ru' ? 'Статистика мастера' : 'Master analytics'}
          description={
            locale === 'ru'
              ? 'Глубокий аналитический экран с 30-дневной динамикой, ключевыми KPI, крупными графиками и зрелой таблицей по услугам и источникам.'
              : 'A deeper analytics screen with a 30-day dynamic, key KPIs, larger charts, and a mature table for services and sources.'
          }
          actions={
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/profile">
                  <SquarePen className="size-4" />
                  {locale === 'ru' ? 'Профиль' : 'Profile'}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href={demoMode ? `/demo/${ownedProfile.slug}` : `/m/${ownedProfile.slug}`}>
                  <Globe2 className="size-4" />
                  {locale === 'ru' ? 'Публичная страница' : 'Public page'}
                </Link>
              </Button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item, index) => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              hint={item.hint}
              icon={[LayoutDashboard, Globe2, SquarePen, LayoutDashboard][index]}
            />
          ))}
        </div>

        {demoMode ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="workspace-card rounded-[22px] p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-card/78">
                  <Sparkles className="size-3.5" />
                  {locale === 'ru' ? 'Demo analytics' : 'Demo analytics'}
                </Badge>
                <div className="text-[12px] text-muted-foreground">
                  {locale === 'ru'
                    ? 'Ниже — готовые моковые подсказки, чтобы клиент быстро понял ценность аналитики.'
                    : 'Below are ready-made mock cues so the client quickly understands the analytics value.'}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {demoHighlights.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-border bg-accent/28 p-4">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</div>
                    <div className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-foreground">{item.value}</div>
                    <div className="mt-2 text-[12px] leading-5 text-muted-foreground">{item.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="workspace-card rounded-[22px] p-4">
              <div className="text-[14px] font-semibold text-foreground">
                {locale === 'ru' ? 'Лента demo-сигналов' : 'Demo signal feed'}
              </div>
              <div className="mt-3 space-y-2">
                {demoFeed.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-[16px] border border-border bg-accent/24 px-3.5 py-3 text-[12px] leading-5 text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        <SectionCard
          title={locale === 'ru' ? 'Активность за 30 дней' : '30-day activity'}
          description={
            locale === 'ru'
              ? 'Вместо годовой heatmap — понятная динамика по дням: просмотры страницы, заявки, подтверждения и доход.'
              : 'Instead of a yearly heatmap, a clearer day-by-day view of page visits, requests, confirmations, and revenue.'
          }
          actions={
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'revenue', label: locale === 'ru' ? 'Доход' : 'Revenue' },
                { value: 'bookings', label: locale === 'ru' ? 'Записи' : 'Bookings' },
                { value: 'visitors', label: locale === 'ru' ? 'Посетители' : 'Visitors' },
                { value: 'conversion', label: locale === 'ru' ? 'Конверсия' : 'Conversion' },
              ].map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={metricView === item.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMetricView(item.value as MetricView)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px]">
            <div className="rounded-[18px] border border-border bg-accent/20 p-3">
              <ChartContainer config={metricConfig} className="h-[320px] w-full">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="metricArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                  <YAxis tickLine={false} axisLine={false} width={36} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {metricView === 'revenue' ? (
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#metricArea)" strokeWidth={2.2} />
                  ) : null}
                  {metricView === 'bookings' ? (
                    <Bar dataKey="confirmed" fill="var(--color-confirmed)" radius={[10, 10, 4, 4]} maxBarSize={24} />
                  ) : null}
                  {metricView === 'visitors' ? (
                    <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2.2} dot={false} />
                  ) : null}
                  {metricView === 'conversion' ? (
                    <Line type="monotone" dataKey="conversion" stroke="var(--color-conversion)" strokeWidth={2.2} dot={false} />
                  ) : null}
                </AreaChart>
              </ChartContainer>
            </div>

            <div className="grid gap-3">
              {[
                { label: locale === 'ru' ? 'Заявки за неделю' : 'Requests this week', value: dataset.daily.slice(-7).reduce((total, item) => total + item.requests, 0) },
                { label: locale === 'ru' ? 'Подтверждения за неделю' : 'Confirmed this week', value: dataset.daily.slice(-7).reduce((total, item) => total + item.confirmed, 0) },
                { label: locale === 'ru' ? 'Доход за неделю' : 'Revenue this week', value: formatCurrency(dataset.daily.slice(-7).reduce((total, item) => total + item.revenue, 0), locale) },
                { label: locale === 'ru' ? 'Новые клиенты' : 'New clients', value: dataset.daily.slice(-7).reduce((total, item) => total + item.newClients, 0) },
              ].map((item) => (
                <div key={item.label} className="rounded-[16px] border border-border bg-accent/30 p-4">
                  <div className="text-[11px] text-muted-foreground">{item.label}</div>
                  <div className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-foreground">{item.value}</div>
                </div>
              ))}

              <div className="rounded-[16px] border border-border bg-card p-4">
                <div className="text-[13px] font-medium text-foreground">{locale === 'ru' ? 'Срез по популярности' : 'Popularity snapshot'}</div>
                <div className="mt-3 grid gap-2">
                  {topServices.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex items-center justify-between rounded-[12px] bg-accent/40 px-3 py-2 text-[12px]">
                      <span className="truncate text-foreground">{service.name}</span>
                      <Badge variant="outline">{service.popularity}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={locale === 'ru' ? 'Большая аналитика по мастерскому потоку' : 'Expanded analytics for the master flow'}
          description={
            locale === 'ru'
              ? 'Верхний фильтр периода, переключатели метрик, крупный график и таблицы по услугам и каналам — зрелая секция в духе LobeHub, но полностью под записи клиентов.'
              : 'A mature section with period filters, metric switches, a larger chart, and tables for services and sources.'
          }
          actions={
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'bookings', label: locale === 'ru' ? 'Записи' : 'Bookings' },
                { value: 'revenue', label: locale === 'ru' ? 'Доход' : 'Revenue' },
                { value: 'visitors', label: locale === 'ru' ? 'Посетители' : 'Visitors' },
                { value: 'conversion', label: locale === 'ru' ? 'Конверсия' : 'Conversion' },
              ].map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={analyticsView === item.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAnalyticsView(item.value as MetricView)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          }
        >
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: locale === 'ru' ? 'Средний чек' : 'Average check', value: formatCurrency(dataset.totals.averageCheck, locale) },
                  { label: locale === 'ru' ? 'Конверсия' : 'Conversion', value: `${dataset.totals.conversion}%` },
                  { label: locale === 'ru' ? 'Возвратные клиенты' : 'Returning clients', value: `${dataset.totals.returnRate}%` },
                  { label: locale === 'ru' ? 'Отмены' : 'Cancellations', value: String(dataset.totals.cancelled) },
                ].map((item) => (
                  <div key={item.label} className="rounded-[16px] border border-border bg-accent/30 p-4">
                    <div className="text-[11px] text-muted-foreground">{item.label}</div>
                    <div className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-[18px] border border-border bg-accent/20 p-3">
                <ChartContainer config={metricConfig} className="h-[360px] w-full">
                  {analyticsView === 'bookings' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                      <YAxis tickLine={false} axisLine={false} width={36} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="requests" fill="var(--color-confirmed)" radius={[10, 10, 4, 4]} />
                    </BarChart>
                  ) : null}
                  {analyticsView === 'revenue' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                      <YAxis tickLine={false} axisLine={false} width={36} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2.4} dot={false} />
                    </LineChart>
                  ) : null}
                  {analyticsView === 'visitors' ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="visitorsArea" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.22} />
                          <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                      <YAxis tickLine={false} axisLine={false} width={36} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="visitors" stroke="var(--color-visitors)" fill="url(#visitorsArea)" strokeWidth={2.2} />
                    </AreaChart>
                  ) : null}
                  {analyticsView === 'conversion' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                      <YAxis tickLine={false} axisLine={false} width={36} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="conversion" stroke="var(--color-conversion)" strokeWidth={2.4} dot={false} />
                    </LineChart>
                  ) : null}
                </ChartContainer>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[18px] border border-border bg-card p-4">
                  <div className="text-[14px] font-semibold text-foreground">{locale === 'ru' ? 'Источники клиентов' : 'Client sources'}</div>
                  <div className="mt-3 space-y-2">
                    {topChannels.map((channel) => (
                      <div key={channel.id} className="rounded-[14px] bg-accent/40 px-3.5 py-3">
                        <div className="flex items-center justify-between gap-3 text-[12px]">
                          <span className="text-foreground">{channel.label}</span>
                          <Badge variant="outline">{channel.conversion}%</Badge>
                        </div>
                        <div className="mt-1 text-[12px] text-muted-foreground">
                          {channel.visitors} {locale === 'ru' ? 'переходов' : 'visits'} · {channel.bookings} {locale === 'ru' ? 'записей' : 'bookings'} · {formatCurrency(channel.revenue, locale)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[18px] border border-border bg-card p-4">
                  <div className="text-[14px] font-semibold text-foreground">{locale === 'ru' ? 'Пиковые часы' : 'Peak hours'}</div>
                  <div className="mt-3 grid gap-2">
                    {dataset.peakHours.slice(0, 5).map((item) => (
                      <div key={item.hour} className="flex items-center justify-between rounded-[12px] bg-accent/40 px-3 py-2 text-[12px]">
                        <span className="text-foreground">{item.hour}</span>
                        <span className="text-muted-foreground">
                          {item.bookings} {locale === 'ru' ? 'записей' : 'bookings'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[18px] border border-border bg-card p-4">
                <div className="text-[14px] font-semibold text-foreground">{locale === 'ru' ? 'Топ услуг' : 'Top services'}</div>
                <div className="mt-3 space-y-2">
                  {topServices.map((service, index) => (
                    <div key={service.id} className="flex items-center justify-between gap-3 rounded-[14px] bg-accent/40 px-3.5 py-3 text-[12px]">
                      <div className="min-w-0">
                        <div className="truncate text-foreground">{index + 1}. {service.name}</div>
                        <div className="mt-1 text-muted-foreground">
                          {service.bookings} {locale === 'ru' ? 'записей' : 'bookings'} · {formatCurrency(service.revenue, locale)}
                        </div>
                      </div>
                      <Badge variant="outline">{service.popularity}%</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[18px] border border-border bg-card p-4">
                <div className="text-[14px] font-semibold text-foreground">{locale === 'ru' ? 'Лучший канал' : 'Best source'}</div>
                {topChannels[0] ? (
                  <div className="mt-3 rounded-[16px] bg-accent/40 p-4">
                    <div className="text-[12px] text-muted-foreground">
                      {locale === 'ru' ? 'Наиболее эффективный канал за период' : 'Most efficient source for the period'}
                    </div>
                    <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-foreground">{topChannels[0].label}</div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {topChannels[0].visitors} {locale === 'ru' ? 'переходов' : 'visits'} · {topChannels[0].bookings} {locale === 'ru' ? 'записей' : 'bookings'}
                    </div>
                    <div className="mt-3 inline-flex items-center rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground">
                      {locale === 'ru' ? 'Конверсия' : 'Conversion'} · {topChannels[0].conversion}%
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </SectionCard>

        <BookingsList
          title={locale === 'ru' ? 'Журнал бронирований' : 'Booking journal'}
          description={
            locale === 'ru'
              ? 'Все заявки, статусы и примечания собраны в плотной таблице без визуального шума.'
              : 'All requests, statuses, and notes sit in one dense table.'
          }
          bookings={bookings}
        />
      </div>
    </WorkspaceShell>
  );
}
