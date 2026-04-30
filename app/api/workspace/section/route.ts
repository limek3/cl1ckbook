import { NextResponse } from 'next/server';

import { requireAuthUser } from '@/lib/server/require-auth-user';
import { fetchWorkspaceByOwner, updateWorkspace } from '@/lib/server/supabase-workspaces';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = (await request.json()) as { workspaceId?: string; section?: string; value?: unknown };

    if (!body.section) {
      return NextResponse.json({ error: 'section_required' }, { status: 400 });
    }

    const workspace = await fetchWorkspaceByOwner(user.id);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (body.workspaceId && body.workspaceId !== workspace.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const nextData = {
      ...(workspace.data ?? {}),
      [body.section]: body.value,
    };

    const updated = await updateWorkspace(workspace.id, { data: nextData });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
