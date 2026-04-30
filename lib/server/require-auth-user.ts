import 'server-only';

import { headers } from 'next/headers';
import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';

function parseBearerToken(value: string | null) {
  if (!value) return null;

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

async function getRequestBearerToken() {
  try {
    const headerStore = await headers();
    return parseBearerToken(headerStore.get('authorization'));
  } catch {
    return null;
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
  const token = await getRequestBearerToken();

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

  throw new Error('unauthorized');
}
