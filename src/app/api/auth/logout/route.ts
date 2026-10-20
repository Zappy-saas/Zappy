import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SESSION_COOKIE, tokenDigest } from '@/lib/auth';
import { assertOrigin, fail } from '@/lib/http';
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) await db.authSession.deleteMany({where: {tokenHash: tokenDigest(token)}});
    const response = NextResponse.json({ok: true});
    response.cookies.set(SESSION_COOKIE, '', {httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0});
    return response;
  } catch (error) { return fail(error); }
}
