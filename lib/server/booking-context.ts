import 'server-only';

import type { Booking, MasterProfile } from '@/lib/types';

export function normalizeBookingServices(booking: Pick<Booking, 'service'>) {
  const raw = String(booking.service || '').trim();
  if (!raw) return ['—'];

  const cleaned = raw
    .replace(/[-–—_]{3,}\s*входит\s*:?\s*-?/gi, '')
    .replace(/\s+входит\s*:?\s*-?\s*$/gi, '')
    .trim();

  const parts = cleaned
    .split(/\n|;|\s\+\s|,\s(?=[А-ЯA-ZЁ])/g)
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [raw || '—'];
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
  const firstService = normalizeBookingServices(booking)[0] || 'запись';
  return `${firstService} · ${booking.date} ${booking.time}`.trim();
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
