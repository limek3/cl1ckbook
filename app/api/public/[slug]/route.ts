import { NextResponse } from 'next/server';
import { buildWorkspaceSeed } from '@/lib/workspace-store';
import { listBookingsByWorkspace } from '@/lib/server/supabase-bookings';
import { fetchWorkspaceBySlug } from '@/lib/server/supabase-workspaces';
import type { Booking } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const workspace = await fetchWorkspaceBySlug(slug);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const bookings = (await listBookingsByWorkspace(workspace.id).catch(() => {
      return Array.isArray(workspace.data?.bookings) ? workspace.data.bookings : [];
    })) as Booking[];
    const seed = buildWorkspaceSeed(workspace.profile, bookings, 'ru');
    const serviceDetails =
      Array.isArray(workspace.data?.services) && workspace.data.services.length > 0
        ? workspace.data.services
        : seed.services;
    const availability =
      Array.isArray(workspace.data?.availability) && workspace.data.availability.length > 0
        ? workspace.data.availability
        : seed.availability;
    const publicServiceNames = serviceDetails
      .filter((service) => {
        if (!service || typeof service !== 'object') return false;
        const item = service as Record<string, unknown>;
        return typeof item.name === 'string' && item.visible !== false && item.status !== 'draft';
      })
      .map((service) => String((service as Record<string, unknown>).name));

    return NextResponse.json({
      profile: publicServiceNames.length > 0
        ? { ...workspace.profile, services: publicServiceNames }
        : workspace.profile,
      appearance: workspace.appearance ?? workspace.data?.appearance ?? null,
      workspaceId: workspace.id,
      availability,
      services: serviceDetails,
      bookedSlots: bookings.map((booking) => ({
        id: booking.id,
        date: booking.date,
        time: booking.time,
        service: booking.service,
        status: booking.status,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'unknown_error' }, { status: 500 });
  }
}
