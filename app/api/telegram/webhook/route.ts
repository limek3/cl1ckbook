import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    text?: string;
    chat: {
      id: number;
      type: string;
    };
    from?: {
      id: number;
      is_bot?: boolean;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
};

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://cl1ckbuk.vercel.app').replace(/\/$/, '');
}

function extractAuthToken(text?: string) {
  if (!text) return null;

  const match = text.match(/^\/start\s+auth_([a-f0-9]{64})$/i);
  return match?.[1] ?? null;
}

async function sendTelegramMessage(params: { chatId: number; text: string }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN');
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.text,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Вернуться на сайт',
              url: `${appUrl()}/login`,
            },
          ],
        ],
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`telegram_send_failed:${text}`);
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get('x-telegram-bot-api-secret-token');

  if (webhookSecret && receivedSecret !== webhookSecret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;
    const token = extractAuthToken(message?.text);

    if (!message || !token || !message.from || message.from.is_bot) {
      return NextResponse.json({ ok: true });
    }

    const admin = createSupabaseAdminClient();

    const { data: loginRequest, error: findError } = await admin
      .from('sloty_telegram_login_requests')
      .select('token,status,expires_at')
      .eq('token', token)
      .eq('status', 'pending')
      .maybeSingle();

    if (findError) throw findError;

    if (!loginRequest) {
      await sendTelegramMessage({
        chatId: message.chat.id,
        text: 'Ссылка входа уже использована или устарела. Вернитесь на сайт и нажмите «Войти через Telegram» ещё раз.',
      });

      return NextResponse.json({ ok: true });
    }

    const expired =
      loginRequest.expires_at && new Date(loginRequest.expires_at).getTime() < Date.now();

    if (expired) {
      await admin
        .from('sloty_telegram_login_requests')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('token', token);

      await sendTelegramMessage({
        chatId: message.chat.id,
        text: 'Ссылка входа устарела. Вернитесь на сайт и нажмите «Войти через Telegram» ещё раз.',
      });

      return NextResponse.json({ ok: true });
    }

    await admin
      .from('sloty_telegram_login_requests')
      .update({
        status: 'confirmed',
        telegram_id: message.from.id,
        username: message.from.username ?? null,
        first_name: message.from.first_name ?? null,
        last_name: message.from.last_name ?? null,
        photo_url: null,
        chat_id: message.chat.id,
        message_id: message.message_id,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          update_id: update.update_id,
          language_code: message.from.language_code ?? null,
        },
      })
      .eq('token', token)
      .eq('status', 'pending');

    await sendTelegramMessage({
      chatId: message.chat.id,
      text: 'Готово. Вход в ClickBook подтверждён. Вернитесь на сайт — кабинет откроется автоматически.',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'telegram_webhook_failed';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
