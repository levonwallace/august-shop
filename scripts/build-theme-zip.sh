#!/usr/bin/env bash
# Build an uploadable Shopify theme zip from /theme.
#
#   npm run theme:zip            → dist/august-2.1-liquid-theme.zip
#   npm run theme:zip -- ~/Desktop/out.zip
#
# Shopify rejects zips whose top level is a folder ("missing template
# layout/theme.liquid"), so we zip the *contents* of theme/, and skip
# the macOS resource forks Finder adds.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
out="${1:-$root/dist/august-2.1-liquid-theme.zip}"

bash "$root/scripts/sync-theme-assets.sh" >/dev/null

if command -v shopify >/dev/null 2>&1; then
  echo "→ shopify theme check"
  shopify theme check --path "$root/theme" --fail-level error >/dev/null 2>&1 || {
    echo "theme check reported errors — run: shopify theme check --path theme"; exit 1; }
fi

mkdir -p "$(dirname "$out")"
rm -f "$out"
(
  cd "$root/theme"
  zip -r -X -q "$out" \
    assets config layout locales sections snippets templates \
    -x "*.DS_Store" -x "__MACOSX/*" -x "*/.gitkeep"
)

# Sanity: the zip must contain layout/theme.liquid at its root.
if ! unzip -l "$out" | awk '{print $4}' | grep -qx "layout/theme.liquid"; then
  echo "✗ layout/theme.liquid is not at the zip root"; exit 1
fi

echo "✓ $(du -h "$out" | cut -f1)  $out"
echo "  Upload: Shopify admin → Online Store → Themes → Add theme → Upload zip file"
