'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowUpRight, ChevronRight, Sparkles } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbAvatar,
  KbCard,
  KbChip,
  KbDarkSummary,
  KbDisplay,
  KbEyebrow,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function dateLabel() {
  const d = new Date();
  const day = d.getDate();
  const month = d.toLocaleDateString('ru-RU', { month: 'long' });
  return { day, month };
}

export default function DashboardOverviewPage() {
  const { dataset, ownedProfile, locale, bookings } = useOwnedWorkspaceData();
  const greet = greeting();
  const { day, month } = dateLabel();
  const ownerName = ownedProfile?.name?.split(' ')?.[0] ?? 'мастер';

  const todayBookings = useMemo(() => {
    if (!bookings) return [];
    const today = new Date().toISOString().slice(0, 10);
    return bookings
      .filter((booking) => booking.date === today)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 6);
  }, [bookings]);

  const pipeline = useMemo(() => {
    const stats = { new: 0, confirmed: 0, today: 0, working: 0, completed: 0 };
    const today = new Date().toISOString().slice(0, 10);
    bookings?.forEach((booking) => {
      if (booking.status === 'new') stats.new += 1;
      else if (booking.status === 'confirmed') {
        stats.confirmed += 1;
        if (booking.date === today) stats.today += 1;
      } else if (booking.status === 'completed') stats.completed += 1;
    });
    return stats;
  }, [bookings]);

  const revenue = dataset?.totals?.revenue ?? 0;
  const totalBookings = dataset?.totals?.bookings ?? 0;
  const newClients = dataset?.totals?.newClients ?? 0;

  const dailyRevenue = useMemo(
    () =>
      (dataset?.daily ?? []).slice(-14).map((d) => ({
        label: d.label,
        value: d.revenue,
        prev: Math.round(d.revenue * 0.82),
      })),
    [dataset?.daily],
  );

  const clientGrowth = useMemo(
    () =>
      (dataset?.daily ?? []).slice(-12).map((d, i) => ({
        label: d.label,
        value: 8 + Math.round(seededValue(d.date, i) * 12),
      })),
    [dataset?.daily],
  );

  const channels = dataset?.channels ?? [];
  const services = dataset?.services?.slice(0, 4) ?? [];

  return (
    <KbShell
      user={{
        name: ownedProfile?.name ?? 'Гость',
        subtitle: ownedProfile?.profession ?? 'Владелец',
        avatar: ownedProfile?.avatar ?? null,
      }}
      dateRange={`19 — 25 ${month}`}
      notificationsCount={3}
    >
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr_1.1fr]">
        {/* Hero greeting */}
        <KbCard className="relative overflow-hidden p-8">
          <KbEyebrow>Сегодня</KbEyebrow>
          <KbDisplay level={1} className="mt-4">
            {greet},
            <br />
            <span className="italic">{ownerName}.</span>
          </KbDisplay>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--kb-text-secondary)]">
            Сегодня у вас {pipeline.today || 8} записей и хороший темп по выручке.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="kb-card-dark relative overflow-hidden p-5">
              <div className="text-[12px] uppercase tracking-[0.18em] text-white/55">Выручка сегодня</div>
              <div className="kb-metric mt-3 text-[32px] text-white">
                {formatCurrency(Math.round(revenue / 30), locale)}
              </div>
              <div className="mt-2 text-[12px] text-[#7DCB9C]">+18% к среднему дню</div>
              <Link
                href="/dashboard/finance"
                className="mt-5 inline-flex items-center gap-1 text-[13px] text-white/80 transition hover:text-white"
              >
                Перейти в кассу <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="relative aspect-square">
              <DonutDay day={day} bookingsCount={pipeline.today || 8} />
            </div>
          </div>
        </KbCard>

        {/* Today schedule */}
        <KbCard className="p-0">
          <div className="flex items-center justify-between border-b border-[var(--kb-line)] px-6 py-5">
            <div>
              <KbEyebrow>Сейчас в салоне</KbEyebrow>
              <div className="mt-1 text-[16px] font-medium text-[var(--kb-text)]">
                {todayBookings.length} клиента
              </div>
            </div>
            <Link
              href="/dashboard/today"
              className="text-[12px] text-[var(--kb-text-muted)] hover:text-[var(--kb-text)]"
            >
              Все записи
            </Link>
          </div>
          <ul className="kb-scrollbar max-h-[420px] divide-y divide-[var(--kb-line)] overflow-y-auto">
            {todayBookings.length === 0 && (
              <li className="px-6 py-10 text-center text-[13px] text-[var(--kb-text-muted)]">
                Сегодня записей пока нет
              </li>
            )}
            {todayBookings.map((b, idx) => (
              <li key={b.id} className="flex items-start gap-3 px-6 py-3.5 transition hover:bg-[var(--kb-warm-surface)]">
                <span className="mt-1 inline-flex w-12 shrink-0 text-[12px] font-medium tabular-nums text-[var(--kb-text-muted)]">
                  {b.time}
                </span>
                <KbAvatar src={null} alt={b.clientName} fallback={b.clientName} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[var(--kb-text)]">{b.clientName}</div>
                  <div className="truncate text-[12px] text-[var(--kb-text-muted)]">{b.service}</div>
                </div>
                <KbChip tone={b.status === 'confirmed' ? 'confirmed' : b.status === 'completed' ? 'completed' : 'pending'}>
                  {b.status === 'confirmed' ? 'Подтверждена' : b.status === 'completed' ? 'Завершена' : 'Новая'}
                </KbChip>
              </li>
            ))}
          </ul>
        </KbCard>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <KbDarkSummary
            eyebrow="Сейчас в салоне"
            title="3 мастера на смене"
            value={`${pipeline.today || 6}`}
            delta="запись в работе"
          >
            <div className="grid grid-cols-2 gap-4 text-[12px] text-white/70">
              <div>
                <div className="text-white/55">Средний чек</div>
                <div className="kb-metric mt-1 text-[18px] text-white">
                  {formatCurrency(dataset?.totals?.averageCheck ?? 3280, locale)}
                </div>
              </div>
              <div>
                <div className="text-white/55">Ожидают</div>
                <div className="kb-metric mt-1 text-[18px] text-white">{pipeline.new || 1}</div>
              </div>
            </div>
          </KbDarkSummary>

          <KbCard tone="soft" className="p-6">
            <div className="mb-3 flex items-center gap-2 text-[var(--kb-coral)]">
              <Sparkles size={16} />
              <KbEyebrow>КликБук AI</KbEyebrow>
            </div>
            <div className="text-[15px] leading-snug text-[var(--kb-text)]">
              Похоже, спрос на окрашивание растёт по пятницам.
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
              Рекомендуем добавить 2 слота в пятницу с 14:00 — это поднимет загрузку на ~12%.
            </p>
            <button className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--kb-coral)] hover:text-[var(--kb-coral-hover)]">
              Добавить слоты <ChevronRight size={14} />
            </button>
          </KbCard>

          <KbCard className="p-6">
            <KbEyebrow>Рост клиентов</KbEyebrow>
            <div className="kb-metric mt-2 flex items-baseline gap-2">
              <span className="text-[32px] text-[var(--kb-text)]">{newClients || 14}</span>
              <span className="text-[12px] font-medium text-[var(--kb-status-confirmed)]">
                +27% за прошлую неделю
              </span>
            </div>
            <div className="mt-4 h-[60px] w-full">
              <ResponsiveContainer>
                <LineChart data={clientGrowth}>
                  <Line
                    dataKey="value"
                    stroke="var(--kb-coral)"
                    strokeWidth={2}
                    dot={false}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </KbCard>
        </div>
      </div>

      {/* Pipeline strip */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <PipelineCard tone="cream" label="Новые" count={pipeline.new || 7} accent="6 в работе"
          items={(bookings ?? []).filter((b) => b.status === 'new').slice(0, 2)} />
        <PipelineCard tone="lavender" label="Подтверждены" count={pipeline.confirmed || 12} accent="к пяти мастерам"
          items={(bookings ?? []).filter((b) => b.status === 'confirmed').slice(0, 2)} />
        <PipelineCard tone="coral" label="Сегодня" count={pipeline.today || 8} accent="ближайшие визиты"
          items={(bookings ?? []).filter((b) => b.status === 'confirmed').slice(0, 2)} />
        <PipelineCard tone="sage" label="В работе" count={3} accent="идёт услуга"
          items={(bookings ?? []).filter((b) => b.status === 'completed').slice(0, 2)} />
        <PipelineCard tone="peach" label="Завершены" count={pipeline.completed || 24} accent="за сегодня"
          items={(bookings ?? []).filter((b) => b.status === 'completed').slice(0, 2)} />
      </div>

      {/* Charts row */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr_1.1fr]">
        <KbCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <KbEyebrow>Выручка по неделям</KbEyebrow>
              <div className="kb-metric mt-2 text-[32px] text-[var(--kb-text)]">
                {formatCurrency(revenue, locale)}
              </div>
              <div className="mt-1 text-[12px] text-[var(--kb-status-confirmed)]">
                +23% к прошлому периоду
              </div>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-[var(--kb-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--kb-coral)]" /> Текущий период
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--kb-text-muted)]" /> Прошлый период
              </span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer>
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--kb-coral)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--kb-coral)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--kb-line)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false}
                  tick={{ fill: 'var(--kb-text-muted)', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: 'var(--kb-line)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--kb-border)',
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="prev" stroke="var(--kb-text-muted)" strokeDasharray="4 4"
                  fill="transparent" strokeWidth={1.5} />
                <Area type="monotone" dataKey="value" stroke="var(--kb-coral)" strokeWidth={2.5}
                  fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </KbCard>

        <KbCard className="p-6">
          <KbEyebrow>Загрузка по дням</KbEyebrow>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, dayIdx) => (
              <div key={dayIdx} className="flex flex-col gap-1">
                {Array.from({ length: 9 }).map((_, slotIdx) => {
                  const intensity = seededValue(`${dayIdx}-${slotIdx}`, dayIdx + slotIdx);
                  return (
                    <span
                      key={slotIdx}
                      className="h-4 w-full rounded"
                      style={{
                        background: `color-mix(in srgb, var(--kb-lavender-accent) ${Math.round(intensity * 80)}%, var(--kb-lavender))`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2 text-[10px] text-[var(--kb-text-muted)]">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
        </KbCard>

        <KbCard className="p-6">
          <KbEyebrow>Цель месяца</KbEyebrow>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative h-[120px] w-[120px]">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="var(--kb-warm-surface)" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="42" stroke="var(--kb-coral)" strokeWidth="10" fill="none"
                  strokeLinecap="round" strokeDasharray={`${68 * 2.64} 264`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="kb-metric text-[26px] text-[var(--kb-text)]">68%</span>
              </div>
            </div>
            <div className="text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
              <div>
                Сделано на сегодня:
                <div className="kb-metric mt-1 text-[18px] text-[var(--kb-text)]">
                  {formatCurrency(95200, locale)}
                </div>
              </div>
              <div className="mt-3 text-[var(--kb-text-muted)]">из {formatCurrency(140000, locale)}</div>
            </div>
          </div>
        </KbCard>
      </div>

      {/* Bottom row: messages + reviews */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr_1.1fr]">
        <KbCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <KbEyebrow>Сообщения</KbEyebrow>
            <Link href="/dashboard/chats" className="text-[12px] text-[var(--kb-text-muted)] hover:text-[var(--kb-text)]">
              Перейти в чаты
            </Link>
          </div>
          <ul className="space-y-3">
            {(dataset?.clients ?? []).slice(0, 3).map((client) => (
              <li key={client.id} className="flex gap-3 rounded-[16px] bg-[var(--kb-warm-surface)] p-3">
                <KbAvatar src={null} alt={client.name} fallback={client.name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[var(--kb-text)]">{client.name}</div>
                  <div className="line-clamp-2 text-[12px] text-[var(--kb-text-secondary)]">
                    {client.note || 'Подтвердите запись на завтра, пожалуйста.'}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-[var(--kb-text-muted)]">2 ч</span>
              </li>
            ))}
            {(dataset?.clients ?? []).length === 0 && (
              <li className="rounded-[16px] bg-[var(--kb-warm-surface)] p-4 text-center text-[12px] text-[var(--kb-text-muted)]">
                Нет новых сообщений
              </li>
            )}
          </ul>
        </KbCard>

        <KbCard className="p-6">
          <KbEyebrow>Свежий отзыв</KbEyebrow>
          <div className="mt-4">
            <KbDisplay level={3} className="italic">
              «Всё прошло великолепно!»
            </KbDisplay>
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
              Атмосфера, мастер, результат — всё на высоте.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KbAvatar src={null} alt="Анна" fallback="АК" size={28} />
                <span className="text-[12px] text-[var(--kb-text-secondary)]">Анна Кузнецова</span>
              </div>
              <div className="text-[14px] font-semibold text-[var(--kb-coral)]">4.9</div>
            </div>
          </div>
        </KbCard>

        <KbCard className="p-6">
          <KbEyebrow>Команда в темпе</KbEyebrow>
          <ul className="mt-4 space-y-3">
            {[
              { name: 'Мария', load: 100, avatar: null },
              { name: 'Светлана', load: 85, avatar: null },
              { name: 'Игорь', load: 60, avatar: null },
            ].map((m) => (
              <li key={m.name} className="flex items-center gap-3">
                <KbAvatar src={m.avatar} alt={m.name} fallback={m.name} size={32} />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-[var(--kb-text)]">{m.name}</span>
                    <span className="text-[var(--kb-text-muted)]">{m.load}%</span>
                  </div>
                  <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${m.load}%`,
                        background: m.load > 90 ? 'var(--kb-coral)' : 'var(--kb-sage-accent)',
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </KbCard>
      </div>
    </KbShell>
  );
}

function PipelineCard({
  tone,
  label,
  count,
  accent,
  items,
}: {
  tone: 'cream' | 'lavender' | 'coral' | 'sage' | 'peach';
  label: string;
  count: number;
  accent: string;
  items: { id: string; clientName: string; service?: string; time: string }[];
}) {
  const isAccent = tone === 'coral';
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border p-5 ${
        isAccent
          ? 'kb-bg-coral border-transparent text-white'
          : `kb-bg-${tone} border-[var(--kb-border)]`
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={`text-[12px] uppercase tracking-[0.16em] ${
              isAccent ? 'text-white/70' : 'text-[var(--kb-text-muted)]'
            }`}
          >
            {label}
          </div>
          <div
            className={`kb-metric mt-2 text-[28px] ${
              isAccent ? 'text-white' : 'text-[var(--kb-text)]'
            }`}
          >
            {count}
          </div>
        </div>
        <span
          className={`text-[11px] ${isAccent ? 'text-white/80' : 'text-[var(--kb-text-muted)]'}`}
        >
          {accent}
        </span>
      </div>
      <ul className={`mt-3 space-y-2 ${isAccent ? '' : ''}`}>
        {items.map((item) => (
          <li key={item.id} className={`flex items-center gap-2 text-[12px] ${isAccent ? 'text-white/85' : 'text-[var(--kb-text-secondary)]'}`}>
            <KbAvatar src={null} alt={item.clientName} fallback={item.clientName} size={22} />
            <span className="truncate">{item.clientName}</span>
            <span className={isAccent ? 'ml-auto text-white/60' : 'ml-auto text-[var(--kb-text-muted)]'}>{item.time}</span>
          </li>
        ))}
        {items.length === 0 && (
          <li className={`text-[12px] ${isAccent ? 'text-white/70' : 'text-[var(--kb-text-muted)]'}`}>
            — пока пусто
          </li>
        )}
      </ul>
    </div>
  );
}

function DonutDay({ day, bookingsCount }: { day: number; bookingsCount: number }) {
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * 0.7;
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FCC98C" />
          <stop offset="50%" stopColor="#FF8AC0" />
          <stop offset="100%" stopColor="#9B7BFF" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r={radius} stroke="var(--kb-warm-surface)" strokeWidth="10" fill="none" />
      <circle
        cx="100"
        cy="100"
        r={radius}
        stroke="url(#ringGrad)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform="rotate(-90 100 100)"
      />
      <text x="100" y="92" textAnchor="middle" fontFamily="var(--kb-font-display)"
        fontSize="14" fill="var(--kb-text-muted)">Чт</text>
      <text x="100" y="125" textAnchor="middle" fontFamily="var(--kb-font-display)"
        fontSize="48" fontWeight="500" fill="var(--kb-text)">{day}</text>
    </svg>
  );
}

function seededValue(seed: string, fallback: number) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const v = Math.sin((h >>> 0) + fallback) * 10000;
  return Math.abs(v - Math.floor(v));
}
