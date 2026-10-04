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

  const splitDate = (str) => {
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) {
      return { mon: "", day: "", yr: "", weekday: "", pretty: str, upcoming: false };
    }
    const mon = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const day = String(d.getDate());
    const yr = String(d.getFullYear());
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const pretty = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return { mon, day, yr, weekday, pretty, upcoming: end >= new Date() };
  };

  const cleanTitle = (ev) => {
    const t = ev.title
      .replace(/^AUGUST\s+AUX\s*::\s*/i, "")
      .replace(/^AUGUST\s+ART\s+COLLECTIVE\s*:{0,2}\s*/i, "")
      .replace(/^AUGUST\s+HOMEGROWN\s*:{0,2}\s*/i, "")
      .replace(/^EACH ONE,\s*TEACH ONE\s*:{0,2}\s*/i, "")
      .replace(/^AUXILIARY\s+\d+\s*/i, "")
      .replace(/^0*\d{1,3}\s+/i, "")
      .trim();
    return t || ev.title;
  };

  const shortVenue = (venue) => {
    if (!venue) return "414 State St";
    if (/side door/i.test(venue)) return "The Side Door";
    if (/peace park/i.test(venue)) return "Lisa Link Peace Park";
    return "414 State St";
  };

  const mapsHref = (venue) => {
    const q = /side door/i.test(venue || "")
      ? "The Side Door, Madison WI"
      : /peace park/i.test(venue || "")
        ? "Lisa Link Peace Park, Madison WI"
        : "414 State St, Madison WI";
    return `https://maps.google.com/?q=${encodeURIComponent(q)}`;
  };

  const posterFor = (ev) => (Aux.posterFor ? Aux.posterFor(ev) : ev.image || "");

  const eventCard = (e, variant) => {
    const when = splitDate(e.date);
    const venue = shortVenue(e.venue);
    const poster = posterFor(e);
    const cta = when.upcoming ? "RSVP" : "Visit";
    const extra = variant ? ` aux-event--${variant}` : "";
    return `
      <a class="aux-event${extra}" href="event.html?e=${e.id}">
        <div class="aux-event__when" aria-hidden="true">
          <span class="aux-event__mon">${escape(when.mon)}</span>
          <span class="aux-event__day">${escape(when.day)}</span>
          <span class="aux-event__yr">${escape(when.yr)}</span>
        </div>
        <div class="aux-event__poster">${
          poster ? `<img src="${escape(poster)}" alt="" loading="lazy" />` : ""
        }</div>
        <div class="aux-event__copy">
          <div class="aux-event__meta">
            <span class="aux-event__series">${escape(e.series)}</span>
            <span class="aux-event__venue">${escape(venue)}</span>
          </div>
          <h3 class="aux-event__title">${escape(cleanTitle(e))}</h3>
          <p class="aux-event__excerpt">${escape(e.excerpt)}</p>
          <span class="aux-event__cta">${cta}</span>
        </div>
      </a>`;
  };

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
    document.title = `${mix.name} — August AUX`;
    const img = document.querySelector("[data-story-art]");
    if (img) {
      img.src = mix.art;
      img.alt = mix.name;
    }
    setText("[data-story-kicker]", "August AUX");
    setText("[data-story-title]", mix.name);
    setText("[data-story-meta]", `${mix.no} · ${mix.genre}`);
    setText("[data-story-context]", "Play from the archive — recorded for the shop floor at 414 State Street.");
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
          <span class="story-tile__no">${m.no} · ${escape(m.genre)}</span>
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
    const when = splitDate(ev.date);
    const venue = shortVenue(ev.venue);
    const headline = cleanTitle(ev);
    document.title = `${headline} — August`;
    setText("[data-story-kicker]", ev.series);
    setText("[data-story-title]", headline);
    setText("[data-story-meta]", `${when.pretty} · ${venue}`);

    const cover = document.querySelector("[data-story-cover]");
    const img = document.querySelector("[data-story-art]");
    const poster = posterFor(ev);
    if (cover && img && poster) {
      cover.hidden = false;
      img.src = poster;
      img.alt = headline;
    }

    const facts = document.querySelector("[data-story-facts]");
    if (facts) {
      facts.innerHTML = `
        <div class="story__fact">
          <dt>When</dt>
          <dd>${escape(when.pretty)}</dd>
        </div>
        <div class="story__fact">
          <dt>Where</dt>
          <dd>${escape(ev.venue || "August, 414 State St., Madison, WI")}</dd>
        </div>
        <div class="story__fact">
          <dt>Series</dt>
          <dd>${escape(ev.series)}</dd>
        </div>`;
    }

    const actions = document.querySelector("[data-story-actions]");
    if (actions) {
      const rsvp = `mailto:hello@august-shop.com?subject=${encodeURIComponent("RSVP — " + headline)}`;
      actions.innerHTML = when.upcoming
        ? `<a class="btn btn--primary" href="${rsvp}">RSVP</a>
           <a class="btn btn--ghost" href="${mapsHref(ev.venue)}" target="_blank" rel="noopener noreferrer">Get directions</a>`
        : `<a class="btn btn--primary" href="${mapsHref(ev.venue)}" target="_blank" rel="noopener noreferrer">Visit</a>
           <a class="btn btn--ghost" href="${rsvp}">Get on the list</a>`;
    }

    const body = document.querySelector("[data-story-body]");
    if (body) body.innerHTML = ev.body.map((p) => `<p>${escape(p)}</p>`).join("");

    const more = document.querySelector("[data-story-more]");
    if (more) {
      more.innerHTML = Aux.relatedEvents(ev, 4)
        .map((e) => eventCard(e, "compact"))
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
        <span class="story-tile__no">${m.no} · ${escape(m.genre)}</span>
        <span class="story-tile__title">${escape(m.name)}</span>
      </a>`
    ).join("");
    return;
  }

  /* ── Events archive ──────────────────────────────────────── */
  if (kind === "events-index") {
    const list = document.querySelector("[data-story-index]");
    if (!list) return;
    list.innerHTML = Aux.EVENTS.map((e, i) => eventCard(e, i === 0 ? "feature" : "")).join("");
  }
});
