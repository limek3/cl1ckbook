import 'server-only';

import { headers } from 'next/headers';
import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';
import { getTelegramAppSessionUser, getTelegramAppSessionUserFromToken } from '@/lib/server/app-session';

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

export async function requireAuthUser(): Promise<User> {
  const serverSupabase = await createServerSupabaseClient();
  const { data, error } = await serverSupabase.auth.getUser();

  if (!error && data.user) {
    return data.user;
  }

  // Fallback: sometimes the browser has a valid Supabase session, but the
  // API route does not receive/refesh the auth cookie yet on Vercel.
  // Client requests send Authorization: Bearer <access_token>, and we validate
  // that token directly through Supabase Auth.
  const { bearerToken: token, appSessionToken } = await getRequestAuthHeaders();

  const headerTelegramUser = getTelegramAppSessionUserFromToken(appSessionToken);

  if (headerTelegramUser) {
    return headerTelegramUser;
  }

  if (token) {
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

    const { data: tokenData, error: tokenError } = await tokenSupabase.auth.getUser(token);

    if (!tokenError && tokenData.user) {
      return tokenData.user;
    }
  }

  const telegramUser = await getTelegramAppSessionUser();

  if (telegramUser) {
    return telegramUser;
  }

  throw new Error('unauthorized');
}
