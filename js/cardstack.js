/* August — 3D Card Stack Controller (v3) */
document.addEventListener("DOMContentLoaded", () => {
  const stack = document.querySelector("[data-card-stack]");
  if (!stack) return;

  const cards = [...stack.querySelectorAll("[data-card]")];
  const dots = [...stack.querySelectorAll("[data-dot]")];
  const total = cards.length;
  if (!total) return;

  let active = 0;
  let animating = false;
  let queued = null;
  const LOCK_MS = 380;

  const applyState = (card, state) => card.setAttribute("data-state", state);

  const offsetOf = (i, base) => {
    let off = i - base;
    if (off < 0) off += total;
    return off;
  };

  const stateForOffset = (off) => {
    if (off === 0) return "active";
    if (off === 1) return "stack-1";
    if (off === 2) return "stack-2";
    if (off === 3) return "stack-3";
    return "hidden";
  };

  const renderAll = () => {
    cards.forEach((c, i) => applyState(c, stateForOffset(offsetOf(i, active))));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
  };

  const goTo = (idx, dir) => {
    if (animating) {
      queued = { idx, dir };
      return;
    }

    const target = ((idx % total) + total) % total;
    if (target === active) return;

    const prev = active;
    active = target;
    animating = true;

    if (dir >= 0) {
      applyState(cards[prev], "dismissed");
      cards.forEach((c, i) => {
        if (i !== prev) applyState(c, stateForOffset(offsetOf(i, active)));
      });
    } else {
      cards[target].classList.add("is-dragging");
      applyState(cards[target], "dismissed");
      void cards[target].offsetHeight;
      cards[target].classList.remove("is-dragging");

      applyState(cards[target], "active");
      cards.forEach((c, i) => {
        if (i !== target) applyState(c, stateForOffset(offsetOf(i, active)));
      });
    }

    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));

    setTimeout(() => {
      renderAll();
      animating = false;

      if (queued) {
        const q = queued;
        queued = null;
        goTo(q.idx, q.dir);
      }
    }, LOCK_MS);
  };

  const next = () => goTo(active + 1, 1);
  const prev = () => goTo(active - 1, -1);

  /* ── Wheel ──────────────────────────────────────────────── */

  let wheelAccum = 0;
  let wheelTimer = null;
  const WHEEL_THRESHOLD = 55;

  stack.addEventListener("wheel", (e) => {
    const scroller = e.target.closest("[data-card-scroll]");
    if (scroller) {
      const atTop = scroller.scrollTop <= 1;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
    }

    e.preventDefault();
    wheelAccum += e.deltaY;

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAccum = 0; }, 200);

    if (Math.abs(wheelAccum) >= WHEEL_THRESHOLD) {
      if (wheelAccum > 0) next();
      else prev();
      wheelAccum = 0;
    }
  }, { passive: false });

  /* ── Touch ──────────────────────────────────────────────── */

  let touchY0 = 0;
  let touchDy = 0;
  let touching = false;

  const skipTouch = (el) =>
    el.closest("button, a, input, select, textarea, .waveform, .audio-player__queue, .profile-drop, .profile-modal, [data-card-scroll]");

  stack.addEventListener("touchstart", (e) => {
    if (skipTouch(e.target)) return;
    touchY0 = e.touches[0].clientY;
    touchDy = 0;
    touching = true;
  }, { passive: true });

  stack.addEventListener("touchmove", (e) => {
    if (!touching) return;
    touchDy = touchY0 - e.touches[0].clientY;
    if (Math.abs(touchDy) > 10) e.preventDefault();
  }, { passive: false });

  stack.addEventListener("touchend", () => {
    if (!touching) return;
    touching = false;
    if (touchDy > 50) next();
    else if (touchDy < -50) prev();
    touchDy = 0;
  }, { passive: true });

  stack.addEventListener("touchcancel", () => { touching = false; touchDy = 0; }, { passive: true });

  /* ── Keyboard ───────────────────────────────────────────── */

  window.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select")) return;
    if (!document.querySelector(".page--home")) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  });

  /* ── Dots ────────────────────────────────────────────────── */

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.getAttribute("data-dot"));
      goTo(idx, idx > active ? 1 : -1);
    });
  });

  /* ── Init ────────────────────────────────────────────────── */
  renderAll();
});
