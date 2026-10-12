# August × Scissor — Week 3/4 web sync

**Oct 2, 2026** · Franklin Wallace, Alexander DeWahl, Mason Henderson

Goal was a green flag to start Shopify development. Mason reviewed the prototype with staff first.

## Green light

Start Shopify theme development. Live store stays untouched. Staff will preview a draft theme, not the published site. Catalog data is the reason to move — the prototype cannot fake live inventory any longer.

| When | What |
| --- | --- |
| Now | Design pass + start draft theme setup |
| ~~Fri Oct 9~~ | Working session (done — live theme exported, transfer brief written) |
| **Wed Oct 14** | Next meeting — in person, Scissor Studio HQ, 373 Broadway STE 522, New York, NY 10013 |
| Oct 16–23 | Staff play in draft editor (Alex in Miami) |
| After that | Bug / schema week if needed |

> Scheduling drifted after Oct 2 — we are in week 6 but on track. The Nov 9 date in the Gemini notes was a transcription error for Oct 9.

- **Live shop:** undisturbed. New work lives in a draft theme.
- **Internal name:** August 2.0

## What Mason and staff asked for

### Tinder swipe on products

Staff framed mobile as Instagram + TikTok + Pinterest + Tinder. While scrolling, a Hoka (or any brand) can be swiped right to collect interest and jump into similar products, or swiped left to show less. That data trains Your feed. Alex called it a good add-on to the system already planned for first-time vs returning users.

### Everything must be the real shop

Desktop felt straightforward. The sample catalog confused staff — they kept needing the “this is a demo” reminder. Everything should show current availability from Shopify, the same way the live site updates today. Your feed is derived from that catalog by size, availability, and later swipe / preference logic. Admins only maintain Everything.

### Ambient background

Mixed staff reactions. Mason was indifferent at first, then into it as a nostalgic curiosity hook (DVD-logo bounce / screen time). Some wanted the palette folded into the UI instead. Color should still come from products. Treat it as a work in progress: push the screensaver-like hold, or remove it. Not a hill to die on.

## Design pass before Liquid gets messy

Alex and Franklin listed these before Mason joined. Do this pass, then push into the draft theme.

| Surface | Note | Owner |
| --- | --- | --- |
| Homepage | Another routed design pass. Your feed should feel more feed-like on desktop; Everything is the standardized shop for guests. | Design |
| Mixes + events | Events barely exist. Design mixes, events list, and the event detail page. | Design |
| Mega menu | Too small on desktop. Enlarge it. Sale can stay in the menu. | Design |
| Account / onboarding | Account modal should be more obvious. First-time and returning visitors need a more instinctive path. | Design |
| Search | Keep the persistent search bar. Suggest categories at the top (ASICS → view all ASICS, jeans → jeans collection), not only the first matching SKUs. | Prototype |
| Footer | Shop and Explore currently go to the same page. Keep Shop. Then Help and August Inn. Another pass on newsletter + the 10% off popup (Tekla / Nordic Knots style). | Design |
| August Inn + bag | Inn is already better than the live site. One more pass to shake residual AI. Bag is tight; give it another pass. | Design |

## How Shopify work will actually run

Online Store → current published theme stays live. New work lives in a draft theme. Staff preview via theme preview and Edit default theme content. Page speed is a separate track. Schema / editor tools can be fussy — budget a buffer week if editability slips.

Alex will keep a private preview link so Mason’s team does not have to live in the Shopify admin to review.

## Production follow-through

- [x] Mega menu scale + account onboarding
- [x] Routed homepage (feed vs everything)
- [x] Prototype Tinder-style swipe on product cards to train Your feed (right = similar, left = less)
- [x] Everything feed = live Shopify availability (Liquid collections → `AugustBootstrap.products`; verify on the draft theme after upload)
- [x] Events + mix pages
- [x] Search typeahead: category / brand jumps above SKU hits (ASICS, jeans)
- [x] Collapse Explore + 10% popup + newsletter (`august_offer_dismissed`)
- [x] Polish Inn + bag
- [x] Ambient background: pushed nostalgic corner-to-corner roam (still paper-clear; can kill later)
- [x] Draft-theme plan written in `shopify-draft.md` — do not publish over live
- [x] Alex updates the production document and the demo once more, then move notes onto the draft theme

## Status — Oct 12

- Final demo pass shipped: grey-frosted "dock" glass on the mobile header + tab bar, constant 6px corner across the desktop zoom (`--ui-zoom`).
- Direction change: the Pipeline 7.0.2 export (Oct 9) turned out to be a clone of the current site, not a base for August 2.0. **The theme is now built from this repo.** `august-2.0-liquid-transfer.md` is kept for reference only.
- `theme/` is a complete OS 2.0 theme generated from the prototype: same markup, CSS and JS; Liquid feeds live collections, cart, customer, blogs and pages into the prototype scripts via `window.AugustBootstrap`. `shopify theme check` passes (2 non-blocking warnings).
- Editor surface for the content/sales team: every copy/image area is a section setting or block — header mega panels + mobile promos, home hero / shelves / brand cards / AUX card, PLP + search filters, PDP tabs + Ask AI + labels, bag copy, blog + article copy, August Inn page, footer, tab bar, 404, password, plus theme settings for Catalog handles, Colors, Typography, Announcement, Pickup store and the 10% Offer popup. Guide: `theme/README.md`.
- Zip is built by `npm run theme:zip` → `dist/august-2.0-theme.zip` with `layout/theme.liquid` at the zip root (the Oct 9 failure was a macOS folder-zip).
- [ ] Upload `dist/august-2.0-theme.zip` as **August 2.0** (unpublished), run the one-time setup in `theme/README.md` (Catalog handles, `page.august-inn` template, pickup store, footer menu, `august.*` metafields), then paste the private preview link here:
  - Preview link: _(add after upload)_
- [ ] Wed Oct 14 (NYC): walk Mason's team through Customize on the draft theme; collect schema gaps for the Oct 16–23 staff week.

---

Source: August × Scissor Studio Web Sync Week 3/4 transcript · Oct 2, 2026 · 56m. Off-topic personal conversation omitted.
