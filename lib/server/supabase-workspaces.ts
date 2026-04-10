import 'server-only';

import type { WorkspaceSections, WorkspaceSnapshot } from '@/lib/workspace-store';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabase/env';

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_SERVICE_ROLE_KEY = getSupabaseServiceRoleKey();

async function supabaseRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase request failed: ${response.status}`);
  }

  return response;
}

function mapRow(row: Record<string, unknown>): WorkspaceSnapshot {
  return {
    id: String(row.id),
    ownerId: typeof row.owner_id === 'string' ? row.owner_id : undefined,
    slug: String(row.slug),
    profile: row.profile as WorkspaceSnapshot['profile'],
    data: (row.data as WorkspaceSections | null) ?? {},
    appearance: (row.appearance as WorkspaceSnapshot['appearance']) ?? null,
    createdAt: typeof row.created_at === 'string' ? row.created_at : undefined,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  };
}

async function getSingle(path: string) {
  const response = await supabaseRequest(path);
  const rows = (await response.json()) as Record<string, unknown>[];
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function fetchWorkspaceById(workspaceId: string) {
  return getSingle(`/rest/v1/sloty_workspaces?id=eq.${encodeURIComponent(workspaceId)}&select=*`);
}

export async function fetchWorkspaceByOwner(ownerId: string) {
  return getSingle(`/rest/v1/sloty_workspaces?owner_id=eq.${encodeURIComponent(ownerId)}&select=*`);
}

export async function fetchWorkspaceBySlug(slug: string) {
  return getSingle(`/rest/v1/sloty_workspaces?slug=eq.${encodeURIComponent(slug)}&select=*`);
}

export async function createWorkspace(snapshot: Omit<WorkspaceSnapshot, 'id'> & { id?: string; ownerId: string }) {
  const response = await supabaseRequest('/rest/v1/sloty_workspaces?select=*', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify([
      {
        id: snapshot.id,
        owner_id: snapshot.ownerId,
        slug: snapshot.slug,
        profile: snapshot.profile,
        data: snapshot.data,
        appearance: snapshot.appearance ?? null,
      },
    ]),
  });

  const rows = (await response.json()) as Record<string, unknown>[];
  return mapRow(rows[0]);
}

export async function updateWorkspace(
  workspaceId: string,
  patch: Partial<Pick<WorkspaceSnapshot, 'slug' | 'profile' | 'appearance'>> & { data?: WorkspaceSections },
) {
  const response = await supabaseRequest(`/rest/v1/sloty_workspaces?id=eq.${encodeURIComponent(workspaceId)}&select=*`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify(patch),
  });

  const rows = (await response.json()) as Record<string, unknown>[];
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function ensureUniqueSlug(slug: string, workspaceId?: string | null) {
  const existing = await fetchWorkspaceBySlug(slug);
  if (!existing) return;
  if (!workspaceId || existing.id !== workspaceId) {
    throw new Error('slug_taken');
  }
}
