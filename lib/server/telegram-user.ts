import 'server-only';

import crypto from 'node:crypto';
import type { SupabaseClient, User } from '@supabase/supabase-js';

type TelegramUserInput = {
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  chatId?: number | null;
};

type EnsureTelegramUserParams = TelegramUserInput & {
  admin: SupabaseClient;
  accountUserId?: string | null;
};

export function telegramSyntheticEmail(telegramId: number) {
  return `telegram+${telegramId}@auth.clickbook.app`;
}

function oldSyntheticEmail(telegramId: number) {
  return `telegram_${telegramId}@auth.clickbook.app`;
}

function legacyTelegramEmail(telegramId: number) {
  return `telegram_${telegramId}@telegram.clickbook.local`;
}

function userMatchesTelegram(user: User, telegramId: number) {
  const email = user.email?.toLowerCase();
  const syntheticEmail = telegramSyntheticEmail(telegramId).toLowerCase();
  const oldEmail = oldSyntheticEmail(telegramId).toLowerCase();
  const legacyEmail = legacyTelegramEmail(telegramId).toLowerCase();
  const metadataTelegramId = Number(user.user_metadata?.telegram_id);

  return (
    email === syntheticEmail ||
    email === oldEmail ||
    email === legacyEmail ||
    metadataTelegramId === telegramId
  );
}

async function findUserById(admin: SupabaseClient, userId?: string | null) {
  if (!userId) return null;

  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user) return null;

  return data.user;
}

export async function findTelegramAuthUser(
  admin: SupabaseClient,
  telegramId: number,
  accountUserId?: string | null,
) {
  const byId = await findUserById(admin, accountUserId);
  if (byId) return byId;

  let page = 1;
  const perPage = 1000;

  while (page <= 5) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) return null;

    const found = data.users.find((user) => userMatchesTelegram(user, telegramId));
    if (found) return found;

    if (data.users.length < perPage) return null;
    page += 1;
  }

  return null;
}

function buildTelegramMetadata(params: TelegramUserInput) {
  return {
    provider: 'telegram',
    telegram_id: params.telegramId,
    telegram_username: params.username ?? null,
    telegram_first_name: params.firstName ?? null,
    telegram_last_name: params.lastName ?? null,
    telegram_photo_url: params.photoUrl ?? null,
    telegram_chat_id: params.chatId ?? null,
  };
}

function isDuplicateUserError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const message = 'message' in error ? String(error.message ?? '').toLowerCase() : '';
  const code = 'code' in error ? String(error.code ?? '').toLowerCase() : '';

  return (
    code.includes('email_exists') ||
    message.includes('already') ||
    message.includes('registered') ||
    message.includes('duplicate') ||
    message.includes('exists')
  );
}

export async function ensureTelegramAuthUser(params: EnsureTelegramUserParams) {
  const userMetadata = buildTelegramMetadata(params);

  const existing = await findTelegramAuthUser(
    params.admin,
    params.telegramId,
    params.accountUserId,
  );

  if (existing) {
    const { data, error } = await params.admin.auth.admin.updateUserById(existing.id, {
      user_metadata: {
        ...(existing.user_metadata ?? {}),
        ...userMetadata,
      },
    });

    if (error) {
      console.error('[telegram-user] update existing user failed, using existing user', {
        message: error.message,
        code: error.code,
      });

      return existing;
    }

    return data.user ?? existing;
  }

  const password = crypto.randomBytes(24).toString('hex');

  const createAttempts = [
    {
      email: telegramSyntheticEmail(params.telegramId),
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    },
    {
      email: oldSyntheticEmail(params.telegramId),
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    },
    {
      email: telegramSyntheticEmail(params.telegramId),
      password,
      email_confirm: true,
    },
  ];

  let lastError: unknown = null;

  for (const attempt of createAttempts) {
    const { data, error } = await params.admin.auth.admin.createUser(attempt);

    if (data.user) {
      return data.user;
    }

    if (error) {
      lastError = error;

      const raced = await findTelegramAuthUser(params.admin, params.telegramId);
      if (raced) return raced;

      if (!isDuplicateUserError(error)) {
        console.error('[telegram-user] create user attempt failed', {
          email: attempt.email,
          message: error.message,
          code: error.code,
        });
      }
    }
  }

  const raced = await findTelegramAuthUser(params.admin, params.telegramId);
  if (raced) return raced;

  throw lastError ?? new Error('telegram_user_create_failed');
}

export async function upsertTelegramAccount(
  admin: SupabaseClient,
  params: TelegramUserInput & { userId: string; authDate?: string | null },
) {
  const metadata = buildTelegramMetadata(params);

  const payload: Record<string, unknown> = {
    telegram_id: params.telegramId,
    user_id: params.userId,
    username: params.username ?? null,
    first_name: params.firstName ?? null,
    last_name: params.lastName ?? null,
    photo_url: params.photoUrl ?? null,
    auth_date: params.authDate ?? new Date().toISOString(),
    metadata,
    updated_at: new Date().toISOString(),
  };

  if (typeof params.chatId === 'number') {
    payload.chat_id = params.chatId;
  }

  const { error } = await admin.from('sloty_telegram_accounts').upsert(payload, {
    onConflict: 'telegram_id',
  });

  if (error) throw error;
}