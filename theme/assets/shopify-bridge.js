/* August — Shopify live adapter
   Prototype: no-ops (localStorage catalog / cart / profile stay in charge).
   Theme: layout/theme.liquid injects window.AugustBootstrap, then this
   file maps Ajax Cart + customer metafields onto the existing APIs
   (AugustCart, AugustProfile) so swipe / bag / account keep working.

   liquid:asset keep
   Depends on: catalog.js (AugustCart), profile.js (AugustProfile) */
(() => {
  const boot = window.AugustBootstrap;
  const live = !!(window.Shopify && window.Shopify.shop && boot && boot.live);

  window.AugustShopify = {
    live,
    shop: window.Shopify?.shop || null,
    bootstrap: boot || null,
  };

  if (!live) return;

  const json = (url, opts) =>
    fetch(url, { credentials: "same-origin", ...opts }).then((res) => {
      if (!res.ok) throw new Error(url + " " + res.status);
      return res.json();
    });

  const emitCart = () => window.dispatchEvent(new CustomEvent("august:cart-changed"));

  const mapLine = (line) => ({
    id: String(line.variant_id || line.id),
    variantId: line.variant_id,
    handle: line.handle || line.url?.split("/products/")[1]?.split("?")[0] || "",
    size: line.variant_title && line.variant_title !== "Default Title" ? line.variant_title : "",
    qty: line.quantity,
    title: line.product_title || line.title,
    price: Number(line.final_price || line.price || 0) / 100,
    img: line.image || "",
    key: line.key,
  });

  const patchCart = () => {
    if (!window.AugustCart) return;
    const proto = window.AugustCart;
    let cache = Array.isArray(boot.cart?.items) ? boot.cart.items.map(mapLine) : proto.items();

    const refresh = () =>
      json("/cart.js").then((cart) => {
        cache = (cart.items || []).map(mapLine);
        emitCart();
        return cart;
      });

    window.AugustCart = {
      ...proto,
      items: () => cache,
      count: () => cache.reduce((n, i) => n + i.qty, 0),
      subtotal: () => cache.reduce((sum, i) => sum + i.price * i.qty, 0),
      add: (id, size) => {
        const variantId = Number(id);
        if (!variantId) return proto.add(id, size);
        return json("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: variantId, quantity: 1 }),
        }).then(refresh);
      },
      removeAt: (index) => {
        const line = cache[index];
        if (!line?.key) return proto.removeAt(index);
        return json("/cart/change.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: line.key, quantity: 0 }),
        }).then(refresh);
      },
      clear: () => json("/cart/clear.js", { method: "POST" }).then(refresh),
    };
  };

  const patchProfile = () => {
    const customer = boot.customer;
    if (!customer || !window.AugustProfile) return;
    const current = window.AugustProfile.load?.() || {};
    const merged = {
      ...current,
      name: customer.name || current.name,
      email: customer.email || current.email,
      homepage: customer.homepage || current.homepage,
      preferredBrands: customer.preferredBrands || current.preferredBrands,
      swipes: customer.swipes || current.swipes,
    };
    window.AugustProfile.save?.(merged);
  };

  const start = () => {
    patchCart();
    patchProfile();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
