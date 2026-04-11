'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  CalendarRange,
  Clock3,
  GripVertical,
  Lock,
  Plus,
  TimerReset,
  Trash2,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useWorkspaceSection } from '@/hooks/use-workspace-section';
import { type AvailabilityDayInsight } from '@/lib/master-workspace';
import { Button } from '@/components/ui/button';
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
import { useMobile } from '@/hooks/use-mobile';

function arrayMove<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function parseLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createDay(locale: 'ru' | 'en', index: number): AvailabilityDayInsight {
  return {
    id: `custom-day-${crypto.randomUUID()}`,
    label: locale === 'ru' ? `Спецдень ${index + 1}` : `Special day ${index + 1}`,
    status: 'workday',
    slots: ['10:00–13:00', '14:00–18:00'],
    breaks: ['13:00–14:00'],
  };
}

export default function AvailabilityPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const isMobile = useMobile();
  const [days, setDays, storageReady] = useWorkspaceSection<AvailabilityDayInsight[]>('availability', dataset?.availability ?? []);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);


  useEffect(() => {
    if (!days.length) {
      setSelectedDayId(null);
      return;
    }

    if (!selectedDayId || !days.some((day) => day.id === selectedDayId)) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

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

  const workdays = days.filter((day) => day.status === 'workday').length;
  const shortDays = days.filter((day) => day.status === 'short').length;
  const dayOffCount = days.filter((day) => day.status === 'day-off').length;

  const labels = locale === 'ru'
    ? {
        title: 'Расписание и доступность',
        description: 'Рабочие дни, слоты и перерывы.',
        editorTitle: 'Редактор недели',
        editorDescription: 'Редактирование дней и слотов.',
        helperTitle: 'Быстрые заготовки',
        helperDescription: 'Шаблоны рабочего дня.',
        add: 'Добавить день / спецдату',
        workday: 'Рабочий день',
        short: 'Короткий день',
        dayOff: 'Выходной',
        slots: 'Рабочие интервалы',
        breaks: 'Перерывы',
        delete: 'Удалить',
        block1: 'Плотный день · 10:00–19:00',
        block2: 'Сократить до 15:00',
        block3: 'Сделать выходным',
        block4: 'Открыть вечерние слоты',
      }
    : {
        title: 'Schedule and availability',
        description: 'The schedule is editable now: reorder days, change status, slots, and breaks.',
        editorTitle: 'Week editor',
        editorDescription: 'Cards can be dragged, edited fast, and kept up to date.',
        helperTitle: 'Quick presets',
        helperDescription: 'Apply a ready-made day template instantly.',
        add: 'Add day / special date',
        workday: 'Workday',
        short: 'Short day',
        dayOff: 'Day off',
        slots: 'Working intervals',
        breaks: 'Breaks',
        delete: 'Delete',
        block1: 'Dense day · 10:00–19:00',
        block2: 'Shorten until 15:00',
        block3: 'Make it off',
        block4: 'Open evening slots',
      };

  const updateDay = (id: string, patch: Partial<AvailabilityDayInsight>) => {
    setDays((current) => current.map((day) => (day.id === id ? { ...day, ...patch } : day)));
  };

  const moveDay = (id: string, direction: -1 | 1) => {
    setDays((current) => {
      const index = current.findIndex((day) => day.id === id);
      return arrayMove(current, index, index + direction);
    });
  };

  const applyPreset = (id: string, preset: 'dense' | 'short' | 'off' | 'evening') => {
    if (preset === 'dense') {
      updateDay(id, { status: 'workday', slots: ['10:00–13:00', '14:00–19:00'], breaks: ['13:00–14:00'] });
      return;
    }

    if (preset === 'short') {
      updateDay(id, { status: 'short', slots: ['10:00–15:00'], breaks: ['12:30–13:00'] });
      return;
    }

    if (preset === 'off') {
      updateDay(id, { status: 'day-off', slots: [], breaks: [] });
      return;
    }

    updateDay(id, { status: 'workday', slots: ['12:00–15:00', '16:00–21:00'], breaks: ['15:00–16:00'] });
  };

  const selectedIndex = selectedDayId ? days.findIndex((day) => day.id === selectedDayId) : -1;
  const selectedDay = selectedIndex >= 0 ? days[selectedIndex] : null;

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide workspace-page-availability space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Настройки / график' : 'Settings / availability'}
          title={labels.title}
          description={labels.description}
          actions={
            <Button size="sm" onClick={() => {
              const nextDay = createDay(locale, days.length);
              setDays((current) => [...current, nextDay]);
              setSelectedDayId(nextDay.id);
            }}>
              <Plus className="size-4" />
              {labels.add}
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={locale === 'ru' ? 'Рабочие дни' : 'Working days'} value={String(workdays)} icon={CalendarRange} />
          <MetricCard label={locale === 'ru' ? 'Короткие смены' : 'Short shifts'} value={String(shortDays)} icon={Clock3} />
          <MetricCard label={locale === 'ru' ? 'Выходные / off' : 'Off days'} value={String(dayOffCount)} icon={Lock} />
          <MetricCard label={locale === 'ru' ? 'Шаблон недели' : 'Week template'} value={locale === 'ru' ? 'Гибкий' : 'Flexible'} icon={TimerReset} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_286px]">
          <div className={cn("space-y-5", isMobile ? "order-2" : "xl:order-1")}>
            {selectedDay ? (
              <SectionCard
                title={selectedDay.label}
                description={labels.editorDescription}
                className="p-4"
                actions={
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => moveDay(selectedDay.id, -1)} disabled={selectedIndex <= 0}>
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => moveDay(selectedDay.id, 1)} disabled={selectedIndex === days.length - 1}>
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => setDays((current) => current.filter((item) => item.id !== selectedDay.id))} disabled={days.length === 1}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                }
              >
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
                  <Input
                    value={selectedDay.label}
                    onChange={(event) => updateDay(selectedDay.id, { label: event.target.value })}
                    placeholder={locale === 'ru' ? 'Название дня' : 'Day label'}
                    className="h-10"
                  />
                  <Select value={selectedDay.status} onValueChange={(value) => updateDay(selectedDay.id, { status: value as AvailabilityDayInsight['status'] })}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workday">{labels.workday}</SelectItem>
                      <SelectItem value="short">{labels.short}</SelectItem>
                      <SelectItem value="day-off">{labels.dayOff}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3 grid gap-3 xl:grid-cols-2">
                  <div className="rounded-[16px] border border-border/80 bg-accent/24 p-3">
                    <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{labels.slots}</div>
                    <Textarea
                      value={selectedDay.slots.join('\n')}
                      onChange={(event) => updateDay(selectedDay.id, { slots: parseLines(event.target.value) })}
                      className="min-h-24 bg-background/85"
                      placeholder="10:00–13:00&#10;14:00–18:00"
                    />
                  </div>
                  <div className="rounded-[16px] border border-border/80 bg-accent/24 p-3">
                    <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{labels.breaks}</div>
                    <Textarea
                      value={selectedDay.breaks.join('\n')}
                      onChange={(event) => updateDay(selectedDay.id, { breaks: parseLines(event.target.value) })}
                      className="min-h-24 bg-background/85"
                      placeholder="13:00–14:00"
                    />
                  </div>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard title={labels.editorTitle} description={locale === 'ru' ? 'Неделя и интервалы.' : 'The week is displayed as a compact strip with clear intervals.'} className="p-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {days.map((day) => (
                  <div key={day.id} className="rounded-[16px] border border-border/80 bg-card/80 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[14px] font-medium text-foreground">{day.label}</div>
                      <span className="chip-muted">
                        {day.status === 'workday' ? labels.workday : day.status === 'short' ? labels.short : labels.dayOff}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.slots}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {day.slots.length > 0 ? day.slots.map((slot) => (
                            <span key={`${day.id}-${slot}`} className="chip-muted">{slot}</span>
                          )) : <span className="text-[12px] text-muted-foreground">—</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.breaks}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {day.breaks.length > 0 ? day.breaks.map((item) => (
                            <span key={`${day.id}-break-${item}`} className="chip-muted">{item}</span>
                          )) : <span className="text-[12px] text-muted-foreground">—</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard title={labels.helperTitle} description={labels.helperDescription} className={cn("p-4", isMobile ? "order-1" : "xl:sticky xl:top-4 xl:self-start xl:order-2")}>
            <div className="max-h-[calc(100vh-9rem)] space-y-3 overflow-y-auto pr-1">
              <div className="grid gap-2">
                {[
                  { key: 'dense', label: labels.block1 },
                  { key: 'short', label: labels.block2 },
                  { key: 'off', label: labels.block3 },
                  { key: 'evening', label: labels.block4 },
                ].map((preset) => (
                  <Button
                    key={preset.key}
                    type="button"
                    variant="outline"
                    className="h-9 justify-start rounded-[14px] px-3 text-[12px]"
                    onClick={() => selectedDay && applyPreset(selectedDay.id, preset.key as 'dense' | 'short' | 'off' | 'evening')}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {days.map((day, index) => {
                  const active = selectedDay?.id === day.id;
                  const statusLabel = day.status === 'workday'
                    ? labels.workday
                    : day.status === 'short'
                      ? labels.short
                      : labels.dayOff;

                  return (
                    <button
                      key={day.id}
                      type="button"
                      draggable
                      onClick={() => setSelectedDayId(day.id)}
                      onDragStart={() => setDraggedId(day.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (!draggedId || draggedId === day.id) return;
                        setDays((current) => {
                          const from = current.findIndex((item) => item.id === draggedId);
                          const to = current.findIndex((item) => item.id === day.id);
                          return arrayMove(current, from, to);
                        });
                        setDraggedId(null);
                      }}
                      onDragEnd={() => setDraggedId(null)}
                      className={cn(
                        'w-full rounded-[16px] border px-3.5 py-2.5 text-left transition',
                        active ? 'border-primary/24 bg-primary/8 shadow-[var(--shadow-soft)]' : 'border-border/80 bg-card/74 hover:bg-accent/18',
                        draggedId === day.id && 'border-primary/30 bg-primary/5',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium text-foreground">{index + 1}. {day.label}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{statusLabel}</div>
                        </div>
                        <GripVertical className="size-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </WorkspaceShell>
  );
}
