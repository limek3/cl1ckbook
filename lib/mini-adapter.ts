/**
 * Адаптер: конвертирует реальные данные из вашей платформы (AppContext)
 * в формат, который ожидают компоненты мини-аппа.
 *
 * Все mini-app экраны импортируют отсюда вместо @/lib/mini-demo.
 */

import type { Booking, MasterProfile } from '@/lib/types';
import type {
  MasterInfo, Service, Appointment, Client, Thread, Message, ApptStatus,
  Template, ScheduleDay,
} from '@/lib/mini-demo';
import type { ChatThreadRecord, ChatMessageRecord } from '@/lib/chat-types';

// ─── Subscription ────────────────────────────────
export interface SubscriptionInfo {
  plan: string;
  planLabel: string;
  status: string;
  currentPeriodEnd: string | null;
  price: string;
  cycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    services: number;
    bookings: number;
    clients: number;
    templates: number;
    storage: number;
  };
  usage: {
    services: number;
    bookings: number;
    clients: number;
    templates: number;
    storage: number;
  };
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Базовый',
  pro: 'Pro',
  business: 'Бизнес',
};

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['До 30 записей в месяц', '1 шаблон', 'Telegram-бот'],
  pro: [
    'Безлимит записей и клиентов',
    'Неограниченные шаблоны и рассылки',
    'Аналитика по периодам и каналам',
    'Интеграции с TG, ВК, Google Calendar',
    'Приоритетная поддержка',
  ],
  business: [
    'Всё из Pro',
    'Несколько мастеров',
    'Брендинг страницы',
    'Webhook API',
  ],
};

export function adaptSubscription(billing: any, bookings: Booking[], services: number, templates: number): SubscriptionInfo {
  const plan = String(billing?.subscription?.planId ?? billing?.subscription?.plan ?? 'free').toLowerCase();
  const cycle = (billing?.subscription?.billingCycle === 'yearly' ? 'yearly' : 'monthly') as 'monthly' | 'yearly';
  const limits = billing?.limits ?? { services: 50, bookings: 1000, clients: 1000, templates: 50, storage: 5 };
  const periodEnd = billing?.subscription?.currentPeriodEnd ?? null;
  const status = billing?.subscription?.status ?? 'active';

  const price = plan === 'free' ? '0 ₽'
    : plan === 'pro' ? (cycle === 'yearly' ? '7 900 ₽ / год' : '790 ₽ / мес')
    : plan === 'business' ? (cycle === 'yearly' ? '19 900 ₽ / год' : '1 990 ₽ / мес')
    : '— ₽';

  // count clients: unique by name+phone in bookings
  const clientKeys = new Set<string>();
  for (const b of bookings) clientKeys.add(`${b.clientName}|${b.clientPhone || ''}`);

  const sinceMonth = new Date(); sinceMonth.setDate(1);
  const bookingsThisMonth = bookings.filter((b) => new Date(b.date) >= sinceMonth).length;

  return {
    plan,
    planLabel: PLAN_LABELS[plan] ?? plan,
    status,
    currentPeriodEnd: periodEnd,
    price,
    cycle,
    features: PLAN_FEATURES[plan] ?? PLAN_FEATURES.pro!,
    limits,
    usage: {
      services,
      bookings: bookingsThisMonth,
      clients: clientKeys.size,
      templates,
      storage: 0.6,
    },
  };
}

// ─── Master profile ─────────────────────────────────
export function adaptMaster(profile: MasterProfile | null): MasterInfo {
  if (!profile) {
    return {
      name: 'Загрузка...',
      firstName: '...',
      username: '@—',
      city: '',
      rating: 0,
      service: '',
      link: '/m/',
      phone: '',
      bio: '',
      socials: { tg: '', vk: '', ig: '' },
    };
  }

  return {
    name: profile.name || 'Мастер',
    firstName: (profile.name || '').split(' ')[0] || 'Мастер',
    username: profile.telegram ? `@${profile.telegram.replace(/^@/, '')}` : `@${profile.slug}`,
    city: profile.city || '',
    rating: profile.rating ?? 0,
    service: profile.profession || '',
    link: `/m/${profile.slug}`,
    phone: profile.phone || '',
    bio: profile.bio || '',
    socials: {
      tg: profile.telegram || '',
      vk: '',
      ig: '',
    },
  };
}

// ─── Services (из MasterProfile.services как string[]) ─────
export function adaptServices(profile: MasterProfile | null): Service[] {
  const list = profile?.services ?? [];
  if (list.length === 0) return [];

  return list.map((name, i) => ({
    n: i + 1,
    name,
    price: 0,
    duration: 60,
    popularity: 1 - i * 0.15,
    count: 0,
  }));
}

// ─── Bookings → Appointments ────────────────────────
const STATUS_MAP: Record<string, ApptStatus> = {
  new: 'scheduled',
  confirmed: 'scheduled',
  completed: 'completed',
  no_show: 'cancelled',
  cancelled: 'cancelled',
};

export function adaptAppointments(bookings: Booking[]): Appointment[] {
  if (!bookings || bookings.length === 0) return [];

  // Сортируем: ближайшие сначала
  const sorted = [...bookings].sort((a, b) => {
    const da = `${a.date} ${a.time}`;
    const db = `${b.date} ${b.time}`;
    return da.localeCompare(db);
  });

  // Первая активная запись = "in-focus"
  const firstActiveIdx = sorted.findIndex(
    (b) => b.status === 'new' || b.status === 'confirmed',
  );

  return sorted.map((b, i) => ({
    time: b.time,
    name: b.clientName,
    service: b.service,
    status: i === firstActiveIdx ? 'in-focus' : (STATUS_MAP[b.status] ?? 'scheduled'),
    phone: b.clientPhone || '',
    dur: b.durationMinutes || 60,
  }));
}

// ─── Clients (агрегируем из bookings) ────────────────
export function adaptClients(bookings: Booking[]): Client[] {
  if (!bookings || bookings.length === 0) return [];

  const map = new Map<string, Client>();
  for (const b of bookings) {
    const key = `${b.clientName}-${b.clientPhone || ''}`;
    const existing = map.get(key);
    const price = b.priceAmount || 0;
    if (existing) {
      existing.visits += 1;
      existing.total += price;
    } else {
      map.set(key, {
        name: b.clientName,
        phone: b.clientPhone || '',
        visits: 1,
        total: price,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

// ─── Threads/Messages — адаптеры из /api/chats ───────
function adaptChatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'вчера';
  if (diffDays < 30) return `${diffDays} дн`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function adaptChatChannel(ch: string): Thread['channel'] {
  if (ch === 'Telegram') return 'TG';
  if (ch === 'VK') return 'ВК';
  if (ch === 'Instagram') return 'IG';
  return 'Web';
}

export function adaptMessages(records: ChatMessageRecord[]): Message[] {
  return records.map((m) => ({
    from: m.author === 'client' ? 'them' : 'me',
    text: m.body,
    t: new Date(m.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  }));
}

export function adaptThreads(records: ChatThreadRecord[]): Thread[] {
  return records.map((r) => ({
    id: r.id,
    name: r.clientName,
    last: r.lastMessagePreview ?? '',
    time: adaptChatTime(r.lastMessageAt),
    channel: adaptChatChannel(r.channel),
    unread: r.unreadCount,
    messages: adaptMessages(r.messages),
  }));
}

export const ADAPTED_THREADS: Thread[] = [];
export const ADAPTED_MESSAGES: Message[] = [];

// ─── Schedule (workspaceData.availability) ───────────
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function adaptSchedule(workspaceData: any): ScheduleDay[] {
  const av = workspaceData?.availability;
  if (!av || !Array.isArray(av)) {
    // fallback default
    return WEEKDAYS.map((d, i) => ({
      d,
      from: i === 6 ? '—' : '10:00',
      to: i === 6 ? '—' : (i === 5 ? '17:00' : '20:00'),
      on: i !== 6,
    }));
  }
  // Normalize: each av entry should have weekday, startTime, endTime, enabled
  return WEEKDAYS.map((d, i) => {
    const entry = av.find((x: any) => {
      const wd = x.weekday ?? x.dayIndex ?? x.day;
      return Number(wd) === i || x.label === d;
    });
    if (!entry) {
      return { d, from: '—', to: '—', on: false };
    }
    const enabled = entry.enabled ?? entry.on ?? entry.isWorkingDay ?? true;
    const from = entry.startTime ?? entry.from ?? entry.start ?? '10:00';
    const to = entry.endTime ?? entry.to ?? entry.end ?? '20:00';
    return {
      d,
      from: enabled ? String(from).slice(0, 5) : '—',
      to: enabled ? String(to).slice(0, 5) : '—',
      on: !!enabled,
    };
  });
}

// ─── Templates (workspaceData.templates) ─────────────
export function adaptTemplates(workspaceData: any): Template[] {
  const list = workspaceData?.templates;
  if (!list || !Array.isArray(list) || list.length === 0) return [];
  return list.map((t: any, i: number) => ({
    id: String(t.id ?? `tpl-${i}`),
    name: String(t.name ?? t.title ?? `Шаблон ${i + 1}`),
    body: String(t.body ?? t.text ?? t.message ?? ''),
  }));
}

// ─── Revenue week (агрегируем из bookings) ───────────
export function adaptRevenueWeek(bookings: Booking[]): { d: string; v: number; active: boolean }[] {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const result: Record<string, number> = Object.fromEntries(days.map((d) => [d, 0]));

  const today = new Date();
  const todayWd = (today.getDay() + 6) % 7; // Mon=0
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - todayWd);

  for (const b of bookings) {
    if (b.status !== 'completed') continue;
    const d = new Date(b.date);
    if (d < weekStart) continue;
    const wd = days[(d.getDay() + 6) % 7]!;
    result[wd] = (result[wd] ?? 0) + (b.priceAmount || 0);
  }

  return days.map((d, i) => ({
    d, v: result[d]!, active: i === todayWd,
  }));
}
