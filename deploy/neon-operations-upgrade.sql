-- Execute TODO o arquivo em uma unica operacao no SQL Editor.
-- Nao apaga dados. Uma instalacao repetida falha e reverte a transacao.
-- Nao cria usuarios ou senhas.
-- Para bancos que ja receberam as duas migrations da base inicial.
BEGIN;
SET LOCAL search_path TO public;
DO $$ BEGIN
 IF (SELECT count(*) FROM "_prisma_migrations" WHERE "migration_name" IN ('202610200001_foundation','202610200002_session_identity') AND "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL) <> 2 THEN
 RAISE EXCEPTION 'Instale a base inicial antes desta atualizacao';
 END IF;
END $$;
-- 202610200003_operations
ALTER TABLE "User" ADD COLUMN "platformAdmin" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "Resource" (
 "id" TEXT PRIMARY KEY, "restaurantId" TEXT NOT NULL, "kind" TEXT NOT NULL, "data" JSONB NOT NULL,
 "enabled" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Resource_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Resource_id_restaurantId_key" ON "Resource"("id", "restaurantId");
CREATE INDEX "Resource_restaurantId_kind_idx" ON "Resource"("restaurantId", "kind");
CREATE TABLE "TableAccess" (
 "id" TEXT PRIMARY KEY, "restaurantId" TEXT NOT NULL, "tableId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL,
 "active" BOOLEAN NOT NULL DEFAULT true, "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "TableAccess_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "TableAccess_tableId_restaurantId_fkey" FOREIGN KEY ("tableId", "restaurantId") REFERENCES "Resource"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TableAccess_tokenHash_key" ON "TableAccess"("tokenHash");
CREATE UNIQUE INDEX "TableAccess_id_restaurantId_key" ON "TableAccess"("id", "restaurantId");
CREATE INDEX "TableAccess_restaurantId_tableId_idx" ON "TableAccess"("restaurantId", "tableId");
CREATE TABLE "Order" (
 "id" TEXT PRIMARY KEY, "restaurantId" TEXT NOT NULL, "accessId" TEXT NOT NULL, "requestKey" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'RECEIVED', "items" JSONB NOT NULL, "total" INTEGER NOT NULL CHECK ("total" >= 0),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "Order_accessId_restaurantId_fkey" FOREIGN KEY ("accessId", "restaurantId") REFERENCES "TableAccess"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "Order_status_check" CHECK ("status" IN ('RECEIVED','PREPARING','READY','DELIVERED','CANCELLED'))
);
CREATE UNIQUE INDEX "Order_accessId_requestKey_key" ON "Order"("accessId", "requestKey");
CREATE INDEX "Order_restaurantId_status_createdAt_idx" ON "Order"("restaurantId", "status", "createdAt");
CREATE TABLE "Activity" (
 "id" TEXT PRIMARY KEY, "restaurantId" TEXT, "actorUserId" TEXT, "action" TEXT NOT NULL, "subjectId" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Activity_restaurantId_createdAt_idx" ON "Activity"("restaurantId", "createdAt");
CREATE TABLE "PlatformRecord" (
 "id" TEXT PRIMARY KEY, "kind" TEXT NOT NULL, "data" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "PlatformRecord_kind_idx" ON "PlatformRecord"("kind");

INSERT INTO "_prisma_migrations" ("id","checksum","migration_name","finished_at","applied_steps_count") VALUES ('5fc9bd8fb5d7d548d7fecfdd4fddf5f0','5fc9bd8fb5d7d548d7fecfdd4fddf5f0ebd4c3daf2b292fd698a9e31c2cadf89','202610200003_operations',now(),1);
COMMIT;
