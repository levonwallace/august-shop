/* August — first-visit 10% offer
   Quiet capture (Tekla / Nordic Knots). Shown once per browser until dismissed.
   Storage: localStorage["august_offer_dismissed"]
   Re-show for testing: localStorage.removeItem("august_offer_dismissed") then reload. */
(() => {
  const STORAGE_KEY = "august_offer_dismissed";
  /* Theme: copy + timing come from Theme settings → Offer popup via
     window.AugustBootstrap.offer (layout/theme.liquid). */
  const CFG =
    (window.AugustBootstrap && window.AugustBootstrap.live && window.AugustBootstrap.offer) || null;
  const DELAY_MS = Number(CFG?.delay) > 0 ? Number(CFG.delay) : 1800;
  const SUCCESS_HOLD_MS = 2400;

  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const FOCUSABLE_SEL =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const isDismissed = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  };

  const persistDismissed = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode — still hide for this page */
    }
  };

  const COPY = {
    eyebrow: CFG?.eyebrow || "Welcome offer",
    heading: CFG?.heading || "10% off",
    lede: CFG?.lede || "Your first order — pickup on Williamson or checkout.",
    success: CFG?.success || `Code ${CFG?.code || "AUGUST10"} — applied at pickup or checkout.`,
    fine: CFG?.fine || "One use · new customers",
  };

  const markup = `
    <div class="offer__backdrop" data-offer-dismiss></div>
    <div class="offer__panel" role="document">
      <p class="offer__eyebrow">${esc(COPY.eyebrow)}</p>
      <h2 class="offer__title" id="offer-title">${esc(COPY.heading)}</h2>
      <p class="offer__lede">${esc(COPY.lede)}</p>
      <form class="offer__form" data-offer-form novalidate${CFG ? ' method="post" action="/contact#offer-popup"' : ""}>
        ${CFG ? '<input type="hidden" name="form_type" value="customer"><input type="hidden" name="utf8" value="✓"><input type="hidden" name="contact[tags]" value="newsletter,welcome-offer">' : ""}
        <label class="sr-only" for="offer-email">Email</label>
        <input id="offer-email" type="email" name="${CFG ? "contact[email]" : "email"}" inputmode="email" autocomplete="email" placeholder="Email" required />
        <button class="offer__join" type="submit">Join</button>
        <button class="offer__dismiss" type="button" data-offer-dismiss>No thanks</button>
      </form>
      <p class="offer__success" data-offer-success hidden aria-live="polite">${esc(COPY.success)}</p>
      <p class="offer__fine">${esc(COPY.fine)}</p>
    </div>
  `;

  const build = () => {
    if (document.getElementById("offer-popup")) return document.getElementById("offer-popup");
    const root = document.createElement("div");
    root.className = "offer";
    root.id = "offer-popup";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "offer-title");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = markup;
    document.body.appendChild(root);
    return root;
  };

  const focusables = (root) =>
    [...root.querySelectorAll(FOCUSABLE_SEL)].filter(
      (n) => !n.hasAttribute("hidden") && n.offsetParent !== null
    );

  let opener = null;
  let closeTimer = 0;

  const open = (root) => {
    if (root.classList.contains("is-open")) return;
    opener =
      document.activeElement && document.activeElement !== document.body
        ? document.activeElement
        : null;
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    const email = root.querySelector("#offer-email");
    requestAnimationFrame(() => {
      if (email && typeof email.focus === "function") {
        email.focus({ preventScroll: true });
      }
    });
  };

  const close = (root) => {
    if (!root.classList.contains("is-open")) return;
    persistDismissed();
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    if (opener && typeof opener.focus === "function") {
      opener.focus({ preventScroll: true });
    }
    opener = null;
  };

  const showSuccess = (root) => {
    persistDismissed();
    const form = root.querySelector("[data-offer-form]");
    const success = root.querySelector("[data-offer-success]");
    if (form) form.hidden = true;
    if (success) success.hidden = false;
    root.classList.add("is-success");
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => close(root), SUCCESS_HOLD_MS);
  };

  const bind = (root) => {
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-offer-dismiss]")) {
        e.preventDefault();
        close(root);
      }
    });

    const form = root.querySelector("[data-offer-form]");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type=email]");
      if (!input || !input.checkValidity()) {
        input?.reportValidity();
        input?.focus();
        return;
      }
      const join = form.querySelector(".offer__join");
      if (join) {
        join.textContent = "Joined";
        join.disabled = true;
      }
      // Theme: post to Shopify's customer form (creates/tags the customer)
      if (CFG) {
        const fd = new FormData(form);
        fetch("/contact", { method: "POST", body: fd, credentials: "same-origin" }).catch(() => {});
      }
      input.disabled = true;
      showSuccess(root);
    });

    document.addEventListener("keydown", (e) => {
      if (!root.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close(root);
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = focusables(root);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  };

  const init = () => {
    if (CFG && CFG.enabled === false) return;
    if (isDismissed()) return;
    const root = build();
    bind(root);
    window.setTimeout(() => {
      if (isDismissed()) return;
      if (document.querySelector(".sheet.is-open, .profile-sheet.is-open")) return;
      open(root);
    }, DELAY_MS);
  };

  window.AugustOffer = {
    key: STORAGE_KEY,
    reset() {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      window.location.reload();
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
