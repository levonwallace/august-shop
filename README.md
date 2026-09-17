# August Shop — UX Prototype

Static HTML/CSS prototype of the August V2 Figma redesign. Built for design/UX review and easy porting to Shopify Liquid.

## Run

```bash
cd august-shop
python3 -m http.server 5173
```

Open http://localhost:5173

## Pages

| File | Screen |
|---|---|
| `index.html` | Home / Hero |
| `collection.html` | PLP / New Arrivals |
| `product.html` | PDP / Detail |
| `cart.html` | Cart / Checkout |

## Structure (Liquid mapping)

- `css/tokens.css` → theme settings / CSS variables
- `css/components.css` → snippets (`header`, `footer`, `product-card`, `announce-chip`, …)
- page HTML → section / template files
- `assets/` → theme assets (swap for Shopify CDN / Files)

## Notes

- Desktop-first at 1440px
- Responsive breakpoints: ≤1280 (tablet landscape), ≤900 (mobile header + stacked layouts), ≤560 / ≤380 (phone refinements)
- Sticky pill header + slide-down nav drawer on mobile
- No build step, no Tailwind/React — keep diffs small when translating to Liquid
- Figma source: [August-shop V2](https://www.figma.com/design/aePdBek6i0M5A15FuzEPte/August-shop?node-id=224-140)
