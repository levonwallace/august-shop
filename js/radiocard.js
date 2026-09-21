/* August — AUGUST AUX card (Card 4)
   3×3 paginated mix grid mirroring august-shop.com/blogs/august-aux.
   Real mix titles where known; placeholder entries elsewhere — swap each
   tile's click for its SoundCloud/Spotify embed at port time. */
document.addEventListener("DOMContentLoaded", () => {
  const radioCard = document.querySelector(".card-stack__card--radio");
  if (!radioCard) return;

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
  const STAND_INS = [
    "assets/radio-vol-14.wav",
    "assets/radio-vol-15.wav",
    "assets/radio-vol-16.wav",
  ];

  /* ── Archive data ─────────────────────────────────────────
     078 … 016 descending = 63 mixes = 7 pages × 9 (matches the live
     archive's 7 pages). KNOWN entries are real mixes from the AUX blog. */
  const KNOWN = {
    78: ["Madison After Hours", "House"],
    77: ["State Street Mix", "Garage"],
    76: ["Late Light", "Ambient"],
    75: ["DJ Azza Mix", "House"],
    63: ["“Access Granted” — Live from the Shop", "Garage/House"],
    62: ["“Mixcult Radio” by Kirill Matveev", "Minimal/Dub"],
    61: ["“Vinyl Bedroom Session” by Ido Haber", "House"],
    60: ["“TR-909 G-House Tribute” by Samuel Wallner", "House"],
    59: ["“Nachtstrom Schallplatten Showcase” by October Rust", "Dark/Techno"],
    58: ["“Pharoah Sanders Tribute” by Rob Lewis", "Jazz/Blues"],
    57: ["“Live at the Weary Traveler” by Samuel Wallner", "House"],
    56: ["“Brain Dead Mix” by Kyle Ng", "Dub/Alt"],
  };
  const NAMES = [
    "Shop Floor Session", "Guest Mix", "Vinyl Hour", "Closing Shift",
    "Warehouse Tape", "Staff Picks", "After Close", "Open Deck Night",
    "Basement Broadcast", "Corner Store Cuts", "Slow Rotation",
  ];
  const GENRES = [
    "House", "Techno", "Disco", "Ambient", "Garage",
    "Dub", "Jazz", "Electro", "Breaks",
  ];

  const MIXES = [];
  for (let n = 78; n >= 16; n--) {
    const known = KNOWN[n];
    MIXES.push({
      no: String(n).padStart(3, "0"),
      name: known ? known[0] : NAMES[n % NAMES.length],
      genre: known ? known[1] : GENRES[n % GENRES.length],
      art: n % 6,
    });
  }

  /* Real AUX cover art scraped from august-shop.com/blogs/august-aux.
     Exact match where our number exists in the real archive; otherwise
     cycle the pool so every tile shows real artwork. */
  const ART_BY_NO = {
  "060": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_060_PLAYLIST_COVER_1024x1024.png?v=1678650416",
  "058": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_058_PLAYLIST_COVER_1024x1024.png?v=1675083380",
  "056": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_056_PLAYLIST_COVER_1024x1024.jpg?v=1672425632",
  "055": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_055_PLAYLIST_COVER_1024x1024.png?v=1670467940",
  "052": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_052_SC_COVER_1024x1024.png?v=1666927960",
  "051": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_051_PLAYLIST_COVER_1024x1024.png?v=1666926095",
  "050": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_050_PLAYLIST_COVER_1024x1024.jpg?v=1664029953",
  "049": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_049_PLAYLIST_COVER_1024x1024.jpg?v=1663086818",
  "048": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_048_PLAYLIST_COVER_1024x1024.png?v=1660420109",
  "046": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_046_PLAYLIST_COVER_1024x1024.jpg?v=1657301147",
  "045": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_045_PLAYLIST_COVER_1024x1024.jpg?v=1655590105",
  "044": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_044_PLAYLIST_COVER_1024x1024.jpg?v=1654461535",
  "043": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_043_PLAYLIST_COVER_1024x1024.jpg?v=1654149933",
  "042": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_042_PLAYLIST_COVER_1024x1024.jpg?v=1649774525",
  "041": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_041_PLAYLIST_COVER_1024x1024.jpg?v=1649460194",
  "040": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_040_PLAYLIST_COVER_1024x1024.jpg?v=1648600057",
  "039": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_039_PLAYLIST_COVER_1024x1024.jpg?v=1648600138",
  "038": "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_038_SPOTIFY_COVER_1024x1024.jpg?v=1655571985",
  "036": "https://cdn.shopify.com/s/files/1/2729/9188/files/August_Aux_036_spotify_cover_1024x1024.jpg?v=1655572117"
};
  const ART_POOL = [
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_060_PLAYLIST_COVER_1024x1024.png?v=1678650416",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_058_PLAYLIST_COVER_1024x1024.png?v=1675083380",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_056_PLAYLIST_COVER_1024x1024.jpg?v=1672425632",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_055_PLAYLIST_COVER_1024x1024.png?v=1670467940",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_052_SC_COVER_1024x1024.png?v=1666927960",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_051_PLAYLIST_COVER_1024x1024.png?v=1666926095",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_050_PLAYLIST_COVER_1024x1024.jpg?v=1664029953",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_049_PLAYLIST_COVER_1024x1024.jpg?v=1663086818",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_048_PLAYLIST_COVER_1024x1024.png?v=1660420109",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_046_PLAYLIST_COVER_1024x1024.jpg?v=1657301147",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_045_PLAYLIST_COVER_1024x1024.jpg?v=1655590105",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_044_PLAYLIST_COVER_1024x1024.jpg?v=1654461535",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_043_PLAYLIST_COVER_1024x1024.jpg?v=1654149933",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_042_PLAYLIST_COVER_1024x1024.jpg?v=1649774525",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_041_PLAYLIST_COVER_1024x1024.jpg?v=1649460194",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_040_PLAYLIST_COVER_1024x1024.jpg?v=1648600057",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_039_PLAYLIST_COVER_1024x1024.jpg?v=1648600138",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/AUGUST_AUX_038_SPOTIFY_COVER_1024x1024.jpg?v=1655571985",
  "https://cdn.shopify.com/s/files/1/2729/9188/files/August_Aux_036_spotify_cover_1024x1024.jpg?v=1655572117"
];
  const artFor = (no, i) => ART_BY_NO[no] || ART_POOL[i % ART_POOL.length];

  const PAGE_SIZE = 9;
  const PAGES = Math.ceil(MIXES.length / PAGE_SIZE);

  let page = 0;
  let selectedNo = MIXES[0].no;

  /* ── Rendering ───────────────────────────────────────────── */
  const renderGrid = () => {
    if (!gridEl) return;
    const slice = MIXES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
    gridEl.innerHTML = slice
      .map((m, i) => {
        const abs = page * PAGE_SIZE + i;
        return `
      <button class="radio-cover aux-tile${m.no === selectedNo ? " is-active" : ""}" type="button" data-aux-no="${m.no}" aria-label="Play AUGUST AUX ${m.no} — ${m.name}">
        <div class="aux-tile__art"><img src="${artFor(m.no, abs)}" alt="" loading="lazy" /></div>
        <span class="aux-tile__no">AUX :: ${m.no} · ${m.genre}</span>
        <span class="aux-tile__title">${m.name}</span>
      </button>`;
      })
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

    if (titleEl) titleEl.textContent = `AUGUST AUX :: ${mix.no}`;
    if (subEl) subEl.textContent = mix.name;

    audio.src = STAND_INS[idx % STAND_INS.length];
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
    if (e.target.closest("button, .radio-seek")) return;
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

  /* ── Events (first page of august-shop.com/blogs/events) ─── */
  const EVENTS = [
    {
      series: "AUX",
      date: "Oct 12, 2024",
      title: "AUGUST AUX :: AUXILIARY 09 JEAN LE DUKE, SAMUEL WALLNER",
      excerpt: "August Aux @ The Side Door. Trap, Footwork, and Juke with Sam Wallner and Jean Le Duke.",
      href: "https://august-shop.com/blogs/events/august-aux-09-jean-le-duke-samuel-wallner",
    },
    {
      series: "Art Collective",
      date: "Jun 1, 2024",
      title: "AUGUST ART COLLECTIVE :: 010 CHRIS MALCHOW",
      excerpt: "Photographer and artist from Madison, WI. Work on display during June 2024.",
      href: "https://august-shop.com/blogs/events/august-art-collective-010-chris-malchow",
    },
    {
      series: "Art Collective",
      date: "May 1, 2024",
      title: "AUGUST ART COLLECTIVE :: 009 BENETT HOLGERSON",
      excerpt: "Filmmaker and painter from Madison. Work on display during May 2024.",
      href: "https://august-shop.com/blogs/events/august-art-collective-009-benett-holgerson",
    },
    {
      series: "Art Collective",
      date: "Apr 1, 2024",
      title: "AUGUST ART COLLECTIVE :: 008 MABEL THADEN",
      excerpt: "Ceramics under the name Germ — sculptural pieces and functional wares.",
      href: "https://august-shop.com/blogs/events/august-art-collective-008-mabel-thaden",
    },
    {
      series: "Art Collective",
      date: "Mar 1, 2024",
      title: "AUGUST ART COLLECTIVE: 007 KATE WEBER",
      excerpt: "Local potter from Madison focusing on shape, closed forms, and the clay body.",
      href: "https://august-shop.com/blogs/events/august-art-collective-007-kate-weber",
    },
    {
      series: "Art Collective",
      date: "Feb 15, 2024",
      title: "AUGUST ART COLLECTIVE :: 006 MT KOSOBUCKI",
      excerpt: "Documentary photographer working in sport and music. Displayed February 2024.",
      href: "https://august-shop.com/blogs/events/august-art-collective-006-mt-kosobucki",
    },
    {
      series: "Art Collective",
      date: "Dec 1, 2023",
      title: "AUGUST ART COLLECTIVE :: 005 LEXIE OLSON",
      excerpt: "Multidisciplinary work at the crossroads of fiction and reality.",
      href: "https://august-shop.com/blogs/events/august-art-collective-005-lexie-olson",
    },
    {
      series: "AUX",
      date: "Aug 27, 2022",
      title: "AUGUST AUX :: AUXILIARY 08 SAMUEL WALLNER",
      excerpt: "First Auxiliary set outside the shop — Lisa Link Peace Park on State Street.",
      href: "https://august-shop.com/blogs/events/august-aux-auxiliary-08-samuel-wallner",
    },
    {
      series: "AUX",
      date: "Jun 18, 2022",
      title: "AUGUST AUX :: AUXILIARY 07 CLANDESTINE CHEMISTRY, KTP, FTBK",
      excerpt: "Three half-hour sets back to back: Clandestine Chemistry, KTP, and FTBK.",
      href: "https://august-shop.com/blogs/events/august-aux-auxiliary-07-clandestine-chemistry-ktp-ftbk",
    },
  ];

  const eventsEl = radioCard.querySelector("[data-aux-events]");
  if (eventsEl) {
    eventsEl.innerHTML = EVENTS.map(
      (ev) => `
      <li>
        <a class="aux-event" href="${ev.href}" target="_blank" rel="noopener">
          <div class="aux-event__meta">
            <span class="aux-event__series">${ev.series}</span>
            <span class="aux-event__date">${ev.date}</span>
          </div>
          <h3 class="aux-event__title">${ev.title}</h3>
          <p class="aux-event__excerpt">${ev.excerpt}</p>
        </a>
      </li>`
    ).join("");
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
