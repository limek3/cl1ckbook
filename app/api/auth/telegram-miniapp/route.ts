import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import { createTelegramAppSessionToken, setTelegramAppSessionCookie } from '@/lib/server/app-session';
import { verifyTelegramMiniAppInitData } from '@/lib/server/telegram-miniapp';
import { ensureTelegramAuthUser, upsertTelegramAccount } from '@/lib/server/telegram-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramMiniAppAuthBody = {
  initData?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TelegramMiniAppAuthBody;
    const verified = verifyTelegramMiniAppInitData(body.initData ?? '');
    const admin = createSupabaseAdminClient();

    const { data: existingAccount, error: accountError } = await admin
      .from('sloty_telegram_accounts')
      .select('user_id,chat_id')
      .eq('telegram_id', verified.user.id)
      .maybeSingle();

    if (accountError) throw accountError;

    const user = await ensureTelegramAuthUser({
      admin,
      telegramId: verified.user.id,
      accountUserId: existingAccount?.user_id as string | undefined,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
      photoUrl: verified.user.photo_url ?? null,
      chatId: typeof existingAccount?.chat_id === 'number' ? existingAccount.chat_id : null,
    });

    await upsertTelegramAccount(admin, {
      userId: user.id,
      telegramId: verified.user.id,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
      photoUrl: verified.user.photo_url ?? null,
      chatId: typeof existingAccount?.chat_id === 'number' ? existingAccount.chat_id : null,
      authDate: verified.authDate.toISOString(),
    });

    const appSessionToken = createTelegramAppSessionToken({
      userId: user.id,
      telegramId: verified.user.id,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
    });

    const response = NextResponse.json({
      ok: true,
      app_session: true,
      appSessionToken,
      user: {
        id: user.id,
        telegramId: verified.user.id,
        username: verified.user.username ?? null,
        firstName: verified.user.first_name ?? null,
      },
      startParam: verified.startParam ?? null,
    });

    return setTelegramAppSessionCookie(response, {
      userId: user.id,
      telegramId: verified.user.id,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
      token: appSessionToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'telegram_miniapp_auth_failed';

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 401 },
    );
  }
}
