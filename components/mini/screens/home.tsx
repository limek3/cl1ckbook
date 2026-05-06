'use client';

import { Fragment, useMemo, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, FieldLabel, SectionTitle, Divider, StatusDot, Icon,
} from '../primitives/atoms';
import { type Appointment, type Client, type Service } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';
import { useChats } from '@/hooks/use-chats';
import { ClientDetailSheet } from '../sheets/detail-sheets';
import { useMiniToast } from '../bridge';

function localIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return localIso(d);
}

function apptMs(a: Appointment) {
  const ms = new Date(`${a.date ?? todayIso()}T${a.time || '00:00'}:00`).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function dateTimeLabel(a?: Appointment | null) {
  if (!a) return '—';
  const date = a.date
    ? new Date(`${a.date}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    : '';
  return `${date}${date ? ' · ' : ''}${a.time}`;
}

export function HomeScreen({ go }: { go: (kind: string) => void }) {
  const { T } = useTheme();
  const { APPOINTMENTS, SERVICES, CLIENTS, MASTER } = useMiniData();
  const { threads } = useChats();
  const { show } = useMiniToast();
  const [copied, setCopied] = useState(false);
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  const today = todayIso();
  const now = Date.now();
  const todayAppointments = APPOINTMENTS.filter((a) => a.date === today && a.rawStatus !== 'cancelled' && a.rawStatus !== 'no_show');
  const upcoming = useMemo(
    () => APPOINTMENTS
      .filter((a) => a.rawStatus !== 'completed' && a.rawStatus !== 'cancelled' && a.rawStatus !== 'no_show')
      .filter((a) => apptMs(a) >= now - 15 * 60 * 1000)
      .sort((a, b) => apptMs(a) - apptMs(b)),
    [APPOINTMENTS, now],
  );
  const next = upcoming[0] ?? null;
  const queue = upcoming.slice(1, 4);
  const topServices = [...SERVICES].sort((a, b) => (b.revenue ?? b.price * b.count) - (a.revenue ?? a.price * a.count)).slice(0, 3);
  const unreadTotal = threads.reduce((sum, thread) => sum + thread.unread, 0);

  const copy = async () => {
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}${MASTER.link}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(link);
      }
      setCopied(true);
      show('Ссылка скопирована', 'success');
      setTimeout(() => setCopied(false), 1400);
    } catch {
      show('Не удалось скопировать', 'error');
    }
  };

  function openClient(appt: Appointment) {
    const found = CLIENTS.find((c) => c.phone && c.phone === appt.phone) ?? CLIENTS.find((c) => c.name === appt.name);
    setActiveClient(found ?? { name: appt.name, phone: appt.phone, visits: 0, total: 0 });
  }

  const chevBtn = {
    background: 'transparent', border: 'none', color: T.text2,
    fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px',
  } as const;

  return (
    <div style={{ padding: '20px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>Кабинет</div>
        <div style={{ fontSize: 13, color: T.text2, marginTop: 2 }}>Записи, ссылка, метрики.</div>
      </div>

      <Card>
        <FieldLabel>Персональная ссылка</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: T.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
            {MASTER.link || '/m/admin'}
          </div>
          <button onClick={copy} style={{
            background: 'transparent', border: `1px solid ${T.borderStrong}`, borderRadius: 10,
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: copied ? T.accent : T.text2, cursor: 'pointer', padding: 0,
          }}>
            <Icon name={copied ? 'check' : 'copy'} size={16} />
          </button>
        </div>
        <div style={{ fontSize: 12, color: T.text2, marginTop: 12, lineHeight: 1.5 }}>
          Отправляйте клиентам или закрепите в Telegram / Instagram.
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MetricCard label="Записей сегодня" value={String(todayAppointments.length)} sub="активных" />
        <MetricCard label="Клиенты" value={String(CLIENTS.length)} sub="база" />
        <MetricCard label="Услуги" value={String(SERVICES.filter((s) => s.visible !== false && s.status !== 'draft').length)} sub="активных" />
        <MetricCard
          label="Визиты"
          value={String(CLIENTS.reduce((a, c) => a + c.visits, 0))}
          sub="суммарно"
        />
      </div>

      <div>
        <SectionTitle title="Ближайшая запись" subtitle="Клиент в фокусе и очередь после него."
          right={<button onClick={() => go('appts')} style={chevBtn}>Все <Icon name="chevron-right" size={12} /></button>} />
        <Card padded={false} style={{ overflow: 'hidden' }}>
          <div
            onClick={() => next && openClient(next)}
            style={{ position: 'relative', padding: '20px 20px 18px', cursor: next ? 'pointer' : 'default' }}
          >
            <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 2, background: next ? T.accent : T.border }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: next ? T.accent : T.text3 }} />
                <span style={{ fontSize: 12, color: T.text2 }}>{next ? 'В фокусе' : 'Очередь пуста'}</span>
              </div>
              <div style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums' }}>{dateTimeLabel(next)}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {next?.name ?? 'Записей пока нет'}
            </div>
            <div style={{ fontSize: 13, color: T.text2 }}>{next?.service ?? 'Новые бронирования появятся здесь автоматически'}</div>
          </div>
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <KVItem k="Слот" v={dateTimeLabel(next)} />
            <KVItem k="Статус" v={next?.statusLabel ?? '—'} right />
          </div>
        </Card>
      </div>

      <div>
        <SectionTitle title="Очередь" subtitle="Следующие активные записи."
          right={<button onClick={() => go('appts')} style={chevBtn}>Открыть <Icon name="chevron-right" size={12} /></button>} />
        <Card padded={false}>
          {queue.length > 0 ? queue.map((a, i) => (
            <Fragment key={a.id ?? `${a.date}-${a.time}-${i}`}>
              <QueueRow appt={a} onClick={() => openClient(a)} />
              {i < queue.length - 1 && <Divider />}
            </Fragment>
          )) : (
            <EmptyRow text="Очередь свободна" />
          )}
        </Card>
      </div>

      <div>
        <SectionTitle title="Топ-услуги" subtitle="Что чаще выбирают клиенты."
          right={<button onClick={() => go('services')} style={chevBtn}>Все <Icon name="chevron-right" size={12} /></button>} />
        <Card padded={false}>
          {topServices.length > 0 ? topServices.map((s, i) => (
            <Fragment key={s.id ?? s.n}>
              <ServiceRowCompact s={s} />
              {i < topServices.length - 1 && <Divider />}
            </Fragment>
          )) : (
            <EmptyRow text="Добавьте первую услугу" />
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ShortcutCard icon="message-square" label="Чаты" sub={unreadTotal > 0 ? `${unreadTotal} непрочитанных` : 'нет новых'} onClick={() => go('chats')} />
        <ShortcutCard icon="bar-chart-3" label="Аналитика" sub="за неделю" onClick={() => go('analytics')} />
      </div>

      <ClientDetailSheet
        client={activeClient}
        onClose={() => setActiveClient(null)}
        onChat={() => { setActiveClient(null); go('chats'); }}
        onBook={() => { setActiveClient(null); show('Создание записи скоро', 'info'); }}
      />
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  const { T } = useTheme();
  return <div style={{ padding: 22, textAlign: 'center', color: T.text3, fontSize: 13 }}>{text}</div>;
}

function ShortcutCard({ icon, label, sub, onClick }: { icon: string; label: string; sub: string; onClick: () => void }) {
  const { T } = useTheme();
  return (
    <button onClick={onClick} style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      boxShadow: T.cardShadow, padding: '14px 16px', textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer',
      fontFamily: 'inherit', color: T.text,
    }}>
      <Icon name={icon} size={18} color={T.text2} />
      <div>
        <div style={{ fontSize: 14, color: T.text }}>{label}</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}

function MetricCard({ label, value, sub, valueSize = 26 }: { label: string; value: string; sub: string; valueSize?: number }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      boxShadow: T.cardShadow, padding: '16px 16px 14px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ fontSize: valueSize, fontWeight: 600, color: T.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: T.text2 }}>{sub}</div>
    </div>
  );
}

function KVItem({ k, v, right }: { k: string; v: string; right?: boolean }) {
  const { T } = useTheme();
  return (
    <div style={{
      padding: '14px 20px',
      borderRight: !right ? `1px solid ${T.border}` : 'none',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <FieldLabel>{k}</FieldLabel>
      <div style={{ fontSize: 13, color: T.text, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
    </div>
  );
}

function QueueRow({ appt, onClick }: { appt: Appointment; onClick?: () => void }) {
  const { T } = useTheme();
  return (
    <div onClick={onClick} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ minWidth: 54 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{appt.time}</div>
        <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{appt.dateLabel}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.name}</div>
        <div style={{ fontSize: 11, color: T.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.service}</div>
      </div>
      <StatusDot status={appt.status} />
    </div>
  );
}

function ServiceRowCompact({ s }: { s: Service }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums', minWidth: 18 }}>#{s.n}</span>
        <span style={{ fontSize: 14, color: T.text, flex: 1 }}>{s.name}</span>
        <span style={{ fontSize: 14, color: T.text, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{s.price.toLocaleString('ru-RU')} ₽</span>
      </div>
      <div style={{ height: 2, background: T.skeleton, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${Math.min(Math.max(s.popularity, 0), 1) * 100}%`, background: T.accent }} />
      </div>
      <div style={{ fontSize: 11, color: T.text3 }}>{s.count} записей · {s.duration} мин</div>
    </div>
  );
}
