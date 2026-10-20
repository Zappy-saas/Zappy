import 'dotenv/config';
import { test, expect, type APIRequestContext } from '@playwright/test';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../../src/lib/password';
import { tokenDigest } from '../../src/lib/auth';
test.describe.configure({mode:'serial'});
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const suffix=randomBytes(6).toString('hex'),password=randomBytes(24).toString('hex');
const emails=['owner','kitchen','other','platform'].map(x=>`${x}-ops-${suffix}@example.test`);
const headers={origin:'http://localhost:3000'};const ids:string[]=[];
let productId:string,tableId:string,categoryId:string,token:string,orderId:string;
let owner:APIRequestContext,kitchen:APIRequestContext,other:APIRequestContext,mesa:APIRequestContext,admin:APIRequestContext;
test.beforeAll(async({playwright})=>{
 if(!process.env.DATABASE_URL||!['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname)||process.env.NODE_ENV==='production')throw new Error('Local test database required.');
 const passwordHash=await hashPassword(password);
 for(let i=0;i<2;i++){const r=await db.restaurant.create({data:{name:`Operação ${i}`,slug:`ops-${i}-${suffix}`,memberships:{create:i===0?[{role:'OWNER',user:{create:{name:'Dona da casa',email:emails[0],passwordHash}}},{role:'KITCHEN',user:{create:{name:'Cozinha',email:emails[1],passwordHash}}},{role:'OWNER',user:{create:{name:'Admin Zappy',email:emails[3],passwordHash,platformAdmin:true}}}]:[{role:'OWNER',user:{create:{name:'Outra casa',email:emails[2],passwordHash}}}]}}});ids.push(r.id);}
 const create=()=>playwright.request.newContext({baseURL:'http://localhost:3000'});[owner,kitchen,other,mesa,admin]=await Promise.all([create(),create(),create(),create(),create()]);
 for(const [client,index,restaurant] of [[owner,0,0],[kitchen,1,0],[other,2,1],[admin,3,0]] as const)expect((await client.post('/api/auth/login',{headers,data:{email:emails[index],password,restaurant:`ops-${restaurant}-${suffix}`}})).status()).toBe(200);
});
test.afterAll(async()=>{
 await db.order.deleteMany({where:{restaurantId:{in:ids}}});await db.tableAccess.deleteMany({where:{restaurantId:{in:ids}}});await db.resource.deleteMany({where:{restaurantId:{in:ids}}});await db.activity.deleteMany({where:{OR:[{restaurantId:{in:ids}},{actorUserId:{in:(await db.user.findMany({where:{email:{in:emails}},select:{id:true}})).map(u=>u.id)}}]}});
 await db.authSession.deleteMany({where:{membership:{restaurantId:{in:ids}}}});await db.auditLog.deleteMany({where:{restaurantId:{in:ids}}});await db.restaurantMembership.deleteMany({where:{restaurantId:{in:ids}}});await db.restaurant.deleteMany({where:{id:{in:ids}}});await db.user.deleteMany({where:{email:{in:emails}}});await db.loginAttempt.deleteMany({where:{key:{in:emails.map(tokenDigest)}}});await db.$disconnect();for(const c of [owner,kitchen,other,mesa,admin])await c?.dispose();
});
async function create(kind:string,data:unknown){const r=await owner.post(`/api/v1/resources/${kind}`,{headers,data});expect(r.status(),await r.text()).toBe(200);return r.json();}
test('catalog and table pairing are real, scoped and restricted to managers',async()=>{
 categoryId=(await create('categories',{name:'Pratos da casa',description:'Preparados na hora'})).id;
 productId=(await create('products',{name:'Prato executivo',description:'Arroz, feijão e legumes',price:3290,categoryId,available:true})).id;
 tableId=(await create('tables',{name:'Mesa 07',seats:4})).id;
 expect((await kitchen.post('/api/v1/resources/categories',{headers,data:{name:'Não autorizado'}})).status()).toBe(403);
 expect((await other.get('/api/v1/resources/products')).status()).toBe(200);
 expect(await (await other.get('/api/v1/resources/products')).json()).toEqual([]);
 expect((await other.patch(`/api/v1/resources/products/${productId}`,{headers,data:{name:'Invadido',price:1,description:'',categoryId,available:true}})).status()).toBe(400);
 const pair=await owner.post(`/api/v1/tables/${tableId}`,{headers,data:{}});expect(pair.status(),await pair.text()).toBe(200);token=(await pair.json()).token;
 expect((await mesa.get('/api/v1/mesa/catalog')).status()).toBe(401);
 const linked=await mesa.post('/api/v1/mesa/session',{headers,data:{token}});expect(linked.status()).toBe(200);expect(linked.headers()['set-cookie']).toContain('HttpOnly');
 const catalog=await (await mesa.get('/api/v1/mesa/catalog')).json();expect(catalog.table).toBe('Mesa 07');expect(catalog.resources.some((r:{id:string})=>r.id===productId)).toBe(true);
});
test('order submission is idempotent, priced on server and isolated from other tenants',async()=>{
 const data={requestKey:randomUUID(),items:[{productId,quantity:2,note:'Sem sal adicional'}]};
 const results=await Promise.all([mesa.post('/api/v1/mesa/orders',{headers,data}),mesa.post('/api/v1/mesa/orders',{headers,data})]);
 for(const r of results)expect(r.status(),await r.text()).toBe(200);
 const a=await results[0].json(),b=await results[1].json();expect(a.id).toBe(b.id);expect(a.total).toBe(6580);orderId=a.id;
 expect(await db.order.count({where:{restaurantId:ids[0]}})).toBe(1);
 expect((await mesa.post('/api/v1/mesa/orders',{headers,data:{...data,requestKey:randomUUID(),total:1}})).status()).toBe(400);
 expect((await other.patch(`/api/v1/orders/${orderId}`,{headers,data:{status:'PREPARING'}})).status()).toBe(404);
 expect((await mesa.post('/api/v1/mesa/orders',{headers:{origin:'https://evil.example'},data})).status()).toBe(403);
});
test('kitchen transitions are enforced and bill contains actual noncancelled consumption',async()=>{
 expect((await kitchen.patch(`/api/v1/orders/${orderId}`,{headers,data:{status:'DELIVERED'}})).status()).toBe(403);
 expect((await owner.patch(`/api/v1/orders/${orderId}`,{headers,data:{status:'READY'}})).status()).toBe(409);
 expect((await kitchen.patch(`/api/v1/orders/${orderId}`,{headers,data:{status:'PREPARING'}})).status()).toBe(200);
 expect((await kitchen.patch(`/api/v1/orders/${orderId}`,{headers,data:{status:'READY'}})).status()).toBe(200);
 expect((await owner.patch(`/api/v1/orders/${orderId}`,{headers,data:{status:'DELIVERED'}})).status()).toBe(200);
 const bill=await (await mesa.get('/api/v1/mesa/bill')).json();expect(bill.total).toBe(6580);expect(bill.paid).toBe(0);
 expect((await mesa.post('/api/v1/mesa/payments',{headers,data:{}})).status()).toBe(503);
});
test('requests reach restaurant and platform administration requires its own grant',async()=>{
 const r=await mesa.post('/api/v1/mesa/service',{headers,data:{name:'Chamar atendente'}});expect(r.status()).toBe(200);const call=await r.json();
 expect((await owner.patch(`/api/v1/service-requests/${call.id}`,{headers,data:{}})).status()).toBe(200);
 expect((await owner.get('/api/v1/admin/restaurants')).status()).toBe(403);
 expect((await admin.get('/api/v1/admin/restaurants')).status()).toBe(200);
 expect(JSON.stringify(await (await admin.get('/api/v1/admin/users')).json())).not.toContain('passwordHash');
});
test('platform creates a usable restaurant owner without granting platform privileges',async({playwright})=>{
 const newEmail=`new-ops-${suffix}@example.test`;emails.push(newEmail);
 const r=await admin.post('/api/v1/admin/restaurants',{headers,data:{name:'Novo restaurante',slug:`new-ops-${suffix}`,ownerName:'Nova proprietária',ownerEmail:newEmail,ownerPassword:password}});
 expect(r.status(),await r.text()).toBe(200);const created=await r.json();ids.push(created.id);
 const client=await playwright.request.newContext({baseURL:'http://localhost:3000'});
 expect((await client.post('/api/auth/login',{headers,data:{restaurant:`new-ops-${suffix}`,email:newEmail,password}})).status()).toBe(200);
 expect((await client.get('/api/v1/admin/restaurants')).status()).toBe(403);
 expect((await client.get('/api/restaurant')).status()).toBe(200);await client.dispose();
 expect((await other.delete(`/api/v1/resources/products/${productId}`,{headers})).status()).toBe(404);
 expect((await db.resource.findUniqueOrThrow({where:{id:productId}})).enabled).toBe(true);
});
test('tablet, restaurant and kitchen navigation works in the browser',async({browser},info)=>{
 const context=await browser.newContext({storageState:await owner.storageState(),viewport:{width:1280,height:800}});const page=await context.newPage();
 await page.goto('/restaurante/produtos');await expect(page.getByRole('heading',{name:'Prato executivo'})).toBeVisible();await page.screenshot({path:info.outputPath('restaurante.png'),fullPage:true});
 await page.goto('/cozinha/historico');await expect(page.getByRole('heading',{name:'Mesa 07'})).toBeVisible();await page.screenshot({path:info.outputPath('cozinha.png'),fullPage:true});
 await page.goto('/admin/dashboard');await expect(page.getByText('Acesso exclusivo aos administradores da plataforma.',{exact:true})).toBeVisible();
 await context.close();
 const platformContext=await browser.newContext({storageState:await admin.storageState()});const platformPage=await platformContext.newPage();await platformPage.goto('/admin/restaurantes');await expect(platformPage.getByRole('heading',{name:'Novo restaurante',exact:true})).toBeVisible();await platformPage.screenshot({path:info.outputPath('admin.png'),fullPage:true});await platformContext.close();
 const tablet=await browser.newContext({storageState:await mesa.storageState(),viewport:{width:1280,height:800}});const tab=await tablet.newPage();
 await tab.goto('/mesa/cardapio');await expect(tab.getByRole('heading',{name:'Prato executivo'})).toBeVisible();await tab.screenshot({path:info.outputPath('mesa.png'),fullPage:true});
 expect(await tab.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await tab.getByRole('link',{name:'Escolher',exact:true}).click();await tab.getByRole('button',{name:/Adicionar ·/}).click();await tab.getByRole('link',{name:'Ver carrinho',exact:true}).click();await tab.getByRole('button',{name:'Confirmar pedido',exact:true}).click();await expect(tab.getByRole('heading',{name:'Pedido recebido pela cozinha'})).toBeVisible();
 expect(await db.order.count({where:{restaurantId:ids[0]}})).toBe(2);
 await tablet.close();
});
test('stream requires authentication and emits change hints; revoked tablets lose access',async()=>{
 const response=await fetch('http://localhost:3000/api/v1/mesa/events',{headers:{cookie:(await mesa.storageState()).cookies.map(c=>`${c.name}=${c.value}`).join('; ')}});
 expect(response.status).toBe(200);expect(response.headers.get('content-type')).toContain('text/event-stream');const reader=response.body!.getReader();const chunk=await reader.read();expect(new TextDecoder().decode(chunk.value)).toContain('changed');await reader.cancel();
 await owner.post(`/api/v1/tables/${tableId}`,{headers,data:{}});
 expect((await mesa.get('/api/v1/mesa/catalog')).status()).toBe(401);
 expect((await mesa.post('/api/v1/mesa/orders',{headers,data:{requestKey:randomUUID(),items:[{productId,quantity:1,note:''}]}})).status()).toBe(401);
});
