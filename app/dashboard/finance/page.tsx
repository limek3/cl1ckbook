'use client';

import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Download, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/master-workspace';

export default function FinancePage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();

  if (!hasHydrated) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <div className="workspace-page">
          <div className="workspace-card rounded-[18px] p-8 text-center">
            <div className="text-[18px] font-semibold text-foreground">
              {locale === 'ru' ? 'Сначала настройте профиль мастера' : 'Create the master profile first'}
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link href="/create-profile">{locale === 'ru' ? 'Создать профиль' : 'Create profile'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  const dayRevenue = dataset.daily.slice(-1)[0]?.revenue ?? 0;
  const weekRevenue = dataset.daily.slice(-7).reduce((total, item) => total + item.revenue, 0);
  const monthRevenue = dataset.daily.reduce((total, item) => total + item.revenue, 0);
  const lostRevenue = dataset.totals.cancelled * dataset.totals.averageCheck;

  return (
    <WorkspaceShell>
      <div className="workspace-page space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Аналитика / финансы' : 'Analytics / finance'}
          title={locale === 'ru' ? 'Доход и финансы' : 'Revenue and finance'}
          description={
            locale === 'ru'
              ? 'Доход по дням, оплаченные записи, средний чек, потери на отменах и экспорт.'
              : 'Revenue by day, paid bookings, average check, lost revenue from cancellations, and export.'
          }
          actions={
            <Button size="sm">
              <Download className="size-4" />
              {locale === 'ru' ? 'Экспорт' : 'Export'}
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={locale === 'ru' ? 'Доход за день' : 'Revenue today'} value={formatCurrency(dayRevenue, locale)} icon={Wallet} />
          <MetricCard label={locale === 'ru' ? 'Доход за неделю' : 'Revenue this week'} value={formatCurrency(weekRevenue, locale)} icon={TrendingUp} />
          <MetricCard label={locale === 'ru' ? 'Доход за месяц' : 'Revenue this month'} value={formatCurrency(monthRevenue, locale)} icon={Receipt} />
          <MetricCard label={locale === 'ru' ? 'Потери на отменах' : 'Lost to cancellations'} value={formatCurrency(lostRevenue, locale)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
          <SectionCard
            title={locale === 'ru' ? 'Динамика дохода' : 'Revenue dynamic'}
            description={
              locale === 'ru'
                ? 'Подтверждённые и завершённые визиты, свёрнутые в 30-дневный график.'
                : 'Confirmed and completed visits collapsed into a 30-day curve.'
            }
          >
            <div className="rounded-[18px] border border-border bg-accent/20 p-3">
              <ChartContainer config={{ revenue: { label: 'Revenue', color: 'var(--chart-1)' } }} className="h-[320px] w-full">
                <AreaChart data={dataset.daily}>
                  <defs>
                    <linearGradient id="financeArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#financeArea)" strokeWidth={2.2} />
                </AreaChart>
              </ChartContainer>
            </div>
          </SectionCard>

          <SectionCard
            title={locale === 'ru' ? 'Финансовый срез' : 'Financial snapshot'}
            description={
              locale === 'ru'
                ? 'Ключевые цифры по оплатам и услугам.'
                : 'Key numbers for payments and services.'
            }
          >
            <div className="grid gap-3">
              {[
                { label: locale === 'ru' ? 'Оплаченные записи' : 'Paid bookings', value: dataset.totals.confirmed + dataset.totals.completed },
                { label: locale === 'ru' ? 'Средний чек' : 'Average check', value: formatCurrency(dataset.totals.averageCheck, locale) },
                { label: locale === 'ru' ? 'Топ-услуга по доходу' : 'Top service by revenue', value: dataset.services[0]?.name ?? '—' },
                { label: locale === 'ru' ? 'Лучший канал' : 'Top source', value: dataset.channels[0]?.label ?? '—' },
              ].map((item) => (
                <div key={item.label} className="rounded-[16px] border border-border bg-accent/30 p-4">
                  <div className="text-[11px] text-muted-foreground">{item.label}</div>
                  <div className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-foreground">{item.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </WorkspaceShell>
  );
}
