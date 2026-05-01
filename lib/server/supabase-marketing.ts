import 'server-only';

import { supabaseRestRequest } from '@/lib/server/supabase-rest';

export interface MarketingCampaignRow {
  id: string;
  workspace_id: string;
  title: string;
  channel: 'link' | 'telegram' | 'vk' | 'instagram' | 'qr' | 'referral';
  status: 'draft' | 'active' | 'paused' | 'finished';
  goal: string | null;
  public_url: string | null;
  clicks: number;
  leads: number;
  bookings: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function listMarketingCampaigns(workspaceId: string) {
  const response = await supabaseRestRequest(
    `/rest/v1/sloty_marketing_campaigns?workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&order=created_at.desc`,
  );
  return (await response.json()) as MarketingCampaignRow[];
}

export async function createMarketingCampaign(params: {
  workspaceId: string;
  title: string;
  channel: MarketingCampaignRow['channel'];
  goal?: string;
  publicUrl?: string;
}) {
  const response = await supabaseRestRequest('/rest/v1/sloty_marketing_campaigns?select=*', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify([
      {
        workspace_id: params.workspaceId,
        title: params.title,
        channel: params.channel,
        goal: params.goal ?? null,
        public_url: params.publicUrl ?? null,
        status: 'active',
      },
    ]),
  });

  const rows = (await response.json()) as MarketingCampaignRow[];
  return rows[0] ?? null;
}
