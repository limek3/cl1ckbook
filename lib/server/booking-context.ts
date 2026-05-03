import 'server-only';

import type { Booking, MasterProfile } from '@/lib/types';

export function normalizeBookingServices(booking: Pick<Booking, 'service'>) {
  const raw = String(booking.service || '').trim();
  if (!raw) return ['Услуга не указана'];

  const cleaned = raw
    .replace(/[-–—_]{3,}\s*входит\s*:?\s*-?/gi, '')
    .replace(/\s+входит\s*:?\s*-?\s*$/gi, '')
    .replace(/^[-–—_\s]+$/g, '')
    .trim();

  const normalized = cleaned || raw;
  const looksEmpty =
    !cleaned ||
    /^[-–—_:\s]+$/i.test(normalized) ||
    /^[-–—_:\s]*(входит|includes)\s*:?\s*[-–—_:\s]*$/i.test(normalized);

  if (looksEmpty) return ['Услуга не указана'];

  const parts = normalized
    .split(/\n|;|\s\+\s|,\s(?=[А-ЯA-ZЁ])|\s·\s/g)
    .map((item) => item.replace(/^[-–—_\s]+/, '').replace(/[-–—_\s]+$/, '').trim())
    .filter(Boolean)
    .filter((item) => !/^входит\s*:?\s*[-–—_\s]*$/i.test(item));

  return parts.length > 0 ? parts : ['Услуга не указана'];
}

export function bookingCode(booking: Pick<Booking, 'id'>) {
  const compact = String(booking.id || '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 6)
    .toUpperCase();

  return compact ? `#CB-${compact}` : '#CB';
}

export function masterDisplayName(profile?: MasterProfile | null, fallback = 'мастер') {
  return profile?.name?.trim() || fallback;
}

export function bookingServicesText(booking: Pick<Booking, 'service'>) {
  return normalizeBookingServices(booking).map((item) => `— ${item}`).join('\n');
}

export function bookingShortContext(booking: Booking) {
  const services = normalizeBookingServices(booking);
  const firstService = services[0] || 'запись';
  const serviceLabel = services.length > 1 ? `${firstService} +${services.length - 1}` : firstService;
  return `${serviceLabel} · ${booking.date} ${booking.time}`.trim();
}

export function bookingSelectionLabel(booking: Booking, profile?: MasterProfile | null) {
  const services = normalizeBookingServices(booking);
  const firstService = services[0] || 'запись';
  const serviceLabel = services.length > 1 ? `${firstService} +${services.length - 1}` : firstService;
  const master = masterDisplayName(profile, booking.masterSlug || 'мастер');
  return `${master} · ${serviceLabel} · ${booking.date} ${booking.time}`.slice(0, 64);
}

export function bookingChatTitle(booking: Booking, profile?: MasterProfile | null) {
  return `${booking.clientName} · ${bookingShortContext(booking)} · ${masterDisplayName(profile)}`;
}

export function bookingThreadMetadata(booking: Booking, profile?: MasterProfile | null, extra: Record<string, unknown> = {}) {
  return {
    ...extra,
    bookingId: booking.id,
    bookingIds: [booking.id],
    bookingCode: bookingCode(booking),
    masterSlug: booking.masterSlug,
    masterName: masterDisplayName(profile),
    service: booking.service,
    services: normalizeBookingServices(booking),
    bookingDate: booking.date,
    bookingTime: booking.time,
    source: booking.source ?? null,
    channel: booking.channel ?? null,
  };
}

export function bookingMessageText(params: {
  title: string;
  booking: Booking;
  profile?: MasterProfile | null;
  includeClient?: boolean;
  includePhone?: boolean;
  source?: string | null;
  channel?: string | null;
  footer?: string | null;
}) {
  const booking = params.booking;
  const masterName = masterDisplayName(params.profile, booking.masterSlug || 'мастер');
  const lines: Array<string | null | undefined> = [
    params.title,
    '',
    `Запись: ${bookingCode(booking)}`,
    `Мастер: ${masterName}`,
    params.includeClient ? `Клиент: ${booking.clientName}` : null,
    params.includePhone ? `Телефон: ${booking.clientPhone}` : null,
    '',
    'Услуги:',
    bookingServicesText(booking),
    '',
    `Дата: ${booking.date}`,
    `Время: ${booking.time}`,
    params.source ? `Источник: ${params.source}` : null,
    params.channel ? `Канал связи: ${params.channel}` : null,
    booking.comment ? '' : null,
    booking.comment ? 'Комментарий:' : null,
    booking.comment || null,
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
    `${bookingCode(booking)} · ${masterName}`,
    serviceLine,
    compactDateTime(booking),
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
