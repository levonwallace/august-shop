/* August — order.html?o=AUG-2398
   Hydrates details + a Leaflet map of the package on its way
   from the shop to a Madison address. */
document.addEventListener("DOMContentLoaded", async () => {
  const root = document.querySelector("[data-order]");
  if (!root || !window.AugustOrders) return;

  const params = new URLSearchParams(location.search);
  const order = window.AugustOrders.byNo(params.get("o")) || window.AugustOrders.SAMPLES[1];
  const money = window.AugustCatalog?.money || ((n) => "$" + Number(n).toFixed(2));
  const hrefFor = (item) => {
    if (item.handle) return `product.html?h=${encodeURIComponent(item.handle)}`;
    if (item.id && !String(item.id).startsWith("sample")) return `product.html?p=${item.id}`;
    return "collection.html";
  };

  document.title = `${order.no} — August`;
  const set = (sel, text) => {
    const el = root.querySelector(sel);
    if (el) el.textContent = text;
  };

  set("[data-order-no]", order.no);
  set("[data-order-kicker]", order.no);
  set("[data-order-status]", order.status);
  const lead = root.querySelector(".story__lead");
  if (lead) {
    lead.innerHTML =
      order.status === "Delivered"
        ? `<span data-order-eta>${order.eta}</span>`
        : order.status === "In transit"
          ? `Arriving <span data-order-eta>${order.eta}</span>`
          : `<span data-order-eta>${order.eta}</span>`;
  } else {
    set("[data-order-eta]", order.eta);
  }
  set("[data-order-carrier]", `${order.carrier} · ${order.tracking}`);
  set("[data-order-date]", new Date(order.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }));
  set("[data-order-total]", money(order.total));
  set("[data-order-ship-line]", order.home.line);
  set("[data-order-ship-city]", order.home.city);
  set("[data-order-from]", `${order.shop.name} · ${order.shop.line}`);

  const badge = root.querySelector("[data-order-badge]");
  if (badge) {
    badge.textContent = order.status;
    badge.className = `order-status ${window.AugustOrders.statusClass(order.status)}`;
  }

  const stepsEl = root.querySelector("[data-order-steps]");
  if (stepsEl) {
    stepsEl.innerHTML = window.AugustOrders.stepsFor(order)
      .map(
        (s) => `
      <li class="track-step${s.done ? " is-done" : ""}${s.current ? " is-current" : ""}">
        <span class="track-step__dot" aria-hidden="true"></span>
        <span class="track-step__label">${s.label}</span>
        <span class="track-step__detail">${s.detail}</span>
      </li>`
      )
      .join("");
  }

  const itemsEl = root.querySelector("[data-order-items]");
  if (itemsEl) {
    itemsEl.innerHTML = order.items
      .map(
        (item) => `
      <a class="track-item" href="${hrefFor(item)}">
        <div class="track-item__thumb"><img src="${item.img}" alt="" /></div>
        <div class="track-item__info">
          <span class="track-item__brand">${item.brand || ""}</span>
          <span class="track-item__title">${item.title}</span>
          <span class="track-item__meta">${item.size ? `Size ${item.size} · ` : ""}Qty ${item.qty}</span>
        </div>
        <span class="track-item__price">${money(item.price * item.qty)}</span>
      </a>`
      )
      .join("");
  }

  const mapEl = root.querySelector("[data-order-map]");
  if (!mapEl) return;
  if (typeof L === "undefined") {
    mapEl.innerHTML = `<p class="track-map__fallback">Map unavailable — ${order.shop.line} → ${order.home.line}</p>`;
    return;
  }

  const route = await window.AugustOrders.route();
  const here = window.AugustOrders.along(route, order.progress);
  const map = L.map(mapEl, {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
    tap: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    maxZoom: 19,
  }).addTo(map);

  const path = L.polyline(route, {
    color: "#2a7a33",
    weight: 4,
    opacity: 0.85,
    lineJoin: "round",
    lineCap: "round",
  }).addTo(map);

  const pin = (label, extra) =>
    L.divIcon({
      className: `track-pin ${extra || ""}`,
      html: `<span>${label}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

  L.marker([order.shop.lat, order.shop.lng], { icon: pin("A", "track-pin--shop"), title: "August" }).addTo(map);
  L.marker([order.home.lat, order.home.lng], { icon: pin("⌂", "track-pin--home"), title: "Delivery" }).addTo(map);

  const truck = L.marker(here, {
    icon: pin("●", "track-pin--pkg"),
    title: "Your order",
    zIndexOffset: 600,
  }).addTo(map);

  map.fitBounds(path.getBounds().pad(0.18));
  L.control.zoom({ position: "topright" }).addTo(map);
  const refresh = () => {
    map.invalidateSize();
    map.fitBounds(path.getBounds().pad(0.18));
  };
  requestAnimationFrame(refresh);
  setTimeout(refresh, 280);
  window.addEventListener("resize", () => map.invalidateSize());

  const live = order.status === "In transit";
  if (live) {
    let t = order.progress;
    const tick = () => {
      t = Math.min(0.92, t + 0.00012);
      truck.setLatLng(window.AugustOrders.along(route, t));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
});
