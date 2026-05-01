import { NextResponse } from 'next/server';

import { normalizeBillingPeriod, normalizePlanId } from '@/lib/billing';
import { getBillingPortalUrl, getBillingSummary, getCheckoutUrl } from '@/lib/server/supabase-billing';
import { listBookingsByWorkspace } from '@/lib/server/supabase-bookings';
import type { Booking } from '@/lib/types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { fetchWorkspaceForUser } from '@/lib/server/supabase-workspaces';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getWorkspaceBilling() {
  const user = await requireAuthUser();
  const workspace = await fetchWorkspaceForUser(user);

  if (!workspace) {
    return { workspace: null, billing: null };
  }

  const jsonBookings = Array.isArray(workspace.data?.bookings) ? (workspace.data.bookings as Booking[]) : [];
  const tableBookings = await listBookingsByWorkspace(workspace.id).catch(() => []);
  const bookings = tableBookings.length > 0 ? tableBookings : jsonBookings;
  const billing = await getBillingSummary({
    workspaceId: workspace.id,
    profile: workspace.profile,
    bookings,
    sections: workspace.data,
  });

  return { workspace, billing };
}

export async function GET() {
  try {
    const { workspace, billing } = await getWorkspaceBilling();

    if (!workspace || !billing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({ workspaceId: workspace.id, ...billing });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      planId?: string;
      period?: string;
    };

    const { workspace, billing } = await getWorkspaceBilling();

    if (!workspace || !billing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (body.action === 'portal') {
      const url = getBillingPortalUrl();
      if (!url) {
        return NextResponse.json({ error: 'billing_portal_url_missing' }, { status: 400 });
      }
      return NextResponse.json({ url });
    }

    if (body.action === 'checkout') {
      const planId = normalizePlanId(body.planId);
      const period = normalizeBillingPeriod(body.period);

      if (planId === 'start') {
        return NextResponse.json({ error: 'free_plan_does_not_need_checkout' }, { status: 400 });
      }

      const url = getCheckoutUrl(planId, period);
      if (!url) {
        return NextResponse.json({ error: 'checkout_url_missing' }, { status: 400 });
      }

      return NextResponse.json({ url });
    }

    return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
