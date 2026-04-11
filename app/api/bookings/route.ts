import { NextResponse } from 'next/server';
import type { Booking } from '@/lib/types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { createBookingRecord, listBookingsByWorkspace, updateBookingStatusRecord } from '@/lib/server/supabase-bookings';
import {
  createChatMessage,
  createChatThread,
  fetchChatThreadByPhone,
  updateChatThread,
} from '@/lib/server/supabase-chats';
import {
  fetchWorkspaceByOwner,
  fetchWorkspaceBySlug,
  updateWorkspace,
} from '@/lib/server/supabase-workspaces';

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

    const booking = buildClientBooking(body.masterSlug, body.values);
    const currentBookings = Array.isArray(workspace.data?.bookings) ? (workspace.data.bookings as Booking[]) : [];

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
          source: 'Public page',
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

    return NextResponse.json({ booking: persistedBooking, workspaceId: workspace.id });
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

    const workspace = await fetchWorkspaceByOwner(user.id);

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
