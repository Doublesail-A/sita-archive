(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isHome = document.body.classList.contains("home-page");
  let panelWidth = 0;
  let panelMetricFrame = 0;
  const syncPanelMetrics = (force = false) => {
    if (!isHome) return;
    window.cancelAnimationFrame(panelMetricFrame);
    panelMetricFrame = window.requestAnimationFrame(() => {
      const viewport = window.visualViewport;
      const width = Math.round(viewport?.width || window.innerWidth);
      const height = Math.round(viewport?.height || window.innerHeight);
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      if (!force && coarsePointer && panelWidth && Math.abs(width - panelWidth) < 32) return;
      panelWidth = width;
      document.documentElement.style.setProperty("--panel-height", `${height}px`);
      document.documentElement.style.setProperty("--panel-width", `${width}px`);
    });
  };
  syncPanelMetrics(true);
  window.addEventListener("resize", () => syncPanelMetrics(false), { passive: true });
  window.addEventListener("orientationchange", () => window.setTimeout(() => syncPanelMetrics(true), 180), { passive: true });
  const loader = document.querySelector("[data-page-loader]");
  if (loader) document.documentElement.classList.add("is-loading");
  const finishLoading = () => {
    loader?.classList.add("is-done");
    window.setTimeout(() => document.documentElement.classList.remove("is-loading"), reducedMotion ? 0 : 720);
  };

  if (document.readyState === "complete") {
    window.setTimeout(finishLoading, reducedMotion ? 0 : 340);
  } else {
    window.addEventListener("load", () => window.setTimeout(finishLoading, reducedMotion ? 0 : 340), { once: true });
    window.setTimeout(finishLoading, 1600);
  }

  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -9%", threshold: 0.08 },
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  const header = document.querySelector("[data-site-header]");
  const heroMedia = document.querySelector("[data-hero-media]");
  const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
  let ticking = false;
  let previousY = window.scrollY;

  const updateScrollEffects = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 38);
    if (header?.classList.contains("site-header--overlay")) {
      const menuOpen = Boolean(document.querySelector("[data-mobile-menu][open]"));
      const movingDown = y > previousY + 3;
      const movingUp = y < previousY - 3;
      if (y < 28 || menuOpen || movingUp) header.classList.remove("is-hidden");
      else if (movingDown && y > 92) header.classList.add("is-hidden");
    }
    if (!reducedMotion && heroMedia instanceof HTMLElement) {
      heroMedia.style.setProperty("--hero-shift", `${Math.min(y * 0.075, 72)}px`);
    }
    if (!reducedMotion) {
      parallaxItems.forEach((item) => {
        if (!(item instanceof HTMLElement)) return;
        const rect = item.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.045;
        item.style.setProperty("--parallax-y", `${Math.max(-28, Math.min(28, offset))}px`);
      });
    }
    previousY = y;
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollEffects);
  };
  updateScrollEffects();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });

  const snapSections = isHome ? Array.from(document.querySelectorAll("[data-snap-section]")) : [];
  const setActivePanel = (activePanel) => {
    snapSections.forEach((panel) => panel.classList.toggle("is-panel-active", panel === activePanel));
  };

  if (snapSections.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      snapSections.forEach((panel) => panel.classList.add("is-panel-active"));
    } else {
      const panelRatios = new Map();
      const panelObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => panelRatios.set(entry.target, entry.intersectionRatio));
          const activePanel = snapSections.reduce((best, panel) => {
            if (!best) return panel;
            return (panelRatios.get(panel) || 0) > (panelRatios.get(best) || 0) ? panel : best;
          }, null);
          if (activePanel && (panelRatios.get(activePanel) || 0) > 0) setActivePanel(activePanel);
        },
        { rootMargin: "-8% 0px -8%", threshold: [0, 0.12, 0.25, 0.4, 0.58, 0.75] },
      );
      snapSections.forEach((panel) => panelObserver.observe(panel));
    }

  }

  const dialog = document.querySelector("[data-video-dialog]");
  const frame = dialog?.querySelector("[data-video-frame]");
  const title = dialog?.querySelector("#video-modal-title");
  const closeButton = dialog?.querySelector("[data-video-close]");

  const closeVideo = () => {
    if (!(dialog instanceof HTMLDialogElement)) return;
    dialog.close();
    if (frame instanceof HTMLIFrameElement) frame.removeAttribute("src");
  };

  document.querySelectorAll("[data-video-open]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!(dialog instanceof HTMLDialogElement) || !(frame instanceof HTMLIFrameElement)) return;
      const bvid = button.getAttribute("data-video-id");
      if (!bvid) return;
      const videoTitle = button.getAttribute("data-video-title") || "MOVIE";
      if (title) title.textContent = videoTitle;
      frame.src = `https://player.bilibili.com/player.html?isOutside=true&bvid=${encodeURIComponent(bvid)}&p=1&high_quality=1&danmaku=0&autoplay=0`;
      dialog.showModal();
    });
  });

  closeButton?.addEventListener("click", closeVideo);
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeVideo();
  });
  dialog?.addEventListener("close", () => {
    if (frame instanceof HTMLIFrameElement) frame.removeAttribute("src");
  });
})();
