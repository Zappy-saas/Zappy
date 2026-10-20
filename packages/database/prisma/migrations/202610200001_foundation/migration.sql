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
