const instrument = document.querySelector(".instrument");
const controls = [...document.querySelectorAll("[data-project]")];
const projects = [...document.querySelectorAll(".project")];
const status = document.querySelector("[role='status']");
const sky = document.querySelector(".sky");
const canvas = sky.querySelector("canvas");
const motion = sky.querySelector(".motion");
const context = canvas.getContext("2d");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const colors = {
  autonomy: [187, 172, 255],
  gui: [142, 227, 250],
  video: [255, 188, 166],
};

let width = 0;
let height = 0;
let phase = 0.45;
let frame = 0;
let lastTime = 0;
let paused = reduced.matches;
let pointerX = 0;
let pointerY = 0;
let selected = "autonomy";

function select(project, announce = true) {
  selected = project;
  instrument.dataset.project = project;
  controls.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.project === project));
  });
  projects.forEach((panel) => {
    panel.hidden = panel.id !== project;
  });
  if (announce) {
    status.textContent = `Showing ${document.getElementById(project).querySelector("h2").textContent}`;
  }
  draw();
}

controls.forEach((button) => {
  button.addEventListener("click", () => select(button.dataset.project));
});

function makeStars() {
  let seed = 156;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  return Array.from({ length: 192 }, () => ({
    x: random(),
    y: random(),
    radius: 0.35 + random(),
    alpha: 0.18 + random() * 0.54,
  }));
}

const stars = makeStars();

function draw() {
  if (!context || width === 0) return;

  const [red, green, blue] = colors[selected];
  const ink = (alpha) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  const centerX = width * 0.5 + pointerX;
  const centerY = height * 0.46 + pointerY;
  const radius = Math.min(width * 0.22, height * 0.22);

  context.clearRect(0, 0, width, height);
  for (const star of stars) {
    context.fillStyle = ink(star.alpha);
    context.beginPath();
    context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
    context.fill();
  }

  const halo = context.createRadialGradient(centerX, centerY, radius * 0.45, centerX, centerY, radius * 2.65);
  halo.addColorStop(0, ink(0.26));
  halo.addColorStop(0.45, ink(0.09));
  halo.addColorStop(1, ink(0));
  context.fillStyle = halo;
  context.fillRect(0, 0, width, height);

  function orbit(scale, rotation, alpha, start = 0, end = Math.PI * 2) {
    context.beginPath();
    context.ellipse(centerX, centerY, radius * scale, radius * scale * 0.32, rotation, start, end);
    context.strokeStyle = ink(alpha);
    context.stroke();
  }

  const tilt = { autonomy: -0.30, gui: 0.37, video: -0.55 }[selected];
  [1.46, 1.62, 1.8, 2.0].forEach((scale, index) => orbit(scale, tilt, 0.45 - index * 0.08));
  orbit(1.52, -tilt - 0.1, 0.23);

  const sphere = context.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.4, radius * 0.12, centerX, centerY, radius);
  sphere.addColorStop(0, ink(0.39));
  sphere.addColorStop(0.93, "#111629");
  sphere.addColorStop(1, ink(0.55));
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fillStyle = "#101727";
  context.fill();
  context.fillStyle = sphere;
  context.fill();
  context.strokeStyle = ink(0.73);
  context.stroke();

  context.save();
  context.clip();
  context.strokeStyle = ink(0.27);
  for (let latitude = -4; latitude <= 4; latitude++) {
    const distance = latitude * radius * 0.2;
    const chord = Math.sqrt(radius ** 2 - distance ** 2);
    context.beginPath();
    context.ellipse(centerX, centerY + distance, chord, chord * 0.14, 0, 0, Math.PI);
    context.stroke();
  }
  for (let longitude = 0; longitude < 8; longitude++) {
    context.beginPath();
    const spread = Math.abs(Math.cos(phase + longitude * Math.PI / 8));
    context.ellipse(centerX, centerY, radius * spread, radius, 0.20, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();

  orbit(1.46, tilt, 0.71, 0, Math.PI);
  context.beginPath();
  context.setLineDash([2, 7]);
  context.arc(centerX, centerY, radius * 1.32, phase, phase + Math.PI * 2);
  context.strokeStyle = ink(0.48);
  context.stroke();
  context.setLineDash([]);

  [0, 2.25, 4.3].forEach((offset, index) => {
    const angle = phase * (index === 1 ? -0.65 : 1) + offset;
    const x = radius * 1.62 * Math.cos(angle);
    const y = radius * 1.62 * 0.32 * Math.sin(angle);
    context.beginPath();
    context.arc(centerX + x * Math.cos(tilt) - y * Math.sin(tilt), centerY + x * Math.sin(tilt) + y * Math.cos(tilt), 3, 0, Math.PI * 2);
    context.fillStyle = ink(1);
    context.shadowColor = ink(1);
    context.shadowBlur = 13;
    context.fill();
    context.shadowBlur = 0;
  });
}

function animate(time) {
  if (lastTime) phase += Math.min(time - lastTime, 50) * 0.00042;
  lastTime = time;
  draw();
  frame = requestAnimationFrame(animate);
}

function updateMotion() {
  motion.textContent = paused ? "Resume motion" : "Pause motion";
  cancelAnimationFrame(frame);
  lastTime = 0;
  if (!paused && !document.hidden) frame = requestAnimationFrame(animate);
  if (paused) {
    pointerX = 0;
    pointerY = 0;
    draw();
  }
}

select(selected, false);
if (context) {
  motion.hidden = false;
  motion.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
  });
  reduced.addEventListener("change", (event) => {
    paused = event.matches;
    updateMotion();
  });
  document.addEventListener("visibilitychange", updateMotion);
  sky.addEventListener("pointermove", (event) => {
    if (paused || event.pointerType !== "mouse") return;
    const box = sky.getBoundingClientRect();
    pointerX = (event.clientX - box.left - width / 2) * 0.04;
    pointerY = (event.clientY - box.top - height / 2) * 0.04;
  });
  sky.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
  });
  new ResizeObserver(() => {
    width = sky.clientWidth;
    height = sky.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    draw();
  }).observe(sky);
  updateMotion();
}
