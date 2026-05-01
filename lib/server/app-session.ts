import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

export const APP_SESSION_COOKIE_NAME = 'clickbook_app_session';
export const CLICKBOOK_AUTH_COOKIE = APP_SESSION_COOKIE_NAME;
export const CLICKBOOK_AUTH_COOKIE_LEGACY = 'clickbook_auth_session';

const APP_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type TelegramAppSession = {
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
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
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
    const session = JSON.parse(
      Buffer.from(payload.replaceAll('-', '+').replaceAll('_', '/'), 'base64').toString('utf8'),
    ) as TelegramAppSession;

    if (!session.userId || !session.telegramId || !session.exp) return null;

    if (session.exp < Math.floor(Date.now() / 1000)) return null;

    return session;
  } catch {
    return null;
  }
}

export async function getTelegramAppSession() {
  const cookieStore = await cookies();

  return readTelegramAppSessionToken(
    cookieStore.get(APP_SESSION_COOKIE_NAME)?.value,
  );
}

export function setTelegramAppSessionCookie(
  response: NextResponse,
  input: SetTelegramAppSessionInput,
) {
  const now = Math.floor(Date.now() / 1000);

  const token = encodeSession({
    userId: input.userId,
    telegramId: input.telegramId,
    username: input.username ?? null,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    iat: now,
    exp: now + APP_SESSION_MAX_AGE,
  });

  response.cookies.set(APP_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: APP_SESSION_MAX_AGE,
  });

  return response;
}