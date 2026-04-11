'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Check, CreditCard, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/master-workspace';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

type BillingCycle = 'monthly' | 'yearly';

export default function SubscriptionPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const isMobile = useMobile();
  const [billing, setBilling] = useState<BillingCycle>('monthly');

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

  const currentPlan = dataset.plans.find((plan) => plan.id === 'pro') ?? dataset.plans[0];
  const yearlySavings = Math.max(0, currentPlan.monthly * 12 - currentPlan.yearly);

  const labels = locale === 'ru'
    ? {
        badge: 'Billing / subscription',
        title: 'Подписка и тарифы',
        description: 'Тариф, оплата и лимиты.',
        heroBadge: 'Премиальный доступ',
        heroTitle: 'Управляйте тарифом без лишних шагов',
        heroDescription: 'Текущий тариф и лимиты.',
        monthly: 'Ежемесячно',
        yearly: 'Годовая оплата',
        yearlyBadge: '−2 месяца',
        yearlyHint: 'Годовой платёж выгоднее и не прерывает рабочий поток.',
        nextCharge: 'Следующее списание',
        billingLabel: 'Оплата',
        currentPlanLabel: 'Текущий тариф',
        included: 'Включено сейчас',
        choosePlan: 'Выбрать тариф',
        currentPlanAction: 'Текущий тариф',
        activePlan: 'Активный план',
        activeLimits: 'Активные лимиты',
        subscriptionStatus: 'Статус подписки',
        active: 'Активна',
        planShowcase: 'Линейка тарифов',
        planShowcaseDesc: 'Тарифы для записи и роста.',
        currentPlanSection: 'Текущий план',
        currentPlanDesc: 'Оплата, лимиты и выгода.',
        limitsDesc: 'Текущее использование лимитов.',
        billingSaved: `Экономия ${formatCurrency(yearlySavings, locale)} в год`,
      }
    : {
        badge: 'Billing / subscription',
        title: 'Subscription and plans',
        description: 'Choose a billing mode, monitor the active plan, and keep the live limits under control.',
        heroBadge: 'Premium access',
        heroTitle: 'Manage the plan without friction',
        heroDescription: 'The active plan, payment method, yearly savings, and the important limits stay in one sticky hero block.',
        monthly: 'Monthly',
        yearly: 'Yearly',
        yearlyBadge: '−2 months',
        yearlyHint: 'Yearly billing is cheaper and keeps the workflow uninterrupted.',
        nextCharge: 'Next charge',
        billingLabel: 'Billing',
        currentPlanLabel: 'Current plan',
        included: 'Included now',
        choosePlan: 'Choose plan',
        currentPlanAction: 'Current plan',
        activePlan: 'Active plan',
        activeLimits: 'Active limits',
        subscriptionStatus: 'Subscription status',
        active: 'Active',
        planShowcase: 'Plan lineup',
        planShowcaseDesc: 'Plans for bookings, analytics, public-page customization, and growing demand.',
        currentPlanSection: 'Current plan',
        currentPlanDesc: 'Core billing summary, limits, and current plan benefits.',
        limitsDesc: 'Current plan usage inside the live workflow.',
        billingSaved: `Save ${formatCurrency(yearlySavings, locale)} per year`,
      };

  const heroPrice = billing === 'monthly' ? currentPlan.monthly : currentPlan.yearly;
  const includedFeatures = useMemo(() => currentPlan.features.slice(0, 4), [currentPlan.features]);

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-subscription space-y-5">
        <DashboardHeader
          badge={labels.badge}
          title={labels.title}
          description={labels.description}
        />

        <div className={cn(isMobile ? "" : "xl:sticky xl:top-4 xl:z-20")}>
          <section className="workspace-card hero-grid accent-gradient overflow-hidden rounded-[26px] p-4 md:p-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_408px] xl:items-start">
              <div className="space-y-4">
                <Badge variant="outline" className="bg-card/82 backdrop-blur">
                  <Sparkles className="size-3.5" />
                  {labels.heroBadge}
                </Badge>

                <div>
                  <h2 className="text-[28px] font-semibold tracking-[-0.05em] text-foreground md:text-[34px]">
                    {labels.heroTitle}
                  </h2>
                  <p className="mt-2.5 max-w-[760px] text-[14px] leading-7 text-muted-foreground">
                    {labels.heroDescription}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[16px] border border-border/80 bg-card/78 px-4 py-3 backdrop-blur">
                    <div className="text-[11px] text-muted-foreground">{labels.currentPlanLabel}</div>
                    <div className="mt-1.5 text-[15px] font-semibold text-foreground">{currentPlan.name}</div>
                  </div>
                  <div className="rounded-[16px] border border-border/80 bg-card/78 px-4 py-3 backdrop-blur">
                    <div className="text-[11px] text-muted-foreground">{labels.nextCharge}</div>
                    <div className="mt-1.5 text-[15px] font-semibold text-foreground">2026-05-01</div>
                  </div>
                  <div className="rounded-[16px] border border-border/80 bg-card/78 px-4 py-3 backdrop-blur">
                    <div className="text-[11px] text-muted-foreground">{labels.subscriptionStatus}</div>
                    <div className="mt-1.5 text-[15px] font-semibold text-foreground">{labels.active}</div>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {includedFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 rounded-[15px] border border-border/80 bg-card/72 px-3.5 py-3 text-[13px] text-foreground">
                      <Check className="mt-0.5 size-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="workspace-card rounded-[24px] border border-border/80 bg-background/92 p-4 shadow-[var(--shadow-card)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">{labels.billingLabel}</div>
                    <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-foreground">
                      {heroPrice === 0 ? (locale === 'ru' ? 'Бесплатно' : 'Free') : formatCurrency(heroPrice, locale)}
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {billing === 'monthly'
                        ? locale === 'ru' ? 'за месяц' : 'per month'
                        : locale === 'ru' ? 'за год' : 'per year'}
                    </div>
                  </div>

                  <div className="flex size-11 items-center justify-center rounded-[16px] border border-border/80 bg-accent/24 text-primary">
                    <WalletCards className="size-5" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBilling('monthly')}
                    className={cn(
                      'min-h-[104px] rounded-[18px] border px-4 py-3 text-left transition',
                      billing === 'monthly'
                        ? 'border-primary/24 bg-card text-foreground shadow-[var(--shadow-soft)]'
                        : 'border-border/65 bg-background/70 text-muted-foreground hover:border-border hover:bg-accent/14 hover:text-foreground',
                    )}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="text-[15px] font-semibold">{labels.monthly}</div>
                      <div className="text-[11px] leading-5 text-muted-foreground">
                        {locale === 'ru' ? 'Оплата каждый месяц' : 'Pay every month'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBilling('yearly')}
                    className={cn(
                      'min-h-[104px] rounded-[18px] border px-4 py-3 text-left transition',
                      billing === 'yearly'
                        ? 'border-primary/24 bg-card text-foreground shadow-[var(--shadow-soft)]'
                        : 'border-border/65 bg-background/70 text-muted-foreground hover:border-border hover:bg-accent/14 hover:text-foreground',
                    )}
                  >
                    <div className="flex h-full flex-col justify-between items-start">
                      <span className="inline-flex rounded-[999px] border border-primary/18 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold leading-none text-primary">
                        {labels.yearlyBadge}
                      </span>
                      <div>
                        <div className="text-[15px] font-semibold">{labels.yearly}</div>
                        <div className="mt-1 text-[11px] leading-5 text-muted-foreground">
                          {locale === 'ru' ? 'Один платёж на год' : 'One payment for the year'}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-4 rounded-[18px] border border-border/80 bg-accent/16 px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 items-center justify-center rounded-[12px] border border-border/80 bg-background/78 text-primary">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{labels.billingSaved}</div>
                      <div className="mt-1 text-[12px] leading-6 text-muted-foreground">{labels.yearlyHint}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[16px] border border-border/80 bg-background/72 px-4 py-3">
                    <div className="text-[11px] text-muted-foreground">{labels.nextCharge}</div>
                    <div className="mt-1.5 text-[13px] font-semibold text-foreground">2026-05-01</div>
                  </div>
                  <div className="rounded-[16px] border border-border/80 bg-background/72 px-4 py-3">
                    <div className="text-[11px] text-muted-foreground">{labels.billingLabel}</div>
                    <div className="mt-1.5 text-[13px] font-semibold text-foreground">Visa •••• 3142</div>
                  </div>
                </div>

                <Button type="button" className="mt-4 h-11 w-full rounded-[16px]">
                  {labels.choosePlan}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={labels.currentPlanLabel} value={currentPlan.name} icon={CreditCard} />
          <MetricCard label={labels.nextCharge} value="2026-05-01" icon={ShieldCheck} />
          <MetricCard label={labels.subscriptionStatus} value={labels.active} icon={Sparkles} />
          <MetricCard label={labels.activeLimits} value={String(dataset.limits.length)} />
        </div>

        <SectionCard
          title={labels.planShowcase}
          description={labels.planShowcaseDesc}
        >
          <div className="grid gap-3 xl:grid-cols-4">
            {dataset.plans.map((plan) => {
              const price = billing === 'monthly' ? plan.monthly : plan.yearly;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'workspace-card rounded-[22px] p-4',
                    plan.popular && 'border-primary/30 bg-accent/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[18px] font-semibold tracking-[-0.03em] text-foreground">{plan.name}</div>
                      <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{plan.description}</div>
                    </div>
                    {plan.popular ? <Badge>{locale === 'ru' ? 'Популярный' : 'Popular'}</Badge> : null}
                  </div>

                  <div className="mt-5">
                    <div className="text-[30px] font-semibold tracking-[-0.04em] text-foreground">
                      {price === 0 ? (locale === 'ru' ? 'Бесплатно' : 'Free') : formatCurrency(price, locale)}
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {billing === 'monthly'
                        ? locale === 'ru' ? 'в месяц' : 'per month'
                        : locale === 'ru' ? 'в год' : 'per year'}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-[13px] text-foreground">
                        <Check className="mt-0.5 size-4 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <Button type="button" variant={plan.id === currentPlan.id ? 'outline' : 'default'} className="w-full">
                      {plan.id === currentPlan.id ? labels.currentPlanAction : labels.choosePlan}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
          <SectionCard
            title={labels.currentPlanSection}
            description={labels.currentPlanDesc}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[18px] border border-border bg-accent/30 p-4">
                <div className="text-[12px] text-muted-foreground">{locale === 'ru' ? 'Статус' : 'Status'}</div>
                <div className="mt-2 text-[20px] font-semibold text-foreground">
                  {locale === 'ru' ? 'Активная подписка Pro' : 'Active Pro subscription'}
                </div>
                <div className="mt-2 text-[12px] text-muted-foreground">
                  {locale === 'ru' ? 'Следующий платёж 1 мая 2026' : 'Next charge on May 1, 2026'}
                </div>
              </div>
              <div className="rounded-[18px] border border-border bg-accent/30 p-4">
                <div className="text-[12px] text-muted-foreground">{labels.billingLabel}</div>
                <div className="mt-2 text-[20px] font-semibold text-foreground">
                  {formatCurrency(currentPlan.monthly, locale)}
                </div>
                <div className="mt-2 text-[12px] text-muted-foreground">Visa •••• 3142</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={labels.activeLimits}
            description={labels.limitsDesc}
          >
            <div className="grid gap-3">
              {dataset.limits.map((limit) => {
                const progress = Math.min(100, Math.round((limit.used / Math.max(1, limit.total)) * 100));
                return (
                  <div key={limit.id} className="rounded-[16px] border border-border bg-accent/30 p-4">
                    <div className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="text-foreground">{limit.label}</span>
                      <span className="text-muted-foreground">
                        {limit.used}/{limit.total}
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-border/60">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </WorkspaceShell>
  );
}
