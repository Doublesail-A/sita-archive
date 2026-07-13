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

  document.querySelectorAll("[data-film-carousel]").forEach((carousel) => {
    const cards = Array.from(carousel.querySelectorAll("[data-film-card]"));
    const filmSection = carousel.closest(".film-section");
    const filmGrid = carousel.querySelector(".film-grid");
    const touchSurface = filmSection || carousel;
    if (cards.length < 2) return;

    let activeIndex = 0;
    let mobilePage = 0;
    let mobilePageCount = 1;
    let mobileVisibleCount = 1;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchConsumed = false;
    let wheelDelta = 0;
    let wheelGestureActive = false;
    let wheelIdleTimer = 0;
    let departureLockedUntil = 0;

    const isMobileFilms = () => window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;

    const isFilmPanelAligned = () => {
      if (!(filmSection instanceof HTMLElement)) return false;
      const rect = filmSection.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const visibleRatio = visibleHeight / Math.max(1, Math.min(rect.height, viewportHeight));
      return visibleRatio >= 0.82 && Math.abs(rect.top) <= viewportHeight * 0.2;
    };

    const getFilmDirectionBounds = () => {
      if (isMobileFilms()) {
        return { canMoveBack: mobilePage > 0, canMoveForward: mobilePage < mobilePageCount - 1 };
      }
      return { canMoveBack: activeIndex > 0, canMoveForward: activeIndex < cards.length - 1 };
    };

    const renderFilmTrack = () => {
      if (isMobileFilms() && filmGrid instanceof HTMLElement) {
        const gap = 11;
        const availableHeight = Math.max(120, filmGrid.clientHeight);
        const preferredHeight = window.innerHeight <= 700 ? 126 : 142;
        mobileVisibleCount = Math.max(1, Math.min(3, cards.length, Math.floor((availableHeight + gap) / (preferredHeight + gap))));
        mobilePageCount = Math.ceil(cards.length / mobileVisibleCount);
        mobilePage = Math.min(mobilePage, mobilePageCount - 1);
        const cardHeight = Math.min(188, Math.floor((availableHeight - gap * (mobileVisibleCount - 1)) / mobileVisibleCount));
        cards.forEach((card, index) => {
          const column = Math.floor(index / mobileVisibleCount);
          const row = index % mobileVisibleCount;
          const mobileState = column === mobilePage ? "visible" : column < mobilePage ? "before" : "after";
          card.setAttribute("data-film-mobile-state", mobileState);
          card.style.setProperty("--film-mobile-x", `${(column - mobilePage) * 106}%`);
          card.style.setProperty("--film-mobile-y", `${row * (cardHeight + gap)}px`);
          card.style.setProperty("--film-mobile-h", `${cardHeight}px`);
          card.setAttribute("aria-hidden", mobileState === "visible" ? "false" : "true");
          card.tabIndex = mobileState === "visible" ? 0 : -1;
        });
        return;
      }

      cards.forEach((card) => {
        card.removeAttribute("data-film-mobile-state");
        card.style.removeProperty("--film-mobile-x");
        card.style.removeProperty("--film-mobile-y");
        card.style.removeProperty("--film-mobile-h");
      });
      cards.forEach((card, index) => {
        const state = index === activeIndex ? "main" : index === activeIndex + 1 ? "next" : index < activeIndex ? "before" : "after";
        card.setAttribute("data-film-state", state);
        card.setAttribute("aria-hidden", state === "main" || state === "next" ? "false" : "true");
        card.tabIndex = state === "main" || state === "next" ? 0 : -1;
      });
    };

    const moveFilmTrack = (direction) => {
      if (isMobileFilms()) {
        mobilePage = Math.max(0, Math.min(mobilePageCount - 1, mobilePage + direction));
      } else {
        activeIndex = Math.max(0, Math.min(cards.length - 1, activeIndex + direction));
      }
      renderFilmTrack();
    };

    const leaveFilmPanel = (direction) => {
      if (!(filmSection instanceof HTMLElement)) return;
      const panels = Array.from(document.querySelectorAll("[data-snap-section]"));
      const panelIndex = panels.indexOf(filmSection);
      const target = panels[panelIndex + direction];
      if (!(target instanceof HTMLElement)) return;
      departureLockedUntil = performance.now() + 920;
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    };

    carousel.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const bounds = getFilmDirectionBounds();
      if ((direction > 0 && !bounds.canMoveForward) || (direction < 0 && !bounds.canMoveBack)) return;
      event.preventDefault();
      moveFilmTrack(direction);
    });

    window.addEventListener("wheel", (event) => {
      if (performance.now() < departureLockedUntil) {
        event.preventDefault();
        return;
      }
      if (!isFilmPanelAligned() || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();

      window.clearTimeout(wheelIdleTimer);
      wheelIdleTimer = window.setTimeout(() => {
        wheelDelta = 0;
        wheelGestureActive = false;
      }, 220);

      if (wheelGestureActive) return;
      wheelDelta += event.deltaY;
      if (Math.abs(wheelDelta) < 28) return;

      wheelGestureActive = true;
      const direction = event.deltaY > 0 ? 1 : -1;
      const bounds = getFilmDirectionBounds();
      const canMove = direction > 0 ? bounds.canMoveForward : bounds.canMoveBack;
      wheelDelta = 0;
      if (canMove) moveFilmTrack(direction);
      else leaveFilmPanel(direction);
    }, { passive: false });

    touchSurface.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchConsumed = false;
    }, { passive: true });

    touchSurface.addEventListener("touchmove", (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      if (performance.now() < departureLockedUntil) {
        event.preventDefault();
        return;
      }
      if (!isFilmPanelAligned()) return;
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaY) < 8 || Math.abs(deltaY) <= Math.abs(deltaX)) return;
      event.preventDefault();
      if (touchConsumed || Math.abs(deltaY) < 46) return;
      touchConsumed = true;
      const direction = deltaY < 0 ? 1 : -1;
      const bounds = getFilmDirectionBounds();
      const canMove = direction > 0 ? bounds.canMoveForward : bounds.canMoveBack;
      if (canMove) moveFilmTrack(direction);
      else leaveFilmPanel(direction);
    }, { passive: false });

    touchSurface.addEventListener("touchend", () => {
      touchConsumed = false;
    }, { passive: true });

    let filmResizeFrame = 0;
    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(filmResizeFrame);
      filmResizeFrame = window.requestAnimationFrame(renderFilmTrack);
    }, { passive: true });

    renderFilmTrack();
  });

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
