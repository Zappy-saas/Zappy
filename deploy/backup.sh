#!/bin/sh
# Set libpq PG* variables through a secret manager. Never pass a URI/password as an argument.
set -eu
umask 077
: "${PGHOST:?Set PGHOST}" "${PGUSER:?Set PGUSER}" "${PGDATABASE:?Set PGDATABASE}"
[ "${PGSSLMODE:-}" = verify-full ] || { echo 'Backup requires PGSSLMODE=verify-full.' >&2; exit 1; }
output=${1:?Usage: backup.sh /private/directory/backup.dump}
[ ! -e "$output" ] || { echo 'Refusing to overwrite an existing backup.' >&2; exit 1; }
temporary=$(mktemp "${output}.partial.XXXXXX")
trap 'rm -f "$temporary"' EXIT
pg_dump --format=custom --no-owner --no-privileges --file "$temporary"
pg_restore --list "$temporary" >/dev/null
# Atomic creation without replacing another backup created concurrently.
ln "$temporary" "$output"
echo 'Backup archive created and readable. A restoration drill is still required.'
