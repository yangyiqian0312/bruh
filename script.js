const initialOptions = [
  { name: "红色", color: "#ef4444" },
  { name: "蓝色", color: "#3b82f6" },
  { name: "黑色", color: "#111827" }
];

const state = {
  options: new Map(),
  history: []
};

const cupsEl = document.getElementById("cups");
const rankingEl = document.getElementById("ranking");
const addOptionForm = document.getElementById("add-option-form");
const optionNameInput = document.getElementById("option-name");
const undoLastBtn = document.getElementById("undo-last");
const resetAllBtn = document.getElementById("reset-all");
const cupTemplate = document.getElementById("cup-template");

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function getMaxCount() {
  let max = 0;
  for (const option of state.options.values()) {
    max = Math.max(max, option.count);
  }
  return max;
}

function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 55%)`;
}

function createOption(name, color = randomColor()) {
  const key = normalizeName(name);
  if (!key || state.options.has(key)) {
    return false;
  }
  state.options.set(key, { key, name: name.trim(), color, count: 0 });
  render();
  return true;
}

function vote(key) {
  const option = state.options.get(key);
  if (!option) return;
  option.count += 1;
  state.history.push({ type: "vote", key });
  render();
}

function undoOption(key) {
  const option = state.options.get(key);
  if (!option || option.count === 0) return;
  option.count -= 1;
  state.history.push({ type: "undo-option", key });
  render();
}

function undoLast() {
  const last = state.history.pop();
  if (!last) return;

  const option = state.options.get(last.key);
  if (!option) return;

  if (last.type === "vote" && option.count > 0) {
    option.count -= 1;
  } else if (last.type === "undo-option") {
    option.count += 1;
  }

  render();
}

function resetAll() {
  for (const option of state.options.values()) {
    option.count = 0;
  }
  state.history = [];
  render();
}

function renderCups() {
  cupsEl.innerHTML = "";
  const max = getMaxCount();

  for (const option of state.options.values()) {
    const fragment = cupTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".cup-card");
    const title = fragment.querySelector(".option-title");
    const fill = fragment.querySelector(".fill");
    const count = fragment.querySelector(".count");
    const voteBtn = fragment.querySelector(".vote-btn");
    const undoBtn = fragment.querySelector(".undo-btn");

    title.textContent = option.name;
    count.textContent = option.count;

    const fillPercent = max === 0 ? 0 : Math.round((option.count / max) * 100);
    fill.style.height = `${fillPercent}%`;
    fill.style.background = `linear-gradient(to top, ${option.color}, color-mix(in oklab, ${option.color}, white 35%))`;

    voteBtn.addEventListener("click", () => vote(option.key));
    undoBtn.addEventListener("click", () => undoOption(option.key));
    undoBtn.disabled = option.count === 0;

    if (option.count === max && max > 0) {
      card.style.borderColor = option.color;
      card.style.boxShadow = `0 0 0 2px ${option.color}22`;
    }

    cupsEl.appendChild(fragment);
  }
}

function renderRanking() {
  const sorted = [...state.options.values()].sort((a, b) => b.count - a.count);
  rankingEl.innerHTML = "";

  for (const option of sorted) {
    const li = document.createElement("li");
    li.textContent = `${option.name}：${option.count} 票`;
    rankingEl.appendChild(li);
  }
}

function render() {
  renderCups();
  renderRanking();
  undoLastBtn.disabled = state.history.length === 0;
  resetAllBtn.disabled = getMaxCount() === 0;
}

addOptionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const success = createOption(optionNameInput.value);
  if (success) {
    optionNameInput.value = "";
  } else {
    optionNameInput.setCustomValidity("选项为空或已存在，请换一个名称");
    optionNameInput.reportValidity();
  }
});

optionNameInput.addEventListener("input", () => {
  optionNameInput.setCustomValidity("");
});

undoLastBtn.addEventListener("click", undoLast);
resetAllBtn.addEventListener("click", resetAll);

for (const option of initialOptions) {
  createOption(option.name, option.color);
}
