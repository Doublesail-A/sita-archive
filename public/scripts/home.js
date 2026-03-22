(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const menu = $("#menu");
  document.addEventListener("click", (event) => {
    if (!menu || !menu.hasAttribute("open")) return;
    if (event.target instanceof Node && !menu.contains(event.target)) {
      menu.removeAttribute("open");
    }
  });

  $$('[data-activate]').forEach((element) => {
    element.addEventListener("click", () => {
      $$('[data-activate]').forEach((item) => item.classList.remove("is-on"));
      element.classList.add("is-on");
    });
  });

  const mobileLayer = $("[data-mobile-slides]");
  const desktopLayer = $("[data-desktop-slides]");
  const mq = window.matchMedia("(max-width: 820px)");

  const syncSlides = () => {
    if (mq.matches) {
      if (mobileLayer) mobileLayer.style.display = "block";
      if (desktopLayer) desktopLayer.style.display = "none";
    } else {
      if (mobileLayer) mobileLayer.style.display = "none";
      if (desktopLayer) desktopLayer.style.display = "block";
    }
  };

  syncSlides();
  mq.addEventListener?.("change", syncSlides);

  const strip = $("[data-movies-strip]");
  const prev = $("[data-movies-prev]");
  const next = $("[data-movies-next]");
  if (!strip) return;

  const getCardWidth = () => {
    const card = $(".movie-card", strip);
    if (!card) return 320;
    const styles = window.getComputedStyle(strip);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const scrollCards = (direction) => {
    strip.scrollBy({ left: direction * getCardWidth(), behavior: "smooth" });
  };

  prev?.addEventListener("click", () => scrollCards(-1));
  next?.addEventListener("click", () => scrollCards(1));
})();
