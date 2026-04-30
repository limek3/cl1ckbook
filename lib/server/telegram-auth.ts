import 'server-only';

import crypto from 'node:crypto';

export type TelegramLoginPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

function timingSafeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');

  if (left.length !== right.length) return false;

  return crypto.timingSafeEqual(left, right);
}

export function verifyTelegramLoginPayload(payload: TelegramLoginPayload) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN');
  }

  if (!payload?.id || !payload?.auth_date || !payload?.hash) {
    throw new Error('telegram_payload_invalid');
  }

  const now = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = 60 * 60 * 24;

  if (now - Number(payload.auth_date) > maxAgeSeconds) {
    throw new Error('telegram_payload_expired');
  }

  const data = Object.entries(payload)
    .filter(([key, value]) => key !== 'hash' && value !== undefined && value !== null)
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  const checkString = data.map(([key, value]) => `${key}=${value}`).join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  if (!timingSafeEqualHex(calculatedHash, payload.hash)) {
    throw new Error('telegram_hash_invalid');
  }

  return {
    telegramId: Number(payload.id),
    username: payload.username ?? null,
    firstName: payload.first_name ?? null,
    lastName: payload.last_name ?? null,
    photoUrl: payload.photo_url ?? null,
    authDate: new Date(Number(payload.auth_date) * 1000).toISOString(),
  };
}