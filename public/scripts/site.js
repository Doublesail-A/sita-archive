(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isHome = document.body.classList.contains("home-page");
  const loader = document.querySelector("[data-page-loader]");
  const finishLoading = () => loader?.classList.add("is-done");

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
            if (!isHome) observer.unobserve(entry.target);
          } else if (isHome) {
            entry.target.classList.remove("is-visible");
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

    const wheelMode = window.matchMedia("(min-width: 900px) and (min-height: 680px) and (hover: hover) and (pointer: fine)");
    let wheelIntent = 0;
    let wheelLocked = false;
    let wheelLockedAt = 0;
    let lockedPanel = null;
    let correctingLockedPanel = false;
    let lastWheelAt = 0;
    let unlockTimer = 0;

    const releaseWheel = () => {
      wheelLocked = false;
      wheelIntent = 0;
      lockedPanel = null;
      correctingLockedPanel = false;
      document.documentElement.classList.remove("is-section-switching");
      window.clearTimeout(unlockTimer);
    };

    const scheduleWheelRelease = () => {
      window.clearTimeout(unlockTimer);
      const minimumLockRemaining = Math.max(0, 1200 - (performance.now() - wheelLockedAt));
      unlockTimer = window.setTimeout(releaseWheel, Math.max(680, minimumLockRemaining));
    };

    const guardLockedPanel = () => {
      if (!wheelLocked || !lockedPanel) return;
      scheduleWheelRelease();
      if (performance.now() - wheelLockedAt < 720 || correctingLockedPanel) return;
      const offset = lockedPanel.getBoundingClientRect().top;
      if (Math.abs(offset) < 3) return;
      correctingLockedPanel = true;
      window.scrollTo({ top: window.scrollY + offset, behavior: "auto" });
      window.requestAnimationFrame(() => {
        correctingLockedPanel = false;
      });
    };

    const hasScrollableAncestor = (target, direction) => {
      let element = target instanceof Element ? target : null;
      while (element && element !== document.body) {
        const style = window.getComputedStyle(element);
        const canScroll = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2;
        if (canScroll) {
          if (direction > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 2) return true;
          if (direction < 0 && element.scrollTop > 2) return true;
        }
        element = element.parentElement;
      }
      return false;
    };

    const onSectionWheel = (event) => {
      if (!wheelMode.matches || reducedMotion || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (document.querySelector("dialog[open], [data-mobile-menu][open]")) return;
      if (window.visualViewport && Math.abs(window.visualViewport.scale - 1) > 0.01) return;

      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, button, [contenteditable='true'], iframe")) return;

      const direction = Math.sign(event.deltaY);
      if (!direction || hasScrollableAncestor(target, direction)) return;

      const current = snapSections.reduce((best, panel) => {
        if (!best) return panel;
        return Math.abs(panel.getBoundingClientRect().top) < Math.abs(best.getBoundingClientRect().top) ? panel : best;
      }, null);
      if (!current) return;

      const rect = current.getBoundingClientRect();
      const isOversized = rect.height > window.innerHeight + 64;
      if (isOversized && direction > 0 && rect.bottom > window.innerHeight + 32) return;
      if (isOversized && direction < 0 && rect.top < -32) return;

      event.preventDefault();
      if (wheelLocked) {
        scheduleWheelRelease();
        return;
      }

      const now = performance.now();
      if (now - lastWheelAt > 180 || Math.sign(wheelIntent) !== direction) wheelIntent = 0;
      lastWheelAt = now;
      const deltaFactor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      wheelIntent += event.deltaY * deltaFactor;
      if (Math.abs(wheelIntent) < 18) return;

      const currentIndex = snapSections.indexOf(current);
      const nextIndex = Math.max(0, Math.min(snapSections.length - 1, currentIndex + direction));
      if (nextIndex === currentIndex) {
        wheelIntent = 0;
        return;
      }

      const nextPanel = snapSections[nextIndex];
      wheelLocked = true;
      wheelLockedAt = performance.now();
      lockedPanel = nextPanel;
      wheelIntent = 0;
      document.documentElement.classList.add("is-section-switching");
      setActivePanel(nextPanel);
      nextPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      scheduleWheelRelease();
    };

    window.addEventListener("wheel", onSectionWheel, { passive: false });
    window.addEventListener("scroll", guardLockedPanel, { passive: true });
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
