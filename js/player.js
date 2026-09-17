/* August Radio — waveform player */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-player]");
  if (!root) return;

  const audio = root.querySelector("[data-player-audio]");
  const shell = root.querySelector("[data-player-shell]");
  const playBtn = root.querySelector("[data-player-play]");
  const prevBtn = root.querySelector("[data-player-prev]");
  const nextBtn = root.querySelector("[data-player-next]");
  const titleEl = root.querySelector("[data-player-title]");
  const subEl = root.querySelector("[data-player-sub]");
  const timeEl = root.querySelector("[data-player-time]");
  const vol = root.querySelector("[data-player-volume]");
  const muteBtn = root.querySelector("[data-player-mute]");
  const waveMini = root.querySelector("[data-player-wave]");
  const waveLg = root.querySelector("[data-player-wave-lg]");
  const queueEl = root.querySelector("[data-player-queue]");
  const expandBtn = root.querySelector("[data-player-expand]");
  const dismissBtn = root.querySelector("[data-player-dismiss]");
  const restoreBtn = root.querySelector("[data-player-restore]");
  const iconPlay = playBtn.querySelector("[data-icon-play]");
  const iconPause = playBtn.querySelector("[data-icon-pause]");

  const playlist = [
    { title: "AUGUST RADIO — VOL. 14", sub: "Madison After Hours", src: "assets/radio-vol-14.wav" },
    { title: "AUGUST RADIO — VOL. 15", sub: "State Street Mix", src: "assets/radio-vol-15.wav" },
    { title: "AUGUST RADIO — VOL. 16", sub: "Late Light", src: "assets/radio-vol-16.wav" },
  ];

  const BAR_MINI = 42;
  const BAR_LG = 96;
  const peakCache = new Map();
  let index = 0;
  let lastVol = 0.7;
  let ctx;

  const fmt = (sec) => {
    if (!Number.isFinite(sec)) return "0:00";
    const s = Math.max(0, Math.floor(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const downsample = (peaks, count) => {
    if (peaks.length === count) return peaks;
    const out = [];
    const step = peaks.length / count;
    for (let i = 0; i < count; i++) {
      const a = Math.floor(i * step);
      const b = Math.max(a + 1, Math.floor((i + 1) * step));
      let m = 0;
      for (let j = a; j < b && j < peaks.length; j++) m = Math.max(m, peaks[j]);
      out.push(m);
    }
    return out;
  };

  const renderWave = (el, peaks, played) => {
    if (!el || !peaks.length) return;
    const count = peaks.length;
    const tall = el.classList.contains("waveform--lg");
    const html = peaks
      .map((p, i) => {
        const h = Math.max(3, Math.round(p * (tall ? 50 : 24)));
        const on = i / count <= played;
        return `<i class="${on ? "is-played" : ""}" style="height:${h}px"></i>`;
      })
      .join("");
    el.innerHTML = html;
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", "100");
    el.setAttribute("aria-valuenow", String(Math.round(played * 100)));
  };

  const progress = () => {
    const d = audio.duration;
    if (!d) return 0;
    return audio.currentTime / d;
  };

  const paintWaves = () => {
    const cached = peakCache.get(playlist[index].src);
    if (!cached) return;
    const p = progress();
    renderWave(waveMini, downsample(cached, BAR_MINI), p);
    if (waveLg) renderWave(waveLg, downsample(cached, BAR_LG), p);
  };

  const loadPeaks = async (src) => {
    if (peakCache.has(src)) {
      paintWaves();
      return;
    }
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const res = await fetch(src);
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      const data = buf.getChannelData(0);
      const bars = BAR_LG;
      const block = Math.max(1, Math.floor(data.length / bars));
      const peaks = [];
      for (let i = 0; i < bars; i++) {
        let max = 0;
        const start = i * block;
        const end = Math.min(data.length, start + block);
        for (let j = start; j < end; j += 8) max = Math.max(max, Math.abs(data[j]));
        peaks.push(max);
      }
      const peakMax = Math.max(...peaks, 0.0001);
      peakCache.set(
        src,
        peaks.map((p) => Math.min(1, Math.pow(p / peakMax, 1.25)))
      );
      paintWaves();
    } catch {
      const fallback = Array.from({ length: BAR_LG }, (_, i) => 0.25 + 0.55 * Math.abs(Math.sin(i / 4.2)));
      peakCache.set(src, fallback);
      paintWaves();
    }
  };

  const renderQueue = () => {
    if (!queueEl) return;
    queueEl.innerHTML = playlist
      .map(
        (t, i) =>
          `<button type="button" class="audio-player__track${i === index ? " is-active" : ""}" data-track="${i}">
            <span>${t.title.replace("AUGUST RADIO — ", "")}</span>
            <span>${t.sub}</span>
          </button>`
      )
      .join("");
  };

  const setPlayingUI = (on) => {
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    playBtn.setAttribute("aria-pressed", String(on));
    iconPlay.hidden = on;
    iconPause.hidden = !on;
    shell.classList.toggle("is-playing", on);
    root.classList.toggle("is-playing", on);
  };

  const loadTrack = (i, autoplay) => {
    index = (i + playlist.length) % playlist.length;
    const track = playlist[index];
    audio.src = track.src;
    titleEl.textContent = track.title;
    if (subEl) subEl.textContent = track.sub;
    timeEl.textContent = `0:00 / ${fmt(audio.duration || 0)}`;
    renderQueue();
    loadPeaks(track.src);
    if (autoplay) {
      audio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
    } else {
      setPlayingUI(false);
    }
  };

  const togglePlay = async () => {
    if (ctx && ctx.state === "suspended") await ctx.resume();
    if (audio.paused) {
      try {
        await audio.play();
        setPlayingUI(true);
      } catch {
        setPlayingUI(false);
      }
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  };

  const seekFromEvent = (e, el, count) => {
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    if (audio.duration) audio.currentTime = ratio * audio.duration;
    paintWaves();
  };

  const setExpanded = (open) => {
    root.classList.toggle("is-expanded", open);
    shell.classList.toggle("is-expanded", open);
    expandBtn.setAttribute("aria-expanded", String(open));
    expandBtn.setAttribute("aria-label", open ? "Minimize player" : "Expand player");
  };

  const setDismissed = (on) => {
    root.classList.toggle("is-dismissed", on);
    if (on) setExpanded(false);
    restoreBtn.hidden = !on;
  };

  playBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlay();
  });
  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    loadTrack(index - 1, !audio.paused);
  });
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    loadTrack(index + 1, !audio.paused);
  });

  audio.addEventListener("timeupdate", () => {
    timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration || 0)}`;
    paintWaves();
  });
  audio.addEventListener("loadedmetadata", () => {
    timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration || 0)}`;
  });
  audio.addEventListener("ended", () => loadTrack(index + 1, true));

  vol.addEventListener("input", () => {
    audio.volume = Number(vol.value);
    lastVol = audio.volume || lastVol;
      muteBtn.classList.toggle("is-muted", audio.volume === 0);
      muteBtn.setAttribute("aria-label", audio.volume === 0 ? "Unmute" : "Mute");
  });
  vol.addEventListener("click", (e) => e.stopPropagation());
  muteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.volume > 0) {
      lastVol = audio.volume;
      audio.volume = 0;
      vol.value = "0";
      muteBtn.classList.add("is-muted");
      muteBtn.setAttribute("aria-label", "Unmute");
    } else {
      audio.volume = lastVol || 0.7;
      vol.value = String(audio.volume);
      muteBtn.classList.remove("is-muted");
      muteBtn.setAttribute("aria-label", "Mute");
    }
  });

  const bindWave = (el, count) => {
    if (!el) return;
    const seek = (e) => seekFromEvent(e, el, count);
    el.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      seek(e);
    });
    el.addEventListener("pointermove", (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      seek(e);
    });
  };
  bindWave(waveMini, BAR_MINI);
  bindWave(waveLg, BAR_LG);

  queueEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-track]");
    if (!btn) return;
    e.stopPropagation();
    loadTrack(Number(btn.getAttribute("data-track")), true);
  });

  expandBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setExpanded(!shell.classList.contains("is-expanded"));
  });
  dismissBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setDismissed(true);
  });
  restoreBtn.addEventListener("click", () => setDismissed(false));

  shell.addEventListener("click", (e) => {
    if (e.target.closest("button, input, .waveform, .audio-player__queue")) return;
    setExpanded(!shell.classList.contains("is-expanded"));
  });

  shell.addEventListener("keydown", (e) => {
    if (e.target.closest("input")) return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "ArrowRight" && audio.duration) {
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    } else if (e.key === "ArrowLeft" && audio.duration) {
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 5);
    }
  });

  window.addEventListener("keydown", (e) => {
    if (root.classList.contains("is-dismissed")) return;
    if (e.key === "Escape" && shell.classList.contains("is-expanded")) {
      setExpanded(false);
      e.stopPropagation();
    }
  });

  audio.volume = 0.7;
  vol.value = "0.7";
  loadTrack(0, false);
  setDismissed(true);
});
