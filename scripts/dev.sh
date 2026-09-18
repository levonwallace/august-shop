#!/usr/bin/env bash
# August dev server — static prototype (pre-Shopify)
# Run:  ./scripts/dev.sh  (or:  npm run dev  once we add package.json)
set -euo pipefail

# Resolve project root so this works from anywhere
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-5173}"

# Kill any previous server on this port so ports don't leak between runs
if lsof -ti tcp:"$PORT" >/dev/null 2>&1; then
  echo "→ Killing existing process on :$PORT"
  lsof -ti tcp:"$PORT" | xargs kill -9 2>/dev/null || true
  sleep 0.2
fi

URL="http://localhost:$PORT/index.html"
echo "──────────────────────────────────────────────"
echo "  August Shop — dev server"
echo "  Serving  $ROOT"
echo "  URL:     $URL"
echo "  Pages:   index · collection · product · cart"
echo ""
echo "  Ctrl+C to stop."
echo "──────────────────────────────────────────────"

# Give the server a beat, then open the browser
( sleep 0.6 && open "$URL" ) &

# Prefer python3 (macOS default). Fall back to python if only 2.x present.
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
  exec python -m SimpleHTTPServer "$PORT"
else
  echo "✗ Neither python3 nor python is installed." >&2
  exit 1
fi
