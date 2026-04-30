import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
};

type LoginRequestRow = {
  token: string;
  status: 'pending' | 'confirmed' | 'consumed' | 'expired';
  telegram_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  confirmed_at: string | null;
  consumed_at: string | null;
  expires_at: string;
};

function telegramEmail(telegramId: number) {
  return `telegram_${telegramId}@telegram.clickbook.local`;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'telegram_status_failed';
  }
}

async function findAuthUserByEmail(admin: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  // Supabase Admin API does not expose a direct stable "get by email" helper in all versions.
  // This keeps Telegram auth idempotent when a user was created before the account row existed.
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (found) return found;
    if (data.users.length < 1000) return null;
  }

  return null;
}

async function signInWithPassword(email: string, password: string) {
  const publishableKey = getSupabasePublishableKey();

  const response = await fetch(`${getSupabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
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
    throw new Error(`supabase_token_failed:${text || response.statusText}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json({ status: 'invalid' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    const { data, error: requestError } = await admin
      .from('sloty_telegram_login_requests')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (requestError) throw requestError;

    const loginRequest = data as LoginRequestRow | null;

    if (!loginRequest) {
      return NextResponse.json({ status: 'not_found' }, { status: 404 });
    }

    if (loginRequest.status === 'pending') {
      const expired = new Date(loginRequest.expires_at).getTime() < Date.now();

      if (expired) {
        await admin
          .from('sloty_telegram_login_requests')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('token', token);

        return NextResponse.json({ status: 'expired' });
      }

      return NextResponse.json({ status: 'pending' });
    }

    if (loginRequest.status === 'expired') {
      return NextResponse.json({ status: 'expired' });
    }

    if (loginRequest.status === 'consumed' || loginRequest.consumed_at) {
      return NextResponse.json({ status: 'consumed' });
    }

    if (!loginRequest.telegram_id) {
      return NextResponse.json({ status: 'invalid' }, { status: 400 });
    }

    const telegramId = Number(loginRequest.telegram_id);
    const email = telegramEmail(telegramId);
    const password = randomBytes(48).toString('hex');

    const userMetadata = {
      provider: 'telegram',
      telegram_id: telegramId,
      telegram_username: loginRequest.username,
      telegram_first_name: loginRequest.first_name,
      telegram_last_name: loginRequest.last_name,
      telegram_photo_url: loginRequest.photo_url,
    };

    const { data: existingAccount, error: accountError } = await admin
      .from('sloty_telegram_accounts')
      .select('user_id')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (accountError) throw accountError;

    let userId = existingAccount?.user_id as string | undefined;

    if (userId) {
      const { error: updateUserError } = await admin.auth.admin.updateUserById(userId, {
        password,
        user_metadata: userMetadata,
        app_metadata: {
          provider: 'telegram',
          providers: ['telegram'],
        },
      });

      if (updateUserError) throw updateUserError;
    } else {
      const existingUser = await findAuthUserByEmail(admin, email);

      if (existingUser) {
        userId = existingUser.id;

        const { error: updateUserError } = await admin.auth.admin.updateUserById(userId, {
          password,
          user_metadata: userMetadata,
          app_metadata: {
            provider: 'telegram',
            providers: ['telegram'],
          },
        });

        if (updateUserError) throw updateUserError;
      } else {
        const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
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
    }

    const { error: upsertError } = await admin.from('sloty_telegram_accounts').upsert(
      {
        telegram_id: telegramId,
        user_id: userId,
        username: loginRequest.username,
        first_name: loginRequest.first_name,
        last_name: loginRequest.last_name,
        photo_url: loginRequest.photo_url,
        auth_date: loginRequest.confirmed_at,
        metadata: userMetadata,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'telegram_id',
      },
    );

    if (upsertError) throw upsertError;

    const tokenPayload = await signInWithPassword(email, password);

    await admin
      .from('sloty_telegram_login_requests')
      .update({
        status: 'consumed',
        consumed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('token', token);

    return NextResponse.json({
      status: 'confirmed',
      access_token: tokenPayload.access_token,
      refresh_token: tokenPayload.refresh_token,
      expires_in: tokenPayload.expires_in,
      user: tokenPayload.user,
    });
  } catch (error) {
    const message = errorMessage(error);

    console.error('[telegram-status]', message);

    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
