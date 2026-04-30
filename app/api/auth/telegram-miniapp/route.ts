import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import { setTelegramAppSessionCookie } from '@/lib/server/app-session';
import { verifyTelegramMiniAppInitData } from '@/lib/server/telegram-miniapp';
import {
  ensureTelegramAuthUser,
  upsertTelegramAccount,
} from '@/lib/server/telegram-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramMiniAppAuthBody = {
  initData?: string;
};

type ErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  name?: string;
};

function readError(error: unknown) {
  const next = error as ErrorLike;

  return {
    name: next?.name ?? 'Error',
    message:
      next?.message ??
      (typeof error === 'string' ? error : 'telegram_miniapp_auth_failed'),
    code: next?.code ?? null,
    details: next?.details ?? null,
    hint: next?.hint ?? null,
  };
}

function fail(stage: string, error: unknown, status = 500) {
  const info = readError(error);

  console.error('[telegram-miniapp-auth]', {
    stage,
    ...info,
  });

  return NextResponse.json(
    {
      ok: false,
      stage,
      error: info.message,
      code: info.code,
      details: info.details,
      hint: info.hint,
    },
    { status },
  );
}

export async function POST(request: Request) {
  let stage = 'start';

  try {
    stage = 'read_body';

    const body = (await request.json().catch(() => null)) as
      | TelegramMiniAppAuthBody
      | null;

    const initData = body?.initData?.trim();

    if (!initData) {
      return NextResponse.json(
        {
          ok: false,
          stage: 'missing_init_data',
          error:
            'Telegram initData is empty. Open this page from Telegram Mini App button, not as a normal browser link.',
        },
        { status: 400 },
      );
    }

    stage = 'verify_init_data';

    let verified: ReturnType<typeof verifyTelegramMiniAppInitData>;

    try {
      verified = verifyTelegramMiniAppInitData(initData);
    } catch (error) {
      return fail('verify_init_data', error, 401);
    }

    if (!verified?.user?.id) {
      return NextResponse.json(
        {
          ok: false,
          stage: 'missing_telegram_user',
          error: 'Telegram user was not found in initData.',
        },
        { status: 401 },
      );
    }

    stage = 'create_supabase_admin';

    const admin = createSupabaseAdminClient();

    stage = 'select_telegram_account';

    const { data: existingAccount, error: accountError } = await admin
      .from('sloty_telegram_accounts')
      .select('user_id, chat_id')
      .eq('telegram_id', verified.user.id)
      .maybeSingle();

    if (accountError) {
      return fail('select_telegram_account', accountError, 500);
    }

    stage = 'ensure_telegram_auth_user';

    const existingChatId =
      typeof existingAccount?.chat_id === 'number'
        ? existingAccount.chat_id
        : typeof existingAccount?.chat_id === 'string'
          ? Number(existingAccount.chat_id)
          : null;

    const user = await ensureTelegramAuthUser({
      admin,
      telegramId: verified.user.id,
      accountUserId: existingAccount?.user_id as string | undefined,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
      photoUrl: verified.user.photo_url ?? null,
      chatId: Number.isFinite(existingChatId) ? existingChatId : null,
    });

    if (!user?.id) {
      return NextResponse.json(
        {
          ok: false,
          stage: 'ensure_telegram_auth_user',
          error: 'Supabase user was not created or found.',
        },
        { status: 500 },
      );
    }

    stage = 'upsert_telegram_account';

    await upsertTelegramAccount(admin, {
      userId: user.id,
      telegramId: verified.user.id,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
      photoUrl: verified.user.photo_url ?? null,
      chatId: Number.isFinite(existingChatId) ? existingChatId : null,
      authDate: verified.authDate.toISOString(),
    });

    stage = 'create_response';

    const response = NextResponse.json({
      ok: true,
      app_session: true,
      user: {
        id: user.id,
        telegramId: verified.user.id,
        username: verified.user.username ?? null,
        firstName: verified.user.first_name ?? null,
      },
      startParam: verified.startParam ?? null,
    });

    stage = 'set_app_session_cookie';

    return setTelegramAppSessionCookie(response, {
      userId: user.id,
      telegramId: verified.user.id,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
    });
  } catch (error) {
    return fail(stage, error, 500);
  }
}