// components/shared/workspace-shell.tsx
'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Bot,
  Bug,
  CalendarClock,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Globe2,
  HelpCircle,
  Home,
  Languages,
  LayoutPanelTop,
  LifeBuoy,
  Loader2,
  LogOut,
  Menu,
  MessageCircleMore,
  MessageSquareText,
  MonitorSmartphone,
  Moon,
  Package2,
  Search,
  Send,
  Settings2,
  Sparkles,
  SquarePen,
  SunMedium,
  Users2,
  X,
  type LucideIcon,
} from 'lucide-react';

import { useApp } from '@/lib/app-context';
import { SLOTY_DEMO_SLUG } from '@/lib/demo-data';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
import {
  isDashboardDemoEnabled,
  withDashboardDemoParam,
} from '@/lib/dashboard-demo';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/brand-logo';
import { WorkspaceAssistant } from '@/components/shared/workspace-assistant';

interface WorkspaceShellProps {
  children: ReactNode;
  className?: string;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
  forceActive?: boolean;
  skipActiveMatch?: boolean;
}

interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
}

type ReportCategory = 'bug' | 'idea' | 'question';
type ThemeOption = 'light' | 'dark' | 'system';
type SidebarScope = 'main' | 'profile';
type AccountPanelView = 'menu' | 'report' | 'faq';

const SIDEBAR_WIDTH = 344;

const SHIMMER_CSS = [
  '@keyframes cb-robo-soft-pulse {',
  '  0%, 100% { opacity: 0.42; transform: scale(1); }',
  '  50% { opacity: 0.78; transform: scale(1.14); }',
  '}',
  '',
  '.cb-robo-soft-glow {',
  '  animation: cb-robo-soft-pulse 3.8s ease-in-out infinite;',
  '}',
].join('\n');

function getPathOnly(href: string) {
  return href.split('?')[0]?.split('#')[0] || href;
}

function isActive(pathname: string, href: string, exact = false) {
  const cleanHref = getPathOnly(href);

  if (cleanHref === '/') return pathname === '/';
  if (exact) return pathname === cleanHref;

  return pathname === cleanHref || pathname.startsWith(cleanHref + '/');
}

function ActiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute bottom-[1px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-black dark:bg-white',
        className,
      )}
    />
  );
}

function SidebarDivider({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('h-3', className)} />;
}

function FooterHairline() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'mb-2 h-px w-full overflow-hidden rounded-full',
        'bg-gradient-to-r from-transparent via-black/[0.12] to-transparent',
        'dark:via-white/[0.14]',
      )}
    />
  );
}

function DropdownDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'mx-1 my-1 h-px bg-black/[0.08] dark:bg-white/[0.09]',
        className,
      )}
    />
  );
}

function BotBadge({
  locale,
  active,
}: {
  locale: 'ru' | 'en';
  active: boolean;
}) {
  return (
    <span
      className={cn(
        'ml-auto shrink-0 text-[9px] font-semibold leading-none tracking-[-0.015em]',
        active
          ? 'text-white/62 dark:text-black/52'
          : 'text-slate-400 dark:text-white/28',
      )}
    >
      [{locale === 'ru' ? 'бот' : 'bot'}]
    </span>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-black/28 dark:text-white/24" />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-[10px] border pl-8 pr-8 text-[12px] outline-none transition',
          'border-black/[0.07] bg-black/[0.025] text-slate-950 placeholder:text-black/30',
          'focus:border-black/[0.14] focus:bg-white',
          'dark:border-white/[0.075] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/24 dark:focus:border-white/[0.14]',
        )}
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-[8px] text-black/35 transition hover:bg-black/[0.055] hover:text-black dark:text-white/30 dark:hover:bg-white/[0.07] dark:hover:text-white"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function ModePanel({
  locale,
  selectedMode,
  liveHref,
  demoHref,
  onNavigate,
}: {
  locale: 'ru' | 'en';
  selectedMode: 'live' | 'demo';
  liveHref: string;
  demoHref: string;
  onNavigate?: () => void;
}) {
  const options = [
    {
      value: 'live' as const,
      href: liveHref,
      label: locale === 'ru' ? 'Рабочий' : 'Live',
      caption: locale === 'ru' ? 'боевой кабинет' : 'real workspace',
      title: locale === 'ru' ? 'Рабочий режим' : 'Live mode',
      icon: Globe2,
    },
    {
      value: 'demo' as const,
      href: demoHref,
      label: locale === 'ru' ? 'Демо' : 'Demo',
      caption: locale === 'ru' ? 'пример профиля' : 'sample profile',
      title: locale === 'ru' ? 'Демо режим' : 'Demo mode',
      icon: Sparkles,
    },
  ];

  return (
    <div className="mt-4">
      <div className="mb-1.5 px-1 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-black/32 dark:text-white/22">
        {locale === 'ru' ? 'Режимы' : 'Modes'}
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-[13px] border border-black/[0.07] bg-[#fbfbfa] p-1 shadow-[0_8px_24px_rgba(15,23,42,0.035)] dark:border-white/[0.075] dark:bg-[#101010] dark:shadow-none">
        {options.map((option) => {
          const active = selectedMode === option.value;
          const Icon = option.icon;

          return (
            <Link
              key={option.value}
              href={option.href}
              onClick={onNavigate}
              prefetch={false}
              scroll={false}
              aria-current={active ? 'page' : undefined}
              title={option.title}
              className={cn(
                'group relative flex min-h-[54px] flex-col justify-center rounded-[10px] px-2.5 py-2 transition active:scale-[0.99]',
                active
                  ? 'bg-black/[0.045] text-slate-950 dark:bg-white/[0.06] dark:text-white'
                  : 'text-slate-500 hover:bg-black/[0.025] hover:text-slate-950 dark:text-white/36 dark:hover:bg-white/[0.045] dark:hover:text-white',
              )}
            >
              <span className="flex items-center gap-1.5">
                <Icon
                  className={cn(
                    'size-3.5 stroke-[1.8] transition',
                    active
                      ? 'text-slate-950 dark:text-white'
                      : 'text-slate-400 group-hover:text-slate-700 dark:text-white/28 dark:group-hover:text-white/70',
                  )}
                />

                <span className="text-[12px] font-semibold tracking-[-0.04em]">
                  {option.label}
                </span>
              </span>

              <span
                className={cn(
                  'mt-1 truncate text-[9.5px] leading-none',
                  active
                    ? 'text-slate-500 dark:text-white/38'
                    : 'text-slate-400 dark:text-white/24',
                )}
              >
                {option.caption}
              </span>

              {active ? <ActiveDot className="bottom-[5px]" /> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NavRow({
  item,
  active,
  locale,
  onNavigate,
}: {
  item: NavigationItem;
  active: boolean;
  locale: 'ru' | 'en';
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const isBotBadge = item.badge?.toLowerCase() === 'bot';

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.label}
      aria-current={active ? 'page' : undefined}
      prefetch={false}
      scroll={false}
      className={cn(
        'group relative flex h-8 items-center gap-2 rounded-[9px] px-2 text-[12px] font-medium tracking-[-0.025em] transition active:scale-[0.99]',
        active
          ? 'cb-neutral-primary'
          : 'text-slate-600 hover:bg-black/[0.045] hover:text-slate-950 dark:text-white/42 dark:hover:bg-white/[0.055] dark:hover:text-white',
      )}
    >
      <Icon
        className={cn(
          'size-3.5 shrink-0 transition',
          active
            ? 'text-current'
            : 'text-slate-400 group-hover:text-slate-950 dark:text-white/28 dark:group-hover:text-white',
        )}
      />

      <span className="min-w-0 flex flex-1 items-center">
        <span className="truncate">{item.label}</span>
        {isBotBadge ? <BotBadge locale={locale} active={active} /> : null}
      </span>

      {item.badge && !isBotBadge ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[8px] font-semibold leading-none',
            active
              ? 'bg-white/18 text-current dark:bg-black/15'
              : 'bg-black/[0.055] text-slate-500 dark:bg-white/[0.075] dark:text-white/45',
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavGroup({
  title,
  items,
  pathname,
  locale,
  onNavigate,
}: {
  title: string;
  items: NavigationItem[];
  pathname: string;
  locale: 'ru' | 'en';
  onNavigate?: () => void;
}) {
  return (
    <section>
      <div className="mb-1.5 px-2 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-black/32 dark:text-white/22">
        {title}
      </div>

      <div className="space-y-0.5">
        {items.map((item) => (
          <NavRow
            key={item.href}
            item={item}
            active={Boolean(
              item.forceActive || isActive(pathname, item.href, item.exact),
            )}
            locale={locale}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}

function PublicLink({
  item,
  active,
  description,
  onNavigate,
}: {
  item: NavigationItem;
  active: boolean;
  description: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      prefetch={false}
      scroll={false}
      className={cn(
        'group flex items-center justify-between gap-2 rounded-[11px] border p-2.5 transition active:scale-[0.99]',
        active
          ? 'cb-neutral-primary'
          : 'border-black/[0.07] bg-black/[0.018] hover:border-black/[0.11] hover:bg-black/[0.035] dark:border-white/[0.075] dark:bg-white/[0.03] dark:hover:border-white/[0.11] dark:hover:bg-white/[0.05]',
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-[9px]',
            active
              ? 'bg-white/18 text-current dark:bg-black/15'
              : 'bg-black/[0.045] text-slate-500 dark:bg-white/[0.055] dark:text-white/36',
          )}
        >
          <Globe2 className="size-3.5" />
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[12px] font-semibold tracking-[-0.035em]">
            {item.label}
          </span>

          <span
            className={cn(
              'mt-0.5 block truncate text-[10px]',
              active ? 'text-current/68' : 'text-slate-500 dark:text-white/30',
            )}
          >
            {description}
          </span>
        </span>
      </span>

      <ExternalLink className="size-3 shrink-0 opacity-40 transition group-hover:opacity-100" />
    </Link>
  );
}

function ProfileScopeContent({
  groups,
  pathname,
  locale,
  backLabel,
  backHref,
  noResultsLabel,
  publicDescription,
  publicPageItem,
  publicPageActive,
  onNavigate,
}: {
  groups: NavigationGroup[];
  pathname: string;
  locale: 'ru' | 'en';
  backLabel: string;
  backHref: string;
  noResultsLabel: string;
  publicDescription: string;
  publicPageItem: NavigationItem;
  publicPageActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <PublicLink
        item={publicPageItem}
        active={publicPageActive}
        description={publicDescription}
        onNavigate={onNavigate}
      />

      <SidebarDivider />

      <Link
        href={backHref}
        onClick={onNavigate}
        prefetch={false}
        scroll={false}
        className="group flex h-9 items-center gap-2 rounded-[10px] px-2 text-[12px] font-medium text-slate-500 transition hover:bg-black/[0.045] hover:text-slate-950 active:scale-[0.99] dark:text-white/36 dark:hover:bg-white/[0.055] dark:hover:text-white"
      >
        <ArrowLeft className="size-3.5 shrink-0 transition group-hover:-translate-x-0.5" />
        <span className="truncate">{backLabel}</span>
      </Link>

      <SidebarDivider />

      {groups.length ? (
        <div>
          {groups.map((group, index) => (
            <div key={group.id}>
              {index > 0 ? <SidebarDivider /> : null}

              <NavGroup
                title={group.title}
                items={group.items}
                pathname={pathname}
                locale={locale}
                onNavigate={onNavigate}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptySearch>{noResultsLabel}</EmptySearch>
      )}
    </div>
  );
}

function getWorkspaceIdentity(profile: unknown, locale: 'ru' | 'en') {
  const data = (profile ?? {}) as Record<string, unknown>;

  const name =
    (typeof data.name === 'string' && data.name.trim()) ||
    (typeof data.masterName === 'string' && data.masterName.trim()) ||
    (typeof data.title === 'string' && data.title.trim()) ||
    (typeof data.displayName === 'string' && data.displayName.trim()) ||
    (locale === 'ru' ? 'Кабинет' : 'Workspace');

  const slug =
    typeof data.slug === 'string' && data.slug.trim()
      ? data.slug.trim()
      : locale === 'ru'
        ? 'рабочий профиль'
        : 'working profile';

  const avatar =
    typeof data.avatar === 'string' && data.avatar.trim()
      ? data.avatar.trim()
      : undefined;

  return {
    name,
    subtitle: slug.startsWith('@') ? slug : `@${slug}`,
    initial: name.trim().slice(0, 1).toUpperCase() || 'К',
    avatar,
  };
}

function WorkspaceIdentityAvatar({
  identity,
  size = 'sm',
}: {
  identity: {
    name: string;
    initial: string;
    avatar?: string;
  };
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border font-bold',
        size === 'md'
          ? 'size-9 rounded-[11px] text-[12px]'
          : 'size-8 rounded-[10px] text-[11px]',
        'border-black/[0.08] bg-[#fbfbfa] text-black/72',
        'dark:border-white/[0.09] dark:bg-[#101010] dark:text-white/78',
      )}
    >
      {identity.avatar ? (
        <img src={identity.avatar} alt={identity.name} className="h-full w-full object-cover" />
      ) : (
        identity.initial
      )}
    </span>
  );
}

function AccountThemeIcon({ value }: { value: ThemeOption }) {
  if (value === 'light') {
    return <SunMedium className="size-[13px] stroke-[1.9]" />;
  }

  if (value === 'dark') {
    return <Moon className="size-[13px] stroke-[1.9]" />;
  }

  return <MonitorSmartphone className="size-[13px] stroke-[1.9]" />;
}

function AccountInlineSegment<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{
    value: T;
    label: string;
    icon?: ReactNode;
  }>;
  onChange: (value: T) => void;
}) {
  return (
    <div
      className={cn(
        'inline-grid rounded-[10px] border p-0.5',
        'border-black/[0.07] bg-black/[0.025]',
        'dark:border-white/[0.08] dark:bg-white/[0.04]',
      )}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            title={option.label}
            className={cn(
              'relative flex h-7 min-w-8 items-center justify-center gap-1 rounded-[8px] px-2 text-[10px] font-semibold transition active:scale-[0.96]',
              active
                ? 'bg-[#fbfbfa] text-black shadow-[0_8px_20px_rgba(15,15,15,0.07)] dark:bg-white/[0.115] dark:text-white dark:shadow-none'
                : 'text-black/38 hover:bg-black/[0.035] hover:text-black dark:text-white/34 dark:hover:bg-white/[0.06] dark:hover:text-white',
            )}
          >
            {option.icon ? (
              <span className="flex shrink-0 items-center justify-center">
                {option.icon}
              </span>
            ) : null}

            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AccountMenuRow({
  icon: Icon,
  label,
  hint,
  href,
  external = false,
  danger = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  href?: string;
  external?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-[10px] border transition',
          'border-black/[0.06] bg-black/[0.025] text-black/42',
          'group-hover:border-black/[0.08] group-hover:bg-black/[0.045] group-hover:text-black',
          'dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/40',
          'dark:group-hover:border-white/[0.11] dark:group-hover:bg-white/[0.065] dark:group-hover:text-white',
          danger &&
            'text-red-500/70 group-hover:text-red-600 dark:text-red-300/70 dark:group-hover:text-red-200',
        )}
      >
        <Icon className="size-[14px] stroke-[1.85]" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-[12px] font-semibold leading-none tracking-[-0.03em]',
            danger
              ? 'text-red-600 dark:text-red-200'
              : 'text-black/78 group-hover:text-black dark:text-white/76 dark:group-hover:text-white',
          )}
        >
          {label}
        </span>

        {hint ? (
          <span className="mt-1 block truncate text-[9.5px] font-medium leading-none text-black/38 dark:text-white/30">
            {hint}
          </span>
        ) : null}
      </span>

      {external ? (
        <ExternalLink className="size-3 shrink-0 text-black/28 transition group-hover:text-black/50 dark:text-white/24 dark:group-hover:text-white/50" />
      ) : (
        <ChevronRight className="size-3 shrink-0 text-black/24 transition group-hover:translate-x-0.5 group-hover:text-black/50 dark:text-white/22 dark:group-hover:text-white/48" />
      )}
    </>
  );

  const className = cn(
    'group flex w-full items-center gap-2 rounded-[11px] px-2 py-2 text-left outline-none',
    'transition-[background-color,color,transform] duration-150 active:scale-[0.99]',
    'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
  );

  if (href) {
    return (
      <Link
        href={href}
        prefetch={false}
        scroll={false}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        onClick={() => onClick?.()}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function AccountFooterMenu({ locale }: { locale: 'ru' | 'en' }) {
  const rawPathname = usePathname();
  const pathname = rawPathname || '/dashboard';
  const searchParams = useBrowserSearchParams();
  const { ownedProfile } = useApp();
  const { theme, setTheme } = useTheme();
  const { locale: currentLocale, setLocale } = useLocale();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AccountPanelView>('menu');
  const [openFaqKey, setOpenFaqKey] = useState('start');
  const [reportCategory, setReportCategory] = useState<ReportCategory>('bug');
  const [reportText, setReportText] = useState('');
  const [contactText, setContactText] = useState('');
  const [reportStatus, setReportStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle');
  const [reportError, setReportError] = useState('');

  const rootRef = useRef<HTMLDivElement | null>(null);

  const demoMode = isDashboardDemoEnabled(searchParams);
  const identity = getWorkspaceIdentity(ownedProfile, locale);

  const publicHref = demoMode
    ? '/demo/' + SLOTY_DEMO_SLUG
    : ownedProfile
      ? '/m/' + ownedProfile.slug
      : '/create-profile';

  const currentTheme = mounted ? ((theme || 'system') as ThemeOption) : 'system';
  const safeLocale: 'ru' | 'en' = currentLocale === 'en' ? 'en' : 'ru';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setView('menu');
      }
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setView('menu');
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const labels =
    locale === 'ru'
      ? {
          account: 'Аккаунт',
          workspace: 'кабинет',
          menu: 'Меню аккаунта',
          feedback: 'Связь',
          feedbackHint: 'ошибка, идея или вопрос',
          theme: 'Тема',
          language: 'Язык',
          light: 'Свет',
          dark: 'Тёмн',
          system: 'Авто',
          home: 'Главная',
          homeHint: 'вернуться в кабинет',
          publicPage: 'Публичная страница',
          publicHint: 'как страницу будут видеть клиенты',
          changelog: 'Обновления',
          changelogHint: 'что появилось в КликБук',
          help: 'Помощь',
          helpHint: 'быстрые ответы',
          docs: 'Инструкции',
          docsHint: 'как настроить кабинет',
          logout: 'Выйти',
          logoutHint: 'завершить сессию',
          upgrade: 'Upgrade to Pro',
          status: 'Статус платформы',
          statusText: 'Все системы работают.',
          robo: 'Робо',
          roboHint: 'помощник по кабинету',
          back: 'Назад',
          reportTitle: 'Отправить сообщение',
          reportHint: 'Сообщение уйдёт в поддержку вместе с текущим экраном.',
          reportPlaceholder:
            'Например: не открывается запись, не сохраняется услуга, странно работает тема...',
          contactPlaceholder: 'Контакт для ответа: Telegram / email / телефон',
          send: 'Отправить',
          sending: 'Отправляю',
          sent: 'Готово, сообщение отправлено',
          sentHint: 'Поддержка получила обращение.',
          validation: 'Опиши ситуацию чуть подробнее.',
          error: 'Не удалось отправить. Проверь /api/support/report и env.',
          categories: {
            bug: 'Ошибка',
            idea: 'Идея',
            question: 'Вопрос',
          },
          faqTitle: 'Помощь и инструкции',
          faqHint: 'Коротко по основным действиям.',
        }
      : {
          account: 'Account',
          workspace: 'workspace',
          menu: 'Account menu',
          feedback: 'Связь',
          feedbackHint: 'bug, idea or question',
          theme: 'Theme',
          language: 'Language',
          light: 'Light',
          dark: 'Dark',
          system: 'Auto',
          home: 'Home Page',
          homeHint: 'return to workspace',
          publicPage: 'Public page',
          publicHint: 'client page',
          changelog: 'Changelog',
          changelogHint: 'latest ClickBook updates',
          help: 'Help',
          helpHint: 'quick answers',
          docs: 'Docs',
          docsHint: 'workspace guides',
          logout: 'Log Out',
          logoutHint: 'end current session',
          upgrade: 'Upgrade to Pro',
          status: 'Platform Status',
          statusText: 'All systems normal.',
          robo: 'Robo',
          roboHint: 'workspace assistant',
          back: 'Back',
          reportTitle: 'Send feedback',
          reportHint: 'The message will include your current screen.',
          reportPlaceholder:
            'For example: booking does not open, service is not saved, theme behaves incorrectly...',
          contactPlaceholder: 'Contact for reply: Telegram / email / phone',
          send: 'Send',
          sending: 'Sending',
          sent: 'Done, message sent',
          sentHint: 'Support received your message.',
          validation: 'Describe the situation in more detail.',
          error: 'Could not send. Check /api/support/report and env.',
          categories: {
            bug: 'Bug',
            idea: 'Idea',
            question: 'Question',
          },
          faqTitle: 'Help and docs',
          faqHint: 'Short guides for core actions.',
        };

  const themeOptions = useMemo<
    Array<{
      value: ThemeOption;
      label: string;
      icon: ReactNode;
    }>
  >(
    () => [
      {
        value: 'light',
        label: labels.light,
        icon: <AccountThemeIcon value="light" />,
      },
      {
        value: 'dark',
        label: labels.dark,
        icon: <AccountThemeIcon value="dark" />,
      },
      {
        value: 'system',
        label: labels.system,
        icon: <AccountThemeIcon value="system" />,
      },
    ],
    [labels.dark, labels.light, labels.system],
  );

  const localeOptions = useMemo(
    () => [
      {
        value: 'ru' as const,
        label: 'RU',
      },
      {
        value: 'en' as const,
        label: 'EN',
      },
    ],
    [],
  );

  const faqItems =
    locale === 'ru'
      ? [
          {
            key: 'start',
            title: 'С чего начать настройку?',
            text:
              'Открой «Профиль», заполни имя, описание, контакты и адрес. Потом перейди в «Услуги» и добавь позиции, по которым клиенты смогут записываться.',
          },
          {
            key: 'public',
            title: 'Как посмотреть страницу клиента?',
            text:
              'Нажми «Публичная». Это страница, которую получает клиент: услуги, свободное время и форма записи.',
          },
          {
            key: 'theme',
            title: 'Где менять внешний вид?',
            text:
              'В разделе «Внешний вид» можно настроить тему, акцент, плотность интерфейса и оформление публичной страницы.',
          },
          {
            key: 'robo',
            title: 'Что делает Робо?',
            text:
              'Робо помогает по кабинету: подсказывает, куда перейти, что заполнить, как исправить ошибку и как настроить запись.',
          },
        ]
      : [
          {
            key: 'start',
            title: 'Where should I start?',
            text:
              'Open “Profile”, fill in your name, description, contacts and address. Then add bookable items in “Services”.',
          },
          {
            key: 'public',
            title: 'How do I preview the client page?',
            text:
              'Click “Public”. This is the page clients see: services, available slots and the booking form.',
          },
          {
            key: 'theme',
            title: 'Where do I change appearance?',
            text:
              'Open “Appearance” to configure theme, accent, density and public page styling.',
          },
          {
            key: 'robo',
            title: 'What does Robo do?',
            text:
              'Robo helps with the workspace: where to click, what to fill in, how to fix issues and configure bookings.',
          },
        ];

  const openRobo = () => {
    window.dispatchEvent(new CustomEvent('clickbook:open-robo'));

    const trigger = document.querySelector<HTMLElement>(
      '[data-workspace-assistant-trigger], [data-robo-trigger], #workspace-assistant-trigger',
    );

    trigger?.click();
    setOpen(false);
    setView('menu');
  };

  const handleSendReport = async () => {
    const cleanText = reportText.trim();

    if (cleanText.length < 8) {
      setReportStatus('error');
      setReportError(labels.validation);
      return;
    }

    try {
      setReportStatus('sending');
      setReportError('');

      const response = await fetch('/api/support/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: reportCategory,
          message: cleanText,
          contact: contactText.trim(),
          path: pathname,
          locale,
          userAgent: window.navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send report');
      }

      setReportStatus('success');
      setReportText('');
      setContactText('');
    } catch {
      setReportStatus('error');
      setReportError(labels.error);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={cn(
          'absolute bottom-[calc(100%+10px)] left-0 z-50 w-[292px] origin-bottom-left overflow-hidden rounded-[15px] border p-1 backdrop-blur-[24px] transition duration-150',
          'border-black/[0.09] bg-[#fbfbfa]/88 text-black shadow-[0_24px_80px_rgba(15,15,15,0.12)]',
          'dark:border-white/[0.10] dark:bg-[#101010]/88 dark:text-white dark:shadow-[0_28px_90px_rgba(0,0,0,0.58)]',
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-1.5 scale-[0.985] opacity-0',
        )}
      >
        {view === 'menu' ? (
          <>
            <div className="px-2.5 pb-2 pt-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <WorkspaceIdentityAvatar identity={identity} size="md" />

                  <span className="min-w-0 pt-0.5">
                    <span className="block truncate text-[13px] font-semibold leading-none tracking-[-0.04em]">
                      {identity.name}
                    </span>

                    <span className="mt-1.5 block text-[10px] font-medium leading-[1.2] text-black/42 dark:text-white/32">
                      {identity.subtitle}
                    </span>
                  </span>
                </div>

                <Link
                  href={withDashboardDemoParam('/dashboard/profile', demoMode)}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-black/40 transition hover:bg-black/[0.045] hover:text-black active:scale-[0.96] dark:text-white/36 dark:hover:bg-white/[0.07] dark:hover:text-white"
                  title={labels.account}
                >
                  <Settings2 className="size-[15px] stroke-[1.85]" />
                </Link>
              </div>
            </div>

            <DropdownDivider />

            <div className="px-1 py-1">
              <AccountMenuRow
                icon={MessageCircleMore}
                label={labels.feedback}
                hint={labels.feedbackHint}
                onClick={() => {
                  setReportCategory('bug');
                  setReportStatus('idle');
                  setReportError('');
                  setView('report');
                }}
              />

              <div className="my-1 rounded-[12px] px-2 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.06] bg-black/[0.025] text-black/42 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/40">
                      <SunMedium className="size-[14px] stroke-[1.85]" />
                    </span>

                    <span className="text-[12px] font-semibold tracking-[-0.03em] text-black/78 dark:text-white/76">
                      {labels.theme}
                    </span>
                  </div>

                  <AccountInlineSegment
                    value={currentTheme}
                    options={themeOptions}
                    onChange={(value) => setTheme(value)}
                  />
                </div>
              </div>

              <div className="my-1 rounded-[12px] px-2 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.06] bg-black/[0.025] text-black/42 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white/40">
                      <Languages className="size-[14px] stroke-[1.85]" />
                    </span>

                    <span className="text-[12px] font-semibold tracking-[-0.03em] text-black/78 dark:text-white/76">
                      {labels.language}
                    </span>
                  </div>

                  <AccountInlineSegment
                    value={safeLocale}
                    options={localeOptions}
                    onChange={(value) => setLocale(value)}
                  />
                </div>
              </div>

              <DropdownDivider />

              <AccountMenuRow
                icon={Home}
                label={labels.home}
                hint={labels.homeHint}
                href={withDashboardDemoParam('/dashboard', demoMode)}
                onClick={() => setOpen(false)}
              />

              <AccountMenuRow
                icon={Globe2}
                label={labels.publicPage}
                hint={labels.publicHint}
                href={publicHref}
                onClick={() => setOpen(false)}
              />

              <AccountMenuRow
                icon={Sparkles}
                label={labels.changelog}
                hint={labels.changelogHint}
                onClick={() => {
                  setOpenFaqKey('start');
                  setView('faq');
                }}
              />

              <AccountMenuRow
                icon={LifeBuoy}
                label={labels.help}
                hint={labels.helpHint}
                onClick={() => {
                  setOpenFaqKey('start');
                  setView('faq');
                }}
              />

              <AccountMenuRow
                icon={HelpCircle}
                label={labels.docs}
                hint={labels.docsHint}
                onClick={() => {
                  setOpenFaqKey('public');
                  setView('faq');
                }}
              />

              <DropdownDivider />

              <AccountMenuRow
                icon={LogOut}
                label={labels.logout}
                hint={labels.logoutHint}
                href="/auth/signout"
                danger
              />
            </div>

            <div className="px-1.5 pb-1.5 pt-1">
              <Link
                href={withDashboardDemoParam('/dashboard/subscription', demoMode)}
                prefetch={false}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex h-9 w-full items-center justify-center rounded-[10px] text-[12px] font-semibold tracking-[-0.03em] transition active:scale-[0.99]',
                  'bg-black text-white hover:bg-black/88',
                  'dark:bg-white dark:text-black dark:hover:bg-white/88',
                )}
              >
                {labels.upgrade}
              </Link>
            </div>

            <DropdownDivider />

            <div className="px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11.5px] font-medium text-black/52 dark:text-white/46">
                    {labels.status}
                  </div>

                  <div className="mt-1 text-[12px] font-semibold tracking-[-0.035em] text-black dark:text-white">
                    {labels.statusText}
                  </div>
                </div>

                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </>
        ) : null}

        {view === 'report' ? (
          <div>
            <div className="flex items-center gap-2 px-1.5 pb-2 pt-1.5">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-black/42 transition hover:bg-black/[0.045] hover:text-black dark:text-white/36 dark:hover:bg-white/[0.075] dark:hover:text-white"
                aria-label={labels.back}
              >
                <ArrowLeft className="size-3.5" />
              </button>

              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-none tracking-[-0.04em] text-black dark:text-white">
                  {labels.reportTitle}
                </span>

                <span className="mt-1 block truncate text-[10px] text-black/42 dark:text-white/32">
                  {labels.reportHint}
                </span>
              </span>
            </div>

            <DropdownDivider />

            <div className="space-y-2 px-1.5 py-1.5">
              <div className="grid grid-cols-3 gap-1">
                {(['bug', 'idea', 'question'] as ReportCategory[]).map(
                  (category) => {
                    const active = reportCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setReportCategory(category)}
                        className={cn(
                          'relative h-8 rounded-[9px] text-[10px] font-medium transition active:scale-[0.98]',
                          active
                            ? 'text-black dark:text-white'
                            : 'text-black/40 hover:bg-black/[0.035] hover:text-black dark:text-white/34 dark:hover:bg-white/[0.055] dark:hover:text-white',
                        )}
                      >
                        {labels.categories[category]}
                        {active ? <ActiveDot /> : null}
                      </button>
                    );
                  },
                )}
              </div>

              <textarea
                value={reportText}
                onChange={(event) => {
                  setReportText(event.target.value);
                  if (reportStatus === 'error') {
                    setReportStatus('idle');
                    setReportError('');
                  }
                }}
                placeholder={labels.reportPlaceholder}
                rows={5}
                className={cn(
                  'min-h-[112px] w-full resize-none rounded-[11px] border px-3 py-2 text-[11px] leading-4 shadow-none outline-none transition',
                  'border-black/[0.08] bg-black/[0.025] text-black placeholder:text-black/30',
                  'focus:border-black/[0.14] focus:bg-white/70',
                  'dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/24 dark:focus:border-white/[0.14] dark:focus:bg-white/[0.055]',
                )}
              />

              <input
                value={contactText}
                onChange={(event) => setContactText(event.target.value)}
                placeholder={labels.contactPlaceholder}
                className={cn(
                  'h-9 w-full rounded-[10px] border px-3 text-[11px] shadow-none outline-none transition',
                  'border-black/[0.08] bg-black/[0.025] text-black placeholder:text-black/30',
                  'focus:border-black/[0.14] focus:bg-white/70',
                  'dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/24 dark:focus:border-white/[0.14] dark:focus:bg-white/[0.055]',
                )}
              />

              {reportStatus === 'success' ? (
                <div className="rounded-[10px] border border-black/[0.08] bg-black/[0.025] px-3 py-2 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-black dark:text-white">
                    <CheckCircle2 className="size-3.5" />
                    {labels.sent}
                  </div>

                  <div className="mt-0.5 text-[9.5px] text-black/42 dark:text-white/34">
                    {labels.sentHint}
                  </div>
                </div>
              ) : null}

              {reportStatus === 'error' && reportError ? (
                <div className="rounded-[10px] border border-red-500/15 bg-red-500/[0.06] px-3 py-2 text-[10px] text-red-600 dark:text-red-300">
                  {reportError}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSendReport}
                disabled={reportStatus === 'sending'}
                className={cn(
                  'flex h-9 w-full items-center justify-center gap-2 rounded-[10px] text-[11px] font-semibold tracking-[-0.02em] transition active:scale-[0.99]',
                  'bg-black text-white hover:bg-black/88 dark:bg-white dark:text-black dark:hover:bg-white/88',
                  reportStatus === 'sending' && 'pointer-events-none opacity-70',
                )}
              >
                {reportStatus === 'sending' ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}

                {reportStatus === 'sending' ? labels.sending : labels.send}
              </button>
            </div>
          </div>
        ) : null}

        {view === 'faq' ? (
          <div>
            <div className="flex items-center gap-2 px-1.5 pb-2 pt-1.5">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="flex size-8 shrink-0 items-center justify-center rounded-[10px] text-black/42 transition hover:bg-black/[0.045] hover:text-black dark:text-white/36 dark:hover:bg-white/[0.075] dark:hover:text-white"
                aria-label={labels.back}
              >
                <ArrowLeft className="size-3.5" />
              </button>

              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-none tracking-[-0.04em] text-black dark:text-white">
                  {labels.faqTitle}
                </span>

                <span className="mt-1 block truncate text-[10px] text-black/42 dark:text-white/32">
                  {labels.faqHint}
                </span>
              </span>
            </div>

            <DropdownDivider />

            <div className="space-y-0.5 px-1.5 py-1.5">
              {faqItems.map((item) => {
                const active = openFaqKey === item.key;

                return (
                  <div key={item.key} className="overflow-hidden rounded-[10px]">
                    <button
                      type="button"
                      onClick={() => setOpenFaqKey(active ? '' : item.key)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left transition',
                        active
                          ? 'bg-black/[0.045] text-black dark:bg-white/[0.075] dark:text-white'
                          : 'text-black/68 hover:bg-black/[0.035] hover:text-black dark:text-white/68 dark:hover:bg-white/[0.055] dark:hover:text-white',
                      )}
                    >
                      <span className="text-[11.5px] font-semibold tracking-[-0.025em]">
                        {item.title}
                      </span>

                      <ChevronRight
                        className={cn(
                          'size-3 shrink-0 opacity-45 transition',
                          active && 'rotate-90 opacity-80',
                        )}
                      />
                    </button>

                    {active ? (
                      <div className="px-2.5 pb-2.5 pt-1 text-[10px] leading-4 text-black/44 dark:text-white/34">
                        {item.text}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setReportCategory('question');
                  setReportStatus('idle');
                  setReportError('');
                  setView('report');
                }}
                className="mt-1 flex h-8 w-full items-center justify-center gap-1.5 rounded-[9px] text-[10px] font-medium text-black/50 transition hover:bg-black/[0.045] hover:text-black dark:text-white/45 dark:hover:bg-white/[0.075] dark:hover:text-white"
              >
                <Bug className="size-3" />
                {labels.feedback}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          'flex h-[52px] items-center gap-1.5 rounded-[14px] border p-1',
          'border-black/[0.075] bg-black/[0.022] text-black backdrop-blur-[18px]',
          'dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white',
        )}
      >
        <button
          type="button"
          onClick={() => {
            setOpen((value) => {
              const next = !value;
              if (next) setView('menu');
              return next;
            });
          }}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(
            'group flex min-w-0 flex-1 items-center gap-2 rounded-[11px] px-2 py-1.5 text-left transition active:scale-[0.99]',
            'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
            open && 'bg-black/[0.045] dark:bg-white/[0.07]',
          )}
        >
          <WorkspaceIdentityAvatar identity={identity} />

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11.5px] font-semibold leading-none tracking-[-0.03em] text-black dark:text-white" title={identity.name}>
              {identity.name}
            </span>

            <span className="mt-1 block truncate text-[9.5px] leading-[1.2] text-black/40 dark:text-white/32" title={identity.subtitle}>
              {identity.subtitle}
            </span>
          </span>

          <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] text-black/34 transition group-hover:bg-black/[0.045] group-hover:text-black dark:text-white/32 dark:group-hover:bg-white/[0.07] dark:group-hover:text-white">
            <span className="translate-y-[-1px] text-[16px] leading-none">···</span>
          </span>
        </button>

        <button
          type="button"
          onClick={openRobo}
          title={labels.robo}
          aria-label={labels.robo}
          className={cn(
            'group relative flex size-10 shrink-0 items-center justify-center rounded-[12px] border transition active:scale-[0.96]',
            'border-black/[0.07] bg-black/[0.035] text-black/58 hover:border-black/[0.12] hover:bg-black/[0.055] hover:text-black',
            'dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-white/56 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.08] dark:hover:text-white',
          )}
        >
          <Bot className="size-[15px] stroke-[1.9]" />

          <span
            aria-hidden="true"
            className="absolute right-2 top-2 size-1.5 rounded-full bg-black/55 dark:bg-white/70"
          />

          <span className="pointer-events-none absolute bottom-[calc(100%+9px)] right-0 hidden w-[158px] rounded-[12px] border border-black/[0.08] bg-[#fbfbfa]/90 px-3 py-2 text-left text-[10px] text-black/44 backdrop-blur-[22px] shadow-[0_18px_54px_rgba(15,15,15,0.12)] group-hover:block dark:border-white/[0.10] dark:bg-[#101010]/90 dark:text-white/36 dark:shadow-[0_24px_70px_rgba(0,0,0,0.50)]">
            <span className="block text-[11.5px] font-semibold text-black dark:text-white">
              {labels.robo}
            </span>
            <span className="mt-0.5 block">{labels.roboHint}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function FooterActions({ locale }: { locale: 'ru' | 'en' }) {
  return <AccountFooterMenu locale={locale} />;
}

function EmptySearch({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[11px] border border-dashed border-black/[0.08] bg-black/[0.018] px-4 py-8 text-center text-[12px] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/35">
      {children}
    </div>
  );
}

function MobileBottomItem({
  item,
  active,
}: {
  item: NavigationItem & { shortLabel?: string };
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      prefetch={false}
      scroll={false}
      className={cn(
        'relative flex h-[44px] flex-col items-center justify-center gap-0.5 rounded-[14px] text-[10px] font-medium transition active:scale-[0.98]',
        active
          ? 'cb-neutral-primary'
          : 'text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground',
      )}
    >
      <span className="relative">
        <Icon className="size-[16px]" />

        {item.badge && item.badge.toLowerCase() !== 'bot' ? (
          <span className="absolute -right-2 -top-2 rounded-full border border-current/10 bg-primary/15 px-1 text-[8px] leading-3 text-primary">
            {item.badge}
          </span>
        ) : null}
      </span>

      <span className="max-w-full truncate px-1">
        {item.shortLabel ?? item.label}
      </span>
    </Link>
  );
}

function SidebarContent({
  locale,
  product,
  productHint,
  searchLabel,
  noResultsLabel,
  publicDescription,
  publicPageItem,
  publicPageActive,
  scope,
  profileBackLabel,
  profileBackHref,
  profileGroups,
  selectedMode,
  liveHref,
  demoHref,
  navQuery,
  setNavQuery,
  groups,
  pathname,
  onNavigate,
}: {
  locale: 'ru' | 'en';
  product: string;
  productHint: string;
  searchLabel: string;
  noResultsLabel: string;
  publicDescription: string;
  publicPageItem: NavigationItem;
  publicPageActive: boolean;
  scope: SidebarScope;
  profileBackLabel: string;
  profileBackHref: string;
  profileGroups: NavigationGroup[];
  selectedMode: 'live' | 'demo';
  liveHref: string;
  demoHref: string;
  navQuery: string;
  setNavQuery: (value: string) => void;
  groups: NavigationGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 pb-3 pt-4">
        <Link
          href={withDashboardDemoParam('/dashboard', selectedMode === 'demo')}
          onClick={onNavigate}
          prefetch={false}
          scroll={false}
          aria-label={product}
          title={product}
          className="flex flex-col items-center justify-center rounded-[12px] py-1.5 transition hover:opacity-85 active:scale-[0.99]"
        >
          <BrandLogo className="w-[164px]" />

          <span className="mt-1 text-[9.5px] text-slate-500 dark:text-white/32">
            {productHint}
          </span>
        </Link>

        <div className="mt-4">
          <SearchField
            value={navQuery}
            onChange={setNavQuery}
            placeholder={searchLabel}
          />
        </div>

        <ModePanel
          locale={locale}
          selectedMode={selectedMode}
          liveHref={liveHref}
          demoHref={demoHref}
          onNavigate={onNavigate}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-1 [scrollbar-width:thin]">
        {scope === 'profile' ? (
          <ProfileScopeContent
            groups={profileGroups}
            pathname={pathname}
            locale={locale}
            backLabel={profileBackLabel}
            backHref={profileBackHref}
            noResultsLabel={noResultsLabel}
            publicDescription={publicDescription}
            publicPageItem={publicPageItem}
            publicPageActive={publicPageActive}
            onNavigate={onNavigate}
          />
        ) : (
          <div>
            <PublicLink
              item={publicPageItem}
              active={publicPageActive}
              description={publicDescription}
              onNavigate={onNavigate}
            />

            <SidebarDivider />

            {groups.length ? (
              <div>
                {groups.map((group, index) => (
                  <div key={group.id}>
                    {index > 0 ? <SidebarDivider /> : null}

                    <NavGroup
                      title={group.title}
                      items={group.items}
                      pathname={pathname}
                      locale={locale}
                      onNavigate={onNavigate}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptySearch>{noResultsLabel}</EmptySearch>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 py-3">
        <FooterHairline />
        <FooterActions locale={locale} />
      </div>
    </div>
  );
}

function MobileSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 xl:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/28 transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'absolute inset-y-0 left-0 w-[min(92vw,356px)] border-r border-black/[0.08] bg-[#f4f4f2] shadow-[0_24px_70px_rgba(15,23,42,0.22)] transition-transform duration-200 dark:border-white/[0.08] dark:bg-[#090909] dark:shadow-[0_28px_80px_rgba(0,0,0,0.55)]',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-black/[0.07] px-3 py-3 dark:border-white/[0.07]">
            <div className="text-[13px] font-semibold tracking-[-0.045em]">
              Меню
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-[9px]"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </aside>
    </div>
  );
}

export function WorkspaceShell({ children, className }: WorkspaceShellProps) {
  const rawPathname = usePathname();
  const pathname = rawPathname || '/dashboard';
  const searchParams = useBrowserSearchParams();

  const { ownedProfile, getBookingsBySlug } = useApp();
  const { locale } = useLocale();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navQuery, setNavQuery] = useState('');

  const demoMode = isDashboardDemoEnabled(searchParams);
  const selectedWorkspaceMode: 'live' | 'demo' = demoMode ? 'demo' : 'live';

  useEffect(() => {
    document.documentElement.dataset.slotySidebar =
      'linear-sidebar-account-footer-v28';
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const publicHref = demoMode
    ? '/demo/' + SLOTY_DEMO_SLUG
    : ownedProfile
      ? '/m/' + ownedProfile.slug
      : '/create-profile';

  const profileBookings = ownedProfile
    ? getBookingsBySlug(ownedProfile.slug)
    : [];

  const todayIso = (() => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
  })();

  const newBookings = profileBookings.filter(
    (item) =>
      item.date === todayIso &&
      item.status !== 'cancelled' &&
      item.status !== 'no_show',
  ).length;

  const labels =
    locale === 'ru'
      ? {
          product: 'КликБук',
          productHint: 'Кабинет мастера',
          search: 'Поиск',
          noResults: 'Ничего не найдено.',
          publicDescription: 'Страница клиента и онлайн-запись',
          primaryNav: {
            home: 'Главная',
            today: 'Сегодня',
            chats: 'Чаты',
            clients: 'Клиенты',
            more: 'Ещё',
          },
          navigation: {
            publicPage: 'Публичная страница',
            profile: 'Профиль',
            overview: 'Основное',
            work: 'Работа',
            settings: 'Управление',
            storefront: 'Витрина и запись',
            channels: 'Каналы',
            billing: 'Оплата и доступ',
          },
          actions: {
            openMenu: 'Открыть меню',
            closeMenu: 'Закрыть меню',
          },
          items: {
            home: 'Главная',
            today: 'Записи на сегодня',
            stats: 'Статистика',
            chats: 'Чаты',
            clients: 'Клиенты',
            services: 'Услуги',
            availability: 'График',
            templates: 'Шаблоны',
            profile: 'Профиль',
            appearance: 'Внешний вид',
            marketing: 'Продвижение',
            notifications: 'Уведомления',
            payments: 'Оплата',
            subscription: 'Подписка',
            limits: 'Лимиты',
            publicPage: 'Публичная страница',
          },
        }
      : {
          product: 'ClickBook',
          productHint: 'Specialist workspace',
          search: 'Search',
          noResults: 'Nothing found.',
          publicDescription: 'Client page and online booking',
          primaryNav: {
            home: 'Home',
            today: 'Today',
            chats: 'Chats',
            clients: 'Clients',
            more: 'More',
          },
          navigation: {
            publicPage: 'Public page',
            profile: 'Profile',
            overview: 'Overview',
            work: 'Work',
            settings: 'Manage',
            storefront: 'Storefront and booking',
            channels: 'Channels',
            billing: 'Billing and access',
          },
          actions: {
            openMenu: 'Open menu',
            closeMenu: 'Close menu',
          },
          items: {
            home: 'Home',
            today: 'Today bookings',
            stats: 'Statistics',
            chats: 'Chats',
            clients: 'Clients',
            services: 'Services',
            availability: 'Availability',
            templates: 'Templates',
            profile: 'Profile',
            appearance: 'Appearance',
            marketing: 'Promotion',
            notifications: 'Notifications',
            payments: 'Payments',
            subscription: 'Subscription',
            limits: 'Limits',
            publicPage: 'Public page',
          },
        };

  const dashboardModeBasePath = pathname.startsWith('/dashboard')
    ? getPathOnly(pathname)
    : '/dashboard';

  const liveWorkspaceHref = useMemo(() => {
    return withDashboardDemoParam(dashboardModeBasePath, false);
  }, [dashboardModeBasePath]);

  const demoWorkspaceHref = useMemo(() => {
    return withDashboardDemoParam(dashboardModeBasePath, true);
  }, [dashboardModeBasePath]);

  const publicPageItem = useMemo<NavigationItem>(() => {
    const demoPublicPath = '/demo/' + SLOTY_DEMO_SLUG;

    const isPublicPathActive =
      pathname === '/create-profile' ||
      pathname.startsWith('/create-profile/') ||
      pathname === publicHref ||
      pathname.startsWith('/m/') ||
      pathname.startsWith(demoPublicPath);

    return {
      href: publicHref,
      label: labels.items.publicPage,
      icon: Globe2,
      forceActive: isPublicPathActive,
      exact: pathname === '/create-profile',
    };
  }, [labels.items.publicPage, pathname, publicHref]);

  const navigationGroups = useMemo<NavigationGroup[]>(() => {
    const overview: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard', demoMode),
        label: labels.items.home,
        icon: Home,
        exact: true,
      },
      {
        href: withDashboardDemoParam('/dashboard/today', demoMode),
        label: labels.items.today,
        icon: CalendarClock,
        badge: newBookings > 0 ? String(newBookings) : undefined,
      },
      {
        href: withDashboardDemoParam('/dashboard/stats', demoMode),
        label: labels.items.stats,
        icon: BarChart3,
      },
    ];

    const work: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard/chats', demoMode),
        label: labels.items.chats,
        icon: MessageCircleMore,
        badge: 'bot',
      },
      {
        href: withDashboardDemoParam('/dashboard/clients', demoMode),
        label: labels.items.clients,
        icon: Users2,
      },
    ];

    const storefront: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard/services', demoMode),
        label: labels.items.services,
        icon: Package2,
      },
      {
        href: withDashboardDemoParam('/dashboard/availability', demoMode),
        label: labels.items.availability,
        icon: CalendarRange,
      },
      {
        href: withDashboardDemoParam('/dashboard/templates', demoMode),
        label: labels.items.templates,
        icon: MessageSquareText,
      },
    ];

    const manage: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard/profile', demoMode),
        label: labels.items.profile,
        icon: SquarePen,
        exact: true,
      },
      {
        href: withDashboardDemoParam('/dashboard/appearance', demoMode),
        label: labels.items.appearance,
        icon: LayoutPanelTop,
      },
      {
        href: withDashboardDemoParam('/dashboard/notifications', demoMode),
        label: labels.items.notifications,
        icon: Bell,
      },
      {
        href: withDashboardDemoParam('/dashboard/marketing', demoMode),
        label: labels.items.marketing,
        icon: Sparkles,
      },
    ];

    const billing: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard/payments', demoMode),
        label: labels.items.payments,
        icon: CheckCircle2,
      },
      {
        href: withDashboardDemoParam('/dashboard/subscription', demoMode),
        label: labels.items.subscription,
        icon: Package2,
      },
      {
        href: withDashboardDemoParam('/dashboard/limits', demoMode),
        label: labels.items.limits,
        icon: Settings2,
      },
    ];

    return [
      {
        id: 'overview',
        title: labels.navigation.overview,
        items: overview,
      },
      {
        id: 'work',
        title: labels.navigation.work,
        items: work,
      },
      {
        id: 'storefront',
        title: labels.navigation.storefront,
        items: storefront,
      },
      {
        id: 'manage',
        title: labels.navigation.settings,
        items: manage,
      },
      {
        id: 'billing',
        title: labels.navigation.billing,
        items: billing,
      },
    ];
  }, [
    demoMode,
    labels.items.appearance,
    labels.items.availability,
    labels.items.chats,
    labels.items.clients,
    labels.items.home,
    labels.items.limits,
    labels.items.marketing,
    labels.items.notifications,
    labels.items.payments,
    labels.items.profile,
    labels.items.services,
    labels.items.stats,
    labels.items.subscription,
    labels.items.templates,
    labels.items.today,
    labels.navigation.billing,
    labels.navigation.overview,
    labels.navigation.settings,
    labels.navigation.storefront,
    labels.navigation.work,
    newBookings,
  ]);

  const profileSectionPaths = useMemo(
    () => [
      '/dashboard/profile',
      '/dashboard/appearance',
      '/dashboard/services',
      '/dashboard/availability',
      '/dashboard/templates',
      '/dashboard/notifications',
      '/dashboard/marketing',
      '/dashboard/payments',
      '/dashboard/subscription',
      '/dashboard/limits',
    ],
    [],
  );

  const profileMenuActive = profileSectionPaths.some((path) =>
    isActive(pathname, path, path === '/dashboard/profile'),
  );

  const sidebarScope: SidebarScope = 'main';

  const profileMenuGroups = useMemo<NavigationGroup[]>(() => {
    const profileCore: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard/profile', demoMode),
        label: labels.items.profile,
        icon: SquarePen,
        exact: true,
      },
      {
        href: withDashboardDemoParam('/dashboard/appearance', demoMode),
        label: labels.items.appearance,
        icon: LayoutPanelTop,
      },
    ];

    const profileStorefront: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard/services', demoMode),
        label: labels.items.services,
        icon: Package2,
      },
      {
        href: withDashboardDemoParam('/dashboard/availability', demoMode),
        label: labels.items.availability,
        icon: CalendarRange,
      },
      {
        href: withDashboardDemoParam('/dashboard/templates', demoMode),
        label: labels.items.templates,
        icon: MessageSquareText,
      },
    ];

    const profileChannels: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard/notifications', demoMode),
        label: labels.items.notifications,
        icon: Bell,
      },
      {
        href: withDashboardDemoParam('/dashboard/marketing', demoMode),
        label: labels.items.marketing,
        icon: Sparkles,
      },
    ];

    const profileBilling: NavigationItem[] = [
      {
        href: withDashboardDemoParam('/dashboard/payments', demoMode),
        label: labels.items.payments,
        icon: CheckCircle2,
      },
      {
        href: withDashboardDemoParam('/dashboard/subscription', demoMode),
        label: labels.items.subscription,
        icon: Package2,
      },
      {
        href: withDashboardDemoParam('/dashboard/limits', demoMode),
        label: labels.items.limits,
        icon: Settings2,
      },
    ];

    return [
      {
        id: 'profile-core',
        title: locale === 'ru' ? 'Профиль' : 'Profile',
        items: profileCore,
      },
      {
        id: 'profile-storefront',
        title: locale === 'ru' ? 'Витрина и запись' : 'Storefront and booking',
        items: profileStorefront,
      },
      {
        id: 'profile-channels',
        title: locale === 'ru' ? 'Каналы' : 'Channels',
        items: profileChannels,
      },
      {
        id: 'profile-billing',
        title: locale === 'ru' ? 'Оплата и доступ' : 'Billing and access',
        items: profileBilling,
      },
    ];
  }, [
    demoMode,
    labels.items.appearance,
    labels.items.availability,
    labels.items.limits,
    labels.items.marketing,
    labels.items.notifications,
    labels.items.payments,
    labels.items.profile,
    labels.items.services,
    labels.items.subscription,
    labels.items.templates,
    locale,
  ]);

  const filteredNavigationGroups = useMemo(() => {
    const query = navQuery.trim().toLowerCase();

    if (!query) return navigationGroups;

    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [navigationGroups, navQuery]);

  const filteredProfileNavigationGroups = useMemo(() => {
    const query = navQuery.trim().toLowerCase();

    if (!query) return profileMenuGroups;

    return profileMenuGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [navQuery, profileMenuGroups]);

  const allItems = useMemo(
    () => [
      publicPageItem,
      ...navigationGroups.flatMap((group) => group.items),
    ],
    [navigationGroups, publicPageItem],
  );

  const activeItem = allItems.find(
    (item) =>
      !item.skipActiveMatch &&
      (item.forceActive || isActive(pathname, item.href, item.exact)),
  );

  const activeGroup = publicPageItem.forceActive
    ? { title: labels.navigation.publicPage }
    : navigationGroups.find((group) =>
        group.items.some(
          (item) =>
            !item.skipActiveMatch &&
            isActive(pathname, item.href, item.exact),
        ),
      );

  const findItem = (path: string) => {
    if (getPathOnly(publicPageItem.href) === path) return publicPageItem;

    return navigationGroups
      .flatMap((group) => group.items)
      .find((item) => getPathOnly(item.href) === path);
  };

  const homeItem = findItem('/dashboard') ?? navigationGroups[0]?.items[0];
  const todayItem = findItem('/dashboard/today');
  const chatsItem = findItem('/dashboard/chats');
  const clientsItem = findItem('/dashboard/clients');

  const mobilePrimaryItems = [
    homeItem ? { ...homeItem, shortLabel: labels.primaryNav.home } : null,
    todayItem ? { ...todayItem, shortLabel: labels.primaryNav.today } : null,
    chatsItem ? { ...chatsItem, shortLabel: labels.primaryNav.chats } : null,
    clientsItem ? { ...clientsItem, shortLabel: labels.primaryNav.clients } : null,
  ].filter(Boolean) as Array<NavigationItem & { shortLabel: string }>;

  const sidebarProps = {
    locale,
    product: labels.product,
    productHint: labels.productHint,
    searchLabel: labels.search,
    noResultsLabel: labels.noResults,
    publicDescription: labels.publicDescription,
    publicPageItem,
    publicPageActive: Boolean(publicPageItem.forceActive),
    scope: sidebarScope,
    profileBackLabel:
      locale === 'ru' ? 'Назад в основное меню' : 'Back to main menu',
    profileBackHref: withDashboardDemoParam('/dashboard', demoMode),
    profileGroups: filteredProfileNavigationGroups,
    selectedMode: selectedWorkspaceMode,
    liveHref: liveWorkspaceHref,
    demoHref: demoWorkspaceHref,
    navQuery,
    setNavQuery,
    groups: filteredNavigationGroups,
    pathname,
  };

  return (
    <div
      className="min-h-screen bg-[#f4f4f2] text-slate-950 dark:bg-[#090909] dark:text-white"
      style={{ '--sidebar-width': `${SIDEBAR_WIDTH}px` } as CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: SHIMMER_CSS }} />

      <aside
        className="cb-workspace-sidebar fixed inset-y-0 left-0 z-40 hidden border-r border-black/[0.07] bg-[#f4f4f2] dark:border-white/[0.07] dark:bg-[#090909] xl:block"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      <MobileSheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <SidebarContent
          {...sidebarProps}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      </MobileSheet>

      <main
        className={cn(
          'cb-workspace-main min-h-screen pb-[88px] xl:pb-0 xl:pl-[var(--sidebar-width)]',
          className,
        )}
        data-workspace-route={getPathOnly(pathname)}
      >
        <div className="cb-workspace-mobile-topbar sticky top-0 z-30 border-b border-black/[0.07] bg-[#f4f4f2]/92 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#090909]/92 xl:hidden">
          <div className="flex h-[54px] items-center justify-between gap-2 px-2.5 pt-[env(safe-area-inset-top,0px)]">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 shrink-0 rounded-[12px]"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={labels.actions.openMenu}
              >
                <Menu className="size-4" />
              </Button>

              <Link
                href={withDashboardDemoParam('/dashboard', demoMode)}
                prefetch={false}
                scroll={false}
                className="flex min-w-0 items-center gap-2"
              >
                <span className="flex h-8 w-[82px] shrink-0 items-center justify-center rounded-[10px] border border-black/[0.08] bg-[#fbfbfa] px-2 dark:border-white/[0.08] dark:bg-[#101010]">
                  <BrandLogo className="w-[82px]" />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-semibold tracking-[-0.035em]">
                    {activeItem?.label ?? labels.items.home}
                  </span>

                  <span className="block truncate text-[9.5px] text-muted-foreground">
                    {activeGroup?.title ?? labels.productHint}
                  </span>
                </span>
              </Link>
            </div>

            <Link
              href={publicPageItem.href}
              aria-label={labels.items.publicPage}
              prefetch={false}
              scroll={false}
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-[10px] transition',
                publicPageItem.forceActive
                  ? 'cb-neutral-primary'
                  : 'border border-black/[0.08] bg-[#fbfbfa] text-slate-500 hover:text-slate-950 dark:border-white/[0.08] dark:bg-[#101010] dark:text-white/40 dark:hover:text-white',
              )}
            >
              <Globe2 className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="workspace-main-shell">{children}</div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-[#f4f4f2]/94 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#090909]/94 xl:hidden"
        aria-label={labels.product}
      >
        <div className="mx-auto grid max-w-[430px] grid-cols-5 gap-1 rounded-[20px] border border-black/[0.07] bg-[#fbfbfa]/82 p-1 dark:border-white/[0.08] dark:bg-[#101010]/86">
          {mobilePrimaryItems.map((item) => (
            <MobileBottomItem
              key={item.href}
              item={item}
              active={Boolean(
                item.forceActive || isActive(pathname, item.href, item.exact),
              )}
            />
          ))}

          <button
            type="button"
            className={cn(
              'flex h-[44px] flex-col items-center justify-center gap-0.5 rounded-[14px] text-[10px] font-medium transition active:scale-[0.98]',
              mobileMenuOpen
                ? 'cb-neutral-primary'
                : 'text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground',
            )}
            onClick={() => setMobileMenuOpen(true)}
            aria-label={labels.primaryNav.more}
          >
            <Menu className="size-[16px]" />
            <span>{labels.primaryNav.more}</span>
          </button>
        </div>
      </nav>

      <WorkspaceAssistant />
    </div>
  );
}