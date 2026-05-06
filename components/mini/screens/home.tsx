'use client';

import { Fragment, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, FieldLabel, SectionTitle, Divider, StatusDot, Icon, ListRow,
} from '../primitives/atoms';
import { type Appointment, type Client, type Service } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';
import { ClientDetailSheet } from '../sheets/detail-sheets';

export function HomeScreen({ go }: { go: (kind: string) => void }) {
  const { T } = useTheme();
  const { APPOINTMENTS, SERVICES, CLIENTS } = useMiniData();
  const [copied, setCopied] = useState(false);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 1400); };

  function openClient(appt: Appointment) {
    const found = CLIENTS.find((c) => c.name === appt.name);
    setActiveClient(found ?? { name: appt.name, phone: appt.phone, visits: 0, total: 0 });
  }
  const next = APPOINTMENTS[0];
  const queue = APPOINTMENTS.slice(1, 4);
  const topServices = SERVICES.slice(0, 3);

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
          <div style={{ fontSize: 30, fontWeight: 600, color: T.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            /m/admin
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
        <MetricCard label="Конверсия" value="100%" sub="конверсия" />
        <MetricCard label="Новые клиенты" value="7" sub="за 30 дней" />
        <MetricCard label="Источник" value="Web" sub="клиенты" valueSize={20} />
        <MetricCard label="Визиты" value="7" sub="всего" />
      </div>

      <div>
        <SectionTitle title="Ближайшая запись" subtitle="Клиент в фокусе и очередь после него."
          right={<button onClick={() => go('appts')} style={chevBtn}>Все <Icon name="chevron-right" size={12} /></button>} />
        <Card padded={false} style={{ overflow: 'hidden' }}>
          <div
            onClick={() => next && openClient(next)}
            style={{ position: 'relative', padding: '20px 20px 18px', cursor: next ? 'pointer' : 'default' }}
          >
            <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 2, background: T.accent }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
                <span style={{ fontSize: 12, color: T.text2 }}>В фокусе</span>
              </div>
              <div style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums' }}>4 мая · 10:00</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {next?.name ?? '—'}
            </div>
            <div style={{ fontSize: 13, color: T.text2 }}>{next?.service ?? 'Записей пока нет'}</div>
          </div>
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <KVItem k="Слот" v="4 мая · 10:00" />
            <KVItem k="Статус" v="Запланирована" right />
          </div>
        </Card>
      </div>

      <div>
        <SectionTitle title="Очередь" subtitle="Следующие записи на сегодня."
          right={<button onClick={() => go('appts')} style={chevBtn}>Открыть <Icon name="chevron-right" size={12} /></button>} />
        <Card padded={false}>
          {queue.map((a, i) => (
            <Fragment key={i}>
              <QueueRow appt={a} onClick={() => openClient(a)} />
              {i < queue.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Card>
      </div>

      <div>
        <SectionTitle title="Топ-услуги" subtitle="Что чаще выбирают клиенты."
          right={<button onClick={() => go('services')} style={chevBtn}>Все <Icon name="chevron-right" size={12} /></button>} />
        <Card padded={false}>
          {topServices.map((s, i) => (
            <Fragment key={s.n}>
              <ServiceRowCompact s={s} />
              {i < topServices.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ShortcutCard icon="message-square" label="Чаты" sub="3 непрочитанных" onClick={() => go('chats')} />
        <ShortcutCard icon="bar-chart-3" label="Аналитика" sub="за неделю" onClick={() => go('analytics')} />
      </div>

      <ClientDetailSheet client={activeClient} onClose={() => setActiveClient(null)} />
    </div>
  );
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
      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', minWidth: 44 }}>
        {appt.time}
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
        <div style={{ height: '100%', width: `${s.popularity * 100}%`, background: T.accent }} />
      </div>
      <div style={{ fontSize: 11, color: T.text3 }}>{s.count} записей · {s.duration} мин</div>
    </div>
  );
}
