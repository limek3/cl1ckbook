'use client';

import { useState } from 'react';
import { useTheme } from '../theme';
import { BottomSheet, FieldLabel, Divider, Avatar, Icon, NeutralBtn, Toggle } from '../primitives/atoms';
import type { Appointment, Client, Service, Template, ScheduleDay } from '@/lib/mini-demo';

// ─── Client detail ─────────────────────────────────
export function ClientDetailSheet({ client, onClose }: { client: Client | null; onClose: () => void }) {
  const { T } = useTheme();
  if (!client) return <BottomSheet open={false} onClose={onClose}><div /></BottomSheet>;
  return (
    <BottomSheet open={!!client} onClose={onClose}>
      <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar name={client.name} size={52} radius={26} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>{client.name}</div>
          <div style={{ fontSize: 12, color: T.text2, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{client.phone || '—'}</div>
        </div>
      </div>

      <div style={{ padding: '16px 20px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Stat label="Визитов" value={String(client.visits)} />
        <Stat label="Сумма" value={`${client.total.toLocaleString('ru-RU')} ₽`} small />
        <Stat label="Средний чек" value={`${Math.round(client.total / Math.max(client.visits, 1)).toLocaleString('ru-RU')} ₽`} small />
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <FieldLabel>Заметка</FieldLabel>
        <textarea
          placeholder="Аллергии, пожелания, контекст..."
          rows={3}
          style={{
            width: '100%', marginTop: 8, padding: 12, fontSize: 13, lineHeight: 1.5,
            background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12,
            color: T.text, fontFamily: 'inherit', resize: 'none', outline: 'none',
          }}
        />
      </div>

      <div style={{ padding: '14px 20px 4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <NeutralBtn icon="message-circle" full>В чат</NeutralBtn>
        <NeutralBtn icon="calendar-plus" full>Записать</NeutralBtn>
      </div>
    </BottomSheet>
  );
}

// ─── Appointment detail ────────────────────────────
export function AppointmentDetailSheet({
  appt, onClose, onConfirm, onComplete, onCancel,
}: {
  appt: Appointment | null;
  onClose: () => void;
  onConfirm?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}) {
  const { T } = useTheme();
  if (!appt) return <BottomSheet open={false} onClose={onClose}><div /></BottomSheet>;
  return (
    <BottomSheet open={!!appt} onClose={onClose}>
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ fontSize: 11, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          {appt.status === 'in-focus' ? 'В фокусе' : appt.status === 'scheduled' ? 'Запланирована' : appt.status === 'completed' ? 'Завершена' : 'Отменена'}
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>{appt.name}</div>
        <div style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>{appt.service}</div>
      </div>

      <Divider />

      <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Cell label="Время" value={appt.time} />
        <Cell label="Длительность" value={`${appt.dur} мин`} />
        <Cell label="Телефон" value={appt.phone || '—'} small />
      </div>

      {appt.status !== 'completed' && appt.status !== 'cancelled' && (
        <>
          <Divider />
          <div style={{ padding: '14px 20px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {onConfirm && <NeutralBtn icon="check" full onClick={onConfirm}>Подтвердить</NeutralBtn>}
            {onComplete && <NeutralBtn icon="check-check" full onClick={onComplete}>Завершить</NeutralBtn>}
            {onCancel && <NeutralBtn icon="x" full onClick={onCancel}>Отменить</NeutralBtn>}
          </div>
        </>
      )}
    </BottomSheet>
  );
}

// ─── Service detail ────────────────────────────────
export function ServiceDetailSheet({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const { T } = useTheme();
  const [active, setActive] = useState(true);
  if (!service) return <BottomSheet open={false} onClose={onClose}><div /></BottomSheet>;
  return (
    <BottomSheet open={!!service} onClose={onClose}>
      <div style={{ padding: '0 20px 8px' }}>
        <div style={{ fontSize: 11, color: T.text3 }}>#{service.n}</div>
        <input
          defaultValue={service.name}
          style={{
            width: '100%', marginTop: 4, padding: 0, fontSize: 22, fontWeight: 600,
            background: 'transparent', border: 'none', outline: 'none',
            color: T.text, letterSpacing: '-0.02em', fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <NumField label="Цена, ₽" value={service.price} />
        <NumField label="Мин." value={service.duration} />
      </div>

      <div style={{ padding: '8px 20px 0' }}>
        <FieldLabel>Описание</FieldLabel>
        <textarea
          rows={3}
          placeholder="Краткое описание для клиента..."
          style={{
            width: '100%', marginTop: 8, padding: 12, fontSize: 13, lineHeight: 1.5,
            background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12,
            color: T.text, fontFamily: 'inherit', resize: 'none', outline: 'none',
          }}
        />
      </div>

      <Divider />

      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: T.text }}>Услуга активна</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Видна клиентам в форме записи</div>
        </div>
        <Toggle on={active} onChange={setActive} />
      </div>

      <div style={{ padding: '0 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <NeutralBtn full>Сохранить</NeutralBtn>
        <NeutralBtn icon="trash-2" full>Удалить</NeutralBtn>
      </div>
    </BottomSheet>
  );
}

// ─── Template detail ───────────────────────────────
export function TemplateDetailSheet({ template, onClose }: { template: Template | null; onClose: () => void }) {
  const { T } = useTheme();
  if (!template) return <BottomSheet open={false} onClose={onClose}><div /></BottomSheet>;
  const [body, setBody] = useState(template.body);
  return (
    <BottomSheet open={!!template} onClose={onClose} title={template.name}>
      <div style={{ padding: '0 20px 0' }}>
        <FieldLabel>Текст</FieldLabel>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          style={{
            width: '100%', marginTop: 8, padding: 12, fontSize: 13, lineHeight: 1.5,
            background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: 12,
            color: T.text, fontFamily: 'inherit', resize: 'vertical', outline: 'none',
          }}
        />
      </div>
      <div style={{ padding: '12px 20px 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {['{имя}', '{дата}', '{время}', '{услуга}', '{ссылка}'].map((v) => (
          <button key={v} onClick={() => setBody((b) => b + ' ' + v)} style={{
            fontSize: 11, padding: '6px 10px', borderRadius: 999,
            border: `1px solid ${T.border}`, color: T.text2, fontFamily: 'monospace',
            background: 'transparent', cursor: 'pointer',
          }}>{v}</button>
        ))}
      </div>
      <div style={{ padding: '14px 20px 0' }}>
        <NeutralBtn icon="check" full>Сохранить</NeutralBtn>
      </div>
    </BottomSheet>
  );
}

// ─── Day editor ────────────────────────────────────
export function DayEditSheet({ day, onClose, onSave }: { day: ScheduleDay | null; onClose: () => void; onSave?: (d: ScheduleDay) => void }) {
  const { T } = useTheme();
  if (!day) return <BottomSheet open={false} onClose={onClose}><div /></BottomSheet>;
  const [from, setFrom] = useState(day.from === '—' ? '10:00' : day.from);
  const [to, setTo] = useState(day.to === '—' ? '20:00' : day.to);
  return (
    <BottomSheet open={!!day} onClose={onClose} title={`${day.d} — рабочий день`}>
      <div style={{ padding: '0 20px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TimeField label="Начало" value={from} onChange={setFrom} />
        <TimeField label="Конец" value={to} onChange={setTo} />
      </div>

      <div style={{ padding: '0 20px 0' }}>
        <FieldLabel>Перерывы</FieldLabel>
        <div style={{
          marginTop: 10, padding: '12px 16px',
          background: T.cardElev, border: `1px solid ${T.border}`, borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: T.text, flex: 1 }}>Обед</span>
          <span style={{ fontSize: 13, color: T.text2, fontVariantNumeric: 'tabular-nums' }}>13:00 – 14:00</span>
        </div>
        <NeutralBtn icon="plus" full style={{ marginTop: 10 }}>Добавить перерыв</NeutralBtn>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <NeutralBtn icon="check" full onClick={() => onSave && onSave({ ...day, from, to, on: true })}>Сохранить</NeutralBtn>
      </div>
    </BottomSheet>
  );
}

// ─── Helpers ───────────────────────────────────────
function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.cardElev, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <FieldLabel style={{ fontSize: 9 }}>{label}</FieldLabel>
      <div style={{ fontSize: small ? 14 : 18, fontWeight: 600, color: T.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );
}

function Cell({ label, value, small }: { label: string; value: string; small?: boolean }) {
  const { T } = useTheme();
  return (
    <div>
      <FieldLabel style={{ fontSize: 9 }}>{label}</FieldLabel>
      <div style={{ fontSize: small ? 13 : 15, color: T.text, fontVariantNumeric: 'tabular-nums', marginTop: 6, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function NumField({ label, value }: { label: string; value: number }) {
  const { T } = useTheme();
  return (
    <div style={{ background: T.cardElev, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px' }}>
      <FieldLabel style={{ fontSize: 9 }}>{label}</FieldLabel>
      <input
        defaultValue={value}
        type="number"
        style={{
          width: '100%', marginTop: 6, padding: 0, fontSize: 18, fontWeight: 600,
          background: 'transparent', border: 'none', outline: 'none',
          color: T.text, fontVariantNumeric: 'tabular-nums', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { T } = useTheme();
  return (
    <div style={{ background: T.cardElev, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px' }}>
      <FieldLabel style={{ fontSize: 9 }}>{label}</FieldLabel>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', marginTop: 6, padding: 0, fontSize: 18, fontWeight: 600,
          background: 'transparent', border: 'none', outline: 'none',
          color: T.text, fontVariantNumeric: 'tabular-nums', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}
