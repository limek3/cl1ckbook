'use client';

import { useState } from 'react';
import { Bell, Camera, Lock, MessageSquare, ShieldCheck, Sparkles, Users } from 'lucide-react';

import { KbShell } from '@/components/klikbook/shell';
import {
  KbAvatar,
  KbButton,
  KbCard,
  KbChip,
  KbDisplay,
  KbDivider,
  KbEyebrow,
  KbIconTile,
} from '@/components/klikbook/primitives';
import { useOwnedWorkspaceData } from '@/hooks/use-owned-workspace-data';
import { formatCurrency } from '@/lib/master-workspace';

const SECTIONS = [
  { key: 'profile', label: 'Личный профиль', icon: Users },
  { key: 'work', label: 'Часы работы и расписание', icon: Sparkles },
  { key: 'notify', label: 'Уведомления', icon: Bell },
  { key: 'team', label: 'Сотрудники и команда', icon: Users },
  { key: 'booking', label: 'Онлайн-запись', icon: MessageSquare },
  { key: 'security', label: 'Безопасность', icon: ShieldCheck },
];

export default function SettingsPage() {
  const { ownedProfile, locale } = useOwnedWorkspaceData();
  const [section, setSection] = useState('profile');
  const [notify, setNotify] = useState({ pre: true, postpone: true, sms: false, system: true, status: false, cancel: true });

  return (
    <KbShell
      user={{ name: ownedProfile?.name ?? 'Гость', subtitle: ownedProfile?.profession, avatar: ownedProfile?.avatar ?? null }}
      dateRange="19 — 25 мая"
      notificationsCount={3}
    >
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside>
          <KbDisplay level={2}>Настройки</KbDisplay>
          <ul className="mt-6 space-y-1.5">
            {SECTIONS.map((s) => (
              <li key={s.key}>
                <button
                  onClick={() => setSection(s.key)}
                  className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-[13px] transition ${
                    section === s.key
                      ? 'bg-white text-[var(--kb-text)] shadow-[var(--kb-shadow-card)]'
                      : 'text-[var(--kb-text-secondary)] hover:bg-[var(--kb-warm-surface)]'
                  }`}
                >
                  <s.icon size={15} />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="kb-bg-coral-soft mt-6 rounded-[20px] border border-[var(--kb-border)] p-5">
            <KbIconTile tone="coral" size={36}>
              <Sparkles size={16} />
            </KbIconTile>
            <div className="mt-3 text-[14px] font-medium">Нужна помощь с настройкой?</div>
            <p className="mt-1 text-[12px] text-[var(--kb-text-secondary)]">
              Мы поможем подключить онлайн-запись и команду.
            </p>
            <button className="mt-3 text-[12px] font-medium text-[var(--kb-coral)]">Связаться с поддержкой →</button>
          </div>
        </aside>

        <div className="flex flex-col gap-4">
          <KbCard className="p-6">
            <div className="flex items-center justify-between">
              <KbEyebrow>Профиль и салон</KbEyebrow>
              <KbButton variant="navy" size="sm">Сохранить изменения</KbButton>
            </div>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Основная информация о владельце и салоне
            </p>

            <KbDivider className="my-5" />

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <KbEyebrow>Фото профиля</KbEyebrow>
                <div className="mt-3 flex items-center gap-4">
                  <KbAvatar src={ownedProfile?.avatar ?? null} alt={ownedProfile?.name ?? 'Профиль'} fallback={ownedProfile?.name} size={72} />
                  <div>
                    <div className="text-[14px] font-medium">{ownedProfile?.name ?? 'Алина Иванова'}</div>
                    <div className="mt-1 text-[12px] text-[var(--kb-text-muted)]">{ownedProfile?.profession ?? 'Владелец'}</div>
                    <div className="mt-1 text-[12px] text-[var(--kb-text-muted)]">{ownedProfile?.phone ?? '+7 999 123-45-67'}</div>
                    <KbButton variant="outline" size="sm" className="mt-2">
                      <Camera size={12} /> Изменить фото
                    </KbButton>
                  </div>
                </div>
              </div>

              <div>
                <KbEyebrow>Логотип салона</KbEyebrow>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-[var(--kb-cream)] text-[var(--kb-cream-accent)]">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium">Studio Shine</div>
                    <div className="mt-1 text-[12px] text-[var(--kb-text-muted)]">Премиум салон</div>
                    <div className="mt-1 text-[12px] text-[var(--kb-text-muted)]">studio@shine.ru</div>
                    <KbButton variant="outline" size="sm" className="mt-2">Загрузить логотип</KbButton>
                  </div>
                </div>
              </div>
            </div>
          </KbCard>

          <KbCard className="p-6">
            <KbEyebrow>Информация о салоне</KbEyebrow>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Контактная информация и адрес
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <FormField label="Название салона" value="Studio Shine" />
              <FormField label="Телефон" value={ownedProfile?.phone ?? '+7 999 123-45-67'} />
              <FormField label="Email салона" value="hello@studioshine.ru" />
              <FormField label="Адрес" value="г. Москва, ул. Большая Дмитровская, 14" />
              <FormField label="Часовой пояс" value="(GMT+3) Москва" />
            </div>
          </KbCard>

          <KbCard className="p-6">
            <KbEyebrow>График работы</KbEyebrow>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Основное время работы и приёма клиентов
            </p>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, i) => (
                <div key={d} className={`rounded-[14px] border border-[var(--kb-border)] p-3 text-center ${i === 6 ? 'bg-[var(--kb-warm-surface)] opacity-60' : 'bg-white'}`}>
                  <div className="kb-eyebrow">{d}</div>
                  <div className="kb-metric mt-2 text-[13px]">{i === 6 ? 'выходной' : '09 — 21'}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px]">
              <span className="text-[var(--kb-text-secondary)]">Контроль графика</span>
              <ToggleSwitch checked />
              <span className="ml-4 text-[var(--kb-text-secondary)]">Обед</span>
              <ToggleSwitch checked />
              <span className="ml-4 text-[var(--kb-text-secondary)]">14:00 — 15:00</span>
            </div>
          </KbCard>

          <KbCard className="p-6">
            <KbEyebrow>Уведомления</KbEyebrow>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Настройка push, email и SMS-уведомлений мастера и клиента.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <NotifyRow label="Подтверждение записи" enabled={notify.pre} onChange={(v) => setNotify({ ...notify, pre: v })} />
              <NotifyRow label="Системные уведомления" enabled={notify.system} onChange={(v) => setNotify({ ...notify, system: v })} />
              <NotifyRow label="Напоминание за 24 часа" enabled={notify.postpone} onChange={(v) => setNotify({ ...notify, postpone: v })} />
              <NotifyRow label="Smart-чекин" enabled={notify.status} onChange={(v) => setNotify({ ...notify, status: v })} />
              <NotifyRow label="SMS клиенту" enabled={notify.sms} onChange={(v) => setNotify({ ...notify, sms: v })} />
              <NotifyRow label="Отмена и переносы" enabled={notify.cancel} onChange={(v) => setNotify({ ...notify, cancel: v })} />
            </div>
          </KbCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <KbCard className="p-5">
            <div className="flex items-center justify-between">
              <KbEyebrow>Ваш тариф</KbEyebrow>
              <KbChip tone="completed">Профессиональный</KbChip>
            </div>
            <KbDisplay level={3} className="mt-3">Профессиональный</KbDisplay>
            <p className="mt-1 text-[12px] text-[var(--kb-text-muted)]">Активен до 26 июня 2025</p>
            <div className="kb-metric mt-3 text-[28px]">{formatCurrency(4900, locale)} <span className="text-[12px] text-[var(--kb-text-muted)]">/ мес</span></div>
            <KbButton variant="primary" className="mt-3 w-full">Управление тарифом</KbButton>
          </KbCard>

          <KbCard className="p-5">
            <KbEyebrow>Использование в этом периоде</KbEyebrow>
            <ul className="mt-4 space-y-3 text-[13px]">
              <UsageRow label="Записи" used={220} total={300} />
              <UsageRow label="Клиенты" used={847} total={1000} />
              <UsageRow label="SMS-уведомления" used={158} total={500} />
              <UsageRow label="Сотрудники" used={4} total={10} />
            </ul>
          </KbCard>

          <KbCard tone="soft" className="p-5">
            <KbEyebrow>Все ваши данные</KbEyebrow>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Резервная копия: 18 мая 04:00. Регулярные снимки выполняются автоматически.
            </p>
            <KbButton variant="outline" className="mt-3 w-full">Создать копию</KbButton>
          </KbCard>

          <KbCard className="p-5">
            <KbEyebrow>Экспорт данных</KbEyebrow>
            <p className="mt-2 text-[12px] text-[var(--kb-text-secondary)]">
              Скачайте все ваши данные одним архивом.
            </p>
            <KbButton variant="outline" className="mt-3 w-full">
              <Lock size={12} /> Экспортировать
            </KbButton>
          </KbCard>
        </div>
      </div>
    </KbShell>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <label>
      <span className="kb-eyebrow mb-2 block">{label}</span>
      <input className="kb-input" defaultValue={value} />
    </label>
  );
}

function ToggleSwitch({ checked = false }: { checked?: boolean }) {
  const [on, setOn] = useState(checked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative h-[22px] w-[42px] rounded-full transition ${on ? 'bg-[var(--kb-coral)]' : 'bg-[var(--kb-border)]'}`}
    >
      <span
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white transition ${on ? 'left-[22px]' : 'left-[2px]'}`}
      />
    </button>
  );
}

function NotifyRow({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-[var(--kb-warm-surface)] px-3 py-2.5 text-[12px]">
      <span>{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative h-[22px] w-[42px] rounded-full transition ${enabled ? 'bg-[var(--kb-coral)]' : 'bg-[var(--kb-border)]'}`}
      >
        <span className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white transition ${enabled ? 'left-[22px]' : 'left-[2px]'}`} />
      </button>
    </div>
  );
}

function UsageRow({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <li>
      <div className="flex items-center justify-between text-[12px]">
        <span>{label}</span>
        <span className="text-[var(--kb-text-muted)]">{used} / {total}</span>
      </div>
      <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--kb-warm-surface)]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${pct}%`, background: pct > 80 ? 'var(--kb-coral)' : 'var(--kb-sage-accent)' }}
        />
      </div>
    </li>
  );
}
