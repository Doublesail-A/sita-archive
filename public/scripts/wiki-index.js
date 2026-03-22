(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const dataEl = document.getElementById("wikiIndexData");
  const listEl = document.getElementById("wikiIndex");
  const inputEl = document.getElementById("wikiSearchInput");
  const clearBtn = document.getElementById("wikiSearchClear");
  const hintEl = document.getElementById("wikiSearchHint");

  if (!dataEl || !listEl || !(inputEl instanceof HTMLInputElement) || !(clearBtn instanceof HTMLButtonElement) || !hintEl) {
    return;
  }

  let data = [];
  try {
    data = JSON.parse(dataEl.textContent || "[]");
  } catch {
    data = [];
  }

  const normalize = (value) => String(value || "").trim().replace(/\s+/g, "").toLowerCase();

  const render = (items, query) => {
    listEl.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "empty-note";
      empty.textContent = query ? "没有匹配结果。" : "这里还没有 wiki 条目。";
      listEl.appendChild(empty);
      hintEl.textContent = query ? "找到 0 条结果" : "共 0 条";
      return;
    }

    hintEl.textContent = query ? `找到 ${items.length} 条结果` : `共 ${items.length} 条`;

    for (const item of items) {
      const anchor = document.createElement("a");
      anchor.className = "wiki-row";
      anchor.href = item.url;

      const date = document.createElement("div");
      date.className = "wiki-row__date";
      date.textContent = item.date || "—";

      const main = document.createElement("div");
      main.className = "wiki-row__main";

      if (item.hasPreview && item.cover) {
        const coverShell = document.createElement("div");
        coverShell.className = "wiki-row__cover-shell";

        const cover = document.createElement("img");
        cover.className = "wiki-row__cover";
        cover.src = item.cover;
        cover.alt = "";
        cover.loading = "lazy";
        coverShell.appendChild(cover);
        main.appendChild(coverShell);
      }

      const title = document.createElement("div");
      title.className = "wiki-row__title";
      title.textContent = item.title;
      main.appendChild(title);

      if (item.desc) {
        const desc = document.createElement("div");
        desc.className = "wiki-row__desc";
        desc.textContent = item.desc;
        main.appendChild(desc);
      }

      const arrow = document.createElement("div");
      arrow.className = "wiki-row__arrow";
      arrow.textContent = "↗";

      anchor.appendChild(date);
      anchor.appendChild(main);
      anchor.appendChild(arrow);
      listEl.appendChild(anchor);
    }
  };

  const filter = () => {
    const query = normalize(inputEl.value);
    if (!query) {
      render(data, "");
      return;
    }

    const items = data.filter((item) => {
      return [item.title, item.desc, item.url].some((value) => normalize(value).includes(query));
    });

    render(items, query);
  };

  inputEl.addEventListener("input", filter);
  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      filter();
    }
  });

  clearBtn.addEventListener("click", () => {
    inputEl.value = "";
    inputEl.focus();
    render(data, "");
  });
})();
