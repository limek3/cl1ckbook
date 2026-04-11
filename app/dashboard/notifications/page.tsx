'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Bell,
  CircleAlert,
  Clock3,
  Mail,
  MessageCircleMore,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useWorkspaceSection } from '@/hooks/use-workspace-section';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NotificationInsight } from '@/lib/master-workspace';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';

type ChannelKey = 'telegram' | 'max' | 'email';
type TimingKey = 'instant' | 'day-before' | 'two-hours' | 'weekly';

type NotificationViewItem = Omit<NotificationInsight, 'channel'> & {
  channel: ChannelKey;
  timing: TimingKey;
  audience: 'master' | 'client';
};

const CHANNEL_ORDER: ChannelKey[] = ['telegram', 'max', 'email'];

export default function NotificationsPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const isMobile = useMobile();

  const initialItems = useMemo<NotificationViewItem[]>(
    () =>
      (dataset?.notifications ?? []).map((item) => ({
        ...item,
        channel: item.channel === 'push' ? 'telegram' : item.channel,
        timing:
          item.id === 'visit-reminder'
            ? 'day-before'
            : item.id === 'weekly-digest'
              ? 'weekly'
              : item.id === 'cancellation'
                ? 'instant'
                : item.id === 'schedule-change'
                  ? 'two-hours'
                  : 'instant',
        audience: item.id === 'visit-reminder' ? 'client' : 'master',
      })),
    [dataset?.notifications],
  );

  const [items, setItems] = useWorkspaceSection<NotificationViewItem[]>('notifications', initialItems);
  const [activeChannel, setActiveChannel] = useState<'all' | ChannelKey>('all');
  const [quietHours, setQuietHours] = useWorkspaceSection<boolean>('quietHours', false);
  const [fallbackEmail, setFallbackEmail] = useWorkspaceSection<boolean>('fallbackEmail', true);
  const [lastTest, setLastTest] = useState<string | null>(null);

  const channelMeta = useMemo<Record<ChannelKey, { title: string; description: string; icon: typeof Send }>>(
    () => ({
      telegram: {
        title: locale === 'ru' ? 'Телеграм' : 'Telegram',
        description:
          locale === 'ru'
            ? 'Новые заявки, переносы и важные ответы мастера.'
            : 'New requests, reschedules, and important master replies.',
        icon: Send,
      },
      max: {
        title: 'MAX',
        description:
          locale === 'ru'
            ? 'Напоминания клиенту и быстрые подтверждения визита.'
            : 'Client reminders and quick visit confirmations.',
        icon: MessageCircleMore,
      },
      email: {
        title: 'Email',
        description:
          locale === 'ru'
            ? 'Недельные сводки, резервный канал и системные события.'
            : 'Weekly digests, fallback delivery, and system events.',
        icon: Mail,
      },
    }),
    [locale],
  );

  const channelLabel = (channel: ChannelKey) => channelMeta[channel].title;

  const timingLabel = (timing: TimingKey) => {
    if (locale === 'ru') {
      if (timing === 'instant') return 'Сразу';
      if (timing === 'day-before') return 'За день';
      if (timing === 'two-hours') return 'За 2 часа';
      return 'Раз в неделю';
    }
    if (timing === 'instant') return 'Instant';
    if (timing === 'day-before') return '1 day before';
    if (timing === 'two-hours') return '2 hours before';
    return 'Weekly';
  };

  const audienceLabel = (audience: NotificationViewItem['audience']) =>
    locale === 'ru' ? (audience === 'client' ? 'Клиенту' : 'Мастеру') : audience === 'client' ? 'Client' : 'Master';

  const filteredItems = items.filter((item) => activeChannel === 'all' || item.channel === activeChannel);

  const channelStats = CHANNEL_ORDER.map((channel) => {
    const total = items.filter((item) => item.channel === channel).length;
    const active = items.filter((item) => item.channel === channel && item.enabled).length;
    return { channel, total, active, enabled: active > 0 };
  });

  const criticalCount = items.filter((item) => item.critical).length;
  const activeCount = items.filter((item) => item.enabled).length;
  const activeChannelCount = channelStats.filter((item) => item.active > 0).length;

  const updateItem = (id: string, patch: Partial<NotificationViewItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const toggleChannel = (channel: ChannelKey, checked: boolean) => {
    setItems((current) =>
      current.map((item) => (item.channel === channel ? { ...item, enabled: checked } : item)),
    );
  };

  const sendTest = (channel: ChannelKey) => {
    const destination =
      channel === 'telegram'
        ? '@master.telegram'
        : channel === 'max'
          ? '@master.max'
          : 'master@klikbuk.app';

    setLastTest(
      locale === 'ru'
        ? `Тестовое уведомление отправлено в ${channelLabel(channel)} → ${destination}.`
        : `Test notification sent to ${channelLabel(channel)} → ${destination}.`,
    );
  };

  if (!hasHydrated) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <div className="workspace-page dashboard-mobile-notifications space-y-4 md:space-y-5">
          <div className="workspace-card rounded-[18px] p-8 text-center">
            <div className="text-[18px] font-semibold text-foreground">
              {locale === 'ru' ? 'Сначала настройте профиль мастера' : 'Create the master profile first'}
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link href="/create-profile">{locale === 'ru' ? 'Создать профиль' : 'Create profile'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <div className="workspace-page dashboard-mobile-notifications space-y-4 md:space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Настройки / уведомления' : 'Settings / notifications'}
          title={locale === 'ru' ? 'Уведомления' : 'Notifications'}
          description={
            isMobile
              ? locale === 'ru'
                ? 'Заявки, напоминания и каналы.'
                : 'New requests, reminders, and channel tests.'
              : locale === 'ru'
                ? 'Настройте, какие события уходят в Телеграм, MAX и email: новые заявки, напоминания, переносы и недельные сводки.'
                : 'Configure which events go to Telegram, MAX, and email: new requests, reminders, reschedules, and weekly digests.'
          }
          actions={
            <>
              <Button variant="outline" className="workspace-button-secondary h-9" onClick={() => sendTest('telegram')}>
                {isMobile ? (locale === 'ru' ? 'Телеграм' : 'Telegram') : locale === 'ru' ? 'Тест в Телеграм' : 'Test Telegram'}
              </Button>
              <Button className="workspace-button-primary h-9" onClick={() => sendTest('max')}>
                {isMobile ? 'MAX' : locale === 'ru' ? 'Тест в MAX' : 'Test MAX'}
              </Button>
            </>
          }
        />

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard label={locale === 'ru' ? 'Всего сценариев' : 'Scenarios'} value={String(items.length)} icon={Bell} />
          <MetricCard label={locale === 'ru' ? 'Активные' : 'Enabled'} value={String(activeCount)} icon={Smartphone} />
          <MetricCard label={locale === 'ru' ? 'Критические' : 'Critical'} value={String(criticalCount)} icon={CircleAlert} />
          <MetricCard label={locale === 'ru' ? 'Каналы' : 'Channels'} value={String(activeChannelCount)} icon={ShieldCheck} />
        </div>

        <SectionCard
          title={locale === 'ru' ? 'Каналы доставки' : 'Delivery channels'}
          description={
            locale === 'ru'
              ? 'Включение каналов и тест отправки.'
              : 'Manage channels globally: enable, disable, and verify delivery with test sends.'
          }
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {channelStats.map(({ channel, total, active, enabled }) => {
              const meta = channelMeta[channel];
              const ChannelIcon = meta.icon;
              return (
                <div
                  key={channel}
                  className={cn(
                    'workspace-card rounded-[18px] border p-4 transition',
                    activeChannel === channel ? 'border-primary/28 bg-accent/30' : 'border-border/80',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      onClick={() => setActiveChannel((current) => (current === channel ? 'all' : channel))}
                    >
                      <div className="flex size-10 items-center justify-center rounded-[14px] border border-border bg-background/85 text-primary">
                        <ChannelIcon className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-foreground">{meta.title}</div>
                        <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{meta.description}</div>
                      </div>
                    </button>
                    <Switch checked={enabled} onCheckedChange={(checked) => toggleChannel(channel, checked)} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-[12px] text-muted-foreground">
                      {locale === 'ru' ? `${active} из ${total} сценариев активны` : `${active} of ${total} flows enabled`}
                    </div>
                    <Button variant="outline" className="h-8 px-3 text-[12px]" onClick={() => sendTest(channel)}>
                      {locale === 'ru' ? 'Проверить' : 'Send test'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title={locale === 'ru' ? 'Сценарии уведомлений' : 'Notification flows'}
          description={
            locale === 'ru'
              ? 'Какие уведомления и когда уходят.'
              : 'Build your workflow: who gets the notification, which channel it uses, and when it is delivered.'
          }
          actions={
            <div className="flex flex-wrap gap-2">
              {(['all', ...CHANNEL_ORDER] as const).map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setActiveChannel(channel)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[12px] font-medium transition',
                    activeChannel === channel
                      ? 'border-primary/28 bg-primary/12 text-foreground'
                      : 'border-border/80 bg-background/78 text-muted-foreground hover:border-primary/18 hover:text-foreground',
                  )}
                >
                  {channel === 'all'
                    ? locale === 'ru'
                      ? 'Все каналы'
                      : 'All channels'
                    : channelLabel(channel)}
                </button>
              ))}
            </div>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'workspace-card rounded-[18px] border p-4 transition',
                    item.enabled ? 'border-border/80' : 'border-border/60 opacity-80',
                  )}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-[15px] font-semibold text-foreground">{item.title}</div>
                        <Badge variant="outline">{channelLabel(item.channel)}</Badge>
                        <Badge variant="outline">{audienceLabel(item.audience)}</Badge>
                        {item.critical ? <Badge variant="outline">{locale === 'ru' ? 'Критично' : 'Critical'}</Badge> : null}
                      </div>
                      <div className="mt-2 max-w-[760px] text-[13px] leading-6 text-muted-foreground">{item.description}</div>
                    </div>
                    <Switch checked={item.enabled} onCheckedChange={(checked) => updateItem(item.id, { enabled: checked })} />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[180px_180px_1fr]">
                    <div>
                      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        {locale === 'ru' ? 'Канал' : 'Channel'}
                      </div>
                      <Select value={item.channel} onValueChange={(value) => updateItem(item.id, { channel: value as ChannelKey })}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANNEL_ORDER.map((channel) => (
                            <SelectItem key={channel} value={channel}>
                              {channelLabel(channel)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        {locale === 'ru' ? 'Когда отправлять' : 'Delivery time'}
                      </div>
                      <Select value={item.timing} onValueChange={(value) => updateItem(item.id, { timing: value as TimingKey })}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">{timingLabel('instant')}</SelectItem>
                          <SelectItem value="day-before">{timingLabel('day-before')}</SelectItem>
                          <SelectItem value="two-hours">{timingLabel('two-hours')}</SelectItem>
                          <SelectItem value="weekly">{timingLabel('weekly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-[16px] border border-border/80 bg-background/70 px-4 py-3">
                      <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
                        <Clock3 className="size-4 text-primary" />
                        {locale === 'ru' ? 'Текущий маршрут' : 'Current route'}
                      </div>
                      <div className="mt-2 text-[12px] leading-6 text-muted-foreground">
                        {locale === 'ru'
                          ? `${channelLabel(item.channel)} · ${timingLabel(item.timing)} · ${audienceLabel(item.audience)}`
                          : `${channelLabel(item.channel)} · ${timingLabel(item.timing)} · ${audienceLabel(item.audience)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 xl:sticky xl:top-24 xl:self-start">
              <div className="workspace-card rounded-[18px] border border-border/80 p-4">
                <div className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                  <Sparkles className="size-4.5 text-primary" />
                  {locale === 'ru' ? 'Правила доставки' : 'Delivery rules'}
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-[14px] border border-border/80 bg-background/78 px-3.5 py-3">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">{locale === 'ru' ? 'Тихие часы' : 'Quiet hours'}</div>
                      <div className="text-[11px] leading-5 text-muted-foreground">
                        {locale === 'ru' ? 'Не беспокоить клиентов после 21:00.' : 'Avoid sending client messages after 9 PM.'}
                      </div>
                    </div>
                    <Switch checked={quietHours} onCheckedChange={setQuietHours} />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-[14px] border border-border/80 bg-background/78 px-3.5 py-3">
                    <div>
                      <div className="text-[13px] font-medium text-foreground">{locale === 'ru' ? 'Резервный email' : 'Fallback email'}</div>
                      <div className="text-[11px] leading-5 text-muted-foreground">
                        {locale === 'ru' ? 'Если мессенджер не ответил, продублировать в email.' : 'Duplicate to email if messenger delivery fails.'}
                      </div>
                    </div>
                    <Switch checked={fallbackEmail} onCheckedChange={setFallbackEmail} />
                  </div>
                </div>
              </div>

              <div className="workspace-card rounded-[18px] border border-border/80 p-4">
                <div className="text-[15px] font-semibold text-foreground">{locale === 'ru' ? 'Проверка доставки' : 'Delivery check'}</div>
                <div className="mt-2 text-[12px] leading-6 text-muted-foreground">
                  {lastTest ||
                    (locale === 'ru'
                      ? 'Отправьте тест в Телеграм, MAX или email и проверьте, что маршрутизация работает как нужно.'
                      : 'Send a test to Telegram, MAX, or email to verify the routing.')}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="h-8 px-3 text-[12px]" onClick={() => sendTest('telegram')}>
                    {locale === 'ru' ? 'Телеграм' : 'Telegram'}
                  </Button>
                  <Button variant="outline" className="h-8 px-3 text-[12px]" onClick={() => sendTest('max')}>
                    MAX
                  </Button>
                  <Button variant="outline" className="h-8 px-3 text-[12px]" onClick={() => sendTest('email')}>
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
