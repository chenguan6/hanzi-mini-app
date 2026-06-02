# Stars Backend Setup

This project now has a small Node backend for Telegram identity, hint balances, Stars invoices, payment callbacks, scores, and leaderboard data.

## Local API

```powershell
cd D:\Tech\vscode\mini_app
$env:SESSION_SECRET="dev-secret"
npm run start:api
```

Health check:

```text
http://127.0.0.1:8787/api/health
```

## Frontend API URL

The frontend reads `window.HANZI_API_BASE` or `localStorage.HANZI_API_BASE`.

For local testing in browser console:

```js
localStorage.setItem("HANZI_API_BASE", "http://127.0.0.1:8787");
location.reload();
```

## Telegram Stars

Set these on the backend host:

```text
TELEGRAM_BOT_TOKEN=your_bot_token
SESSION_SECRET=a_long_random_secret
PUBLIC_BASE_URL=https://main.hidden-frost-3cf1.pages.dev
```

Webhook endpoint:

```text
https://your-api-domain.example.com/api/telegram/webhook
```

Stars invoices use:

```text
currency = XTR
provider_token = ""
```

The backend credits hint balances only after `successful_payment`.
