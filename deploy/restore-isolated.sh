#!/bin/sh
# Only restores into an explicitly selected EMPTY database; never uses --clean.
set -eu
: "${PGHOST:?Set isolated PGHOST}" "${PGUSER:?Set restore PGUSER}" "${PGDATABASE:?Set isolated PGDATABASE}"
[ "${PGSSLMODE:-}" = verify-full ] || { echo 'Restore requires PGSSLMODE=verify-full.' >&2; exit 1; }
[ "${RESTORE_CONFIRM:-}" = isolated-empty-database ] || { echo 'Set RESTORE_CONFIRM=isolated-empty-database after independently checking the target.' >&2; exit 1; }
archive=${1:?Usage: restore-isolated.sh /private/directory/backup.dump}
objects=$(psql -X -A -t -v ON_ERROR_STOP=1 -c "SELECT (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema') + (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema') + (SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema' AND t.typtype IN ('e','d')) + (SELECT count(*) FROM pg_namespace WHERE nspname !~ '^pg_' AND nspname NOT IN ('public','information_schema'));")
[ "$objects" = 0 ] || { echo 'Refusing to restore: target database is not empty.' >&2; exit 1; }
pg_restore --exit-on-error --single-transaction --no-owner --no-privileges --dbname "$PGDATABASE" "$archive"
echo 'Restored into the isolated database. Validate integrity and application behavior before any cutover.'
