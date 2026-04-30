import 'server-only';

import crypto from 'node:crypto';
import type { Booking, MasterProfile } from '@/lib/types';
import { supabaseRestRequest } from '@/lib/server/supabase-rest';
import { getTelegramBotDeepLink, sendMasterBookingNotification } from '@/lib/server/telegram-bot';

type TelegramAccountRow = {
  telegram_id: number;
  user_id: string;
  chat_id: number | null;
};

function buildBookingToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function createClientTelegramBookingLink(params: {
  workspaceId: string;
  masterSlug: string;
  booking: Booking;
}) {
  const token = buildBookingToken();

  await supabaseRestRequest('/rest/v1/sloty_booking_telegram_links', {
    method: 'POST',
    body: JSON.stringify([
      {
        token,
        workspace_id: params.workspaceId,
        booking_id: params.booking.id,
        master_slug: params.masterSlug,
        booking_snapshot: params.booking,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ]),
  });

  return {
    token,
    url: getTelegramBotDeepLink(`booking_${token}`),
  };
}

export async function notifyWorkspaceOwnerAboutBooking(params: {
  ownerId?: string | null;
  workspaceSlug: string;
  profile?: MasterProfile | null;
  booking: Booking;
}) {
  if (!params.ownerId) return false;

  try {
    const response = await supabaseRestRequest(
      `/rest/v1/sloty_telegram_accounts?user_id=eq.${encodeURIComponent(params.ownerId)}&select=telegram_id,user_id,chat_id&limit=1`,
    );

    const rows = (await response.json()) as TelegramAccountRow[];
    const chatId = rows[0]?.chat_id;

    if (!chatId) return false;

    await sendMasterBookingNotification({
      chatId,
      booking: params.booking,
      profile: params.profile,
      workspaceSlug: params.workspaceSlug,
    });

    return true;
  } catch {
    return false;
  }
}
