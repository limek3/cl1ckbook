# ClickBook final MVP auth + booking notifications

## Product logic

- Public website stays for clients:
  - `/m/[slug]` profile
  - service/date/time selection
  - booking without registration
- Master cabinet works in two modes:
  - Telegram Mini App: bot → **Open cabinet** → `/app` → auto auth via `initData` → `/dashboard`
  - Web dashboard: `/login` → Telegram confirmation fallback → `/dashboard`
- Bot is the hub:
  - opens the Mini App
  - stores master `chat_id`
  - notifies master about new bookings
  - lets client connect Telegram reminders after booking

## Files added/changed

- `app/app/page.tsx`
- `app/api/auth/telegram-miniapp/route.ts`
- `app/api/telegram/webhook/route.ts`
- `app/api/telegram/setup/route.ts`
- `app/api/cron/reminders/route.ts`
- `components/auth/telegram-miniapp-gate.tsx`
- `components/booking/booking-form.tsx`
- `app/api/bookings/route.ts`
- `lib/server/telegram-miniapp.ts`
- `lib/server/telegram-user.ts`
- `lib/server/telegram-bot.ts`
- `lib/server/booking-telegram.ts`
- `supabase/migrations/20260430_0007_miniapp_booking_reminders.sql`
- `vercel.json`

## Required env variables

```env
NEXT_PUBLIC_APP_URL=https://cl1ckbuk.vercel.app
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username_without_at
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_SECRET=letters_numbers_only_secret
KEY_VAULTS_SECRET=long_random_secret
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Optional for manual cron protection:

```env
CRON_SECRET=long_random_secret
```

## Supabase

Run this migration in SQL Editor:

```txt
supabase/migrations/20260430_0007_miniapp_booking_reminders.sql
```

## Telegram setup after deploy

You can set webhook + bot menu with one browser call after deployment:

```txt
https://cl1ckbuk.vercel.app/api/telegram/setup?secret=TELEGRAM_WEBHOOK_SECRET
```

Expected response:

```json
{"ok":true}
```

Or use PowerShell:

```powershell
$TOKEN="TELEGRAM_BOT_TOKEN"
$SECRET="TELEGRAM_WEBHOOK_SECRET"

Invoke-RestMethod `
  -Uri "https://api.telegram.org/bot$TOKEN/setWebhook" `
  -Method Post `
  -Body @{
    url = "https://cl1ckbuk.vercel.app/api/telegram/webhook"
    secret_token = $SECRET
    drop_pending_updates = "true"
  }
```

## Client booking flow

1. Client books from `/m/[slug]`.
2. Master gets Telegram notification if master has opened the bot at least once.
3. Success screen shows **Get in Telegram**.
4. Client opens bot with `booking_...` token.
5. Bot sends confirmation and stores `client chat_id` for reminders.
6. `/api/cron/reminders` sends reminders roughly 24h and 2h before the booking.

## Important

For Telegram Mini App auth, open the cabinet through the bot button. Directly opening `/dashboard` in a fresh Telegram WebView may redirect to `/login`, because the server cannot see Telegram `initData` until `/app` runs in the browser.
