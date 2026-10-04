# August × Scissor — Week 3/4 web sync

**Oct 2, 2026** · Franklin Wallace, Alexander DeWahl, Mason Henderson

Goal was a green flag to start Shopify development. Mason reviewed the prototype with staff first.

## Green light

Start Shopify theme development. Live store stays untouched. Staff will preview a draft theme, not the published site. Catalog data is the reason to move — the prototype cannot fake live inventory any longer.

| When | What |
| --- | --- |
| Now | Design pass + start draft theme setup |
| Fri Oct 9 | Next working session |
| Oct 16–23 | Staff play in draft editor (Alex in Miami) |
| After that | Bug / schema week if needed |

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

- [ ] Routed homepage (feed vs everything), mega menu scale, account onboarding, events + mix pages
- [ ] Prototype Tinder-style swipe on product cards to train Your feed (right = similar, left = less)
- [ ] Everything feed = live Shopify availability; Your feed derives from that catalog
- [ ] Search typeahead: category / brand jumps above SKU hits (ASICS, jeans)
- [ ] Collapse Explore, polish Inn + bag, design 10% off popup + newsletter
- [ ] Decide ambient background: push nostalgic motion or kill it after one more staff look
- [ ] Spin up draft theme, private preview link, do not publish over live
- [ ] Alex updates the production document and the demo once more, then move notes onto the draft theme

---

Source: August × Scissor Studio Web Sync Week 3/4 transcript · Oct 2, 2026 · 56m. Off-topic personal conversation omitted.
