import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

export const CLICKBOOK_AUTH_COOKIE = 'clickbook_auth_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type AppSessionPayload = {
  sub: string;
  provider: 'telegram';
  telegram_id?: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  iat: number;
  exp: number;
};

function getSessionSecret() {
  const value =
    process.env.KEY_VAULTS_SECRET ||
    process.env.TELEGRAM_WEBHOOK_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error('Missing KEY_VAULTS_SECRET for app session signing.');
  }

  return value;
}

function base64url(value: Buffer | string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64url(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function sign(payloadPart: string) {
  return base64url(
    crypto.createHmac('sha256', getSessionSecret()).update(payloadPart).digest(),
  );
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);

  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

export function createTelegramAppSessionToken(params: {
  userId: string;
  telegramId: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AppSessionPayload = {
    sub: params.userId,
    provider: 'telegram',
    telegram_id: params.telegramId,
    username: params.username ?? null,
    first_name: params.firstName ?? null,
    last_name: params.lastName ?? null,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const payloadPart = base64url(JSON.stringify(payload));
  const signaturePart = sign(payloadPart);

  return `${payloadPart}.${signaturePart}`;
}

export function verifyTelegramAppSessionToken(token?: string | null) {
  if (!token) return null;

  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = sign(payloadPart);
  if (!safeEqual(signaturePart, expectedSignature)) return null;

  let payload: AppSessionPayload;

  try {
    payload = JSON.parse(fromBase64url(payloadPart)) as AppSessionPayload;
  } catch {
    return null;
  }

  if (!payload.sub || payload.provider !== 'telegram') return null;
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export function setTelegramAppSessionCookie(
  response: NextResponse,
  params: {
    userId: string;
    telegramId: number;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  },
) {
  const token = createTelegramAppSessionToken(params);

  response.cookies.set(CLICKBOOK_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}

export async function getTelegramAppSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const session = verifyTelegramAppSessionToken(
      cookieStore.get(CLICKBOOK_AUTH_COOKIE)?.value,
    );

    if (!session) return null;

    return {
      id: session.sub,
      aud: 'authenticated',
      role: 'authenticated',
      email: session.telegram_id
        ? `telegram_${session.telegram_id}@auth.clickbook.app`
        : undefined,
      app_metadata: {
        provider: 'telegram',
        providers: ['telegram'],
      },
      user_metadata: {
        provider: 'telegram',
        telegram_id: session.telegram_id,
        telegram_username: session.username,
        telegram_first_name: session.first_name,
        telegram_last_name: session.last_name,
      },
      created_at: new Date(session.iat * 1000).toISOString(),
      updated_at: new Date(session.iat * 1000).toISOString(),
    } as User;
  } catch {
    return null;
  }
}
