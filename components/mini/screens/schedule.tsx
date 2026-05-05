'use client';

import { Fragment, useEffect, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, FieldLabel, SectionTitle, Divider, Toggle, NeutralBtn, ScreenHeader, BottomSheet,
} from '../primitives/atoms';
import { type ScheduleDay } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';

export function ScheduleScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const { SCHEDULE, updateSection } = useMiniData();
  const [scheduleMode, setScheduleMode] = useState<'free' | 'template'>('template');
  const [days, setDays] = useState<ScheduleDay[]>(SCHEDULE);
  const [openDay, setOpenDay] = useState<number | null>(null);

  useEffect(() => { setDays(SCHEDULE); }, [SCHEDULE]);

  const setDay = (i: number, patch: Partial<ScheduleDay>) => {
    const next = days.map((d, j) => (j === i ? { ...d, ...patch } : d));
    setDays(next);
    // Persist to backend (workspaceData.availability)
    updateSection('availability', next.map((d, idx) => ({
      weekday: idx,
      label: d.d,
      enabled: d.on,
      startTime: d.on ? d.from : null,
      endTime: d.on ? d.to : null,
    })));
  };

  const opts = [
    { id: 'free' as const, label: 'Свободный' },
    { id: 'template' as const, label: 'По шаблону' },
  ];

  return (
    <div>
      <ScreenHeader title="График работы" subtitle="Дни и часы приёма." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
          boxShadow: T.cardShadow,
        }}>
          {opts.map((opt) => (
            <button key={opt.id} onClick={() => setScheduleMode(opt.id)} style={{
              padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: scheduleMode === opt.id ? T.cardElev : 'transparent',
              color: scheduleMode === opt.id ? T.text : T.text2,
              fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
              boxShadow: scheduleMode === opt.id && T.cardShadow !== 'none' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}>{opt.label}</button>
          ))}
        </div>

        <div>
          <SectionTitle title="Расписание" subtitle="Тапни день, чтобы изменить часы." />
          <Card padded={false}>
            {days.map((d, i) => (
              <Fragment key={d.d}>
                <div onClick={() => d.on && setOpenDay(i)} style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: d.on ? 'pointer' : 'default', opacity: d.on ? 1 : 0.5,
                }}>
                  <div style={{ minWidth: 30, fontSize: 13, color: T.text2, fontWeight: 500 }}>{d.d}</div>
                  <div style={{ flex: 1, fontSize: 14, color: T.text, fontVariantNumeric: 'tabular-nums' }}>
                    {d.on ? `${d.from} – ${d.to}` : 'Выходной'}
                  </div>
                  <Toggle on={d.on} onChange={(v) => setDay(i, { on: v, from: v && d.from === '—' ? '10:00' : d.from, to: v && d.to === '—' ? '20:00' : d.to })} size="sm" />
                </div>
                {i < days.length - 1 && <Divider />}
              </Fragment>
            ))}
          </Card>
        </div>

        <div>
          <SectionTitle title="Шаблоны" subtitle="Быстро применить к неделе." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <NeutralBtn>Будни</NeutralBtn>
            <NeutralBtn>Все дни</NeutralBtn>
            <NeutralBtn>Кастом</NeutralBtn>
          </div>
        </div>

        <div style={{
          padding: 16, border: `1px dashed ${T.border}`, borderRadius: 12,
          fontSize: 12, color: T.text2, lineHeight: 1.5,
        }}>
          Перерыв и обеды настраиваются внутри каждого дня. Праздничные исключения — в отдельной вкладке.
        </div>
      </div>

      <BottomSheet open={openDay !== null} onClose={() => setOpenDay(null)} title={openDay !== null ? days[openDay]?.d : ''}>
        {openDay !== null && days[openDay] && (
          <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <TimeField label="Начало" value={days[openDay].from} />
              <TimeField label="Конец" value={days[openDay].to} />
            </div>
            <div>
              <FieldLabel>Перерывы</FieldLabel>
              <Card padded={false} style={{ marginTop: 10 }}>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: T.text, flex: 1 }}>Обед</span>
                  <span style={{ fontSize: 13, color: T.text2, fontVariantNumeric: 'tabular-nums' }}>13:00 – 14:00</span>
                </div>
              </Card>
              <NeutralBtn icon="plus" full style={{ marginTop: 10 }}>Добавить перерыв</NeutralBtn>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function TimeField({ label, value }: { label: string; value: string }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.cardElev, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: '12px 14px',
    }}>
      <FieldLabel style={{ fontSize: 9 }}>{label}</FieldLabel>
      <div style={{ fontSize: 18, color: T.text, marginTop: 6, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
