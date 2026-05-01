import { NextResponse } from 'next/server';

import { normalizeAvailabilityDays } from '@/lib/availability';
import { listBookingsByWorkspace } from '@/lib/server/supabase-bookings';
import { listAvailabilityDays, listServices } from '@/lib/server/supabase-workspace-sections';
import { fetchWorkspaceBySlug } from '@/lib/server/supabase-workspaces';
import type { Booking } from '@/lib/types';
import { buildWorkspaceSeed } from '@/lib/workspace-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function mergeAvailability(base: unknown[], stored: unknown[], normalized: unknown[]) {
  const seen = new Set<string>();
  const result: unknown[] = [];

  for (const item of [...base, ...stored, ...normalized]) {
    if (!item || typeof item !== 'object') continue;
    const day = item as Record<string, unknown>;
    const key = typeof day.date === 'string'
      ? `date:${day.date}`
      : typeof day.weekdayIndex === 'number'
        ? `weekday:${day.weekdayIndex}`
        : typeof day.weekday_index === 'number'
          ? `weekday:${day.weekday_index}`
          : typeof day.id === 'string'
            ? `id:${day.id}`
            : crypto.randomUUID();

    if (seen.has(key)) {
      const index = result.findIndex((existing) => {
        if (!existing || typeof existing !== 'object') return false;
        const existingDay = existing as Record<string, unknown>;
        const existingKey = typeof existingDay.date === 'string'
          ? `date:${existingDay.date}`
          : typeof existingDay.weekdayIndex === 'number'
            ? `weekday:${existingDay.weekdayIndex}`
            : typeof existingDay.weekday_index === 'number'
              ? `weekday:${existingDay.weekday_index}`
              : typeof existingDay.id === 'string'
                ? `id:${existingDay.id}`
                : '';
        return existingKey === key;
      });
      if (index >= 0) result[index] = item;
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

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
    const storedServices = Array.isArray(workspace.data?.services) ? workspace.data.services : [];
    const normalizedServices = await listServices(workspace.id).catch(() => []);
    const serviceDetails = storedServices.length > 0
      ? storedServices
      : normalizedServices.length > 0
        ? normalizedServices
        : seed.services;
    const storedAvailability = Array.isArray(workspace.data?.availability)
      ? workspace.data.availability
      : [];
    const normalizedAvailability = await listAvailabilityDays(workspace.id).catch(() => []);
    const availability = mergeAvailability(seed.availability, storedAvailability, normalizedAvailability);
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
      availability: normalizeAvailabilityDays(availability),
      services: serviceDetails,
      bookedSlots: bookings.map((booking) => ({
        id: booking.id,
        date: booking.date,
        time: booking.time,
        service: booking.service,
        status: booking.status,
        durationMinutes: (booking as Booking & { durationMinutes?: number | null }).durationMinutes ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'unknown_error' }, { status: 500 });
  }
}
