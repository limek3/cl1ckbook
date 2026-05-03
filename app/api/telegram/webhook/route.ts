import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import {
  ensureTelegramAuthUser,
  upsertTelegramAccount,
} from '@/lib/server/telegram-user';
import { isNotificationEnabled } from '@/lib/server/notification-settings';
import { handleClientBookingAction } from '@/lib/server/booking-client-actions';
import { handleRescheduleProposalAction, parseTelegramRescheduleProposalCallback } from '@/lib/server/booking-reschedule-proposals';
import { createBookingReviewLink } from '@/lib/server/booking-reviews';
import { sendVkMessage } from '@/lib/server/vk-bot';
import {
  createChatMessage,
  createChatThread,
  fetchChatThreadByPhone,
  updateChatThread,
} from '@/lib/server/supabase-chats';
import {
  getAppUrl,
  answerTelegramCallbackQuery,
  editTelegramMessageText,
  sendClientBookingConfirmation,
  sendMasterMenu,
  sendTelegramMessage,
} from '@/lib/server/telegram-bot';
import type { Booking, MasterProfile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramFrom = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    text?: string;
    chat: {
      id: number;
      type: string;
    };
    from?: TelegramFrom;
  };
  callback_query?: {
    id: string;
    data?: string;
    from?: TelegramFrom;
    message?: {
      chat?: { id: number; type?: string };
      message_id?: number;
    };
  };
};

type BookingLinkRow = {
  token: string;
  status: 'pending' | 'confirmed' | 'expired';
  workspace_id: string;
  booking_id: string;
  master_slug: string;
  booking_snapshot: Booking | null;
  expires_at: string;
};

type BookingRow = {
  id: string;
  master_slug: string;
  client_name: string;
  client_phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  comment: string | null;
  status: Booking['status'];
  created_at: string;
  source?: string | null;
  channel?: string | null;
};

function logWebhookError(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`[telegram-webhook] ${label}:`, message, error);
}

async function safeTask(label: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    logWebhookError(label, error);
  }
}

function extractAuthToken(text?: string) {
  const value = text?.trim();
  if (!value) return null;

  const patterns = [
    /^\/start\s+auth_([a-f0-9]{32,64})(?:\s|$)/i,
    /^\/start@\w+\s+auth_([a-f0-9]{32,64})(?:\s|$)/i,
    /^auth_([a-f0-9]{32,64})(?:\s|$)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function extractBookingToken(text?: string) {
  const value = text?.trim();
  if (!value) return null;

  const patterns = [
    /^\/start\s+booking_([a-f0-9]{64})(?:\s|$)/i,
    /^\/start@\w+\s+booking_([a-f0-9]{64})(?:\s|$)/i,
    /^booking_([a-f0-9]{64})(?:\s|$)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function isPlainStart(text?: string) {
  return /^\/start(?:@\w+)?\s*$/i.test(text?.trim() ?? '');
}

function mapBookingRow(row: BookingRow): Booking {
  return {
    id: row.id,
    masterSlug: row.master_slug,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    service: row.service,
    date: row.booking_date,
    time: row.booking_time,
    comment: row.comment ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    source: row.source ?? undefined,
    channel: row.channel ?? undefined,
  };
}

function extractVisitCallback(data?: string) {
  const match = data?.match(/^visit:([a-f0-9-]+):(completed|no_show)$/i);

  return match
    ? { bookingId: match[1], status: match[2] as Booking['status'] }
    : null;
}

function extractClientReminderCallback(data?: string) {
  const match = data?.match(/^client_booking:([a-f0-9-]+):(confirm|reschedule)$/i);

  return match
    ? { bookingId: match[1], action: match[2] as 'confirm' | 'reschedule' }
    : null;
}

async function syncWorkspaceBookingStatus(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  workspaceId: string,
  bookingId: string,
  status: Booking['status'],
) {
  const { data: workspace, error } = await admin
    .from('sloty_workspaces')
    .select('data')
    .eq('id', workspaceId)
    .maybeSingle();

  if (error) {
    logWebhookError('syncWorkspaceBookingStatus read failed', error);
    return;
  }

  const workspaceData =
    workspace?.data && typeof workspace.data === 'object'
      ? (workspace.data as Record<string, unknown>)
      : {};

  const jsonBookings = Array.isArray(workspaceData.bookings)
    ? (workspaceData.bookings as Booking[])
    : [];

  const nextBookings = jsonBookings.map((item) =>
    item.id === bookingId
      ? {
          ...item,
          status,
          ...(status === 'completed'
            ? { completedAt: new Date().toISOString() }
            : {}),
          ...(status === 'no_show'
            ? { noShowAt: new Date().toISOString() }
            : {}),
          ...(status === 'cancelled'
            ? { cancelledAt: new Date().toISOString() }
            : {}),
          ...(status === 'confirmed'
            ? { confirmedAt: new Date().toISOString() }
            : {}),
        }
      : item,
  );

  if (nextBookings.length === 0) return;

  const { error: updateError } = await admin
    .from('sloty_workspaces')
    .update({ data: { ...workspaceData, bookings: nextBookings } })
    .eq('id', workspaceId);

  if (updateError) {
    logWebhookError('syncWorkspaceBookingStatus update failed', updateError);
  }
}

async function sendReviewLinkAfterCompleted(params: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  booking: Booking;
  workspaceId: string;
}) {
  const { data: workspace } = await params.admin
    .from('sloty_workspaces')
    .select('slug,profile')
    .eq('id', params.workspaceId)
    .maybeSingle();

  const workspaceSlug = (workspace?.slug as string | undefined) || params.booking.masterSlug;
  const profile = (workspace?.profile as MasterProfile | null | undefined) ?? null;
  const reviewLink = await createBookingReviewLink({
    workspaceId: params.workspaceId,
    booking: params.booking,
    masterSlug: workspaceSlug,
  });

  const message = [
    'Спасибо за визит 💬',
    '',
    `Услуга: ${params.booking.service}`,
    profile?.name ? `Мастер: ${profile.name}` : null,
    '',
    'Будем рады короткому отзыву — он появится в профиле мастера:',
    reviewLink.url,
  ]
    .filter(Boolean)
    .join('\n');

  const tasks: Array<Promise<unknown>> = [];

  const { data: tgLink } = await params.admin
    .from('sloty_booking_telegram_links')
    .select('chat_id')
    .eq('booking_id', params.booking.id)
    .eq('status', 'confirmed')
    .not('chat_id', 'is', null)
    .order('confirmed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const chatId = tgLink?.chat_id as number | string | null | undefined;
  if (chatId) {
    tasks.push(sendTelegramMessage({ chatId, text: message }));
  }

  const { data: vkLink } = await params.admin
    .from('sloty_booking_vk_links')
    .select('peer_id')
    .eq('booking_id', params.booking.id)
    .eq('status', 'confirmed')
    .not('peer_id', 'is', null)
    .order('confirmed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const peerId = vkLink?.peer_id as number | string | null | undefined;
  if (peerId) {
    tasks.push(sendVkMessage({ peerId, message }));
  }

  await Promise.allSettled(tasks);
}

async function handleVisitCallback(params: {
  callbackQueryId: string;
  data?: string;
}) {
  const parsed = extractVisitCallback(params.data);
  if (!parsed) return false;

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: bookingRow, error: bookingError } = await admin
    .from('sloty_bookings')
    .select('*')
    .eq('id', parsed.bookingId)
    .maybeSingle();

  if (bookingError) {
    logWebhookError('handleVisitCallback booking read failed', bookingError);
  }

  const workspaceId = bookingRow?.workspace_id as string | undefined;

  if (!workspaceId) {
    await safeTask('answer visit callback booking not found', () =>
      answerTelegramCallbackQuery({
        callbackQueryId: params.callbackQueryId,
        text: 'Запись не найдена',
      }),
    );

    return true;
  }

  const { error: updateError } = await admin
    .from('sloty_bookings')
    .update({
      status: parsed.status,
      updated_at: now,
      ...(parsed.status === 'completed' ? { completed_at: now } : {}),
      ...(parsed.status === 'no_show' ? { no_show_at: now } : {}),
    })
    .eq('id', parsed.bookingId);

  if (updateError) {
    logWebhookError('handleVisitCallback booking update failed', updateError);
  }

  await syncWorkspaceBookingStatus(
    admin,
    workspaceId,
    parsed.bookingId,
    parsed.status,
  );

  if (parsed.status === 'completed') {
    const booking = mapBookingRow(bookingRow as BookingRow);
    await safeTask('send client review link', () =>
      sendReviewLinkAfterCompleted({ admin, booking, workspaceId }),
    );
  }

  await safeTask('answer visit callback', () =>
    answerTelegramCallbackQuery({
      callbackQueryId: params.callbackQueryId,
      text:
        parsed.status === 'completed'
          ? 'Отмечено: клиент пришёл'
          : 'Отмечено: клиент не пришёл',
    }),
  );

  return true;
}


async function handleClientReminderCallback(params: {
  callbackQueryId: string;
  data?: string;
  chatId?: number | string | null;
  messageId?: number | null;
  from?: TelegramFrom | null;
}) {
  const parsed = extractClientReminderCallback(params.data);
  if (!parsed) return false;

  try {
    const result = await handleClientBookingAction({
      bookingId: parsed.bookingId,
      action: parsed.action,
      source: 'telegram',
      directClientRef: {
        ...(params.chatId ? { clientTelegramChatId: params.chatId } : {}),
        ...(params.from?.id ? { clientTelegramId: params.from.id } : {}),
      },
    });

    if (!result.ok) {
      await safeTask('answer client reminder callback booking not found', () =>
        answerTelegramCallbackQuery({
          callbackQueryId: params.callbackQueryId,
          text: 'Запись не найдена',
        }),
      );

      return true;
    }

    await safeTask('answer client reminder callback', () =>
      answerTelegramCallbackQuery({
        callbackQueryId: params.callbackQueryId,
        text:
          parsed.action === 'confirm'
            ? 'Отлично, запись подтверждена'
            : 'Запрос на перенос отправлен мастеру',
      }),
    );

    const clientText = parsed.action === 'confirm'
      ? 'Спасибо, запись подтверждена ✅\n\nКнопки больше не активны. Мастер увидит подтверждение в кабинете.'
      : 'Поняли, запрос на перенос отправлен мастеру.\n\nСлот освобождён. Мастер подберёт новое время и ответит вам в этом чате.';

    let editedClientMessage = false;

    if (params.chatId && params.messageId) {
      try {
        await editTelegramMessageText({
          chatId: params.chatId as number | string,
          messageId: params.messageId as number,
          text: clientText,
        });
        editedClientMessage = true;
      } catch (error) {
        logWebhookError('edit client reminder callback message', error);
      }
    }

    if (params.chatId && !editedClientMessage) {
      await safeTask('send client reminder callback followup', () =>
        sendTelegramMessage({
          chatId: params.chatId as number | string,
          text: clientText,
        }),
      );
    }
  } catch (error) {
    logWebhookError('handleClientReminderCallback failed', error);

    await safeTask('answer client reminder callback failed', () =>
      answerTelegramCallbackQuery({
        callbackQueryId: params.callbackQueryId,
        text: 'Не удалось обработать действие. Напишите мастеру в чат.',
      }),
    );
  }

  return true;
}


async function handleRescheduleProposalCallback(params: {
  callbackQueryId: string;
  data?: string;
  chatId?: number | string | null;
  messageId?: number | null;
  from?: TelegramFrom | null;
}) {
  const parsed = parseTelegramRescheduleProposalCallback(params.data);
  if (!parsed) return false;

  try {
    const result = await handleRescheduleProposalAction({
      proposalId: parsed.proposalId,
      action: parsed.action,
      source: 'telegram',
      directClientRef: {
        ...(params.chatId ? { clientTelegramChatId: params.chatId } : {}),
        ...(params.from?.id ? { clientTelegramId: params.from.id } : {}),
      },
    });

    await safeTask('answer reschedule proposal callback', () =>
      answerTelegramCallbackQuery({
        callbackQueryId: params.callbackQueryId,
        text: result.ok
          ? parsed.action === 'accept'
            ? 'Перенос подтверждён'
            : 'Мастер подберёт другой слот'
          : 'Предложение не найдено',
      }),
    );

    const clientText = result.ok
      ? parsed.action === 'accept'
        ? 'Спасибо, перенос подтверждён ✅\n\nЗапись обновлена. Кнопки больше не активны.'
        : 'Поняли, это время не подходит.\n\nМастер подберёт другой слот и ответит вам в этом чате. Кнопки больше не активны.'
      : 'Не удалось обработать перенос.\n\nНапишите мастеру обычным сообщением в этот чат.';

    let editedClientMessage = false;

    if (params.chatId && params.messageId) {
      try {
        await editTelegramMessageText({
          chatId: params.chatId as number | string,
          messageId: params.messageId as number,
          text: clientText,
        });
        editedClientMessage = true;
      } catch (error) {
        logWebhookError('edit reschedule proposal callback message', error);
      }
    }

    if (params.chatId && !editedClientMessage) {
      await safeTask('send reschedule proposal followup', () =>
        sendTelegramMessage({
          chatId: params.chatId as number | string,
          text: clientText,
        }),
      );
    }
  } catch (error) {
    logWebhookError('handleRescheduleProposalCallback failed', error);
    await safeTask('answer reschedule proposal callback failed', () =>
      answerTelegramCallbackQuery({
        callbackQueryId: params.callbackQueryId,
        text: 'Не удалось обработать перенос. Напишите мастеру в чат.',
      }),
    );
  }

  return true;
}

async function rememberTelegramUser(params: {
  from: TelegramFrom;
  chatId: number;
}) {
  const admin = createSupabaseAdminClient();

  const { data: existingAccount, error: existingError } = await admin
    .from('sloty_telegram_accounts')
    .select('user_id')
    .eq('telegram_id', params.from.id)
    .maybeSingle();

  if (existingError) {
    logWebhookError('rememberTelegramUser existing account read failed', existingError);
  }

  const user = await ensureTelegramAuthUser({
    admin,
    telegramId: params.from.id,
    accountUserId: existingAccount?.user_id as string | undefined,
    username: params.from.username ?? null,
    firstName: params.from.first_name ?? null,
    lastName: params.from.last_name ?? null,
    photoUrl: null,
    chatId: params.chatId,
  });

  await upsertTelegramAccount(admin, {
    userId: user.id,
    telegramId: params.from.id,
    username: params.from.username ?? null,
    firstName: params.from.first_name ?? null,
    lastName: params.from.last_name ?? null,
    photoUrl: null,
    chatId: params.chatId,
  });

  return user;
}

async function handleAuthStart(params: {
  token: string;
  from: TelegramFrom;
  chatId: number;
  updateId: number;
  messageId: number;
}) {
  const admin = createSupabaseAdminClient();

  // Do not create/update Supabase Auth user inside Telegram webhook.
  // The webhook only confirms the short-lived request; /api/auth/telegram/status
  // creates the app user once the browser finishes the login. This keeps the
  // webhook stable even if Supabase Auth returns a generic GoTrue 500.

  const { data: loginRequest, error: findError } = await admin
    .from('sloty_telegram_login_requests')
    .select('token,status,expires_at')
    .eq('token', params.token)
    .eq('status', 'pending')
    .maybeSingle();

  if (findError) {
    logWebhookError('handleAuthStart find request failed', findError);

    await safeTask('send auth db error message', () =>
      sendTelegramMessage({
        chatId: params.chatId,
        text: 'Не удалось проверить вход. Вернитесь на сайт и нажмите «Войти через Telegram» ещё раз.',
      }),
    );

    return;
  }

  if (!loginRequest) {
    await safeTask('send auth expired message', () =>
      sendTelegramMessage({
        chatId: params.chatId,
        text: 'Ссылка входа уже использована или устарела. Вернитесь на сайт и нажмите «Войти через Telegram» ещё раз.',
      }),
    );

    return;
  }

  const expired =
    loginRequest.expires_at &&
    new Date(loginRequest.expires_at).getTime() < Date.now();

  if (expired) {
    const { error: expireError } = await admin
      .from('sloty_telegram_login_requests')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('token', params.token);

    if (expireError) {
      logWebhookError('handleAuthStart expire request failed', expireError);
    }

    await safeTask('send auth link expired message', () =>
      sendTelegramMessage({
        chatId: params.chatId,
        text: 'Ссылка входа устарела. Вернитесь на сайт и нажмите «Войти через Telegram» ещё раз.',
      }),
    );

    return;
  }

  const { error: updateError } = await admin
    .from('sloty_telegram_login_requests')
    .update({
      status: 'confirmed',
      telegram_id: params.from.id,
      username: params.from.username ?? null,
      first_name: params.from.first_name ?? null,
      last_name: params.from.last_name ?? null,
      photo_url: null,
      chat_id: params.chatId,
      message_id: params.messageId,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        update_id: params.updateId,
        language_code: params.from.language_code ?? null,
      },
    })
    .eq('token', params.token)
    .eq('status', 'pending');

  if (updateError) {
    logWebhookError('handleAuthStart confirm request failed', updateError);

    await safeTask('send auth confirm failed message', () =>
      sendTelegramMessage({
        chatId: params.chatId,
        text: 'Не удалось подтвердить вход. Вернитесь на сайт и нажмите «Войти через Telegram» ещё раз.',
      }),
    );

    return;
  }

  await safeTask('send auth success message', () =>
    sendTelegramMessage({
      chatId: params.chatId,
      text: 'Готово. Вход в веб-кабинет подтверждён. Вернитесь на сайт — он откроется автоматически.',
      replyMarkup: {
        inline_keyboard: [
          [
            {
              text: 'Вернуться на сайт',
              url: `${getAppUrl()}/login`,
            },
          ],
        ],
      },
    }),
  );
}

async function handleBookingStart(params: {
  token: string;
  from: TelegramFrom;
  chatId: number;
}) {
  const admin = createSupabaseAdminClient();

  const { data: linkRow, error: linkError } = await admin
    .from('sloty_booking_telegram_links')
    .select('*')
    .eq('token', params.token)
    .eq('status', 'pending')
    .maybeSingle();

  if (linkError) {
    logWebhookError('handleBookingStart link read failed', linkError);

    await safeTask('send booking link error message', () =>
      sendTelegramMessage({
        chatId: params.chatId,
        text: 'Не удалось проверить подтверждение записи. Попробуйте открыть ссылку ещё раз.',
      }),
    );

    return;
  }

  const link = linkRow as BookingLinkRow | null;

  if (!link) {
    await safeTask('send booking link not found message', () =>
      sendTelegramMessage({
        chatId: params.chatId,
        text: 'Ссылка подтверждения уже использована или устарела. Вернитесь на страницу записи и создайте новую заявку.',
      }),
    );

    return;
  }

  const expired =
    link.expires_at && new Date(link.expires_at).getTime() < Date.now();

  if (expired) {
    const { error: expireError } = await admin
      .from('sloty_booking_telegram_links')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('token', params.token);

    if (expireError) {
      logWebhookError('handleBookingStart expire link failed', expireError);
    }

    await safeTask('send booking expired message', () =>
      sendTelegramMessage({
        chatId: params.chatId,
        text: 'Ссылка подтверждения устарела. Но запись уже создана — мастер получил заявку.',
      }),
    );

    return;
  }

  const { data: workspaceRow, error: workspaceError } = await admin
    .from('sloty_workspaces')
    .select('profile,slug,data')
    .eq('id', link.workspace_id)
    .maybeSingle();

  if (workspaceError) {
    logWebhookError('handleBookingStart workspace read failed', workspaceError);
  }

  const profile = (workspaceRow?.profile as MasterProfile | undefined) ?? null;

  const { data: bookingRow, error: bookingError } = await admin
    .from('sloty_bookings')
    .select('*')
    .eq('id', link.booking_id)
    .maybeSingle();

  if (bookingError) {
    logWebhookError('handleBookingStart booking read failed', bookingError);
  }

  const booking = bookingRow
    ? mapBookingRow(bookingRow as BookingRow)
    : link.booking_snapshot;

  if (!booking) {
    await safeTask('send booking not found message', () =>
      sendTelegramMessage({
        chatId: params.chatId,
        text: 'Запись не найдена. Мастер всё равно получил заявку, но напоминания подключить не удалось.',
      }),
    );

    return;
  }

  const confirmedAt = new Date().toISOString();

  const { error: confirmLinkError } = await admin
    .from('sloty_booking_telegram_links')
    .update({
      status: 'confirmed',
      telegram_id: params.from.id,
      chat_id: params.chatId,
      username: params.from.username ?? null,
      first_name: params.from.first_name ?? null,
      last_name: params.from.last_name ?? null,
      confirmed_at: confirmedAt,
      updated_at: confirmedAt,
    })
    .eq('token', params.token)
    .eq('status', 'pending');

  if (confirmLinkError) {
    logWebhookError('handleBookingStart confirm link failed', confirmLinkError);
  }

  const { error: confirmBookingError } = await admin
    .from('sloty_bookings')
    .update({ status: 'confirmed', source: 'ТГ', channel: 'telegram', updated_at: confirmedAt })
    .eq('id', booking.id)
    .eq('workspace_id', link.workspace_id);

  if (confirmBookingError) {
    logWebhookError('handleBookingStart confirm booking failed', confirmBookingError);
  }

  const workspaceData =
    workspaceRow?.data && typeof workspaceRow.data === 'object'
      ? (workspaceRow.data as Record<string, unknown>)
      : {};

  const jsonBookings = Array.isArray(workspaceData.bookings)
    ? (workspaceData.bookings as Booking[])
    : [];

  const nextBookings = jsonBookings.map((item) =>
    item.id === booking.id
      ? {
          ...item,
          status: 'confirmed' as Booking['status'],
          source: 'ТГ',
          channel: 'telegram',
          clientTelegramConnected: true,
        }
      : item,
  );

  if (nextBookings.length > 0) {
    const { error: workspaceUpdateError } = await admin
      .from('sloty_workspaces')
      .update({ data: { ...workspaceData, bookings: nextBookings } })
      .eq('id', link.workspace_id);

    if (workspaceUpdateError) {
      logWebhookError('handleBookingStart workspace booking update failed', workspaceUpdateError);
    }
  }

  const existingThread = booking.clientPhone
    ? await fetchChatThreadByPhone(link.workspace_id, booking.clientPhone).catch(
        (error) => {
          logWebhookError('handleBookingStart fetch thread failed', error);
          return null;
        },
      )
    : null;

  const thread = existingThread
    ? await updateChatThread(link.workspace_id, existingThread.id, {
        channel: 'Telegram',
        source: 'ТГ',
        botConnected: true,
        metadata: {
          ...(existingThread.metadata ?? {}),
          bookingId: booking.id,
          clientTelegramChatId: params.chatId,
          clientTelegramId: params.from.id,
        },
      }).catch((error) => {
        logWebhookError('handleBookingStart update thread failed', error);
        return existingThread;
      })
    : await createChatThread(link.workspace_id, {
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        channel: 'Telegram',
        segment: 'active',
        source: 'ТГ',
        nextVisit: booking.date,
        botConnected: true,
        lastMessagePreview:
          'Клиент подключил Telegram для подтверждений и напоминаний.',
        lastMessageAt: confirmedAt,
        unreadCount: 0,
        metadata: {
          bookingId: booking.id,
          clientTelegramChatId: params.chatId,
          clientTelegramId: params.from.id,
        },
      }).catch((error) => {
        logWebhookError('handleBookingStart create thread failed', error);
        return null;
      });

  if (thread?.id) {
    await createChatMessage(link.workspace_id, {
      threadId: thread.id,
      author: 'system',
      body: 'Клиент подключил Telegram. Теперь ему можно отправлять сообщения и напоминания из чата.',
      deliveryState: 'delivered',
      viaBot: true,
      metadata: { bookingId: booking.id, kind: 'telegram_connected' },
    }).catch((error) => logWebhookError('handleBookingStart create message failed', error));
  }

  if (
    isNotificationEnabled(
      { data: workspaceData },
      {
        id: 'visit-reminder',
        titleIncludes: 'напомин',
        audience: 'client',
        fallback: true,
      },
    )
  ) {
    await safeTask('sendClientBookingConfirmation', () =>
      sendClientBookingConfirmation({
        chatId: params.chatId,
        booking,
        profile,
      }),
    );
  }
}

async function handleClientChatMessage(params: {
  from: TelegramFrom;
  chatId: number;
  text?: string;
}) {
  const text = params.text?.trim();
  if (!text || text.startsWith('/')) return;

  const admin = createSupabaseAdminClient();

  const { data: linkRows, error: linkRowsError } = await admin
    .from('sloty_booking_telegram_links')
    .select('*')
    .eq('chat_id', params.chatId)
    .eq('status', 'confirmed')
    .order('confirmed_at', { ascending: false })
    .limit(1);

  if (linkRowsError) {
    logWebhookError('handleClientChatMessage link read failed', linkRowsError);
  }

  const link = Array.isArray(linkRows)
    ? (linkRows[0] as BookingLinkRow | undefined)
    : null;

  if (!link) {
    const { data: threadRowsByNumber, error: numberError } = await admin
      .from('sloty_chat_threads')
      .select('id,workspace_id,metadata,unread_count')
      .contains('metadata', { clientTelegramChatId: params.chatId })
      .order('last_message_at', { ascending: false })
      .limit(1);

    if (numberError) {
      logWebhookError('handleClientChatMessage thread number read failed', numberError);
    }

    const { data: threadRowsByString, error: stringError } = await admin
      .from('sloty_chat_threads')
      .select('id,workspace_id,metadata,unread_count')
      .contains('metadata', { clientTelegramChatId: String(params.chatId) })
      .order('last_message_at', { ascending: false })
      .limit(1);

    if (stringError) {
      logWebhookError('handleClientChatMessage thread string read failed', stringError);
    }

    const threadRows =
      Array.isArray(threadRowsByNumber) && threadRowsByNumber.length > 0
        ? threadRowsByNumber
        : threadRowsByString;

    const thread = Array.isArray(threadRows)
      ? (threadRows[0] as
          | {
              id: string;
              workspace_id: string;
              metadata: Record<string, unknown> | null;
              unread_count: number;
            }
          | undefined)
      : null;

    if (!thread?.id || !thread.workspace_id) return;

    const now = new Date().toISOString();

    await createChatMessage(thread.workspace_id, {
      threadId: thread.id,
      author: 'client',
      body: text,
      deliveryState: null,
      viaBot: true,
      metadata: {
        source: 'telegram_inbox',
        clientTelegramChatId: params.chatId,
      },
    }).catch((error) => logWebhookError('handleClientChatMessage create message failed', error));

    await updateChatThread(thread.workspace_id, thread.id, {
      lastMessagePreview: text,
      lastMessageAt: now,
      unreadCount: (thread.unread_count ?? 0) + 1,
      botConnected: true,
      metadata: {
        ...(thread.metadata ?? {}),
        clientTelegramChatId: params.chatId,
        clientTelegramId: params.from.id,
      },
    }).catch((error) => logWebhookError('handleClientChatMessage update thread failed', error));

    return;
  }

  const { data: bookingRow, error: bookingError } = await admin
    .from('sloty_bookings')
    .select('*')
    .eq('id', link.booking_id)
    .maybeSingle();

  if (bookingError) {
    logWebhookError('handleClientChatMessage booking read failed', bookingError);
  }

  const booking = bookingRow
    ? mapBookingRow(bookingRow as BookingRow)
    : link.booking_snapshot;

  if (!booking) return;

  const existingThread = booking.clientPhone
    ? await fetchChatThreadByPhone(link.workspace_id, booking.clientPhone).catch(
        (error) => {
          logWebhookError('handleClientChatMessage fetch thread failed', error);
          return null;
        },
      )
    : null;

  const now = new Date().toISOString();

  const thread = existingThread
    ? await updateChatThread(link.workspace_id, existingThread.id, {
        channel: 'Telegram',
        source: 'ТГ',
        botConnected: true,
        lastMessagePreview: text,
        lastMessageAt: now,
        unreadCount: (existingThread.unreadCount ?? 0) + 1,
        metadata: {
          ...(existingThread.metadata ?? {}),
          bookingId: booking.id,
          clientTelegramChatId: params.chatId,
          clientTelegramId: params.from.id,
        },
      }).catch((error) => {
        logWebhookError('handleClientChatMessage update existing thread failed', error);
        return existingThread;
      })
    : await createChatThread(link.workspace_id, {
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        channel: 'Telegram',
        segment: 'active',
        source: 'Telegram',
        nextVisit: booking.date,
        botConnected: true,
        lastMessagePreview: text,
        lastMessageAt: now,
        unreadCount: 1,
        metadata: {
          bookingId: booking.id,
          clientTelegramChatId: params.chatId,
          clientTelegramId: params.from.id,
        },
      }).catch((error) => {
        logWebhookError('handleClientChatMessage create thread failed', error);
        return null;
      });

  if (!thread?.id) return;

  await createChatMessage(link.workspace_id, {
    threadId: thread.id,
    author: 'client',
    body: text,
    deliveryState: null,
    viaBot: true,
    metadata: { bookingId: booking.id, source: 'telegram_inbox' },
  }).catch((error) => logWebhookError('handleClientChatMessage create linked message failed', error));
}

export async function POST(request: Request) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const receivedSecret =
    request.headers.get('x-telegram-bot-api-secret-token')?.trim() ?? '';

  if (webhookSecret && receivedSecret !== webhookSecret) {
    console.error('[telegram-webhook] forbidden: secret mismatch');

    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: 'secret_mismatch',
    });
  }

  try {
    const update = (await request.json().catch((error) => {
      logWebhookError('invalid json', error);
      return null;
    })) as TelegramUpdate | null;

    if (!update) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    console.log('[telegram-webhook] update received', {
      updateId: update.update_id,
      hasMessage: Boolean(update.message),
      hasCallback: Boolean(update.callback_query),
      text: update.message?.text ?? null,
      from: update.message?.from?.id ?? update.callback_query?.from?.id ?? null,
      chat: update.message?.chat?.id ?? update.callback_query?.message?.chat?.id ?? null,
    });

    const callbackQuery = update.callback_query;

    if (callbackQuery?.id) {
      const visitHandled = await handleVisitCallback({
        callbackQueryId: callbackQuery.id,
        data: callbackQuery.data,
      });

      if (visitHandled) return NextResponse.json({ ok: true });

      const rescheduleProposalHandled = await handleRescheduleProposalCallback({
        callbackQueryId: callbackQuery.id,
        data: callbackQuery.data,
        chatId: callbackQuery.message?.chat?.id ?? null,
        messageId: callbackQuery.message?.message_id ?? null,
        from: callbackQuery.from ?? null,
      });

      if (rescheduleProposalHandled) return NextResponse.json({ ok: true });

      const clientReminderHandled = await handleClientReminderCallback({
        callbackQueryId: callbackQuery.id,
        data: callbackQuery.data,
        chatId: callbackQuery.message?.chat?.id ?? null,
        messageId: callbackQuery.message?.message_id ?? null,
        from: callbackQuery.from ?? null,
      });

      if (clientReminderHandled) return NextResponse.json({ ok: true });
    }

    const message = update.message;

    if (!message || !message.from || message.from.is_bot) {
      return NextResponse.json({ ok: true });
    }

    const authToken = extractAuthToken(message.text);
    const bookingToken = extractBookingToken(message.text);

    if (authToken) {
      await handleAuthStart({
        token: authToken,
        from: message.from,
        chatId: message.chat.id,
        updateId: update.update_id,
        messageId: message.message_id,
      });

      return NextResponse.json({ ok: true });
    }

    if (bookingToken) {
      await handleBookingStart({
        token: bookingToken,
        from: message.from,
        chatId: message.chat.id,
      });

      return NextResponse.json({ ok: true });
    }

    if (isPlainStart(message.text)) {
      await safeTask('plain start rememberTelegramUser', () =>
        rememberTelegramUser({ from: message.from as TelegramFrom, chatId: message.chat.id }),
      );

      await safeTask('plain start sendMasterMenu', () =>
        sendMasterMenu(message.chat.id),
      );

      return NextResponse.json({ ok: true });
    }

    await handleClientChatMessage({
      from: message.from,
      chatId: message.chat.id,
      text: message.text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logWebhookError('fatal', error);

    return NextResponse.json({
      ok: true,
      swallowed: true,
      error: error instanceof Error ? error.message : 'telegram_webhook_failed',
    });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}