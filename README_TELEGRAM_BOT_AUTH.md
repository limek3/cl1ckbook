# Telegram bot auth flow

This build replaces Telegram Login Widget with a bot-based login flow:

1. The user clicks “Войти через Telegram”.
2. The app creates a temporary login token.
3. The browser opens `https://t.me/<bot>?start=auth_<token>`.
4. The user presses Start in the bot.
5. Telegram sends an update to `/api/telegram/webhook`.
6. The site polls `/api/auth/telegram/status` and receives Supabase session tokens.

## Required Vercel variables

```env
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username_without_at
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_SECRET=random_secret
NEXT_PUBLIC_APP_URL=https://cl1ckbuk.vercel.app
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Supabase SQL

Run:

```txt
supabase/migrations/20260430_0006_telegram_bot_auth.sql
```

## Set Telegram webhook

PowerShell:

```powershell
$TOKEN="TELEGRAM_BOT_TOKEN"
$SECRET="TELEGRAM_WEBHOOK_SECRET"

Invoke-RestMethod `
  -Uri "https://api.telegram.org/bot$TOKEN/setWebhook" `
  -Method Post `
  -Body @{
    url = "https://cl1ckbuk.vercel.app/api/telegram/webhook"
    secret_token = $SECRET
  }
```

Check:

```powershell
Invoke-RestMethod -Uri "https://api.telegram.org/bot$TOKEN/getWebhookInfo" -Method Get
```
