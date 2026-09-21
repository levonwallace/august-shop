/* August — Account page
   One unified account surface: profile header, feed customizer (with the
   "open to my feed" default), orders, editable details, followed brands.
   Everything reads/writes the same localStorage profile the auth modal
   uses (→ Shopify customer + metafields at port time). */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".account-page");
  if (!page) return;

  const gate = page.querySelector("[data-account-signed-out]");
  const dash = page.querySelector("[data-account-signed-in]");

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem("august_user"));
    } catch {
      return null;
    }
  };

  const monthYear = (ts) => {
    if (!ts) return "September 2026";
    return new Date(ts).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const set = (sel, text) => {
    const el = page.querySelector(sel);
    if (el) el.textContent = text;
  };

  const flashSaved = (btn, label) => {
    if (!btn) return;
    btn.textContent = "Saved ✓";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = label;
      btn.disabled = false;
    }, 1400);
  };

  /* ── Page state ──────────────────────────────────────────── */

  const render = () => {
    const user = load();
    if (gate) gate.hidden = !!user;
    if (dash) dash.hidden = !user;
    if (!user) return;

    set("[data-account-name-display]", user.name);
    set("[data-account-email]", user.email);
    set("[data-account-email-2]", user.email);
    set("[data-account-since]", monthYear(user.createdAt));

    const nameInput = page.querySelector("[data-account-name-input]");
    if (nameInput && document.activeElement !== nameInput) nameInput.value = user.name;
  };

  render();
  window.addEventListener("august:profile-changed", render);

  /* ── Placed orders (from checkout) above the sample ones ── */

  const renderPlacedOrders = () => {
    const ordersPanel = page.querySelector(".account-orders");
    if (!ordersPanel || !window.AugustCart || !window.AugustCatalog) return;

    // Clear any previously injected rows, keep the static samples
    ordersPanel.querySelectorAll("[data-placed-order]").forEach((el) => el.remove());

    const heading = ordersPanel.querySelector("h2");
    const orders = window.AugustCart.orders();
    // newest first, insert directly under the heading
    [...orders].reverse().forEach((order) => {
      const first = window.AugustCatalog.byId(order.items[0]?.id);
      if (!first) return;
      const extra = order.items.length > 1 ? ` +${order.items.length - 1} more` : "";
      const date = new Date(order.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const row = document.createElement("a");
      row.className = "order-row";
      row.href = `product.html?p=${first.id}`;
      row.setAttribute("data-placed-order", "");
      row.innerHTML = `
        <div class="order-row__thumb"><img src="${first.img}" alt="" /></div>
        <div class="order-row__info">
          <span class="order-row__title">${first.title}${extra}</span>
          <span class="order-row__meta">${order.no} · ${date}</span>
        </div>
        <span class="order-status order-status--transit">${order.status || "Processing"}</span>
        <span class="order-row__price">${window.AugustCatalog.money(order.total)}</span>
      `;
      heading.insertAdjacentElement("afterend", row);
    });
  };

  renderPlacedOrders();
  window.addEventListener("august:cart-changed", renderPlacedOrders);

  /* ── My feed ─────────────────────────────────────────────── */

  const deptEl = page.querySelector("[data-home-dept]");
  const catEl = page.querySelector("[data-home-cat]");
  const saleEl = page.querySelector("[data-home-sale]");
  const enabledEl = page.querySelector("[data-home-enabled]");
  const previewEl = page.querySelector("[data-home-preview]");
  const saveBtn = page.querySelector("[data-home-save]");

  const readChip = (el) =>
    el?.querySelector(".pref-chip.is-active")?.getAttribute("data-value") || "all";

  const setChip = (el, value) => {
    el?.querySelectorAll(".pref-chip").forEach((c) => {
      c.classList.toggle("is-active", c.getAttribute("data-value") === value);
    });
  };

  const currentPrefs = () => ({
    enabled: !!enabledEl?.checked,
    department: readChip(deptEl),
    category: readChip(catEl),
    saleOnly: !!saleEl?.checked,
  });

  const updatePreview = () => {
    if (!previewEl || !window.AugustProfile) return;
    const hp = currentPrefs();
    if (window.AugustProfile.feedIsDefault(hp)) {
      previewEl.textContent = "Homepage: standard August";
    } else {
      const label = window.AugustProfile.feedLabel(hp);
      previewEl.textContent = hp.enabled
        ? `Homepage: ${label}`
        : `Saved feed: ${label} (off)`;
    }
  };

  const hydratePrefs = () => {
    const user = load();
    const hp = (user && user.homepage) || {
      enabled: true,
      department: "all",
      category: "all",
      saleOnly: false,
    };
    setChip(deptEl, hp.department || "all");
    setChip(catEl, hp.category || "all");
    if (saleEl) saleEl.checked = !!hp.saleOnly;
    if (enabledEl) enabledEl.checked = hp.enabled !== false;
    updatePreview();
  };

  [deptEl, catEl].forEach((el) => {
    el?.addEventListener("click", (e) => {
      const chip = e.target.closest(".pref-chip");
      if (!chip) return;
      setChip(el, chip.getAttribute("data-value"));
      updatePreview();
    });
  });

  saleEl?.addEventListener("change", updatePreview);
  enabledEl?.addEventListener("change", updatePreview);

  saveBtn?.addEventListener("click", () => {
    const user = load();
    if (!user || !window.AugustProfile) return;
    user.homepage = currentPrefs();
    window.AugustProfile.save(user);
    flashSaved(saveBtn, "Save");
  });

  hydratePrefs();
  window.addEventListener("august:profile-changed", hydratePrefs);

  /* ── Details (name) ──────────────────────────────────────── */

  page.querySelector("[data-details-save]")?.addEventListener("click", (e) => {
    const user = load();
    if (!user || !window.AugustProfile) return;
    const nameInput = page.querySelector("[data-account-name-input]");
    if (nameInput && nameInput.value.trim()) user.name = nameInput.value.trim();
    window.AugustProfile.save(user);
    flashSaved(e.currentTarget, "Save details");
  });

  /* ── Brands I follow ─────────────────────────────────────── */

  const brandsEl = page.querySelector("[data-account-brands]");

  const hydrateBrands = () => {
    const user = load();
    const brands = (user && user.preferredBrands) || [];
    brandsEl?.querySelectorAll(".pref-chip").forEach((c) => {
      c.classList.toggle("is-active", brands.includes(c.getAttribute("data-value")));
    });
  };

  brandsEl?.addEventListener("click", (e) => {
    const chip = e.target.closest(".pref-chip");
    if (chip) chip.classList.toggle("is-active");
  });

  page.querySelector("[data-brands-save]")?.addEventListener("click", (e) => {
    const user = load();
    if (!user || !window.AugustProfile) return;
    user.preferredBrands = [...brandsEl.querySelectorAll(".pref-chip.is-active")].map((c) =>
      c.getAttribute("data-value")
    );
    window.AugustProfile.save(user);
    flashSaved(e.currentTarget, "Save brands");
  });

  hydrateBrands();
  window.addEventListener("august:profile-changed", hydrateBrands);
});
