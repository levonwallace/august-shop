# August prototype on Railway.
#
# The prototype is static HTML/CSS/JS plus scripts/dev-server.py, which
# proxies the live store (/api/search, /api/product) and, when the
# SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_*_TOKEN variables are set on the
# Railway service, feeds the real catalog in through the Storefront API
# (/api/catalog.js). Railway's Node image has no python3, hence this image.
# No node_modules are needed at runtime.
FROM python:3.12-slim

WORKDIR /app
COPY . .

ENV PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    CATALOG_REFRESH_SECONDS=600

EXPOSE 5173
CMD ["sh", "-c", "python3 scripts/dev-server.py ${PORT:-5173}"]
