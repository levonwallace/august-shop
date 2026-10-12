/* August — live-theme adapter
   Loaded only by layout/theme.liquid (after catalog.js, auxdata.js,
   shopify-bridge.js, shopify.js; before main.js). Does nothing unless
   window.AugustBootstrap.live is set.

   What it does:
     • rewrites prototype hrefs (collection.html?cat=…, product.html?p=…,
       mix.html?m=…) to Shopify routes — on load and for JS-rendered DOM
     • points AugustShop.search / product at Predictive Search and
       /products/<handle>.js
     • PDP: variant resolution from the segmented option groups, Ajax
       add-to-bag, confirmation sheet
     • Cart: writes the pickup/ship choice to a cart attribute
     • Auth buttons (data-profile-action) → Shopify account routes
     • Search Enter / chips → /search?q=

   liquid:asset keep */
(() => {
  const boot = window.AugustBootstrap;
  if (!boot || !boot.live) return;

  const R = boot.routes || {};
  const rootPath = (R.root || "/").replace(/\/$/, "");
  const pad = (no) => String(no == null ? "" : no).padStart(3, "0");
  const withQuery = (base, params) => {
    const s = params.toString();
    if (!s) return base;
    return base + (base.includes("?") ? "&" : "?") + s;
  };
  const searchUrl = (q) => `${R.search || "/search"}?q=${encodeURIComponent(q)}&type=product`;

  /* ── Prototype URL → Shopify URL ─────────────────────────── */
  const collectionUrl = (q, isSalePage) => {
    if (q.get("q")) return searchUrl(q.get("q"));
    if (q.get("brand")) return `${R.vendors || rootPath + "/collections/vendors"}?q=${encodeURIComponent(q.get("brand"))}`;

    const sale = isSalePage || q.get("sale") === "1";
    let base = sale ? R.sale || R.all : R.all || rootPath + "/collections/all";
    const rest = new URLSearchParams();
    const cat = q.get("cat");
    if (cat) {
      const key = cat === "footwear" ? "shoes" : cat;
      if (!sale && R.cats && R.cats[key]) base = R.cats[key];
      else rest.set("cat", key);
    }
    ["dept", "type", "feed", "sort", "price"].forEach((k) => {
      if (q.get(k)) rest.set(k, q.get(k));
    });
    return withQuery(base, rest);
  };

  const rewrite = (raw) => {
    if (!raw || /^(https?:|mailto:|tel:|sms:|#|\/|javascript:)/i.test(raw)) return null;
    const m = raw.match(/^([a-z0-9_-]+\.html)(\?[^#]*)?(#.*)?$/i);
    if (!m) return null;
    const file = m[1].toLowerCase();
    const q = new URLSearchParams((m[2] || "").replace(/^\?/, ""));
    const hash = m[3] || "";
    switch (file) {
      case "index.html":
        return (R.root || "/") + hash;
      case "cart.html":
        return (R.cart || "/cart") + hash;
      case "account.html":
        return (R.account || "/account") + hash;
      case "order.html":
        return (R.account || "/account") + "#orders";
      case "aux.html":
        return (R.aux || R.root || "/") + hash;
      case "events.html":
        return (R.events || R.root || "/") + hash;
      case "inn.html":
        return (R.inn || R.root || "/") + hash;
      case "mix.html": {
        const no = pad(q.get("m"));
        const mix = (boot.mixes || []).find((x) => pad(x.no) === no);
        return mix?.url || R.aux || R.root || "/";
      }
      case "event.html": {
        const id = q.get("e");
        const ev = (boot.events || []).find((x) => String(x.id) === String(id));
        return ev?.url || R.events || R.root || "/";
      }
      case "product.html": {
        const handle = q.get("h");
        if (handle) return `${rootPath}/products/${encodeURIComponent(handle)}`;
        const p = window.AugustCatalog?.byId?.(q.get("p"));
        if (p?.url) return p.url;
        if (p?.handle) return `${rootPath}/products/${encodeURIComponent(p.handle)}`;
        return R.all || rootPath + "/collections/all";
      }
      case "sale.html":
        return collectionUrl(q, true) + hash;
      case "collection.html":
        return collectionUrl(q, false) + hash;
      default:
        return null;
    }
  };

  const fixAnchor = (a) => {
    const raw = a.getAttribute("href");
    const to = rewrite(raw);
    if (to && to !== raw) a.setAttribute("href", to);
  };
  const scan = (node) => {
    if (!node || node.nodeType !== 1) return;
    if (node.matches?.("a[href]")) fixAnchor(node);
    node.querySelectorAll?.("a[href]").forEach(fixAnchor);
  };
  new MutationObserver((muts) => {
    muts.forEach((m) => {
      if (m.type === "attributes") fixAnchor(m.target);
      m.addedNodes.forEach(scan);
    });
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"],
  });

  /* ── Lookups the prototype code falls back to ───────────── */
  window.AugustLive = {
    rewrite,
    searchUrl,
    lookup(key) {
      const k = String(key == null ? "" : key);
      if (!k) return null;
      const line = window.AugustCart?.items?.().find((i) => String(i.id) === k || String(i.variantId) === k);
      if (line) return { ...line };
      if (boot.product && String(boot.product.id) === k) return boot.product;
      return null;
    },
  };

  /* ── AugustShop → Shopify storefront endpoints ──────────── */
  const sized = (url, w) => (url ? url + (url.includes("?") ? "&" : "?") + "width=" + w : "");
  const catFromType = (type) => {
    const t = String(type || "").toLowerCase();
    if (/shoe|sneaker|boot|sandal|footwear/.test(t)) return "shoes";
    if (/bag|hat|cap|beanie|sock|wallet|accessor|jewel|belt|glass/.test(t)) return "accessories";
    if (/object|home|book|candle|incense|print|zine|art/.test(t)) return "objects";
    return "apparel";
  };
  const mapPredictive = (p) => {
    const price = Number(p.price);
    const compare = Number(p.compare_at_price_max || 0);
    return {
      id: String(p.id),
      handle: p.handle,
      url: p.url,
      title: p.title,
      brand: p.vendor || "",
      price,
      compare,
      sale: compare > price,
      available: p.available !== false,
      img: sized(p.featured_image?.url, 600),
      cat: catFromType(p.type),
      type: "",
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        title: v.title,
        available: v.available,
        price: Number(v.price),
      })),
    };
  };
  const mapProductJs = (p) => {
    const sizeOpt = (p.options || []).find((o) => /size/i.test(o.name));
    return {
      id: String(p.id),
      variantId: p.variants?.[0]?.id,
      handle: p.handle,
      url: `${rootPath}/products/${p.handle}`,
      title: p.title,
      brand: p.vendor || "",
      price: Number(p.price) / 100,
      compare: Number(p.compare_at_price || 0) / 100,
      sale: Number(p.compare_at_price || 0) > Number(p.price),
      available: !!p.available,
      img: sized(p.featured_image, 600),
      images: (p.images || []).slice(0, 5).map((u) => sized(u, 900)),
      sizes: sizeOpt ? sizeOpt.values : [],
      cat: catFromType(p.type),
      type: "",
      body: String(p.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        title: v.title,
        available: v.available,
        price: Number(v.price) / 100,
        options: v.options,
      })),
    };
  };

  const patchShop = () => {
    const Shop = window.AugustShop;
    if (!Shop) return;
    Shop.href = (p) =>
      p?.url ||
      (p?.handle ? `${rootPath}/products/${encodeURIComponent(p.handle)}` : R.all || rootPath + "/collections/all");

    const localSearch = (query, limit) => {
      const needle = query.toLowerCase();
      return (window.AugustCatalog?.PRODUCTS || [])
        .filter((p) => `${p.brand} ${p.title}`.toLowerCase().includes(needle))
        .slice(0, limit);
    };

    Shop.search = async (q, limit = 10) => {
      const query = String(q || "").trim();
      if (query.length < 2) return [];
      // On /search the section already rendered the full result set.
      if (boot.template === "search" && boot.searchTerms && query.toLowerCase() === String(boot.searchTerms).toLowerCase()) {
        return (window.AugustCatalog?.PRODUCTS || []).slice(0, Math.max(limit, 250));
      }
      try {
        const params = new URLSearchParams({
          q: query,
          "resources[type]": "product",
          "resources[limit]": String(Math.min(Math.max(limit, 1), 10)),
          "resources[options][unavailable_products]": "last",
          "resources[options][fields]": "title,product_type,variants.title,vendor,tag",
        });
        const res = await fetch(`${R.predictive || "/search/suggest"}?${params}`, {
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error("predictive " + res.status);
        const data = await res.json();
        const hits = (data.resources?.results?.products || []).map(mapPredictive);
        hits.forEach((p) => Shop.remember(p));
        return hits.length ? hits : localSearch(query, limit);
      } catch {
        return localSearch(query, limit);
      }
    };

    Shop.byBrand = async (brand, limit = 48) => {
      const name = String(brand || "").trim();
      if (!name || !window.AugustCatalog) return [];
      return window.AugustCatalog.PRODUCTS.filter((p) =>
        window.AugustCatalog.brandMatch(p.brand, [name])
      ).slice(0, limit);
    };

    Shop.product = async (handle) => {
      const hit = Shop.cached("h:" + handle) || Shop.cached(handle);
      if (hit && hit.variants) return hit;
      const res = await fetch(`${rootPath}/products/${encodeURIComponent(handle)}.js`, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("product " + res.status);
      return Shop.remember(mapProductJs(await res.json()));
    };
  };
  patchShop();

  /* ── Capture-phase interceptors (run before main.js / profile.js) ── */
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Enter") return;
      const input = e.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "search") return;
      if (input.hasAttribute("data-brand-query")) return; // account brand picker
      const q = input.value.trim();
      if (!q) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      location.href = searchUrl(q);
    },
    true
  );

  document.addEventListener(
    "click",
    (e) => {
      const chip = e.target.closest("[data-search-chip]");
      if (chip) {
        e.preventDefault();
        e.stopImmediatePropagation();
        location.href = searchUrl(chip.textContent.trim());
        return;
      }
      const action = e.target.closest("[data-profile-action]");
      if (!action) return;
      const a = action.getAttribute("data-profile-action");
      const to = a === "create" ? R.register : a === "signin" ? R.login : a === "signout" ? R.logout : null;
      if (!to) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (a === "signout") {
        try {
          localStorage.removeItem("august_user");
          localStorage.setItem("august_signed_out", "1");
        } catch {}
      }
      location.href = to;
    },
    true
  );

  /* ── Page wiring ────────────────────────────────────────── */
  const money = (n) =>
    window.AugustCatalog?.money ? window.AugustCatalog.money(Number(n) || 0) : "$" + (Number(n) || 0).toFixed(2);

  const wirePdp = () => {
    const pdp = boot.product;
    const form = document.querySelector("[data-pdp-form]");
    if (!pdp || !form) return;

    const idInput = form.querySelector("[data-pdp-variant]");
    const atb = form.querySelector("[data-pdp-atb]");
    const priceEl = document.querySelector("[data-pdp-price]");
    const gallery = document.querySelector("[data-pdp-image]");
    const thumbs = document.querySelector("[data-pdp-thumbs]");
    const groups = [...form.querySelectorAll("[data-option-index]")];

    const selected = () => groups.map((g) => g.querySelector(".is-active")?.getAttribute("data-value") ?? "");
    const findVariant = () => {
      if (!groups.length) return pdp.variants[0] || null;
      const sel = selected();
      return pdp.variants.find((v) => (v.options || []).every((o, i) => String(o) === String(sel[i]))) || null;
    };

    const showImage = (src) => {
      if (!gallery || !src) return;
      gallery.src = src;
      gallery.removeAttribute("srcset");
    };

    const paint = () => {
      const v = findVariant();
      if (!atb) return;
      if (!v) {
        atb.disabled = true;
        atb.textContent = atb.dataset.soldout || "Unavailable";
        return;
      }
      if (idInput) idInput.value = v.id;
      atb.disabled = !v.available;
      atb.textContent = v.available ? `${atb.dataset.label || "Add to bag"} — ${money(v.price)}` : atb.dataset.soldout || "Sold out";
      if (priceEl) {
        priceEl.innerHTML =
          v.compare > v.price ? `<span class="price-was">${money(v.compare)}</span> ${money(v.price)}` : money(v.price);
      }
      if (v.img) showImage(v.img);
    };
    groups.forEach((g) => g.addEventListener("segmented:change", paint));

    thumbs?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-thumb]");
      if (!btn) return;
      showImage(btn.getAttribute("data-thumb"));
      thumbs.querySelectorAll(".pdp-thumbs__btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    });

    const sheet = document.getElementById("atb-sheet");
    const sheetTitle = sheet?.querySelector(".sheet-confirm__title");
    const sheetSub = sheet?.querySelector(".sheet-confirm__sub");
    const sheetThumb = sheet?.querySelector(".sheet-confirm__thumb img");
    const sheetErr = sheet?.querySelector("[data-atb-error]");
    const sheetBadge = sheet?.querySelector("[data-atb-badge]");
    const badgeText = sheetBadge?.textContent;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = findVariant();
      if (!v || !v.available) return;
      if (sheetErr) sheetErr.hidden = true;
      if (sheetBadge) sheetBadge.textContent = "Adding…";
      try {
        const Cart = window.AugustCart;
        if (!Cart?.addVariant) throw new Error("Cart unavailable");
        await Cart.addVariant(v.id, 1);
        if (sheetBadge) sheetBadge.textContent = badgeText || "Added to bag";
        if (sheetTitle) sheetTitle.textContent = pdp.title;
        if (sheetSub) {
          const bits = [pdp.brand, v.title !== "Default Title" ? v.title : "", money(v.price)].filter(Boolean);
          sheetSub.textContent = bits.join(" · ");
        }
        if (sheetThumb && (v.img || pdp.img)) sheetThumb.src = v.img || pdp.img;
      } catch (err) {
        if (sheetBadge) sheetBadge.textContent = "Couldn't add";
        if (sheetErr) {
          sheetErr.textContent = err?.message || "Something went wrong — try again.";
          sheetErr.hidden = false;
        }
      }
    });

    paint();
  };

  const wireCart = () => {
    const root = document.querySelector("[data-cart-fulfill]");
    if (!root) return;
    root.addEventListener("segmented:change", (e) => {
      const value = e.detail?.value === "ship" ? "ship" : "pickup";
      window.AugustCart?.setAttributes?.({ fulfillment: value }).catch(() => {});
    });
  };

  const start = () => {
    scan(document.documentElement);
    wirePdp();
    wireCart();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
