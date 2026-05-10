'use client';

import { useMemo, useState } from 'react';
import {
  Calendar,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Send,
  Smile,
  Sparkles,
  Star,
  Users,
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

const QUICK_REPLIES = ['Здравствуйте! 👋', 'Спасибо за обращение 💛', 'Отличного настроения!'];

export default function ChatsPage() {
  const { dataset, ownedProfile } = useOwnedWorkspaceData();
  const [filter, setFilter] = useState<'all' | 'unread' | 'waiting' | 'archive'>('all');
  const [activeIdx, setActiveIdx] = useState(0);

  const clients = dataset?.clients ?? [];
  const active = clients[activeIdx];

  const messages = useMemo(
    () => [
      { from: 'them', time: '14:11', text: 'Здравствуйте! Хочу записаться на окрашивание.' },
      { from: 'me', time: '14:13', text: 'Добрый день, Екатерина! Рады вас видеть. Какая длина волос вас интересует?' },
      { from: 'them', time: '14:14', text: 'Хочу что-то на завтрашний день, чтобы отдохнуть.' },
      { from: 'me', time: '14:18', text: 'Отличный выбор! Могу предложить шатен или балаяж — оба отлично подойдут вашему типу. Есть свободные слоты на 16:00 и 18:30.' },
    ],
    [],
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
            <KbEyebrow>Общайтесь с клиентами, подтверждайте записи и повышайте лояльность</KbEyebrow>
            <KbDisplay level={1} className="mt-3">Чаты</KbDisplay>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KbStatCard label="Новых сообщений" value={8} delta="+12%" icon={<MessageSquare size={18} />} iconTone="peach" />
          <KbStatCard label="Ждут ответа" value={5} caption="более 2 часов" icon={<Phone size={18} />} iconTone="lavender" />
          <KbStatCard label="Активные сегодня" value={42} delta="+18%" icon={<Users size={18} />} iconTone="sage" />
          <KbStatCard label="Средн. время ответа" value="4 мин" delta="−1 мин" icon={<Star size={18} />} iconTone="cream" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
          {/* List */}
          <KbCard className="overflow-hidden p-0">
            <div className="border-b border-[var(--kb-line)] p-4">
              <div className="flex h-10 items-center gap-2 rounded-[12px] border border-[var(--kb-border)] bg-[var(--kb-warm-surface)] px-3">
                <input className="h-full w-full bg-transparent text-[12px] outline-none" placeholder="Поиск по чатам" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {([
                  ['all', 'Все', 24],
                  ['unread', 'Новые', 8],
                  ['waiting', 'Ожидают', 5],
                ] as const).map(([k, label, count]) => (
                  <KbChip key={k} active={filter === k} onClick={() => setFilter(k as typeof filter)} count={count}>
                    {label}
                  </KbChip>
                ))}
              </div>
            </div>
            <ul className="kb-scrollbar max-h-[600px] divide-y divide-[var(--kb-line)] overflow-y-auto">
              {(clients.length ? clients : Array.from({ length: 8 }, (_, i) => ({ id: `${i}`, name: `Клиент ${i + 1}`, note: 'Новое сообщение', segment: 'new' as const })))
                .slice(0, 8)
                .map((c, i) => (
                  <li
                    key={c.id}
                    onClick={() => setActiveIdx(i)}
                    className={`flex cursor-pointer gap-3 px-4 py-3 transition ${
                      activeIdx === i ? 'bg-[var(--kb-coral-soft)]' : 'hover:bg-[var(--kb-warm-surface)]'
                    }`}
                  >
                    <KbAvatar src={null} alt={c.name} fallback={c.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="font-medium text-[var(--kb-text)]">{c.name}</span>
                        <span className="text-[10px] text-[var(--kb-text-muted)]">{14 + i}:0{i}</span>
                      </div>
                      <div className="truncate text-[11px] text-[var(--kb-text-muted)]">
                        {(c as { note?: string }).note ?? 'Подтвердите запись на завтра.'}
                      </div>
                    </div>
                    {i < 3 && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--kb-coral)]" />
                    )}
                  </li>
                ))}
            </ul>
          </KbCard>

          {/* Active conversation */}
          <KbCard className="flex flex-col overflow-hidden p-0">
            <div className="flex items-center gap-3 border-b border-[var(--kb-line)] p-4">
              <KbAvatar src={null} alt={active?.name ?? 'Клиент'} fallback={active?.name} size={42} />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[14px] font-medium">
                  {active?.name ?? 'Екатерина Смирнова'}
                  <KbChip tone="completed">Постоянный</KbChip>
                </div>
                <div className="text-[11px] text-[var(--kb-text-muted)]">
                  +7 905 123-45-67 · Instagram
                </div>
              </div>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--kb-border)] hover:bg-[var(--kb-warm-surface)]">
                <Phone size={14} />
              </button>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--kb-border)] hover:bg-[var(--kb-warm-surface)]">
                <Star size={14} />
              </button>
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--kb-border)] hover:bg-[var(--kb-warm-surface)]">
                <MoreHorizontal size={14} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="text-center text-[10px] uppercase tracking-[0.16em] text-[var(--kb-text-muted)]">Сегодня</div>
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  {m.from === 'them' && <KbAvatar src={null} alt="Client" size={28} />}
                  <div
                    className={`max-w-[420px] rounded-[16px] px-4 py-2.5 text-[13px] leading-relaxed ${
                      m.from === 'me'
                        ? 'bg-[var(--kb-navy)] text-white'
                        : 'bg-[var(--kb-warm-surface)] text-[var(--kb-text)]'
                    }`}
                  >
                    {m.text}
                    <div className={`mt-1 text-[10px] ${m.from === 'me' ? 'text-white/60' : 'text-[var(--kb-text-muted)]'}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--kb-line)] p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((r) => (
                  <KbChip key={r}>{r}</KbChip>
                ))}
                <KbChip>Отправить ссылку на запись</KbChip>
              </div>
              <div className="flex items-center gap-2 rounded-[14px] border border-[var(--kb-border)] bg-[var(--kb-warm-surface)] px-3 py-2">
                <button className="text-[var(--kb-text-muted)]"><Paperclip size={16} /></button>
                <input className="h-9 w-full bg-transparent text-[13px] outline-none" placeholder="Введите сообщение…" />
                <button className="text-[var(--kb-text-muted)]"><Smile size={16} /></button>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--kb-coral)] text-white">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </KbCard>

          {/* Right summary */}
          <KbCard className="p-5">
            <div className="flex items-center gap-3">
              <KbAvatar src={null} alt={active?.name ?? 'Клиент'} fallback={active?.name} size={48} />
              <div>
                <div className="text-[14px] font-medium">{active?.name ?? 'Екатерина Смирнова'}</div>
                <div className="text-[11px] text-[var(--kb-text-muted)]">+7 905 123-45-67</div>
              </div>
            </div>

            <KbDivider className="my-4" />

            <KbEyebrow>Предстоящие записи</KbEyebrow>
            <div className="mt-3 rounded-[14px] bg-[var(--kb-warm-surface)] p-3 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="font-medium">Пт, 23 мая, 16:30</span>
                <KbChip tone="confirmed">Подтверждена</KbChip>
              </div>
              <div className="mt-1 text-[var(--kb-text-muted)]">Окрашивание — 2 ч 30 мин</div>
            </div>

            <KbDivider className="my-4" />

            <KbEyebrow>История визитов</KbEyebrow>
            <ul className="mt-3 space-y-2 text-[12px] text-[var(--kb-text-secondary)]">
              {(active?.bookings ?? Array.from({ length: 3 }, (_, i) => ({ id: `${i}`, date: `${10 - i * 3}.05.2025`, service: 'Окрашивание', status: 'completed', code: '', services: [], time: '' })))
                .slice(0, 3)
                .map((b) => (
                  <li key={b.id} className="flex items-center justify-between">
                    <span>{b.date}</span>
                    <span>{b.service}</span>
                  </li>
                ))}
            </ul>

            <KbDivider className="my-4" />

            <KbEyebrow>Заметка</KbEyebrow>
            <p className="mt-2 rounded-[12px] bg-[var(--kb-warm-surface)] p-3 text-[12px] leading-relaxed text-[var(--kb-text-secondary)]">
              {active?.note || 'Предпочитает медные оттенки и аккуратные плечи.'}
            </p>

            <KbDivider className="my-4" />

            <KbEyebrow>Быстрые действия</KbEyebrow>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <KbButton variant="navy" size="sm">
                <Plus size={12} /> Создать запись
              </KbButton>
              <KbButton variant="outline" size="sm">
                Отправить напоминание
              </KbButton>
            </div>
          </KbCard>
        </div>
      </div>
    </KbShell>
  );
}
