/* August — Account page
   Instagram-style profile: fit-pic header, swipe stats, Shop / Liked /
   Less / Orders tabs. Feed chips, brands, and details still read/write
   the same localStorage profile (→ Shopify customer + metafields). */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".account-page");
  if (!page) return;

  const gate = page.querySelector("[data-account-signed-out]");
  const dash = page.querySelector("[data-account-signed-in]");
  const TABS = ["shop", "liked", "less", "orders"];

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem("august_user"));
    } catch {
      return null;
    }
  };

  const monthYear = (ts) => {
    if (!ts) return "September 2026";
    return new Date(ts).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const set = (sel, text) => {
    const el = page.querySelector(sel);
    if (el) el.textContent = text;
  };

  const flashSaved = (btn, label) => {
    if (!btn) return;
    btn.textContent = "Saved ✓";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = label;
      btn.disabled = false;
    }, 1400);
  };

  const esc = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const brandKeyOf = (name) =>
    window.AugustCatalog?.brandKey?.(name) ||
    String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  /* Newest first, unique by id. Counts come from these lists — not
     the brand-key like/skip arrays. */
  const uniqueByDir = (items, dir) => {
    const list = (items || [])
      .filter((it) => it && it.dir === dir && (it.id || it.handle))
      .slice()
      .sort((a, b) => (b.t || 0) - (a.t || 0));
    const seen = new Set();
    const out = [];
    for (const it of list) {
      const key = String(it.id || it.handle);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  };

  const hydrateItem = (it) => {
    const cat =
      (!it.img || !it.title || !it.brand || !it.handle) && it.id
        ? window.AugustCatalog?.byId?.(it.id)
        : null;
    return {
      id: it.id || cat?.id || it.handle || "",
      handle: it.handle || cat?.handle || "",
      brand: it.brand || cat?.brand || "",
      title: it.title || cat?.title || "",
      img: it.img || cat?.img || "",
    };
  };

  const itemHref = (item) => {
    if (window.AugustCatalog?.href) return window.AugustCatalog.href(item);
    if (item.handle) return `product.html?h=${encodeURIComponent(item.handle)}`;
    return `product.html?p=${encodeURIComponent(item.id || "")}`;
  };

  /* ── Tabs + hash deep-links ──────────────────────────────── */

  const tabFromHash = () => {
    const raw = (location.hash || "").replace(/^#/, "").toLowerCase();
    return TABS.includes(raw) ? raw : "shop";
  };

  const applyTab = (name) => {
    const tab = TABS.includes(name) ? name : "shop";
    page.querySelectorAll("[data-account-tabs] [data-account-tab]").forEach((btn) => {
      const on = btn.getAttribute("data-account-tab") === tab;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", String(on));
    });
    page.querySelectorAll("[data-account-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-account-panel") !== tab;
    });
  };

  const goTab = (name) => {
    const tab = TABS.includes(name) ? name : "shop";
    applyTab(tab);
    const next = `#${tab}`;
    if (location.hash !== next) history.replaceState(null, "", next);
  };

  page.querySelector("[data-account-signed-in]")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-account-tab]");
    if (!btn || !dash?.contains(btn)) return;
    goTab(btn.getAttribute("data-account-tab"));
  });

  window.addEventListener("hashchange", () => applyTab(tabFromHash()));
  applyTab(tabFromHash());

  /* ── Page state ──────────────────────────────────────────── */

  const render = () => {
    const user = load();
    if (gate) gate.hidden = !!user;
    if (dash) dash.hidden = !user;
    if (!user) return;

    set("[data-account-name-display]", user.name);
    set("[data-account-email]", user.email);
    set("[data-account-email-2]", user.email);
    set("[data-account-since]", monthYear(user.createdAt));

    const nameInput = page.querySelector("[data-account-name-input]");
    if (nameInput && document.activeElement !== nameInput) nameInput.value = user.name;

    renderSwipeUI(user);
  };

  const renderSwipeUI = (user) => {
    const items = user?.swipes?.items || [];
    const likes = uniqueByDir(items, "like");
    const skips = uniqueByDir(items, "skip");
    set("[data-stat-likes]", String(likes.length));
    set("[data-stat-following]", String((user?.preferredBrands || []).length));
    set("[data-stat-less]", String(skips.length));
    renderMosaic(page.querySelector("[data-liked-grid]"), likes, {
      empty: `Swipe right on the shop to save likes here.`,
      shopLink: true,
    });
    renderMosaic(page.querySelector("[data-less-grid]"), skips, {
      empty: `Nothing hidden. Swipe left on a product to show less of it.`,
      showAgain: true,
    });
  };

  const renderMosaic = (grid, items, opts) => {
    if (!grid) return;
    if (!items.length) {
      const link = opts.shopLink
        ? ` <a href="index.html">Open the shop</a>`
        : "";
      grid.innerHTML = `<p class="account-mosaic__empty">${opts.empty}${link}</p>`;
      return;
    }
    grid.innerHTML = items
      .map((raw) => {
        const item = hydrateItem(raw);
        const again = opts.showAgain
          ? `<button type="button" class="account-mosaic__again" data-show-again="${esc(item.id)}">Show again</button>`
          : "";
        const img = item.img
          ? `<img src="${esc(item.img)}" alt="${esc(item.title)}" />`
          : "";
        return `<figure class="account-mosaic__tile">
          <a class="account-mosaic__link" href="${esc(itemHref(item))}">${img}</a>
          ${again}
        </figure>`;
      })
      .join("");
  };

  const showAgain = (id) => {
    if (!id) return;
    if (typeof window.AugustProfile?.undoSwipe === "function") {
      window.AugustProfile.undoSwipe(id);
      renderSwipeUI(load());
      return;
    }
    const user = load();
    if (!user || !window.AugustProfile) return;
    const swipes = {
      likes: [...(user.swipes?.likes || [])],
      skips: [...(user.swipes?.skips || [])],
      items: [...(user.swipes?.items || [])],
    };
    const removed = swipes.items.filter((it) => String(it.id || it.handle) === String(id));
    swipes.items = swipes.items.filter((it) => String(it.id || it.handle) !== String(id));
    removed.forEach((it) => {
      const brand = it.brand || window.AugustCatalog?.byId?.(it.id)?.brand;
      if (!brand) return;
      const key = brandKeyOf(brand);
      const stillSkip = swipes.items.some((other) => {
        if (other.dir !== "skip") return false;
        const otherBrand = other.brand || window.AugustCatalog?.byId?.(other.id)?.brand;
        return otherBrand && brandKeyOf(otherBrand) === key;
      });
      if (!stillSkip) swipes.skips = swipes.skips.filter((k) => brandKeyOf(k) !== key);
    });
    user.swipes = swipes;
    window.AugustProfile.save(user);
  };

  page.querySelector("[data-less-grid]")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-show-again]");
    if (!btn) return;
    e.preventDefault();
    showAgain(btn.getAttribute("data-show-again"));
  });

  render();
  window.addEventListener("august:profile-changed", render);

  /* ── Placed orders (from checkout) above the sample ones ── */

  const renderPlacedOrders = () => {
    const ordersPanel = page.querySelector(".account-orders");
    if (!ordersPanel || !window.AugustCart || !window.AugustCatalog) return;

    // Clear any previously injected rows, keep the static samples
    ordersPanel.querySelectorAll("[data-placed-order]").forEach((el) => el.remove());

    const heading = ordersPanel.querySelector("h2");
    const orders = window.AugustCart.orders();
    // newest first, insert directly under the heading
    [...orders].reverse().forEach((order) => {
      const first = window.AugustCatalog.byId(order.items[0]?.id);
      if (!first) return;
      const extra = order.items.length > 1 ? ` +${order.items.length - 1} more` : "";
      const date = new Date(order.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const status = order.status || "Processing";
      const statusClass = window.AugustOrders?.statusClass(status) || "order-status--transit";
      const row = document.createElement("a");
      row.className = "order-row";
      row.href = `order.html?o=${encodeURIComponent(order.no)}`;
      row.setAttribute("data-placed-order", "");
      row.innerHTML = `
        <div class="order-row__thumb"><img src="${first.img}" alt="" /></div>
        <div class="order-row__info">
          <span class="order-row__title">${first.title}${extra}</span>
          <span class="order-row__meta">${order.no} · ${date}</span>
        </div>
        <span class="order-status ${statusClass}">${status}</span>
        <span class="order-row__price">${window.AugustCatalog.money(order.total)}</span>
      `;
      heading.insertAdjacentElement("afterend", row);
    });
  };

  renderPlacedOrders();
  window.addEventListener("august:cart-changed", renderPlacedOrders);

  /* ── My feed ─────────────────────────────────────────────── */

  const deptEl = page.querySelector("[data-home-dept]");
  const catEl = page.querySelector("[data-home-cat]");
  const saleEl = page.querySelector("[data-home-sale]");
  const enabledEl = page.querySelector("[data-home-enabled]");
  const previewEl = page.querySelector("[data-home-preview]");
  const stageEl = page.querySelector("[data-home-stage]");
  const saveBtn = page.querySelector("[data-home-save]");

  const readChip = (el) =>
    el?.querySelector(".pref-chip.is-active")?.getAttribute("data-value") || "all";

  const setChip = (el, value) => {
    el?.querySelectorAll(".pref-chip").forEach((c) => {
      c.classList.toggle("is-active", c.getAttribute("data-value") === value);
    });
  };

  const currentPrefs = () => ({
    enabled: !!enabledEl?.checked,
    department: readChip(deptEl),
    category: readChip(catEl),
    saleOnly: !!saleEl?.checked,
  });

  const updatePreview = () => {
    const hp = currentPrefs();
    if (previewEl && window.AugustProfile) {
      if (window.AugustProfile.feedIsDefault(hp)) {
        previewEl.textContent = "Homepage: standard August";
      } else {
        const label = window.AugustProfile.feedLabel(hp);
        previewEl.textContent = hp.enabled
          ? `Homepage: ${label}`
          : `Saved feed: ${label} (off)`;
      }
    }
    renderStage(hp);
  };

  const renderStage = (hp) => {
    if (!stageEl || !window.AugustCatalog) return;
    let items = window.AugustCatalog.feed(hp, 5);
    if (items.length < 5 && hp.saleOnly) {
      const extra = window.AugustCatalog
        .feed({ ...hp, saleOnly: false }, 8)
        .filter((p) => !items.some((x) => x.id === p.id));
      items = [...items, ...extra].slice(0, 5);
    }
    if (!items.length) {
      stageEl.removeAttribute("data-count");
      stageEl.innerHTML = `<p class="account-feed__empty">Nothing in this mix yet. Try another filter.</p>`;
      return;
    }
    const href = window.AugustCatalog.href;
    stageEl.dataset.count = String(items.length);
    stageEl.innerHTML = items
      .map(
        (p, i) => `
      <a class="feed-tile${i === 0 ? " feed-tile--hero" : ""}" href="${href(p)}">
        <img src="${p.img}" alt="" />
        <span class="feed-tile__meta">
          <span class="feed-tile__brand">${p.brand}</span>
          <span class="feed-tile__title">${p.title}</span>
        </span>
      </a>`
      )
      .join("");
  };

  const hydratePrefs = () => {
    const user = load();
    const hp = (user && user.homepage) || {
      enabled: true,
      department: "all",
      category: "all",
      saleOnly: false,
    };
    setChip(deptEl, hp.department || "all");
    setChip(catEl, hp.category || "all");
    if (saleEl) saleEl.checked = !!hp.saleOnly;
    if (enabledEl) enabledEl.checked = hp.enabled !== false;
    updatePreview();
  };

  [deptEl, catEl].forEach((el) => {
    el?.addEventListener("click", (e) => {
      const chip = e.target.closest(".pref-chip");
      if (!chip) return;
      setChip(el, chip.getAttribute("data-value"));
      updatePreview();
    });
  });

  saleEl?.addEventListener("change", updatePreview);
  enabledEl?.addEventListener("change", updatePreview);

  saveBtn?.addEventListener("click", () => {
    const user = load();
    if (!user || !window.AugustProfile) return;
    user.homepage = currentPrefs();
    window.AugustProfile.save(user);
    flashSaved(saveBtn, "Save");
  });

  hydratePrefs();
  window.addEventListener("august:profile-changed", hydratePrefs);

  /* ── Details (name) ──────────────────────────────────────── */

  page.querySelector("[data-details-save]")?.addEventListener("click", (e) => {
    const user = load();
    if (!user || !window.AugustProfile) return;
    const nameInput = page.querySelector("[data-account-name-input]");
    if (nameInput && nameInput.value.trim()) user.name = nameInput.value.trim();
    window.AugustProfile.save(user);
    flashSaved(e.currentTarget, "Save details");
  });

  /* ── Brands I follow ─────────────────────────────────────── */

  const brandsEl = page.querySelector("[data-account-brands]");

  if (brandsEl && window.AugustCatalog) {
    const key = window.AugustCatalog.brandKey;
    brandsEl.innerHTML = window.AugustCatalog
      .brands()
      .map((b) => `<button type="button" class="pref-chip" data-value="${b}">${b}</button>`)
      .join("");
  }

  const hydrateBrands = () => {
    const user = load();
    const brands = (user && user.preferredBrands) || [];
    const key = window.AugustCatalog?.brandKey || ((s) => s);
    brandsEl?.querySelectorAll(".pref-chip").forEach((c) => {
      const value = c.getAttribute("data-value");
      c.classList.toggle(
        "is-active",
        brands.some((b) => key(b) === key(value))
      );
    });
  };

  brandsEl?.addEventListener("click", (e) => {
    const chip = e.target.closest(".pref-chip");
    if (chip) chip.classList.toggle("is-active");
  });

  page.querySelector("[data-brands-save]")?.addEventListener("click", (e) => {
    const user = load();
    if (!user || !window.AugustProfile) return;
    user.preferredBrands = [...brandsEl.querySelectorAll(".pref-chip.is-active")].map((c) =>
      c.getAttribute("data-value")
    );
    window.AugustProfile.save(user);
    flashSaved(e.currentTarget, "Save brands");
  });

  hydrateBrands();
  window.addEventListener("august:profile-changed", hydrateBrands);
});
