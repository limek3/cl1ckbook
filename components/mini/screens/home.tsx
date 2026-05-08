'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { useTheme } from '../theme';
import { Avatar, Icon } from '../primitives/atoms';
import { MiniBottomSheet } from '../primitives/mini-bottom-sheet';
import { type Appointment, type Client } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';
import { haptic } from '../bridge';

const UI = {
  bg: '#f8f2ea',
  surface: '#fffdfa',
  surfaceSoft: '#fbf4ec',
  line: 'rgba(54, 43, 34, 0.10)',
  text: '#2d2926',
  muted: '#827a72',
  faint: '#ada49b',
  coral: '#e96f59',
  coralSoft: '#fff0ea',
  lavender: '#8d7cc6',
  lavenderSoft: '#f1edf8',
  sage: '#748260',
  sageSoft: '#eef1e8',
  sand: '#b88354',
  shadow: '0 14px 32px rgba(80, 55, 35, 0.07)',
  shadowSoft: '0 8px 20px rgba(80, 55, 35, 0.045)',
};

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

function isLiveAppointment(a: Appointment) {
  return a.rawStatus !== 'cancelled' && a.rawStatus !== 'no_show';
}

function isFutureAppointment(a: Appointment, now: number) {
  return isLiveAppointment(a) && a.rawStatus !== 'completed' && apptMs(a) >= now - 15 * 60 * 1000;
}

function money(value: number) {
  return `${Math.round(value || 0).toLocaleString('ru-RU')} ₽`;
}

function ruDayShort(date: Date) {
  return date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '').toUpperCase();
}

function getClientForAppointment(appt: Appointment, clients: Client[]) {
  return clients.find((c) => c.phone && c.phone === appt.phone) ?? clients.find((c) => c.name === appt.name) ?? null;
}

function getClientImage(client: Client | null, appt?: Appointment) {
  const maybeClient = client as (Client & { avatar?: string; photo?: string; image?: string }) | null;
  const maybeAppt = appt as (Appointment & { avatar?: string; photo?: string; image?: string }) | undefined;
  return maybeClient?.avatar ?? maybeClient?.photo ?? maybeClient?.image ?? maybeAppt?.avatar ?? maybeAppt?.photo ?? maybeAppt?.image;
}

function weekStrip(today: Date) {
  return Array.from({ length: 5 }).map((_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() + index - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

export function HomeScreen({ go }: { go: (kind: string) => void }) {
  const { APPOINTMENTS, SERVICES, CLIENTS, MASTER } = useMiniData();
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const today = localIso(todayDate);
  const now = Date.now();

  const visibleServices = useMemo(
    () => SERVICES.filter((s) => s.visible !== false && s.status !== 'draft'),
    [SERVICES],
  );

  const todayAppointments = useMemo(
    () => APPOINTMENTS.filter((a) => a.date === today && isLiveAppointment(a)),
    [APPOINTMENTS, today],
  );

  const upcoming = useMemo(
    () => APPOINTMENTS.filter((a) => isFutureAppointment(a, now)).sort((a, b) => apptMs(a) - apptMs(b)),
    [APPOINTMENTS, now],
  );

  const nearestVisits = upcoming.slice(0, 2);
  const dayRevenue = todayAppointments.reduce((sum, a) => sum + (a.price ?? 0), 0);

  const newClientCount = useMemo(() => {
    const keys = new Set<string>();
    todayAppointments.forEach((appt) => {
      const client = getClientForAppointment(appt, CLIENTS);
      if (!client || client.visits <= 1) keys.add(appt.phone || appt.name);
    });
    return keys.size;
  }, [CLIENTS, todayAppointments]);

  const repeatRate = CLIENTS.length
    ? Math.round((CLIENTS.filter((c) => c.visits > 1).length / CLIENTS.length) * 100)
    : 0;

  const weekly = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, index) => {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - 6 + index);
      d.setHours(0, 0, 0, 0);
      const iso = localIso(d);
      const amount = APPOINTMENTS
        .filter((a) => a.date === iso && isLiveAppointment(a))
        .reduce((sum, a) => sum + (a.price ?? 0), 0);
      return { date: d, iso, amount };
    });
    const total = days.reduce((sum, item) => sum + item.amount, 0);
    return { days, total };
  }, [APPOINTMENTS, todayDate]);

  const weekDates = useMemo(() => weekStrip(todayDate), [todayDate]);
  const greetingName = (MASTER as { name?: string; title?: string })?.name?.split(' ')[0] || 'Анна';

  function openClient(appt: Appointment) {
    haptic('light');
    const found = getClientForAppointment(appt, CLIENTS);
    if (found) setActiveClient(found);
    else go('appts');
  }

  return (
    <div
      style={{
        minHeight: '100%',
        padding: '18px 14px 24px',
        background: `radial-gradient(circle at 15% 0%, rgba(233,111,89,0.10), transparent 34%), linear-gradient(180deg, ${UI.bg} 0%, #fffaf5 58%, #fffdfb 100%)`,
        color: UI.text,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <HomeHeader name={greetingName} notificationCount={todayAppointments.length} go={go} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 8 }}>
        {weekDates.map((date) => {
          const active = localIso(date) === today;
          return <DateChip key={localIso(date)} date={date} active={active} />;
        })}
      </div>

      <HeroCard
        appointmentsCount={todayAppointments.length}
        revenue={dayRevenue}
        newClients={newClientCount}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 9 }}>
        <KpiCard icon="users" tone="lavender" label="Клиенты" value={CLIENTS.length.toLocaleString('ru-RU')} hint="Всего в базе" />
        <KpiCard icon="sparkles" tone="coral" label="Услуги" value={visibleServices.length.toLocaleString('ru-RU')} hint="Активных" />
        <KpiCard icon="refresh" tone="sage" label="Повторные" value={`${repeatRate}%`} hint="Постоянные" />
      </div>

      <SectionHeader title="Ближайшие визиты" action="Все" onAction={() => go('appts')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {nearestVisits.length > 0 ? nearestVisits.map((appt) => (
          <VisitCard key={appt.id ?? `${appt.date}-${appt.time}-${appt.name}`} appt={appt} client={getClientForAppointment(appt, CLIENTS)} onClick={() => openClient(appt)} />
        )) : (
          <EmptyCard text="Ближайших визитов пока нет" />
        )}
      </div>

      <SectionHeader title="Быстрые действия" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <ActionCard icon="calendar-plus" label="Новая запись" tone="coral" onClick={() => go('appts')} />
        <ActionCard icon="user" label="Клиент" tone="sage" onClick={() => go('clients')} />
        <ActionCard icon="sparkles" label="Услуга" tone="lavender" onClick={() => go('services')} />
        <ActionCard icon="send" label="Рассылка" tone="sand" onClick={() => go('marketing')} />
      </div>

      <RevenueCard total={weekly.total} days={weekly.days} />

      <MiniBottomSheet open={Boolean(activeClient)} onClose={() => setActiveClient(null)} maxHeight="min(70vh, 520px)" tail>
        <ClientSheet client={activeClient} onClose={() => setActiveClient(null)} onChat={() => { setActiveClient(null); go('chats'); }} onBook={() => { setActiveClient(null); go('appts'); }} />
      </MiniBottomSheet>
    </div>
  );
}

function HomeHeader({ name, notificationCount, go }: { name: string; notificationCount: number; go: (kind: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '2px 2px 0' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: UI.muted, letterSpacing: '-0.01em' }}>
          Доброе утро, <span style={{ color: UI.coral, fontWeight: 600 }}>{name}</span>
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: 'Georgia, ui-serif, serif',
            fontSize: 38,
            lineHeight: 0.92,
            letterSpacing: '-0.055em',
            color: UI.text,
          }}
        >
          Главная
        </div>
      </div>
      <button
        onClick={() => { haptic('light'); go('notifications'); }}
        aria-label="Уведомления"
        style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          border: `1px solid ${UI.line}`,
          background: 'rgba(255,255,255,0.62)',
          color: UI.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: UI.shadowSoft,
          padding: 0,
        }}
      >
        <Icon name="bell" size={18} color={UI.text} stroke={1.8} />
        {notificationCount > 0 && <span style={{ position: 'absolute', right: 9, top: 8, width: 8, height: 8, borderRadius: 99, background: UI.coral, border: '2px solid #fffaf5' }} />}
      </button>
    </div>
  );
}

function DateChip({ date, active }: { date: Date; active?: boolean }) {
  return (
    <div
      style={{
        minHeight: 58,
        borderRadius: 17,
        border: `1px solid ${active ? 'rgba(233,111,89,0.18)' : UI.line}`,
        background: active ? UI.coral : 'rgba(255,255,255,0.70)',
        color: active ? '#fff' : UI.text,
        boxShadow: active ? '0 12px 22px rgba(233,111,89,0.23)' : UI.shadowSoft,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: active ? 'rgba(255,255,255,0.86)' : UI.muted }}>{ruDayShort(date)}</span>
      <span style={{ fontSize: 20, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{date.getDate()}</span>
    </div>
  );
}

function HeroCard({ appointmentsCount, revenue, newClients }: { appointmentsCount: number; revenue: number; newClients: number }) {
  return (
    <div
      style={{
        borderRadius: 26,
        border: `1px solid ${UI.line}`,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,246,238,0.90))',
        boxShadow: UI.shadow,
        minHeight: 176,
        position: 'relative',
        overflow: 'hidden',
        padding: '20px 22px',
      }}
    >
      <AbstractPortrait />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '62%' }}>
        <div style={{ fontFamily: 'Georgia, ui-serif, serif', fontSize: 23, lineHeight: 1, color: UI.text }}>Сегодня</div>
        <div style={{ width: 22, height: 2, background: UI.coral, borderRadius: 99, margin: '12px 0 18px' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'Georgia, ui-serif, serif', fontSize: 43, lineHeight: 0.9, letterSpacing: '-0.06em', fontVariantNumeric: 'tabular-nums' }}>{appointmentsCount}</span>
          <span style={{ fontSize: 15, color: UI.text }}>записей</span>
        </div>
        <div style={{ marginTop: 8, fontFamily: 'Georgia, ui-serif, serif', fontSize: 38, lineHeight: 1, letterSpacing: '-0.055em', fontVariantNumeric: 'tabular-nums' }}>{money(revenue)}</div>
        <div style={{ marginTop: 3, color: UI.muted, fontSize: 13 }}>выручка</div>
        <div style={{ marginTop: 17, display: 'flex', alignItems: 'center', gap: 7, color: UI.sage, fontSize: 12, fontWeight: 600 }}>
          <Icon name="users" size={14} color={UI.sage} stroke={1.8} />
          <span>{newClients} новых клиента</span>
        </div>
      </div>
    </div>
  );
}

function AbstractPortrait() {
  return (
    <svg viewBox="0 0 190 170" aria-hidden="true" style={{ position: 'absolute', right: -2, top: 0, width: '48%', height: '100%' }}>
      <defs>
        <linearGradient id="heroSoft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff4ec" />
          <stop offset="1" stopColor="#e8ddfb" />
        </linearGradient>
      </defs>
      <path d="M70 0h120v170H54c58-45-5-97 16-170Z" fill="url(#heroSoft)" opacity=".88" />
      <path d="M112 12c-12 18-10 34-2 47 9 14 22 19 23 38 1 17-13 29-28 36" fill="none" stroke="#76695f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M106 46c-15 16-20 31-15 45 4 12 15 20 30 25" fill="none" stroke="#e9a28f" strokeWidth="1" opacity=".6" />
      <path d="M144 54c-16 13-28 34-34 63" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" opacity=".45" />
      <path d="M152 67c-9 3-18 12-22 23 12-1 22-9 25-20M135 102c-10 2-18 10-23 20 12 0 21-7 25-17" fill="#fffaf5" opacity=".72" />
      <circle cx="76" cy="122" r="38" fill="#fff1e8" opacity=".72" />
      <path d="M51 139c24-23 37-52 76-64" fill="none" stroke="#e96f59" strokeWidth="1.2" opacity=".28" />
    </svg>
  );
}

function KpiCard({ icon, label, value, hint, tone }: { icon: string; label: string; value: string; hint: string; tone: 'coral' | 'lavender' | 'sage' }) {
  const palette = getTone(tone);
  return (
    <div style={{ border: `1px solid ${UI.line}`, borderRadius: 18, background: 'rgba(255,255,255,0.76)', boxShadow: UI.shadowSoft, minHeight: 86, padding: '12px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 28, height: 28, borderRadius: 12, background: palette.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={16} color={palette.main} stroke={1.9} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: UI.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
          <div style={{ fontFamily: 'Georgia, ui-serif, serif', fontSize: 24, lineHeight: 1, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: UI.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hint}</div>
    </div>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '2px 2px 0' }}>
      <div style={{ fontFamily: 'Georgia, ui-serif, serif', fontSize: 23, lineHeight: 1, color: UI.text, letterSpacing: '-0.035em' }}>{title}</div>
      {action ? (
        <button onClick={() => { haptic('light'); onAction?.(); }} style={{ border: 'none', background: 'transparent', color: UI.coral, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, padding: 0 }}>
          {action}<Icon name="chevron-right" size={14} color={UI.coral} />
        </button>
      ) : null}
    </div>
  );
}

function VisitCard({ appt, client, onClick }: { appt: Appointment; client: Client | null; onClick: () => void }) {
  const src = getClientImage(client, appt);
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 72,
        border: `1px solid ${UI.line}`,
        borderRadius: 18,
        background: 'rgba(255,255,255,0.82)',
        boxShadow: UI.shadowSoft,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'inherit',
        color: UI.text,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ width: 52, height: 38, borderRadius: 12, background: UI.coralSoft, color: UI.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {appt.time}
      </div>
      <Avatar name={appt.name} src={src} size={42} radius={999} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.name}</div>
        <div style={{ marginTop: 3, fontSize: 12, color: UI.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.service}</div>
        <div style={{ marginTop: 2, fontSize: 11, color: UI.faint, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>мастер {((appt as Appointment & { master?: string }).master) || '—'}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <span style={{ fontSize: 16, color: UI.coral, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{money(appt.price ?? 0)}</span>
        <Icon name="chevron-right" size={16} color={UI.faint} />
      </div>
    </button>
  );
}

function ActionCard({ icon, label, tone, onClick }: { icon: string; label: string; tone: 'coral' | 'lavender' | 'sage' | 'sand'; onClick: () => void }) {
  const palette = getTone(tone);
  return (
    <button
      onClick={() => { haptic('light'); onClick(); }}
      style={{
        minHeight: 58,
        borderRadius: 18,
        border: `1px solid ${UI.line}`,
        background: palette.wash,
        boxShadow: UI.shadowSoft,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 14px',
        fontFamily: 'inherit',
        fontSize: 14,
        color: UI.text,
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 33, height: 33, borderRadius: 12, background: palette.main, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={17} color="#fff" stroke={1.9} />
      </span>
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </button>
  );
}

function RevenueCard({ total, days }: { total: number; days: { date: Date; iso: string; amount: number }[] }) {
  const values = days.map((d) => d.amount);
  return (
    <div style={{ border: `1px solid ${UI.line}`, borderRadius: 22, background: 'rgba(255,255,255,0.82)', boxShadow: UI.shadow, padding: '17px 18px 12px' }}>
      <div style={{ fontFamily: 'Georgia, ui-serif, serif', fontSize: 21, lineHeight: 1, color: UI.text, letterSpacing: '-0.04em' }}>Выручка за неделю</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 10 }}>
        <div style={{ fontFamily: 'Georgia, ui-serif, serif', fontSize: 35, lineHeight: 1, letterSpacing: '-0.055em', fontVariantNumeric: 'tabular-nums' }}>{money(total)}</div>
        <div style={{ color: UI.coral, fontWeight: 700, fontSize: 13 }}>+12%</div>
      </div>
      <MiniLineChart values={values} labels={days.map((d) => ruDayShort(d.date))} />
    </div>
  );
}

function MiniLineChart({ values, labels }: { values: number[]; labels: string[] }) {
  const width = 320;
  const height = 86;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = 8 + index * ((width - 16) / Math.max(values.length - 1, 1));
    const y = 12 + (1 - ((value - min) / range)) * 52;
    return { x, y };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L ${points[points.length - 1]?.x ?? width - 8} 72 L ${points[0]?.x ?? 8} 72 Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 96, marginTop: 8, display: 'block' }} aria-hidden="true">
      <defs>
        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={UI.coral} stopOpacity="0.22" />
          <stop offset="1" stopColor={UI.coral} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#revenueFill)" />
      <path d={path} fill="none" stroke={UI.coral} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill="#fffaf5" stroke={UI.coral} strokeWidth="2" />
      ))}
      {labels.map((label, i) => {
        const x = 8 + i * ((width - 16) / Math.max(labels.length - 1, 1));
        return <text key={label + i} x={x} y="84" textAnchor="middle" fontSize="9" fill={UI.faint}>{label}</text>;
      })}
    </svg>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div style={{ border: `1px dashed ${UI.line}`, borderRadius: 18, background: 'rgba(255,255,255,0.50)', padding: 18, color: UI.faint, textAlign: 'center', fontSize: 13 }}>
      {text}
    </div>
  );
}

function ClientSheet({ client, onClose, onChat, onBook }: { client: Client | null; onClose: () => void; onChat: () => void; onBook: () => void }) {
  const { T } = useTheme();
  if (!client) return null;
  const button: CSSProperties = {
    width: '100%',
    minHeight: 46,
    borderRadius: 15,
    border: `1px solid ${T.border}`,
    background: T.cardElev,
    color: T.text,
    fontFamily: 'inherit',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Avatar name={client.name} src={getClientImage(client)} size={48} radius={999} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 750, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
            <a href={`tel:${client.phone}`} style={{ marginTop: 4, display: 'block', color: T.accent, textDecoration: 'none', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{client.phone}</a>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 12, border: `1px solid ${T.border}`, background: T.cardElev, color: T.text2, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={16} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <SheetStat label="Визитов" value={String(client.visits)} />
        <SheetStat label="Сумма" value={money(client.total)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => { haptic('light'); onChat(); }} style={{ ...button, background: T.accent, borderColor: T.accent, color: '#fff' }}><Icon name="message-square" size={16} color="#fff" />Чат</button>
        <button onClick={() => { haptic('light'); onBook(); }} style={button}><Icon name="calendar-plus" size={16} />Записать</button>
      </div>
    </div>
  );
}

function SheetStat({ label, value }: { label: string; value: string }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: 14, borderRadius: 16, background: T.cardElev, border: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 10, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 18, color: T.text, fontWeight: 750, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function getTone(tone: 'coral' | 'lavender' | 'sage' | 'sand') {
  if (tone === 'coral') return { main: UI.coral, soft: UI.coralSoft, wash: 'linear-gradient(135deg, #fff4ee, #fffaf7)' };
  if (tone === 'lavender') return { main: UI.lavender, soft: UI.lavenderSoft, wash: 'linear-gradient(135deg, #f4eff9, #fffaf7)' };
  if (tone === 'sage') return { main: UI.sage, soft: UI.sageSoft, wash: 'linear-gradient(135deg, #eff2e8, #fffaf7)' };
  return { main: UI.sand, soft: '#f7eee4', wash: 'linear-gradient(135deg, #fff1e3, #fffaf7)' };
}
