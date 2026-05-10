'use client';

import { useMemo } from 'react';
import {
  Calendar,
  Download,
  MessageSquare,
  Star,
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
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbButton,
  KbCard,
  KbDisplay,
  KbEyebrow,
  KbStatCard,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

export default function AnalyticsPage() {
  const { dataset, ownedProfile, locale } = useOwnedWorkspaceData();

  const series = useMemo(
    () => (dataset?.daily ?? []).slice(-30).map((d) => ({ label: d.label, value: d.revenue, prev: Math.round(d.revenue * 0.82) })),
    [dataset?.daily],
  );

  const ltvSeries = useMemo(
    () => Array.from({ length: 12 }).map((_, i) => ({ label: `${i + 1}`, value: 14000 + i * 350 + ((i * 13) % 1500) })),
    [],
  );

  const channels = dataset?.channels ?? [];
  const services = dataset?.services?.slice(0, 5) ?? [];

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KbEyebrow>Детальная статистика по вашему салону</KbEyebrow>
            <KbDisplay level={1} className="mt-3">Аналитика</KbDisplay>
            <p className="mt-2 max-w-md text-[14px] text-[var(--kb-text-secondary)]">
              Анализируйте показатели и принимайте решения на основе данных.
            </p>
          </div>
          <KbButton variant="outline">
            <Download size={14} /> Экспорт
          </KbButton>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KbStatCard
            label="Выручка за период"
            value={formatCurrency(dataset?.totals?.revenue ?? 286400, locale)}
            delta="+23%"
            caption="к прошлому периоду"
            icon={<TrendingUp size={18} />}
            iconTone="lavender"
          />
          <KbStatCard
            label="Средний чек"
            value={formatCurrency(dataset?.totals?.averageCheck ?? 3420, locale)}
            delta="+14%"
            icon={<Star size={18} />}
            iconTone="sage"
          />
          <KbStatCard
            label="Записи"
            value={dataset?.totals?.bookings ?? 82}
            delta="+17%"
            icon={<Calendar size={18} />}
            iconTone="peach"
          />
          <KbStatCard
            label="Новые клиенты"
            value={dataset?.totals?.newClients ?? 14}
            delta="+27%"
            icon={<Users size={18} />}
            iconTone="cream"
          />
          <KbStatCard
            label="Отзывы"
            value={4}
            delta="+11%"
            icon={<MessageSquare size={18} />}
            iconTone="sky"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <KbCard className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <KbEyebrow>Динамика выручки</KbEyebrow>
                <div className="kb-metric mt-2 text-[24px]">{formatCurrency(57200, locale)}</div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[var(--kb-text-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--kb-coral)]" /> Этот период
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--kb-text-muted)]" /> Прошлый период
                </span>
              </div>
            </div>
            <div className="mt-4 h-[260px] w-full">
              <ResponsiveContainer>
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="anaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--kb-coral)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--kb-coral)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--kb-line)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false}
                    tick={{ fill: 'var(--kb-text-muted)', fontSize: 11 }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--kb-border)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="prev" stroke="var(--kb-text-muted)" strokeDasharray="4 4"
                    fill="transparent" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="value" stroke="var(--kb-coral)" strokeWidth={2.5} fill="url(#anaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </KbCard>

          <KbCard className="p-6">
            <KbEyebrow>Источники клиентов</KbEyebrow>
            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-[140px] w-[140px]">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="var(--kb-warm-surface)" strokeWidth="14" fill="none" />
                  {(channels.length ? channels : [
                    { id: '1', label: 'Instagram', visitors: 45 },
                    { id: '2', label: 'Рекомендации', visitors: 25 },
                    { id: '3', label: 'ВК', visitors: 20 },
                    { id: '4', label: 'Сайт', visitors: 10 },
                  ]).slice(0, 4).map((ch, i) => {
                    const total = 100;
                    const value = ch.visitors;
                    const prev = (channels.length ? channels : [
                      { visitors: 45 }, { visitors: 25 }, { visitors: 20 }, { visitors: 10 },
                    ]).slice(0, i).reduce((s, c) => s + c.visitors, 0);
                    const colors = ['var(--kb-coral)', 'var(--kb-lavender-accent)', 'var(--kb-sage-accent)', 'var(--kb-cream-accent)'];
                    return (
                      <circle key={ch.id} cx="50" cy="50" r="42" stroke={colors[i]} strokeWidth="14" fill="none"
                        strokeDasharray={`${(value / total) * 264} 264`} strokeDashoffset={-((prev / total) * 264)} />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] uppercase text-[var(--kb-text-muted)]">Источников</span>
                  <span className="kb-metric text-[20px]">{channels.length || 4}</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2 text-[12px]">
                {(channels.length ? channels : [
                  { id: '1', label: 'Instagram', visitors: 45 },
                  { id: '2', label: 'Рекомендации', visitors: 25 },
                  { id: '3', label: 'ВК', visitors: 20 },
                  { id: '4', label: 'Сайт', visitors: 10 },
                ]).slice(0, 4).map((ch, i) => (
                  <li key={ch.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[var(--kb-text-secondary)]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: ['var(--kb-coral)', 'var(--kb-lavender-accent)', 'var(--kb-sage-accent)', 'var(--kb-cream-accent)'][i] }}
                      />
                      {ch.label}
                    </span>
                    <span className="kb-metric">{ch.visitors}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </KbCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <KbCard className="p-6">
            <KbEyebrow>Эффективность услуг</KbEyebrow>
            <table className="kb-table mt-4">
              <thead>
                <tr><th>Услуга</th><th className="text-right">Выручка</th><th className="text-right">Динамика</th></tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-[12px]">{s.name}</td>
                    <td className="kb-metric text-right text-[12px]">{formatCurrency(s.revenue, locale)}</td>
                    <td className={`text-right text-[12px] ${i % 3 === 2 ? 'text-[var(--kb-coral)]' : 'text-[var(--kb-status-confirmed)]'}`}>
                      {i % 3 === 2 ? '−4%' : `+${10 + i * 3}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </KbCard>

          <KbCard className="p-6">
            <KbEyebrow>Загрузка по дням и времени</KbEyebrow>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 * 9 }).map((_, idx) => {
                const intensity = Math.abs(Math.sin(idx * 0.7));
                return (
                  <span
                    key={idx}
                    className="h-6 rounded"
                    style={{
                      background: `color-mix(in srgb, var(--kb-lavender-accent) ${Math.round(intensity * 80)}%, var(--kb-lavender))`,
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5 text-[10px] text-[var(--kb-text-muted)]">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (<div key={d} className="text-center">{d}</div>))}
            </div>
          </KbCard>

          <KbCard className="p-6">
            <KbEyebrow>LTV клиента</KbEyebrow>
            <div className="kb-metric mt-2 flex items-baseline gap-2">
              <span className="text-[28px]">{formatCurrency(18450, locale)}</span>
              <span className="text-[12px] font-medium text-[var(--kb-status-confirmed)]">+18%</span>
            </div>
            <div className="mt-3 h-[80px] w-full">
              <ResponsiveContainer>
                <LineChart data={ltvSeries}>
                  <Line dataKey="value" stroke="var(--kb-lavender-accent)" strokeWidth={2} dot={false} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-[12px] text-[var(--kb-text-muted)]">за 12 месяцев</div>
          </KbCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <KbCard className="p-6">
            <KbEyebrow>Повторные клиенты</KbEyebrow>
            <div className="mt-4 flex items-center gap-6">
              <div className="relative h-[140px] w-[140px]">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="var(--kb-warm-surface)" strokeWidth="10" fill="none" />
                  <circle cx="50" cy="50" r="42" stroke="var(--kb-coral)" strokeWidth="10" fill="none"
                    strokeLinecap="round" strokeDasharray={`${68 * 2.64} 264`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="kb-metric text-[28px]">68%</span>
                </div>
              </div>
              <div className="text-[12px] text-[var(--kb-text-secondary)]">
                <div className="kb-metric text-[18px] text-[var(--kb-text)]">31 день</div>
                <div>Средний интервал между визитами</div>
                <div className="mt-3 kb-metric text-[18px] text-[var(--kb-text)]">124</div>
                <div>Возвращающихся клиентов</div>
              </div>
            </div>
          </KbCard>

          <KbCard className="p-6">
            <KbEyebrow>Ценность клиентов по визитам</KbEyebrow>
            <ul className="mt-4 space-y-2.5 text-[12px]">
              {[
                { label: '1 визит', value: 5400 },
                { label: '2—3 визита', value: 28100 },
                { label: '4—5 визитов', value: 56400 },
                { label: '6—10 визитов', value: 38900 },
              ].map((row) => (
                <li key={row.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--kb-text-secondary)]">{row.label}</span>
                    <span className="kb-metric">{formatCurrency(row.value, locale)}</span>
                  </div>
                  <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
                    <span className="block h-full rounded-full bg-[var(--kb-coral)]" style={{ width: `${(row.value / 60000) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </KbCard>
        </div>
      </div>
    </KbShell>
  );
}
