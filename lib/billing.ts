import type { Booking, MasterProfile } from '@/lib/types';
import type { WorkspaceSections } from '@/lib/workspace-store';

export type BillingPlanId = 'start' | 'pro' | 'studio' | 'premium';
export type BillingPeriod = 'monthly' | 'yearly';
export type BillingStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | 'free';
export type LimitId = 'services' | 'clients' | 'bookings' | 'reminders' | 'exports' | 'promotion';

export interface BillingPlan {
  id: BillingPlanId;
  name: string;
  monthly: number;
  yearly: number;
  popular?: boolean;
  limits: Record<LimitId, number>;
}

export interface BillingLimitUsage {
  id: LimitId;
  labelRu: string;
  labelEn: string;
  used: number;
  total: number;
  percent: number;
  locked: boolean;
  warning: boolean;
}

export interface BillingSubscriptionSummary {
  planId: BillingPlanId;
  status: BillingStatus;
  period: BillingPeriod;
  currentPeriodEnd: string | null;
  provider: string | null;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  isPaid: boolean;
}

export interface BillingSummary {
  plan: BillingPlan;
  subscription: BillingSubscriptionSummary;
  limits: BillingLimitUsage[];
}

export const CLICKBOOK_PLANS: BillingPlan[] = [
  {
    id: 'start',
    name: 'Start',
    monthly: 0,
    yearly: 0,
    limits: {
      services: 5,
      clients: 30,
      bookings: 50,
      reminders: 20,
      exports: 0,
      promotion: 1,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 990,
    yearly: 9990,
    popular: true,
    limits: {
      services: 20,
      clients: 150,
      bookings: 300,
      reminders: 120,
      exports: 10,
      promotion: 3,
    },
  },
  {
    id: 'studio',
    name: 'Studio',
    monthly: 2490,
    yearly: 24990,
    limits: {
      services: 80,
      clients: 700,
      bookings: 1500,
      reminders: 800,
      exports: 50,
      promotion: 10,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    monthly: 5990,
    yearly: 59990,
    limits: {
      services: 9999,
      clients: 9999,
      bookings: 9999,
      reminders: 9999,
      exports: 9999,
      promotion: 9999,
    },
  },
];

export function normalizePlanId(value: unknown): BillingPlanId {
  if (value === 'pro' || value === 'studio' || value === 'premium') return value;
  return 'start';
}

export function normalizeBillingPeriod(value: unknown): BillingPeriod {
  return value === 'yearly' ? 'yearly' : 'monthly';
}

export function normalizeBillingStatus(value: unknown, planId: BillingPlanId): BillingStatus {
  if (value === 'active' || value === 'trialing' || value === 'past_due' || value === 'cancelled' || value === 'expired') {
    return value;
  }
  return planId === 'start' ? 'free' : 'active';
}

export function getBillingPlan(planId: unknown) {
  const normalized = normalizePlanId(planId);
  return CLICKBOOK_PLANS.find((plan) => plan.id === normalized) ?? CLICKBOOK_PLANS[0];
}

function currentMonthKey() {
  const now = new Date();
  return now.toISOString().slice(0, 7);
}

function bookingIsInCurrentMonth(booking: Booking) {
  return booking.date?.startsWith(currentMonthKey());
}

function uniqueClientCount(bookings: Booking[]) {
  const values = new Set<string>();
  for (const booking of bookings) {
    const phone = booking.clientPhone?.replace(/\D+/g, '');
    values.add(phone || booking.clientName.toLowerCase().trim());
  }
  return values.size;
}

function countSectionItems(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

export function buildBillingUsage(profile: MasterProfile | null | undefined, bookings: Booking[], sections?: WorkspaceSections | null) {
  const monthBookings = bookings.filter(bookingIsInCurrentMonth);
  const serviceCount = Array.isArray(sections?.services) && sections.services.length > 0
    ? sections.services.filter((service) => service && typeof service === 'object' && (service as { status?: string }).status !== 'draft').length
    : profile?.services?.length ?? 0;

  return {
    services: serviceCount,
    clients: uniqueClientCount(monthBookings),
    bookings: monthBookings.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'no_show').length,
    reminders: bookings.filter((booking) => Boolean(booking.statusCheckSentAt)).length,
    exports: countSectionItems((sections as Record<string, unknown> | undefined)?.exports),
    promotion: countSectionItems((sections as Record<string, unknown> | undefined)?.promotionCampaigns),
  } satisfies Record<LimitId, number>;
}

export function buildBillingLimits(plan: BillingPlan, usage: Record<LimitId, number>): BillingLimitUsage[] {
  const labels: Record<LimitId, { ru: string; en: string }> = {
    services: { ru: 'Активные услуги', en: 'Active services' },
    clients: { ru: 'Клиенты за месяц', en: 'Monthly clients' },
    bookings: { ru: 'Записи за месяц', en: 'Monthly bookings' },
    reminders: { ru: 'Напоминания клиентам', en: 'Client reminders' },
    exports: { ru: 'Экспорты данных', en: 'Data exports' },
    promotion: { ru: 'Кампании продвижения', en: 'Promotion campaigns' },
  };

  return (Object.keys(labels) as LimitId[]).map((id) => {
    const total = plan.limits[id];
    const used = usage[id] ?? 0;
    const percent = total >= 9999 ? 0 : Math.min(100, Math.round((used / Math.max(1, total)) * 100));

    return {
      id,
      labelRu: labels[id].ru,
      labelEn: labels[id].en,
      used,
      total,
      percent,
      locked: total === 0,
      warning: total < 9999 && percent >= 75,
    };
  });
}

export function formatBillingStatusLabel(status: BillingStatus, planId: BillingPlanId, locale: 'ru' | 'en') {
  if (locale === 'ru') {
    if (planId === 'start' || status === 'free') return 'Бесплатный';
    if (status === 'active') return 'Платный';
    if (status === 'trialing') return 'Пробный';
    if (status === 'past_due') return 'Требует оплаты';
    if (status === 'cancelled') return 'Отменён';
    return 'Истёк';
  }

  if (planId === 'start' || status === 'free') return 'Free';
  if (status === 'active') return 'Paid';
  if (status === 'trialing') return 'Trial';
  if (status === 'past_due') return 'Payment required';
  if (status === 'cancelled') return 'Cancelled';
  return 'Expired';
}
