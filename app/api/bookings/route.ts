import { NextResponse } from 'next/server';

import { isSlotAvailable, normalizeAvailabilityDays, normalizeServiceDetails } from '@/lib/availability';
import { buildWorkspaceSeed } from '@/lib/workspace-store';
import type { Booking } from '@/lib/types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { createClientTelegramBookingLink, notifyWorkspaceOwnerAboutBooking } from '@/lib/server/booking-telegram';
import { createBookingRecord, listBookingsByWorkspace, updateBookingStatusRecord } from '@/lib/server/supabase-bookings';
import {
  createChatMessage,
  createChatThread,
  fetchChatThreadByPhone,
  updateChatThread,
} from '@/lib/server/supabase-chats';
import { listAvailabilityDays, listServices } from '@/lib/server/supabase-workspace-sections';
import {
  fetchWorkspaceForUser,
  fetchWorkspaceBySlug,
  updateWorkspace,
} from '@/lib/server/supabase-workspaces';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function buildClientBooking(masterSlug: string, values: Omit<Booking, 'id' | 'masterSlug' | 'status' | 'createdAt'>): Booking {
  return {
    id: crypto.randomUUID(),
    masterSlug,
    clientName: values.clientName.trim(),
    clientPhone: values.clientPhone.trim(),
    service: values.service.trim(),
    date: values.date,
    time: values.time,
    comment: values.comment?.trim() || undefined,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      masterSlug?: string;
      values?: Omit<Booking, 'id' | 'masterSlug' | 'status' | 'createdAt'>;
    };

    if (!body.masterSlug || !body.values) {
      return NextResponse.json({ error: 'master_slug_and_values_required' }, { status: 400 });
    }

    const workspace = await fetchWorkspaceBySlug(body.masterSlug);

    if (!workspace) {
      return NextResponse.json({ error: 'master_not_found' }, { status: 404 });
    }

    const currentBookings = await listBookingsByWorkspace(workspace.id).catch(() => {
      return Array.isArray(workspace.data?.bookings) ? (workspace.data.bookings as Booking[]) : [];
    });

    const requestedService = body.values.service.trim();
    const profileServices = Array.isArray(workspace.profile?.services) ? workspace.profile.services : [];
    const normalizedServices = await listServices(workspace.id).catch(() => []);
    const storedServiceDetails = normalizeServiceDetails(workspace.data?.services);
    const seed = buildWorkspaceSeed(workspace.profile, currentBookings, 'ru');
    const effectiveServiceDetails = storedServiceDetails.length > 0
      ? storedServiceDetails
      : normalizedServices.length > 0
        ? normalizedServices
        : seed.services;
    const hasServiceInDetails = effectiveServiceDetails.some(
      (service) =>
        service.name === requestedService &&
        service.visible !== false &&
        service.status !== 'draft',
    );
    const hasServiceInProfile = profileServices.includes(requestedService);

    if (!hasServiceInDetails && !hasServiceInProfile) {
      return NextResponse.json({ error: 'service_not_available' }, { status: 400 });
    }

    const storedAvailability = Array.isArray(workspace.data?.availability)
      ? workspace.data.availability
      : [];
    const normalizedAvailability = await listAvailabilityDays(workspace.id).catch(() => []);
    const availability = normalizeAvailabilityDays([
      ...seed.availability,
      ...storedAvailability,
      ...normalizedAvailability,
    ]);
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

    const booking = buildClientBooking(body.masterSlug, body.values);

    let persistedBooking = booking;
    let nextBookings = [booking, ...currentBookings];

    try {
      persistedBooking = (await createBookingRecord(workspace.id, booking)) ?? booking;
      nextBookings = await listBookingsByWorkspace(workspace.id);
    } catch {
      nextBookings = [persistedBooking, ...currentBookings];
    }

    await updateWorkspace(workspace.id, {
      data: {
        ...(workspace.data ?? {}),
        bookings: nextBookings,
      },
    });

    let telegramBookingLink: { token: string; url: string | null } | null = null;

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
      await notifyWorkspaceOwnerAboutBooking({
        ownerId: workspace.ownerId ?? null,
        workspaceSlug: workspace.slug,
        profile: workspace.profile,
        booking: persistedBooking,
      });
    } catch {
      // Booking must stay successful even if Telegram notification fails.
    }

    try {
      const existingThread = await fetchChatThreadByPhone(workspace.id, persistedBooking.clientPhone);
      const bookingSummary = `Booking: ${persistedBooking.service} · ${persistedBooking.date} ${persistedBooking.time}`;

      const thread =
        existingThread ??
        (await createChatThread(workspace.id, {
          clientName: persistedBooking.clientName,
          clientPhone: persistedBooking.clientPhone,
          channel: 'Telegram',
          segment: 'new',
          source: 'Публичная страница',
          nextVisit: persistedBooking.date,
          botConnected: true,
          unreadCount: 1,
          isPriority: false,
          lastMessagePreview: bookingSummary,
          lastMessageAt: persistedBooking.createdAt,
        }));

      if (thread) {
        await createChatMessage(workspace.id, {
          threadId: thread.id,
          author: 'client',
          body: bookingSummary,
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

        await updateChatThread(workspace.id, thread.id, {
          clientName: persistedBooking.clientName,
          clientPhone: persistedBooking.clientPhone,
          segment: 'new',
          nextVisit: persistedBooking.date,
          lastMessagePreview: persistedBooking.comment || bookingSummary,
          lastMessageAt: persistedBooking.createdAt,
          unreadCount: (existingThread?.unreadCount ?? 0) + 1,
        });
      }
    } catch {
      // Keep public booking flow resilient even if inbox tables are not migrated yet.
    }

    return NextResponse.json({ booking: persistedBooking, workspaceId: workspace.id, telegram: telegramBookingLink });
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

    const workspace = await fetchWorkspaceForUser(user);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const currentBookings = Array.isArray(workspace.data?.bookings) ? (workspace.data.bookings as Booking[]) : [];
    let updatedBooking: Booking | null = null;
    let nextBookings = currentBookings.map((booking) =>
      booking.id === body.bookingId ? { ...booking, status: body.status } : booking,
    );

    try {
      updatedBooking = await updateBookingStatusRecord(workspace.id, body.bookingId, body.status);
      nextBookings = await listBookingsByWorkspace(workspace.id);
    } catch {
      updatedBooking = nextBookings.find((booking) => booking.id === body.bookingId) ?? null;
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
