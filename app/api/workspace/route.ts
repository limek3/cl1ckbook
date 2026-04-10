import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/server/require-auth-user';
import { listBookingsByWorkspace } from '@/lib/server/supabase-bookings';
import { fetchWorkspaceByOwner } from '@/lib/server/supabase-workspaces';

export async function GET() {
  try {
    const user = await requireAuthUser();
    const workspace = await fetchWorkspaceByOwner(user.id);

    if (!workspace) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const bookings = await listBookingsByWorkspace(workspace.id).catch(() => {
      return Array.isArray(workspace.data?.bookings) ? workspace.data.bookings : [];
    });

    return NextResponse.json({
      ...workspace,
      data: {
        ...(workspace.data ?? {}),
        bookings,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message === 'unauthorized') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
