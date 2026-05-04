import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import { createTelegramAppSessionToken, setTelegramAppSessionCookie } from '@/lib/server/app-session';
import { verifyTelegramMiniAppInitData } from '@/lib/server/telegram-miniapp';
import { upsertTelegramAccount } from '@/lib/server/telegram-user';
import { createTelegramVirtualUserId } from '@/lib/server/telegram-virtual-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramMiniAppAuthBody = {
  initData?: string;
};

function stableTelegramUserId(telegramId: number, accountUserId?: unknown) {
  return typeof accountUserId === 'string' && accountUserId.trim()
    ? accountUserId.trim()
    : createTelegramVirtualUserId(telegramId);
}

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

    // ВАЖНО:
    // Mini App не обязан создавать Supabase Auth user. Раньше именно вызов
    // admin.auth.admin.createUser() часто отдавал GoTrue "Internal Server Error",
    // из-за чего кабинет начинал тупить и повторно пытался чинить пользователя
    // на /api/workspace и /api/chats. Для Mini App держим собственную подписанную
    // app-session: если аккаунт уже был связан — сохраняем его user_id, если нет —
    // используем стабильный детерминированный UUID по telegram_id.
    const userId = stableTelegramUserId(verified.user.id, existingAccount?.user_id);

    await upsertTelegramAccount(admin, {
      userId,
      telegramId: verified.user.id,
      username: verified.user.username ?? null,
      firstName: verified.user.first_name ?? null,
      lastName: verified.user.last_name ?? null,
      photoUrl: verified.user.photo_url ?? null,
      chatId: typeof existingAccount?.chat_id === 'number' ? existingAccount.chat_id : null,
      authDate: verified.authDate.toISOString(),
    });

    const appSessionToken = createTelegramAppSessionToken({
      userId,
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
        id: userId,
        telegramId: verified.user.id,
        username: verified.user.username ?? null,
        firstName: verified.user.first_name ?? null,
      },
      startParam: verified.startParam ?? null,
    });

    return setTelegramAppSessionCookie(response, {
      userId,
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
