import 'server-only';

import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getTelegramAppSession } from '@/lib/server/app-session';

function buildTelegramUser(session: NonNullable<Awaited<ReturnType<typeof getTelegramAppSession>>>): User {
  return {
    id: session.userId,
    aud: 'authenticated',
    role: 'authenticated',
    email: `telegram+${session.telegramId}@auth.clickbook.app`,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {
      provider: 'telegram',
      providers: ['telegram'],
    },
    user_metadata: {
      provider: 'telegram',
      telegram_id: session.telegramId,
      telegram_username: session.username ?? null,
      telegram_first_name: session.firstName ?? null,
      telegram_last_name: session.lastName ?? null,
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  } as User;
}

export async function requireAuthUser(): Promise<User> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (!error && data.user) {
      return data.user;
    }
  } catch {
    // fallback ниже
  }

  const appSession = await getTelegramAppSession();

  if (appSession) {
    return buildTelegramUser(appSession);
  }

  throw new Error('unauthorized');
}