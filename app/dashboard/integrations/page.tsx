'use client';

import { useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Globe,
  MessageCircleMore,
  PlugZap,
  Send,
  Settings,
} from 'lucide-react';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbButton,
  KbCard,
  KbChip,
  KbDisplay,
  KbDivider,
  KbEyebrow,
  KbIconTile,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';

const INTEGRATIONS = [
  { id: 'telegram', name: 'Telegram', desc: 'Бот и Mini App для записи', icon: Send, tone: 'sky' as const, status: 'connected' },
  { id: 'vk', name: 'VK', desc: 'Сообщество и виджет записи', icon: MessageCircleMore, tone: 'lavender' as const, status: 'connected' },
  { id: 'whatsapp', name: 'WhatsApp', desc: 'Уведомления и подтверждения', icon: MessageCircleMore, tone: 'sage' as const, status: 'recommended' },
  { id: 'gcal', name: 'Google Calendar', desc: 'Синхронизация записей', icon: CalendarDays, tone: 'peach' as const, status: 'available' },
  { id: 'tinkoff', name: 'Тинькофф Эквайринг', desc: 'Прием платежей онлайн', icon: CreditCard, tone: 'cream' as const, status: 'connected' },
  { id: 'sbp', name: 'СБП', desc: 'Платежи через QR', icon: CreditCard, tone: 'sky' as const, status: 'available' },
  { id: 'analytics', name: 'Яндекс.Метрика', desc: 'Веб-аналитика', icon: BarChart3, tone: 'lavender' as const, status: 'available' },
  { id: 'api', name: 'Открытый API', desc: 'REST + Webhooks', icon: PlugZap, tone: 'coral' as const, status: 'available' },
  { id: 'web', name: 'Виджет на сайте', desc: 'Кнопка записи онлайн', icon: Globe, tone: 'sage' as const, status: 'connected' },
];

export default function IntegrationsPage() {
  const { ownedProfile } = useOwnedWorkspaceData();
  const [selected, setSelected] = useState(INTEGRATIONS[0]);

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div>
        <div>
          <KbEyebrow>Подключайте сервисы и автоматизируйте работу</KbEyebrow>
          <KbDisplay level={1} className="mt-3">Интеграции</KbDisplay>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((it) => (
              <button
                key={it.id}
                onClick={() => setSelected(it)}
                className={`group flex items-start gap-3 rounded-[20px] border p-5 text-left transition ${
                  selected.id === it.id
                    ? 'border-[var(--kb-coral)] bg-white shadow-[var(--kb-shadow-elev)]'
                    : 'border-[var(--kb-border)] bg-white hover:bg-[var(--kb-warm-surface)]'
                }`}
              >
                <KbIconTile tone={it.tone} size={44}>
                  <it.icon size={18} />
                </KbIconTile>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[14px] font-medium">{it.name}</div>
                  <div className="mt-1 text-[12px] text-[var(--kb-text-secondary)]">{it.desc}</div>
                  <div className="mt-3">
                    {it.status === 'connected' && <KbChip tone="confirmed"><CheckCircle2 size={11} /> Подключено</KbChip>}
                    {it.status === 'recommended' && <KbChip tone="pending">Рекомендуем</KbChip>}
                    {it.status === 'available' && <KbChip>Доступно</KbChip>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <aside className="kb-card sticky top-24 h-fit p-6">
            <div className="flex items-center gap-3">
              <KbIconTile tone={selected.tone} size={56}>
                <selected.icon size={24} />
              </KbIconTile>
              <div>
                <div className="kb-display kb-h3">{selected.name}</div>
                <div className="text-[12px] text-[var(--kb-text-muted)]">{selected.desc}</div>
              </div>
            </div>

            <KbDivider className="my-5" />

            {selected.status === 'connected' ? (
              <>
                <KbChip tone="confirmed" className="mb-4">
                  <CheckCircle2 size={11} /> Активна
                </KbChip>
                <p className="text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
                  Клиенты получают уведомления о записях. Интеграция активна и работает корректно.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <KbButton variant="outline" size="sm">
                    <Settings size={12} /> Настройки
                  </KbButton>
                  <KbButton variant="ghost" size="sm">Отключить</KbButton>
                </div>
              </>
            ) : (
              <>
                <p className="text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
                  Подключите сервис, чтобы расширить возможности кабинета. Подключение займёт несколько минут.
                </p>
                <KbButton variant="primary" className="mt-4 w-full">Подключить</KbButton>
              </>
            )}

            <KbDivider className="my-5" />

            <KbEyebrow>Последние события</KbEyebrow>
            <ul className="mt-3 space-y-2 text-[12px] text-[var(--kb-text-secondary)]">
              <li className="flex items-center justify-between">
                <span>Отправлено напоминание</span>
                <span className="text-[var(--kb-text-muted)]">14:24</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Получено сообщение клиента</span>
                <span className="text-[var(--kb-text-muted)]">13:47</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Подтверждение записи</span>
                <span className="text-[var(--kb-text-muted)]">12:12</span>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </KbShell>
  );
}
