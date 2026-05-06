'use client';

import { Fragment, useMemo, useState } from 'react';
import { useTheme } from '../theme';
import { Card, Divider, Avatar, Icon } from '../primitives/atoms';
import { ClientDetailSheet } from '../sheets/detail-sheets';
import { type Client } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';
import { useMiniToast } from '../bridge';

export function ClientsScreen({ go }: { go?: (kind: string) => void }) {
  const { T } = useTheme();
  const { CLIENTS } = useMiniData();
  const { show } = useMiniToast();
  const [q, setQ] = useState('');
  const [active, setActive] = useState<Client | null>(null);
  const filtered = useMemo(() => CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  ), [q, CLIENTS]);

  return (
    <div style={{ padding: '20px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>Клиенты</div>
        <div style={{ fontSize: 13, color: T.text2, marginTop: 2 }}>
          {CLIENTS.length} человек · {CLIENTS.reduce((a, c) => a + c.visits, 0)} визитов всего.
        </div>
      </div>

      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
        boxShadow: T.cardShadow, padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon name="search" size={16} color={T.text3} />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по имени или телефону"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: T.text, fontSize: 14, fontFamily: 'inherit',
          }}
        />
        {q && (
          <button onClick={() => setQ('')} style={{ background: 'transparent', border: 'none', color: T.text3, cursor: 'pointer', padding: 0, display: 'flex' }}>
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      <Card padded={false}>
        {filtered.map((c, i) => (
          <Fragment key={i}>
            <ClientRow client={c} onClick={() => setActive(c)} />
            {i < filtered.length - 1 && <Divider />}
          </Fragment>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: T.text3, fontSize: 13 }}>Никого не найдено</div>
        )}
      </Card>
      <ClientDetailSheet
        client={active}
        onClose={() => setActive(null)}
        onChat={() => { setActive(null); go?.('chats'); }}
        onBook={() => { setActive(null); show('Создание записи скоро', 'info'); }}
      />
    </div>
  );
}

function ClientRow({ client, onClick }: { client: Client; onClick?: () => void }) {
  const { T } = useTheme();
  return (
    <div onClick={onClick} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
      <Avatar name={client.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
        <div style={{ fontSize: 12, color: T.text2, fontVariantNumeric: 'tabular-nums' }}>{client.phone}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, color: T.text, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
          {client.total.toLocaleString('ru-RU')} ₽
        </div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
          {client.visits} визитов
        </div>
      </div>
    </div>
  );
}
