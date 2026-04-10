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
      body: JSON.stringify({ status }),
    },
  );

  const rows = (await response.json()) as BookingRow[];
  return rows[0] ? mapRow(rows[0]) : null;
}
