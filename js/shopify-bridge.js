/* August — Shopify live adapter
   Prototype: no-ops (localStorage catalog / cart / profile stay in charge).
   Theme: layout/theme.liquid injects window.AugustBootstrap, then this
   file maps Ajax Cart + customer metafields onto the existing APIs
   (AugustCart, the august_user profile) so swipe / bag / account keep
   working untouched.

   liquid:asset keep
   Load order: catalog.js → auxdata.js → shopify-bridge.js → shopify.js →
   august-live.js → main.js … profile.js. profile.js only defines
   window.AugustProfile on DOMContentLoaded, so the profile seed below
   writes localStorage directly and synchronously (before profile.js's
   demo seed could run). */
(() => {
  const boot = window.AugustBootstrap;
  const live = !!(boot && boot.live);

  window.AugustShopify = {
    live,
    shop: window.Shopify?.shop || boot?.shop?.name || null,
    bootstrap: boot || null,
  };

  if (!live) return;

  const PROFILE_KEY = "august_user";
  const SIGNED_OUT_KEY = "august_signed_out";

  const json = (url, opts) =>
    fetch(url, { credentials: "same-origin", ...opts }).then((res) => {
      if (!res.ok) {
        return res
          .json()
          .catch(() => ({}))
          .then((body) => {
            const err = new Error(body.description || body.message || url + " " + res.status);
            err.status = res.status;
            err.body = body;
            throw err;
          });
      }
      return res.json();
    });

  const emitCart = () => window.dispatchEvent(new CustomEvent("august:cart-changed"));

  /* Ajax cart line → prototype cart item. `id` is the PRODUCT id so
     AugustCatalog.byId() keeps resolving; the variant rides along. */
  const mapLine = (line) => ({
    id: String(line.product_id || line.id),
    variantId: line.variant_id || line.id,
    handle: line.handle || line.url?.split("/products/")[1]?.split("?")[0] || "",
    size: line.variant_title && line.variant_title !== "Default Title" ? line.variant_title : "",
    qty: line.quantity,
    title: line.product_title || line.title,
    brand: line.vendor || "",
    price: Number(line.final_price ?? line.price ?? 0) / 100,
    img: line.featured_image?.url || line.image || "",
    url: line.url || "",
    key: line.key,
  });

  /* product id (+ optional size) → variant id, via the bootstrapped catalog */
  const resolveVariant = (id, size) => {
    const key = String(id);
    const p = window.AugustCatalog?.byId?.(key);
    if (p && Array.isArray(p.variants) && p.variants.length) {
      const want = size != null ? String(size) : "";
      const bySize =
        want &&
        p.variants.find((v) => v.available && String(v.title) === want) ||
        p.variants.find((v) => String(v.title) === want);
      const first = p.variants.find((v) => v.available) || p.variants[0];
      return Number((bySize || first).id);
    }
    if (p && p.variantId) return Number(p.variantId);
    return Number(key) || 0;
  };

  const patchCart = () => {
    if (!window.AugustCart) return;
    const proto = window.AugustCart;
    let cache = Array.isArray(boot.cart?.items) ? boot.cart.items.map(mapLine) : proto.items();

    const refresh = () =>
      json("/cart.js").then((cart) => {
        cache = (cart.items || []).map(mapLine);
        boot.cart = cart;
        emitCart();
        return cart;
      });

    window.AugustCart = {
      ...proto,
      items: () => cache,
      count: () => cache.reduce((n, i) => n + i.qty, 0),
      subtotal: () => cache.reduce((sum, i) => sum + i.price * i.qty, 0),
      refresh,
      add: (id, size, quantity = 1) => {
        const variantId = resolveVariant(id, size);
        if (!variantId) return Promise.reject(new Error("No variant for " + id));
        return json("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id: variantId, quantity }),
        }).then((added) => refresh().then(() => added));
      },
      addVariant: (variantId, quantity = 1, properties) =>
        json("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id: Number(variantId), quantity, properties }),
        }).then((added) => refresh().then(() => added)),
      removeAt: (index) => {
        const line = cache[index];
        if (!line?.key) return proto.removeAt(index);
        return json("/cart/change.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ id: line.key, quantity: 0 }),
        }).then(refresh);
      },
      setAttributes: (attributes) =>
        json("/cart/update.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ attributes }),
        }).then(refresh),
      clear: () => json("/cart/clear.js", { method: "POST" }).then(refresh),
      // Prototype-only: orders live in Shopify now.
      orders: () => [],
      placeOrder: () => null,
    };
    emitCart();
  };

  /* Customer → august_user (what profile.js / account.js read). Runs at
     parse time so profile.js never seeds the demo user on the live theme. */
  const syncProfile = () => {
    const customer = boot.customer;
    let current = null;
    try {
      current = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    } catch {}

    if (!customer) {
      // Not signed in → make sure no stale/demo profile lingers.
      if (current) {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.setItem(SIGNED_OUT_KEY, "1");
      }
      return;
    }

    const sameUser = current && String(current.customerId || "") === String(customer.id);
    const base = sameUser ? current : {};
    const merged = {
      ...base,
      customerId: customer.id,
      name: customer.name || base.name || "",
      email: customer.email || base.email || "",
      createdAt: customer.createdAt || base.createdAt || null,
      homepage: customer.homepage || base.homepage,
      preferredBrands: customer.preferredBrands || base.preferredBrands,
      swipes: customer.swipes || base.swipes,
    };
    Object.keys(merged).forEach((k) => merged[k] == null && delete merged[k]);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    localStorage.removeItem(SIGNED_OUT_KEY);
  };

  try {
    syncProfile();
  } catch {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchCart);
  } else {
    patchCart();
  }
})();
