import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { assertOrigin, authorize, fail, jsonBody } from '@/lib/http';
export async function GET() {
  try {
    const principal = await authorize('restaurant:read');
    return NextResponse.json({id: principal.restaurantId, name: principal.restaurant.name, slug: principal.restaurant.slug, role: principal.role});
  } catch (error) { return fail(error); }
}
export async function PATCH(request: Request) {
  try {
    assertOrigin(request);
    const principal = await authorize('restaurant:write');
    const input = z.object({name: z.string().trim().min(2).max(100)}).strict().parse(await jsonBody(request));
    const result = await db.$transaction(async tx => {
      const restaurant = await tx.restaurant.update({where: {id: principal.restaurantId}, data: input, select: {name: true}});
      await tx.auditLog.create({data: {restaurantId: principal.restaurantId, actorMembershipId: principal.id, action: 'restaurant.updated'}});
      return restaurant;
    });
    return NextResponse.json(result);
  } catch (error) { return fail(error); }
}
