import 'server-only';

import { headers } from 'next/headers';
import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';
import { getAppSessionUser, getAppSessionUserFromToken } from '@/lib/server/app-session';

function parseBearerToken(value: string | null) {
  if (!value) return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

async function getRequestAuthHeaders() {
  try {
    const headerStore = await headers();
    return {
      bearerToken: parseBearerToken(headerStore.get('authorization')),
      appSessionToken: headerStore.get('x-clickbook-app-session'),
    };
  } catch {
    return {
      bearerToken: null,
      appSessionToken: null,
    };
  }
}

async function getUserFromBearerToken(token: string): Promise<User | null> {
  const tokenSupabase = createSupabaseClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  const { data, error } = await tokenSupabase.auth.getUser(token);
  return !error && data.user ? data.user : null;
}

export async function requireAuthUser(): Promise<User> {
  const serverSupabase = await createServerSupabaseClient();
  const { data, error } = await serverSupabase.auth.getUser();

  if (!error && data.user) {
    return data.user;
  }

  const { bearerToken, appSessionToken } = await getRequestAuthHeaders();

  // Реальная Supabase-сессия всегда главнее, чтобы VK/Google/пароль не
  // перебивались старым Telegram-токеном из localStorage.
  if (bearerToken) {
    const bearerUser = await getUserFromBearerToken(bearerToken);
    if (bearerUser) return bearerUser;
  }

  // Telegram/VK Mini App живут на собственной подписанной app-session.
  // Не пытаемся на каждом API-запросе пересоздавать auth.users: именно это
  // давало повторяющиеся "Supabase Auth user create failed" и тормозило кабинет.
  const headerAppSessionUser = getAppSessionUserFromToken(appSessionToken);
  if (headerAppSessionUser) return headerAppSessionUser;

  const cookieAppSessionUser = await getAppSessionUser();
  if (cookieAppSessionUser) return cookieAppSessionUser;

  throw new Error('unauthorized');
}
