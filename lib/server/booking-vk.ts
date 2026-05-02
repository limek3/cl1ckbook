import 'server-only';

import type { Booking, MasterProfile } from '@/lib/types';
import { supabaseRestRequest } from '@/lib/server/supabase-rest';
import { sendMasterVkBookingNotification } from '@/lib/server/vk-bot';

type VkBotAccountRow = {
  vk_user_id: string;
  user_id: string;
  peer_id: number | null;
  messages_allowed: boolean | null;
};

export async function notifyWorkspaceOwnerAboutBookingVk(params: {
  ownerId?: string | null;
  workspaceSlug: string;
  profile?: MasterProfile | null;
  booking: Booking;
}) {
  if (!params.ownerId) return false;

  try {
    const response = await supabaseRestRequest(
      `/rest/v1/sloty_vk_bot_accounts?user_id=eq.${encodeURIComponent(params.ownerId)}&messages_allowed=eq.true&select=vk_user_id,user_id,peer_id,messages_allowed&limit=1`,
    );

    const rows = (await response.json()) as VkBotAccountRow[];
    const peerId = rows[0]?.peer_id;

    if (!peerId) return false;

    await sendMasterVkBookingNotification({
      peerId,
      booking: params.booking,
      profile: params.profile,
      workspaceSlug: params.workspaceSlug,
    });

    return true;
  } catch {
    return false;
  }
}
