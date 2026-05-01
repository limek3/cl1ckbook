import { NextResponse } from 'next/server';
import type { Locale } from '@/lib/i18n';
import type { Booking, MasterProfile } from '@/lib/types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { buildWorkspaceSeed } from '@/lib/workspace-store';
import {
  createWorkspace,
  ensureUniqueSlug,
  fetchWorkspaceById,
  fetchWorkspaceForUser,
  updateWorkspace,
} from '@/lib/server/supabase-workspaces';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


function mergeWorkspaceDataForProfile(
  currentData: Record<string, unknown> | null | undefined,
  profile: MasterProfile,
  locale: Locale,
) {
  const data = currentData ?? {};
  const seed = buildWorkspaceSeed(profile, Array.isArray(data.bookings) ? (data.bookings as Booking[]) : [], locale);
  const currentServices = Array.isArray(data.services) ? (data.services as Record<string, unknown>[]) : [];
  const currentByName = new Map(
    currentServices
      .filter((service) => service && typeof service.name === 'string')
      .map((service) => [String(service.name), service]),
  );

  const mergedServices = seed.services.map((service) => ({
    ...service,
    ...(currentByName.get(service.name) ?? {}),
    id: currentByName.get(service.name)?.id ?? service.id,
    name: service.name,
  }));

  for (const service of currentServices) {
    const name = typeof service.name === 'string' ? service.name.trim() : '';
    if (!name) continue;
    if (!mergedServices.some((item) => item.name.trim().toLowerCase() === name.toLowerCase())) {
      mergedServices.push(service as typeof mergedServices[number]);
    }
  }

  return {
    ...data,
    services: mergedServices,
    availability: Array.isArray(data.availability) && data.availability.length > 0
      ? data.availability
      : seed.availability,
    templates: Array.isArray(data.templates) && data.templates.length > 0
      ? data.templates
      : seed.templates,
    notifications: Array.isArray(data.notifications) && data.notifications.length > 0
      ? data.notifications
      : seed.notifications,
  };
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const telegramOwnerId = Number(user.user_metadata?.telegram_id);
    const ownerTelegramId = Number.isFinite(telegramOwnerId) && telegramOwnerId > 0 ? Math.trunc(telegramOwnerId) : null;

    const body = (await request.json()) as {
      workspaceId?: string | null;
      profile?: MasterProfile;
      locale?: Locale;
    };

    if (!body.profile) {
      return NextResponse.json({ error: 'profile_required' }, { status: 400 });
    }

    const ownedWorkspace = await fetchWorkspaceForUser(user);
    const requestedWorkspace = body.workspaceId
      ? await fetchWorkspaceById(body.workspaceId)
      : null;

    if (requestedWorkspace?.ownerId && requestedWorkspace.ownerId !== user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const currentWorkspace = ownedWorkspace ?? requestedWorkspace;

    if (body.workspaceId && currentWorkspace && body.workspaceId !== currentWorkspace.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    await ensureUniqueSlug(body.profile.slug, currentWorkspace?.id ?? null);

    if (currentWorkspace) {
      const updated = await updateWorkspace(currentWorkspace.id, {
        slug: body.profile.slug,
        profile: body.profile,
        data: {
          ...mergeWorkspaceDataForProfile(currentWorkspace.data, body.profile, body.locale ?? 'ru'),
          ...(ownerTelegramId ? { ownerTelegramId } : {}),
        },
      });

      return NextResponse.json(updated);
    }

    const created = await createWorkspace({
      ownerId: user.id,
      slug: body.profile.slug,
      profile: body.profile,
      data: {
        ...buildWorkspaceSeed(body.profile, [], body.locale ?? 'ru'),
        ...(ownerTelegramId ? { ownerTelegramId } : {}),
      },
      appearance: null,
    });

    return NextResponse.json(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (message === 'slug_taken') {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
