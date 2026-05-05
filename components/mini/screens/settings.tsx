'use client';

import { type ReactNode, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, FieldLabel, SectionTitle, Divider, Avatar, Toggle, Icon, NeutralBtn, ScreenHeader,
} from '../primitives/atoms';
import { useMiniData } from '@/hooks/use-mini-data';

// ─── Profile ────────────────────────────────
export function ProfileScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const { MASTER } = useMiniData();
  return (
    <div>
      <ScreenHeader title="Профиль" subtitle="Что видят клиенты на странице записи." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar name={MASTER.name} size={64} radius={16} />
            <div style={{ flex: 1 }}>
              <NeutralBtn icon="upload" full>Заменить аватар</NeutralBtn>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 8 }}>Рекомендуем 400×400, JPG / PNG</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <Icon name="star" size={14} color={T.text2} />
            <span style={{ fontSize: 13, color: T.text }}>{MASTER.rating}</span>
            <span style={{ fontSize: 12, color: T.text3 }}>· 31 отзыв</span>
            <span style={{ fontSize: 11, color: T.text3, marginLeft: 'auto' }}>read-only</span>
          </div>
        </Card>

        <Field label="Имя" value={MASTER.name} />
        <Field label="Профессия" value={MASTER.service} />
        <Field label="Город" value={MASTER.city} />
        <Field label="Телефон" value={MASTER.phone} />
        <Field label="Био" value={MASTER.bio} multiline />

        <SectionTitle title="Социальные сети" subtitle="Покажем на публичной странице." />
        <Card padded={false}>
          <SocialRow icon="send" channel="Telegram" value={MASTER.socials.tg} />
          <Divider />
          <SocialRow icon="message-square" channel="ВКонтакте" value={MASTER.socials.vk} />
          <Divider />
          <SocialRow icon="instagram" channel="Instagram" value={MASTER.socials.ig} />
        </Card>

        <NeutralBtn icon="check" full style={{ marginTop: 8, padding: '14px 16px' }}>Сохранить</NeutralBtn>
      </div>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: '12px 14px', boxShadow: T.cardShadow,
    }}>
      <FieldLabel style={{ fontSize: 9 }}>{label}</FieldLabel>
      {multiline ? (
        <textarea defaultValue={value} rows={3}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, fontFamily: 'inherit', resize: 'none', marginTop: 6, lineHeight: 1.5, padding: 0 }} />
      ) : (
        <input defaultValue={value}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, fontFamily: 'inherit', marginTop: 6, padding: 0 }} />
      )}
    </div>
  );
}

function SocialRow({ icon, channel, value }: { icon: string; channel: string; value: string }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Icon name={icon} size={16} color={T.text2} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: T.text }}>{channel}</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{value || 'не указано'}</div>
      </div>
      <Icon name="chevron-right" size={14} color={T.text3} />
    </div>
  );
}

// ─── Appearance ────────────────────────────
export function AppearanceScreen({ back }: { back: () => void }) {
  const { T, mode, set } = useTheme();
  const [accent, setAccent] = useState('blue');
  const [radius, setRadius] = useState('medium');

  const accents = [
    { id: 'blue',   color: '#127dfe' },
    { id: 'green',  color: '#16a34a' },
    { id: 'purple', color: '#8b5cf6' },
    { id: 'pink',   color: '#ec4899' },
    { id: 'orange', color: '#f97316' },
  ];

  return (
    <div>
      <ScreenHeader title="Внешний вид" subtitle="Тема, акценты, скругления." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <FieldLabel>Превью</FieldLabel>
          <Card style={{ marginTop: 10 }}>
            <FieldLabel>Персональная ссылка</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ fontSize: 26, fontWeight: 600, color: T.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>/m/admin</div>
              <div style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2 }}>
                <Icon name="copy" size={14} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
              <span style={{ fontSize: 12, color: T.text2 }}>Запланирована</span>
            </div>
          </Card>
        </div>

        <div>
          <SectionTitle title="Тема" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ThemeCard active={mode === 'dark'} onClick={() => set('dark')} themeMode="dark" label="Тёмная" />
            <ThemeCard active={mode === 'light'} onClick={() => set('light')} themeMode="light" label="Светлая" />
          </div>
        </div>

        <div>
          <SectionTitle title="Акцент" subtitle="Используется только в индикаторах." />
          <Card>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'space-between' }}>
              {accents.map((a) => (
                <button key={a.id} onClick={() => setAccent(a.id)} style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: a.color, border: 'none', cursor: 'pointer', padding: 0,
                  position: 'relative',
                  boxShadow: accent === a.id ? `0 0 0 2px ${T.bg}, 0 0 0 4px ${a.color}` : 'none',
                }} />
              ))}
            </div>
          </Card>
        </div>

        <div>
          <SectionTitle title="Скругления" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { id: 'sharp', label: 'Острые', r: 4 },
              { id: 'medium', label: 'Средние', r: 12 },
              { id: 'soft', label: 'Мягкие', r: 20 },
            ].map((o) => (
              <button key={o.id} onClick={() => setRadius(o.id)} style={{
                background: T.card, border: `1px solid ${radius === o.id ? T.borderStrong : T.border}`,
                borderRadius: 12, padding: 14, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                boxShadow: T.cardShadow,
              }}>
                <div style={{ width: 36, height: 24, background: T.cardElev, border: `1px solid ${T.border}`, borderRadius: o.r }} />
                <span style={{ fontSize: 11, color: radius === o.id ? T.text : T.text2 }}>{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ active, onClick, themeMode, label }: { active: boolean; onClick: () => void; themeMode: 'dark' | 'light'; label: string }) {
  const { T } = useTheme();
  const sample = themeMode === 'dark'
    ? { bg: '#0a0a0a', card: '#141414', text: '#fafafa', border: 'rgba(255,255,255,0.08)' }
    : { bg: '#fafaf9', card: '#ffffff', text: '#0a0a0a', border: 'rgba(0,0,0,0.06)' };
  return (
    <button onClick={onClick} style={{
      background: T.card, border: `1px solid ${active ? T.borderStrong : T.border}`,
      borderRadius: 14, padding: 14, cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch',
      boxShadow: T.cardShadow,
    }}>
      <div style={{
        background: sample.bg, border: `1px solid ${sample.border}`, borderRadius: 8,
        padding: 8, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ height: 6, background: sample.text, opacity: 0.9, borderRadius: 2, width: '40%' }} />
        <div style={{ background: sample.card, border: `1px solid ${sample.border}`, borderRadius: 6, height: 22, marginTop: 4 }} />
        <div style={{ background: sample.card, border: `1px solid ${sample.border}`, borderRadius: 6, height: 14 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: T.text }}>{label}</span>
        {active && <Icon name="check" size={14} color={T.accent} />}
      </div>
    </button>
  );
}

// ─── Notifications ─────────────────────────
interface NotifState {
  appts: boolean; remind: boolean; msgs: boolean; reviews: boolean; marketing: boolean;
  push: boolean; email: boolean; tg: boolean;
}

export function NotificationsScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const [v, setV] = useState<NotifState>({
    appts: true, remind: true, msgs: true, reviews: true, marketing: false,
    push: true, email: false, tg: true,
  });
  const t = (k: keyof NotifState) => setV((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div>
      <ScreenHeader title="Уведомления" subtitle="Что и куда присылать." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <SectionTitle title="Что присылать" />
          <Card padded={false}>
            <ToggleRow label="Новые записи" sub="Когда клиент бронирует слот" on={v.appts} onChange={() => t('appts')} />
            <Divider />
            <ToggleRow label="Напоминания" sub="За 24 и за 2 часа до визита" on={v.remind} onChange={() => t('remind')} />
            <Divider />
            <ToggleRow label="Сообщения" sub="Новые входящие в чатах" on={v.msgs} onChange={() => t('msgs')} />
            <Divider />
            <ToggleRow label="Отзывы" sub="После каждого нового" on={v.reviews} onChange={() => t('reviews')} />
            <Divider />
            <ToggleRow label="Маркетинг" sub="Новости платформы" on={v.marketing} onChange={() => t('marketing')} />
          </Card>
        </div>

        <div>
          <SectionTitle title="Тихие часы" subtitle="Не присылаем в это время." />
          <Card padded={false}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <KVItem k="С" v="22:00" />
              <KVItem k="До" v="08:00" right />
            </div>
          </Card>
        </div>

        <div>
          <SectionTitle title="Каналы доставки" />
          <Card padded={false}>
            <ToggleRow label="Push" on={v.push} onChange={() => t('push')} />
            <Divider />
            <ToggleRow label="Email" on={v.email} onChange={() => t('email')} />
            <Divider />
            <ToggleRow label="Telegram" on={v.tg} onChange={() => t('tg')} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: (n: boolean) => void }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function KVItem({ k, v, right }: { k: string; v: string; right?: boolean }) {
  const { T } = useTheme();
  return (
    <div style={{
      padding: '14px 20px',
      borderRight: !right ? `1px solid ${T.border}` : 'none',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <FieldLabel>{k}</FieldLabel>
      <div style={{ fontSize: 13, color: T.text, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
    </div>
  );
}

// ─── Subscription ──────────────────────────
export function SubscriptionScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const features = [
    'Безлимит записей и клиентов',
    'Неограниченные шаблоны и рассылки',
    'Аналитика по периодам и каналам',
    'Интеграции с TG, ВК, Google Calendar',
    'Приоритетная поддержка',
  ];
  return (
    <div>
      <ScreenHeader title="Подписка" subtitle="Тариф и преимущества." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 20, bottom: 20, width: 2, background: T.accent }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FieldLabel>Текущий тариф</FieldLabel>
            <span style={{ fontSize: 11, color: T.accent }}>активен</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: T.text, letterSpacing: '-0.03em', marginTop: 10 }}>Pro</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: T.text2 }}>
            <span>До 5 июня 2026</span>
            <span>·</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>790 ₽ / мес</span>
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="check" size={14} color={T.accent} />
                <span style={{ fontSize: 13, color: T.text }}>{f}</span>
              </div>
            ))}
          </div>
          <NeutralBtn full style={{ marginTop: 18 }}>Управлять подпиской</NeutralBtn>
        </Card>

        <SectionTitle title="Сравнить" subtitle="Другие тарифы." />
        <PlanCard name="Базовый" price="0 ₽" features={['До 30 записей в месяц', '1 шаблон', 'Telegram-бот']} />
        <PlanCard name="Pro" price="790 ₽ / мес" features={features} active />
        <PlanCard name="Бизнес" price="1 990 ₽ / мес" features={['Всё из Pro', 'Несколько мастеров', 'Брендинг страницы', 'Webhook API']} />
      </div>
    </div>
  );
}

function PlanCard({ name, price, features, active }: { name: string; price: string; features: string[]; active?: boolean }) {
  const { T } = useTheme();
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {active && <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 2, background: T.accent }} />}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: T.text, letterSpacing: '-0.02em' }}>{name}</span>
        <span style={{ fontSize: 13, color: T.text2, fontVariantNumeric: 'tabular-nums' }}>{price}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {features.map((f) => (
          <div key={f} style={{ fontSize: 12, color: T.text2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.text3 }} />
            {f}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Limits ────────────────────────────────
export function LimitsScreen({ back, go }: { back: () => void; go?: (k: string) => void }) {
  return (
    <div>
      <ScreenHeader title="Лимиты" subtitle="Использование текущего тарифа." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padded={false}>
          <LimitRow label="Записей в месяц" used={38} total={1000} unit="" />
          <Divider />
          <LimitRow label="Клиентов" used={142} total={1000} />
          <Divider />
          <LimitRow label="Шаблонов" used={5} total={50} />
          <Divider />
          <LimitRow label="Рассылок в месяц" used={2} total={20} />
          <Divider />
          <LimitRow label="Хранилище" used={0.6} total={5} unit=" ГБ" />
        </Card>
        <div style={{ padding: 16, border: `1px dashed currentColor`, borderRadius: 12, opacity: 0.6, fontSize: 12, lineHeight: 1.5 }}>
          Расширить лимиты можно обновлением тарифа.
        </div>
        <NeutralBtn icon="sparkles" full onClick={() => go && go('subscription')}>Обновить тариф</NeutralBtn>
      </div>
    </div>
  );
}

function LimitRow({ label, used, total, unit = '' }: { label: string; used: number; total: number; unit?: string }) {
  const { T } = useTheme();
  const pct = used / total;
  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: T.text }}>{label}</span>
        <span style={{ fontSize: 13, color: T.text2, fontVariantNumeric: 'tabular-nums' }}>
          {used}{unit} <span style={{ color: T.text3 }}>/ {total}{unit}</span>
        </span>
      </div>
      <div style={{ height: 2, background: T.skeleton, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: T.accent }} />
      </div>
    </div>
  );
}
