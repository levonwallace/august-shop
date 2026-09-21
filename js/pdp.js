/* August — PDP hydration
   product.html?p=<id> renders that product from the real catalog and
   Add to bag writes the cart store. Port note: this file disappears —
   Liquid renders product templates server-side; add-to-bag becomes
   the Shopify Ajax Cart /cart/add call. */
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".pdp-gallery__image");
  if (!gallery || !window.AugustCatalog) return;

  const params = new URLSearchParams(location.search);
  const product =
    window.AugustCatalog.byId(params.get("p")) || window.AugustCatalog.PRODUCTS[0];

  const money = window.AugustCatalog.money;

  /* ── Hydrate the page ────────────────────────────────────── */
  document.title = `${product.title} — August`;

  gallery.src = product.img;
  gallery.alt = product.title;

  const setText = (sel, text) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  };

  setText(".buy-box__brand", product.brand.toUpperCase());
  setText(".buy-box__title", product.title);

  const price = document.querySelector(".buy-box__price");
  if (price) price.innerHTML = window.AugustCatalog.priceHtml(product);

  const desc = document.querySelector(".buy-box__desc");
  if (desc) {
    const saleLine = product.sale && product.compare
      ? ` Now ${money(product.price)}, down from ${money(product.compare)}.`
      : "";
    desc.textContent = `${product.title} from ${product.brand}.${saleLine} Available now at August.`;
  }

  const longDesc = document.querySelector(".desc-card__body");
  if (longDesc) {
    longDesc.textContent = `${product.title} — sourced for the shop floor at August, Madison. Full product story lands here at Shopify port time; imagery and pricing are live from the real catalog.`;
  }
  document.querySelector(".desc-card__bullets")?.setAttribute("hidden", "");

  /* Sizes depend on category (shoes / apparel / accessories) */
  const seg = document.querySelector(".buy-box .segmented");
  const sizes = window.AugustCatalog.sizesFor(product);
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

      // Confirmation sheet shows what was actually added
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
