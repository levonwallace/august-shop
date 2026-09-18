/* August — User Profile & Personalization */
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "august_user";

  const defaults = () => ({
    name: "",
    email: "",
    avatar: "",
    homepageView: "default",
    preferredBrands: [],
    showSaleFirst: false,
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
    window.dispatchEvent(new CustomEvent("august:profile-changed", { detail: data }));
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("august:profile-changed", { detail: null }));
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
          <p class="profile-drop__greeting">Welcome to August</p>
          <p class="profile-drop__sub">Sign in or create an account to personalize your experience.</p>
          <button class="profile-drop__btn profile-drop__btn--primary" type="button" data-profile-action="create">Create Account</button>
          <button class="profile-drop__btn" type="button" data-profile-action="signin">Sign In</button>
        </div>
        <div class="profile-drop__signed-in" data-profile-signed-in hidden>
          <div class="profile-drop__user">
            <span class="profile-drop__avatar-lg" data-profile-initials></span>
            <div>
              <p class="profile-drop__name" data-profile-display-name></p>
              <p class="profile-drop__email" data-profile-display-email></p>
            </div>
          </div>
          <div class="profile-drop__divider"></div>
          <button class="profile-drop__link" type="button" data-profile-action="settings">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 9a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" stroke-width="1.2"/><path d="M11.4 8.6l.8.5a.5.5 0 01.1.6l-.8 1.4a.5.5 0 01-.6.2l-.9-.4a3.6 3.6 0 01-.9.5l-.1 1a.5.5 0 01-.5.4H6.5a.5.5 0 01-.5-.4l-.1-1a3.6 3.6 0 01-.9-.5l-.9.4a.5.5 0 01-.6-.2l-.8-1.4a.5.5 0 01.1-.6l.8-.5a3.5 3.5 0 010-1l-.8-.5a.5.5 0 01-.1-.6l.8-1.4a.5.5 0 01.6-.2l.9.4c.3-.2.6-.4.9-.5l.1-1a.5.5 0 01.5-.4h1.5a.5.5 0 01.5.4l.1 1c.3.1.6.3.9.5l.9-.4a.5.5 0 01.6.2l.8 1.4a.5.5 0 01-.1.6l-.8.5a3.5 3.5 0 010 1z" stroke="currentColor" stroke-width="1.2"/></svg>
            My Settings
          </button>
          <button class="profile-drop__link" type="button" data-profile-action="signout">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Sign Out
          </button>
        </div>
      </div>

      <!-- Backdrop for modals -->
      <div class="profile-backdrop" data-profile-backdrop hidden></div>

      <!-- Create Account / Sign In modal -->
      <div class="profile-modal" data-profile-modal hidden>
        <div class="profile-modal__card">
          <button class="profile-modal__close" type="button" data-profile-modal-close aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>

          <!-- Step 1: Credentials -->
          <div class="profile-step" data-profile-step="1">
            <div class="profile-modal__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="5" stroke="currentColor" stroke-width="1.8"/><path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            </div>
            <h2 class="profile-modal__title" data-modal-title>Create your account</h2>
            <p class="profile-modal__sub">Personalize your August experience.</p>
            <form class="profile-form" data-profile-form autocomplete="off">
              <label class="profile-field">
                <span>Full name</span>
                <input type="text" name="name" required placeholder="Your name" autocomplete="name" />
              </label>
              <label class="profile-field">
                <span>Email</span>
                <input type="email" name="email" required placeholder="you@example.com" autocomplete="email" />
              </label>
              <label class="profile-field">
                <span>Password</span>
                <input type="password" name="password" required placeholder="At least 8 characters" minlength="8" autocomplete="new-password" />
              </label>
              <p class="profile-form__error" data-profile-error hidden></p>
              <button class="btn btn--primary btn--block profile-form__submit" type="submit" data-profile-submit>Continue</button>
            </form>
          </div>

          <!-- Step 2: Preferences -->
          <div class="profile-step" data-profile-step="2" hidden>
            <div class="profile-modal__icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="10" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/><rect x="18" y="4" width="10" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="18" width="10" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/><rect x="18" y="18" width="10" height="10" rx="3" stroke="currentColor" stroke-width="1.8"/></svg>
            </div>
            <h2 class="profile-modal__title">Make it yours</h2>
            <p class="profile-modal__sub">Choose what you'd like to see on your homepage.</p>

            <div class="pref-section">
              <p class="pref-label">Homepage view</p>
              <div class="pref-options" data-pref-homepage>
                <button type="button" class="pref-chip is-active" data-value="default">Default</button>
                <button type="button" class="pref-chip" data-value="new-arrivals">New Arrivals</button>
                <button type="button" class="pref-chip" data-value="sale">Sale</button>
                <button type="button" class="pref-chip" data-value="footwear">Footwear</button>
                <button type="button" class="pref-chip" data-value="apparel">Apparel</button>
              </div>
            </div>

            <div class="pref-section">
              <p class="pref-label">Favorite brands</p>
              <div class="pref-options pref-options--wrap" data-pref-brands>
                <button type="button" class="pref-chip" data-value="vans">Vans</button>
                <button type="button" class="pref-chip" data-value="hoka">Hoka</button>
                <button type="button" class="pref-chip" data-value="lady-white">Lady White Co.</button>
                <button type="button" class="pref-chip" data-value="puma">Puma</button>
                <button type="button" class="pref-chip" data-value="saucony">Saucony</button>
                <button type="button" class="pref-chip" data-value="dr-martens">Dr. Martens</button>
                <button type="button" class="pref-chip" data-value="velva-sheen">Velva Sheen</button>
              </div>
            </div>

            <label class="pref-toggle">
              <input type="checkbox" data-pref-sale-first />
              <span class="pref-toggle__track"><span class="pref-toggle__thumb"></span></span>
              Show sale items first
            </label>

            <button class="btn btn--primary btn--block profile-form__submit" type="button" data-profile-save-prefs>Save & Continue</button>
            <button class="profile-skip" type="button" data-profile-skip-prefs>Skip for now</button>
          </div>

          <!-- Step 3: Welcome -->
          <div class="profile-step" data-profile-step="3" hidden>
            <div class="profile-modal__icon profile-modal__icon--done" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="2"/><path d="M13 20l5 5 9-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h2 class="profile-modal__title">You're all set, <span data-welcome-name></span></h2>
            <p class="profile-modal__sub">Your August experience is now personalized. We'll remember your preferences every time you visit.</p>
            <button class="btn btn--primary btn--block profile-form__submit" type="button" data-profile-done>Start Shopping</button>
          </div>
        </div>
      </div>

      <!-- Settings panel (post-login) -->
      <div class="profile-modal" data-settings-modal hidden>
        <div class="profile-modal__card profile-modal__card--settings">
          <button class="profile-modal__close" type="button" data-settings-close aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </button>

          <h2 class="profile-modal__title">My Settings</h2>
          <p class="profile-modal__sub">Customize how August works for you.</p>

          <div class="pref-section">
            <label class="profile-field">
              <span>Display name</span>
              <input type="text" data-settings-name />
            </label>
          </div>

          <div class="pref-section">
            <p class="pref-label">Homepage view</p>
            <div class="pref-options" data-settings-homepage>
              <button type="button" class="pref-chip" data-value="default">Default</button>
              <button type="button" class="pref-chip" data-value="new-arrivals">New Arrivals</button>
              <button type="button" class="pref-chip" data-value="sale">Sale</button>
              <button type="button" class="pref-chip" data-value="footwear">Footwear</button>
              <button type="button" class="pref-chip" data-value="apparel">Apparel</button>
            </div>
          </div>

          <div class="pref-section">
            <p class="pref-label">Favorite brands</p>
            <div class="pref-options pref-options--wrap" data-settings-brands>
              <button type="button" class="pref-chip" data-value="vans">Vans</button>
              <button type="button" class="pref-chip" data-value="hoka">Hoka</button>
              <button type="button" class="pref-chip" data-value="lady-white">Lady White Co.</button>
              <button type="button" class="pref-chip" data-value="puma">Puma</button>
              <button type="button" class="pref-chip" data-value="saucony">Saucony</button>
              <button type="button" class="pref-chip" data-value="dr-martens">Dr. Martens</button>
              <button type="button" class="pref-chip" data-value="velva-sheen">Velva Sheen</button>
            </div>
          </div>

          <label class="pref-toggle">
            <input type="checkbox" data-settings-sale-first />
            <span class="pref-toggle__track"><span class="pref-toggle__thumb"></span></span>
            Show sale items first
          </label>

          <button class="btn btn--primary btn--block profile-form__submit" type="button" data-settings-save>Save Settings</button>
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
  const settingsModal = document.querySelector("[data-settings-modal]");

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
          <span class="profile-sheet__avatar-lg">${initials(user.name)}</span>
          <div class="profile-sheet__user-meta">
            <p class="profile-sheet__name">${user.name}</p>
            <p class="profile-sheet__email">${user.email}</p>
          </div>
        </div>
        <div class="sheet-list">
          <button class="sheet-list__row" type="button" data-profile-action="settings">
            <span>My Settings</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <a class="sheet-list__row" href="cart.html">
            <span>Your bag</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3 1l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a class="sheet-list__row" href="#">
            <span>Order history</span>
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
          <div class="profile-sheet__hero-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </div>
          <h3 class="profile-sheet__hero-title">Welcome to August</h3>
          <p class="profile-sheet__hero-sub">Sign in or create an account to personalize your experience.</p>
        </div>
        <button class="btn btn--primary btn--block" type="button" data-profile-action="create">Create Account</button>
        <button class="btn btn--ghost btn--block" type="button" data-profile-action="signin">Sign In</button>
        <div class="sheet-section">
          <p class="sheet-section__label">Explore without an account</p>
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

    triggers.forEach((btn) => {
      const img = btn.querySelector(".avatar");
      if (user && user.name) {
        if (img) img.hidden = true;
        let badge = btn.querySelector(".avatar-initials");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "avatar-initials";
          btn.appendChild(badge);
        }
        badge.textContent = initials(user.name);
        badge.hidden = false;
      } else {
        if (img) img.hidden = false;
        const badge = btn.querySelector(".avatar-initials");
        if (badge) badge.hidden = true;
      }
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

  const goStep = (n) => {
    $$("[data-profile-step]").forEach((s) => {
      s.hidden = s.getAttribute("data-profile-step") !== String(n);
    });
  };

  /* ── Actions ────────────────────────────────────────────── */

  let isSignIn = false;

  document.addEventListener("click", (e) => {
    const action = e.target.closest("[data-profile-action]");
    if (!action) return;
    const a = action.getAttribute("data-profile-action");

    if (a === "create") {
      isSignIn = false;
      const t = $("[data-modal-title]");
      if (t) t.textContent = "Create your account";
      goStep(1);
      openModal(modal);
    }
    if (a === "signin") {
      isSignIn = true;
      const t = $("[data-modal-title]");
      if (t) t.textContent = "Sign in to August";
      goStep(1);
      openModal(modal);
    }
    if (a === "settings") {
      closeDrop();
      openSettingsModal();
    }
    if (a === "signout") {
      closeDrop();
      logout();
      render();
    }
  });

  /* ── Create/Sign-in form ────────────────────────────────── */

  const form = $("[data-profile-form]");
  let pendingUser = null;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get("name").trim();
    const email = fd.get("email").trim();
    const pw = fd.get("password");

    const err = $("[data-profile-error]");

    if (!name || !email) {
      err.textContent = "Please fill in all fields.";
      err.hidden = false;
      return;
    }
    if (pw.length < 8) {
      err.textContent = "Password must be at least 8 characters.";
      err.hidden = false;
      return;
    }
    err.hidden = true;

    if (isSignIn) {
      const existing = load();
      if (existing && existing.email === email) {
        render();
        closeModal(modal);
      } else {
        pendingUser = { ...defaults(), name, email, createdAt: Date.now() };
        save(pendingUser);
        render();
        closeModal(modal);
      }
      return;
    }

    pendingUser = { ...defaults(), name, email, createdAt: Date.now() };
    goStep(2);
  });

  /* ── Preference chips (shared logic) ────────────────────── */

  const bindChips = (container, multi) => {
    if (!container) return;
    container.addEventListener("click", (e) => {
      const chip = e.target.closest(".pref-chip");
      if (!chip) return;
      if (multi) {
        chip.classList.toggle("is-active");
      } else {
        container.querySelectorAll(".pref-chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
      }
    });
  };

  bindChips($("[data-pref-homepage]"), false);
  bindChips($("[data-pref-brands]"), true);
  bindChips($("[data-settings-homepage]"), false);
  bindChips($("[data-settings-brands]"), true);

  const readChips = (container) => {
    if (!container) return [];
    return [...container.querySelectorAll(".pref-chip.is-active")].map((c) =>
      c.getAttribute("data-value")
    );
  };

  const setChips = (container, values, multi) => {
    if (!container) return;
    container.querySelectorAll(".pref-chip").forEach((c) => {
      const v = c.getAttribute("data-value");
      c.classList.toggle("is-active", multi ? values.includes(v) : values[0] === v);
    });
  };

  /* ── Save prefs (step 2) ────────────────────────────────── */

  const savePrefsAndContinue = () => {
    if (!pendingUser) return;
    const homepageChips = readChips($("[data-pref-homepage]"));
    const brandChips = readChips($("[data-pref-brands]"));
    const saleFirst = $("[data-pref-sale-first]")?.checked || false;

    pendingUser.homepageView = homepageChips[0] || "default";
    pendingUser.preferredBrands = brandChips;
    pendingUser.showSaleFirst = saleFirst;

    save(pendingUser);
    render();

    const wn = $("[data-welcome-name]");
    if (wn) wn.textContent = pendingUser.name.split(" ")[0];
    goStep(3);
  };

  $("[data-profile-save-prefs]")?.addEventListener("click", savePrefsAndContinue);

  $("[data-profile-skip-prefs]")?.addEventListener("click", () => {
    if (pendingUser) {
      save(pendingUser);
      render();
    }
    const wn = $("[data-welcome-name]");
    if (wn && pendingUser) wn.textContent = pendingUser.name.split(" ")[0];
    goStep(3);
  });

  $("[data-profile-done]")?.addEventListener("click", () => {
    closeModal(modal);
    form.reset();
    goStep(1);
  });

  /* ── Close buttons ──────────────────────────────────────── */

  $("[data-profile-modal-close]")?.addEventListener("click", () => {
    if (pendingUser && !load()) {
      save(pendingUser);
      render();
    }
    closeModal(modal);
    form.reset();
    goStep(1);
  });

  backdrop?.addEventListener("click", () => {
    closeModal(modal);
    closeModal(settingsModal);
    form.reset();
    goStep(1);
  });

  /* ── Settings modal ─────────────────────────────────────── */

  const openSettingsModal = () => {
    const user = load();
    if (!user) return;

    const nameInput = $("[data-settings-name]");
    if (nameInput) nameInput.value = user.name;

    setChips($("[data-settings-homepage]"), [user.homepageView || "default"], false);
    setChips($("[data-settings-brands]"), user.preferredBrands || [], true);

    const sf = $("[data-settings-sale-first]");
    if (sf) sf.checked = !!user.showSaleFirst;

    openModal(settingsModal);
  };

  $("[data-settings-save]")?.addEventListener("click", () => {
    const user = load();
    if (!user) return;

    const nameInput = $("[data-settings-name]");
    if (nameInput) user.name = nameInput.value.trim() || user.name;

    const hp = readChips($("[data-settings-homepage]"));
    user.homepageView = hp[0] || "default";
    user.preferredBrands = readChips($("[data-settings-brands]"));
    user.showSaleFirst = $("[data-settings-sale-first]")?.checked || false;

    save(user);
    render();
    closeModal(settingsModal);
  });

  $("[data-settings-close]")?.addEventListener("click", () => closeModal(settingsModal));

  /* ── Homepage personalization ────────────────────────────── */

  const applyHomepagePrefs = () => {
    const user = load();
    if (!user || !document.querySelector(".page--home")) return;

    const view = user.homepageView;
    if (view === "default") return;

    const heroTitle = document.querySelector(".home-copy h1");
    const heroSub = document.querySelector(".home-copy p");
    const badge = document.querySelector(".announce-chip");

    const viewLabels = {
      "new-arrivals": { title: "New Arrivals", sub: "Your personalized feed — the latest drops curated for you." },
      sale: { title: "On Sale Now", sub: "Deals picked just for you — your favorites at the best prices." },
      footwear: { title: "Fresh Kicks", sub: "Your homepage, tuned to footwear. All the latest shoes in one place." },
      apparel: { title: "Apparel For You", sub: "Tops, hoodies, and more — curated to your taste." },
    };

    const label = viewLabels[view];
    if (label && heroTitle && heroSub) {
      heroTitle.innerHTML = label.title;
      heroSub.textContent = label.sub;
    }

    if (user.preferredBrands.length) {
      const brandMap = {
        vans: "Vans",
        hoka: "Hoka",
        "lady-white": "Lady White Co.",
        puma: "Puma",
        saucony: "Saucony",
        "dr-martens": "Dr. Martens",
        "velva-sheen": "Velva Sheen",
      };
      const names = user.preferredBrands.map((b) => brandMap[b] || b).join(", ");
      if (heroSub) {
        heroSub.textContent += ` Following: ${names}.`;
      }
    }

    if (badge && view !== "default") {
      const dot = badge.querySelector(".dot");
      badge.innerHTML = "";
      if (dot) badge.appendChild(dot);
      badge.append(`Personalized for ${user.name.split(" ")[0]}`);
    }
  };

  applyHomepagePrefs();

  window.addEventListener("august:profile-changed", () => {
    render();
    applyHomepagePrefs();
  });
});
