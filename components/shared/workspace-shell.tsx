
'use client';

import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  CalendarClock,
  CalendarRange,
  ChevronDown,
  CreditCard,
  Globe2,
  Home,
  LayoutPanelTop,
  Link2,
  LogOut,
  Menu,
  MessageCircleMore,
  MessageSquareText,
  Package2,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Settings2,
  Sparkles,
  SquarePen,
  Users2,
  Wallet,
  Waypoints,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { SLOTY_DEMO_SLUG } from '@/lib/demo-data';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
import { isDashboardDemoEnabled, toggleDashboardDemoHref, withDashboardDemoParam } from '@/lib/dashboard-demo';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/shared/language-toggle';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { BrandLogo } from '@/components/brand/brand-logo';

interface WorkspaceShellProps {
  children: ReactNode;
  className?: string;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  variant?: 'default' | 'chat' | 'preview';
  exact?: boolean;
  soonBadge?: boolean;
  dashed?: boolean;
  forceActive?: boolean;
  skipActiveMatch?: boolean;
}

interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
  collapsible?: boolean;
  soonBadge?: boolean;
}

const STORAGE_KEY = 'sloty-shell-collapsed';
const GROUPS_STORAGE_KEY = 'sloty-shell-groups';

function getPathOnly(href: string) {
  return href.split('?')[0]?.split('#')[0] || href;
}

function isActive(pathname: string, href: string, exact = false) {
  const normalizedHref = getPathOnly(href);
  if (normalizedHref === '/') return pathname === '/';
  if (exact) return pathname === normalizedHref;
  return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
}

function DemoToggleHint({ locale }: { locale: 'ru' | 'en' }) {
  return (
    <motion.div
      aria-hidden="true"
      className="sidebar-demo-hint"
      animate={{ opacity: [0.52, 1, 0.52], scale: [0.985, 1, 0.985] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="sidebar-demo-hint-dot" />
      <span>{locale === 'ru' ? 'Демо-режим' : 'Demo mode'}</span>
    </motion.div>
  );
}

export function WorkspaceShell({ children, className }: WorkspaceShellProps) {
  const pathname = usePathname();
  const searchParams = useBrowserSearchParams();
  const demoMode = isDashboardDemoEnabled(searchParams);
  const { ownedProfile, getBookingsBySlug } = useApp();
  const { locale } = useLocale();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [groupStateReady, setGroupStateReady] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      setCollapsed(value === 'true');
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.slotySidebar = collapsed ? 'collapsed' : 'expanded';
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const publicHref = demoMode ? `/demo/${SLOTY_DEMO_SLUG}` : ownedProfile ? `/m/${ownedProfile.slug}` : '/create-profile';
  const profileHref = '/dashboard/profile';
  const profileBookings = ownedProfile ? getBookingsBySlug(ownedProfile.slug) : [];
  const newBookings = profileBookings.filter((item) => item.status === 'new').length;

  const labels = locale === 'ru'
    ? {
        shellTitle: 'Кабинет мастера',
        shellSubtitle: 'Рабочие разделы',
        menuTitle: 'Навигация',
        menuSubtitle: 'Рабочие разделы.',
        menuAction: 'Разделы',
        primaryNav: {
          home: 'Главная',
          today: 'Сегодня',
          chats: 'Чаты',
          clients: 'Клиенты',
          more: 'Ещё',
        },
        navigation: {
          publicPage: 'Публичная страница',
          overview: 'Обзор',
          general: 'Общее',
          business: 'Бизнес',
          analytics: 'Аналитика',
          subscription: 'Подписка',
          system: 'Система',
        },
        actions: {
          expandGroup: 'Показать раздел',
          collapseGroup: 'Скрыть раздел',
          expandMenu: 'Развернуть меню',
          collapseMenu: 'Свернуть меню',
          openMenu: 'Открыть навигацию',
          closeMenu: 'Закрыть навигацию',
          contextActions: 'Разделы',
        },
        items: {
          home: 'Главная',
          today: 'Записи на сегодня',
          stats: 'Статистика',
          profile: 'Профиль',
          appearance: 'Внешний вид',
          marketing: 'Продвижение',
          notifications: 'Уведомления',
          chats: 'Чаты',
          clients: 'Клиенты',
          services: 'Услуги',
          availability: 'График',
          templates: 'Шаблоны',
          finance: 'Финансы',
          sources: 'Источники',
          subscription: 'Тариф',
          payments: 'Платежи',
          limits: 'Лимиты',
          integrations: 'Интеграции',
          publicPage: demoMode || ownedProfile ? 'Публичная страница' : 'Настроить страницу',
          demoPage: 'Демо-режим',
        },
      }
    : {
        shellTitle: 'Master workspace',
        shellSubtitle: 'Work sections',
        menuTitle: 'Navigation',
        menuSubtitle: 'Work sections.',
        menuAction: 'Sections',
        primaryNav: {
          home: 'Home',
          today: 'Today',
          chats: 'Chats',
          clients: 'Clients',
          more: 'More',
        },
        navigation: {
          publicPage: 'Public page',
          overview: 'Overview',
          general: 'General',
          business: 'Business',
          analytics: 'Analytics',
          subscription: 'Subscription',
          system: 'System',
        },
        actions: {
          expandGroup: 'Expand section',
          collapseGroup: 'Collapse section',
          expandMenu: 'Expand menu',
          collapseMenu: 'Collapse menu',
          openMenu: 'Open navigation',
          closeMenu: 'Close navigation',
          contextActions: 'Sections',
        },
        items: {
          home: 'Home',
          today: 'Today bookings',
          stats: 'Statistics',
          profile: 'Profile',
          appearance: 'Appearance',
          marketing: 'Marketing',
          notifications: 'Notifications',
          chats: 'Chats',
          clients: 'Clients',
          services: 'Services',
          availability: 'Availability',
          templates: 'Templates',
          finance: 'Finance',
          sources: 'Sources',
          subscription: 'Plan',
          payments: 'Payments',
          limits: 'Limits',
          integrations: 'Integrations',
          publicPage: demoMode || ownedProfile ? 'Public page' : 'Setup page',
          demoPage: 'Demo mode',
        },
      };

  const soonLabel = locale === 'ru' ? 'Скоро' : 'Soon';
  const demoToggleHref = useMemo(
    () => toggleDashboardDemoHref(pathname, searchParams, demoMode),
    [demoMode, pathname, searchParams],
  );

  const navigationGroups = useMemo<NavigationGroup[]>(() => {
    const publicItems: NavigationItem[] = [
      {
        href: publicHref,
        label: labels.items.publicPage,
        icon: Globe2,
        badge: demoMode ? (locale === 'ru' ? 'демо' : 'demo') : ownedProfile ? (locale === 'ru' ? 'сайт' : 'live') : undefined,
        variant: 'preview',
      },
      {
        href: demoToggleHref,
        label: labels.items.demoPage,
        icon: Sparkles,
        badge: demoMode ? (locale === 'ru' ? 'вкл' : 'on') : locale === 'ru' ? 'демо' : 'demo',
        variant: 'preview',
        dashed: true,
        forceActive: demoMode,
        skipActiveMatch: true,
      },
    ];

    const overview: NavigationItem[] = [
      { href: withDashboardDemoParam('/dashboard', demoMode), label: labels.items.home, icon: Home, exact: true },
      { href: withDashboardDemoParam('/dashboard/today', demoMode), label: labels.items.today, icon: CalendarClock },
      { href: withDashboardDemoParam('/dashboard/stats', demoMode), label: labels.items.stats, icon: BarChart3, badge: newBookings > 0 ? String(newBookings) : undefined },
    ];

    const general: NavigationItem[] = [
      { href: withDashboardDemoParam('/dashboard/chats', demoMode), label: labels.items.chats, icon: MessageCircleMore, badge: locale === 'ru' ? 'бот' : 'bot', variant: 'chat' },
      { href: withDashboardDemoParam(profileHref, demoMode), label: labels.items.profile, icon: SquarePen },
      { href: withDashboardDemoParam('/dashboard/appearance', demoMode), label: labels.items.appearance, icon: LayoutPanelTop },
      { href: withDashboardDemoParam('/dashboard/marketing', demoMode), label: labels.items.marketing, icon: Link2 },
      { href: withDashboardDemoParam('/dashboard/notifications', demoMode), label: labels.items.notifications, icon: Bell },
    ];

    const business: NavigationItem[] = [
      { href: withDashboardDemoParam('/dashboard/clients', demoMode), label: labels.items.clients, icon: Users2 },
      { href: withDashboardDemoParam('/dashboard/services', demoMode), label: labels.items.services, icon: Package2 },
      { href: withDashboardDemoParam('/dashboard/availability', demoMode), label: labels.items.availability, icon: CalendarRange },
      { href: withDashboardDemoParam('/dashboard/templates', demoMode), label: labels.items.templates, icon: MessageSquareText },
    ];

    const analytics: NavigationItem[] = [
      { href: withDashboardDemoParam('/dashboard/finance', demoMode), label: labels.items.finance, icon: Wallet },
      { href: withDashboardDemoParam('/dashboard/sources', demoMode), label: labels.items.sources, icon: Waypoints },
    ];

    const subscription: NavigationItem[] = [
      { href: withDashboardDemoParam('/dashboard/subscription', demoMode), label: labels.items.subscription, icon: CreditCard },
      { href: withDashboardDemoParam('/dashboard/payments', demoMode), label: labels.items.payments, icon: ReceiptText },
      { href: withDashboardDemoParam('/dashboard/limits', demoMode), label: labels.items.limits, icon: Settings2 },
    ];

    const system: NavigationItem[] = [
      { href: withDashboardDemoParam('/dashboard/integrations', demoMode), label: labels.items.integrations, icon: Sparkles },
    ];

    return [
      { id: 'public', title: labels.navigation.publicPage, items: publicItems },
      { id: 'overview', title: labels.navigation.overview, items: overview },
      { id: 'general', title: labels.navigation.general, items: general },
      { id: 'business', title: labels.navigation.business, items: business, collapsible: true },
      { id: 'analytics', title: labels.navigation.analytics, items: analytics, collapsible: true, soonBadge: true },
      { id: 'subscription', title: labels.navigation.subscription, items: subscription, collapsible: true, soonBadge: true },
      { id: 'system', title: labels.navigation.system, items: system, collapsible: true, soonBadge: true },
    ];
  }, [
    demoMode,
    demoToggleHref,
    labels.items.appearance,
    labels.items.availability,
    labels.items.chats,
    labels.items.clients,
    labels.items.demoPage,
    labels.items.finance,
    labels.items.home,
    labels.items.integrations,
    labels.items.limits,
    labels.items.marketing,
    labels.items.notifications,
    labels.items.payments,
    labels.items.profile,
    labels.items.publicPage,
    labels.items.services,
    labels.items.sources,
    labels.items.stats,
    labels.items.subscription,
    labels.items.templates,
    labels.items.today,
    labels.navigation.analytics,
    labels.navigation.business,
    labels.navigation.general,
    labels.navigation.overview,
    labels.navigation.publicPage,
    labels.navigation.subscription,
    labels.navigation.system,
    locale,
    newBookings,
    ownedProfile,
    profileHref,
    publicHref,
  ]);

  const defaultOpenGroups = useMemo(() => {
    return navigationGroups.reduce<Record<string, boolean>>((accumulator, group) => {
      accumulator[group.id] = !group.collapsible || group.items.some((item) => isActive(pathname, item.href, item.exact));
      return accumulator;
    }, {});
  }, [navigationGroups, pathname]);

  useEffect(() => {
    if (groupStateReady) return;
    try {
      const raw = window.localStorage.getItem(GROUPS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as Record<string, boolean> : {};
      setOpenGroups({ ...defaultOpenGroups, ...parsed });
    } catch {
      setOpenGroups(defaultOpenGroups);
    }
    setGroupStateReady(true);
  }, [defaultOpenGroups, groupStateReady]);

  useEffect(() => {
    if (!groupStateReady) return;
    setOpenGroups((current) => {
      const next = { ...defaultOpenGroups, ...current };
      const activeGroup = navigationGroups.find((group) => group.items.some((item) => isActive(pathname, item.href, item.exact)));
      if (activeGroup) {
        next[activeGroup.id] = true;
      }
      return next;
    });
  }, [defaultOpenGroups, groupStateReady, navigationGroups, pathname]);

  useEffect(() => {
    if (!groupStateReady) return;
    try {
      window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(openGroups));
    } catch {}
  }, [groupStateReady, openGroups]);

  const activeItem = navigationGroups
    .flatMap((group) => group.items)
    .find((item) => !item.skipActiveMatch && isActive(pathname, item.href, item.exact));
  const activeGroup = navigationGroups.find((group) =>
    group.items.some((item) => !item.skipActiveMatch && isActive(pathname, item.href, item.exact)),
  );

  const desktopSidebarWidth = collapsed ? 'xl:w-[84px] 2xl:w-[88px]' : 'xl:w-[264px] 2xl:w-[280px]';
  const desktopMainPadding = collapsed ? 'xl:pl-[100px] 2xl:pl-[106px]' : 'xl:pl-[278px] 2xl:pl-[296px]';

  const handleGroupToggle = useCallback((group: NavigationGroup) => {
    if (!group.collapsible) return;
    setOpenGroups((current) => ({
      ...current,
      [group.id]: !current[group.id],
    }));
  }, []);

  const findItem = useCallback(
    (path: string) => navigationGroups.flatMap((group) => group.items).find((item) => getPathOnly(item.href) === path),
    [navigationGroups],
  );

  const homeItem = findItem('/dashboard') ?? navigationGroups[1]?.items[0];
  const todayItem = findItem('/dashboard/today');
  const chatsItem = findItem('/dashboard/chats');
  const clientsItem = findItem('/dashboard/clients');

  const mobilePrimaryItems = [
    homeItem ? { ...homeItem, shortLabel: labels.primaryNav.home } : null,
    todayItem ? { ...todayItem, shortLabel: labels.primaryNav.today } : null,
    chatsItem ? { ...chatsItem, shortLabel: labels.primaryNav.chats } : null,
    clientsItem ? { ...clientsItem, shortLabel: labels.primaryNav.clients } : null,
  ].filter(Boolean) as Array<NavigationItem & { shortLabel: string }>;


  const mobileContextItems = useMemo(() => {
    const uniqueItems = (items: Array<NavigationItem | null | undefined>) => {
      const seen = new Set<string>();
      return items.filter((item): item is NavigationItem => {
        if (!item) return false;
        const key = getPathOnly(item.href);
        if (seen.has(key)) return false;
        seen.add(key);
        return key !== getPathOnly(pathname);
      });
    };

    const publicItem = navigationGroups[0]?.items[0];

    if (pathname === '/dashboard') {
      return uniqueItems([
        findItem('/dashboard/today'),
        findItem('/dashboard/chats'),
        findItem('/dashboard/stats'),
      ]);
    }

    if (pathname.startsWith('/dashboard/today')) {
      return uniqueItems([
        findItem('/dashboard'),
        findItem('/dashboard/clients'),
        findItem('/dashboard/chats'),
      ]);
    }

    if (pathname.startsWith('/dashboard/stats')) {
      return uniqueItems([
        findItem('/dashboard/finance'),
        findItem('/dashboard/sources'),
        findItem('/dashboard/marketing'),
      ]);
    }

    if (pathname.startsWith('/dashboard/chats')) {
      return uniqueItems([
        findItem('/dashboard/templates'),
        findItem('/dashboard/clients'),
        findItem('/dashboard/profile'),
      ]);
    }

    if (pathname.startsWith('/dashboard/clients')) {
      return uniqueItems([
        findItem('/dashboard/today'),
        findItem('/dashboard/chats'),
        findItem('/dashboard/payments'),
      ]);
    }

    if (pathname.startsWith('/dashboard/profile')) {
      return uniqueItems([
        publicItem,
        findItem('/dashboard/appearance'),
        findItem('/dashboard/marketing'),
      ]);
    }

    if (pathname.startsWith('/dashboard/appearance')) {
      return uniqueItems([
        findItem('/dashboard/profile'),
        publicItem,
        findItem('/dashboard/templates'),
      ]);
    }

    if (pathname.startsWith('/dashboard/marketing')) {
      return uniqueItems([
        findItem('/dashboard/sources'),
        findItem('/dashboard/notifications'),
        publicItem,
      ]);
    }

    if (pathname.startsWith('/dashboard/notifications')) {
      return uniqueItems([
        findItem('/dashboard/templates'),
        findItem('/dashboard/chats'),
        findItem('/dashboard/profile'),
      ]);
    }

    if (pathname.startsWith('/dashboard/services')) {
      return uniqueItems([
        findItem('/dashboard/availability'),
        findItem('/dashboard/today'),
        publicItem,
      ]);
    }

    if (pathname.startsWith('/dashboard/availability')) {
      return uniqueItems([
        findItem('/dashboard/services'),
        findItem('/dashboard/today'),
        findItem('/dashboard/clients'),
      ]);
    }

    if (pathname.startsWith('/dashboard/templates')) {
      return uniqueItems([
        findItem('/dashboard/chats'),
        findItem('/dashboard/notifications'),
        findItem('/dashboard/marketing'),
      ]);
    }

    if (pathname.startsWith('/dashboard/finance')) {
      return uniqueItems([
        findItem('/dashboard/payments'),
        findItem('/dashboard/subscription'),
        findItem('/dashboard/stats'),
      ]);
    }

    if (pathname.startsWith('/dashboard/sources')) {
      return uniqueItems([
        findItem('/dashboard/marketing'),
        findItem('/dashboard/stats'),
        findItem('/dashboard/finance'),
      ]);
    }

    if (pathname.startsWith('/dashboard/subscription')) {
      return uniqueItems([
        findItem('/dashboard/payments'),
        findItem('/dashboard/limits'),
        findItem('/dashboard/finance'),
      ]);
    }

    if (pathname.startsWith('/dashboard/payments')) {
      return uniqueItems([
        findItem('/dashboard/subscription'),
        findItem('/dashboard/finance'),
        findItem('/dashboard/limits'),
      ]);
    }

    if (pathname.startsWith('/dashboard/limits')) {
      return uniqueItems([
        findItem('/dashboard/subscription'),
        findItem('/dashboard/integrations'),
        findItem('/dashboard/finance'),
      ]);
    }

    if (pathname.startsWith('/dashboard/integrations')) {
      return uniqueItems([
        findItem('/dashboard/notifications'),
        findItem('/dashboard/limits'),
        findItem('/dashboard/profile'),
      ]);
    }

    return uniqueItems([
      homeItem,
      todayItem,
      chatsItem,
    ]);
  }, [findItem, homeItem, navigationGroups, pathname, todayItem, chatsItem]);

  const mobileMenuGroups = useMemo(
    () =>
      navigationGroups
        .map((group) => {
          const seen = new Set<string>();
          const items = group.items.filter((item) => {
            const key = item.href;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          return {
            ...group,
            items,
          };
        })
        .filter((group) => group.items.length > 0),
    [navigationGroups],
  );

  const renderDesktopLink = (item: NavigationItem, mobile = false, itemKey?: string) => {
    const Icon = item.icon;
    const active = item.skipActiveMatch ? false : isActive(pathname, item.href, item.exact);
    const visualActive = item.forceActive || active;
    const isPreviewLink = item.variant === 'preview';

    return (
      <Link
        key={itemKey ?? item.href}
        href={item.href}
        data-nav-variant={item.variant ?? 'default'}
        onClick={() => {
          if (mobile) setMobileOpen(false);
        }}
        className={cn(
          'sidebar-link group/sidebar z-[1]',
          isPreviewLink && 'sidebar-link-preview',
          item.dashed && 'sidebar-link-preview-dashed',
          visualActive && 'sidebar-link-active',
          visualActive && isPreviewLink && 'sidebar-link-preview-active',
          visualActive && item.dashed && 'sidebar-link-preview-dashed-active',
          collapsed && !mobile && 'justify-center px-0',
        )}
        title={item.label}
        aria-current={active ? 'page' : undefined}
      >
        {visualActive ? (
          <motion.span
            layoutId={mobile ? 'sidebar-active-pill-mobile' : 'sidebar-active-pill-desktop'}
            transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.84 }}
            className={cn('sidebar-link-motion-bg', isPreviewLink && 'sidebar-link-motion-bg-preview')}
          >
            <span className="sidebar-link-motion-highlight" />
          </motion.span>
        ) : null}
        <Icon
          className={cn(
            'sidebar-link-icon relative z-10 size-4 shrink-0 transition-[color,transform,filter] duration-300',
            isPreviewLink && 'sidebar-link-icon-special',
            visualActive && 'sidebar-link-icon-active',
            isPreviewLink
              ? visualActive
                ? 'text-primary'
                : 'text-primary/85'
              : visualActive
                ? 'text-foreground'
                : 'text-muted-foreground',
          )}
        />
        {!collapsed || mobile ? (
          <>
            <span className="relative z-10 min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span
                className={cn(
                  'relative z-10 rounded-full border px-1.5 py-0.5 text-[10px]',
                  item.badge.toLowerCase() === 'live'
                    ? 'sidebar-badge-gradient'
                    : item.dashed
                      ? 'sidebar-badge-preview-dashed'
                      : isPreviewLink
                        ? 'sidebar-badge-preview'
                        : 'border-border bg-accent text-foreground',
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </>
        ) : null}
      </Link>
    );
  };

  const DesktopSidebar = () => (
    <div className="workspace-sidebar flex h-full flex-col gap-4">
      <div className={cn('workspace-sidebar-top px-1 pt-1', collapsed && 'px-0')}>
        {!collapsed ? (
          <div className="relative mb-2 min-h-[84px]">
            <Link href="/" className="flex items-center justify-center px-2 py-1.5 transition-opacity hover:opacity-90">
              <BrandLogo className="w-[68px] sm:w-[78px]" />
            </Link>
            <div className="absolute right-0 top-0">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => setCollapsed((value) => !value)}
                aria-label={collapsed ? labels.actions.expandMenu : labels.actions.collapseMenu}
                data-sidebar-toggle="true"
              >
                <PanelLeftClose className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-2 grid justify-items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? labels.actions.expandMenu : labels.actions.collapseMenu}
              data-sidebar-toggle="true"
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="workspace-sidebar-scroll scrollbar-thin min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        <div className="sidebar-nav-flow relative space-y-3">
          {navigationGroups.map((group) => {
            const groupOpen = group.soonBadge ? false : openGroups[group.id] ?? !group.collapsible;
            const groupHasActiveItem = group.items.some((item) => isActive(pathname, item.href, item.exact));

            return (
              <div key={group.id} className="space-y-1">
                {group.soonBadge ? (
                  !collapsed ? (
                    <div className="px-1">
                      <div aria-disabled="true" className="sidebar-link pointer-events-none opacity-90">
                        <span className="min-w-0 flex-1 truncate select-none blur-[2.2px] opacity-60">{group.title}</span>
                        <span className="rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-foreground/84 shadow-sm">
                          {soonLabel}
                        </span>
                      </div>
                    </div>
                  ) : null
                ) : (
                  !collapsed ? (
                    <div className="flex items-center gap-2 px-1.5">
                      <div className="workspace-group-label min-w-0 flex-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {group.title}
                      </div>
                      {group.collapsible ? (
                        <button
                          type="button"
                          onClick={() => handleGroupToggle(group)}
                          className={cn(
                            'inline-flex size-6 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:border-border hover:bg-accent hover:text-foreground',
                            groupHasActiveItem && 'text-foreground',
                          )}
                          aria-label={groupOpen ? labels.actions.collapseGroup : labels.actions.expandGroup}
                          aria-expanded={groupOpen}
                        >
                          <ChevronDown className={cn('size-3.5 transition-transform', groupOpen ? 'rotate-0' : '-rotate-90')} />
                        </button>
                      ) : null}
                    </div>
                  ) : null
                )}

                {!group.soonBadge && groupOpen ? (
                  <div className={cn('space-y-1', group.id === 'public' && !collapsed && 'sidebar-public-group')}>
                    {group.id === 'public' && !collapsed ? (
                      <div className="sidebar-public-hero-wrap">
                        <div className="sidebar-public-hero">
                          <div className="min-w-0 flex-1">
                            <div className="sidebar-public-hero-kicker">{locale === 'ru' ? 'Демо-режим' : 'Demo mode'}</div>
                            <div className="sidebar-public-hero-title">
                              {demoMode
                                ? locale === 'ru'
                                  ? 'Демо-режим включён'
                                  : 'Demo mode is on'
                                : locale === 'ru'
                                  ? 'Откройте демо-режим'
                                  : 'Open demo mode'}
                            </div>
                            <div className="sidebar-public-hero-text">
                              {demoMode
                                ? locale === 'ru'
                                  ? 'Разделы, чаты и запись уже заполнены готовыми примерами.'
                                  : 'Sections, chats, and bookings already contain ready-made examples.'
                                : locale === 'ru'
                                  ? 'Откройте примеры рабочего кабинета.'
                                  : 'Open ready-made workspace examples.'}
                            </div>
                          </div>
                          <div className="sidebar-public-hero-actions">
                            <Link href={demoToggleHref} className={cn('sidebar-public-hero-toggle', !demoMode && 'sidebar-public-hero-toggle-attention')}>
                              <Sparkles className="size-3.5" />
                              <span>{locale === 'ru' ? (demoMode ? 'Рабочий' : 'Демо') : demoMode ? 'Live' : 'Demo'}</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {group.items.map((item, index) => renderDesktopLink(item, false, `${group.id}-${index}-${item.href}`))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={cn('workspace-sidebar-footer shrink-0 px-1 pb-1 pt-2', collapsed && 'px-0 pb-0')}>
        {!collapsed ? (
          <div className="border-t border-border/72 pt-2">
            <div className="flex items-center justify-between gap-2">
              <LanguageToggle compact minimal className="shrink-0" />
              <ThemeToggle compact minimal className="shrink-0" />
              <Button asChild variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground">
                <Link href="/auth/signout" aria-label={locale === 'ru' ? 'Выйти' : 'Sign out'}>
                  <LogOut className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 border-t border-border/72 pt-2">
            <LanguageToggle iconOnly className="size-8" />
            <ThemeToggle iconOnly className="size-8" />
            <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground">
              <Link href="/auth/signout" aria-label={locale === 'ru' ? 'Выйти' : 'Sign out'}>
                <LogOut className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          'workspace-sidebar-panel panel-surface fixed inset-y-0 left-0 z-40 hidden overflow-hidden px-2.5 py-2.5 xl:block',
          desktopSidebarWidth,
        )}
      >
        <DesktopSidebar />
      </aside>

      <div
        className={cn(
          'workspace-mobile-overlay fixed inset-0 z-50 xl:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(false)}
      >
        <div className="workspace-mobile-overlay-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className={cn(
            'workspace-mobile-sheet panel-surface absolute inset-x-0 bottom-0 max-h-[92svh] overflow-hidden rounded-t-[24px] border border-border/85 px-3 pb-4 pt-3 shadow-[0_-18px_44px_rgba(0,0,0,0.28)] transition-transform duration-200',
            mobileOpen ? 'translate-y-0' : 'translate-y-full',
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border/90" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">{labels.menuTitle}</div>
              <div className="mt-1 line-clamp-2 text-[10.5px] leading-[1.15rem] text-muted-foreground">{labels.menuSubtitle}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground"
              onClick={() => setMobileOpen(false)}
              aria-label={labels.actions.closeMenu}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] border border-border/80 bg-card/74 px-3 py-2.5">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{activeGroup?.title ?? labels.navigation.overview}</div>
              <div className="truncate text-[13px] font-medium text-foreground">{activeItem?.label ?? labels.items.home}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <LanguageToggle compact minimal className="shrink-0" />
              <ThemeToggle compact minimal className="shrink-0" />
              <Button asChild variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground">
                <Link href="/auth/signout" aria-label={locale === 'ru' ? 'Выйти' : 'Sign out'}>
                  <LogOut className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-3 max-h-[calc(92svh-172px)] space-y-3 overflow-y-auto pr-1">
            {mobileMenuGroups.map((group) => {
              const groupOpen = group.soonBadge ? false : openGroups[group.id] ?? !group.collapsible;
              const groupHasActiveItem = group.items.some((item) => isActive(pathname, item.href, item.exact));

              return (
                <section key={group.id} className="space-y-1.5">
                  {group.soonBadge ? (
                    <div aria-disabled="true" className="workspace-mobile-sheet-group-disabled">
                      <span className="workspace-mobile-sheet-group-disabled-title">{group.title}</span>
                      <span className="workspace-mobile-sheet-group-disabled-badge">{soonLabel}</span>
                    </div>
                  ) : group.collapsible ? (
                    <button
                      type="button"
                      className={cn(
                        'workspace-mobile-sheet-group-button',
                        groupHasActiveItem && 'workspace-mobile-sheet-group-button-active',
                      )}
                      onClick={() => handleGroupToggle(group)}
                      aria-label={groupOpen ? labels.actions.collapseGroup : labels.actions.expandGroup}
                      aria-expanded={groupOpen}
                    >
                      <span>{group.title}</span>
                      <ChevronDown className={cn('size-3.5 transition-transform', groupOpen ? 'rotate-0' : '-rotate-90')} />
                    </button>
                  ) : (
                    <div className="workspace-mobile-sheet-group-label">{group.title}</div>
                  )}

                  {!group.soonBadge && groupOpen ? (
                    <div className="space-y-1.5">
                      {group.items.map((item, index) => renderDesktopLink(item, true, `${group.id}-${index}-${item.href}`))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <main
        className={cn('min-h-screen transition-[padding-left] duration-200', desktopMainPadding, className)}
        data-workspace-route={getPathOnly(pathname)}
      >
        <div className="xl:hidden">
          <div className="workspace-mobile-topbar sticky top-0 z-30 border-b border-border/70">
            <div className="flex h-[52px] items-center justify-between gap-2 px-2.5 pt-[env(safe-area-inset-top,0px)]">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => setMobileOpen(true)}
                  aria-label={labels.actions.openMenu}
                >
                  <Menu className="size-4" />
                </Button>
                <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
                  <BrandLogo className="w-[38px]" />
                  <div className="min-w-0">
                    <div className="truncate text-[11.5px] font-semibold text-foreground">{activeItem?.label ?? labels.items.home}</div>
                    <div className="truncate text-[9.5px] text-muted-foreground">{activeGroup?.title ?? labels.shellSubtitle}</div>
                  </div>
                </Link>
              </div>

              <Button asChild variant="outline" size="icon-sm" className="workspace-mobile-topbar-action size-8 shrink-0 rounded-full">
                <Link href={publicHref} aria-label={locale === 'ru' ? 'Страница' : 'Page'}>
                  <Globe2 className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="workspace-main-shell">{children}</div>
      </main>

      <nav className="workspace-mobile-tabs xl:hidden" aria-label={labels.menuTitle}>
        <div className="workspace-mobile-tabs-inner">
          {mobilePrimaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('workspace-mobile-tab', active && 'workspace-mobile-tab-active')}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative inline-flex">
                  <Icon className="size-4" />
                  {item.badge ? <span className="workspace-mobile-tab-dot">{item.badge}</span> : null}
                </span>
                <span>{item.shortLabel}</span>
              </Link>
            );
          })}

          <button
            type="button"
            className={cn('workspace-mobile-tab', mobileOpen && 'workspace-mobile-tab-active')}
            onClick={() => setMobileOpen(true)}
            aria-label={labels.primaryNav.more}
          >
            <Menu className="size-4" />
            <span>{labels.primaryNav.more}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
