import { NextResponse } from 'next/server';

import { isSlotAvailable, normalizeAvailabilityDays, normalizeServiceDetails } from '@/lib/availability';
import { buildWorkspaceSeed } from '@/lib/workspace-store';
import type { Booking } from '@/lib/types';
import type { ChatChannel } from '@/lib/chat-types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { createClientTelegramBookingLink, notifyWorkspaceOwnerAboutBooking } from '@/lib/server/booking-telegram';
import { createClientVkBookingLink, notifyWorkspaceOwnerAboutBookingVk } from '@/lib/server/booking-vk';
import { sendClientTelegramMessage } from '@/lib/server/client-telegram';
import { isNotificationEnabled } from '@/lib/server/notification-settings';
import { createBookingRecord, listBookingsByWorkspace, updateBookingStatusRecord } from '@/lib/server/supabase-bookings';
import {
  createChatMessage,
  createChatThread,
  fetchChatThreadByBookingId,
  updateChatThread,
} from '@/lib/server/supabase-chats';
import { upsertClientFromBooking, type ClientSourceChannel } from '@/lib/server/supabase-clients';
import { listAvailabilityDays, listServices } from '@/lib/server/supabase-workspace-sections';
import {
  fetchWorkspaceForUser,
  fetchWorkspaceBySlug,
  updateWorkspace,
} from '@/lib/server/supabase-workspaces';
import { bookingMessageText, bookingShortContext, bookingThreadMetadata } from '@/lib/server/booking-context';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type BookingSourceInfo = {
  channel: ClientSourceChannel;
  source: 'Web' | 'Telegram' | 'VK';
  chatChannel: ChatChannel;
  botConnected: boolean;
  communicationScenario: string;
};

function normalizeIncomingChannel(value: unknown, source: unknown): ClientSourceChannel {
  const raw = `${typeof value === 'string' ? value : ''} ${typeof source === 'string' ? source : ''}`.trim().toLowerCase();

  if (raw.includes('vk') || raw.includes('вк')) return 'vk';
  if (raw.includes('tg') || raw.includes('telegram') || raw.includes('телеграм')) return 'telegram';
  return 'web';
}

function getBookingSourceInfo(value: unknown, source: unknown): BookingSourceInfo {
  const channel = normalizeIncomingChannel(value, source);

  if (channel === 'telegram') {
    return {
      channel,
      source: 'Telegram',
      chatChannel: 'Telegram',
      botConnected: true,
      communicationScenario: 'telegram_bot',
    };
  }

  if (channel === 'vk') {
    return {
      channel,
      source: 'VK',
      chatChannel: 'VK',
      botConnected: true,
      communicationScenario: 'vk_bot',
    };
  }

  return {
    channel: 'web',
    source: 'Web',
    chatChannel: 'Web',
    botConnected: false,
    communicationScenario: 'phone_fallback_without_bot',
  };
}

function buildClientBooking(
  masterSlug: string,
  values: Omit<Booking, 'id' | 'masterSlug' | 'status' | 'createdAt'>,
  sourceInfo: BookingSourceInfo,
): Booking {
  return {
    id: crypto.randomUUID(),
    masterSlug,
    clientName: values.clientName.trim(),
    clientPhone: values.clientPhone.trim(),
    service: values.service.trim(),
    date: values.date,
    time: values.time,
    comment: values.comment?.trim() || undefined,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    confirmedAt: new Date().toISOString(),
    source: sourceInfo.source,
    channel: sourceInfo.channel,
    metadata: {
      ...(values.metadata ?? {}),
      sourceChannel: sourceInfo.channel,
      communicationScenario: sourceInfo.communicationScenario,
      clientWithoutBot: sourceInfo.channel === 'web',
    },
  };
}

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

function getAvailabilityKey(item: unknown) {
  if (!item || typeof item !== 'object') return crypto.randomUUID();
  const day = item as Record<string, unknown>;

  if (typeof day.date === 'string' && day.date) return `date:${day.date}`;
  if (typeof day.weekdayIndex === 'number') return `weekday:${day.weekdayIndex}`;
  if (typeof day.weekday_index === 'number') return `weekday:${day.weekday_index}`;
  if (typeof day.id === 'string' && day.id) return `id:${day.id}`;

  return crypto.randomUUID();
}

function mergeAvailability(...sources: unknown[][]) {
  const map = new Map<string, unknown>();

  for (const source of sources) {
    for (const item of source) {
      if (!item || typeof item !== 'object') continue;
      map.set(getAvailabilityKey(item), item);
    }
  }

  return Array.from(map.values());
}

function resolveAvailability(params: {
  seedAvailability: unknown[];
  storedAvailability: unknown[];
  normalizedAvailability: unknown[];
}) {
  const seed = normalizeAvailabilityDays(params.seedAvailability);
  const stored = normalizeAvailabilityDays(params.storedAvailability);
  const normalized = normalizeAvailabilityDays(params.normalizedAvailability);

  if (stored.length > 0) {
    return normalizeAvailabilityDays(mergeAvailability(seed.filter((day) => !day.date), stored));
  }

  if (normalized.length > 0) {
    return normalizeAvailabilityDays(mergeAvailability(seed.filter((day) => !day.date), normalized));
  }

  return seed;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      masterSlug?: string;
      values?: Omit<Booking, 'id' | 'masterSlug' | 'status' | 'createdAt'>;
      sourceChannel?: string;
      source?: string;
      clientContext?: Record<string, unknown>;
    };

    if (!body.masterSlug || !body.values) {
      return NextResponse.json({ error: 'master_slug_and_values_required' }, { status: 400 });
    }

    const workspace = await fetchWorkspaceBySlug(body.masterSlug);

    if (!workspace) {
      return NextResponse.json({ error: 'master_not_found' }, { status: 404 });
    }

    const jsonBookings = Array.isArray(workspace.data?.bookings)
      ? (workspace.data.bookings as Booking[])
      : [];
    const tableBookings = await listBookingsByWorkspace(workspace.id).catch(() => [] as Booking[]);
    const currentBookings = mergeBookings(tableBookings, jsonBookings);

    const requestedService = body.values.service.trim();
    const profileServices = Array.isArray(workspace.profile?.services) ? workspace.profile.services : [];
    const normalizedServices = await listServices(workspace.id).catch(() => []);
    const storedServiceDetails = normalizeServiceDetails(workspace.data?.services);
    const seed = buildWorkspaceSeed(workspace.profile, currentBookings, 'ru');
    const effectiveServiceDetails = storedServiceDetails.length > 0
      ? storedServiceDetails
      : normalizedServices.length > 0
        ? normalizedServices
        : seed.services ?? [];
    const selectedServiceDetail = effectiveServiceDetails.find(
      (service) =>
        service.name === requestedService &&
        service.visible !== false &&
        service.status !== 'draft',
    );
    const hasServiceInDetails = Boolean(selectedServiceDetail);
    const hasServiceInProfile = profileServices.includes(requestedService);

    if (!hasServiceInDetails && !hasServiceInProfile) {
      return NextResponse.json({ error: 'service_not_available' }, { status: 400 });
    }

    const storedAvailability = Array.isArray(workspace.data?.availability)
      ? workspace.data.availability
      : [];
    const normalizedAvailability = await listAvailabilityDays(workspace.id).catch(() => []);
    const availability = resolveAvailability({
      seedAvailability: seed.availability ?? [],
      storedAvailability,
      normalizedAvailability,
    });
    const bookedSlots = currentBookings.map((item) => ({
      id: item.id,
      date: item.date,
      time: item.time,
      service: item.service,
      status: item.status,
    }));

    if (
      !isSlotAvailable({
        availability,
        date: body.values.date,
        time: body.values.time,
        serviceName: requestedService,
        services: effectiveServiceDetails,
        bookedSlots,
      })
    ) {
      return NextResponse.json({ error: 'slot_unavailable' }, { status: 409 });
    }

    const sourceInfo = getBookingSourceInfo(body.sourceChannel, body.source);
    const booking: Booking = {
      ...buildClientBooking(body.masterSlug, body.values, sourceInfo),
      durationMinutes: selectedServiceDetail?.duration,
      priceAmount: selectedServiceDetail?.price,
      metadata: {
        ...(body.values.metadata ?? {}),
        sourceChannel: sourceInfo.channel,
        source: sourceInfo.source,
        clientContext: body.clientContext ?? {},
        communicationScenario: sourceInfo.communicationScenario,
        clientWithoutBot: sourceInfo.channel === 'web',
      },
    };

    let persistedBooking = booking;
    let nextBookings = [booking, ...currentBookings];

    try {
      persistedBooking = (await createBookingRecord(workspace.id, booking)) ?? booking;
      const refreshedTableBookings = await listBookingsByWorkspace(workspace.id).catch(() => [] as Booking[]);
      nextBookings = mergeBookings(refreshedTableBookings, [persistedBooking, ...jsonBookings]);
    } catch {
      nextBookings = [persistedBooking, ...currentBookings];
    }

    const clientRecord = await upsertClientFromBooking({
      workspaceId: workspace.id,
      booking: persistedBooking,
      source: sourceInfo.source,
      channel: sourceInfo.channel,
      communicationScenario: sourceInfo.communicationScenario,
      metadata: {
        clientContext: body.clientContext ?? {},
        sourceChannel: sourceInfo.channel,
      },
    }).catch(() => null);

    if (clientRecord?.id) {
      persistedBooking = {
        ...persistedBooking,
        metadata: {
          ...(persistedBooking.metadata ?? {}),
          clientId: clientRecord.id,
          clientCardSynced: true,
        },
      };
      nextBookings = nextBookings.map((item) => (item.id === persistedBooking.id ? persistedBooking : item));
    }

    await updateWorkspace(workspace.id, {
      data: {
        ...(workspace.data ?? {}),
        bookings: nextBookings,
      },
    });

    let telegramBookingLink: { token: string; url: string | null } | null = null;
    let vkBookingLink: { token: string; url: string | null } | null = null;

    try {
      telegramBookingLink = await createClientTelegramBookingLink({
        workspaceId: workspace.id,
        masterSlug: body.masterSlug,
        booking: persistedBooking,
      });
    } catch {
      telegramBookingLink = null;
    }

    try {
      vkBookingLink = await createClientVkBookingLink({
        workspaceId: workspace.id,
        masterSlug: body.masterSlug,
        booking: persistedBooking,
      });
    } catch {
      vkBookingLink = null;
    }

    if (
      isNotificationEnabled(workspace, {
        id: 'new-request',
        titleIncludes: 'новая',
        audience: 'master',
        fallback: true,
      })
    ) {
      try {
        await Promise.allSettled([
          notifyWorkspaceOwnerAboutBooking({
            ownerId: workspace.ownerId ?? null,
            workspaceSlug: workspace.slug,
            profile: workspace.profile,
            booking: persistedBooking,
          }),
          notifyWorkspaceOwnerAboutBookingVk({
            ownerId: workspace.ownerId ?? null,
            workspaceSlug: workspace.slug,
            profile: workspace.profile,
            booking: persistedBooking,
          }),
        ]);
      } catch {
        // Booking must stay successful even if bot notifications fail.
      }
    }

    try {
      const existingThread = await fetchChatThreadByBookingId(workspace.id, persistedBooking.id);
      const bookingSummary = `Новая запись: ${bookingShortContext(persistedBooking)}`;

      const thread =
        existingThread ??
        (await createChatThread(workspace.id, {
          clientName: persistedBooking.clientName,
          clientPhone: persistedBooking.clientPhone,
          channel: sourceInfo.chatChannel,
          segment: 'new',
          source: sourceInfo.source,
          nextVisit: persistedBooking.date,
          botConnected: sourceInfo.botConnected,
          unreadCount: 1,
          isPriority: false,
          lastMessagePreview: bookingSummary,
          lastMessageAt: persistedBooking.createdAt,
          metadata: bookingThreadMetadata(persistedBooking, workspace.profile, {
            communicationScenario: sourceInfo.communicationScenario,
          }),
        }));

      if (thread) {
        await createChatMessage(workspace.id, {
          threadId: thread.id,
          author: 'client',
          body: bookingMessageText({
            title: 'Новая запись',
            booking: persistedBooking,
            profile: workspace.profile,
            includeClient: false,
            source: sourceInfo.source,
          }),
          deliveryState: null,
          viaBot: false,
          metadata: {
            bookingId: persistedBooking.id,
            service: persistedBooking.service,
            date: persistedBooking.date,
            time: persistedBooking.time,
          },
        });

        if (persistedBooking.comment) {
          await createChatMessage(workspace.id, {
            threadId: thread.id,
            author: 'client',
            body: persistedBooking.comment,
            deliveryState: null,
            viaBot: false,
            metadata: {
              bookingId: persistedBooking.id,
              kind: 'comment',
            },
          });
        }

        const sentToClientTelegram = sourceInfo.channel === 'telegram' && isNotificationEnabled(workspace, {
          id: 'visit-reminder',
          titleIncludes: 'напомин',
          audience: 'client',
          fallback: true,
        })
          ? await sendClientTelegramMessage({
              workspaceId: workspace.id,
              bookingId: persistedBooking.id,
              clientPhone: persistedBooking.clientPhone,
              clientName: persistedBooking.clientName,
              text: [
                'Запись создана ✅',
                '',
                `Услуга: ${persistedBooking.service || '—'}`,
                `Дата: ${persistedBooking.date}`,
                `Время: ${persistedBooking.time}`,
              ].join('\n'),
            }).catch(() => false)
          : false;

        await updateChatThread(workspace.id, thread.id, {
          clientName: persistedBooking.clientName,
          clientPhone: persistedBooking.clientPhone,
          segment: 'new',
          nextVisit: persistedBooking.date,
          lastMessagePreview: persistedBooking.comment || bookingSummary,
          lastMessageAt: persistedBooking.createdAt,
          unreadCount: (existingThread?.unreadCount ?? 0) + 1,
          botConnected: sourceInfo.botConnected || sentToClientTelegram || thread.botConnected,
          metadata: {
            ...(thread.metadata ?? {}),
            bookingId: persistedBooking.id,
            ...bookingThreadMetadata(persistedBooking, workspace.profile),
            bookingIds: [persistedBooking.id],
            lastClientTelegramDelivery: sentToClientTelegram ? 'delivered' : sourceInfo.channel === 'telegram' ? 'pending_link' : 'phone_fallback',
            communicationScenario: sourceInfo.communicationScenario,
          },
        });
      }
    } catch {
      // /api/chats can synthesize chat rows from bookings if normalized chat tables fail.
    }

    return NextResponse.json({
      booking: persistedBooking,
      workspaceId: workspace.id,
      telegram: telegramBookingLink,
      telegramConfirmationUrl: telegramBookingLink?.url ?? null,
      vk: vkBookingLink,
      vkConfirmationUrl: vkBookingLink?.url ?? null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'unknown_error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = (await request.json()) as {
      bookingId?: string;
      status?: Booking['status'];
    };

    if (!body.bookingId || !body.status) {
      return NextResponse.json({ error: 'booking_id_and_status_required' }, { status: 400 });
    }

    const nextStatus = body.status;
    const bookingId = body.bookingId;

    const workspace = await fetchWorkspaceForUser(user);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const jsonBookings = Array.isArray(workspace.data?.bookings) ? (workspace.data.bookings as Booking[]) : [];
    const tableBookings = await listBookingsByWorkspace(workspace.id).catch(() => [] as Booking[]);
    const currentBookings = mergeBookings(tableBookings, jsonBookings);
    let updatedBooking: Booking | null = null;
    let nextBookings = currentBookings.map((bookingItem) =>
      bookingItem.id === bookingId ? { ...bookingItem, status: nextStatus } : bookingItem,
    );

    try {
      updatedBooking = await updateBookingStatusRecord(workspace.id, bookingId, nextStatus);
      const refreshedTableBookings = await listBookingsByWorkspace(workspace.id).catch(() => [] as Booking[]);
      nextBookings = mergeBookings(refreshedTableBookings, nextBookings);
    } catch {
      updatedBooking = nextBookings.find((bookingItem) => bookingItem.id === bookingId) ?? null;
    }

    if (!updatedBooking) {
      return NextResponse.json({ error: 'booking_not_found' }, { status: 404 });
    }

    await updateWorkspace(workspace.id, {
      data: {
        ...(workspace.data ?? {}),
        bookings: nextBookings,
      },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
