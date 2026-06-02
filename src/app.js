(function () {
  const levels = window.HANZI_LEVELS || [];
  const storageKey = "hanzi-mini-app-state-v2";
  const apiBase = window.HANZI_API_BASE || localStorage.getItem("HANZI_API_BASE") || "";
  const state = {
    levelIndex: 0,
    selected: new Set(),
    found: new Set(),
    completedLevels: 0,
    score: 0,
    hintsUsed: 0,
    startedAt: Date.now(),
    elapsedBefore: 0,
    finished: false,
    apiToken: "",
    account: null,
    packs: {},
    leaderboard: []
  };

  const text = {
    svgTitle: "\u53ef\u70b9\u51fb\u7684\u6c49\u5b57\u7b14\u753b",
    level: "\u5173\u5361",
    alreadyFound: "\u5df2\u7ecf\u627e\u5230",
    found: "\u627e\u5230",
    reset: "\u5df2\u91cd\u9009\u5f53\u524d\u7b14\u753b",
    allFound: "\u8fd9\u4e00\u5173\u5df2\u7ecf\u5168\u90e8\u627e\u5230",
    hint: "\u63d0\u793a\uff1a\u8bd5\u8bd5\u7ec4\u6210",
    missingPrefix: "\u8fd8\u5dee",
    missingSuffix: "\u4e2a\u5b57",
    next: "\u8fdb\u5165\u4e0b\u4e00\u5173",
    resumed: "\u5df2\u6062\u590d\u4e0a\u6b21\u8fdb\u5ea6",
    copied: "\u6210\u7ee9\u5df2\u53d1\u9001\u5230 Telegram",
    scoreUnit: "\u5206",
    empty: "\u6682\u65e0\u5173\u5361",
    apiOffline: "\u672a\u8fde\u63a5\u540e\u7aef",
    invoiceReady: "\u652f\u4ed8\u94fe\u63a5\u5df2\u6253\u5f00",
    loginOk: "\u5df2\u8fde\u63a5 Telegram \u8d26\u6237",
    scoreSaved: "\u6210\u7ee9\u5df2\u4e0a\u699c"
  };

  const $ = (id) => document.getElementById(id);
  const svg = $("characterSvg");
  const slots = $("answerSlots");
  const foundList = $("foundList");
  const toast = $("toast");
  const progressText = $("progressText");
  const scoreText = $("scoreText");
  const timerText = $("timerText");
  const hintText = $("hintText");
  const resultSheet = $("resultSheet");
  const finalScoreText = $("finalScoreText");
  const finalTimeText = $("finalTimeText");
  const resultSummary = $("resultSummary");
  const playerName = $("playerName");
  const serverHintText = $("serverHintText");
  const shopSheet = $("shopSheet");
  const packList = $("packList");
  const leaderboardSheet = $("leaderboardSheet");
  const leaderboardList = $("leaderboardList");
  let toastTimer = null;
  let timerId = null;
  let tg = null;

  function initTelegram() {
    tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    applyTelegramTheme();
    tg.onEvent && tg.onEvent("themeChanged", applyTelegramTheme);
    if (tg.MainButton) {
      tg.MainButton.setText("\u63d0\u4ea4\u672c\u5173");
      tg.MainButton.onClick(submitLevel);
      tg.MainButton.show();
    }
    document.body.classList.add("in-telegram");
  }

  function applyTelegramTheme() {
    if (!tg) return;
    document.body.classList.toggle("tg-dark", tg.colorScheme === "dark");
    if (tg.setHeaderColor) tg.setHeaderColor(tg.colorScheme === "dark" ? "#17212b" : "#eef4ef");
    if (tg.setBackgroundColor) tg.setBackgroundColor(tg.colorScheme === "dark" ? "#17212b" : "#eef4ef");
  }

  async function api(path, options = {}) {
    if (!apiBase) throw new Error(text.apiOffline);
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (state.apiToken) headers.Authorization = `Bearer ${state.apiToken}`;
    const response = await fetch(`${apiBase}${path}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok || data.ok === false) throw new Error(data.error || "API error");
    return data;
  }

  async function initAccount() {
    if (!apiBase) {
      renderAccount();
      return;
    }
    try {
      const data = await api("/api/auth/telegram", {
        method: "POST",
        body: JSON.stringify({ initData: tg ? tg.initData : "", name: "Browser Player" })
      });
      state.apiToken = data.token;
      state.account = data.user;
      state.packs = data.packs || {};
      renderAccount();
      renderPacks();
      await loadLeaderboard();
      showToast(text.loginOk);
    } catch (error) {
      renderAccount();
      showToast(error.message);
    }
  }

  function renderAccount() {
    if (!state.account) {
      playerName.textContent = text.apiOffline;
      serverHintText.textContent = "\u63d0\u793a --";
      return;
    }
    playerName.textContent = state.account.username ? `@${state.account.username}` : state.account.firstName || "Player";
    serverHintText.textContent = `\u63d0\u793a ${state.account.hints || 0}`;
  }

  function renderPacks() {
    packList.innerHTML = "";
    const packs = Object.values(state.packs);
    if (!packs.length) {
      const empty = document.createElement("p");
      empty.textContent = text.apiOffline;
      packList.appendChild(empty);
      return;
    }
    packs.forEach((pack) => {
      const button = document.createElement("button");
      button.className = "pack-button";
      button.type = "button";
      button.innerHTML = `<strong>${pack.title}</strong><span>${pack.stars} Stars · +${pack.hints} hints</span>`;
      button.addEventListener("click", () => buyPack(pack.id));
      packList.appendChild(button);
    });
  }

  async function loadLeaderboard() {
    try {
      const data = await api("/api/leaderboard");
      state.leaderboard = data.leaderboard || [];
    } catch (error) {
      state.leaderboard = [];
    }
    renderLeaderboard();
  }

  function renderLeaderboard() {
    leaderboardList.innerHTML = "";
    if (!state.leaderboard.length) {
      const empty = document.createElement("p");
      empty.textContent = "\u6682\u65e0\u6210\u7ee9";
      leaderboardList.appendChild(empty);
      return;
    }
    state.leaderboard.slice(0, 20).forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "leaderboard-row";
      row.innerHTML = `<span>${index + 1}. ${entry.name}</span><strong>${entry.score}</strong>`;
      leaderboardList.appendChild(row);
    });
  }

  function keyOf(ids) {
    return ids.slice().sort().join("|");
  }

  function currentLevel() {
    return levels[state.levelIndex];
  }

  function elapsedSeconds() {
    if (state.finished) return state.elapsedBefore;
    return state.elapsedBefore + Math.floor((Date.now() - state.startedAt) / 1000);
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function saveProgress() {
    const payload = {
      levelIndex: state.levelIndex,
      completedLevels: state.completedLevels,
      score: state.score,
      hintsUsed: state.hintsUsed,
      elapsed: elapsedSeconds(),
      found: Array.from(state.found),
      finished: state.finished
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      state.levelIndex = Math.min(Math.max(saved.levelIndex || 0, 0), Math.max(levels.length - 1, 0));
      state.completedLevels = Math.min(saved.completedLevels || 0, levels.length);
      state.score = saved.score || 0;
      state.hintsUsed = saved.hintsUsed || 0;
      state.elapsedBefore = saved.elapsed || 0;
      state.startedAt = Date.now();
      state.finished = Boolean(saved.finished);
      state.found = new Set(Array.isArray(saved.found) ? saved.found : []);
      return true;
    } catch (error) {
      localStorage.removeItem(storageKey);
      return false;
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function renderLevel(options = {}) {
    const level = currentLevel();
    if (!level) {
      $("levelTitle").textContent = text.empty;
      return;
    }

    state.selected.clear();
    if (!options.keepFound) state.found.clear();

    $("levelLabel").textContent = `${text.level} ${state.levelIndex + 1}/${levels.length}`;
    $("levelTitle").textContent = level.title;
    $("levelPrompt").textContent = level.prompt;

    renderSlots();
    renderFoundList();
    renderStrokes();
    renderStats();
    updateTelegramButton();
  }

  function renderStats() {
    const level = currentLevel();
    progressText.textContent = `${state.found.size}/${level.answers.length}`;
    scoreText.textContent = state.score.toString();
    timerText.textContent = formatTime(elapsedSeconds());
    hintText.textContent = state.hintsUsed.toString();
  }

  function renderSlots() {
    slots.innerHTML = "";
    currentLevel().answers.forEach((answer) => {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.textContent = state.found.has(answer.char) ? answer.char : "";
      slots.appendChild(slot);
    });
  }

  function renderFoundList() {
    foundList.innerHTML = "";
    currentLevel().answers.forEach((answer) => {
      const badge = document.createElement("span");
      badge.className = state.found.has(answer.char) ? "found-badge visible" : "found-badge";
      badge.textContent = answer.char;
      foundList.appendChild(badge);
    });
  }

  function renderStrokes() {
    const level = currentLevel();
    svg.innerHTML = `<title id="charTitle">${text.svgTitle}</title>`;
    level.strokes.forEach((stroke) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", stroke.d);
      path.setAttribute("stroke-width", stroke.width);
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.dataset.strokeId = stroke.id;
      path.classList.add("stroke");
      if (state.selected.has(stroke.id)) path.classList.add("selected");
      path.addEventListener("click", () => toggleStroke(stroke.id));
      svg.appendChild(path);
    });
  }

  function updateTelegramButton() {
    if (!tg || !tg.MainButton) return;
    if (state.finished) {
      tg.MainButton.setText("\u5206\u4eab\u6210\u7ee9");
      return;
    }
    const ready = state.found.size === currentLevel().answers.length;
    tg.MainButton.setText(ready ? "\u8fdb\u5165\u4e0b\u4e00\u5173" : "\u63d0\u4ea4\u672c\u5173");
  }

  function toggleStroke(id) {
    if (state.finished) return;
    if (state.selected.has(id)) state.selected.delete(id);
    else state.selected.add(id);
    renderStrokes();
    checkSelection();
  }

  function checkSelection() {
    const selectedKey = keyOf(Array.from(state.selected));
    const match = currentLevel().answers.find((answer) => keyOf(answer.strokes) === selectedKey);
    if (!match) return;

    if (state.found.has(match.char)) {
      showToast(`${text.alreadyFound}\u300c${match.char}\u300d`);
      return;
    }

    const gainedScore = Math.max(20, 120 - state.hintsUsed * 8);
    state.found.add(match.char);
    state.score += gainedScore;
    state.selected.clear();
    renderSlots();
    renderFoundList();
    renderStrokes();
    renderStats();
    updateTelegramButton();
    saveProgress();
    showToast(`${text.found}\u300c${match.char}\u300d +${gainedScore}`);
  }

  function resetSelection() {
    if (state.finished) {
      restartGame();
      return;
    }
    state.selected.clear();
    renderStrokes();
    showToast(text.reset);
  }

  function showHint() {
    if (state.finished) return;
    const next = currentLevel().answers.find((answer) => !state.found.has(answer.char));
    if (!next) {
      showToast(text.allFound);
      return;
    }
    useServerHintIfAvailable().then((allowed) => {
      if (allowed) applyHint(next);
    });
  }

  async function useServerHintIfAvailable() {
    if (!state.account) return true;
    try {
      const data = await api("/api/hints/use", { method: "POST", body: "{}" });
      state.account = data.user;
      renderAccount();
      return true;
    } catch (error) {
      showToast(error.message);
      showShop();
      return false;
    }
  }

  function applyHint(next) {
    state.hintsUsed += 1;
    state.score = Math.max(0, state.score - 10);
    state.selected = new Set(next.strokes.slice(0, Math.max(1, next.strokes.length - 1)));
    renderStrokes();
    renderStats();
    saveProgress();
    showToast(`${text.hint}\u300c${next.char}\u300d`);
  }

  function submitLevel() {
    if (state.finished) {
      shareResult();
      return;
    }

    const level = currentLevel();
    if (state.found.size < level.answers.length) {
      showToast(`${text.missingPrefix} ${level.answers.length - state.found.size} ${text.missingSuffix}`);
      return;
    }

    state.completedLevels = Math.max(state.completedLevels, state.levelIndex + 1);
    state.score += Math.max(30, 180 - elapsedSeconds() - state.hintsUsed * 12);

    if (state.levelIndex < levels.length - 1) {
      state.levelIndex += 1;
      state.found.clear();
      state.selected.clear();
      renderLevel();
      saveProgress();
      showToast(text.next);
      return;
    }

    finishGame();
  }

  function finishGame() {
    state.finished = true;
    state.elapsedBefore = elapsedSeconds();
    window.clearInterval(timerId);
    renderStats();
    updateTelegramButton();
    saveProgress();
    submitScore();
    showResult();
  }

  async function submitScore() {
    if (!state.account) return;
    try {
      const data = await api("/api/score", {
        method: "POST",
        body: JSON.stringify({ score: state.score, elapsed: elapsedSeconds(), levels: levels.length })
      });
      state.leaderboard = data.leaderboard || [];
      renderLeaderboard();
      showToast(text.scoreSaved);
    } catch (error) {
      // Local completion should still work if the backend is offline.
    }
  }

  function showResult() {
    finalScoreText.textContent = `${state.score} ${text.scoreUnit}`;
    finalTimeText.textContent = formatTime(elapsedSeconds());
    resultSummary.textContent = `\u5171\u5b8c\u6210 ${levels.length} \u5173\uff0c\u4f7f\u7528 ${state.hintsUsed} \u6b21\u63d0\u793a`;
    resultSheet.classList.add("visible");
    resultSheet.setAttribute("aria-hidden", "false");
    if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
  }

  function hideResult() {
    resultSheet.classList.remove("visible");
    resultSheet.setAttribute("aria-hidden", "true");
  }

  function restartGame() {
    state.levelIndex = 0;
    state.selected.clear();
    state.found.clear();
    state.completedLevels = 0;
    state.score = 0;
    state.hintsUsed = 0;
    state.elapsedBefore = 0;
    state.startedAt = Date.now();
    state.finished = false;
    localStorage.removeItem(storageKey);
    hideResult();
    startTimer();
    renderLevel();
  }

  function shareResult() {
    const payload = {
      type: "game_result",
      score: state.score,
      elapsed: elapsedSeconds(),
      hintsUsed: state.hintsUsed,
      levels: levels.length
    };
    if (tg) tg.sendData(JSON.stringify(payload));
    else navigator.clipboard && navigator.clipboard.writeText(`Hanzi score: ${state.score}`);
    showToast(text.copied);
  }

  function showShop() {
    renderPacks();
    shopSheet.classList.add("visible");
    shopSheet.setAttribute("aria-hidden", "false");
  }

  function hideShop() {
    shopSheet.classList.remove("visible");
    shopSheet.setAttribute("aria-hidden", "true");
  }

  async function buyPack(packId) {
    try {
      const data = await api("/api/stars/invoice", {
        method: "POST",
        body: JSON.stringify({ packId })
      });
      if (tg && tg.openInvoice) tg.openInvoice(data.invoiceLink, refreshAccount);
      else window.open(data.invoiceLink, "_blank", "noopener");
      showToast(text.invoiceReady);
    } catch (error) {
      showToast(error.message);
    }
  }

  async function refreshAccount() {
    if (!state.apiToken) return;
    try {
      const data = await api("/api/account");
      state.account = data.user;
      state.packs = data.packs || state.packs;
      renderAccount();
      renderPacks();
    } catch (error) {
      renderAccount();
    }
  }

  function showLeaderboard() {
    loadLeaderboard();
    leaderboardSheet.classList.add("visible");
    leaderboardSheet.setAttribute("aria-hidden", "false");
  }

  function hideLeaderboard() {
    leaderboardSheet.classList.remove("visible");
    leaderboardSheet.setAttribute("aria-hidden", "true");
  }

  function startTimer() {
    window.clearInterval(timerId);
    timerId = window.setInterval(renderStats, 1000);
  }

  $("resetBtn").addEventListener("click", resetSelection);
  $("hintBtn").addEventListener("click", showHint);
  $("submitBtn").addEventListener("click", submitLevel);
  $("replayBtn").addEventListener("click", restartGame);
  $("continueBtn").addEventListener("click", hideResult);
  $("buyHintsBtn").addEventListener("click", showShop);
  $("closeShopBtn").addEventListener("click", hideShop);
  $("leaderboardBtn").addEventListener("click", showLeaderboard);
  $("closeLeaderboardBtn").addEventListener("click", hideLeaderboard);
  $("shareBtn").addEventListener("click", shareResult);

  initTelegram();
  initAccount();
  const restored = loadProgress();
  renderLevel({ keepFound: restored });
  if (state.finished) showResult();
  if (!state.finished) startTimer();
  if (restored && !state.finished) showToast(text.resumed);
})();
