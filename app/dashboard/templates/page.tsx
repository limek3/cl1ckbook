'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  Filter,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useWorkspaceSection } from '@/hooks/use-workspace-section';
import { type MessageTemplateInsight } from '@/lib/master-workspace';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpHint } from '@/components/ui/help-hint';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CHANNEL_OPTIONS = ['Telegram', 'MAX', 'Instagram DM', 'Push'] as const;
type ChannelFilter = 'all' | (typeof CHANNEL_OPTIONS)[number];


function channelDisplayLabel(channel: (typeof CHANNEL_OPTIONS)[number] | string, locale: 'ru' | 'en') {
  if (locale !== 'ru') return channel;
  if (channel === 'Telegram') return 'Телеграм';
  if (channel === 'Instagram DM') return 'Сообщения Инстаграм';
  if (channel === 'Push') return 'Пуш';
  return channel;
}


function parseVariables(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createTemplate(locale: 'ru' | 'en'): MessageTemplateInsight {
  return {
    id: `template-${crypto.randomUUID()}`,
    title: locale === 'ru' ? 'Новый шаблон' : 'New template',
    channel: 'Telegram',
    conversion: '0%',
    variables: locale === 'ru' ? ['{имя}', '{дата}', '{время}', '{ссылка}'] : ['{name}', '{date}', '{time}', '{link}'],
    content: locale === 'ru'
      ? 'Здравствуйте, {имя}! Подтверждаю вашу запись на {дата} в {время}. Вот ссылка: {ссылка}'
      : 'Hello, {name}! Confirming your booking for {date} at {time}. Here is the link: {link}',
  };
}

function normalizeConversion(value: string) {
  const numeric = value.replace(/[^\d]/g, '').slice(0, 3);
  if (!numeric) return '0%';
  return `${Math.min(Number(numeric), 100)}%`;
}

function buildPreview(template: Pick<MessageTemplateInsight, 'content'>, locale: 'ru' | 'en') {
  const sampleMap = locale === 'ru'
    ? {
        '{имя}': 'Анна',
        '{дата}': '15 ноября',
        '{время}': '14:30',
        '{ссылка}': 'klikbuk.ru/book',
        '{услуга}': 'маникюр',
      }
    : {
        '{name}': 'Anna',
        '{date}': '15 November',
        '{time}': '2:30 PM',
        '{link}': 'klikbuk.ru/book',
        '{service}': 'manicure',
      };

  return Object.entries(sampleMap).reduce((result, [key, value]) => result.replaceAll(key, value), template.content);
}

function TemplateVariableChips({ variables }: { variables: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {variables.map((variable) => (
        <span key={variable} className="workspace-pill">
          {variable}
        </span>
      ))}
    </div>
  );
}

export default function TemplatesPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const [templates, setTemplates, storageReady] = useWorkspaceSection<MessageTemplateInsight[]>('templates', dataset?.templates ?? []);
  const [draft, setDraft] = useState<MessageTemplateInsight>(() => createTemplate(locale));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');

  useEffect(() => {
    if (!storageReady || !dataset) return;
    if (templates.length === 0) {
      setTemplates(dataset.templates);
    }
  }, [dataset, setTemplates, storageReady, templates.length]);

  if (!hasHydrated) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <div className="workspace-page">
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

  const labels = locale === 'ru'
    ? {
        title: 'Шаблоны сообщений',
        description: 'Библиотека подтверждений, напоминаний и сообщений после визита с быстрым редактированием и удобным предпросмотром.',
        baseTitle: 'Библиотека шаблонов',
        baseDescription: 'Меньше шума, больше контроля: текст, переменные и предпросмотр в одной карточке.',
        createTitle: 'Новый шаблон',
        createDescription: 'Создайте готовый текст для подтверждений, напоминаний и сообщений после визита.',
        add: 'Сохранить шаблон',
        remove: 'Удалить',
        copy: 'Копировать',
        copied: 'Скопировано',
        titleField: 'Название',
        channelField: 'Канал',
        variablesField: 'Переменные',
        contentField: 'Текст сообщения',
        previewField: 'Предпросмотр',
        conversionField: 'Конверсия',
        placeholdersHint: 'Переменные можно писать через запятую или с новой строки.',
        searchPlaceholder: 'Поиск по названию, каналу или тексту',
        allChannels: 'Все каналы',
        empty: 'По текущим фильтрам шаблоны не найдены.',
        livePreview: 'Предпросмотр',
        livePreviewDescription: 'Так сообщение будет выглядеть после подстановки переменных.',
        quickHint: 'Совет',
        quickHintText: 'Держите один короткий CTA в начале и ссылку ближе к концу — так сообщение читается быстрее.',
        activeTemplates: 'Шаблоны',
        averageConversion: 'Средняя конверсия',
        variables: 'Переменные',
        channels: 'Активные каналы',
        addHint: 'Новый шаблон появится наверху списка.',
        counter: 'Совпадений',
      }
    : {
        title: 'Message templates',
        description: 'A cleaner library for confirmations, reminders, and follow-ups with faster editing.',
        baseTitle: 'Template library',
        baseDescription: 'Less clutter, more control: content, variables, and preview in one card.',
        createTitle: locale === 'ru' ? 'Новый шаблон' : 'New template',
        createDescription: 'A compact builder that adds the template straight into the shared library.',
        add: 'Save template',
        remove: 'Delete',
        copy: 'Copy',
        copied: 'Copied',
        titleField: 'Title',
        channelField: 'Channel',
        variablesField: 'Variables',
        contentField: 'Message',
        previewField: 'Preview',
        conversionField: 'Conversion',
        placeholdersHint: 'Variables can be entered comma-separated or on new lines.',
        searchPlaceholder: 'Search by title, channel, or content',
        allChannels: 'All channels',
        empty: 'No templates match the current filters.',
        livePreview: locale === 'ru' ? 'Предпросмотр' : 'Live preview',
        livePreviewDescription: 'How the message will look once variables are replaced.',
        quickHint: 'Tip',
        quickHintText: 'Keep one short CTA near the top and place the link closer to the end for better readability.',
        activeTemplates: 'Templates',
        averageConversion: 'Average conversion',
        variables: 'Variables',
        channels: 'Active channels',
        addHint: 'The new template appears at the top of the list.',
        counter: 'Matches',
      };

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesChannel = channelFilter === 'all' || template.channel === channelFilter;
      if (!matchesChannel) return false;

      if (!normalizedQuery) return true;

      return [template.title, template.channel, template.content, template.variables.join(' ')]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [channelFilter, query, templates]);

  const averageConversion = useMemo(() => {
    const values = templates
      .map((template) => Number(template.conversion.replace('%', '').trim()))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) return '0%';
    return `${Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)}%`;
  }, [templates]);

  const copyTemplate = async (template: MessageTemplateInsight) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedId(template.id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {}
  };

  const updateTemplate = (id: string, patch: Partial<MessageTemplateInsight>) => {
    setTemplates((current) => current.map((template) => (template.id === id ? { ...template, ...patch } : template)));
  };

  const saveDraft = () => {
    setTemplates((current) => [{ ...draft, id: `template-${crypto.randomUUID()}`, conversion: normalizeConversion(draft.conversion) }, ...current]);
    setDraft(createTemplate(locale));
    setQuery('');
    setChannelFilter('all');
  };

  const variablesCount = new Set(templates.flatMap((item) => item.variables)).size;
  const channelsCount = new Set(templates.map((item) => item.channel)).size;

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Настройки / шаблоны' : 'Settings / templates'}
          title={labels.title}
          description={labels.description}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={labels.activeTemplates} value={String(templates.length)} icon={MessageSquareText} />
          <MetricCard label={labels.averageConversion} value={averageConversion} icon={Copy} />
          <MetricCard label={labels.variables} value={String(variablesCount)} icon={Sparkles} />
          <MetricCard label={labels.channels} value={String(channelsCount)} icon={Filter} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
          <SectionCard
            title={labels.baseTitle}
            description={labels.baseDescription}
            actions={<HelpHint content={labels.placeholdersHint} />}
          >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-[420px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value as ChannelFilter)}>
                  <SelectTrigger className="w-[190px]">
                    <Filter className="size-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{labels.allChannels}</SelectItem>
                    {CHANNEL_OPTIONS.map((channel) => (
                      <SelectItem key={channel} value={channel}>
                        {channelDisplayLabel(channel, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="workspace-pill">
                  {labels.counter}: {filteredTemplates.length}
                </span>
              </div>
            </div>

            <div className="grid gap-4 2xl:grid-cols-2">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="workspace-card rounded-[20px] p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Input
                          value={template.title}
                          onChange={(event) => updateTemplate(template.id, { title: event.target.value })}
                          className="h-10 border-border/70 bg-background/70 text-[15px] font-semibold shadow-none"
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Select value={template.channel} onValueChange={(value) => updateTemplate(template.id, { channel: value })}>
                            <SelectTrigger className="h-9 w-[170px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHANNEL_OPTIONS.map((channel) => (
                                <SelectItem key={channel} value={channel}>
                                  {channelDisplayLabel(channel, locale)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="relative w-[96px]">
                            <Input
                              value={template.conversion}
                              onChange={(event) => updateTemplate(template.id, { conversion: normalizeConversion(event.target.value) })}
                              className="h-9 pr-3 text-center text-[12px] font-medium"
                              aria-label={labels.conversionField}
                            />
                          </div>

                          <Badge variant="outline">{template.variables.length} {locale === 'ru' ? 'перем.' : 'vars'}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="rounded-[18px] border border-border bg-accent/25 p-4">
                        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {labels.contentField}
                        </div>
                        <Textarea
                          value={template.content}
                          onChange={(event) => updateTemplate(template.id, { content: event.target.value })}
                          className="min-h-[172px] border-none bg-transparent px-0 py-0 text-[13px] leading-6 shadow-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-[18px] border border-border bg-background/70 p-3.5">
                          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {labels.variablesField}
                          </div>
                          <Textarea
                            value={template.variables.join(', ')}
                            onChange={(event) => updateTemplate(template.id, { variables: parseVariables(event.target.value) })}
                            className="min-h-[94px] bg-card/80"
                          />
                        </div>

                        <div className="rounded-[18px] border border-border bg-background/70 p-3.5">
                          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {labels.previewField}
                          </div>
                          <div className="line-clamp-6 text-[12px] leading-6 text-foreground">
                            {buildPreview(template, locale)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[16px] border border-border bg-background/65 p-3">
                      <TemplateVariableChips variables={template.variables} />
                    </div>

                    <div className="flex flex-wrap justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => copyTemplate(template)}>
                          <Copy className="size-4" />
                          {copiedId === template.id ? labels.copied : labels.copy}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTemplates((current) => current.filter((item) => item.id !== template.id))}
                        >
                          <Trash2 className="size-4" />
                          {labels.remove}
                        </Button>
                      </div>

                      <span className="text-[11px] text-muted-foreground">
                        {channelDisplayLabel(template.channel, locale)} · {template.conversion}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 ? (
                <div className="col-span-full rounded-[18px] border border-dashed border-border bg-accent/20 px-4 py-12 text-center text-[13px] text-muted-foreground">
                  {labels.empty}
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard title={labels.createTitle} description={labels.createDescription} className="h-fit xl:sticky xl:top-4">
            <div className="space-y-4">
              <div className="rounded-[18px] border border-border bg-accent/20 p-4">
                <div className="text-[12px] font-semibold text-foreground">{labels.livePreview}</div>
                <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{labels.livePreviewDescription}</div>
                <div className="mt-3 rounded-[14px] border border-border bg-background/80 p-3 text-[13px] leading-6 text-foreground">
                  {buildPreview(draft, locale)}
                </div>
              </div>

              <Input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder={labels.titleField}
              />

              <Select value={draft.channel} onValueChange={(value) => setDraft((current) => ({ ...current, channel: value }))}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {channelDisplayLabel(channel, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={draft.conversion}
                onChange={(event) => setDraft((current) => ({ ...current, conversion: normalizeConversion(event.target.value) }))}
                placeholder="54%"
              />

              <Textarea
                value={draft.content}
                onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
                placeholder={labels.contentField}
                className="min-h-[148px]"
              />

              <Textarea
                value={draft.variables.join(', ')}
                onChange={(event) => setDraft((current) => ({ ...current, variables: parseVariables(event.target.value) }))}
                placeholder="{имя}, {дата}, {время}"
                className="min-h-[104px]"
              />

              <div className="rounded-[18px] border border-border bg-background/70 p-3.5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {labels.variablesField}
                </div>
                <TemplateVariableChips variables={draft.variables} />
              </div>

              <div className="rounded-[16px] border border-border bg-accent/15 p-3 text-[12px] leading-6 text-muted-foreground">
                <span className="font-medium text-foreground">{labels.quickHint}:</span> {labels.quickHintText}
              </div>

              <Button type="button" className="w-full" onClick={saveDraft}>
                <Plus className="size-4" />
                {labels.add}
              </Button>

              <div className="text-[11px] text-muted-foreground">{labels.addHint}</div>
            </div>
          </SectionCard>
        </div>
      </div>
    </WorkspaceShell>
  );
}
