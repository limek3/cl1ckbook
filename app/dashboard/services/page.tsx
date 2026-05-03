// app/dashboard/services/page.tsx
'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  LayoutDashboard,
  Plus,
  Search,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react';

import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { Input } from '@/components/ui/input';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useWorkspaceSection } from '@/hooks/use-workspace-section';
import { useAppearance } from '@/lib/appearance-context';
import { accentPalette } from '@/lib/appearance-palette';
import { type ServiceInsight, formatCurrency } from '@/lib/master-workspace';
import {
  getServiceCategoryOptions,
  getServiceSuggestions,
  getSuggestedCategory,
} from '@/lib/service-presets';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';

type ServiceDragState = {
  id: string;
  pointerId: number;
  startY: number;
  startX: number;
  originIndex: number;
  active: boolean;
  cardRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
};

type ServiceEditorLabels = {
  editorTitle: string;
  editorDescription: string;
  visible: string;
  hidden: string;
  price: string;
  duration: string;
  status: string;
  active: string;
  seasonal: string;
  draft: string;
  visibleOnPage: string;
  duplicate: string;
  delete: string;
  moveUp: string;
  moveDown: string;
  name: string;
  categoryCustom: string;
  bookings: string;
};

function arrayMove<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || from >= items.length || to < 0) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);

  if (!item) return items;

  const insertIndex = Math.max(0, Math.min(to, next.length));
  next.splice(insertIndex, 0, item);

  return next;
}

function createService(
  locale: 'ru' | 'en',
  index: number,
  name?: string,
  profession?: string,
): ServiceInsight {
  const serviceName =
    name?.trim() ||
    (locale === 'ru' ? `Новая услуга ${index + 1}` : `New service ${index + 1}`);

  return {
    id: `custom-service-${crypto.randomUUID()}`,
    name: serviceName,
    duration: 60,
    price: 2500,
    status: 'active',
    visible: true,
    bookings: 0,
    revenue: 0,
    popularity: 0,
    category: getSuggestedCategory(serviceName, profession ?? '', locale),
  };
}

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
  return light
    ? 'border-black/[0.08] bg-[#fbfbfa]'
    : 'border-white/[0.08] bg-[#101010]';
}

function insetTone(light: boolean) {
  return light
    ? 'border-black/[0.07] bg-black/[0.025]'
    : 'border-white/[0.07] bg-white/[0.035]';
}

function fieldTone(light: boolean) {
  return light
    ? 'border-black/[0.08] bg-white text-black placeholder:text-black/34'
    : 'border-white/[0.08] bg-white/[0.035] text-white placeholder:text-white/30';
}

function buttonBase(light: boolean, active = false) {
  return cn(
    'inline-flex h-8 items-center justify-center gap-2 rounded-[9px] border px-3 text-[12px] font-medium shadow-none transition-[background,border-color,color,opacity,transform] duration-150 active:scale-[0.985]',
    active
      ? light
        ? 'cb-neutral-primary cb-neutral-primary-light hover:opacity-[0.98]'
        : 'cb-neutral-primary cb-neutral-primary-dark hover:opacity-[0.98]'
      : light
        ? 'border-black/[0.08] bg-white text-black/58 hover:border-black/[0.14] hover:bg-black/[0.035] hover:text-black'
        : 'border-white/[0.08] bg-white/[0.04] text-white/55 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white',
  );
}

function disabledButtonClass() {
  return 'disabled:pointer-events-none disabled:opacity-40';
}

function accentPillStyle(
  color: string,
  light: boolean,
  strength: 'soft' | 'strong' = 'strong',
): CSSProperties {
  const bgAmount = strength === 'strong' ? (light ? 18 : 34) : light ? 10 : 22;
  const borderAmount = strength === 'strong' ? (light ? 34 : 48) : light ? 22 : 34;

  return {
    background: light
      ? `color-mix(in srgb, ${color} ${bgAmount}%, #ffffff)`
      : `color-mix(in srgb, ${color} ${bgAmount}%, #141414)`,
    borderColor: light
      ? `color-mix(in srgb, ${color} ${borderAmount}%, rgba(0,0,0,0.1))`
      : `color-mix(in srgb, ${color} ${borderAmount}%, rgba(255,255,255,0.1))`,
    color: light
      ? `color-mix(in srgb, ${color} 70%, #101010)`
      : `color-mix(in srgb, ${color} 18%, #ffffff)`,
    boxShadow:
      strength === 'strong'
        ? light
          ? `0 0 0 1px color-mix(in srgb, ${color} 10%, transparent)`
          : `0 0 0 1px color-mix(in srgb, ${color} 14%, transparent)`
        : undefined,
  };
}

function serviceAccentColor(
  service: ServiceInsight,
  accentColor: string,
  publicAccentColor: string,
  light: boolean,
) {
  if (!service.visible) {
    return light ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.2)';
  }

  if (service.status === 'active') return accentColor;
  if (service.status === 'seasonal') return publicAccentColor;

  return light ? 'rgba(0,0,0,0.34)' : 'rgba(255,255,255,0.38)';
}

function serviceStatusLabel(service: ServiceInsight, labels: ServiceEditorLabels) {
  if (!service.visible) return labels.hidden;
  if (service.status === 'seasonal') return labels.seasonal;
  if (service.status === 'draft') return labels.draft;
  return labels.active;
}

function serviceStatusHint(service: ServiceInsight, labels: ServiceEditorLabels) {
  if (!service.visible) return labels.visibleOnPage;
  if (service.status === 'seasonal') return labels.status;
  if (service.status === 'draft') return labels.status;
  return labels.visible;
}

function Card({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <section className={cn('rounded-[11px] border', cardTone(light), className)}>
      {children}
    </section>
  );
}

function CardTitle({
  title,
  description,
  light,
  action,
}: {
  title: string;
  description?: string;
  light: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[58px] items-center justify-between gap-4 border-b px-4 py-3',
        borderTone(light),
      )}
    >
      <div className="min-w-0">
        <h2
          className={cn(
            'truncate text-[13px] font-semibold tracking-[-0.018em]',
            pageText(light),
          )}
        >
          {title}
        </h2>

        {description ? (
          <p className={cn('mt-1 truncate text-[11px]', mutedText(light))}>
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function Panel({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <div className={cn('rounded-[10px] border', insetTone(light), className)}>
      {children}
    </div>
  );
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
      style={active && accentColor ? accentPillStyle(accentColor, light, 'soft') : undefined}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-[9px] border px-2.5 text-[10.5px] font-medium',
        active && !accentColor
          ? light
            ? 'border-black/[0.1] bg-black/[0.045] text-black/62'
            : 'border-white/[0.11] bg-white/[0.075] text-white/68'
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

function StatusDot({
  light,
  active,
  accentColor,
}: {
  light: boolean;
  active?: boolean;
  accentColor?: string;
}) {
  return (
    <span
      style={active && accentColor ? { background: accentColor } : undefined}
      className={cn(
        'size-1.5 shrink-0 rounded-full',
        !(active && accentColor) &&
          (active ? 'bg-current' : light ? 'bg-black/24' : 'bg-white/22'),
      )}
    />
  );
}

function HeroStat({
  label,
  value,
  hint,
  light,
}: {
  label: string;
  value: string | number;
  hint?: string;
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-[10px] border px-3.5 py-3 transition-colors duration-150',
        light
          ? 'border-black/[0.07] bg-white hover:bg-black/[0.018]'
          : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.055]',
      )}
    >
      <div className="grid min-h-[34px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <div className={cn('truncate text-[10.5px] font-medium', mutedText(light))}>
            {label}
          </div>

          {hint ? (
            <div className={cn('mt-0.5 truncate text-[10px]', faintText(light))}>
              {hint}
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'min-w-[54px] max-w-[150px] truncate text-right text-[18px] font-semibold leading-none tracking-[-0.055em] tabular-nums',
            pageText(light),
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function ControlGroup({
  children,
  light,
  className,
}: {
  children: ReactNode;
  light: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex max-w-full shrink-0 items-center overflow-hidden rounded-[12px] border p-0',
        light
          ? 'border-black/[0.08] bg-white'
          : 'border-white/[0.08] bg-white/[0.045]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  light,
  accentColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  light: boolean;
  accentColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center border-r px-4 text-[11px] font-semibold tracking-[-0.015em] transition-colors duration-150 last:border-r-0 active:scale-[0.985]',
        light ? 'border-black/[0.07]' : 'border-white/[0.07]',
        active
          ? light
            ? 'text-black'
            : 'text-white'
          : light
            ? 'text-black/40 hover:text-black/70'
            : 'text-white/36 hover:text-white/70',
      )}
    >
      <span className="relative z-10">{label}</span>

      <span
        style={active ? { background: accentColor } : undefined}
        className={cn(
          'absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-200',
          active
            ? 'opacity-100'
            : light
              ? 'bg-black/0 opacity-0 group-hover:bg-black/18 group-hover:opacity-100'
              : 'bg-white/0 opacity-0 group-hover:bg-white/18 group-hover:opacity-100',
        )}
      />
    </button>
  );
}

function ServiceStatus({
  service,
  labels,
  light,
  accentColor,
  publicAccentColor,
}: {
  service: ServiceInsight;
  labels: ServiceEditorLabels;
  light: boolean;
  accentColor: string;
  publicAccentColor: string;
}) {
  const color = serviceAccentColor(service, accentColor, publicAccentColor, light);

  return (
    <div className="flex min-w-0 items-center justify-end gap-2">
      <div className="min-w-0 text-right">
        <div
          className={cn(
            'truncate text-[11.5px] font-semibold leading-none tracking-[-0.018em]',
            light ? 'text-black/72' : 'text-white/74',
          )}
        >
          {serviceStatusLabel(service, labels)}
        </div>

        <div
          className={cn(
            'mt-1 truncate text-[9.5px] font-medium uppercase tracking-[0.12em]',
            light ? 'text-black/32' : 'text-white/28',
          )}
        >
          {serviceStatusHint(service, labels)}
        </div>
      </div>

      <span
        style={{
          background: color,
          boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 14%, transparent)`,
        }}
        className="size-2 shrink-0 rounded-full"
      />
    </div>
  );
}

function ActionLink({
  href,
  children,
  light,
  active,
  className,
}: {
  href: string;
  children: ReactNode;
  light: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(buttonBase(light, active), className)}>
      {children}
    </Link>
  );
}

function ActionButton({
  children,
  light,
  active,
  disabled,
  onClick,
  className,
}: {
  children: ReactNode;
  light: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(buttonBase(light, active), disabledButtonClass(), className)}
    >
      {children}
    </button>
  );
}

function EmptyInfoCard({
  icon,
  label,
  title,
  description,
  light,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
  light: boolean;
}) {
  return (
    <Card light={light}>
      <div className="p-4">
        <MicroLabel light={light}>
          {icon}
          {label}
        </MicroLabel>

        <div
          className={cn(
            'mt-4 text-[13px] font-semibold tracking-[-0.018em]',
            pageText(light),
          )}
        >
          {title}
        </div>

        <p className={cn('mt-1 text-[11px] leading-4', mutedText(light))}>
          {description}
        </p>
      </div>
    </Card>
  );
}

function ServiceTableHead({
  locale,
  light,
}: {
  locale: 'ru' | 'en';
  light: boolean;
}) {
  return (
    <div
      className={cn(
        'mx-3 hidden px-4 pb-2.5 pl-5 pt-3 text-[9.5px] font-semibold uppercase tracking-[0.14em] md:grid md:grid-cols-[minmax(0,1fr)_128px_150px_92px] md:items-center md:gap-4',
        light ? 'text-black/30' : 'text-white/25',
      )}
    >
      <div>{locale === 'ru' ? 'Услуга' : 'Service'}</div>
      <div className="text-right">{locale === 'ru' ? 'Цена' : 'Price'}</div>
      <div className="text-right">{locale === 'ru' ? 'Показ' : 'Visibility'}</div>
      <div className="text-right">{locale === 'ru' ? 'Действия' : 'Actions'}</div>
    </div>
  );
}

function ServiceCard({
  service,
  index,
  active,
  dragging,
  labels,
  locale,
  light,
  accentColor,
  publicAccentColor,
  onOpen,
  onToggleVisible,
  onDragStart,
}: {
  service: ServiceInsight;
  index: number;
  active: boolean;
  dragging?: boolean;
  labels: ServiceEditorLabels;
  locale: 'ru' | 'en';
  light: boolean;
  accentColor: string;
  publicAccentColor: string;
  onOpen?: () => void;
  onToggleVisible?: () => void;
  onDragStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  const color = serviceAccentColor(service, accentColor, publicAccentColor, light);

  return (
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (!onOpen) return;

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        'group relative w-full cursor-pointer overflow-hidden rounded-[10px] border text-left outline-none',
        'transition-[background,border-color,box-shadow,opacity,transform,filter] duration-150',
        active
          ? light
            ? 'border-black/[0.13] bg-white shadow-[0_12px_26px_rgba(15,15,15,0.045)]'
            : 'border-white/[0.13] bg-white/[0.06] shadow-[0_18px_38px_rgba(0,0,0,0.24)]'
          : light
            ? 'border-black/[0.065] bg-white/70 hover:border-black/[0.12] hover:bg-white'
            : 'border-white/[0.065] bg-white/[0.032] hover:border-white/[0.12] hover:bg-white/[0.055]',
        dragging && 'shadow-[0_18px_60px_rgba(0,0,0,0.22)]',
        !service.visible && 'opacity-62',
      )}
    >
      <span
        style={{
          background: color,
          opacity: active ? 1 : 0.78,
        }}
        className="absolute left-0 top-3 h-[calc(100%-24px)] w-[3px] rounded-r-full"
      />

      <div className="grid gap-3 px-4 py-3 pl-5 md:min-h-[66px] md:grid-cols-[minmax(0,1fr)_128px_150px_92px] md:items-center md:gap-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                'inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-[8px] border px-1.5 text-[10px] font-semibold tabular-nums',
                active
                  ? 'cb-accent-pill-active'
                  : light
                    ? 'border-black/[0.08] bg-white text-black/46'
                    : 'border-white/[0.08] bg-white/[0.04] text-white/42',
              )}
            >
              {index + 1}
            </span>

            <div className="min-w-0">
              <div
                className={cn(
                  'truncate text-[12.5px] font-semibold tracking-[-0.018em]',
                  pageText(light),
                )}
              >
                {service.name}
              </div>

              <div
                className={cn(
                  'mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-4',
                  mutedText(light),
                )}
              >
                <span className="truncate">{service.category}</span>
                <span className={faintText(light)}>•</span>
                <span>
                  {service.duration} {locale === 'ru' ? 'мин' : 'min'}
                </span>
                <span className={faintText(light)}>•</span>
                <span>
                  {service.bookings} {labels.bookings.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'text-[13px] font-semibold tabular-nums md:text-right',
            pageText(light),
          )}
        >
          {formatCurrency(service.price, locale)}
        </div>

        <ServiceStatus
          service={service}
          labels={labels}
          light={light}
          accentColor={accentColor}
          publicAccentColor={publicAccentColor}
        />

        <div className="flex shrink-0 items-center justify-end gap-1.5">
          <button
            type="button"
            aria-label={
              service.visible
                ? locale === 'ru'
                  ? 'Скрыть услугу'
                  : 'Hide service'
                : locale === 'ru'
                  ? 'Показать услугу'
                  : 'Show service'
            }
            className={cn(buttonBase(light, service.visible), 'size-8 px-0')}
            onClick={(event) => {
              event.stopPropagation();
              onToggleVisible?.();
            }}
          >
            {service.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </button>

          <button
            type="button"
            aria-label={locale === 'ru' ? 'Перетащить услугу' : 'Drag service'}
            className={cn(
              buttonBase(light),
              'size-8 cursor-grab px-0 active:cursor-grabbing',
              'opacity-70 transition-opacity group-hover:opacity-100',
            )}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={onDragStart}
          >
            <GripVertical className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceEditorDialog({
  open,
  locale,
  labels,
  service,
  selectedIndex,
  totalServices,
  light,
  accentColor,
  publicAccentColor,
  onUpdate,
  onMove,
  onDuplicate,
  onDelete,
  onClose,
}: {
  open: boolean;
  locale: 'ru' | 'en';
  labels: ServiceEditorLabels;
  service: ServiceInsight;
  selectedIndex: number;
  totalServices: number;
  light: boolean;
  accentColor: string;
  publicAccentColor: string;
  onUpdate: (patch: Partial<ServiceInsight>) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;

  const previewName = service.name || (locale === 'ru' ? 'Название услуги' : 'Service name');
  const previewCategory = service.category || labels.categoryCustom;
  const statusAccent = serviceAccentColor(service, accentColor, publicAccentColor, light);

  const copy =
    locale === 'ru'
      ? {
          close: 'Закрыть',
          done: 'Готово',
          position: 'Позиция',
          clientView: 'Показ клиентам',
          details: 'Данные услуги',
          settingsDescription:
            'Измените цену, длительность, категорию, статус и видимость услуги на публичной странице.',
        }
      : {
          close: 'Close',
          done: 'Done',
          position: 'Position',
          clientView: 'Client view',
          details: 'Service details',
          settingsDescription:
            'Edit price, duration, category, status, and visibility on the public page.',
        };

  const inputClass = cn(
    'mt-2 h-9 rounded-[9px] border text-[12px] shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
    fieldTone(light),
  );

  const statusOptions = [
    { value: 'active', label: labels.active },
    { value: 'seasonal', label: labels.seasonal },
    { value: 'draft', label: labels.draft },
  ] as const;

  function ModalRow({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 border-b py-3 last:border-b-0',
          borderTone(light),
        )}
      >
        <div className={cn('text-[12px]', mutedText(light))}>{label}</div>

        <div
          className={cn(
            'max-w-[150px] truncate rounded-[8px] px-2.5 py-1 text-right text-[12px] font-semibold',
            light ? 'bg-black/[0.025] text-[#0e0e0e]' : 'bg-white/[0.04] text-white',
          )}
        >
          {value}
        </div>
      </div>
    );
  }

  function ModalActionButton({
    icon,
    label,
    onClick,
    disabled,
    danger,
  }: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-3 rounded-[10px] border px-3 text-left text-[12px] font-medium transition-colors active:scale-[0.992]',
          disabledButtonClass(),
          danger
            ? light
              ? 'border-red-500/15 bg-red-500/[0.035] text-red-600 hover:bg-red-500/[0.055]'
              : 'border-red-300/15 bg-red-300/[0.05] text-red-300 hover:bg-red-300/[0.075]'
            : light
              ? 'border-black/[0.08] bg-white text-black/62 hover:bg-black/[0.025] hover:text-black'
              : 'border-white/[0.08] bg-white/[0.035] text-white/58 hover:bg-white/[0.06] hover:text-white',
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn('shrink-0', mutedText(light))}>{icon}</span>
          <span className="truncate">{label}</span>
        </span>

        <ArrowRight className={cn('size-3.5 shrink-0', mutedText(light))} />
      </button>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[10px]" />

      <div
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          'relative w-full max-w-[620px] overflow-hidden rounded-[18px] border',
          'max-h-[calc(100dvh-32px)]',
          light
            ? 'border-black/[0.09] bg-[var(--cb-surface)] text-[#0e0e0e] shadow-[0_34px_90px_rgba(0,0,0,0.18)]'
            : 'border-white/[0.10] bg-[#101010] text-white shadow-[0_34px_90px_rgba(0,0,0,0.55)]',
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: light
              ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.16), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          }}
        />

        <div className={cn('flex items-start justify-between gap-4 border-b p-5', borderTone(light))}>
          <div className="min-w-0">
            <h2 className="truncate text-[26px] font-semibold leading-none tracking-[-0.07em]">
              {previewName}
            </h2>

            <p className={cn('mt-2 max-w-[460px] text-[12.5px] leading-5', mutedText(light))}>
              {copy.settingsDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-[10px] border transition-colors',
              light
                ? 'border-black/[0.08] bg-white text-black/42 hover:bg-black/[0.035] hover:text-black'
                : 'border-white/[0.08] bg-white/[0.04] text-white/42 hover:bg-white/[0.07] hover:text-white',
            )}
            aria-label={copy.close}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-170px)] overflow-y-auto">
          <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <Panel light={light} className="overflow-hidden">
                <div className={cn('border-b px-4 py-3', borderTone(light))}>
                  <div className={cn('text-[11px] font-medium', mutedText(light))}>
                    {copy.details}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className={cn('truncate text-[15px] font-semibold', pageText(light))}>
                        {previewName}
                      </div>

                      <div className={cn('mt-0.5 truncate text-[10px]', mutedText(light))}>
                        {previewCategory}
                      </div>
                    </div>

                    <div className="size-2 rounded-full" style={{ background: statusAccent }} />
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <div className={cn('text-[10.5px] font-medium', mutedText(light))}>
                      {labels.name}
                    </div>

                    <Input
                      list="service-name-options"
                      value={service.name}
                      onChange={(event) => onUpdate({ name: event.target.value })}
                      placeholder={labels.name}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className={cn('text-[10.5px] font-medium', mutedText(light))}>
                      {labels.categoryCustom}
                    </div>

                    <Input
                      list="service-category-options"
                      value={service.category}
                      onChange={(event) => onUpdate({ category: event.target.value })}
                      placeholder={labels.categoryCustom}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className={cn('text-[10.5px] font-medium', mutedText(light))}>
                        {labels.price}
                      </div>

                      <Input
                        type="number"
                        value={String(service.price)}
                        onChange={(event) => onUpdate({ price: Number(event.target.value) || 0 })}
                        placeholder={labels.price}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <div className={cn('text-[10.5px] font-medium', mutedText(light))}>
                        {labels.duration}
                      </div>

                      <Input
                        type="number"
                        value={String(service.duration)}
                        onChange={(event) =>
                          onUpdate({ duration: Number(event.target.value) || 0 })
                        }
                        placeholder={labels.duration}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel light={light} className="p-4">
                <div className={cn('text-[11px] font-medium', mutedText(light))}>
                  {labels.status}
                </div>

                <ControlGroup light={light} className="mt-3 max-w-full overflow-x-auto">
                  {statusOptions.map((item) => (
                    <FilterChip
                      key={item.value}
                      label={item.label}
                      active={service.status === item.value}
                      onClick={() => onUpdate({ status: item.value })}
                      light={light}
                      accentColor={accentColor}
                    />
                  ))}
                </ControlGroup>
              </Panel>

              <Panel light={light} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className={cn('text-[13px] font-semibold', pageText(light))}>
                      {copy.clientView}
                    </div>

                    <p className={cn('mt-1 text-[11.5px] leading-5', mutedText(light))}>
                      {labels.visibleOnPage}
                    </p>
                  </div>

                  <ServiceStatus
                    service={service}
                    labels={labels}
                    light={light}
                    accentColor={accentColor}
                    publicAccentColor={publicAccentColor}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate({ visible: true })}
                    className={cn('w-full', buttonBase(light, service.visible))}
                  >
                    <Eye className="size-3.5" />
                    {labels.visible}
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdate({ visible: false })}
                    className={cn('w-full', buttonBase(light, !service.visible))}
                  >
                    <EyeOff className="size-3.5" />
                    {labels.hidden}
                  </button>
                </div>
              </Panel>
            </div>

            <div className="space-y-3">
              <Panel light={light} className="overflow-hidden px-4">
                <ModalRow label={copy.position} value={`#${selectedIndex + 1}`} />
                <ModalRow label={labels.price} value={formatCurrency(service.price, locale)} />
                <ModalRow
                  label={labels.duration}
                  value={`${service.duration} ${locale === 'ru' ? 'мин' : 'min'}`}
                />
                <ModalRow label={labels.categoryCustom} value={previewCategory} />
              </Panel>

              <div className="space-y-2">
                <ModalActionButton
                  icon={<ArrowUp className="size-4" />}
                  label={labels.moveUp}
                  onClick={() => onMove(-1)}
                  disabled={selectedIndex <= 0}
                />

                <ModalActionButton
                  icon={<ArrowDown className="size-4" />}
                  label={labels.moveDown}
                  onClick={() => onMove(1)}
                  disabled={selectedIndex === totalServices - 1}
                />

                <ModalActionButton
                  icon={<Copy className="size-4" />}
                  label={labels.duplicate}
                  onClick={onDuplicate}
                />

                <ModalActionButton
                  icon={<Trash2 className="size-4" />}
                  label={labels.delete}
                  onClick={onDelete}
                  disabled={totalServices === 1}
                  danger
                />

                <button
                  type="button"
                  onClick={onClose}
                  className={cn('mt-3 w-full', buttonBase(light, true))}
                >
                  {copy.done}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ServicesPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const { resolvedTheme } = useTheme();
  const { settings } = useAppearance();

  const [mounted, setMounted] = useState(false);
  const initialServices = useMemo(() => dataset?.services ?? [], [dataset?.services]);
  const [services, setServices] = useWorkspaceSection<ServiceInsight[]>('services', initialServices);
  const [dragState, setDragState] = useState<ServiceDragState | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [customServiceName, setCustomServiceName] = useState('');
  const [serviceEditorOpen, setServiceEditorOpen] = useState(false);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const suppressCardClickRef = useRef(false);
  const dragOffsetX = useMotionValue(0);
  const dragOffsetY = useMotionValue(0);
  const dragSpringX = useSpring(dragOffsetX, { stiffness: 820, damping: 54, mass: 0.52 });
  const dragSpringY = useSpring(dragOffsetY, { stiffness: 820, damping: 54, mass: 0.52 });
  const dragFrameRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const dragOverIndexRef = useRef<number | null>(null);
  const dragThresholdRef = useRef(6);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (services.length > 0 || initialServices.length === 0) return;
    setServices(initialServices);
  }, [hasHydrated, initialServices, services.length, setServices]);

  const currentTheme: ThemeMode = mounted
    ? resolvedTheme === 'light'
      ? 'light'
      : 'dark'
    : 'dark';

  const isLight = currentTheme === 'light';

  const accentColor = accentPalette[settings.accentTone].solid;
  const publicAccentColor = accentPalette[settings.publicAccent].solid;

  const draggedId = dragState?.active ? dragState.id : null;
  const draggedService = draggedId
    ? services.find((service) => service.id === draggedId) ?? null
    : null;

  useEffect(() => {
    if (!services.length) {
      setSelectedServiceId(null);
      return;
    }

    if (!selectedServiceId || !services.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(services[0].id);
    }
  }, [selectedServiceId, services]);

  const setServiceItemRef = useMemo(
    () => (id: string) => (node: HTMLDivElement | null) => {
      itemRefs.current[id] = node;
    },
    [],
  );

  const getDropIndexFromPoint = useCallback(
    (clientY: number, draggedServiceId: string) => {
      const visibleItems = services
        .map((service, index) => ({ service, index, node: itemRefs.current[service.id] }))
        .filter((item) => item.node && item.service.id !== draggedServiceId);

      if (!visibleItems.length) return 0;

      for (const item of visibleItems) {
        const bounds = item.node!.getBoundingClientRect();

        if (clientY < bounds.top + bounds.height / 2) {
          return item.index;
        }
      }

      return services.length;
    },
    [services],
  );

  const commitServiceDrop = useCallback(
    (state: ServiceDragState | null, targetIndex: number | null) => {
      if (!state || targetIndex === null) return;

      setServices((current) => {
        const from = current.findIndex((service) => service.id === state.id);

        if (from < 0) return current;

        let to = targetIndex;

        if (to > from) {
          to -= 1;
        }

        to = Math.max(0, Math.min(to, current.length - 1));

        if (to === from) return current;

        return arrayMove(current, from, to);
      });
    },
    [setServices],
  );

  const beginServiceDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    serviceId: string,
    index: number,
  ) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const cardNode = itemRefs.current[serviceId];
    const cardRect = cardNode?.getBoundingClientRect();

    if (!cardRect) return;

    event.preventDefault();
    event.stopPropagation();
    suppressCardClickRef.current = false;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}

    setSelectedServiceId(serviceId);
    dragOffsetX.set(0);
    dragOffsetY.set(0);
    dragOffsetRef.current = 0;
    dragOverIndexRef.current = null;
    setDropIndex(null);

    setDragState({
      id: serviceId,
      pointerId: event.pointerId,
      startY: event.clientY,
      startX: event.clientX,
      originIndex: index,
      active: false,
      cardRect: {
        top: cardRect.top,
        left: cardRect.left,
        width: cardRect.width,
        height: cardRect.height,
      },
    });
  };

  const flushDragFrame = useCallback(() => {
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!dragState) {
      dragOffsetX.set(0);
      dragOffsetY.set(0);
      dragOffsetRef.current = 0;
      dragOverIndexRef.current = null;
      setDropIndex(null);
      flushDragFrame();
      return;
    }

    const previousUserSelect = document.body.style.userSelect;
    const previousTouchAction = document.body.style.touchAction;
    const previousCursor = document.body.style.cursor;

    document.body.style.userSelect = 'none';
    document.body.style.touchAction = dragState.active ? 'none' : previousTouchAction;
    document.body.style.cursor = dragState.active ? 'grabbing' : previousCursor;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) return;

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;

      if (!dragState.active) {
        if (
          Math.abs(deltaX) < dragThresholdRef.current &&
          Math.abs(deltaY) < dragThresholdRef.current
        ) {
          return;
        }

        suppressCardClickRef.current = true;
        dragOverIndexRef.current = dragState.originIndex;
        setDropIndex(dragState.originIndex);
        setDragState((current) =>
          current && current.pointerId === dragState.pointerId
            ? { ...current, active: true }
            : current,
        );
        return;
      }

      suppressCardClickRef.current = true;
      dragOffsetX.set(Math.max(-10, Math.min(deltaX * 0.08, 10)));
      dragOffsetRef.current = deltaY;

      if (dragFrameRef.current !== null) return;

      dragFrameRef.current = window.requestAnimationFrame(() => {
        dragFrameRef.current = null;
        dragOffsetY.set(dragOffsetRef.current);

        const nextOverIndex = getDropIndexFromPoint(event.clientY, dragState.id);

        if (dragOverIndexRef.current === nextOverIndex) return;

        dragOverIndexRef.current = nextOverIndex;
        setDropIndex(nextOverIndex);
      });
    };

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) return;

      flushDragFrame();

      if (dragState.active) {
        const targetIndex = dragOverIndexRef.current ?? dragState.originIndex;
        commitServiceDrop(dragState, targetIndex);
      }

      setDragState(null);
      setDropIndex(null);

      window.setTimeout(() => {
        suppressCardClickRef.current = false;
      }, 60);
    };

    const cancelDrag = (event: PointerEvent) => {
      if (event.pointerId !== dragState.pointerId) return;

      flushDragFrame();
      setDragState(null);
      setDropIndex(null);

      window.setTimeout(() => {
        suppressCardClickRef.current = false;
      }, 60);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', cancelDrag);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.touchAction = previousTouchAction;
      document.body.style.cursor = previousCursor;
      flushDragFrame();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', cancelDrag);
    };
  }, [
    commitServiceDrop,
    dragOffsetX,
    dragOffsetY,
    dragState,
    flushDragFrame,
    getDropIndexFromPoint,
  ]);

  const copy =
    locale === 'ru'
      ? {
          title: 'Услуги',
          description:
            'Услуги, цены, длительность, видимость и порядок показа на публичной странице.',
          createProfileTitle: 'Профиль ещё не создан',
          createProfileDescription:
            'Сначала создайте профиль мастера, чтобы открыть каталог услуг, цены, длительность и публичный показ.',
          createProfileButton: 'Создать профиль',

          emptyBadge: 'Профиль не найден',
          emptyCardCatalogLabel: 'Каталог',
          emptyCardCatalogTitle: 'Список услуг',
          emptyCardCatalogText: 'После создания профиля здесь появятся услуги, цены и длительность.',
          emptyCardPublicLabel: 'Публичная',
          emptyCardPublicTitle: 'Показ клиентам',
          emptyCardPublicText: 'Можно будет управлять видимостью услуг на публичной странице.',
          emptyCardStartLabel: 'Старт',
          emptyCardStartTitle: 'Один шаг до запуска',
          emptyCardStartText: 'Заполните профиль мастера, затем добавьте услуги и принимайте записи.',

          totalServices: 'Всего услуг',
          visibleServices: 'Видимые',
          serviceRevenue: 'Доход с услуг',
          averagePrice: 'Средняя цена',
          servicesWord: 'услуг',
          visibleWord: 'видимых',
          revenueWord: 'доход',
          averageWord: 'средняя',

          previewTitle: 'Каталог услуг',
          previewDescription: 'Единый список: порядок, цены, статусы и показ клиентам.',
          quickAddTitle: 'Быстро добавить',
          quickAddDescription: 'Шаблоны, своя услуга и действия по выбранной позиции.',
          quickAddPopular: 'Популярные варианты',
          quickAddPlaceholder: 'Например: SPA-уход для рук',
          quickAddAction: 'Добавить свою',
          selected: 'Выбрано',
          openEditor: 'Открыть редактор',
          dropHere: 'Отпустите, чтобы вставить',
          dropEnd: 'Отпустите, чтобы перенести в конец',
          empty: 'Добавьте первую услугу.',

          editorTitle: 'Карточка услуги',
          editorDescription: 'Цена, длительность и показ для клиентов.',
          duplicate: 'Дублировать',
          delete: 'Удалить',
          moveUp: 'Выше',
          moveDown: 'Ниже',
          visible: 'Видна',
          hidden: 'Скрыта',
          price: 'Цена',
          duration: 'Длительность',
          bookings: 'Записей',
          status: 'Статус',
          active: 'Активна',
          seasonal: 'Сезонная',
          draft: 'Черновик',
          visibleOnPage: 'Показывать клиентам',
          name: 'Название',
          categoryCustom: 'Категория',
          catalogSummary: 'Рабочий список',
        }
      : {
          title: 'Services',
          description: 'Services, prices, duration, visibility, and ordering on the public page.',
          createProfileTitle: 'Profile is not created yet',
          createProfileDescription:
            'Create a master profile first to unlock service catalog, prices, duration, and public visibility.',
          createProfileButton: 'Create profile',

          emptyBadge: 'Profile missing',
          emptyCardCatalogLabel: 'Catalog',
          emptyCardCatalogTitle: 'Service list',
          emptyCardCatalogText: 'After profile setup, services, prices, and duration will appear here.',
          emptyCardPublicLabel: 'Public',
          emptyCardPublicTitle: 'Client view',
          emptyCardPublicText:
            'You will be able to control which services appear on the public page.',
          emptyCardStartLabel: 'Start',
          emptyCardStartTitle: 'One step to launch',
          emptyCardStartText: 'Create the master profile, add services, and start accepting bookings.',

          totalServices: 'Total services',
          visibleServices: 'Visible',
          serviceRevenue: 'Service revenue',
          averagePrice: 'Average price',
          servicesWord: 'services',
          visibleWord: 'visible',
          revenueWord: 'revenue',
          averageWord: 'average',

          previewTitle: 'Service catalog',
          previewDescription: 'One list for ordering, prices, statuses, and client visibility.',
          quickAddTitle: 'Quick add',
          quickAddDescription: 'Templates, custom service, and selected item actions.',
          quickAddPopular: 'Popular options',
          quickAddPlaceholder: 'For example: SPA hand care',
          quickAddAction: 'Add custom',
          selected: 'Selected',
          openEditor: 'Open editor',
          dropHere: 'Release to place',
          dropEnd: 'Drop to move to the end',
          empty: 'Add the first service.',

          editorTitle: 'Service card',
          editorDescription: 'Price, duration, and visibility for clients.',
          duplicate: 'Duplicate',
          delete: 'Delete',
          moveUp: 'Move up',
          moveDown: 'Move down',
          visible: 'Visible',
          hidden: 'Hidden',
          price: 'Price',
          duration: 'Duration',
          bookings: 'Bookings',
          status: 'Status',
          active: 'Active',
          seasonal: 'Seasonal',
          draft: 'Draft',
          visibleOnPage: 'Show to clients',
          name: 'Name',
          categoryCustom: 'Category',
          catalogSummary: 'Workspace list',
        };

  const labels: ServiceEditorLabels = {
    editorTitle: copy.editorTitle,
    editorDescription: copy.editorDescription,
    visible: copy.visible,
    hidden: copy.hidden,
    price: copy.price,
    duration: copy.duration,
    status: copy.status,
    active: copy.active,
    seasonal: copy.seasonal,
    draft: copy.draft,
    visibleOnPage: copy.visibleOnPage,
    duplicate: copy.duplicate,
    delete: copy.delete,
    moveUp: copy.moveUp,
    moveDown: copy.moveDown,
    name: copy.name,
    categoryCustom: copy.categoryCustom,
    bookings: copy.bookings,
  };

  const selectedService =
    services.find((service) => service.id === selectedServiceId) ?? services[0];

  const selectedIndex = services.findIndex((service) => service.id === selectedService?.id);

  const totalRevenue = services.reduce((total, service) => total + service.revenue, 0);
  const averagePrice = Math.round(
    services.reduce((total, service) => total + service.price, 0) /
      Math.max(services.length, 1),
  );
  const visibleCount = services.filter((service) => service.visible).length;
  const draftCount = services.filter((service) => service.status === 'draft').length;

  const suggestedServices =
    ownedProfile && dataset
      ? getServiceSuggestions(ownedProfile.profession, locale).filter(
          (item) =>
            !services.some(
              (service) => service.name.trim().toLowerCase() === item.trim().toLowerCase(),
            ),
        )
      : [];

  const categoryOptions = getServiceCategoryOptions(locale);

  const updateService = (id: string, patch: Partial<ServiceInsight>) => {
    setServices((current) =>
      current.map((service) => (service.id === id ? { ...service, ...patch } : service)),
    );
  };

  const moveService = (id: string, direction: -1 | 1) => {
    setServices((current) => {
      const index = current.findIndex((service) => service.id === id);
      return arrayMove(current, index, index + direction);
    });
  };

  const duplicateService = (service: ServiceInsight) => {
    setServices((current) => {
      const index = current.findIndex((item) => item.id === service.id);
      const copyService: ServiceInsight = {
        ...service,
        id: `copy-${crypto.randomUUID()}`,
        name: `${service.name} ${locale === 'ru' ? 'копия' : 'copy'}`,
      };
      const next = [...current];

      next.splice(index + 1, 0, copyService);

      return next;
    });
  };

  const removeService = (id: string) => {
    setServices((current) => current.filter((service) => service.id !== id));
  };

  const addServiceFromPreset = (name: string) => {
    if (!ownedProfile) return;

    const nextService = createService(locale, services.length, name, ownedProfile.profession);

    setServices((current) => [...current, nextService]);
    setSelectedServiceId(nextService.id);
    setServiceEditorOpen(true);
  };

  const addCustomService = () => {
    if (!ownedProfile) return;

    const nextName = customServiceName.trim();

    if (!nextName) return;

    const nextService = createService(locale, services.length, nextName, ownedProfile.profession);

    setServices((current) => [...current, nextService]);
    setSelectedServiceId(nextService.id);
    setServiceEditorOpen(true);
    setCustomServiceName('');
  };

  if (!hasHydrated || !mounted) return null;

  if (!ownedProfile || !dataset) {
    return (
      <WorkspaceShell>
        <main
          className={cn(
            'min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6',
            pageBg(isLight),
          )}
        >
          <div className="mx-auto w-full max-w-[var(--page-max-width)]">
            <div className="mb-6 md:mb-7">
              <div className="min-w-0">
                <h1
                  className={cn(
                    'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                    pageText(isLight),
                  )}
                >
                  {copy.title}
                </h1>

                <p
                  className={cn(
                    'mt-2 max-w-[760px] text-[13px] leading-5',
                    mutedText(isLight),
                  )}
                >
                  {copy.description}
                </p>
              </div>
            </div>

            <Card light={isLight} className="overflow-hidden">
              <div className="grid min-h-[320px] place-items-center px-5 py-12 text-center">
                <div className="mx-auto max-w-[460px]">
                  <MicroLabel light={isLight}>
                    <StatusDot light={isLight} />
                    {copy.emptyBadge}
                  </MicroLabel>

                  <h2
                    className={cn(
                      'mt-5 text-[28px] font-semibold tracking-[-0.065em] md:text-[36px]',
                      pageText(isLight),
                    )}
                  >
                    {copy.createProfileTitle}
                  </h2>

                  <p className={cn('mt-3 text-[13px] leading-5', mutedText(isLight))}>
                    {copy.createProfileDescription}
                  </p>

                  <div className="mt-6 flex justify-center">
                    <ActionLink href="/create-profile" light={isLight} active>
                      <SquarePen className="size-3.5" />
                      {copy.createProfileButton}
                    </ActionLink>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <EmptyInfoCard
                light={isLight}
                icon={<LayoutDashboard className="size-3.5" />}
                label={copy.emptyCardCatalogLabel}
                title={copy.emptyCardCatalogTitle}
                description={copy.emptyCardCatalogText}
              />

              <EmptyInfoCard
                light={isLight}
                icon={<Eye className="size-3.5" />}
                label={copy.emptyCardPublicLabel}
                title={copy.emptyCardPublicTitle}
                description={copy.emptyCardPublicText}
              />

              <EmptyInfoCard
                light={isLight}
                icon={<Plus className="size-3.5" />}
                label={copy.emptyCardStartLabel}
                title={copy.emptyCardStartTitle}
                description={copy.emptyCardStartText}
              />
            </div>
          </div>
        </main>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell>
      <main
        className={cn(
          'min-h-[calc(100dvh-68px)] px-4 pb-12 pt-5 md:px-7 md:pt-6',
          pageBg(isLight),
        )}
      >
        <div className="mx-auto w-full max-w-[var(--page-max-width)]">
          <div className="mb-6 md:mb-7">
            <div className="min-w-0">
              <h1
                className={cn(
                  'text-[31px] font-semibold tracking-[-0.075em] md:text-[42px]',
                  pageText(isLight),
                )}
              >
                {copy.title}
              </h1>

              <p
                className={cn(
                  'mt-2 max-w-[760px] text-[13px] leading-5',
                  mutedText(isLight),
                )}
              >
                {copy.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Card light={isLight} className="overflow-hidden">
              <div className="p-5 md:p-6">
                <div
                  className={cn(
                    'text-[32px] font-semibold tracking-[-0.08em] md:text-[44px]',
                    pageText(isLight),
                  )}
                >
                  {services.length} {copy.servicesWord}
                </div>

                <p
                  className={cn(
                    'mt-3 max-w-[680px] text-[12.5px] leading-6',
                    mutedText(isLight),
                  )}
                >
                  {locale === 'ru'
                    ? 'Каталог услуг, цены, длительность и порядок показа клиентам собраны в одном рабочем экране.'
                    : 'Service catalog, prices, duration, and public ordering are collected in one workspace.'}
                </p>

                <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <HeroStat
                    label={copy.totalServices}
                    value={services.length}
                    hint={copy.servicesWord}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.visibleServices}
                    value={visibleCount}
                    hint={copy.visibleWord}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.serviceRevenue}
                    value={formatCurrency(totalRevenue, locale)}
                    hint={copy.revenueWord}
                    light={isLight}
                  />

                  <HeroStat
                    label={copy.averagePrice}
                    value={formatCurrency(averagePrice, locale)}
                    hint={copy.averageWord}
                    light={isLight}
                  />
                </div>
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
              <Card light={isLight} className="overflow-hidden">
                <CardTitle
                  title={copy.previewTitle}
                  description={copy.previewDescription}
                  light={isLight}
                />

                <div className="p-4">
                  <Panel light={isLight} className="overflow-hidden">
                    <div className={cn('border-b p-4', borderTone(isLight))}>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <MicroLabel light={isLight}>
                            <Search className="size-3.5" />
                            {copy.catalogSummary}
                          </MicroLabel>

                          <MicroLabel light={isLight}>
                            {draftCount} {copy.draft.toLowerCase()}
                          </MicroLabel>
                        </div>

                        <div
                          className={cn(
                            'mt-3 text-[19px] font-semibold leading-none tracking-[-0.055em]',
                            pageText(isLight),
                          )}
                        >
                          {ownedProfile.name}
                        </div>

                        <div className={cn('mt-1.5 text-[12px]', mutedText(isLight))}>
                          {ownedProfile.profession}
                        </div>
                      </div>
                    </div>

                    <datalist id="service-name-options">
                      {getServiceSuggestions(ownedProfile.profession, locale).map((service) => (
                        <option key={service} value={service} />
                      ))}
                    </datalist>

                    <datalist id="service-category-options">
                      {categoryOptions.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>

                    <ServiceTableHead locale={locale} light={isLight} />

                    <div
                      className={cn(
                        'relative transition-[box-shadow,filter] duration-150',
                        dragState?.active &&
                          (isLight ? 'ring-1 ring-black/12' : 'ring-1 ring-white/12'),
                      )}
                    >
                      {services.length === 0 ? (
                        <div
                          className={cn(
                            'm-3 rounded-[10px] border border-dashed px-4 py-10 text-center text-[12px]',
                            borderTone(isLight),
                            mutedText(isLight),
                          )}
                        >
                          {copy.empty}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            'relative space-y-2 p-3 transition-[filter,opacity] duration-150',
                            dragState?.active && 'select-none',
                          )}
                        >
                          {services.map((service, index) => {
                            const active = selectedService?.id === service.id;
                            const isDragged = draggedId === service.id;
                            const dragSlotHeight = isDragged
                              ? dragState?.cardRect.height ??
                                itemRefs.current[service.id]?.getBoundingClientRect().height ??
                                78
                              : undefined;

                            return (
                              <div
                                key={service.id}
                                className={cn('relative', isDragged && 'opacity-35 blur-[1px]')}
                                style={dragSlotHeight ? { minHeight: dragSlotHeight } : undefined}
                              >
                                {dragState?.active && dropIndex === index ? (
                                  <div className="px-2 py-1">
                                    <div
                                      className={cn(
                                        'flex h-9 items-center justify-center rounded-[9px] border border-dashed text-[10px] font-medium uppercase tracking-[0.14em]',
                                        isLight
                                          ? 'border-black/20 bg-black/[0.025] text-black/42'
                                          : 'border-white/20 bg-white/[0.035] text-white/45',
                                      )}
                                      style={{
                                        borderColor: `color-mix(in srgb, ${accentColor} 45%, transparent)`,
                                        background: `color-mix(in srgb, ${accentColor} ${
                                          isLight ? '7%' : '10%'
                                        }, transparent)`,
                                      }}
                                    >
                                      {copy.dropHere}
                                    </div>
                                  </div>
                                ) : null}

                                <motion.div
                                  ref={setServiceItemRef(service.id)}
                                  layout="position"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 520,
                                    damping: 42,
                                    mass: 0.72,
                                  }}
                                >
                                  <ServiceCard
                                    service={service}
                                    index={index}
                                    active={active}
                                    labels={labels}
                                    locale={locale}
                                    light={isLight}
                                    accentColor={accentColor}
                                    publicAccentColor={publicAccentColor}
                                    onOpen={() => {
                                      if (suppressCardClickRef.current) {
                                        suppressCardClickRef.current = false;
                                        return;
                                      }

                                      setSelectedServiceId(service.id);
                                      setServiceEditorOpen(true);
                                    }}
                                    onToggleVisible={() =>
                                      updateService(service.id, { visible: !service.visible })
                                    }
                                    onDragStart={(event) =>
                                      beginServiceDrag(event, service.id, index)
                                    }
                                  />
                                </motion.div>
                              </div>
                            );
                          })}

                          {dragState?.active && dropIndex === services.length ? (
                            <div className="px-2 py-1">
                              <div
                                className={cn(
                                  'flex h-10 items-center justify-center rounded-[9px] border border-dashed text-[10px] font-medium uppercase tracking-[0.14em]',
                                  isLight
                                    ? 'border-black/20 bg-black/[0.025] text-black/42'
                                    : 'border-white/20 bg-white/[0.035] text-white/45',
                                )}
                                style={{
                                  borderColor: `color-mix(in srgb, ${accentColor} 45%, transparent)`,
                                  background: `color-mix(in srgb, ${accentColor} ${
                                    isLight ? '7%' : '10%'
                                  }, transparent)`,
                                }}
                              >
                                {copy.dropEnd}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </Panel>
                </div>
              </Card>

              {dragState?.active && draggedService && typeof document !== 'undefined'
                ? createPortal(
                    <motion.div
                      className="pointer-events-none fixed"
                      style={{
                        top: dragState.cardRect.top,
                        left: dragState.cardRect.left,
                        width: dragState.cardRect.width,
                        x: dragSpringX,
                        y: dragSpringY,
                        zIndex: 90,
                      }}
                      initial={false}
                      animate={{ scale: 1.018, rotate: 0.25 }}
                      transition={{
                        type: 'spring',
                        stiffness: 680,
                        damping: 42,
                        mass: 0.5,
                      }}
                    >
                      <div
                        className={cn(
                          'absolute -inset-2 rounded-[14px] border backdrop-blur-[18px]',
                          isLight
                            ? 'border-black/[0.08] bg-white/45 shadow-[0_26px_90px_rgba(15,15,15,0.18)]'
                            : 'border-white/[0.10] bg-black/35 shadow-[0_26px_90px_rgba(0,0,0,0.45)]',
                        )}
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} ${
                            isLight ? '10%' : '16%'
                          }, transparent), ${
                            isLight ? 'rgba(255,255,255,0.48)' : 'rgba(10,10,10,0.48)'
                          })`,
                        }}
                      />

                      <div className="relative">
                        <ServiceCard
                          service={draggedService}
                          index={dragState.originIndex}
                          active
                          dragging
                          labels={labels}
                          locale={locale}
                          light={isLight}
                          accentColor={accentColor}
                          publicAccentColor={publicAccentColor}
                        />
                      </div>
                    </motion.div>,
                    document.body,
                  )
                : null}

              <div className="space-y-4 xl:sticky xl:top-[84px] xl:self-start">
                <Card light={isLight} className="overflow-hidden">
                  <CardTitle
                    title={copy.quickAddTitle}
                    description={copy.quickAddDescription}
                    light={isLight}
                    action={
                      <ActionButton
                        light={isLight}
                        active
                        onClick={() => {
                          if (selectedService) setServiceEditorOpen(true);
                        }}
                        disabled={!selectedService}
                        className="hidden md:inline-flex"
                      >
                        {copy.openEditor}
                        <ArrowRight className="size-3.5" />
                      </ActionButton>
                    }
                  />

                  <div className="space-y-4 p-4">
                    <Panel light={isLight} className="p-4">
                      <div
                        className={cn(
                          'text-[13px] font-semibold tracking-[-0.018em]',
                          pageText(isLight),
                        )}
                      >
                        {copy.quickAddPopular}
                      </div>

                      <div className="mt-3 grid gap-2">
                        {suggestedServices.slice(0, 6).map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => addServiceFromPreset(service)}
                            className={cn(
                              'flex h-9 w-full items-center justify-between gap-3 rounded-[9px] border px-3 text-left text-[12px] font-medium transition-colors active:scale-[0.985]',
                              isLight
                                ? 'border-black/[0.07] bg-white text-black/68 hover:border-black/[0.13] hover:bg-black/[0.025] hover:text-black'
                                : 'border-white/[0.07] bg-white/[0.035] text-white/58 hover:border-white/[0.13] hover:bg-white/[0.065] hover:text-white',
                            )}
                          >
                            <span className="truncate">{service}</span>
                            <Plus className="size-3.5 shrink-0 opacity-55" />
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 space-y-2">
                        <Input
                          value={customServiceName}
                          onChange={(event) => setCustomServiceName(event.target.value)}
                          placeholder={copy.quickAddPlaceholder}
                          className={cn(
                            'h-9 rounded-[9px] border text-[12px] shadow-none outline-none focus-visible:ring-0',
                            fieldTone(isLight),
                          )}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addCustomService();
                            }
                          }}
                        />

                        <ActionButton
                          light={isLight}
                          active
                          onClick={addCustomService}
                          className="w-full"
                        >
                          <Plus className="size-3.5" />
                          {copy.quickAddAction}
                        </ActionButton>
                      </div>
                    </Panel>

                    {selectedService ? (
                      <Panel light={isLight} className="overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div
                                className={cn(
                                  'text-[10px] uppercase tracking-[0.14em]',
                                  faintText(isLight),
                                )}
                              >
                                {copy.selected}
                              </div>

                              <div
                                className={cn(
                                  'mt-2 truncate text-[15px] font-semibold',
                                  pageText(isLight),
                                )}
                              >
                                {selectedService.name}
                              </div>

                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <MicroLabel light={isLight}>
                                  {formatCurrency(selectedService.price, locale)}
                                </MicroLabel>

                                <MicroLabel light={isLight}>
                                  {selectedService.duration} {locale === 'ru' ? 'мин' : 'min'}
                                </MicroLabel>
                              </div>
                            </div>

                            <ServiceStatus
                              service={selectedService}
                              labels={labels}
                              light={isLight}
                              accentColor={accentColor}
                              publicAccentColor={publicAccentColor}
                            />
                          </div>
                        </div>

                        <div className={cn('border-t p-3', borderTone(isLight))}>
                          <div className="grid gap-2">
                            <ActionButton
                              light={isLight}
                              active
                              onClick={() => setServiceEditorOpen(true)}
                              className="justify-between"
                            >
                              {copy.openEditor}
                              <ArrowRight className="size-3.5" />
                            </ActionButton>

                            <div className="grid grid-cols-2 gap-2">
                              <ActionButton
                                light={isLight}
                                onClick={() => moveService(selectedService.id, -1)}
                                disabled={selectedIndex <= 0}
                              >
                                <ArrowUp className="size-3.5" />
                                {copy.moveUp}
                              </ActionButton>

                              <ActionButton
                                light={isLight}
                                onClick={() => moveService(selectedService.id, 1)}
                                disabled={selectedIndex >= services.length - 1}
                              >
                                <ArrowDown className="size-3.5" />
                                {copy.moveDown}
                              </ActionButton>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <ActionButton
                                light={isLight}
                                onClick={() => duplicateService(selectedService)}
                              >
                                <Copy className="size-3.5" />
                                {copy.duplicate}
                              </ActionButton>

                              <ActionButton
                                light={isLight}
                                onClick={() => removeService(selectedService.id)}
                                disabled={services.length === 1}
                                className={
                                  isLight
                                    ? 'text-red-600 hover:text-red-700'
                                    : 'text-red-300 hover:text-red-200'
                                }
                              >
                                <Trash2 className="size-3.5" />
                                {copy.delete}
                              </ActionButton>
                            </div>
                          </div>
                        </div>
                      </Panel>
                    ) : null}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedService ? (
        <ServiceEditorDialog
          open={serviceEditorOpen}
          locale={locale}
          labels={labels}
          service={selectedService}
          selectedIndex={Math.max(0, selectedIndex)}
          totalServices={services.length}
          light={isLight}
          accentColor={accentColor}
          publicAccentColor={publicAccentColor}
          onUpdate={(patch) => updateService(selectedService.id, patch)}
          onMove={(direction) => moveService(selectedService.id, direction)}
          onDuplicate={() => duplicateService(selectedService)}
          onDelete={() => {
            removeService(selectedService.id);
            setServiceEditorOpen(false);
          }}
          onClose={() => setServiceEditorOpen(false)}
        />
      ) : null}
    </WorkspaceShell>
  );
}