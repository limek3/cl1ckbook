'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, useTheme, type ThemeMode } from './theme';
import { Icon } from './primitives/atoms';
import { ToastCtx, haptic, tgClose, type ToastItem, type MiniToastCtxValue } from './bridge';

function ToastHost({ items }: { items: ToastItem[] }) {
  const { T } = useTheme();
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 96, zIndex: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none',
    }}>
      <style>{`@keyframes mini-toast-in { from { transform: translateY(8px) scale(.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }`}</style>
      {items.map((it) => (
        <div key={it.id} style={{
          background: it.tone === 'error' ? T.danger : it.tone === 'success' ? T.success : T.cardElev,
          color: it.tone === 'info' ? T.text : '#fff',
          border: `1px solid ${T.border}`,
          padding: '10px 16px', borderRadius: 14, fontSize: 13,
          maxWidth: '85%', boxShadow: T.cardShadow,
          animation: 'mini-toast-in 0.18s cubic-bezier(.2,.8,.2,1) both',
        }}>{it.text}</div>
      ))}
    </div>
  );
}

import { HomeScreen } from './screens/home';
import { AppointmentsScreen } from './screens/appointments';
import { ServicesScreen } from './screens/services';
import { ClientsScreen } from './screens/clients';
import { MoreScreen } from './screens/more';
import { ChatsScreen, ChatThreadScreen } from './screens/chats';
import { AnalyticsScreen } from './screens/analytics';
import { ScheduleScreen } from './screens/schedule';
import { TemplatesScreen } from './screens/templates';
import {
  ProfileScreen, AppearanceScreen, NotificationsScreen, SubscriptionScreen, LimitsScreen,
} from './screens/settings';
import {
  FinanceScreen, PaymentsScreen, IntegrationsScreen, SourcesScreen, MarketingScreen, ReviewsScreen,
} from './screens/money';

import type { Thread } from '@/lib/mini-demo';

// ─── Tab definitions ─────────────────────────
type TabId = 'home' | 'appts' | 'services' | 'clients' | 'more';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home',     label: 'Главная',  icon: 'home' },
  { id: 'appts',    label: 'Записи',   icon: 'calendar' },
  { id: 'services', label: 'Услуги',   icon: 'list' },
  { id: 'clients',  label: 'Клиенты',  icon: 'users' },
  { id: 'more',     label: 'Ещё',      icon: 'more-horizontal' },
];

interface SubRoute {
  kind: string;
  payload?: Thread;
}

// ─── Bottom Nav ──────────────────────────────
function BottomNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const { T } = useTheme();
  return (
    <div style={{
      borderTop: `1px solid ${T.border}`,
      background: T.bg,
      padding: '8px 4px 22px',
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0,
      flexShrink: 0,
    }}>
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => { haptic('light'); onChange(t.id); }} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: isActive ? T.text : T.text3, fontFamily: 'inherit',
            transition: 'transform 0.12s ease, color 0.15s ease',
          }}>
            <Icon name={t.icon} size={20} stroke={isActive ? 1.75 : 1.5} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 500 : 400, letterSpacing: '0.01em' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Telegram-style header ───────────────────
function TgHeader({ onToggleTheme }: { onToggleTheme: () => void }) {
  const { T, mode } = useTheme();
  return (
    <div style={{
      flexShrink: 0,
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: T.bg,
      borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: T.cardElev,
          border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: T.text, fontWeight: 600,
        }}>К</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: T.text, lineHeight: 1.1 }}>КликБук</div>
          <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>mini app</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={onToggleTheme} aria-label="theme" style={{
          width: 32, height: 32, background: 'transparent', border: 'none', cursor: 'pointer',
          color: T.text2, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name={mode === 'dark' ? 'sun' : 'moon'} size={16} /></button>
        <button onClick={tgClose} style={{
          background: 'transparent', border: 'none', color: T.text2, cursor: 'pointer',
          padding: '6px 8px', fontSize: 13, fontFamily: 'inherit',
        }}>Закрыть</button>
      </div>
    </div>
  );
}

// ─── Inner shell ─────────────────────────────
function MiniAppInner({ initialTab = 'home', initialSub = null }: { initialTab?: TabId; initialSub?: SubRoute | null }) {
  const { T, toggle } = useTheme();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [sub, setSub] = useState<SubRoute | null>(initialSub);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toastApi = useMemo<MiniToastCtxValue>(() => ({
    show: (text, tone = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, text, tone }]);
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2400);
      haptic(tone === 'error' ? 'error' : tone === 'success' ? 'success' : 'light');
    },
  }), []);

  // Telegram WebApp init: ready/expand once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    try { tg.ready?.(); tg.expand?.(); } catch {}
  }, []);

  // Back button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any).Telegram?.WebApp;
    const back = tg?.BackButton;
    if (!back) return;
    if (sub) {
      try { back.show(); } catch {}
    } else {
      try { back.hide(); } catch {}
    }
    const handler = () => setSub(null);
    try { back.onClick(handler); } catch {}
    return () => { try { back.offClick(handler); } catch {} };
  }, [sub]);

  const goSub = useCallback((kind: string, payload?: Thread) => {
    haptic('light');
    const tabAliases: Record<string, TabId> = {
      home: 'home',
      appts: 'appts',
      appointments: 'appts',
      services: 'services',
      clients: 'clients',
      more: 'more',
    };
    const nextTab = tabAliases[kind];
    if (nextTab) {
      setTab(nextTab);
      setSub(null);
      return;
    }
    setSub({ kind, payload });
  }, []);
  const back = useCallback(() => setSub(null), []);

  // Render screen content
  let content: ReactNode = null;
  if (sub) {
    switch (sub.kind) {
      case 'chats':         content = <ChatsScreen openThread={(t) => setSub({ kind: 'thread', payload: t })} back={back} />; break;
      case 'thread':        content = sub.payload ? <ChatThreadScreen thread={sub.payload} back={() => setSub({ kind: 'chats' })} /> : null; break;
      case 'analytics':     content = <AnalyticsScreen back={back} />; break;
      case 'schedule':      content = <ScheduleScreen back={back} />; break;
      case 'templates':     content = <TemplatesScreen back={back} />; break;
      case 'profile':       content = <ProfileScreen back={back} />; break;
      case 'appearance':    content = <AppearanceScreen back={back} />; break;
      case 'notifications': content = <NotificationsScreen back={back} />; break;
      case 'subscription':  content = <SubscriptionScreen back={back} />; break;
      case 'limits':        content = <LimitsScreen back={back} go={(g) => setSub({ kind: g })} />; break;
      case 'finance':       content = <FinanceScreen back={back} />; break;
      case 'payments':      content = <PaymentsScreen back={back} />; break;
      case 'integrations':  content = <IntegrationsScreen back={back} />; break;
      case 'sources':       content = <SourcesScreen back={back} />; break;
      case 'marketing':     content = <MarketingScreen back={back} />; break;
      case 'reviews':       content = <ReviewsScreen back={back} />; break;
      default: content = <div style={{ padding: 24, color: T.text2 }}>Coming soon</div>;
    }
  } else {
    if (tab === 'home') content = <HomeScreen go={goSub} />;
    else if (tab === 'appts') content = <AppointmentsScreen />;
    else if (tab === 'services') content = <ServicesScreen />;
    else if (tab === 'clients') content = <ClientsScreen go={goSub} />;
    else if (tab === 'more') content = <MoreScreen go={goSub} />;
  }

  // Chat thread = full height (no tabs)
  const isFullHeight = sub && sub.kind === 'thread';

  return (
    <ToastCtx.Provider value={toastApi}>
      <div style={{
        width: '100%', maxWidth: 390, height: '100dvh',
        background: T.bg, color: T.text,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
        overflow: 'hidden',
        margin: '0 auto',
        transition: 'background 0.2s, color 0.2s',
        position: 'relative',
      }}>
        <TgHeader onToggleTheme={toggle} />
        {isFullHeight ? (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>{content}</div>
        ) : (
          <div className="scroll-area" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>{content}</div>
        )}
        {!isFullHeight && <BottomNav active={tab} onChange={(id) => { setTab(id); setSub(null); }} />}
        <ToastHost items={toasts} />
      </div>
    </ToastCtx.Provider>
  );
}

// ─── Public wrapper ──────────────────────────
export interface MiniAppProps {
  initialTab?: TabId;
  initialSub?: SubRoute | null;
  mode?: ThemeMode;
}

export function MiniApp({ initialTab = 'home', initialSub = null, mode = 'dark' }: MiniAppProps) {
  return (
    <ThemeProvider initialMode={mode}>
      <MiniAppInner initialTab={initialTab} initialSub={initialSub} />
    </ThemeProvider>
  );
}
