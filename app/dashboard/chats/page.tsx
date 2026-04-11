'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRightLeft,
  Bot,
  ChevronLeft,
  CalendarClock,
  CheckCheck,
  Download,
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
import type {
  ChatDeliveryState,
  ChatMessageRecord,
  ChatThreadListResponse,
  ChatThreadRecord,
} from '@/lib/chat-types';
import { getDashboardDemoStorageKey, isDashboardDemoEnabled } from '@/lib/dashboard-demo';
import { getDashboardDemoChatThreads } from '@/lib/demo-data';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

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
      followup: 'Повторный контакт',
    }[segment];
  }

  return {
    new: 'New',
    active: 'Active',
    followup: 'Повторный контакт',
  }[segment];
}

export default function DashboardChatsPage() {
  const { hasHydrated, ownedProfile, locale, dataset, demoMode: demoModeFromHook } = useOwnedWorkspaceData();
  const searchParams = useSearchParams();
  const demoMode = demoModeFromHook || isDashboardDemoEnabled(searchParams);
  const demoStorageKey = getDashboardDemoStorageKey('chats');
  const isMobile = useMobile();

  const labels = locale === 'ru'
    ? {
        badge: demoMode ? 'Демо-входящие' : 'Входящие',
        title: 'Чаты',
        description: demoMode
          ? 'Готовые переписки, быстрые действия и статусы в одном окне.'
          : 'Компактный inbox для переписок, переносов и быстрых ответов.',
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
        selected: 'Открыт',
        demo: 'Демо-режим',
        live: 'Рабочие данные',
        createThread: 'Новый чат',
        createInline: 'Добавить клиента',
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
        emptyThreadHint: 'Сообщения, подтверждения и быстрые действия появятся здесь.',
        template: 'Шаблон',
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
        byBot: 'через КликБук бот',
        unread: 'непрочитано',
        openThread: 'Открыть чат',
        closeCreate: 'Скрыть форму',
      }
    : {
        badge: demoMode ? 'Демо-входящие' : 'Входящие',
        title: 'Chats',
        description: demoMode
          ? 'Ready-made chats, quick actions, and statuses in one window.'
          : 'A compact inbox for chats, reschedules, and quick replies.',
        search: 'Search by name, phone, or message',
        allThreads: 'All',
        newThreads: 'New',
        activeThreads: 'Active',
        followupThreads: 'Повторный контакт',
        allChannels: 'Channels',
        recentSort: 'Newest',
        prioritySort: 'Priority',
        unreadSort: 'Unread',
        total: 'Total',
        selected: 'Opened',
        demo: 'Демо-режим',
        live: 'Рабочие данные',
        createThread: 'New chat',
        createInline: 'Add client',
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
        emptyThreadHint: 'Messages, confirmations, and quick actions will appear here.',
        template: 'Template',
        templatePlaceholder: 'Choose template',
        messagePlaceholder: 'Message to the client…',
        clear: 'Clear',
        send: 'Send',
        export: 'Export',
        confirm: 'Confirm',
        reschedule: 'Reschedule',
        followup: 'Повторный контакт',
        date: 'Date',
        time: 'Time',
        applyTransfer: 'Prepare reschedule',
        addClientError: 'Client name and phone are required.',
        loadError: 'Could not load chats.',
        sendError: 'Could not send the message.',
        byBot: 'via КликБук бот',
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
  const [mobilePane, setMobilePane] = useState<'list' | 'thread'>('list');

  const activeThread = useMemo(() => {
    return threads.find((item) => item.id === activeThreadId) ?? null;
  }, [activeThreadId, threads]);


  useEffect(() => {
    if (!isMobile) {
      setMobilePane('thread');
      return;
    }

    setMobilePane(activeThreadId ? 'thread' : 'list');
  }, [activeThreadId, isMobile]);

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
    setDraft(selectedTemplate.content);
  };

  if (!hasHydrated) {
    return null;
  }

  return (
    <WorkspaceShell className="overflow-hidden md:overflow-visible">
      <div className="workspace-page flex min-h-[calc(100svh-64px)] w-full min-w-0 flex-col gap-3 overflow-hidden !px-2 !pt-2 !pb-[calc(72px+env(safe-area-inset-bottom))] md:h-[calc(100svh-22px)] md:min-h-[calc(100svh-22px)] md:!pb-2 xl:h-[calc(100svh-28px)] xl:min-h-[calc(100svh-28px)] xl:!px-2.5 xl:!pt-2.5 xl:!pb-2.5">
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

          <div className={cn("grid w-full shrink-0 grid-cols-3 gap-2 sm:w-auto", isMobile && "mt-1")}>
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
          <div className={cn("grid h-full min-h-0 overflow-hidden rounded-[inherit]", isMobile ? "grid-cols-1" : "lg:grid-cols-[280px_minmax(0,1fr)]")}>
            <aside className={cn("flex min-h-0 flex-col border-b border-border bg-card/84 lg:border-b-0 lg:border-r", isMobile && mobilePane === "thread" && "hidden")}>
              <div className="relative z-[2] space-y-2.5 border-b border-border bg-card/94 px-3 py-3 backdrop-blur">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <div className="relative min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={labels.search}
                      className="workspace-input h-9 pl-9 text-[12.5px]"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreatePanel((value) => !value)}
                    className="h-9 shrink-0 px-3"
                  >
                    <Plus className="size-4" />
                    {showCreatePanel ? labels.closeCreate : labels.createThread}
                  </Button>
                </div>

                <div className={cn("grid gap-2", isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-[92px_148px_minmax(0,1fr)]")}>
                  <Select value={segmentFilter} onValueChange={(value) => setSegmentFilter(value as SegmentFilter)}>
                    <SelectTrigger className="workspace-input h-10 w-full min-w-0 px-3 pr-8 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{labels.allThreads}</SelectItem>
                      <SelectItem value="new">{labels.newThreads}</SelectItem>
                      <SelectItem value="active">{labels.activeThreads}</SelectItem>
                      <SelectItem value="followup">{labels.followupThreads}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value as ChannelFilter)}>
                    <SelectTrigger className="workspace-input h-10 w-full min-w-0 px-3 pr-8 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{labels.allChannels}</SelectItem>
                      <SelectItem value="Telegram">{locale === 'ru' ? 'Телеграм' : 'Telegram'}</SelectItem>
                      <SelectItem value="MAX">MAX</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
                    <SelectTrigger className="workspace-input col-span-2 h-10 w-full min-w-0 px-3 pr-8 text-[13px] sm:col-span-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">{labels.recentSort}</SelectItem>
                      <SelectItem value="priority">{labels.prioritySort}</SelectItem>
                      <SelectItem value="unread">{labels.unreadSort}</SelectItem>
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
                      className="workspace-input h-9"
                    />
                    <Input
                      value={newClientPhone}
                      onChange={(event) => setNewClientPhone(event.target.value)}
                      placeholder={labels.clientPhone}
                      className="workspace-input h-9"
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
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="workspace-soft-panel h-[72px] animate-pulse rounded-[16px]" />
                    ))}
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="flex min-h-[132px] flex-col items-start justify-center rounded-[16px] border border-dashed border-border/90 px-3 py-4">
                    <div className="text-[12.5px] font-semibold text-foreground">{labels.emptyList}</div>
                    <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{labels.emptyListHint}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredThreads.map((thread) => {
                      const active = thread.id === activeThreadId;

                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => {
                            setActiveThreadId(thread.id);
                            if (isMobile) setMobilePane('thread');
                            void applyLocalThreadPatch(thread.id, { unreadCount: 0 });
                          }}
                          className={cn(
                            'group w-full rounded-[16px] border px-3 py-2.5 text-left transition-[border-color,background-color,transform,box-shadow] duration-200',
                            active
                              ? 'border-primary/26 bg-primary/[0.08]'
                              : 'border-border/90 bg-card/68 hover:border-primary/18 hover:bg-accent/24',
                          )}
                          aria-label={labels.openThread}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-[12px] border text-[11px] font-semibold',
                                active
                                  ? 'border-primary/18 bg-background text-primary'
                                  : 'border-border bg-background text-foreground',
                              )}
                            >
                              {getInitials(thread.clientName)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <div className="truncate text-[12.5px] font-semibold text-foreground">{thread.clientName}</div>
                                {thread.isPriority ? (
                                  <Star className="size-3.5 shrink-0 fill-primary text-primary" />
                                ) : null}
                                {thread.unreadCount > 0 ? (
                                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                                    {thread.unreadCount}
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                                <span>{thread.channel}</span>
                                <span>•</span>
                                <span>{formatDateLabel(thread.lastMessageAt, locale)}</span>
                              </div>

                              <div className="mt-1 line-clamp-2 text-[11px] leading-[1.1rem] text-muted-foreground">
                                {thread.lastMessagePreview || '—'}
                              </div>

                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <Badge variant="outline" className="h-[21px] rounded-full px-2 text-[9.5px]">
                                  {segmentBadgeLabel(thread.segment, locale)}
                                </Badge>
                                {thread.botConnected ? (
                                  <Badge variant="outline" className="h-[21px] rounded-full px-2 text-[9.5px]">
                                    <Bot className="size-3" />
                                    КликБук бот
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            <div className={cn("grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-card/70", isMobile && mobilePane === "list" && "hidden")}>
              <header className="relative z-[1] flex flex-wrap items-start justify-between gap-3 border-b border-border bg-card/94 px-3 py-3 backdrop-blur md:px-4">
                <div className="min-w-0 flex-1">
                  {activeThread ? (
                    <>
                      <div className="mb-2 flex items-center gap-2 md:mb-0">
                        {isMobile ? (
                          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setMobilePane('list')}>
                            <ChevronLeft className="size-4" />
                          </Button>
                        ) : null}
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <div className="truncate text-[16px] font-semibold tracking-[-0.02em] text-foreground">
                          {activeThread.clientName}
                        </div>
                        <Badge variant="outline">{activeThread.channel}</Badge>
                        <Badge variant="outline">{segmentBadgeLabel(activeThread.segment, locale)}</Badge>
                        {activeThread.botConnected ? (
                          <Badge variant="outline">
                            <Bot className="size-3.5" />
                            КликБук бот
                          </Badge>
                        ) : null}
                        </div>
                      </div>

                      {isMobile ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <div className="workspace-soft-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                            <span>{labels.clientPhone}</span>
                            <span className="font-medium text-foreground">{activeThread.clientPhone}</span>
                          </div>
                          <div className="workspace-soft-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                            <span>{labels.nextVisit}</span>
                            <span className="max-w-[180px] truncate font-medium text-foreground">
                              {activeThread.nextVisit ? formatLongDateLabel(activeThread.nextVisit, locale) : labels.notScheduled}
                            </span>
                          </div>
                        </div>
                      ) : (
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
                      )}
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

                  <Button type="button" variant="outline" size="sm">
                    <Download className="size-4" />
                    {labels.export}
                  </Button>
                </div>
              </header>

              <div className="min-h-0 overflow-y-auto bg-background/16 px-3 py-3 scrollbar-thin">
                {!activeThread || activeThread.messages.length === 0 ? (
                  <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[20px] border border-dashed border-border/90 px-6 text-center">
                    <div className="text-[15px] font-semibold text-foreground">{labels.emptyThread}</div>
                    <div className="mt-2 max-w-[480px] text-[12px] leading-5 text-muted-foreground">
                      {isMobile ? labels.emptyListHint : labels.emptyThreadHint}
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto flex w-full max-w-[760px] flex-col gap-2.5 md:px-0">
                    {activeThread.messages.map((message) => {
                      const mine = message.author === 'master' || message.author === 'system';
                      const status = deliveryLabel(message.deliveryState, locale);

                      return (
                        <div
                          key={message.id}
                          className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[88%] rounded-[18px] border px-3.5 py-3 shadow-sm md:max-w-[78%] md:px-4',
                              mine
                                ? 'border-primary/18 bg-primary/[0.08] text-foreground'
                                : 'border-border bg-card text-foreground',
                            )}
                          >
                            <div className="whitespace-pre-wrap text-[13px] leading-5.5">{message.body}</div>
                            <div className="mt-2 flex items-center justify-end gap-2 text-[10.5px] text-muted-foreground">
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
                      );
                    })}
                  </div>
                )}
              </div>

              <footer className="border-t border-border bg-card/92 px-3 py-3 md:px-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={!activeThread} onClick={() => handleApplyBotFlow('confirm')}>
                      <CheckCheck className="size-4" />
                      {labels.confirm}
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={!activeThread} onClick={() => setComposerFlow((current) => current === 'reschedule' ? null : 'reschedule')}>
                      <ArrowRightLeft className="size-4" />
                      {labels.reschedule}
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={!activeThread} onClick={() => handleApplyBotFlow('followup')}>
                      <Sparkles className="size-4" />
                      {labels.followup}
                    </Button>
                  </div>

                  {composerFlow === 'reschedule' ? (
                    <div className="workspace-soft-panel grid gap-2 rounded-[16px] p-3 sm:grid-cols-[minmax(0,1fr)_132px_auto]">
                      <Input
                        type="date"
                        value={transferDate}
                        onChange={(event) => setTransferDate(event.target.value)}
                        className="workspace-input h-9"
                        aria-label={labels.date}
                      />
                      <Input
                        type="time"
                        value={transferTime}
                        onChange={(event) => setTransferTime(event.target.value)}
                        className="workspace-input h-9"
                        aria-label={labels.time}
                      />
                      <Button type="button" onClick={handleApplyTransfer} disabled={!activeThread || !transferDate} className="h-9">
                        <CalendarClock className="size-4" />
                        {labels.applyTransfer}
                      </Button>
                    </div>
                  ) : null}

                  <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "xl:grid-cols-[184px_minmax(0,1fr)]")}>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="workspace-input h-9 w-full px-3 pr-8">
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

                    <div className="grid gap-2.5">
                      <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={labels.messagePlaceholder}
                        className="workspace-input min-h-[88px] resize-none px-3 py-2.5 text-[13px]"
                        disabled={!activeThread}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
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

                  {error ? <div className="text-[12px] text-destructive">{error}</div> : null}
                </div>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
