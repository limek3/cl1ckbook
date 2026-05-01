import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

export const APP_SESSION_COOKIE_NAME = 'clickbook_app_session';

// Совместимость со старыми файлами проекта
export const CLICKBOOK_AUTH_COOKIE = APP_SESSION_COOKIE_NAME;
export const CLICKBOOK_AUTH_COOKIE_LEGACY = 'clickbook_auth_session';

const APP_SESSION_COOKIE_NAMES = [
  APP_SESSION_COOKIE_NAME,
  CLICKBOOK_AUTH_COOKIE_LEGACY,
] as const;

const APP_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type TelegramAppSession = {
  sub: string;
  userId: string;
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  iat: number;
  exp: number;
};

type SetTelegramAppSessionInput = {
  userId: string;
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

function getSecret() {
  const secret = process.env.APP_SESSION_SECRET;

  if (!secret || secret.length < 24) {
    throw new Error('Missing APP_SESSION_SECRET');
  }

  return secret;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function decodeBase64url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );

  return Buffer.from(padded, 'base64').toString('utf8');
}

function sign(value: string) {
  return base64url(
    crypto.createHmac('sha256', getSecret()).update(value).digest(),
  );
}

function encodeSession(session: TelegramAppSession) {
  const payload = base64url(JSON.stringify(session));
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function readTelegramAppSessionToken(
  token?: string | null,
): TelegramAppSession | null {
  if (!token) return null;

  const [payload, signature] = token.split('.');

  if (!payload || !signature) return null;

  const expected = sign(payload);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64url(payload)) as Partial<TelegramAppSession>;

    const userId = parsed.userId || parsed.sub;

    if (!userId || !parsed.telegramId || !parsed.exp) return null;

    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;

    return {
      sub: userId,
      userId,
      telegramId: parsed.telegramId,
      username: parsed.username ?? null,
      firstName: parsed.firstName ?? null,
      lastName: parsed.lastName ?? null,
      iat: parsed.iat ?? Math.floor(Date.now() / 1000),
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export async function getTelegramAppSession() {
  const cookieStore = await cookies();

  for (const cookieName of APP_SESSION_COOKIE_NAMES) {
    const session = readTelegramAppSessionToken(cookieStore.get(cookieName)?.value);

    if (session) return session;
  }

  return null;
}

export function setTelegramAppSessionCookie(
  response: NextResponse,
  input: SetTelegramAppSessionInput,
) {
  const now = Math.floor(Date.now() / 1000);

  const token = encodeSession({
    sub: input.userId,
    userId: input.userId,
    telegramId: input.telegramId,
    username: input.username ?? null,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    iat: now,
    exp: now + APP_SESSION_MAX_AGE,
  });

  for (const cookieName of APP_SESSION_COOKIE_NAMES) {
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: APP_SESSION_MAX_AGE,
    });
  }

  return response;
}