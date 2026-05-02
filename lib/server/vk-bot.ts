import 'server-only';

import crypto from 'node:crypto';
import type { Booking, MasterProfile } from '@/lib/types';

const VK_API_VERSION = '5.199';

export type VkBotProfile = {
  vkId: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  screenName?: string | null;
  domain?: string | null;
  photoUrl?: string | null;
  rawProfile?: Record<string, unknown>;
};

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export function getVkBotGroupId() {
  return (
    process.env.VK_BOT_GROUP_ID ||
    process.env.VK_GROUP_ID ||
    process.env.NEXT_PUBLIC_VK_BOT_GROUP_ID ||
    ''
  )
    .trim()
    .replace(/^club/i, '')
    .replace(/^-/, '');
}

export function getVkBotScreenName() {
  return (
    process.env.NEXT_PUBLIC_VK_BOT_SCREEN_NAME ||
    process.env.VK_BOT_SCREEN_NAME ||
    process.env.VK_GROUP_SCREEN_NAME ||
    ''
  )
    .replace(/^@/, '')
    .trim();
}

export function getVkBotAccessToken() {
  const value = process.env.VK_BOT_ACCESS_TOKEN || process.env.VK_GROUP_ACCESS_TOKEN || '';
  if (!value.trim()) throw new Error('Missing VK_BOT_ACCESS_TOKEN');
  return value.trim();
}

export function getVkBotDeepLink(payload?: string) {
  const ref = payload ? `?ref=${encodeURIComponent(payload)}` : '';
  const screenName = getVkBotScreenName();

  if (screenName) return `https://vk.me/${screenName}${ref}`;

  const groupId = getVkBotGroupId();
  if (!groupId) return null;

  // For communities without a custom screen name, vk.me/club<ID> is the
  // most reliable link for passing ref into the first incoming message.
  return `https://vk.me/club${groupId}${ref}`;
}

export function getVkBotDialogLink() {
  const screenName = getVkBotScreenName();

  if (screenName) return `https://vk.me/${screenName}`;

  const groupId = getVkBotGroupId();
  if (!groupId) return null;

  return `https://vk.com/write-${groupId}`;
}

export function getVkBotPrefillLink(text: string) {
  const groupId = getVkBotGroupId();
  if (!groupId) return getVkBotDeepLink();

  // VK Web does not guarantee prefilled text in all clients. `msg` works
  // in more desktop builds than `message`, but we still keep ref-based auth
  // as the main path and use this only as a fallback.
  return `https://vk.com/im?sel=-${groupId}&msg=${encodeURIComponent(text)}`;
}

async function readJsonSafe(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { _raw: text };
  }
}

export async function vkApi(method: string, params: Record<string, unknown>) {
  const body = new URLSearchParams();

  body.set('access_token', getVkBotAccessToken());
  body.set('v', VK_API_VERSION);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    body.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  const response = await fetch(`https://api.vk.com/method/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  const payload = await readJsonSafe(response);

  if (!response.ok || payload.error) {
    const error = payload.error && typeof payload.error === 'object'
      ? (payload.error as Record<string, unknown>)
      : payload;
    const message =
      typeof error.error_msg === 'string'
        ? error.error_msg
        : `vk_${method}_failed:${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export function buildVkKeyboard(
  buttons: Array<Array<{
    label: string;
    link?: string;
    payload?: Record<string, unknown>;
    color?: 'primary' | 'secondary' | 'negative' | 'positive';
  }>>,
) {
  return JSON.stringify({
    one_time: false,
    inline: true,
    buttons: buttons.map((row) =>
      row.map((button) => ({
        action: button.link
          ? {
              type: 'open_link',
              label: button.label,
              link: button.link,
              payload: button.payload ? JSON.stringify(button.payload) : undefined,
            }
          : {
              type: 'callback',
              label: button.label,
              payload: JSON.stringify(button.payload ?? {}),
            },
        color: button.color ?? (button.link ? 'primary' : 'secondary'),
      })),
    ),
  });
}

export async function sendVkMessage(params: {
  peerId: number | string;
  message: string;
  keyboard?: string | Record<string, unknown>;
}) {
  return vkApi('messages.send', {
    peer_id: String(params.peerId),
    random_id: crypto.randomInt(1, 2147483647),
    message: params.message,
    disable_mentions: 1,
    dont_parse_links: 1,
    ...(params.keyboard
      ? { keyboard: typeof params.keyboard === 'string' ? params.keyboard : JSON.stringify(params.keyboard) }
      : {}),
  });
}

export async function answerVkMessageEvent(params: {
  eventId: string;
  userId: number | string;
  peerId: number | string;
  text: string;
}) {
  return vkApi('messages.sendMessageEventAnswer', {
    event_id: params.eventId,
    user_id: String(params.userId),
    peer_id: String(params.peerId),
    event_data: JSON.stringify({ type: 'show_snackbar', text: params.text }),
  });
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numericOrString(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.trunc(value));
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

export async function getVkBotUserProfile(vkUserId: number | string): Promise<VkBotProfile> {
  const payload = await vkApi('users.get', {
    user_ids: String(vkUserId),
    fields: 'screen_name,domain,photo_200,first_name,last_name',
  }).catch((error) => ({
    error: error instanceof Error ? error.message : String(error),
    response: [],
  }));

  const rows = Array.isArray(payload.response) ? payload.response : [];
  const profile = rows[0] && typeof rows[0] === 'object' ? (rows[0] as Record<string, unknown>) : null;
  const vkId = numericOrString(profile?.id) || String(vkUserId);
  const firstName = stringValue(profile?.first_name);
  const lastName = stringValue(profile?.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || null;

  return {
    vkId,
    firstName,
    lastName,
    fullName,
    screenName: stringValue(profile?.screen_name),
    domain: stringValue(profile?.domain),
    photoUrl: stringValue(profile?.photo_200),
    rawProfile: profile ? { apiProfile: profile, apiResponse: payload } : { apiResponse: payload },
  };
}


export async function sendVkBotWelcomeMessage(params: {
  peerId: number | string;
  loginUrl?: string | null;
}) {
  const appUrl = getAppUrl();
  const loginUrl = params.loginUrl || `${appUrl}/login`;

  return sendVkMessage({
    peerId: params.peerId,
    message: [
      'Привет! Я бот ClickBook.',
      '',
      'Я помогаю входить в кабинет через VK и присылаю уведомления о записях.',
      '',
      'Для входа нажмите кнопку на сайте. Если вы уже открыли этот диалог по кнопке VK, просто отправьте любое сообщение — я попробую подтвердить вход по служебной ссылке.',
    ].join('\n'),
    keyboard: buildVkKeyboard([
      [{ label: 'Войти в кабинет', link: loginUrl, color: 'primary' }],
      [{ label: 'Открыть сайт', link: appUrl, color: 'secondary' }],
    ]),
  });
}

export async function sendVkBotAuthFallbackMessage(params: {
  peerId: number | string;
  command?: string | null;
}) {
  const appUrl = getAppUrl();

  return sendVkMessage({
    peerId: params.peerId,
    message: [
      'Я получил сообщение, но не вижу активный код входа.',
      '',
      'Нажмите «Войти через VK» на сайте ещё раз. Откроется этот диалог со служебной ссылкой. Обычно достаточно отправить любое сообщение.',
      params.command ? `\nЗапасной код: ${params.command}` : null,
    ].filter(Boolean).join('\n'),
    keyboard: buildVkKeyboard([[{ label: 'Вернуться на вход', link: `${appUrl}/login`, color: 'primary' }]]),
  });
}

function bookingDateLabel(booking: Pick<Booking, 'date' | 'time'>) {
  return `${booking.date} · ${booking.time}`;
}

export async function sendMasterVkBookingNotification(params: {
  peerId: number | string;
  booking: Booking;
  profile?: MasterProfile | null;
  workspaceSlug: string;
}) {
  const appUrl = getAppUrl();
  const masterName = params.profile?.name || params.workspaceSlug;

  return sendVkMessage({
    peerId: params.peerId,
    message: [
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
    keyboard: buildVkKeyboard([
      [{ label: 'Открыть записи', link: `${appUrl}/dashboard/today` }],
      [{ label: 'Кабинет', link: `${appUrl}/dashboard` }],
    ]),
  });
}

export async function sendVkLoginConfirmedMessage(params: {
  peerId: number | string;
  next?: string | null;
}) {
  const appUrl = getAppUrl();
  const next = params.next && params.next.startsWith('/') && !params.next.startsWith('//') ? params.next : '/dashboard';

  return sendVkMessage({
    peerId: params.peerId,
    message: [
      'Готово ✅',
      '',
      'Вход в ClickBook через VK подтверждён.',
      'Вернитесь на сайт — кабинет откроется автоматически.',
    ].join('\n'),
    keyboard: buildVkKeyboard([[{ label: 'Открыть кабинет', link: `${appUrl}${next}`, color: 'primary' }]]),
  });
}
