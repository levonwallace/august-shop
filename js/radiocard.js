/* August — AUGUST AUX card (Card 4)
   3×3 paginated mix grid mirroring august-shop.com/blogs/august-aux.
   Real mix titles where known; placeholder entries elsewhere — swap each
   tile's click for its SoundCloud/Spotify embed at port time. */
document.addEventListener("DOMContentLoaded", () => {
  const radioCard = document.querySelector(".card-stack__card--radio");
  if (!radioCard || !window.AugustAux) return;

  const gridEl = radioCard.querySelector("[data-aux-grid]");
  const pagesEl = radioCard.querySelector("[data-aux-pages]");
  const playBtn = radioCard.querySelector("[data-radio-play]");
  const playIcon = playBtn?.querySelector(".radio-hero__play-icon");
  const pauseIcon = playBtn?.querySelector(".radio-hero__pause-icon");
  const titleEl = radioCard.querySelector("[data-radio-title]");
  const subEl = radioCard.querySelector("[data-radio-sub]");
  const radioWrapper = radioCard.querySelector(".radio-card");
  const barEl = radioCard.querySelector("[data-radio-bar]");
  const expandBtn = radioCard.querySelector("[data-radio-expand]");
  const seekEl = radioCard.querySelector("[data-radio-seek]");
  const seekFill = radioCard.querySelector("[data-radio-seek-fill]");
  const timeEl = radioCard.querySelector("[data-radio-time]");
  const prevBtn = radioCard.querySelector("[data-radio-prev]");
  const nextBtn = radioCard.querySelector("[data-radio-next]");

  /* The AUX card owns its audio — no floating mini player anywhere.
     Three local files cycle as stand-ins until real embeds land. */
  const audio = new Audio();
  audio.preload = "metadata";
  const MIXES = window.AugustAux.MIXES;

  const PAGE_SIZE = 9;
  const PAGES = Math.ceil(MIXES.length / PAGE_SIZE);

  let page = 0;
  let selectedNo = MIXES[0].no;

  /* ── Rendering ───────────────────────────────────────────── */
  const renderGrid = () => {
    if (!gridEl) return;
    const slice = MIXES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
    gridEl.innerHTML = slice
      .map((m) => `
      <a class="radio-cover aux-tile${m.no === selectedNo ? " is-active" : ""}" href="mix.html?m=${m.no}" data-aux-no="${m.no}" aria-label="AUGUST AUX ${m.no} — ${m.name}">
        <div class="aux-tile__art"><img src="${m.art}" alt="" loading="lazy" /></div>
        <span class="aux-tile__no">AUX :: ${m.no} · ${m.genre}</span>
        <span class="aux-tile__title">${m.name}</span>
      </a>`)
      .join("");
  };

  const renderPages = () => {
    if (!pagesEl) return;
    let html = `<button class="aux-page aux-page--nav" type="button" data-aux-page="prev" aria-label="Previous page"${page === 0 ? " disabled" : ""}>‹</button>`;
    for (let i = 0; i < PAGES; i++) {
      html += `<button class="aux-page${i === page ? " is-active" : ""}" type="button" data-aux-page="${i}" aria-label="Page ${i + 1}"${i === page ? ' aria-current="page"' : ""}>${i + 1}</button>`;
    }
    html += `<button class="aux-page aux-page--nav" type="button" data-aux-page="next" aria-label="Next page"${page === PAGES - 1 ? " disabled" : ""}>›</button>`;
    pagesEl.innerHTML = html;
  };

  /* ── Player ──────────────────────────────────────────────── */
  const syncPlayState = () => {
    const playing = !audio.paused && !audio.ended;
    if (radioWrapper) radioWrapper.classList.toggle("is-playing", playing);
    // toggleAttribute, not .hidden — the icons are SVG elements, which
    // don't implement the HTMLElement `hidden` property.
    if (playIcon) playIcon.toggleAttribute("hidden", playing);
    if (pauseIcon) pauseIcon.toggleAttribute("hidden", !playing);
    if (playBtn) playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  };

  const selectMix = (no, autoplay = true) => {
    const idx = MIXES.findIndex((m) => m.no === no);
    if (idx === -1) return;
    const mix = MIXES[idx];
    selectedNo = no;

    if (titleEl) {
      titleEl.textContent = `AUGUST AUX :: ${mix.no}`;
      if (titleEl.tagName === "A") titleEl.setAttribute("href", `mix.html?m=${mix.no}`);
    }
    if (subEl) subEl.textContent = mix.name;

    audio.src = mix.src;
    if (autoplay) {
      audio.play().catch(() => {});
    }

    renderGrid();
    syncPlayState();
  };

  const togglePlay = () => {
    if (!audio.src) {
      selectMix(selectedNo);
      return;
    }
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const stepMix = (dir) => {
    const idx = MIXES.findIndex((m) => m.no === selectedNo);
    const next = MIXES[(idx + dir + MIXES.length) % MIXES.length];
    selectMix(next.no);
  };

  /* ── Expand / collapse (tap the bar, iOS mini-player style) ─ */
  const setExpanded = (open) => {
    if (!barEl) return;
    barEl.classList.toggle("is-expanded", open);
    expandBtn?.setAttribute("aria-expanded", String(open));
    expandBtn?.setAttribute("aria-label", open ? "Collapse player" : "Expand player");
  };

  barEl?.addEventListener("click", (e) => {
    // Buttons and the seek slider do their own thing
    if (e.target.closest("button, a, .radio-seek")) return;
    e.stopPropagation();
    setExpanded(!barEl.classList.contains("is-expanded"));
  });

  expandBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    setExpanded(!barEl.classList.contains("is-expanded"));
  });

  /* ── Seek + time ─────────────────────────────────────────── */
  const fmt = (sec) => {
    if (!Number.isFinite(sec)) return "0:00";
    const s = Math.max(0, Math.floor(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const paintProgress = () => {
    const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
    if (seekFill) seekFill.style.width = `${ratio * 100}%`;
    if (seekEl) seekEl.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    if (timeEl) timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration || 0)}`;
  };

  const seekFromEvent = (e) => {
    if (!audio.duration || !seekEl) return;
    const rect = seekEl.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    paintProgress();
  };

  if (seekEl) {
    seekEl.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      seekEl.setPointerCapture(e.pointerId);
      seekFromEvent(e);
    });
    seekEl.addEventListener("pointermove", (e) => {
      if (!seekEl.hasPointerCapture(e.pointerId)) return;
      seekFromEvent(e);
    });
    seekEl.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      }
      paintProgress();
    });
  }

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    stepMix(-1);
  });
  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    stepMix(1);
  });

  audio.addEventListener("timeupdate", paintProgress);
  audio.addEventListener("loadedmetadata", paintProgress);

  /* ── Events ──────────────────────────────────────────────── */
  gridEl?.addEventListener("click", (e) => {
    const tile = e.target.closest("[data-aux-no]");
    if (!tile) return;
    // Links navigate to mix.html — don't hijack.
    if (tile.tagName === "A") return;
    e.stopPropagation();
    selectMix(tile.getAttribute("data-aux-no"));
  });

  pagesEl?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-aux-page]");
    if (!btn || btn.disabled) return;
    e.stopPropagation();
    const v = btn.getAttribute("data-aux-page");
    if (v === "prev") page = Math.max(0, page - 1);
    else if (v === "next") page = Math.min(PAGES - 1, page + 1);
    else page = Number(v);
    renderGrid();
    renderPages();
    // Bring the top of the grid back into view when flipping pages
    gridEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  if (playBtn) {
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlay();
    });
  }

  audio.addEventListener("play", syncPlayState);
  audio.addEventListener("pause", syncPlayState);
  // Auto-advance to the next mix in the archive when one ends
  audio.addEventListener("ended", () => {
    const idx = MIXES.findIndex((m) => m.no === selectedNo);
    const next = MIXES[(idx + 1) % MIXES.length];
    selectMix(next.no);
  });

  const eventsEl = radioCard.querySelector("[data-aux-events]");
  if (eventsEl) {
    eventsEl.innerHTML = window.AugustAux.EVENTS.slice(0, 9)
      .map(
        (ev) => `
      <li>
        <a class="aux-event" href="event.html?e=${ev.id}">
          <div class="aux-event__meta">
            <span class="aux-event__series">${ev.series}</span>
            <span class="aux-event__date">${ev.date}</span>
          </div>
          <h3 class="aux-event__title">${ev.title}</h3>
          <p class="aux-event__excerpt">${ev.excerpt}</p>
        </a>
      </li>`
      )
      .join("");
  }

  /* ── Newsletter (prototype: confirm inline, no backend) ──── */
  const newsForm = radioCard.querySelector("[data-aux-newsletter]");
  if (newsForm) {
    newsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = newsForm.querySelector("button[type=submit]");
      const input = newsForm.querySelector("input[type=email]");
      if (btn) {
        btn.textContent = "Joined ✓";
        btn.disabled = true;
      }
      if (input) input.disabled = true;
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  renderGrid();
  renderPages();
});
