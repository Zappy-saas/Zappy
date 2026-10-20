import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../../src/lib/password';
const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})});
const suffix = randomBytes(6).toString('hex');
const password = randomBytes(24).toString('hex');
const email = `owner-${suffix}@example.test`;
const otherEmail = `other-${suffix}@example.test`;
const kitchenEmail = `kitchen-${suffix}@example.test`;
let restaurantId: string; let otherRestaurantId: string; let kitchenId: string;
const headers = {origin: 'http://localhost:3000'};
test.beforeAll(async()=>{
  if (!process.env.DATABASE_URL || !['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname) || process.env.NODE_ENV === 'production') throw new Error('Use only a local development/test database.');
  const passwordHash = await hashPassword(password);
  const first = await db.restaurant.create({data:{name:'Restaurante Teste A',slug:`test-a-${suffix}`, memberships:{create:[{role:'OWNER',user:{create:{email,name:'Proprietária teste',passwordHash}}},{role:'KITCHEN',user:{create:{email:kitchenEmail,name:'Cozinha teste',passwordHash}}}]}}});
  restaurantId=first.id;
  const second=await db.restaurant.create({data:{name:'Restaurante Teste B',slug:`test-b-${suffix}`,memberships:{create:{role:'OWNER',user:{create:{email:otherEmail,name:'Outro proprietário',passwordHash}}}}}});
  otherRestaurantId=second.id;
  kitchenId=(await db.restaurantMembership.findFirstOrThrow({where:{restaurantId,role:'KITCHEN'}})).id;
});
test.afterAll(async()=>{
  const ids=[restaurantId,otherRestaurantId].filter(Boolean);
  await db.authSession.deleteMany({where:{membership:{restaurantId:{in:ids}}}});
  await db.auditLog.deleteMany({where:{restaurantId:{in:ids}}});
  await db.restaurantMembership.deleteMany({where:{restaurantId:{in:ids}}});
  await db.restaurant.deleteMany({where:{id:{in:ids}}});
  await db.user.deleteMany({where:{email:{in:[email,otherEmail,kitchenEmail]}}});
  const {createHash}=await import('node:crypto');
  await db.loginAttempt.deleteMany({where:{key:{in:[email,otherEmail,kitchenEmail,`limit-${suffix}@example.test`].map(e=>createHash('sha256').update(e).digest('hex'))}}});
  await db.$disconnect();
});
async function login(request: import('@playwright/test').APIRequestContext, userEmail=email, restaurant=`test-a-${suffix}`) {
  const response=await request.post('/api/auth/login',{headers,data:{email:userEmail,password,restaurant}}); expect(response.status()).toBe(200); return response;
}
test('health checks the real database; private endpoints require authentication',async({request})=>{
  expect((await request.get('/api/health')).status()).toBe(200);
  expect((await request.get('/api/restaurant')).status()).toBe(401);
  expect((await request.get('/api/members')).status()).toBe(401);
});
test('login, persisted edit, audit history and logout in the browser',async({page})=>{
  await page.goto('/painel'); await expect(page).toHaveURL(/login/);
  await page.getByLabel('Restaurante',{exact:true}).fill(`test-a-${suffix}`);
  await page.getByLabel('E-mail',{exact:true}).fill(email);
  await page.getByLabel('Senha',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Entrar no restaurante'}).click();
  await expect(page.getByRole('heading',{name:'Visão geral'})).toBeVisible();
  await page.getByRole('button',{name:'Configurações',exact:true}).click();
  await page.getByLabel('Nome do restaurante').fill('Restaurante atualizado');
  await page.getByRole('button',{name:'Salvar alterações'}).click();
  await expect(page.getByRole('status')).toContainText('Dados salvos');
  expect((await db.restaurant.findUniqueOrThrow({where:{id:restaurantId}})).name).toBe('Restaurante atualizado');
  await page.getByRole('button',{name:'Histórico',exact:true}).click();
  await expect(page.getByRole('cell',{name:'Dados do restaurante atualizados'})).toBeVisible();
  await page.getByRole('button',{name:'Sair da conta'}).click(); await expect(page).toHaveURL(/login/);
  expect((await page.request.get('/api/restaurant')).status()).toBe(401);
});
test('tenant injection cannot read or edit another restaurant; password hashes never exposed',async({request})=>{
  const response=await login(request);
  const cookie=response.headers()['set-cookie']; expect(cookie).toContain('HttpOnly'); expect(cookie).toContain('SameSite=lax');
  const data=await (await request.get(`/api/restaurant?restaurantId=${otherRestaurantId}`)).json(); expect(data.id).toBe(restaurantId);
  const members=await (await request.get(`/api/members?restaurantId=${otherRestaurantId}`)).json();
  expect(JSON.stringify(members)).not.toContain(otherEmail); expect(JSON.stringify(members)).not.toContain('passwordHash');
  const patch=await request.patch('/api/restaurant',{headers,data:{name:'Attack',restaurantId:otherRestaurantId}}); expect(patch.status()).toBe(400);
  expect((await db.restaurant.findUniqueOrThrow({where:{id:otherRestaurantId}})).name).toBe('Restaurante Teste B');
  expect((await request.patch('/api/restaurant',{headers:{origin:'https://evil.example'},data:{name:'Attack'}})).status()).toBe(403);
});
test('kitchen cannot edit settings or list team; revocation invalidates existing sessions',async({request})=>{
  await login(request,kitchenEmail);
  expect((await request.get('/api/members')).status()).toBe(403);
  expect((await request.patch('/api/restaurant',{headers,data:{name:'Attack'}})).status()).toBe(403);
  await db.restaurantMembership.update({where:{id:kitchenId},data:{active:false}});
  expect((await request.get('/api/restaurant')).status()).toBe(401);
  await db.restaurantMembership.update({where:{id:kitchenId},data:{active:true}});
});
test('expired sessions and suspended restaurants are rejected',async({request})=>{
  await login(request);
  await db.authSession.updateMany({where:{membership:{restaurantId}},data:{expiresAt:new Date(0)}});
  expect((await request.get('/api/restaurant')).status()).toBe(401);
  await login(request);
  await db.restaurant.update({where:{id:restaurantId},data:{active:false}});
  expect((await request.get('/api/restaurant')).status()).toBe(401);
  await db.restaurant.update({where:{id:restaurantId},data:{active:true}});
});
test('wrong restaurant cannot authenticate and repeated attempts are throttled',async({request})=>{
  expect((await request.post('/api/auth/login',{headers,data:{email,password,restaurant:`test-b-${suffix}`}})).status()).toBe(401);
  const statuses=await Promise.all(Array.from({length:11},()=>request.post('/api/auth/login',{headers,data:{email:`limit-${suffix}@example.test`,password:'incorrect',restaurant:`test-a-${suffix}`}}).then(r=>r.status())));
  expect(statuses.filter(s=>s===401)).toHaveLength(10); expect(statuses.filter(s=>s===429)).toHaveLength(1);
});
for (const size of [{width:1280,height:800},{width:1920,height:1200},{width:390,height:844}]) {
  test(`layout and touch navigation at ${size.width}x${size.height}`,async({page},testInfo)=>{
    await login(page.request); await page.setViewportSize(size); await page.goto('/painel');
    await expect(page.getByRole('heading',{name:'Visão geral'})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.screenshot({path: testInfo.outputPath(`painel-${size.width}.png`), fullPage: true});
    await page.getByRole('button',{name:'Equipe e acessos',exact:true}).click();
    await expect(page.getByRole('cell',{name:email,exact:false})).toBeVisible();
    await expect(page.getByRole('button',{name:'Sair da conta'})).toBeVisible();
  });
}

test('administrative provisioning is atomic and refuses existing identities', async()=>{
  const provisionEmail = `provision-${suffix}@example.test`;
  const provisionSlug = `provision-${suffix}`;
  const env = {...process.env, RESTAURANT_NAME:'Restaurante provisionado em teste', RESTAURANT_SLUG:provisionSlug, OWNER_NAME:'Proprietário teste CLI', OWNER_EMAIL:provisionEmail, OWNER_PASSWORD:password};
  try {
    const result = spawnSync('node_modules/.bin/tsx',['scripts/provision.ts'],{env,encoding:'utf8'});
    expect(result.status).toBe(0);
    const restaurant = await db.restaurant.findUniqueOrThrow({where:{slug:provisionSlug},include:{memberships:true,auditLogs:true}});
    expect(restaurant.memberships[0].role).toBe('OWNER'); expect(restaurant.auditLogs).toHaveLength(1);
    const duplicate = spawnSync('node_modules/.bin/tsx',['scripts/provision.ts'],{env:{...env,RESTAURANT_SLUG:`duplicate-${suffix}`},encoding:'utf8'});
    expect(duplicate.status).toBe(1);
    expect(await db.restaurant.findUnique({where:{slug:`duplicate-${suffix}`}})).toBeNull();
  } finally {
    const restaurant = await db.restaurant.findUnique({where:{slug:provisionSlug}});
    if (restaurant) {
      await db.auditLog.deleteMany({where:{restaurantId:restaurant.id}});
      await db.restaurantMembership.deleteMany({where:{restaurantId:restaurant.id}});
      await db.restaurant.delete({where:{id:restaurant.id}});
      await db.user.deleteMany({where:{email:provisionEmail}});
    }
  }
});
