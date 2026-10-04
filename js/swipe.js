/* August — Tinder-style swipe on product cards / home tiles.
   Right = like (boost brand). Left = show less (remove + persist).
   Vertical motion is left alone so the card-stack scroller still wins. */
document.addEventListener("DOMContentLoaded", () => {
  const THRESHOLD = 72;
  const LOCK = 14;
  const SELECTOR = ".product-card, .home-tile, [data-swipe-card]";
  const BLOCK =
    ".swipe-more, .sheet, [data-sheet], .account-mosaic, [data-account-mosaic], .page--account";

  const haptic = (ms = 10) => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  };

  const productFromEl = (el) => {
    const card = el?.closest?.(SELECTOR);
    if (!card) return null;
    const Cat = window.AugustCatalog;
    const id = card.getAttribute("data-product-id");
    const img = card.querySelector("img")?.getAttribute("src") || "";
    let handle = "";
    if (id && Cat?.byId) {
      const hit = Cat.byId(id);
      if (hit) return hit;
    }
    const raw = card.getAttribute("href") || "";
    try {
      const params = new URL(raw, location.href).searchParams;
      const pid = params.get("p");
      handle = params.get("h") || "";
      if (pid && Cat?.byId) {
        const hit = Cat.byId(pid);
        if (hit) return hit;
      }
      if (handle && window.AugustShop?.cached) {
        const hit = window.AugustShop.cached(handle);
        if (hit) return hit;
      }
    } catch {}
    const brand = card.querySelector(".product-card__brand")?.textContent?.trim();
    const title =
      card.querySelector(".product-card__title")?.textContent?.trim() ||
      card.querySelector("img")?.alt?.trim();
    if (Cat?.PRODUCTS && (brand || title)) {
      const hit = Cat.PRODUCTS.find(
        (p) => (title && p.title === title) || (brand && title && p.brand === brand && p.title === title)
      );
      if (hit) return hit;
    }
    if (!brand && !title && !id && !raw) return null;
    return { id: id || handle || raw, handle, brand: brand || "", title: title || "", img };
  };

  const productKeyFromHref = (href) => {
    try {
      const params = new URL(href || "", location.href).searchParams;
      return params.get("p") || params.get("h") || "";
    } catch {
      return "";
    }
  };

  const sameProduct = (el, product) => {
    if (!el || !product) return false;
    const pid = el.getAttribute("data-product-id") || "";
    const hrefKey = productKeyFromHref(el.getAttribute("href") || "");
    const id = product.id != null ? String(product.id) : "";
    const handle = product.handle ? String(product.handle) : "";
    if (id && (pid === id || hrefKey === id)) return true;
    if (handle && (pid === handle || hrefKey === handle)) return true;
    return false;
  };

  const hideMatching = (product, except) => {
    if (!product) return;
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (el === except) return;
      if (el.closest(".swipe-more")) return;
      if (!sameProduct(el, product)) return;
      el.style.display = "none";
      el.setAttribute("hidden", "");
      el.setAttribute("aria-hidden", "true");
    });
  };

  const removeCard = (el) => {
    if (!el) return;
    el.style.display = "none";
    el.setAttribute("hidden", "");
    el.setAttribute("aria-hidden", "true");
    if (typeof el.remove === "function") el.remove();
  };

  const ensureStamps = (card) => {
    if (card.querySelector(".swipe-stamp")) return;
    const host = card.querySelector(".product-card__media") || card;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.insertAdjacentHTML(
      "beforeend",
      `<span class="swipe-stamp swipe-stamp--like" aria-hidden="true">Like</span><span class="swipe-stamp swipe-stamp--less" aria-hidden="true">Less</span>`
    );
  };

  const setStamps = (card, dx) => {
    const like = card.querySelector(".swipe-stamp--like");
    const less = card.querySelector(".swipe-stamp--less");
    const t = Math.min(1, Math.abs(dx) / THRESHOLD);
    if (like) like.style.opacity = dx > 8 ? String(t) : "0";
    if (less) less.style.opacity = dx < -8 ? String(t) : "0";
  };

  let toastTimer = null;
  const dismissToast = (el) => {
    if (!el) return;
    el.classList.remove("is-open");
    setTimeout(() => el.remove(), 220);
  };

  const showToast = ({ title, sub, href, action, quiet, hold }) => {
    document.querySelectorAll("[data-swipe-toast]").forEach((node) => node.remove());
    const el = document.createElement("div");
    el.className = "swipe-toast" + (quiet ? " swipe-toast--quiet" : "");
    el.setAttribute("data-swipe-toast", "");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `
      <p class="swipe-toast__title">${title}</p>
      ${sub ? `<p class="swipe-toast__sub">${sub}</p>` : ""}
      ${href && action ? `<a class="swipe-toast__action" href="${href}">${action}</a>` : ""}
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-open"));
    setTimeout(() => el.classList.add("is-open"), 16);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dismissToast(el), hold || 4500);
    el.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      clearTimeout(toastTimer);
      dismissToast(el);
    });
  };

  let trayTimer = null;
  const showSimilar = (product) => {
    if (!product) return;
    const Cat = window.AugustCatalog;
    let similar = [];
    if (Cat?.PRODUCTS && product.brand) {
      similar = Cat.PRODUCTS.filter((p) => p.id !== product.id && p.brand === product.brand).slice(0, 3);
    }
    if (similar.length < 3 && Cat?.related) {
      const extra = Cat.related(product, 3).filter((p) => !similar.some((s) => s.id === p.id));
      similar = similar.concat(extra).slice(0, 3);
    }
    if (!similar.length) return;

    let tray = document.querySelector("[data-swipe-more]");
    const host = document.querySelector(".page--home") || document.querySelector(".page") || document.body;
    if (!tray) {
      tray = document.createElement("div");
      tray.className = "swipe-more";
      tray.setAttribute("data-swipe-more", "");
      host.appendChild(tray);
    }
    if (!host.classList?.contains?.("page--home")) tray.style.position = "fixed";

    const brandQ = encodeURIComponent(product.brand || "");
    const cards = similar
      .map((p) => {
        const href = Cat.href?.(p) || `product.html?p=${p.id}`;
        return `<a class="swipe-more__card" href="${href}">
          <img src="${p.img}" alt="" />
          <span>${p.title}</span>
        </a>`;
      })
      .join("");

    tray.innerHTML = `
      <div class="swipe-more__bar">
        <p class="swipe-more__title">More like ${product.brand || "this"}</p>
        ${brandQ ? `<a class="swipe-more__shop" href="collection.html?brand=${brandQ}">Shop brand</a>` : ""}
        <button class="swipe-more__close" type="button" aria-label="Dismiss" data-swipe-more-close>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="swipe-more__grid">${cards}</div>
    `;
    tray.hidden = false;
    requestAnimationFrame(() => tray.classList.add("is-open"));
    clearTimeout(trayTimer);
    trayTimer = setTimeout(() => closeSimilar(), 5200);
  };

  const closeSimilar = () => {
    const tray = document.querySelector("[data-swipe-more]");
    if (!tray) return;
    tray.classList.remove("is-open");
    setTimeout(() => {
      tray.hidden = true;
    }, 220);
  };

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-swipe-more-close]")) {
      e.preventDefault();
      closeSimilar();
    }
  });

  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;
  let card = null;
  let lock = null;
  let dragging = false;
  let pointerId = null;
  let suppressClick = false;
  let suppressTimer = null;

  const onDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target.closest(SELECTOR);
    if (!target) return;
    if (target.closest(BLOCK)) return;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    dy = 0;
    card = target;
    lock = null;
    dragging = true;
    pointerId = e.pointerId;
  };

  const onMove = (e) => {
    if (!dragging || e.pointerId !== pointerId || !card) return;
    dx = e.clientX - startX;
    dy = e.clientY - startY;

    if (!lock) {
      if (Math.abs(dx) > LOCK && Math.abs(dx) > Math.abs(dy) * 1.15) lock = "x";
      else if (Math.abs(dy) > LOCK && Math.abs(dy) >= Math.abs(dx)) lock = "y";
    }

    if (lock === "y") return;
    if (lock !== "x") return;

    e.preventDefault();
    ensureStamps(card);
    if (!card.classList.contains("is-swiping")) {
      card.classList.add("is-swiping");
      try {
        card.setPointerCapture(e.pointerId);
      } catch {}
    }
    const rot = Math.max(-14, Math.min(14, dx / 18));
    card.style.transition = "none";
    card.style.transform = `translate3d(${dx}px, ${dy * 0.12}px, 0) rotate(${rot}deg)`;
    setStamps(card, dx);
  };

  const commit = (dir) => {
    const product = productFromEl(card);
    const user =
      product && window.AugustProfile?.recordSwipe ? window.AugustProfile.recordSwipe(product, dir) : null;
    haptic(12);
    if (dir === "like") {
      showSimilar(product);
      if (user) {
        showToast({
          title: "Saved to Liked",
          href: "account.html#liked",
          action: "Review on account",
          quiet: true,
          hold: 2800,
        });
      }
    } else if (dir === "skip" && user) {
      showToast({
        title: "We'll show less of this.",
        sub: "Customize this on your account page if you want to change.",
        href: "account.html#less",
        action: "Review on account",
        hold: 4500,
      });
    }
    return product;
  };

  const onUp = (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    try {
      card?.releasePointerCapture?.(e.pointerId);
    } catch {}

    const swiped = lock === "x" && Math.abs(dx) >= THRESHOLD;
    if (swiped && card) {
      suppressClick = true;
      clearTimeout(suppressTimer);
      suppressTimer = setTimeout(() => {
        suppressClick = false;
      }, 280);
      const dir = dx > 0 ? "like" : "skip";
      const fly = (dx > 0 ? 1 : -1) * (window.innerWidth * 0.7);
      card.classList.add("is-swipe-out");
      card.style.transition = "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease";
      card.style.transform = `translate3d(${fly}px, ${dy * 0.2}px, 0) rotate(${dx > 0 ? 18 : -18}deg)`;
      if (dir === "skip") card.style.opacity = "0";
      const product = commit(dir);
      const done = card;
      if (dir === "skip") {
        hideMatching(product, done);
        setTimeout(() => removeCard(done), 340);
      } else {
        setTimeout(() => {
          done.style.transition = "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease";
          done.style.transform = "";
          setStamps(done, 0);
          done.classList.remove("is-swiping", "is-swipe-out");
          setTimeout(() => {
            done.style.transition = "";
          }, 400);
        }, 340);
      }
    } else if (card && lock === "x") {
      if (Math.abs(dx) > 6) {
        suppressClick = true;
        clearTimeout(suppressTimer);
        suppressTimer = setTimeout(() => {
          suppressClick = false;
        }, 180);
      }
      card.style.transition = "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)";
      card.style.transform = "";
      setStamps(card, 0);
      const done = card;
      setTimeout(() => {
        done.classList.remove("is-swiping");
        done.style.transition = "";
      }, 280);
    }

    card = null;
    lock = null;
    pointerId = null;
    dx = 0;
    dy = 0;
  };

  document.addEventListener("pointerdown", onDown, { passive: true });
  document.addEventListener("pointermove", onMove, { passive: false });
  document.addEventListener("pointerup", onUp);
  document.addEventListener("pointercancel", onUp);

  document.addEventListener(
    "click",
    (e) => {
      if (!suppressClick) return;
      if (!e.target.closest(SELECTOR)) return;
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    },
    true
  );

  document.addEventListener("dragstart", (e) => {
    if (e.target.closest(SELECTOR)) e.preventDefault();
  });

  window.addEventListener("august:swipe", (e) => {
    const { product, dir } = e.detail || {};
    if (dir !== "skip" || !product) return;
    const flying = document.querySelector(`${SELECTOR}.is-swipe-out`);
    hideMatching(product, flying);
  });
});
