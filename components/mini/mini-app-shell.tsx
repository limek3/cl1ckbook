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
      position: 'absolute', left: 0, right: 0, bottom: 'calc(96px + var(--miniapp-safe-bottom, var(--tg-safe-bottom, env(safe-area-inset-bottom, 0px))))', zIndex: 200,
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
  return {
    background: dark ? 'rgba(17,17,19,0.82)' : 'rgba(255,255,255,0.84)',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(10,10,12,0.08)'}`,
    backdropFilter: 'blur(30px) saturate(1.28)',
    WebkitBackdropFilter: 'blur(30px) saturate(1.28)',
    boxShadow: edge === 'top'
      ? (dark
        ? '0 18px 44px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06)'
        : '0 18px 44px rgba(20,20,30,0.08), inset 0 1px 0 rgba(255,255,255,0.72)')
      : (dark
        ? '0 -18px 44px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)'
        : '0 -18px 44px rgba(20,20,30,0.08), inset 0 1px 0 rgba(255,255,255,0.72)'),
    transform: 'translate3d(0,0,0)',
    willChange: 'backdrop-filter',
    isolation: 'isolate',
  };
}

interface SubRoute {
  kind: string;
  payload?: Thread;
}

// ─── Bottom Nav ──────────────────────────────
function BottomNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const { T, mode } = useTheme();
  const dark = mode === 'dark';

  return (
    <div style={{
      flexShrink: 0,
      zIndex: 80,
      padding: '8px 14px calc(12px + var(--miniapp-safe-bottom, var(--tg-safe-bottom, env(safe-area-inset-bottom, 0px))))',
    }}>
      <div style={{
        ...miniGlass(mode, 'bottom'),
        minHeight: 72,
        borderRadius: 24,
        padding: '7px 6px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'stretch',
      }}>
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { haptic('light'); onChange(t.id); }}
              style={{
                minWidth: 0,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                fontFamily: 'inherit',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{
                width: 46,
                height: 34,
                borderRadius: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive
                  ? (dark ? 'rgba(255,180,44,0.12)' : 'rgba(181,122,25,0.10)')
                  : 'transparent',
                border: isActive
                  ? `1px solid ${dark ? 'rgba(255,180,44,0.20)' : 'rgba(181,122,25,0.16)'}`
                  : '1px solid transparent',
                color: isActive ? T.accent : T.text3,
                boxShadow: isActive && dark ? '0 8px 20px rgba(0,0,0,0.24)' : 'none',
                transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
              }}>
                <Icon name={t.icon} size={20} stroke={isActive ? 2 : 1.55} />
              </span>
              <span style={{
                fontSize: 10.5,
                lineHeight: 1,
                fontWeight: isActive ? 650 : 450,
                color: isActive ? T.accent : T.text3,
                letterSpacing: isActive ? '-0.025em' : '-0.01em',
                transition: 'color 0.18s ease, font-weight 0.18s ease',
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Telegram-style header ───────────────────
type HeaderProfile = { name?: string; avatar?: string };

function TgHeader({
  onToggleTheme,
  onNotifications,
  notificationCount = 0,
  profile,
}: {
  onToggleTheme: () => void;
  onNotifications: () => void;
  notificationCount?: number;
  profile?: HeaderProfile;
}) {
  const { T, mode } = useTheme();
  const dark = mode === 'dark';
  const avatar = (profile?.avatar || '').trim();
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatar]);

  const iconBtn: CSSProperties = {
    width: 40,
    height: 40,
    background: dark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.035)',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
    borderRadius: 15,
    cursor: 'pointer',
    color: T.text2,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <div style={{
      flexShrink: 0,
      zIndex: 80,
      padding: 'calc(var(--miniapp-header-top-offset, 16px) + var(--miniapp-safe-top, var(--tg-safe-top, env(safe-area-inset-top, 0px)))) 14px 12px',
    }}>
      <div style={{
        ...miniGlass(mode, 'top'),
        minHeight: 72,
        borderRadius: 24,
        padding: '11px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 15,
            flexShrink: 0,
            overflow: 'hidden',
            background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.045)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: dark ? '0 10px 24px rgba(0,0,0,0.28)' : '0 10px 24px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: T.text,
            fontSize: 18,
            fontWeight: 780,
            letterSpacing: '-0.04em',
          }}>
            {avatar && !avatarFailed ? (
              <img
                src={avatar}
                alt={profile?.name || 'Профиль'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : 'К'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 17,
              fontWeight: 760,
              color: T.text,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>КликБук</div>
            <div style={{
              fontSize: 11,
              color: T.text3,
              marginTop: 4,
              letterSpacing: '0.035em',
              textTransform: 'uppercase',
            }}>mini app</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <button onClick={() => { haptic('light'); onNotifications(); }} aria-label="notifications" style={{ ...iconBtn, position: 'relative' }}>
            <Icon name="bell" size={17} stroke={1.65} />
            {notificationCount > 0 && (
              <span className="notif-badge" style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 17,
                height: 17,
                padding: '0 4px',
                borderRadius: 999,
                background: T.danger,
                color: '#fff',
                border: `2px solid ${T.bg}`,
                fontSize: 8.5,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontVariantNumeric: 'tabular-nums',
                boxShadow: `0 2px 8px ${T.danger}66`,
              }}>{notificationCount > 9 ? '9+' : notificationCount}</span>
            )}
          </button>
          <button onClick={onToggleTheme} aria-label="theme" style={iconBtn}>
            <Icon name={mode === 'dark' ? 'sun' : 'moon'} size={17} stroke={1.6} />
          </button>
          <button onClick={tgClose} style={{
            height: 40,
            paddingLeft: 17,
            paddingRight: 17,
            background: dark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.035)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            borderRadius: 15,
            cursor: 'pointer',
            color: T.text2,
            fontSize: 14,
            fontFamily: 'inherit',
            fontWeight: 650,
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>Закрыть</button>
          <button aria-label="more" style={iconBtn} onClick={() => haptic('light')}>
            <Icon name="more-vertical" size={18} stroke={1.65} />
          </button>
        </div>
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
  const { APPOINTMENTS, MASTER } = useMiniData();
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

      document.documentElement.style.setProperty('--miniapp-header-top-offset', isTelegramRuntime ? '58px' : '12px');
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
          .cb-miniapp, .cb-miniapp * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
          .cb-miniapp button:active { opacity: 0.7; transform: scale(0.94); }
          @keyframes badge-pop { 0% { transform: scale(0); } 70% { transform: scale(1.25); } 100% { transform: scale(1); } }
          .cb-miniapp .notif-badge { animation: badge-pop 0.28s cubic-bezier(.2,.8,.2,1) both; }
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
        <TgHeader onToggleTheme={toggle} onNotifications={() => setSub({ kind: 'notifications' })} notificationCount={notificationCount} profile={MASTER} />
        {isFullHeight ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
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
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
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
