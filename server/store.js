const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "store.json");

function defaultStore() {
  return {
    users: {},
    sessions: {},
    orders: {},
    scores: []
  };
}

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultStore(), null, 2));
  }
}

function readStore() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch (error) {
    return defaultStore();
  }
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

function withStore(mutator) {
  const store = readStore();
  const result = mutator(store);
  writeStore(store);
  return result;
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName || "",
    username: user.username || "",
    hints: user.hints || 0,
    unlockedAll: Boolean(user.unlockedAll),
    bestScore: user.bestScore || 0,
    bestElapsed: user.bestElapsed || 0
  };
}

function upsertUser(profile) {
  return withStore((store) => {
    const id = String(profile.id);
    const existing = store.users[id] || {};
    const user = {
      ...existing,
      id,
      firstName: profile.first_name || profile.firstName || existing.firstName || "",
      username: profile.username || existing.username || "",
      hints: Number.isFinite(existing.hints) ? existing.hints : 3,
      unlockedAll: Boolean(existing.unlockedAll),
      bestScore: existing.bestScore || 0,
      bestElapsed: existing.bestElapsed || 0,
      updatedAt: new Date().toISOString(),
      createdAt: existing.createdAt || new Date().toISOString()
    };
    store.users[id] = user;
    return user;
  });
}

function getUser(userId) {
  const store = readStore();
  return store.users[String(userId)] || null;
}

function updateUser(userId, updater) {
  return withStore((store) => {
    const id = String(userId);
    if (!store.users[id]) return null;
    store.users[id] = updater(store.users[id]) || store.users[id];
    store.users[id].updatedAt = new Date().toISOString();
    return store.users[id];
  });
}

function createOrder(order) {
  return withStore((store) => {
    store.orders[order.id] = order;
    return order;
  });
}

function completeOrder(orderId, payment) {
  return withStore((store) => {
    const order = store.orders[orderId];
    if (!order || order.status === "paid") return order || null;
    order.status = "paid";
    order.payment = payment;
    order.paidAt = new Date().toISOString();
    const user = store.users[order.userId];
    if (user) {
      user.hints = (user.hints || 0) + (order.hints || 0);
      if (order.unlockAll) user.unlockedAll = true;
      user.updatedAt = new Date().toISOString();
    }
    return order;
  });
}

function saveScore(userId, score) {
  return withStore((store) => {
    const user = store.users[String(userId)];
    if (!user) return null;
    const entry = {
      userId: String(userId),
      name: user.username || user.firstName || `Player ${String(userId).slice(-4)}`,
      score: Math.max(0, Number(score.score) || 0),
      elapsed: Math.max(0, Number(score.elapsed) || 0),
      levels: Math.max(0, Number(score.levels) || 0),
      createdAt: new Date().toISOString()
    };
    store.scores.push(entry);
    store.scores = store.scores
      .sort((a, b) => b.score - a.score || a.elapsed - b.elapsed)
      .slice(0, 200);
    if (entry.score > (user.bestScore || 0)) {
      user.bestScore = entry.score;
      user.bestElapsed = entry.elapsed;
    }
    return entry;
  });
}

function leaderboard(limit = 20) {
  const store = readStore();
  return store.scores
    .sort((a, b) => b.score - a.score || a.elapsed - b.elapsed)
    .slice(0, limit);
}

module.exports = {
  publicUser,
  upsertUser,
  getUser,
  updateUser,
  createOrder,
  completeOrder,
  saveScore,
  leaderboard
};
