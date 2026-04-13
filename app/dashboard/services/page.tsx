'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Package2,
  Plus,
  Trash2,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shared/workspace-shell';
import { DashboardHeader, MetricCard, SectionCard } from '@/components/dashboard/workspace-ui';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { useWorkspaceSection } from '@/hooks/use-workspace-section';
import { type ServiceInsight, formatCurrency } from '@/lib/master-workspace';
import { getServiceSuggestions, getSuggestedCategory, getServiceCategoryOptions } from '@/lib/service-presets';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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

function arrayMove<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function createService(
  locale: 'ru' | 'en',
  index: number,
  name?: string,
  profession?: string,
): ServiceInsight {
  const serviceName = name?.trim() || (locale === 'ru' ? `Новая услуга ${index + 1}` : `New service ${index + 1}`);

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
};

function ServiceEditorPanel({
  locale,
  labels,
  service,
  selectedIndex,
  totalServices,
  isMobile,
  onUpdate,
  onMove,
  onDuplicate,
  onDelete,
}: {
  locale: 'ru' | 'en';
  labels: ServiceEditorLabels;
  service: ServiceInsight;
  selectedIndex: number;
  totalServices: number;
  isMobile: boolean;
  onUpdate: (patch: Partial<ServiceInsight>) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const previewName = service.name || (locale === 'ru' ? 'Название услуги' : 'Service name');
  const previewCategory = service.category || labels.categoryCustom;

  return (
    <div className={cn('workspace-editor-shell workspace-editor-shell-service', isMobile && 'workspace-editor-shell-mobile')}>
      {isMobile ? <div className="workspace-editor-sheet-handle" aria-hidden="true" /> : null}

      <div className="workspace-editor-head workspace-editor-head-service">
        <div className="workspace-editor-kicker">{labels.editorTitle}</div>
        <div className={cn('workspace-editor-head-row', isMobile && 'gap-3')}>
          <div className="min-w-0 flex-1">
            <div className="workspace-editor-headline">{previewName}</div>
            <div className="workspace-editor-subtitle">{labels.editorDescription}</div>
          </div>

          <div className="workspace-editor-visibility">
            <div className="workspace-editor-visibility-label">{labels.visibleOnPage}</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="workspace-editor-visibility-value">
                {service.visible ? labels.visible : labels.hidden}
              </span>
              <Switch checked={service.visible} onCheckedChange={(checked) => onUpdate({ visible: checked })} />
            </div>
          </div>
        </div>

        <div className="workspace-editor-preview workspace-editor-preview-service">
          <div className="min-w-0">
            <div className="workspace-editor-preview-title">{previewName}</div>
            <div className="workspace-editor-preview-meta">
              <span className="chip-muted text-[10px]">{formatCurrency(service.price, locale)}</span>
              <span className="chip-muted text-[10px]">
                {service.duration} {locale === 'ru' ? 'мин' : 'min'}
              </span>
              <span className="chip-muted text-[10px]">{previewCategory}</span>
            </div>
          </div>
          <div className="workspace-editor-preview-side">{formatCurrency(service.price, locale)}</div>
        </div>
      </div>

      <div className="workspace-editor-scroll">
        <div className={cn('workspace-editor-grid service-editor-grid', !isMobile && 'md:grid-cols-2')}>
          <div className="editor-field-card service-editor-field service-editor-field-name">
            <div className="editor-field-label">{labels.name}</div>
            <Input
              list="service-name-options"
              value={service.name}
              onChange={(event) => onUpdate({ name: event.target.value })}
              placeholder={labels.name}
              className="mt-2 h-10 bg-background/90"
            />
          </div>

          <div className="editor-field-card service-editor-field service-editor-field-category">
            <div className="editor-field-label">{labels.categoryCustom}</div>
            <Input
              list="service-category-options"
              value={service.category}
              onChange={(event) => onUpdate({ category: event.target.value })}
              placeholder={labels.categoryCustom}
              className="mt-2 h-10 bg-background/90"
            />
          </div>

          <div className="editor-field-card service-editor-field service-editor-field-price">
            <div className="editor-field-label">{labels.price}</div>
            <Input
              type="number"
              value={String(service.price)}
              onChange={(event) => onUpdate({ price: Number(event.target.value) || 0 })}
              placeholder={labels.price}
              className="mt-2 h-10 bg-background/90"
            />
          </div>

          <div className="editor-field-card service-editor-field service-editor-field-duration">
            <div className="editor-field-label">{labels.duration}</div>
            <Input
              type="number"
              value={String(service.duration)}
              onChange={(event) => onUpdate({ duration: Number(event.target.value) || 0 })}
              placeholder={labels.duration}
              className="mt-2 h-10 bg-background/90"
            />
          </div>
        </div>
      </div>

      <div className="workspace-editor-footer workspace-editor-footer-service">
        <div className="workspace-editor-footer-group">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() => onMove(-1)}
            disabled={selectedIndex <= 0}
            aria-label={labels.moveUp}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() => onMove(1)}
            disabled={selectedIndex === totalServices - 1}
            aria-label={labels.moveDown}
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="size-4" />
            {labels.duplicate}
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="workspace-editor-delete-button"
          onClick={onDelete}
          disabled={totalServices === 1}
        >
          <Trash2 className="size-4" />
          {labels.delete}
        </Button>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const isMobile = useMobile();
  const [services, setServices, storageReady] = useWorkspaceSection<ServiceInsight[]>('services', dataset?.services ?? []);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [customServiceName, setCustomServiceName] = useState('');
  const [serviceEditorOpen, setServiceEditorOpen] = useState(false);

  useEffect(() => {
    if (!services.length) {
      setSelectedServiceId(null);
      return;
    }

    if (!selectedServiceId || !services.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(services[0].id);
    }
  }, [selectedServiceId, services]);

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

  const totalRevenue = services.reduce((total, service) => total + service.revenue, 0);
  const averagePrice = Math.round(services.reduce((total, service) => total + service.price, 0) / Math.max(services.length, 1));
  const visibleCount = services.filter((service) => service.visible).length;
  const previewServices = services.filter((service) => service.visible);
  const suggestedServices = getServiceSuggestions(ownedProfile.profession, locale).filter(
    (item) => !services.some((service) => service.name.trim().toLowerCase() === item.trim().toLowerCase()),
  );
  const categoryOptions = getServiceCategoryOptions(locale);

  const labels = locale === 'ru'
    ? {
        title: 'Услуги',
        description: 'Услуги, цены и порядок показа.',
        editorTitle: 'Редактор услуг',
        editorDescription: 'Порядок, цена, длительность и видимость.',
        previewTitle: 'Как это видит клиент',
        previewDescription: 'Предпросмотр видимых услуг.',
        add: 'Добавить услугу',
        duplicate: 'Дублировать',
        delete: 'Удалить',
        moveUp: 'Выше',
        moveDown: 'Ниже',
        visible: 'Видна',
        hidden: 'Скрыта',
        price: 'Цена',
        duration: 'Длительность',
        bookings: 'Записей',
        revenue: 'Доход',
        popularity: 'Популярность',
        category: 'Категория',
        status: 'Статус',
        active: 'Активна',
        seasonal: 'Сезонная',
        draft: 'Черновик',
        visibleOnPage: 'Показывать на публичной странице',
        dragHint: 'Карточки можно перетаскивать.',
        quickAddTitle: 'Быстро добавить услугу',
        quickAddDescription: 'Готовый список или своя услуга. Цена и длительность редактируются.',
        quickAddPopular: 'Популярные варианты',
        quickAddCustom: 'Своя услуга',
        quickAddPlaceholder: 'Например: SPA-уход для рук',
        quickAddAction: 'Добавить свою',
        name: 'Название',
        categoryCustom: 'Своя категория',
      }
    : {
        title: 'Services',
        description: 'Services are now editable: order, price, duration, and visibility.',
        editorTitle: 'Service editor',
        editorDescription: 'Drag cards, change fields, hide from the public page, and tune the display order.',
        previewTitle: 'How clients see it',
        previewDescription: 'A quiet client-side preview for visible services.',
        add: 'Add service',
        duplicate: 'Duplicate',
        delete: 'Delete',
        moveUp: 'Move up',
        moveDown: 'Move down',
        visible: 'Visible',
        hidden: 'Hidden',
        price: 'Price',
        duration: 'Duration',
        bookings: 'Bookings',
        revenue: 'Revenue',
        popularity: 'Popularity',
        category: 'Category',
        status: 'Status',
        active: 'Active',
        seasonal: 'Seasonal',
        draft: 'Draft',
        visibleOnPage: 'Show on public page',
        dragHint: 'Cards can be reordered by drag and drop.',
        quickAddTitle: 'Quick add',
        quickAddDescription: 'Choose from the ready-made list or add your own service name. You can adjust price and duration right after.',
        quickAddPopular: 'Popular options',
        quickAddCustom: 'Custom service',
        quickAddPlaceholder: 'For example: SPA hand care',
        quickAddAction: 'Add custom',
        name: 'Name',
        categoryCustom: 'Custom category',
      };

  const updateService = (id: string, patch: Partial<ServiceInsight>) => {
    setServices((current) => current.map((service) => (service.id === id ? { ...service, ...patch } : service)));
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
      const copy: ServiceInsight = {
        ...service,
        id: `copy-${crypto.randomUUID()}`,
        name: `${service.name} ${locale === 'ru' ? 'копия' : 'copy'}`,
      };
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const removeService = (id: string) => {
    setServices((current) => current.filter((service) => service.id !== id));
  };

  const addServiceFromPreset = (name: string) => {
    const nextService = createService(locale, services.length, name, ownedProfile.profession);
    setServices((current) => [...current, nextService]);
    setSelectedServiceId(nextService.id);
    setServiceEditorOpen(true);
  };

  const addCustomService = () => {
    const nextName = customServiceName.trim();
    if (!nextName) return;
    const nextService = createService(locale, services.length, nextName, ownedProfile.profession);
    setServices((current) => [...current, nextService]);
    setSelectedServiceId(nextService.id);
    setServiceEditorOpen(true);
    setCustomServiceName('');
  };

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];
  const selectedIndex = services.findIndex((service) => service.id === selectedService?.id);

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide workspace-page-services space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Настройки / услуги' : 'Settings / services'}
          title={labels.title}
          description={labels.description}
          actions={
            <Button size="sm" onClick={() => {
              const nextService = createService(locale, services.length, undefined, ownedProfile.profession);
              setServices((current) => [...current, nextService]);
              setSelectedServiceId(nextService.id);
              setServiceEditorOpen(true);
            }}>
              <Plus className="size-4" />
              {labels.add}
            </Button>
          }
        />

        <div className="dashboard-kpi-grid dashboard-mobile-stats-grid services-mobile-stats-grid services-mobile-kpi-grid grid grid-cols-2 gap-3">
          <MetricCard label={locale === 'ru' ? 'Всего услуг' : 'Total services'} value={String(services.length)} icon={Package2} />
          <MetricCard label={locale === 'ru' ? 'Видимые на странице' : 'Visible on page'} value={String(visibleCount)} icon={Eye} />
          <MetricCard label={locale === 'ru' ? 'Доход с услуг' : 'Service revenue'} value={formatCurrency(totalRevenue, locale)} />
          <MetricCard label={locale === 'ru' ? 'Средняя цена' : 'Average price'} value={formatCurrency(averagePrice, locale)} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_286px]">
          <div className="space-y-5">
            <SectionCard title={labels.previewTitle} description={labels.previewDescription} className="p-4">
              <div className="rounded-[18px] border border-border bg-background p-3.5">
                <div className="text-[15px] font-semibold text-foreground">{ownedProfile.name}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{ownedProfile.profession}</div>
                <div className={cn("mt-3 grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-1")}>
                  {services.length > 0 ? services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceId(service.id);
                        setServiceEditorOpen(true);
                      }}
                      className="selection-tone-card w-full rounded-[15px] px-3.5 py-3 text-left"
                      data-active={selectedService?.id === service.id ? 'true' : 'false'}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium text-foreground">{service.name}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <span className="chip-muted text-[10px]">{formatCurrency(service.price, locale)}</span>
                            <span className="chip-muted text-[10px]">{service.duration} {locale === 'ru' ? 'мин' : 'min'}</span>
                            <span className="chip-muted text-[10px]">{service.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-semibold text-foreground">{formatCurrency(service.price, locale)}</div>
                          <div className="mt-1 text-[10.5px] text-muted-foreground">
                            {service.visible ? labels.visible : labels.hidden}
                          </div>
                        </div>
                      </div>
                    </button>
                  )) : (
                    <div className="rounded-[15px] border border-dashed border-border bg-card/70 px-4 py-8 text-center text-[13px] text-muted-foreground">
                      {locale === 'ru' ? 'Добавьте первую услугу.' : 'Add the first service.'}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title={labels.editorTitle}
            description={`${labels.editorDescription} ${labels.dragHint}`}
            className={cn("p-4", !isMobile && "xl:sticky xl:top-4 xl:self-start")}
          >
            <div className={cn("space-y-3 pr-1", !isMobile && "max-h-[calc(100vh-9rem)] overflow-y-auto")}>
              <div className="rounded-[16px] border border-border/80 bg-accent/18 p-3.5">
                <div className="text-[14px] font-semibold text-foreground">{labels.quickAddTitle}</div>
                <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{labels.quickAddDescription}</div>

                <div className="mt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {labels.quickAddPopular}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {suggestedServices.slice(0, 6).map((service) => (
                    <Button
                      key={service}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full px-3 text-[12px]"
                      onClick={() => addServiceFromPreset(service)}
                    >
                      <Plus className="size-3.5" />
                      {service}
                    </Button>
                  ))}
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <Input
                    value={customServiceName}
                    onChange={(event) => setCustomServiceName(event.target.value)}
                    placeholder={labels.quickAddPlaceholder}
                    className="h-9"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addCustomService();
                      }
                    }}
                  />
                  <Button type="button" className="h-9 rounded-full" onClick={addCustomService}>
                    <Plus className="size-4" />
                    {labels.quickAddAction}
                  </Button>
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

              <div className="space-y-2">
                {services.map((service, index) => {
                  const active = selectedService?.id === service.id;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      draggable
                      onClick={() => {
                        setSelectedServiceId(service.id);
                        setServiceEditorOpen(true);
                      }}
                      onDragStart={() => setDraggedId(service.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (!draggedId || draggedId === service.id) return;
                        setServices((current) => {
                          const from = current.findIndex((item) => item.id === draggedId);
                          const to = current.findIndex((item) => item.id === service.id);
                          return arrayMove(current, from, to);
                        });
                        setDraggedId(null);
                      }}
                      onDragEnd={() => setDraggedId(null)}
                      className={cn(
                        'selection-tone-card service-list-card w-full rounded-[16px] px-3.5 py-2.5 text-left',
                        draggedId === service.id && 'border-primary/30 bg-primary/5',
                      )}
                      data-active={active ? 'true' : 'false'}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">{index + 1}</span>
                            <div className="truncate text-[13px] font-medium text-foreground">{service.name}</div>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <span className="chip-muted text-[10px]">{formatCurrency(service.price, locale)}</span>
                            <span className="chip-muted text-[10px]">{service.duration} {locale === 'ru' ? 'мин' : 'min'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {service.visible ? <Eye className="size-3.5 text-primary" /> : <EyeOff className="size-3.5 text-muted-foreground" />}
                          <GripVertical className="size-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        </div>

        {isMobile ? (
          <Sheet open={serviceEditorOpen && !!selectedService} onOpenChange={(open) => setServiceEditorOpen(open)}>
            {selectedService ? (
              <SheetContent side="bottom" className="service-editor-sheet">
                <SheetHeader className="sr-only">
                  <SheetTitle>{selectedService.name}</SheetTitle>
                  <SheetDescription>{labels.editorDescription}</SheetDescription>
                </SheetHeader>
                <ServiceEditorPanel
                  locale={locale}
                  labels={labels}
                  service={selectedService}
                  selectedIndex={selectedIndex}
                  totalServices={services.length}
                  isMobile
                  onUpdate={(patch) => updateService(selectedService.id, patch)}
                  onMove={(direction) => moveService(selectedService.id, direction)}
                  onDuplicate={() => duplicateService(selectedService)}
                  onDelete={() => {
                    removeService(selectedService.id);
                    setServiceEditorOpen(false);
                  }}
                />
              </SheetContent>
            ) : null}
          </Sheet>
        ) : (
          <Dialog open={serviceEditorOpen && !!selectedService} onOpenChange={(open) => setServiceEditorOpen(open)}>
            {selectedService ? (
              <DialogContent className="service-editor-dialog">
                <DialogHeader className="sr-only">
                  <DialogTitle>{selectedService.name}</DialogTitle>
                  <DialogDescription>{labels.editorDescription}</DialogDescription>
                </DialogHeader>
                <ServiceEditorPanel
                  locale={locale}
                  labels={labels}
                  service={selectedService}
                  selectedIndex={selectedIndex}
                  totalServices={services.length}
                  isMobile={false}
                  onUpdate={(patch) => updateService(selectedService.id, patch)}
                  onMove={(direction) => moveService(selectedService.id, direction)}
                  onDuplicate={() => duplicateService(selectedService)}
                  onDelete={() => {
                    removeService(selectedService.id);
                    setServiceEditorOpen(false);
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
