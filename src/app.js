(function () {
  const levels = window.HANZI_LEVELS;
  const state = {
    levelIndex: 0,
    selected: new Set(),
    found: new Set()
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
    done: "\u5168\u90e8\u901a\u5173\uff01"
  };

  const $ = (id) => document.getElementById(id);
  const svg = $("characterSvg");
  const slots = $("answerSlots");
  const foundList = $("foundList");
  const toast = $("toast");
  const progressText = $("progressText");
  let toastTimer = null;

  function initTelegram() {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    document.body.classList.add("in-telegram");
  }

  function keyOf(ids) {
    return ids.slice().sort().join("|");
  }

  function currentLevel() {
    return levels[state.levelIndex];
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function renderLevel() {
    const level = currentLevel();
    state.selected.clear();
    state.found.clear();

    $("levelLabel").textContent = `${text.level} ${state.levelIndex + 1}`;
    $("levelTitle").textContent = level.title;
    $("levelPrompt").textContent = level.prompt;

    renderSlots();
    renderFoundList();
    renderStrokes();
    renderProgress();
  }

  function renderProgress() {
    progressText.textContent = `${state.found.size}/${currentLevel().answers.length}`;
  }

  function renderSlots() {
    const level = currentLevel();
    slots.innerHTML = "";
    level.answers.forEach((answer) => {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.textContent = state.found.has(answer.char) ? answer.char : "";
      slots.appendChild(slot);
    });
  }

  function renderFoundList() {
    const level = currentLevel();
    foundList.innerHTML = "";
    level.answers.forEach((answer) => {
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

  function toggleStroke(id) {
    if (state.selected.has(id)) {
      state.selected.delete(id);
    } else {
      state.selected.add(id);
    }
    renderStrokes();
    checkSelection();
  }

  function checkSelection() {
    const level = currentLevel();
    const selectedKey = keyOf(Array.from(state.selected));
    const match = level.answers.find((answer) => keyOf(answer.strokes) === selectedKey);
    if (!match) return;

    if (state.found.has(match.char)) {
      showToast(`${text.alreadyFound}\u300c${match.char}\u300d`);
      return;
    }

    state.found.add(match.char);
    state.selected.clear();
    renderSlots();
    renderFoundList();
    renderStrokes();
    renderProgress();
    showToast(`${text.found}\u300c${match.char}\u300d`);
  }

  function resetSelection() {
    state.selected.clear();
    renderStrokes();
    showToast(text.reset);
  }

  function showHint() {
    const level = currentLevel();
    const next = level.answers.find((answer) => !state.found.has(answer.char));
    if (!next) {
      showToast(text.allFound);
      return;
    }

    state.selected = new Set(next.strokes.slice(0, Math.max(1, next.strokes.length - 1)));
    renderStrokes();
    showToast(`${text.hint}\u300c${next.char}\u300d`);
  }

  function submitLevel() {
    const level = currentLevel();
    if (state.found.size < level.answers.length) {
      showToast(`${text.missingPrefix} ${level.answers.length - state.found.size} ${text.missingSuffix}`);
      return;
    }

    if (state.levelIndex < levels.length - 1) {
      state.levelIndex += 1;
      renderLevel();
      showToast(text.next);
      return;
    }

    showToast(text.done);
  }

  $("resetBtn").addEventListener("click", resetSelection);
  $("hintBtn").addEventListener("click", showHint);
  $("submitBtn").addEventListener("click", submitLevel);

  initTelegram();
  renderLevel();
})();
