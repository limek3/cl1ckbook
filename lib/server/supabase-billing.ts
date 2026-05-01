import 'server-only';

import {
  buildBillingLimits,
  buildBillingUsage,
  getBillingPlan,
  normalizeBillingPeriod,
  normalizeBillingStatus,
  normalizePlanId,
  type BillingPeriod,
  type BillingSummary,
} from '@/lib/billing';
import { supabaseRestRequest } from '@/lib/server/supabase-rest';
import type { Booking, MasterProfile } from '@/lib/types';
import type { WorkspaceSections } from '@/lib/workspace-store';

interface SubscriptionRow {
  id: string;
  workspace_id: string;
  plan_id: string | null;
  status: string | null;
  billing_period: string | null;
  current_period_end: string | null;
  provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  metadata?: Record<string, unknown> | null;
}

async function fetchSubscriptionRow(workspaceId: string) {
  try {
    const response = await supabaseRestRequest(
      `/rest/v1/sloty_workspace_subscriptions?workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&order=updated_at.desc&limit=1`,
    );
    const rows = (await response.json()) as SubscriptionRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getBillingSummary(params: {
  workspaceId: string;
  profile: MasterProfile | null;
  bookings: Booking[];
  sections?: WorkspaceSections | null;
}): Promise<BillingSummary> {
  const row = await fetchSubscriptionRow(params.workspaceId);
  const fallbackSubscription = (params.sections as Record<string, unknown> | undefined)?.subscription as Record<string, unknown> | undefined;
  const planId = normalizePlanId(row?.plan_id ?? fallbackSubscription?.planId);
  const period = normalizeBillingPeriod(row?.billing_period ?? fallbackSubscription?.period);
  const status = normalizeBillingStatus(row?.status ?? fallbackSubscription?.status, planId);
  const plan = getBillingPlan(planId);
  const usage = buildBillingUsage(params.profile, params.bookings, params.sections);
  const limits = buildBillingLimits(plan, usage);

  return {
    plan,
    subscription: {
      planId,
      status,
      period,
      currentPeriodEnd:
        row?.current_period_end ??
        (typeof fallbackSubscription?.currentPeriodEnd === 'string' ? fallbackSubscription.currentPeriodEnd : null),
      provider: row?.provider ?? null,
      providerCustomerId: row?.provider_customer_id ?? null,
      providerSubscriptionId: row?.provider_subscription_id ?? null,
      isPaid: planId !== 'start' && (status === 'active' || status === 'trialing'),
    },
    limits,
  };
}

export function getCheckoutUrl(planId: string, period: BillingPeriod) {
  const normalizedPlan = normalizePlanId(planId).toUpperCase();
  const normalizedPeriod = period.toUpperCase();
  return (
    process.env[`CLICKBOOK_CHECKOUT_${normalizedPlan}_${normalizedPeriod}_URL`] ||
    process.env[`CLICKBOOK_CHECKOUT_${normalizedPlan}_URL`] ||
    process.env.CLICKBOOK_CHECKOUT_URL ||
    ''
  );
}

export function getBillingPortalUrl() {
  return process.env.CLICKBOOK_BILLING_PORTAL_URL || '';
}
