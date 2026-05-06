'use client';

import { Fragment, useMemo, useState } from 'react';
import { useTheme } from '../theme';
import { Card, Divider, Avatar, EmptyState, SearchBox } from '../primitives/atoms';
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

      <SearchBox value={q} onChange={setQ} placeholder="Поиск по имени или телефону" />

      <Card padded={false}>
        {filtered.map((c, i) => (
          <Fragment key={i}>
            <ClientRow client={c} onClick={() => setActive(c)} />
            {i < filtered.length - 1 && <Divider />}
          </Fragment>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 16 }}>
            <EmptyState
              icon={q ? 'search-x' : 'users'}
              title={q ? 'Никого не найдено' : 'Клиентов пока нет'}
              text={q ? 'Проверь имя или номер телефона.' : 'Клиенты появятся после первых записей из формы, Telegram или ВК.'}
            />
          </div>
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
