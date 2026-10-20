import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './db';
export const SESSION_COOKIE = 'zappy_session';
export const SESSION_SECONDS = 60 * 60 * 8;
export const tokenDigest = (token: string) => createHash('sha256').update(token).digest('hex');
export async function createSession(userId: string, membershipId: string) {
  const token = randomBytes(32).toString('hex');
  await db.authSession.create({data: {userId, membershipId, tokenHash: tokenDigest(token), expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000)}});
  return token;
}
export async function getPrincipal() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db.authSession.findUnique({where: {tokenHash: tokenDigest(token)}, include: {membership: {include: {restaurant: true, user: {select: {id: true, name: true, email: true}}}}}});
  if (!session || session.expiresAt <= new Date() || !session.membership.active || !session.membership.restaurant.active || session.userId !== session.membership.userId) return null;
  return session.membership;
}
export function secureCookies() {
  if (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'true') {
    // Local production-build testing must explicitly opt out; deployment docs require HTTPS.
    if (process.env.APP_ORIGIN !== 'http://localhost:3000') throw new Error('Production requires COOKIE_SECURE=true and HTTPS');
  }
  return process.env.COOKIE_SECURE === 'true';
}
