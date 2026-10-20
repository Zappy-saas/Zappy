import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorize, fail } from '@/lib/http';
export async function GET() {
  try {
    const principal = await authorize('members:read');
    const members = await db.restaurantMembership.findMany({where: {restaurantId: principal.restaurantId}, select: {id: true, role: true, active: true, user: {select: {name: true, email: true}}}, orderBy: {createdAt: 'asc'}, take: 100});
    return NextResponse.json({members});
  } catch (error) { return fail(error); }
}
