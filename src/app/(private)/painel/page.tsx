import { redirect } from 'next/navigation';
import { getPrincipal } from '@/lib/auth';
import { db } from '@/lib/db';
import { can } from '@/lib/permissions';
import { Dashboard } from '@/components/dashboard';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const principal = await getPrincipal();
  if (!principal) redirect('/login');
  const members = can(principal.role, 'members:read') ? await db.restaurantMembership.findMany({where: {restaurantId: principal.restaurantId}, select: {id: true, role: true, active: true, user: {select: {name: true, email: true}}}, orderBy: {createdAt: 'asc'}, take: 100}) : [];
  const audit = can(principal.role, 'audit:read') ? await db.auditLog.findMany({where: {restaurantId: principal.restaurantId}, select: {id: true, action: true, createdAt: true, actor: {select: {user: {select: {name: true}}}}}, orderBy: {createdAt: 'desc'}, take: 20}) : [];
  return <Dashboard restaurant={{name: principal.restaurant.name, slug: principal.restaurant.slug}} user={{name: principal.user.name, role: principal.role}} members={members} audit={audit.map(item => ({id: item.id, action: item.action, date: item.createdAt.toISOString(), actor: item.actor.user.name}))}/>;
}
