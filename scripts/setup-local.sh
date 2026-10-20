#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v docker >/dev/null
if [ ! -f .env ]; then
  node --input-type=module <<'JS'
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const password = randomBytes(24).toString('hex');
writeFileSync('.env', `DATABASE_URL=postgresql://zappy:${password}@127.0.0.1:54329/zappy?schema=public\nAPP_ORIGIN=http://localhost:3000\nCOOKIE_SECURE=false\n`, {mode: 0o600, flag: 'wx'});
JS
fi
if ! docker container inspect zappy-postgres >/dev/null 2>&1; then
  node --env-file=.env --input-type=module <<'JS'
import { spawnSync } from 'node:child_process';
const url = new URL(process.env.DATABASE_URL);
if (url.hostname !== '127.0.0.1' || url.port !== '54329') throw new Error('Existing .env uses an external database. Configure it separately.');
const result = spawnSync('docker', ['run', '-d', '--name', 'zappy-postgres', '-p', '127.0.0.1:54329:5432', '-e', 'POSTGRES_USER=zappy', '-e', 'POSTGRES_DB=zappy', '-e', 'POSTGRES_PASSWORD', '-v', 'zappy-postgres-data:/var/lib/postgresql/data', 'postgres:17-alpine'], {env: {...process.env, POSTGRES_PASSWORD: decodeURIComponent(url.password)}, stdio: 'inherit'});
process.exit(result.status ?? 1);
JS
else
  docker start zappy-postgres >/dev/null
fi
for attempt in {1..30}; do
  if docker exec zappy-postgres pg_isready -U zappy -d zappy >/dev/null; then break; fi
  if [ "$attempt" = 30 ]; then exit 1; fi
  sleep 1
done
if [ "${PRISMA_PORTABLE:-0}" = 1 ]; then
  npm run db:generate:portable
  npm run db:migrate:portable
else
  npm run db:generate
  npm run db:migrate
fi
