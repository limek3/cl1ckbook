import { defaultAppearanceSettings, type AppearanceSettings } from '@/lib/appearance';
import type { ChatThreadRecord } from '@/lib/chat-types';
import type { WorkspaceSections } from '@/lib/workspace-store';
import type { Booking, MasterProfile } from '@/lib/types';

export const SLOTY_DEMO_SLUG = 'klikbuk-demo';
export const DEMO_PROFILE_STORAGE_KEY = 'sloty-demo:profile';
export const DEMO_PROFILE_UPDATED_EVENT = 'sloty-demo:profile-updated';

function daysFromToday(offset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function buildArtworkDataUri(title: string, subtitle: string, start: string, end: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="20%" r="70%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#g)" />
      <rect width="1200" height="900" fill="url(#glow)" />
      <g fill="none" stroke="rgba(255,255,255,0.22)">
        <circle cx="980" cy="170" r="140" />
        <circle cx="1040" cy="720" r="180" />
        <path d="M90 700c140-180 320-260 540-240" />
      </g>
      <g fill="#ffffff">
        <text x="92" y="150" font-size="78" font-family="Inter, Arial, sans-serif" font-weight="700">${title}</text>
        <text x="96" y="214" font-size="30" font-family="Inter, Arial, sans-serif" opacity="0.86">${subtitle}</text>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const demoProfile: MasterProfile = {
  id: 'demo-profile-sloty',
  slug: SLOTY_DEMO_SLUG,
  name: 'Алина Морозова',
  profession: 'Ногтевой сервис',
  city: 'Москва',
  bio: 'Маникюр, педикюр и укрепление. Чистая работа, спокойный сервис и запись без долгой переписки.',
  services: [
    'Маникюр + покрытие',
    'Укрепление гелем',
    'Смарт-педикюр',
    'Снятие + новый дизайн',
    'Экспресс-уход',
  ],
  phone: '+7 999 444-22-11',
  telegram: 'klikbuk_demo',
  whatsapp: '+79994442211',
  avatar: '',
  rating: 4.9,
  reviewCount: 128,
  responseTime: 'Отвечаю в течение 10 минут',
  experienceLabel: 'Опыт 7 лет',
  priceHint: 'от 2 300 ₽',
  reviews: [
    {
      id: 'demo-review-1',
      author: 'Мария',
      rating: 5,
      text: 'Очень аккуратно, спокойно и без суеты. Понравилось, как организована запись и напоминания.',
      dateLabel: '2 недели назад',
      service: 'Маникюр + покрытие',
    },
    {
      id: 'demo-review-2',
      author: 'Светлана',
      rating: 5,
      text: 'Удобно записаться, всё понятно по услугам и времени. Профиль выглядит аккуратно.',
      dateLabel: 'месяц назад',
      service: 'Смарт-педикюр',
    },
    {
      id: 'demo-review-3',
      author: 'Елена',
      rating: 5,
      text: 'Страница аккуратная, по услугам и записи всё понятно сразу.',
      dateLabel: '6 дней назад',
      service: 'Укрепление гелем',
    },
  ],
  workGallery: [
    {
      id: 'demo-work-1',
      title: 'Молочный розовый',
      image: buildArtworkDataUri('Молочный розовый', 'Чистая форма и мягкий блеск', '#f9bcc7', '#a855f7'),
      note: 'Нежный повседневный дизайн',
    },
    {
      id: 'demo-work-2',
      title: 'Глянцевый нюд',
      image: buildArtworkDataUri('Глянцевый нюд', 'Минималистичный салонный сет', '#f3d0b6', '#fb7185'),
      note: 'Самый частый выбор новых клиентов',
    },
    {
      id: 'demo-work-3',
      title: 'Глубокий эспрессо',
      image: buildArtworkDataUri('Глубокий эспрессо', 'Контрастный тон с мягким светом', '#7c3f29', '#111827'),
      note: 'Осенний тёплый акцент',
    },
    {
      id: 'demo-work-4',
      title: 'Мягкий хром',
      image: buildArtworkDataUri('Мягкий хром', 'Светлая хромированная фактура', '#dbeafe', '#6366f1'),
      note: 'Для вечерних записей',
    },
  ],
  createdAt: new Date('2025-01-15T09:30:00.000Z').toISOString(),
};

const demoProfileEn: MasterProfile = {
  ...demoProfile,
  name: 'Alina Morozova',
  profession: 'Nail care specialist',
  city: 'Amsterdam',
  bio: 'Manicure, pedicure, and nail strengthening with a calm service flow. Services, reviews, contacts, and booking are clear before the client writes.',
  services: [
    'Gel polish manicure',
    'Gel strengthening',
    'Smart pedicure',
    'Removal + new design',
    'Express care',
  ],
  phone: '+31 6 4444 2211',
  whatsapp: '+31644442211',
  responseTime: 'Replies within 10 minutes',
  experienceLabel: '7 years of experience',
  priceHint: 'from €45',
  reviews: [
    {
      id: 'demo-review-1',
      author: 'Maria',
      rating: 5,
      text: 'Very neat, calm, and organized. I liked that booking and reminders were clear from the start.',
      dateLabel: '2 weeks ago',
      service: 'Gel polish manicure',
    },
    {
      id: 'demo-review-2',
      author: 'Svetlana',
      rating: 5,
      text: 'It was easy to book, and the services and available time were clear right away.',
      dateLabel: '1 month ago',
      service: 'Smart pedicure',
    },
    {
      id: 'demo-review-3',
      author: 'Elena',
      rating: 5,
      text: 'The page feels clean and professional. Services, reviews, and booking are easy to understand.',
      dateLabel: '6 days ago',
      service: 'Gel strengthening',
    },
  ],
  workGallery: [
    {
      id: 'demo-work-1',
      title: 'Milky rose',
      image: buildArtworkDataUri('Milky rose', 'Clean shape and soft shine', '#f9bcc7', '#a855f7'),
      note: 'Soft everyday design',
    },
    {
      id: 'demo-work-2',
      title: 'Glossy nude',
      image: buildArtworkDataUri('Glossy nude', 'Minimal salon set', '#f3d0b6', '#fb7185'),
      note: 'Most popular first-visit choice',
    },
    {
      id: 'demo-work-3',
      title: 'Deep espresso',
      image: buildArtworkDataUri('Deep espresso', 'Warm contrast tone', '#7c3f29', '#111827'),
      note: 'Warm seasonal accent',
    },
    {
      id: 'demo-work-4',
      title: 'Soft chrome',
      image: buildArtworkDataUri('Soft chrome', 'Light chrome texture', '#dbeafe', '#6366f1'),
      note: 'For evening appointments',
    },
  ],
};

const demoBookingEn: Record<string, Pick<Booking, 'clientName' | 'service' | 'comment'>> = {
  'demo-booking-1': {
    clientName: 'Maria',
    service: 'Gel polish manicure',
    comment: 'First visit, prefers a calm shade and short square shape.',
  },
  'demo-booking-2': {
    clientName: 'Olga',
    service: 'Removal + strengthening',
    comment: 'Asked to move 15 minutes later if a slot opens.',
  },
  'demo-booking-3': {
    clientName: 'Elena',
    service: 'Extensions + design',
    comment: 'Usually brings a design reference and arrives early.',
  },
  'demo-booking-4': {
    clientName: 'Ksenia',
    service: 'Smart pedicure',
    comment: 'Needs a receipt and a short reminder one hour before the visit.',
  },
  'demo-booking-5': {
    clientName: 'Alina',
    service: 'Gel correction',
    comment: 'Regular client; suggest the next slot right after the visit.',
  },
  'demo-booking-6': {
    clientName: 'Svetlana',
    service: 'Express manicure',
    comment: 'If an earlier slot opens, Telegram is convenient.',
  },
  'demo-booking-7': {
    clientName: 'Natalia',
    service: 'Gel strengthening',
    comment: 'Evening visit; send a soft reminder in advance.',
  },
  'demo-booking-8': {
    clientName: 'Marina',
    service: 'Gel polish manicure',
    comment: 'Ready to confirm in chat after the morning reminder.',
  },
  'demo-booking-9': {
    clientName: 'Irina',
    service: 'Smart pedicure',
    comment: 'After the visit, send a short message with the next available slot.',
  },
  'demo-booking-10': {
    clientName: 'Daria',
    service: 'Gel strengthening',
    comment: 'Completed visit from history for analytics.',
  },
};

function localizeDemoProfile(locale: 'ru' | 'en') {
  return locale === 'ru' ? demoProfile : demoProfileEn;
}

function localizeDemoBookings(locale: 'ru' | 'en') {
  if (locale === 'ru') return demoBookings;

  return demoBookings.map((booking) => ({
    ...booking,
    ...(demoBookingEn[booking.id] ?? {}),
  }));
}


export const demoBookings: Booking[] = [
  {
    id: 'demo-booking-1',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Мария',
    clientPhone: '+7 999 100-00-11',
    service: 'Маникюр + покрытие',
    date: daysFromToday(0),
    time: '09:30',
    comment: 'Первый визит, любит спокойный тон и короткий квадрат.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-2',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Ольга',
    clientPhone: '+7 999 120-00-19',
    service: 'Снятие + укрепление',
    date: daysFromToday(0),
    time: '11:00',
    comment: 'Просила сдвинуться на 15 минут, если окно освободится.',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-3',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Елена',
    clientPhone: '+7 999 300-00-33',
    service: 'Наращивание + дизайн',
    date: daysFromToday(0),
    time: '12:30',
    comment: 'Берёт дизайн по референсу, обычно приходит заранее.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-4',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Ксения',
    clientPhone: '+7 999 410-00-48',
    service: 'Смарт-педикюр',
    date: daysFromToday(0),
    time: '14:30',
    comment: 'Нужен чек и короткое напоминание за час.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-5',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Алина',
    clientPhone: '+7 999 520-00-57',
    service: 'Коррекция геля',
    date: daysFromToday(0),
    time: '16:00',
    comment: 'Постоянный клиент, можно предложить следующий слот сразу после визита.',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-6',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Светлана',
    clientPhone: '+7 999 200-00-22',
    service: 'Экспресс-маникюр',
    date: daysFromToday(0),
    time: '17:30',
    comment: 'Если освободится окно раньше, удобно написать в Телеграм.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-7',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Наталья',
    clientPhone: '+7 999 620-00-63',
    service: 'Укрепление гелем',
    date: daysFromToday(0),
    time: '19:00',
    comment: 'Вечерний визит, лучше заранее отправить мягкое напоминание.',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-8',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Марина',
    clientPhone: '+7 999 710-00-71',
    service: 'Маникюр + покрытие',
    date: daysFromToday(1),
    time: '11:00',
    comment: 'Готова подтвердить в чате, если придёт напоминание утром.',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-9',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Ирина',
    clientPhone: '+7 999 820-00-82',
    service: 'Смарт-педикюр',
    date: daysFromToday(3),
    time: '14:30',
    comment: 'После визита стоит отправить короткое сообщение с предложением следующего окна.',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-10',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Дарья',
    clientPhone: '+7 999 930-00-94',
    service: 'Укрепление гелем',
    date: daysFromToday(-5),
    time: '16:00',
    comment: 'Завершённый визит из истории для аналитики.',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
];

function normalizeDemoProfile(value: Partial<MasterProfile> | null | undefined): MasterProfile | null {
  if (!value) return null;

  return {
    ...demoProfile,
    ...value,
    id: value.id || demoProfile.id,
    slug: SLOTY_DEMO_SLUG,
    name: value.name || demoProfile.name,
    profession: value.profession || demoProfile.profession,
    city: value.city || demoProfile.city,
    bio: value.bio || demoProfile.bio,
    services: Array.isArray(value.services) && value.services.length > 0 ? value.services : demoProfile.services,
    workGallery: Array.isArray(value.workGallery) ? value.workGallery : demoProfile.workGallery,
    reviews: Array.isArray(value.reviews) ? value.reviews : demoProfile.reviews,
    rating: typeof value.rating === 'number' ? value.rating : demoProfile.rating,
    reviewCount: typeof value.reviewCount === 'number' ? value.reviewCount : value.reviews?.length ?? demoProfile.reviewCount,
    createdAt: value.createdAt || demoProfile.createdAt,
  };
}

export function readStoredDemoProfile() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
    return raw ? normalizeDemoProfile(JSON.parse(raw) as Partial<MasterProfile>) : null;
  } catch {
    return null;
  }
}

export function saveStoredDemoProfile(profile: MasterProfile) {
  if (typeof window === 'undefined') return;

  try {
    const normalized = normalizeDemoProfile(profile) ?? demoProfile;
    window.localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(DEMO_PROFILE_UPDATED_EVENT, { detail: normalized }));
  } catch {}
}

export function resetStoredDemoProfile() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(DEMO_PROFILE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(DEMO_PROFILE_UPDATED_EVENT, { detail: demoProfile }));
  } catch {}
}

export function getDemoProfile(slug: string, locale: 'ru' | 'en' = 'ru') {
  if (slug !== SLOTY_DEMO_SLUG) return null;
  return readStoredDemoProfile() ?? localizeDemoProfile(locale);
}

export function getDemoBookings(slug: string, locale: 'ru' | 'en' = 'ru') {
  return slug === SLOTY_DEMO_SLUG ? localizeDemoBookings(locale) : [];
}


export function getDashboardDemoAppearance(): AppearanceSettings {
  return {
    ...defaultAppearanceSettings,
    accentTone: 'cobalt',
    neutralTone: 'zinc',
    density: 'compact',
    radius: 'medium',
    motion: 'smooth',
    cardStyle: 'soft',
    publicAccent: 'cobalt',
    publicSurface: 'soft',
    publicHeroLayout: 'split',
    publicCardStyle: 'soft',
    publicServicesStyle: 'grid',
    publicBookingStyle: 'panel',
    platformWidth: 'focused',
    sidebarDensity: 'tight',
    topbarDensity: 'tight',
  };
}

export function getDashboardDemoChatThreads(locale: 'ru' | 'en'): ChatThreadRecord[] {
  const firstVisit = daysFromToday(1);
  const secondVisit = daysFromToday(3);
  const thirdVisit = daysFromToday(7);

  return [
    {
      id: 'demo-thread-1',
      workspaceId: 'demo-workspace',
      clientName: locale === 'ru' ? 'Мария' : 'Maria',
      clientPhone: '+7 999 100-00-11',
      channel: 'Telegram',
      segment: 'new',
      source: locale === 'ru' ? 'Публичная страница' : 'Public page',
      nextVisit: firstVisit,
      isPriority: true,
      botConnected: true,
      lastMessagePreview: locale === 'ru'
        ? 'Добрый день! Можно ли немного сдвинуть запись на завтра?'
        : 'Hello! Can we move tomorrow’s booking a little later?',
      lastMessageAt: new Date(`${firstVisit}T09:18:00.000Z`).toISOString(),
      unreadCount: 2,
      createdAt: new Date(`${firstVisit}T08:45:00.000Z`).toISOString(),
      updatedAt: new Date(`${firstVisit}T09:18:00.000Z`).toISOString(),
      messages: [
        {
          id: 'demo-thread-1-message-1',
          threadId: 'demo-thread-1',
          author: 'client',
          body: locale === 'ru'
            ? 'Здравствуйте! Я записана на маникюр завтра.'
            : 'Hello! I am booked for a manicure tomorrow.',
          viaBot: false,
          deliveryState: null,
          createdAt: new Date(`${firstVisit}T08:45:00.000Z`).toISOString(),
        },
        {
          id: 'demo-thread-1-message-2',
          threadId: 'demo-thread-1',
          author: 'system',
          body: locale === 'ru'
            ? 'КликБук бот подготовил мягкий перенос на 12:30.'
            : 'ClickBook bot prepared a soft reschedule for 12:30.',
          viaBot: true,
          deliveryState: 'queued',
          createdAt: new Date(`${firstVisit}T09:02:00.000Z`).toISOString(),
        },
        {
          id: 'demo-thread-1-message-3',
          threadId: 'demo-thread-1',
          author: 'client',
          body: locale === 'ru'
            ? 'Добрый день! Можно ли немного сдвинуть запись на завтра?'
            : 'Hello! Can we move tomorrow’s booking a little later?',
          viaBot: false,
          deliveryState: null,
          createdAt: new Date(`${firstVisit}T09:18:00.000Z`).toISOString(),
        },
      ],
    },
    {
      id: 'demo-thread-2',
      workspaceId: 'demo-workspace',
      clientName: locale === 'ru' ? 'Светлана' : 'Svetlana',
      clientPhone: '+7 999 200-00-22',
      channel: 'MAX',
      segment: 'active',
      source: 'MAX',
      nextVisit: secondVisit,
      isPriority: false,
      botConnected: true,
      lastMessagePreview: locale === 'ru'
        ? 'Подтверждаю, 14:30 мне подходит.'
        : 'Confirmed, 2:30 PM works for me.',
      lastMessageAt: new Date(`${secondVisit}T10:44:00.000Z`).toISOString(),
      unreadCount: 0,
      createdAt: new Date(`${secondVisit}T09:56:00.000Z`).toISOString(),
      updatedAt: new Date(`${secondVisit}T10:44:00.000Z`).toISOString(),
      messages: [
        {
          id: 'demo-thread-2-message-1',
          threadId: 'demo-thread-2',
          author: 'system',
          body: locale === 'ru'
            ? 'Здравствуйте, Светлана! Напоминаю о записи на педикюр.'
            : 'Hi Svetlana! A reminder about your pedicure booking.',
          viaBot: true,
          deliveryState: 'read',
          createdAt: new Date(`${secondVisit}T09:56:00.000Z`).toISOString(),
        },
        {
          id: 'demo-thread-2-message-2',
          threadId: 'demo-thread-2',
          author: 'client',
          body: locale === 'ru'
            ? 'Подтверждаю, 14:30 мне подходит.'
            : 'Confirmed, 2:30 PM works for me.',
          viaBot: false,
          deliveryState: null,
          createdAt: new Date(`${secondVisit}T10:44:00.000Z`).toISOString(),
        },
      ],
    },
    {
      id: 'demo-thread-3',
      workspaceId: 'demo-workspace',
      clientName: locale === 'ru' ? 'Елена' : 'Elena',
      clientPhone: '+7 999 300-00-33',
      channel: 'Telegram',
      segment: 'followup',
      source: locale === 'ru' ? 'Повторный визит' : 'Repeat visit',
      nextVisit: thirdVisit,
      isPriority: false,
      botConnected: true,
      lastMessagePreview: locale === 'ru'
        ? 'Спасибо! Скиньте, пожалуйста, ближайшие слоты на следующую неделю.'
        : 'Thanks! Please send the nearest slots for next week.',
      lastMessageAt: new Date(`${thirdVisit}T13:28:00.000Z`).toISOString(),
      unreadCount: 1,
      createdAt: new Date(`${thirdVisit}T12:10:00.000Z`).toISOString(),
      updatedAt: new Date(`${thirdVisit}T13:28:00.000Z`).toISOString(),
      messages: [
        {
          id: 'demo-thread-3-message-1',
          threadId: 'demo-thread-3',
          author: 'system',
          body: locale === 'ru'
            ? 'Спасибо за визит! Когда будет удобно, отправлю ближайшие окна сюда.'
            : 'Thanks for visiting! I can send the nearest slots here.',
          viaBot: true,
          deliveryState: 'delivered',
          createdAt: new Date(`${thirdVisit}T12:10:00.000Z`).toISOString(),
        },
        {
          id: 'demo-thread-3-message-2',
          threadId: 'demo-thread-3',
          author: 'client',
          body: locale === 'ru'
            ? 'Спасибо! Скиньте, пожалуйста, ближайшие слоты на следующую неделю.'
            : 'Thanks! Please send the nearest slots for next week.',
          viaBot: false,
          deliveryState: null,
          createdAt: new Date(`${thirdVisit}T13:28:00.000Z`).toISOString(),
        },
      ],
    },
    {
      id: 'demo-thread-4',
      workspaceId: 'demo-workspace',
      clientName: locale === 'ru' ? 'Анна' : 'Anna',
      clientPhone: '+7 999 410-10-44',
      channel: 'Telegram',
      segment: 'active',
      source: locale === 'ru' ? 'Ссылка в Инстаграм' : 'Instagram bio',
      nextVisit: secondVisit,
      isPriority: false,
      botConnected: true,
      lastMessagePreview: locale === 'ru'
        ? 'Супер, тогда оставляем запись на 18:00. До встречи!'
        : 'Perfect, then we keep the 6:00 PM slot. See you!',
      lastMessageAt: new Date(`${secondVisit}T15:12:00.000Z`).toISOString(),
      unreadCount: 0,
      createdAt: new Date(`${secondVisit}T14:22:00.000Z`).toISOString(),
      updatedAt: new Date(`${secondVisit}T15:12:00.000Z`).toISOString(),
      messages: [
        {
          id: 'demo-thread-4-message-1',
          threadId: 'demo-thread-4',
          author: 'client',
          body: locale === 'ru'
            ? 'Добрый день! Есть ли вечерние слоты на педикюр?'
            : 'Hi! Do you have any evening pedicure slots?',
          viaBot: false,
          deliveryState: null,
          createdAt: new Date(`${secondVisit}T14:22:00.000Z`).toISOString(),
        },
        {
          id: 'demo-thread-4-message-2',
          threadId: 'demo-thread-4',
          author: 'system',
          body: locale === 'ru'
            ? 'КликБук бот нашёл удобное окно на 18:00 и отправил быстрое подтверждение.'
            : 'ClickBook bot found a convenient 6:00 PM slot and sent a quick confirmation.',
          viaBot: true,
          deliveryState: 'delivered',
          createdAt: new Date(`${secondVisit}T14:39:00.000Z`).toISOString(),
        },
        {
          id: 'demo-thread-4-message-3',
          threadId: 'demo-thread-4',
          author: 'client',
          body: locale === 'ru'
            ? 'Супер, тогда оставляем запись на 18:00. До встречи!'
            : 'Perfect, then we keep the 6:00 PM slot. See you!',
          viaBot: false,
          deliveryState: null,
          createdAt: new Date(`${secondVisit}T15:12:00.000Z`).toISOString(),
        },
      ],
    },
    {
      id: 'demo-thread-5',
      workspaceId: 'demo-workspace',
      clientName: locale === 'ru' ? 'Кристина' : 'Kristina',
      clientPhone: '+7 999 510-14-55',
      channel: 'MAX',
      segment: 'new',
      source: locale === 'ru' ? 'MAX мини-приложение' : 'MAX mini app',
      nextVisit: firstVisit,
      isPriority: true,
      botConnected: true,
      lastMessagePreview: locale === 'ru'
        ? 'Добрый вечер! Я впервые, подскажите, сколько длится укрепление?'
        : 'Good evening! I am a new client — how long does strengthening take?',
      lastMessageAt: new Date(`${firstVisit}T18:14:00.000Z`).toISOString(),
      unreadCount: 1,
      createdAt: new Date(`${firstVisit}T17:52:00.000Z`).toISOString(),
      updatedAt: new Date(`${firstVisit}T18:14:00.000Z`).toISOString(),
      messages: [
        {
          id: 'demo-thread-5-message-1',
          threadId: 'demo-thread-5',
          author: 'system',
          body: locale === 'ru'
            ? 'Привет! Я помогу быстро записаться и отвечу на частые вопросы.'
            : 'Hi! I can help with a quick booking and answer common questions.',
          viaBot: true,
          deliveryState: 'read',
          createdAt: new Date(`${firstVisit}T17:52:00.000Z`).toISOString(),
        },
        {
          id: 'demo-thread-5-message-2',
          threadId: 'demo-thread-5',
          author: 'client',
          body: locale === 'ru'
            ? 'Добрый вечер! Я впервые, подскажите, сколько длится укрепление?'
            : 'Good evening! I am a new client — how long does strengthening take?',
          viaBot: false,
          deliveryState: null,
          createdAt: new Date(`${firstVisit}T18:14:00.000Z`).toISOString(),
        },
      ],
    },
  ];
}


export function getDashboardDemoAnalyticsHighlights(locale: 'ru' | 'en') {
  return locale === 'ru'
    ? [
        {
          id: 'demo-analytics-1',
          label: 'Лучшее окно недели',
          value: 'Вт · 12:30–16:00',
          detail: 'Самый плотный поток записей и лучшая конверсия из Телеграм.',
        },
        {
          id: 'demo-analytics-2',
          label: 'Точка роста',
          value: '+18%',
          detail: 'Повторные визиты растут после шаблона «Спасибо после визита».',
        },
        {
          id: 'demo-analytics-3',
          label: 'Что показать клиенту',
          value: 'Чаты + шаблоны',
          detail: 'Лучше всего работают каналы, где клиент сразу видит страницу записи и отзывы.',
        },
      ]
    : [
        {
          id: 'demo-analytics-1',
          label: 'Best window this week',
          value: 'Tue · 12:30–4:00 PM',
          detail: 'The densest booking flow and the strongest Telegram conversion.',
        },
        {
          id: 'demo-analytics-2',
          label: 'Growth point',
          value: '+18%',
          detail: 'Repeat visits grow after the “Thank you after visit” template.',
        },
        {
          id: 'demo-analytics-3',
          label: 'What to show first',
          value: 'Chats + templates',
          detail: 'Demos convert best when messages, analytics, and the public page are shown together.',
        },
      ];
}

export function getDashboardDemoAnalyticsFeed(locale: 'ru' | 'en') {
  return locale === 'ru'
    ? [
        'За последние 7 дней Телеграм дал больше всего подтверждённых записей.',
        'Во вторник и четверг окно после обеда заполняется быстрее всего.',
        'Повторные визиты чаще приходят после сообщения с благодарностью и ссылкой на запись.',
        'Напоминание за день до визита заметно снижает количество переносов.',
      ]
    : [
        'Telegram delivered the largest number of confirmed bookings in the last 7 days.',
        'Tuesday and Thursday afternoons fill up the fastest.',
        'Repeat visits grow after a thank-you message with a booking link.',
        'A reminder one day before the visit noticeably reduces reschedules.',
      ];
}

export function getDashboardDemoSections(locale: 'ru' | 'en'): WorkspaceSections {
  return {
    appearance: getDashboardDemoAppearance(),
    chats: getDashboardDemoChatThreads(locale),
  };
}
