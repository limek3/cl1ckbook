'use client';

import { Fragment } from 'react';
import { useTheme } from '../theme';
import { Card, Divider, NeutralBtn } from '../primitives/atoms';
import { type Service } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';

export function ServicesScreen() {
  const { T } = useTheme();
  const { SERVICES } = useMiniData();
  return (
    <div style={{ padding: '20px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>Услуги</div>
        <div style={{ fontSize: 13, color: T.text2, marginTop: 2 }}>
          {SERVICES.length} активных · {SERVICES.reduce((s, x) => s + x.count, 0)} записей за месяц.
        </div>
      </div>
      <NeutralBtn icon="plus" full>Добавить услугу</NeutralBtn>
      <Card padded={false}>
        {SERVICES.map((s, i) => (
          <Fragment key={s.n}>
            <ServiceRowFull s={s} />
            {i < SERVICES.length - 1 && <Divider />}
          </Fragment>
        ))}
      </Card>
    </div>
  );
}

function ServiceRowFull({ s }: { s: Service }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums', minWidth: 20 }}>#{s.n}</span>
        <span style={{ fontSize: 15, color: T.text, flex: 1, letterSpacing: '-0.01em' }}>{s.name}</span>
        <span style={{ fontSize: 15, color: T.text, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
          {s.price.toLocaleString('ru-RU')} ₽
        </span>
      </div>
      <div style={{ height: 2, background: T.skeleton, borderRadius: 2, overflow: 'hidden', marginBottom: 8, marginLeft: 32 }}>
        <div style={{ height: '100%', width: `${s.popularity * 100}%`, background: T.accent }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: 32 }}>
        <span style={{ fontSize: 11, color: T.text3 }}>{s.count} записей · {s.duration} мин</span>
        <span style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums' }}>{Math.round(s.popularity * 100)}%</span>
      </div>
    </div>
  );
}
