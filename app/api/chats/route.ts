import { NextResponse } from 'next/server';

import type { Booking } from '@/lib/types';
import type { ChatChannel, ChatDeliveryState, ChatSegment, ChatThreadRecord } from '@/lib/chat-types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { sendClientTelegramMessage } from '@/lib/server/client-telegram';
import { isNotificationEnabled } from '@/lib/server/notification-settings';
import { listBookingsByWorkspace } from '@/lib/server/supabase-bookings';
import {
  createChatMessage,
  createChatThread,
  deleteChatThread,
  fetchChatThreadByPhone,
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
      metadata: {
        fallback: true,
        bookingId: latest.id,
        bookingIds: sorted.map((booking) => booking.id),
      },
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

async function getMergedBookings(workspace: NonNullable<Awaited<ReturnType<typeof fetchWorkspaceForUser>>>) {
  const jsonBookings = Array.isArray(workspace.data?.bookings)
    ? (workspace.data.bookings as Booking[])
    : [];
  const tableBookings = await listBookingsByWorkspace(workspace.id).catch(() => [] as Booking[]);
  return mergeBookings(tableBookings, jsonBookings);
}

function getBookingThreadKey(threadId: string) {
  return threadId.startsWith('booking-thread-') ? threadId.replace(/^booking-thread-/, '') : null;
}

function findBookingForThread(threadId: string, bookings: Booking[]) {
  const key = getBookingThreadKey(threadId);
  if (!key) return null;

  return (
    bookings.find((booking) => booking.clientPhone === key) ??
    bookings.find((booking) => booking.clientName === key) ??
    bookings.find((booking) => booking.id === key) ??
    null
  );
}

async function resolveThreadForMessage(params: {
  workspaceId: string;
  threadId: string;
  bookings: Booking[];
}) {
  const currentThreads = await listChatsForWorkspace(params.workspaceId).catch(() => [] as ChatThreadRecord[]);
  const current = currentThreads.find((thread) => thread.id === params.threadId);
  if (current) return current;

  const booking = findBookingForThread(params.threadId, params.bookings);
  if (!booking) return null;

  const relatedBookings = params.bookings.filter((item) => {
    if (booking.clientPhone) return item.clientPhone === booking.clientPhone;
    return item.clientName === booking.clientName;
  });
  const bookingIds = relatedBookings.map((item) => item.id);

  const existing = booking.clientPhone
    ? await fetchChatThreadByPhone(params.workspaceId, booking.clientPhone).catch(() => null)
    : null;

  if (existing) {
    await updateChatThread(params.workspaceId, existing.id, {
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      nextVisit: booking.date,
      botConnected: existing.botConnected,
      metadata: {
        ...(existing.metadata ?? {}),
        bookingId: booking.id,
        bookingIds,
      },
    }).catch(() => null);
    return {
      ...existing,
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      nextVisit: booking.date,
      metadata: {
        ...(existing.metadata ?? {}),
        bookingId: booking.id,
        bookingIds,
      },
      messages: [],
    } satisfies ChatThreadRecord;
  }

  const created = await createChatThread(params.workspaceId, {
    clientName: booking.clientName,
    clientPhone: booking.clientPhone,
    channel: 'Telegram',
    segment: 'active',
    source: 'Публичная страница',
    nextVisit: booking.date,
    botConnected: true,
    lastMessagePreview: `Новая запись: ${booking.service} · ${booking.date} ${booking.time}`,
    lastMessageAt: booking.createdAt,
    unreadCount: 0,
    metadata: {
      bookingId: booking.id,
      bookingIds,
      createdFromFallbackThread: true,
    },
  });

  return created ? { ...created, messages: [] } : null;
}

function getThreadBookingId(thread: ChatThreadRecord | null, bookings: Booking[]) {
  const metadataBookingId = typeof thread?.metadata?.bookingId === 'string' ? thread.metadata.bookingId : null;
  if (metadataBookingId) return metadataBookingId;

  const latest = bookings.find((booking) => {
    if (!thread) return false;
    if (thread.clientPhone) return booking.clientPhone === thread.clientPhone;
    return booking.clientName === thread.clientName;
  });

  return latest?.id ?? null;
}

export async function GET() {
  try {
    const user = await requireAuthUser();
    const workspace = await fetchWorkspaceForUser(user);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const bookings = await getMergedBookings(workspace);
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

    const body = (await request.json()) as Record<string, unknown>;
    const bodyType = body.type === 'thread' ? 'thread' : body.type === 'message' ? 'message' : undefined;

    if (bodyType === 'thread') {
      const clientName = typeof body.clientName === 'string' ? body.clientName.trim() : '';
      const clientPhone = typeof body.clientPhone === 'string' ? body.clientPhone.trim() : '';
      const channel: ChatChannel = body.channel === 'VK' ? 'VK' : body.channel === 'Instagram' ? 'Instagram' : 'Telegram';

      if (!clientName || !clientPhone) {
        return NextResponse.json({ error: 'client_name_and_phone_required' }, { status: 400 });
      }

      const thread = await createChatThread(workspace.id, {
        clientName,
        clientPhone,
        channel,
        botConnected: true,
        segment: 'new',
        unreadCount: 0,
      });

      return NextResponse.json({ thread });
    }

    const threadId = typeof body.threadId === 'string' ? body.threadId : '';
    const text = typeof body.body === 'string' ? body.body.trim() : '';
    const author: 'master' | 'system' = body.author === 'system' ? 'system' : 'master';
    const viaBot = body.viaBot === true;
    const requestedDeliveryState: ChatDeliveryState | null =
      body.deliveryState === 'queued' ||
      body.deliveryState === 'sent' ||
      body.deliveryState === 'delivered' ||
      body.deliveryState === 'read' ||
      body.deliveryState === 'failed'
        ? body.deliveryState
        : null;

    if (!threadId || !text) {
      return NextResponse.json({ error: 'thread_id_and_body_required' }, { status: 400 });
    }

    const bookings = await getMergedBookings(workspace);
    const thread = await resolveThreadForMessage({
      workspaceId: workspace.id,
      threadId,
      bookings,
    });

    if (!thread) {
      return NextResponse.json({ error: 'thread_not_found' }, { status: 404 });
    }

    const shouldSendToClient =
      thread.channel === 'Telegram' &&
      isNotificationEnabled(workspace, {
        id: 'chat-message',
        titleIncludes: 'чат',
        audience: 'client',
        fallback: true,
      });

    const telegramDelivered = shouldSendToClient
      ? await sendClientTelegramMessage({
          workspaceId: workspace.id,
          bookingId: getThreadBookingId(thread, bookings),
          clientPhone: thread.clientPhone,
          clientName: thread.clientName,
          directChatId:
            typeof thread.metadata?.clientTelegramChatId === 'number' || typeof thread.metadata?.clientTelegramChatId === 'string'
              ? thread.metadata.clientTelegramChatId
              : null,
          text,
        }).catch(() => false)
      : false;

    const deliveryState: ChatDeliveryState | null = telegramDelivered
      ? 'delivered'
      : requestedDeliveryState ?? (viaBot ? 'queued' : 'sent');

    const message = await createChatMessage(workspace.id, {
      threadId: thread.id,
      author,
      body: text,
      deliveryState,
      viaBot: viaBot || telegramDelivered,
      metadata: {
        sentToClientTelegram: telegramDelivered,
        sourceThreadId: threadId,
      },
    });

    await updateChatThread(workspace.id, thread.id, {
      lastMessagePreview: text,
      lastMessageAt: message?.createdAt ?? new Date().toISOString(),
      unreadCount: 0,
      segment: author === 'system' ? 'followup' : 'active',
      botConnected: telegramDelivered || thread.botConnected,
      metadata: {
        ...(thread.metadata ?? {}),
        lastTelegramDelivery: telegramDelivered ? 'delivered' : 'queued',
      },
    });

    return NextResponse.json({ message, threadId: thread.id, telegramDelivered });
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
