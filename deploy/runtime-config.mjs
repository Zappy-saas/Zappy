import { pathToFileURL } from 'node:url';
/** Never include environment values in errors: connection URLs contain credentials. */
export function validateHostedEnvironment(env) {
  const errors = [];
  if (!['staging', 'production'].includes(env.DEPLOYMENT_ENV)) errors.push('DEPLOYMENT_ENV must be staging or production.');
  if (env.NODE_ENV !== 'production') errors.push('Hosted runtime requires NODE_ENV=production.');
  if (env.COOKIE_SECURE !== 'true') errors.push('Hosted runtime requires COOKIE_SECURE=true.');
  if (env.NODE_TLS_REJECT_UNAUTHORIZED === '0') errors.push('TLS certificate verification must remain enabled.');
  if (env.PGSSLMODE && env.PGSSLMODE !== 'verify-full') errors.push('PGSSLMODE must be verify-full when set.');
  let origin;
  try {
    origin = new URL(env.APP_ORIGIN);
    if (origin.protocol !== 'https:' || origin.origin !== env.APP_ORIGIN || origin.username || origin.password || ['localhost','127.0.0.1','[::1]'].includes(origin.hostname)) throw new Error();
  } catch { errors.push('APP_ORIGIN must be an exact public HTTPS origin without path or credentials.'); }
  if (env.RESTAURANT_ORIGIN !== env.APP_ORIGIN) errors.push('RESTAURANT_ORIGIN must match APP_ORIGIN for the current restaurant application.');
  for (const key of ['TABLET_ORIGIN','KITCHEN_ORIGIN','PLATFORM_ORIGIN','API_ORIGIN']) {
    if (!env[key]) continue; // Reserved addresses do not mean the module is implemented.
    try { const url = new URL(env[key]); if (url.protocol !== 'https:' || url.origin !== env[key] || url.username || url.password) throw new Error(); }
    catch { errors.push(`${key} must be an exact HTTPS origin.`); }
  }
  try {
    const database = new URL(env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(database.protocol) || !database.username || !database.password || database.pathname === '/') throw new Error();
    if (database.searchParams.get('sslmode') !== 'verify-full') errors.push('DATABASE_URL must require sslmode=verify-full.');
    if (database.searchParams.get('uselibpqcompat') === 'true') errors.push('Do not override TLS semantics with uselibpqcompat.');
  } catch { errors.push('DATABASE_URL must be a credentialed PostgreSQL URL with a database name.'); }
  for (const key of Object.keys(env)) {
    if (/^NEXT_PUBLIC_.*(SECRET|PASSWORD|DATABASE_URL|PRIVATE_KEY|ACCESS_TOKEN)/i.test(key)) errors.push(`${key} must never be exposed to the frontend.`);
    if (/^(SEED_PASSWORD|OWNER_PASSWORD)$/.test(key) && env[key]) errors.push(`${key} belongs only in an isolated administrative job, never in the web service.`);
  }
  if (env.PAYMENTS_LIVE_ENABLED !== 'false') errors.push('PAYMENTS_LIVE_ENABLED must be false: payments are not implemented or homologated.');
  return errors;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = validateHostedEnvironment(process.env);
  if (errors.length) { console.error(JSON.stringify({event:'deployment.configuration_rejected',errors})); process.exitCode=1; }
  else console.log(JSON.stringify({event:'deployment.configuration_valid',environment:process.env.DEPLOYMENT_ENV}));
}
