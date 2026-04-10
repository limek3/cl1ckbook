
import { NextResponse } from 'next/server';
import { fetchWorkspaceBySlug } from '@/lib/server/supabase-workspaces';

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

    return NextResponse.json({
      profile: workspace.profile,
      appearance: workspace.appearance ?? workspace.data?.appearance ?? null,
      workspaceId: workspace.id,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'unknown_error' }, { status: 500 });
  }
}
