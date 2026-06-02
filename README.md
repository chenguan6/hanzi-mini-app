# Hanzi Mini App

A static Telegram Mini App prototype for a Chinese character stroke puzzle.

## Features

- 10 playable levels.
- Tap stroke combinations to discover hidden characters.
- Score, timer, hint count, and completion result sheet.
- Local progress restore with `localStorage`.
- Telegram WebApp SDK integration and MainButton support.
- Optional Node backend for Telegram login, hint balances, Stars invoices, payment callbacks, scores, and leaderboards.

## Local Run

```powershell
python -m http.server 5188 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:5188/
```

## Cloudflare Upload

Upload the generated archive:

```text
hanzi-mini-app-dist.zip
```

Then configure the Telegram bot menu button with the HTTPS URL from Cloudflare.

## Backend

```powershell
copy .env.example .env
npm run start:api
```

For local frontend testing, open the browser console:

```js
localStorage.setItem("HANZI_API_BASE", "http://127.0.0.1:8787");
location.reload();
```

## Level Data

Level data lives in `src/levels.js`.

- `strokes`: clickable SVG paths.
- `answers`: character answers and required stroke IDs.
- `title` and `prompt`: level copy.
