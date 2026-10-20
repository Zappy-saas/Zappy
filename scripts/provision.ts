import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import { hashPassword } from '../src/lib/password';
const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});
const schema = z.object({
  restaurantName: z.string().trim().min(2).max(100),
  restaurantSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(80),
  userName: z.string().trim().min(2).max(100),
  email: z.email().transform(v=>v.toLowerCase()),
  password: z.string().min(12).max(128),
});
async function main() {
  const input = schema.parse({restaurantName: process.env.RESTAURANT_NAME, restaurantSlug: process.env.RESTAURANT_SLUG, userName: process.env.OWNER_NAME, email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD});
  const passwordHash = await hashPassword(input.password);
  await db.$transaction(async tx=>{
    // Refuse existing identities instead of silently granting access or replacing passwords.
    const user = await tx.user.create({data: {name: input.userName, email: input.email, passwordHash}});
    const restaurant = await tx.restaurant.create({data: {name: input.restaurantName, slug: input.restaurantSlug}});
    const member = await tx.restaurantMembership.create({data: {restaurantId: restaurant.id, userId: user.id, role: Role.OWNER}});
    await tx.auditLog.create({data: {restaurantId: restaurant.id, actorMembershipId: member.id, action: 'restaurant.provisioned'}});
  });
  console.log('Restaurant and owner created. No existing records were changed.');
}
main().catch(()=>{console.error('Provisioning failed. Check input requirements and uniqueness of email/restaurant slug. No partial creation was retained.');process.exitCode=1;}).finally(()=>db.$disconnect());
