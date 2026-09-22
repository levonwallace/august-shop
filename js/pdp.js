/* August — PDP hydration
   product.html?p=<id> renders that product from the real catalog and
   Add to bag writes the cart store. Port note: this file disappears —
   Liquid renders product templates server-side; add-to-bag becomes
   the Shopify Ajax Cart /cart/add call. */
document.addEventListener("DOMContentLoaded", async () => {
  const gallery = document.querySelector(".pdp-gallery__image");
  if (!gallery || !window.AugustCatalog) return;

  const params = new URLSearchParams(location.search);
  const handle = params.get("h");
  let product = handle
    ? window.AugustShop?.cached("h:" + handle) || window.AugustShop?.cached(handle)
    : window.AugustCatalog.byId(params.get("p"));

  if (handle && window.AugustShop) {
    try {
      product = await window.AugustShop.product(handle);
    } catch {
      product = product || window.AugustCatalog.PRODUCTS[0];
    }
  }
  product = product || window.AugustCatalog.PRODUCTS[0];
  window.AugustShop?.remember(product);

  const money = window.AugustCatalog.money;

  /* ── Hydrate the page ────────────────────────────────────── */
  document.title = `${product.title} — August`;

  gallery.src = product.img;
  gallery.alt = product.title;

  const setText = (sel, text) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  };

  setText(".buy-box__brand", (product.brand || "").toUpperCase());
  setText(".buy-box__title", product.title);

  const price = document.querySelector(".buy-box__price");
  if (price) price.innerHTML = window.AugustCatalog.priceHtml(product);

  const desc = document.querySelector(".buy-box__desc");
  if (desc) {
    const saleLine = product.sale && product.compare
      ? ` Now ${money(product.price)}, down from ${money(product.compare)}.`
      : "";
    desc.textContent = product.body
      ? product.body
      : `${product.title} from ${product.brand}.${saleLine} Available now at August.`;
  }

  const longDesc = document.querySelector(".desc-card__body");
  if (longDesc) {
    longDesc.textContent = product.body
      ? product.body
      : `${product.title} — sourced for the shop floor at August, Madison.`;
  }
  document.querySelector(".desc-card__bullets")?.remove();

  const thumbs = document.querySelector(".pdp-thumbs");
  const extras = (product.images || []).filter(Boolean);
  if (thumbs && extras.length > 1) {
    thumbs.removeAttribute("hidden");
    thumbs.innerHTML = extras
      .slice(0, 5)
      .map(
        (src, i) =>
          `<button type="button" class="pdp-thumbs__btn${i === 0 ? " is-active" : ""}" data-thumb="${src}"><img src="${src}" alt="" /></button>`
      )
      .join("");
    thumbs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-thumb]");
      if (!btn) return;
      gallery.src = btn.getAttribute("data-thumb");
      thumbs.querySelectorAll(".pdp-thumbs__btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  } else {
    thumbs?.setAttribute("hidden", "");
  }

  const related = window.AugustCatalog.related(product, 4);
  const extended = document.querySelector(".pdp-extended");
  if (related.length && extended && !document.querySelector(".pdp-related")) {
    const section = document.createElement("section");
    section.className = "pdp-related";
    section.setAttribute("aria-label", "More from August");
    section.innerHTML = `
      <h2>More from August</h2>
      <div class="product-grid">${related.map(window.AugustCatalog.cardHtml).join("")}</div>`;
    extended.parentNode.insertBefore(section, extended);
  }

  /* Sizes: live Shopify options when we have them */
  const seg = document.querySelector(".buy-box .segmented");
  const sizes = product.sizes?.length ? product.sizes : window.AugustCatalog.sizesFor(product);
  if (seg) {
    seg.innerHTML = sizes
      .map(
        (s, i) => `
      <button type="button" class="segmented__segment${i === 0 ? " is-active" : ""}" role="radio" aria-checked="${i === 0}" data-value="${s}">${s}</button>`
      )
      .join("");
  }

  /* ── Add to bag ──────────────────────────────────────────── */
  const atbBtn = document.querySelector('[data-sheet-open="atb-sheet"]');
  if (atbBtn) {
    atbBtn.textContent = `Add to bag — ${money(product.price)}`;
    atbBtn.addEventListener("click", () => {
      const size = seg?.querySelector(".is-active")?.getAttribute("data-value") || sizes[0];
      window.AugustCart.add(product.id, size);

      const thumb = document.querySelector(".sheet-confirm__thumb img");
      const title = document.querySelector(".sheet-confirm__title");
      const sub = document.querySelector(".sheet-confirm__sub");
      if (thumb) {
        thumb.src = product.img;
        thumb.alt = product.title;
      }
      if (title) title.textContent = product.title;
      if (sub) sub.innerHTML = `${product.brand} &middot; Size ${size} &middot; ${money(product.price)}`;
    });
  }
});
