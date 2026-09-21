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

  /* ── Wheel: continuous scroll rotates the stack ──────────
     A fresh gesture flips a card quickly (small threshold). Keeping the
     scroll going flips the next card as soon as each animation settles —
     no need to stop and re-scroll between cards. A single flick's inertia
     tail won't double-flip: repeat flips inside the same event stream
     need a much larger accumulated delta, which decaying inertia rarely
     reaches, while a deliberate sustained scroll easily does. */
  let wheelAccum = 0;
  let lastWheelAt = 0;
  let flippedThisStream = false;
  const WHEEL_THRESHOLD = 80;   // fresh gesture
  const WHEEL_REPEAT = 260;     // continued scroll in the same stream
  const WHEEL_GAP_MS = 140;     // pause that separates gestures

  stack.addEventListener("wheel", (e) => {
    const scroller = e.target.closest("[data-card-scroll]");
    if (scroller) {
      const atTop = scroller.scrollTop <= 1;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
    }

    e.preventDefault();

    const now = performance.now();
    if (now - lastWheelAt > WHEEL_GAP_MS) {
      // New gesture (finger lifted / wheel paused) — reset the stream.
      wheelAccum = 0;
      flippedThisStream = false;
    }
    lastWheelAt = now;

    // Don't bank deltas while a flip animates — a long scroll should
    // advance one card per animation, not queue a burst of them.
    if (animating) {
      wheelAccum = 0;
      return;
    }

    // Direction change resets accumulation
    if (wheelAccum !== 0 && Math.sign(e.deltaY) !== Math.sign(wheelAccum)) {
      wheelAccum = 0;
    }

    wheelAccum += e.deltaY;

    const needed = flippedThisStream ? WHEEL_REPEAT : WHEEL_THRESHOLD;
    if (Math.abs(wheelAccum) < needed) return;

    const dir = wheelAccum;
    wheelAccum = 0;
    flippedThisStream = true;
    if (dir > 0) next();
    else prev();
  }, { passive: false });

  /* ── Pointer drag (touch + mouse unified) ──────────────── */

  /* Links and buttons do NOT block drags — brand cards are covered by a
     full-card link, which would make them un-swipeable. A tap without
     movement still clicks through; a confirmed drag suppresses the click. */
  const skipDrag = (el) =>
    el.closest(
      "input, select, textarea, .waveform, .audio-player__queue, .profile-drop, .profile-modal, .sheet, .tabbar, .home-tile, .product-card, a.btn, .aux-event"
    );

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
    } else if (dir < 0) {
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
    if (Math.abs(rawDy) < 16) return; // keep taps on product tiles clickable

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
    // A real drag on a banner card must not fire the banner's link. The
    // flag expires quickly so a later genuine tap still navigates even if
    // the browser swallowed the post-drag click itself.
    if (Math.abs(dy) > 6) {
      suppressClick = true;
      clearTimeout(suppressClickTimer);
      suppressClickTimer = setTimeout(() => { suppressClick = false; }, 150);
    }
    try { stack.releasePointerCapture(e.pointerId); } catch {}
    const dt = Math.max(1, performance.now() - startTime);
    const velocity = -dy / dt; // px/ms, positive = swiping up
    const delta = -dy;

    let commit = null;
    if (delta > COMMIT_DIST || velocity > COMMIT_VEL) commit = "next";
    else if (delta < -COMMIT_DIST || velocity < -COMMIT_VEL) commit = "prev";

    releaseDrag(commit, velocity);
    activePointerId = null;
  };

  stack.addEventListener("pointerup", onUp);
  stack.addEventListener("pointercancel", onUp);

  /* After a drag gesture, swallow the click so banner links only navigate
     on a genuine tap/click (capture phase beats the anchor's default). */
  let suppressClick = false;
  let suppressClickTimer = null;
  stack.addEventListener(
    "click",
    (e) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  /* Keep the browser from starting a native link/image drag mid-swipe */
  stack.addEventListener("dragstart", (e) => {
    if (e.target.closest(".card-stack__card--brand")) e.preventDefault();
  });

  /* ── Touch: scrollable cards advance at their edges ────────
     Cards with [data-card-scroll] scroll natively, which means the
     pointer-drag above never fires inside them (the browser owns the
     gesture). Mirror the wheel behavior for touch: once the scroller
     is at its top/bottom edge, a continued swipe flips the card
     instead of dead-ending — no more tapping dots to advance. */
  const EDGE_SWIPE = 56; // px past the edge before the card flips
  stack.querySelectorAll("[data-card-scroll]").forEach((scroller) => {
    let startTouchY = 0;
    let atTopAtStart = false;
    let atBottomAtStart = false;
    let consumed = false;

    scroller.addEventListener(
      "touchstart",
      (e) => {
        startTouchY = e.touches[0].clientY;
        atTopAtStart = scroller.scrollTop <= 1;
        atBottomAtStart = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
        consumed = false;
      },
      { passive: true }
    );

    scroller.addEventListener(
      "touchmove",
      (e) => {
        if (consumed || animating) return;
        const dy = e.touches[0].clientY - startTouchY;
        const atTop = scroller.scrollTop <= 1;
        const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;

        // Swipe up while pinned to the bottom → next card
        if (dy < -EDGE_SWIPE && atBottom && atBottomAtStart) {
          consumed = true;
          e.preventDefault();
          next();
        }
        // Swipe down while pinned to the top → previous card
        else if (dy > EDGE_SWIPE && atTop && atTopAtStart) {
          consumed = true;
          e.preventDefault();
          prev();
        }
      },
      { passive: false }
    );
  });

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
