# August 2.0 — Liquid transfer brief

**For:** whoever is helping port the prototype onto Shopify  
**From:** Levon / August Shop  
**Date:** 12 Oct 2026  
**Status:** Superseded 12 Oct 2026. The "fork the live export" plan below was dropped — the Pipeline export is a clone of the current site. August 2.0 is built from this repo's prototype into `theme/` (see `theme/README.md`, `npm run theme:zip`). Kept for the live-theme analysis and the do-not-publish rules. Live [august-shop.com](https://august-shop.com) stays on the current theme until Mason signs off.

This file is the package. It is the analysis of the live theme export (9 Oct 2026), the transfer plan, and the rules. You do not need the Cursor chat to follow it.

---

## How to use this

1. Read **Hard rule** and **What we are looking at**.
2. Read **Strategy** — this is the decision.
3. Use **Phases** as the build order.
4. Use **Admin prep** for metafields before feed / player work.
5. Ignore the thin `theme/` scaffold in the repo as a replacement store. It is a first-pass skeleton only.

Local prototype (UX source of truth):

```bash
npm run dev
# http://127.0.0.1:5173
```

Live theme snapshot used for this plan:

`theme_export__august-shop-com-august-shop-main__09OCT2026-0634pm`  
(exported 9 Oct 2026, 6:34pm — “August Shop Main”)

---

## Hard rule

**Do not publish over the live Online Store theme.**

All Liquid work is a **draft / unpublished** theme named `August 2.0 draft`. Staff preview it. Customers never see it until a later cutover.

```bash
npm run theme:sync
shopify theme push --unpublished --path theme
```

Share the private preview link from Shopify Admin → Themes → … → Preview.

Cutover is only after the draft is signed off. Until then live is undisturbed.

---

## What we are looking at

There are **three** surfaces. They are not the same thing.

| Surface | What it is | Role |
| --- | --- | --- |
| **Prototype** | Static HTML/CSS/JS in this repo (`index.html`, `account.html`, `css/`, `js/`) | UX source of truth — iOS glass, card stack, swipe, new account, AUX player |
| **Live theme** | Pipeline 7.0.2 by Groupthought (the Oct 9 export) | Real shop — cart, variants, USF filters, apps, mixtape blogs, orders |
| **Draft `theme/`** | 36-file OS 2.0 scaffold already in the repo | Class-name preview only. **Not** a store. Publishing it would break the shop. |

### Live theme (keep this)

- Pipeline 7.0.2, Online Store 2.0: 88 sections, 173 snippets, 34 templates
- AJAX cart **drawer**, variant buttons + color swatches, inventory countdown
- Sibling colorways via `product.metafields.theme.siblings` / `theme.cutline`
- Collection + search owned by **USF** (Searchanise), not native Shopify filters
- Classic customer accounts + Sky Pilot digital downloads
- Mixes as blogs: `blog.mixtapes`, `article.mixtape` (SoundCloud widget `player_id`)
- Inn: `blog.inn`
- Apps that must stay: `content_for_header`, Klaviyo, Redo, Hoppn Infinite Color Search, Sezzle, Afterpay, Bold Special Offers, GTM
- Homepage already merchandised: New Arrivals, brand tiles, Nike slider, AUX Night columns, 414 State St store block

### Draft scaffold (do not replace live with this)

- Header has no mega menu, no mobile nav, no cart drawer
- Product form never updates the variant `id`
- Cart swipe never wires; no qty / discounts / Shop Pay
- Account is name/email only
- No AUX player
- `catalog.js` and `auxdata.js` still ship fake catalogs
- Assets are gitignored until `npm run theme:sync`

---

## Strategy

**Fork the Oct 9 live export into `theme/`, then overlay August 2.0 on top.**

Do not grow the 36-file stub into a store. Do not delete Pipeline commerce.

```
Keep from Pipeline                  Overlay from the prototype
─────────────────────────           ────────────────────────────
AJAX drawer cart                    Tokens + liquid glass
Variant form + swatches             Pill header / footer / tab bar
USF collection + search             Home two-axis card stack
Klaviyo, Redo, Sezzle, Afterpay     Last-card AUX player
Homepage merchandising              Instagram-style account
blog.mixtapes / article.mixtape     Swipe + feed prefs
customer-account + Sky Pilot
```

Skin Pipeline. Do not replace:

- `layout/theme.liquid` (keep `content_for_header`, header/footer groups, USF, theme JS)
- `sections/header.liquid` (cart drawer + predictive search live inside it)
- `snippets/product-buttons.liquid` (real add-to-cart)
- `blog.mixtapes` / `article.mixtape`
- `customer-account`

Load August CSS **after** Pipeline `theme.css` so glass / Helvetica / pills win on chrome without breaking forms.

---

## Phases

### 1 — Import and asset hygiene

- Copy the Oct 9 export over repo `theme/`.
- Keep live `config/settings_data.json` (homepage sections + app embeds).
- Merge August settings (announce, pickup, UI scale, offer) into Pipeline `settings_schema.json`. Do not replace the schema.
- Commit Pipeline assets (`theme.css`, `theme.dev.js`, `usf.js`). Ignore only synced prototype copies.
- Allowlist `theme:sync`. Do not copy `shopify.js` (local search proxy) or `auxdata.js`.
- Gate `catalog.js` PRODUCTS and the Levon demo seed so they never run when `AugustBootstrap.live`.

### 2 — Layout overlay

Edit live `layout/theme.liquid`. Add:

- August CSS variables + stylesheets after `theme.css`
- `window.AugustBootstrap` (customer `august.*` metafields + cart JSON)
- Tab bar section after footer
- Prototype scripts after Pipeline JS: `profile.js` → `shopify-bridge.js` → sheet / segmented / cardstack / swipe / account / radiocard / story

Do **not** load `cart.js` `placeOrder()` (mints fake `AUG-` orders).  
Do **not** load `auxdata.js`. Print mix/event JSON from Liquid.

### 3 — Chrome (skin, don’t replace)

- Restyle header/footer to glass islands (`--color-island`, `--glass-filter`, `--radius-pill`). Fully rounded pills, consistent top and bottom.
- Add Instagram-style mobile tab bar: Shop / Search / Bag / Account.
- Soften or hide the orange full-screen AUGUST loader on the draft.
- Port mega/mobile only if Pipeline’s split header cannot host the morph-menu. Prefer CSS wrappers over a rewrite.

### 4 — Cards, PDP, bag

- Teach Pipeline `product-grid-item` (or wrap it) to emit `.product-card` classes. Keep instant add, sibling swatches, sale badges.
- Skin USF results to the same card. Do not rip out USF.
- Keep Pipeline product form (`<product-form>`, Afterpay / Sezzle / Redo). Overlay August PDP chrome. Wire size buttons to the hidden variant `id`.
- Skin the cart drawer. Keep `theme:cart:*` + checkout POST. Swipe-to-remove only if it uses Pipeline line keys.

### 5 — Home card stack

New `section-card-stack.liquid` at the top of live `index.json`.  
Existing New Arrivals / brand tiles / Nike stay as later cards or below.  
**Last card is AUX**, not a product grid.

Two scrolls: inner page scroll, then page-to-page flip. Incoming card pins at top; leftover inertia is absorbed (~640ms in the prototype).

### 6 — AUX audio (do not flatten)

Audio is first-class. The player is **not** site-wide.

| Surface | Plays? | Today |
| --- | --- | --- |
| Home last card | Yes — one HTML5 player, no floating mini-player | Prototype `radiocard.js` + fake wavs |
| Mix detail | Yes — play/pause + seek | Prototype `story.js` |
| Mix archive / events | No | Links only |
| Live homepage AUX Night | No | Outbound SoundCloud page links |
| Live mixtape articles | SoundCloud widget iframe | `player_id` in featured-post settings |

Keep `blog.mixtapes` + `article.mixtape`. Kill `auxdata.js` on live — it invents titles (prototype 078 ≠ live “Tranquility Jordan”).

Unify the live split where featured 078–076 sit on blog `news` while the archive is `august-aux`.

**Player chrome to port**

- Play / pause
- Expand bar: seek, time, prev / next
- Decorative CSS waveform (not real audio data)
- 3×3 grid, **number-only** pagination, 9 per page
- Tiles navigate to the mix article — they do not play in-card
- Newsletter on the card → Shopify customer form / Klaviyo
- Pause when leaving card 4 (prototype currently does not)
- No floating mini-player anywhere

**Source prep (both, don’t pick a host yet)**

Liquid prints `soundcloud_track_id` and optional `audio_url`.  
Custom player uses `audio_url` when present.  
Otherwise the mix **article** falls back to the existing SoundCloud widget.  
Do **not** do `new Audio(soundcloud_stream)` — CORS will fail.

Inn stays `blog.inn`. Events stay a blog. No audio on event pages.

### 7 — New account experience (extend Pipeline, do not stub)

The new account is `account.html` — Instagram profile, not settings soup, not the draft stub.

**Keep from Pipeline:** real `customer.orders`, Sky Pilot, default address, order URLs.

**Add (match the prototype)**

- Square fit-pic avatar
- Name / email + settings **gear** at the top (no bottom Details card)
- Tabs: **Liked / Less / Orders** only. My feed is not a tab. No grey tab background.
- Homepage: one choice, Everything vs My feed. Filters (department / category / sale chips) only when My feed is on. Auto-save.
- Brands I follow: token field + search. Selected brands move into a neat row; the ocean of chips hides. Copy: we’ll notify when they upload. Notification backend is later.
- Pickup: **414 State St**, Madison. Map link first (Leaflet init is unfinished). Live hours: Mon–Sat 12–7, Sun 12–5.
- **No Sign out** on the account page. Logout stays in the header / profile sheet.

**Auth:** skin Pipeline login / register / activate / reset. Keep Shopify forms. Do not use the prototype create-account modal on live.

Demo Levon seed and fake `AUG-2417` orders must not ship.

---

## Admin prep (create before feed / player go live)

Namespace `august`. Storefront access **on**.

### Customer metafields

| Key | Type | Shape |
| --- | --- | --- |
| `homepage` | json | `{ "enabled": true, "department": "men", "category": "shoes", "saleOnly": true }` |
| `preferred_brands` | json | `["Vans", "Hoka"]` |
| `swipes` | json | `{ "likes": [], "skips": [], "items": [] }` |

`layout/theme.liquid` injects these as `window.AugustBootstrap.customer`.  
`js/shopify-bridge.js` already **reads** them. **Writes** need an app proxy — not in this pass. Until then, prefs stay in localStorage on the draft.

### Article metafields (mixes / events)

| Key | Type | Maps to |
| --- | --- | --- |
| `mix_number` | single line (`"078"`) | AUX number |
| `genre` | single line, or use tags | Tile subtitle |
| `soundcloud_track_id` | single line | Today’s widget `player_id` |
| `audio_url` | url, optional | Hosted file for the custom player |
| `series` / `venue` / `event_date` | on events | Event cards |

---

## Class names (do not rename)

CSS and JS bind to these. Liquid must keep them:

`.product-card` · `.site-header` · `.tabbar` · `.sheet` · `.home-lockup` · `.swipe-more` · `.card-stack` · `.radio-hero` · `.aux-tile` · `.account-head`

---

## What stays JS vs what Liquid replaces

| Prototype | Live Shopify |
| --- | --- |
| `catalog.js` product list | Collection / product JSON + USF |
| `AugustCart` localStorage | `/cart/add.js` via `shopify-bridge.js` |
| `AugustProfile` localStorage | Customer metafields `august.*` (read now, write later) |
| `orders.js` samples | `customer.orders` |
| Local search proxy | Predictive search + USF search page |
| `auxdata.js` fake 078–016 | `blogs['august-aux'].articles` |

Gestures stay JS: card stack, swipe, sheets, segmented controls, radio expand/seek.

---

## What we will not do in this pass

- Publish or push to the live theme
- Delete USF, app blocks, sibling metafields, Pipeline cart/product JS, or mixtape/Inn templates
- Ship `catalog.js` PRODUCTS or `auxdata.js` as the live catalog
- Finish metafield writes or brand-upload push notifications
- Rebuild New Customer Accounts
- Add a floating site-wide audio mini-player
- Replace login/register with the prototype modal

---

## Dates (from the Oct 2 web sync)

| When | What |
| --- | --- |
| Fri Oct 9 | Working session (done — live theme exported, this plan written) |
| Oct 16–23 | Staff play in the draft editor (Alex in Miami) |
| After that | Bug / schema week if needed |

Internal name: **August 2.0**. Green light from Mason was to start a **draft** theme, not to touch live.

---

## Done when

Unpublished preview shows:

- Real Pipeline products, variants, USF filters, and checkout
- August 2.0 glass chrome (white page, thin glass, pill nav)
- Home card stack; last card plays from **real** mixtape articles
- Mix / event / Inn templates skinned, not flattened
- Account: fit pic + Liked / Less / Orders + feed / brand prefs on top of real orders

Live august-shop.com is unchanged.

---

## Related files in this repo

| File | What |
| --- | --- |
| `shopify-draft.md` | Do-not-publish rule + metafield table |
| `theme/README.md` | Current scaffold map (will change after import) |
| `shopify.theme.toml` | CLI always `--unpublished` |
| `week-3-web-sync.md` | Oct 2 meeting notes (swipe, real catalog, draft-only) |
| `account.html` + `js/account.js` | New account UX |
| `index.html` card 4 + `js/radiocard.js` | AUX player UX |
| `js/shopify-bridge.js` | Ajax cart + metafield read adapter |

Theme export (not in git — attach separately if needed):

`theme_export__august-shop-com-august-shop-main__09OCT2026-0634pm`
