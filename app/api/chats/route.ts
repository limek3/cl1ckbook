import { NextResponse } from 'next/server';

import type { Booking } from '@/lib/types';
import type { ChatChannel, ChatDeliveryState, ChatSegment, ChatThreadRecord } from '@/lib/chat-types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { listBookingsByWorkspace } from '@/lib/server/supabase-bookings';
import {
  createChatMessage,
  createChatThread,
  deleteChatThread,
  listChatsForWorkspace,
  updateChatThread,
} from '@/lib/server/supabase-chats';
import { fetchWorkspaceForUser } from '@/lib/server/supabase-workspaces';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mergeBookings(tableBookings: Booking[], jsonBookings: Booking[]) {
  const map = new Map<string, Booking>();

  for (const booking of [...jsonBookings, ...tableBookings]) {
    if (!booking?.id) continue;
    map.set(booking.id, booking);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function synthesizeThreadsFromBookings(workspaceId: string, bookings: Booking[]): ChatThreadRecord[] {
  const grouped = new Map<string, Booking[]>();

  for (const booking of bookings) {
    const key = booking.clientPhone || booking.clientName || booking.id;
    const bucket = grouped.get(key) ?? [];
    bucket.push(booking);
    grouped.set(key, bucket);
  }

  return Array.from(grouped.entries()).map(([key, items]) => {
    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const latest = sorted[0];
    const body = `Новая запись: ${latest.service} · ${latest.date} ${latest.time}`;

    return {
      id: `booking-thread-${key}`,
      workspaceId,
      clientName: latest.clientName,
      clientPhone: latest.clientPhone,
      channel: 'Telegram',
      segment: 'new',
      source: 'Публичная страница',
      nextVisit: latest.date,
      isPriority: false,
      botConnected: true,
      lastMessagePreview: latest.comment || body,
      lastMessageAt: latest.createdAt,
      unreadCount: 1,
      createdAt: latest.createdAt,
      updatedAt: latest.createdAt,
      metadata: { fallback: true },
      messages: sorted.flatMap((booking) => {
        const messageBody = `Новая запись: ${booking.service} · ${booking.date} ${booking.time}`;
        return [
          {
            id: `booking-message-${booking.id}`,
            threadId: `booking-thread-${key}`,
            author: 'client' as const,
            body: messageBody,
            deliveryState: null,
            viaBot: false,
            createdAt: booking.createdAt,
            metadata: {
              bookingId: booking.id,
              service: booking.service,
              date: booking.date,
              time: booking.time,
            },
          },
          ...(booking.comment
            ? [
                {
                  id: `booking-comment-${booking.id}`,
                  threadId: `booking-thread-${key}`,
                  author: 'client' as const,
                  body: booking.comment,
                  deliveryState: null,
                  viaBot: false,
                  createdAt: booking.createdAt,
                  metadata: {
                    bookingId: booking.id,
                    kind: 'comment',
                  },
                },
              ]
            : []),
        ];
      }),
    } satisfies ChatThreadRecord;
  });
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
    const fallbackThreads = synthesizeThreadsFromBookings(workspace.id, bookings);

    try {
      const threads = await listChatsForWorkspace(workspace.id);
      return NextResponse.json({
        workspaceId: workspace.id,
        threads: threads.length > 0 ? threads : fallbackThreads,
      });
    } catch {
      return NextResponse.json({
        workspaceId: workspace.id,
        threads: fallbackThreads,
      });
    }
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
    const workspace = await fetchWorkspaceForUser(user);

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
    const workspace = await fetchWorkspaceForUser(user);

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

export async function DELETE(request: Request) {
  try {
    const user = await requireAuthUser();
    const workspace = await fetchWorkspaceForUser(user);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const body = (await request.json()) as {
      threadId?: string;
    };

    if (!body.threadId) {
      return NextResponse.json({ error: 'thread_id_required' }, { status: 400 });
    }

    await deleteChatThread(workspace.id, body.threadId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
