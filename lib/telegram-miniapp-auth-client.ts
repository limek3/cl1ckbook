'use client';

export const CLICKBOOK_AUTH_SESSION_READY_EVENT = 'clickbook:auth-session-ready';

export type TelegramMiniAppAuthPayload = {
  ok?: boolean;
  app_session?: boolean;
  appSessionToken?: string;
  user?: {
    id?: string;
    telegramId?: number;
    username?: string | null;
    firstName?: string | null;
  };
  startParam?: string | null;
  error?: string;
};

/**
 * Temporary Telegram kill switch.
 *
 * Keep the public API so the rest of the app compiles, but do not touch
 * window.Telegram, do not read tgWebAppData, do not call telegram.org, and do
 * not attach app-session headers. This lets us test the normal web app without
 * any Telegram dependency.
 */

export function getStoredTelegramAppSessionToken() {
  return '';
}

export function storeTelegramAppSessionToken(_token?: string | null) {
  // disabled intentionally
}

export function clearTelegramAppSessionToken() {
  // disabled intentionally
}

export function getTelegramAppSessionHeaders(): Record<string, string> {
  return {};
}

export function getTelegramMiniAppInitData() {
  return '';
}

export function hasTelegramMiniAppInitData() {
  return false;
}

export function hasTelegramMiniAppRuntime() {
  return false;
}

export async function waitForTelegramMiniAppInitData(_timeoutMs = 0) {
  return '';
}

export async function authorizeTelegramMiniAppSession(
  _options?: { force?: boolean; waitMs?: number },
): Promise<TelegramMiniAppAuthPayload> {
  return { ok: false, error: 'telegram_disabled' };
}
