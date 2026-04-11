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
  PencilLine,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export default function ServicesPage() {
  const { hasHydrated, ownedProfile, dataset, locale } = useOwnedWorkspaceData();
  const [services, setServices, storageReady] = useWorkspaceSection<ServiceInsight[]>('services', dataset?.services ?? []);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [customServiceName, setCustomServiceName] = useState('');

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
        description: 'Теперь услуги можно не только смотреть, но и реально менять: порядок, цену, длительность, видимость и статус.',
        editorTitle: 'Редактор услуг',
        editorDescription: 'Перетаскивайте карточки, меняйте поля, скрывайте из публичной страницы и быстро собирайте порядок показа.',
        previewTitle: 'Как это видит клиент',
        previewDescription: 'Справа остаётся спокойный клиентский предпросмотр только для видимых услуг.',
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
        dragHint: 'Карточки можно перетаскивать мышкой.',
        quickAddTitle: 'Быстро добавить услугу',
        quickAddDescription: 'Выбирайте из готового списка или добавляйте своё название. Потом можно поправить цену и длительность.',
        quickAddPopular: 'Популярные варианты',
        quickAddCustom: 'Своя услуга',
        quickAddPlaceholder: 'Например: SPA-уход для рук',
        quickAddAction: 'Добавить свою',
        name: 'Название',
        categoryCustom: 'Своя категория',
      }
    : {
        title: 'Services',
        description: 'Services are now editable: order, price, duration, visibility, and status.',
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
  };

  const addCustomService = () => {
    const nextName = customServiceName.trim();
    if (!nextName) return;
    const nextService = createService(locale, services.length, nextName, ownedProfile.profession);
    setServices((current) => [...current, nextService]);
    setSelectedServiceId(nextService.id);
    setCustomServiceName('');
  };

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0];
  const selectedIndex = services.findIndex((service) => service.id === selectedService?.id);

  return (
    <WorkspaceShell>
      <div className="workspace-page workspace-page-wide space-y-5">
        <DashboardHeader
          badge={locale === 'ru' ? 'Настройки / услуги' : 'Settings / services'}
          title={labels.title}
          description={labels.description}
          actions={
            <Button size="sm" onClick={() => {
              const nextService = createService(locale, services.length, undefined, ownedProfile.profession);
              setServices((current) => [...current, nextService]);
              setSelectedServiceId(nextService.id);
            }}>
              <Plus className="size-4" />
              {labels.add}
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={locale === 'ru' ? 'Всего услуг' : 'Total services'} value={String(services.length)} icon={Package2} />
          <MetricCard label={locale === 'ru' ? 'Видимые на странице' : 'Visible on page'} value={String(visibleCount)} icon={Eye} />
          <MetricCard label={locale === 'ru' ? 'Доход с услуг' : 'Service revenue'} value={formatCurrency(totalRevenue, locale)} />
          <MetricCard label={locale === 'ru' ? 'Средняя цена' : 'Average price'} value={formatCurrency(averagePrice, locale)} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_286px]">
          <div className="space-y-5 xl:order-1">
            {selectedService ? (
              <SectionCard
                title={selectedService.name}
                description={locale === 'ru' ? 'Детальная настройка выбранной услуги.' : 'Detailed settings for the selected service.'}
                className="p-4"
                actions={
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => moveService(selectedService.id, -1)} disabled={selectedIndex <= 0}>
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => moveService(selectedService.id, 1)} disabled={selectedIndex === services.length - 1}>
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => duplicateService(selectedService)}>
                      <Copy className="size-4" />
                    </Button>
                    <Button type="button" size="icon-sm" variant="outline" onClick={() => removeService(selectedService.id)} disabled={services.length === 1}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                }
              >
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.78fr))]">
                  <Input
                    list="service-name-options"
                    value={selectedService.name}
                    onChange={(event) => updateService(selectedService.id, { name: event.target.value })}
                    placeholder={labels.name}
                    className="h-10"
                  />
                  <Input
                    type="number"
                    value={String(selectedService.price)}
                    onChange={(event) => updateService(selectedService.id, { price: Number(event.target.value) || 0 })}
                    placeholder={labels.price}
                    className="h-10"
                  />
                  <Input
                    type="number"
                    value={String(selectedService.duration)}
                    onChange={(event) => updateService(selectedService.id, { duration: Number(event.target.value) || 0 })}
                    placeholder={labels.duration}
                    className="h-10"
                  />
                  <Input
                    list="service-category-options"
                    value={selectedService.category}
                    onChange={(event) => updateService(selectedService.id, { category: event.target.value })}
                    placeholder={labels.categoryCustom}
                    className="h-10"
                  />
                  <Select value={selectedService.status} onValueChange={(value) => updateService(selectedService.id, { status: value as ServiceInsight['status'] })}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{labels.active}</SelectItem>
                      <SelectItem value="seasonal">{labels.seasonal}</SelectItem>
                      <SelectItem value="draft">{labels.draft}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3 grid gap-2.5 md:grid-cols-4">
                  <div className="rounded-[16px] border border-border/80 bg-accent/24 px-3 py-2.5">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.revenue}</div>
                    <div className="mt-1 text-[14px] font-medium text-foreground">{formatCurrency(selectedService.revenue, locale)}</div>
                  </div>
                  <div className="rounded-[16px] border border-border/80 bg-accent/24 px-3 py-2.5">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.popularity}</div>
                    <Input
                      type="number"
                      value={String(selectedService.popularity)}
                      onChange={(event) => updateService(selectedService.id, { popularity: Number(event.target.value) || 0 })}
                      className="mt-2 h-9 bg-background/85"
                    />
                  </div>
                  <div className="rounded-[16px] border border-border/80 bg-accent/24 px-3 py-2.5">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.bookings}</div>
                    <Input
                      type="number"
                      value={String(selectedService.bookings)}
                      onChange={(event) => updateService(selectedService.id, { bookings: Number(event.target.value) || 0 })}
                      className="mt-2 h-9 bg-background/85"
                    />
                  </div>
                  <div className="rounded-[16px] border border-border/80 bg-accent/24 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{labels.visibleOnPage}</div>
                      <Switch
                        checked={selectedService.visible}
                        onCheckedChange={(checked) => updateService(selectedService.id, { visible: checked })}
                      />
                    </div>
                    <div className="mt-2 text-[13px] font-medium text-foreground">
                      {selectedService.visible ? (
                        <span className="inline-flex items-center gap-2">
                          <Eye className="size-4 text-primary" />
                          {labels.visible}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                          <EyeOff className="size-4" />
                          {labels.hidden}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            <SectionCard title={labels.previewTitle} description={labels.previewDescription} className="p-4">
              <div className="rounded-[18px] border border-border bg-background p-3.5">
                <div className="text-[15px] font-semibold text-foreground">{ownedProfile.name}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{ownedProfile.profession}</div>
                <div className="mt-3 grid gap-2">
                  {previewServices.length > 0 ? previewServices.map((service) => (
                    <div key={service.id} className="rounded-[15px] border border-border bg-card px-3.5 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium text-foreground">{service.name}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{service.duration} {locale === 'ru' ? 'минут' : 'minutes'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-medium text-foreground">{formatCurrency(service.price, locale)}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{service.category}</div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-[15px] border border-dashed border-border bg-card/70 px-4 py-8 text-center text-[13px] text-muted-foreground">
                      {locale === 'ru' ? 'Нет услуг, видимых на публичной странице.' : 'No services are visible on the public page.'}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title={labels.editorTitle}
            description={`${labels.editorDescription} ${labels.dragHint}`}
            className="xl:sticky xl:top-4 xl:self-start xl:order-2 p-4"
          >
            <div className="max-h-[calc(100vh-9rem)] space-y-3 overflow-y-auto pr-1">
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
                      onClick={() => setSelectedServiceId(service.id)}
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
                        'w-full rounded-[16px] border px-3.5 py-2.5 text-left transition',
                        active ? 'border-primary/24 bg-primary/8 shadow-[var(--shadow-soft)]' : 'border-border/80 bg-card/74 hover:bg-accent/18',
                        draggedId === service.id && 'border-primary/30 bg-primary/5',
                      )}
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
      </div>
    </WorkspaceShell>
  );
}
