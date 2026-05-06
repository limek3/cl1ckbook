from pathlib import Path
import re
root=Path('/mnt/data/beautiful_bot_work')

# 1. Add compact helpers to booking-context.ts
p=root/'lib/server/booking-context.ts'
s=p.read_text()
if 'export function bookingClientCardText' not in s:
    s += r'''

export function compactDateTime(booking: Pick<Booking, 'date' | 'time'>) {
  return `${booking.date} · ${booking.time}`.trim();
}

export function bookingClientCardText(params: {
  title?: string;
  booking: Booking;
  profile?: MasterProfile | null;
  footer?: string | null;
  includeComment?: boolean;
}) {
  const booking = params.booking;
  const masterName = masterDisplayName(params.profile, booking.masterSlug || 'мастер');
  const services = normalizeBookingServices(booking);
  const serviceLine = services.length > 1 ? services.join(' + ') : services[0] || 'Услуга не указана';
  const comment = String(booking.comment || '').trim();

  const lines: Array<string | null | undefined> = [
    params.title || 'Ваша запись',
    '',
    `${bookingCode(booking)} · ${masterName}`,
    serviceLine,
    compactDateTime(booking),
    params.includeComment !== false && comment ? '' : null,
    params.includeComment !== false && comment ? `Комментарий: ${comment}` : null,
    params.footer ? '' : null,
    params.footer || null,
  ];

  return lines
    .filter((line) => line !== null && line !== undefined)
    .map((line) => String(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function bookingChoiceText(count: number) {
  return [
    count > 1 ? `У вас ${count} активных записей.` : 'Ваша активная запись.',
    'Выберите запись ниже. Следующее сообщение уйдёт мастеру именно по выбранной услуге.',
  ].join('\n\n');
}

export function bookingMasterToClientText(params: {
  booking: Booking;
  profile?: MasterProfile | null;
  message: string;
}) {
  const context = bookingClientCardText({
    title: 'Сообщение от мастера',
    booking: params.booking,
    profile: params.profile,
    includeComment: false,
  });

  return `${context}\n\n${params.message.trim()}`.trim();
}
'''
p.write_text(s)

# 2. Patch imports in telegram webhook
p=root/'app/api/telegram/webhook/route.ts'
s=p.read_text()
s=s.replace("import { bookingMessageText, bookingSelectionLabel, bookingShortContext, bookingThreadMetadata } from '@/lib/server/booking-context';", "import { bookingChoiceText, bookingClientCardText, bookingMessageText, bookingSelectionLabel, bookingShortContext, bookingThreadMetadata } from '@/lib/server/booking-context';")
# Patch sendClientLinkingHelp to be concise and no spam if links exist.
old=re.search(r"async function sendClientLinkingHelp\(chatId: number \| string\) \{.*?\n\}\n\nfunction mapBookingRow", s, re.S)
if old:
    repl=r'''async function sendClientLinkingHelp(chatId: number | string) {
  const links = await getConfirmedTelegramBookingLinks(chatId, 8).catch(() => [] as BookingLinkRow[]);

  const text = [
    'Помощь КликБук',
    '',
    links.length > 0
      ? 'Выберите запись кнопкой ниже или напишите сообщение после выбора записи.'
      : 'Я пока не вижу связанную запись. Вернитесь на страницу заявки и нажмите «Подключить Telegram».',
    '',
    'Если Telegram просто открыл этот чат — скопируйте короткий код со страницы заявки и отправьте его сюда.',
  ].join('\n').replace(/\n{3,}/g, '\n\n');

  const replyMarkup = links.length > 0
    ? {
        inline_keyboard: [
          [{ text: '📋 Мои записи', callback_data: 'bookings:list' }],
          [{ text: '💬 Выбрать запись', callback_data: 'bookings:list' }],
        ],
      }
    : undefined;

  if (links.length > 0 && replyMarkup && await editStoredClientMenuMessage({ chatId, links, text, replyMarkup })) {
    await ensureTelegramClientPersistentMenu(chatId, links);
    return;
  }

  await forgetClientMenuMessage(chatId, links);
  const response = await sendTelegramMessage({
    chatId,
    text,
    replyMarkup: replyMarkup ?? telegramClientMenuReplyMarkup(),
  });
  if (links.length > 0) await rememberClientMenuMessage(links, extractTelegramMessageId(response));
  await ensureTelegramClientPersistentMenu(chatId, links);
}

function mapBookingRow'''
    s=s[:old.start()]+repl+s[old.end():]
# Patch sendTelegramBookingDetails body text to compact.
s=re.sub(r"  const text = bookingMessageText\(\{\n    title: params\.title \|\| 'Детали записи',\n    booking,\n    profile,\n    footer: 'Нажмите «Написать по этой записи» и отправьте сообщение\. Мастер увидит нужную услугу\.',\n  \}\);", "  const text = bookingClientCardText({\n    title: params.title || 'Ваша запись',\n    booking,\n    profile,\n    footer: 'Нажмите «Написать по этой записи» и отправьте сообщение.',\n  });", s)
# Patch buttons: remove help on details second row maybe keep Mои записи only
s=s.replace("[{ text: '📋 Мои записи', callback_data: 'bookings:list' }, { text: '🆘 Помощь', callback_data: 'bookings:help' }],", "[{ text: '📋 Мои записи', callback_data: 'bookings:list' }],")
# Patch choice text.
s=s.replace("  const text = [\n    'У вас несколько активных записей.',\n    '',\n    'Выберите запись — следующее сообщение уйдёт мастеру именно по выбранной услуге.',\n  ].join('\n');", "  const text = bookingChoiceText(params.links.length);")
# Shorter labels maybe ok.
# Patch help callback answer not sending new spam already sendClientLinkingHelp now edits.
p.write_text(s)

# 3. Patch app/api/chats/route.ts import and prefix
p=root/'app/api/chats/route.ts'
s=p.read_text()
s=s.replace("import { bookingMessageText, bookingShortContext, bookingThreadMetadata } from '@/lib/server/booking-context';", "import { bookingMasterToClientText, bookingMessageText, bookingShortContext, bookingThreadMetadata } from '@/lib/server/booking-context';")
s=re.sub(r"function bookingContextMessagePrefix\(booking: Booking, text: string\) \{\n  return bookingMessageText\(\{\n    title: 'Сообщение от мастера',\n    booking,\n    footer: \['Сообщение:', text\]\.join\('\n'\),\n  \}\);\n\}", "function bookingContextMessagePrefix(booking: Booking, text: string) {\n  return bookingMasterToClientText({ booking, message: text });\n}", s)
p.write_text(s)

# 4. Patch telegram-bot imports and client confirmation short
p=root/'lib/server/telegram-bot.ts'
s=p.read_text()
s=s.replace("import { bookingCode, bookingMessageText, bookingServicesText, masterDisplayName } from '@/lib/server/booking-context';", "import { bookingClientCardText, bookingCode, bookingMessageText, bookingServicesText, masterDisplayName } from '@/lib/server/booking-context';")
old=re.search(r"export async function sendClientBookingConfirmation\(params: \{.*?\n\}\n\nexport async function sendMasterVisitCheck", s, re.S)
if old:
    repl=r'''export async function sendClientBookingConfirmation(params: {
  chatId: number | string;
  booking: Booking;
  profile?: MasterProfile | null;
  bookingToken?: string | null;
  hasMultipleBookings?: boolean;
}) {
  const footer = params.hasMultipleBookings
    ? 'У вас несколько записей. Откройте «Мои записи», чтобы выбрать нужную для переписки.'
    : 'Мы пришлём напоминание до визита.';

  return sendTelegramMessage({
    chatId: params.chatId,
    text: bookingClientCardText({
      title: 'Запись создана ✅',
      booking: params.booking,
      profile: params.profile,
      footer,
    }),
    replyMarkup: {
      inline_keyboard: [
        ...(params.bookingToken
          ? [[{ text: '💬 Написать по этой записи', callback_data: `chatctx:${params.bookingToken}` }]]
          : []),
        [{ text: '📋 Мои записи', callback_data: 'bookings:list' }],
      ],
    },
  });
}

export async function sendMasterVisitCheck'''
    s=s[:old.start()]+repl+s[old.end():]
p.write_text(s)

# 5. Patch vk-bot imports and client menu/message compact
p=root/'lib/server/vk-bot.ts'
s=p.read_text()
s=s.replace("import { bookingCode, bookingMessageText, bookingServicesText, masterDisplayName } from '@/lib/server/booking-context';", "import { bookingClientCardText, bookingCode, bookingMessageText, bookingServicesText, masterDisplayName } from '@/lib/server/booking-context';")
# buildVkClientMenuKeyboard exact desired rows
s=re.sub(r"export function buildVkClientMenuKeyboard\(token\?: string \| null\) \{.*?\n\}", r'''export function buildVkClientMenuKeyboard(token?: string | null) {
  return buildVkKeyboard([
    [{ label: '📋 Мои записи', action: 'client_bookings', token: token ?? null, color: 'primary' }],
    [
      { label: '💬 Выбрать запись', action: 'client_bookings', token: token ?? null, color: 'secondary' },
      { label: '🆘 Помощь', action: 'support', token: token ?? null, color: 'secondary' },
    ],
  ]);
}''', s, count=1, flags=re.S)
# shorten login confirmed message
s=re.sub(r"export async function sendVkLoginConfirmedMessage\(params: \{\n  peerId: number \| string;\n  token: string;\n\}\) \{.*?\n\}\n", r'''export async function sendVkLoginConfirmedMessage(params: {
  peerId: number | string;
  token: string;
}) {
  return sendVkMessage({
    peerId: params.peerId,
    message: ['VK подключён к КликБук ✅', '', 'Откройте кабинет или выберите действие ниже.'].join('\n'),
    keyboard: buildVkLoginKeyboard(params.token),
  });
}
''', s, flags=re.S)
# client confirmation compact
s=re.sub(r"export async function sendClientVkBookingConfirmation\(params: \{\n  peerId: number \| string;\n  booking: Booking;\n  profile\?: MasterProfile \| null;\n\}\) \{.*?\n\}\n\nexport async function sendClientVkBookingReminder", r'''export async function sendClientVkBookingConfirmation(params: {
  peerId: number | string;
  booking: Booking;
  profile?: MasterProfile | null;
}) {
  return sendVkMessage({
    peerId: params.peerId,
    message: bookingClientCardText({
      title: 'Запись создана ✅',
      booking: params.booking,
      profile: params.profile,
      footer: 'Мы пришлём напоминание до визита.',
    }),
    keyboard: buildVkClientMenuKeyboard(),
  });
}

export async function sendClientVkBookingReminder''', s, flags=re.S)
p.write_text(s)

# 6. Patch VK webhook imports and cards / actions edit
p=root/'app/api/vk/webhook/route.ts'
s=p.read_text()
s=s.replace("import { bookingMessageText, bookingSelectionLabel, bookingThreadMetadata } from '@/lib/server/booking-context';", "import { bookingChoiceText, bookingClientCardText, bookingMessageText, bookingSelectionLabel, bookingThreadMetadata } from '@/lib/server/booking-context';")
# patch sendVkClientBookingDetails message block
s=re.sub(r"message: bookingMessageText\(\{\n      title: params\.title \|\| 'Детали записи',\n      booking,\n      profile,\n      footer: 'Нажмите «Написать по этой записи» и отправьте следующее сообщение\. Мастер увидит нужную услугу\.',\n    \}\),", "message: bookingClientCardText({\n      title: params.title || 'Ваша запись',\n      booking,\n      profile,\n      footer: 'Нажмите «Написать по этой записи» и отправьте сообщение.',\n    }),", s)
# patch detail buttons (keep exactly two rows)
s=s.replace("keyboard: buildVkKeyboard([\n      [{ label: '💬 Написать по этой записи', action: 'client_chat_context', token: params.link.token, color: 'primary' }],\n      [\n        { label: '📋 Мои записи', action: 'client_bookings', color: 'secondary' },\n        { label: '🆘 Помощь', action: 'support', color: 'secondary' },\n      ],\n    ]),", "keyboard: buildVkKeyboard([\n      [{ label: '💬 Написать по этой записи', action: 'client_chat_context', token: params.link.token, color: 'primary' }],\n      [{ label: '📋 Мои записи', action: 'client_bookings', color: 'secondary' }],\n    ]),")
# patch choice message
s=s.replace("message: [\n      'У вас несколько активных записей.',\n      '',\n      'Выберите запись — следующее сообщение уйдёт мастеру именно по выбранной услуге.',\n    ].join('\n'),", "message: bookingChoiceText(links.length),")
# replace action faq/support/back_main to edit current message where possible. We'll add helper before handleMessageEvent
if 'async function editOrSendVkCard' not in s:
    insert = r'''
async function editOrSendVkCard(params: {
  peerId: number | string;
  conversationMessageId?: number | null;
  message: string;
  keyboard: Record<string, unknown>;
}) {
  if (params.conversationMessageId) {
    try {
      await editVkMessage({
        peerId: params.peerId,
        conversationMessageId: params.conversationMessageId,
        message: params.message,
        keyboard: params.keyboard,
      });
      return;
    } catch (error) {
      logVkWebhookError('edit vk card fallback', error);
    }
  }

  await sendVkMessage({ peerId: params.peerId, message: params.message, keyboard: params.keyboard });
}
'''
    s=s.replace("async function handleMessageEvent(payload: VkCallbackPayload) {", insert+"\nasync function handleMessageEvent(payload: VkCallbackPayload) {")
# patch faq/support/back main actions manually via regex blocks
s=re.sub(r"if \(action === 'faq' \|\| action === 'help'\) \{.*?\n  \}\n\n  if \(action === 'faq_login'", r'''if (action === 'faq' || action === 'help') {
    await answerVkMessageEvent({ eventId, userId: vkUserId, peerId, text: 'FAQ открыт.' })
      .catch((error) => logVkWebhookError('answer faq', error));

    await editOrSendVkCard({
      peerId,
      conversationMessageId,
      message: [
        'FAQ КликБук',
        '',
        'Выберите тему ниже — ответ появится в этой же карточке.',
      ].join('\n'),
      keyboard: buildVkFaqKeyboard(token),
    });
    return;
  }

  if (action === 'faq_login' ''', s, flags=re.S)
# The regex included beginning of next condition incorrectly with action missing, fix if syntax broke
s=s.replace("if (action === 'faq_login'  || action === 'faq_bookings'", "if (action === 'faq_login' || action === 'faq_bookings'")
# Patch support block
s=re.sub(r"if \(action === 'support' \|\| action === 'support_human'\) \{.*?\n  \}\n\n  if \(action === 'back_main'", r'''if (action === 'support' || action === 'support_human') {
    await answerVkMessageEvent({ eventId, userId: vkUserId, peerId, text: 'Поддержка открыта.' })
      .catch((error) => logVkWebhookError('answer support', error));

    await editOrSendVkCard({
      peerId,
      conversationMessageId,
      message: ['Поддержка КликБук', '', 'Напишите вопрос обычным сообщением. Если нужно — откройте FAQ.'].join('\n'),
      keyboard: buildVkSupportKeyboard(token),
    });
    return;
  }

  if (action === 'back_main' ''', s, flags=re.S)
s=s.replace("if (action === 'back_main'  || action === 'noop'", "if (action === 'back_main' || action === 'noop'")
# Patch back main block
s=re.sub(r"if \(action === 'back_main' \|\| action === 'noop'\) \{.*?\n  \}\n\n  await answerVkMessageEvent\(", r'''if (action === 'back_main' || action === 'noop') {
    await answerVkMessageEvent({ eventId, userId: vkUserId, peerId, text: 'Главное меню.' })
      .catch((error) => logVkWebhookError('answer main menu', error));

    await editOrSendVkCard({
      peerId,
      conversationMessageId,
      message: ['КликБук на связи ✅', '', 'Выберите действие ниже.'].join('\n'),
      keyboard: buildVkMainMenuKeyboard(token),
    });
    return;
  }

  await answerVkMessageEvent(''', s, flags=re.S)
p.write_text(s)
