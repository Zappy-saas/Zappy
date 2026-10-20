-- Enforce that a session's user is the user belonging to its membership.
CREATE UNIQUE INDEX "RestaurantMembership_id_userId_key" ON "RestaurantMembership"("id", "userId");
ALTER TABLE "AuthSession" DROP CONSTRAINT "AuthSession_membershipId_fkey";
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_membershipId_userId_fkey" FOREIGN KEY ("membershipId", "userId") REFERENCES "RestaurantMembership"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;
