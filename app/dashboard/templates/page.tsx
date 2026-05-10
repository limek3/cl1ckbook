'use client';

import { useState } from 'react';
import { Bot, Hash, Mail, MessageSquare, Plus, Send, Sparkles } from 'lucide-react';

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

const CATEGORIES = [
  { key: 'confirm', label: 'Подтверждения' },
  { key: 'reminder', label: 'Напоминания' },
  { key: 'reactivation', label: 'Реактивация' },
  { key: 'birthday', label: 'Поздравления' },
  { key: 'reviews', label: 'Сбор отзывов' },
];

const CHANNELS = [
  { key: 'sms', label: 'SMS', icon: Hash },
  { key: 'tg', label: 'Telegram', icon: Send },
  { key: 'wa', label: 'WhatsApp', icon: MessageSquare },
  { key: 'email', label: 'Email', icon: Mail },
];

const VARIABLES = ['{{client.name}}', '{{booking.date}}', '{{booking.time}}', '{{salon.name}}', '{{master.name}}', '{{service.name}}'];

export default function TemplatesPage() {
  const { ownedProfile } = useOwnedWorkspaceData();
  const [category, setCategory] = useState('confirm');
  const [channel, setChannel] = useState('tg');
  const [text, setText] = useState(
    'Здравствуйте, {{client.name}}! Подтверждаем запись на {{service.name}} {{booking.date}} в {{booking.time}}. Будем рады вас видеть в {{salon.name}}.',
  );

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <KbEyebrow>Готовые шаблоны для коммуникации с клиентами</KbEyebrow>
            <KbDisplay level={1} className="mt-3">Шаблоны сообщений</KbDisplay>
          </div>
          <KbButton variant="navy">
            <Plus size={14} /> Новый шаблон
          </KbButton>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside>
            <KbEyebrow>Категории</KbEyebrow>
            <ul className="mt-3 space-y-1.5">
              {CATEGORIES.map((c) => (
                <li key={c.key}>
                  <button
                    onClick={() => setCategory(c.key)}
                    className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-left text-[13px] transition ${
                      category === c.key ? 'bg-white shadow-[var(--kb-shadow-card)]' : 'text-[var(--kb-text-secondary)] hover:bg-[var(--kb-warm-surface)]'
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="text-[11px] text-[var(--kb-text-muted)]">{Math.floor(Math.random() * 10) + 2}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <KbChip key={ch.key} active={channel === ch.key} onClick={() => setChannel(ch.key)}>
                  <ch.icon size={12} /> {ch.label}
                </KbChip>
              ))}
            </div>

            <KbCard className="mt-4 p-6">
              <div className="flex items-center justify-between">
                <KbEyebrow>Подтверждение записи · Telegram</KbEyebrow>
                <KbChip tone="completed">Активный</KbChip>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="mt-3 w-full rounded-[16px] border border-[var(--kb-border)] bg-[var(--kb-warm-surface)] p-4 font-mono text-[13px] leading-relaxed text-[var(--kb-text)] outline-none focus:border-[var(--kb-navy)]"
              />
              <KbDivider className="my-4" />
              <KbEyebrow>Доступные переменные</KbEyebrow>
              <div className="mt-3 flex flex-wrap gap-2">
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setText(text + ' ' + v)}
                    className="rounded-md bg-[var(--kb-lavender)] px-2.5 py-1 font-mono text-[11px] text-[var(--kb-lavender-accent)] hover:bg-[var(--kb-lavender)]/80"
                  >
                    {v}
                  </button>
                ))}
              </div>

              <KbDivider className="my-4" />

              <KbEyebrow>Автоматизация</KbEyebrow>
              <ul className="mt-3 space-y-2 text-[12px]">
                <li className="flex items-center justify-between rounded-[12px] bg-[var(--kb-warm-surface)] p-3">
                  <span>Отправлять за 24 часа до записи</span>
                  <ToggleSwitch />
                </li>
                <li className="flex items-center justify-between rounded-[12px] bg-[var(--kb-warm-surface)] p-3">
                  <span>Отправлять при подтверждении мастером</span>
                  <ToggleSwitch checked />
                </li>
                <li className="flex items-center justify-between rounded-[12px] bg-[var(--kb-warm-surface)] p-3">
                  <span>Отправлять на новый канал, если основной недоступен</span>
                  <ToggleSwitch checked />
                </li>
              </ul>

              <div className="mt-5 flex items-center gap-2">
                <KbButton variant="primary">Сохранить</KbButton>
                <KbButton variant="outline">Отправить тест</KbButton>
              </div>
            </KbCard>
          </div>

          <div className="flex flex-col gap-4">
            <KbCard className="p-5">
              <KbEyebrow>Превью сообщения</KbEyebrow>
              <div className="mt-3 rounded-[20px] bg-[var(--kb-bg)] p-4">
                <div className="flex items-start gap-2">
                  <KbIconTile tone="sky" size={32}>
                    <Send size={14} />
                  </KbIconTile>
                  <div className="flex-1">
                    <div className="text-[11px] text-[var(--kb-text-muted)]">КликБук Бот</div>
                    <div className="mt-1 rounded-[14px] bg-white p-3 text-[13px] leading-relaxed shadow-[var(--kb-shadow-card)]">
                      {text
                        .replace('{{client.name}}', 'Анна')
                        .replace('{{service.name}}', 'окрашивание')
                        .replace('{{booking.date}}', 'завтра')
                        .replace('{{booking.time}}', '14:00')
                        .replace('{{salon.name}}', 'КликБук Studio')
                        .replace('{{master.name}}', 'Алина')}
                    </div>
                  </div>
                </div>
              </div>
            </KbCard>

            <KbCard tone="soft" className="p-5">
              <div className="flex items-center gap-2 text-[var(--kb-coral)]">
                <Bot size={14} />
                <KbEyebrow className="text-[var(--kb-coral)]">КликБук AI</KbEyebrow>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
                Хотите, AI составит шаблон для напоминания за 2 часа? Опишите цель и тон сообщения.
              </p>
              <KbButton variant="primary" className="mt-3 w-full">
                <Sparkles size={12} /> Сгенерировать шаблон
              </KbButton>
            </KbCard>
          </div>
        </div>
      </div>
    </KbShell>
  );
}

function ToggleSwitch({ checked = false }: { checked?: boolean }) {
  const [on, setOn] = useState(checked);
  return (
    <button onClick={() => setOn(!on)} className={`relative h-[22px] w-[42px] rounded-full transition ${on ? 'bg-[var(--kb-coral)]' : 'bg-[var(--kb-border)]'}`}>
      <span className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white transition ${on ? 'left-[22px]' : 'left-[2px]'}`} />
    </button>
  );
}
