'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { createClient as createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  authorizeTelegramMiniAppSession,
  getStoredTelegramAppSessionToken,
  getTelegramAppSessionHeaders,
  hasTelegramMiniAppRuntime,
} from '@/lib/telegram-miniapp-auth-client';
import { adaptThreads } from '@/lib/mini-adapter';
import type { Thread, Message } from '@/lib/mini-demo';

const POLL_MS = 15_000;


async function getAuthHeaders(includeJson = false) {
  const headers: Record<string, string> = includeJson ? { 'Content-Type': 'application/json' } : {};

  try {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  } catch {}

  Object.assign(headers, getTelegramAppSessionHeaders());
  return headers;
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>) {
  const headers = new Headers();
  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => headers.set(key, value));
  }
  return headers;
}

async function ensureTelegramMiniAppSessionIfNeeded(options?: { force?: boolean; waitMs?: number }) {
  if (!hasTelegramMiniAppRuntime()) return;
  const hasStoredToken = Boolean(getStoredTelegramAppSessionToken());
  if (hasStoredToken && !options?.force) return;
  await authorizeTelegramMiniAppSession(options);
}

async function fetchWithTelegramMiniAppRetry(input: RequestInfo | URL, init?: RequestInit) {
  const headers = await getAuthHeaders(false);
  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
    cache: init?.cache ?? 'no-store',
    headers: mergeHeaders(headers, init?.headers),
  });

  if (response.status !== 401) return response;

  await ensureTelegramMiniAppSessionIfNeeded({ force: true, waitMs: 2600 });
  if (Object.keys(getTelegramAppSessionHeaders()).length === 0) return response;

  return fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
    cache: init?.cache ?? 'no-store',
    headers: mergeHeaders(init?.headers, await getAuthHeaders(false)),
  });
}

function mergeIncoming(prev: Thread[], fresh: Thread[]): Thread[] {
  return fresh.map((freshThread) => {
    const existing = prev.find((p) => String(p.id) === String(freshThread.id));
    if (!existing) return freshThread;
    const serverKeys = new Set((freshThread.messages ?? []).map((m) => `${m.from}:${m.text}`));
    const stillOptimistic = (existing.messages ?? []).filter(
      (m) => m.from === 'me' && !serverKeys.has(`me:${m.text}`),
    );
    return { ...freshThread, messages: [...(freshThread.messages ?? []), ...stillOptimistic] };
  });
}

export function useChats() {
  const { workspaceId } = useApp();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchThreads = useCallback(async (silent = false) => {
    if (!workspaceId) return;
    try {
      const res = await fetchWithTelegramMiniAppRetry('/api/chats', { credentials: 'include' });
      if (!res.ok || !mountedRef.current) return;
      const data = (await res.json()) as { threads?: unknown[] };
      if (Array.isArray(data?.threads) && mountedRef.current) {
        setThreads((prev) => mergeIncoming(prev, adaptThreads(data.threads as Parameters<typeof adaptThreads>[0])));
      }
    } catch {}
    if (mountedRef.current && !silent) setLoading(false);
    else if (mountedRef.current) setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    mountedRef.current = true;
    if (!workspaceId) { setLoading(false); return; }

    fetchThreads();

    const schedule = () => {
      timerRef.current = setTimeout(async () => {
        await fetchThreads(true);
        if (mountedRef.current) schedule();
      }, POLL_MS);
    };
    schedule();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [workspaceId, fetchThreads]);

  const markRead = useCallback((id: string | number) => {
    const tid = String(id);
    setThreads((prev) => prev.map((t) => String(t.id) === tid ? { ...t, unread: 0 } : t));
    if (tid.startsWith('booking-thread-')) return;
    fetchWithTelegramMiniAppRetry('/api/chats', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: tid, patch: { unreadCount: 0 } }),
    }).catch(() => {});
  }, []);

  const sendMessage = useCallback(async (id: string | number, body: string): Promise<void> => {
    const text = body.trim();
    if (!text) return;
    const tid = String(id);
    const t = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const optimistic: Message = { from: 'me', text, t };

    setThreads((prev) => prev.map((thread) =>
      String(thread.id) !== tid ? thread : {
        ...thread,
        last: text,
        time: t,
        messages: [...(thread.messages ?? []), optimistic],
      },
    ));

    try {
      await fetchWithTelegramMiniAppRetry('/api/chats', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'message', threadId: tid, body: text, author: 'master' }),
      });
    } catch {}

    setTimeout(() => { if (mountedRef.current) fetchThreads(true); }, 2_000);
  }, [fetchThreads]);

  const deleteThread = useCallback(async (id: string | number): Promise<void> => {
    const tid = String(id);
    setThreads((prev) => prev.filter((t) => String(t.id) !== tid));
    try {
      await fetchWithTelegramMiniAppRetry('/api/chats', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: tid }),
      });
    } catch {}
  }, []);

  return {
    threads,
    loading,
    markRead,
    sendMessage,
    deleteThread,
    refresh: () => fetchThreads(true),
  };
}
