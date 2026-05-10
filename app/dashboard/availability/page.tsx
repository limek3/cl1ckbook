'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users } from 'lucide-react';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbAvatar,
  KbButton,
  KbCard,
  KbChip,
  KbDisplay,
  KbDivider,
  KbEyebrow,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
const TONES = ['lavender', 'sage', 'peach', 'cream', 'sky', 'coral'] as const;

export default function CalendarPage() {
  const { dataset, ownedProfile, locale, bookings } = useOwnedWorkspaceData();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const today = new Date();

  const week = useMemo(() => {
    const monday = new Date(today);
    const day = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - day);
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return {
        key: d.toISOString().slice(0, 10),
        weekday: d.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''),
        day: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      };
    });
  }, [today]);

  const masters = useMemo(() => {
    const base = [ownedProfile?.name ?? 'Алина', 'Мария И.', 'Дмитрий', 'Ольга', 'Алина', 'Наталья', 'Игорь'];
    return base.slice(0, 7);
  }, [ownedProfile]);

  const slots = useMemo(() => {
    const list: { day: string; master: string; hour: string; client: string; service: string; tone: typeof TONES[number] }[] = [];
    const sample = (bookings ?? []).slice(0, 28);
    week.forEach((w, di) => {
      sample.filter((_, i) => i % 7 === di).forEach((b, mi) => {
        list.push({
          day: w.key,
          master: masters[mi % masters.length],
          hour: b.time.slice(0, 2) + ':00',
          client: b.clientName,
          service: b.service,
          tone: TONES[(di + mi) % TONES.length],
        });
      });
    });
    return list;
  }, [bookings, masters, week]);

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KbEyebrow>Планируйте день и загрузку мастеров с удовольствием</KbEyebrow>
            <KbDisplay level={1} className="mt-3">Календарь</KbDisplay>
          </div>
          <KbButton variant="navy">
            <Plus size={14} /> Новая запись
          </KbButton>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-[14px] border border-[var(--kb-border)] bg-white p-1">
            {[
              { k: 'day', l: 'День' },
              { k: 'week', l: 'Неделя' },
              { k: 'month', l: 'Месяц' },
            ].map((v) => (
              <button
                key={v.k}
                onClick={() => setView(v.k as typeof view)}
                className={`rounded-[10px] px-4 py-1.5 text-[12px] transition ${
                  view === v.k ? 'bg-[var(--kb-navy)] text-white' : 'text-[var(--kb-text-secondary)]'
                }`}
              >
                {v.l}
              </button>
            ))}
          </div>
          <KbChip>Все мастера</KbChip>
          <div className="ml-auto flex items-center gap-1">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--kb-border)] bg-white">
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-[13px] text-[var(--kb-text-secondary)]">
              19 — 25 мая 2025
            </span>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--kb-border)] bg-white">
              <ChevronRight size={16} />
            </button>
            <KbButton variant="outline" size="sm" className="ml-2">Сегодня</KbButton>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <KbCard className="p-0">
            {/* Week header */}
            <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] border-b border-[var(--kb-line)] bg-[var(--kb-bg-soft)]">
              <div />
              {week.map((d) => (
                <div key={d.key} className="border-l border-[var(--kb-line)] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">{d.weekday}</div>
                  <div className={`kb-metric mt-1 text-[20px] ${d.isToday ? 'text-[var(--kb-coral)]' : 'text-[var(--kb-text)]'}`}>
                    {d.day}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--kb-text-muted)]">
                    <KbAvatar src={null} alt={masters[0]} fallback={masters[0]} size={18} />
                    <span className="truncate">{masters[0]}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Hour rows */}
            <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] auto-rows-[64px]">
              {HOURS.map((hour) => (
                <div key={hour} className="contents">
                  <div className="border-b border-r border-[var(--kb-line)] px-3 py-2 text-[11px] text-[var(--kb-text-muted)]">
                    {hour}
                  </div>
                  {week.map((day) => {
                    const slot = slots.find((s) => s.day === day.key && s.hour === hour);
                    return (
                      <div key={`${day.key}-${hour}`} className="relative border-b border-l border-[var(--kb-line)] p-1">
                        {slot && (
                          <div className={`kb-bg-${slot.tone} h-full rounded-[10px] border border-[var(--kb-border)] p-2 text-[11px] leading-tight`}>
                            <div className="font-medium text-[var(--kb-text)] truncate">{slot.client}</div>
                            <div className="text-[10px] text-[var(--kb-text-muted)] truncate">{slot.service}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </KbCard>

          {/* Right summary */}
          <div className="flex flex-col gap-4">
            <KbCard className="p-5">
              <div className="flex items-center justify-between">
                <KbEyebrow>Сегодня, 23 мая</KbEyebrow>
                <KbChip tone="confirmed">7</KbChip>
              </div>
              <div className="kb-metric mt-3 text-[24px]">{formatCurrency(42800, locale)}</div>
              <div className="mt-1 text-[12px] text-[var(--kb-text-muted)]">средний чек {formatCurrency(3280, locale)}</div>
              <KbDivider className="my-4" />
              <div className="flex items-center gap-3">
                <div className="relative h-[80px] w-[80px]">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" stroke="var(--kb-warm-surface)" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="42" stroke="var(--kb-coral)" strokeWidth="8" fill="none"
                      strokeLinecap="round" strokeDasharray={`${78 * 2.64} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="kb-metric text-[18px]">78%</span>
                  </div>
                </div>
                <div className="text-[12px] text-[var(--kb-text-secondary)]">
                  <div className="font-medium text-[var(--kb-text)]">Загрузка дня</div>
                  <div className="mt-1 text-[var(--kb-text-muted)]">+12% к среднему</div>
                </div>
              </div>
            </KbCard>

            <KbCard className="p-5">
              <KbEyebrow>Загрузка мастеров</KbEyebrow>
              <ul className="mt-4 space-y-3 text-[13px]">
                {[
                  { name: 'Мария Иванова', load: 95 },
                  { name: 'Светлана Морозова', load: 75 },
                  { name: 'Игорь Петров', load: 62 },
                ].map((m) => (
                  <li key={m.name}>
                    <div className="flex items-center justify-between text-[12px]">
                      <span>{m.name}</span>
                      <span className="text-[var(--kb-text-muted)]">{m.load}%</span>
                    </div>
                    <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
                      <span className="block h-full rounded-full bg-[var(--kb-coral)]" style={{ width: `${m.load}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </KbCard>

            <KbCard className="p-5">
              <KbEyebrow>Ближайшие записи</KbEyebrow>
              <ul className="mt-4 space-y-3">
                {(bookings ?? []).slice(0, 3).map((b) => (
                  <li key={b.id} className="flex items-center gap-2.5 text-[12px]">
                    <span className="kb-metric tabular-nums w-12 text-[var(--kb-text-muted)]">{b.time}</span>
                    <KbAvatar src={null} alt={b.clientName} fallback={b.clientName} size={26} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[var(--kb-text)]">{b.clientName}</div>
                      <div className="truncate text-[10px] text-[var(--kb-text-muted)]">{b.service}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </KbCard>
          </div>
        </div>
      </div>
    </KbShell>
  );
}
