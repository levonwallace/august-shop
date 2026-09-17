/* Tiny interactions for the UX prototype */
document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-mobile-nav]");
  if (toggle && panel) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      panel.hidden = !open;
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };
    setOpen(false);
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // Expanding mega menu (island-morph-card)
  const header = document.querySelector(".site-header");
  const morph = document.querySelector("[data-morph-menu]");
  const backdrop = document.querySelector("[data-mega-backdrop]");
  const megaTriggers = document.querySelectorAll("[data-mega-trigger]");
  const megaClose = document.querySelectorAll("[data-mega-close]");
  const megaLabel = document.querySelector("[data-mega-label]");
  const megaLinks = document.querySelector("[data-mega-links]");
  const megaAll = document.querySelector("[data-mega-all]");

  const megaPanels = {
    "new-arrivals": {
      label: "New Arrivals",
      all: "Shop all new arrivals →",
      links: ["This Week", "Footwear", "Apparel", "Accessories", "Restocks", "Just Dropped"],
    },
    brands: {
      label: "Brands",
      all: "View all brands →",
      links: ["Vans", "Hoka", "Lady White Co.", "Puma", "Saucony", "Velva Sheen", "Dr. Martens"],
    },
    "shop-by-color": {
      label: "Shop by Color",
      all: "Browse all colors →",
      links: ["Black", "White", "Navy", "Olive", "Brown", "Grey", "Multi"],
    },
    sale: {
      label: "Sale",
      all: "Shop all sale →",
      links: ["Up to 20% off", "Up to 40% off", "Final sale", "Footwear sale", "Apparel sale"],
    },
  };

  const headerDesktop = document.querySelector(".header-desktop");

  const setMegaOpen = (open, section) => {
    if (!header || !morph) return;
    header.classList.toggle("is-mega-open", open);
    document.body.classList.toggle("mega-open", open);
    morph.setAttribute("aria-hidden", String(!open));
    if (headerDesktop) {
      if (open) headerDesktop.setAttribute("inert", "");
      else headerDesktop.removeAttribute("inert");
    }
    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.setAttribute("aria-hidden", String(!open));
    }

    megaTriggers.forEach((btn) => {
      const active = open && btn.getAttribute("data-mega-trigger") === section;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-expanded", String(active));
    });

    if (open && section && megaPanels[section]) {
      const data = megaPanels[section];
      if (megaLabel) megaLabel.textContent = data.label;
      if (megaAll) megaAll.textContent = data.all;
      if (megaLinks) {
        megaLinks.innerHTML = data.links
          .map((label) => `<a href="collection.html">${label}</a>`)
          .join("");
      }
    }
  };

  megaTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.getAttribute("data-mega-trigger");
      const already =
        header.classList.contains("is-mega-open") &&
        btn.getAttribute("aria-expanded") === "true";
      setMegaOpen(!already, section);
    });
  });

  megaClose.forEach((btn) => {
    btn.addEventListener("click", () => setMegaOpen(false));
  });

  if (backdrop) {
    backdrop.addEventListener("click", () => setMegaOpen(false));
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMegaOpen(false);
  });

  // Size pills + gallery thumbs
  document.querySelectorAll("[data-size-group], .pdp-thumbs").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn || !group.contains(btn)) return;
      group.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  // Tabs
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const buttons = root.querySelectorAll("[data-tab]");
    const panels = root.querySelectorAll("[data-panel]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-tab");
        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
        panels.forEach((p) => p.classList.toggle("is-active", p.getAttribute("data-panel") === id));
      });
    });
  });

});
