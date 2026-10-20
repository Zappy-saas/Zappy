import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
// OWASP scrypt baseline: N=2^17, r=8, p=1 (~128 MiB per active derivation).
const params = {N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024};
function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve,reject)=>scrypt(password,salt,64,params,(error,key)=>error?reject(error):resolve(key)));
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password,salt);
  return `scrypt:131072:8:1:${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const [algorithm,n,r,p,salt,hash] = encoded.split(':');
  if (algorithm !== 'scrypt' || n !== '131072' || r !== '8' || p !== '1' || !salt || !hash) return false;
  const actual = await derive(password,salt);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
