# August 2.0 draft theme

Online Store 2.0 scaffold. **Never publish this over the live shop.**
Push unpublished and share a preview link. See `/shopify-draft.md`.

The static HTML prototype in the repo root is still the UX source of truth.
This folder is the Liquid destination.

## First push

```bash
npm run theme:sync
shopify theme push --unpublished --path theme
```

CLI config lives at `/shopify.theme.toml`. `theme:sync` copies `css/`, `js/`, and chrome icons into `theme/assets/` (Shopify assets are a flat folder).

## Page map

| Prototype | Theme |
| --- | --- |
| `index.html` | `templates/index.json` + `sections/home-hero.liquid` |
| `collection.html` / `sale.html` | `templates/collection.json` |
| `product.html` | `templates/product.json` |
| `cart.html` | `templates/cart.json` |
| `account.html` | `templates/customers/account.liquid` |
| `inn.html` | `templates/page.json` (page handle `august-inn`) |
| `aux.html` / `events.html` | `templates/blog.json` + `article.json` |
| Header / footer / tab bar | `sections/header.liquid`, `footer.liquid`, `tabbar.liquid` |
| Product card | `snippets/product-card.liquid` ← `js/catalog.js` `cardHtml()` |
| Tokens | `snippets/css-variables.liquid` + `config/settings_schema.json` |

## What stays JS

Keep these assets; they have no Shopify dependency besides class names:

- `sheet.js`, `segmented.js`, `cardstack.js`, `swipe.js`, `cart.js` (gestures)
- `main.js` (mega / mobile nav)
- `shopify-bridge.js` (Ajax Cart + customer metafields → existing APIs)

## What Liquid replaces

| Prototype | Live |
| --- | --- |
| `js/catalog.js` product list | Collection / product JSON |
| `AugustCart` localStorage | `/cart/add.js`, `/cart.js` via the bridge |
| `AugustProfile` localStorage | Customer metafields `august.*` |
| `js/orders.js` samples | `customer.orders` |
| Search proxy `scripts/dev-server.py` | Predictive search / `routes.search_url` |

## Customer metafields

Namespace `august`. Enable storefront access.

| Key | Type | Shape |
| --- | --- | --- |
| `homepage` | json | `{ "enabled": true, "department": "men", "category": "shoes", "saleOnly": true }` |
| `preferred_brands` | json | `["Vans", "Hoka"]` |
| `swipes` | json | `{ "likes": [], "skips": [], "items": [] }` |

`layout/theme.liquid` injects them as `window.AugustBootstrap`. Writes still need an app proxy — not in this pass.

## Class names

Do not rename `.product-card`, `.site-header`, `.tabbar`, `.sheet`, `.home-lockup`, `.swipe-more`. CSS and JS bind to these. Liquid snippets already use the prototype classes.
