const http = require("http");
const crypto = require("crypto");
const { HINT_PACKS, getPack } = require("./payments");
const store = require("./store");
const {
  signSession,
  verifySession,
  verifyTelegramInitData,
  callTelegram
} = require("./telegram");

const port = Number(process.env.PORT || 8787);
const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
const sessionSecret = process.env.SESSION_SECRET || "dev-session-secret-change-me";
const publicBaseUrl = process.env.PUBLIC_BASE_URL || "https://main.hidden-frost-3cf1.pages.dev";

function send(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) reject(new Error("Body too large"));
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function bearer(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function currentUser(req) {
  const session = verifySession(bearer(req), sessionSecret);
  if (!session || !session.userId) return null;
  return store.getUser(session.userId);
}

function devProfile(body) {
  return {
    id: "dev-user",
    first_name: body.name || "Dev Player",
    username: "dev_player"
  };
}

async function handle(req, res) {
  const url = new URL(req.url, "http://localhost");
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, {
        ok: true,
        service: "hanzi-mini-app-api",
        starsEnabled: Boolean(botToken)
      });
    }

    if (req.method === "POST" && url.pathname === "/api/auth/telegram") {
      const body = await readBody(req);
      const profile = verifyTelegramInitData(body.initData, botToken) ||
        (process.env.NODE_ENV === "production" ? null : devProfile(body));
      if (!profile) return send(res, 401, { ok: false, error: "Invalid Telegram initData" });
      const user = store.upsertUser(profile);
      const token = signSession({ userId: user.id, iat: Date.now() }, sessionSecret);
      return send(res, 200, { ok: true, token, user: store.publicUser(user), packs: HINT_PACKS });
    }

    if (req.method === "GET" && url.pathname === "/api/account") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { ok: false, error: "Unauthorized" });
      return send(res, 200, { ok: true, user: store.publicUser(user), packs: HINT_PACKS });
    }

    if (req.method === "POST" && url.pathname === "/api/hints/use") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { ok: false, error: "Unauthorized" });
      if ((user.hints || 0) <= 0) return send(res, 402, { ok: false, error: "No hints left" });
      const updated = store.updateUser(user.id, (draft) => ({ ...draft, hints: (draft.hints || 0) - 1 }));
      return send(res, 200, { ok: true, user: store.publicUser(updated) });
    }

    if (req.method === "POST" && url.pathname === "/api/stars/invoice") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { ok: false, error: "Unauthorized" });
      if (!botToken) return send(res, 501, { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" });
      const body = await readBody(req);
      const pack = getPack(body.packId);
      if (!pack) return send(res, 400, { ok: false, error: "Unknown pack" });
      const orderId = crypto.randomUUID();
      const order = store.createOrder({
        id: orderId,
        userId: user.id,
        packId: pack.id,
        stars: pack.stars,
        hints: pack.hints,
        unlockAll: Boolean(pack.unlockAll),
        status: "pending",
        createdAt: new Date().toISOString()
      });
      const invoiceLink = await callTelegram(botToken, "createInvoiceLink", {
        title: pack.title,
        description: pack.description,
        payload: order.id,
        provider_token: "",
        currency: "XTR",
        prices: [{ label: pack.title, amount: pack.stars }]
      });
      return send(res, 200, { ok: true, order, invoiceLink });
    }

    if (req.method === "POST" && url.pathname === "/api/score") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { ok: false, error: "Unauthorized" });
      const body = await readBody(req);
      const score = store.saveScore(user.id, body);
      return send(res, 200, { ok: true, score, leaderboard: store.leaderboard() });
    }

    if (req.method === "GET" && url.pathname === "/api/leaderboard") {
      return send(res, 200, { ok: true, leaderboard: store.leaderboard() });
    }

    if (req.method === "POST" && url.pathname === "/api/telegram/webhook") {
      const update = await readBody(req);
      if (update.pre_checkout_query) {
        await callTelegram(botToken, "answerPreCheckoutQuery", {
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true
        });
        return send(res, 200, { ok: true });
      }
      const payment = update.message && update.message.successful_payment;
      if (payment && payment.invoice_payload) {
        store.completeOrder(payment.invoice_payload, payment);
      }
      return send(res, 200, { ok: true });
    }

    if (req.method === "POST" && url.pathname === "/api/dev/complete-order") {
      if (process.env.NODE_ENV === "production") return send(res, 404, { ok: false });
      const body = await readBody(req);
      const order = store.completeOrder(body.orderId, { dev: true });
      return send(res, 200, { ok: true, order });
    }

    return send(res, 404, { ok: false, error: "Not found", publicBaseUrl });
  } catch (error) {
    return send(res, 500, { ok: false, error: error.message });
  }
}

if (require.main === module) {
  http.createServer(handle).listen(port, "0.0.0.0", () => {
    console.log(`Hanzi Mini App API listening on http://127.0.0.1:${port}`);
  });
}

module.exports = { handle };
