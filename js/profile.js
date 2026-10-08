/* August — User Profile & Personalization */
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "august_user";
  const SIGNED_OUT_KEY = "august_signed_out";

  /* Shopify port: customer + metafields namespace `august`
       homepage          type json     { enabled, department, category, saleOnly }
       preferred_brands  type json     ["Vans", "Hoka"]
       swipes            type json     { likes, skips, items }
     Storefront access must be enabled. Writes later go through an app proxy.
     Homepage takeover = Liquid section variant keyed off those metafields. */
  const defaults = () => ({
    name: "",
    email: "",
    avatar: "",
    homepage: { enabled: true, department: "all", category: "all", saleOnly: false },
    preferredBrands: [],
    swipes: { likes: [], skips: [], items: [] },
    createdAt: null,
  });

  const snapshotFromCatalog = (id) =>
    (id && window.AugustCatalog?.byId?.(id)) || (id && window.AugustShop?.cached?.(id)) || null;

  const normalizeItem = (item) => {
    if (!item || typeof item !== "object") return null;
    const id = item.id || item.handle || "";
    if (!id) return null;
    const dir = item.dir === "skip" ? "skip" : item.dir === "like" ? "like" : null;
    if (!dir) return null;
    const cat = snapshotFromCatalog(id);
    return {
      id,
      handle: item.handle || cat?.handle || "",
      brand: item.brand || cat?.brand || "",
      title: item.title || cat?.title || "",
      img: item.img || cat?.img || "",
      dir,
      t: Number(item.t) || 0,
    };
  };

  /* Last write wins per product id; newest stays at the end. */
  const normalizeSwipes = (raw) => {
    const likes = Array.isArray(raw?.likes) ? raw.likes.filter(Boolean) : [];
    const skips = Array.isArray(raw?.skips) ? raw.skips.filter(Boolean) : [];
    const map = new Map();
    (Array.isArray(raw?.items) ? raw.items : []).forEach((item) => {
      const n = normalizeItem(item);
      if (!n) return;
      map.delete(n.id);
      map.set(n.id, n);
    });
    return { likes, skips, items: [...map.values()] };
  };

  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        ...defaults(),
        ...parsed,
        homepage: { ...defaults().homepage, ...(parsed.homepage || {}) },
        preferredBrands: parsed.preferredBrands || [],
        swipes: normalizeSwipes(parsed.swipes),
      };
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

  const brandKeyOf = (name) =>
    window.AugustCatalog?.brandKey?.(name) ||
    String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  /* Tinder swipe → profile. Right = like (and follow the brand);
     left = show less. Brand arrays stay; product snapshots upsert by id. */
  const recordSwipe = (product, dir) => {
    if (!product || (dir !== "like" && dir !== "skip")) return null;
    const user = load();
    if (!user) return null;

    const key = brandKeyOf(product.brand);
    const swipes = normalizeSwipes(user.swipes);
    const id = product.id || product.handle || "";
    if (!id) return null;
    const cat = snapshotFromCatalog(id);

    if (dir === "like") {
      if (key && !swipes.likes.includes(key)) swipes.likes.push(key);
      swipes.skips = swipes.skips.filter((k) => k !== key);
      const brands = [...(user.preferredBrands || [])];
      if (key && product.brand && !brands.some((b) => brandKeyOf(b) === key)) {
        brands.push(product.brand);
      }
      user.preferredBrands = brands;
    } else {
      if (key && !swipes.skips.includes(key)) swipes.skips.push(key);
      swipes.likes = swipes.likes.filter((k) => k !== key);
    }

    swipes.items = swipes.items.filter((item) => item.id !== id);
    swipes.items.push({
      id,
      handle: product.handle || cat?.handle || "",
      brand: product.brand || cat?.brand || "",
      title: product.title || cat?.title || "",
      img: product.img || cat?.img || "",
      dir,
      t: Date.now(),
    });
    if (swipes.items.length > 80) swipes.items = swipes.items.slice(-80);

    user.swipes = swipes;
    save(user);
    window.dispatchEvent(new CustomEvent("august:swipe", { detail: { product, dir, user } }));
    return user;
  };

  const undoSwipe = (id) => {
    if (!id) return null;
    const user = load();
    if (!user) return null;

    const swipes = normalizeSwipes(user.swipes);
    const item = swipes.items.find((entry) => entry.id === id);
    swipes.items = swipes.items.filter((entry) => entry.id !== id);
    if (item?.dir === "skip") {
      const key = brandKeyOf(item.brand);
      const stillSkip =
        key && swipes.items.some((entry) => entry.dir === "skip" && brandKeyOf(entry.brand) === key);
      if (key && !stillSkip) swipes.skips = swipes.skips.filter((k) => k !== key);
    }

    user.swipes = swipes;
    save(user);
    return user;
  };

  const hiddenIds = () => {
    const user = load();
    return new Set(
      (user?.swipes?.items || []).filter((item) => item.dir === "skip" && item.id).map((item) => item.id)
    );
  };

  const swipeItems = (dir) => {
    if (dir !== "like" && dir !== "skip") return [];
    const seen = new Set();
    const out = [];
    (load()?.swipes?.items || []).forEach((item) => {
      if (item.dir !== dir || !item.id || seen.has(item.id)) return;
      seen.add(item.id);
      out.push(item);
    });
    return out;
  };

  // Shared with account.js / swipe.js
  window.AugustProfile = {
    load,
    save,
    feedLabel,
    feedIsDefault,
    recordSwipe,
    undoSwipe,
    hiddenIds,
    swipeItems,
  };

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
          <p class="profile-drop__sub">Save a feed, track orders.</p>
          <button class="profile-drop__btn profile-drop__btn--primary" type="button" data-profile-action="create">Create account</button>
          <button class="profile-drop__btn" type="button" data-profile-action="signin">Sign in</button>
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
          <p class="profile-modal__sub">Save a feed, track orders.</p>

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
        <div class="profile-sheet__hero">
          <p class="profile-sheet__hero-title">Account</p>
          <p class="profile-sheet__hero-sub">Save a feed, track orders.</p>
        </div>
        <button class="btn btn--primary btn--block profile-sheet__cta" type="button" data-profile-action="create">Create account</button>
        <button class="btn btn--ghost btn--block" type="button" data-profile-action="signin">Sign in</button>
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

    const nudge = document.querySelector("[data-feed-nudge]");
    if (nudge) nudge.hidden = !(user && feedIsDefault(user.homepage));

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
      if (document.querySelector(".page--home")) location.reload();
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
    if (document.querySelector(".page--home")) location.reload();
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

  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");

  const productHref = (p) =>
    window.AugustCatalog?.href?.(p) || `product.html?p=${p?.id || ""}`;

  const dropHidden = (list) => {
    if (!list || !list.length) return list || [];
    const hidden = hiddenIds();
    if (!hidden.size) return list;
    return list.filter((p) => p && !hidden.has(p.id) && !hidden.has(String(p.id)));
  };

  const availability = () => {
    let catalog = [];
    const visible = window.AugustCatalog?.visible;
    if (typeof visible === "function") catalog = visible() || [];
    else if (Array.isArray(visible)) catalog = visible.slice();
    else if (window.AugustCatalog?.PRODUCTS) catalog = window.AugustCatalog.PRODUCTS.slice();
    // AugustShop is the live search client — no list-all. Catalog is the floor.
    if (!catalog.length && !(window.AugustShop || window.AugustCatalog)) return [];
    return dropHidden(catalog);
  };

  const cardMarkup = (p) => {
    const Cat = window.AugustCatalog;
    if (!Cat || !p) return "";
    const set = Cat.srcset(p.img);
    return `<a class="product-card" data-swipe-card href="${productHref(p)}" data-product-id="${esc(p.id)}">
      <div class="product-card__media"><img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy"${set ? ` srcset="${set}" sizes="(min-width: 901px) 22vw, 45vw"` : ""} /></div>
      <div class="product-card__meta">
        <div class="product-card__brand">${esc(p.brand)}</div>
        <div class="product-card__title">${esc(p.title)}</div>
        <div class="product-card__price">${Cat.priceHtml(p)}</div>
      </div>
    </a>`;
  };

  const paintMedia = (el, p, sizes) => {
    const img = el.querySelector("img");
    if (!img || !p) return;
    img.src = p.img;
    img.alt = p.title;
    const set = window.AugustCatalog?.srcset?.(p.img);
    if (set) {
      img.srcset = set;
      img.sizes = sizes;
    }
  };

  const paintProductCard = (card, p) => {
    if (!card || !p) return;
    card.href = productHref(p);
    card.setAttribute("data-swipe-card", "");
    if (p.id) card.setAttribute("data-product-id", p.id);
    paintMedia(card, p, "(min-width: 901px) 24vw, 45vw");
    const brand = card.querySelector(".product-card__brand");
    const title = card.querySelector(".product-card__title");
    const price = card.querySelector(".product-card__price");
    if (brand) brand.textContent = p.brand;
    if (title) title.textContent = p.title;
    if (price && window.AugustCatalog) price.innerHTML = window.AugustCatalog.priceHtml(p);
  };

  const tagSwipeCards = (root) => {
    (root || document).querySelectorAll(".product-card, .home-tile").forEach((el) => {
      el.setAttribute("data-swipe-card", "");
    });
  };

  /* Everything = standardized shop of current availability.
     Used when logged out, or when the feed toggle is off. */
  const applyEverythingHero = () => {
    const page = document.querySelector(".page--home");
    if (!page) return;
    page.setAttribute("data-home-mode", "everything");

    const products = availability();
    if (!products.length) {
      tagSwipeCards(page);
      return;
    }

    const gridTitle = document.querySelector(".home-grid__title");
    const gridTag = document.querySelector(".home-grid__tag");
    if (gridTitle) gridTitle.textContent = "In stock now";
    if (gridTag) gridTag.textContent = "Available";

    const grid = document.querySelector(".home-grid");
    if (grid && !grid.hasAttribute("data-everything-grid")) {
      grid.setAttribute("data-everything-grid", "");
      grid.innerHTML = products.slice(0, 16).map(cardMarkup).join("");
    }

    const shelves = document.querySelectorAll(".home-statement__grid");
    const apparel = products.filter((p) => p.cat === "apparel" || p.cat === "accessories");
    const shoes = products.filter((p) => p.cat === "shoes");
    const sale = products.filter((p) => p.sale);
    const pools = [apparel, shoes, sale];
    shelves.forEach((shelf, s) => {
      const pool = pools[s]?.length ? pools[s] : products;
      shelf.querySelectorAll(".product-card").forEach((card, i) => {
        paintProductCard(card, pool[i % pool.length]);
      });
    });

    tagSwipeCards(page);
  };

  const FEED_NOTICE_KEY = "august_feed_notice_seen";
  const showFeedNotice = (label) => {
    if (sessionStorage.getItem(FEED_NOTICE_KEY)) return;
    sessionStorage.setItem(FEED_NOTICE_KEY, "1");

    const el = document.createElement("div");
    el.className = "swipe-toast swipe-toast--top";
    el.setAttribute("data-feed-notice", "");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML = `
      <p class="swipe-toast__title">Your homepage is set to ${label.toLowerCase()}.</p>
      <a class="swipe-toast__action" href="account.html">Change it anytime</a>
      <button type="button" class="swipe-toast__close" aria-label="Dismiss">&times;</button>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("is-open"), 400);

    const timer = setTimeout(() => dismiss(), 5000);
    function dismiss() {
      clearTimeout(timer);
      el.classList.remove("is-open");
      setTimeout(() => el.remove(), 220);
    }
    el.querySelector(".swipe-toast__close").addEventListener("click", dismiss);
  };

  const applyFeedHero = (hp) => {
    const page = document.querySelector(".page--home");
    if (!page) return;
    page.setAttribute("data-home-mode", "feed");

    const heroTitle = document.querySelector(".home-copy h1");
    const badge =
      document.querySelector(".announce-chip--hero") || document.querySelector(".announce-chip");

    const label = feedLabel(hp);
    const labelNoSale = feedLabel({ ...hp, saleOnly: false });

    if (heroTitle) {
      heroTitle.classList.add("home-lockup");
      heroTitle.innerHTML = hp.saleOnly
        ? `<span class="home-lockup__word">${labelNoSale},</span><span class="home-lockup__word home-lockup__word--kicker">on sale.</span>`
        : `<span class="home-lockup__word">${labelNoSale},</span><span class="home-lockup__word home-lockup__word--kicker">new weekly.</span>`;
    }
    showFeedNotice(label);
    if (badge) {
      const dot = badge.querySelector(".dot");
      badge.innerHTML = "";
      if (dot) badge.appendChild(dot);
      badge.append(`Your feed · ${label}`);
    }

    if (!window.AugustCatalog) {
      tagSwipeCards(page);
      return;
    }

    const items = dropHidden(window.AugustCatalog.feed(hp));
    if (!items.length) {
      tagSwipeCards(page);
      return;
    }

    const tiles = document.querySelectorAll(".home-grid .home-tile");
    tiles.forEach((tile, i) => {
      const p = items[i % items.length];
      tile.href = productHref(p);
      tile.setAttribute("data-swipe-card", "");
      if (p.id) tile.setAttribute("data-product-id", p.id);
      paintMedia(
        tile,
        p,
        tile.classList.contains("home-tile--hero")
          ? "(min-width: 901px) 36vw, 75vw"
          : "(min-width: 901px) 22vw, 70vw"
      );
    });

    const gridTitle = document.querySelector(".home-grid__title");
    if (gridTitle) gridTitle.textContent = `Your feed — ${label.toLowerCase()}`;

    const shelfTitle = document.querySelector(".home-statement__title");
    const shelfGrid = document.querySelector(".home-statement__grid");
    if (shelfTitle && shelfGrid) {
      shelfTitle.textContent = "More of your feed";
      const pool = items.slice(tiles.length).concat(items);
      const cards = [...shelfGrid.querySelectorAll(".product-card")];
      cards.forEach((card, i) => paintProductCard(card, pool[i % pool.length]));
      if (!shelfGrid.hasAttribute("data-feed-shelf")) {
        shelfGrid.setAttribute("data-feed-shelf", "");
        const want = 12;
        for (let i = cards.length; i < want; i++) {
          shelfGrid.insertAdjacentHTML("beforeend", cardMarkup(pool[i % pool.length]));
        }
      }
    }

    tagSwipeCards(page);
  };

  const applyHomepagePrefs = () => {
    const page = document.querySelector(".page--home");
    if (!page) return;

    const user = load();
    const hp = user?.homepage;
    // Your feed only when signed in, configured, and switched on
    // (missing `enabled` = true, for profiles saved before the toggle existed)
    const feedOn = !!(user && !feedIsDefault(hp) && hp.enabled !== false);
    if (feedOn) applyFeedHero(hp);
    else applyEverythingHero();
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
    // Swipe saves should not rebuild the hero; ranking applies on next load.
  });
});
