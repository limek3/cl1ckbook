// app/dashboard/chats/page.tsx
'use client';

import Link from 'next/link';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useTheme } from 'next-themes';
import {
  ArrowRightLeft,
  Bot,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronLeft,
  Download,
  MessageCircle,
  PhoneCall,
  Pin,
  Plus,
  Search,
  SendHorizonal,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
import { useMobile } from '@/hooks/use-mobile';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useAppearance } from '@/lib/appearance-context';
import { accentPalette } from '@/lib/appearance-palette';
import type {
  ChatDeliveryState,
  ChatMessageRecord,
  ChatThreadListResponse,
  ChatThreadRecord,
} from '@/lib/chat-types';
import { getDashboardDemoStorageKey, isDashboardDemoEnabled } from '@/lib/dashboard-demo';
import { getDashboardDemoChatThreads } from '@/lib/demo-data';
import { getTelegramAppSessionHeaders } from '@/lib/telegram-miniapp-auth-client';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';
type SegmentFilter = 'all' | ChatThreadRecord['segment'];
type ChannelFilter = 'all' | ChatThreadRecord['channel'];
type SortMode = 'recent' | 'unread' | 'priority';
type BotFlow = 'confirm' | 'reschedule' | 'followup';

function pageBg(light: boolean) {
  return light ? 'bg-[#f4f4f2]' : 'bg-[#090909]';
}

function pageText(light: boolean) {
  return light ? 'text-[#0e0e0e]' : 'text-white';
}

function mutedText(light: boolean) {
  return light ? 'text-black/48' : 'text-white/42';
}

function faintText(light: boolean) {
  return light ? 'text-black/32' : 'text-white/26';
}

function borderTone(light: boolean) {
  return light ? 'border-black/[0.08]' : 'border-white/[0.08]';
}

function cardTone(light: boolean) {
  return light ? 'border-black/[0.08] bg-[#fbfbfa]' : 'border-white/[0.08] bg-[#101010]';
}

function insetTone(light: boolean) {
  return light ? 'border-black/[0.07] bg-black/[0.025]' : 'border-white/[0.07] bg-white/[0.035]';
}

function inputTone(light: boolean) {
  return light
    ? 'border-black/[0.08] bg-white text-black placeholder:text-black/34'
    : 'border-white/[0.08] bg-white/[0.035] text-white placeholder:text-white/30';
}

function buttonBase(light: boolean, active = false) {
  return cn(
    'inline-flex h-8 items-center justify-center gap-2 rounded-[9px] border px-3 text-[12px] font-medium shadow-none transition-[background,border-color,color,opacity,transform] duration-150 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45',
    active
      ? light
        ? 'cb-neutral-primary cb-neutral-primary-light hover:opacity-[0.98]'
        : 'cb-neutral-primary cb-neutral-primary-dark hover:opacity-[0.98]'
      : light
        ? 'border-black/[0.08] bg-white text-black/58 hover:border-black/[0.14] hover:bg-black/[0.035] hover:text-black'
        : 'border-white/[0.08] bg-white/[0.04] text-white/55 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white',
  );
}

function accentPillStyle(color: string, light: boolean): CSSProperties {
  return {
    background: light
      ? `color-mix(in srgb, ${color} 10%, #ffffff)`
      : `color-mix(in srgb, ${color} 20%, #141414)`,
    borderColor: light
      ? `color-mix(in srgb, ${color} 24%, rgba(0,0,0,0.1))`
      : `color-mix(in srgb, ${color} 34%, rgba(255,255,255,0.1))`,
    color: light
      ? `color-mix(in srgb, ${color} 70%, #101010)`
      : `color-mix(in srgb, ${color} 18%, #ffffff)`,
  };
}

function Card({ children, light, className }: { children: ReactNode; light: boolean; className?: string }) {
  return <section className={cn('rounded-[14px] border', cardTone(light), className)}>{children}</section>;
}

function Panel({ children, light, className }: { children: ReactNode; light: boolean; className?: string }) {
  return <div className={cn('rounded-[12px] border', insetTone(light), className)}>{children}</div>;
}

function MicroLabel({
  children,
  light,
  active,
  accentColor,
  className,
}: {
  children: ReactNode;
  light: boolean;
  active?: boolean;
  accentColor?: string;
  className?: string;
}) {
  return (
    <span
      style={active && accentColor ? accentPillStyle(accentColor, light) : undefined}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-[9px] border px-2.5 text-[10.5px] font-medium',
        active && !accentColor
          ? 'cb-accent-pill-active'
          : !active
            ? light
              ? 'border-black/[0.08] bg-white text-black/50'
              : 'border-white/[0.08] bg-white/[0.04] text-white/42'
            : '',
        className,
      )}
    >
      {children}
    </span>
  );
}

function EmptyState({ title, hint, light }: { title: string; hint?: string; light: boolean }) {
  return (
    <Panel light={light} className="grid min-h-[180px] place-items-center p-6 text-center">
      <div>
        <div className={cn('text-[14px] font-semibold', pageText(light))}>{title}</div>
        {hint ? <div className={cn('mx-auto mt-2 max-w-[320px] text-[11.5px] leading-5', mutedText(light))}>{hint}</div> : null}
      </div>
    </Panel>
  );
}

function toLocalIsoDate(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function addDaysIso(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toLocalIsoDate(date);
}

function formatTimeLabel(value: string, locale: 'ru' | 'en') {
  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value.slice(11, 16);
  }
}

function formatDateLabel(value: string, locale: 'ru' | 'en') {
  const normalized = value.includes('T') ? value : `${value.slice(0, 10)}T12:00:00`;

  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(normalized));
  } catch {
    return value.slice(0, 10);
  }
}

function formatLongDateLabel(value: string, locale: 'ru' | 'en') {
  const normalized = value.includes('T') ? value : `${value.slice(0, 10)}T12:00:00`;

  try {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      weekday: 'short',
    }).format(new Date(normalized));
  } catch {
    return value.slice(0, 10);
  }
}

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'CB'
  );
}

function deliveryLabel(value: ChatDeliveryState | null | undefined, locale: 'ru' | 'en') {
  if (!value) return null;

  const labels =
    locale === 'ru'
      ? {
          queued: 'В очереди',
          sent: 'Отправлено',
          delivered: 'Доставлено',
          read: 'Прочитано',
          failed: 'Ошибка',
        }
      : {
          queued: 'Queued',
          sent: 'Sent',
          delivered: 'Delivered',
          read: 'Read',
          failed: 'Failed',
        };

  return labels[value];
}

function channelLabel(value: ChatThreadRecord['channel'], locale: 'ru' | 'en') {
  if (locale !== 'ru') return value;
  if (value === 'Telegram') return 'ТГ';
  if (value === 'Instagram') return 'Инстаграм';
  if (value === 'VK') return 'ВК';
  return value;
}

function segmentLabel(value: ChatThreadRecord['segment'], locale: 'ru' | 'en') {
  if (locale === 'ru') {
    if (value === 'new') return 'Новый';
    if (value === 'active') return 'В работе';
    return 'Повтор';
  }

  if (value === 'new') return 'New';
  if (value === 'active') return 'Active';
  return 'Repeat';
}

function createLocalMessage(threadId: string, body: string, author: 'master' | 'system', viaBot: boolean): ChatMessageRecord {
  const now = new Date().toISOString();

  return {
    id: `local-${crypto.randomUUID()}`,
    threadId,
    author,
    body,
    viaBot,
    deliveryState: 'sent',
    createdAt: now,
    metadata: { optimistic: true },
  };
}

function createLocalThread(locale: 'ru' | 'en', clientName: string, clientPhone: string): ChatThreadRecord {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    workspaceId: 'local-workspace',
    clientName,
    clientPhone,
    channel: 'Telegram',
    segment: 'new',
    source: locale === 'ru' ? 'Ручное добавление' : 'Manual add',
    nextVisit: null,
    isPriority: false,
    botConnected: true,
    lastMessagePreview: locale === 'ru' ? 'Новый чат создан вручную.' : 'New chat created manually.',
    lastMessageAt: now,
    unreadCount: 0,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function sortThreads(items: ChatThreadRecord[], sortMode: SortMode, pinnedIds: string[]) {
  const pinnedSet = new Set(pinnedIds);

  return [...items].sort((left, right) => {
    const leftPinned = pinnedSet.has(left.id);
    const rightPinned = pinnedSet.has(right.id);

    if (leftPinned !== rightPinned) return leftPinned ? -1 : 1;

    if (sortMode === 'priority' && left.isPriority !== right.isPriority) return left.isPriority ? -1 : 1;
    if (sortMode === 'unread' && left.unreadCount !== right.unreadCount) return right.unreadCount - left.unreadCount;

    return new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime();
  });
}

function getThreadServices(thread: ChatThreadRecord | null) {
  if (!thread?.metadata) return [] as string[];

  const services = thread.metadata.services;
  if (Array.isArray(services)) {
    return services.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof thread.metadata.service === 'string' && thread.metadata.service.trim()) {
    return [thread.metadata.service.trim()];
  }

  return [] as string[];
}

function getThreadServiceLabel(thread: ChatThreadRecord | null) {
  const services = getThreadServices(thread);
  if (!services.length) return null;
  return services.length > 1 ? `${services[0]} +${services.length - 1}` : services[0];
}

function getThreadBookingCode(thread: ChatThreadRecord | null) {
  return typeof thread?.metadata?.bookingCode === 'string' ? thread.metadata.bookingCode : null;
}

function getThreadContextLine(thread: ChatThreadRecord | null, locale: 'ru' | 'en') {
  if (!thread) return null;

  const service = getThreadServiceLabel(thread);
  const date =
    typeof thread.metadata?.bookingDate === 'string'
      ? thread.metadata.bookingDate
      : thread.nextVisit ?? null;
  const time = typeof thread.metadata?.bookingTime === 'string' ? thread.metadata.bookingTime : null;
  const code = getThreadBookingCode(thread);
  const dateLabel = date ? formatDateLabel(date, locale) : null;

  return [code, service, dateLabel && time ? `${dateLabel} · ${time}` : dateLabel].filter(Boolean).join(' · ') || null;
}

type ThreadBookingContext = {
  id: string;
  code?: string | null;
  service?: string | null;
  services?: string[];
  date?: string | null;
  time?: string | null;
};

function getThreadBookingContexts(thread: ChatThreadRecord | null) {
  if (!thread?.metadata) return [] as ThreadBookingContext[];

  const raw = thread.metadata.bookingContexts;
  const contexts: ThreadBookingContext[] = [];

  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (!item || typeof item !== 'object') return;

      const row = item as Record<string, unknown>;
      const id = typeof row.id === 'string' ? row.id : typeof row.bookingId === 'string' ? row.bookingId : '';
      if (!id) return;

      contexts.push({
        id,
        code: typeof row.code === 'string' ? row.code : typeof row.bookingCode === 'string' ? row.bookingCode : null,
        service: typeof row.service === 'string' ? row.service : null,
        services: Array.isArray(row.services)
          ? row.services.filter((service): service is string => typeof service === 'string' && service.trim().length > 0)
          : typeof row.service === 'string'
            ? [row.service]
            : [],
        date: typeof row.date === 'string' ? row.date : typeof row.bookingDate === 'string' ? row.bookingDate : null,
        time: typeof row.time === 'string' ? row.time : typeof row.bookingTime === 'string' ? row.bookingTime : null,
      });
    });
  }

  const bookingId = typeof thread.metadata.bookingId === 'string' ? thread.metadata.bookingId : '';
  if (bookingId && !contexts.some((context) => context.id === bookingId)) {
    const services = getThreadServices(thread);
    contexts.push({
      id: bookingId,
      code: typeof thread.metadata.bookingCode === 'string' ? thread.metadata.bookingCode : null,
      service: typeof thread.metadata.service === 'string' ? thread.metadata.service : services[0] ?? null,
      services,
      date: typeof thread.metadata.bookingDate === 'string' ? thread.metadata.bookingDate : thread.nextVisit ?? null,
      time: typeof thread.metadata.bookingTime === 'string' ? thread.metadata.bookingTime : null,
    });
  }

  return contexts;
}

function getBookingContextLabel(context: ThreadBookingContext, locale: 'ru' | 'en') {
  const service = context.services?.[0] || context.service || (locale === 'ru' ? 'запись' : 'booking');
  const serviceLabel = context.services && context.services.length > 1 ? `${service} +${context.services.length - 1}` : service;
  const dateLabel = context.date ? formatDateLabel(context.date, locale) : null;
  return [context.code, serviceLabel, dateLabel && context.time ? `${dateLabel} · ${context.time}` : dateLabel].filter(Boolean).join(' · ');
}

function buildBotDraft(flow: BotFlow, thread: ChatThreadRecord, locale: 'ru' | 'en', nextVisit?: string) {
  if (flow === 'confirm') {
    return locale === 'ru'
      ? `Здравствуйте, ${thread.clientName}! Отправляю детали вашей записи. Если планы поменяются, просто ответьте в этот чат.`
      : `Hi ${thread.clientName}! Here are your booking details. If anything changes, just reply in this chat.`;
  }

  if (flow === 'reschedule') {
    return locale === 'ru'
      ? `Здравствуйте, ${thread.clientName}!\n\nПредлагаю перенести запись на ${nextVisit ?? 'новое время'}.\n\nЕсли время подходит — подтвердите перенос. Если нет — напишите удобный вариант.`
      : `Hi ${thread.clientName}!\n\nI suggest rescheduling to ${nextVisit ?? 'a new time'}.\n\nIf it works, confirm the reschedule. If not, send a better option.`;
  }

  return locale === 'ru'
    ? `Спасибо за визит, ${thread.clientName}! Могу предложить ближайшие удобные окна для следующей записи.`
    : `Thanks for visiting, ${thread.clientName}! I can offer the nearest convenient slots for your next appointment.`;
}

function fillTemplateContent(content: string, thread: ChatThreadRecord | null, locale: 'ru' | 'en', publicHref: string) {
  if (!thread) return content;

  const service = getThreadServiceLabel(thread) ?? (locale === 'ru' ? 'визит' : 'appointment');
  const nextVisit = thread.nextVisit;
  const date = nextVisit ? formatDateLabel(nextVisit, locale) : locale === 'ru' ? 'ближайшую дату' : 'the next date';
  const time = nextVisit ? formatTimeLabel(nextVisit, locale) : locale === 'ru' ? 'удобное время' : 'a convenient time';

  return content
    .replaceAll('{{имя}}', thread.clientName)
    .replaceAll('{{дата}}', date)
    .replaceAll('{{время}}', time)
    .replaceAll('{{услуга}}', service)
    .replaceAll('{{ссылка}}', publicHref);
}

export default function DashboardChatsPage() {
  const { hasHydrated, ownedProfile, locale, dataset, demoMode: demoModeFromHook } = useOwnedWorkspaceData();
  const { resolvedTheme } = useTheme();
  const { settings } = useAppearance();
  const searchParams = useBrowserSearchParams();
  const isMobile = useMobile();

  const [mounted, setMounted] = useState(false);
  const demoMode = demoModeFromHook || isDashboardDemoEnabled(searchParams);
  const demoStorageKey = getDashboardDemoStorageKey('chats');
  const pinnedStorageKey = `${demoStorageKey}:pinned`;

  const publicPageHref = ownedProfile
    ? demoMode
      ? `/demo/${ownedProfile.slug}`
      : `/m/${ownedProfile.slug}`
    : '/demo/klikbuk-demo';

  const [threads, setThreads] = useState<ChatThreadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const [draft, setDraft] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('custom');
  const [composerFlow, setComposerFlow] = useState<BotFlow | null>(null);
  const [transferDate, setTransferDate] = useState('');
  const [transferTime, setTransferTime] = useState('12:30');
  const [isSending, setIsSending] = useState(false);

  const [pinnedThreadIds, setPinnedThreadIds] = useState<string[]>([]);
  const [selectedBookingByThreadId, setSelectedBookingByThreadId] = useState<Record<string, string>>({});

  const messageBottomRef = useRef<HTMLDivElement | null>(null);
  const desktopMessageScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileMessageScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme: ThemeMode = mounted ? (resolvedTheme === 'light' ? 'light' : 'dark') : 'dark';
  const isLight = currentTheme === 'light';
  const accentColor = accentPalette[settings.accentTone].solid;

  const copy =
    locale === 'ru'
      ? {
          title: 'Чаты',
          description: 'Новый чистый inbox: клиенты, переписка, шаблоны и быстрые действия.',
          search: 'Поиск',
          all: 'Все',
          new: 'Новые',
          active: 'В работе',
          followup: 'Повтор',
          channel: 'Канал',
          recent: 'Новые',
          unread: 'Непрочит.',
          priority: 'Приоритет',
          demo: 'Демо',
          live: 'Рабочие',
          createThread: 'Новый чат',
          createClient: 'Новый клиент',
          clientName: 'Имя клиента',
          clientPhone: 'Телефон',
          cancel: 'Отмена',
          create: 'Создать',
          emptyList: 'Чаты не найдены',
          emptyListHint: 'Измените фильтр или создайте новый чат.',
          emptyThread: 'Выберите диалог',
          emptyThreadHint: 'Слева список клиентов. Справа откроется переписка и действия.',
          noMessages: 'История пока пустая',
          noMessagesHint: 'Напишите первое сообщение или используйте быстрый сценарий.',
          template: 'Шаблон',
          message: 'Сообщение клиенту…',
          clear: 'Очистить',
          send: 'Отправить',
          confirm: 'Детали',
          reschedule: 'Перенос',
          followupAction: 'Повтор',
          date: 'Дата',
          time: 'Время',
          applyTransfer: 'Подготовить',
          botOn: 'Бот включён',
          botOff: 'Бот выключен',
          pin: 'Закрепить',
          unpin: 'Открепить',
          priorityOn: 'Приоритет',
          priorityOff: 'Обычный',
          export: 'Экспорт',
          delete: 'Удалить',
          call: 'Позвонить',
          openProfile: 'Профиль',
          source: 'Источник',
          nextVisit: 'Следующий визит',
          notScheduled: 'Не назначен',
          loadError: 'Не удалось загрузить чаты.',
          sendError: 'Не удалось отправить сообщение.',
          addClientError: 'Нужно заполнить имя и телефон.',
          byBot: 'бот',
        }
      : {
          title: 'Chats',
          description: 'A clean inbox: clients, messages, templates, and quick actions.',
          search: 'Search',
          all: 'All',
          new: 'New',
          active: 'Active',
          followup: 'Repeat',
          channel: 'Channel',
          recent: 'Newest',
          unread: 'Unread',
          priority: 'Priority',
          demo: 'Demo',
          live: 'Live',
          createThread: 'New chat',
          createClient: 'New client',
          clientName: 'Client name',
          clientPhone: 'Phone',
          cancel: 'Cancel',
          create: 'Create',
          emptyList: 'No chats found',
          emptyListHint: 'Change filters or create a new chat.',
          emptyThread: 'Choose a dialogue',
          emptyThreadHint: 'Clients are on the left. Messages and actions open on the right.',
          noMessages: 'No history yet',
          noMessagesHint: 'Write the first message or use a quick scenario.',
          template: 'Template',
          message: 'Message to the client…',
          clear: 'Clear',
          send: 'Send',
          confirm: 'Details',
          reschedule: 'Reschedule',
          followupAction: 'Follow-up',
          date: 'Date',
          time: 'Time',
          applyTransfer: 'Prepare',
          botOn: 'Bot on',
          botOff: 'Bot off',
          pin: 'Pin',
          unpin: 'Unpin',
          priorityOn: 'Priority',
          priorityOff: 'Standard',
          export: 'Export',
          delete: 'Delete',
          call: 'Call',
          openProfile: 'Profile',
          source: 'Source',
          nextVisit: 'Next visit',
          notScheduled: 'Not scheduled',
          loadError: 'Could not load chats.',
          sendError: 'Could not send the message.',
          addClientError: 'Client name and phone are required.',
          byBot: 'bot',
        };

  const templateOptions = useMemo(() => dataset?.templates ?? [], [dataset?.templates]);
  const activeThread = useMemo(() => threads.find((thread) => thread.id === activeThreadId) ?? null, [activeThreadId, threads]);

  const activeBookingContexts = useMemo(() => getThreadBookingContexts(activeThread), [activeThread]);
  const selectedBookingId = useMemo(() => {
    if (!activeThread) return null;
    const selected = selectedBookingByThreadId[activeThread.id];
    if (selected && activeBookingContexts.some((context) => context.id === selected)) return selected;
    return activeBookingContexts[0]?.id ?? (typeof activeThread.metadata?.bookingId === 'string' ? activeThread.metadata.bookingId : null);
  }, [activeBookingContexts, activeThread, selectedBookingByThreadId]);

  const selectedBookingContext = useMemo(() => {
    if (!selectedBookingId) return activeBookingContexts[0] ?? null;
    return activeBookingContexts.find((context) => context.id === selectedBookingId) ?? activeBookingContexts[0] ?? null;
  }, [activeBookingContexts, selectedBookingId]);

  const unreadTotal = useMemo(() => threads.reduce((sum, thread) => sum + (thread.unreadCount ?? 0), 0), [threads]);
  const priorityTotal = useMemo(() => threads.filter((thread) => thread.isPriority).length, [threads]);

  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const next = threads.filter((thread) => {
      if (segmentFilter !== 'all' && thread.segment !== segmentFilter) return false;
      if (channelFilter !== 'all' && thread.channel !== channelFilter) return false;

      if (!normalizedQuery) return true;

      return [
        thread.clientName,
        thread.clientPhone,
        thread.lastMessagePreview ?? '',
        getThreadContextLine(thread, locale) ?? '',
        ...thread.messages.map((message) => message.body),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });

    return sortThreads(next, sortMode, pinnedThreadIds);
  }, [channelFilter, locale, pinnedThreadIds, query, segmentFilter, sortMode, threads]);

  const channelOptions = [
    { value: 'all', label: copy.channel },
    { value: 'Web', label: 'Web' },
    { value: 'Telegram', label: locale === 'ru' ? 'ТГ' : 'Telegram' },
    { value: 'Instagram', label: locale === 'ru' ? 'Инстаграм' : 'Instagram' },
    { value: 'VK', label: locale === 'ru' ? 'ВК' : 'VK' },
  ] as const;

  const segmentOptions = [
    { value: 'all', label: copy.all },
    { value: 'new', label: copy.new },
    { value: 'active', label: copy.active },
    { value: 'followup', label: copy.followup },
  ] as const;

  const quickTransferPresets = useMemo(
    () => [
      { id: 'today', label: locale === 'ru' ? 'Сегодня' : 'Today', date: addDaysIso(0), time: '12:30' },
      { id: 'tomorrow', label: locale === 'ru' ? 'Завтра' : 'Tomorrow', date: addDaysIso(1), time: '13:00' },
      { id: 'plus-two', label: locale === 'ru' ? 'Через 2 дня' : 'In 2 days', date: addDaysIso(2), time: '15:30' },
    ],
    [locale],
  );

  const refreshThreads = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (!hasHydrated) return;

      if (!background) setIsLoading(true);

      if (demoMode) {
        const fallback = getDashboardDemoChatThreads(locale);

        try {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem(demoStorageKey) : null;
          const next = raw ? (JSON.parse(raw) as ChatThreadRecord[]) : fallback;
          setThreads(next);
          setActiveThreadId((current) => current ?? next[0]?.id ?? null);
          setError(null);
        } catch {
          setThreads(fallback);
          setActiveThreadId((current) => current ?? fallback[0]?.id ?? null);
          setError(null);
        } finally {
          setIsLoading(false);
        }

        return;
      }

      if (!ownedProfile) {
        setThreads([]);
        setActiveThreadId(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/chats', {
          credentials: 'include',
          cache: 'no-store',
          headers: getTelegramAppSessionHeaders(),
        });

        if (!response.ok) throw new Error('chat_fetch_failed');

        const payload = (await response.json()) as ChatThreadListResponse;
        const next = payload.threads ?? [];

        setThreads(next);
        setActiveThreadId((current) => current ?? next[0]?.id ?? null);
        setError(null);
      } catch {
        if (!background) setError(copy.loadError);
      } finally {
        setIsLoading(false);
      }
    },
    [copy.loadError, demoMode, demoStorageKey, hasHydrated, locale, ownedProfile],
  );

  useEffect(() => {
    void refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    if (!hasHydrated || demoMode || !ownedProfile || typeof window === 'undefined') return;

    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void refreshThreads({ background: true });
    };

    const id = window.setInterval(tick, 5000);
    window.addEventListener('focus', tick);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', tick);
    };
  }, [demoMode, hasHydrated, ownedProfile, refreshThreads]);

  useEffect(() => {
    if (!demoMode || !hasHydrated || typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(demoStorageKey, JSON.stringify(threads));
    } catch {}
  }, [demoMode, demoStorageKey, hasHydrated, threads]);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(pinnedStorageKey);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      setPinnedThreadIds(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
    } catch {
      setPinnedThreadIds([]);
    }
  }, [hasHydrated, pinnedStorageKey]);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(pinnedStorageKey, JSON.stringify(pinnedThreadIds));
    } catch {}
  }, [hasHydrated, pinnedStorageKey, pinnedThreadIds]);

  useEffect(() => {
    if (!threads.length) {
      setActiveThreadId(null);
      return;
    }

    if (!activeThreadId || !threads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, threads]);

  useEffect(() => {
    const node = isMobile && mobileThreadOpen ? mobileMessageScrollRef.current : desktopMessageScrollRef.current;
    if (!node) return;

    const scroll = () => {
      node.scrollTop = node.scrollHeight;
      messageBottomRef.current?.scrollIntoView({ block: 'end' });
    };

    scroll();
    window.requestAnimationFrame(scroll);
  }, [activeThread?.id, activeThread?.messages.length, isMobile, mobileThreadOpen]);

  async function patchThread(threadId: string, patch: Partial<ChatThreadRecord>) {
    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : thread,
      ),
    );

    if (demoMode) return;

    await fetch('/api/chats', {
      method: 'PATCH',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getTelegramAppSessionHeaders(),
      },
      body: JSON.stringify({ threadId, patch }),
    }).catch(() => undefined);
  }

  function selectThread(thread: ChatThreadRecord) {
    setActiveThreadId(thread.id);

    if (getThreadBookingContexts(thread).length && !selectedBookingByThreadId[thread.id]) {
      setSelectedBookingByThreadId((current) => ({ ...current, [thread.id]: getThreadBookingContexts(thread)[0].id }));
    }

    if (thread.unreadCount > 0) {
      void patchThread(thread.id, { unreadCount: 0 });
    }

    if (isMobile) setMobileThreadOpen(true);
  }

  async function handleCreateThread() {
    const clientName = newClientName.trim();
    const clientPhone = newClientPhone.trim();

    if (!clientName || !clientPhone) {
      setError(copy.addClientError);
      return;
    }

    const localThread = createLocalThread(locale, clientName, clientPhone);
    setError(null);

    if (demoMode) {
      setThreads((current) => [localThread, ...current]);
      setActiveThreadId(localThread.id);
      setNewClientName('');
      setNewClientPhone('');
      setShowCreatePanel(false);
      return;
    }

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...getTelegramAppSessionHeaders(),
        },
        body: JSON.stringify({ type: 'thread', clientName, clientPhone, channel: 'Telegram' }),
      });

      if (!response.ok) throw new Error('thread_create_failed');

      const payload = (await response.json()) as { thread?: ChatThreadRecord };
      const nextThread = payload.thread ?? localThread;

      setThreads((current) => [nextThread, ...current]);
      setActiveThreadId(nextThread.id);
      setNewClientName('');
      setNewClientPhone('');
      setShowCreatePanel(false);
    } catch {
      setError(copy.addClientError);
    }
  }

  async function handleSendMessage() {
    if (!activeThread || !draft.trim()) return;

    const body = draft.trim();
    const viaBot = composerFlow !== null;
    const localMessage = createLocalMessage(activeThread.id, body, viaBot ? 'system' : 'master', viaBot);
    const flow = composerFlow;
    const date = transferDate;
    const time = transferTime || '12:30';

    setIsSending(true);
    setDraft('');
    setSelectedTemplateId('custom');
    setComposerFlow(null);
    setError(null);

    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              segment: viaBot ? (flow === 'followup' ? 'followup' : 'active') : 'active',
              lastMessagePreview: body,
              lastMessageAt: localMessage.createdAt,
              unreadCount: 0,
              messages: [...thread.messages, localMessage],
              updatedAt: localMessage.createdAt,
            }
          : thread,
      ),
    );

    if (demoMode) {
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...getTelegramAppSessionHeaders(),
        },
        body: JSON.stringify({
          type: 'message',
          threadId: activeThread.id,
          body,
          author: viaBot ? 'system' : 'master',
          deliveryState: 'sent',
          viaBot,
          clientMessageKey: localMessage.id,
          ...(selectedBookingId ? { bookingId: selectedBookingId } : {}),
          ...(flow === 'reschedule' && date ? { rescheduleProposal: { date, time } } : {}),
        }),
      });

      if (!response.ok) throw new Error('send_failed');
    } catch {
      setError(copy.sendError);
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;

    event.preventDefault();
    if (!activeThread || !draft.trim() || isSending) return;
    void handleSendMessage();
  }

  function handleDeleteThread(threadId: string) {
    const next = threads.filter((thread) => thread.id !== threadId);
    setThreads(next);
    setPinnedThreadIds((current) => current.filter((id) => id !== threadId));

    if (activeThreadId === threadId) {
      setActiveThreadId(next[0]?.id ?? null);
      setMobileThreadOpen(false);
    }

    if (!demoMode) {
      fetch('/api/chats', {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...getTelegramAppSessionHeaders(),
        },
        body: JSON.stringify({ threadId }),
      }).catch(() => undefined);
    }
  }

  function handleExportThread(thread: ChatThreadRecord | null) {
    if (!thread || typeof window === 'undefined') return;

    const safeName =
      thread.clientName
        .trim()
        .toLowerCase()
        .replace(/[^a-zа-я0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '') || 'thread';

    const lines = [
      `${copy.clientName}: ${thread.clientName}`,
      `${copy.clientPhone}: ${thread.clientPhone}`,
      `${copy.channel}: ${channelLabel(thread.channel, locale)}`,
      '',
      ...thread.messages.map((message) => {
        const author =
          message.author === 'client'
            ? thread.clientName
            : message.author === 'system'
              ? 'Bot'
              : 'Master';

        return `[${formatLongDateLabel(message.createdAt, locale)} ${formatTimeLabel(message.createdAt, locale)}] ${author}: ${message.body}`;
      }),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `chat-${safeName}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();

    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }

  function handleTemplateChange(value: string) {
    setSelectedTemplateId(value);
    if (value === 'custom') return;

    const template = templateOptions.find((item) => item.id === value);
    if (!template) return;

    setComposerFlow(null);
    setDraft(fillTemplateContent(template.content, activeThread, locale, publicPageHref));
  }

  function applyBotFlow(flow: BotFlow) {
    if (!activeThread) return;

    const nextVisit =
      flow === 'reschedule' && transferDate
        ? `${transferDate}${transferTime ? ` ${transferTime}` : ''}`
        : activeThread.nextVisit ?? undefined;

    setComposerFlow(flow);
    setDraft(buildBotDraft(flow, activeThread, locale, nextVisit));
  }

  function applyQuickTransfer(date: string, time: string) {
    setTransferDate(date);
    setTransferTime(time);
    setComposerFlow('reschedule');

    if (activeThread) {
      setDraft(buildBotDraft('reschedule', activeThread, locale, `${date} ${time}`));
    }
  }

  function handleApplyTransfer() {
    if (!activeThread || !transferDate) return;

    const nextVisitIso = `${transferDate}T${transferTime || '12:30'}:00`;
    void patchThread(activeThread.id, { nextVisit: nextVisitIso, segment: 'active' });
    applyBotFlow('reschedule');
  }

  function togglePin(threadId: string) {
    setPinnedThreadIds((current) => (current.includes(threadId) ? current.filter((id) => id !== threadId) : [threadId, ...current]));
  }

  if (!hasHydrated || !mounted) return null;

  const selectedThread = activeThread;
  const hasThreads = filteredThreads.length > 0;

  const stats = [
    { label: copy.all, value: threads.length, active: segmentFilter === 'all', action: () => setSegmentFilter('all') },
    { label: copy.unread, value: unreadTotal, active: sortMode === 'unread', action: () => setSortMode('unread') },
    { label: copy.priority, value: priorityTotal, active: sortMode === 'priority', action: () => setSortMode('priority') },
  ];

  const renderThreadRow = (thread: ChatThreadRecord) => {
    const active = thread.id === activeThreadId;
    const pinned = pinnedThreadIds.includes(thread.id);
    const context = getThreadContextLine(thread, locale);
    const service = getThreadServiceLabel(thread);

    return (
      <button
        key={thread.id}
        type="button"
        onClick={() => selectThread(thread)}
        className={cn(
          'group grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-3 px-3 py-3 text-left transition-colors',
          active
            ? isLight
              ? 'bg-black/[0.045]'
              : 'bg-white/[0.07]'
            : isLight
              ? 'hover:bg-black/[0.025]'
              : 'hover:bg-white/[0.04]',
        )}
      >
        <div
          className={cn(
            'relative grid size-11 place-items-center rounded-full border text-[12px] font-semibold',
            isLight ? 'border-black/[0.07] bg-black/[0.025] text-black' : 'border-white/[0.08] bg-white/[0.045] text-white',
          )}
        >
          {getInitials(thread.clientName)}

          {thread.unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full px-1.5 py-[1px] text-[8.5px] font-semibold text-white" style={{ background: accentColor }}>
              {thread.unreadCount}
            </span>
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <div className={cn('truncate text-[13px] font-semibold tracking-[-0.018em]', pageText(isLight))}>
              {thread.clientName}
            </div>
            {pinned ? <Pin className={cn('size-3 shrink-0 fill-current', mutedText(isLight))} /> : null}
            {thread.isPriority ? <Star className="size-3 shrink-0 fill-current" style={{ color: accentColor }} /> : null}
          </div>

          <div className={cn('mt-0.5 truncate text-[10.5px] font-semibold', pageText(isLight))}>
            {getThreadBookingCode(thread) ? `${getThreadBookingCode(thread)} · ` : ''}
            {service ?? context ?? segmentLabel(thread.segment, locale)}
          </div>

          <div className={cn('mt-0.5 line-clamp-1 text-[10.5px]', mutedText(isLight))}>
            {thread.lastMessagePreview || (locale === 'ru' ? 'Сообщений пока нет' : 'No messages yet')}
          </div>
        </div>

        <div className="flex min-w-[46px] flex-col items-end gap-1">
          <span className={cn('text-[9.5px] font-medium tabular-nums', faintText(isLight))}>
            {formatTimeLabel(thread.lastMessageAt, locale)}
          </span>
          <span className={cn('text-[9px]', faintText(isLight))}>
            {channelLabel(thread.channel, locale)}
          </span>
        </div>
      </button>
    );
  };

  const renderThreadList = () => (
    <div className={cn('min-h-0 flex-1 overflow-y-auto divide-y', isLight ? 'divide-black/[0.055]' : 'divide-white/[0.06]')}>
      {isLoading ? (
        Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[44px_minmax(0,1fr)_40px] gap-3 px-3 py-3">
            <div className={cn('size-11 animate-pulse rounded-full', isLight ? 'bg-black/[0.055]' : 'bg-white/[0.07]')} />
            <div className="space-y-2 py-1">
              <div className={cn('h-3 w-2/3 animate-pulse rounded-full', isLight ? 'bg-black/[0.055]' : 'bg-white/[0.07]')} />
              <div className={cn('h-2.5 w-full animate-pulse rounded-full', isLight ? 'bg-black/[0.04]' : 'bg-white/[0.05]')} />
            </div>
          </div>
        ))
      ) : hasThreads ? (
        filteredThreads.map(renderThreadRow)
      ) : (
        <div className="p-3">
          <EmptyState title={copy.emptyList} hint={copy.emptyListHint} light={isLight} />
        </div>
      )}
    </div>
  );

  const renderFilters = () => (
    <div className="space-y-2.5">
      <label
        className={cn(
          'flex h-10 min-w-0 items-center gap-2 rounded-full border px-3 shadow-none outline-none transition-colors',
          isLight
            ? 'border-black/[0.08] bg-black/[0.02] text-black/56 focus-within:border-black/[0.15]'
            : 'border-white/[0.08] bg-white/[0.04] text-white/52 focus-within:border-white/[0.15]',
        )}
      >
        <Search className="size-4 shrink-0 opacity-70" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.search}
          className="block h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[12.5px] font-medium text-current outline-none placeholder:text-current/55"
        />
      </label>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {segmentOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSegmentFilter(option.value)}
            className={cn(
              'h-8 shrink-0 rounded-full border px-3 text-[11px] font-semibold transition',
              segmentFilter === option.value
                ? 'cb-accent-pill-active'
                : isLight
                  ? 'border-black/[0.07] bg-white text-black/46 hover:text-black'
                  : 'border-white/[0.08] bg-white/[0.04] text-white/42 hover:text-white',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value as ChannelFilter)}>
          <SelectTrigger className={cn('h-9 rounded-full text-[11px]', inputTone(isLight))}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {channelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
          <SelectTrigger className={cn('h-9 rounded-full text-[11px]', inputTone(isLight))}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{copy.recent}</SelectItem>
            <SelectItem value="unread">{copy.unread}</SelectItem>
            <SelectItem value="priority">{copy.priority}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderCreatePanel = () =>
    showCreatePanel ? (
      <div className={cn('border-t p-3', borderTone(isLight))}>
        <Panel light={isLight} className="grid gap-2 p-3">
          <div className={cn('text-[10px] font-semibold uppercase tracking-[0.14em]', mutedText(isLight))}>
            {copy.createClient}
          </div>

          <Input value={newClientName} onChange={(event) => setNewClientName(event.target.value)} placeholder={copy.clientName} className={cn('h-10 rounded-[10px]', inputTone(isLight))} />
          <Input value={newClientPhone} onChange={(event) => setNewClientPhone(event.target.value)} placeholder={copy.clientPhone} className={cn('h-10 rounded-[10px]', inputTone(isLight))} />

          <div className="flex justify-end gap-2">
            <button type="button" className={buttonBase(isLight)} onClick={() => setShowCreatePanel(false)}>
              {copy.cancel}
            </button>
            <button type="button" className={buttonBase(isLight, true)} onClick={handleCreateThread}>
              <Plus className="size-3.5" />
              {copy.create}
            </button>
          </div>
        </Panel>
      </div>
    ) : null;

  const renderMessages = (mobile = false) => {
    if (!selectedThread) {
      return <EmptyState title={copy.emptyThread} hint={copy.emptyThreadHint} light={isLight} />;
    }

    if (!selectedThread.messages.length) {
      return <EmptyState title={copy.noMessages} hint={copy.noMessagesHint} light={isLight} />;
    }

    return (
      <div className={cn('mx-auto flex min-h-full w-full max-w-[820px] flex-col justify-end gap-2.5', mobile && 'max-w-full')}>
        {selectedThread.messages.map((message, index) => {
          const mine = message.author === 'master' || message.author === 'system';
          const status = deliveryLabel(message.deliveryState, locale);
          const currentDay = message.createdAt.slice(0, 10);
          const previousDay = selectedThread.messages[index - 1]?.createdAt.slice(0, 10);
          const showDayDivider = currentDay !== previousDay;

          return (
            <div key={message.id} className="space-y-1.5">
              {showDayDivider ? (
                <div className="flex items-center gap-2.5 py-2">
                  <div className={cn('h-px flex-1', isLight ? 'bg-black/[0.08]' : 'bg-white/[0.08]')} />
                  <div className={cn('text-[9.5px] font-medium uppercase tracking-[0.14em]', mutedText(isLight))}>
                    {formatLongDateLabel(message.createdAt, locale)}
                  </div>
                  <div className={cn('h-px flex-1', isLight ? 'bg-black/[0.08]' : 'bg-white/[0.08]')} />
                </div>
              ) : null}

              <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'rounded-[16px] border px-3.5 py-2.5',
                    mobile ? 'max-w-[88%]' : 'max-w-[76%]',
                    mine
                      ? isLight
                        ? 'border-black/[0.07] bg-black/[0.04] text-black'
                        : 'border-white/[0.075] bg-white/[0.07] text-white'
                      : isLight
                        ? 'border-black/[0.07] bg-white text-black'
                        : 'border-white/[0.075] bg-[#101010] text-white',
                  )}
                  style={mine && message.viaBot ? accentPillStyle(accentColor, isLight) : undefined}
                >
                  <div className={cn('whitespace-pre-wrap text-[13px] leading-5', pageText(isLight))}>{message.body}</div>
                  <div className={cn('mt-1.5 flex items-center justify-end gap-2 text-[9.5px]', mutedText(isLight))}>
                    {message.viaBot ? <span>{copy.byBot}</span> : null}
                    {status ? <span>{status}</span> : null}
                    <span>{formatTimeLabel(message.createdAt, locale)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageBottomRef} className="h-px shrink-0" aria-hidden />
      </div>
    );
  };

  const renderComposer = () => (
    <footer className={cn('shrink-0 border-t p-3', borderTone(isLight), isLight ? 'bg-white' : 'bg-[#101010]')}>
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className={buttonBase(isLight, composerFlow === 'confirm')} disabled={!selectedThread} onClick={() => applyBotFlow('confirm')}>
            <CheckCheck className="size-3.5" />
            {copy.confirm}
          </button>
          <button
            type="button"
            className={buttonBase(isLight, composerFlow === 'reschedule')}
            disabled={!selectedThread}
            onClick={() => {
              const preset = quickTransferPresets[0];
              if (preset) applyQuickTransfer(preset.date, preset.time);
              else applyBotFlow('reschedule');
            }}
          >
            <ArrowRightLeft className="size-3.5" />
            {copy.reschedule}
          </button>
          <button type="button" className={buttonBase(isLight, composerFlow === 'followup')} disabled={!selectedThread} onClick={() => applyBotFlow('followup')}>
            <Sparkles className="size-3.5" />
            {copy.followupAction}
          </button>
        </div>

        {composerFlow === 'reschedule' ? (
          <Panel light={isLight} className="grid gap-2 p-3 md:grid-cols-[1fr_132px_auto]">
            <Input type="date" value={transferDate} onChange={(event) => setTransferDate(event.target.value)} className={cn('h-10 rounded-[10px]', inputTone(isLight))} />
            <Input type="time" step="1800" value={transferTime} onChange={(event) => setTransferTime(event.target.value)} className={cn('h-10 rounded-[10px]', inputTone(isLight))} />
            <button type="button" className={buttonBase(isLight, true)} onClick={handleApplyTransfer} disabled={!selectedThread || !transferDate}>
              <CalendarClock className="size-3.5" />
              {copy.applyTransfer}
            </button>
          </Panel>
        ) : null}

        <div className="grid gap-2 xl:grid-cols-[184px_minmax(0,1fr)]">
          <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
            <SelectTrigger className={cn('h-10 rounded-[10px]', inputTone(isLight))}>
              <SelectValue placeholder={copy.template} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">{copy.template}</SelectItem>
              {templateOptions.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid gap-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={copy.message}
              className={cn('min-h-[68px] resize-none rounded-[12px] px-3 py-2.5 text-[13px]', inputTone(isLight))}
              disabled={!selectedThread}
            />

            <div className="flex items-center justify-between gap-2">
              <div className={cn('truncate text-[10.5px]', mutedText(isLight))}>
                {selectedThread ? selectedThread.clientName : '—'}
              </div>

              <div className="flex gap-1.5">
                <button type="button" className={buttonBase(isLight)} onClick={() => setDraft('')} disabled={!draft}>
                  {copy.clear}
                </button>
                <button type="button" className={buttonBase(isLight, true)} onClick={handleSendMessage} disabled={!selectedThread || !draft.trim() || isSending}>
                  <SendHorizonal className="size-3.5" />
                  {copy.send}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="text-[11px] text-destructive">{error}</div> : null}
      </div>
    </footer>
  );

  const renderChatHeader = (mobile = false) => (
    <header className={cn('shrink-0 border-b px-3 py-3', borderTone(isLight), isLight ? 'bg-white' : 'bg-[#101010]')}>
      {selectedThread ? (
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {mobile ? (
              <Button type="button" className={cn('size-9 shrink-0 px-0', buttonBase(isLight))} onClick={() => setMobileThreadOpen(false)}>
                <ChevronLeft className="size-4" />
              </Button>
            ) : null}

            <div className={cn('grid size-11 shrink-0 place-items-center rounded-full border text-[13px] font-semibold', isLight ? 'border-black/[0.07] bg-black/[0.025] text-black' : 'border-white/[0.08] bg-white/[0.045] text-white')}>
              {getInitials(selectedThread.clientName)}
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <div className={cn('truncate text-[16px] font-semibold tracking-[-0.025em]', pageText(isLight))}>
                  {selectedThread.clientName}
                </div>
                <MicroLabel light={isLight} className="h-6 px-2 py-0 text-[9px]">{channelLabel(selectedThread.channel, locale)}</MicroLabel>
                <MicroLabel light={isLight} active accentColor={accentColor} className="h-6 px-2 py-0 text-[9px]">{segmentLabel(selectedThread.segment, locale)}</MicroLabel>
              </div>

              <div className={cn('mt-1 truncate text-[11px] font-medium', pageText(isLight))}>
                {selectedBookingContext ? getBookingContextLabel(selectedBookingContext, locale) : getThreadContextLine(selectedThread, locale) ?? selectedThread.clientPhone}
              </div>

              {activeBookingContexts.length > 1 ? (
                <div className="mt-2 flex max-w-full gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {activeBookingContexts.map((context) => (
                    <button
                      key={context.id}
                      type="button"
                      onClick={() => setSelectedBookingByThreadId((current) => ({ ...current, [selectedThread.id]: context.id }))}
                      className={cn(
                        'max-w-[200px] shrink-0 truncate rounded-full border px-2 py-1 text-[9.5px] font-semibold transition',
                        context.id === selectedBookingId
                          ? 'cb-accent-pill-active'
                          : isLight
                            ? 'border-black/[0.07] bg-white text-black/46'
                            : 'border-white/[0.08] bg-white/[0.04] text-white/42',
                      )}
                    >
                      {getBookingContextLabel(context, locale)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button asChild className={cn('size-9 px-0', buttonBase(isLight))}>
              <Link href={`tel:${selectedThread.clientPhone}`}>
                <PhoneCall className="size-4" />
              </Link>
            </Button>

            <button
              type="button"
              className={cn('size-9 px-0', buttonBase(isLight, pinnedThreadIds.includes(selectedThread.id)))}
              onClick={() => togglePin(selectedThread.id)}
              title={pinnedThreadIds.includes(selectedThread.id) ? copy.unpin : copy.pin}
            >
              <Pin className={cn('size-4', pinnedThreadIds.includes(selectedThread.id) && 'fill-current')} />
            </button>

            <button
              type="button"
              className={cn('size-9 px-0', buttonBase(isLight, selectedThread.isPriority))}
              onClick={() => void patchThread(selectedThread.id, { isPriority: !selectedThread.isPriority })}
              title={selectedThread.isPriority ? copy.priorityOn : copy.priorityOff}
            >
              <Star className={cn('size-4', selectedThread.isPriority && 'fill-current')} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className={cn('text-[14px] font-semibold', pageText(isLight))}>{copy.emptyThread}</div>
          <div className={cn('mt-1 text-[11px]', mutedText(isLight))}>{copy.emptyThreadHint}</div>
        </div>
      )}
    </header>
  );

  const renderClientPanel = () => (
    <aside className={cn('hidden min-h-0 flex-col border-l xl:flex', borderTone(isLight), isLight ? 'bg-white' : 'bg-[#101010]')}>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          <Panel light={isLight} className="p-4">
            <div className={cn('text-[10px] font-semibold uppercase tracking-[0.14em]', mutedText(isLight))}>
              {copy.openProfile}
            </div>

            <div className={cn('mt-2 text-[22px] font-semibold tracking-[-0.06em]', pageText(isLight))}>
              {selectedThread?.clientName ?? copy.emptyThread}
            </div>

            <div className={cn('mt-1 text-[11px]', mutedText(isLight))}>
              {selectedThread?.clientPhone ?? copy.emptyThreadHint}
            </div>
          </Panel>

          {selectedThread ? (
            <>
              <Panel light={isLight} className="divide-y overflow-hidden">
                {[
                  { label: copy.source, value: selectedThread.source || channelLabel(selectedThread.channel, locale) },
                  { label: copy.nextVisit, value: selectedThread.nextVisit ? formatLongDateLabel(selectedThread.nextVisit, locale) : copy.notScheduled },
                  { label: copy.unread, value: String(selectedThread.unreadCount) },
                  { label: 'Bot', value: selectedThread.botConnected ? copy.botOn : copy.botOff },
                ].map((item) => (
                  <div key={item.label} className={cn('flex items-center justify-between gap-3 px-3 py-2.5', isLight ? 'divide-black/[0.08]' : 'divide-white/[0.08]')}>
                    <span className={cn('text-[11px]', mutedText(isLight))}>{item.label}</span>
                    <span className={cn('max-w-[160px] truncate text-right text-[11px] font-medium', pageText(isLight))}>{item.value}</span>
                  </div>
                ))}
              </Panel>

              <div className="grid gap-2">
                <button type="button" className={buttonBase(isLight, selectedThread.botConnected)} onClick={() => void patchThread(selectedThread.id, { botConnected: !selectedThread.botConnected })}>
                  <Bot className="size-3.5" />
                  {selectedThread.botConnected ? copy.botOn : copy.botOff}
                </button>

                <button type="button" className={buttonBase(isLight)} onClick={() => handleExportThread(selectedThread)}>
                  <Download className="size-3.5" />
                  {copy.export}
                </button>

                <button type="button" className={buttonBase(isLight)} onClick={() => handleDeleteThread(selectedThread.id)}>
                  <Trash2 className="size-3.5" />
                  {copy.delete}
                </button>
              </div>

              <Panel light={isLight} className="p-3">
                <div className={cn('text-[10px] font-semibold uppercase tracking-[0.14em]', mutedText(isLight))}>
                  {copy.reschedule}
                </div>

                <div className="mt-3 grid gap-2">
                  {quickTransferPresets.map((preset) => (
                    <button key={preset.id} type="button" className={buttonBase(isLight)} onClick={() => applyQuickTransfer(preset.date, preset.time)}>
                      <CalendarClock className="size-3.5" />
                      {preset.label} · {preset.time}
                    </button>
                  ))}
                </div>
              </Panel>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );

  const desktopLayout = (
    <main className={cn('h-[calc(100dvh-68px)] overflow-hidden px-4 pb-4 pt-5 md:px-7 md:pt-6', pageBg(isLight))}>
      <div className={cn('mx-auto grid h-full min-h-0 w-full max-w-[var(--page-max-width)] overflow-hidden rounded-[18px] border lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[370px_minmax(0,1fr)_300px]', isLight ? 'border-black/[0.08] bg-white shadow-[0_18px_70px_rgba(17,17,17,0.045)]' : 'border-white/[0.09] bg-[#101010]')}>
        <aside className={cn('grid min-h-0 grid-rows-[auto_auto_auto_minmax(0,1fr)] border-r', borderTone(isLight), isLight ? 'bg-white' : 'bg-[#101010]')}>
          <header className={cn('border-b px-4 py-3.5', borderTone(isLight))}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className={cn('truncate text-[24px] font-semibold tracking-[-0.065em]', pageText(isLight))}>{copy.title}</h1>
                <p className={cn('mt-0.5 truncate text-[10.5px]', mutedText(isLight))}>
                  {demoMode ? copy.demo : copy.live} · {filteredThreads.length}
                  {unreadTotal > 0 ? ` · ${unreadTotal} ${copy.unread}` : ''}
                </p>
              </div>

              <button type="button" className={cn('size-10 rounded-full px-0', buttonBase(isLight, showCreatePanel))} onClick={() => setShowCreatePanel((current) => !current)}>
                <Plus className="size-4" />
              </button>
            </div>

            <div className="mt-3">{renderFilters()}</div>
          </header>

          <div className={cn('grid grid-cols-3 gap-1.5 border-b p-3', borderTone(isLight))}>
            {stats.map((item) => (
              <button key={item.label} type="button" onClick={item.action} className={cn('rounded-[12px] border px-2 py-2 text-left transition', item.active ? 'cb-accent-pill-active' : isLight ? 'border-black/[0.07] bg-black/[0.015]' : 'border-white/[0.08] bg-white/[0.035]')}>
                <div className={cn('text-[9px] font-medium', mutedText(isLight))}>{item.label}</div>
                <div className={cn('mt-1 text-[17px] font-semibold tracking-[-0.06em]', pageText(isLight))}>{item.value}</div>
              </button>
            ))}
          </div>

          {renderCreatePanel()}
          {renderThreadList()}
        </aside>

        <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
          {renderChatHeader(false)}
          <div ref={desktopMessageScrollRef} className={cn('min-h-0 overflow-y-auto px-4 py-4', isLight ? 'bg-[#f7f6f2]/55' : 'bg-black/20')}>
            {renderMessages(false)}
          </div>
          {renderComposer()}
        </section>

        {renderClientPanel()}
      </div>
    </main>
  );

  const mobileLayout = (
    <main className={cn('h-[calc(100dvh-68px)] overflow-hidden', pageBg(isLight))}>
      <section className={cn('grid h-full min-h-0 grid-rows-[auto_auto_auto_minmax(0,1fr)]', isLight ? 'bg-white' : 'bg-[#101010]')}>
        <header className={cn('border-b px-4 pb-3 pt-4', borderTone(isLight))}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className={cn('truncate text-[24px] font-semibold tracking-[-0.06em]', pageText(isLight))}>{copy.title}</h1>
              <p className={cn('mt-0.5 text-[10.5px]', mutedText(isLight))}>{demoMode ? copy.demo : copy.live} · {filteredThreads.length}</p>
            </div>

            <button type="button" className={cn('size-10 rounded-full px-0', buttonBase(isLight, showCreatePanel))} onClick={() => setShowCreatePanel((current) => !current)}>
              <Plus className="size-4" />
            </button>
          </div>

          <div className="mt-3">{renderFilters()}</div>
        </header>

        <div className={cn('grid grid-cols-3 gap-1.5 border-b p-3', borderTone(isLight))}>
          {stats.map((item) => (
            <button key={item.label} type="button" onClick={item.action} className={cn('rounded-[12px] border px-2 py-2 text-left transition', item.active ? 'cb-accent-pill-active' : isLight ? 'border-black/[0.07] bg-black/[0.015]' : 'border-white/[0.08] bg-white/[0.035]')}>
              <div className={cn('text-[9px] font-medium', mutedText(isLight))}>{item.label}</div>
              <div className={cn('mt-1 text-[17px] font-semibold tracking-[-0.06em]', pageText(isLight))}>{item.value}</div>
            </button>
          ))}
        </div>

        {renderCreatePanel()}
        {renderThreadList()}
      </section>

      {mobileThreadOpen && selectedThread ? (
        <div className={cn('fixed inset-0 z-[70] grid grid-rows-[auto_minmax(0,1fr)_auto]', pageBg(isLight))}>
          {renderChatHeader(true)}
          <div ref={mobileMessageScrollRef} className={cn('min-h-0 overflow-y-auto px-3 py-3', isLight ? 'bg-[#f7f6f2]/55' : 'bg-black/20')}>
            {renderMessages(true)}
          </div>
          {renderComposer()}
        </div>
      ) : null}
    </main>
  );

  return <WorkspaceShell>{isMobile ? mobileLayout : desktopLayout}</WorkspaceShell>;
}
