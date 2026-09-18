/* August — iOS Segmented Control controller
   Automatically wires every [data-segmented] element on the page.
   The sliding thumb transforms to match the active segment's position + width.

   Emits `segmented:change` on the root when the active segment changes:
     detail: { value: <string|null>, index: <number>, previousIndex: <number> }
   `value` is read from data-value on the segment, falling back to text content.
   Programmatic API:  el.setActive(index) or el.setActive(valueString)
*/
(() => {
  const wire = (root) => {
    if (root.dataset.segmentedWired === "1") return;
    root.dataset.segmentedWired = "1";

    let thumb = root.querySelector(".segmented__thumb");
    if (!thumb) {
      thumb = document.createElement("span");
      thumb.className = "segmented__thumb";
      thumb.setAttribute("aria-hidden", "true");
      root.insertBefore(thumb, root.firstChild);
    }
    const segments = [...root.querySelectorAll(".segmented__segment")];
    if (!segments.length) return;

    let activeIndex = Math.max(
      0,
      segments.findIndex((s) => s.classList.contains("is-active"))
    );

    const position = (index, animated = true) => {
      const target = segments[index];
      if (!target) return;
      const targetRect = target.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const rootStyle = getComputedStyle(root);
      const padLeft = parseFloat(rootStyle.paddingLeft) || 0;

      const x = targetRect.left - rootRect.left - padLeft;
      const w = targetRect.width;
      if (!animated) {
        const prev = thumb.style.transition;
        thumb.style.transition = "none";
        thumb.style.transform = `translateX(${x}px)`;
        thumb.style.width = `${w}px`;
        // force reflow, then restore
        void thumb.offsetHeight;
        thumb.style.transition = prev;
      } else {
        thumb.style.transform = `translateX(${x}px)`;
        thumb.style.width = `${w}px`;
      }
    };

    const setActive = (target, opts = {}) => {
      const { silent = false, animated = true } = opts;
      let idx;
      if (typeof target === "number") idx = target;
      else if (typeof target === "string") {
        idx = segments.findIndex(
          (s) =>
            s.dataset.value === target ||
            s.textContent.trim().toLowerCase() === target.toLowerCase()
        );
      } else if (target instanceof Element) {
        idx = segments.indexOf(target);
      }
      if (idx == null || idx < 0 || idx >= segments.length) return;
      if (idx === activeIndex) {
        position(idx, animated);
        return;
      }
      const prev = activeIndex;
      activeIndex = idx;
      segments.forEach((s, i) => {
        const on = i === idx;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-checked", String(on));
        // Keyboard focus follows selection for role="radio"
        s.tabIndex = on ? 0 : -1;
      });
      position(idx, animated);

      if (!silent) {
        const seg = segments[idx];
        root.dispatchEvent(
          new CustomEvent("segmented:change", {
            bubbles: true,
            detail: {
              value: seg.dataset.value ?? seg.textContent.trim(),
              index: idx,
              previousIndex: prev,
            },
          })
        );
      }
    };

    // Click / tap
    root.addEventListener("click", (e) => {
      const seg = e.target.closest(".segmented__segment");
      if (!seg || !root.contains(seg)) return;
      setActive(seg);
    });

    // Keyboard support (arrow keys inside a radiogroup)
    root.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      let next = activeIndex;
      if (e.key === "ArrowLeft") next = (activeIndex - 1 + segments.length) % segments.length;
      else if (e.key === "ArrowRight") next = (activeIndex + 1) % segments.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = segments.length - 1;
      setActive(next);
      segments[next].focus();
    });

    // Initial position + reflow on resize
    const settle = () => {
      position(activeIndex, false);
      root.classList.add("is-ready");
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", settle, { once: true });
    } else {
      // Fonts may not be measured yet; wait for one frame
      requestAnimationFrame(settle);
    }

    const ro = new ResizeObserver(() => position(activeIndex, false));
    ro.observe(root);

    // Update tabIndex on load
    segments.forEach((s, i) => (s.tabIndex = i === activeIndex ? 0 : -1));

    // Expose per-element API
    root.setActive = setActive;
  };

  const init = () => {
    document.querySelectorAll("[data-segmented]").forEach(wire);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose global for dynamically-added controls
  window.Segmented = { wire, init };
})();
