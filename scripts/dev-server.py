#!/usr/bin/env python3
"""August dev server — static files with caching disabled.

Browsers were serving stale JS/CSS from memory cache (python's stock
http.server sends Last-Modified and nothing else), which made edits look
like they "didn't work." no-store makes every reload fetch fresh code.
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    os.chdir(os.path.join(os.path.dirname(__file__), ".."))
    server = ThreadingHTTPServer(("", port), NoCacheHandler)
    print(f"Serving with no-store caching on :{port}")
    server.serve_forever()
