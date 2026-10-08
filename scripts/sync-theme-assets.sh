#!/usr/bin/env bash
# Copy prototype CSS / JS / icons into theme/assets (Shopify assets are flat).
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/theme/assets"
mkdir -p "$dest"

cp -f "$root"/css/*.css "$dest/"
cp -f "$root"/js/*.js "$dest/"

for f in favicon.svg icon-bag.svg footer-logo.svg avatar-demo.jpg; do
  if [[ -f "$root/assets/$f" ]]; then
    cp -f "$root/assets/$f" "$dest/"
  fi
done

echo "Synced CSS, JS, and chrome icons → theme/assets"
echo "Next: shopify theme push --unpublished --path theme"
