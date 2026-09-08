#!/bin/sh
set -eu
: "${ANON_KEY:?required}" "${SERVICE_ROLE_KEY:?required}" "${SB_AUTH_HOST:?required}" "${SB_REST_HOST:?required}"
: "${NGINX_ENVSUBST_FILTER:?required}" "${NGINX_ENTRYPOINT_LOCAL_RESOLVERS:?required}"
[ "$PORT" = 8080 ] || exit 1
for token in "$ANON_KEY" "$SERVICE_ROLE_KEY"; do
  printf '%s' "$token" | grep -Eq '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$' || exit 1
done
for host in "$SB_AUTH_HOST" "$SB_REST_HOST"; do
  printf '%s' "$host" | grep -Eq '^[a-zA-Z0-9.-]+$' || exit 1
done
