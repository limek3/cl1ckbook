'use client';

import { useMemo, useState } from 'react';
import { CreditCard, Download, Link as LinkIcon, Plus, RefreshCcw, Settings } from 'lucide-react';

import { KbShell } from '@/components/klikbook/shell';
import {
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

export default function PaymentsPage() {
  const { dataset, ownedProfile, locale } = useOwnedWorkspaceData();
  const [tab, setTab] = useState<'list' | 'refunds' | 'links'>('list');
  const [prepayment, setPrepayment] = useState(50);

  const payments = useMemo(() => {
    return (dataset?.clients ?? []).slice(0, 6).map((c, i) => ({
      id: `pay-${i}`,
      client: c.name,
      service: c.service,
      amount: c.averageCheck || 3500,
      method: i % 3 === 0 ? 'Карта' : i % 3 === 1 ? 'СБП' : 'Наличные',
      status: i === 1 ? 'pending' : 'paid',
      date: `${15 + i}.05.2025`,
    }));
  }, [dataset?.clients]);

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KbEyebrow>Платежи и предоплаты</KbEyebrow>
            <KbDisplay level={1} className="mt-3">Платежи</KbDisplay>
          </div>
          <div className="flex items-center gap-2">
            <KbButton variant="outline">
              <Download size={14} /> Экспорт
            </KbButton>
            <KbButton variant="navy">
              <Plus size={14} /> Новая ссылка
            </KbButton>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KbStatCard label="Принято" value={formatCurrency(184600, locale)} delta="+22%" icon={<CreditCard size={18} />} iconTone="lavender" />
          <KbStatCard label="К получению" value={formatCurrency(12400, locale)} caption="ожидание" icon={<RefreshCcw size={18} />} iconTone="cream" />
          <KbStatCard label="Возвраты" value={formatCurrency(3600, locale)} caption="2 операции" icon={<RefreshCcw size={18} />} iconTone="peach" />
          <KbStatCard label="Активные ссылки" value={4} icon={<LinkIcon size={18} />} iconTone="sage" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap gap-2">
              {[
                ['list', 'Платежи'],
                ['refunds', 'Возвраты'],
                ['links', 'Платёжные ссылки'],
              ].map(([k, l]) => (
                <KbChip key={k} active={tab === k} onClick={() => setTab(k as typeof tab)}>{l}</KbChip>
              ))}
            </div>

            {tab === 'list' && (
              <KbCard className="mt-4 overflow-hidden p-0">
                <table className="kb-table">
                  <thead><tr><th>Дата</th><th>Клиент</th><th>Услуга</th><th>Способ</th><th className="text-right">Сумма</th><th>Статус</th></tr></thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="text-[13px]">{p.date}</td>
                        <td className="text-[13px] font-medium">{p.client}</td>
                        <td className="text-[13px] text-[var(--kb-text-secondary)]">{p.service}</td>
                        <td className="text-[12px] text-[var(--kb-text-muted)]">{p.method}</td>
                        <td className="kb-metric text-right">{formatCurrency(p.amount, locale)}</td>
                        <td>
                          <KbChip tone={p.status === 'paid' ? 'confirmed' : 'pending'}>
                            {p.status === 'paid' ? 'Оплачено' : 'Ожидание'}
                          </KbChip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </KbCard>
            )}

            {tab === 'refunds' && (
              <KbCard className="mt-4 p-6">
                <KbEyebrow>История возвратов</KbEyebrow>
                <ul className="mt-4 space-y-3 text-[13px]">
                  {[1, 2].map((i) => (
                    <li key={i} className="flex items-center justify-between rounded-[14px] bg-[var(--kb-warm-surface)] p-4">
                      <div>
                        <div className="font-medium">Возврат предоплаты · клиент Анна К.</div>
                        <div className="mt-1 text-[12px] text-[var(--kb-text-muted)]">{15 + i}.05.2025 · карта **4342</div>
                      </div>
                      <span className="kb-metric text-[var(--kb-coral)]">−{formatCurrency(1800, locale)}</span>
                    </li>
                  ))}
                </ul>
              </KbCard>
            )}

            {tab === 'links' && (
              <KbCard className="mt-4 p-6">
                <KbEyebrow>Активные платёжные ссылки</KbEyebrow>
                <ul className="mt-4 space-y-3 text-[13px]">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="flex items-center justify-between rounded-[14px] bg-[var(--kb-warm-surface)] p-4">
                      <div className="flex items-center gap-3">
                        <LinkIcon size={14} className="text-[var(--kb-coral)]" />
                        <div>
                          <div className="font-mono text-[12px]">https://klikbk.io/p/{`xJ9${i}qP`}</div>
                          <div className="mt-1 text-[11px] text-[var(--kb-text-muted)]">создана {15 + i}.05.2025 · действует 7 дней</div>
                        </div>
                      </div>
                      <span className="kb-metric">{formatCurrency(2500 + i * 700, locale)}</span>
                    </li>
                  ))}
                </ul>
              </KbCard>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <KbCard className="p-5">
              <div className="flex items-center justify-between">
                <KbEyebrow>Правила предоплаты</KbEyebrow>
                <KbChip tone="completed">Включены</KbChip>
              </div>
              <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
                Размер обязательной предоплаты для новых записей.
              </p>
              <div className="kb-metric mt-3 text-[36px]">{prepayment}%</div>
              <input
                type="range"
                value={prepayment}
                min={0}
                max={100}
                step={5}
                onChange={(e) => setPrepayment(parseInt(e.target.value, 10))}
                className="mt-2 w-full accent-[var(--kb-coral)]"
              />
              <div className="mt-2 flex justify-between text-[10px] text-[var(--kb-text-muted)]">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </KbCard>

            <KbCard className="p-5">
              <KbEyebrow>Эквайринг</KbEyebrow>
              <ul className="mt-3 space-y-2 text-[13px]">
                <li className="flex items-center justify-between rounded-[12px] bg-[var(--kb-warm-surface)] p-3">
                  <span>Тинькофф</span>
                  <KbChip tone="confirmed">Подключён</KbChip>
                </li>
                <li className="flex items-center justify-between rounded-[12px] bg-[var(--kb-warm-surface)] p-3">
                  <span>СБП</span>
                  <KbChip>Подключить</KbChip>
                </li>
              </ul>
              <KbButton variant="outline" className="mt-3 w-full">
                <Settings size={12} /> Настройки эквайринга
              </KbButton>
            </KbCard>
          </div>
        </div>
      </div>
    </KbShell>
  );
}
