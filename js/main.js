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
                <button type="button" class="sheet-chip" data-search-chip>Air Max</button>
                <button type="button" class="sheet-chip" data-search-chip>Samba</button>
                <button type="button" class="sheet-chip" data-search-chip>Carhartt WIP</button>
                <button type="button" class="sheet-chip" data-search-chip>Nike</button>
                <button type="button" class="sheet-chip" data-search-chip>Birkenstock</button>
                <button type="button" class="sheet-chip" data-search-chip>Sporty &amp; Rich</button>
              </div>
            </div>
            <div class="sheet-section">
              <p class="sheet-section__label">Recent</p>
              <div class="sheet-list" data-search-recents></div>
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

  function fillMegaProducts(poolKey) {
    if (!window.AugustCatalog) return;
    const all = window.AugustCatalog.PRODUCTS;
    const pool =
      poolKey === "sale"
        ? all.filter((p) => p.sale)
        : poolKey === "new"
          ? all.filter((p) => p.cat === "shoes")
          : all;
    const items = window.AugustCatalog.unique(pool);
    document.querySelectorAll(".mega-product").forEach((el, i) => {
      const p = items[i % Math.max(items.length, 1)];
      if (!p) return;
      el.href = `product.html?p=${p.id}`;
      const img = el.querySelector("img");
      if (img) {
        img.src = p.img;
        img.alt = p.title;
      }
      const price = el.querySelector(".mega-product__price");
      const title = el.querySelector(".mega-product__title");
      if (price) price.innerHTML = window.AugustCatalog.priceHtml(p);
      if (title) title.textContent = p.title;
    });
  }

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

    const dirToggles = [];
    const wireMobileDir = (label, html) => {
      const nav = [...panel.querySelectorAll(".mobile-nav__links a")].find(
        (a) => a.textContent.trim().toLowerCase() === label
      );
      if (!nav || !html) return;
      dirToggles.push(nav);
      nav.addEventListener("click", (e) => {
        e.preventDefault();
        const attr = `data-mobile-${label}`;
        let dir = panel.querySelector(`[${attr}]`);
        if (!dir) {
          nav.insertAdjacentHTML("afterend", html);
          dir = nav.nextElementSibling;
          dir?.classList.add("brand-dir--mobile");
          dir?.setAttribute(attr, "");
        } else {
          dir.hidden = !dir.hidden;
        }
        nav.classList.toggle("is-open", !dir?.hidden);
      });
    };
    if (window.AugustCatalog) {
      wireMobileDir("brands", window.AugustCatalog.brandDirHtml());
      wireMobileDir("categories", window.AugustCatalog.catDirHtml());
    }

    panel.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link || dirToggles.includes(link)) return;
      setOpen(false);
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
      href: "collection.html",
      links: [
        { label: "This Week", href: "collection.html" },
        { label: "Footwear", href: "collection.html?cat=shoes" },
        { label: "Apparel", href: "collection.html?cat=apparel" },
        { label: "Accessories", href: "collection.html?cat=accessories" },
        { label: "Men", href: "collection.html?dept=men" },
        { label: "Women", href: "collection.html?dept=women" },
      ],
      pool: "new",
    },
    brands: {
      label: "Brands",
      all: "View all brands →",
      href: "collection.html",
      links: [],
      pool: "all",
    },
    categories: {
      label: "Categories",
      all: "Shop all categories →",
      href: "collection.html",
      links: [],
      pool: "all",
    },
    "shop-by-color": {
      label: "Shop by Color",
      all: "Browse all colors →",
      href: "collection.html",
      links: [
        { label: "Black", href: "collection.html?q=Black" },
        { label: "White", href: "collection.html?q=White" },
        { label: "Navy", href: "collection.html?q=Navy" },
        { label: "Olive", href: "collection.html?q=Olive" },
        { label: "Brown", href: "collection.html?q=Brown" },
        { label: "Grey", href: "collection.html?q=Grey" },
      ],
      pool: "all",
    },
    sale: {
      label: "Sale",
      all: "Shop all sale →",
      href: "sale.html",
      links: [
        { label: "All sale", href: "sale.html" },
        { label: "Footwear sale", href: "sale.html?cat=shoes" },
        { label: "Apparel sale", href: "sale.html?cat=apparel" },
        { label: "Accessories sale", href: "sale.html?cat=accessories" },
        { label: "Men's sale", href: "sale.html?dept=men" },
        { label: "Women's sale", href: "sale.html?dept=women" },
      ],
      pool: "sale",
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

    const megaBody = document.querySelector(".morph-menu__body");
    const isDirectory = !!(open && (section === "brands" || section === "categories"));
    megaBody?.classList.toggle("is-directory", isDirectory);

    if (open && section && megaPanels[section]) {
      const data = megaPanels[section];
      if (megaLabel) {
        megaLabel.textContent = data.label;
        megaLabel.hidden = isDirectory;
      }
      if (megaAll) {
        megaAll.textContent = data.all;
        megaAll.href = data.href || "collection.html";
        megaAll.hidden = isDirectory;
      }
      if (megaLinks) {
        if (section === "brands" && window.AugustCatalog) {
          megaLinks.innerHTML = window.AugustCatalog.brandDirHtml();
        } else if (section === "categories" && window.AugustCatalog) {
          megaLinks.innerHTML = window.AugustCatalog.catDirHtml();
        } else {
          megaLinks.innerHTML = data.links
            .map((item) =>
              typeof item === "string"
                ? `<a href="collection.html">${item}</a>`
                : `<a href="${item.href}">${item.label}</a>`
            )
            .join("");
        }
      }
      if (!isDirectory) fillMegaProducts(data.pool);
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

  document.querySelectorAll("[data-search-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const q = chip.textContent.trim();
      if (q) location.href = `collection.html?q=${encodeURIComponent(q)}`;
    });
  });

  if (window.AugustCatalog) {
    const recents = document.querySelector("[data-search-recents]");
    if (recents) {
      recents.innerHTML = window.AugustCatalog.PRODUCTS.slice(0, 4)
        .map(
          (p) => `
        <a class="sheet-list__row" href="product.html?p=${p.id}">
          <span>${p.title}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>`
        )
        .join("");
    }
    fillMegaProducts("new");
  }

  /* ── PLP: render the grid from the real catalog ───────────── */
  const grid = document.querySelector(".plp-main .product-grid");
  if (grid && window.AugustCatalog) {
    const params = new URLSearchParams(location.search);
    const isSalePage = /sale\.html$/i.test(location.pathname);
    const catParam = params.get("cat");
    const catAlias = catParam === "footwear" ? "shoes" : catParam;

    const state = {
      q: (params.get("q") || "").toLowerCase(),
      dept: params.get("dept") || "all",
      cats: catAlias && catAlias !== "all" ? [catAlias] : [],
      sale: isSalePage || params.get("sale") === "1",
      feed: !!params.get("feed"),
      brands: params.get("brand") ? [params.get("brand")] : [],
      type: params.get("type") || "",
      sort: params.get("sort") || "featured",
      price: null,
    };

    if (params.get("price")) {
      const token = params.get("price");
      const [min, max] = token.split("-").map(Number);
      if (!Number.isNaN(min) && !Number.isNaN(max)) state.price = { min, max, token };
    }

    const sheet = document.getElementById("filter-sheet");
    const brandHost =
      sheet?.querySelector("[data-filter-brands]") ||
      sheet?.querySelector("[data-filter-brand]")?.parentElement;
    if (brandHost) {
      brandHost.setAttribute("data-filter-brands", "");
      brandHost.innerHTML = window.AugustCatalog
        .brands()
        .map(
          (b) =>
            `<button type="button" class="sheet-chip${state.brands.includes(b) ? " is-selected" : ""}" data-filter-brand="${b}">${b}</button>`
        )
        .join("");
    }

    const matches = (p) => {
      if (state.q && !(`${p.brand} ${p.title}`.toLowerCase().includes(state.q))) return false;
      if (state.dept !== "all" && p.dept !== state.dept && p.dept !== "unisex") return false;
      if (state.cats.length && !state.cats.includes(p.cat)) return false;
      if (state.type && p.type !== state.type) return false;
      if (state.sale && !p.sale) return false;
      if (state.brands.length && !window.AugustCatalog.brandMatch(p.brand, state.brands)) return false;
      if (state.price && (p.price < state.price.min || p.price > state.price.max)) return false;
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
      const typeName = state.type ? window.AugustCatalog.typeLabel(state.type) : "";
      const cat =
        typeName ||
        (state.cats.length === 1
          ? state.cats[0] === "shoes"
            ? "footwear"
            : state.cats[0]
          : "everything");
      const sale = state.sale ? " on sale" : "";
      const count = `${n} product${n === 1 ? "" : "s"}`;
      if (state.q) return `Results for “${state.q}” · ${count}`;
      if (state.feed) return `Your feed — ${dept}${cat}${sale} · ${count}`;
      if (state.dept !== "all" || state.cats.length || state.type || state.sale || state.brands.length || state.price)
        return `${dept}${cat}${sale}${state.brands.length ? " · " + state.brands.join(", ") : ""} · ${count}`;
      return `New arrivals from Nike, Adidas, Carhartt WIP, and more · ${count}`;
    };

    const activeFilterCount = () => {
      let n = 0;
      if (state.dept !== "all") n += 1;
      if (state.cats.length) n += 1;
      if (state.type) n += 1;
      if (state.brands.length) n += 1;
      if (state.price) n += 1;
      if (state.sort !== "featured") n += 1;
      if (state.sale && !isSalePage) n += 1;
      return n;
    };

    const readSheet = () => {
      if (!sheet) return;
      state.brands = [...sheet.querySelectorAll("[data-filter-brand].is-selected")].map((c) =>
        c.getAttribute("data-filter-brand")
      );
      state.cats = [...sheet.querySelectorAll("[data-filter-cat].is-selected")].map((c) => {
        const v = c.getAttribute("data-filter-cat");
        return v === "footwear" ? "shoes" : v;
      });
      state.dept =
        sheet.querySelector("[data-filter-dept].is-selected")?.getAttribute("data-filter-dept") || "all";
      const priceChip = sheet.querySelector("[data-filter-price].is-selected");
      if (priceChip) {
        const token = priceChip.getAttribute("data-filter-price");
        const [min, max] = token.split("-").map(Number);
        state.price = { min, max, token };
      } else {
        state.price = null;
      }
      state.sort =
        sheet.querySelector("[data-filter-sort].is-active")?.getAttribute("data-filter-sort") || "featured";
      const saleToggle = sheet.querySelector("[data-filter-sale]");
      if (saleToggle) state.sale = isSalePage || saleToggle.checked;
    };

    const syncSheet = () => {
      if (!sheet) return;
      sheet.querySelectorAll("[data-filter-sort]").forEach((row) => {
        const on = row.getAttribute("data-filter-sort") === state.sort;
        row.classList.toggle("is-active", on);
        row.setAttribute("aria-checked", String(on));
      });
      sheet.querySelectorAll("[data-filter-dept]").forEach((chip) => {
        chip.classList.toggle("is-selected", chip.getAttribute("data-filter-dept") === state.dept);
      });
      sheet.querySelectorAll("[data-filter-cat]").forEach((chip) => {
        const v =
          chip.getAttribute("data-filter-cat") === "footwear"
            ? "shoes"
            : chip.getAttribute("data-filter-cat");
        chip.classList.toggle("is-selected", state.cats.includes(v));
      });
      sheet.querySelectorAll("[data-filter-brand]").forEach((chip) => {
        const value = chip.getAttribute("data-filter-brand");
        chip.classList.toggle("is-selected", window.AugustCatalog.brandMatch(value, state.brands));
      });
      sheet.querySelectorAll("[data-filter-price]").forEach((chip) => {
        chip.classList.toggle("is-selected", state.price?.token === chip.getAttribute("data-filter-price"));
      });
      const saleToggle = sheet.querySelector("[data-filter-sale]");
      if (saleToggle) saleToggle.checked = state.sale;
    };

    const renderPLP = () => {
      const items = sorted(window.AugustCatalog.PRODUCTS.filter(matches));
      grid.innerHTML = items.length
        ? items.map(window.AugustCatalog.cardHtml).join("")
        : '<p class="plp-empty">Nothing matches — clear a filter or two.</p>';
      const island = document.querySelector(".plp-intro__island p");
      if (island) island.textContent = islandText(items.length);
      const eyebrow = document.querySelector("[data-filter-eyebrow]");
      if (eyebrow) eyebrow.textContent = `${items.length} product${items.length === 1 ? "" : "s"}`;
      const countBadge = document.querySelector("[data-filter-count]");
      if (countBadge) {
        const n = activeFilterCount();
        countBadge.textContent = String(n);
        countBadge.hidden = n === 0;
      }
    };

    syncSheet();
    renderPLP();

    const exclusiveSelect = (chips, target) => {
      const on = !target.classList.contains("is-selected");
      chips.forEach((c) => c.classList.remove("is-selected"));
      if (on) target.classList.add("is-selected");
    };

    sheet?.addEventListener("click", (e) => {
      const sort = e.target.closest("[data-filter-sort]");
      const chip = e.target.closest(".sheet-chip");
      if (sort) {
        sheet.querySelectorAll("[data-filter-sort]").forEach((row) => {
          const on = row === sort;
          row.classList.toggle("is-active", on);
          row.setAttribute("aria-checked", String(on));
        });
        readSheet();
        renderPLP();
        return;
      }
      if (!chip || !sheet.contains(chip)) return;
      if (chip.hasAttribute("data-filter-dept")) {
        sheet.querySelectorAll("[data-filter-dept]").forEach((c) => c.classList.toggle("is-selected", c === chip));
      } else if (chip.hasAttribute("data-filter-price")) {
        exclusiveSelect([...sheet.querySelectorAll("[data-filter-price]")], chip);
      } else {
        chip.classList.toggle("is-selected");
      }
      readSheet();
      renderPLP();
    });

    sheet?.querySelector("[data-filter-sale]")?.addEventListener("change", () => {
      readSheet();
      renderPLP();
    });

    sheet?.querySelector("[data-filter-apply]")?.addEventListener("click", () => {
      readSheet();
      renderPLP();
    });

    sheet?.querySelector("[data-filter-clear]")?.addEventListener("click", () => {
      state.dept = "all";
      state.cats = [];
      state.type = "";
      state.brands = [];
      state.sort = "featured";
      state.price = null;
      state.sale = isSalePage;
      syncSheet();
      renderPLP();
    });
  }

  /* ── Home: shelves render from the real catalog ───────────── */
  if (document.querySelector(".page--home") && window.AugustCatalog) {
    const all = window.AugustCatalog.PRODUCTS;
    const unique = window.AugustCatalog.unique;
    const shoes = unique(all.filter((p) => p.cat === "shoes"));
    const apparel = unique(all.filter((p) => p.cat === "apparel" || p.cat === "accessories"));

    const paintCard = (el, p) => {
      if (!el || !p) return;
      el.href = `product.html?p=${p.id}`;
      const img = el.querySelector("img");
      if (img) {
        img.src = p.img;
        img.alt = p.title;
      }
      const brand = el.querySelector(".product-card__brand");
      const title = el.querySelector(".product-card__title");
      const price = el.querySelector(".product-card__price");
      if (brand) brand.textContent = p.brand;
      if (title) title.textContent = p.title;
      if (price) price.innerHTML = window.AugustCatalog.priceHtml(p);
    };

    document.querySelectorAll(".home-grid .home-tile").forEach((tile, i) => {
      paintCard(tile, shoes[i % shoes.length]);
    });

    const shelves = document.querySelectorAll(".home-statement__grid");
    const pools = [apparel, shoes.slice().reverse(), unique(all.filter((p) => p.sale))];
    shelves.forEach((shelf, s) => {
      const pool = pools[s] || all;
      shelf.querySelectorAll(".product-card").forEach((card, i) => {
        paintCard(card, pool[i % pool.length]);
      });
    });
  }

  /* Safety net: leftover generic product.html links get a real product */
  if (window.AugustCatalog) {
    document.querySelectorAll('a[href="product.html"]').forEach((a, i) => {
      const p = window.AugustCatalog.PRODUCTS[i % window.AugustCatalog.PRODUCTS.length];
      a.href = `product.html?p=${p.id}`;
    });
  }
});
