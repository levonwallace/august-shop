/* August — live shop proxy client
   Talks to the local /api/* shim, which forwards to august-shop.com.
   Adopted products land in a session cache so PDP/cart survive refresh. */
window.AugustShop = (() => {
  const STORE = "august_live_products";
  const cache = new Map();

  const remember = (p) => {
    if (!p || !p.id) return p;
    cache.set(p.id, p);
    if (p.handle) cache.set("h:" + p.handle, p);
    try {
      const all = JSON.parse(sessionStorage.getItem(STORE) || "{}");
      all[p.id] = p;
      sessionStorage.setItem(STORE, JSON.stringify(all));
    } catch {
      /* quota — search still works for this tab */
    }
    return p;
  };

  const restore = () => {
    try {
      const all = JSON.parse(sessionStorage.getItem(STORE) || "{}");
      Object.values(all).forEach((p) => {
        if (p && p.id) {
          cache.set(p.id, p);
          if (p.handle) cache.set("h:" + p.handle, p);
        }
      });
    } catch {}
  };
  restore();

  const cached = (id) => {
    if (!id) return null;
    return cache.get(id) || cache.get("h:" + id) || null;
  };

  const href = (p) =>
    p?.handle ? `product.html?h=${encodeURIComponent(p.handle)}` : `product.html?p=${p?.id || ""}`;

  const search = async (q, limit = 24) => {
    const query = String(q || "").trim();
    if (query.length < 2) return [];
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      if (!res.ok) throw new Error("search " + res.status);
      const data = await res.json();
      return (data.products || []).map(remember);
    } catch {
      if (!window.AugustCatalog) return [];
      const needle = query.toLowerCase();
      return window.AugustCatalog.PRODUCTS.filter((p) =>
        `${p.brand} ${p.title}`.toLowerCase().includes(needle)
      ).slice(0, limit);
    }
  };

  const byBrand = async (brand, limit = 48) => {
    const name = String(brand || "").trim();
    if (!name) return [];
    const match = (p) =>
      window.AugustCatalog ? window.AugustCatalog.brandMatch(p.brand, [name]) : p.brand === name;
    try {
      const res = await fetch(`/api/search?brand=${encodeURIComponent(name)}&limit=${limit}`);
      if (!res.ok) throw new Error("brand " + res.status);
      const data = await res.json();
      const live = (data.products || []).map(remember).filter(match);
      if (live.length) return live;
    } catch {}
    if (!window.AugustCatalog) return [];
    return window.AugustCatalog.PRODUCTS.filter(match).slice(0, limit);
  };

  const product = async (handle) => {
    const hit = cached("h:" + handle) || cached(handle);
    if (hit && hit.body && (hit.images?.length || hit.sizes?.length)) return hit;
    const res = await fetch(`/api/product?handle=${encodeURIComponent(handle)}`);
    if (!res.ok) throw new Error("product " + res.status);
    const data = await res.json();
    if (!data.product) throw new Error("empty product");
    return remember(data.product);
  };

  const resultRow = (p) => `
    <a class="sheet-list__row sheet-list__row--product" href="${href(p)}">
      <span class="sheet-list__thumb">${p.img ? `<img src="${p.img}" alt="" />` : ""}</span>
      <span class="sheet-list__copy">
        <span class="sheet-list__brand">${p.brand}</span>
        <span class="sheet-list__name">${p.title}</span>
      </span>
      <span class="sheet-list__price">${window.AugustCatalog ? window.AugustCatalog.money(p.price) : ""}</span>
    </a>`;

  /* Typeahead: brands + categories above SKU rows. */
  const TYPE_ALIASES = {
    jean: ["denim"],
    jeans: ["denim"],
    denims: ["denim"],
  };

  const keyOf = (s) =>
    window.AugustCatalog?.brandKey
      ? window.AugustCatalog.brandKey(s)
      : String(s || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "");

  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const editDist = (a, b) => {
    const m = a.length;
    const n = b.length;
    if (Math.abs(m - n) > 1) return 2;
    const prev = new Array(n + 1);
    const cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        cur[j] =
          a[i - 1] === b[j - 1]
            ? prev[j - 1]
            : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
      }
      for (let j = 0; j <= n; j++) prev[j] = cur[j];
    }
    return prev[n];
  };

  const looseKey = (hay, needle) => {
    if (!hay || !needle) return false;
    if (hay.includes(needle) || (needle.length >= 3 && needle.includes(hay))) return true;
    if (needle.length >= 3 && editDist(hay.slice(0, needle.length), needle) <= 1) return true;
    return false;
  };

  const scoreKey = (hay, needle) => {
    if (hay === needle) return 0;
    if (hay.startsWith(needle)) return 1;
    if (hay.includes(needle)) return 2;
    if (needle.length >= 3 && needle.includes(hay)) return 3;
    if (needle.length >= 3 && editDist(hay.slice(0, needle.length), needle) <= 1) return 4;
    return 99;
  };

  const suggestBrands = (q) => {
    const brands = window.AugustCatalog?.BRANDS;
    if (!brands) return [];
    const nkey = keyOf(q);
    if (nkey.length < 2) return [];
    return brands
      .map((name) => ({ name, score: scoreKey(keyOf(name), nkey) }))
      .filter((b) => b.score < 99)
      .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
      .slice(0, 5)
      .map((b) => ({
        kind: "brand",
        label: `View all ${b.name}`,
        href: `collection.html?brand=${encodeURIComponent(b.name)}`,
      }));
  };

  const suggestCategories = (q) => {
    const cols = window.AugustCatalog?.CATEGORIES;
    if (!cols) return [];
    const needle = String(q || "").toLowerCase().trim();
    const nkey = keyOf(q);
    if (nkey.length < 2) return [];
    const aliasTypes = new Set(TYPE_ALIASES[nkey] || TYPE_ALIASES[needle] || []);
    const out = [];
    const seen = new Set();

    cols.forEach((col) => {
      const catSlug = (String(col.href || "").match(/[?&]cat=([^&]+)/) || [])[1] || "";
      const headKey = keyOf(col.head);
      const headHit =
        col.head.toLowerCase().includes(needle) ||
        looseKey(headKey, nkey) ||
        (catSlug && looseKey(keyOf(catSlug), nkey));
      if (headHit && !seen.has("cat:" + (catSlug || col.head))) {
        seen.add("cat:" + (catSlug || col.head));
        out.push({ kind: "cat", label: `View all ${col.head}`, href: col.href });
      }
      col.items.forEach((item) => {
        const hit =
          item.label.toLowerCase().includes(needle) ||
          String(item.type || "").toLowerCase().includes(needle) ||
          looseKey(keyOf(item.label), nkey) ||
          looseKey(keyOf(item.type), nkey) ||
          aliasTypes.has(item.type);
        if (hit && !seen.has("type:" + item.type)) {
          seen.add("type:" + item.type);
          out.push({
            kind: "type",
            label: `View all ${item.label}`,
            href: `collection.html?type=${encodeURIComponent(item.type)}`,
          });
        }
      });
    });
    return out.slice(0, 5);
  };

  const suggestMatches = (q) => ({
    brands: suggestBrands(q),
    categories: suggestCategories(q),
  });

  const suggestChipsHtml = (q) => {
    const { brands, categories } = suggestMatches(q);
    const chips = [...brands, ...categories];
    if (!chips.length) return "";
    return `<div class="search-suggest__chips" role="list">${chips
      .map(
        (c) =>
          `<a class="search-suggest__chip search-suggest__chip--${c.kind}" role="listitem" href="${c.href}">${escapeHtml(c.label)}</a>`
      )
      .join("")}</div>`;
  };

  return {
    search,
    byBrand,
    product,
    remember,
    cached,
    href,
    resultRow,
    suggestMatches,
    suggestChipsHtml,
  };
})();
