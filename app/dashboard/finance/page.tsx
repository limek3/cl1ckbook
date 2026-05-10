'use client';

import { useMemo } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  CreditCard,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbButton,
  KbCard,
  KbChip,
  KbDarkSummary,
  KbDisplay,
  KbDivider,
  KbEyebrow,
  KbStatCard,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

export default function FinancePage() {
  const { dataset, ownedProfile, locale } = useOwnedWorkspaceData();
  const revenue = dataset?.totals?.revenue ?? 0;
  const incoming = Math.round(revenue * 0.96);
  const expenses = Math.round(revenue * 0.19);
  const net = revenue - expenses;

  const series = useMemo(
    () =>
      (dataset?.daily ?? []).slice(-14).map((d) => ({
        label: d.label,
        value: d.revenue,
      })),
    [dataset?.daily],
  );

  const operations = useMemo(() => {
    const acc: { id: string; date: string; type: string; category: string; client: string; method: string; amount: number; status: 'paid' | 'pending' | 'refunded' }[] = [];
    (dataset?.clients ?? []).slice(0, 8).forEach((c, i) => {
      const date = `${15 + i}.05.2025`;
      acc.push({
        id: `op-${i}`,
        date,
        type: i % 4 === 0 ? 'Поступление' : i % 4 === 1 ? 'Выручка' : i % 4 === 2 ? 'Расход' : 'Выплата',
        category: i % 4 === 2 ? 'Аренда' : 'Клиент',
        client: c.name,
        method: i % 3 === 0 ? 'Банковская карта' : i % 3 === 1 ? 'СБП' : 'Наличные',
        amount: i % 4 === 2 ? -Math.round(2000 + i * 300) : Math.round(c.averageCheck || 3500),
        status: i % 4 === 0 ? 'pending' : 'paid',
      });
    });
    return acc;
  }, [dataset?.clients]);

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div>
            <KbEyebrow>Прозрачные финансы и контроль движения средств</KbEyebrow>
            <KbDisplay level={1} className="mt-3">Финансы</KbDisplay>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KbDarkSummary
              eyebrow="Выручка за период"
              value={formatCurrency(revenue, locale)}
              delta="+23% к прошлому периоду"
            >
              <div className="h-[40px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6FE6CF" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6FE6CF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#6FE6CF" strokeWidth={2} fill="url(#rg1)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </KbDarkSummary>
            <KbStatCard
              label="Поступления на счёт"
              value={formatCurrency(incoming, locale)}
              delta="+19%"
              caption="к прошлому периоду"
              icon={<ArrowDownToLine size={18} />}
              iconTone="sage"
            />
            <KbStatCard
              label="Расходы"
              value={formatCurrency(expenses, locale)}
              delta="−2%"
              deltaTone="negative"
              caption="к прошлому периоду"
              icon={<TrendingUp size={18} />}
              iconTone="peach"
            />
            <KbStatCard
              label="Чистая прибыль"
              value={formatCurrency(net, locale)}
              delta="+25%"
              caption="к прошлому периоду"
              icon={<Wallet size={18} />}
              iconTone="lavender"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <KbCard className="p-5 lg:col-span-1">
              <KbEyebrow>Наличные и безналичные</KbEyebrow>
              <div className="kb-metric mt-3 text-[28px] text-[var(--kb-text)]">
                {formatCurrency(revenue, locale)}
              </div>
              <div className="mt-4">
                <Donut
                  segments={[
                    { value: 75, color: 'var(--kb-coral)', label: 'Карта' },
                    { value: 18, color: 'var(--kb-lavender-accent)', label: 'СБП' },
                    { value: 7, color: 'var(--kb-sage-accent)', label: 'Наличные' },
                  ]}
                />
              </div>
            </KbCard>

            <KbCard className="p-5 lg:col-span-1">
              <KbEyebrow>Ближайшие выплаты</KbEyebrow>
              <ul className="mt-4 space-y-3 text-[13px]">
                <PayoutRow name="Эквайринг Точка" amount={98400} percent={48} />
                <PayoutRow name="ЮKassa" amount={12300} percent={28} />
                <PayoutRow name="Зарплата команды" amount={64500} percent={24} />
              </ul>
            </KbCard>

            <KbCard className="p-5 lg:col-span-1">
              <KbEyebrow>Способы оплаты</KbEyebrow>
              <ul className="mt-4 space-y-3 text-[13px]">
                <MethodRow label="Карты" value={167200} percent={72} />
                <MethodRow label="СБП" value={42800} percent={20} />
                <MethodRow label="Наличные" value={18000} percent={8} />
              </ul>
            </KbCard>
          </div>

          <KbCard className="mt-6 overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--kb-line)] p-4">
              <div className="flex items-center gap-2">
                <KbDisplay level={3}>История операций</KbDisplay>
              </div>
              <div className="flex items-center gap-2">
                <KbChip active>Все</KbChip>
                <KbChip>Поступления</KbChip>
                <KbChip>Расходы</KbChip>
                <KbChip>Выплаты</KbChip>
                <KbButton variant="outline" size="sm">
                  <Send size={12} /> Экспорт
                </KbButton>
                <KbButton variant="navy" size="sm">
                  <Plus size={12} /> Новая операция
                </KbButton>
              </div>
            </div>
            <table className="kb-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Операция</th>
                  <th>Категория</th>
                  <th>Контрагент</th>
                  <th>Способ оплаты</th>
                  <th className="text-right">Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id}>
                    <td className="text-[13px]">{op.date}</td>
                    <td className="text-[13px] font-medium">{op.type}</td>
                    <td className="text-[13px] text-[var(--kb-text-secondary)]">{op.category}</td>
                    <td className="text-[13px]">{op.client}</td>
                    <td className="text-[12px] text-[var(--kb-text-muted)]">{op.method}</td>
                    <td className={`kb-metric text-right text-[13px] ${op.amount < 0 ? 'text-[var(--kb-coral)]' : 'text-[var(--kb-text)]'}`}>
                      {op.amount > 0 ? '+' : ''}
                      {formatCurrency(op.amount, locale)}
                    </td>
                    <td>
                      <KbChip tone={op.status === 'paid' ? 'confirmed' : 'pending'}>
                        {op.status === 'paid' ? 'Оплачено' : 'Ожидание'}
                      </KbChip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </KbCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <KbCard className="p-5">
            <div className="flex items-center justify-between">
              <KbEyebrow>Тариф и оплата</KbEyebrow>
              <KbChip tone="completed">Pro</KbChip>
            </div>
            <KbDisplay level={3} className="mt-3">Pro</KbDisplay>
            <p className="mt-1 text-[12px] text-[var(--kb-text-secondary)]">
              Расширенные возможности, аналитика и AI-поддержка.
            </p>
            <KbDivider className="my-4" />
            <ul className="space-y-2 text-[12px] text-[var(--kb-text-secondary)]">
              <li>· Расширенная аналитика</li>
              <li>· Автоматизация уведомлений</li>
              <li>· SMS и push-рассылки</li>
              <li>· Доступ к API</li>
            </ul>
            <KbDivider className="my-4" />
            <div className="kb-metric text-[28px] text-[var(--kb-text)]">5 900 ₽</div>
            <div className="text-[11px] text-[var(--kb-text-muted)]">в месяц · 26 мая 2025</div>
            <KbButton variant="primary" className="mt-3 w-full">
              Управление тарифом
            </KbButton>
          </KbCard>

          <KbCard tone="soft" className="p-5">
            <KbEyebrow>Свой счёт</KbEyebrow>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
              Подключите расчётный счёт и принимайте оплату напрямую с карт, СБП и онлайн-кассы.
            </p>
            <KbButton variant="outline" className="mt-3 w-full">
              <CreditCard size={14} /> Открыть счёт
            </KbButton>
          </KbCard>

          <KbCard className="p-5">
            <KbEyebrow>Структура выручки</KbEyebrow>
            <div className="mt-4 flex items-center gap-4">
              <Donut
                size={120}
                segments={[
                  { value: 64, color: 'var(--kb-coral)', label: 'Услуги' },
                  { value: 22, color: 'var(--kb-cream-accent)', label: 'Пакеты' },
                  { value: 10, color: 'var(--kb-lavender-accent)', label: 'Доп.' },
                  { value: 4, color: 'var(--kb-sage-accent)', label: 'Прочее' },
                ]}
              />
            </div>
          </KbCard>
        </div>
      </div>
    </KbShell>
  );
}

function PayoutRow({ name, amount, percent }: { name: string; amount: number; percent: number }) {
  return (
    <li>
      <div className="flex items-center justify-between text-[12px]">
        <span>{name}</span>
        <span className="kb-metric">{amount.toLocaleString('ru-RU')} ₽</span>
      </div>
      <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
        <span className="block h-full rounded-full bg-[var(--kb-coral)]" style={{ width: `${percent}%` }} />
      </div>
    </li>
  );
}

function MethodRow({ label, value, percent }: { label: string; value: number; percent: number }) {
  return (
    <li>
      <div className="flex items-center justify-between text-[12px]">
        <span>{label}</span>
        <span className="kb-metric">{value.toLocaleString('ru-RU')} ₽</span>
      </div>
      <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: label === 'Карты' ? 'var(--kb-sage-accent)' : label === 'СБП' ? 'var(--kb-lavender-accent)' : 'var(--kb-cream-accent)',
          }}
        />
      </div>
    </li>
  );
}

function Donut({
  segments,
  size = 160,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 160 160" style={{ width: size, height: size }}>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--kb-warm-surface)" strokeWidth="14" />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circumference;
          const dash = `${len} ${circumference - len}`;
          const result = (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            />
          );
          offset += len;
          return result;
        })}
        <text x="80" y="78" textAnchor="middle" fontSize="11" fill="var(--kb-text-muted)">Итого</text>
        <text x="80" y="96" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--kb-text)" fontFamily="var(--kb-font-sans)">
          {total}%
        </text>
      </svg>
      <ul className="space-y-2 text-[12px]">
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: seg.color }} />
            <span className="text-[var(--kb-text-secondary)]">{seg.label}</span>
            <span className="kb-metric ml-auto">{seg.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
