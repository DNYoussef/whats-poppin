#!/bin/sh
set -eu
# Railway permits one volume. Keep both PGDATA and the pgsodium key on it.
if [ ! -d /var/lib/postgresql/data/custom ]; then
  cp -a /etc/postgresql-custom /var/lib/postgresql/data/custom
fi
if [ ! -L /etc/postgresql-custom ]; then
  mv /etc/postgresql-custom /etc/postgresql-custom.image
  ln -s /var/lib/postgresql/data/custom /etc/postgresql-custom
fi
exec /usr/local/bin/docker-entrypoint.sh "$@"
