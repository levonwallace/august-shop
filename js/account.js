/* August — Account page
   Renders from the same localStorage profile the auth modal writes.
   Orders are static prototype data in account.html. */
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

  const render = () => {
    const user = load();
    if (gate) gate.hidden = !!user;
    if (dash) dash.hidden = !user;
    if (!user) return;

    set("[data-account-first]", user.name.split(" ")[0]);
    set("[data-account-email]", user.email);
    set("[data-account-name]", user.name);
    set("[data-account-email-2]", user.email);
    set("[data-account-since]", monthYear(user.createdAt));
  };

  render();
  window.addEventListener("august:profile-changed", render);

  /* ── Homepage customizer ─────────────────────────────────
     Writes user.homepage (→ customer metafields at Shopify port).
     profile.js applies it to the home hero on every visit. */

  const deptEl = page.querySelector("[data-home-dept]");
  const catEl = page.querySelector("[data-home-cat]");
  const saleEl = page.querySelector("[data-home-sale]");
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
    department: readChip(deptEl),
    category: readChip(catEl),
    saleOnly: !!saleEl?.checked,
  });

  const updatePreview = () => {
    if (!previewEl || !window.AugustProfile) return;
    const hp = currentPrefs();
    previewEl.textContent = window.AugustProfile.feedIsDefault(hp)
      ? "Homepage: standard August"
      : `Homepage: ${window.AugustProfile.feedLabel(hp)}`;
  };

  const hydratePrefs = () => {
    const user = load();
    const hp = (user && user.homepage) || { department: "all", category: "all", saleOnly: false };
    setChip(deptEl, hp.department || "all");
    setChip(catEl, hp.category || "all");
    if (saleEl) saleEl.checked = !!hp.saleOnly;
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

  saveBtn?.addEventListener("click", () => {
    const user = load();
    if (!user || !window.AugustProfile) return;
    user.homepage = currentPrefs();
    window.AugustProfile.save(user);
    saveBtn.textContent = "Saved ✓";
    saveBtn.disabled = true;
    setTimeout(() => {
      saveBtn.textContent = "Save";
      saveBtn.disabled = false;
    }, 1400);
  });

  hydratePrefs();
  window.addEventListener("august:profile-changed", hydratePrefs);
});
