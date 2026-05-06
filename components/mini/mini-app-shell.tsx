'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ThemeProvider, useTheme, type ThemeMode } from './theme';
import { Icon } from './primitives/atoms';
import { useChats } from '@/hooks/use-chats';
import { useMiniData } from '@/hooks/use-mini-data';
import { ToastCtx, haptic, tgClose, type ToastItem, type MiniToastCtxValue } from './bridge';
import { buildMiniEventNotifications, unreadEventCount } from '@/lib/notification-events';

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

const MINI_NOTIFICATION_READ_KEY = 'clickbook-mini-notification-read-ids';
const MINI_NOTIFICATION_READ_EVENT = 'clickbook-mini-notification-read-change';

function readMiniNotificationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MINI_NOTIFICATION_READ_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}


// ─── Tab definitions ─────────────────────────
type TabId = 'home' | 'appts' | 'chats' | 'clients' | 'more';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home',     label: 'Главная',  icon: 'home' },
  { id: 'appts',    label: 'Записи',   icon: 'calendar' },
  { id: 'chats',    label: 'Чаты',     icon: 'message-square' },
  { id: 'clients',  label: 'Клиенты',  icon: 'users' },
  { id: 'more',     label: 'Ещё',      icon: 'more-horizontal' },
];

function miniGlass(mode: ThemeMode, edge: 'top' | 'bottom' = 'top'): CSSProperties {
  const dark = mode === 'dark';
  const verticalFade = edge === 'bottom' ? 'to top' : 'to bottom';

  return {
    // Сочный frosted glass: прозрачнее, без внешних теней, но с ярким blur/saturate.
    // Контент под плашками остаётся видимым и красиво размывается.
    backgroundColor: dark ? 'rgba(10,10,10,0.26)' : 'rgba(255,255,255,0.34)',
    backgroundImage: dark
      ? `linear-gradient(${verticalFade}, rgba(255,255,255,0.115), rgba(255,255,255,0.025))`
      : `linear-gradient(${verticalFade}, rgba(255,255,255,0.74), rgba(255,255,255,0.22))`,
    backdropFilter: 'blur(34px) saturate(2.05) contrast(1.06)',
    WebkitBackdropFilter: 'blur(34px) saturate(2.05) contrast(1.06)',
    boxShadow: 'none',
    transform: 'translate3d(0,0,0)',
    willChange: 'backdrop-filter',
    isolation: 'isolate',
    overflow: 'hidden',
  };
}

function glassBorder(mode: ThemeMode) {
  return mode === 'dark' ? 'rgba(255,255,255,0.135)' : 'rgba(255,255,255,0.58)';
}

interface SubRoute {
  kind: string;
  payload?: Thread;
}

// ─── Bottom Nav ──────────────────────────────
function BottomNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const { T, mode } = useTheme();
  return (
    <div style={{
      ...miniGlass(mode, 'bottom'),
      borderTop: `1px solid ${glassBorder(mode)}`,
      borderLeft: `1px solid ${glassBorder(mode)}`,
      borderRight: `1px solid ${glassBorder(mode)}`,
      padding: '9px 4px calc(20px + var(--miniapp-safe-bottom, var(--tg-safe-bottom, env(safe-area-inset-bottom, 0px))))',
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0,
      flexShrink: 0,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 80,
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
function TgHeader({ onToggleTheme, onNotifications, notificationCount = 0 }: { onToggleTheme: () => void; onNotifications: () => void; notificationCount?: number }) {
  const { T, mode } = useTheme();
  return (
    <div style={{
      ...miniGlass(mode, 'top'),
      flexShrink: 0,
      padding: 'calc(var(--miniapp-header-top-offset, 12px) + var(--miniapp-safe-top, var(--tg-safe-top, env(safe-area-inset-top, 0px)))) 16px 9px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: `1px solid ${glassBorder(mode)}`,
      borderLeft: `1px solid ${glassBorder(mode)}`,
      borderRight: `1px solid ${glassBorder(mode)}`,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      zIndex: 80,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: mode === 'dark' ? 'rgba(255,255,255,0.075)' : 'rgba(255,255,255,0.42)',
          border: `1px solid ${glassBorder(mode)}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: T.text, fontWeight: 600,
        }}>К</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: T.text, lineHeight: 1.1 }}>КликБук</div>
          <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>mini app</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => { haptic('light'); onNotifications(); }} aria-label="notifications" style={{
          width: 34, height: 34, background: mode === 'dark' ? 'rgba(255,255,255,0.075)' : 'rgba(255,255,255,0.42)', border: `1px solid ${glassBorder(mode)}`,
          borderRadius: 12, cursor: 'pointer', color: T.text2, padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <Icon name="bell" size={16} />
          {notificationCount > 0 && (
            <span style={{
              position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17,
              padding: '0 4px', borderRadius: 999, background: T.danger, color: '#fff',
              border: `2px solid ${T.bg}`, fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}>{notificationCount > 9 ? '9+' : notificationCount}</span>
          )}
        </button>
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
  const { T, mode, toggle } = useTheme();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [sub, setSub] = useState<SubRoute | null>(initialSub);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { threads } = useChats();
  const { APPOINTMENTS } = useMiniData();
  const notificationEvents = useMemo(() => (
    buildMiniEventNotifications(APPOINTMENTS, threads).map((event) => ({
      ...event,
      unread: event.unread && !readNotificationIds.includes(event.id),
    }))
  ), [APPOINTMENTS, threads, readNotificationIds]);
  const notificationCount = Math.min(99, unreadEventCount(notificationEvents));

  const toastApi = useMemo<MiniToastCtxValue>(() => ({
    show: (text, tone = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, text, tone }]);
      window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2400);
      haptic(tone === 'error' ? 'error' : tone === 'success' ? 'success' : 'light');
    },
  }), []);

  useEffect(() => {
    setReadNotificationIds(readMiniNotificationIds());
    const sync = () => setReadNotificationIds(readMiniNotificationIds());
    window.addEventListener('storage', sync);
    window.addEventListener(MINI_NOTIFICATION_READ_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(MINI_NOTIFICATION_READ_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [tab, sub?.kind]);

  // Telegram WebApp init: keep viewport/safe areas in sync.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = (window as any).Telegram?.WebApp;

    const applyViewport = () => {
      try { tg?.ready?.(); tg?.expand?.(); } catch {}
      const topInset = Number(tg?.contentSafeAreaInset?.top ?? tg?.safeAreaInset?.top ?? 0);
      const bottomInset = Number(tg?.contentSafeAreaInset?.bottom ?? tg?.safeAreaInset?.bottom ?? 0);
      const viewportHeight = Number(tg?.viewportStableHeight ?? tg?.viewportHeight ?? window.innerHeight);
      const isTelegramRuntime = Boolean(tg);

      document.documentElement.style.setProperty('--miniapp-header-top-offset', isTelegramRuntime ? '38px' : '12px');
      if (Number.isFinite(topInset)) document.documentElement.style.setProperty('--miniapp-safe-top', `${Math.max(0, Math.round(topInset))}px`);
      if (Number.isFinite(bottomInset)) document.documentElement.style.setProperty('--miniapp-safe-bottom', `${Math.max(0, Math.round(bottomInset))}px`);
      if (Number.isFinite(viewportHeight) && viewportHeight > 0) {
        document.documentElement.style.setProperty('--miniapp-viewport-height', `${Math.round(viewportHeight)}px`);
      }
    };

    applyViewport();
    const onChange = () => applyViewport();
    try { tg?.onEvent?.('viewportChanged', onChange); } catch {}
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      try { tg?.offEvent?.('viewportChanged', onChange); } catch {}
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
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
      chats: 'chats',
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
      case 'services':      content = <ServicesScreen back={back} />; break;
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
    else if (tab === 'appts') content = <AppointmentsScreen go={goSub} />;
    else if (tab === 'chats') content = <ChatsScreen openThread={(t) => setSub({ kind: 'thread', payload: t })} />;
    else if (tab === 'clients') content = <ClientsScreen go={goSub} />;
    else if (tab === 'more') content = <MoreScreen go={goSub} />;
  }

  // Chat thread = full height (no tabs)
  const isFullHeight = sub && sub.kind === 'thread';

  return (
    <ToastCtx.Provider value={toastApi}>
      <div className="cb-miniapp cb-mini-app-root" data-mini-theme={mode} data-mini-mode={mode} style={{
        '--mini-bg': T.bg,
        '--mini-card': T.card,
        '--mini-input-bg': T.inputBg,
        '--mini-text': T.text,
        '--mini-text-muted': T.text3,
        '--mini-accent': T.accent,
        '--miniapp-accent': T.accent,
        width: '100%', maxWidth: 390, height: 'var(--miniapp-viewport-height, 100dvh)', minHeight: '100svh',
        background: T.bg, color: T.text, colorScheme: mode,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
        overflow: 'hidden',
        paddingTop: 0,
        paddingBottom: 0,
        margin: '0 auto',
        transition: 'background 0.34s cubic-bezier(.2,.8,.2,1), color 0.34s cubic-bezier(.2,.8,.2,1)',
        position: 'relative',
      } as CSSProperties}>
        <style>{`
          .cb-miniapp, .cb-miniapp * { -webkit-tap-highlight-color: transparent; }
          .cb-miniapp input, .cb-miniapp textarea, .cb-miniapp select {
            -webkit-appearance: none !important; appearance: none !important;
            background: var(--mini-input-bg, #0d0d0d) !important;
            background-color: var(--mini-input-bg, #0d0d0d) !important;
            box-shadow: 0 0 0 1000px var(--mini-input-bg, #0d0d0d) inset !important;
            color: var(--mini-text, #fafafa) !important;
            color-scheme: dark; caret-color: var(--miniapp-accent, #127dfe);
            -webkit-text-fill-color: var(--mini-text, #fafafa) !important;
            border-radius: 10px;
          }
          .cb-miniapp input.cb-mini-transparent, .cb-miniapp textarea.cb-mini-transparent,
          .cb-miniapp input.cb-mini-input-reset, .cb-miniapp textarea.cb-mini-input-reset,
          .cb-miniapp input.cb-mini-input-reset:focus, .cb-miniapp textarea.cb-mini-input-reset:focus,
          .cb-miniapp input.cb-mini-input-reset:hover, .cb-miniapp textarea.cb-mini-input-reset:hover,
          .cb-miniapp input.cb-mini-input-reset:active, .cb-miniapp textarea.cb-mini-input-reset:active {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
            border: 0 !important;
            outline: none !important;
            border-radius: 0 !important;
            background-clip: padding-box !important;
            -webkit-text-fill-color: var(--mini-text, #fafafa) !important;
            caret-color: var(--miniapp-accent, #127dfe) !important;
          }
          .cb-miniapp input.cb-mini-input-reset::-webkit-search-decoration,
          .cb-miniapp input.cb-mini-input-reset::-webkit-search-cancel-button,
          .cb-miniapp input.cb-mini-input-reset::-webkit-search-results-button,
          .cb-miniapp input.cb-mini-input-reset::-webkit-search-results-decoration {
            -webkit-appearance: none;
            appearance: none;
            display: none;
          }
          .cb-miniapp input:-webkit-autofill, .cb-miniapp textarea:-webkit-autofill {
            box-shadow: 0 0 0 999px var(--mini-input-bg, #0d0d0d) inset !important;
            -webkit-text-fill-color: var(--mini-text, #fafafa) !important;
          }
          .cb-miniapp[data-mini-mode="light"] input, .cb-miniapp[data-mini-mode="light"] textarea, .cb-miniapp[data-mini-mode="light"] select {
            color-scheme: light;
            background: var(--mini-input-bg, #ffffff) !important;
            background-color: var(--mini-input-bg, #ffffff) !important;
            box-shadow: 0 0 0 1000px var(--mini-input-bg, #ffffff) inset !important;
          }
          .cb-miniapp ::placeholder { color: ${T.text3}; opacity: 1; }
          .cb-miniapp { --miniapp-accent: ${T.accent}; }
        `}</style>
        <TgHeader onToggleTheme={toggle} onNotifications={() => setSub({ kind: 'notifications' })} notificationCount={notificationCount} />
        {isFullHeight ? (
          <div
            style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              paddingTop: 'calc(var(--miniapp-header-top-offset, 12px) + var(--miniapp-safe-top, var(--tg-safe-top, env(safe-area-inset-top, 0px))) + 58px)',
            }}
          >
            {content}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="scroll-area"
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
              paddingTop: 'calc(var(--miniapp-header-top-offset, 12px) + var(--miniapp-safe-top, var(--tg-safe-top, env(safe-area-inset-top, 0px))) + 58px)',
              paddingBottom: 'calc(88px + var(--miniapp-safe-bottom, var(--tg-safe-bottom, env(safe-area-inset-bottom, 0px))))',
              scrollPaddingTop: 'calc(var(--miniapp-header-top-offset, 12px) + var(--miniapp-safe-top, var(--tg-safe-top, env(safe-area-inset-top, 0px))) + 58px)',
            }}
          >
            {content}
          </div>
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
