# August 2.0 — Shopify theme

Online Store 2.0 theme generated from the prototype in the repo root. The
prototype HTML/CSS/JS is the UX source of truth; this folder is the Liquid
destination. **Never publish this over the live shop** — upload it as a
draft and share the preview link.

## How it is built

- `layout/theme.liquid` renders the same markup and class names as the
  prototype, then emits live data into `window.AugustBootstrap`
  (`live: true`, routes, customer, cart, products, mixes, events, store,
  offer). The prototype JS reads that instead of its sample data.
- `css/` and `js/` in the repo root are copied flat into `assets/` by
  `npm run theme:sync` (`assets/` is git-ignored — always regenerate).
- `js/august-live.js` (theme only) rewrites prototype hrefs to Shopify
  routes, wires predictive search, the PDP Ajax add-to-bag, and cart
  attributes. `js/shopify-bridge.js` maps the Ajax Cart API onto the
  prototype's `AugustCart`.

## Build + upload

```bash
npm run theme:check   # shopify theme check --path theme
npm run theme:zip     # sync assets, check, write dist/august-2.1-liquid-theme.zip
```

Shopify admin → Online Store → Themes → **Add theme → Upload zip file** →
pick `dist/august-2.1-liquid-theme.zip`. It lands as an unpublished theme. Use
**Customize** to edit, **Preview** for the share link.

The zip is built from the *contents* of this folder so `layout/theme.liquid`
sits at the zip root. Zipping the folder in Finder adds a wrapper directory
and Shopify rejects it (`missing template 'layout/theme.liquid'`).

## Render budget (why pages stayed blank / 404-looking in the editor)

Every product the page mentions is rendered twice — once as markup, once
as catalog JSON for the prototype JS — and Liquid stops rendering (the
footer group vanishes from the editor sidebar) when a page asks for too
much. Keep to this budget:

- `snippets/product-json-lite` for anything that repeats on every page:
  the mega-menu tiles (12 per panel) and the site-wide floor in
  `layout/theme.liquid` (24 products).
- `snippets/product-json` (full: tags, variants, metafields) only where
  the filters need it: the PLP / search (`per_page`, default 48) and the
  home feed (36).
- Never `paginate … by 250` a collection just to serialise it.

## Theme editor

- Non-home templates render inside `.page-scroll` (`layout/theme.liquid`);
  the home card stack scrolls itself.
- Section wrappers for header / footer / tab bar / home cover the `.page`
  stage (`theme-live.css`) so the editor can outline and scroll to them.
- In design mode a re-rendered chrome or home section reloads the preview
  (the prototype JS boots once); selecting a home card block jumps the
  stack to that card.

## Pre-loaded content

`config/settings_data.json` and the JSON templates are pre-filled from the
live store's theme export (9 Oct 2026), so the theme renders with real
content on first upload — no editor work needed to see it:

- Catalog handles: `all`, `new-arrivals`, `sale`, `footwear`, `apparel`,
  `accessories`, `objects`; blogs `august-aux` (mixes), `events`,
  `august-inn` (the Inn runs as a blog on the live store — its `inn`
  template is covered by `templates/blog.inn.json`).
- Home: hero grid from New Arrivals; shelves New Arrivals / Nike / AIAIAI /
  Sale; brand cards Stüssy, Saucony, Kardo, ASICS, Sorel × Needles, August
  with the live homepage imagery (`shopify://shop_images/...`); AUX card
  copy from the Mixtapes page; newsletter copy from the live footer.
- Header: navigation is the store's nested `main-menu` (Online Store →
  Navigation), exactly as on the live theme. Top-level items with children
  open the morph menu; grandchildren (Brands "123 - F/G - O/P - Z",
  Categories → Apparel / Footwear / …) render as the directory grid; items
  without children are plain links. "Menu item extras" blocks (matched by
  label: New Arrivals, Brands, Categories, Sale) only add product tiles /
  editorial card / "view all". Mobile promos Stüssy / ASICS / AUX / Inn.
- Footer: menu `shop` (Contact, Policies, Returns, Security) and the
  `socials` menu, same as the live footer. Theme settings → Social is the
  fallback if the `socials` menu is empty.
- Product data from the live store's `theme.*` metafields (see below) —
  colorway swatches, cutline, badges, Pre-order — plus the same app blocks
  as the live PDP / bag: Afterpay messaging, Sezzle widget, Redo try-on
  (product); Sezzle checkout + Afterpay (bag). App blocks render once the
  apps are installed on the store, which they already are.
- Templates carried over from the live theme: `page.contact` (page copy +
  native contact form) and the HireUp metaobject templates for Careers.
- Product tabs: live Contact / Shipping / Returns copy; final-sale note.
- Inn page: full copy, hero, amenities, Airbnb + VRBO links, 7 photos.
- Announcement "Free shipping on orders $225+", favicon, offer popup
  (`CLUB10`), store hours, SoundCloud ids for mixes 076–078.

Images referenced as `shopify://shop_images/<file>` resolve from the
store's Files library, so they only work on the August store itself.

## One-time checks after upload

1. Mixes 076–078 were posted to the `news` (Editorial) blog on the live
   store; move them to `august-aux` so they show in the AUX archive.
2. If a dedicated Inn *page* is preferred over the blog, create it, assign
   `page.august-inn`, and set Theme settings → Catalog → August Inn page.
3. **Theme settings → Pickup store** lat/lng and **Offer popup** code —
   create the matching `CLUB10` discount under Discounts.
4. Assign `page.contact` to the Contact page (Pages → Contact → Theme
   template) if Shopify does not keep the assignment on theme switch.
5. `august.*` metafields (below) are optional; everything falls back to
   title parsing. `theme.*` metafields already exist on the live store.

## What the content / sales team can edit

Everything with copy or imagery is a section setting or a block. Sections
are per template; theme settings are global.

| Where | Section | Editable |
| --- | --- | --- |
| Header (all pages) | **Header** | wordmark, menu label, search placeholder; `Mega panel` blocks (title, directory type, menu, "all" label/link, products collection, editorial label/title/CTA/link); `Promo` blocks (label, image, collection/link) for the mobile menu |
| Home | **Home card stack** | `Hero` (announcement, 4 lockup words + ink colors, grid title/tag, collection, count, statement); `Shelf` ×4 (title, collection, count, mobile count); `Brand` ×6 (title, collection, link, desktop/mobile image, CTA); `AUX` card (radio tagline, archive label, events heading, newsletter copy) |
| Collection / Sale | **Collection grid** | per page, intro text, filter sheet toggles (brands, dept, categories, price bands, sale) |
| Search | **Search results** | heading, idle copy, placeholder, empty text, same filter toggles |
| Product | **Product page** | thumb count, add-to-bag / sold-out labels, note, related shelf + collection, confirm sheet copy; `Ask AI` block; up to 5 `Tab` blocks (title + rich text) |
| Bag | **Bag** | heading, swipe hint, checkout label, pickup / ship labels + notes, empty state |
| AUX / Events blog | **Blog archive** | kicker, lead, per page, AUX/events defaults |
| Mix / Event article | **Article (mix / event)** | back labels, kicker, RSVP email + labels, "more" headings |
| August Inn | **August Inn page** | kicker, title, lead, hero, body; `Fact`, `Book link`, `Amenity`, `Photo` blocks |
| Footer | **Footer**, **Mobile tab bar** | logo, tagline, menu; tab labels, show radio |
| 404 / Password / Collections list | own sections | all copy |
| Theme settings | — | Brand (favicon, OG image, avatar), Catalog handles + SoundCloud id map, Social links, Colors, Typography & chrome (`ui_scale` %, radii), Announcement bar, Pickup store, Offer popup |

Hero grid tiles, shelves, mega-menu products and the PLP all come straight
from collections — merchandise in Shopify, not in the theme.

## Product tags (optional)

Department, category and type are inferred from the product title/type.
Override with tags when the guess is wrong:

- `dept:men` · `dept:women` · `dept:unisex`
- `cat:shoes` · `cat:apparel` · `cat:accessories` · `cat:objects`
- `type:sneakers` (free text, used for sub-filters)

## Metafields

### Live store (namespace `theme`) — already populated

These are the Pipeline theme's metafields the store has been using; the
theme reads them without any setup.

| Owner | Key | Type | Used for |
| --- | --- | --- | --- |
| Product | `cutline` | text | colorway name under the PDP title, card suffix, `Color` line-item property when the color is not in the title |
| Product | `siblings` | text (collection handle) | colorway swatches on the PDP — every product in that collection is one color of the style |
| Product | `badge` | text | card badge (also honours `_badge_New_in` style tags) |
| Product | `preorder` | boolean | "Pre-order" button + badge, `Sale type: Pre-order` line-item property |

### August 2.0 (namespace `august`) — optional

Create these in Settings → Custom data. Enable storefront access.

| Owner | Key | Type | Used for |
| --- | --- | --- | --- |
| Product | `short_description` | multi-line text | buy-box blurb (falls back to truncated description) |
| Article (AUX blog) | `mix_number`, `mix_title`, `genre` | text | tile + player labels |
| Article (AUX blog) | `audio_url` | URL | native player source |
| Article (AUX blog) | `soundcloud_track_id` | text | SoundCloud embed when no `audio_url` |
| Article (events blog) | `event_date` | date | card date / upcoming logic |
| Article (events blog) | `venue`, `series`, `ticket_url` | text / URL | facts + RSVP |
| Customer | `member_since` | date | "Member since" on account |
| Customer | `homepage`, `preferred_brands`, `swipes` | json | Your feed (see below) |

Customer JSON shapes:

```json
{ "enabled": true, "department": "men", "category": "shoes", "saleOnly": true }
["Vans", "Hoka"]
{ "likes": [], "skips": [], "items": [] }
```

Writes still need an app proxy; until then the feed persists in
`localStorage` per device.

## Page map

| Prototype | Theme |
| --- | --- |
| `index.html` | `templates/index.json` → `sections/home-card-stack.liquid` |
| `collection.html` / `sale.html` | `templates/collection.json` → `main-collection.liquid` |
| search | `templates/search.json` → `main-search.liquid` |
| `product.html` | `templates/product.json` → `main-product.liquid` |
| `cart.html` | `templates/cart.json` → `main-cart.liquid` |
| `aux.html` / `events.html` | `templates/blog.json` → `main-blog.liquid` |
| `mix.html` / `event.html` | `templates/article.json` → `main-article.liquid` |
| `inn.html` | `templates/page.august-inn.json` → `page-inn.liquid` |
| `account.html`, `login.html`, `order.html` | `templates/customers/*.liquid` |
| header / footer / tab bar | `sections/header-group.json`, `footer-group.json` |

## Class names

Do not rename `.product-card`, `.site-header`, `.tabbar`, `.sheet`,
`.home-lockup`, `.card-stack`, `.swipe-more`, `.plp-main`, `.buy-box`.
CSS and JS bind to these; the Liquid uses the prototype classes verbatim.
