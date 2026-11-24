const technologies = [
  ["python", "Python", "Languages", "Research prototypes and experiment tooling", "#60aafa"],
  ["typescript", "TypeScript", "Languages", "Typed interfaces and agent workflows", "#60aafa"],
  ["javascript", "JavaScript", "Languages", "Interactive web interfaces", "#f5d465"],
  ["java", "Java", "Languages", "Server-side and course projects", "#ffa28b"],
  ["cpp", "C++", "Languages", "Systems and algorithm implementations", "#548ae8"],
  ["postgresql", "PostgreSQL", "Runtime & data", "Persistent jobs and shot state in VidForge", "#639cf0"],
  ["redis", "Redis", "Runtime & data", "Priority work queues for video generation", "#ff7d90"],
  ["node", "Node.js", "Runtime & data", "Application and workflow runtime", "#83df9f"],
  ["docker", "Docker", "Runtime & data", "Reproducible development environments", "#66baf6"],
  ["git", "Git", "Developer tools", "Version control and collaboration", "#fb936f"],
  ["github", "GitHub", "Developer tools", "Open-source projects and review", "#c1b7ff"],
  ["playwright", "Playwright", "Developer tools", "Browser automation and testing", "#88e5ac"],
  ["langgraph", "LangGraph", "Developer tools", "Stateful multi-agent orchestration", "#91edc9"],
  ["ffmpeg", "FFmpeg", "Developer tools", "Video composition, captions, and audio", "#93e489"],
  ["linux", "Linux", "Operating systems", "Development and runtime environments", "#7c83ab"],
  ["macos", "macOS", "Operating systems", "Local development environment", "#83c8ff"],
];

const board = document.querySelector(".bead-board");
const grid = board.querySelector(".bead-grid");
const filters = board.querySelector(".bead-filters");
const status = board.querySelector("[data-bead-status]");
const actions = document.querySelector(".toolbox-actions");
const shuffle = actions.querySelector("[data-shuffle]");
const autoplay = actions.querySelector("[data-autoplay]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let running = !reducedMotion.matches;
let onScreen = false;
let idleTimer;
let idleAnimation;
let lastTile;
let drag;
let suppressClick;
const slides = new Map();

function makeTile([id, name, category, description, ink]) {
  const item = document.createElement("li");
  item.className = "bead-tile";
  item.dataset.technology = id;
  item.dataset.category = category;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "bead-card";
  button.setAttribute("aria-label", name);
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-describedby", "bead-instructions");
  button.style.setProperty("--bead-ink", ink);
  // These values are authored in the module and never come from the URL or visitor input.
  button.innerHTML = `
    <span class="bead-window" aria-hidden="true">
      <span class="bead-turn">
        <span class="bead-front"><svg class="bead-art" viewBox="0 0 96 96"><use href="./assets/images/toolbox-beads.svg#${id}"></use></svg></span>
        <span class="bead-back"><small>${category}</small>${description}</span>
      </span>
    </span>
    <span>${name}</span>`;

  button.addEventListener("click", (event) => {
    if (event.detail && suppressClick === item) return;
    const reveal = button.getAttribute("aria-pressed") === "false";
    button.setAttribute("aria-pressed", String(reveal));
    status.textContent = reveal ? `${name}. ${category}. ${description}.` : `${name} icon shown.`;
  });

  button.addEventListener("keydown", (event) => {
    if (!event.shiftKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const tiles = visibleTiles();
    const next = tiles[tiles.indexOf(item) + (event.key === "ArrowRight" ? 1 : -1)];
    if (next) swap(item, next, true);
  });

  item.append(button);
  return item;
}

function visibleTiles() {
  return [...grid.children].filter((tile) => !tile.hidden);
}

function rearrange(order, focus) {
  const current = visibleTiles();
  const before = new Map(current.map((tile) => [tile, tile.getBoundingClientRect()]));
  slides.forEach((animation) => animation.cancel());
  slides.clear();
  // Reuse the visible slots so filtering doesn't move the other categories.
  let index = 0;
  for (const tile of [...grid.children].map((tile) => tile.hidden ? tile : order[index++])) {
    grid.append(tile);
  }
  focus?.focus({ preventScroll: true });
  if (reducedMotion.matches) return;

  for (const tile of current) {
    const after = tile.getBoundingClientRect();
    const x = before.get(tile).left - after.left;
    const y = before.get(tile).top - after.top;
    if (!x && !y) continue;
    const animation = tile.animate(
      [{ transform: `translate(${x}px, ${y}px)` }, { transform: "none" }],
      { duration: 420, easing: "cubic-bezier(.2,.8,.25,1)" },
    );
    slides.set(tile, animation);
    animation.onfinish = () => slides.delete(tile);
  }
}

function swap(tile, target, keepFocus = false) {
  const order = visibleTiles();
  const from = order.indexOf(tile);
  const to = order.indexOf(target);
  [order[from], order[to]] = [order[to], order[from]];
  const button = tile.firstElementChild;
  rearrange(order, keepFocus ? button : null);
  status.textContent = `${button.getAttribute("aria-label")} moved to position ${to + 1}.`;
}

shuffle.addEventListener("click", () => {
  const original = visibleTiles();
  if (original.length < 2) return;
  const order = [...original];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.every((tile, index) => tile === original[index])) order.push(order.shift());
  rearrange(order);
  status.textContent = "Visible technology tiles shuffled.";
});

const categories = ["All", ...new Set(technologies.map((technology) => technology[2]))];
for (const category of categories) {
  const filter = document.createElement("button");
  filter.type = "button";
  filter.textContent = category;
  filter.setAttribute("aria-pressed", String(category === "All"));
  filter.addEventListener("click", () => {
    for (const button of filters.children) button.setAttribute("aria-pressed", String(button === filter));
    for (const tile of grid.children) tile.hidden = category !== "All" && tile.dataset.category !== category;
    const count = visibleTiles().length;
    status.textContent = `Showing ${count} technology tiles.`;
  });
  filters.append(filter);
}

grid.append(...technologies.map(makeTile));
board.hidden = false;
actions.hidden = false;

grid.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  const button = event.target.closest(".bead-card");
  if (!button) return;
  const tile = button.parentElement;
  suppressClick = null;
  drag = { button, tile, id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  button.setPointerCapture(event.pointerId);
});

grid.addEventListener("pointermove", (event) => {
  if (event.pointerId !== drag?.id) return;
  const x = event.clientX - drag.x;
  const y = event.clientY - drag.y;
  if (!drag.moved && Math.hypot(x, y) < 9) return;
  drag.moved = true;
  drag.tile.dataset.dragging = "";
  drag.tile.style.translate = `${x}px ${y}px`;
});

function finishDrag(event) {
  if (event.pointerId !== drag?.id) return;
  const { tile, moved } = drag;
  drag = null;
  if (!moved) return;

  const hovered = document.elementFromPoint(event.clientX, event.clientY)?.closest(".bead-tile");
  delete tile.dataset.dragging;
  tile.style.translate = "";
  suppressClick = tile;

  if (event.type !== "pointerup") return;
  if (hovered && hovered !== tile) {
    swap(tile, hovered, document.activeElement === tile.firstElementChild);
    return;
  }

  if (event.pointerType === "touch") {
    const order = visibleTiles();
    const bounds = tile.getBoundingClientRect();
    const offset = event.clientX - (bounds.x + bounds.width / 2);
    const neighbor = order[order.indexOf(tile) + Math.sign(offset)];
    if (Math.abs(offset) > 38 && neighbor) swap(tile, neighbor);
  }
}

grid.addEventListener("pointerup", finishDrag);
grid.addEventListener("pointercancel", finishDrag);
grid.addEventListener("lostpointercapture", finishDrag, true);

const gestures = [
  ["none", "translateY(-5px) rotateY(85deg)", "translateY(-3px) rotateY(195deg)", "none"],
  ["none", "translateX(-9px) rotate(-8deg)", "translateX(8px) rotate(6deg)", "none"],
  ["none", "translateY(-9px) rotate(-7deg) scale(1.07)", "none"],
];

function scheduleMotion() {
  clearTimeout(idleTimer);
  if (!running || !onScreen || document.hidden) return;
  idleTimer = setTimeout(() => {
    const options = visibleTiles().filter((tile) => tile !== lastTile && !tile.matches(":hover, :focus-within")
      && tile.firstElementChild.getAttribute("aria-pressed") === "false");
    if (options.length && !drag) {
      lastTile = options[Math.floor(Math.random() * options.length)];
      const frames = gestures[Math.floor(Math.random() * gestures.length)];
      idleAnimation = lastTile.querySelector(".bead-art").animate(frames.map((transform) => ({ transform })), {
        duration: 830,
        easing: "ease-in-out",
      });
    }
    scheduleMotion();
  }, 1150 + Math.random() * 1300);
}

function updateMotion() {
  autoplay.textContent = running ? "Pause idle motion" : "Resume idle motion";
  if (!running || !onScreen || document.hidden) idleAnimation?.cancel();
  scheduleMotion();
}

autoplay.addEventListener("click", () => {
  running = !running;
  updateMotion();
});

reducedMotion.addEventListener("change", (event) => {
  running = !event.matches;
  updateMotion();
});

new IntersectionObserver(([entry]) => {
  onScreen = entry.isIntersecting;
  updateMotion();
}).observe(grid);

document.addEventListener("visibilitychange", updateMotion);
updateMotion();
