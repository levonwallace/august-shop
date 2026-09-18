# August Shop — iOS-native web UX prototype

Static HTML/CSS/JS prototype of the August V2 shop, engineered to feel like a
native iOS app in the browser and structured so it ports cleanly to Shopify
Liquid. **This is a website** — not an app — but every primitive is designed
around iOS conventions (safe-area, bottom tab bar, bottom sheets, segmented
controls, swipe-to-delete, spring-easing card stack, haptics).

## Run it

```bash
./scripts/dev.sh
# or
npm run dev
```

Starts a static server on `http://localhost:5173` and opens the browser.
Ctrl+C to stop. Uses only Python 3 (macOS default) — no Node deps required.

To view mobile pixels in Chrome/Safari DevTools, toggle the device toolbar
and pick **iPhone 15 Pro**. The layout is mobile-first from `≤900px` down.

## Pages

| File | Screen | iOS pattern |
|---|---|---|
| `index.html` | Home / Hero | Card stack (Wallet / App Switcher) |
| `collection.html` | PLP / New Arrivals | Filter & Sort bottom sheet |
| `product.html` | PDP / Detail | Segmented size selector · Add-to-bag sheet |
| `cart.html` | Cart / Checkout | Inset-grouped rows · Swipe-to-reveal Save/Remove |

## Structure (→ Shopify Liquid mapping)

Everything is split into files that map 1:1 to Shopify snippets/sections
when we port. Keep the split — it reduces diff surface during migration.

```
css/
  tokens.css      → theme settings / CSS variables (safe-area, colors, radii)
  base.css        → theme base (reset, iOS taps, hover-guard, text-size-adjust)
  components.css  → snippets: header, footer, product-card, announce-chip, …
  pages.css       → per-template layout (home / plp / pdp / cart)
  profile.css     → snippet: profile dropdown + settings modal
  cardstack.css   → snippet: home 3D stack (Wallet-style)
  sheet.css       → primitive: bottom sheet (filters, add-to-bag, profile)
  tabbar.css      → snippet: mobile UITabBar
  segmented.css   → primitive: UISegmentedControl (size, PDP tabs)

js/
  main.js         → sheet openers, tabs, mega menu, mobile nav
  sheet.js        → bottom-sheet controller (drag, focus trap, safe-area)
  segmented.js    → segmented-control controller (sliding thumb, keyboard)
  cart.js         → cart swipe-to-reveal + remove/save
  cardstack.js    → home card stack (drag, rubber-band, haptic)
  player.js       → August Radio persistent player
  profile.js      → profile state + mobile-sheet routing
  radiocard.js    → radio card interactions

page HTML         → Shopify template files (index / collection / product / cart)
assets/           → theme assets (swap for Shopify CDN / Files at port time)
```

## iOS conventions in play

- **Safe-area insets** — every chrome offset (`--header-top`, `--footer-inset`,
  `--chrome-*`) is composed with `env(safe-area-inset-*)`. Header ducks under
  the Dynamic Island; footer + tab bar float above the home indicator.
- **`viewport-fit=cover`** + `apple-mobile-web-app-*` meta tags on every page.
- **Tab bar** (`.tabbar`) at `≤900px`: Shop / Search / Bag (badge) / Profile,
  translucent w/ blur, sits above the home indicator.
- **Bottom sheet** (`.sheet`): drag-to-dismiss, grabber, focus trap, iOS
  card-presentation effect (parent page scales down + rounds).
- **Segmented control** (`.segmented`): sliding thumb w/ Apple's spring
  easing `cubic-bezier(0.32, 0.72, 0, 1)`.
- **Swipe-to-reveal** on cart lines with iOS Purple (Save) + Red (Remove).
- **Live-drag card stack** on home with rubber-band + spring + `navigator.vibrate`.
- **`@media (hover: hover)`** on every hover so buttons don't stick on tap.
- **`-webkit-tap-highlight-color: transparent`** + `touch-action: manipulation`
  globally.
- **`font-size: 16px`** on all inputs at `≤900px` to prevent iOS Safari
  auto-zoom on focus.

## Design tokens

```
--radius-pill: 100px         --shadow-island / -card / -soft
--radius-panel: 28px         --safe-top / -right / -bottom / -left
--radius-card: 16px          --header-top / --footer-inset / --chrome-*
```

## Not built yet

- Live totals recompute on cart remove (visual only for now)
- Real search / filter wiring (UI shell present, needs backend)
- PWA manifest + Add-to-Home-Screen icons
- Full dark mode (radio card is dark; palette not extended yet)

## Ports

- Figma source: [August-shop V2](https://www.figma.com/design/aePdBek6i0M5A15FuzEPte/August-shop?node-id=224-140)
