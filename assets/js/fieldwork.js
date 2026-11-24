const tracks = {
  autonomy: {
    name: "Autonomous testing",
    color: [187, 172, 255],
    link: "./research.html",
    linkText: "Read the research",
    stages: [
      ["Scenario", "Specify a driving scenario", "Describe the actors, road layout, and interaction to test. Generate a concrete scenario that the test runner can execute."],
      ["Execution", "Run the scenario", "Execute the scenario and collect behavior records so reviewers can inspect what the vehicle did."],
      ["Evaluation", "Apply a test oracle", "Compare observed behavior with the expected behavior or safety criteria, and record evidence for the verdict."],
      ["Attribution", "Trace a failure", "Inspect the evidence across execution and evaluation to form a plausible explanation of the observed failure."],
    ],
  },
  gui: {
    name: "SynTriageGUI",
    color: [142, 227, 250],
    link: "./projects.html#syntriage",
    linkText: "Explore SynTriageGUI",
    stages: [
      ["Failure", "Start from the visible failure", "Begin with the GUI interaction that failed and its trajectory. The interaction where the problem becomes visible may come after the action that caused it."],
      ["Candidates", "Surface earlier candidates", "Use the recorded screens and actions to point reviewers toward earlier steps that could explain the failure."],
      ["Review", "Let a reviewer inspect the evidence", "A reviewer checks the candidates and the evidence behind each suggestion, then confirms or corrects the diagnosis."],
      ["Update", "Use the correction", "The review creates a labelled signal that can support later updates and further evaluation."],
    ],
  },
  video: {
    name: "VidForge",
    color: [255, 188, 166],
    link: "./projects.html#vidforge",
    linkText: "Explore VidForge",
    stages: [
      ["Brief", "Read the product assets", "Extract product attributes and visual context from the submitted materials to ground the rest of the workflow."],
      ["Script", "Plan the shots", "Translate the brief into a script and shot sequence. Keep the generation state available for inspection and revision."],
      ["Render", "Assemble the video", "Generate the shots and compose the timing, captions, and audio with FFmpeg."],
      ["Review", "Review the output", "Check generated material for issues and use the results to guide a revision or retry."],
    ],
  },
};

const field = document.querySelector(".fieldwork");
const controls = field.querySelector(".field-controls");
const board = field.querySelector("[data-field-board]");
const stageList = board.querySelector(".field-stages");
const tabs = [...field.querySelectorAll(".track-picker button")];
const play = controls.querySelector("[data-replay]");
const index = board.querySelector("[data-stage-index]");
const title = board.querySelector("[data-stage-title]");
const copy = board.querySelector("[data-stage-copy]");
const link = board.querySelector("[data-stage-link]");
const canvas = board.querySelector(".field-canvas");
const ctx = canvas.getContext("2d");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");

const route = new URL(location.href);
const requested = route.searchParams.get("track");
let key = Object.hasOwn(tracks, requested) ? requested : "autonomy";
let step = 0;
let timer = 0;
let frame = 0;
let width = 0;
let height = 0;
let visibleNodes = [];
let hoveredNode = -1;
let visibleProgress = 1;

function renderStep(position, animate = true) {
  step = position;
  const track = tracks[key];
  const [, heading, description] = track.stages[step];
  index.textContent = `${track.name.toUpperCase()} · ${step + 1} / ${track.stages.length}`;
  title.textContent = heading;
  copy.textContent = description;
  for (const [i, button] of [...stageList.querySelectorAll("button")].entries()) {
    if (i === step) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  }
  cancelAnimationFrame(frame);
  if (!animate || reduce.matches || !ctx) {
    draw(1);
    return;
  }
  const started = performance.now();
  function tick(time) {
    const progress = Math.min(1, (time - started) / 790);
    draw(1 - (1 - progress) ** 3);
    if (progress < 1) frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
}

function showTrack(next, updateUrl) {
  stopPlayback();
  key = next;
  const track = tracks[key];
  board.dataset.track = key;
  tabs.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.track === key)));
  link.href = track.link;
  link.textContent = track.linkText + " ↗";
  stageList.replaceChildren();
  track.stages.forEach(([label], i) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const number = document.createElement("span");
    button.type = "button";
    number.textContent = String(i + 1).padStart(2, "0");
    number.setAttribute("aria-hidden", "true");
    button.append(number, label);
    button.addEventListener("click", () => {
      stopPlayback();
      renderStep(i);
    });
    item.append(button);
    stageList.append(item);
  });
  if (updateUrl) {
    route.searchParams.set("track", key);
    route.hash = location.hash;
    history.replaceState(history.state, "", route);
  }
  renderStep(0, updateUrl);
}

function stopPlayback() {
  clearTimeout(timer);
  timer = 0;
  play.textContent = "Play walkthrough";
}

play.addEventListener("click", () => {
  if (timer) {
    stopPlayback();
    return;
  }
  renderStep(0);
  play.textContent = "Stop walkthrough";
  function advance() {
    const last = tracks[key].stages.length - 1;
    if (step === last) {
      stopPlayback();
      return;
    }
    renderStep(step + 1);
    timer = setTimeout(advance, 1500);
  }
  timer = setTimeout(advance, 1500);
});

tabs.forEach((button) => button.addEventListener("click", () => showTrack(button.dataset.track, true)));

function draw(progress) {
  if (!ctx || !width) return;
  const [r, g, b] = tracks[key].color;
  const ink = (alpha) => `rgba(${r},${g},${b},${alpha})`;
  const available = Math.max(100, height - stageList.offsetHeight);
  const center = available * 0.53;
  const scale = Math.min(1, width / 540);
  const spacing = width / 4.55;
  const patterns = {
    autonomy: [0.64, 0.36, 0.54, 0.29],
    gui: [0.36, 0.66, 0.39, 0.55],
    video: [0.45, 0.45, 0.45, 0.45],
  };
  const positions = patterns[key].map((y, i) => [width * 0.17 + i * spacing, available * y]);
  visibleNodes = positions;
  visibleProgress = progress;

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  // Contours, frame guides, and a waveform give each workflow a distinct visual shape.
  for (let x = 16; x < width; x += 20) {
    for (let y = 16; y < available; y += 20) {
      ctx.fillStyle = ink((x + y) % 3 === 0 ? 0.21 : 0.10);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  ctx.strokeStyle = ink(0.16);
  if (key === "autonomy") {
    for (let row = 0; row < 9; row++) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 5) {
        const y = center + (row - 4) * 18 + Math.sin(x / 61 + row * 0.2) * 27 + Math.cos(x / 128) * 28;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  if (key === "gui") {
    for (const [x, y] of positions) {
      ctx.strokeRect(x - 36 * scale, y - 28 * scale, 72 * scale, 56 * scale);
      ctx.strokeRect(x - 29 * scale, y - 20 * scale, 72 * scale, 56 * scale);
      ctx.beginPath();
      ctx.moveTo(x - 36 * scale, y - 17 * scale);
      ctx.lineTo(x + 36 * scale, y - 17 * scale);
      ctx.stroke();
    }
  }
  if (key === "video") {
    for (let x = 16; x < width - 10; x += 5) {
      const magnitude = (8 + Math.abs(Math.sin(x / 8) * Math.cos(x / 39)) * 44) * scale;
      ctx.fillStyle = ink(x % 3 ? 0.23 : 0.42);
      ctx.fillRect(x, center + 35 - magnitude / 2, 2, magnitude);
    }
    ctx.strokeRect(16, center - 78 * scale, width - 32, 35 * scale);
  }

  for (const [i, [x, y]] of positions.entries()) {
    if (i > 0) {
      const [px, py] = positions[i - 1];
      const target = i < step ? 1 : i === step ? progress : 0;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.bezierCurveTo(px + spacing * 0.54, py, x - spacing * 0.54, y, x, y);
      ctx.strokeStyle = ink(0.25);
      ctx.stroke();
      if (target > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, px + (x - px) * target + 1, height);
        ctx.clip();
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.bezierCurveTo(px + spacing * 0.54, py, x - spacing * 0.54, y, x, y);
        ctx.strokeStyle = ink(0.9);
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  for (const [i, [x, y]] of positions.entries()) {
    const active = i === step;
    if (active || i === hoveredNode) {
      const spread = (active ? 94 : 48) * scale;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, spread);
      glow.addColorStop(0, ink(active ? 0.44 : 0.29));
      glow.addColorStop(0.48, ink(0.12));
      glow.addColorStop(1, ink(0));
      ctx.fillStyle = glow;
      ctx.fillRect(x - spread, y - spread, 2 * spread, 2 * spread);
    }
    if (active) {
      ctx.beginPath();
      ctx.arc(x, y, (25 + progress * 8) * scale, 0, Math.PI * 2);
      ctx.strokeStyle = ink(0.53);
      ctx.setLineDash([2, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.arc(x, y, Math.max(13, 18 * scale), 0, Math.PI * 2);
    ctx.fillStyle = active ? ink(0.95) : "#182338";
    ctx.fill();
    ctx.strokeStyle = ink(i <= step ? 0.85 : 0.42);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 12px ui-monospace, monospace";
    ctx.fillStyle = active ? "#10152a" : ink(0.91);
    ctx.fillText(String(i + 1).padStart(2, "0"), x, y + 0.5);
  }
}

function nodeAtEvent(event) {
  const box = canvas.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  return visibleNodes.findIndex(([px, py]) => Math.hypot(px - x, py - y) <= 23);
}

canvas.addEventListener("pointermove", (event) => {
  const next = nodeAtEvent(event);
  if (next === hoveredNode) return;
  hoveredNode = next;
  canvas.style.cursor = next >= 0 ? "pointer" : "";
  draw(visibleProgress);
});

canvas.addEventListener("pointerleave", () => {
  hoveredNode = -1;
  canvas.style.cursor = "";
  draw(visibleProgress);
});

canvas.addEventListener("click", (event) => {
  const next = nodeAtEvent(event);
  if (next < 0) return;
  stopPlayback();
  renderStep(next);
});

controls.hidden = false;
board.hidden = false;
showTrack(key, false);

if (ctx) {
  new ResizeObserver(() => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const dpi = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpi);
    canvas.height = Math.round(height * dpi);
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
    draw(1);
  }).observe(canvas);
  reduce.addEventListener("change", () => {
    cancelAnimationFrame(frame);
    draw(1);
  });
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopPlayback();
});
