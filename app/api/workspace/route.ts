import { NextResponse } from 'next/server';

import { requireAuthUser } from '@/lib/server/require-auth-user';
import { listBookingsByWorkspace } from '@/lib/server/supabase-bookings';
import { fetchWorkspaceForUser } from '@/lib/server/supabase-workspaces';
import type { Booking } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mergeBookings(tableBookings: Booking[], jsonBookings: Booking[]) {
  const map = new Map<string, Booking>();

  // JSON bookings are the resilient fallback. Table rows win when the same id
  // exists there, because they may contain a confirmed status updated later.
  for (const booking of [...jsonBookings, ...tableBookings]) {
    if (!booking?.id) continue;
    map.set(booking.id, booking);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function GET() {
  try {
    const user = await requireAuthUser();
    const workspace = await fetchWorkspaceForUser(user);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const jsonBookings = Array.isArray(workspace.data?.bookings)
      ? (workspace.data.bookings as Booking[])
      : [];
    const tableBookings = await listBookingsByWorkspace(workspace.id).catch(() => [] as Booking[]);
    const bookings = mergeBookings(tableBookings, jsonBookings);

    return NextResponse.json({
      ...workspace,
      data: {
        ...(workspace.data ?? {}),
        bookings,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
