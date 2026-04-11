'use client';

import { useEffect, useMemo, useState } from 'react';
import { useBrowserSearchParams } from '@/hooks/use-browser-search-params';
import { useMobile } from '@/hooks/use-mobile';
import {
  ArrowRightLeft,
  Bot,
  CalendarClock,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  MessageSquareQuote,
  Plus,
  Search,
  SendHorizonal,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { Badge } from '@/components/ui/badge';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type {
  ChatDeliveryState,
  ChatMessageRecord,
  ChatThreadListResponse,
  ChatThreadRecord,
} from '@/lib/chat-types';
import { getDashboardDemoStorageKey, isDashboardDemoEnabled } from '@/lib/dashboard-demo';
import { SLOTY_DEMO_SLUG, getDashboardDemoChatThreads } from '@/lib/demo-data';
import { cn } from '@/lib/utils';

type SegmentFilter = 'all' | ChatThreadRecord['segment'];
type ChannelFilter = 'all' | ChatThreadRecord['channel'];
type SortMode = 'recent' | 'priority' | 'unread';
type BotFlow = 'confirm' | 'reschedule' | 'followup';

function getInitials(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'S'
  );
}

function formatTimeLabel(value: string, locale: 'ru' | 'en') {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDateLabel(value: string, locale: 'ru' | 'en') {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function formatLongDateLabel(value: string, locale: 'ru' | 'en') {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  }).format(new Date(value));
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

function formatPickerDateLabel(value: string, locale: 'ru' | 'en') {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${value}T00:00:00`));
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, index) => {
  const hour = 9 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});

function deliveryLabel(value: ChatDeliveryState | null | undefined, locale: 'ru' | 'en') {
  if (!value) return null;

  const labels = locale === 'ru'
    ? {
        queued: 'В очереди',
        sent: 'Отправлено',
        delivered: 'Доставлено',
        read: 'Прочитано',
      }
    : {
        queued: 'Queued',
        sent: 'Sent',
        delivered: 'Delivered',
        read: 'Read',
      };

  return labels[value];
}

function buildBotDraft(flow: BotFlow, thread: ChatThreadRecord, locale: 'ru' | 'en', nextVisit?: string) {
  if (flow === 'confirm') {
    return locale === 'ru'
      ? `Здравствуйте, ${thread.clientName}! Подтверждаю запись. Если планы поменяются, просто ответьте в этот чат.`
      : `Hi ${thread.clientName}! Your booking is confirmed. If anything changes, just reply in this chat.`;
  }

  if (flow === 'reschedule') {
    return locale === 'ru'
      ? `Здравствуйте, ${thread.clientName}! Подготовила перенос на ${nextVisit ?? 'новое время'}. Если слот подходит — подтвердите ответом в чате.`
      : `Hi ${thread.clientName}! I prepared a reschedule for ${nextVisit ?? 'a new time'}. Reply here if the slot works for you.`;
  }

  return locale === 'ru'
    ? `Спасибо за визит, ${thread.clientName}! Когда будете готовы, я пришлю ближайшие удобные слоты прямо сюда.`
    : `Thanks for visiting, ${thread.clientName}! When you are ready, I can send the nearest convenient slots here.`;
}

function fillTemplateContent(
  content: string,
  thread: ChatThreadRecord | null,
  locale: 'ru' | 'en',
  publicHref: string,
) {
  if (!thread) return content;

  const fallbackDate = locale === 'ru' ? 'ближайшую дату' : 'the next date';
  const fallbackTime = locale === 'ru' ? 'удобное время' : 'a convenient time';
  const fallbackService = locale === 'ru' ? 'визит' : 'appointment';

  const rawService = thread.metadata && typeof thread.metadata['service'] === 'string' ? String(thread.metadata['service']) : null;
  const rawNextVisit = thread.nextVisit ?? null;
  const normalizedNextVisit = rawNextVisit
    ? rawNextVisit.includes('T')
      ? rawNextVisit
      : rawNextVisit.includes(' ')
        ? rawNextVisit.replace(' ', 'T')
        : `${rawNextVisit}T12:00:00`
    : null;

  const visitDateLabel = normalizedNextVisit ? formatDateLabel(normalizedNextVisit, locale) : fallbackDate;
  const visitTimeLabel = normalizedNextVisit ? formatTimeLabel(normalizedNextVisit, locale) : fallbackTime;

  return content
    .replaceAll('{{имя}}', thread.clientName)
    .replaceAll('{{дата}}', visitDateLabel)
    .replaceAll('{{время}}', visitTimeLabel)
    .replaceAll('{{услуга}}', rawService ?? fallbackService)
    .replaceAll('{{ссылка}}', publicHref);
}

function sortThreads(items: ChatThreadRecord[], sortMode: SortMode) {
  const next = [...items];

  next.sort((left, right) => {
    if (sortMode === 'priority' && left.isPriority !== right.isPriority) {
      return left.isPriority ? -1 : 1;
    }

    if (sortMode === 'unread' && left.unreadCount !== right.unreadCount) {
      return right.unreadCount - left.unreadCount;
    }

    return new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime();
  });

  return next;
}

function replaceThread(
  items: ChatThreadRecord[],
  threadId: string,
  updater: (thread: ChatThreadRecord) => ChatThreadRecord,
) {
  return items.map((item) => (item.id === threadId ? updater(item) : item));
}

function createLocalMessage(threadId: string, body: string, author: 'master' | 'system', viaBot: boolean): ChatMessageRecord {
  return {
    id: crypto.randomUUID(),
    threadId,
    author,
    body,
    viaBot,
    deliveryState: author === 'master' || author === 'system' ? 'sent' : null,
    createdAt: new Date().toISOString(),
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

function segmentBadgeLabel(segment: ChatThreadRecord['segment'], locale: 'ru' | 'en') {
  if (locale === 'ru') {
    return {
      new: 'Новый',
      active: 'В работе',
      followup: 'Follow-up',
    }[segment];
  }

  return {
    new: 'New',
    active: 'Active',
    followup: 'Follow-up',
  }[segment];
}

export default function DashboardChatsPage() {
  const { hasHydrated, ownedProfile, locale, dataset, demoMode: demoModeFromHook } = useOwnedWorkspaceData();
  const searchParams = useBrowserSearchParams();
  const isMobile = useMobile();
  const demoMode = demoModeFromHook || isDashboardDemoEnabled(searchParams);
  const demoStorageKey = getDashboardDemoStorageKey('chats');
  const publicPageHref = ownedProfile ? `/m/${ownedProfile.slug}` : `/demo/${SLOTY_DEMO_SLUG}`;

  const labels = locale === 'ru'
    ? {
        badge: demoMode ? 'Демо-входящие' : 'Входящие',
        title: 'Чаты',
        description: demoMode
          ? 'Входящие, шаблоны и ответы.'
          : 'Входящие, шаблоны и ответы.',
        search: 'Поиск по имени, номеру или тексту',
        allThreads: 'Все',
        newThreads: 'Новые',
        activeThreads: 'В работе',
        followupThreads: 'Повторный контакт',
        allChannels: 'Все каналы',
        recentSort: 'Сначала новые',
        prioritySort: 'Приоритет',
        unreadSort: 'Непрочитанные',
        total: 'Всего',
        selected: 'Открыто',
        demo: 'Демо-режим',
        live: 'Рабочие данные',
        createThread: 'Новый чат',
        createInline: 'Новый клиент',
        clientName: 'Имя клиента',
        clientPhone: 'Телефон',
        cancel: 'Отмена',
        create: 'Создать',
        botConnected: 'Бот подключён',
        botOff: 'Бот выключен',
        priorityOn: 'В приоритете',
        priorityOff: 'Обычный',
        source: 'Источник',
        nextVisit: 'Следующий визит',
        notScheduled: 'Не назначен',
        emptyList: 'Чаты по этому фильтру пока не найдены.',
        emptyListHint: 'Попробуйте другой фильтр или добавьте новый чат.',
        emptyThread: 'Выберите чат',
        emptyThreadHint: 'Откройте диалог, чтобы ответить клиенту.',
        template: 'Шаблон',
        templates: 'Шаблоны',
        hideTemplates: 'Скрыть шаблоны',
        templatePlaceholder: 'Выберите шаблон',
        messagePlaceholder: 'Сообщение клиенту…',
        clear: 'Очистить',
        send: 'Отправить',
        export: 'Экспорт',
        confirm: 'Подтвердить',
        reschedule: 'Перенос',
        followup: 'Повторный контакт',
        date: 'Дата',
        time: 'Время',
        applyTransfer: 'Подготовить перенос',
        addClientError: 'Нужно заполнить имя и телефон.',
        loadError: 'Не удалось загрузить чаты.',
        sendError: 'Не удалось отправить сообщение.',
        byBot: 'через бот КликБук',
        unread: 'непрочитано',
        openThread: 'Открыть чат',
        closeCreate: 'Скрыть форму',
      }
    : {
        badge: demoMode ? 'Demo inbox' : 'Inbox',
        title: 'Chats',
        description: demoMode
          ? 'Inbox, templates, and replies.'
          : 'Inbox, templates, and replies.',
        search: 'Search by name, phone, or message',
        allThreads: 'All',
        newThreads: 'New',
        activeThreads: 'Active',
        followupThreads: 'Follow-up',
        allChannels: 'Channels',
        recentSort: 'Newest',
        prioritySort: 'Priority',
        unreadSort: 'Unread',
        total: 'Total',
        selected: 'Opened',
        demo: 'Demo mode',
        live: 'Live data',
        createThread: 'New chat',
        createInline: 'New client',
        clientName: 'Client name',
        clientPhone: 'Phone',
        cancel: 'Cancel',
        create: 'Create',
        botConnected: 'Bot connected',
        botOff: 'Bot off',
        priorityOn: 'Priority',
        priorityOff: 'Standard',
        source: 'Source',
        nextVisit: 'Next visit',
        notScheduled: 'Not scheduled',
        emptyList: 'No chats match this filter yet.',
        emptyListHint: 'Try another filter or add a new chat.',
        emptyThread: 'Choose a chat',
        emptyThreadHint: 'Open a thread to reply.',
        template: 'Template',
        templates: 'Templates',
        hideTemplates: 'Hide templates',
        templatePlaceholder: 'Choose template',
        messagePlaceholder: 'Message to the client…',
        clear: 'Clear',
        send: 'Send',
        export: 'Export',
        confirm: 'Confirm',
        reschedule: 'Reschedule',
        followup: 'Follow-up',
        date: 'Date',
        time: 'Time',
        applyTransfer: 'Prepare reschedule',
        addClientError: 'Client name and phone are required.',
        loadError: 'Could not load chats.',
        sendError: 'Could not send the message.',
        byBot: 'via КликБук bot',
        unread: 'unread',
        openThread: 'Open chat',
        closeCreate: 'Hide form',
      };

  const templateOptions = useMemo(() => dataset?.templates ?? [], [dataset?.templates]);
  const [threads, setThreads] = useState<ChatThreadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('custom');
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [composerFlow, setComposerFlow] = useState<BotFlow | null>(null);
  const [transferDate, setTransferDate] = useState('');
  const [transferTime, setTransferTime] = useState('12:30');
  const [isSending, setIsSending] = useState(false);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const activeThread = useMemo(() => {
    return threads.find((item) => item.id === activeThreadId) ?? null;
  }, [activeThreadId, threads]);

  useEffect(() => {
    if (!hasHydrated) return;

    let ignore = false;

    const loadThreads = async () => {
      if (demoMode) {
        const fallback = getDashboardDemoChatThreads(locale);

        try {
          const raw = window.localStorage.getItem(demoStorageKey);
          const next = raw ? (JSON.parse(raw) as ChatThreadRecord[]) : fallback;
          if (!ignore) {
            setThreads(sortThreads(next, 'recent'));
            setActiveThreadId((current) => current ?? next[0]?.id ?? null);
            setError(null);
            setIsLoading(false);
          }
        } catch {
          if (!ignore) {
            setThreads(sortThreads(fallback, 'recent'));
            setActiveThreadId(fallback[0]?.id ?? null);
            setError(null);
            setIsLoading(false);
          }
        }

        return;
      }

      if (!ownedProfile) {
        if (!ignore) {
          setThreads([]);
          setActiveThreadId(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chats', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('chat_fetch_failed');
        }

        const payload = (await response.json()) as ChatThreadListResponse;
        const nextThreads = sortThreads(payload.threads ?? [], 'recent');

        if (!ignore) {
          setThreads(nextThreads);
          setActiveThreadId((current) => current ?? nextThreads[0]?.id ?? null);
          setError(null);
        }
      } catch {
        if (!ignore) {
          setError(labels.loadError);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadThreads();

    return () => {
      ignore = true;
    };
  }, [demoMode, demoStorageKey, hasHydrated, labels.loadError, locale, ownedProfile]);

  useEffect(() => {
    if (!demoMode || !hasHydrated) return;

    try {
      window.localStorage.setItem(demoStorageKey, JSON.stringify(threads));
    } catch {}
  }, [demoMode, demoStorageKey, hasHydrated, threads]);

  useEffect(() => {
    if (!threads.length) {
      setActiveThreadId(null);
      return;
    }

    if (!activeThreadId || !threads.some((item) => item.id === activeThreadId)) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, threads]);

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
        ...thread.messages.map((message) => message.body),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });

    return sortThreads(next, sortMode);
  }, [channelFilter, query, segmentFilter, sortMode, threads]);

  const totalUnread = useMemo(() => {
    return threads.reduce((sum, thread) => sum + thread.unreadCount, 0);
  }, [threads]);

  const applyLocalThreadPatch = async (threadId: string, patch: Partial<ChatThreadRecord>) => {
    setThreads((current) =>
      replaceThread(current, threadId, (thread) => ({
        ...thread,
        ...patch,
        updatedAt: new Date().toISOString(),
      })),
    );

    if (demoMode) {
      return;
    }

    await fetch('/api/chats', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        threadId,
        patch,
      }),
    }).catch(() => undefined);
  };

  const handleCreateThread = async () => {
    const clientName = newClientName.trim();
    const clientPhone = newClientPhone.trim();

    if (!clientName || !clientPhone) {
      setError(labels.addClientError);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'thread',
          clientName,
          clientPhone,
          channel: 'Telegram',
        }),
      });

      if (!response.ok) {
        throw new Error('thread_create_failed');
      }

      const payload = (await response.json()) as { thread?: ChatThreadRecord };
      const nextThread = payload.thread ?? localThread;

      setThreads((current) => [nextThread, ...current]);
      setActiveThreadId(nextThread.id);
      setNewClientName('');
      setNewClientPhone('');
      setShowCreatePanel(false);
    } catch {
      setError(labels.addClientError);
    }
  };

  const handleSendMessage = async () => {
    if (!activeThread || !draft.trim()) return;

    const body = draft.trim();
    const viaBot = composerFlow !== null;
    const localMessage = createLocalMessage(activeThread.id, body, viaBot ? 'system' : 'master', viaBot);

    setIsSending(true);
    setError(null);

    setThreads((current) =>
      replaceThread(current, activeThread.id, (thread) => ({
        ...thread,
        segment: viaBot ? (composerFlow === 'followup' ? 'followup' : 'active') : 'active',
        lastMessagePreview: body,
        lastMessageAt: localMessage.createdAt,
        unreadCount: 0,
        messages: [...thread.messages, localMessage],
        updatedAt: localMessage.createdAt,
      })),
    );

    setDraft('');
    setSelectedTemplateId('custom');
    setComposerFlow(null);

    if (demoMode) {
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'message',
          threadId: activeThread.id,
          body,
          author: viaBot ? 'system' : 'master',
          deliveryState: 'sent',
          viaBot,
        }),
      });

      if (!response.ok) {
        throw new Error('send_failed');
      }
    } catch {
      setError(labels.sendError);
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyBotFlow = (flow: BotFlow) => {
    if (!activeThread) return;

    const nextVisit = flow === 'reschedule' && transferDate
      ? `${transferDate}${transferTime ? ` ${transferTime}` : ''}`
      : activeThread.nextVisit ?? undefined;

    setComposerFlow(flow);
    setDraft(buildBotDraft(flow, activeThread, locale, nextVisit));
  };

  const handleApplyTransfer = () => {
    if (!activeThread || !transferDate) return;
    const nextVisit = `${transferDate} ${transferTime}`.trim();

    void applyLocalThreadPatch(activeThread.id, {
      nextVisit: transferDate,
      segment: 'active',
    });

    setComposerFlow('reschedule');
    setDraft(buildBotDraft('reschedule', activeThread, locale, nextVisit));
  };


  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value);

    if (value === 'custom') {
      return;
    }

    const selectedTemplate = templateOptions.find((item) => item.id === value);
    if (!selectedTemplate) return;

    setComposerFlow(null);
    setDraft(fillTemplateContent(selectedTemplate.content, activeThread, locale, publicPageHref));
  };

  const quickTransferPresets = useMemo(
    () => [
      { id: 'today', label: locale === 'ru' ? 'Сегодня' : 'Today', date: addDaysIso(0), time: '12:30' },
      { id: 'tomorrow', label: locale === 'ru' ? 'Завтра' : 'Tomorrow', date: addDaysIso(1), time: '13:00' },
      { id: 'plus-two', label: locale === 'ru' ? 'Через 2 дня' : 'In 2 days', date: addDaysIso(2), time: '15:30' },
    ],
    [locale],
  );

  const assistantSlots = useMemo(() => {
    const nextDate = activeThread?.nextVisit ?? addDaysIso(1);
    const altDate = addDaysIso(2);

    return [
      { id: 'slot-1', date: nextDate, time: '12:30' },
      { id: 'slot-2', date: nextDate, time: '15:00' },
      { id: 'slot-3', date: altDate, time: '18:00' },
    ];
  }, [activeThread?.nextVisit]);

  const channelLabel = (value: ChatThreadRecord['channel']) => {
    if (locale !== 'ru') return value;
    if (value === 'Telegram') return 'Телеграм';
    return value;
  };

  const handleExportThread = () => {
    if (!activeThread || typeof window === 'undefined') return;

    const safeName = activeThread.clientName
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '') || 'thread';

    const lines = [
      `Клиент: ${activeThread.clientName}`,
      `Телефон: ${activeThread.clientPhone}`,
      `Канал: ${channelLabel(activeThread.channel)}`,
      `Источник: ${activeThread.source || '—'}`,
      `Следующий визит: ${activeThread.nextVisit ? formatDateLabel(activeThread.nextVisit, locale) : labels.notScheduled}`,
      '',
      ...activeThread.messages.map((message) => {
        const author = message.author === 'client'
          ? activeThread.clientName
          : locale === 'ru'
            ? 'Мастер'
            : 'Master';

        return `[${formatLongDateLabel(message.createdAt, locale)} ${formatTimeLabel(message.createdAt, locale)}] ${author}: ${message.body}`;
      }),
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `chat-${safeName}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();

    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  };

  const assistantSummary = useMemo(() => {
    if (!activeThread) {
      return locale === 'ru'
        ? {
            title: 'Выберите чат',
            detail: 'Подсказки по ответу и ближайшие окна.',
          }
        : {
            title: 'Choose a chat',
            detail: 'The assistant will suggest the next step, quick replies, and reschedule slots.',
          };
    }

    if (activeThread.unreadCount > 0) {
      return locale === 'ru'
        ? {
            title: 'Нужно ответить клиенту',
            detail: 'Сначала ответьте на вопрос клиента, затем предложите подтверждение или другое время.',
          }
        : {
            title: 'Reply to the client',
            detail: 'It is better to answer the incoming question first, then offer a confirmation or reschedule.',
          };
    }

    if (activeThread.segment === 'new') {
      return locale === 'ru'
        ? {
            title: 'Помогите завершить запись',
            detail: 'Короткий ответ и один понятный следующий шаг помогают быстрее получить подтверждение.',
          }
        : {
            title: 'Guide the chat to confirmation',
            detail: 'A short confirmation with one clear next step works best here.',
          };
    }

    if (activeThread.segment === 'followup') {
      return locale === 'ru'
        ? {
            title: 'Верните клиента в запись',
            detail: 'Покажите два ближайших окна и отправьте напоминание.',
          }
        : {
            title: 'Bring the client back',
            detail: 'Show two nearest slots and keep the post-visit message short.',
          };
    }

    return locale === 'ru'
      ? {
          title: 'Диалог под контролем',
          detail: 'Можно отправить подтверждение, уточнить время или быстро предложить новое окно.',
        }
      : {
          title: 'The chat is under control',
          detail: 'You can confirm, clarify the time, or prepare a reschedule.',
        };
  }, [activeThread, locale]);

  const applyQuickTransfer = (date: string, time: string) => {
    setTransferDate(date);
    setTransferTime(time);
    setComposerFlow('reschedule');

    if (!activeThread) return;

    const nextVisit = `${date} ${time}`.trim();
    setDraft(buildBotDraft('reschedule', activeThread, locale, nextVisit));
  };

  const handleAssistantScenario = (kind: 'confirm' | 'clarify' | 'slots') => {
    if (!activeThread) return;

    if (kind === 'confirm') {
      handleApplyBotFlow('confirm');
      return;
    }

    if (kind === 'clarify') {
      setComposerFlow(null);
      setDraft(
        locale === 'ru'
          ? `Здравствуйте, ${activeThread.clientName}! Подскажите, пожалуйста, какое время вам сейчас удобнее: первая половина дня или ближе к вечеру?`
          : `Hi ${activeThread.clientName}! Please let me know which time works better for you right now: earlier in the day or closer to the evening?`,
      );
      return;
    }

    setComposerFlow('followup');
    setDraft(
      locale === 'ru'
        ? `Здравствуйте, ${activeThread.clientName}! Могу предложить ближайшие окна: ${assistantSlots
            .slice(0, 2)
            .map((slot) => `${formatPickerDateLabel(slot.date, locale)}, ${slot.time}`)
            .join(' или ')}. Какой вариант вам удобнее?`
        : `Hi ${activeThread.clientName}! I can offer the nearest slots: ${assistantSlots
            .slice(0, 2)
            .map((slot) => `${formatPickerDateLabel(slot.date, locale)}, ${slot.time}`)
            .join(' or ')}. Which option works better for you?`,
    );
  };

  const handleSelectThread = (thread: ChatThreadRecord) => {
    setActiveThreadId(thread.id);
    if (thread.unreadCount > 0) {
      void applyLocalThreadPatch(thread.id, { unreadCount: 0 });
    }

    if (isMobile) {
      setMobileThreadOpen(true);
    }
  };

  useEffect(() => {
    if (!isMobile) {
      setMobileThreadOpen(false);
      return;
    }

    if (!mobileThreadOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile, mobileThreadOpen]);

  const segmentOptions = [
    { value: 'all', label: labels.allThreads },
    { value: 'new', label: labels.newThreads },
    { value: 'active', label: labels.activeThreads },
    { value: 'followup', label: labels.followupThreads },
  ] as const;

  const channelOptions = [
    { value: 'all', label: labels.allChannels },
    { value: 'Telegram', label: locale === 'ru' ? 'Телеграм' : 'Telegram' },
    { value: 'MAX', label: 'MAX' },
  ] as const;

  const sortOptions = [
    { value: 'recent', label: labels.recentSort },
    { value: 'priority', label: labels.prioritySort },
    { value: 'unread', label: labels.unreadSort },
  ] as const;

  if (!hasHydrated) {
    return null;
  }

  const renderThreadList = (mobile = false) => {
    if (isLoading) {
      return (
        <div className={cn('space-y-2', mobile && 'space-y-1.5')}>
          {Array.from({ length: mobile ? 5 : 6 }).map((_, index) => (
            <div
              key={index}
              className={cn('workspace-soft-panel animate-pulse rounded-[16px]', mobile ? 'h-[64px]' : 'h-[72px]')}
            />
          ))}
        </div>
      );
    }

    if (filteredThreads.length === 0) {
      return (
        <div className={cn(
          'flex flex-col items-start justify-center rounded-[16px] border border-dashed border-border/90 px-3 py-4',
          mobile ? 'min-h-[116px]' : 'min-h-[132px]',
        )}>
          <div className="text-[12px] font-semibold text-foreground">{labels.emptyList}</div>
          <div className="mt-1 text-[10.5px] leading-5 text-muted-foreground">{labels.emptyListHint}</div>
        </div>
      );
    }

    return (
      <div className={cn('space-y-2', mobile && 'space-y-1.5')}>
        {filteredThreads.map((thread) => {
          const active = thread.id === activeThreadId;

          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => handleSelectThread(thread)}
              className={cn(
                'group w-full rounded-[18px] border text-left transition-[border-color,background-color,transform] duration-200',
                mobile ? 'px-3 py-2.5' : 'px-3 py-3',
                active
                  ? 'border-primary/18 bg-primary/[0.08]'
                  : 'border-border/90 bg-card/68 hover:border-border hover:bg-accent/24',
              )}
              aria-label={labels.openThread}
            >
              <div className="flex items-start gap-2.5">
                <div className="relative flex size-9 shrink-0 items-center justify-center rounded-[12px] border border-border bg-background text-[10.5px] font-semibold text-foreground">
                  {getInitials(thread.clientName)}
                  {thread.unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-[17px] items-center justify-center rounded-full bg-primary px-1 py-[1px] text-[8px] text-primary-foreground">
                      {thread.unreadCount}
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="truncate text-[12px] font-semibold text-foreground">{thread.clientName}</div>
                        {thread.isPriority ? <Star className="size-3 shrink-0 fill-primary text-primary" /> : null}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span>{channelLabel(thread.channel)}</span>
                        <span>•</span>
                        <span>{formatDateLabel(thread.lastMessageAt, locale)}</span>
                        <span>•</span>
                        <span>{formatTimeLabel(thread.lastMessageAt, locale)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="h-5 rounded-full px-1.5 text-[9px]">
                      {segmentBadgeLabel(thread.segment, locale)}
                    </Badge>
                  </div>

                  <div className="mt-1.5 line-clamp-2 text-[10.5px] leading-[1.05rem] text-muted-foreground">
                    {thread.lastMessagePreview || '—'}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9.5px] text-muted-foreground">
                    {thread.botConnected ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/70 px-2 py-1">
                        <Bot className="size-3" />
                        КликБук бот
                      </span>
                    ) : null}
                    {thread.nextVisit ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/70 px-2 py-1">
                        <CalendarClock className="size-3" />
                        {formatDateLabel(thread.nextVisit, locale)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderMessageFeed = (mobile = false) => {
    if (!activeThread || activeThread.messages.length === 0) {
      return (
        <div className={cn(
          'flex h-full flex-col items-center justify-center rounded-[20px] border border-dashed border-border/90 px-5 text-center',
          mobile ? 'min-h-[200px]' : 'min-h-[240px]',
        )}>
          <div className="text-[14px] font-semibold text-foreground">{labels.emptyThread}</div>
          <div className="mt-2 max-w-[420px] text-[11px] leading-5 text-muted-foreground">
            {labels.emptyThreadHint}
          </div>
        </div>
      );
    }

    return (
      <div className={cn('mx-auto flex w-full flex-col gap-2.5', mobile ? 'max-w-full' : 'max-w-[820px]')}>
        {activeThread.messages.map((message, index) => {
          const mine = message.author === 'master' || message.author === 'system';
          const status = deliveryLabel(message.deliveryState, locale);
          const currentDay = message.createdAt.slice(0, 10);
          const previousDay = activeThread.messages[index - 1]?.createdAt.slice(0, 10);
          const showDayDivider = currentDay !== previousDay;

          return (
            <div key={message.id} className="space-y-1.5">
              {showDayDivider ? (
                <div className="flex items-center gap-2.5 py-1.5">
                  <div className="h-px flex-1 bg-border" />
                  <div className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {formatLongDateLabel(message.createdAt, locale)}
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>
              ) : null}

              <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'rounded-[18px] border shadow-sm',
                    mobile ? 'max-w-[88%] px-3 py-2.5' : 'max-w-[76%] px-4 py-3',
                    mine
                      ? 'border-primary/18 bg-primary/[0.08] text-foreground'
                      : 'border-border bg-card text-foreground',
                  )}
                >
                  <div className={cn('whitespace-pre-wrap text-foreground', mobile ? 'text-[11.5px] leading-[1.1rem]' : 'text-[13px] leading-5.5')}>
                    {message.body}
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-2 text-[9.5px] text-muted-foreground">
                    {message.viaBot ? (
                      <span className="inline-flex items-center gap-1">
                        <Bot className="size-3" />
                        {labels.byBot}
                      </span>
                    ) : null}
                    {status ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCheck className="size-3" />
                        {status}
                      </span>
                    ) : null}
                    <span>{formatTimeLabel(message.createdAt, locale)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRescheduleBlock = (mobile = false) => {
    if (composerFlow !== 'reschedule') return null;

    return (
      <div className={cn('workspace-soft-panel rounded-[18px] border border-border/80 bg-background/40', mobile ? 'space-y-2.5 p-3' : 'space-y-3 p-3.5')}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {locale === 'ru' ? 'Новый слот' : 'New slot'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickTransferPresets.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant={transferDate === preset.date ? 'default' : 'outline'}
              size="sm"
              className={cn(mobile ? 'h-8 rounded-full px-3 text-[10.5px]' : 'h-9 rounded-full px-4')}
              onClick={() => applyQuickTransfer(preset.date, preset.time)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className={cn('grid gap-2', mobile ? 'grid-cols-1' : 'md:grid-cols-[minmax(0,1fr)_168px_auto]')}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  'justify-between border-border bg-background/70 shadow-none',
                  mobile ? 'h-10 rounded-[14px] px-3 text-[11px]' : 'h-11 rounded-[16px] px-4',
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {transferDate ? formatPickerDateLabel(transferDate, locale) : labels.date}
                </span>
                <span className="text-[10px] text-muted-foreground">{locale === 'ru' ? 'выбрать' : 'pick'}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto rounded-[18px] border-border/90 p-0" align="start">
              <Calendar
                mode="single"
                selected={transferDate ? new Date(`${transferDate}T00:00:00`) : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  const nextDate = toLocalIsoDate(date);
                  setTransferDate(nextDate);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select value={transferTime} onValueChange={setTransferTime}>
            <SelectTrigger className={cn(
              'w-full border-border bg-background/70 shadow-none',
              mobile ? 'h-10 rounded-[14px] px-3 text-[11px]' : 'h-11 rounded-[16px] px-4 text-[12.5px]',
            )}>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-4" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              {TIME_OPTIONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={handleApplyTransfer}
            disabled={!activeThread || !transferDate}
            className={cn(mobile ? 'h-10 rounded-[14px] px-3 text-[11px]' : 'h-11 rounded-[16px] px-4')}
          >
            <CalendarClock className="size-4" />
            {labels.applyTransfer}
          </Button>
        </div>
      </div>
    );
  };

  const renderComposer = (mobile = false) => (
    <footer className={cn('border-t border-border bg-card/92', mobile ? 'px-3 py-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+0.65rem)]' : 'px-4 py-3')}>
      <div className={cn('space-y-2.5', !mobile && 'space-y-3')}>
        <div className={cn(mobile ? 'grid grid-cols-3 gap-1.5' : 'flex flex-wrap items-center gap-2')}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(mobile && 'h-11 justify-center rounded-[14px] px-2.5 text-center text-[10px] leading-[1.05rem] whitespace-normal')}
            disabled={!activeThread}
            onClick={() => handleApplyBotFlow('confirm')}
          >
            <CheckCheck className="size-4" />
            {labels.confirm}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(mobile && 'h-11 justify-center rounded-[14px] px-2.5 text-center text-[10px] leading-[1.05rem] whitespace-normal')}
            disabled={!activeThread}
            onClick={() => setComposerFlow((current) => current === 'reschedule' ? null : 'reschedule')}
          >
            <ArrowRightLeft className="size-4" />
            {labels.reschedule}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(mobile && 'h-11 justify-center rounded-[14px] px-2.5 text-center text-[10px] leading-[1.05rem] whitespace-normal')}
            disabled={!activeThread}
            onClick={() => handleApplyBotFlow('followup')}
          >
            <Sparkles className="size-4" />
            {labels.followup}
          </Button>
        </div>

        {renderRescheduleBlock(mobile)}

        <div className={cn('grid gap-2.5', mobile ? 'grid-cols-1' : 'xl:grid-cols-[184px_minmax(0,1fr)]')}>
          {mobile ? null : (
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="h-10 rounded-[14px] px-3 pr-4">
                <SelectValue placeholder={labels.templatePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{labels.template}</SelectItem>
                {templateOptions.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="grid gap-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={labels.messagePlaceholder}
              className={cn(
                'workspace-input resize-none rounded-[16px] px-3 py-2.5',
                mobile ? 'min-h-[82px] text-[11.5px]' : 'min-h-[88px] text-[13px]',
              )}
              disabled={!activeThread}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <UserRound className="size-3.5" />
                <span>{activeThread ? activeThread.clientName : '—'}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button type="button" variant="ghost" onClick={() => setDraft('')} disabled={!draft}>
                  {labels.clear}
                </Button>
                <Button type="button" onClick={handleSendMessage} disabled={!activeThread || !draft.trim() || isSending}>
                  <SendHorizonal className="size-4" />
                  {labels.send}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="text-[11px] text-destructive">{error}</div> : null}
      </div>
    </footer>
  );

  if (isMobile) {
    return (
      <WorkspaceShell className="overflow-hidden">
        <div className="workspace-page workspace-page-chat workspace-page-chat-mobile flex min-h-[calc(100svh-94px)] w-full min-w-0 flex-col gap-2 overflow-hidden">
          <section className="workspace-card chat-mobile-summary shrink-0 rounded-[16px] px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="h-5 rounded-full px-2 text-[8.5px]">
                    <Sparkles className="size-3" />
                    {labels.badge}
                  </Badge>
                  <Badge variant="outline" className="h-5 rounded-full px-2 text-[8.5px]">
                    {demoMode ? labels.demo : labels.live}
                  </Badge>
                </div>
                <h1 className="mt-1 text-[15px] font-semibold tracking-[-0.03em] text-foreground">{labels.title}</h1>
                <p className="mt-0.5 line-clamp-1 text-[9.5px] leading-[1rem] text-muted-foreground">{labels.description}</p>
              </div>

              <Button
                type="button"
                variant={showCreatePanel ? 'default' : 'outline'}
                size="sm"
                className="h-8 shrink-0 rounded-full px-3"
                onClick={() => setShowCreatePanel((current) => !current)}
              >
                <Plus className="size-3.5" />
                {labels.create}
              </Button>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[
                { label: labels.total, value: threads.length },
                { label: labels.selected, value: activeThread ? 1 : 0 },
                { label: labels.unread, value: totalUnread },
              ].map((item) => (
                <div key={item.label} className="rounded-[12px] border border-border/80 bg-accent/16 px-2.5 py-1.5">
                  <div className="truncate text-[8.5px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</div>
                  <div className="mt-1 text-[14px] font-semibold text-foreground">{item.value}</div>
                </div>
              ))}
            </div>

            {error ? (
              <div className="mt-2 rounded-[12px] border border-destructive/20 bg-destructive/8 px-2.5 py-2 text-[10px] text-destructive">
                {error}
              </div>
            ) : null}
          </section>

          <section className="workspace-card min-h-0 flex-1 overflow-hidden rounded-[16px] p-0">
            <div className="chat-mobile-list-toolbar border-b border-border bg-card px-2.5 py-2">
              <div className="flex items-center gap-2">
                <label className="workspace-input flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[12px] px-3">
                  <Search className="size-3.5 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={labels.search}
                    className="h-full w-full bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-[12px] px-3"
                  onClick={() => setShowCreatePanel((current) => !current)}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>

              {showCreatePanel ? (
                <div className="workspace-soft-panel mt-2 grid gap-2 rounded-[12px] p-2.5">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {labels.createInline}
                  </div>
                  <Input
                    value={newClientName}
                    onChange={(event) => setNewClientName(event.target.value)}
                    placeholder={labels.clientName}
                    className="workspace-input h-9 rounded-[12px]"
                  />
                  <Input
                    value={newClientPhone}
                    onChange={(event) => setNewClientPhone(event.target.value)}
                    placeholder={labels.clientPhone}
                    className="workspace-input h-9 rounded-[12px]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="ghost" size="sm" className="h-8 rounded-[12px]" onClick={() => setShowCreatePanel(false)}>
                      {labels.cancel}
                    </Button>
                    <Button type="button" size="sm" className="h-8 rounded-[12px]" onClick={handleCreateThread}>
                      <Plus className="size-3.5" />
                      {labels.create}
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Select value={segmentFilter} onValueChange={(value) => setSegmentFilter(value as SegmentFilter)}>
                  <SelectTrigger className="h-8 rounded-[12px] px-3 text-[10.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {segmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value as ChannelFilter)}>
                  <SelectTrigger className="h-8 rounded-[12px] px-3 text-[10.5px]">
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
                  <SelectTrigger className="col-span-2 h-8 rounded-[12px] px-3 text-[10.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              {renderThreadList(true)}
            </div>
          </section>

          {activeThread && mobileThreadOpen ? (
            <div className="fixed inset-0 z-[70] bg-background">
              <div className="flex h-full flex-col pt-[env(safe-area-inset-top,0px)]">
                <header className="chat-mobile-thread-header border-b border-border bg-card px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="chat-mobile-back-button mt-0.5 size-9 shrink-0 rounded-[14px] border-primary/30 bg-primary/12 text-foreground shadow-none"
                        onClick={() => setMobileThreadOpen(false)}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="truncate text-[12px] font-semibold text-foreground">{activeThread.clientName}</div>
                          <Badge variant="outline" className="h-5 rounded-full px-1.5 text-[8.5px]">
                            {channelLabel(activeThread.channel)}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px] text-muted-foreground">
                          <span className="rounded-full border border-border/80 bg-background/70 px-2 py-0.5">
                            {activeThread.clientPhone}
                          </span>
                          <span className="rounded-full border border-border/80 bg-background/70 px-2 py-0.5">
                            {activeThread.source || '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!activeThread}
                        onClick={() => {
                          void applyLocalThreadPatch(activeThread.id, {
                            botConnected: !activeThread.botConnected,
                          });
                        }}
                      >
                        <Bot className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={!activeThread}
                        onClick={() => {
                          void applyLocalThreadPatch(activeThread.id, {
                            isPriority: !activeThread.isPriority,
                          });
                        }}
                      >
                        <Star className={cn('size-4', activeThread.isPriority && 'fill-primary text-primary')} />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" disabled={!activeThread} onClick={handleExportThread}>
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 rounded-[12px] border border-border/80 bg-accent/16 px-2.5 py-2">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
{locale === 'ru' ? 'Ассистент' : 'Assistant'}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-foreground">{assistantSummary.title}</div>
                    <div className="mt-1 text-[9.5px] leading-[1rem] text-muted-foreground">{assistantSummary.detail}</div>
                  </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto bg-background/16 px-2.5 py-2.5">
                  {renderMessageFeed(true)}
                </div>

                {renderComposer(true)}
              </div>
            </div>
          ) : null}
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell className="overflow-hidden">
      <div className="workspace-page workspace-page-chat flex h-[calc(100svh-126px)] min-h-[calc(100svh-126px)] w-full min-w-0 flex-col gap-3 overflow-hidden !px-2 !pt-2 !pb-2 sm:h-[calc(100svh-132px)] sm:min-h-[calc(100svh-132px)] xl:h-[calc(100svh-28px)] xl:min-h-[calc(100svh-28px)] xl:!px-2.5 xl:!pt-2.5 xl:!pb-2.5">
        <section className="workspace-card flex shrink-0 flex-wrap items-start justify-between gap-3 rounded-[20px] px-4 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-card/78 backdrop-blur">
                <Sparkles className="size-3.5" />
                {labels.badge}
              </Badge>
              <Badge variant="outline" className="bg-card/78 backdrop-blur">
                {demoMode ? labels.demo : labels.live}
              </Badge>
            </div>
            <h1 className="mt-1.5 text-[21px] font-semibold tracking-[-0.03em] text-foreground">{labels.title}</h1>
            <p className="mt-1 max-w-[720px] text-[12px] leading-5 text-muted-foreground">{labels.description}</p>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-2">
            <div className="workspace-soft-panel rounded-[14px] px-3 py-2 text-left">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{labels.total}</div>
              <div className="mt-1 text-[18px] font-semibold text-foreground">{threads.length}</div>
            </div>
            <div className="workspace-soft-panel rounded-[14px] px-3 py-2 text-left">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{labels.selected}</div>
              <div className="mt-1 text-[18px] font-semibold text-foreground">{activeThread ? 1 : 0}</div>
            </div>
            <div className="workspace-soft-panel rounded-[14px] px-3 py-2 text-left">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{labels.unread}</div>
              <div className="mt-1 text-[18px] font-semibold text-foreground">{totalUnread}</div>
            </div>
          </div>
        </section>

        <section className="workspace-card relative min-h-0 flex-1 overflow-hidden rounded-[20px] p-0">
          <div className="grid h-full min-h-0 overflow-hidden rounded-[inherit] lg:grid-cols-[296px_minmax(0,1fr)] xl:grid-cols-[292px_minmax(0,1.08fr)_320px]">
            <aside className="flex min-h-0 flex-col border-b border-border bg-card/84 lg:border-b-0 lg:border-r">
              <div className="relative z-[2] space-y-3 border-b border-border bg-card/94 px-3 py-3 backdrop-blur">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto]">
                  <label className="workspace-input flex h-10 items-center gap-2 rounded-[14px] px-3">
                    <Search className="size-4 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={labels.search}
                      className="h-full w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-[14px] px-3.5"
                    onClick={() => setShowCreatePanel((current) => !current)}
                  >
                    <Plus className="size-4" />
                    {showCreatePanel ? labels.closeCreate : labels.createThread}
                  </Button>
                </div>

                <div className="grid gap-2 grid-cols-2">
                  <Select value={segmentFilter} onValueChange={(value) => setSegmentFilter(value as SegmentFilter)}>
                    <SelectTrigger className="h-10 w-full min-w-0 rounded-[14px] px-3.5 pr-4 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {segmentOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value as ChannelFilter)}>
                    <SelectTrigger className="h-10 w-full min-w-0 rounded-[14px] px-3.5 pr-4 text-[12.5px]">
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
                    <SelectTrigger className="col-span-2 h-10 w-full min-w-0 rounded-[14px] px-3.5 pr-4 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showCreatePanel ? (
                  <div className="workspace-soft-panel grid gap-2 rounded-[16px] p-2.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {labels.createInline}
                    </div>
                    <Input
                      value={newClientName}
                      onChange={(event) => setNewClientName(event.target.value)}
                      placeholder={labels.clientName}
                      className="workspace-input h-10 rounded-[14px]"
                    />
                    <Input
                      value={newClientPhone}
                      onChange={(event) => setNewClientPhone(event.target.value)}
                      placeholder={labels.clientPhone}
                      className="workspace-input h-10 rounded-[14px]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreatePanel(false)}>
                        {labels.cancel}
                      </Button>
                      <Button type="button" size="sm" onClick={handleCreateThread}>
                        <Plus className="size-4" />
                        {labels.create}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2.5 scrollbar-thin">
                {renderThreadList(false)}
              </div>
            </aside>

            <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-card/70">
              <header className="relative z-[1] flex flex-wrap items-start justify-between gap-3 border-b border-border bg-card/94 px-4 py-3 backdrop-blur">
                <div className="min-w-0 flex-1">
                  {activeThread ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-[16px] font-semibold tracking-[-0.02em] text-foreground">
                          {activeThread.clientName}
                        </div>
                        <Badge variant="outline">{channelLabel(activeThread.channel)}</Badge>
                        <Badge variant="outline">{segmentBadgeLabel(activeThread.segment, locale)}</Badge>
                        {activeThread.botConnected ? (
                          <Badge variant="outline">
                            <Bot className="size-3.5" />
                            КликБук бот
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <div className="workspace-soft-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                          <span>{labels.clientPhone}</span>
                          <span className="font-medium text-foreground">{activeThread.clientPhone}</span>
                        </div>
                        <div className="workspace-soft-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                          <span>{labels.source}</span>
                          <span className="max-w-[180px] truncate font-medium text-foreground">{activeThread.source || '—'}</span>
                        </div>
                        <div className="workspace-soft-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                          <span>{labels.nextVisit}</span>
                          <span className="max-w-[210px] truncate font-medium text-foreground">
                            {activeThread.nextVisit ? formatLongDateLabel(activeThread.nextVisit, locale) : labels.notScheduled}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-[14px] font-semibold text-foreground">{labels.emptyThread}</div>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!activeThread}
                    onClick={() => {
                      if (!activeThread) return;
                      void applyLocalThreadPatch(activeThread.id, {
                        botConnected: !activeThread.botConnected,
                      });
                    }}
                  >
                    <Bot className="size-4" />
                    {activeThread?.botConnected ? labels.botConnected : labels.botOff}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!activeThread}
                    onClick={() => {
                      if (!activeThread) return;
                      void applyLocalThreadPatch(activeThread.id, {
                        isPriority: !activeThread.isPriority,
                      });
                    }}
                  >
                    <Star className={cn('size-4', activeThread?.isPriority && 'fill-primary text-primary')} />
                    {activeThread?.isPriority ? labels.priorityOn : labels.priorityOff}
                  </Button>

                  <Button type="button" variant="outline" size="sm" disabled={!activeThread} onClick={handleExportThread}>
                    <Download className="size-4" />
                    {labels.export}
                  </Button>
                </div>
              </header>

              <div className="min-h-0 overflow-y-auto bg-background/16 px-3 py-3 scrollbar-thin">
                {renderMessageFeed(false)}
              </div>

              {renderComposer(false)}
            </div>

            <aside className="hidden min-h-0 flex-col border-l border-border bg-card/84 xl:flex">
              <div className="border-b border-border px-4 py-4">
                <div className="rounded-[22px] border border-border bg-gradient-to-b from-accent/35 to-transparent p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
  {locale === 'ru' ? 'Ассистент' : 'Assistant'}
                      </div>
                      <div className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-foreground">
                        {assistantSummary.title}
                      </div>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-[14px] border border-border bg-background/70 text-foreground">
                      <Sparkles className="size-4.5" />
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-muted-foreground">{assistantSummary.detail}</p>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin">
                <div className="workspace-soft-panel rounded-[18px] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {locale === 'ru' ? 'Следующий шаг' : 'Next step'}
                  </div>
                  <div className="mt-2 text-[14px] font-semibold text-foreground">
                    {activeThread
                      ? locale === 'ru'
                        ? `Подготовить аккуратный ответ для ${activeThread.clientName}`
                        : `Prepare a clean reply for ${activeThread.clientName}`
                      : assistantSummary.title}
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                    {locale === 'ru'
                      ? 'Ассистент не заменяет вас, но быстро собирает понятный следующий шаг, чтобы не тратить время на рутину.'
                      : 'The assistant does not replace you, but it quickly shapes the next step so you waste less time on routine.'}
                  </div>
                </div>

                <div className="workspace-soft-panel rounded-[18px] p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <MessageSquareQuote className="size-3.5" />
                    {locale === 'ru' ? 'Быстрые сценарии' : 'Quick scenarios'}
                  </div>
                  <div className="mt-3 grid gap-2">
                    <Button type="button" variant="outline" className="justify-between rounded-[14px]" disabled={!activeThread} onClick={() => handleAssistantScenario('confirm')}>
                      {locale === 'ru' ? 'Подтвердить запись' : 'Confirm booking'}
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" className="justify-between rounded-[14px]" disabled={!activeThread} onClick={() => handleAssistantScenario('clarify')}>
                      {locale === 'ru' ? 'Уточнить удобное время' : 'Clarify the best time'}
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button type="button" variant="outline" className="justify-between rounded-[14px]" disabled={!activeThread} onClick={() => handleAssistantScenario('slots')}>
                      {locale === 'ru' ? 'Предложить 2 ближайших окна' : 'Offer 2 nearest slots'}
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="workspace-soft-panel rounded-[18px] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {locale === 'ru' ? 'Быстрый перенос' : 'Quick reschedule'}
                  </div>
                  <div className="mt-3 grid gap-2">
                    {assistantSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => applyQuickTransfer(slot.date, slot.time)}
                        className="flex items-center justify-between rounded-[14px] border border-border bg-card/68 px-3 py-3 text-left transition-colors hover:border-primary/20 hover:bg-accent/24"
                        disabled={!activeThread}
                      >
                        <div>
                          <div className="text-[12.5px] font-semibold text-foreground">
                            {formatPickerDateLabel(slot.date, locale)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{slot.time}</div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="workspace-soft-panel rounded-[18px] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {locale === 'ru' ? 'Карточка клиента' : 'Client card'}
                  </div>
                  <div className="mt-3 space-y-3 text-[12px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">{labels.clientPhone}</span>
                      <span className="font-medium text-foreground">{activeThread?.clientPhone ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">{labels.source}</span>
                      <span className="max-w-[170px] truncate font-medium text-foreground">{activeThread?.source ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">{labels.nextVisit}</span>
                      <span className="max-w-[170px] truncate font-medium text-foreground">
                        {activeThread?.nextVisit ? formatLongDateLabel(activeThread.nextVisit, locale) : labels.notScheduled}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">{labels.unread}</span>
                      <span className="font-medium text-foreground">{activeThread?.unreadCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
