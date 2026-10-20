// Generate reviewable SQL for users who only have the Neon SQL editor.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const directory='packages/database/prisma/migrations';
const names=readdirSync(directory).filter(n=>/^\d/.test(n)).sort();
const migrationTable=`CREATE TABLE "_prisma_migrations" (
 "id" VARCHAR(36) PRIMARY KEY NOT NULL, "checksum" VARCHAR(64) NOT NULL,
 "finished_at" TIMESTAMPTZ, "migration_name" VARCHAR(255) NOT NULL, "logs" TEXT,
 "rolled_back_at" TIMESTAMPTZ, "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
 "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);\n`;
function sql(name){const raw=readFileSync(`${directory}/${name}/migration.sql`);const checksum=createHash('sha256').update(raw).digest('hex');return `-- ${name}\n${raw.toString()}\nINSERT INTO "_prisma_migrations" ("id","checksum","migration_name","finished_at","applied_steps_count") VALUES ('${checksum.slice(0,32)}','${checksum}','${name}',now(),1);\n`;}
const warning='-- Execute TODO o arquivo em uma unica operacao no SQL Editor.\n-- Nao apaga dados. Uma instalacao repetida falha e reverte a transacao.\n-- Nao cria usuarios ou senhas.\n';
writeFileSync('deploy/neon-initial-setup.sql',`${warning}-- Somente para banco vazio.\nBEGIN;\nSET LOCAL search_path TO public;\n${migrationTable}${names.map(sql).join('\n')}COMMIT;\n`);
writeFileSync('deploy/neon-operations-upgrade.sql',`${warning}-- Para bancos que ja receberam as duas migrations da base inicial.\nBEGIN;\nSET LOCAL search_path TO public;\nDO $$ BEGIN\n IF (SELECT count(*) FROM "_prisma_migrations" WHERE "migration_name" IN ('202610200001_foundation','202610200002_session_identity') AND "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL) <> 2 THEN\n RAISE EXCEPTION 'Instale a base inicial antes desta atualizacao';\n END IF;\nEND $$;\n${names.filter(n=>n>='202610200003').map(sql).join('\n')}COMMIT;\n`);
