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

  const haptic = (ms = 8) => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try { navigator.vibrate(ms); } catch {}
    }
  };

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
      // translate3d promotes to a compositor layer — keeps drag at 60fps
      // even during momentum-scroll on a real device.
      row.style.transform = `translate3d(${x}px, 0, 0)`;
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

      // Momentum-scaled release: fast flick → snap fast, slow drag → gentle
      const speed = Math.min(2.0, Math.abs(velocity));
      const dur = Math.max(200, 380 - speed * 100);
      row.style.setProperty("transition-duration", `${dur}ms`);

      const wasOpen = swipe.classList.contains("is-open");
      if (finalX < -OPEN_THRESHOLD) {
        // Snap open
        swipe.classList.add("is-open");
        row.style.transform = "";
        openSwipe = swipe;
        if (!wasOpen) haptic(6); // soft tick on open
      } else {
        // Snap closed
        swipe.classList.remove("is-open");
        row.style.transform = "";
        if (openSwipe === swipe) openSwipe = null;
        if (wasOpen) haptic(4); // even softer on close
      }

      // Restore default duration after the animation
      setTimeout(() => {
        row.style.removeProperty("transition-duration");
      }, dur + 60);
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
    haptic(14);
    // Two-stage animation: first slide the row off left, then collapse height.
    // Feels closer to iOS Mail delete than a simultaneous height+opacity collapse.
    const row = swipe.querySelector(".cart-swipe__row");
    if (row) {
      row.style.transition = "transform 260ms var(--ease-swipe)";
      row.style.transform = "translate3d(-105%, 0, 0)";
    }
    const nextDivider =
      swipe.nextElementSibling && swipe.nextElementSibling.classList.contains("cart-divider")
        ? swipe.nextElementSibling
        : swipe.previousElementSibling && swipe.previousElementSibling.classList.contains("cart-divider")
        ? swipe.previousElementSibling
        : null;
    // Trigger the collapse a beat after the slide starts
    setTimeout(() => swipe.classList.add("is-removing"), 140);
    setTimeout(() => {
      const index = Number(swipe.getAttribute("data-cart-index"));
      swipe.remove();
      if (nextDivider) nextDivider.remove();
      // Write-through to the store, then re-render so indexes stay true
      if (window.AugustCart && Number.isFinite(index)) window.AugustCart.removeAt(index);
      renderCart();
    }, 460);
  };

  const saveItem = (swipe) => {
    // Prototype: flash the row briefly, then close.
    swipe.classList.remove("is-open");
    swipe.classList.add("is-saved-flash");
    setTimeout(() => swipe.classList.remove("is-saved-flash"), 700);
  };

  /* ── Render the cart from the store ─────────────────────── */

  const ACTIONS_HTML = `
    <div class="cart-swipe__actions" aria-hidden="true">
      <button class="cart-swipe__action cart-swipe__action--save" data-cart-save type="button" aria-label="Save for later">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 3h10v13l-5-3-5 3V3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
        <span>Save</span>
      </button>
      <button class="cart-swipe__action cart-swipe__action--delete" data-cart-remove type="button" aria-label="Remove">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 5h12M6 5V3.5A1.5 1.5 0 017.5 2h3A1.5 1.5 0 0112 3.5V5m1 0v9.5A1.5 1.5 0 0111.5 16h-5A1.5 1.5 0 015 14.5V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>Remove</span>
      </button>
    </div>`;

  const lineHtml = (item, product, index) => `
    <div class="cart-swipe" data-cart-swipe data-cart-index="${index}">
      ${ACTIONS_HTML}
      <div class="cart-swipe__row cart-line">
        <div class="cart-line__left">
          <div class="cart-line__thumb"><img src="${product.img}" alt="" /></div>
          <div>
            <div class="cart-line__title">${product.title}</div>
            <div class="cart-line__meta">${product.brand} · Size ${item.size} · Qty ${item.qty}</div>
          </div>
        </div>
        <div class="cart-line__price">${window.AugustCatalog.money(product.price * item.qty)}</div>
      </div>
    </div>`;

  const renderCart = () => {
    const list = document.querySelector("[data-cart-list]");
    if (!list || !window.AugustCart || !window.AugustCatalog) return;

    const items = window.AugustCart.items();
    const empty = document.querySelector("[data-cart-empty]");
    const layout = document.querySelector(".cart-layout");
    const countLabel = document.querySelector("[data-cart-count]");

    if (empty) empty.hidden = items.length > 0;
    if (layout) layout.hidden = items.length === 0;
    const n = window.AugustCart.count();
    if (countLabel) countLabel.textContent = `${n} item${n === 1 ? "" : "s"}`;

    const rows = items
      .map((item, i) => {
        const product = window.AugustCatalog.byId(item.id);
        return product ? lineHtml(item, product, i) : "";
      })
      .filter(Boolean);
    list.innerHTML =
      rows.join('<div class="cart-divider"></div>') +
      '<p class="cart-lines__hint">Swipe left on any item to save or remove.</p>';

    list.querySelectorAll("[data-cart-swipe]").forEach(wireSwipe);

    // Totals
    const subtotal = window.AugustCart.subtotal();
    const sub = document.querySelector("[data-cart-subtotal]");
    const total = document.querySelector("[data-cart-total]");
    if (sub) sub.textContent = window.AugustCatalog.money(subtotal);
    if (total) total.textContent = window.AugustCatalog.money(subtotal);

    const checkout = document.querySelector("[data-cart-checkout]");
    if (checkout) checkout.classList.toggle("is-disabled", items.length === 0);
  };

  /* ── Checkout: place the order, show confirmation ─────────── */

  const wireCheckout = () => {
    const checkout = document.querySelector("[data-cart-checkout]");
    if (!checkout) return;
    checkout.addEventListener("click", (e) => {
      e.preventDefault();
      if (!window.AugustCart || !window.AugustCart.items().length) return;
      const order = window.AugustCart.placeOrder();
      if (!order) return;

      const main = document.querySelector(".cart-page");
      const layout = document.querySelector(".cart-layout");
      const countLabel = document.querySelector("[data-cart-count]");
      if (layout) layout.hidden = true;
      if (countLabel) countLabel.textContent = "";

      const confirm = document.createElement("div");
      confirm.className = "cart-empty order-confirm";
      confirm.innerHTML = `
        <div class="cart-empty__icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="21" stroke="currentColor" stroke-width="1.5"/><path d="M15 24l6 6 12-12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h2 class="cart-empty__title">Order placed</h2>
        <p class="cart-empty__sub">${order.no} · ${order.items.reduce((s, i) => s + i.qty, 0)} item${order.items.length === 1 ? "" : "s"} · ${window.AugustCatalog.money(order.total)}<br />Pickup at August, 218 State St — we'll email you when it's ready.</p>
        <a class="btn btn--primary" href="account.html">View in your account</a>
      `;
      main?.appendChild(confirm);
      confirm.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    wireCheckout();

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
