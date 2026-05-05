'use client';

import { Fragment, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, FieldLabel, SectionTitle, Divider, Pill, ScreenHeader,
} from '../primitives/atoms';
import { useMiniData } from '@/hooks/use-mini-data';

export function AnalyticsScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const { REVENUE_WEEK, SERVICES, CLIENTS } = useMiniData();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const total = REVENUE_WEEK.reduce((a, x) => a + x.v, 0);
  const max = Math.max(...REVENUE_WEEK.map((x) => x.v), 1);

  return (
    <div>
      <ScreenHeader title="Аналитика" subtitle="Выручка, конверсия, топы." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill active={period === 'week'} onClick={() => setPeriod('week')}>Неделя</Pill>
          <Pill active={period === 'month'} onClick={() => setPeriod('month')}>Месяц</Pill>
          <Pill active={period === 'year'} onClick={() => setPeriod('year')}>Год</Pill>
        </div>

        <Card>
          <FieldLabel>Выручка</FieldLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <div style={{ fontSize: 32, fontWeight: 600, color: T.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              {total.toLocaleString('ru-RU')} ₽
            </div>
            <div style={{ fontSize: 12, color: T.success, fontVariantNumeric: 'tabular-nums' }}>+18%</div>
          </div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 4 }}>За неделю · средний чек 2 280 ₽</div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 24, height: 110 }}>
            {REVENUE_WEEK.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 6, height: `${(b.v / max) * 100}%`, borderRadius: 3,
                  background: b.active ? T.accent : T.text3,
                  opacity: b.active ? 1 : 0.6,
                }} />
                <span style={{ fontSize: 10, color: b.active ? T.text : T.text3 }}>{b.d}</span>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <MetricCard label="Записей" value="38" sub="+6 к прошлой" />
          <MetricCard label="Средний чек" value="2 280 ₽" sub="+4%" valueSize={20} />
          <MetricCard label="Конверсия" value="62%" sub="ссылка → визит" />
          <MetricCard label="Повторные" value="71%" sub="клиенты" />
          <MetricCard label="Просмотры" value="412" sub="страницы" />
          <MetricCard label="Отмены" value="3%" sub="за неделю" />
        </div>

        <div>
          <SectionTitle title="Топ-5 услуг" subtitle="По выручке за период." />
          <Card padded={false}>
            {SERVICES.slice(0, 5).map((s, i) => (
              <Fragment key={s.n}>
                <TopRow rank={i + 1} title={s.name} value={`${(s.price * s.count).toLocaleString('ru-RU')} ₽`} pct={s.popularity} />
                {i < 4 && <Divider />}
              </Fragment>
            ))}
          </Card>
        </div>

        <div>
          <SectionTitle title="Топ-5 клиентов" subtitle="По сумме за всё время." />
          <Card padded={false}>
            {CLIENTS.slice(0, 5).map((c, i) => (
              <Fragment key={i}>
                <TopRow rank={i + 1} title={c.name} value={`${c.total.toLocaleString('ru-RU')} ₽`} pct={c.total / 30000} />
                {i < 4 && <Divider />}
              </Fragment>
            ))}
          </Card>
        </div>
      </div>
    </div>
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

function TopRow({ rank, title, value, pct }: { rank: number; title: string; value: string; pct: number }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums', minWidth: 18 }}>#{rank}</span>
        <span style={{ fontSize: 14, color: T.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        <span style={{ fontSize: 13, color: T.text, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{value}</span>
      </div>
      <div style={{ height: 2, background: T.skeleton, borderRadius: 2, overflow: 'hidden', marginLeft: 30 }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: T.accent }} />
      </div>
    </div>
  );
}
