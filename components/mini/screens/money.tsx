'use client';

import { Fragment, useState } from 'react';
import { useTheme } from '../theme';
import {
  Card, FieldLabel, SectionTitle, Divider, Avatar, Toggle, Pill, Icon, NeutralBtn,
  ListRow, ScreenHeader, BottomSheet,
} from '../primitives/atoms';
import {
  FINANCE_OPS, INTEGRATIONS, SOURCES, CAMPAIGNS, REVIEWS,
  type FinanceOp, type Integration, type Campaign, type Review,
} from '@/lib/mini-demo';
import { useMiniToast } from '../bridge';

// ─── Finance ───────────────────────────────────
export function FinanceScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const { show } = useMiniToast();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const balance = 24800;

  async function withdraw() {
    const n = parseInt(amount.replace(/\s/g, ''), 10);
    if (!n || n <= 0) { show('Введите сумму', 'error'); return; }
    if (n > balance) { show('Сумма больше баланса', 'error'); return; }
    setWithdrawOpen(false);
    setAmount('');
    show(`Заявка на ${n.toLocaleString('ru-RU')} ₽ создана`, 'success');
  }
  return (
    <div>
      <ScreenHeader title="Финансы" subtitle="Баланс, история, выплаты." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <FieldLabel>Доступно к выводу</FieldLabel>
          <div style={{ fontSize: 36, fontWeight: 600, color: T.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginTop: 10, lineHeight: 1 }}>
            {balance.toLocaleString('ru-RU')} ₽
          </div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 8 }}>+ 4 200 ₽ в обработке</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            <NeutralBtn icon="arrow-up-right" full onClick={() => setWithdrawOpen(true)}>Вывести</NeutralBtn>
            <NeutralBtn icon="arrow-down-left" full onClick={() => show('Пополнение через эквайринг', 'info')}>Пополнить</NeutralBtn>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 8 }}>
          <Pill active={period === 'week'} onClick={() => setPeriod('week')}>Неделя</Pill>
          <Pill active={period === 'month'} onClick={() => setPeriod('month')}>Месяц</Pill>
          <Pill active={period === 'all'} onClick={() => setPeriod('all')}>Всё</Pill>
        </div>

        <SectionTitle title="История операций" />
        <Card padded={false}>
          {FINANCE_OPS.map((op, i) => (
            <Fragment key={i}>
              <FinanceOpRow op={op} />
              {i < FINANCE_OPS.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Card>

        <SectionTitle title="Реквизиты для выплат" />
        <Card padded={false}>
          <ListRow icon="credit-card" label="Карта •• 4421" sub="Тинькофф · по умолчанию" right={<Icon name="check" size={14} color={T.accent} />} />
          <Divider />
          <ListRow icon="plus" label="Добавить способ" onClick={() => show('Добавление через настройки платежей', 'info')} />
        </Card>
      </div>

      <BottomSheet open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Вывод средств">
        <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 12, color: T.text2 }}>Доступно: {balance.toLocaleString('ru-RU')} ₽ · карта •• 4421</div>
          <div style={{
            background: T.cardElev, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px',
          }}>
            <FieldLabel style={{ fontSize: 9 }}>Сумма, ₽</FieldLabel>
            <input
              autoFocus
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d ]/g, ''))}
              placeholder="0"
              style={{
                width: '100%', marginTop: 6, padding: 0, fontSize: 22, fontWeight: 600,
                background: 'transparent', border: 'none', outline: 'none',
                color: T.text, fontVariantNumeric: 'tabular-nums', fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <NeutralBtn onClick={() => setAmount(String(Math.floor(balance / 2)))}>50%</NeutralBtn>
            <NeutralBtn onClick={() => setAmount(String(balance))}>Всё</NeutralBtn>
            <NeutralBtn onClick={() => setAmount('')}>Сброс</NeutralBtn>
          </div>
          <NeutralBtn icon="check" full onClick={withdraw}>Подтвердить</NeutralBtn>
        </div>
      </BottomSheet>
    </div>
  );
}

function FinanceOpRow({ op }: { op: FinanceOp }) {
  const { T } = useTheme();
  const positive = op.amount > 0;
  return (
    <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, background: T.cardElev, border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2,
      }}>
        <Icon name={positive ? 'arrow-down-left' : 'arrow-up-right'} size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{op.desc}</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{op.date}</div>
      </div>
      <div style={{
        fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums',
        color: positive ? T.success : T.danger,
      }}>
        {positive ? '+' : ''}{op.amount.toLocaleString('ru-RU')} ₽
      </div>
    </div>
  );
}

// ─── Payments ─────────────────────────────────
export function PaymentsScreen({ back }: { back: () => void }) {
  const { show } = useMiniToast();
  const [v, setV] = useState({ cash: true, card: true, sbp: true, link: false });
  const t = (k: keyof typeof v) => setV((s) => ({ ...s, [k]: !s[k] }));
  return (
    <div>
      <ScreenHeader title="Платежи" subtitle="Способы приёма оплат." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionTitle title="Способы" />
        <Card padded={false}>
          <PayRow label="Наличные" sub="Без комиссии" on={v.cash} onChange={() => t('cash')} />
          <Divider />
          <PayRow label="Банковская карта" sub="Комиссия 2.4%" on={v.card} onChange={() => t('card')} />
          <Divider />
          <PayRow label="СБП" sub="Комиссия 0.7%" on={v.sbp} onChange={() => t('sbp')} />
          <Divider />
          <PayRow label="Ссылка на оплату" sub="Без онлайн-эквайринга" on={v.link} onChange={() => t('link')} />
        </Card>

        <SectionTitle title="Подключённые эквайринги" />
        <Card padded={false}>
          <ListRow icon="landmark" label="Тинькофф Касса" sub="ID: 1002457831" onClick={() => show('Эквайринг активен', 'info')} />
          <Divider />
          <ListRow icon="landmark" label="ЮKassa" sub="не подключено" onClick={() => show('Подключение ЮKassa: скоро', 'info')} />
          <Divider />
          <ListRow icon="plus" label="Добавить эквайринг" onClick={() => show('Свяжитесь с поддержкой', 'info')} />
        </Card>
      </div>
    </div>
  );
}

function PayRow({ label, sub, on, onChange }: { label: string; sub: string; on: boolean; onChange: (n: boolean) => void }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: T.text }}>{label}</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{sub}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

// ─── Integrations ─────────────────────────────
export function IntegrationsScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const [list, setList] = useState<Integration[]>(INTEGRATIONS);
  const t = (id: string) => setList((ls) => ls.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));
  return (
    <div>
      <ScreenHeader title="Интеграции" subtitle="Откуда приходят клиенты." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padded={false}>
          {list.map((it, i) => (
            <Fragment key={it.id}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: T.cardElev,
                  border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2,
                }}><Icon name={it.icon} size={16} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, color: T.text }}>{it.name}</span>
                    {it.on && <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent }} />}
                  </div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{it.sub}</div>
                </div>
                <button style={{
                  background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8,
                  padding: '6px 10px', fontSize: 11, color: T.text2, fontFamily: 'inherit', cursor: 'pointer',
                }}>Настроить</button>
                <Toggle on={it.on} onChange={() => t(it.id)} size="sm" />
              </div>
              {i < list.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Sources ─────────────────────────────────
export function SourcesScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const { show } = useMiniToast();
  const max = Math.max(...SOURCES.map((s) => s.records));
  const total = SOURCES.reduce((a, s) => a + s.records, 0);

  function createUtm() {
    const url = `https://app.example/m/admin?utm_source=mini&utm_medium=tg&utm_campaign=${Date.now()}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => show('UTM-ссылка скопирована', 'success'), () => show('Не удалось скопировать', 'error'));
    } else {
      show('Скопируйте ссылку вручную', 'info');
    }
  }
  return (
    <div>
      <ScreenHeader title="Каналы записи" subtitle="Источники трафика и конверсия." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <FieldLabel>Записей за 30 дней</FieldLabel>
          <div style={{ fontSize: 32, fontWeight: 600, color: T.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginTop: 8 }}>{total}</div>
          <div style={{ fontSize: 12, color: T.text2, marginTop: 4 }}>5 активных источников</div>
        </Card>

        <Card padded={false}>
          {SOURCES.map((s, i) => (
            <Fragment key={s.key}>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: T.text, flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: 13, color: T.text, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{s.records}</span>
                </div>
                <div style={{ height: 2, background: T.skeleton, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${(s.records / max) * 100}%`, background: T.accent }} />
                </div>
                <div style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums' }}>конверсия {Math.round(s.conv * 100)}%</div>
              </div>
              {i < SOURCES.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Card>

        <NeutralBtn icon="link" full onClick={createUtm}>Создать UTM-ссылку</NeutralBtn>
      </div>
    </div>
  );
}

// ─── Marketing ───────────────────────────────
export function MarketingScreen({ back }: { back: () => void }) {
  const { show } = useMiniToast();
  return (
    <div>
      <ScreenHeader title="Маркетинг" subtitle="Рассылки и акции клиентам." onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <NeutralBtn icon="plus" full onClick={() => show('Конструктор рассылок скоро', 'info')}>Создать рассылку</NeutralBtn>

        <SectionTitle title="Активные кампании" />
        {CAMPAIGNS.filter((c) => c.status === 'active').map((c, i) => (
          <CampaignCard key={i} c={c} />
        ))}

        <SectionTitle title="Завершённые" />
        {CAMPAIGNS.filter((c) => c.status === 'finished').map((c, i) => (
          <CampaignCard key={i} c={c} dim />
        ))}

        <SectionTitle title="Шаблоны промо-сообщений" />
        <Card padded={false}>
          {[
            'Скидка постоянным клиентам',
            'Анонс новой услуги',
            'Возврат давно не приходивших',
            'Сезонное предложение',
          ].map((name, i, arr) => (
            <Fragment key={name}>
              <ListRow label={name} onClick={() => show(`Шаблон «${name}» открыт`, 'info')} />
              {i < arr.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Card>
      </div>
    </div>
  );
}

function CampaignCard({ c, dim }: { c: Campaign; dim?: boolean }) {
  const { T } = useTheme();
  return (
    <Card style={{ position: 'relative', overflow: 'hidden', opacity: dim ? 0.7 : 1 }}>
      {!dim && <div style={{ position: 'absolute', left: 0, top: 16, bottom: 16, width: 2, background: T.accent }} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: dim ? T.text3 : T.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {dim ? 'Завершена' : 'Идёт'}
        </span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 500, color: T.text, letterSpacing: '-0.01em' }}>{c.name}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
        <CampStat label="Отправлено" value={c.sent} />
        <CampStat label="Открыли" value={c.opened} />
        <CampStat label="Кликнули" value={c.clicked} />
      </div>
    </Card>
  );
}

function CampStat({ label, value }: { label: string; value: number }) {
  const { T } = useTheme();
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: T.text, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 10, color: T.text3, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

// ─── Reviews ─────────────────────────────────
export function ReviewsScreen({ back }: { back: () => void }) {
  const { T } = useTheme();
  const { show } = useMiniToast();
  const dist = [
    { stars: 5, count: 24 },
    { stars: 4, count: 5 },
    { stars: 3, count: 1 },
    { stars: 2, count: 1 },
    { stars: 1, count: 0 },
  ];
  const total = dist.reduce((a, x) => a + x.count, 0);
  const avg = (dist.reduce((a, x) => a + x.stars * x.count, 0) / total).toFixed(1);
  const max = Math.max(...dist.map((x) => x.count));
  return (
    <div>
      <ScreenHeader title="Отзывы" subtitle={`${total} отзывов всего.`} onBack={back} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', gap: 18 }}>
            <div>
              <div style={{ fontSize: 44, fontWeight: 600, color: T.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{avg}</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} name="star" size={11} color={i <= Math.round(parseFloat(avg)) ? T.text : T.text3} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{total} оценок</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
              {dist.map((d) => (
                <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: T.text3, width: 10, fontVariantNumeric: 'tabular-nums' }}>{d.stars}</span>
                  <div style={{ flex: 1, height: 4, background: T.skeleton, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(d.count / max) * 100}%`, background: T.accent }} />
                  </div>
                  <span style={{ fontSize: 10, color: T.text3, fontVariantNumeric: 'tabular-nums', minWidth: 18, textAlign: 'right' }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <NeutralBtn icon="send" full onClick={() => show('Ссылка на отзыв отправлена', 'success')}>Запросить отзыв</NeutralBtn>

        <Card padded={false}>
          {REVIEWS.map((r, i) => (
            <Fragment key={i}>
              <ReviewRow r={r} onReply={() => show(`Отвечаю на отзыв «${r.name}»`, 'info')} />
              {i < REVIEWS.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ReviewRow({ r, onReply }: { r: Review; onReply?: () => void }) {
  const { T } = useTheme();
  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Avatar name={r.name} size={32} radius={16} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: T.text }}>{r.name}</div>
          <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Icon key={i} name="star" size={9} color={i <= r.stars ? T.text : T.text3} />
            ))}
          </div>
        </div>
        <span style={{ fontSize: 11, color: T.text3 }}>{r.date}</span>
      </div>
      <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>{r.text}</div>
      <button onClick={onReply} style={{
        background: 'transparent', border: 'none', color: T.text2,
        fontSize: 12, padding: '8px 0 0', cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon name="reply" size={12} /> Ответить
      </button>
    </div>
  );
}
