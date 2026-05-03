import 'server-only';

import type { Booking, MasterProfile } from '@/lib/types';
import { getMasterAddress, getMasterLocationMode, getMasterRouteUrl } from '@/lib/location-links';

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://www.кликбук.рф').replace(/\/$/, '');
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


export async function editTelegramMessageText(params: {
  chatId: number | string;
  messageId: number;
  text: string;
  replyMarkup?: Record<string, unknown> | null;
  parseMode?: 'HTML' | 'MarkdownV2';
}) {
  return telegramApi('editMessageText', {
    chat_id: params.chatId,
    message_id: params.messageId,
    text: params.text,
    parse_mode: params.parseMode,
    disable_web_page_preview: true,
    reply_markup: params.replyMarkup ?? { inline_keyboard: [] },
  });
}

export async function clearTelegramMessageReplyMarkup(params: {
  chatId: number | string;
  messageId: number;
}) {
  return telegramApi('editMessageReplyMarkup', {
    chat_id: params.chatId,
    message_id: params.messageId,
    reply_markup: { inline_keyboard: [] },
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

function buildVisitPlaceLines(profile?: MasterProfile | null) {
  if (!profile || getMasterLocationMode(profile) !== 'address') return ['Формат: онлайн'];

  const address = getMasterAddress(profile);
  const routeUrl = getMasterRouteUrl(profile);

  return [
    address ? `Адрес: ${address}` : null,
    routeUrl ? `Маршрут Яндекс.Карты: ${routeUrl}` : null,
  ].filter(Boolean) as string[];
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
  const placeLines = buildVisitPlaceLines(params.profile);

  return sendTelegramMessage({
    chatId: params.chatId,
    text: [
      'Запись создана ✅',
      '',
      `Мастер: ${masterName}`,
      `Услуга: ${params.booking.service}`,
      `Время: ${bookingDateLabel(params.booking)}`,
      ...placeLines,
      '',
      'За 24 часа до визита пришлём напоминание с подтверждением/переносом, а за 2 часа — адрес и маршрут, если визит офлайн.',
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


export async function sendMasterRescheduleRequestNotification(params: {
  chatId: number | string;
  booking: Booking;
  profile?: MasterProfile | null;
  workspaceSlug: string;
  source?: string;
}) {
  const appUrl = getAppUrl();
  const masterName = params.profile?.name || params.workspaceSlug;

  return sendTelegramMessage({
    chatId: params.chatId,
    text: [
      'Клиент хочет перенос ⚠️',
      '',
      `Мастер: ${masterName}`,
      `Клиент: ${params.booking.clientName}`,
      `Телефон: ${params.booking.clientPhone}`,
      `Услуга: ${params.booking.service}`,
      `Старое время: ${bookingDateLabel(params.booking)}`,
      `Канал: ${params.source || 'Telegram'}`,
      '',
      'Слот освобождён. В чатах КликБук создано предупреждение — подберите новое время и ответьте клиенту.',
    ].join('\n'),
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть чат',
            web_app: {
              url: `${appUrl}/app?redirectTo=${encodeURIComponent('/dashboard/chats')}`,
            },
          },
        ],
        [
          {
            text: 'Веб-кабинет',
            url: `${appUrl}/dashboard/chats`,
          },
        ],
      ],
    },
  });
}

export async function sendMasterBookingConfirmedNotice(params: {
  chatId: number | string;
  booking: Booking;
  profile?: MasterProfile | null;
  workspaceSlug: string;
  source?: string;
}) {
  const appUrl = getAppUrl();
  const masterName = params.profile?.name || params.workspaceSlug;

  return sendTelegramMessage({
    chatId: params.chatId,
    text: [
      'Клиент подтвердил запись ✅',
      '',
      `Мастер: ${masterName}`,
      `Клиент: ${params.booking.clientName}`,
      `Услуга: ${params.booking.service}`,
      `Время: ${bookingDateLabel(params.booking)}`,
      `Канал: ${params.source || 'Telegram'}`,
    ].join('\n'),
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
