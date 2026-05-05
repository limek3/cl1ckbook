/**
 * Адаптер: конвертирует реальные данные из вашей платформы (AppContext)
 * в формат, который ожидают компоненты мини-аппа.
 *
 * Все mini-app экраны импортируют отсюда вместо @/lib/mini-demo.
 */

import type { Booking, MasterProfile } from '@/lib/types';
import type {
  MasterInfo, Service, Appointment, Client, Thread, Message, ApptStatus,
} from '@/lib/mini-demo';

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

// ─── Threads/Messages — пока пустые (можно расширить на /api/chats) ─
export const ADAPTED_THREADS: Thread[] = [];
export const ADAPTED_MESSAGES: Message[] = [];

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
