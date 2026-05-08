'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { Avatar, Icon } from '../primitives/atoms';
import { MiniBottomSheet } from '../primitives/mini-bottom-sheet';
import { type Appointment, type Client, type Service } from '@/lib/mini-demo';
import { useMiniData } from '@/hooks/use-mini-data';
import { haptic, useMiniToast } from '../bridge';

const UI = {
  bg: '#fbfafc',
  card: '#ffffff',
  cardSoft: '#fff5f7',
  border: 'rgba(24, 24, 27, 0.075)',
  borderPink: 'rgba(238, 111, 145, 0.22)',
  text: '#202124',
  text2: '#666a73',
  text3: '#9a9da5',
  accent: '#ee6f91',
  accent2: '#9b7cf6',
  success: '#12986a',
  shadow: '0 8px 28px rgba(55, 48, 68, 0.045)',
};

function localIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return localIso(d);
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return localIso(d);
}

function parseDayMs(dateIso?: string | null) {
  if (!dateIso) return 0;
  const ms = new Date(`${dateIso}T00:00:00`).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function apptMs(a: Appointment) {
  const ms = new Date(`${a.date ?? todayIso()}T${a.time || '00:00'}:00`).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function money(value: number) {
  return `${Math.round(value || 0).toLocaleString('ru-RU')} ₽`;
}

function shortMoney(value: number) {
  return money(value).replace(/\u00A0/g, ' ');
}

function isActiveAppointment(a: Appointment) {
  return a.rawStatus !== 'cancelled' && a.rawStatus !== 'no_show';
}

function isVisibleService(s: Service) {
  return s.visible !== false && s.status !== 'draft';
}

function dateTimeLabel(a?: Appointment | null) {
  if (!a) return '—';
  const isToday = a.date === todayIso();
  const date = isToday
    ? 'Сегодня'
    : a.date
      ? new Date(`${a.date}T00:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      : '';
  return `${date}${date ? ', ' : ''}${a.time || '—'}`;
}

function getRecordString(record: unknown, keys: string[]) {
  const source = record as Record<string, unknown> | null | undefined;
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

function getClientAvatar(client?: Client | null) {
  return getRecordString(client, ['avatar', 'photo', 'image', 'picture', 'photoUrl', 'avatarUrl']);
}

function getAppointmentAvatar(appt?: Appointment | null, client?: Client | null) {
  return getRecordString(appt, ['avatar', 'photo', 'image', 'picture', 'photoUrl', 'avatarUrl']) ?? getClientAvatar(client);
}

function getClientCreatedMs(client: Client) {
  const value = getRecordString(client, ['createdAt', 'created_at', 'created', 'registeredAt', 'date']);
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function percentChange(current: number, previous: number) {
  if (!previous && current > 0) return '+100%';
  if (!previous) return '+0%';
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

function trendFromAppointments(appointments: Appointment[], startIso: string, endIso: string) {
  const start = parseDayMs(startIso);
  const end = parseDayMs(endIso);
  return appointments.filter((a) => {
    const ms = parseDayMs(a.date);
    return ms >= start && ms <= end && isActiveAppointment(a);
  });
}

function buildDailyAppointmentTrend(appointments: Appointment[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = daysAgoIso(6 - index);
    return appointments.filter((a) => a.date === date && isActiveAppointment(a)).length;
  });
}

function buildClientTrend(clients: Client[]) {
  const trend = Array.from({ length: 7 }, (_, index) => {
    const start = parseDayMs(daysAgoIso(6 - index));
    const end = start + 24 * 60 * 60 * 1000 - 1;
    return clients.filter((c) => {
      const created = getClientCreatedMs(c);
      return created >= start && created <= end;
    }).length;
  });

  if (trend.some(Boolean)) return trend;

  // Если у реального клиента нет даты создания, всё равно строим линию из живых данных базы.
  const total = clients.length;
  return Array.from({ length: 7 }, (_, i) => Math.max(0, Math.round((total / 7) * (i + 1))));
}

function serviceByAppointment(appt: Appointment | null, services: Service[]) {
  if (!appt) return undefined;
  return services.find((service) => service.name === appt.service);
}

function findClient(appt: Appointment | null, clients: Client[]) {
  if (!appt) return null;
  return clients.find((c) => c.phone && c.phone === appt.phone) ?? clients.find((c) => c.name === appt.name) ?? null;
}

export function HomeScreen({ go }: { go: (kind: string) => void }) {
  const { APPOINTMENTS, SERVICES, CLIENTS, REVENUE_WEEK } = useMiniData();
  const { show } = useMiniToast();
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  const today = todayIso();
  const weekStart = daysAgoIso(6);
  const previousWeekStart = daysAgoIso(13);
  const previousWeekEnd = daysAgoIso(7);
  const now = Date.now();

  const todayAppointments = useMemo(
    () => APPOINTMENTS.filter((a) => a.date === today && isActiveAppointment(a)).sort((a, b) => a.time.localeCompare(b.time)),
    [APPOINTMENTS, today],
  );

  const upcoming = useMemo(
    () => APPOINTMENTS
      .filter((a) => a.rawStatus !== 'completed' && isActiveAppointment(a))
      .filter((a) => apptMs(a) >= now - 15 * 60 * 1000)
      .sort((a, b) => apptMs(a) - apptMs(b)),
    [APPOINTMENTS, now],
  );

  const next = upcoming[0] ?? todayAppointments[0] ?? null;
  const nextClient = findClient(next, CLIENTS);
  const nextService = serviceByAppointment(next, SERVICES);

  const visibleServices = SERVICES.filter(isVisibleService);
  const todayRevenue = todayAppointments.reduce((sum, a) => sum + (a.price ?? 0), 0);
  const newTodayCount = todayAppointments.filter((a) => a.rawStatus === 'new').length;

  const weekAppointments = trendFromAppointments(APPOINTMENTS, weekStart, today);
  const prevWeekAppointments = trendFromAppointments(APPOINTMENTS, previousWeekStart, previousWeekEnd);
  const appointmentTrend = buildDailyAppointmentTrend(APPOINTMENTS);
  const clientTrend = buildClientTrend(CLIENTS);

  const weekRevenue = REVENUE_WEEK?.length
    ? REVENUE_WEEK.reduce((sum, item) => sum + item.v, 0)
    : weekAppointments.reduce((sum, a) => sum + (a.price ?? 0), 0);

  const prevWeekRevenue = prevWeekAppointments.reduce((sum, a) => sum + (a.price ?? 0), 0);
  const newClientsWeekFromDates = CLIENTS.filter((client) => getClientCreatedMs(client) >= parseDayMs(weekStart)).length;
  const newClientsWeek = newClientsWeekFromDates || CLIENTS.filter((client) => client.visits <= 1).length;
  const clientsLastWeek = Math.max(0, CLIENTS.length - newClientsWeek);

  function openClient(appt: Appointment | null) {
    if (!appt) return;
    setActiveClient(nextClient ?? { name: appt.name, phone: appt.phone, visits: 0, total: 0 });
  }

  return (
    <div style={{ minHeight: '100%', background: UI.bg, padding: '22px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ position: 'relative', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: UI.text, letterSpacing: '-0.03em' }}>Главная</div>
        <button
          onClick={() => { haptic('light'); go('notifications'); }}
          aria-label="Уведомления"
          style={{
            position: 'absolute', right: 1, top: 4, width: 36, height: 36,
            border: 'none', background: 'transparent', color: UI.text, padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <Icon name="bell" size={22} color={UI.text} stroke={1.7} />
          <span style={{ position: 'absolute', right: 7, top: 6, width: 8, height: 8, borderRadius: 99, background: '#fb6b76', border: `2px solid ${UI.bg}` }} />
        </button>
      </div>

      <HeroCard
        count={todayAppointments.length}
        newCount={newTodayCount}
        amount={todayRevenue}
        onClick={() => go('appts')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MiniStatCard
          title="Клиенты"
          value={CLIENTS.length.toLocaleString('ru-RU')}
          subtitle={`+${newClientsWeek.toLocaleString('ru-RU')} за неделю`}
          icon="users"
          iconColor={UI.accent2}
          onClick={() => go('clients')}
        />
        <MiniStatCard
          title="Услуги"
          value={visibleServices.length.toLocaleString('ru-RU')}
          subtitle="Активные"
          icon="wallet"
          iconColor={UI.accent2}
          onClick={() => go('services')}
        />
      </div>

      <AppointmentCard
        appt={next}
        client={nextClient}
        service={nextService}
        onClick={() => openClient(next)}
      />

      <div style={cardStyle({ padding: 12 })}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px 10px' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: UI.text, letterSpacing: '-0.025em' }}>Краткая статистика</div>
          <button
            onClick={() => go('analytics')}
            style={{ border: 'none', background: 'transparent', padding: '4px 2px', display: 'flex', alignItems: 'center', gap: 4, color: UI.text2, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}
          >
            Неделя
            <Icon name="chevron-right" size={14} color={UI.text2} stroke={1.8} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <StatisticTile title="Выручка" value={shortMoney(weekRevenue)} delta={percentChange(weekRevenue, prevWeekRevenue)} trend={(REVENUE_WEEK ?? []).map((x) => x.v)} tone="violet" />
          <StatisticTile title="Записи" value={String(weekAppointments.length)} delta={percentChange(weekAppointments.length, prevWeekAppointments.length)} trend={appointmentTrend} tone="pink" />
          <StatisticTile title="Новые клиенты" value={String(newClientsWeek)} delta={`+${newClientsWeek}`} trend={clientTrend} tone="violet" />
        </div>
      </div>

      <MiniBottomSheet open={Boolean(activeClient)} onClose={() => setActiveClient(null)} maxHeight="min(72vh, 560px)" tail>
        <ClientSheetContent
          client={activeClient}
          onClose={() => setActiveClient(null)}
          onChat={() => { setActiveClient(null); go('chats'); }}
          onBook={() => { setActiveClient(null); show('Создание записи добавлю следующим экраном', 'info'); }}
        />
      </MiniBottomSheet>
    </div>
  );
}

function cardStyle(extra?: CSSProperties): CSSProperties {
  return {
    background: UI.card,
    border: `1px solid ${UI.border}`,
    borderRadius: 22,
    boxShadow: UI.shadow,
    ...extra,
  };
}

function HeroCard({ count, newCount, amount, onClick }: { count: number; newCount: number; amount: number; onClick: () => void }) {
  return (
    <button onClick={() => { haptic('light'); onClick(); }} style={{ ...cardStyle({ padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer' }), minHeight: 148, background: 'linear-gradient(135deg, #fff7f8 0%, #ffffff 56%, #fff8fa 100%)' }}>
      <div style={{ position: 'relative', padding: '22px 24px', minHeight: 148 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: UI.text, letterSpacing: '-0.02em', marginBottom: 22 }}>Записи сегодня</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 48, fontWeight: 400, lineHeight: 0.9, color: UI.text, letterSpacing: '-0.055em', fontVariantNumeric: 'tabular-nums' }}>{count}</div>
          <div style={{ height: 30, padding: '0 13px', borderRadius: 999, background: 'rgba(238, 111, 145, 0.12)', color: '#b74360', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
            +{newCount} новых
          </div>
        </div>
        <div style={{ marginTop: 15, fontSize: 16, color: UI.text2, letterSpacing: '-0.02em' }}>На сумму {shortMoney(amount)}</div>
        <div style={{ position: 'absolute', right: 32, top: 52, color: UI.accent, opacity: 0.86 }}>
          <Icon name="calendar-days" size={48} color={UI.accent} stroke={1.45} />
        </div>
      </div>
    </button>
  );
}

function MiniStatCard({ title, value, subtitle, icon, iconColor, onClick }: { title: string; value: string; subtitle: string; icon: string; iconColor: string; onClick: () => void }) {
  return (
    <button onClick={() => { haptic('light'); onClick(); }} style={{ ...cardStyle({ padding: '17px 17px 15px', textAlign: 'left', minHeight: 126, cursor: 'pointer' }), position: 'relative' }}>
      <div style={{ fontSize: 16, color: UI.text, letterSpacing: '-0.02em' }}>{title}</div>
      <div style={{ marginTop: 17, fontSize: 32, lineHeight: 1, color: UI.text, fontWeight: 500, letterSpacing: '-0.045em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ marginTop: 14, fontSize: 12, color: UI.text2 }}>{subtitle}</div>
      <div style={{ position: 'absolute', right: 16, bottom: 19, width: 34, height: 34, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${iconColor}12`, border: `1px solid ${iconColor}22` }}>
        <Icon name={icon} size={18} color={iconColor} stroke={1.85} />
      </div>
    </button>
  );
}

function AppointmentCard({ appt, client, service, onClick }: { appt: Appointment | null; client: Client | null; service?: Service; onClick: () => void }) {
  const avatar = getAppointmentAvatar(appt, client);
  const price = appt?.price ?? service?.price ?? 0;
  return (
    <button disabled={!appt} onClick={() => { if (appt) { haptic('light'); onClick(); } }} style={{ ...cardStyle({ padding: '20px 22px', textAlign: 'left', minHeight: 174, cursor: appt ? 'pointer' : 'default' }), width: '100%' }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: UI.text, letterSpacing: '-0.025em', marginBottom: 23 }}>Ближайшая запись</div>
      {appt ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar name={appt.name} src={avatar} size={64} radius={999} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: UI.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.025em' }}>{appt.name}</div>
            <div style={{ marginTop: 6, fontSize: 14, color: UI.accent2, letterSpacing: '-0.015em' }}>{dateTimeLabel(appt)}</div>
            <div style={{ marginTop: 6, fontSize: 14, color: UI.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.service}</div>
            <div style={{ marginTop: 7, fontSize: 15, color: UI.accent2, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{shortMoney(price)}</div>
          </div>
          <Icon name="chevron-right" size={25} color={UI.text2} stroke={1.6} />
        </div>
      ) : (
        <div style={{ padding: '14px 0 2px', color: UI.text3, fontSize: 14 }}>Когда появится новая запись, она сразу отобразится здесь.</div>
      )}
    </button>
  );
}

function StatisticTile({ title, value, delta, trend, tone }: { title: string; value: string; delta: string; trend: number[]; tone: 'pink' | 'violet' }) {
  const color = tone === 'pink' ? UI.accent : UI.accent2;
  return (
    <div style={{ border: `1px solid ${UI.border}`, borderRadius: 16, padding: '14px 12px 12px', minHeight: 136, background: UI.card }}>
      <div style={{ fontSize: 13, color: UI.text2, lineHeight: 1.2, minHeight: 31 }}>{title}</div>
      <div style={{ marginTop: 8, fontSize: 21, fontWeight: 600, color: UI.text, letterSpacing: '-0.045em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      <div style={{ marginTop: 10, fontSize: 13, color: UI.success, fontWeight: 500 }}>{delta}</div>
      <Sparkline values={trend.length ? trend : [0, 1, 2, 1, 2, 3, 4]} color={color} />
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const points = useMemo(() => {
    const width = 96;
    const height = 28;
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min || 1;
    return values.map((value, index) => {
      const x = values.length === 1 ? width : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [values]);

  return (
    <svg viewBox="0 0 96 30" width="100%" height="30" style={{ marginTop: 8, display: 'block', overflow: 'visible' }} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

function ClientSheetContent({
  client,
  onClose,
  onChat,
  onBook,
}: {
  client: Client | null;
  onClose: () => void;
  onChat: () => void;
  onBook: () => void;
}) {
  if (!client) return null;

  return (
    <div style={{ padding: '18px 18px 20px', background: UI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Avatar name={client.name} src={getClientAvatar(client)} size={48} radius={999} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 600, color: UI.text, letterSpacing: '-0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
            <a href={`tel:${client.phone}`} style={{ display: 'block', marginTop: 4, fontSize: 13, color: UI.accent2, textDecoration: 'none', fontVariantNumeric: 'tabular-nums' }}>{client.phone}</a>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${UI.border}`, background: UI.card, color: UI.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
          <Icon name="x" size={16} color={UI.text2} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <SheetStat label="Визитов" value={String(client.visits)} />
        <SheetStat label="Сумма" value={shortMoney(client.total)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => { haptic('light'); onChat(); }} style={sheetButton({ primary: true })}>
          <Icon name="message-square" size={16} color="#fff" /> Чат
        </button>
        <button onClick={() => { haptic('light'); onBook(); }} style={sheetButton()}>
          <Icon name="calendar-plus" size={16} color={UI.text2} /> Записать
        </button>
      </div>
    </div>
  );
}

function SheetStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={cardStyle({ padding: '13px 14px', borderRadius: 16 })}>
      <div style={{ fontSize: 12, color: UI.text3, marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 600, color: UI.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function sheetButton(options?: { primary?: boolean }): CSSProperties {
  const primary = options?.primary;
  return {
    width: '100%',
    minHeight: 44,
    borderRadius: 15,
    border: `1px solid ${primary ? UI.accent : UI.border}`,
    background: primary ? UI.accent : UI.card,
    color: primary ? '#fff' : UI.text,
    fontFamily: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
  };
}
