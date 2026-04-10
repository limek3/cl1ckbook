import { NextResponse } from 'next/server';
import type { ChatChannel, ChatDeliveryState, ChatSegment } from '@/lib/chat-types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import {
  createChatMessage,
  createChatThread,
  listChatsForWorkspace,
  updateChatThread,
} from '@/lib/server/supabase-chats';
import { fetchWorkspaceByOwner } from '@/lib/server/supabase-workspaces';

export async function GET() {
  try {
    const user = await requireAuthUser();
    const workspace = await fetchWorkspaceByOwner(user.id);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const threads = await listChatsForWorkspace(workspace.id);
    return NextResponse.json({
      workspaceId: workspace.id,
      threads,
    });
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
    const user = await requireAuthUser();
    const workspace = await fetchWorkspaceByOwner(user.id);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const body = (await request.json()) as
      | {
          type?: 'thread';
          clientName?: string;
          clientPhone?: string;
          channel?: ChatChannel;
        }
      | {
          type?: 'message';
          threadId?: string;
          body?: string;
          author?: 'master' | 'system';
          deliveryState?: ChatDeliveryState | null;
          viaBot?: boolean;
        };

    if (body.type === 'thread') {
      if (!body.clientName || !body.clientPhone) {
        return NextResponse.json({ error: 'client_name_and_phone_required' }, { status: 400 });
      }

      const thread = await createChatThread(workspace.id, {
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        channel: body.channel ?? 'Telegram',
        botConnected: true,
        segment: 'new',
        unreadCount: 0,
      });

      return NextResponse.json({ thread });
    }

    if (!body.threadId || !body.body?.trim()) {
      return NextResponse.json({ error: 'thread_id_and_body_required' }, { status: 400 });
    }

    const message = await createChatMessage(workspace.id, {
      threadId: body.threadId,
      author: body.author ?? 'master',
      body: body.body.trim(),
      deliveryState: body.deliveryState ?? 'sent',
      viaBot: body.viaBot ?? false,
    });

    await updateChatThread(workspace.id, body.threadId, {
      lastMessagePreview: body.body.trim(),
      lastMessageAt: message?.createdAt ?? new Date().toISOString(),
      unreadCount: 0,
      segment: body.author === 'system' ? 'followup' : 'active',
    });

    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthUser();
    const workspace = await fetchWorkspaceByOwner(user.id);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const body = (await request.json()) as {
      threadId?: string;
      patch?: Partial<{
        clientName: string;
        clientPhone: string;
        channel: ChatChannel;
        segment: ChatSegment;
        nextVisit: string | null;
        isPriority: boolean;
        botConnected: boolean;
        unreadCount: number;
      }>;
    };

    if (!body.threadId || !body.patch) {
      return NextResponse.json({ error: 'thread_id_and_patch_required' }, { status: 400 });
    }

    const thread = await updateChatThread(workspace.id, body.threadId, body.patch);
    return NextResponse.json({ thread });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
