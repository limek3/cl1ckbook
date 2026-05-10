'use client';

import { useMemo, useState } from 'react';
import { Clock, Edit3, Gift, Grid3x3, List, Plus, Sparkles, Star, Upload } from 'lucide-react';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbButton,
  KbCard,
  KbChip,
  KbDisplay,
  KbDivider,
  KbEyebrow,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

type Tone = 'lavender' | 'sage' | 'peach' | 'cream' | 'sky' | 'coral';

const TONE_CYCLE: Tone[] = ['peach', 'cream', 'sage', 'lavender', 'sky', 'coral'];

const TOP_BADGE: Record<string, string> = {
  popular: 'ТОП НЕДЕЛИ',
  new: 'НОВИНКА',
  hot: 'ПОПУЛЯРНО',
};

export default function ServicesPage() {
  const { dataset, ownedProfile, locale } = useOwnedWorkspaceData();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const services = dataset?.services ?? [];

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category));
    return [{ key: 'all', label: 'Все услуги', count: services.length }].concat(
      Array.from(set).map((cat) => ({ key: cat, label: cat, count: services.filter((s) => s.category === cat).length })),
    );
  }, [services]);

  const filtered = activeCategory === 'all' ? services : services.filter((s) => s.category === activeCategory);

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <KbEyebrow>Каталог услуг вашего салона</KbEyebrow>
              <KbDisplay level={1} className="mt-3">Услуги</KbDisplay>
              <p className="mt-2 max-w-md text-[14px] text-[var(--kb-text-secondary)]">
                Создавайте, редактируйте и управляйте прайсом.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <KbButton variant="outline">
                <Upload size={14} /> Импорт услуг
              </KbButton>
              <KbButton variant="navy">
                <Plus size={14} /> Создать услугу
              </KbButton>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <KbChip
                key={cat.key}
                active={activeCategory === cat.key}
                onClick={() => setActiveCategory(cat.key)}
                count={cat.count}
              >
                {cat.label}
              </KbChip>
            ))}
            <KbChip className="opacity-50">+ Новая категория</KbChip>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <KbDisplay level={3}>{activeCategory === 'all' ? 'Все услуги' : activeCategory}</KbDisplay>
              <span className="text-[12px] text-[var(--kb-text-muted)]">{filtered.length} услуг</span>
            </div>
            <div className="flex items-center gap-1 rounded-[12px] border border-[var(--kb-border)] bg-white p-1">
              <button
                onClick={() => setView('grid')}
                className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${
                  view === 'grid' ? 'bg-[var(--kb-warm-surface)]' : ''
                }`}
              >
                <Grid3x3 size={14} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${
                  view === 'list' ? 'bg-[var(--kb-warm-surface)]' : ''
                }`}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          <div className={`mt-4 grid gap-4 ${view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filtered.map((service, idx) => {
              const tone = TONE_CYCLE[idx % TONE_CYCLE.length];
              const badge = idx === 0 ? TOP_BADGE.popular : idx === 1 ? TOP_BADGE.new : idx === 4 ? TOP_BADGE.hot : null;
              return (
                <article key={service.id} className="kb-card group flex flex-col overflow-hidden p-0">
                  <div className={`relative h-[120px] kb-bg-${tone}`}>
                    {badge && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--kb-coral)]">
                        <Star size={10} fill="currentColor" /> {badge}
                      </span>
                    )}
                    <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--kb-text-secondary)] opacity-0 transition group-hover:opacity-100">
                      <Edit3 size={12} />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-[15px] font-medium leading-tight text-[var(--kb-text)]">{service.name}</h3>
                    <p className="mt-1 line-clamp-2 text-[12px] text-[var(--kb-text-secondary)]">
                      {service.category} · {service.popularity}% популярность
                    </p>
                    <div className="mt-auto flex items-end justify-between pt-4">
                      <div>
                        <div className="text-[11px] text-[var(--kb-text-muted)]">
                          <Clock size={11} className="mr-1 inline" />
                          {service.duration} мин
                        </div>
                        <div className="kb-metric mt-1 text-[18px] text-[var(--kb-text)]">
                          {formatCurrency(service.price, locale)}
                        </div>
                      </div>
                      <span className="text-[11px] text-[var(--kb-text-muted)]">{service.bookings} брони</span>
                    </div>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && (
              <div className="kb-card col-span-full p-12 text-center text-[14px] text-[var(--kb-text-muted)]">
                В этой категории пока нет услуг
              </div>
            )}
          </div>
        </div>

        {/* Right: packages + add-ons + tools */}
        <div className="flex flex-col gap-4">
          <KbCard className="p-5">
            <div className="kb-eyebrow mb-3 flex items-center justify-between">
              <span>Пакеты услуг</span>
              <button className="normal-case tracking-normal text-[var(--kb-coral)]">+ Создать</button>
            </div>
            <div className="rounded-[18px] bg-gradient-to-br from-[#F5F8E9] to-[#E5F0DA] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[14px] font-medium">Зимнее «Сияние и уход»</div>
                  <div className="mt-1 text-[11px] text-[var(--kb-text-muted)]">Стрижка, уход и укладка</div>
                </div>
                <KbChip tone="confirmed">−15%</KbChip>
              </div>
              <div className="kb-metric mt-3 text-[22px] text-[var(--kb-text)]">
                {formatCurrency(7650, locale)}
              </div>
              <button className="mt-3 w-full rounded-[12px] bg-white py-2 text-[12px] font-medium hover:bg-[var(--kb-warm-surface)]">
                Добавить пакет
              </button>
            </div>
          </KbCard>

          <KbCard className="p-5">
            <div className="kb-eyebrow mb-3">Дополнительные услуги</div>
            <ul className="space-y-2 text-[13px]">
              {[
                { name: 'Укладка феном', price: 800 },
                { name: 'Глубокий уход', price: 1500 },
                { name: 'Состав витамина E', price: 200 },
                { name: 'Дизайн ногтей', price: 1200 },
              ].map((addon) => (
                <li key={addon.name} className="flex items-center justify-between rounded-[12px] bg-[var(--kb-warm-surface)] px-3 py-2">
                  <span>{addon.name}</span>
                  <span className="kb-metric text-[var(--kb-text-secondary)]">+{formatCurrency(addon.price, locale)}</span>
                </li>
              ))}
            </ul>
          </KbCard>

          <KbCard className="p-5">
            <KbEyebrow>Быстрое редактирование цен</KbEyebrow>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Поднимите цены на 5—10% по категории за пару кликов.
            </p>
            <KbButton variant="outline" className="mt-3 w-full">
              Открыть редактор цен
            </KbButton>
          </KbCard>

          <div className="kb-bg-coral-soft rounded-[22px] border border-[var(--kb-border)] p-5">
            <div className="flex items-center gap-2 text-[var(--kb-coral)]">
              <Sparkles size={14} />
              <KbEyebrow className="text-[var(--kb-coral)]">Привлекайте больше</KbEyebrow>
            </div>
            <h4 className="kb-display kb-h3 mt-2">Привлекайте больше клиентов</h4>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Запустите акцию — и заполните пустые слоты.
            </p>
            <KbButton variant="primary" className="mt-3 w-full">
              <Gift size={14} /> Создать акцию
            </KbButton>
          </div>
        </div>
      </div>
    </KbShell>
  );
}
