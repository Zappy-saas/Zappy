// Isolated local deployment check. Never uses DATABASE_URL from the developer environment.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, chmodSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
const root = new URL('../',import.meta.url).pathname;
const scratch = mkdtempSync(join(tmpdir(),'zappy-deploy-'));
const suffix = randomBytes(6).toString('hex');
const network = `zappy-check-${suffix}`;
const database = `${network}-db`;
const app = `${network}-app`;
const image = process.env.ZAPPY_TEST_IMAGE || 'zappy:staging-candidate';
const password = randomBytes(24).toString('hex');
function run(command,args,options={}) {
  const result = spawnSync(command,args,{encoding:'utf8',...options});
  if (result.status !== 0) throw new Error(`${command} ${args[0] || ''} failed (exit ${result.status}). No environment values logged.`);
  return result.stdout.trim();
}
function docker(args,options) { return run('docker',args,options); }
async function until(check) { for(let i=0;i<40;i++){if(await check()) return; await new Promise(r=>setTimeout(r,500));} throw new Error('Readiness timeout.'); }
try {
  const unconfigured=spawnSync('docker',['run','--rm',image],{stdio:'ignore'});
  assert.equal(unconfigured.status,1,'Container must refuse to start without hosted configuration.');
  run('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',join(scratch,'ca.key'),'-out',join(scratch,'ca.crt'),'-days','1','-subj','/CN=Zappy isolated test CA']);
  run('openssl',['req','-newkey','rsa:2048','-nodes','-keyout',join(scratch,'server.key'),'-out',join(scratch,'server.csr'),'-subj','/CN=zappy-tls-db']);
  writeFileSync(join(scratch,'server.ext'),'subjectAltName=DNS:zappy-tls-db\nextendedKeyUsage=serverAuth\n',{mode:0o600});
  run('openssl',['x509','-req','-in',join(scratch,'server.csr'),'-CA',join(scratch,'ca.crt'),'-CAkey',join(scratch,'ca.key'),'-CAcreateserial','-out',join(scratch,'server.crt'),'-days','1','-extfile',join(scratch,'server.ext')]);
  chmodSync(join(scratch,'ca.crt'),0o644);
  chmodSync(join(scratch,'server.crt'),0o644);
  writeFileSync(join(scratch,'db.env'),`POSTGRES_USER=zappy\nPOSTGRES_PASSWORD=${password}\nPOSTGRES_DB=zappy\n`,{mode:0o600});
  docker(['network','create',network]);
  docker(['create','--name',database,'--network',network,'--network-alias','zappy-tls-db','--env-file',join(scratch,'db.env'),'postgres:17-alpine','sh','-c','chown postgres:postgres /tmp/server.key && chmod 600 /tmp/server.key && exec docker-entrypoint.sh postgres -c ssl=on -c ssl_cert_file=/tmp/server.crt -c ssl_key_file=/tmp/server.key']);
  for(const file of ['ca.crt','server.crt','server.key']) docker(['cp',join(scratch,file),`${database}:/tmp/${file}`]);
  docker(['start',database]);
  await until(()=>spawnSync('docker',['exec',database,'pg_isready','-U','zappy','-d','zappy'],{stdio:'ignore'}).status===0);
  for(const migration of readdirSync(join(root,'packages/database/prisma/migrations')).filter(n=>/^\d/.test(n)).sort()) {
    docker(['exec','-i',database,'psql','-U','zappy','-d','zappy','-v','ON_ERROR_STOP=1'],{input:readFileSync(join(root,'packages/database/prisma/migrations',migration,'migration.sql'),'utf8')});
  }
  // Real fixture account, generated only in this isolated database.
  const {hashPassword}=await import('../src/lib/password.ts');
  const hashed=await hashPassword(password);
  docker(['exec','-i',database,'psql','-U','zappy','-d','zappy','-v','ON_ERROR_STOP=1'],{input:`INSERT INTO "Restaurant" (id,name,slug,"updatedAt") VALUES ('r','Container test','container-test',NOW());\nINSERT INTO "User" (id,email,name,"passwordHash") VALUES ('u','container@example.test','Container test','${hashed}');\nINSERT INTO "RestaurantMembership" (id,"restaurantId","userId",role) VALUES ('m','r','u','OWNER');`});
  writeFileSync(join(scratch,'app.env'),`NODE_ENV=production\nDEPLOYMENT_ENV=staging\nAPP_ORIGIN=https://staging.example.test\nRESTAURANT_ORIGIN=https://staging.example.test\nCOOKIE_SECURE=true\nPAYMENTS_LIVE_ENABLED=false\nDATABASE_URL=postgresql://zappy:${password}@zappy-tls-db:5432/zappy?sslmode=verify-full&sslrootcert=/app/test-ca.crt\n`,{mode:0o600});
  docker(['create','--name',app,'--network',network,'--env-file',join(scratch,'app.env'),'-p','127.0.0.1::3000',image]);
  docker(['cp',join(scratch,'ca.crt'),`${app}:/app/test-ca.crt`]);
  docker(['start',app]);
  const port = docker(['port',app,'3000/tcp']).split(':').at(-1);
  const base=`http://127.0.0.1:${port}`;
  await until(async()=>{try{return (await fetch(`${base}/api/health`)).status===200;}catch{return false;}});
  assert.notEqual(docker(['exec',app,'id','-u']),'0');
  docker(['exec',app,'sh','-c','test ! -f .env && test ! -f .env.local && test ! -d tests']);
  const login=await fetch(`${base}/api/auth/login`,{method:'POST',headers:{origin:'https://staging.example.test','content-type':'application/json'},body:JSON.stringify({restaurant:'container-test',email:'container@example.test',password})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie');assert(cookie?.includes('Secure'));assert(cookie?.includes('HttpOnly'));
  const restaurant=await fetch(`${base}/api/restaurant`,{headers:{cookie:cookie.split(';')[0]}});assert.equal(restaurant.status,200);assert.equal((await restaurant.json()).name,'Container test');
  const crossOrigin=await fetch(`${base}/api/auth/login`,{method:'POST',headers:{origin:'https://evil.example.test','content-type':'application/json'},body:'{}'});assert.equal(crossOrigin.status,403);assert(!crossOrigin.headers.has('access-control-allow-origin'));
  // Check the same verified TLS connection fails without the private test CA.
  const badEnv=readFileSync(join(scratch,'app.env'),'utf8').replace('&sslrootcert=/app/test-ca.crt','');
  writeFileSync(join(scratch,'bad.env'),badEnv,{mode:0o600});
  const tlsRejected=spawnSync('docker',['run','--rm','--network',network,'--env-file',join(scratch,'bad.env'),'--entrypoint','node',image,'-e',"const {Client}=require('pg'); const c=new Client({connectionString:process.env.DATABASE_URL}); c.connect().then(()=>c.end().then(()=>process.exit(1))).catch(e=>process.exit(/certificate|self.signed/i.test(e.message)?0:2));"],{encoding:'utf8'});
  assert.equal(tlsRejected.status,0,'Database client must reject an untrusted certificate.');
  // Exercise repository backup/restore scripts over TLS, in this disposable DB only.
  for(const file of ['backup.sh','restore-isolated.sh']) docker(['cp',join(root,'deploy',file),`${database}:/tmp/${file}`]);
  const pg=['-e','PGHOST=zappy-tls-db','-e','PGUSER=zappy','-e','PGDATABASE=zappy','-e','PGSSLMODE=verify-full','-e','PGSSLROOTCERT=/tmp/ca.crt','-e',`PGPASSWORD=${password}`];
  docker(['exec',...pg,database,'sh','/tmp/backup.sh','/tmp/verified.dump']);
  docker(['exec',database,'createdb','-U','zappy','zappy_restore']);
  const restorePg=pg.map(v=>v==='PGDATABASE=zappy'?'PGDATABASE=zappy_restore':v);
  docker(['exec',...restorePg,'-e','RESTORE_CONFIRM=isolated-empty-database',database,'sh','/tmp/restore-isolated.sh','/tmp/verified.dump']);
  assert.equal(docker(['exec',database,'psql','-U','zappy','-d','zappy_restore','-A','-t','-c','SELECT count(*) FROM "RestaurantMembership";']),'1');
  const refused=spawnSync('docker',['exec',...restorePg,'-e','RESTORE_CONFIRM=isolated-empty-database',database,'sh','/tmp/restore-isolated.sh','/tmp/verified.dump'],{stdio:'ignore'});assert.notEqual(refused.status,0);
  console.log(JSON.stringify({image,startupFailsClosed:true,nonRoot:true,secretsExcluded:true,databaseTlsVerified:true,untrustedCertificateRejected:true,authenticatedRequest:true,secureCookie:true,crossOriginBlocked:true,backupRestored:true,nonEmptyRestoreRefused:true,publicHttpsTested:false}));
} catch (error) {
  for (const name of [database,app]) {
    const logs = spawnSync('docker',['logs','--tail','30',name],{encoding:'utf8'});
    console.error((logs.stdout + logs.stderr).replaceAll(password,'[redacted]'));
  }
  throw error;
} finally {
  for(const name of [app,database]) spawnSync('docker',['rm','-f','-v',name],{stdio:'ignore'});
  spawnSync('docker',['network','rm',network],{stdio:'ignore'});
  rmSync(scratch,{recursive:true,force:true});
}
