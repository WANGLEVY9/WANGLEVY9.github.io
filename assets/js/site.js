const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

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
    if (window.innerWidth > 780) setMenu(false);
  },
  { passive: true },
);

let scrollFrame = 0;

function updateScrollState() {
  scrollFrame = 0;
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

  header?.classList.toggle("is-scrolled", window.scrollY > 14);
  document.documentElement.style.setProperty(
    "--scroll-progress",
    Math.min(1, Math.max(0, progress)).toFixed(4),
  );
}

function requestScrollUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollState);
}

updateScrollState();
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -34px" },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min((index % 4) * 64, 192)}ms`;
  revealObserver.observe(element);
});

function initTabs(container, tabAttribute, panelAttribute, containerAttribute) {
  if (!container) return;

  const tabs = [...container.querySelectorAll(`[${tabAttribute}]`)];
  const panels = [...container.querySelectorAll(`[${panelAttribute}]`)];

  if (!tabs.length || !panels.length) return;

  function activate(tab, moveFocus = false) {
    const value = tab.getAttribute(tabAttribute);

    tabs.forEach((candidate) => {
      candidate.setAttribute("aria-selected", String(candidate === tab));
      candidate.tabIndex = candidate === tab ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.getAttribute(panelAttribute) !== value;
    });

    container.setAttribute(containerAttribute, value);
    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex === null) return;
      event.preventDefault();
      activate(tabs[nextIndex], true);
    });
  });

  const initiallySelected =
    tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
  activate(initiallySelected);
}

document.querySelectorAll("[data-instrument]").forEach((container) => {
  initTabs(container, "data-process-tab", "data-process-panel", "data-mode");
});

document.querySelectorAll("[data-trace-card]").forEach((container) => {
  initTabs(container, "data-trace-tab", "data-trace-panel", "data-trace-stage");
});

document.querySelectorAll("[data-governance]").forEach((container) => {
  initTabs(
    container,
    "data-governance-tab",
    "data-governance-panel",
    "data-governance-stage",
  );
});

document.querySelectorAll("[data-workflow]").forEach((container) => {
  initTabs(container, "data-workflow-tab", "data-workflow-panel", "data-stage");
});

const gallery = document.querySelector("[data-photo-gallery]");

if (gallery) {
  const gallerySection = gallery.closest(".field-notes");
  const slides = [...gallery.querySelectorAll(".tencent-photo")];
  const previousButton = gallerySection?.querySelector("[data-gallery-prev]");
  const nextButton = gallerySection?.querySelector("[data-gallery-next]");
  const counter = gallerySection?.querySelector("[data-gallery-counter]");
  const lightbox = gallerySection?.querySelector("[data-photo-lightbox]");
  const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
  const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
  const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");
  const lightboxTriggers = slides.map((slide) =>
    slide.querySelector("[data-lightbox-open]"),
  );
  let activeIndex = 0;
  let lastLightboxTrigger = null;
  let dragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let suppressClick = false;
  let pointerId = null;

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

    activeIndex = closestIndex;

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

  function updateLightbox(index) {
    const safeIndex = Math.min(slides.length - 1, Math.max(0, index));
    const slide = slides[safeIndex];
    const trigger = lightboxTriggers[safeIndex];
    const image = slide.querySelector("img");

    activeIndex = safeIndex;
    if (lightboxImage) {
      lightboxImage.src = trigger?.dataset.lightboxSrc || image.src;
      lightboxImage.alt = image.alt;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = trigger?.dataset.lightboxCaption || "";
    }
  }

  function openLightbox(index) {
    if (!lightbox || !lightboxImage) return;

    lastLightboxTrigger = lightboxTriggers[index];
    updateLightbox(index);

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    } else {
      lightbox.setAttribute("open", "");
    }
  }

  function closeLightbox() {
    if (!lightbox) return;

    if (typeof lightbox.close === "function" && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
    }
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
    dragMoved = false;
    dragStartX = event.clientX;
    dragStartScroll = gallery.scrollLeft;
    pointerId = event.pointerId;
  });

  gallery.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const delta = event.clientX - dragStartX;

    if (!dragMoved && Math.abs(delta) <= 6) return;

    if (!dragMoved) {
      dragMoved = true;
      gallery.classList.add("is-dragging");
      gallery.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    gallery.scrollLeft = dragStartScroll - delta;
  });

  gallery.addEventListener("dragstart", (event) => event.preventDefault());

  function endGalleryDrag(event) {
    if (!dragging) return;

    dragging = false;
    suppressClick = dragMoved;
    gallery.classList.remove("is-dragging");

    if (gallery.hasPointerCapture(event.pointerId)) {
      gallery.releasePointerCapture(event.pointerId);
    }

    pointerId = null;
    updateGalleryState();
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  }

  gallery.addEventListener("pointerup", endGalleryDrag);
  gallery.addEventListener("pointercancel", endGalleryDrag);
  gallery.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );

  lightboxTriggers.forEach((trigger, index) => {
    trigger?.addEventListener("click", () => openLightbox(index));
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox?.addEventListener("close", () => {
    lastLightboxTrigger?.focus();
  });
  lightbox?.addEventListener("cancel", () => {
    if (typeof lightbox.close !== "function") {
      lightbox.removeAttribute("open");
    }
  });
  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateLightbox(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateLightbox(activeIndex + 1);
    }
  });

  gallery.addEventListener("scroll", updateGalleryState, { passive: true });
  window.addEventListener("resize", updateGalleryState, { passive: true });
  gallery
    .querySelectorAll("img")
    .forEach((image) => image.addEventListener("load", updateGalleryState));

  updateGalleryState();
}
