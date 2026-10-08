# August 2.0 — draft theme (do not publish)

This prototype is not a Shopify theme. Live august-shop.com stays on the current published theme until Mason signs off.

## Rule

Do not replace the published Online Store theme. All Liquid work happens on a **draft theme**. Staff preview it. Customers never see it until a later cutover.

## Setup (when you have CLI access)

```bash
npm run theme:sync
shopify theme push --unpublished --path theme
```

The scaffold lives in `/theme`. Duplicate nothing on the live theme. Share the **private preview link** from Theme → … → Preview.

1. Duplicate is optional — `--unpublished` creates a draft. Rename it `August 2.0 draft`.
2. Or connect GitHub integration onto that draft only.
3. Uploaders / art directors use **Edit default theme content** and the theme editor on the draft to try schemas.
4. Page speed (milliseconds) is a separate track after first preview.

## Customer metafields (create in Admin before homepage prefs go live)

Namespace `august`, storefront access on:

| Key | Type |
| --- | --- |
| `homepage` | json |
| `preferred_brands` | json |
| `swipes` | json |

Shape is documented in `theme/README.md`.

## What staff should expect

| Surface | Source of truth |
| --- | --- |
| Everything feed | Live catalog / availability (same products they already upload) |
| Your feed | Derived from Everything + customer prefs / later swipe data |
| Events, mixes, Inn | Theme sections, still draft |
| 10% popup, newsletter | Theme settings, draft only |

## Dates

- **Fri Oct 9** — next working session
- **Oct 16–23** — staff play in the draft editor (Alex in Miami)
- Buffer week after that if schemas / editability slip

## Cutover

Only after the draft preview is signed off: publish the draft theme. Until then the live shop is undisturbed.
