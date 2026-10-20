-- Zappy: instalacao inicial em banco vazio pelo SQL Editor do Neon.
-- Selecione o banco conectado ao Netlify e execute TODO este arquivo uma vez.
-- Nao apaga dados. Se as tabelas ja existirem, a transacao falha sem alterar nada.
-- Nao cria usuario nem senha. Registra as migrations para futuras atualizacoes Prisma.
BEGIN;
SET LOCAL search_path TO public;
CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Migration: 202610200001_foundation
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'WAITER', 'KITCHEN', 'CASHIER');
CREATE TABLE "Restaurant" (
 "id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL,
 "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "User" (
 "id" TEXT NOT NULL, "email" TEXT NOT NULL, "name" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RestaurantMembership" (
 "id" TEXT NOT NULL, "restaurantId" TEXT NOT NULL, "userId" TEXT NOT NULL, "role" "Role" NOT NULL,
 "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "RestaurantMembership_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuthSession" (
 "id" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "userId" TEXT NOT NULL, "membershipId" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditLog" (
 "id" TEXT NOT NULL, "restaurantId" TEXT NOT NULL, "actorMembershipId" TEXT NOT NULL,
 "action" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LoginAttempt" (
 "key" TEXT NOT NULL, "count" INTEGER NOT NULL DEFAULT 1,
 "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("key")
);
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "RestaurantMembership_restaurantId_userId_key" ON "RestaurantMembership"("restaurantId", "userId");
CREATE UNIQUE INDEX "RestaurantMembership_id_restaurantId_key" ON "RestaurantMembership"("id", "restaurantId");
CREATE INDEX "RestaurantMembership_userId_active_idx" ON "RestaurantMembership"("userId", "active");
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");
CREATE INDEX "AuditLog_restaurantId_createdAt_idx" ON "AuditLog"("restaurantId", "createdAt");
ALTER TABLE "RestaurantMembership" ADD CONSTRAINT "RestaurantMembership_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RestaurantMembership" ADD CONSTRAINT "RestaurantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "RestaurantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorMembershipId_restaurantId_fkey" FOREIGN KEY ("actorMembershipId", "restaurantId") REFERENCES "RestaurantMembership"("id", "restaurantId") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
VALUES ('b85c6d8f-9b32-4cee-854f-dbde15cd2bec', '2533360a5e0d3e17330d18594216f2875436133189bbb6fb00177f7cd6326b10', '202610200001_foundation', now(), 1);

-- Migration: 202610200002_session_identity
-- Enforce that a session's user is the user belonging to its membership.
CREATE UNIQUE INDEX "RestaurantMembership_id_userId_key" ON "RestaurantMembership"("id", "userId");
ALTER TABLE "AuthSession" DROP CONSTRAINT "AuthSession_membershipId_fkey";
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_membershipId_userId_fkey" FOREIGN KEY ("membershipId", "userId") REFERENCES "RestaurantMembership"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
VALUES ('421e1f24-e188-4b2b-9854-b493f585a106', '55fcd7ba9b5dcd650e4f5c072f758d9f27189c6b39501418404d0ca587e7ad7e', '202610200002_session_identity', now(), 1);

COMMIT;
