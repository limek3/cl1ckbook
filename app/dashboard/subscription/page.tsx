'use client';

import { useState } from 'react';
import { Check, Gift, Sparkles, Zap } from 'lucide-react';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbButton,
  KbCard,
  KbChip,
  KbDisplay,
  KbDivider,
  KbEyebrow,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

const PLANS = [
  {
    id: 'base',
    name: 'Базовый',
    price: 990,
    yearly: 11600,
    description: 'Для начинающих в небольших студиях',
    features: ['Календарь и онлайн-запись', 'До 100 клиентов в базе', 'Telegram-уведомления'],
    accent: false,
  },
  {
    id: 'pro',
    name: 'Стандарт',
    price: 1990,
    yearly: 23900,
    description: 'Оптимально для растущей команды',
    features: ['Все из Базового', 'До 500 клиентов', 'SMS-рассылки', 'Аналитика и отчёты', 'Приём предоплаты'],
    accent: true,
    badge: 'Рекомендуем',
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 3490,
    yearly: 41900,
    description: 'Для крупных салонов и сетей',
    features: ['Всё из Стандарта', 'Безлимит клиентов', 'Мультифилиальность', 'Маркетинг и ретеншн', 'API + интеграции'],
    accent: false,
  },
];

const COMPARE = [
  ['Онлайн-запись и календарь', true, true, true],
  ['Интеграция с мессенджерами', true, true, true],
  ['Аналитика и отчёты', false, true, true],
  ['Маркетинговые инструменты', false, true, true],
  ['API и веб-хуки', false, false, true],
];

export default function SubscriptionPage() {
  const { ownedProfile, locale } = useOwnedWorkspaceData();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <div>
            <KbEyebrow>Подписка</KbEyebrow>
            <KbDisplay level={2} className="mt-3">Подписка</KbDisplay>
            <p className="mt-2 text-[13px] text-[var(--kb-text-secondary)]">
              Выберите план, который подходит вашему салону. Управляйте подпиской, оплатой и лимитами.
            </p>
          </div>

          <KbCard className="p-5">
            <KbEyebrow>Ваш текущий план</KbEyebrow>
            <div className="mt-3 flex items-center gap-3 rounded-[16px] bg-[var(--kb-sage)] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--kb-sage-accent)] text-white">
                <Check size={16} />
              </div>
              <div>
                <div className="text-[14px] font-medium">Стандарт</div>
                <div className="text-[11px] text-[var(--kb-text-muted)]">{formatCurrency(1990, locale)} в месяц</div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-[var(--kb-text-muted)]">Следующее списание 26 мая 2025</p>
            <KbButton variant="outline" className="mt-3 w-full">Управление подпиской</KbButton>
          </KbCard>

          <KbCard className="p-5">
            <KbEyebrow>Использование в текущем периоде</KbEyebrow>
            <ul className="mt-3 space-y-3 text-[12px]">
              <UsageRow label="Записи и календарь" used={290} total={500} />
              <UsageRow label="Клиенты" used={847} total={1000} />
              <UsageRow label="SMS и push" used={158} total={500} />
            </ul>
            <p className="mt-3 text-[11px] text-[var(--kb-text-muted)]">До конца периода 5 дней</p>
          </KbCard>

          <KbCard tone="soft" className="p-5">
            <div className="flex items-center gap-2 text-[var(--kb-coral)]">
              <Gift size={14} />
              <KbEyebrow className="text-[var(--kb-coral)]">Есть промокод?</KbEyebrow>
            </div>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Введите код, чтобы получить скидку на следующий платёж.
            </p>
            <input className="kb-input mt-3 kb-input-warm" placeholder="Введите промокод" />
            <KbButton variant="primary" className="mt-3 w-full">Активировать</KbButton>
          </KbCard>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4 rounded-[20px] border border-[var(--kb-border)] bg-white p-4">
            <div className="flex items-center gap-1 rounded-[14px] bg-[var(--kb-warm-surface)] p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={`rounded-[10px] px-4 py-1.5 text-[12px] transition ${
                  billing === 'monthly' ? 'bg-white shadow-[var(--kb-shadow-card)]' : 'text-[var(--kb-text-secondary)]'
                }`}
              >
                Ежемесячно
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className={`rounded-[10px] px-4 py-1.5 text-[12px] transition ${
                  billing === 'yearly' ? 'bg-white shadow-[var(--kb-shadow-card)]' : 'text-[var(--kb-text-secondary)]'
                }`}
              >
                Ежегодно <KbChip tone="confirmed" className="ml-2 text-[10px]">−15%</KbChip>
              </button>
            </div>
            <span className="text-[11px] text-[var(--kb-text-muted)]">Цены в ₽ с учётом НДС 20%</span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-[24px] border p-6 ${
                  plan.accent
                    ? 'border-transparent bg-[var(--kb-coral-soft)] shadow-[var(--kb-shadow-elev)]'
                    : 'border-[var(--kb-border)] bg-white'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-4 rounded-full bg-[var(--kb-coral)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                    {plan.badge}
                  </span>
                )}
                <KbEyebrow>{plan.name}</KbEyebrow>
                <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">{plan.description}</p>
                <div className="kb-metric mt-5 text-[36px] text-[var(--kb-text)]">
                  {formatCurrency(billing === 'monthly' ? plan.price : Math.round(plan.yearly / 12), locale)}
                  <span className="text-[13px] text-[var(--kb-text-muted)]"> / мес</span>
                </div>
                {billing === 'yearly' && (
                  <p className="mt-1 text-[11px] text-[var(--kb-text-muted)]">
                    {formatCurrency(plan.yearly, locale)} в год
                  </p>
                )}
                <KbButton variant={plan.accent ? 'primary' : 'navy'} className="mt-5 w-full">
                  {plan.accent ? 'Это текущий план' : `Выбрать ${plan.name}`}
                </KbButton>
                <KbDivider className="my-5" />
                <ul className="space-y-2 text-[13px]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 text-[var(--kb-status-confirmed)]" />
                      <span className="text-[var(--kb-text-secondary)]">{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <KbCard className="mt-6 p-6">
            <KbEyebrow>Сравнение возможностей</KbEyebrow>
            <table className="kb-table mt-4">
              <thead>
                <tr><th>Возможность</th><th className="text-center">Базовый</th><th className="text-center">Стандарт</th><th className="text-center">Премиум</th></tr>
              </thead>
              <tbody>
                {COMPARE.map(([label, b, p, pr], idx) => (
                  <tr key={idx}>
                    <td className="text-[13px]">{label}</td>
                    <td className="text-center">{b ? <Check size={14} className="inline text-[var(--kb-status-confirmed)]" /> : <span className="text-[var(--kb-text-muted)]">—</span>}</td>
                    <td className="text-center">{p ? <Check size={14} className="inline text-[var(--kb-status-confirmed)]" /> : <span className="text-[var(--kb-text-muted)]">—</span>}</td>
                    <td className="text-center">{pr ? <Check size={14} className="inline text-[var(--kb-status-confirmed)]" /> : <span className="text-[var(--kb-text-muted)]">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </KbCard>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <KbCard className="p-5">
              <KbEyebrow>Платёжная информация</KbEyebrow>
              <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-[var(--kb-warm-surface)] p-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-white text-[12px] font-semibold">VISA</div>
                <div>
                  <div className="text-[13px] font-medium">**** 4342</div>
                  <div className="text-[11px] text-[var(--kb-text-muted)]">Срок до 12/27</div>
                </div>
                <button className="ml-auto text-[12px] text-[var(--kb-coral)]">Изменить способ оплаты</button>
              </div>
            </KbCard>

            <KbCard className="p-5">
              <KbEyebrow>История счетов</KbEyebrow>
              <ul className="mt-3 space-y-2 text-[12px]">
                {[
                  { id: 1, name: 'Май 2025', amount: 1990, date: '01.05.2025' },
                  { id: 2, name: 'Апрель 2025', amount: 1990, date: '01.04.2025' },
                  { id: 3, name: 'Март 2025', amount: 1990, date: '01.03.2025' },
                ].map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between rounded-[12px] bg-[var(--kb-warm-surface)] px-3 py-2">
                    <span>{inv.name}</span>
                    <span className="kb-metric">{formatCurrency(inv.amount, locale)}</span>
                    <span className="text-[var(--kb-text-muted)]">{inv.date}</span>
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

function UsageRow({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <li>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[var(--kb-text-muted)]">{used} / {total}</span>
      </div>
      <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: pct > 80 ? 'var(--kb-coral)' : 'var(--kb-sage-accent)' }}
        />
      </div>
    </li>
  );
}
