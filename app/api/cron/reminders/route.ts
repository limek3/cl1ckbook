import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import { sendTelegramMessage } from '@/lib/server/telegram-bot';
import type { Booking, MasterProfile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ReminderLinkRow = {
  id: string;
  workspace_id: string;
  booking_id: string;
  booking_snapshot: Booking | null;
  chat_id: number | null;
  reminder_24h_sent_at: string | null;
  reminder_2h_sent_at: string | null;
};

type BookingRow = {
  id: string;
  master_slug: string;
  client_name: string;
  client_phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  comment: string | null;
  status: Booking['status'];
  created_at: string;
};

function isCronAllowed(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

function mapBookingRow(row: BookingRow): Booking {
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

function bookingStartsAt(booking: Booking) {
  const [hours = '0', minutes = '0'] = booking.time.split(':');
  return new Date(`${booking.date}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);
}

function shouldSendReminder(booking: Booking, hoursBefore: number) {
  const startsAt = bookingStartsAt(booking).getTime();
  const now = Date.now();
  const diffMs = startsAt - now;
  const targetMs = hoursBefore * 60 * 60 * 1000;

  return diffMs > 0 && diffMs <= targetMs;
}

async function resolveBooking(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  row: ReminderLinkRow,
) {
  const { data: bookingRow } = await admin
    .from('sloty_bookings')
    .select('*')
    .eq('id', row.booking_id)
    .maybeSingle();

  if (bookingRow) return mapBookingRow(bookingRow as BookingRow);
  return row.booking_snapshot;
}

async function resolveProfile(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  workspaceId: string,
) {
  const { data } = await admin
    .from('sloty_workspaces')
    .select('profile')
    .eq('id', workspaceId)
    .maybeSingle();

  return (data?.profile as MasterProfile | undefined) ?? null;
}

async function sendReminder(params: {
  chatId: number;
  booking: Booking;
  profile: MasterProfile | null;
  hoursBefore: number;
}) {
  const masterName = params.profile?.name || 'мастеру';
  const when = params.hoursBefore >= 24 ? 'завтра' : `через ${params.hoursBefore} часа`;

  await sendTelegramMessage({
    chatId: params.chatId,
    text: [
      'Напоминание ⏰',
      '',
      `У вас ${when} запись к ${masterName}.`,
      `Услуга: ${params.booking.service}`,
      `Дата: ${params.booking.date}`,
      `Время: ${params.booking.time}`,
      params.profile?.city ? `Город: ${params.profile.city}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
  });
}

export async function GET(request: Request) {
  if (!isCronAllowed(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const sent: string[] = [];
  const failed: string[] = [];

  const { data, error } = await admin
    .from('sloty_booking_telegram_links')
    .select('*')
    .eq('status', 'confirmed')
    .not('chat_id', 'is', null)
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const rowRaw of data ?? []) {
    const row = rowRaw as ReminderLinkRow;
    if (!row.chat_id) continue;

    try {
      const booking = await resolveBooking(admin, row);
      if (!booking || booking.status === 'cancelled' || booking.status === 'completed') continue;

      const profile = await resolveProfile(admin, row.workspace_id);

      if (!row.reminder_24h_sent_at && shouldSendReminder(booking, 24)) {
        await sendReminder({ chatId: row.chat_id, booking, profile, hoursBefore: 24 });
        await admin
          .from('sloty_booking_telegram_links')
          .update({ reminder_24h_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', row.id);
        sent.push(`${row.id}:24h`);
        continue;
      }

      if (!row.reminder_2h_sent_at && shouldSendReminder(booking, 2)) {
        await sendReminder({ chatId: row.chat_id, booking, profile, hoursBefore: 2 });
        await admin
          .from('sloty_booking_telegram_links')
          .update({ reminder_2h_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', row.id);
        sent.push(`${row.id}:2h`);
      }
    } catch {
      failed.push(row.id);
    }
  }

  return NextResponse.json({ ok: true, checked: data?.length ?? 0, sent, failed });
}
