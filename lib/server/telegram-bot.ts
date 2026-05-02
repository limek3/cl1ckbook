import 'server-only';

import type { Booking, MasterProfile } from '@/lib/types';

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://cl1ckbuk.vercel.app').replace(/\/$/, '');
}

export function getTelegramBotUsername() {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim() || '';
}

export function getTelegramBotDeepLink(payload?: string) {
  const username = getTelegramBotUsername();
  if (!username) return null;

  return `https://t.me/${username}${payload ? `?start=${encodeURIComponent(payload)}` : ''}`;
}

async function telegramApi(method: string, body: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`telegram_${method}_failed:${text}`);
  }

  return response.json() as Promise<unknown>;
}

export async function sendTelegramMessage(params: {
  chatId: number | string;
  text: string;
  replyMarkup?: Record<string, unknown>;
  parseMode?: 'HTML' | 'MarkdownV2';
}) {
  return telegramApi('sendMessage', {
    chat_id: params.chatId,
    text: params.text,
    parse_mode: params.parseMode,
    disable_web_page_preview: true,
    ...(params.replyMarkup ? { reply_markup: params.replyMarkup } : {}),
  });
}

export async function answerTelegramCallbackQuery(params: {
  callbackQueryId: string;
  text?: string;
}) {
  return telegramApi('answerCallbackQuery', {
    callback_query_id: params.callbackQueryId,
    ...(params.text ? { text: params.text } : {}),
  });
}

export function buildMasterMenuReplyMarkup() {
  const appUrl = getAppUrl();

  return {
    inline_keyboard: [
      [
        {
          text: 'Открыть кабинет',
          web_app: {
            url: `${appUrl}/app?redirectTo=${encodeURIComponent('/dashboard')}`,
          },
        },
      ],
      [
        {
          text: 'Веб-кабинет',
          url: `${appUrl}/login`,
        },
        {
          text: 'Публичная ссылка',
          url: `${appUrl}/dashboard/profile`,
        },
      ],
      [
        {
          text: 'Помощь',
          url: `${appUrl}/about`,
        },
      ],
    ],
  };
}

export async function sendMasterMenu(chatId: number | string) {
  return sendTelegramMessage({
    chatId,
    text:
      'КликБук готов. Откройте кабинет как Telegram Mini App или войдите в веб-кабинет на сайте.',
    replyMarkup: buildMasterMenuReplyMarkup(),
  });
}

function bookingDateLabel(booking: Pick<Booking, 'date' | 'time'>) {
  return `${booking.date} · ${booking.time}`;
}

export async function sendMasterBookingNotification(params: {
  chatId: number | string;
  booking: Booking;
  profile?: MasterProfile | null;
  workspaceSlug: string;
}) {
  const appUrl = getAppUrl();
  const masterName = params.profile?.name || params.workspaceSlug;

  return sendTelegramMessage({
    chatId: params.chatId,
    text: [
      'Новая запись ✅',
      '',
      `Мастер: ${masterName}`,
      `Клиент: ${params.booking.clientName}`,
      `Телефон: ${params.booking.clientPhone}`,
      `Услуга: ${params.booking.service}`,
      `Время: ${bookingDateLabel(params.booking)}`,
      params.booking.comment ? `Комментарий: ${params.booking.comment}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть записи',
            web_app: {
              url: `${appUrl}/app?redirectTo=${encodeURIComponent('/dashboard/today')}`,
            },
          },
        ],
        [
          {
            text: 'Веб-кабинет',
            url: `${appUrl}/dashboard/today`,
          },
        ],
      ],
    },
  });
}

export async function sendClientBookingConfirmation(params: {
  chatId: number | string;
  booking: Booking;
  profile?: MasterProfile | null;
}) {
  const masterName = params.profile?.name || 'мастеру';
  const address = params.profile?.city ? `\nГород: ${params.profile.city}` : '';

  return sendTelegramMessage({
    chatId: params.chatId,
    text: [
      'Запись создана ✅',
      '',
      `Мастер: ${masterName}`,
      `Услуга: ${params.booking.service}`,
      `Время: ${bookingDateLabel(params.booking)}`,
      address.trim() ? address.trim() : null,
      '',
      'Мы пришлём напоминание ближе к записи. Если нужно перенести или отменить — напишите мастеру.',
    ]
      .filter(Boolean)
      .join('\n'),
  });
}

export async function sendMasterVisitCheck(params: {
  chatId: number | string;
  booking: Booking;
  profile?: MasterProfile | null;
}) {
  const masterName = params.profile?.name || 'мастер';

  return sendTelegramMessage({
    chatId: params.chatId,
    text: [
      'Проверка визита ⏱',
      '',
      `Мастер: ${masterName}`,
      `Клиент: ${params.booking.clientName}`,
      `Услуга: ${params.booking.service}`,
      `Время: ${bookingDateLabel(params.booking)}`,
      '',
      'Клиент пришёл?',
    ].join('\n'),
    replyMarkup: {
      inline_keyboard: [
        [
          { text: 'Да, пришёл', callback_data: `visit:${params.booking.id}:completed` },
          { text: 'Нет, не пришёл', callback_data: `visit:${params.booking.id}:no_show` },
        ],
      ],
    },
  });
}

export async function setTelegramMenuButton() {
  const appUrl = getAppUrl();

  return telegramApi('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Кабинет',
      web_app: {
        url: `${appUrl}/app?redirectTo=${encodeURIComponent('/dashboard')}`,
      },
    },
  });
}


export async function setTelegramWebhook() {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!secret) throw new Error('Missing TELEGRAM_WEBHOOK_SECRET');

  return telegramApi('setWebhook', {
    url: `${getAppUrl()}/api/telegram/webhook`,
    secret_token: secret,
    drop_pending_updates: true,
  });
}
