import 'server-only';

import { headers } from 'next/headers';
import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import { getTelegramAppSessionUser, getTelegramAppSessionUserFromToken } from '@/lib/server/app-session';
import { ensureTelegramAuthUser, upsertTelegramAccount } from '@/lib/server/telegram-user';
import { createTelegramVirtualUser } from '@/lib/server/telegram-virtual-user';

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

function getTelegramIdFromUser(user: User | null) {
  const raw = user?.user_metadata?.telegram_id;
  const value = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? Math.trunc(value) : null;
}

function getStringMetadata(user: User | null, key: string) {
  const value = user?.user_metadata?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function getExistingAuthUser(userId?: string | null) {
  if (!userId) return null;

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

async function repairTelegramAppSessionUser(sessionUser: User | null) {
  if (!sessionUser) return null;

  // The Telegram mini-app stores its own signed session token. If the matching
  // Supabase Auth user was deleted manually, the UI can still look logged in,
  // but profile creation fails on owner_id -> auth.users foreign keys. Always
  // validate the user id and recreate/relink it by telegram_id when needed.
  const existing = await getExistingAuthUser(sessionUser.id);
  if (existing) return existing;

  const telegramId = getTelegramIdFromUser(sessionUser);
  if (!telegramId) return null;

  const admin = createSupabaseAdminClient();

  const { data: account } = await admin
    .from('sloty_telegram_accounts')
    .select('user_id,chat_id,username,first_name,last_name,photo_url')
    .eq('telegram_id', telegramId)
    .maybeSingle();

  const telegramProfile = {
    username: getStringMetadata(sessionUser, 'telegram_username') ?? (typeof account?.username === 'string' ? account.username : null),
    firstName: getStringMetadata(sessionUser, 'telegram_first_name') ?? (typeof account?.first_name === 'string' ? account.first_name : null),
    lastName: getStringMetadata(sessionUser, 'telegram_last_name') ?? (typeof account?.last_name === 'string' ? account.last_name : null),
    photoUrl: getStringMetadata(sessionUser, 'telegram_photo_url') ?? (typeof account?.photo_url === 'string' ? account.photo_url : null),
    chatId: typeof account?.chat_id === 'number' ? account.chat_id : null,
  };

  let user: User;

  try {
    user = await ensureTelegramAuthUser({
      admin,
      telegramId,
      accountUserId: typeof account?.user_id === 'string' ? account.user_id : null,
      ...telegramProfile,
    });
  } catch (error) {
    console.warn(
      '[require-auth-user] Telegram Auth repair failed, using virtual user',
      error instanceof Error ? error.message : 'unknown_error',
    );
    user = createTelegramVirtualUser({ telegramId, ...telegramProfile });
  }

  try {
    await upsertTelegramAccount(admin, {
      userId: user.id,
      telegramId,
      username: getStringMetadata(user, 'telegram_username') ?? telegramProfile.username ?? null,
      firstName: getStringMetadata(user, 'telegram_first_name') ?? telegramProfile.firstName ?? null,
      lastName: getStringMetadata(user, 'telegram_last_name') ?? telegramProfile.lastName ?? null,
      photoUrl: getStringMetadata(user, 'telegram_photo_url') ?? telegramProfile.photoUrl ?? null,
      chatId: telegramProfile.chatId,
    });
  } catch (error) {
    console.warn(
      '[require-auth-user] Telegram account upsert skipped',
      error instanceof Error ? error.message : 'unknown_error',
    );
  }

  return user;
}

export async function requireAuthUser(): Promise<User> {
  const serverSupabase = await createServerSupabaseClient();
  const { data, error } = await serverSupabase.auth.getUser();

  if (!error && data.user) {
    return data.user;
  }

  // Fallback: sometimes the browser has a valid Supabase session, but the
  // API route does not receive/refresh the auth cookie yet on Vercel.
  // Client requests send Authorization: Bearer <access_token>, and we validate
  // that token directly through Supabase Auth.
  const { bearerToken: token, appSessionToken } = await getRequestAuthHeaders();

  // Prefer a real Supabase bearer token over the Telegram app-session fallback.
  // This prevents an old Telegram token in localStorage from overriding a new
  // Google/VK/Supabase session after the previous account was deleted.
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

  const headerTelegramUser = await repairTelegramAppSessionUser(
    getTelegramAppSessionUserFromToken(appSessionToken),
  );

  if (headerTelegramUser) {
    return headerTelegramUser;
  }

  const telegramUser = await repairTelegramAppSessionUser(await getTelegramAppSessionUser());

  if (telegramUser) {
    return telegramUser;
  }

  throw new Error('unauthorized');
}
