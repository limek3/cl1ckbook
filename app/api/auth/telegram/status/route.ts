import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient, type Session, type User } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
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

function getAppOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (configured) return configured;

  const url = new URL(request.url);
  return url.origin;
}

function telegramEmail(telegramId: number) {
  // Use a normal looking domain. Some auth/email validators are stricter with .local.
  return `telegram_${telegramId}@auth.clickbook.app`;
}

function legacyTelegramEmail(telegramId: number) {
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

function normalizeReason(value: unknown) {
  const raw = errorMessage(value);
  return raw.length > 900 ? `${raw.slice(0, 900)}...` : raw;
}

async function findAuthUserByEmail(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
) {
  for (let page = 1; page <= 20; page += 1) {
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

async function findAuthUserByTelegramEmail(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  telegramId: number,
) {
  const primaryEmail = telegramEmail(telegramId);
  const legacyEmail = legacyTelegramEmail(telegramId);

  return (
    (await findAuthUserByEmail(admin, primaryEmail)) ??
    (await findAuthUserByEmail(admin, legacyEmail))
  );
}

async function getAuthUserById(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
) {
  try {
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

function sessionToTokenResponse(session: Session): TokenResponse {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in ?? 3600,
    token_type: session.token_type,
    user: session.user,
  };
}

async function signInWithPasswordRest(email: string, password: string) {
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
    throw new Error(`password_rest_failed:${text || response.statusText}`);
  }

  return (await response.json()) as TokenResponse;
}

async function signInWithPasswordClient(email: string, password: string) {
  const publicClient = createSupabaseClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await publicClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(`password_client_failed:${error?.message ?? 'session_missing'}`);
  }

  return sessionToTokenResponse(data.session);
}

async function signInWithGeneratedMagicLink(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  email: string,
  redirectTo: string,
) {
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo,
    },
  });

  if (linkError) {
    throw new Error(`magiclink_generate_failed:${linkError.message}`);
  }

  const tokenHash = linkData.properties?.hashed_token;

  if (!tokenHash) {
    throw new Error('magiclink_generate_failed:hashed_token_missing');
  }

  const publicClient = createSupabaseClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await publicClient.auth.verifyOtp({
    type: 'magiclink',
    token_hash: tokenHash,
  });

  if (error || !data.session) {
    throw new Error(`magiclink_verify_failed:${error?.message ?? 'session_missing'}`);
  }

  return sessionToTokenResponse(data.session);
}

async function createSessionForTelegramUser(params: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  email: string;
  password: string;
  redirectTo: string;
}) {
  const reasons: string[] = [];

  try {
    return await signInWithPasswordRest(params.email, params.password);
  } catch (error) {
    reasons.push(normalizeReason(error));
  }

  try {
    return await signInWithPasswordClient(params.email, params.password);
  } catch (error) {
    reasons.push(normalizeReason(error));
  }

  try {
    return await signInWithGeneratedMagicLink(params.admin, params.email, params.redirectTo);
  } catch (error) {
    reasons.push(normalizeReason(error));
  }

  throw new Error(`telegram_session_create_failed:${reasons.join(' | ')}`);
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
    let user = userId ? await getAuthUserById(admin, userId) : null;

    if (!user) {
      user = await findAuthUserByTelegramEmail(admin, telegramId);
      userId = user?.id;
    }

    if (userId) {
      const { error: updateUserError } = await admin.auth.admin.updateUserById(userId, {
        email,
        password,
        email_confirm: true,
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

    const tokenPayload = await createSessionForTelegramUser({
      admin,
      email,
      password,
      redirectTo: `${getAppOrigin(request)}/auth/callback?next=/dashboard`,
    });

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
    const message = normalizeReason(error);

    console.error('[telegram-status]', message);

    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
