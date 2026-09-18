/* August — Cart iOS swipe-to-reveal + tap actions
   Adds native-app-feeling swipe gestures to each .cart-swipe row:
     - Swipe left ≥50px → reveal Save + Remove actions (snap to open)
     - Swipe left ≥180px → auto-remove
     - Swipe right on open → close
     - Tap outside an open row → close
     - Tap Remove → animate collapse, then remove from DOM + update count
     - Tap Save → close the row + soft flash (prototype)
*/
(() => {
  const OPEN_OFFSET = 168; // matches CSS: reveals both 84px action buttons
  const OPEN_THRESHOLD = 50;
  const AUTO_DELETE_THRESHOLD = 180;
  const VELOCITY_THRESHOLD = 0.6; // px/ms

  let openSwipe = null;

  const closeAll = (except = null) => {
    document.querySelectorAll(".cart-swipe.is-open").forEach((sw) => {
      if (sw !== except) {
        sw.classList.remove("is-open");
        const row = sw.querySelector(".cart-swipe__row");
        if (row) row.style.transform = "";
      }
    });
    if (openSwipe && openSwipe !== except) openSwipe = null;
  };

  const wireSwipe = (swipe) => {
    if (swipe.dataset.cartSwipeWired === "1") return;
    swipe.dataset.cartSwipeWired = "1";
    const row = swipe.querySelector(".cart-swipe__row");
    if (!row) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let dragging = false;
    let horizontalConfirmed = false;
    let startTime = 0;
    let activePointerId = null;
    // Track initial offset so drags start from current position
    let startOffset = 0;

    const currentOffset = () => {
      const t = row.style.transform;
      const match = t.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
      if (match) return parseFloat(match[1]);
      return swipe.classList.contains("is-open") ? -OPEN_OFFSET : 0;
    };

    const setOffset = (x) => {
      row.style.transform = `translateX(${x}px)`;
    };

    const onDown = (e) => {
      // Ignore if pointing at an action button
      if (e.target.closest(".cart-swipe__action")) return;
      startX = e.clientX;
      startY = e.clientY;
      currentX = 0;
      dragging = true;
      horizontalConfirmed = false;
      startTime = performance.now();
      activePointerId = e.pointerId;
      startOffset = currentOffset();
    };

    const onMove = (e) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Lock direction: if vertical movement dominates, bail (let scroll happen)
      if (!horizontalConfirmed) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; // too small to decide
        if (Math.abs(dy) > Math.abs(dx)) {
          dragging = false;
          return;
        }
        horizontalConfirmed = true;
        swipe.classList.add("is-dragging");
        try {
          row.setPointerCapture(e.pointerId);
        } catch {}
        // Prevent page scroll while horizontal dragging
        e.preventDefault();
        closeAll(swipe);
      }
      e.preventDefault();

      currentX = dx;
      let x = startOffset + dx;
      // Rubber-band past the natural bounds
      if (x > 0) x = x * 0.25;
      const maxOpen = -(OPEN_OFFSET + 40); // small overshoot allowed
      if (x < maxOpen) x = maxOpen + (x - maxOpen) * 0.3;
      setOffset(x);
    };

    const onUp = (e) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      dragging = false;
      swipe.classList.remove("is-dragging");
      try {
        row.releasePointerCapture(e.pointerId);
      } catch {}
      activePointerId = null;

      if (!horizontalConfirmed) return;

      const finalX = startOffset + currentX;
      const dt = Math.max(1, performance.now() - startTime);
      const velocity = -currentX / dt; // px/ms leftward

      // Auto-delete on aggressive left swipe
      if (finalX < -AUTO_DELETE_THRESHOLD || (velocity > VELOCITY_THRESHOLD && currentX < -80)) {
        removeItem(swipe);
        return;
      }
      if (finalX < -OPEN_THRESHOLD) {
        // Snap open
        swipe.classList.add("is-open");
        row.style.transform = ""; // let CSS drive translation
        openSwipe = swipe;
      } else {
        // Snap closed
        swipe.classList.remove("is-open");
        row.style.transform = "";
        if (openSwipe === swipe) openSwipe = null;
      }
    };

    row.addEventListener("pointerdown", onDown);
    row.addEventListener("pointermove", onMove);
    row.addEventListener("pointerup", onUp);
    row.addEventListener("pointercancel", onUp);

    // Tap on the open row to close (via the ::after overlay)
    row.addEventListener("click", (e) => {
      if (!swipe.classList.contains("is-open")) return;
      if (e.target.closest(".cart-swipe__action")) return;
      e.preventDefault();
      e.stopPropagation();
      swipe.classList.remove("is-open");
      if (openSwipe === swipe) openSwipe = null;
    });
  };

  const removeItem = (swipe) => {
    if (window.navigator && typeof navigator.vibrate === "function") {
      try { navigator.vibrate(12); } catch {}
    }
    swipe.classList.add("is-removing");
    // Also remove the trailing divider so we don't leave floating hairlines
    const nextDivider =
      swipe.nextElementSibling && swipe.nextElementSibling.classList.contains("cart-divider")
        ? swipe.nextElementSibling
        : swipe.previousElementSibling && swipe.previousElementSibling.classList.contains("cart-divider")
        ? swipe.previousElementSibling
        : null;
    setTimeout(() => {
      swipe.remove();
      if (nextDivider) nextDivider.remove();
      updateCount();
    }, 340);
  };

  const saveItem = (swipe) => {
    // Prototype: flash the row briefly, then close.
    swipe.classList.remove("is-open");
    swipe.classList.add("is-saved-flash");
    setTimeout(() => swipe.classList.remove("is-saved-flash"), 700);
  };

  const updateCount = () => {
    const list = document.querySelector("[data-cart-list]");
    if (!list) return;
    const remaining = list.querySelectorAll(".cart-swipe:not(.is-removing)").length;
    const label = document.querySelector(".cart-page__count");
    if (label) label.textContent = `${remaining} item${remaining === 1 ? "" : "s"}`;
    // Also refresh totals as a nice touch (simple sum from data attrs would go here)
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-cart-swipe]").forEach(wireSwipe);

    // Delegated action clicks
    document.addEventListener("click", (e) => {
      const removeBtn = e.target.closest("[data-cart-remove]");
      if (removeBtn) {
        const sw = removeBtn.closest("[data-cart-swipe]");
        if (sw) removeItem(sw);
        return;
      }
      const saveBtn = e.target.closest("[data-cart-save]");
      if (saveBtn) {
        const sw = saveBtn.closest("[data-cart-swipe]");
        if (sw) saveItem(sw);
        return;
      }
      // Tap outside any open swipe → close them
      if (!e.target.closest(".cart-swipe.is-open")) {
        closeAll();
      }
    });

    // Escape closes any open swipe
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });
  });
})();
