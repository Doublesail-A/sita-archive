(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
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

  const updateScrollEffects = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 38);
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
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollEffects);
  };
  updateScrollEffects();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });

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
