import { NextResponse } from 'next/server';
import type { Locale } from '@/lib/i18n';
import type { MasterProfile } from '@/lib/types';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { buildWorkspaceSeed } from '@/lib/workspace-store';
import {
  createWorkspace,
  ensureUniqueSlug,
  fetchWorkspaceById,
  fetchWorkspaceByOwner,
  updateWorkspace,
} from '@/lib/server/supabase-workspaces';

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = (await request.json()) as {
      workspaceId?: string | null;
      profile?: MasterProfile;
      locale?: Locale;
    };

    if (!body.profile) {
      return NextResponse.json({ error: 'profile_required' }, { status: 400 });
    }

    const currentWorkspace = body.workspaceId
      ? await fetchWorkspaceById(body.workspaceId)
      : await fetchWorkspaceByOwner(user.id);

    await ensureUniqueSlug(body.profile.slug, currentWorkspace?.id ?? null);

    if (currentWorkspace) {
      const updated = await updateWorkspace(currentWorkspace.id, {
        slug: body.profile.slug,
        profile: body.profile,
      });

      return NextResponse.json(updated);
    }

    const created = await createWorkspace({
      ownerId: user.id,
      slug: body.profile.slug,
      profile: body.profile,
      data: buildWorkspaceSeed(body.profile, [], body.locale ?? 'ru'),
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
