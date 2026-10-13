#!/usr/bin/env python3
"""Shopify Storefront API client for the prototype tooling (stdlib only).

Reads credentials from .env in the repo root (see .env.example). Used by
scripts/dev-server.py to feed the prototype real products, and runnable:

    python3 scripts/storefront.py check   # token scopes + theme handles exist
    python3 scripts/storefront.py pull    # snapshot → data/storefront.json
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

DOMAIN_KEYS = ("SHOPIFY_STORE_DOMAIN", "PUBLIC_STORE_DOMAIN", "SHOPIFY_SHOP", "SHOPIFY_STORE")
PRIVATE_KEYS = ("SHOPIFY_STOREFRONT_PRIVATE_TOKEN", "PRIVATE_STOREFRONT_API_TOKEN")
PUBLIC_KEYS = (
    "SHOPIFY_STOREFRONT_PUBLIC_TOKEN",
    "PUBLIC_STOREFRONT_API_TOKEN",
    "SHOPIFY_STOREFRONT_TOKEN",
    "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
)
VERSION_KEYS = ("SHOPIFY_API_VERSION", "PUBLIC_STOREFRONT_API_VERSION")


def load_env(path=os.path.join(ROOT, ".env")):
    env = {}
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip().removeprefix("export ").strip()
                env[key] = value.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    for key, value in os.environ.items():
        env.setdefault(key, value)
    return env


def _first(env, keys):
    for k in keys:
        if env.get(k):
            return env[k]
    return ""


ENV = load_env()
DOMAIN = re.sub(r"^https?://", "", _first(ENV, DOMAIN_KEYS)).strip("/")
PRIVATE_TOKEN = _first(ENV, PRIVATE_KEYS)
PUBLIC_TOKEN = _first(ENV, PUBLIC_KEYS)
VERSION = _first(ENV, VERSION_KEYS) or "2026-07"
PROTOTYPE_LIMIT = int(ENV.get("SHOPIFY_PROTOTYPE_LIMIT") or 250)


def configured():
    return bool(DOMAIN and (PRIVATE_TOKEN or PUBLIC_TOKEN))


class StorefrontError(Exception):
    pass


def gql(query, variables=None, timeout=25):
    if not configured():
        raise StorefrontError("Storefront API not configured — fill in .env (see .env.example)")
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if PRIVATE_TOKEN:
        headers["Shopify-Storefront-Private-Token"] = PRIVATE_TOKEN
    else:
        headers["X-Shopify-Storefront-Access-Token"] = PUBLIC_TOKEN
    req = urllib.request.Request(
        f"https://{DOMAIN}/api/{VERSION}/graphql.json",
        data=json.dumps({"query": query, "variables": variables or {}}).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            payload = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")[:300]
        raise StorefrontError(f"HTTP {exc.code}: {body}") from None
    if payload.get("errors"):
        raise StorefrontError("; ".join(e.get("message", str(e)) for e in payload["errors"]))
    return payload["data"]


# ── Products ────────────────────────────────────────────────────────────

_INVENTORY = None  # None = untested, True/False after the first products call


def _product_fields(inventory):
    qty = "quantityAvailable" if inventory else ""
    return f"""
      id handle title vendor productType tags availableForSale description
      cutline: metafield(namespace: "theme", key: "cutline") {{ value }}
      siblings: metafield(namespace: "theme", key: "siblings") {{ value }}
      badge: metafield(namespace: "theme", key: "badge") {{ value }}
      preorder: metafield(namespace: "theme", key: "preorder") {{ value }}
      short: metafield(namespace: "august", key: "short_description") {{ value }}
      featuredImage {{ url(transform: {{maxWidth: 600}}) }}
      images(first: 5) {{ nodes {{ url(transform: {{maxWidth: 1200}}) }} }}
      options {{ name optionValues {{ name }} }}
      variants(first: 50) {{
        nodes {{
          id title availableForSale {qty}
          price {{ amount }} compareAtPrice {{ amount }}
          selectedOptions {{ name value }}
        }}
      }}
    """


def _with_inventory_fallback(run):
    """Retry without quantityAvailable when the token lacks inventory access."""
    global _INVENTORY
    if _INVENTORY is not False:
        try:
            out = run(True)
            _INVENTORY = True
            return out
        except StorefrontError as exc:
            if "quantityAvailable" not in str(exc) and "ACCESS_DENIED" not in str(exc):
                raise
            _INVENTORY = False
    return run(False)


SIZE_OPTIONS = {"size", "sizes", "shoe size"}
SHOE_RE = re.compile(r"shoe|sneaker|boot|sandal|footwear|slipper")
ACC_RE = re.compile(r"hat|cap|bag|sock|wallet|accessor|jewel|beanie|belt|eyewear|sunglass")
OBJ_RE = re.compile(r"candle|incense|ceramic|book|vinyl|home|fragrance|gift|object|publication|skin")


def _money(node):
    try:
        return float((node or {}).get("amount") or 0)
    except (TypeError, ValueError):
        return 0.0


def normalize(p):
    """Storefront product → the shape js/catalog.js expects.

    dept / cat / type follow snippets/product-json.liquid so the prototype
    and the theme classify products the same way.
    """
    tags = p.get("tags") or []
    dept = cat = ptype = ""
    for tag in tags:
        t = tag.lower()
        if "dept:" in t:
            dept = t.split("dept:", 1)[1].strip()
        elif "cat:" in t:
            cat = t.split("cat:", 1)[1].strip()
        elif "type:" in t:
            ptype = t.split("type:", 1)[1].strip()
    title = p.get("title") or ""
    tl = title.lower()
    if not dept:
        if any(w in tl for w in ("women's", "womens", "women’s")):
            dept = "women"
        elif any(w in tl for w in ("men's", "mens", "men’s")):
            dept = "men"
        else:
            dept = "unisex"
    kind = (p.get("productType") or "").lower()
    if not cat:
        if SHOE_RE.search(kind):
            cat = "shoes"
        elif ACC_RE.search(kind):
            cat = "accessories"
        elif OBJ_RE.search(kind):
            cat = "objects"
        elif kind:
            cat = "apparel"
        elif re.search(r"shoe|sneaker|boot|sandal|runner", tl):
            cat = "shoes"
        elif re.search(r"hat|cap|bag|sock|wallet|beanie", tl):
            cat = "accessories"
        else:
            cat = "apparel"

    variants = (p.get("variants") or {}).get("nodes") or []
    first = next((v for v in variants if v.get("availableForSale")), variants[0] if variants else {})
    price = _money(first.get("price"))
    compare = _money(first.get("compareAtPrice"))
    sale = compare > price

    size_index = None
    options = p.get("options") or []
    for i, opt in enumerate(options):
        if (opt.get("name") or "").lower() in SIZE_OPTIONS:
            size_index = i
    if size_index is None and len(variants) > 1 and options:
        size_index = 0
    sizes = []
    if size_index is not None:
        name = options[size_index]["name"]
        for v in variants:
            if not v.get("availableForSale"):
                continue
            for so in v.get("selectedOptions") or []:
                if so["name"] == name and so["value"] not in sizes:
                    sizes.append(so["value"])

    # Live-store metafields (same keys the old theme and snippets/product-json.liquid read).
    # Metafields only come through the Storefront API once they are exposed in
    # Settings → Custom data → Storefront access; until then they're null.
    mf = lambda key: ((p.get(key) or {}).get("value") or "").strip()  # noqa: E731
    badge = mf("badge")
    if not badge:
        for tag in tags:
            if "_badge_" in tag:
                badge = tag.replace("_badge_", "").replace("_", " ").strip() or badge
    preorder = mf("preorder").lower() == "true"
    if not badge and preorder:
        badge = "Pre-order"
    body = re.sub(r"\s+", " ", p.get("description") or "").strip()
    short = mf("short") or (body[:177].rstrip() + "…" if len(body) > 180 else body)

    images = [n["url"] for n in (p.get("images") or {}).get("nodes") or [] if n.get("url")]
    img = ((p.get("featuredImage") or {}).get("url")) or (images[0] if images else "")
    out = {
        "id": "h:" + p["handle"],
        "gid": p["id"],
        "handle": p["handle"],
        "title": title,
        "brand": p.get("vendor") or "",
        "dept": dept,
        "cat": cat,
        "sale": sale,
        "available": bool(p.get("availableForSale")),
        "price": price,
        "compare": compare if sale else None,
        "img": img,
        "images": images,
        "sizes": sizes,
        "tags": tags,
        "badge": badge or None,
        "cutline": mf("cutline") or None,
        "siblings": mf("siblings") or None,
        "preorder": preorder,
        "short": short,
        "body": body[:600],
        "variants": [
            {
                "id": v["id"].rsplit("/", 1)[-1],
                "title": v.get("title"),
                "available": bool(v.get("availableForSale")),
                "qty": v.get("quantityAvailable"),
                "price": _money(v.get("price")),
            }
            for v in variants
        ],
    }
    if ptype:
        out["type"] = ptype
    return out


def products(limit=None, query=None, page_size=100):
    """Newest-first products, paginated. `query` uses Storefront search syntax."""
    collected, cursor = [], None
    while True:
        size = page_size if limit is None else min(page_size, limit - len(collected))
        if size <= 0:
            break

        def run(inv, size=size, cursor=cursor):
            return gql(
                f"""query($n: Int!, $after: String, $q: String) {{
                  products(first: $n, after: $after, query: $q, sortKey: CREATED_AT, reverse: true) {{
                    pageInfo {{ hasNextPage endCursor }}
                    nodes {{ {_product_fields(inv)} }}
                  }}
                }}""",
                {"n": size, "after": cursor, "q": query},
            )

        conn = _with_inventory_fallback(run)["products"]
        collected.extend(normalize(p) for p in conn["nodes"])
        if not conn["pageInfo"]["hasNextPage"]:
            break
        cursor = conn["pageInfo"]["endCursor"]
    return collected


def product(handle):
    data = _with_inventory_fallback(
        lambda inv: gql(
            f"query($h: String!) {{ product(handle: $h) {{ {_product_fields(inv)} }} }}",
            {"h": handle},
        )
    )
    return normalize(data["product"]) if data.get("product") else None


# ── check / pull ────────────────────────────────────────────────────────


def theme_handles():
    """Collection / blog / product / menu handles the theme JSON points at."""
    found = {"collections": set(), "blogs": set(), "products": set(), "menus": set()}
    files = [os.path.join(ROOT, "theme/config/settings_data.json")]
    for sub in ("templates", "sections"):
        d = os.path.join(ROOT, "theme", sub)
        files += [os.path.join(d, f) for f in os.listdir(d) if f.endswith(".json")]
    for path in files:
        text = open(path, encoding="utf-8").read()
        for kind, handle in re.findall(r"shopify://(collections|blogs|products)/([a-z0-9-]+)", text):
            found[kind].add(handle)

        def walk(node):
            if isinstance(node, dict):
                for k, v in node.items():
                    if isinstance(v, str) and v and re.fullmatch(r"[a-z0-9-]+", v):
                        if k == "collection" or k.endswith("_collection"):
                            found["collections"].add(v)
                        elif k.endswith("_blog"):
                            found["blogs"].add(v)
                        elif k == "menu" or k.endswith("_menu"):
                            found["menus"].add(v)
                    walk(v)
            elif isinstance(node, list):
                for v in node:
                    walk(v)

        walk(json.load(open(path, encoding="utf-8")))
    found["collections"].discard("all")  # virtual collection, not queryable
    found["collections"].discard("vendors")
    return found


def _alias(prefix, handle):
    return prefix + re.sub(r"[^a-z0-9]", "_", handle)


def check():
    print(f"Store {DOMAIN} · API {VERSION} · {'private' if PRIVATE_TOKEN else 'public'} token")
    shop = gql("{ shop { name primaryDomain { url } } }")["shop"]
    print(f"✓ shop: {shop['name']} ({shop['primaryDomain']['url']})")

    sample = products(limit=5)
    print(f"✓ products: read OK ({len(sample)} sampled, newest: {sample[0]['title'] if sample else '—'})")
    print(("✓" if _INVENTORY else "·") + " inventory quantities: "
          + ("available" if _INVENTORY else "not granted (unauthenticated_read_product_inventory) — availability flags still work"))

    handles = theme_handles()
    parts = []
    for h in sorted(handles["collections"]):
        parts.append(f'{_alias("c_", h)}: collection(handle: "{h}") {{ handle products(first: 1) {{ nodes {{ id }} }} }}')
    for h in sorted(handles["blogs"]):
        parts.append(f'{_alias("b_", h)}: blog(handle: "{h}") {{ handle articles(first: 250) {{ nodes {{ id }} }} }}')
    for h in sorted(handles["products"]):
        parts.append(f'{_alias("p_", h)}: product(handle: "{h}") {{ handle availableForSale }}')
    for h in sorted(handles["menus"]):
        parts.append(f'{_alias("m_", h)}: menu(handle: "{h}") {{ handle items {{ title }} }}')

    missing = 0
    menus_denied = False
    try:
        data = gql("{ " + "\n".join(parts) + " }")
    except StorefrontError as exc:
        if "menu" not in str(exc).lower():
            raise
        menus_denied = True
        data = gql("{ " + "\n".join(p for p in parts if not p.startswith("m_")) + " }")

    print("\nTheme handles on the live store:")
    for kind, prefix in (("collections", "c_"), ("blogs", "b_"), ("products", "p_"), ("menus", "m_")):
        for h in sorted(handles[kind]):
            if kind == "menus" and menus_denied:
                print(f"  ? menu {h} (token can't read menus — needs unauthenticated_read_content)")
                continue
            node = data.get(_alias(prefix, h))
            if not node:
                missing += 1
                print(f"  ✗ {kind[:-1]} {h} — not found")
            elif kind == "collections":
                print(f"  ✓ collection {h}" + ("" if node["products"]["nodes"] else " (empty)"))
            elif kind == "blogs":
                print(f"  ✓ blog {h} ({len(node['articles']['nodes'])} articles)")
            elif kind == "menus":
                print(f"  ✓ menu {h} ({len(node['items'])} items)")
            else:
                print(f"  ✓ product {h}" + ("" if node["availableForSale"] else " (sold out)"))

    try:
        art = gql("""{ blog(handle: "august-aux") { articles(first: 1) { nodes {
            title metafield(namespace: "august", key: "mix_number") { value } } } } }""")
        print("\n✓ article metafields readable (august.* still needs storefront access per definition)")
    except StorefrontError as exc:
        print(f"\n· article metafields: {exc}")
    print(f"\n{missing} missing handle(s)." if missing else "\nAll theme handles exist.")
    return missing


def pull():
    data = gql("""{
      shop { name description primaryDomain { url } }
      collections(first: 250, sortKey: TITLE) { nodes { handle title } }
      blogs(first: 20) { nodes { handle title
        articles(first: 100, sortKey: PUBLISHED_AT, reverse: true) { nodes {
          handle title publishedAt excerpt tags image { url }
        } } } }
    }""")
    try:
        data["menus"] = {
            h: gql(f'{{ menu(handle: "{h}") {{ items {{ title url items {{ title url }} }} }} }}')["menu"]
            for h in ("main-menu", "footer", "shop")
        }
    except StorefrontError as exc:
        data["menus"] = {"error": str(exc)}
    data["products"] = products(limit=PROTOTYPE_LIMIT, query="available_for_sale:true")
    out = os.path.join(ROOT, "data", "storefront.json")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1, ensure_ascii=False)
    print(f"✓ {len(data['products'])} products, {len(data['collections']['nodes'])} collections, "
          f"{len(data['blogs']['nodes'])} blogs → {os.path.relpath(out, ROOT)}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if not configured():
        print("✗ .env is missing SHOPIFY_STORE_DOMAIN and a Storefront token (see .env.example)")
        sys.exit(1)
    try:
        if cmd == "check":
            sys.exit(1 if check() else 0)
        elif cmd == "pull":
            pull()
        else:
            print(__doc__)
    except StorefrontError as exc:
        print(f"✗ {exc}")
        sys.exit(1)
