import type { Locale } from '@/lib/i18n';
import type { Booking, BookingStatus, MasterProfile } from '@/lib/types';

export interface ServiceInsight {
  id: string;
  name: string;
  duration: number;
  price: number;
  status: 'active' | 'seasonal' | 'draft';
  visible: boolean;
  bookings: number;
  revenue: number;
  popularity: number;
  category: string;
}

export interface ClientInsight {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  nextVisit?: string;
  visits: number;
  averageCheck: number;
  totalRevenue: number;
  segment: 'new' | 'regular' | 'sleeping';
  favorite: boolean;
  note: string;
  source: string;
  service: string;
}

export interface DailyInsight {
  date: string;
  label: string;
  visitors: number;
  requests: number;
  confirmed: number;
  revenue: number;
  newClients: number;
  pageViews: number;
}

export interface ChannelInsight {
  id: string;
  label: string;
  visitors: number;
  bookings: number;
  revenue: number;
  conversion: number;
}

export interface WeeklyLoadInsight {
  week: string;
  bookings: number;
  hours: number;
  utilization: number;
}

export interface PeakHourInsight {
  hour: string;
  bookings: number;
}

export interface MessageTemplateInsight {
  id: string;
  title: string;
  channel: string;
  conversion: string;
  variables: string[];
  content: string;
}

export interface AvailabilityDayInsight {
  id: string;
  label: string;
  status: 'workday' | 'short' | 'day-off';
  slots: string[];
  breaks: string[];
}

export interface IntegrationInsight {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'recommended' | 'available';
  hint: string;
}

export interface NotificationInsight {
  id: string;
  title: string;
  description: string;
  channel: 'push' | 'email' | 'telegram' | 'vk';
  enabled: boolean;
  critical?: boolean;
}

export interface PaymentInsight {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  method: string;
  plan: string;
}

export interface SubscriptionPlan {
  id: 'start' | 'pro' | 'studio' | 'premium';
  name: string;
  description: string;
  monthly: number;
  yearly: number;
  popular?: boolean;
  features: string[];
}

export interface LimitInsight {
  id: string;
  label: string;
  used: number;
  total: number;
  accent?: 'success' | 'warning';
}

export interface WorkspaceDataset {
  services: ServiceInsight[];
  clients: ClientInsight[];
  daily: DailyInsight[];
  channels: ChannelInsight[];
  weeklyLoad: WeeklyLoadInsight[];
  peakHours: PeakHourInsight[];
  templates: MessageTemplateInsight[];
  availability: AvailabilityDayInsight[];
  integrations: IntegrationInsight[];
  notifications: NotificationInsight[];
  payments: PaymentInsight[];
  plans: SubscriptionPlan[];
  limits: LimitInsight[];
  totals: {
    bookings: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    revenue: number;
    visitors: number;
    conversion: number;
    averageCheck: number;
    newClients: number;
    returnRate: number;
  };
}

const SOURCE_LABELS: Record<Locale, string[]> = {
  ru: ['ТГ', 'Инстаграм', 'ВК'],
  en: ['Telegram', 'Instagram', 'VK'],
};

const CATEGORY_LABELS: Record<Locale, string[]> = {
  ru: ['Базовый уход', 'Популярное', 'Дизайн', 'Поддержка', 'Дополнительно'],
  en: ['Core care', 'Popular', 'Design', 'Support', 'Add-on'],
};

const NOTES: Record<Locale, string[]> = {
  ru: [
    'Любит утренние слоты и быстро подтверждает время.',
    'Чаще приходит перед выходными, ценит напоминания.',
    'Хорошо реагирует на деликатное сообщение после визита.',
    'Обычно записывается повторно через 3–4 недели.',
    'Хорошо реагирует на сообщения с готовой ссылкой.',
  ],
  en: [
    'Prefers morning slots and confirms fast.',
    'Usually books before weekends and likes reminders.',
    'Responds well to a soft post-visit follow-up.',
    'Typically comes back every 3–4 weeks.',
    'Reacts well to a short message with the booking link.',
  ],
};

function normalizeDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dayLabel(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function hashSeed(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededFloat(seed: string) {
  const value = Math.sin(hashSeed(seed)) * 10000;
  return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getBookingDateTime(booking: Booking) {
  return new Date(`${booking.date}T${booking.time}:00`);
}

function sum(values: number[]) {
  return values.reduce((total, current) => total + current, 0);
}

function normalizeSourceLabel(value: unknown, locale: Locale): string {
  const raw = String(value ?? '').trim().toLowerCase();
  const ru = locale === 'ru';
  if (raw.includes('инст') || raw.includes('insta') || raw.includes('instagram')) return ru ? 'Инстаграм' : 'Instagram';
  if (raw.includes('вк') || raw.includes('vk') || raw.includes('max') || raw.includes('макс')) return ru ? 'ВК' : 'VK';
  if (raw.includes('tg') || raw.includes('тг') || raw.includes('telegram') || raw.includes('телеграм') || raw.includes('публич')) return ru ? 'ТГ' : 'Telegram';
  return ru ? 'ТГ' : 'Telegram';
}

function serviceDurationFromName(service: string, fallback: number) {
  const match = service.match(/(\d{2,3})\s*(?:мин|min)/i);
  return match ? Number(match[1]) : fallback;
}

function servicePriceFromName(service: string, fallback: number) {
  const match = service.match(/(?:от|from)?\s*([\d\s]{3,})\s*(?:₽|р|rub)/i);
  if (!match?.[1]) return fallback;
  const parsed = Number(match[1].replace(/\s+/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function bookingPrice(booking: Booking, services: ServiceInsight[]) {
  if (typeof booking.priceAmount === 'number' && booking.priceAmount > 0) return Math.round(booking.priceAmount);
  const service = services.find((item) => item.name === booking.service);
  return service?.price ?? servicePriceFromName(booking.service, 0);
}

function countsAsRevenue(booking: Booking) {
  return booking.status === 'completed';
}

function countsAsScheduledBooking(booking: Booking) {
  return booking.status === 'new' || booking.status === 'confirmed' || booking.status === 'completed';
}

function countsAsActiveBooking(booking: Booking) {
  return booking.status !== 'cancelled' && booking.status !== 'no_show';
}

function servicePriceByName(service: string, serviceIndex: number) {
  const seed = hashSeed(`${service}-${serviceIndex}`);
  return 1800 + (seed % 8) * 350 + serviceIndex * 250;
}

function serviceDurationByName(service: string, serviceIndex: number) {
  const options = [45, 60, 75, 90, 105];
  const seed = hashSeed(`${service}-${serviceIndex}-duration`);
  return options[seed % options.length];
}

function buildServices(profile: MasterProfile, bookings: Booking[], locale: Locale): ServiceInsight[] {
  const categories = CATEGORY_LABELS[locale];
  const totalBookings = Math.max(1, bookings.length);

  return profile.services.map((service, index) => {
    const price = servicePriceFromName(service, servicePriceByName(service, index));
    const duration = serviceDurationFromName(service, serviceDurationByName(service, index));
    const related = bookings.filter((booking) => booking.service === service);
    const bookingsCount = related.length;
    const revenue = related
      .filter(countsAsRevenue)
      .reduce((total, booking) => total + (booking.priceAmount ?? price), 0);

    return {
      id: `${profile.slug}-service-${index}`,
      name: service,
      duration,
      price,
      status: 'active',
      visible: true,
      bookings: bookingsCount,
      revenue,
      popularity: Math.round((bookingsCount / totalBookings) * 100),
      category: categories[index % categories.length],
    };
  });
}

function buildClients(bookings: Booking[], services: ServiceInsight[], locale: Locale): ClientInsight[] {
  const serviceMap = new Map(services.map((service) => [service.name, service]));
  const grouped = new Map<string, Booking[]>();

  bookings.forEach((booking) => {
    const key = booking.clientPhone || booking.clientName;
    const next = grouped.get(key) ?? [];
    next.push(booking);
    grouped.set(key, next);
  });

  return Array.from(grouped.entries())
    .map(([key, items], index) => {
      const now = Date.now();
      const sorted = [...items].sort((a, b) => getBookingDateTime(b).getTime() - getBookingDateTime(a).getTime());
      const sortedAsc = [...items].sort((a, b) => getBookingDateTime(a).getTime() - getBookingDateTime(b).getTime());
      const futureItems = sortedAsc.filter((booking) => getBookingDateTime(booking).getTime() > now);
      const pastItems = sorted.filter((booking) => getBookingDateTime(booking).getTime() <= now);
      const nextBooking = futureItems[0];
      const lastVisit = pastItems[0] ?? sortedAsc[0] ?? sorted[0];
      const revenueBookings = sorted.filter(countsAsRevenue);
      const totalRevenue = revenueBookings.reduce((total, booking) => {
        const service = serviceMap.get(booking.service);
        return total + (booking.priceAmount ?? service?.price ?? servicePriceFromName(booking.service, 2400));
      }, 0);
      const averageCheck = revenueBookings.length > 0 ? Math.round(totalRevenue / revenueBookings.length) : 0;
      const daysSince = pastItems[0]
        ? Math.round((now - getBookingDateTime(pastItems[0]).getTime()) / 86400000)
        : 0;
      const hasNoShow = sorted.some((booking) => booking.status === 'no_show' || booking.status === 'cancelled');
      const segment: ClientInsight['segment'] =
        !nextBooking && (hasNoShow || (pastItems[0] && daysSince > 45))
          ? 'sleeping'
          : pastItems.length >= 2
            ? 'regular'
            : 'new';
      const source = normalizeSourceLabel(sorted[0].source ?? sorted[0].channel, locale);

      return {
        id: key,
        name: sorted[0].clientName,
        phone: sorted[0].clientPhone,
        lastVisit: lastVisit.date,
        nextVisit: nextBooking?.date,
        visits: sorted.length,
        averageCheck,
        totalRevenue,
        segment,
        favorite: sorted.length >= 3 || totalRevenue >= 10000,
        note: NOTES[locale][index % NOTES[locale].length],
        source,
        service: sorted[0].service,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

function buildDaily(profile: MasterProfile, bookings: Booking[], services: ServiceInsight[], locale: Locale): DailyInsight[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestBookingDate = bookings.reduce<Date | null>((latest, booking) => {
    const date = new Date(booking.date + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return latest;
    return !latest || date > latest ? date : latest;
  }, null);

  const rangeStart = new Date(today);
  if (!latestBookingDate || latestBookingDate <= today) {
    rangeStart.setDate(today.getDate() - 29);
  }

  const serviceMap = new Map(services.map((service) => [service.name, service]));
  const firstClientVisit = new Map<string, string>();

  [...bookings]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach((booking) => {
      const key = booking.clientPhone || booking.clientName;
      if (!firstClientVisit.has(key)) {
        firstClientVisit.set(key, booking.createdAt.slice(0, 10));
      }
    });

  return Array.from({ length: 30 }, (_, offset) => {
    const date = new Date(rangeStart);
    date.setDate(rangeStart.getDate() + offset);
    const iso = normalizeDate(date);
    const dayBookings = bookings.filter((booking) => booking.date === iso);
    const createdBookings = bookings.filter((booking) => booking.createdAt.slice(0, 10) === iso);
    const requests = createdBookings.length;
    const confirmed = dayBookings.filter((booking) => countsAsScheduledBooking(booking)).length;
    const revenue = dayBookings
      .filter(countsAsRevenue)
      .reduce((total, booking) => total + bookingPrice(booking, services), 0);
    const newClients = createdBookings.filter((booking) => {
      const key = booking.clientPhone || booking.clientName;
      return firstClientVisit.get(key) === iso;
    }).length;

    return {
      date: iso,
      label: dayLabel(date, locale),
      visitors: requests,
      requests,
      confirmed,
      revenue,
      newClients,
      pageViews: requests,
    };
  });
}

function buildChannels(profile: MasterProfile, daily: DailyInsight[], locale: Locale, bookings: Booking[], services: ServiceInsight[]): ChannelInsight[] {
  void daily;

  const sourceLabels = SOURCE_LABELS[locale];
  const grouped = new Map<string, { visitors: number; bookings: number; revenue: number }>();

  for (const label of sourceLabels) {
    grouped.set(label, { visitors: 0, bookings: 0, revenue: 0 });
  }

  for (const booking of bookings) {
    const label = normalizeSourceLabel(booking.source ?? booking.channel, locale);
    const item = grouped.get(label) ?? { visitors: 0, bookings: 0, revenue: 0 };
    item.visitors += 1;
    item.bookings += countsAsScheduledBooking(booking) ? 1 : 0;
    item.revenue += countsAsRevenue(booking) ? bookingPrice(booking, services) : 0;
    grouped.set(label, item);
  }

  return Array.from(grouped.entries())
    .map(([label, item]) => ({
      id: `${profile.slug}-channel-${label.toLowerCase()}`,
      label,
      visitors: item.visitors,
      bookings: item.bookings,
      revenue: item.revenue,
      conversion: item.visitors > 0 ? Number(((item.bookings / item.visitors) * 100).toFixed(1)) : 0,
    }))
    .sort((left, right) => right.bookings - left.bookings || right.visitors - left.visitors);
}

function buildWeeklyLoad(profile: MasterProfile, daily: DailyInsight[]): WeeklyLoadInsight[] {
  void profile;

  return Array.from({ length: 6 }, (_, index) => {
    const start = index * 5;
    const slice = daily.slice(start, start + 5);
    const bookings = sum(slice.map((item) => item.confirmed));
    const hours = Math.round(bookings);
    const utilization = bookings > 0 ? Math.min(100, Math.round((hours / 40) * 100)) : 0;

    return {
      week: `W${index + 1}`,
      bookings,
      hours,
      utilization,
    };
  });
}

function buildPeakHours(profile: MasterProfile, bookings: Booking[]): PeakHourInsight[] {
  void profile;

  return Array.from({ length: 10 }, (_, index) => {
    const hour = 9 + index;
    const label = `${String(hour).padStart(2, '0')}:00`;
    const actual = bookings.filter((booking) => Number(booking.time.split(':')[0]) === hour).length;

    return {
      hour: label,
      bookings: actual,
    };
  });
}

function buildTemplates(locale: Locale): MessageTemplateInsight[] {
  return locale === 'ru'
    ? [
        {
          id: 'confirm',
          title: 'Запись создана',
          channel: locale === 'ru' ? 'ВК / Телеграм' : 'VK / Telegram',
          conversion: '74%',
          variables: ['{{имя}}', '{{дата}}', '{{время}}', '{{услуга}}'],
          content: 'Здравствуйте, {{имя}}! Ваша запись на {{услуга}} создана: {{дата}} в {{время}}. Быстрая ссылка: https://www.кликбук.рф/m/{{slug}}',
        },
        {
          id: 'reminder',
          title: 'Напоминание за день',
          channel: locale === 'ru' ? 'Пуш / ВК' : 'Push / VK',
          conversion: '68%',
          variables: ['{{имя}}', '{{дата}}', '{{время}}'],
          content: 'Напоминаю о визите завтра, {{имя}}. Жду вас {{дата}} в {{время}}. Если понадобится сдвинуть время — дайте знать.',
        },
        {
          id: 'thanks',
          title: 'Спасибо после визита',
          channel: locale === 'ru' ? 'Телеграм' : 'Telegram',
          conversion: '42%',
          variables: ['{{имя}}', 'https://www.кликбук.рф/m/{{slug}}'],
          content: 'Спасибо за визит, {{имя}}! Буду рада видеть вас снова. Сохраните ссылку https://www.кликбук.рф/m/{{slug}}, чтобы в следующий раз записаться быстрее.',
        },
        {
          id: 'return',
          title: 'Возврат клиента',
          channel: 'VK',
          conversion: '31%',
          variables: ['{{имя}}', 'https://www.кликбук.рф/m/{{slug}}'],
          content: 'Здравствуйте, {{имя}}! У меня появились новые удобные слоты на ближайшие недели. Вот быстрая ссылка для записи: https://www.кликбук.рф/m/{{slug}}',
        },
      ]
    : [
        {
          id: 'confirm',
          title: 'Booking created',
          channel: locale === 'ru' ? 'ВК / Телеграм' : 'VK / Telegram',
          conversion: '74%',
          variables: ['{{name}}', '{{date}}', '{{time}}', '{{service}}'],
          content: 'Hi {{name}}! Your {{service}} booking is created for {{date}} at {{time}}. Quick link: https://www.кликбук.рф/m/{{slug}}',
        },
        {
          id: 'reminder',
          title: 'Reminder message',
          channel: locale === 'ru' ? 'Пуш / ВК' : 'Push / VK',
          conversion: '68%',
          variables: ['{{name}}', '{{date}}', '{{time}}'],
          content: 'A quick reminder about your appointment tomorrow, {{name}} — {{date}} at {{time}}. Let me know if you need to adjust the time.',
        },
        {
          id: 'thanks',
          title: 'Post-visit thank you',
          channel: locale === 'ru' ? 'Телеграм' : 'Telegram',
          conversion: '42%',
          variables: ['{{name}}', 'https://www.кликбук.рф/m/{{slug}}'],
          content: 'Thanks for coming, {{name}}. I would love to see you again. Save this link https://www.кликбук.рф/m/{{slug}} to book faster next time.',
        },
        {
          id: 'return',
          title: 'Return invitation',
          channel: 'VK',
          conversion: '31%',
          variables: ['{{name}}', 'https://www.кликбук.рф/m/{{slug}}'],
          content: 'Hi {{name}}! New time slots are open for the coming weeks. Here is the quick booking link: https://www.кликбук.рф/m/{{slug}}',
        },
      ];
}

function buildAvailability(locale: Locale): AvailabilityDayInsight[] {
  return locale === 'ru'
    ? [
        { id: 'mon', label: 'Понедельник', status: 'workday', slots: ['09:00–13:00', '14:00–19:00'], breaks: ['13:00–14:00'] },
        { id: 'tue', label: 'Вторник', status: 'workday', slots: ['10:00–14:00', '15:00–20:00'], breaks: ['14:00–15:00'] },
        { id: 'wed', label: 'Среда', status: 'short', slots: ['11:00–17:00'], breaks: ['14:00–14:30'] },
        { id: 'thu', label: 'Четверг', status: 'workday', slots: ['09:00–13:00', '14:00–19:00'], breaks: ['13:00–14:00'] },
        { id: 'fri', label: 'Пятница', status: 'workday', slots: ['09:00–12:00', '13:00–18:00'], breaks: ['12:00–13:00'] },
        { id: 'sat', label: 'Суббота', status: 'short', slots: ['10:00–15:00'], breaks: [] },
        { id: 'sun', label: 'Воскресенье', status: 'day-off', slots: [], breaks: [] },
      ]
    : [
        { id: 'mon', label: 'Monday', status: 'workday', slots: ['09:00–13:00', '14:00–19:00'], breaks: ['13:00–14:00'] },
        { id: 'tue', label: 'Tuesday', status: 'workday', slots: ['10:00–14:00', '15:00–20:00'], breaks: ['14:00–15:00'] },
        { id: 'wed', label: 'Wednesday', status: 'short', slots: ['11:00–17:00'], breaks: ['14:00–14:30'] },
        { id: 'thu', label: 'Thursday', status: 'workday', slots: ['09:00–13:00', '14:00–19:00'], breaks: ['13:00–14:00'] },
        { id: 'fri', label: 'Friday', status: 'workday', slots: ['09:00–12:00', '13:00–18:00'], breaks: ['12:00–13:00'] },
        { id: 'sat', label: 'Saturday', status: 'short', slots: ['10:00–15:00'], breaks: [] },
        { id: 'sun', label: 'Sunday', status: 'day-off', slots: [], breaks: [] },
      ];
}

function buildIntegrations(locale: Locale): IntegrationInsight[] {
  return locale === 'ru'
    ? [
        { id: 'telegram', name: 'Телеграм', description: 'Подтверждения и быстрые уведомления в личные сообщения.', status: 'connected', hint: 'Подключён и синхронизирует новые заявки.' },
        { id: 'whatsapp', name: 'ВК', description: 'Отправка ссылки, напоминаний и статусов визита.', status: 'connected', hint: 'Активен для клиентских шаблонов.' },
        { id: 'instagram', name: 'Ссылка из Инстаграм', description: 'Ссылка в профиле и метки переходов на публичную страницу.', status: 'recommended', hint: 'Высокий потенциал конверсии из профиля.' },
        { id: 'calendar', name: 'Календарь', description: 'Экспорт подтверждённых визитов в рабочий календарь.', status: 'available', hint: 'Помогает избежать накладок по времени.' },
        { id: 'site', name: 'Taplink / сайт', description: 'Встроить кнопку записи на ваш внешний сайт.', status: 'available', hint: 'Полезно для студий и команд.' },
      ]
    : [
        { id: 'telegram', name: 'Telegram', description: 'Confirmations and fast alerts in direct messages.', status: 'connected', hint: 'Already syncing new requests.' },
        { id: 'whatsapp', name: 'ВК', description: 'Send the link, reminders, and visit status updates.', status: 'connected', hint: 'Enabled for client templates.' },
        { id: 'instagram', name: 'Instagram link', description: 'Track clicks from bio to the public booking page.', status: 'recommended', hint: 'High conversion potential from profile traffic.' },
        { id: 'calendar', name: 'Calendar', description: 'Export confirmed appointments to your calendar.', status: 'available', hint: 'Prevents time overlaps.' },
        { id: 'site', name: 'Website / Taplink', description: 'Embed the booking button on an external site.', status: 'available', hint: 'Useful for studios and teams.' },
      ];
}

function buildNotifications(locale: Locale): NotificationInsight[] {
  return locale === 'ru'
    ? [
        { id: 'new-request', title: 'Новая заявка', description: 'Уведомлять сразу после отправки формы в Телеграм и кабинете.', channel: 'telegram', enabled: true, critical: true },
        { id: 'visit-reminder', title: 'Напоминание клиенту', description: 'Отправлять клиенту подтверждение и напоминания через Telegram.', channel: 'telegram', enabled: true },
        { id: 'chat-message', title: 'Сообщение клиенту', description: 'Доставлять исходящие сообщения из чата клиенту через бота.', channel: 'telegram', enabled: true },
        { id: 'cancellation', title: 'Отмена или перенос', description: 'Сразу сообщать об изменении записи в Телеграм.', channel: 'telegram', enabled: true, critical: true },
        { id: 'schedule-change', title: 'Изменение графика', description: 'Отправлять себе сводку в ВК о блокировках и спецдатах.', channel: 'vk', enabled: false },
        { id: 'weekly-digest', title: 'Недельная сводка', description: 'Доход, конверсия и загрузка по неделе.', channel: 'email', enabled: true },
      ]
    : [
        { id: 'new-request', title: 'New request', description: 'Notify in Telegram and inside the workspace right after the form is sent.', channel: 'telegram', enabled: true, critical: true },
        { id: 'visit-reminder', title: 'Client reminder', description: 'Send confirmations and reminders to the client via Telegram.', channel: 'telegram', enabled: true },
        { id: 'chat-message', title: 'Client chat message', description: 'Deliver outgoing chat messages to the client through the bot.', channel: 'telegram', enabled: true },
        { id: 'cancellation', title: 'Cancellation or reschedule', description: 'Alert immediately in Telegram when an appointment changes.', channel: 'telegram', enabled: true, critical: true },
        { id: 'schedule-change', title: 'Schedule changes', description: 'Send a VK summary about blocked time and special dates.', channel: 'vk', enabled: false },
        { id: 'weekly-digest', title: 'Weekly digest', description: 'Revenue, conversion, and load summary for the week.', channel: 'email', enabled: true },
      ];
}

function buildPayments(locale: Locale): PaymentInsight[] {
  void locale;
  return [];
}

function buildPlans(locale: Locale): SubscriptionPlan[] {
  return locale === 'ru'
    ? [
        {
          id: 'start',
          name: 'Start',
          description: 'Для мастера, который только запускает страницу записи.',
          monthly: 0,
          yearly: 0,
          features: ['До 5 услуг', 'Базовая ссылка', 'Заявки и календарь', '1 канал уведомлений'],
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Основной рабочий тариф с аналитикой и кастомизацией.',
          monthly: 990,
          yearly: 9990,
          popular: true,
          features: ['До 20 услуг', 'Статистика и доход', 'Шаблоны сообщений', 'Кастомизация страницы', 'Напоминания клиентам'],
        },
        {
          id: 'studio',
          name: 'Studio',
          description: 'Для мастеров с несколькими направлениями и плотным потоком.',
          monthly: 2490,
          yearly: 24990,
          features: ['Неограниченные услуги', 'Источники и конверсия', 'Экспорт данных', 'Интеграции', 'Брендирование'],
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'Для студии и команды с приоритетной поддержкой.',
          monthly: 5990,
          yearly: 59990,
          features: ['Команда и сотрудники', 'Премиум-аналитика', 'Брендированные блоки', 'Приоритетная поддержка', 'Расширенные лимиты'],
        },
      ]
    : [
        {
          id: 'start',
          name: 'Start',
          description: 'For a master just launching a booking page.',
          monthly: 0,
          yearly: 0,
          features: ['Up to 5 services', 'Basic public link', 'Requests and calendar', '1 notification channel'],
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'The main working plan with analytics and customization.',
          monthly: 990,
          yearly: 9990,
          popular: true,
          features: ['Up to 20 services', 'Stats and revenue', 'Message templates', 'Public page styling', 'Client reminders'],
        },
        {
          id: 'studio',
          name: 'Studio',
          description: 'For busier masters with multiple service lines.',
          monthly: 2490,
          yearly: 24990,
          features: ['Unlimited services', 'Sources and conversion', 'Data export', 'Integrations', 'Branding'],
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'For studios and teams with priority support.',
          monthly: 5990,
          yearly: 59990,
          features: ['Team members', 'Premium analytics', 'White-label blocks', 'Priority support', 'Expanded limits'],
        },
      ];
}

function buildLimits(services: ServiceInsight[], clients: ClientInsight[], locale: Locale): LimitInsight[] {
  return [
    {
      id: 'services',
      label: locale === 'ru' ? 'Активные услуги' : 'Active services',
      used: services.filter((service) => service.status !== 'draft').length,
      total: 20,
    },
    {
      id: 'clients',
      label: locale === 'ru' ? 'Клиенты в месяц' : 'Clients per month',
      used: clients.length,
      total: 150,
    },
    {
      id: 'reminders',
      label: locale === 'ru' ? 'Напоминания' : 'Reminders',
      used: 0,
      total: 120,
      accent: 'warning',
    },
    {
      id: 'exports',
      label: locale === 'ru' ? 'Экспорты данных' : 'Data exports',
      used: 0,
      total: 10,
      accent: 'success',
    },
  ];
}

export function buildWorkspaceDataset(
  profile: MasterProfile,
  bookings: Booking[],
  locale: Locale,
): WorkspaceDataset {
  const services = buildServices(profile, bookings, locale);
  const clients = buildClients(bookings, services, locale);
  const daily = buildDaily(profile, bookings, services, locale);
  const channels = buildChannels(profile, daily, locale, bookings, services);
  const weeklyLoad = buildWeeklyLoad(profile, daily);
  const peakHours = buildPeakHours(profile, bookings);
  const paidBookings = bookings.filter(countsAsRevenue);
  const totalsRevenue = sum(paidBookings.map((booking) => bookingPrice(booking, services)));
  const visitors = sum(daily.map((item) => item.visitors));
  const confirmed = bookings.filter((booking) => countsAsScheduledBooking(booking)).length;
  const completed = bookings.filter((booking) => booking.status === 'completed').length;

  const totals = {
    bookings: bookings.length,
    confirmed,
    completed,
    cancelled: bookings.filter((booking) => booking.status === 'cancelled' || booking.status === 'no_show').length,
    revenue: totalsRevenue,
    visitors,
    conversion: visitors > 0 ? Number(((sum(daily.map((item) => item.confirmed)) / visitors) * 100).toFixed(1)) : 0,
    averageCheck: paidBookings.length > 0 ? Math.round(totalsRevenue / paidBookings.length) : 0,
    newClients: sum(daily.map((item) => item.newClients)),
    returnRate: clients.length > 0 ? Number(((clients.filter((client) => client.segment === 'regular').length / clients.length) * 100).toFixed(1)) : 0,
  };

  return {
    services,
    clients,
    daily,
    channels,
    weeklyLoad,
    peakHours,
    templates: buildTemplates(locale),
    availability: buildAvailability(locale),
    integrations: buildIntegrations(locale),
    notifications: buildNotifications(locale),
    payments: buildPayments(locale),
    plans: buildPlans(locale),
    limits: buildLimits(services, clients, locale),
    totals,
  };
}

export function bookingStatusLabel(status: BookingStatus, locale: Locale) {
  if (locale === 'ru') {
    return {
      new: 'Новая',
      confirmed: 'Запланирована',
      completed: 'Пришёл',
      no_show: 'Не пришёл',
      cancelled: 'Отменена',
    }[status];
  }

  return {
    new: 'New',
    confirmed: 'Scheduled',
    completed: 'Arrived',
    no_show: 'No-show',
    cancelled: 'Cancelled',
  }[status];
}

export function formatCurrency(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value / 100);
}
