'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  Filter,
  Heart,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Send,
  Star,
  TrendingUp,
  Users,
  X,
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

const SEGMENTS: { key: 'all' | 'new' | 'regular' | 'sleeping' | 'fav'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'regular', label: 'Постоянные' },
  { key: 'sleeping', label: 'Спящие' },
  { key: 'fav', label: 'Любимые' },
];

export default function ClientsPage() {
  const { dataset, ownedProfile, locale } = useOwnedWorkspaceData();
  const [segment, setSegment] = useState<typeof SEGMENTS[number]['key']>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const clients = dataset?.clients ?? [];

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (segment === 'fav' && !c.favorite) return false;
      if (segment === 'new' && c.segment !== 'new') return false;
      if (segment === 'regular' && c.segment !== 'regular') return false;
      if (segment === 'sleeping' && c.segment !== 'sleeping') return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [clients, segment, search]);

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  const stats = useMemo(() => {
    const totalRevenue = clients.reduce((s, c) => s + c.totalRevenue, 0);
    const newCount = clients.filter((c) => c.segment === 'new').length;
    const sleeping = clients.filter((c) => c.segment === 'sleeping').length;
    const avgCheck = clients.length ? Math.round(totalRevenue / clients.reduce((s, c) => s + c.visits, 0)) : 0;
    return { total: clients.length, new: newCount, sleeping, avgCheck };
  }, [clients]);

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <KbEyebrow>База клиентов</KbEyebrow>
              <KbDisplay level={1} className="mt-3">Клиенты</KbDisplay>
              <p className="mt-2 max-w-md text-[14px] text-[var(--kb-text-secondary)]">
                Управляйте клиентской базой и отношениями.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <KbButton variant="outline">
                <Send size={14} /> Импорт клиентов
              </KbButton>
              <KbButton variant="navy">
                <Plus size={14} /> Новый клиент
              </KbButton>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <KbStatCard
              label="Всего клиентов"
              value={stats.total.toLocaleString('ru-RU')}
              caption="в базе"
              icon={<Users size={18} />}
              iconTone="lavender"
            />
            <KbStatCard
              label="Новые в этом месяце"
              value={stats.new}
              caption="за период"
              icon={<TrendingUp size={18} />}
              iconTone="sage"
            />
            <KbStatCard
              label="Возвращающиеся"
              value={Math.round(stats.total * 0.35)}
              caption="постоянные"
              icon={<Heart size={18} />}
              iconTone="peach"
            />
            <KbStatCard
              label="Средний чек"
              value={formatCurrency(stats.avgCheck, locale)}
              icon={<Star size={18} />}
              iconTone="cream"
            />
          </div>

          <KbCard className="mt-6 overflow-hidden p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--kb-line)] p-4">
              <div className="flex h-10 w-[280px] items-center gap-2 rounded-[14px] border border-[var(--kb-border)] bg-[var(--kb-warm-surface)] px-3">
                <Search size={15} className="text-[var(--kb-text-muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по клиентам"
                  className="h-full w-full bg-transparent text-[13px] outline-none"
                />
              </div>
              {SEGMENTS.map((s) => (
                <KbChip key={s.key} active={segment === s.key} onClick={() => setSegment(s.key)}>
                  {s.label}
                </KbChip>
              ))}
              <button className="ml-auto inline-flex items-center gap-1 rounded-[12px] border border-[var(--kb-border)] bg-white px-3 py-1.5 text-[12px] text-[var(--kb-text-secondary)] hover:bg-[var(--kb-warm-surface)]">
                <Filter size={13} /> Ещё фильтры
              </button>
            </div>
            <table className="kb-table">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Последний визит</th>
                  <th>Любимая услуга</th>
                  <th className="text-right">Выручка</th>
                  <th>Сегмент</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-[var(--kb-text-muted)]">
                    Клиенты не найдены
                  </td></tr>
                )}
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`cursor-pointer ${selected?.id === c.id ? 'kb-row-active' : ''}`}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <KbAvatar src={null} alt={c.name} fallback={c.name} size={36} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-[13px] font-medium">
                            {c.name}
                            {c.favorite && <Heart size={12} className="text-[var(--kb-coral)]" fill="currentColor" />}
                          </div>
                          <div className="truncate text-[12px] text-[var(--kb-text-muted)]">{c.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-[13px] tabular-nums">{c.lastVisit}</td>
                    <td className="text-[13px]">{c.service}</td>
                    <td className="text-right kb-metric text-[13px]">{formatCurrency(c.totalRevenue, locale)}</td>
                    <td>
                      <KbChip
                        tone={c.segment === 'sleeping' ? 'cancelled' : c.segment === 'regular' ? 'completed' : 'confirmed'}
                      >
                        {c.segment === 'new' ? 'Новый' : c.segment === 'regular' ? 'Постоянный' : 'Спящий'}
                      </KbChip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </KbCard>

          <div className="mt-4 flex items-center justify-between text-[12px] text-[var(--kb-text-muted)]">
            <span>Показано 1—{filtered.length} из {stats.total}</span>
            <div className="flex items-center gap-1">
              <button className="rounded-md border border-[var(--kb-border)] bg-white px-2 py-1">‹</button>
              <button className="rounded-md bg-[var(--kb-navy)] px-2 py-1 text-white">1</button>
              <button className="rounded-md border border-[var(--kb-border)] bg-white px-2 py-1">2</button>
              <button className="rounded-md border border-[var(--kb-border)] bg-white px-2 py-1">›</button>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <aside className="kb-card sticky top-24 h-fit p-6">
            <div className="flex items-start justify-between">
              <KbEyebrow>{selected.segment === 'regular' ? 'Постоянный клиент' : 'Клиент'}</KbEyebrow>
              <button onClick={() => setSelectedId(null)} className="text-[var(--kb-text-muted)] hover:text-[var(--kb-text)]">
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <KbAvatar src={null} alt={selected.name} fallback={selected.name} size={56} />
              <div>
                <div className="text-[18px] font-medium">{selected.name}</div>
                <div className="text-[12px] text-[var(--kb-text-muted)]">Клиент с {selected.lastVisit}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <ActionButton icon={<Phone size={14} />} label="Звонок" />
              <ActionButton icon={<MessageCircle size={14} />} label="Чат" />
              <ActionButton icon={<CalendarDays size={14} />} label="Запись" />
              <ActionButton icon={<Heart size={14} />} label="Вип" />
            </div>

            <KbDivider className="my-5" />

            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Визитов" value={selected.visits} />
              <Stat label="LTV" value={formatCurrency(selected.totalRevenue, locale)} />
              <Stat label="Средний чек" value={formatCurrency(selected.averageCheck, locale)} />
            </div>

            <KbDivider className="my-5" />

            <div className="kb-eyebrow mb-2 block">История визитов</div>
            <ul className="space-y-2 text-[13px]">
              {(selected.bookings ?? []).slice(0, 4).map((booking) => (
                <li key={booking.id} className="flex items-start justify-between gap-3 text-[12px]">
                  <span className="text-[var(--kb-text-muted)]">{booking.date}</span>
                  <span className="flex-1 text-[var(--kb-text)]">{booking.service}</span>
                  <KbChip tone="confirmed">{booking.status}</KbChip>
                </li>
              ))}
              {(selected.bookings ?? []).length === 0 && (
                <li className="text-[12px] text-[var(--kb-text-muted)]">Пока нет визитов</li>
              )}
            </ul>

            <KbDivider className="my-5" />

            <div className="kb-eyebrow mb-2 flex items-center justify-between">
              <span>Заметка</span>
              <button className="normal-case tracking-normal text-[var(--kb-coral)]">Изменить</button>
            </div>
            <p className="rounded-[14px] bg-[var(--kb-warm-surface)] p-3 text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
              {selected.note || 'Заметок пока нет.'}
            </p>

            <button className="mt-4 inline-flex items-center gap-1 text-[12px] text-[var(--kb-coral)]">
              Открыть полную карточку <ChevronRight size={12} />
            </button>
          </aside>
        )}
      </div>
    </KbShell>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-[14px] border border-[var(--kb-border)] bg-white py-2.5 text-[var(--kb-text-secondary)] transition hover:bg-[var(--kb-warm-surface)] hover:text-[var(--kb-text)]">
      <span>{icon}</span>
      <span className="text-[11px]">{label}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="kb-metric text-[16px] text-[var(--kb-text)]">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">{label}</div>
    </div>
  );
}
