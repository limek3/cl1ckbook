import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import {
  verifyTelegramLoginPayload,
  type TelegramLoginPayload,
} from '@/lib/server/telegram-auth';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
};

function telegramEmail(telegramId: number) {
  return `telegram_${telegramId}@telegram.clickbook.local`;
}

async function signInWithPassword(email: string, password: string) {
  const response = await fetch(`${getSupabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: getSupabasePublishableKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`supabase_token_failed:${text}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TelegramLoginPayload;
    const telegram = verifyTelegramLoginPayload(payload);

    const admin = createSupabaseAdminClient();

    const email = telegramEmail(telegram.telegramId);
    const password = crypto.randomUUID() + crypto.randomUUID();

    const { data: existingAccount } = await admin
      .from('sloty_telegram_accounts')
      .select('user_id')
      .eq('telegram_id', telegram.telegramId)
      .maybeSingle();

    let userId = existingAccount?.user_id as string | undefined;

    const userMetadata = {
      provider: 'telegram',
      telegram_id: telegram.telegramId,
      telegram_username: telegram.username,
      telegram_first_name: telegram.firstName,
      telegram_last_name: telegram.lastName,
      telegram_photo_url: telegram.photoUrl,
    };

    if (userId) {
      const { error: updateUserError } = await admin.auth.admin.updateUserById(userId, {
        password,
        user_metadata: userMetadata,
        app_metadata: {
          provider: 'telegram',
          providers: ['telegram'],
        },
      });

      if (updateUserError) {
        throw updateUserError;
      }
    } else {
      const { data: createdUser, error: createUserError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: userMetadata,
          app_metadata: {
            provider: 'telegram',
            providers: ['telegram'],
          },
        });

      if (createUserError || !createdUser.user) {
        throw createUserError ?? new Error('telegram_user_create_failed');
      }

      userId = createdUser.user.id;
    }

    const { error: upsertError } = await admin.from('sloty_telegram_accounts').upsert(
      {
        telegram_id: telegram.telegramId,
        user_id: userId,
        username: telegram.username,
        first_name: telegram.firstName,
        last_name: telegram.lastName,
        photo_url: telegram.photoUrl,
        auth_date: telegram.authDate,
        metadata: userMetadata,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'telegram_id',
      },
    );

    if (upsertError) {
      throw upsertError;
    }

    const tokenPayload = await signInWithPassword(email, password);

    return NextResponse.json({
      access_token: tokenPayload.access_token,
      refresh_token: tokenPayload.refresh_token,
      expires_in: tokenPayload.expires_in,
      user: tokenPayload.user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'telegram_auth_failed';

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 401,
      },
    );
  }
}