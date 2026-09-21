/* August — User Profile & Personalization */
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "august_user";
  const SIGNED_OUT_KEY = "august_signed_out";

  /* Shopify port note: this object maps to `customer` + customer metafields
     (namespace `august.homepage`). The homepage takeover below becomes a
     Liquid section variant keyed off those metafields. */
  const defaults = () => ({
    name: "",
    email: "",
    avatar: "",
    homepage: { enabled: true, department: "all", category: "all", saleOnly: false },
    preferredBrands: [],
    createdAt: null,
  });

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : null;
    } catch {
      return null;
    }
  };

  const save = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.removeItem(SIGNED_OUT_KEY);
    window.dispatchEvent(new CustomEvent("august:profile-changed", { detail: data }));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Remember the explicit sign-out so the demo seed doesn't log back in
    localStorage.setItem(SIGNED_OUT_KEY, "1");
    window.dispatchEvent(new CustomEvent("august:profile-changed", { detail: null }));
  };

  /* ── Demo seed ────────────────────────────────────────────
     Prototype ships "already logged in" with the example prefs:
     homepage set to men's shoes on sale. Sign out to see logged-out. */
  if (!load() && !localStorage.getItem(SIGNED_OUT_KEY)) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaults(),
        name: "Levon Wallace",
        email: "levon@august-shop.com",
        homepage: { enabled: true, department: "men", category: "shoes", saleOnly: true },
        preferredBrands: ["vans", "hoka"],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
      })
    );
  }

  /* Human-readable label for a homepage pref, e.g. "Men's shoes on sale" */
  const feedLabel = (hp) => {
    if (!hp) return "";
    const dept = hp.department === "men" ? "men's" : hp.department === "women" ? "women's" : "";
    const cat = { shoes: "shoes", apparel: "apparel", accessories: "accessories" }[hp.category] || "everything";
    let label = [dept, cat].filter(Boolean).join(" ");
    if (hp.saleOnly) label += " on sale";
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const feedIsDefault = (hp) =>
    !hp ||
    ((hp.department || "all") === "all" && (hp.category || "all") === "all" && !hp.saleOnly);

  // Shared with account.js
  window.AugustProfile = { load, save, feedLabel, feedIsDefault };

  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  /* ── Inject DOM ─────────────────────────────────────────── */

  const avatarEls = document.querySelectorAll(".avatar");
  if (!avatarEls.length) return;

  const desktopAvatar = document.querySelector(".header-desktop .avatar, .header-utilities .avatar");

  const injectProfileUI = () => {
    const shell = document.createElement("div");
    shell.innerHTML = `
      <!-- Profile dropdown -->
      <div class="profile-drop" data-profile-drop hidden>
        <div class="profile-drop__signed-out" data-profile-signed-out>
          <p class="profile-drop__greeting">Account</p>
          <p class="profile-drop__sub">Orders, saved items, faster checkout.</p>
          <button class="profile-drop__btn profile-drop__btn--primary" type="button" data-profile-action="signin">Sign in</button>
          <button class="profile-drop__btn" type="button" data-profile-action="create">Create account</button>
        </div>
        <div class="profile-drop__signed-in" data-profile-signed-in hidden>
          <div class="profile-drop__user">
            <img class="profile-drop__avatar-lg" src="assets/avatar-demo.jpg" alt="" />
            <div>
              <p class="profile-drop__name" data-profile-display-name></p>
              <p class="profile-drop__email" data-profile-display-email></p>
            </div>
          </div>
          <div class="profile-drop__divider"></div>
          <a class="profile-drop__link" href="account.html">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.6" stroke="currentColor" stroke-width="1.2"/><path d="M2.5 12.5c.6-2.4 2.4-3.8 4.5-3.8s3.9 1.4 4.5 3.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            Account
          </a>
          <button class="profile-drop__link" type="button" data-profile-action="signout">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Sign Out
          </button>
        </div>
      </div>

      <!-- Backdrop for modals -->
      <div class="profile-backdrop" data-profile-backdrop hidden></div>

      <!-- Auth modal — one card, two modes. No wizard. -->
      <div class="profile-modal profile-modal--auth is-signin" data-profile-modal hidden>
        <div class="profile-modal__card profile-modal__card--auth">
          <button class="profile-modal__close" type="button" data-profile-modal-close aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>

          <p class="auth-wordmark">August</p>

          <div class="auth-tabs" role="tablist" aria-label="Sign in or create account">
            <button type="button" class="auth-tab is-active" role="tab" aria-selected="true" data-auth-mode="signin">Sign in</button>
            <button type="button" class="auth-tab" role="tab" aria-selected="false" data-auth-mode="create">Create account</button>
          </div>

          <form class="profile-form" data-profile-form>
            <label class="profile-field profile-field--name">
              <span>Name</span>
              <input type="text" name="name" autocomplete="name" />
            </label>
            <label class="profile-field">
              <span>Email</span>
              <input type="email" name="email" required autocomplete="email" />
            </label>
            <label class="profile-field">
              <span>Password</span>
              <input type="password" name="password" required minlength="8" autocomplete="current-password" />
            </label>
            <p class="profile-form__error" data-profile-error hidden></p>
            <button class="btn btn--primary btn--block profile-form__submit" type="submit" data-profile-submit>Sign in</button>
          </form>

          <p class="auth-footnote">By continuing, you agree to August's <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
        </div>
      </div>

    `;

    while (shell.firstElementChild) {
      document.body.appendChild(shell.firstElementChild);
    }
  };

  injectProfileUI();

  /* ── Refs ────────────────────────────────────────────────── */

  const drop = document.querySelector("[data-profile-drop]");
  const signedOut = document.querySelector("[data-profile-signed-out]");
  const signedIn = document.querySelector("[data-profile-signed-in]");
  const backdrop = document.querySelector("[data-profile-backdrop]");
  const modal = document.querySelector("[data-profile-modal]");
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ── Avatar → button ────────────────────────────────────── */

  avatarEls.forEach((img) => {
    if (img.closest("button")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "avatar-btn";
    btn.setAttribute("aria-label", "Account");
    btn.setAttribute("data-avatar-trigger", "");
    img.replaceWith(btn);
    btn.appendChild(img);
  });

  /* ── Render state ───────────────────────────────────────── */

  /* Profile sheet (mobile) — mirrors dropdown content into a bottom sheet */
  const profileSheetBody = document.querySelector("[data-profile-sheet-body]");

  const renderSheetBody = (user) => {
    if (!profileSheetBody) return;
    if (user && user.name) {
      profileSheetBody.innerHTML = `
        <div class="profile-sheet__user">
          <img class="profile-sheet__avatar-lg" src="assets/avatar-demo.jpg" alt="" />
          <div class="profile-sheet__user-meta">
            <p class="profile-sheet__name">${user.name}</p>
            <p class="profile-sheet__email">${user.email}</p>
          </div>
        </div>
        <div class="sheet-list">
          <a class="sheet-list__row" href="account.html">
            <span>My account</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a class="sheet-list__row" href="cart.html">
            <span>Your bag</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a class="sheet-list__row" href="#">
            <span>Help &amp; support</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
        <button class="btn btn--ghost btn--block profile-sheet__signout" type="button" data-profile-action="signout">Sign out</button>
      `;
    } else {
      profileSheetBody.innerHTML = `
        <p class="profile-sheet__hint">Orders, saved items, faster checkout.</p>
        <button class="btn btn--primary btn--block" type="button" data-profile-action="signin">Sign in</button>
        <button class="btn btn--ghost btn--block" type="button" data-profile-action="create">Create account</button>
        <div class="sheet-section">
          <p class="sheet-section__label">Quick links</p>
          <div class="sheet-list">
            <a class="sheet-list__row" href="cart.html">
              <span>Your bag</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
            <a class="sheet-list__row" href="collection.html">
              <span>Browse new arrivals</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
            <a class="sheet-list__row" href="#">
              <span>Help &amp; support</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div>
      `;
    }
  };

  const render = () => {
    const user = load();
    const triggers = $$("[data-avatar-trigger]");

    // Header always shows the profile photo (signed in or out).
    triggers.forEach((btn) => {
      const img = btn.querySelector(".avatar");
      if (img) img.hidden = false;
      const badge = btn.querySelector(".avatar-initials");
      if (badge) badge.hidden = true;
    });

    if (user) {
      signedOut.hidden = true;
      signedIn.hidden = false;
      const n = $("[data-profile-display-name]");
      const e = $("[data-profile-display-email]");
      const i = $("[data-profile-initials]");
      if (n) n.textContent = user.name;
      if (e) e.textContent = user.email;
      if (i) i.textContent = initials(user.name);
    } else {
      signedOut.hidden = false;
      signedIn.hidden = true;
    }

    renderSheetBody(user);
  };

  render();

  /* ── Dropdown toggle ────────────────────────────────────── */

  let dropOpen = false;

  const positionDrop = (trigger) => {
    const rect = trigger.getBoundingClientRect();
    drop.style.top = rect.bottom + 8 + "px";
    drop.style.right = Math.max(8, window.innerWidth - rect.right) + "px";
  };

  const openDrop = (trigger) => {
    positionDrop(trigger);
    drop.hidden = false;
    requestAnimationFrame(() => drop.classList.add("is-open"));
    dropOpen = true;
  };

  const closeDrop = () => {
    drop.classList.remove("is-open");
    setTimeout(() => { drop.hidden = true; }, 180);
    dropOpen = false;
  };

  const mobileMQ = window.matchMedia("(max-width: 900px)");

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-avatar-trigger]");
    if (trigger) {
      e.stopPropagation();
      // Mobile: route to the profile sheet primitive.
      // Desktop: use the dropdown as before.
      if (mobileMQ.matches && window.Sheet) {
        if (window.Sheet.isOpen("profile-sheet")) {
          window.Sheet.close("profile-sheet");
        } else {
          window.Sheet.open("profile-sheet");
        }
        return;
      }
      if (dropOpen) closeDrop();
      else openDrop(trigger);
      return;
    }
    if (dropOpen && !e.target.closest("[data-profile-drop]")) {
      closeDrop();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (dropOpen) closeDrop();
    }
  });

  /* ── Modal helpers ──────────────────────────────────────── */

  const openModal = (el) => {
    closeDrop();
    backdrop.hidden = false;
    el.hidden = false;
    requestAnimationFrame(() => {
      backdrop.classList.add("is-visible");
      el.classList.add("is-visible");
    });
  };

  const closeModal = (el) => {
    backdrop.classList.remove("is-visible");
    el.classList.remove("is-visible");
    setTimeout(() => {
      backdrop.hidden = true;
      el.hidden = true;
    }, 240);
  };

  /* ── Auth mode (sign in ↔ create) ───────────────────────── */

  const form = $("[data-profile-form]");
  const nameField = form.querySelector('[name="name"]');
  const pwField = form.querySelector('[name="password"]');
  const submitBtn = $("[data-profile-submit]");
  let authMode = "signin";

  const setAuthMode = (mode) => {
    authMode = mode;
    const create = mode === "create";
    modal.classList.toggle("is-signin", !create);
    $$("[data-auth-mode]").forEach((tab) => {
      const active = tab.getAttribute("data-auth-mode") === mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    if (nameField) nameField.required = create;
    if (pwField) pwField.setAttribute("autocomplete", create ? "new-password" : "current-password");
    if (submitBtn) submitBtn.textContent = create ? "Create account" : "Sign in";
    const err = $("[data-profile-error]");
    if (err) err.hidden = true;
  };

  document.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-auth-mode]");
    if (tab) setAuthMode(tab.getAttribute("data-auth-mode"));
  });

  /* ── Actions ────────────────────────────────────────────── */

  document.addEventListener("click", (e) => {
    const action = e.target.closest("[data-profile-action]");
    if (!action) return;
    const a = action.getAttribute("data-profile-action");

    if (a === "create" || a === "signin") {
      setAuthMode(a === "create" ? "create" : "signin");
      openModal(modal);
    }
    if (a === "signout") {
      closeDrop();
      logout();
      render();
    }
  });

  /* ── Submit — save and close. No wizard, no fanfare. ────── */

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get("name") || "").trim();
    const email = (fd.get("email") || "").trim();
    const pw = fd.get("password") || "";

    const err = $("[data-profile-error]");
    const fail = (msg) => {
      err.textContent = msg;
      err.hidden = false;
    };

    if (authMode === "create" && !name) return fail("Enter your name.");
    if (!email || !email.includes("@")) return fail("Enter a valid email.");
    if (pw.length < 8) return fail("Password needs at least 8 characters.");
    err.hidden = true;

    const existing = load();
    if (authMode === "signin" && existing && existing.email === email) {
      // Prototype: existing account, keep profile as-is
    } else {
      // Prototype: sign-in without an account just creates one quietly
      const displayName = name || email.split("@")[0].replace(/[._-]+/g, " ");
      save({ ...defaults(), name: displayName, email, createdAt: Date.now() });
    }

    render();
    closeModal(modal);
    form.reset();
  });

  /* ── Close buttons ──────────────────────────────────────── */

  $("[data-profile-modal-close]")?.addEventListener("click", () => {
    closeModal(modal);
    form.reset();
  });

  backdrop?.addEventListener("click", () => {
    closeModal(modal);
    form.reset();
  });

  /* ── Homepage takeover ────────────────────────────────────
     If the signed-in user set a homepage preference (account page),
     the home hero opens on their feed. Shopify port: this becomes a
     Liquid conditional on customer metafields rendering an alternate
     hero section — same data, server-side. */

  const applyHomepagePrefs = () => {
    const user = load();
    if (!document.querySelector(".page--home")) return;

    const hp = user?.homepage;
    // Takeover only when a feed is configured AND switched on
    // (missing `enabled` = true, for profiles saved before the toggle existed)
    if (!user || feedIsDefault(hp) || hp.enabled === false) return;

    const heroTitle = document.querySelector(".home-copy h1");
    const heroSub = document.querySelector(".home-copy p");
    // Prefer the hero's own chip; fall back to the header promo chip
    const badge =
      document.querySelector(".announce-chip--hero") || document.querySelector(".announce-chip");

    const label = feedLabel(hp);
    const labelNoSale = feedLabel({ ...hp, saleOnly: false });

    if (heroTitle) {
      heroTitle.innerHTML = hp.saleOnly
        ? `${labelNoSale},<br />on sale.`
        : `${labelNoSale},<br />new weekly.`;
    }
    if (heroSub) {
      heroSub.innerHTML = `Your homepage is set to ${label.toLowerCase()} — <a href="account.html">change it</a> anytime.`;
    }
    if (badge) {
      const dot = badge.querySelector(".dot");
      badge.innerHTML = "";
      if (dot) badge.appendChild(dot);
      badge.append(`Your feed · ${label}`);
    }

    /* Swap the actual product imagery for the user's feed (real products
       from august-shop.com via js/catalog.js). Hero tiles first, then the
       first shelf below becomes "More of your feed". */
    if (window.AugustCatalog) {
      const items = window.AugustCatalog.feed(hp);
      if (items.length) {
        const tiles = document.querySelectorAll(".home-grid .home-tile");
        tiles.forEach((tile, i) => {
          const p = items[i % items.length];
          tile.href = `product.html?p=${p.id}`;
          const img = tile.querySelector("img");
          if (img) {
            img.src = p.img;
            img.alt = p.title;
          }
        });

        const gridTitle = document.querySelector(".home-grid__title");
        if (gridTitle) gridTitle.textContent = `Your feed — ${label.toLowerCase()}`;

        const shelfTitle = document.querySelector(".home-statement__title");
        const shelfGrid = document.querySelector(".home-statement__grid");
        if (shelfTitle && shelfGrid) {
          shelfTitle.textContent = "More of your feed";
          // Continue past the hero tiles; wrap around if the feed is short
          const pool = items.slice(tiles.length).concat(items);
          [...shelfGrid.querySelectorAll(".product-card")].forEach((card, i) => {
            const p = pool[i % pool.length];
            card.href = `product.html?p=${p.id}`;
            const img = card.querySelector(".product-card__media img");
            const brand = card.querySelector(".product-card__brand");
            const title = card.querySelector(".product-card__title");
            const price = card.querySelector(".product-card__price");
            if (img) {
              img.src = p.img;
              img.alt = p.title;
            }
            if (brand) brand.textContent = p.brand;
            if (title) title.textContent = p.title;
            if (price) price.innerHTML = window.AugustCatalog.priceHtml(p);
          });
        }
      }
    }
  };

  /* ── Feed toggle (top of home) ────────────────────────────
     Signed-in users with a configured feed get a pill switch:
     "Your feed" ↔ "Everything". Flipping it writes homepage.enabled
     and re-renders — exactly what a Liquid re-request would do. */
  const injectFeedToggle = () => {
    const host = document.querySelector(".page--home .home-copy");
    const user = load();
    if (!host || !user || feedIsDefault(user.homepage)) return;
    if (document.querySelector("[data-feed-toggle]")) return;

    const on = user.homepage.enabled !== false;
    const wrap = document.createElement("div");
    wrap.className = "feed-toggle";
    wrap.setAttribute("data-feed-toggle", "");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Homepage view");
    wrap.innerHTML = `
      <button type="button" class="feed-toggle__opt${on ? " is-active" : ""}" data-feed-mode="on">Your feed</button>
      <button type="button" class="feed-toggle__opt${on ? "" : " is-active"}" data-feed-mode="off">Everything</button>
    `;
    host.insertBefore(wrap, host.firstChild);

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-feed-mode]");
      if (!btn) return;
      const next = btn.getAttribute("data-feed-mode") === "on";
      const u = load();
      if (!u) return;
      if ((u.homepage.enabled !== false) === next) return;
      u.homepage.enabled = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      // Reload so the hero re-renders cleanly in the other mode —
      // mirrors the server-rendered Liquid behavior at port time.
      location.reload();
    });
  };

  applyHomepagePrefs();
  injectFeedToggle();

  window.addEventListener("august:profile-changed", () => {
    render();
    applyHomepagePrefs();
  });
});
