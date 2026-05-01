import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import { ensureTelegramAuthUser, upsertTelegramAccount } from '@/lib/server/telegram-user';
import { isNotificationEnabled } from '@/lib/server/notification-settings';
import { createChatMessage, createChatThread, fetchChatThreadByPhone, updateChatThread } from '@/lib/server/supabase-chats';
import {
  getAppUrl,
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
};

function extractAuthToken(text?: string) {
  const value = text?.trim();
  if (!value) return null;

  const patterns = [
    /^\/start\s+auth_([a-f0-9]{64})(?:\s|$)/i,
    /^\/start@\w+\s+auth_([a-f0-9]{64})(?:\s|$)/i,
    /^auth_([a-f0-9]{64})(?:\s|$)/i,
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
  };
}

async function rememberTelegramUser(params: {
  from: TelegramFrom;
  chatId: number;
}) {
  const admin = createSupabaseAdminClient();

  const { data: existingAccount } = await admin
    .from('sloty_telegram_accounts')
    .select('user_id')
    .eq('telegram_id', params.from.id)
    .maybeSingle();

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

  await rememberTelegramUser({ from: params.from, chatId: params.chatId });

  const { data: loginRequest, error: findError } = await admin
    .from('sloty_telegram_login_requests')
    .select('token,status,expires_at')
    .eq('token', params.token)
    .eq('status', 'pending')
    .maybeSingle();

  if (findError) throw findError;

  if (!loginRequest) {
    await sendTelegramMessage({
      chatId: params.chatId,
      text: 'Ссылка входа уже использована или устарела. Вернитесь на сайт и нажмите «Войти через Telegram» ещё раз.',
    });
    return;
  }

  const expired =
    loginRequest.expires_at && new Date(loginRequest.expires_at).getTime() < Date.now();

  if (expired) {
    await admin
      .from('sloty_telegram_login_requests')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('token', params.token);

    await sendTelegramMessage({
      chatId: params.chatId,
      text: 'Ссылка входа устарела. Вернитесь на сайт и нажмите «Войти через Telegram» ещё раз.',
    });
    return;
  }

  await admin
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

  await sendTelegramMessage({
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
  });
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

  if (linkError) throw linkError;

  const link = linkRow as BookingLinkRow | null;

  if (!link) {
    await sendTelegramMessage({
      chatId: params.chatId,
      text: 'Ссылка подтверждения уже использована или устарела. Вернитесь на страницу записи и создайте новую заявку.',
    });
    return;
  }

  const expired = link.expires_at && new Date(link.expires_at).getTime() < Date.now();

  if (expired) {
    await admin
      .from('sloty_booking_telegram_links')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('token', params.token);

    await sendTelegramMessage({
      chatId: params.chatId,
      text: 'Ссылка подтверждения устарела. Но запись уже создана — мастер получил заявку.',
    });
    return;
  }

  const { data: workspaceRow } = await admin
    .from('sloty_workspaces')
    .select('profile,slug,data')
    .eq('id', link.workspace_id)
    .maybeSingle();

  const profile = (workspaceRow?.profile as MasterProfile | undefined) ?? null;

  const { data: bookingRow } = await admin
    .from('sloty_bookings')
    .select('*')
    .eq('id', link.booking_id)
    .maybeSingle();

  const booking = bookingRow
    ? mapBookingRow(bookingRow as BookingRow)
    : link.booking_snapshot;

  if (!booking) {
    await sendTelegramMessage({
      chatId: params.chatId,
      text: 'Запись не найдена. Мастер всё равно получил заявку, но напоминания подключить не удалось.',
    });
    return;
  }

  const confirmedAt = new Date().toISOString();

  await admin
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

  await admin
    .from('sloty_bookings')
    .update({ status: 'confirmed', updated_at: confirmedAt })
    .eq('id', booking.id)
    .eq('workspace_id', link.workspace_id)
    .then(() => undefined, () => undefined);

  const workspaceData = (workspaceRow?.data && typeof workspaceRow.data === 'object'
    ? (workspaceRow.data as Record<string, unknown>)
    : {}) as Record<string, unknown>;
  const jsonBookings = Array.isArray(workspaceData.bookings) ? (workspaceData.bookings as Booking[]) : [];
  const nextBookings = jsonBookings.map((item) =>
    item.id === booking.id
      ? { ...item, status: 'confirmed' as Booking['status'], clientTelegramConnected: true }
      : item,
  );

  if (nextBookings.length > 0) {
    await admin
      .from('sloty_workspaces')
      .update({ data: { ...workspaceData, bookings: nextBookings } })
      .eq('id', link.workspace_id)
      .then(() => undefined, () => undefined);
  }

  const existingThread = booking.clientPhone
    ? await fetchChatThreadByPhone(link.workspace_id, booking.clientPhone).catch(() => null)
    : null;
  const thread = existingThread
    ? await updateChatThread(link.workspace_id, existingThread.id, {
        botConnected: true,
        metadata: {
          ...(existingThread.metadata ?? {}),
          bookingId: booking.id,
          clientTelegramChatId: params.chatId,
          clientTelegramId: params.from.id,
        },
      }).catch(() => existingThread)
    : await createChatThread(link.workspace_id, {
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        channel: 'Telegram',
        segment: 'active',
        source: 'Публичная страница',
        nextVisit: booking.date,
        botConnected: true,
        lastMessagePreview: 'Клиент подключил Telegram для подтверждений и напоминаний.',
        lastMessageAt: confirmedAt,
        unreadCount: 0,
        metadata: {
          bookingId: booking.id,
          clientTelegramChatId: params.chatId,
          clientTelegramId: params.from.id,
        },
      }).catch(() => null);

  if (thread?.id) {
    await createChatMessage(link.workspace_id, {
      threadId: thread.id,
      author: 'system',
      body: 'Клиент подключил Telegram. Теперь ему можно отправлять сообщения и напоминания из чата.',
      deliveryState: 'delivered',
      viaBot: true,
      metadata: { bookingId: booking.id, kind: 'telegram_connected' },
    }).catch(() => null);
  }

  if (
    isNotificationEnabled({ data: workspaceData }, {
      id: 'visit-reminder',
      titleIncludes: 'напомин',
      audience: 'client',
      fallback: true,
    })
  ) {
    await sendClientBookingConfirmation({
      chatId: params.chatId,
      booking,
      profile,
    });
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

  const { data: linkRows } = await admin
    .from('sloty_booking_telegram_links')
    .select('*')
    .eq('chat_id', params.chatId)
    .eq('status', 'confirmed')
    .order('confirmed_at', { ascending: false })
    .limit(1);

  const link = Array.isArray(linkRows) ? (linkRows[0] as BookingLinkRow | undefined) : null;
  if (!link) {
    const { data: threadRowsByNumber } = await admin
      .from('sloty_chat_threads')
      .select('id,workspace_id,metadata,unread_count')
      .contains('metadata', { clientTelegramChatId: params.chatId })
      .order('last_message_at', { ascending: false })
      .limit(1);

    const { data: threadRowsByString } = await admin
      .from('sloty_chat_threads')
      .select('id,workspace_id,metadata,unread_count')
      .contains('metadata', { clientTelegramChatId: String(params.chatId) })
      .order('last_message_at', { ascending: false })
      .limit(1);

    const threadRows = Array.isArray(threadRowsByNumber) && threadRowsByNumber.length > 0
      ? threadRowsByNumber
      : threadRowsByString;

    const thread = Array.isArray(threadRows)
      ? (threadRows[0] as { id: string; workspace_id: string; metadata: Record<string, unknown> | null; unread_count: number } | undefined)
      : null;

    if (!thread?.id || !thread.workspace_id) return;

    const now = new Date().toISOString();
    await createChatMessage(thread.workspace_id, {
      threadId: thread.id,
      author: 'client',
      body: text,
      deliveryState: null,
      viaBot: true,
      metadata: { source: 'telegram_inbox', clientTelegramChatId: params.chatId },
    }).catch(() => null);

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
    }).catch(() => null);

    return;
  }

  const { data: bookingRow } = await admin
    .from('sloty_bookings')
    .select('*')
    .eq('id', link.booking_id)
    .maybeSingle();

  const booking = bookingRow ? mapBookingRow(bookingRow as BookingRow) : link.booking_snapshot;
  if (!booking) return;

  const existingThread = booking.clientPhone
    ? await fetchChatThreadByPhone(link.workspace_id, booking.clientPhone).catch(() => null)
    : null;
  const thread = existingThread
    ? await updateChatThread(link.workspace_id, existingThread.id, {
        botConnected: true,
        lastMessagePreview: text,
        lastMessageAt: new Date().toISOString(),
        unreadCount: (existingThread.unreadCount ?? 0) + 1,
        metadata: {
          ...(existingThread.metadata ?? {}),
          bookingId: booking.id,
          clientTelegramChatId: params.chatId,
          clientTelegramId: params.from.id,
        },
      }).catch(() => existingThread)
    : await createChatThread(link.workspace_id, {
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        channel: 'Telegram',
        segment: 'active',
        source: 'Telegram',
        nextVisit: booking.date,
        botConnected: true,
        lastMessagePreview: text,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 1,
        metadata: {
          bookingId: booking.id,
          clientTelegramChatId: params.chatId,
          clientTelegramId: params.from.id,
        },
      }).catch(() => null);

  if (!thread?.id) return;

  await createChatMessage(link.workspace_id, {
    threadId: thread.id,
    author: 'client',
    body: text,
    deliveryState: null,
    viaBot: true,
    metadata: { bookingId: booking.id, source: 'telegram_inbox' },
  }).catch(() => null);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get('x-telegram-bot-api-secret-token');

  if (webhookSecret && receivedSecret !== webhookSecret) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
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
      await rememberTelegramUser({ from: message.from, chatId: message.chat.id });
      await sendMasterMenu(message.chat.id);
      return NextResponse.json({ ok: true });
    }

    await handleClientChatMessage({
      from: message.from,
      chatId: message.chat.id,
      text: message.text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'telegram_webhook_failed';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
