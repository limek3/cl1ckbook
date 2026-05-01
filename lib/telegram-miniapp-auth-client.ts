'use client';

export const CLICKBOOK_AUTH_SESSION_READY_EVENT = 'clickbook:auth-session-ready';

export type TelegramMiniAppAuthPayload = {
  ok?: boolean;
  app_session?: boolean;
  user?: {
    id?: string;
    telegramId?: number;
    username?: string | null;
    firstName?: string | null;
  };
  startParam?: string | null;
  error?: string;
};

type TelegramWebApp = {
  initData?: string;
  ready?: () => void;
  expand?: () => void;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

function getTelegramWebApp() {
  if (typeof window === 'undefined') return undefined;
  return (window as TelegramWindow).Telegram?.WebApp;
}

let cachedAuthPromise: Promise<TelegramMiniAppAuthPayload> | null = null;
let hasSuccessfulAuth = false;

export function getTelegramMiniAppInitData() {
  if (typeof window === 'undefined') return '';

  try {
    const webApp = getTelegramWebApp();
    webApp?.ready?.();
    webApp?.expand?.();
    return webApp?.initData || '';
  } catch {
    return getTelegramWebApp()?.initData || '';
  }
}

export function hasTelegramMiniAppInitData() {
  return getTelegramMiniAppInitData().length > 10;
}

function dispatchAuthReady(payload: TelegramMiniAppAuthPayload) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent(CLICKBOOK_AUTH_SESSION_READY_EVENT, {
      detail: payload,
    }),
  );
}

async function readJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as TelegramMiniAppAuthPayload;
  } catch {
    return { error: text } satisfies TelegramMiniAppAuthPayload;
  }
}

export async function authorizeTelegramMiniAppSession(options?: { force?: boolean }) {
  const initData = getTelegramMiniAppInitData();

  if (!initData) {
    return {
      ok: false,
      error: 'telegram_init_data_empty',
    } satisfies TelegramMiniAppAuthPayload;
  }

  if (hasSuccessfulAuth && !options?.force) {
    return {
      ok: true,
      app_session: true,
    } satisfies TelegramMiniAppAuthPayload;
  }

  if (cachedAuthPromise && !options?.force) {
    return cachedAuthPromise;
  }

  cachedAuthPromise = (async () => {
    const response = await fetch('/api/auth/telegram-miniapp', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });

    const payload = await readJsonSafe(response);

    if (!response.ok || !payload.ok) {
      const message = payload.error || 'telegram_miniapp_auth_failed';
      throw new Error(message);
    }

    hasSuccessfulAuth = true;
    dispatchAuthReady(payload);
    return payload;
  })();

  try {
    return await cachedAuthPromise;
  } catch (error) {
    cachedAuthPromise = null;
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'telegram_miniapp_auth_failed',
    } satisfies TelegramMiniAppAuthPayload;
  }
}
