'use client';

import { Fragment, useState } from 'react';
import { useTheme } from '../theme';
import { Card, Divider, NeutralBtn } from '../primitives/atoms';
import { ServiceDetailSheet } from '../sheets/detail-sheets';
import { type Service } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';
import { useMiniToast } from '../bridge';

export function ServicesScreen() {
  const { T } = useTheme();
  const { SERVICES, updateSection } = useMiniData();
  const { show } = useMiniToast();
  const [active, setActive] = useState<Service | null>(null);

  async function persistAll(list: Service[]) {
    const ok = await updateSection('services', list.map((s) => ({
      n: s.n,
      name: s.name,
      price: s.price,
      duration: s.duration,
      popularity: s.popularity,
      count: s.count,
    })));
    if (!ok) show('Не удалось сохранить', 'error');
  }

  async function saveOne(next: Service) {
    const exists = SERVICES.some((s) => s.n === next.n);
    const list = exists ? SERVICES.map((s) => (s.n === next.n ? next : s)) : [...SERVICES, next];
    show('Сохранено', 'success');
    await persistAll(list);
  }

  async function removeOne(s: Service) {
    const list = SERVICES.filter((x) => x.n !== s.n);
    show('Удалено', 'success');
    await persistAll(list);
  }

  async function addNew() {
    const nextN = (SERVICES.reduce((m, s) => Math.max(m, s.n), 0) || 0) + 1;
    const draft: Service = {
      n: nextN, name: 'Новая услуга', price: 1000, duration: 60, popularity: 0, count: 0,
    };
    await persistAll([...SERVICES, draft]);
    show('Услуга добавлена', 'success');
    setActive(draft);
  }

  return (
    <div style={{ padding: '20px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>Услуги</div>
        <div style={{ fontSize: 13, color: T.text2, marginTop: 2 }}>
          {SERVICES.length} активных · {SERVICES.reduce((s, x) => s + x.count, 0)} записей за месяц.
        </div>
      </div>
      <NeutralBtn icon="plus" full onClick={addNew}>Добавить услугу</NeutralBtn>
      <Card padded={false}>
        {SERVICES.map((s, i) => (
          <Fragment key={s.n}>
            <ServiceRowFull s={s} onClick={() => setActive(s)} />
            {i < SERVICES.length - 1 && <Divider />}
          </Fragment>
        ))}
      </Card>
      <ServiceDetailSheet
        service={active}
        onClose={() => setActive(null)}
        onSave={saveOne}
        onDelete={removeOne}
      />
    </div>
  );
}

function ServiceRowFull({ s, onClick }: { s: Service; onClick: () => void }) {
  const { T } = useTheme();
  return (
    <div onClick={onClick} style={{ padding: '18px 20px', cursor: 'pointer' }}>
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
