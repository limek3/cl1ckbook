'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  X,
  XCircle,
} from 'lucide-react';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbAvatar,
  KbButton,
  KbCard,
  KbChip,
  KbDisplay,
  KbDivider,
  KbEyebrow,
  KbStatCard,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';
import type { Booking, BookingStatus } from '@/lib/types';

const TABS: { key: 'today' | 'pending' | 'completed' | 'cancelled' | 'all'; label: string }[] = [
  { key: 'today', label: 'Сегодня' },
  { key: 'pending', label: 'Ожидают' },
  { key: 'completed', label: 'Завершены' },
  { key: 'cancelled', label: 'Отменены' },
  { key: 'all', label: 'Все' },
];

function statusChip(status: BookingStatus) {
  if (status === 'confirmed') return <KbChip tone="confirmed">Подтверждена</KbChip>;
  if (status === 'completed') return <KbChip tone="completed">Завершена</KbChip>;
  if (status === 'cancelled' || status === 'no_show') return <KbChip tone="cancelled">Отменена</KbChip>;
  return <KbChip tone="pending">Новая</KbChip>;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AppointmentsPage() {
  const { dataset, ownedProfile, locale, bookings } = useOwnedWorkspaceData();
  const [filter, setFilter] = useState<typeof TABS[number]['key']>('today');
  const [selectedDate, setSelectedDate] = useState<string>(dayKey(new Date()));
  const [selected, setSelected] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');

  const dateRow = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + (idx - 2));
      return {
        key: dayKey(d),
        weekday: d.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''),
        day: d.getDate(),
        month: d.toLocaleDateString('ru-RU', { month: 'short' }),
        isToday: dayKey(d) === dayKey(today),
      };
    });
  }, []);

  const filtered = useMemo(() => {
    const list = bookings ?? [];
    return list.filter((b) => {
      if (filter === 'today' && b.date !== selectedDate) return false;
      if (filter === 'pending' && b.status !== 'new') return false;
      if (filter === 'completed' && b.status !== 'completed') return false;
      if (filter === 'cancelled' && b.status !== 'cancelled' && b.status !== 'no_show') return false;
      if (
        search &&
        !b.clientName.toLowerCase().includes(search.toLowerCase()) &&
        !b.service.toLowerCase().includes(search.toLowerCase())
      ) return false;
      return true;
    }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [bookings, filter, search, selectedDate]);

  const stats = useMemo(() => {
    const list = bookings ?? [];
    const today = dayKey(new Date());
    const todayList = list.filter((b) => b.date === today);
    return {
      today: todayList.length,
      pending: list.filter((b) => b.status === 'new').length,
      completed: list.filter((b) => b.status === 'completed').length,
      cancelled: list.filter((b) => b.status === 'cancelled' || b.status === 'no_show').length,
      todayRevenue: todayList.reduce((s, b) => s + (b.priceAmount || 0), 0),
      avgConfirmed: list.filter((b) => b.status === 'confirmed').length,
    };
  }, [bookings]);

  const detail = selected ?? filtered[0] ?? null;

  return (
    <KbShell
      user={{
        name: ownedProfile?.name ?? 'Гость',
        subtitle: ownedProfile?.profession,
        avatar: ownedProfile?.avatar ?? null,
      }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <KbEyebrow>Сегодня · {dataset?.totals?.bookings ?? 0} записей</KbEyebrow>
              <KbDisplay level={1} className="mt-3">Записи</KbDisplay>
            </div>
            <div className="flex items-center gap-2">
              <KbButton variant="outline" size="md">
                <RotateCcw size={14} /> Импорт
              </KbButton>
              <KbButton variant="navy" size="md">
                <Plus size={14} /> Новая запись
              </KbButton>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <KbStatCard
              label="Сегодня"
              value={stats.today}
              caption="запис"
              icon={<Clock size={18} />}
              iconTone="cream"
            />
            <KbStatCard
              label="Подтверждены"
              value={stats.avgConfirmed}
              caption={formatCurrency(stats.todayRevenue, locale)}
              icon={<CheckCircle2 size={18} />}
              iconTone="lavender"
            />
            <KbStatCard
              label="Завершены"
              value={stats.completed}
              icon={<Send size={18} />}
              iconTone="sage"
            />
            <KbStatCard
              label="Отменены"
              value={stats.cancelled}
              icon={<XCircle size={18} />}
              iconTone="peach"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <KbChip key={tab.key} active={filter === tab.key} onClick={() => setFilter(tab.key)}>
                {tab.label}
              </KbChip>
            ))}
            <div className="ml-auto flex h-10 w-[260px] items-center gap-2 rounded-[14px] border border-[var(--kb-border)] bg-white px-3">
              <Search size={15} className="text-[var(--kb-text-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Найти запись"
                className="h-full w-full bg-transparent text-[13px] outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {dateRow.map((d) => {
              const active = d.key === selectedDate;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDate(d.key)}
                  className={`flex h-[72px] min-w-[72px] flex-col items-center justify-center rounded-[18px] border px-3 transition ${
                    active
                      ? 'border-transparent bg-[var(--kb-navy)] text-white'
                      : 'border-[var(--kb-border)] bg-white text-[var(--kb-text)] hover:bg-[var(--kb-warm-surface)]'
                  }`}
                >
                  <span className={`text-[11px] uppercase ${active ? 'text-white/70' : 'text-[var(--kb-text-muted)]'}`}>
                    {d.weekday}
                  </span>
                  <span className="kb-metric mt-1 text-[20px]">{d.day}</span>
                  <span className={`text-[10px] ${active ? 'text-white/60' : 'text-[var(--kb-text-muted)]'}`}>
                    {d.month}
                  </span>
                </button>
              );
            })}
          </div>

          <KbCard className="mt-6 overflow-hidden p-0">
            <table className="kb-table">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Клиент</th>
                  <th>Услуга</th>
                  <th>Мастер</th>
                  <th>Статус</th>
                  <th>Канал</th>
                  <th className="text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--kb-text-muted)]">
                      Записей в этот день пока нет
                    </td>
                  </tr>
                )}
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className={`cursor-pointer ${detail?.id === b.id ? 'kb-row-active' : ''}`}
                  >
                    <td className="font-medium tabular-nums">{b.time}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <KbAvatar src={null} alt={b.clientName} fallback={b.clientName} size={32} />
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium">{b.clientName}</div>
                          <div className="truncate text-[12px] text-[var(--kb-text-muted)]">{b.clientPhone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-[13px]">{b.service}</td>
                    <td className="text-[13px] text-[var(--kb-text-secondary)]">
                      {ownedProfile?.name?.split(' ')[0] ?? '—'}
                    </td>
                    <td>{statusChip(b.status)}</td>
                    <td className="text-[12px] text-[var(--kb-text-muted)]">{b.source ?? 'Web'}</td>
                    <td className="kb-metric text-right text-[13px]">
                      {b.priceAmount ? formatCurrency(b.priceAmount, locale) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </KbCard>

          {filtered.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-[12px] text-[var(--kb-text-muted)]">
              <span>Показано {filtered.length} записей</span>
              <div className="flex items-center gap-1">
                <button className="rounded-md border border-[var(--kb-border)] bg-white px-2 py-1 hover:bg-[var(--kb-warm-surface)]">
                  ‹
                </button>
                <button className="rounded-md bg-[var(--kb-navy)] px-2 py-1 text-white">1</button>
                <button className="rounded-md border border-[var(--kb-border)] bg-white px-2 py-1 hover:bg-[var(--kb-warm-surface)]">
                  2
                </button>
                <button className="rounded-md border border-[var(--kb-border)] bg-white px-2 py-1 hover:bg-[var(--kb-warm-surface)]">
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        {detail && (
          <aside className="kb-card sticky top-24 h-fit p-6">
            <div className="flex items-start justify-between">
              <KbEyebrow>Запись · #{detail.id.slice(0, 6)}</KbEyebrow>
              <button
                onClick={() => setSelected(null)}
                className="text-[var(--kb-text-muted)] hover:text-[var(--kb-text)]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <KbAvatar src={null} alt={detail.clientName} fallback={detail.clientName} size={48} />
              <div>
                <div className="text-[16px] font-medium text-[var(--kb-text)]">{detail.clientName}</div>
                <div className="text-[12px] text-[var(--kb-text-muted)]">{detail.clientPhone}</div>
              </div>
              <button className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--kb-border)] hover:bg-[var(--kb-warm-surface)]">
                <Phone size={14} />
              </button>
            </div>

            <KbDivider className="my-5" />

            <ul className="space-y-3 text-[13px]">
              <li className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">Услуга</div>
                  <div className="mt-1 font-medium">{detail.service}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">Мастер</div>
                  <div className="mt-1">{ownedProfile?.name?.split(' ')[0] ?? '—'}</div>
                </div>
              </li>
              <li className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">Дата · время</div>
                  <div className="mt-1 font-medium tabular-nums">
                    {detail.date} · {detail.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">Канал</div>
                  <div className="mt-1">{detail.source ?? 'Web'}</div>
                </div>
              </li>
            </ul>

            {detail.comment && (
              <div className="mt-5 rounded-[14px] bg-[var(--kb-warm-surface)] p-4 text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
                <div className="kb-eyebrow mb-2 block">Заметка</div>
                {detail.comment}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-[14px] bg-[var(--kb-warm-surface)] p-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">Сумма</div>
                <div className="kb-metric mt-1 text-[20px]">
                  {detail.priceAmount ? formatCurrency(detail.priceAmount, locale) : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">Длительность</div>
                <div className="kb-metric mt-1 text-[20px]">
                  {detail.durationMinutes ? `${detail.durationMinutes} мин` : '—'}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <KbButton variant="primary">Принять</KbButton>
              <KbButton variant="outline">Перенести</KbButton>
            </div>
            <KbButton variant="ghost" className="mt-2 w-full">
              Отменить запись
            </KbButton>
          </aside>
        )}
      </div>
    </KbShell>
  );
}
