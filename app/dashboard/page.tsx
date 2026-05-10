'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  Moon,
  Quote,
  Scissors,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { KbShell } from '@/components/klikbook/shell';
import { KbAvatar } from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

const PIPELINE_BOOKINGS = [
  { stage: 'new', items: [
    { name: 'Наталья Орлова', service: 'Стрижка', date: '20.05', time: '10:00' },
    { name: 'Игорь Петров', service: 'Массаж', date: '20.05', time: '11:30' },
  ], extra: 6 },
  { stage: 'confirmed', items: [
    { name: 'Светлана Миронова', service: 'Маникюр', date: '19.05', time: '16:00' },
    { name: 'Антон Лазарев', service: 'Стрижка', date: '19.05', time: '17:30' },
  ], extra: 10 },
  { stage: 'today', items: [
    { name: 'Дмитрий Соколов', service: 'Массаж спины', date: '', time: '14:00' },
    { name: 'Ольга Лебедева', service: 'Педикюр', date: '', time: '15:30' },
  ], extra: 6 },
  { stage: 'working', items: [
    { name: 'Мария Иванова', service: 'Маникюр + гель-лак', date: '', time: '09:30' },
    { name: 'Екатерина Смирнова', service: 'Окрашивание', date: '', time: '11:00' },
  ], extra: 1 },
  { stage: 'done', items: [
    { name: 'Анна Кузнецова', service: 'Стрижка', date: '', time: '12:30' },
    { name: 'Павел Котов', service: 'Бритьё', date: '', time: '13:15' },
  ], extra: 3 },
];

const TODAY_AGENDA = [
  { time: '09:30', name: 'Мария Иванова', service: 'Маникюр + гель-лак', dotColor: '#FF8B6B' },
  { time: '11:00', name: 'Екатерина Смирнова', service: 'Окрашивание волос', dotColor: '#7AA269' },
  { time: '12:30', name: 'Анна Кузнецова', service: 'Стрижка + укладка', dotColor: '#9B7BFF' },
  { time: '14:00', name: 'Дмитрий Соколов', service: 'Массаж спины', dotColor: '#0A1D37', highlighted: true },
  { time: '15:30', name: 'Ольга Лебедева', service: 'Педикюр', dotColor: '#D8AB46' },
];

const REVENUE_WEEK = [
  { day: 'Пн 19.05', label: '19', fact: 38000, plan: 36000, prev: 31000 },
  { day: 'Вт 20.05', label: '20', fact: 41000, plan: 38000, prev: 33000 },
  { day: 'Ср 21.05', label: '21', fact: 35500, plan: 40000, prev: 36000 },
  { day: 'Чт 22.05', label: '22', fact: 42800, plan: 41000, prev: 38000 },
  { day: 'Пт 23.05', label: '23', fact: 57200, plan: 44000, prev: 41000 },
  { day: 'Сб 24.05', label: '24', fact: 36000, plan: 38000, prev: 35000 },
  { day: 'Вс 25.05', label: '25', fact: 36000, plan: 36000, prev: 31000 },
];

const TEAM = [
  { name: 'Мария', role: 'Стилист', percent: 128, revenue: 72300, accent: 'coral' as const },
  { name: 'Ольга', role: 'Мастер маникюра', percent: 96, revenue: 54800, accent: 'sage' as const },
  { name: 'Игорь', role: 'Массажист', percent: 87, revenue: 41600, accent: 'cream' as const },
];

export default function DashboardOverviewPage() {
  const { ownedProfile, locale } = useOwnedWorkspaceData();
  const greet = greeting();
  const ownerName = ownedProfile?.name?.split(' ')?.[0] ?? 'Алина';

  const dateLabel = useMemo(() => {
    const d = new Date();
    const monthGen = d.toLocaleDateString('ru-RU', { month: 'long' });
    const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    return { day: d.getDate(), month: monthGen, weekday: weekday[0].toUpperCase() + weekday.slice(1, 2) };
  }, []);

  return (
    <KbShell
      user={{
        name: ownerName,
        subtitle: ownedProfile?.profession ?? 'Владелец',
        avatar: ownedProfile?.avatar ?? null,
      }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      {/* === Row 1: Hero / Clock+agenda / Right column === */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Hero card */}
        <section className="kb-card relative col-span-12 overflow-hidden p-8 lg:col-span-4">
          <DottedRadial className="pointer-events-none absolute -right-20 -top-20 opacity-60" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="kb-icon-tile kb-icon-tile-coral !h-9 !w-9 !rounded-full">
                <Sun size={16} />
              </span>
              <span className="text-[14px] italic text-[var(--kb-coral)]">Сегодня</span>
            </div>
            <h1 className="kb-display mt-6 text-[clamp(38px,4vw,52px)] leading-[1.05] tracking-[-0.02em]">
              {greet},<br />
              <span className="italic">{ownerName}.</span>
            </h1>
            <p className="mt-5 max-w-[280px] text-[14px] leading-relaxed text-[var(--kb-text-secondary)]">
              Сегодня у вас <strong className="font-medium text-[var(--kb-text)]">8 записей</strong> и
              хороший темп по выручке.
            </p>
          </div>

          <div className="kb-card-dark relative mt-10 overflow-hidden p-6">
            <div className="text-[12px] uppercase tracking-[0.16em] text-white/55">Выручка сегодня</div>
            <div className="mt-3 flex items-center gap-3">
              <span className="kb-metric text-[34px] leading-none text-white">
                {formatCurrency(42800, locale)}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[#7DCB9C]">
                <ArrowUp size={11} /> 18%
              </span>
            </div>
            <div className="mt-2 text-[11px] text-white/55">к вчерашнему дню</div>
            <button className="kb-btn kb-btn-navy mt-6 !bg-white/8 !border-white/12 hover:!bg-white/12 text-white">
              Перейти к кассе <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* Clock + today agenda */}
        <section className="kb-card relative col-span-12 overflow-hidden p-8 lg:col-span-5">
          <div className="grid grid-cols-[1fr_minmax(0,200px)] gap-6">
            <div className="relative aspect-square">
              <ClockFace day={dateLabel.day} weekday={dateLabel.weekday} month={dateLabel.month} />
            </div>
            <ul className="flex flex-col justify-center gap-4">
              {TODAY_AGENDA.map((item) => (
                <li
                  key={item.time}
                  className={`relative flex items-center gap-2.5 ${item.highlighted ? 'rounded-[14px] border border-[var(--kb-border)] bg-white px-3 py-2 shadow-[var(--kb-shadow-card)]' : ''}`}
                >
                  {item.highlighted && (
                    <span aria-hidden className="absolute -left-3 top-1/2 h-3 w-3 -translate-x-full -translate-y-1/2 border-l border-t border-[var(--kb-border)]" />
                  )}
                  <span className="kb-metric w-12 shrink-0 text-[12px] tabular-nums text-[var(--kb-text-secondary)]">
                    {item.time}
                  </span>
                  <KbAvatar src={null} alt={item.name} fallback={item.name} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium leading-tight text-[var(--kb-text)]">{item.name}</div>
                    <div className="truncate text-[11px] leading-tight text-[var(--kb-text-muted)]">{item.service}</div>
                  </div>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.dotColor }} />
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1 text-[12px] text-[var(--kb-text-muted)]">
            и ещё 3 записи <ChevronDown size={12} />
          </div>
        </section>

        {/* Right column */}
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-3">
          {/* Live now (dark) */}
          <section className="kb-card-dark relative overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-[0.14em] text-white/60">Сейчас в салоне</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7DCB9C]" /> 3 клиента
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <DarkMiniMetric icon="coin" label="Выручка сейчас" value={formatCurrency(18450, locale)} />
              <DarkMiniMetric icon="cup" label="Средний чек" value={formatCurrency(3280, locale)} />
              <DarkMiniMetric icon="user" label="Ожидают" value="1" />
            </div>
            <svg viewBox="0 0 240 32" className="mt-4 w-full">
              <path d="M0,18 Q40,2 80,16 T160,16 T240,12" fill="none" stroke="#5DD9FF" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="232" cy="13" r="3" fill="#5DD9FF" />
              <circle cx="232" cy="13" r="6" fill="#5DD9FF" fillOpacity="0.2" />
            </svg>
          </section>

          {/* AI card */}
          <section
            className="relative overflow-hidden rounded-[22px] border border-[var(--kb-border)] p-5"
            style={{ background: 'linear-gradient(135deg, #EFF5E2 0%, #E5F0DA 100%)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-[var(--kb-text)]">КликБук AI</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[var(--kb-sage-accent)]">
                New
              </span>
            </div>
            <p className="mt-3 max-w-[200px] text-[14px] font-medium leading-snug text-[var(--kb-text)]">
              Похоже, спрос на окрашивание растёт по пятницам <ArrowUpRight size={12} className="inline" />
            </p>
            <p className="mt-3 max-w-[220px] text-[11px] leading-relaxed text-[var(--kb-text-secondary)]">
              Рекомендуем добавить 1 мастера в пятницу — это может увеличить выручку на ~12%.
            </p>
            <span className="absolute bottom-4 right-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--kb-sage-accent)] text-white shadow-[0_8px_20px_rgba(122,162,105,0.35)]">
              <Sparkles size={22} fill="currentColor" />
            </span>
          </section>

          {/* Client growth */}
          <section className="kb-card p-5">
            <div className="text-[14px] font-medium text-[var(--kb-text)]">Рост клиентов</div>
            <div className="mt-1 text-[11px] text-[var(--kb-text-muted)]">Новые клиенты за неделю</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="kb-metric text-[34px] leading-none">14</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--kb-status-confirmed)]">
                <ArrowUp size={10} /> 27%
              </span>
              <span className="text-[11px] text-[var(--kb-text-muted)]">к прошлой неделе</span>
            </div>
            <div className="mt-3 h-[64px] w-full">
              <ResponsiveContainer>
                <LineChart data={[1, 2, 3, 5, 4, 9, 7].map((v, i) => ({ i, v }))}>
                  <Line dataKey="v" stroke="var(--kb-lavender-accent)" strokeWidth={2} dot={(props: { cx: number; cy: number; index: number }) => {
                    if (props.index === 5) {
                      return <circle key={props.index} cx={props.cx} cy={props.cy} r={4} fill="var(--kb-lavender-accent)" stroke="white" strokeWidth={2} />;
                    }
                    return <></>;
                  }} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 grid grid-cols-7 text-[10px] text-[var(--kb-text-muted)]">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                <span key={d} className="text-center">{d}</span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* === Row 2: Pipeline === */}
      <section className="mt-6 kb-card p-6">
        <div className="text-[16px] font-medium text-[var(--kb-text)]">Конвейер записей</div>
        <div className="mt-5 flex items-stretch gap-2 overflow-x-auto pb-1">
          {PIPELINE_BOOKINGS.map((stage, idx) => (
            <PipelineColumn key={stage.stage} stage={stage} isLast={idx === PIPELINE_BOOKINGS.length - 1} highlight={idx === 2} />
          ))}
        </div>
      </section>

      {/* === Row 3: Revenue / Heatmap / Goal === */}
      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <section className="kb-card col-span-12 p-6 lg:col-span-6">
          <div className="text-[14px] font-medium">Выручка за неделю</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="kb-metric text-[28px]">{formatCurrency(286400, locale)}</span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--kb-status-confirmed)]">
              <ArrowUp size={10} /> 23%
            </span>
            <span className="text-[11px] text-[var(--kb-text-muted)]">к прошлой неделе</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--kb-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-[2px] w-3 rounded-full bg-[var(--kb-text)]" /> Факт
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-[2px] w-3 rounded-full border-t border-dashed border-[var(--kb-text-muted)]" /> План
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-3 rounded-sm bg-[var(--kb-lavender)]" /> Прошлая неделя
            </span>
          </div>
          <div className="mt-3 h-[200px] w-full">
            <ResponsiveContainer>
              <AreaChart data={REVENUE_WEEK}>
                <defs>
                  <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--kb-lavender-accent)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--kb-lavender)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--kb-line)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false}
                  tick={{ fill: 'var(--kb-text-muted)', fontSize: 10 }} />
                <YAxis hide />
                <Area type="monotone" dataKey="prev" stroke="var(--kb-lavender-accent)" strokeOpacity={0.5}
                  strokeWidth={1} fill="url(#prevGrad)" />
                <Line type="monotone" dataKey="plan" stroke="var(--kb-text-muted)" strokeWidth={1.2}
                  strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="fact" stroke="var(--kb-text)" strokeWidth={2}
                  dot={(props: { cx: number; cy: number; index: number; payload: typeof REVENUE_WEEK[number] }) => {
                    if (props.payload.label === '23') {
                      return <circle key={props.index} cx={props.cx} cy={props.cy} r={4} fill="var(--kb-text)" stroke="white" strokeWidth={2} />;
                    }
                    return <></>;
                  }} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="-mt-[180px] ml-[58%] inline-block rounded-[8px] border border-[var(--kb-border)] bg-white px-2 py-1 text-[11px] shadow-[var(--kb-shadow-card)]">
              <div className="text-[10px] text-[var(--kb-text-muted)]">23.05</div>
              <div className="kb-metric">{formatCurrency(57200, locale)}</div>
            </div>
          </div>
        </section>

        <section className="kb-card col-span-12 p-6 lg:col-span-3">
          <div className="text-[14px] font-medium">Загрузка по дням</div>
          <Heatmap />
          <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--kb-text-muted)]">
            <span>Низкая</span>
            <div className="flex h-1.5 flex-1 mx-2 overflow-hidden rounded-full">
              {[10, 25, 45, 65, 85].map((v) => (
                <span key={v} className="flex-1" style={{ background: `color-mix(in srgb, var(--kb-lavender-accent) ${v}%, var(--kb-lavender))` }} />
              ))}
            </div>
            <span>Высокая</span>
          </div>
        </section>

        <section className="kb-card relative col-span-12 overflow-hidden p-6 lg:col-span-3">
          <div className="text-[14px] font-medium">Цель месяца</div>
          <div className="relative mt-4 flex items-center justify-center">
            <SemiArc value={68} />
          </div>
          <div className="mt-2 text-center">
            <div className="text-[11px] text-[var(--kb-text-muted)]">Сделайте ещё</div>
            <div className="kb-metric mt-1 text-[20px]">{formatCurrency(95200, locale)}</div>
            <div className="text-[11px] text-[var(--kb-text-muted)]">чтобы достичь цели</div>
          </div>
          <div className="mt-3 text-center text-[11px] text-[var(--kb-text-muted)]">
            <span className="kb-metric text-[12px] text-[var(--kb-text)]">{formatCurrency(204800, locale)}</span> /{' '}
            {formatCurrency(300000, locale)}
          </div>
          <div className="mt-2 text-center text-[10px] text-[var(--kb-text-muted)]">Осталось 11 дней</div>
          <button className="kb-btn kb-btn-outline mt-3 w-full !h-10 !text-[12px]">
            Смотреть план <ArrowRight size={12} />
          </button>
          <PlantSilhouette className="absolute -bottom-3 -right-3 opacity-50" />
        </section>
      </div>

      {/* === Row 4: Messages / Quote / Team === */}
      <div className="mt-6 grid gap-5 lg:grid-cols-12">
        <section className="kb-card col-span-12 p-6 lg:col-span-4">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium">Сообщения</span>
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--kb-coral)] px-1.5 text-[10px] font-semibold text-white">
              2
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            <MessageItem name="Екатерина Смирнова" time="16:42"
              text="Здравствуйте! Можно перенести запись на завтра на 12:00?" hasUnread />
            <MessageItem name="Наталья Орлова" time="15:10"
              text="Спасибо за стрижку! Всё супер!" />
          </ul>
          <Link href="/dashboard/chats" className="mt-4 inline-flex items-center gap-1 text-[12px] text-[var(--kb-text-secondary)] hover:text-[var(--kb-text)]">
            Перейти в переписку <ArrowRight size={12} />
          </Link>
        </section>

        <section
          className="relative col-span-12 overflow-hidden rounded-[22px] border border-[var(--kb-border)] p-8 lg:col-span-4"
          style={{ background: 'linear-gradient(135deg, #FFF6EF 0%, #FBE7DC 100%)' }}
        >
          <Quote size={28} className="text-[var(--kb-coral)]" fill="currentColor" />
          <p className="kb-display mt-3 text-[20px] italic leading-snug text-[var(--kb-text)]">
            «Всегда выхожу отсюда довольной!<br />
            Атмосфера, мастера, результат — всё на высоте.»
          </p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KbAvatar src={null} alt="Анна Кузнецова" fallback="АК" size={32} />
              <div>
                <div className="text-[12px] font-medium">Анна Кузнецова</div>
                <div className="text-[10px] text-[var(--kb-text-muted)]">18 мая 2025 · Стрижка + укладка</div>
              </div>
            </div>
            <div className="text-right">
              <div className="kb-metric text-[20px] text-[var(--kb-coral)]">4.9</div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={10} fill="var(--kb-coral)" className="text-[var(--kb-coral)]" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--kb-coral)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--kb-border)]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--kb-border)]" />
          </div>
        </section>

        <section className="kb-card relative col-span-12 overflow-hidden p-6 lg:col-span-4">
          <div className="text-[14px] font-medium">Команда в тонусе</div>
          <ul className="mt-4 space-y-4">
            {TEAM.map((m) => (
              <li key={m.name} className="flex items-center gap-3">
                <KbAvatar src={null} alt={m.name} fallback={m.name} size={32} />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <div>
                      <span className="font-medium">{m.name}</span>
                      <span className="ml-1.5 text-[10px] text-[var(--kb-text-muted)]">{m.role}</span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
                      <span className="block h-full rounded-full"
                        style={{ width: `${Math.min(100, m.percent)}%`, background: m.accent === 'coral' ? 'var(--kb-coral)' : m.accent === 'sage' ? 'var(--kb-sage-accent)' : 'var(--kb-cream-accent)' }} />
                    </div>
                    <span className="kb-metric w-[42px] text-[11px]">{m.percent}%</span>
                    <span className="kb-metric w-[60px] text-right text-[11px] text-[var(--kb-text-secondary)]">
                      {m.revenue.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1">
            <HighFiveBadge />
            <span className="rounded-full bg-[var(--kb-coral)] px-2 py-0.5 text-[9px] font-semibold text-white">Так держать!</span>
            <span className="text-[9px] text-[var(--kb-text-muted)]">Команда на 103%<br />к плану недели</span>
          </div>
        </section>
      </div>
    </KbShell>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */

function ClockFace({ day, weekday, month }: { day: number; weekday: string; month: string }) {
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFC09F" />
          <stop offset="40%" stopColor="#FF8B6B" />
          <stop offset="80%" stopColor="#A48EFF" />
          <stop offset="100%" stopColor="#7AA269" />
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBF7" />
          <stop offset="100%" stopColor="#FBE7DC" />
        </radialGradient>
      </defs>

      {/* Sun */}
      <g transform="translate(160 18)">
        <circle r="6" fill="#F5C24A" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line key={deg} x1="0" y1="-9" x2="0" y2="-13" stroke="#F5C24A" strokeWidth="1.5" strokeLinecap="round"
            transform={`rotate(${deg})`} />
        ))}
      </g>
      {/* Moon */}
      <g transform="translate(160 304)">
        <path d="M -6 0 a 6 6 0 1 0 8 -6 a 5 5 0 1 1 -8 6 z" fill="#A48EFF" />
      </g>

      {/* Hour markers / time labels */}
      <text x="160" y="48" textAnchor="middle" fontSize="10" fill="var(--kb-text-muted)" fontFamily="var(--kb-font-sans)">09:00</text>
      <text x="282" y="164" textAnchor="middle" fontSize="10" fill="var(--kb-text-muted)" fontFamily="var(--kb-font-sans)">12:00</text>
      <text x="160" y="288" textAnchor="middle" fontSize="10" fill="var(--kb-text-muted)" fontFamily="var(--kb-font-sans)">15:00</text>
      <text x="38" y="164" textAnchor="middle" fontSize="10" fill="var(--kb-text-muted)" fontFamily="var(--kb-font-sans)">18:00</text>

      {/* Outer dotted ring */}
      <circle cx="160" cy="160" r="138" fill="none" stroke="var(--kb-border)" strokeWidth="1" strokeDasharray="1 4" opacity="0.6" />

      {/* Hour tick marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i * 6 * Math.PI) / 180;
        const inner = i % 5 === 0 ? 118 : 122;
        const x1 = 160 + inner * Math.sin(angle);
        const y1 = 160 - inner * Math.cos(angle);
        const x2 = 160 + 128 * Math.sin(angle);
        const y2 = 160 - 128 * Math.cos(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--kb-text-muted)" strokeOpacity={i % 5 === 0 ? 0.5 : 0.2} strokeWidth="1" />;
      })}

      {/* Big gradient ring (filled portion) */}
      <circle cx="160" cy="160" r="100" fill="none" stroke="url(#ringGrad)" strokeWidth="14"
        strokeDasharray={`${0.7 * 2 * Math.PI * 100} ${2 * Math.PI * 100}`}
        strokeLinecap="round" transform="rotate(-90 160 160)" />
      <circle cx="160" cy="160" r="100" fill="none" stroke="var(--kb-warm-surface)" strokeWidth="14" strokeOpacity="0.5"
        strokeDashoffset={`${0.7 * 2 * Math.PI * 100}`}
        strokeDasharray={`${0.3 * 2 * Math.PI * 100} ${2 * Math.PI * 100}`}
        transform="rotate(-90 160 160)" />

      {/* Inner glow */}
      <circle cx="160" cy="160" r="80" fill="url(#centerGlow)" />

      {/* Center text */}
      <text x="160" y="138" textAnchor="middle" fontSize="14" fill="var(--kb-text-muted)" fontFamily="var(--kb-font-sans)">{weekday}</text>
      <text x="160" y="180" textAnchor="middle" fontSize="56" fontWeight="500" fill="var(--kb-text)" fontFamily="var(--kb-font-display)">{day}</text>
      <text x="160" y="200" textAnchor="middle" fontSize="12" fill="var(--kb-text-muted)" fontFamily="var(--kb-font-sans)">{month}</text>
    </svg>
  );
}

function DottedRadial({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} width="240" height="240">
      <defs>
        <pattern id="dotPattern" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.7" fill="#EADFD5" />
        </pattern>
        <radialGradient id="fadeOut">
          <stop offset="20%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="dotMask">
          <rect width="240" height="240" fill="url(#fadeOut)" />
        </mask>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#dotPattern)" mask="url(#dotMask)" />
    </svg>
  );
}

function DarkMiniMetric({ icon, label, value }: { icon: 'coin' | 'cup' | 'user'; label: string; value: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
          {icon === 'coin' && <span className="text-[10px] text-[#FCC98C]">₽</span>}
          {icon === 'cup' && <span className="text-[8px] text-[#7DCB9C]">☕</span>}
          {icon === 'user' && <span className="text-[8px] text-[#A48EFF]">◐</span>}
        </span>
        <span className="text-[10px] text-white/55">{label}</span>
      </div>
      <div className="kb-metric mt-1.5 text-[16px] text-white">{value}</div>
    </div>
  );
}

function PipelineColumn({
  stage,
  highlight,
  isLast,
}: {
  stage: typeof PIPELINE_BOOKINGS[number];
  highlight?: boolean;
  isLast?: boolean;
}) {
  const meta = STAGE_META[stage.stage as keyof typeof STAGE_META];
  return (
    <div className="flex min-w-[180px] flex-1 items-stretch gap-2">
      <div
        className={`flex flex-1 flex-col rounded-[18px] border p-3 ${
          highlight ? 'border-[var(--kb-sage-accent)]' : 'border-[var(--kb-border)]'
        }`}
        style={{ background: meta.bg }}
      >
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-medium" style={{ color: meta.fg }}>{meta.label}</span>
          <span className="kb-metric text-[14px]" style={{ color: meta.fg }}>{stage.items.length + stage.extra}</span>
        </div>
        <ul className="mt-3 flex-1 space-y-2.5">
          {stage.items.map((item) => (
            <li key={item.name} className="flex items-center gap-2">
              <KbAvatar src={null} alt={item.name} fallback={item.name} size={26} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-medium leading-tight">{item.name}</div>
                <div className="truncate text-[10px] leading-tight text-[var(--kb-text-muted)]">{item.service}</div>
              </div>
              <div className="text-right text-[10px] tabular-nums leading-tight text-[var(--kb-text-muted)]">
                {item.date && <div>{item.date}</div>}
                <div className="kb-metric text-[var(--kb-text)]">{item.time}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-[10px] text-[var(--kb-text-muted)]">
          + Ещё {stage.extra} запис{stage.extra === 1 ? 'ь' : stage.extra < 5 ? 'и' : 'ей'}
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center">
          <ArrowRight size={14} className="text-[var(--kb-text-muted)]" />
        </div>
      )}
    </div>
  );
}

const STAGE_META = {
  new:       { label: 'Новые',         fg: '#8a6b1f', bg: '#FFF4D8' },
  confirmed: { label: 'Подтверждены',  fg: '#A05E36', bg: '#FBE7DC' },
  today:     { label: 'Сегодня',       fg: '#5e7a44', bg: '#E5F0DA' },
  working:   { label: 'В работе',      fg: '#6845B5', bg: '#EEE4FF' },
  done:      { label: 'Завершены',     fg: '#3F6BA1', bg: '#EAF2FF' },
};

function MessageItem({ name, time, text, hasUnread }: { name: string; time: string; text: string; hasUnread?: boolean }) {
  return (
    <li className="flex gap-3">
      <KbAvatar src={null} alt={name} fallback={name} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium">{name}</span>
          <span className="text-[10px] text-[var(--kb-text-muted)]">{time}</span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] text-[var(--kb-text-secondary)]">{text}</p>
      </div>
      {hasUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--kb-lavender-accent)]" />}
    </li>
  );
}

function Heatmap() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const hours = [9, 11, 13, 15, 17, 19, 21];
  return (
    <div className="mt-3 flex gap-1.5">
      <div className="flex flex-col justify-between text-[10px] text-[var(--kb-text-muted)] py-1">
        {days.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="flex-1">
        <div className="grid grid-rows-7 gap-1.5">
          {days.map((d, di) => (
            <div key={d} className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, hi) => {
                const intensity = Math.abs(Math.sin((di + 1) * (hi + 2) * 0.7)) * 0.95;
                return (
                  <span key={hi} className="h-4 rounded"
                    style={{ background: `color-mix(in srgb, var(--kb-lavender-accent) ${Math.round(intensity * 80)}%, var(--kb-lavender))` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1.5 text-[10px] text-[var(--kb-text-muted)]">
          {hours.map((h) => <span key={h} className="text-center">{h}</span>)}
        </div>
      </div>
    </div>
  );
}

function SemiArc({ value }: { value: number }) {
  const r = 72;
  const c = Math.PI * r;
  return (
    <svg viewBox="0 0 180 110" width="180" height="110">
      <defs>
        <linearGradient id="arcGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#FFC09F" />
          <stop offset="100%" stopColor="#FF8B6B" />
        </linearGradient>
      </defs>
      <path d={`M 18 90 A ${r} ${r} 0 0 1 162 90`} fill="none" stroke="var(--kb-warm-surface)" strokeWidth="14" strokeLinecap="round" />
      <path d={`M 18 90 A ${r} ${r} 0 0 1 162 90`} fill="none" stroke="url(#arcGrad)" strokeWidth="14"
        strokeLinecap="round" strokeDasharray={`${(value / 100) * c} ${c}`} />
      <circle cx={18 + (162 - 18) * (value / 100)} cy={90 - Math.sin(Math.PI * (value / 100)) * r} r="5"
        fill="white" stroke="var(--kb-coral)" strokeWidth="2" />
      <text x="90" y="80" textAnchor="middle" fontSize="32" fontWeight="500"
        fontFamily="var(--kb-font-sans)" fill="var(--kb-text)">{value}%</text>
    </svg>
  );
}

function PlantSilhouette({ className }: { className?: string }) {
  return (
    <svg width="80" height="110" viewBox="0 0 80 110" className={className}>
      <ellipse cx="40" cy="100" rx="22" ry="6" fill="#EADFD5" />
      <path d="M 40 95 Q 30 70 18 50 Q 28 60 38 80 Z" fill="#7AA269" opacity="0.7" />
      <path d="M 40 95 Q 50 65 65 45 Q 56 55 45 78 Z" fill="#A8C496" opacity="0.7" />
      <path d="M 40 92 Q 38 70 30 55 Q 36 70 40 88 Z" fill="#5e7a44" opacity="0.6" />
      <path d="M 28 100 L 52 100 L 49 80 L 31 80 Z" fill="#D8C4A8" />
    </svg>
  );
}

function HighFiveBadge() {
  return (
    <div className="relative h-12 w-12">
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFC09F] to-[#FF8B6B] opacity-25" />
      <span className="absolute inset-2 rounded-full bg-gradient-to-br from-[#FFD3B8] to-[#FFAA8E] flex items-center justify-center text-white">
        🙌
      </span>
    </div>
  );
}
