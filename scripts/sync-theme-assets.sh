#!/usr/bin/env bash
# Copy prototype CSS / JS / chrome icons into theme/assets (Shopify assets are flat).
# The repo-root css/ and js/ folders are the source of truth; theme/assets is
# generated and git-ignored. Run before `npm run theme:zip`.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/theme/assets"
mkdir -p "$dest"

cp -f "$root"/css/*.css "$dest/"
cp -f "$root"/js/*.js "$dest/"

# Chrome / fallback imagery referenced with `| asset_url` in Liquid.
# Product, brand-banner and AUX artwork come from Shopify (collections,
# section image pickers, blog featured images), not from here.
for f in favicon.svg icon-bag.svg footer-logo.svg avatar-demo.jpg og-image.jpg; do
  if [[ -f "$root/assets/$f" ]]; then
    cp -f "$root/assets/$f" "$dest/"
  fi
done

echo "Synced CSS, JS, and chrome icons → theme/assets"
echo "Next: npm run theme:zip   (or: shopify theme push --unpublished --path theme)"
