'use client';

import { useState } from 'react';
import { useTheme } from '../theme';
import { FieldLabel, NavBtn, StatusDot, Icon } from '../primitives/atoms';
import { AppointmentDetailSheet } from '../sheets/detail-sheets';
import { type Appointment } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';
import { useMiniToast } from '../bridge';

export function AppointmentsScreen({ openAppt }: { openAppt?: (a: Appointment) => void }) {
  const { T } = useTheme();
  const { APPOINTMENTS, updateBookingStatus } = useMiniData();
  const { show } = useMiniToast();
  const [day, setDay] = useState(0);
  const [active, setActive] = useState<Appointment | null>(null);

  async function changeStatus(a: Appointment, status: 'confirmed' | 'completed' | 'cancelled', label: string) {
    if (!a.id) { show('Запись без идентификатора', 'error'); return; }
    try {
      await updateBookingStatus(a.id, status);
      show(label, 'success');
      setActive(null);
    } catch {
      show('Не удалось обновить', 'error');
    }
  }

  const dayLabel = day === 0 ? 'Сегодня'
    : day === 1 ? 'Завтра'
    : day === -1 ? 'Вчера'
    : `${4 + day} мая`;

  const dateLabel = day === 0 ? '4 мая, понедельник'
    : day === 1 ? '5 мая, вторник'
    : day === -1 ? '3 мая, воскресенье'
    : '';

  return (
    <div style={{ padding: '20px 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>Записи</div>
        <div style={{ fontSize: 13, color: T.text2, marginTop: 2 }}>Расписание на день.</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <NavBtn icon="chevron-left" onClick={() => setDay((d) => d - 1)} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: T.text, letterSpacing: '-0.01em' }}>{dayLabel}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{dateLabel || '—'}</div>
        </div>
        <NavBtn icon="chevron-right" onClick={() => setDay((d) => d + 1)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <SummaryStat label="Записей" value={String(APPOINTMENTS.length)} />
        <SummaryStat label="Часов" value="7,5" />
        <SummaryStat label="Доход" value="14 200 ₽" small />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {APPOINTMENTS.map((a, i) => (
          <ApptCard key={i} appt={a} active={i === 0} onClick={() => setActive(a)} />
        ))}
      </div>

      <div style={{
        padding: '20px', border: `1px dashed ${T.border}`, borderRadius: 14,
        textAlign: 'center', color: T.text3, fontSize: 12,
      }}>
        Свободно после 19:00
      </div>
      <AppointmentDetailSheet
        appt={active}
        onClose={() => setActive(null)}
        onConfirm={active ? () => changeStatus(active, 'confirmed', 'Запись подтверждена') : undefined}
        onComplete={active ? () => changeStatus(active, 'completed', 'Запись завершена') : undefined}
        onCancel={active ? () => changeStatus(active, 'cancelled', 'Запись отменена') : undefined}
      />
    </div>
  );
}

function SummaryStat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
      boxShadow: T.cardShadow, padding: '12px 12px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <FieldLabel style={{ fontSize: 9 }}>{label}</FieldLabel>
      <div style={{ fontSize: small ? 14 : 18, fontWeight: 600, color: T.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );
}

function ApptCard({ appt, active, onClick }: { appt: Appointment; active?: boolean; onClick?: () => void }) {
  const { T } = useTheme();
  return (
    <div onClick={onClick} style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      boxShadow: T.cardShadow, padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      position: 'relative', overflow: 'hidden', cursor: 'pointer',
    }}>
      {active && <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 2, background: T.accent }} />}
      <div style={{ minWidth: 52 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: T.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{appt.time}</div>
        <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{appt.dur} мин</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.text, marginBottom: 2 }}>{appt.name}</div>
        <div style={{ fontSize: 12, color: T.text2 }}>{appt.service}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <StatusDot status={appt.status} />
        <span style={{ fontSize: 9, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {active ? 'В фокусе' : 'Запланирована'}
        </span>
      </div>
    </div>
  );
}
