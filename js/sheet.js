/* August — Bottom sheet controller
   Declarative API:
     - <div class="sheet" id="x" data-sheet> …
     - <button data-sheet-open="x">Open</button>     → opens sheet #x
     - <button data-sheet-close>Close</button>       → closes the enclosing sheet
     - <div class="sheet__backdrop" data-sheet-close> → tap to dismiss
   Programmatic API:
     window.Sheet.open(id)
     window.Sheet.close(id)
     window.Sheet.toggle(id)
   Events (dispatched on the sheet element):
     'sheet:open', 'sheet:close'
   Drag-to-dismiss:
     Drag from the grabber or header. Threshold: 120px OR velocity > 0.6 px/ms.
     Disable per-sheet with data-drag="false" on the .sheet element.
*/
(() => {
  const SHEETS = new Map(); // id -> { el, panel, opener }

  const FOCUSABLE_SEL =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const anyOpen = () =>
    [...SHEETS.values()].some((entry) => entry.el.classList.contains("is-open"));

  const setBodyLocked = (locked) => {
    document.body.classList.toggle("sheet-open", locked);
  };

  const focusFirst = (panel) => {
    const target =
      panel.querySelector("[autofocus]") ||
      panel.querySelector(FOCUSABLE_SEL);
    if (target && typeof target.focus === "function") {
      // rAF so the transition is underway before focus jumps
      requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }
  };

  const trapFocus = (el, e) => {
    if (e.key !== "Tab") return;
    const focusables = [...el.querySelectorAll(FOCUSABLE_SEL)].filter(
      (n) => !n.hasAttribute("hidden") && n.offsetParent !== null
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const open = (id) => {
    const entry = SHEETS.get(id);
    if (!entry || entry.el.classList.contains("is-open")) return;
    const { el, panel } = entry;
    entry.opener =
      document.activeElement && document.activeElement !== document.body
        ? document.activeElement
        : null;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    setBodyLocked(true);
    focusFirst(panel);
    el.dispatchEvent(new CustomEvent("sheet:open", { bubbles: true }));
  };

  const close = (id) => {
    const entry = SHEETS.get(id);
    if (!entry || !entry.el.classList.contains("is-open")) return;
    const { el, panel, opener } = entry;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    // Clear any lingering inline transform from a drag
    panel.style.transform = "";
    panel.classList.remove("is-dragging");
    if (!anyOpen()) setBodyLocked(false);
    if (opener && typeof opener.focus === "function") {
      requestAnimationFrame(() => opener.focus({ preventScroll: true }));
    }
    entry.opener = null;
    el.dispatchEvent(new CustomEvent("sheet:close", { bubbles: true }));
  };

  const toggle = (id) => {
    const entry = SHEETS.get(id);
    if (!entry) return;
    entry.el.classList.contains("is-open") ? close(id) : open(id);
  };

  /* ── Drag-to-dismiss ─────────────────────────────────────── */

  const attachDrag = (id, panel) => {
    // Elements the user can grab: the grabber and the header (excluding the close btn).
    const dragZones = panel.querySelectorAll(
      ".sheet__grabber, [data-sheet-drag-zone]"
    );
    const header = panel.querySelector(".sheet__header");
    const zones = [...dragZones];
    if (header) zones.push(header);
    if (!zones.length) return;

    let startY = 0;
    let currentY = 0;
    let dragging = false;
    let startTime = 0;
    let activePointerId = null;
    let activeZone = null;

    const onDown = (e) => {
      // Don't start drag from within the close button or nested interactive controls.
      if (e.target.closest("button:not(.sheet__grabber), a, input, select, textarea")) return;
      startY = e.clientY;
      currentY = 0;
      dragging = true;
      startTime = performance.now();
      activePointerId = e.pointerId;
      activeZone = e.currentTarget;
      panel.classList.add("is-dragging");
      try {
        activeZone.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onMove = (e) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      const dy = e.clientY - startY;
      // Rubber-band on upward drag (past open state)
      currentY = dy < 0 ? dy * 0.22 : dy;
      panel.style.transform = `translateY(${currentY}px)`;
    };

    const onUp = (e) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      dragging = false;
      panel.classList.remove("is-dragging");

      const dt = Math.max(1, performance.now() - startTime);
      const velocity = currentY / dt; // px/ms, positive = downward
      const shouldClose = currentY > 120 || velocity > 0.6;

      // Clear inline transform so CSS takes over the animation.
      panel.style.transform = "";
      try {
        activeZone && activeZone.releasePointerCapture(e.pointerId);
      } catch {}
      activePointerId = null;
      activeZone = null;

      if (shouldClose) close(id);
    };

    zones.forEach((zone) => {
      zone.addEventListener("pointerdown", onDown);
      zone.addEventListener("pointermove", onMove);
      zone.addEventListener("pointerup", onUp);
      zone.addEventListener("pointercancel", onUp);
    });
  };

  /* ── Registration ────────────────────────────────────────── */

  const register = (el) => {
    if (!el.id) {
      console.warn("[sheet] missing id on", el);
      return;
    }
    if (SHEETS.has(el.id)) return; // already registered
    const panel = el.querySelector("[data-sheet-panel]");
    if (!panel) {
      console.warn("[sheet] missing [data-sheet-panel] inside", el.id);
      return;
    }

    el.setAttribute("aria-hidden", "true");
    if (!el.getAttribute("role")) el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");

    SHEETS.set(el.id, { el, panel, opener: null });

    // Close buttons + backdrop
    el.querySelectorAll("[data-sheet-close]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        close(el.id);
      });
    });

    // Escape + focus trap while open
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(el.id);
        return;
      }
      trapFocus(el, e);
    });

    // Drag-to-dismiss unless opted out
    if (el.dataset.drag !== "false") attachDrag(el.id, panel);
  };

  /* ── Auto-wire on DOM ready ──────────────────────────────── */

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-sheet]").forEach(register);

    // Delegated openers: any [data-sheet-open="id"] anywhere in the doc
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-sheet-open]");
      if (!opener) return;
      const id = opener.getAttribute("data-sheet-open");
      if (!id) return;
      e.preventDefault();
      open(id);
    });
  });

  // Public API
  window.Sheet = {
    open,
    close,
    toggle,
    register, // for sheets injected after initial load
    isOpen: (id) => {
      const entry = SHEETS.get(id);
      return !!(entry && entry.el.classList.contains("is-open"));
    },
  };
})();
