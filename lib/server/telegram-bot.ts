const TELEGRAM_DISABLED = true;

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'http://localhost:3000';
}

export function getTelegramBotUsername() {
  return '';
}

export function getTelegramBotDeepLink(_payload?: string) {
  return null;
}

export async function sendTelegramMessage(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function editTelegramMessageText(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function deleteTelegramMessage(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function clearTelegramMessageReplyMarkup(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function answerTelegramCallbackQuery(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export function buildMasterMenuReplyMarkup() {
  return undefined;
}

export async function sendMasterMenu(_chatId: number | string) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function sendMasterBookingNotification(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function sendClientBookingConfirmation(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function sendMasterVisitCheck(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function sendMasterRescheduleRequestNotification(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function sendMasterBookingConfirmedNotice(_params: Record<string, unknown>) {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function setTelegramMenuButton() {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}

export async function setTelegramWebhook() {
  return { ok: false, disabled: TELEGRAM_DISABLED, error: 'telegram_disabled' };
}
