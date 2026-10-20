import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';
const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});
async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Development seed is disabled in production.');
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 12 || password.length > 128) throw new Error('Set SEED_PASSWORD to a unique development password of 12–128 characters.');
  const email = 'proprietario@zappy.example';
  const slug = 'zappy-demo';
  if (await db.restaurant.findUnique({where: {slug}})) { console.log('Development restaurant already exists; no data or password overwritten.'); return; }
  const passwordHash = await hashPassword(password);
  await db.$transaction(async tx => {
    const user = await tx.user.create({data: {name: 'Proprietário de demonstração', email, passwordHash}});
    const restaurant = await tx.restaurant.create({data: {name: 'Restaurante de demonstração', slug}});
    const member = await tx.restaurantMembership.create({data: {restaurantId: restaurant.id, userId: user.id, role: 'OWNER'}});
    await tx.auditLog.create({data: {restaurantId: restaurant.id, actorMembershipId: member.id, action: 'restaurant.provisioned'}});
  });
  console.log('Development data created. Restaurant: zappy-demo. Email: proprietario@zappy.example. Password: supplied through SEED_PASSWORD.');
}
main().catch(()=>{console.error('Seed failed. Check SEED_PASSWORD and database configuration; existing records are never overwritten.');process.exitCode=1;}).finally(()=>db.$disconnect());
