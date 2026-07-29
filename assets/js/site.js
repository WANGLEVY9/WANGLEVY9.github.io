const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const year = document.querySelector("[data-year]");
const canvas = document.querySelector("[data-research-canvas]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (year) {
  year.textContent = new Date().getFullYear();
}

function setMenu(open) {
  if (!menuButton || !mobileNav) return;

  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation menu" : "Open navigation menu",
  );
  mobileNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.13, rootMargin: "0px 0px -36px" },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
  revealObserver.observe(element);
});

const navLinks = [...document.querySelectorAll(".desktop-nav a")];
const sections = [...document.querySelectorAll("[data-section]")];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === `#${visible.target.id}`,
      );
    });
  },
  { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.3] },
);

sections.forEach((section) => sectionObserver.observe(section));

function createResearchField() {
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const particles = [];
  let frame = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles.length = 0;
    const count = width < 720 ? 22 : 46;

    for (let index = 0; index < count; index += 1) {
      const zoneStart = width < 720 ? width * 0.18 : width * 0.42;
      particles.push({
        x: zoneStart + Math.random() * (width - zoneStart),
        y: 80 + Math.random() * (height - 160),
        radius: Math.random() * 1.8 + 0.7,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(timestamp = 0) {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      const drift = reducedMotion.matches ? 0 : Math.sin(timestamp / 1800 + particle.phase) * 5;
      const x = particle.x + drift;
      const y = particle.y + Math.cos(timestamp / 2200 + particle.phase) * 4;

      context.beginPath();
      context.arc(x, y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = index % 5 === 0 ? "rgba(173,139,80,.68)" : "rgba(20,59,52,.42)";
      context.fill();

      particles.slice(index + 1).forEach((other) => {
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 126) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = `rgba(20,59,52,${0.12 * (1 - distance / 126)})`;
          context.lineWidth = 1;
          context.stroke();
        }
      });
    });

    if (!reducedMotion.matches) {
      frame = window.requestAnimationFrame(draw);
    }
  }

  resize();
  draw();

  window.addEventListener("resize", resize, { passive: true });
  reducedMotion.addEventListener("change", () => {
    window.cancelAnimationFrame(frame);
    draw();
  });
}

createResearchField();
