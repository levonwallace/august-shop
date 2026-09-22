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

  return { search, product, remember, cached, href, resultRow };
})();
