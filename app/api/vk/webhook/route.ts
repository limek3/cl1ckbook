import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/server/supabase-admin';
import {
  answerVkMessageEvent,
  getAppUrl,
  getVkBotGroupId,
  getVkBotUserProfile,
  sendVkBotAuthFallbackMessage,
  sendVkBotBookingsMessage,
  sendVkBotFaqAnswerMessage,
  sendVkBotFaqMessage,
  sendVkBotNotificationsMessage,
  sendVkBotSupportMessage,
  sendClientVkBookingConfirmation,
  sendVkBotWelcomeMessage,
  sendVkLoginConfirmedMessage,
  sendVkMessage,
} from '@/lib/server/vk-bot';
import { handleClientBookingAction } from '@/lib/server/booking-client-actions';
import { handleRescheduleProposalAction } from '@/lib/server/booking-reschedule-proposals';
import { createChatMessage, createChatThread, fetchChatThreadByPhone, updateChatThread } from '@/lib/server/supabase-chats';
import type { Booking, MasterProfile } from '@/lib/types';
import {
  buildVkLoginToken,
  createVkBotVirtualUser,
  upsertVkBotAccount,
  upsertVkOauthAccountFromBot,
} from '@/lib/server/vk-bot-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type VkCallbackPayload = {
  type?: string;
  group_id?: number;
  secret?: string;
  object?: any;
};

type VkBookingLinkRow = {
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

function textResponse(value: string, init?: ResponseInit) {
  return new Response(value, {
    status: init?.status ?? 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

function getConfirmationCode() {
  return (process.env.VK_BOT_CONFIRMATION_CODE || process.env.VK_CALLBACK_CONFIRMATION_CODE || '').trim();
}

function getCallbackSecret() {
  return (process.env.VK_BOT_SECRET || process.env.VK_CALLBACK_SECRET || '').trim();
}

function getExpectedGroupId() {
  const value = getVkBotGroupId();
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? Math.trunc(id) : null;
}

function verifyVkCallback(payload: VkCallbackPayload) {
  const expectedSecret = getCallbackSecret();

  if (expectedSecret && payload.secret !== expectedSecret) {
    return false;
  }

  const expectedGroupId = getExpectedGroupId();

  if (expectedGroupId && payload.group_id && Number(payload.group_id) !== expectedGroupId) {
    return false;
  }

  return true;
}

function logVkWebhookError(label: string, error: unknown) {
  console.error('[vk-webhook]', label, error instanceof Error ? error.message : error);
}


function safeString(value: unknown, max = 1000) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
}

async function writeVkWebhookLog(params: {
  eventType?: string;
  groupId?: number | null;
  vkUserId?: number | string | null;
  peerId?: number | string | null;
  text?: unknown;
  ref?: unknown;
  status?: string;
  error?: unknown;
  payload?: unknown;
}) {
  try {
    await createSupabaseAdminClient().from('sloty_vk_webhook_events').insert({
      event_type: params.eventType ?? null,
      group_id: params.groupId ?? null,
      vk_user_id: params.vkUserId != null ? String(params.vkUserId) : null,
      peer_id: params.peerId != null ? Number(params.peerId) : null,
      text: safeString(params.text),
      ref: safeString(params.ref),
      status: params.status ?? 'received',
      error: params.error instanceof Error ? params.error.message : safeString(params.error),
      payload: params.payload && typeof params.payload === 'object' ? params.payload : {},
    });
  } catch {
    // Debug logging must never break VK callback delivery.
  }
}


async function sendVkReply(params: {
  label: string;
  peerId: number | string;
  textPreview?: string | null;
  send: () => Promise<unknown>;
}) {
  try {
    const result = await params.send();

    await writeVkWebhookLog({
      eventType: 'message_send',
      peerId: params.peerId,
      text: params.textPreview ?? params.label,
      status: 'sent',
      payload: {
        label: params.label,
        result: result && typeof result === 'object' ? result : { value: result },
      },
    });

    return result;
  } catch (error) {
    logVkWebhookError(`send:${params.label}`, error);

    await writeVkWebhookLog({
      eventType: 'message_send',
      peerId: params.peerId,
      text: params.textPreview ?? params.label,
      status: 'send_error',
      error,
      payload: { label: params.label },
    });

    return null;
  }
}

function isStartLikeText(value: unknown) {
  if (typeof value !== 'string') return false;
  const text = value.trim().toLowerCase();
  return text === '/start' || text === 'start' || text === 'начать' || text === 'старт' || text === 'меню';
}

function normalizedText(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function isFaqLikeText(value: unknown) {
  const text = normalizedText(value);
  return text === 'faq' || text === '/faq' || text === 'вопросы' || text === 'частые вопросы';
}

function isSupportLikeText(value: unknown) {
  const text = normalizedText(value);
  return text === 'поддержка' || text === '/support' || text === 'связь' || text === 'помощь';
}

function isNotificationLikeText(value: unknown) {
  const text = normalizedText(value);
  return text === 'уведомления' || text === '/notifications';
}

function isBookingsLikeText(value: unknown) {
  const text = normalizedText(value);
  return text === 'записи' || text === '/bookings' || text === 'мои записи';
}

function normalizePayload(value: unknown): Record<string, unknown> | null {
  if (!value) return null;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  return typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function extractAuthTokenFromValue(value: unknown) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/(?:^|[\s:/?&=])auth_([a-f0-9]{32,64})(?:\b|$)/i) || trimmed.match(/^([a-f0-9]{32,64})$/i);
  return match?.[1] ?? null;
}

function extractAuthToken(message: Record<string, unknown> | null, eventPayload?: Record<string, unknown> | null) {
  const directCandidates = [
    message?.text,
    message?.ref,
    message?.ref_source,
    message?.payload,
    eventPayload?.token,
    eventPayload?.auth_token,
    eventPayload?.payload,
  ];

  for (const candidate of directCandidates) {
    const token = extractAuthTokenFromValue(candidate);
    if (token) return token;
  }

  const payloadObject = normalizePayload(message?.payload);

  if (payloadObject) {
    const token =
      extractAuthTokenFromValue(payloadObject.token) ||
      extractAuthTokenFromValue(payloadObject.auth_token) ||
      extractAuthTokenFromValue(payloadObject.start_param);

    if (token) return token;
  }

  return null;
}


function extractBookingTokenFromValue(value: unknown) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/(?:^|[\s:/?&=])booking_([a-f0-9]{64})(?:\b|$)/i);
  return match?.[1] ?? null;
}

function extractBookingToken(message: Record<string, unknown> | null, eventPayload?: Record<string, unknown> | null) {
  const directCandidates = [
    message?.text,
    message?.ref,
    message?.ref_source,
    message?.payload,
    eventPayload?.token,
    eventPayload?.booking_token,
    eventPayload?.payload,
  ];

  for (const candidate of directCandidates) {
    const token = extractBookingTokenFromValue(candidate);
    if (token) return token;
  }

  const payloadObject = normalizePayload(message?.payload);

  if (payloadObject) {
    const token =
      extractBookingTokenFromValue(payloadObject.token) ||
      extractBookingTokenFromValue(payloadObject.booking_token) ||
      extractBookingTokenFromValue(payloadObject.start_param);

    if (token) return token;
  }

  return null;
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

function numberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Math.trunc(Number(value));
  return null;
}

async function confirmVkLogin(params: {
  token: string;
  vkUserId: number | string;
  peerId: number | string;
}) {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: requestRow, error: readError } = await admin
    .from('sloty_vk_login_requests')
    .select('*')
    .eq('token', params.token)
    .maybeSingle();

  if (readError) throw readError;

  if (!requestRow) {
    await sendVkReply({
      label: 'login_request_not_found',
      peerId: params.peerId,
      textPreview: 'Не нашли запрос на вход.',
      send: () => sendVkMessage({
        peerId: params.peerId,
        message: 'Не нашли запрос на вход. Вернитесь на сайт и нажмите «Войти через VK» ещё раз.',
      }),
    });
    return false;
  }

  if (requestRow.status !== 'pending' || new Date(requestRow.expires_at).getTime() < Date.now()) {
    try {
      await admin
        .from('sloty_vk_login_requests')
        .update({ status: 'expired', updated_at: now })
        .eq('token', params.token)
        .eq('status', 'pending');
    } catch {}

    await sendVkReply({
      label: 'login_request_expired',
      peerId: params.peerId,
      textPreview: 'Ссылка входа устарела или уже использована.',
      send: () => sendVkMessage({
        peerId: params.peerId,
        message: 'Ссылка входа устарела или уже использована. Вернитесь на сайт и нажмите «Войти через VK» ещё раз.',
      }),
    });
    return false;
  }

  const profile = await getVkBotUserProfile(params.vkUserId).catch(() => ({
    vkId: String(params.vkUserId),
    firstName: null,
    lastName: null,
    fullName: null,
    screenName: null,
    domain: null,
    photoUrl: null,
    rawProfile: { source: 'vk_callback_fallback' },
  }));
  const linkUserId =
    requestRow.metadata &&
    requestRow.metadata.mode === 'link' &&
    typeof requestRow.metadata.link_user_id === 'string'
      ? requestRow.metadata.link_user_id
      : null;

  const user = createVkBotVirtualUser(profile, linkUserId);

  await upsertVkBotAccount(admin, {
    userId: user.id,
    vkUserId: profile.vkId,
    peerId: params.peerId,
    profile,
    messagesAllowed: true,
    metadata: {
      source: 'vk_callback_auth',
      token: params.token,
    },
  });

  await upsertVkOauthAccountFromBot(admin, { userId: user.id, profile }).catch((error) => {
    logVkWebhookError('vk account mirror skipped', error);
  });

  const { error: updateError } = await admin
    .from('sloty_vk_login_requests')
    .update({
      status: 'confirmed',
      vk_user_id: profile.vkId,
      peer_id: Number(params.peerId),
      first_name: profile.firstName,
      last_name: profile.lastName,
      screen_name: profile.screenName || profile.domain,
      photo_url: profile.photoUrl,
      confirmed_at: now,
      updated_at: now,
      metadata: {
        ...(requestRow.metadata ?? {}),
        profile: profile.rawProfile ?? {},
      },
    })
    .eq('token', params.token)
    .eq('status', 'pending');

  if (updateError) throw updateError;

  await sendVkReply({
    label: 'login_confirmed',
    peerId: params.peerId,
    textPreview: 'Вход в КликБук через VK подтверждён.',
    send: () => sendVkLoginConfirmedMessage({
      peerId: params.peerId,
      token: params.token,
    }),
  });

  return true;
}



async function handleVkBookingStart(params: {
  token: string;
  vkUserId: number | string;
  peerId: number | string;
  profile: Awaited<ReturnType<typeof getVkBotUserProfile>>;
}) {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data: linkRow, error: linkError } = await admin
    .from('sloty_booking_vk_links')
    .select('*')
    .eq('token', params.token)
    .eq('status', 'pending')
    .maybeSingle();

  if (linkError) throw linkError;

  const link = linkRow as VkBookingLinkRow | null;

  if (!link) {
    await sendVkReply({
      label: 'vk_booking_link_not_found',
      peerId: params.peerId,
      textPreview: 'Ссылка записи уже использована или устарела.',
      send: () => sendVkMessage({
        peerId: params.peerId,
        message: 'Ссылка подтверждения уже использована или устарела. Вернитесь на страницу записи и создайте новую заявку.',
      }),
    });
    return;
  }

  const expired = link.expires_at && new Date(link.expires_at).getTime() < Date.now();

  if (expired) {
    await admin
      .from('sloty_booking_vk_links')
      .update({ status: 'expired', updated_at: now })
      .eq('token', params.token);

    await sendVkReply({
      label: 'vk_booking_link_expired',
      peerId: params.peerId,
      textPreview: 'Ссылка подтверждения устарела.',
      send: () => sendVkMessage({
        peerId: params.peerId,
        message: 'Ссылка подтверждения устарела. Но запись уже создана — мастер получил заявку.',
      }),
    });
    return;
  }

  const { data: workspaceRow } = await admin
    .from('sloty_workspaces')
    .select('profile')
    .eq('id', link.workspace_id)
    .maybeSingle();

  const profile = (workspaceRow?.profile as MasterProfile | undefined) ?? null;

  await admin
    .from('sloty_booking_vk_links')
    .update({
      status: 'confirmed',
      vk_user_id: String(params.vkUserId),
      peer_id: Number(params.peerId),
      first_name: params.profile.firstName ?? null,
      last_name: params.profile.lastName ?? null,
      screen_name: params.profile.screenName || params.profile.domain || null,
      photo_url: params.profile.photoUrl ?? null,
      confirmed_at: now,
      updated_at: now,
      metadata: {
        source: 'vk_booking_link',
        profile: params.profile.rawProfile ?? {},
      },
    })
    .eq('token', params.token)
    .eq('status', 'pending');

  const result = await handleClientBookingAction({
    bookingId: link.booking_id,
    action: 'confirm',
    source: 'vk',
    directClientRef: {
      clientVkPeerId: params.peerId,
      clientVkUserId: String(params.vkUserId),
    },
  });

  const booking = result.ok ? result.booking : link.booking_snapshot;

  if (!booking) {
    await sendVkReply({
      label: 'vk_booking_not_found',
      peerId: params.peerId,
      textPreview: 'Запись не найдена.',
      send: () => sendVkMessage({
        peerId: params.peerId,
        message: 'Запись не найдена. Мастер всё равно получил заявку, но уведомления подключить не удалось.',
      }),
    });
    return;
  }

  await sendVkReply({
    label: 'vk_booking_connected',
    peerId: params.peerId,
    textPreview: 'VK подключён к записи.',
    send: () => sendClientVkBookingConfirmation({
      peerId: params.peerId,
      booking,
      profile,
    }),
  });
}

async function handleClientVkChatMessage(params: {
  vkUserId: number | string;
  peerId: number | string;
  text?: unknown;
}) {
  const text = typeof params.text === 'string' ? params.text.trim() : '';
  if (!text || text.startsWith('/')) return false;

  const admin = createSupabaseAdminClient();

  const { data: linkRows, error: linkRowsError } = await admin
    .from('sloty_booking_vk_links')
    .select('*')
    .eq('peer_id', Number(params.peerId))
    .eq('status', 'confirmed')
    .order('confirmed_at', { ascending: false })
    .limit(1);

  if (linkRowsError) {
    logVkWebhookError('client vk chat link read', linkRowsError);
  }

  const link = Array.isArray(linkRows) ? (linkRows[0] as VkBookingLinkRow | undefined) : undefined;
  if (!link) return false;

  const { data: bookingRow } = await admin
    .from('sloty_bookings')
    .select('*')
    .eq('id', link.booking_id)
    .maybeSingle();

  const booking = bookingRow ? mapBookingRow(bookingRow as BookingRow) : link.booking_snapshot;
  if (!booking) return false;

  const now = new Date().toISOString();
  const existingThread = booking.clientPhone
    ? await fetchChatThreadByPhone(link.workspace_id, booking.clientPhone).catch(() => null)
    : null;

  const thread = existingThread
    ? await updateChatThread(link.workspace_id, existingThread.id, {
        channel: 'VK',
        botConnected: true,
        lastMessagePreview: text,
        lastMessageAt: now,
        unreadCount: (existingThread.unreadCount ?? 0) + 1,
        metadata: {
          ...(existingThread.metadata ?? {}),
          bookingId: booking.id,
          clientVkPeerId: params.peerId,
          clientVkUserId: String(params.vkUserId),
        },
      }).catch(() => existingThread)
    : await createChatThread(link.workspace_id, {
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        channel: 'VK',
        segment: 'active',
        source: 'VK-бот',
        nextVisit: booking.date,
        botConnected: true,
        lastMessagePreview: text,
        lastMessageAt: now,
        unreadCount: 1,
        metadata: {
          bookingId: booking.id,
          clientVkPeerId: params.peerId,
          clientVkUserId: String(params.vkUserId),
        },
      }).catch(() => null);

  if (!thread?.id) return false;

  await createChatMessage(link.workspace_id, {
    threadId: thread.id,
    author: 'client',
    body: text,
    deliveryState: null,
    viaBot: true,
    metadata: {
      bookingId: booking.id,
      source: 'vk_inbox',
      clientVkPeerId: params.peerId,
    },
  }).catch((error) => logVkWebhookError('client vk chat message create', error));

  return true;
}

async function createDirectVkLoginToken(params: {
  vkUserId: number | string;
  peerId: number | string;
  profile: Awaited<ReturnType<typeof getVkBotUserProfile>>;
}) {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const token = buildVkLoginToken();
  const user = createVkBotVirtualUser(params.profile);

  await upsertVkBotAccount(admin, {
    userId: user.id,
    vkUserId: params.profile.vkId,
    peerId: params.peerId,
    profile: params.profile,
    messagesAllowed: true,
    metadata: { source: 'vk_start_no_code_direct_login' },
  });

  await upsertVkOauthAccountFromBot(admin, { userId: user.id, profile: params.profile }).catch((error) => {
    logVkWebhookError('vk account mirror skipped', error);
  });

  const { error } = await admin.from('sloty_vk_login_requests').insert({
    token,
    status: 'confirmed',
    vk_user_id: params.profile.vkId,
    peer_id: Number(params.peerId),
    first_name: params.profile.firstName,
    last_name: params.profile.lastName,
    screen_name: params.profile.screenName || params.profile.domain,
    photo_url: params.profile.photoUrl,
    confirmed_at: now,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    metadata: {
      next: '/dashboard',
      mode: 'login',
      source: 'vk_start_no_code_direct_login',
      profile: params.profile.rawProfile ?? {},
    },
  });

  if (error) throw error;

  return token;
}

async function handleMessageNew(payload: VkCallbackPayload) {
  const message = payload.object?.message && typeof payload.object.message === 'object'
    ? (payload.object.message as Record<string, unknown>)
    : payload.object && typeof payload.object === 'object'
      ? (payload.object as Record<string, unknown>)
      : null;

  const vkUserId = numberValue(message?.from_id);
  const peerId = numberValue(message?.peer_id) ?? vkUserId;

  if (!message || !vkUserId || !peerId) return;

  const token = extractAuthToken(message);
  const bookingToken = extractBookingToken(message);

  if (token) {
    await confirmVkLogin({ token, vkUserId, peerId });
    return;
  }

  const profile = await getVkBotUserProfile(vkUserId).catch(() => ({
    vkId: String(vkUserId),
    firstName: null,
    lastName: null,
    fullName: null,
    screenName: null,
    domain: null,
    photoUrl: null,
    rawProfile: { source: 'message_new_fallback' },
  }));
  const user = createVkBotVirtualUser(profile);

  await upsertVkBotAccount(createSupabaseAdminClient(), {
    userId: user.id,
    vkUserId: profile.vkId,
    peerId,
    profile,
    messagesAllowed: true,
    metadata: {
      source: 'message_new',
      lastText: typeof message.text === 'string' ? message.text : null,
      ref: typeof message.ref === 'string' ? message.ref : null,
      refSource: typeof message.ref_source === 'string' ? message.ref_source : null,
    },
  }).catch((error) => logVkWebhookError('remember vk user', error));

  if (bookingToken) {
    await handleVkBookingStart({ token: bookingToken, vkUserId, peerId, profile });
    return;
  }

  if (isStartLikeText(message.text)) {
    const directLoginToken = await createDirectVkLoginToken({ vkUserId, peerId, profile });

    await sendVkReply({
      label: 'vk_start_direct_login',
      peerId,
      textPreview: 'КликБук готов к входу через VK.',
      send: () => sendVkLoginConfirmedMessage({
        peerId,
        token: directLoginToken,
      }),
    });
    return;
  }

  if (isFaqLikeText(message.text)) {
    await sendVkReply({
      label: 'faq_from_text',
      peerId,
      textPreview: 'FAQ КликБук.',
      send: () => sendVkBotFaqMessage({ peerId }),
    });
    return;
  }

  if (isSupportLikeText(message.text)) {
    await sendVkReply({
      label: 'support_from_text',
      peerId,
      textPreview: 'Поддержка КликБук.',
      send: () => sendVkBotSupportMessage({ peerId }),
    });
    return;
  }

  if (isNotificationLikeText(message.text)) {
    await sendVkReply({
      label: 'notifications_from_text',
      peerId,
      textPreview: 'Уведомления VK.',
      send: () => sendVkBotNotificationsMessage({ peerId }),
    });
    return;
  }

  if (isBookingsLikeText(message.text)) {
    await sendVkReply({
      label: 'bookings_from_text',
      peerId,
      textPreview: 'Мои записи.',
      send: () => sendVkBotBookingsMessage({ peerId }),
    });
    return;
  }

  const clientChatHandled = await handleClientVkChatMessage({ vkUserId, peerId, text: message.text });
  if (clientChatHandled) return;

  await sendVkReply({
    label: 'auth_fallback',
    peerId,
    textPreview: 'Главное меню КликБук.',
    send: () => sendVkBotAuthFallbackMessage({ peerId }),
  });
}

async function handleMessageEvent(payload: VkCallbackPayload) {
  const object = payload.object && typeof payload.object === 'object' ? (payload.object as Record<string, unknown>) : null;
  const eventPayload = normalizePayload(object?.payload);
  const vkUserId = numberValue(object?.user_id);
  const peerId = numberValue(object?.peer_id) ?? vkUserId;
  const eventId = typeof object?.event_id === 'string' ? object.event_id : null;

  if (!object || !vkUserId || !peerId || !eventId) return;

  const action = typeof eventPayload?.action === 'string' ? eventPayload.action : null;
  const token = extractAuthToken(null, eventPayload);
  const appUrl = getAppUrl();

  if (action === 'reschedule_proposal_accept' || action === 'reschedule_proposal_decline') {
    const proposalId = typeof eventPayload?.proposal_id === 'string' ? eventPayload.proposal_id : null;
    const proposalAction = action === 'reschedule_proposal_accept' ? 'accept' : 'decline';

    if (!proposalId) {
      await answerVkMessageEvent({ eventId, userId: vkUserId, peerId, text: 'Предложение переноса не найдено.' })
        .catch((error) => logVkWebhookError('answer reschedule proposal missing id', error));
      return;
    }

    const result = await handleRescheduleProposalAction({
      proposalId,
      action: proposalAction,
      source: 'vk',
      directClientRef: { clientVkPeerId: peerId, clientVkUserId: String(vkUserId) },
    }).catch((error) => {
      logVkWebhookError('vk reschedule proposal action', error);
      return null;
    });

    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      text: result?.ok
        ? proposalAction === 'accept'
          ? 'Перенос подтверждён.'
          : 'Мастер подберёт другой слот.'
        : 'Не удалось обработать перенос.',
    }).catch((error) => logVkWebhookError('answer vk reschedule proposal action', error));

    await sendVkReply({
      label: proposalAction === 'accept' ? 'reschedule_proposal_accepted' : 'reschedule_proposal_declined',
      peerId,
      textPreview: proposalAction === 'accept' ? 'Перенос подтверждён.' : 'Нужно другое время.',
      send: () => sendVkMessage({
        peerId,
        message: result?.ok
          ? proposalAction === 'accept'
            ? 'Спасибо, перенос подтверждён ✅ Запись обновлена.'
            : 'Поняли, это время не подходит. Мастер подберёт другой слот и ответит вам в чате.'
          : 'Не удалось обработать перенос. Напишите мастеру обычным сообщением в этот диалог.',
      }),
    });
    return;
  }

  if (action === 'client_booking_confirm' || action === 'client_booking_reschedule') {
    const bookingId = typeof eventPayload?.booking_id === 'string' ? eventPayload.booking_id : null;
    const clientAction = action === 'client_booking_confirm' ? 'confirm' : 'reschedule';

    if (!bookingId) {
      await answerVkMessageEvent({
        eventId,
        userId: vkUserId,
        peerId,
        text: 'Запись не найдена.',
      }).catch((error) => logVkWebhookError('answer client booking missing id', error));
      return;
    }

    const result = await handleClientBookingAction({
      bookingId,
      action: clientAction,
      source: 'vk',
      directClientRef: {
        clientVkPeerId: peerId,
        clientVkUserId: String(vkUserId),
      },
    }).catch((error) => {
      logVkWebhookError('client vk booking action', error);
      return null;
    });

    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      text:
        result?.ok && clientAction === 'confirm'
          ? 'Запись подтверждена.'
          : result?.ok
            ? 'Запрос на перенос отправлен мастеру.'
            : 'Не удалось обработать действие.',
    }).catch((error) => logVkWebhookError('answer client booking action', error));

    await sendVkReply({
      label: clientAction === 'confirm' ? 'client_booking_confirmed' : 'client_booking_reschedule_requested',
      peerId,
      textPreview: clientAction === 'confirm' ? 'Запись подтверждена.' : 'Запрос на перенос отправлен мастеру.',
      send: () => sendVkMessage({
        peerId,
        message:
          result?.ok && clientAction === 'confirm'
            ? 'Спасибо, запись подтверждена ✅'
            : result?.ok
              ? 'Поняли, запрос на перенос отправлен мастеру. Слот освобождён, мастер подберёт новое время и ответит вам в чате.'
              : 'Не удалось обработать действие. Напишите мастеру обычным сообщением в этот диалог.',
      }),
    });
    return;
  }

  if (action === 'open_dashboard') {
    let dashboardToken = token;

    if (!dashboardToken) {
      try {
        const profile = await getVkBotUserProfile(vkUserId).catch(() => ({
          vkId: String(vkUserId),
          firstName: null,
          lastName: null,
          fullName: null,
          screenName: null,
          domain: null,
          photoUrl: null,
          rawProfile: { source: 'open_dashboard_callback_fallback' },
        }));
        dashboardToken = await createDirectVkLoginToken({ vkUserId, peerId, profile });
      } catch (error) {
        logVkWebhookError('create direct token from button', error);
      }
    }

    if (!dashboardToken) {
      await answerVkMessageEvent({
        eventId,
        userId: vkUserId,
        peerId,
        text: 'Не удалось создать вход. Отправьте /start и нажмите кнопку ещё раз.',
      }).catch((error) => logVkWebhookError('answer open dashboard without token', error));
      return;
    }

    try {
      const admin = createSupabaseAdminClient();
      const { data: row } = await admin
        .from('sloty_vk_login_requests')
        .select('status, expires_at')
        .eq('token', dashboardToken)
        .maybeSingle();

      if (row && row.status === 'pending' && new Date(row.expires_at).getTime() >= Date.now()) {
        await confirmVkLogin({ token: dashboardToken, vkUserId, peerId });
      }
    } catch (error) {
      logVkWebhookError('lazy confirm from button', error);
    }

    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      link: `${appUrl}/api/auth/vk/complete?token=${encodeURIComponent(dashboardToken)}`,
    }).catch((error) => logVkWebhookError('answer open dashboard', error));
    return;
  }

  if (action === 'open_url') {
    const url = typeof eventPayload?.url === 'string' ? eventPayload.url : appUrl;
    const safeUrl = url.startsWith(appUrl) ? url : appUrl;

    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      link: safeUrl,
    }).catch((error) => logVkWebhookError('answer open url', error));
    return;
  }

  if (action === 'notifications' || action === 'notifications_enabled') {
    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      text: 'Уведомления VK включены.',
    }).catch((error) => logVkWebhookError('answer notifications', error));

    await sendVkReply({
      label: 'notifications_menu',
      peerId,
      textPreview: 'Уведомления VK включены.',
      send: () => sendVkBotNotificationsMessage({ peerId, token }),
    });
    return;
  }

  if (action === 'bookings') {
    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      text: 'Открыл раздел записей в боте.',
    }).catch((error) => logVkWebhookError('answer bookings', error));

    await sendVkReply({
      label: 'bookings_menu',
      peerId,
      textPreview: 'Мои записи.',
      send: () => sendVkBotBookingsMessage({ peerId, token }),
    });
    return;
  }

  if (action === 'faq' || action === 'help') {
    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      text: 'FAQ отправлен в диалог.',
    }).catch((error) => logVkWebhookError('answer faq', error));

    await sendVkReply({
      label: 'faq_menu',
      peerId,
      textPreview: 'FAQ КликБук.',
      send: () => sendVkBotFaqMessage({ peerId, token }),
    });
    return;
  }

  if (action === 'faq_login' || action === 'faq_bookings' || action === 'faq_notifications' || action === 'faq_tariffs') {
    const topic = action.replace('faq_', '') as 'login' | 'bookings' | 'notifications' | 'tariffs';

    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      text: 'Ответ отправлен в диалог.',
    }).catch((error) => logVkWebhookError(`answer ${action}`, error));

    await sendVkReply({
      label: action,
      peerId,
      textPreview: `FAQ: ${topic}`,
      send: () => sendVkBotFaqAnswerMessage({ peerId, token, topic }),
    });
    return;
  }

  if (action === 'support' || action === 'support_human') {
    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      text: 'Поддержка отправлена в диалог.',
    }).catch((error) => logVkWebhookError('answer support', error));

    await sendVkReply({
      label: 'support_menu',
      peerId,
      textPreview: 'Поддержка КликБук.',
      send: () => sendVkBotSupportMessage({ peerId, token }),
    });
    return;
  }

  if (action === 'back_main' || action === 'noop') {
    await answerVkMessageEvent({
      eventId,
      userId: vkUserId,
      peerId,
      text: 'Главное меню отправлено.',
    }).catch((error) => logVkWebhookError('answer main menu', error));

    await sendVkReply({
      label: 'main_menu',
      peerId,
      textPreview: 'Главное меню КликБук.',
      send: () => sendVkBotWelcomeMessage({ peerId, token }),
    });
    return;
  }

  await answerVkMessageEvent({
    eventId,
    userId: vkUserId,
    peerId,
    text: 'Я отправил главное меню в диалог.',
  }).catch((error) => logVkWebhookError('answer unknown event', error));

  await sendVkReply({
    label: 'unknown_action_menu',
    peerId,
    textPreview: 'Главное меню КликБук.',
    send: () => sendVkBotWelcomeMessage({ peerId, token }),
  });
}

async function handleMessageAllow(payload: VkCallbackPayload) {
  const object = payload.object && typeof payload.object === 'object' ? (payload.object as Record<string, unknown>) : null;
  const vkUserId = numberValue(object?.user_id);

  if (!vkUserId) return;

  const profile = await getVkBotUserProfile(vkUserId).catch(() => ({
    vkId: String(vkUserId),
    firstName: null,
    lastName: null,
    fullName: null,
    screenName: null,
    domain: null,
    photoUrl: null,
    rawProfile: { source: 'message_allow_fallback' },
  }));
  const user = createVkBotVirtualUser(profile);

  await upsertVkBotAccount(createSupabaseAdminClient(), {
    userId: user.id,
    vkUserId: profile.vkId,
    peerId: vkUserId,
    profile,
    messagesAllowed: true,
    metadata: { source: 'message_allow' },
  }).catch((error) => logVkWebhookError('message allow upsert', error));

  const directLoginToken = await createDirectVkLoginToken({ vkUserId, peerId: vkUserId, profile }).catch(() => null);

  await sendVkReply({
    label: 'message_allow_welcome',
    peerId: vkUserId,
    textPreview: 'Сообщения VK подключены к КликБук.',
    send: () => sendVkBotWelcomeMessage({ peerId: vkUserId, token: directLoginToken }),
  });
}

async function handleMessageDeny(payload: VkCallbackPayload) {
  const object = payload.object && typeof payload.object === 'object' ? (payload.object as Record<string, unknown>) : null;
  const vkUserId = numberValue(object?.user_id);

  if (!vkUserId) return;

  try {
    await createSupabaseAdminClient()
      .from('sloty_vk_bot_accounts')
      .update({ messages_allowed: false, updated_at: new Date().toISOString() })
      .eq('vk_user_id', String(vkUserId));
  } catch {}
}

export async function POST(request: Request) {
  let payload: VkCallbackPayload;

  try {
    payload = (await request.json()) as VkCallbackPayload;
  } catch {
    return textResponse('bad request', { status: 400 });
  }

  if (payload.type === 'confirmation') {
    if (!verifyVkCallback(payload)) return textResponse('forbidden', { status: 403 });

    const code = getConfirmationCode();
    return textResponse(code || 'missing_confirmation_code');
  }

  if (!verifyVkCallback(payload)) {
    return textResponse('forbidden', { status: 403 });
  }

  try {
    const messageForLog = payload.object?.message && typeof payload.object.message === 'object'
      ? payload.object.message
      : payload.object && typeof payload.object === 'object'
        ? payload.object
        : null;
    const vkUserIdForLog = numberValue(messageForLog?.from_id ?? messageForLog?.user_id);
    const peerIdForLog = numberValue(messageForLog?.peer_id) ?? vkUserIdForLog;

    await writeVkWebhookLog({
      eventType: payload.type,
      groupId: payload.group_id ?? null,
      vkUserId: vkUserIdForLog,
      peerId: peerIdForLog,
      text: messageForLog?.text,
      ref: messageForLog?.ref ?? messageForLog?.ref_source,
      status: 'received',
      payload,
    });

    if (payload.type === 'message_new') {
      await handleMessageNew(payload);
    } else if (payload.type === 'message_event') {
      await handleMessageEvent(payload);
    } else if (payload.type === 'message_allow') {
      await handleMessageAllow(payload);
    } else if (payload.type === 'message_deny') {
      await handleMessageDeny(payload);
    }
  } catch (error) {
    logVkWebhookError(payload.type || 'unknown', error);
    await writeVkWebhookLog({
      eventType: payload.type,
      groupId: payload.group_id ?? null,
      status: 'error',
      error,
      payload,
    });
  }

  return textResponse('ok');
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/vk/webhook',
    groupId: getVkBotGroupId() || null,
    hasAccessToken: Boolean(process.env.VK_BOT_ACCESS_TOKEN || process.env.VK_GROUP_ACCESS_TOKEN),
    hasConfirmationCode: Boolean(getConfirmationCode()),
    hasSecret: Boolean(getCallbackSecret()),
  });
}
