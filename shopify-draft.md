# August 2.0 — draft theme (do not publish)

This prototype is not a Shopify theme. Live august-shop.com stays on the current published theme until Mason signs off.

## Rule

Do not replace the published Online Store theme. All Liquid work happens on a **draft theme**. Staff preview it. Customers never see it until a later cutover.

## Setup (when theme repo exists)

1. Duplicate the live theme in Shopify Admin → Online Store → Themes → … → Duplicate. Rename the copy `August 2.0 draft`.
2. Connect the theme via Shopify CLI (`shopify theme push --unpublished`) or GitHub integration onto that draft only.
3. Share a **private preview link** (Theme → … → Preview) in the production doc. Staff do not need to live in Admin to review.
4. Uploaders / art directors use **Edit default theme content** and the theme editor on the draft to try schemas.
5. Page speed (milliseconds) is a separate track after first preview.

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
