/* August — order lookup + tracking for the prototype
   Sample account orders plus anything placed at checkout.
   Map: August (414 State) → a Madison delivery address. */
window.AugustOrders = (() => {
  const SHOP = {
    name: "August",
    line: "414 State St",
    city: "Madison, WI 53703",
    lat: 43.07492,
    lng: -89.38755,
  };

  const HOME = {
    name: "Delivery address",
    line: "1202 Williamson St",
    city: "Madison, WI 53703",
    lat: 43.08165,
    lng: -89.36335,
  };

  /* A few road-ish waypoints so the path isn't a straight line
     if the public router is unreachable. */
  const FALLBACK_ROUTE = [
    [SHOP.lat, SHOP.lng],
    [43.0764, -89.3812],
    [43.0778, -89.3746],
    [43.0794, -89.3688],
    [HOME.lat, HOME.lng],
  ];

  const SAMPLES = [
    {
      no: "AUG-2417",
      date: Date.parse("2026-09-12T14:20:00"),
      status: "Delivered",
      total: 125,
      carrier: "USPS",
      tracking: "94001120350824171234",
      eta: "Delivered Sep 14",
      progress: 1,
      items: [{ id: "sample-1", title: "Premium Old Skool 36 Souvenir", brand: "Vans", price: 125, qty: 1, size: "9", img: "assets/cart-1.png" }],
    },
    {
      no: "AUG-2398",
      date: Date.parse("2026-09-06T11:05:00"),
      status: "In transit",
      total: 130,
      carrier: "UPS Ground",
      tracking: "1Z999AA1012342398",
      eta: "Today, 4–8 PM",
      progress: 0.62,
      items: [{ id: "sample-2", title: "Ora Primo EXT (Black/Frost)", brand: "HOKA", price: 130, qty: 1, size: "10", img: "assets/cart-2.png" }],
    },
    {
      no: "AUG-2371",
      date: Date.parse("2026-08-30T16:40:00"),
      status: "Delivered",
      total: 190,
      carrier: "USPS",
      tracking: "94001120350823714567",
      eta: "Delivered Sep 2",
      progress: 1,
      items: [{ id: "sample-3", title: "Mafate 2 OG (Citrus/Black)", brand: "HOKA", price: 190, qty: 1, size: "11", img: "assets/cart-3.png" }],
    },
  ];

  const hydratePlaced = (order) => {
    const items = (order.items || []).map((line) => {
      const p = window.AugustCatalog?.byId(line.id);
      return {
        id: line.id,
        title: p?.title || "August item",
        brand: p?.brand || "",
        price: p?.price || 0,
        qty: line.qty || 1,
        size: line.size || "",
        img: p?.img || "",
        handle: p?.handle,
      };
    });
    const status = order.status || "Processing";
    const progress =
      status === "Delivered" ? 1 : status === "In transit" ? 0.58 : 0.12;
    return {
      ...order,
      items,
      carrier: order.carrier || "USPS",
      tracking: order.tracking || `9400${String(order.no).replace(/\D/g, "").padStart(16, "0")}`,
      eta:
        order.eta ||
        (status === "Delivered"
          ? "Delivered"
          : status === "In transit"
            ? "Today, 4–8 PM"
            : "Preparing at the shop"),
      progress,
      shop: SHOP,
      home: HOME,
    };
  };

  const byNo = (no) => {
    if (!no) return null;
    const sample = SAMPLES.find((o) => o.no === no);
    if (sample) return { ...sample, shop: SHOP, home: HOME, items: sample.items.map((i) => ({ ...i })) };
    const placed = (window.AugustCart?.orders() || []).find((o) => o.no === no);
    return placed ? hydratePlaced(placed) : null;
  };

  const statusClass = (status) => {
    if (status === "Delivered") return "order-status--done";
    if (status === "In transit") return "order-status--transit";
    return "order-status--process";
  };

  const stepsFor = (order) => {
    const placed = new Date(order.date);
    const fmt = (d) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const packed = new Date(placed.getTime() + 18 * 3600 * 1000);
    const shipped = new Date(placed.getTime() + 36 * 3600 * 1000);
    const out = new Date(placed.getTime() + 72 * 3600 * 1000);
    const done = new Date(placed.getTime() + 84 * 3600 * 1000);
    const status = order.status;
    const current =
      status === "Delivered" ? 4 : status === "In transit" ? 2 : 1;
    return [
      { label: "Ordered", detail: fmt(placed), done: current >= 0, current: current === 0 },
      { label: "Packed", detail: fmt(packed), done: current >= 1, current: current === 1 },
      { label: "In transit", detail: status === "In transit" ? "On the way" : fmt(shipped), done: current >= 2, current: current === 2 },
      { label: "Out for delivery", detail: status === "Delivered" ? fmt(out) : "Next up", done: current >= 3, current: current === 3 },
      { label: "Delivered", detail: status === "Delivered" ? fmt(done) : order.eta, done: current >= 4, current: current === 4 },
    ];
  };

  const along = (latlngs, t) => {
    if (!latlngs.length) return [SHOP.lat, SHOP.lng];
    const clamped = Math.min(1, Math.max(0, t));
    if (clamped <= 0) return latlngs[0];
    if (clamped >= 1) return latlngs[latlngs.length - 1];
    let total = 0;
    const seg = [];
    for (let i = 1; i < latlngs.length; i++) {
      const a = latlngs[i - 1];
      const b = latlngs[i];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      seg.push(d);
      total += d;
    }
    let remain = total * clamped;
    for (let i = 0; i < seg.length; i++) {
      if (remain <= seg[i] || i === seg.length - 1) {
        const f = seg[i] ? remain / seg[i] : 1;
        const a = latlngs[i];
        const b = latlngs[i + 1];
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      }
      remain -= seg[i];
    }
    return latlngs[latlngs.length - 1];
  };

  const route = async () => {
    const url = `https://router.project-osrm.org/route/v1/driving/${SHOP.lng},${SHOP.lat};${HOME.lng},${HOME.lat}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("router");
      const data = await res.json();
      const coords = data.routes?.[0]?.geometry?.coordinates;
      if (!coords?.length) throw new Error("empty");
      return coords.map(([lng, lat]) => [lat, lng]);
    } catch {
      return FALLBACK_ROUTE;
    }
  };

  return { SHOP, HOME, SAMPLES, byNo, statusClass, stepsFor, along, route };
})();
