#!/usr/bin/env python3
"""August dev server — static files + a thin Shopify proxy.

Browsers cannot call august-shop.com from localhost (CORS), so /api/*
forwards search and product lookups to the live store. The catalog is
cached from products.json so full-text search can return more than the
10-item Shopify suggest cap.
"""
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


SHOP = "https://august-shop.com"
UA = "AugustPrototype/1.0 (local search proxy)"
HTML_TAG = re.compile(r"<[^>]+>")
CACHE_LOCK = threading.Lock()
PRODUCTS = []
PRODUCTS_BY_HANDLE = {}
CACHE_READY = False


def shop_get(path_qs, timeout=12):
    req = urllib.request.Request(
        SHOP + path_qs,
        headers={"User-Agent": UA, "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return json.loads(res.read().decode("utf-8"))


def strip_html(s):
    if not s:
        return ""
    return re.sub(r"\s+", " ", HTML_TAG.sub(" ", s)).strip()


def tags_of(p):
    tags = p.get("tags") or []
    if isinstance(tags, str):
        return [t.strip() for t in tags.split(",") if t.strip()]
    return list(tags)


def img_src(url):
    if not url:
        return ""
    if url.startswith("//"):
        return "https:" + url
    return url


def infer_dept(tags, title=""):
    blob = " ".join(tags + [title]).lower()
    if "women" in blob:
        return "women"
    if "men" in blob:
        return "men"
    return "unisex"


def infer_cat(tags, ptype=""):
    blob = " ".join(tags + [ptype]).lower()
    if re.search(r"sneaker|footwear|shoe|boot|sandal|slipper", blob):
        return "shoes"
    if re.search(r"hat|bag|wallet|sock|jewel|accessori", blob):
        return "accessories"
    return "apparel"


def sizes_from(p):
    for opt in p.get("options") or []:
        if str(opt.get("name") or "").lower() == "size":
            return list(opt.get("values") or [])
    return []


def normalize_catalog(p):
    tags = tags_of(p)
    images = [img_src(i.get("src")) for i in (p.get("images") or []) if i.get("src")]
    variants = p.get("variants") or []
    price = 0.0
    compare = None
    if variants:
        try:
            price = float(variants[0].get("price") or 0)
        except (TypeError, ValueError):
            price = 0.0
        raw = variants[0].get("compare_at_price")
        try:
            compare = float(raw) if raw else None
        except (TypeError, ValueError):
            compare = None
    handle = p.get("handle") or ""
    title = p.get("title") or ""
    return {
        "id": "h:" + handle,
        "handle": handle,
        "title": title,
        "brand": p.get("vendor") or "",
        "price": price,
        "compare": compare if compare and compare > price else None,
        "sale": bool((compare and compare > price) or "Sale" in tags),
        "img": images[0] if images else "",
        "images": images,
        "tags": tags,
        "type": p.get("product_type") or "",
        "dept": infer_dept(tags, title),
        "cat": infer_cat(tags, p.get("product_type") or ""),
        "body": strip_html(p.get("body_html") or ""),
        "sizes": sizes_from(p),
    }


def normalize_suggest(p):
    tags = tags_of(p)
    handle = p.get("handle") or ""
    title = p.get("title") or ""
    try:
        price = float(p.get("price") or 0)
    except (TypeError, ValueError):
        price = 0.0
    try:
        compare = float(p.get("compare_at_price_max") or 0)
    except (TypeError, ValueError):
        compare = 0.0
    img = img_src(p.get("image") or (p.get("featured_image") or {}).get("url"))
    return {
        "id": "h:" + handle,
        "handle": handle,
        "title": title,
        "brand": p.get("vendor") or "",
        "price": price,
        "compare": compare if compare > price else None,
        "sale": bool(compare > price or "Sale" in tags),
        "img": img,
        "images": [img] if img else [],
        "tags": tags,
        "type": p.get("type") or "",
        "dept": infer_dept(tags, title),
        "cat": infer_cat(tags, p.get("type") or ""),
        "body": strip_html(p.get("body") or ""),
        "sizes": [],
    }


def normalize_ajax(p):
    handle = p.get("handle") or ""
    title = p.get("title") or ""
    tags = tags_of(p)
    images = [img_src(src) for src in (p.get("images") or [])]
    feat = img_src(p.get("featured_image") or "")
    if feat and feat not in images:
        images.insert(0, feat)
    price = float(p.get("price") or 0) / 100.0
    raw_c = p.get("compare_at_price")
    compare = float(raw_c) / 100.0 if raw_c else None
    return {
        "id": "h:" + handle,
        "handle": handle,
        "title": title,
        "brand": p.get("vendor") or "",
        "price": price,
        "compare": compare if compare and compare > price else None,
        "sale": bool((compare and compare > price) or "Sale" in tags),
        "img": images[0] if images else "",
        "images": images,
        "tags": tags,
        "type": p.get("type") or "",
        "dept": infer_dept(tags, title),
        "cat": infer_cat(tags, p.get("type") or ""),
        "body": strip_html(p.get("description") or ""),
        "sizes": sizes_from(p),
    }


def haystack(p):
    return " ".join(
        [
            p.get("title") or "",
            p.get("brand") or "",
            p.get("type") or "",
            p.get("handle") or "",
            " ".join(p.get("tags") or []),
            p.get("body") or "",
        ]
    ).lower()


def score_product(p, q, tokens):
    hay = haystack(p)
    title = (p.get("title") or "").lower()
    brand = (p.get("brand") or "").lower()
    score = 0
    if q and q in hay:
        score += 12
    if q and q in title:
        score += 16
    if q and q in brand:
        score += 10
    for t in tokens:
        if t in title:
            score += 6
        elif t in brand:
            score += 4
        elif t in hay:
            score += 2
    return score


def brand_key(name):
    return re.sub(r"[^a-z0-9]+", "", (name or "").lower())


def filter_brand(brand, limit):
    key = brand_key(brand)
    if not key:
        return []
    out = []
    with CACHE_LOCK:
        pool = list(PRODUCTS)
    for p in pool:
        if brand_key(p.get("brand")) == key:
            out.append(p)
            if len(out) >= limit:
                break
    return out


def collection_products(handle, limit):
    handle = re.sub(r"[^a-z0-9-]+", "", (handle or "").lower())
    if not handle:
        return []
    try:
        data = shop_get(
            "/collections/%s/products.json?limit=%s" % (urllib.parse.quote(handle), min(250, limit)),
            timeout=12,
        )
        return [normalize_catalog(p) for p in (data.get("products") or [])]
    except Exception as exc:
        sys.stderr.write("collection %s failed: %s\n" % (handle, exc))
        return []


def search_cache(q, limit):
    tokens = [t for t in re.split(r"\s+", q) if t]
    scored = []
    with CACHE_LOCK:
        pool = list(PRODUCTS)
    for p in pool:
        s = score_product(p, q, tokens)
        if s > 0:
            scored.append((s, p))
    scored.sort(key=lambda x: -x[0])
    return [p for _, p in scored[:limit]]


def merge_results(primary, extra, limit):
    out = []
    seen = set()
    for p in primary + extra:
        handle = p.get("handle")
        if not handle or handle in seen:
            continue
        if not p.get("img") and handle in PRODUCTS_BY_HANDLE:
            cached = PRODUCTS_BY_HANDLE[handle]
            if cached.get("img"):
                p = dict(p)
                p["img"] = cached["img"]
                p["images"] = cached.get("images") or p.get("images") or []
        seen.add(handle)
        out.append(p)
        if len(out) >= limit:
            break
    return out


def refresh_catalog():
    global CACHE_READY
    page = 1
    collected = []
    while page <= 10:
        try:
            data = shop_get(f"/products.json?limit=250&page={page}", timeout=20)
        except Exception as exc:
            sys.stderr.write("catalog page %s failed: %s\n" % (page, exc))
            break
        batch = data.get("products") or []
        if not batch:
            break
        collected.extend(normalize_catalog(p) for p in batch)
        page += 1
        time.sleep(0.05)
    by_handle = {p["handle"]: p for p in collected if p.get("handle")}
    with CACHE_LOCK:
        PRODUCTS[:] = collected
        PRODUCTS_BY_HANDLE.clear()
        PRODUCTS_BY_HANDLE.update(by_handle)
        CACHE_READY = True
    sys.stderr.write("cached %s products from august-shop.com\n" % len(collected))


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/search":
            qs = urllib.parse.parse_qs(parsed.query)
            q = (qs.get("q") or [""])[0].strip()
            brand = (qs.get("brand") or [""])[0].strip()
            try:
                limit = max(1, min(48, int((qs.get("limit") or ["24"])[0])))
            except ValueError:
                limit = 24
            if brand:
                coll = collection_products(
                    re.sub(r"[^a-z0-9]+", "-", brand.lower()).strip("-"), limit
                )
                cached = filter_brand(brand, limit)
                self._json(
                    {
                        "q": q,
                        "brand": brand,
                        "products": merge_results(coll, cached, limit),
                        "cached": CACHE_READY,
                    }
                )
                return
            if len(q) < 2:
                self._json({"products": [], "q": q})
                return
            suggested = []
            try:
                params = urllib.parse.urlencode(
                    {
                        "q": q,
                        "resources[type]": "product",
                        "resources[limit]": "10",
                    }
                )
                data = shop_get("/search/suggest.json?" + params)
                raw = (
                    ((data.get("resources") or {}).get("results") or {}).get("products")
                    or []
                )
                suggested = [normalize_suggest(p) for p in raw]
            except Exception as exc:
                sys.stderr.write("suggest failed: %s\n" % exc)
            extra = search_cache(q.lower(), limit)
            self._json(
                {
                    "q": q,
                    "products": merge_results(suggested, extra, limit),
                    "cached": CACHE_READY,
                }
            )
            return

        if parsed.path == "/api/product":
            qs = urllib.parse.parse_qs(parsed.query)
            handle = (qs.get("handle") or [""])[0].strip()
            if not handle or not re.match(r"^[a-z0-9-]+$", handle):
                self._json({"error": "bad handle"}, 400)
                return
            try:
                raw = shop_get("/products/%s.js" % urllib.parse.quote(handle))
                self._json({"product": normalize_ajax(raw)})
            except urllib.error.HTTPError as exc:
                cached = PRODUCTS_BY_HANDLE.get(handle)
                if cached:
                    self._json({"product": cached})
                else:
                    self._json({"error": "not found"}, exc.code if exc.code in (404, 410) else 502)
            except Exception as exc:
                cached = PRODUCTS_BY_HANDLE.get(handle)
                if cached:
                    self._json({"product": cached})
                else:
                    self._json({"error": str(exc)}, 502)
            return

        super().do_GET()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    os.chdir(os.path.join(os.path.dirname(__file__), ".."))
    threading.Thread(target=refresh_catalog, daemon=True).start()
    server = ThreadingHTTPServer(("", port), NoCacheHandler)
    print(f"Serving with no-store caching on :{port}")
    print("Shopify proxy: /api/search?q=  /api/product?handle=")
    server.serve_forever()
