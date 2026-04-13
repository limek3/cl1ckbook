'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  CalendarRange,
  Clock3,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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

const SLOT_PRESETS = [
  { key: 'classic', slots: ['09:00–13:00', '14:00–19:00'] },
  { key: 'late', slots: ['10:00–14:00', '15:00–20:00'] },
  { key: 'compact', slots: ['11:00–17:00'] },
  { key: 'short', slots: ['10:00–15:00'] },
  { key: 'evening', slots: ['12:00–15:00', '16:00–21:00'] },
] as const;

const BREAK_PRESETS = [
  { key: 'lunch', breaks: ['13:00–14:00'] },
  { key: 'late-lunch', breaks: ['14:00–15:00'] },
  { key: 'mini', breaks: ['14:00–14:30'] },
  { key: 'midday', breaks: ['12:00–13:00'] },
  { key: 'none', breaks: [] },
] as const;

function serializeIntervals(items: readonly string[]) {
  return items.join('|');
}

function findPresetKey<T extends { key: string; slots?: readonly string[]; breaks?: readonly string[] }>(
  items: readonly string[],
  presets: readonly T[],
  field: 'slots' | 'breaks',
) {
  return presets.find((preset) => serializeIntervals(preset[field] ?? []) === serializeIntervals(items))?.key ?? null;
}

function formatIntervals(items: readonly string[], locale: 'ru' | 'en', emptyLabel?: string) {
  if (!items.length) return emptyLabel ?? (locale === 'ru' ? 'Нет интервалов' : 'No intervals');
  return items.join(' · ');
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

type AvailabilityEditorLabels = {
  editorTitle: string;
  editorDescription: string;
  workday: string;
  short: string;
  dayOff: string;
  slots: string;
  breaks: string;
  delete: string;
  block1: string;
  block2: string;
  block3: string;
  block4: string;
  add: string;
};

function AvailabilityEditorPanel({
  locale,
  labels,
  day,
  selectedIndex,
  totalDays,
  isMobile,
  onUpdate,
  onMove,
  onApplyPreset,
  onDelete,
}: {
  locale: 'ru' | 'en';
  labels: AvailabilityEditorLabels;
  day: AvailabilityDayInsight;
  selectedIndex: number;
  totalDays: number;
  isMobile: boolean;
  onUpdate: (patch: Partial<AvailabilityDayInsight>) => void;
  onMove: (direction: -1 | 1) => void;
  onApplyPreset: (preset: 'dense' | 'short' | 'off' | 'evening') => void;
  onDelete: () => void;
}) {
  const statusLabel = day.status === 'workday' ? labels.workday : day.status === 'short' ? labels.short : labels.dayOff;

  return (
    <div className={cn('workspace-editor-shell workspace-editor-shell-availability', isMobile && 'workspace-editor-shell-mobile')}>
      {isMobile ? <div className="workspace-editor-sheet-handle" aria-hidden="true" /> : null}

      <div className="workspace-editor-head workspace-editor-head-availability">
        <div className="workspace-editor-kicker">{labels.editorTitle}</div>
        <div className={cn('workspace-editor-head-row', isMobile && 'gap-3')}>
          <div className="min-w-0 flex-1">
            <div className="workspace-editor-headline">{day.label}</div>
            <div className="workspace-editor-subtitle">{labels.editorDescription}</div>
          </div>

          <div className="workspace-editor-visibility">
            <div className="workspace-editor-visibility-label">{locale === 'ru' ? 'Статус дня' : 'Day status'}</div>
            <div className="mt-2">
              <span className="workspace-editor-visibility-value">{statusLabel}</span>
            </div>
          </div>
        </div>

        <div className="workspace-editor-preview workspace-editor-preview-availability">
          <div className="min-w-0">
            <div className="workspace-editor-preview-title">{day.label}</div>
            <div className="workspace-editor-preview-meta">
              <span className="chip-muted text-[10px]">{statusLabel}</span>
              <span className="chip-muted text-[10px]">
                {locale === 'ru' ? `${day.slots.length} интервала` : `${day.slots.length} slots`}
              </span>
              <span className="chip-muted text-[10px]">
                {locale === 'ru' ? `${day.breaks.length} перерыва` : `${day.breaks.length} breaks`}
              </span>
            </div>
          </div>
          <div className="workspace-editor-preview-side">{statusLabel}</div>
        </div>
      </div>

      <div className="workspace-editor-scroll">
        <div className={cn('workspace-editor-grid availability-editor-grid', !isMobile && 'md:grid-cols-2')}>
          <div className="editor-field-card availability-editor-field availability-editor-field-name">
            <div className="editor-field-label">{locale === 'ru' ? 'Название дня' : 'Day label'}</div>
            <Input
              value={day.label}
              onChange={(event) => onUpdate({ label: event.target.value })}
              placeholder={locale === 'ru' ? 'Название дня' : 'Day label'}
              className="mt-2 h-10 bg-background/90"
            />
          </div>

          <div className="editor-field-card availability-editor-field availability-editor-field-status">
            <div className="editor-field-label">{locale === 'ru' ? 'Статус' : 'Status'}</div>
            <Select value={day.status} onValueChange={(value) => onUpdate({ status: value as AvailabilityDayInsight['status'] })}>
              <SelectTrigger className="mt-2 h-10 bg-background/90">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workday">{labels.workday}</SelectItem>
                <SelectItem value="short">{labels.short}</SelectItem>
                <SelectItem value="day-off">{labels.dayOff}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="editor-field-card availability-editor-field availability-editor-field-slots">
            <div className="editor-field-label">{labels.slots}</div>
            <Select
              value={findPresetKey(day.slots, SLOT_PRESETS, 'slots') ?? 'custom'}
              onValueChange={(value) => {
                const preset = SLOT_PRESETS.find((item) => item.key === value);
                if (!preset) return;
                onUpdate({ slots: [...preset.slots] });
              }}
            >
              <SelectTrigger className="mt-2 h-10 bg-background/90">
                <SelectValue placeholder={labels.slots} />
              </SelectTrigger>
              <SelectContent>
                {!findPresetKey(day.slots, SLOT_PRESETS, 'slots') ? (
                  <SelectItem value="custom">
                    {formatIntervals(day.slots, locale)}
                  </SelectItem>
                ) : null}
                {SLOT_PRESETS.map((preset) => (
                  <SelectItem key={preset.key} value={preset.key}>
                    {formatIntervals([...preset.slots], locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="availability-interval-summary">
              {day.slots.length > 0 ? day.slots.map((slot) => (
                <span key={`${day.id}-slot-${slot}`} className="chip-muted">
                  {slot}
                </span>
              )) : <span className="chip-muted">{locale === 'ru' ? 'Нет интервалов' : 'No intervals'}</span>}
            </div>
            <div className="availability-interval-note">
              {locale === 'ru' ? 'Выберите готовую сетку без ручного ввода.' : 'Pick a ready-made schedule instead of typing it manually.'}
            </div>
          </div>

          <div className="editor-field-card availability-editor-field availability-editor-field-breaks">
            <div className="editor-field-label">{labels.breaks}</div>
            <Select
              value={findPresetKey(day.breaks, BREAK_PRESETS, 'breaks') ?? 'custom'}
              onValueChange={(value) => {
                const preset = BREAK_PRESETS.find((item) => item.key === value);
                if (!preset) return;
                onUpdate({ breaks: [...preset.breaks] });
              }}
            >
              <SelectTrigger className="mt-2 h-10 bg-background/90">
                <SelectValue placeholder={labels.breaks} />
              </SelectTrigger>
              <SelectContent>
                {!findPresetKey(day.breaks, BREAK_PRESETS, 'breaks') ? (
                  <SelectItem value="custom">
                    {formatIntervals(day.breaks, locale, locale === 'ru' ? 'Без перерыва' : 'No break')}
                  </SelectItem>
                ) : null}
                {BREAK_PRESETS.map((preset) => (
                  <SelectItem key={preset.key} value={preset.key}>
                    {formatIntervals([...preset.breaks], locale, locale === 'ru' ? 'Без перерыва' : 'No break')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="availability-interval-summary">
              {day.breaks.length > 0 ? day.breaks.map((item) => (
                <span key={`${day.id}-break-${item}`} className="chip-muted">
                  {item}
                </span>
              )) : <span className="chip-muted">{locale === 'ru' ? 'Без перерыва' : 'No break'}</span>}
            </div>
            <div className="availability-interval-note">
              {locale === 'ru' ? 'Перерыв тоже переключается одним списком.' : 'Breaks switch through one clean dropdown too.'}
            </div>
          </div>
        </div>

        <div className="workspace-editor-presets availability-editor-presets">
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
              className="availability-editor-preset-button h-10 justify-start rounded-[14px] px-3"
              onClick={() => onApplyPreset(preset.key as 'dense' | 'short' | 'off' | 'evening')}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="workspace-editor-footer workspace-editor-footer-availability">
        <div className="workspace-editor-footer-group">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() => onMove(-1)}
            disabled={selectedIndex <= 0}
            aria-label={locale === 'ru' ? 'Переместить вверх' : 'Move up'}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() => onMove(1)}
            disabled={selectedIndex === totalDays - 1}
            aria-label={locale === 'ru' ? 'Переместить вниз' : 'Move down'}
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="workspace-editor-delete-button"
          onClick={onDelete}
          disabled={totalDays === 1}
        >
          <Trash2 className="size-4" />
          {labels.delete}
        </Button>
      </div>
    </div>
  );
}

export default function AvailabilityPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const isMobile = useMobile();
  const [days, setDays, storageReady] = useWorkspaceSection<AvailabilityDayInsight[]>('availability', dataset?.availability ?? []);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [dayEditorOpen, setDayEditorOpen] = useState(false);


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
        helperDescription: 'Примените готовый шаблон к выбранному дню.',
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
        editorDescription: 'Change status, slots, breaks, and the day order in one place.',
        helperTitle: 'Quick presets',
        helperDescription: 'Apply a ready-made template to the selected day.',
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
              setDayEditorOpen(true);
            }}>
              <Plus className="size-4" />
              {labels.add}
            </Button>
          }
        />

        <div className="dashboard-kpi-grid dashboard-mobile-stats-grid availability-mobile-stats-grid availability-mobile-kpi-grid grid grid-cols-2 gap-3">
          <MetricCard label={locale === 'ru' ? 'Рабочие дни' : 'Working days'} value={String(workdays)} icon={CalendarRange} />
          <MetricCard label={locale === 'ru' ? 'Короткие смены' : 'Short shifts'} value={String(shortDays)} icon={Clock3} />
          <MetricCard label={locale === 'ru' ? 'Выходные / off' : 'Off days'} value={String(dayOffCount)} icon={Lock} />
          <MetricCard label={locale === 'ru' ? 'Шаблон недели' : 'Week template'} value={locale === 'ru' ? 'Гибкий' : 'Flexible'} icon={TimerReset} />
        </div>

        <div className="availability-mobile-layout grid gap-5 xl:grid-cols-[minmax(0,1fr)_286px]">
          <div className="space-y-5">
            <SectionCard title={labels.editorTitle} description={locale === 'ru' ? 'Нажмите на день и измените интервалы.' : 'Tap any day to edit the intervals.'} className="p-4">
              <div className={cn("grid gap-3", isMobile ? "grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3")}>
                {days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      setSelectedDayId(day.id);
                      setDayEditorOpen(true);
                    }}
                    className={cn(
                      "selection-tone-card rounded-[16px] p-3.5 text-left",
                    )}
                    data-active={selectedDay?.id === day.id ? 'true' : 'false'}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-[13px] font-medium text-foreground">{day.label}</div>
                      <span className="chip-muted">
                        {day.status === 'workday' ? labels.workday : day.status === 'short' ? labels.short : labels.dayOff}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.slots}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {day.slots.length > 0 ? day.slots.slice(0, 2).map((slot) => (
                            <span key={`${day.id}-${slot}`} className="chip-muted">{slot}</span>
                          )) : <span className="text-[12px] text-muted-foreground">—</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.breaks}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {day.breaks.length > 0 ? day.breaks.slice(0, 2).map((item) => (
                            <span key={`${day.id}-break-${item}`} className="chip-muted">{item}</span>
                          )) : <span className="text-[12px] text-muted-foreground">—</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title={labels.helperTitle}
            description={labels.helperDescription}
            className={cn("p-4", !isMobile && "xl:sticky xl:top-4 xl:self-start")}
          >
            <div className="availability-sidebar-stack">
              <div className="availability-helper-summary rounded-[16px] border border-border/80 bg-accent/18 p-3.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {locale === 'ru' ? 'Выбранный день' : 'Selected day'}
                </div>
                {selectedDay ? (
                  <div className="mt-2 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-semibold text-foreground">{selectedDay.label}</div>
                        <div className="mt-1 text-[12px] text-muted-foreground">
                          {selectedDay.status === 'workday'
                            ? labels.workday
                            : selectedDay.status === 'short'
                              ? labels.short
                              : labels.dayOff}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDayEditorOpen(true)}
                      >
                        {locale === 'ru' ? 'Изменить' : 'Edit'}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.slots}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {selectedDay.slots.length > 0
                            ? selectedDay.slots.slice(0, 3).map((slot) => (
                                <span key={`${selectedDay.id}-${slot}`} className="chip-muted">
                                  {slot}
                                </span>
                              ))
                            : <span className="text-[12px] text-muted-foreground">—</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.breaks}</div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {selectedDay.breaks.length > 0
                            ? selectedDay.breaks.slice(0, 2).map((item) => (
                                <span key={`${selectedDay.id}-break-${item}`} className="chip-muted">
                                  {item}
                                </span>
                              ))
                            : <span className="text-[12px] text-muted-foreground">—</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-[12px] text-muted-foreground">
                    {locale === 'ru' ? 'Выберите день для быстрой настройки.' : 'Choose a day for quick presets.'}
                  </div>
                )}
              </div>

              <div className="availability-quick-presets">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {labels.helperTitle}
                </div>
                <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {selectedDay
                    ? locale === 'ru'
                      ? 'Шаблон применяется к выбранному дню.'
                      : 'The preset applies to the selected day.'
                    : locale === 'ru'
                      ? 'Сначала выберите день.'
                      : 'Select a day first.'}
                </div>

                <div className="availability-quick-presets-grid">
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
                      className="availability-quick-preset-button"
                      onClick={() => selectedDay && applyPreset(selectedDay.id, preset.key as 'dense' | 'short' | 'off' | 'evening')}
                      disabled={!selectedDay}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {isMobile ? (
          <Sheet open={dayEditorOpen && !!selectedDay} onOpenChange={(open) => setDayEditorOpen(open)}>
            {selectedDay ? (
              <SheetContent side="bottom" className="availability-editor-sheet">
                <SheetHeader className="sr-only">
                  <SheetTitle>{selectedDay.label}</SheetTitle>
                  <SheetDescription>{labels.editorDescription}</SheetDescription>
                </SheetHeader>
                <AvailabilityEditorPanel
                  locale={locale}
                  labels={labels}
                  day={selectedDay}
                  selectedIndex={selectedIndex}
                  totalDays={days.length}
                  isMobile
                  onUpdate={(patch) => updateDay(selectedDay.id, patch)}
                  onMove={(direction) => moveDay(selectedDay.id, direction)}
                  onApplyPreset={(preset) => applyPreset(selectedDay.id, preset)}
                  onDelete={() => {
                    setDays((current) => current.filter((item) => item.id !== selectedDay.id));
                    setDayEditorOpen(false);
                  }}
                />
              </SheetContent>
            ) : null}
          </Sheet>
        ) : (
          <Dialog open={dayEditorOpen && !!selectedDay} onOpenChange={(open) => setDayEditorOpen(open)}>
            {selectedDay ? (
              <DialogContent className="availability-editor-dialog">
                <DialogHeader className="sr-only">
                  <DialogTitle>{selectedDay.label}</DialogTitle>
                  <DialogDescription>{labels.editorDescription}</DialogDescription>
                </DialogHeader>
                <AvailabilityEditorPanel
                  locale={locale}
                  labels={labels}
                  day={selectedDay}
                  selectedIndex={selectedIndex}
                  totalDays={days.length}
                  isMobile={false}
                  onUpdate={(patch) => updateDay(selectedDay.id, patch)}
                  onMove={(direction) => moveDay(selectedDay.id, direction)}
                  onApplyPreset={(preset) => applyPreset(selectedDay.id, preset)}
                  onDelete={() => {
                    setDays((current) => current.filter((item) => item.id !== selectedDay.id));
                    setDayEditorOpen(false);
                  }}
                />
              </DialogContent>
            ) : null}
          </Dialog>
        )}
      </div>
    </WorkspaceShell>
  );
}
