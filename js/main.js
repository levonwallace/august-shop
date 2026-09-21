/* Tiny interactions for the UX prototype */
document.addEventListener("DOMContentLoaded", () => {
  /* ── Inject mobile-only sheets used by the tab bar ────────────
     Kept here (not in each HTML page) so they stay in sync. */
  const injectMobileSheets = () => {
    if (!document.getElementById("search-sheet")) {
      const search = document.createElement("div");
      search.className = "sheet sheet--large";
      search.id = "search-sheet";
      search.setAttribute("data-sheet", "");
      search.setAttribute("aria-labelledby", "search-sheet-title");
      search.innerHTML = `
        <div class="sheet__backdrop" data-sheet-close></div>
        <div class="sheet__panel" data-sheet-panel>
          <div class="sheet__grabber" aria-hidden="true"></div>
          <header class="sheet__header">
            <h2 class="sheet__title" id="search-sheet-title">Search</h2>
            <button class="sheet__close" type="button" aria-label="Close" data-sheet-close>
              <svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            </button>
          </header>
          <div class="sheet__body">
            <label class="sheet-search">
              <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4.25" stroke="currentColor" stroke-width="1.4"/><path d="M9.2 9.2L12 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              <input type="search" placeholder="Search products, brands, colors…" autofocus />
            </label>
            <div class="sheet-section">
              <p class="sheet-section__label">Popular</p>
              <div class="sheet-chips">
                <button type="button" class="sheet-chip">Vans Old Skool</button>
                <button type="button" class="sheet-chip">Hoka Mafate</button>
                <button type="button" class="sheet-chip">Lady White Co.</button>
                <button type="button" class="sheet-chip">Dr. Martens</button>
                <button type="button" class="sheet-chip">Puma Speedcat</button>
                <button type="button" class="sheet-chip">Souvenir</button>
              </div>
            </div>
            <div class="sheet-section">
              <p class="sheet-section__label">Recent</p>
              <div class="sheet-list">
                <a class="sheet-list__row" href="product.html">
                  <span>Souvenir Navy</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <a class="sheet-list__row" href="product.html">
                  <span>Ora Primo EXT</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <a class="sheet-list__row" href="product.html">
                  <span>Mafate 2 OG</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(search);
    }

    if (!document.getElementById("profile-sheet")) {
      const profile = document.createElement("div");
      profile.className = "sheet";
      profile.id = "profile-sheet";
      profile.setAttribute("data-sheet", "");
      profile.setAttribute("aria-labelledby", "profile-sheet-title");
      profile.innerHTML = `
        <div class="sheet__backdrop" data-sheet-close></div>
        <div class="sheet__panel" data-sheet-panel>
          <div class="sheet__grabber" aria-hidden="true"></div>
          <header class="sheet__header">
            <h2 class="sheet__title" id="profile-sheet-title">Account</h2>
            <button class="sheet__close" type="button" aria-label="Close" data-sheet-close>
              <svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            </button>
          </header>
          <div class="sheet__body" data-profile-sheet-body>
            <!-- Hydrated by profile.js -->
          </div>
        </div>
      `;
      document.body.appendChild(profile);
    }
  };

  injectMobileSheets();
  // Mobile nav
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-mobile-nav]");
  if (toggle && panel) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      panel.hidden = !open;
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    setOpen(false);
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // Expanding mega menu (island-morph-card)
  const header = document.querySelector(".site-header");
  const morph = document.querySelector("[data-morph-menu]");
  const backdrop = document.querySelector("[data-mega-backdrop]");
  const megaTriggers = document.querySelectorAll("[data-mega-trigger]");
  const megaClose = document.querySelectorAll("[data-mega-close]");
  const megaLabel = document.querySelector("[data-mega-label]");
  const megaLinks = document.querySelector("[data-mega-links]");
  const megaAll = document.querySelector("[data-mega-all]");

  const megaPanels = {
    "new-arrivals": {
      label: "New Arrivals",
      all: "Shop all new arrivals →",
      links: ["This Week", "Footwear", "Apparel", "Accessories", "Restocks", "Just Dropped"],
    },
    brands: {
      label: "Brands",
      all: "View all brands →",
      links: ["Vans", "Hoka", "Lady White Co.", "Puma", "Saucony", "Velva Sheen", "Dr. Martens"],
    },
    "shop-by-color": {
      label: "Shop by Color",
      all: "Browse all colors →",
      links: ["Black", "White", "Navy", "Olive", "Brown", "Grey", "Multi"],
    },
    sale: {
      label: "Sale",
      all: "Shop all sale →",
      links: ["Up to 20% off", "Up to 40% off", "Final sale", "Footwear sale", "Apparel sale"],
    },
  };

  const headerDesktop = document.querySelector(".header-desktop");

  const setMegaOpen = (open, section) => {
    if (!header || !morph) return;
    header.classList.toggle("is-mega-open", open);
    document.body.classList.toggle("mega-open", open);
    morph.setAttribute("aria-hidden", String(!open));
    if (headerDesktop) {
      if (open) headerDesktop.setAttribute("inert", "");
      else headerDesktop.removeAttribute("inert");
    }
    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.setAttribute("aria-hidden", String(!open));
    }

    megaTriggers.forEach((btn) => {
      const active = open && btn.getAttribute("data-mega-trigger") === section;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-expanded", String(active));
    });

    if (open && section && megaPanels[section]) {
      const data = megaPanels[section];
      if (megaLabel) megaLabel.textContent = data.label;
      if (megaAll) megaAll.textContent = data.all;
      if (megaLinks) {
        megaLinks.innerHTML = data.links
          .map((label) => `<a href="collection.html">${label}</a>`)
          .join("");
      }
    }
  };

  megaTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.getAttribute("data-mega-trigger");
      const already =
        header.classList.contains("is-mega-open") &&
        btn.getAttribute("aria-expanded") === "true";
      setMegaOpen(!already, section);
    });
  });

  megaClose.forEach((btn) => {
    btn.addEventListener("click", () => setMegaOpen(false));
  });

  if (backdrop) {
    backdrop.addEventListener("click", () => setMegaOpen(false));
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMegaOpen(false);
  });

  // Size pills + gallery thumbs
  document.querySelectorAll("[data-size-group], .pdp-thumbs").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !group.contains(btn)) return;
      group.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  // Tabs
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const buttons = root.querySelectorAll("[data-tab]");
    const panels = root.querySelectorAll("[data-panel]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-tab");
        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
        panels.forEach((p) => p.classList.toggle("is-active", p.getAttribute("data-panel") === id));
      });
    });
  });

  // Filter sheet — sort radio + brand/category chip toggles + badge count
  const filterBody = document.querySelector("[data-filter-body]");
  const filterCount = document.querySelector("[data-filter-count]");
  const filterClear = document.querySelector("[data-filter-clear]");
  if (filterBody) {
    const updateCount = () => {
      const selected = filterBody.querySelectorAll(".sheet-chip.is-selected").length;
      if (!filterCount) return;
      filterCount.textContent = String(selected);
      filterCount.hidden = selected === 0;
    };

    filterBody.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-filter-brand], [data-filter-cat]");
      if (chip) {
        chip.classList.toggle("is-selected");
        updateCount();
        return;
      }
      const sortRow = e.target.closest("[data-filter-sort]");
      if (sortRow) {
        filterBody
          .querySelectorAll("[data-filter-sort]")
          .forEach((r) => {
            const on = r === sortRow;
            r.classList.toggle("is-active", on);
            r.setAttribute("aria-checked", String(on));
          });
      }
    });

    if (filterClear) {
      filterClear.addEventListener("click", () => {
        filterBody
          .querySelectorAll(".sheet-chip.is-selected")
          .forEach((c) => c.classList.remove("is-selected"));
        filterBody.querySelectorAll("[data-filter-sort]").forEach((r, i) => {
          const on = i === 0;
          r.classList.toggle("is-active", on);
          r.setAttribute("aria-checked", String(on));
        });
        updateCount();
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     LIVE STORE LAYER — real catalog everywhere.
     Port note: PLP → Liquid collection templates + filter params;
     bag badge → cart item_count; search → /search?q=.
     ══════════════════════════════════════════════════════════ */

  /* ── Bag badge: live count on every page ─────────────────── */
  const syncBadges = () => {
    if (!window.AugustCart) return;
    const n = window.AugustCart.count();
    document.querySelectorAll(".tabbar__badge").forEach((b) => {
      b.textContent = String(n);
      b.hidden = n === 0;
    });
  };
  syncBadges();
  window.addEventListener("august:cart-changed", syncBadges);

  /* ── Search: header fields + search sheet → collection?q= ── */
  document.querySelectorAll('input[type="search"]').forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const q = input.value.trim();
      if (q) location.href = `collection.html?q=${encodeURIComponent(q)}`;
    });
  });

  /* ── PLP: render the grid from the real catalog ───────────── */
  const grid = document.querySelector(".plp-main .product-grid");
  if (grid && window.AugustCatalog) {
    const params = new URLSearchParams(location.search);

    const state = {
      q: (params.get("q") || "").toLowerCase(),
      dept: params.get("dept") || "all",
      cat: params.get("cat") || "all",
      sale: params.get("sale") === "1",
      feed: !!params.get("feed"),
      brands: [],
      sort: "featured",
    };

    const matches = (p) => {
      if (state.q && !(`${p.brand} ${p.title}`.toLowerCase().includes(state.q))) return false;
      if (state.dept !== "all" && p.dept !== state.dept && p.dept !== "unisex") return false;
      if (state.cat !== "all" && p.cat !== state.cat) return false;
      if (state.sale && !p.sale) return false;
      if (state.brands.length && !state.brands.includes(p.brand)) return false;
      return true;
    };

    const sorted = (items) => {
      const out = [...items];
      if (state.sort === "price-asc") out.sort((a, b) => a.price - b.price);
      else if (state.sort === "price-desc") out.sort((a, b) => b.price - a.price);
      else if (state.sort === "newest") out.reverse();
      return out;
    };

    const islandText = (n) => {
      const dept = state.dept === "men" ? "Men's " : state.dept === "women" ? "Women's " : "";
      const cat = state.cat === "all" ? "everything" : state.cat;
      const sale = state.sale ? " on sale" : "";
      const count = `${n} product${n === 1 ? "" : "s"}`;
      if (state.q) return `Results for “${state.q}” · ${count}`;
      if (state.feed) return `Your feed — ${dept}${cat}${sale} · ${count}`;
      if (state.dept !== "all" || state.cat !== "all" || state.sale || state.brands.length)
        return `${dept}${cat}${sale}${state.brands.length ? " · " + state.brands.join(", ") : ""} · ${count}`;
      return `New arrivals from Nike, Adidas, Carhartt WIP, and more · ${count}`;
    };

    const renderPLP = () => {
      const items = sorted(window.AugustCatalog.PRODUCTS.filter(matches));
      grid.innerHTML = items.length
        ? items.map(window.AugustCatalog.cardHtml).join("")
        : '<p class="plp-empty">Nothing matches — clear a filter or two.</p>';
      const island = document.querySelector(".plp-intro__island p");
      if (island) island.textContent = islandText(items.length);
    };

    renderPLP();

    // Filter & Sort sheet actually filters and sorts
    const applyBtn = document.querySelector(".sheet__footer [data-sheet-close].btn--primary");
    applyBtn?.addEventListener("click", () => {
      state.brands = [...document.querySelectorAll(".sheet-chip.is-selected[data-filter-brand]")].map(
        (c) => c.getAttribute("data-filter-brand")
      );
      const cats = [...document.querySelectorAll(".sheet-chip.is-selected[data-filter-cat]")].map((c) =>
        c.getAttribute("data-filter-cat")
      );
      state.cat = cats.length === 1 ? cats[0] : "all";
      state.sort =
        document.querySelector("[data-filter-sort].is-active")?.getAttribute("data-filter-sort") ||
        "featured";
      renderPLP();
    });

    document.querySelector("[data-filter-clear]")?.addEventListener("click", () => {
      state.brands = [];
      state.cat = params.get("cat") || "all";
      state.sort = "featured";
      renderPLP();
    });
  }

  /* ── Home: shelves render from the real catalog ───────────── */
  if (document.querySelector(".page--home") && window.AugustCatalog) {
    const all = window.AugustCatalog.PRODUCTS;
    const shoes = all.filter((p) => p.cat === "shoes");
    const apparel = all.filter((p) => p.cat === "apparel" || p.cat === "accessories");

    // Hero tiles → newest footwear, each linking to its own PDP
    document.querySelectorAll(".home-grid .home-tile").forEach((tile, i) => {
      const p = shoes[i % shoes.length];
      const img = tile.querySelector("img");
      if (img) {
        img.src = p.img;
        img.alt = p.title;
      }
      tile.href = `product.html?p=${p.id}`;
    });

    // Named shelves: Apparel & Accessories / Best Sellers / Back in Stock
    const shelves = document.querySelectorAll(".home-statement__grid");
    const pools = [
      apparel,
      shoes.slice().reverse(),
      all.filter((p) => p.sale),
    ];
    shelves.forEach((shelf, s) => {
      const pool = pools[s] || all;
      shelf.querySelectorAll(".product-card").forEach((card, i) => {
        const p = pool[i % pool.length];
        card.href = `product.html?p=${p.id}`;
        const img = card.querySelector(".product-card__media img");
        const brand = card.querySelector(".product-card__brand");
        const title = card.querySelector(".product-card__title");
        const price = card.querySelector(".product-card__price");
        if (img) {
          img.src = p.img;
          img.alt = p.title;
        }
        if (brand) brand.textContent = p.brand;
        if (title) title.textContent = p.title;
        if (price) price.innerHTML = window.AugustCatalog.priceHtml(p);
      });
    });
  }
});
