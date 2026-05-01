import 'server-only';

import type { Booking, BookingStatus } from '@/lib/types';
import { supabaseRestRequest } from '@/lib/server/supabase-rest';

interface BookingRow {
  id: string;
  workspace_id: string;
  master_slug: string;
  client_name: string;
  client_phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  comment: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  duration_minutes?: number | null;
  price_amount?: number | null;
  source?: string | null;
  channel?: string | null;
  confirmed_at?: string | null;
  completed_at?: string | null;
  no_show_at?: string | null;
  cancelled_at?: string | null;
  status_check_sent_at?: string | null;
}

function mapRow(row: BookingRow): Booking {
  return {
    id: row.id,
    masterSlug: row.master_slug,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    service: row.service,
    date: row.booking_date,
    time: row.booking_time,
    comment: row.comment ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    source: row.source ?? undefined,
    channel: row.channel ?? undefined,
    priceAmount: typeof row.price_amount === 'number' ? row.price_amount : undefined,
    durationMinutes: typeof row.duration_minutes === 'number' ? row.duration_minutes : undefined,
    confirmedAt: row.confirmed_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    noShowAt: row.no_show_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    statusCheckSentAt: row.status_check_sent_at ?? undefined,
  };
}

export async function listBookingsByWorkspace(workspaceId: string) {
  const response = await supabaseRestRequest(
    `/rest/v1/sloty_bookings?workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&order=created_at.desc`,
  );
  const rows = (await response.json()) as BookingRow[];
  return rows.map(mapRow);
}

export async function createBookingRecord(workspaceId: string, booking: Booking) {
  const response = await supabaseRestRequest('/rest/v1/sloty_bookings?select=*', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify([
      {
        id: booking.id,
        workspace_id: workspaceId,
        master_slug: booking.masterSlug,
        client_name: booking.clientName,
        client_phone: booking.clientPhone,
        service: booking.service,
        booking_date: booking.date,
        booking_time: booking.time,
        comment: booking.comment ?? null,
        status: booking.status,
        duration_minutes: booking.durationMinutes ?? null,
        price_amount: booking.priceAmount ?? null,
        source: booking.source ?? 'ТГ',
        channel: booking.channel ?? 'telegram',
      },
    ]),
  });

  const rows = (await response.json()) as BookingRow[];
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function updateBookingStatusRecord(workspaceId: string, bookingId: string, status: BookingStatus) {
  const response = await supabaseRestRequest(
    `/rest/v1/sloty_bookings?id=eq.${encodeURIComponent(bookingId)}&workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*`,
    {
      method: 'PATCH',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        status,
        ...(status === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {}),
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
        ...(status === 'no_show' ? { no_show_at: new Date().toISOString() } : {}),
        ...(status === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}),
      }),
    },
  );

  const rows = (await response.json()) as BookingRow[];
  return rows[0] ? mapRow(rows[0]) : null;
}
