/* August — 3D Card Stack Controller (v4)
   Live-drag + rubber-band + spring release + progressive parallax + haptic. */
document.addEventListener("DOMContentLoaded", () => {
  const stack = document.querySelector("[data-card-stack]");
  if (!stack) return;

  const cards = [...stack.querySelectorAll("[data-card]")];
  // Dots live outside .card-stack (which has overflow:hidden) so they can
  // render in the gap below the card on desktop. Search from .page instead.
  const dotsContainer = stack.parentElement || document;
  const dots = [...dotsContainer.querySelectorAll("[data-dot]")];
  const total = cards.length;
  if (!total) return;

  let active = 0;
  let animating = false;
  let queued = null;
  const LOCK_MS = 380;

  /* ── Haptic ─────────────────────────────────────────────── */
  const haptic = (ms = 10) => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try { navigator.vibrate(ms); } catch {}
    }
  };

  /* ── State transitions ─────────────────────────────────── */
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

  const clearInlineTransforms = () => {
    cards.forEach((c) => {
      c.style.transform = "";
      c.style.opacity = "";
    });
  };

  /* Tab bar reflects the active card: Radio lights up on the AUX card,
     Shop on everything else. */
  const tabRadio = document.querySelector('.tabbar [data-card-jump="4"]');
  const tabShop = document.querySelector('.tabbar a[href="index.html"]');
  const syncTabs = () => {
    if (!tabRadio) return;
    const onAux = active === total - 1;
    tabRadio.classList.toggle("is-active", onAux);
    tabShop?.classList.toggle("is-active", !onAux);
  };

  const renderAll = () => {
    clearInlineTransforms();
    cards.forEach((c, i) => applyState(c, stateForOffset(offsetOf(i, active))));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
    syncTabs();
  };

  const goTo = (idx, dir) => {
    if (animating) {
      queued = { idx, dir };
      return;
    }

    const target = ((idx % total) + total) % total;
    if (target === active) return;

    // First card is the start of the stack — going backward from it would
    // wrap to the last card, so it's blocked. Forward navigation (including
    // last card wrapping to the first) is unaffected.
    if (dir < 0 && active === 0) return;

    const prev = active;
    active = target;
    animating = true;
    haptic(12);

    // Ensure no stale inline transforms are fighting the CSS transition
    cards.forEach((c) => {
      c.classList.remove("is-dragging");
      c.style.transform = "";
      c.style.opacity = "";
    });

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
    syncTabs();

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

  /* ── Wheel: one gesture → one card ───────────────────────
     Trackpads emit a burst of pixel deltas for a single flick.
     Hitting the threshold, resetting, then hitting it again in the
     same burst used to queue a second goTo (felt like a double scroll). */
  let wheelAccum = 0;
  let wheelLocked = false;
  let wheelIdleTimer = null;
  const WHEEL_THRESHOLD = 80;
  const WHEEL_IDLE_MS = 280;

  const armWheelUnlock = () => {
    clearTimeout(wheelIdleTimer);
    wheelIdleTimer = setTimeout(() => {
      wheelLocked = false;
      wheelAccum = 0;
    }, WHEEL_IDLE_MS);
  };

  stack.addEventListener("wheel", (e) => {
    const scroller = e.target.closest("[data-card-scroll]");
    if (scroller) {
      const atTop = scroller.scrollTop <= 1;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
    }

    e.preventDefault();

    if (animating || wheelLocked) {
      armWheelUnlock();
      return;
    }

    wheelAccum += e.deltaY;

    if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;

    const dir = wheelAccum;
    wheelLocked = true;
    wheelAccum = 0;
    if (dir > 0) next();
    else prev();
    armWheelUnlock();
  }, { passive: false });

  /* ── Pointer drag (touch + mouse unified) ──────────────── */

  /* Links and buttons do NOT block drags — brand cards are covered by a
     full-card link, which would make them un-swipeable. A tap without
     movement still clicks through; a confirmed drag suppresses the click. */
  const skipDrag = (el) =>
    el.closest(
      "input, select, textarea, .waveform, .audio-player__queue, .profile-drop, .profile-modal, .sheet, .tabbar"
    );

  // After a real drag, swallow the click the browser fires on release so a
  // swipe over a brand card doesn't also navigate to the brand page.
  let suppressClick = false;
  stack.addEventListener(
    "click",
    (e) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    },
    true
  );

  // Keep the browser from starting a native link/image drag mid-swipe.
  stack.addEventListener("dragstart", (e) => {
    if (dragging || suppressClick) e.preventDefault();
  });

  let startY = 0;
  let startX = 0;
  let dy = 0;
  let dragging = false;
  let dragScroller = null;
  let horizontal = false;
  let startTime = 0;
  let activePointerId = null;

  const COMMIT_DIST = 90;       // px — commit gesture past this
  const COMMIT_VEL = 0.55;      // px/ms
  const RUBBER_MAX = 220;       // saturate drag past ~viewport height/4

  // Rubber-band tapering — as drag magnitude grows, additional motion shrinks
  const rubberBand = (val) => {
    const abs = Math.abs(val);
    if (abs <= RUBBER_MAX) return val;
    const excess = abs - RUBBER_MAX;
    // asymptotic curve: y = a * (1 - 1/(x/a + 1))
    const tapered = RUBBER_MAX + (excess * RUBBER_MAX) / (excess + RUBBER_MAX);
    return Math.sign(val) * tapered;
  };

  const applyDrag = (delta) => {
    // First card is an edge — dragging down (toward prev) meets heavy
    // resistance instead of wrapping around to the last card.
    if (delta < 0 && active === 0) delta *= 0.3;

    // Progress: 0 at rest, 1 at commit distance
    const progress = Math.min(1, Math.abs(delta) / COMMIT_DIST);
    const dir = Math.sign(delta); // positive = drag up (swipe next), negative = drag down (swipe prev)

    // Active card: translate + slight scale. translate3d promotes to a GPU
    // layer, keeps drag at 60fps on lower-end devices.
    const activeCard = cards[active];
    const scaleActive = 1 - 0.04 * progress;
    activeCard.style.transform = `translate3d(0, ${-delta}px, 0) scale(${scaleActive})`;
    activeCard.style.opacity = String(1 - 0.12 * progress);

    // Peek card behind — nudges up toward active state as user commits
    if (dir > 0) {
      const nextIdx = (active + 1) % total;
      const nextCard = cards[nextIdx];
      const t = -14 * (1 - progress);
      const s = 0.965 + 0.035 * progress;
      nextCard.style.transform = `translate3d(0, ${t}px, -50px) scale(${s})`;
    } else if (dir < 0 && active > 0) {
      const prevIdx = (active - 1 + total) % total;
      const prevCard = cards[prevIdx];
      const t = -110 * (1 - progress);
      const s = 1 + 0.02 * (1 - progress);
      prevCard.style.transform = `translate3d(0, ${t}%, 0) scale(${s})`;
      prevCard.style.opacity = "1";
    }
  };

  /* Momentum-scale the release transition duration.
     Fast flicks → snap fast (200ms). Slow releases → settle (420ms). */
  const releaseDuration = (velocity) => {
    const speed = Math.min(2.0, Math.abs(velocity)); // px/ms, cap at 2
    // Linear map: v=0 → 420ms, v=2 → 200ms
    return Math.max(200, 420 - speed * 110);
  };

  const releaseDrag = (commit, velocity = 0) => {
    cards.forEach((c) => c.classList.remove("is-dragging"));

    // Set a temporary transition duration on all cards based on velocity.
    // Removing it in a rAF after the class change keeps future default
    // transitions intact.
    const dur = releaseDuration(velocity);
    cards.forEach((c) => {
      c.style.setProperty("transition-duration", `${dur}ms`);
    });

    if (commit === "next") next();
    else if (commit === "prev") prev();
    else {
      clearInlineTransforms();
      renderAll();
    }

    // Restore default transitions after the animation completes.
    setTimeout(() => {
      cards.forEach((c) => c.style.removeProperty("transition-duration"));
    }, dur + 60);
  };

  stack.addEventListener("pointerdown", (e) => {
    if (skipDrag(e.target)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    suppressClick = false; // fresh gesture — assume tap until movement proves otherwise
    startY = e.clientY;
    startX = e.clientX;
    dy = 0;
    dragging = true;
    horizontal = false;
    startTime = performance.now();
    activePointerId = e.pointerId;
    dragScroller = e.target.closest("[data-card-scroll]");
  }, { passive: true });

  stack.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== activePointerId) return;
    const rawDy = e.clientY - startY;
    const rawDx = e.clientX - startX;

    // Lock direction: if user is scrubbing horizontally, cancel drag
    if (!horizontal && Math.abs(rawDx) > 12 && Math.abs(rawDx) > Math.abs(rawDy)) {
      horizontal = true;
      dragging = false;
      clearInlineTransforms();
      renderAll();
      return;
    }
    if (Math.abs(rawDy) < 6) return; // small threshold before starting drag visuals

    // Inside a scrollable card region: let native scroll run until the
    // scroller hits its edge in the gesture's direction, then card-drag.
    if (dragScroller && !cards[active].classList.contains("is-dragging")) {
      const atTop = dragScroller.scrollTop <= 1;
      const atBottom =
        dragScroller.scrollTop + dragScroller.clientHeight >= dragScroller.scrollHeight - 2;
      // rawDy < 0 = finger moving up = advancing; needs scroller at bottom.
      if ((rawDy < 0 && !atBottom) || (rawDy > 0 && !atTop)) {
        dragging = false;
        clearInlineTransforms();
        renderAll();
        return;
      }
    }

    // First frame of confirmed drag — mark cards as is-dragging so transitions off
    if (!cards[active].classList.contains("is-dragging")) {
      cards.forEach((c) => c.classList.add("is-dragging"));
      suppressClick = true; // this gesture is a swipe, not a tap
      try { stack.setPointerCapture(e.pointerId); } catch {}
    }

    dy = rubberBand(rawDy);
    applyDrag(-dy); // drag UP is negative dy → progress positive (advance)
    // preventDefault to keep browser from scrolling; only if pointer is captured
    if (stack.hasPointerCapture && stack.hasPointerCapture(e.pointerId)) {
      e.preventDefault();
    }
  }, { passive: false });

  const onUp = (e) => {
    if (!dragging || e.pointerId !== activePointerId) {
      if (horizontal) horizontal = false;
      return;
    }
    dragging = false;
    try { stack.releasePointerCapture(e.pointerId); } catch {}
    const dt = Math.max(1, performance.now() - startTime);
    const velocity = -dy / dt; // px/ms, positive = swiping up
    const delta = -dy;

    let commit = null;
    if (delta > COMMIT_DIST || velocity > COMMIT_VEL) commit = "next";
    else if ((delta < -COMMIT_DIST || velocity < -COMMIT_VEL) && active !== 0) commit = "prev";

    releaseDrag(commit, velocity);
    activePointerId = null;
  };

  stack.addEventListener("pointerup", onUp);
  stack.addEventListener("pointercancel", onUp);

  /* ── Keyboard ──────────────────────────────────────────── */
  window.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select")) return;
    if (!document.querySelector(".page--home")) return;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  });

  /* ── Dots ──────────────────────────────────────────────── */
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.getAttribute("data-dot"));
      goTo(idx, idx > active ? 1 : -1);
    });
  });

  /* ── Tab bar jumps (Radio → AUX card, Shop → home card) ── */
  document.querySelectorAll(".tabbar [data-card-jump]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = Number(el.getAttribute("data-card-jump"));
      goTo(idx, idx > active ? 1 : -1);
    });
  });

  /* ── Init ──────────────────────────────────────────────── */
  // Arriving via index.html#radio (Radio tab on other pages) → open AUX directly
  if (location.hash === "#radio") active = total - 1;
  renderAll();
});
