# ClickBook — OAuth, Billing, Limits, Promotion, Golos UI

Что изменено:

1. Авторизация
- `/login` теперь поддерживает Telegram, Google и VK ID.
- Google/VK работают через Supabase OAuth `signInWithOAuth`.
- Callback остаётся `/auth/callback?next=...`.

2. Подписки и лимиты
- Добавлен общий биллинг-слой: `lib/billing.ts`, `hooks/use-billing-status.ts`.
- Добавлен API `/api/billing` для чтения текущего тарифа, статуса подписки и лимитов.
- Добавлен API `/api/billing/webhook` для обновления подписки платёжным провайдером по секрету.
- В нижнем меню кабинета теперь отображается текущий тариф и статус доступа.
- Страница `/dashboard/limits` теперь берёт реальные лимиты из текущей подписки.
- Страница `/dashboard/subscription` подтягивает активный тариф из подписки, а не жёстко Pro.

3. SQL
- Добавлена миграция `20260501_0016_clickbook_billing_oauth_limits_promotion.sql`.
- Добавлены таблицы:
  - `sloty_workspace_subscriptions`
  - `sloty_subscription_events`
  - `sloty_marketing_campaigns`
- Исправлен constraint статусов записей: `no_show` разрешён на уровне БД.
- Обновлён `RUN_ALL_CLICKBOOK_SQL.sql`.

4. Продвижение
- Раздел маркетинга переименован в «Продвижение».
- Добавлена структура БД и API для будущих промо-кампаний `/api/marketing/campaigns`.

5. Шрифт
- Подключён `Golos_Text` через `next/font/google`.
- Глобальная переменная шрифта теперь использует `'Golos UI', var(--font-golos-text), 'Golos Text', ...`.

Что нужно настроить в Supabase/Vercel:

- В Supabase Auth включить Google и VK provider.
- В OAuth redirect URLs добавить:
  - `https://ВАШ_ДОМЕН/auth/callback`
  - локально: `http://localhost:3000/auth/callback`
- Выполнить SQL из `supabase/RUN_ALL_CLICKBOOK_SQL.sql` или новую миграцию отдельно.
- Для реальной оплаты указать env:
  - `CLICKBOOK_CHECKOUT_PRO_MONTHLY_URL`
  - `CLICKBOOK_CHECKOUT_PRO_YEARLY_URL`
  - `CLICKBOOK_CHECKOUT_STUDIO_MONTHLY_URL`
  - `CLICKBOOK_CHECKOUT_STUDIO_YEARLY_URL`
  - `CLICKBOOK_CHECKOUT_PREMIUM_MONTHLY_URL`
  - `CLICKBOOK_CHECKOUT_PREMIUM_YEARLY_URL`
  - `CLICKBOOK_BILLING_PORTAL_URL`
  - `CLICKBOOK_BILLING_WEBHOOK_SECRET`

Проверка:
- Изменённые TS/TSX файлы прошли синтаксический parse-check.
- Полный `next build` не запускался: в архиве нет `node_modules`, а установка через registry в текущем окружении недоступна.
