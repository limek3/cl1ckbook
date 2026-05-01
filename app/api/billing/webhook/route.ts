import { NextResponse } from 'next/server';

import { normalizeBillingPeriod, normalizeBillingStatus, normalizePlanId } from '@/lib/billing';
import { supabaseRestRequest } from '@/lib/server/supabase-rest';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getSecret(request: Request) {
  return request.headers.get('x-clickbook-billing-secret') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
}

export async function POST(request: Request) {
  const expectedSecret = process.env.CLICKBOOK_BILLING_WEBHOOK_SECRET;

  if (!expectedSecret || getSecret(request) !== expectedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    workspaceId?: string;
    planId?: string;
    status?: string;
    period?: string;
    provider?: string;
    providerCustomerId?: string;
    providerSubscriptionId?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    eventId?: string;
    eventType?: string;
    payload?: unknown;
  };

  if (!body.workspaceId) {
    return NextResponse.json({ error: 'workspace_id_required' }, { status: 400 });
  }

  const planId = normalizePlanId(body.planId);
  const status = normalizeBillingStatus(body.status, planId);
  const period = normalizeBillingPeriod(body.period);

  const subscriptionResponse = await supabaseRestRequest('/rest/v1/sloty_workspace_subscriptions?on_conflict=workspace_id&select=*', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([
      {
        workspace_id: body.workspaceId,
        plan_id: planId,
        status,
        billing_period: period,
        provider: body.provider ?? null,
        provider_customer_id: body.providerCustomerId ?? null,
        provider_subscription_id: body.providerSubscriptionId ?? null,
        current_period_start: body.currentPeriodStart ?? null,
        current_period_end: body.currentPeriodEnd ?? null,
        cancel_at_period_end: Boolean(body.cancelAtPeriodEnd),
        metadata: {
          source: 'billing_webhook',
          updatedAt: new Date().toISOString(),
        },
      },
    ]),
  });

  const rows = (await subscriptionResponse.json()) as Array<{ id: string }>;
  const subscriptionId = rows[0]?.id ?? null;

  if (body.eventType) {
    await supabaseRestRequest('/rest/v1/sloty_subscription_events', {
      method: 'POST',
      headers: {
        Prefer: 'resolution=ignore-duplicates',
      },
      body: JSON.stringify([
        {
          workspace_id: body.workspaceId,
          subscription_id: subscriptionId,
          provider: body.provider ?? 'custom',
          provider_event_id: body.eventId ?? crypto.randomUUID(),
          event_type: body.eventType,
          payload: body.payload ?? body,
        },
      ]),
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true, subscriptionId });
}
