'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Home,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  User,
  Users,
  XCircle,
} from 'lucide-react';

import {
  KbAvatar,
  KbButton,
  KbCard,
  KbChip,
  KbDisplay,
  KbEyebrow,
  KbIconTile,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

type MiniTab = 'home' | 'bookings' | 'clients' | 'profile';

const TABS: { key: MiniTab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Главная', icon: Home },
  { key: 'bookings', label: 'Записи', icon: Calendar },
  { key: 'clients', label: 'Клиенты', icon: Users },
  { key: 'profile', label: 'Профиль', icon: User },
];

export default function MiniAppPage() {
  const [tab, setTab] = useState<MiniTab>('home');

  return (
    <div className="klikbook-scope kb-shell relative mx-auto flex min-h-screen max-w-[420px] flex-col">
      {/* status header */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-[var(--kb-bg)] px-5 pb-3 pt-5">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--kb-text)]">
          <span className="kb-display text-[18px]">КликБук</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--kb-text-muted)]">мини-приложение</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <Bell size={15} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--kb-coral)]" />
          </button>
          <KbAvatar src={null} alt="Алина" fallback="Алина" size={32} />
        </div>
      </header>

      <main className="flex-1 px-5 pb-32">
        {tab === 'home' && <HomeTab />}
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'clients' && <ClientsTab />}
        {tab === 'profile' && <ProfileTab />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[420px] -translate-x-1/2 border-t border-[var(--kb-line)] bg-[var(--kb-bg)]/90 backdrop-blur">
        <div className="relative grid grid-cols-4 gap-1 px-3 pb-5 pt-3">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-col items-center gap-1 text-[10px] ${
                  active ? 'text-[var(--kb-coral)]' : 'text-[var(--kb-text-muted)]'
                }`}
              >
                <t.icon size={20} />
                {t.label}
              </button>
            );
          })}
          <button className="absolute -top-7 left-1/2 inline-flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--kb-coral)] text-white shadow-[var(--kb-shadow-elev)]">
            <Plus size={22} />
          </button>
        </div>
      </nav>
    </div>
  );
}

function HomeTab() {
  const { ownedProfile, locale, dataset, bookings } = useOwnedWorkspaceData();
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Доброе утро';
    if (h < 18) return 'Добрый день';
    return 'Добрый вечер';
  })();

  return (
    <div className="space-y-4">
      <section>
        <KbEyebrow>Сегодня</KbEyebrow>
        <KbDisplay level={2} className="mt-2">
          {greeting},<br />
          <span className="italic">{ownedProfile?.name?.split(' ')[0] ?? 'Алина'}</span>
        </KbDisplay>
        <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
          Сегодня у вас 8 записей и хороший темп по выручке.
        </p>
      </section>

      <div className="grid grid-cols-4 gap-2">
        <MiniStat tone="cream" icon={<Clock size={14} />} value={8} label="Сегодня" />
        <MiniStat tone="lavender" icon={<CheckCircle2 size={14} />} value={24} label="Подтверждены" />
        <MiniStat tone="sage" icon={<Send size={14} />} value={11} label="Завершены" />
        <MiniStat tone="peach" icon={<XCircle size={14} />} value={2} label="Отмены" />
      </div>

      <KbCard tone="dark" className="!p-5">
        <KbEyebrow className="text-white/60">Выручка сегодня</KbEyebrow>
        <div className="kb-metric mt-2 text-[28px] text-white">
          {formatCurrency(42800, locale)}
        </div>
        <div className="mt-1 text-[12px] text-[#7DCB9C]">+18% к среднему дню</div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-white/60">
          <div>
            <div>Выручка сейчас</div>
            <div className="kb-metric mt-1 text-[14px] text-white">{formatCurrency(18450, locale)}</div>
          </div>
          <div>
            <div>Средний чек</div>
            <div className="kb-metric mt-1 text-[14px] text-white">{formatCurrency(3280, locale)}</div>
          </div>
          <div>
            <div>Ожидают</div>
            <div className="kb-metric mt-1 text-[14px] text-white">1</div>
          </div>
        </div>
      </KbCard>

      <section>
        <div className="flex items-center justify-between">
          <KbEyebrow>Ближайшие записи</KbEyebrow>
          <button className="text-[11px] text-[var(--kb-text-muted)]">Все</button>
        </div>
        <ul className="mt-2 space-y-2">
          {(bookings ?? []).slice(0, 3).map((b) => (
            <li key={b.id} className="flex items-center gap-3 rounded-[16px] bg-white p-3 shadow-[var(--kb-shadow-card)]">
              <span className="kb-metric w-12 text-[12px] tabular-nums text-[var(--kb-text-muted)]">{b.time}</span>
              <KbAvatar src={null} alt={b.clientName} fallback={b.clientName} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium">{b.clientName}</div>
                <div className="truncate text-[11px] text-[var(--kb-text-muted)]">{b.service}</div>
              </div>
              <KbChip tone="pending" className="text-[10px]">Подтвердить</KbChip>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-4 gap-2 text-center">
        <QuickAction icon={<Plus size={16} />} label="Новая запись" tone="coral" />
        <QuickAction icon={<User size={16} />} label="Клиент" tone="lavender" />
        <QuickAction icon={<Sparkles size={16} />} label="Акция" tone="cream" />
        <QuickAction icon={<MessageCircle size={16} />} label="Чат" tone="sage" />
      </div>

      <KbCard tone="soft" className="!p-4">
        <div className="flex items-center gap-2 text-[var(--kb-coral)]">
          <Sparkles size={12} />
          <KbEyebrow className="text-[var(--kb-coral)]">КликБук AI</KbEyebrow>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed">
          Похоже, спрос на окрашивание растёт по пятницам. Рекомендуем добавить 2 слота — это поднимет загрузку на ~12%.
        </p>
      </KbCard>
    </div>
  );
}

function BookingsTab() {
  const { bookings, locale } = useOwnedWorkspaceData();
  const [tab, setTab] = useState<'pending' | 'completed' | 'cancelled'>('pending');

  const list = (bookings ?? []).filter((b) => {
    if (tab === 'pending') return b.status === 'new' || b.status === 'confirmed';
    if (tab === 'completed') return b.status === 'completed';
    return b.status === 'cancelled' || b.status === 'no_show';
  });

  return (
    <div>
      <KbDisplay level={2}>Записи</KbDisplay>
      <div className="mt-4 flex gap-2">
        <KbChip active={tab === 'pending'} onClick={() => setTab('pending')} count={list.length}>
          Предстоят
        </KbChip>
        <KbChip active={tab === 'completed'} onClick={() => setTab('completed')} count={5}>
          Завершены
        </KbChip>
        <KbChip active={tab === 'cancelled'} onClick={() => setTab('cancelled')} count={2}>
          Отменены
        </KbChip>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            className={`flex h-[60px] min-w-[56px] flex-col items-center justify-center rounded-[14px] px-2 text-[11px] ${
              i === 2 ? 'bg-[var(--kb-navy)] text-white' : 'border border-[var(--kb-border)] bg-white'
            }`}
          >
            <span className={i === 2 ? 'text-white/60' : 'text-[var(--kb-text-muted)]'}>{['Пн', 'Вт', 'Ср', 'Чт', 'Пт'][i]}</span>
            <span className="kb-metric mt-1 text-[16px]">{19 + i}</span>
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {list.slice(0, 8).map((b) => (
          <li key={b.id} className="flex items-center gap-3 rounded-[16px] bg-white p-3 shadow-[var(--kb-shadow-card)]">
            <KbAvatar src={null} alt={b.clientName} fallback={b.clientName} size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium">{b.clientName}</div>
              <div className="text-[11px] text-[var(--kb-text-muted)]">{b.service} · {b.time}</div>
            </div>
            <span className="kb-metric text-[12px]">
              {b.priceAmount ? formatCurrency(b.priceAmount, locale) : '—'}
            </span>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-[16px] bg-white p-6 text-center text-[12px] text-[var(--kb-text-muted)]">
            Нет записей в этой категории
          </li>
        )}
      </ul>
    </div>
  );
}

function ClientsTab() {
  const { dataset } = useOwnedWorkspaceData();
  return (
    <div>
      <KbDisplay level={2}>Клиенты</KbDisplay>
      <div className="mt-4 flex h-10 items-center gap-2 rounded-[14px] border border-[var(--kb-border)] bg-white px-3">
        <input className="h-full w-full bg-transparent text-[12px] outline-none" placeholder="Поиск" />
      </div>
      <ul className="mt-4 space-y-2">
        {(dataset?.clients ?? []).slice(0, 8).map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-[16px] bg-white p-3 shadow-[var(--kb-shadow-card)]">
            <KbAvatar src={null} alt={c.name} fallback={c.name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium">{c.name}</div>
              <div className="text-[11px] text-[var(--kb-text-muted)]">{c.phone}</div>
            </div>
            <ChevronRight size={14} className="text-[var(--kb-text-muted)]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileTab() {
  const { ownedProfile, locale } = useOwnedWorkspaceData();
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] bg-white p-5 text-center shadow-[var(--kb-shadow-card)]">
        <div className="flex justify-center">
          <KbAvatar src={ownedProfile?.avatar ?? null} alt={ownedProfile?.name ?? 'Профиль'} fallback={ownedProfile?.name} size={72} />
        </div>
        <KbDisplay level={3} className="mt-3">{ownedProfile?.name ?? 'Алина Иванова'}</KbDisplay>
        <div className="text-[12px] text-[var(--kb-text-muted)]">{ownedProfile?.profession ?? 'Владелец салона'}</div>
        <div className="mt-3 flex justify-center gap-2">
          <KbChip tone="completed">PRO</KbChip>
          <KbChip>Studio Shine</KbChip>
        </div>
      </section>

      <KbCard className="!p-5">
        <KbEyebrow>Подписка</KbEyebrow>
        <KbDisplay level={3} className="mt-2">Профессиональный</KbDisplay>
        <div className="kb-metric mt-2 text-[24px]">{formatCurrency(4900, locale)}<span className="text-[12px] text-[var(--kb-text-muted)]">/мес</span></div>
        <div className="mt-3 space-y-2 text-[12px]">
          <UsageRow label="Записи" used={220} total={300} />
          <UsageRow label="Клиенты" used={847} total={1000} />
        </div>
        <KbButton variant="primary" className="mt-4 w-full">Управление подпиской</KbButton>
      </KbCard>

      <KbCard className="!p-0">
        <ul className="divide-y divide-[var(--kb-line)] text-[13px]">
          {['Уведомления', 'Безопасность', 'Платежи и карты', 'Поддержка', 'Промокод', 'Выйти из аккаунта'].map((label) => (
            <li key={label}>
              <button className="flex w-full items-center justify-between px-5 py-4 text-left">
                <span>{label}</span>
                <ChevronRight size={14} className="text-[var(--kb-text-muted)]" />
              </button>
            </li>
          ))}
        </ul>
      </KbCard>
    </div>
  );
}

function MiniStat({ tone, icon, value, label }: { tone: 'cream' | 'lavender' | 'sage' | 'peach'; icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className={`kb-bg-${tone} rounded-[16px] p-3 text-[var(--kb-text)]`}>
      <span className="opacity-70">{icon}</span>
      <div className="kb-metric mt-2 text-[18px]">{value}</div>
      <div className="text-[10px] text-[var(--kb-text-muted)]">{label}</div>
    </div>
  );
}

function QuickAction({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: 'coral' | 'lavender' | 'cream' | 'sage' }) {
  return (
    <button className="rounded-[16px] bg-white p-3 text-center shadow-[var(--kb-shadow-card)]">
      <KbIconTile tone={tone} size={36} className="mx-auto">{icon}</KbIconTile>
      <div className="mt-2 text-[10px]">{label}</div>
    </button>
  );
}

function UsageRow({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div>
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[var(--kb-text-muted)]">{used} / {total}</span>
      </div>
      <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
        <span className="block h-full rounded-full bg-[var(--kb-coral)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
