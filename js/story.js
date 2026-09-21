/* August — mix / event detail + archive listings
   Hydrates mix.html?m=, event.html?e=, aux.html, events.html
   from window.AugustAux. */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-story]");
  if (!root || !window.AugustAux) return;

  const kind = root.getAttribute("data-story");
  const params = new URLSearchParams(location.search);
  const Aux = window.AugustAux;

  const setText = (sel, text) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  };

  const escape = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  /* ── Mix player (detail page only) ───────────────────────── */
  const bindPlayer = (src) => {
    const playBtn = document.querySelector("[data-story-play]");
    if (!playBtn) return;
    const playIcon = playBtn.querySelector(".story-player__play-icon");
    const pauseIcon = playBtn.querySelector(".story-player__pause-icon");
    const seekEl = document.querySelector("[data-story-seek]");
    const fill = document.querySelector("[data-story-fill]");
    const timeEl = document.querySelector("[data-story-time]");

    const audio = new Audio(src);
    audio.preload = "metadata";

    const fmt = (sec) => {
      if (!Number.isFinite(sec)) return "0:00";
      const s = Math.max(0, Math.floor(sec));
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    };

    const sync = () => {
      const playing = !audio.paused && !audio.ended;
      playIcon?.toggleAttribute("hidden", playing);
      pauseIcon?.toggleAttribute("hidden", !playing);
      playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    };

    const paint = () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      if (fill) fill.style.width = `${ratio * 100}%`;
      seekEl?.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
      if (timeEl) timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration || 0)}`;
    };

    playBtn.addEventListener("click", () => {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    });

    if (seekEl) {
      const seekFrom = (e) => {
        if (!audio.duration) return;
        const rect = seekEl.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        audio.currentTime = ratio * audio.duration;
        paint();
      };
      seekEl.addEventListener("pointerdown", (e) => {
        seekEl.setPointerCapture(e.pointerId);
        seekFrom(e);
      });
      seekEl.addEventListener("pointermove", (e) => {
        if (seekEl.hasPointerCapture(e.pointerId)) seekFrom(e);
      });
    }

    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);
    audio.addEventListener("ended", sync);
    audio.addEventListener("timeupdate", paint);
    audio.addEventListener("loadedmetadata", paint);
  };

  /* ── Mix detail ──────────────────────────────────────────── */
  if (kind === "mix") {
    const mix = Aux.mixByNo(params.get("m")) || Aux.MIXES[0];
    document.title = `AUGUST AUX :: ${mix.no} — August`;
    const img = document.querySelector("[data-story-art]");
    if (img) {
      img.src = mix.art;
      img.alt = `AUGUST AUX :: ${mix.no}`;
    }
    setText("[data-story-title]", mix.name);
    setText("[data-story-meta]", `AUX :: ${mix.no} · ${mix.genre}`);
    const body = document.querySelector("[data-story-body]");
    if (body) body.innerHTML = `<p>${escape(mix.body)}</p>`;

    bindPlayer(mix.src);

    const more = document.querySelector("[data-story-more]");
    if (more) {
      more.innerHTML = Aux.relatedMixes(mix, 6)
        .map(
          (m) => `
        <a class="story-tile" href="mix.html?m=${m.no}">
          <div class="story-tile__art"><img src="${m.art}" alt="" loading="lazy" /></div>
          <span class="story-tile__no">AUX :: ${m.no} · ${m.genre}</span>
          <span class="story-tile__title">${escape(m.name)}</span>
        </a>`
        )
        .join("");
    }
    return;
  }

  /* ── Event detail ────────────────────────────────────────── */
  if (kind === "event") {
    const ev = Aux.eventById(params.get("e")) || Aux.EVENTS[0];
    document.title = `${ev.title} — August`;
    setText("[data-story-kicker]", ev.series);
    setText("[data-story-title]", ev.title);
    setText("[data-story-meta]", `${ev.date}${ev.venue ? ` · ${ev.venue}` : ""}`);

    const cover = document.querySelector("[data-story-cover]");
    const img = document.querySelector("[data-story-art]");
    if (ev.image && cover && img) {
      cover.hidden = false;
      img.src = ev.image;
      img.alt = ev.title;
    }

    const body = document.querySelector("[data-story-body]");
    if (body) body.innerHTML = ev.body.map((p) => `<p>${escape(p)}</p>`).join("");

    const more = document.querySelector("[data-story-more]");
    if (more) {
      more.innerHTML = Aux.relatedEvents(ev, 4)
        .map(
          (e) => `
        <a class="story-row" href="event.html?e=${e.id}">
          <span class="story-row__series">${escape(e.series)}</span>
          <span class="story-row__date">${escape(e.date)}</span>
          <span class="story-row__title">${escape(e.title)}</span>
        </a>`
        )
        .join("");
    }
    return;
  }

  /* ── Mix archive ─────────────────────────────────────────── */
  if (kind === "aux-index") {
    const grid = document.querySelector("[data-story-index]");
    if (!grid) return;
    grid.innerHTML = Aux.MIXES.map(
      (m) => `
      <a class="story-tile" href="mix.html?m=${m.no}">
        <div class="story-tile__art"><img src="${m.art}" alt="" loading="lazy" /></div>
        <span class="story-tile__no">AUX :: ${m.no} · ${m.genre}</span>
        <span class="story-tile__title">${escape(m.name)}</span>
      </a>`
    ).join("");
    return;
  }

  /* ── Events archive ──────────────────────────────────────── */
  if (kind === "events-index") {
    const list = document.querySelector("[data-story-index]");
    if (!list) return;
    list.innerHTML = Aux.EVENTS.map(
      (e) => `
      <a class="aux-event" href="event.html?e=${e.id}">
        <div class="aux-event__meta">
          <span class="aux-event__series">${escape(e.series)}</span>
          <span class="aux-event__date">${escape(e.date)}</span>
        </div>
        <h3 class="aux-event__title">${escape(e.title)}</h3>
        <p class="aux-event__excerpt">${escape(e.excerpt)}</p>
      </a>`
    ).join("");
  }
});
