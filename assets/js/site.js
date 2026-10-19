const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const year = document.querySelector("[data-year]");
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth > 1080) setMenu(false);
  },
  { passive: true },
);

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
      const isActive = link.getAttribute("href") === `#${visible.target.id}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  },
  { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.3] },
);

sections.forEach((section) => sectionObserver.observe(section));

const gallery = document.querySelector("[data-tencent-gallery]");

if (gallery) {
  const slides = [...gallery.querySelectorAll(".tencent-photo")];
  const previousButton = document.querySelector("[data-gallery-prev]");
  const nextButton = document.querySelector("[data-gallery-next]");
  const counter = document.querySelector("[data-gallery-counter]");
  let dragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  function getLeadingIndex() {
    const leadingEdge = gallery.scrollLeft + 8;
    return Math.max(
      0,
      slides.findIndex(
        (slide) => slide.offsetLeft + slide.offsetWidth > leadingEdge,
      ),
    );
  }

  function updateGalleryState() {
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    let closestIndex = getLeadingIndex();

    if (gallery.scrollLeft >= maxScroll - 2) {
      closestIndex = slides.length - 1;
    }

    if (counter) {
      counter.textContent = `${String(closestIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    }

    if (previousButton) previousButton.disabled = gallery.scrollLeft <= 2;
    if (nextButton) nextButton.disabled = gallery.scrollLeft >= maxScroll - 2;
  }

  function moveGallery(direction) {
    const targetIndex = Math.min(
      slides.length - 1,
      Math.max(0, getLeadingIndex() + direction),
    );
    const targetLeft = slides[targetIndex].offsetLeft - slides[0].offsetLeft;

    gallery.scrollTo({
      left: targetLeft,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  }

  previousButton?.addEventListener("click", () => moveGallery(-1));
  nextButton?.addEventListener("click", () => moveGallery(1));

  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveGallery(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveGallery(1);
    }
  });

  gallery.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;

    dragging = true;
    dragStartX = event.clientX;
    dragStartScroll = gallery.scrollLeft;
    gallery.classList.add("is-dragging");
    gallery.setPointerCapture(event.pointerId);
  });

  gallery.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    event.preventDefault();
    gallery.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  gallery.addEventListener("dragstart", (event) => event.preventDefault());

  function endGalleryDrag(event) {
    if (!dragging) return;

    dragging = false;
    gallery.classList.remove("is-dragging");

    if (gallery.hasPointerCapture(event.pointerId)) {
      gallery.releasePointerCapture(event.pointerId);
    }

    updateGalleryState();
  }

  gallery.addEventListener("pointerup", endGalleryDrag);
  gallery.addEventListener("pointercancel", endGalleryDrag);
  gallery.addEventListener("scroll", updateGalleryState, { passive: true });
  window.addEventListener("resize", updateGalleryState, { passive: true });
  gallery
    .querySelectorAll("img")
    .forEach((image) => image.addEventListener("load", updateGalleryState));

  updateGalleryState();
}
