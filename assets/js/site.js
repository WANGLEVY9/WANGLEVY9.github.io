const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const year = document.querySelector("[data-year]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (year) year.textContent = new Date().getFullYear();

function setMenu(open) {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  mobileNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});
mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const reveals = [...document.querySelectorAll(".reveal")];
if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  reveals.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -28px" });
  reveals.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min((index % 4) * 65, 195)}ms`;
    revealObserver.observe(element);
  });
}

const navLinks = [...document.querySelectorAll(".desktop-nav a")];
const sections = [...document.querySelectorAll("[data-section]")];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-25% 0px -62%", threshold: [0.04, 0.2, 0.5] });
  sections.forEach((section) => sectionObserver.observe(section));
}

const typingTarget = document.querySelector("[data-typing]");
const messages = ["ship carefully.", "test the boundary.", "leave a useful trace."];
let messageIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeMessage() {
  if (!typingTarget || reducedMotion.matches) return;
  const message = messages[messageIndex];
  characterIndex += deleting ? -1 : 1;
  typingTarget.textContent = message.slice(0, characterIndex);
  let delay = deleting ? 38 : 72;
  if (!deleting && characterIndex === message.length) { deleting = true; delay = 1800; }
  if (deleting && characterIndex === 0) { deleting = false; messageIndex = (messageIndex + 1) % messages.length; delay = 420; }
  window.setTimeout(typeMessage, delay);
}

if (typingTarget && !reducedMotion.matches) window.setTimeout(typeMessage, 1000);
reducedMotion.addEventListener("change", (event) => {
  if (event.matches && typingTarget) typingTarget.textContent = messages[0];
});
