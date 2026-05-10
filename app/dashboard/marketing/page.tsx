'use client';

import { useState } from 'react';
import { Cake, Gift, Plus, Sparkles, TrendingUp, Users } from 'lucide-react';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbButton,
  KbCard,
  KbChip,
  KbDisplay,
  KbDivider,
  KbEyebrow,
  KbIconTile,
  KbStatCard,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

const CAMPAIGNS = [
  { name: 'Возвращение спящих клиентов', status: 'active', sent: 124, opened: 87, channel: 'Telegram' },
  { name: 'Промокод на новый сезон', status: 'draft', sent: 0, opened: 0, channel: 'SMS + Email' },
  { name: 'Поздравление с ДР', status: 'active', sent: 42, opened: 38, channel: 'Telegram' },
];

const PROMOS = [
  { code: 'BLOOM15', desc: '−15% на первый визит', usage: 24, expires: '01.06.2025' },
  { code: 'FRIEND10', desc: '−10% по реферальной ссылке', usage: 12, expires: '—' },
  { code: 'HOLIDAY20', desc: '−20% перед праздниками', usage: 8, expires: '08.05.2025' },
];

export default function MarketingPage() {
  const { ownedProfile, locale, dataset } = useOwnedWorkspaceData();
  const [tab, setTab] = useState<'campaigns' | 'promos' | 'segments' | 'birthdays'>('campaigns');

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KbEyebrow>Возвращайте клиентов и привлекайте новых</KbEyebrow>
            <KbDisplay level={1} className="mt-3">Маркетинг</KbDisplay>
          </div>
          <div className="flex items-center gap-2">
            <KbButton variant="outline">
              <Sparkles size={14} /> AI-рекомендации
            </KbButton>
            <KbButton variant="navy">
              <Plus size={14} /> Запустить кампанию
            </KbButton>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KbStatCard label="Активные кампании" value={5} delta="+2" icon={<TrendingUp size={18} />} iconTone="lavender" />
          <KbStatCard label="Промокоды" value={12} caption="активные" icon={<Gift size={18} />} iconTone="peach" />
          <KbStatCard label="Сегменты аудитории" value={8} icon={<Users size={18} />} iconTone="sage" />
          <KbStatCard label="Доход от кампаний" value={formatCurrency(184600, locale)} delta="+34%" icon={<Sparkles size={18} />} iconTone="cream" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap gap-2">
              {[
                ['campaigns', 'Кампании', 5],
                ['promos', 'Промокоды', 12],
                ['segments', 'Сегменты', 8],
                ['birthdays', 'Дни рождения', 3],
              ].map(([k, l, c]) => (
                <KbChip key={String(k)} active={tab === k} onClick={() => setTab(k as typeof tab)} count={Number(c)}>
                  {l}
                </KbChip>
              ))}
            </div>

            {tab === 'campaigns' && (
              <KbCard className="mt-4 overflow-hidden p-0">
                <table className="kb-table">
                  <thead>
                    <tr><th>Кампания</th><th>Канал</th><th>Отправлено</th><th>Прочитано</th><th>Статус</th></tr>
                  </thead>
                  <tbody>
                    {CAMPAIGNS.map((c) => (
                      <tr key={c.name}>
                        <td className="text-[13px] font-medium">{c.name}</td>
                        <td className="text-[12px] text-[var(--kb-text-secondary)]">{c.channel}</td>
                        <td className="kb-metric text-[13px]">{c.sent}</td>
                        <td className="kb-metric text-[13px]">{c.opened}</td>
                        <td>
                          <KbChip tone={c.status === 'active' ? 'confirmed' : 'pending'}>
                            {c.status === 'active' ? 'Активна' : 'Черновик'}
                          </KbChip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </KbCard>
            )}

            {tab === 'promos' && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {PROMOS.map((p) => (
                  <KbCard key={p.code} className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[var(--kb-cream)] px-2.5 py-1 font-mono text-[13px] tracking-wider text-[var(--kb-cream-accent)]">
                        {p.code}
                      </span>
                      <KbChip tone="confirmed">Активен</KbChip>
                    </div>
                    <div className="mt-3 text-[14px] font-medium">{p.desc}</div>
                    <div className="mt-2 text-[12px] text-[var(--kb-text-muted)]">
                      Применений: {p.usage} · до {p.expires}
                    </div>
                  </KbCard>
                ))}
              </div>
            )}

            {tab === 'segments' && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  { name: 'VIP', size: 38, accent: 'lavender' },
                  { name: 'Спящие', size: 142, accent: 'peach' },
                  { name: 'Новые в этом месяце', size: 27, accent: 'sage' },
                  { name: 'Возвращающиеся', size: 312, accent: 'cream' },
                ].map((s) => (
                  <KbCard key={s.name} className="p-5">
                    <KbIconTile tone={s.accent as 'lavender' | 'peach' | 'sage' | 'cream'} size={36}>
                      <Users size={16} />
                    </KbIconTile>
                    <div className="mt-3 text-[14px] font-medium">{s.name}</div>
                    <div className="kb-metric mt-1 text-[24px]">{s.size}</div>
                    <div className="text-[11px] text-[var(--kb-text-muted)]">клиентов в сегменте</div>
                  </KbCard>
                ))}
              </div>
            )}

            {tab === 'birthdays' && (
              <KbCard className="mt-4 p-5">
                <KbEyebrow>Ближайшие дни рождения</KbEyebrow>
                <ul className="mt-3 space-y-3 text-[13px]">
                  {(dataset?.clients ?? []).slice(0, 5).map((c, idx) => (
                    <li key={c.id} className="flex items-center gap-3 rounded-[14px] bg-[var(--kb-warm-surface)] p-3">
                      <KbIconTile tone="peach" size={36}>
                        <Cake size={16} />
                      </KbIconTile>
                      <div className="flex-1">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-[11px] text-[var(--kb-text-muted)]">через {3 + idx} дня · {12 + idx} августа</div>
                      </div>
                      <KbButton size="sm" variant="primary">Поздравить</KbButton>
                    </li>
                  ))}
                </ul>
              </KbCard>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <KbCard tone="soft" className="p-5">
              <div className="flex items-center gap-2 text-[var(--kb-coral)]">
                <Sparkles size={14} />
                <KbEyebrow className="text-[var(--kb-coral)]">КликБук AI</KbEyebrow>
              </div>
              <h4 className="kb-display kb-h3 mt-2">Запустить рассылку для спящих?</h4>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
                У вас 142 клиента не возвращались более 90 дней. Рекомендуем кампанию с персональной скидкой.
              </p>
              <KbButton variant="primary" className="mt-3 w-full">Создать кампанию</KbButton>
            </KbCard>

            <KbCard className="p-5">
              <KbEyebrow>Эффективность каналов</KbEyebrow>
              <ul className="mt-4 space-y-3 text-[13px]">
                <ChannelRow label="Telegram" value={186} percent={72} />
                <ChannelRow label="Email" value={92} percent={36} />
                <ChannelRow label="SMS" value={48} percent={18} />
                <ChannelRow label="Push" value={32} percent={12} />
              </ul>
            </KbCard>
          </div>
        </div>
      </div>
    </KbShell>
  );
}

function ChannelRow({ label, value, percent }: { label: string; value: number; percent: number }) {
  return (
    <li>
      <div className="flex items-center justify-between text-[12px]">
        <span>{label}</span>
        <span className="kb-metric">{value} конверсий</span>
      </div>
      <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
        <span className="block h-full rounded-full bg-[var(--kb-coral)]" style={{ width: `${percent}%` }} />
      </div>
    </li>
  );
}
