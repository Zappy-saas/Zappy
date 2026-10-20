import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSession, SESSION_COOKIE, SESSION_SECONDS, secureCookies, tokenDigest } from '@/lib/auth';
import { ApiError, assertOrigin, fail, jsonBody } from '@/lib/http';
const schema = z.object({email: z.email().max(254).transform(v => v.trim().toLowerCase()), password: z.string().min(1).max(128), restaurant: z.string().min(2).max(80)}).strict();
// Valid scrypt encoding used for equal-cost verification when an account is unknown.
const DUMMY_HASH = `scrypt:131072:8:1:${'0'.repeat(32)}:${'0'.repeat(128)}`;
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const input = schema.parse(await jsonBody(request));
    const key = tokenDigest(input.email);
    // Atomic, database-backed limit shared by all application instances.
    const rows = await db.$queryRaw<{count: number}[]>`
      INSERT INTO "LoginAttempt" ("key", "count", "windowStartedAt") VALUES (${key}, 1, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "LoginAttempt"."windowStartedAt" < NOW() - INTERVAL '15 minutes' THEN 1 ELSE "LoginAttempt"."count" + 1 END,
        "windowStartedAt" = CASE WHEN "LoginAttempt"."windowStartedAt" < NOW() - INTERVAL '15 minutes' THEN NOW() ELSE "LoginAttempt"."windowStartedAt" END
      RETURNING "count"`;
    if (rows[0].count > 10) throw new ApiError(429, 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.');
    const user = await db.user.findUnique({where: {email: input.email}, include: {memberships: {where: {active: true, restaurant: {slug: input.restaurant, active: true}}, include: {restaurant: true}}}});
    const valid = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_HASH);
    const membership = user?.memberships[0];
    if (!valid || !user || !membership) throw new ApiError(401, 'E-mail, senha ou restaurante inválidos.');
    const token = await createSession(user.id, membership.id);
    const response = NextResponse.json({ok: true});
    response.cookies.set(SESSION_COOKIE, token, {httpOnly: true, secure: secureCookies(), sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS});
    return response;
  } catch (error) { return fail(error); }
}
