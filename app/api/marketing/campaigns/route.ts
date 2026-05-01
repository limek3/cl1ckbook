import { NextResponse } from 'next/server';

import { requireAuthUser } from '@/lib/server/require-auth-user';
import { createMarketingCampaign, listMarketingCampaigns } from '@/lib/server/supabase-marketing';
import { fetchWorkspaceForUser } from '@/lib/server/supabase-workspaces';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getWorkspace() {
  const user = await requireAuthUser();
  return fetchWorkspaceForUser(user);
}

export async function GET() {
  try {
    const workspace = await getWorkspace();

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const campaigns = await listMarketingCampaigns(workspace.id).catch(() => []);
    return NextResponse.json({ campaigns });
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
    const workspace = await getWorkspace();

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      channel?: 'link' | 'telegram' | 'vk' | 'instagram' | 'qr' | 'referral';
      goal?: string;
      publicUrl?: string;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title_required' }, { status: 400 });
    }

    const campaign = await createMarketingCampaign({
      workspaceId: workspace.id,
      title: body.title.trim(),
      channel: body.channel ?? 'link',
      goal: body.goal,
      publicUrl: body.publicUrl,
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
