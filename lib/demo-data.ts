import { defaultAppearanceSettings, type AppearanceSettings } from '@/lib/appearance';
import type { ChatThreadRecord } from '@/lib/chat-types';
import type { WorkspaceSections } from '@/lib/workspace-store';
import type { Booking, MasterProfile } from '@/lib/types';

export const SLOTY_DEMO_SLUG = 'sloty-demo';

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
  profession: 'Ногтевой сервис · demo mode',
  city: 'Москва',
  bio: 'Уютная demo-страница с готовыми отзывами, работами и понятной записью. Это отдельный сценарий на моках: можно показать клиенту, как выглядит публичный профиль, не затрагивая рабочую базу.',
  services: [
    'Маникюр + покрытие',
    'Укрепление гелем',
    'Педикюр smart',
    'Снятие + новый дизайн',
    'Экспресс-уход',
  ],
  phone: '+7 999 444-22-11',
  telegram: 'sloty_demo',
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
      text: 'Удобно, что можно сразу перейти в чат и быстро перенести время. Профиль выглядит дорого и чисто.',
      dateLabel: 'месяц назад',
      service: 'Педикюр smart',
    },
    {
      id: 'demo-review-3',
      author: 'Елена',
      rating: 5,
      text: 'Красивый demo-профиль, отлично показывает клиенту, как всё будет выглядеть после запуска.',
      dateLabel: '6 дней назад',
      service: 'Укрепление гелем',
    },
  ],
  workGallery: [
    {
      id: 'demo-work-1',
      title: 'Milk pink',
      image: buildArtworkDataUri('Milk pink', 'Чистая форма и мягкий блеск', '#f9bcc7', '#a855f7'),
      note: 'Нежный повседневный дизайн',
    },
    {
      id: 'demo-work-2',
      title: 'Glossy nude',
      image: buildArtworkDataUri('Glossy nude', 'Минималистичный салонный сет', '#f3d0b6', '#fb7185'),
      note: 'Самый частый выбор новых клиентов',
    },
    {
      id: 'demo-work-3',
      title: 'Deep espresso',
      image: buildArtworkDataUri('Deep espresso', 'Контрастный тон с мягким светом', '#7c3f29', '#111827'),
      note: 'Осенний тёплый акцент',
    },
    {
      id: 'demo-work-4',
      title: 'Soft chrome',
      image: buildArtworkDataUri('Soft chrome', 'Светлая хромированная фактура', '#dbeafe', '#6366f1'),
      note: 'Для вечерних записей',
    },
  ],
  createdAt: new Date('2025-01-15T09:30:00.000Z').toISOString(),
};

export const demoBookings: Booking[] = [
  {
    id: 'demo-booking-1',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Мария',
    clientPhone: '+7 999 100-00-11',
    service: 'Маникюр + покрытие',
    date: daysFromToday(1),
    time: '11:00',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-2',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Светлана',
    clientPhone: '+7 999 200-00-22',
    service: 'Педикюр smart',
    date: daysFromToday(3),
    time: '14:30',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-booking-3',
    masterSlug: SLOTY_DEMO_SLUG,
    clientName: 'Елена',
    clientPhone: '+7 999 300-00-33',
    service: 'Укрепление гелем',
    date: daysFromToday(-5),
    time: '16:00',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
];

export function getDemoProfile(slug: string) {
  return slug === SLOTY_DEMO_SLUG ? demoProfile : null;
}

export function getDemoBookings(slug: string) {
  return slug === SLOTY_DEMO_SLUG ? demoBookings : [];
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
      clientName: 'Мария',
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
            : 'КликБук бот prepared a soft reschedule for 12:30.',
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
      clientName: 'Светлана',
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
      clientName: 'Елена',
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
      source: locale === 'ru' ? 'Instagram bio' : 'Instagram bio',
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
            : 'КликБук бот found a convenient 6:00 PM slot and sent a quick confirmation.',
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
          detail: 'Самый плотный поток записей и лучшая конверсия из Telegram.',
        },
        {
          id: 'demo-analytics-2',
          label: 'Точка роста',
          value: '+18%',
          detail: 'Повторные визиты растут после шаблона “Спасибо после визита”.',
        },
        {
          id: 'demo-analytics-3',
          label: 'Что показать клиенту',
          value: 'Чаты + шаблоны',
          detail: 'Лучше всего продают демо, где видно сообщения, аналитику и публичную страницу вместе.',
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
        'MAX дал 9 новых диалогов за 7 дней.',
        'Telegram держит самую чистую конверсию в запись.',
        'Окно 15:00–18:00 собирает больше всего повторных клиентов.',
        'После follow-up шаблона возврат клиентов вырос на 12%.',
      ]
    : [
        'MAX generated 9 new conversations in 7 days.',
        'Telegram keeps the cleanest booking conversion.',
        'The 3–6 PM window attracts the most repeat clients.',
        'The follow-up template lifted returning visits by 12%.',
      ];
}

export function getDashboardDemoSections(locale: 'ru' | 'en'): WorkspaceSections {
  return {
    appearance: getDashboardDemoAppearance(),
    chats: getDashboardDemoChatThreads(locale),
  };
}
