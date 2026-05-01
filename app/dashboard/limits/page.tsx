'use client';

import Link from 'next/link';
import { Activity, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useBillingStatus } from '@/hooks/use-billing-status';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

function formatTotal(value: number, locale: 'ru' | 'en') {
  if (value >= 9999) return locale === 'ru' ? '∞' : '∞';
  return String(value);
}

export default function LimitsPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const billing = useBillingStatus();
  const isMobile = useMobile();

  if (!hasHydrated) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <div className="workspace-page dashboard-mobile-limits space-y-4 md:space-y-5">
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

  const billingLimits = billing.data?.limits ?? [];
  const planName = billing.data?.plan.name ?? 'Start';
  const statusLabel = billing.statusLabel;
  const warningCount = billingLimits.filter((item) => item.warning).length;
  const lockedCount = billingLimits.filter((item) => item.locked).length;
  const trackedCount = billingLimits.length || dataset.limits.length;

  return (
    <WorkspaceShell>
      <div className="workspace-page dashboard-mobile-limits space-y-4 md:space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Тариф / лимиты' : 'Plan / limits'}
          title={locale === 'ru' ? 'Лимиты' : 'Limits'}
          description={
            isMobile
              ? locale === 'ru'
                ? 'Реальное использование тарифа.'
                : 'Real plan usage.'
              : locale === 'ru'
                ? 'Текущий тариф берётся из подписки рабочего пространства. Лимиты считаются по активным услугам, клиентам и записям за месяц.'
                : 'The current plan is read from the workspace subscription. Limits are calculated from active services, clients, and monthly bookings.'
          }
          actions={
            <Button asChild className="h-8 rounded-[9px] cb-neutral-primary">
              <Link href="/dashboard/subscription">
                <ShieldCheck className="size-3.5" />
                {locale === 'ru' ? 'Подписка' : 'Subscription'}
              </Link>
            </Button>
          }
        />

        <div className="dashboard-kpi-grid grid grid-cols-2 gap-3">
          <MetricCard label={locale === 'ru' ? 'Текущий тариф' : 'Current plan'} value={planName} hint={statusLabel} icon={ShieldCheck} />
          <MetricCard label={locale === 'ru' ? 'Лимитов отслеживается' : 'Tracked limits'} value={String(trackedCount)} icon={Gauge} />
          <MetricCard label={locale === 'ru' ? 'Под контролем' : 'Need attention'} value={String(warningCount)} hint={locale === 'ru' ? 'выше 75%' : 'above 75%'} icon={Activity} />
          <MetricCard label={locale === 'ru' ? 'Закрыто тарифом' : 'Locked by plan'} value={String(lockedCount)} hint={locale === 'ru' ? 'можно открыть на Pro' : 'unlock on Pro'} icon={Sparkles} />
        </div>

        <SectionCard
          title={locale === 'ru' ? 'Использование лимитов' : 'Limit usage'}
          description={
            locale === 'ru'
              ? 'Если лимит закрыт или заполнен, кнопка подписки ведёт на тарифы. После оплаты статус подтянется из таблицы подписок.'
              : 'If a limit is locked or nearly full, use Subscription to upgrade. After payment, status is read from the subscriptions table.'
          }
        >
          {billing.loading ? (
            <div className="rounded-[11px] border border-black/[0.08] bg-black/[0.025] p-4 text-[12px] text-black/48 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/42">
              {locale === 'ru' ? 'Проверяем подписку и лимиты…' : 'Checking subscription and limits…'}
            </div>
          ) : billingLimits.length > 0 ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {billingLimits.map((item) => {
                const label = locale === 'ru' ? item.labelRu : item.labelEn;
                const locked = item.locked;
                const progress = item.total >= 9999 ? 12 : item.percent;

                return (
                  <div key={item.id} className="rounded-[11px] border border-black/[0.08] bg-black/[0.018] p-4 dark:border-white/[0.08] dark:bg-white/[0.035]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[#0e0e0e] dark:text-white">{label}</div>
                        <div className="mt-1 text-[11px] text-black/42 dark:text-white/34">
                          {locked
                            ? locale === 'ru' ? 'Недоступно на текущем тарифе' : 'Not available on current plan'
                            : item.warning
                              ? locale === 'ru' ? 'Скоро понадобится апгрейд' : 'Upgrade may be needed soon'
                              : locale === 'ru' ? 'Запас комфортный' : 'Healthy remaining headroom'}
                        </div>
                      </div>

                      <div className="shrink-0 text-right text-[12px] font-semibold text-black/62 dark:text-white/58">
                        {item.used}/{formatTotal(item.total, locale)}
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          locked ? 'bg-black/22 dark:bg-white/18' : 'bg-black/72 dark:bg-white/72',
                        )}
                        style={{ width: `${Math.max(locked ? 4 : 8, Math.min(100, progress))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[11px] border border-black/[0.08] bg-black/[0.025] p-4 text-[12px] text-black/48 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/42">
              {locale === 'ru' ? 'Лимиты пока не загружены.' : 'Limits are not loaded yet.'}
            </div>
          )}
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
