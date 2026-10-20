import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { Prisma, Role } from '@prisma/client';
import { tokenDigest } from '../../../../src/lib/auth';
import { hashPassword } from '../../../../src/lib/password';
import { platformSchemas } from '../../../../packages/shared/src/domain';
import { db, staff, manager, platform, table, ApiError } from './context';
export const memberInput=z.object({name:z.string().min(2).max(100),email:z.email(),password:z.string().min(12).max(128),role:z.enum(Role)}).strict();
export const restaurantInput=z.object({name:z.string().min(2).max(100),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(80),ownerName:z.string().min(2).max(100),ownerEmail:z.email(),ownerPassword:z.string().min(12).max(128)}).strict();
export async function createMember(input:unknown) {
 const p=await manager();const data=memberInput.parse(input);
 if(p.role!=='OWNER' && ['OWNER','MANAGER'].includes(data.role)) throw new ApiError(403,'Somente o proprietário pode conceder este perfil.');
 const hash=await hashPassword(data.password);
 return db.$transaction(async tx=>{const u=await tx.user.create({data:{name:data.name,email:data.email.toLowerCase(),passwordHash:hash}});
 const m=await tx.restaurantMembership.create({data:{userId:u.id,restaurantId:p.restaurantId,role:data.role}});
 await tx.activity.create({data:{restaurantId:p.restaurantId,actorUserId:p.userId,action:'member.created',subjectId:m.id}});return {id:m.id};});
}
export async function pairTable(tableId:string) {
 const p=await manager();const token=randomBytes(32).toString('hex');
 await db.$transaction(async tx=>{
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${tableId}))`;
 const t=await tx.resource.findFirst({where:{id:tableId,restaurantId:p.restaurantId,kind:'tables',enabled:true}});if(!t)throw new ApiError(404,'Mesa não encontrada.');
 // Revoke old tokens before releasing a new one. Old orders remain in restaurant history.
 await tx.tableAccess.updateMany({where:{tableId,restaurantId:p.restaurantId,active:true},data:{active:false}});
 const a=await tx.tableAccess.create({data:{restaurantId:p.restaurantId,tableId,tokenHash:tokenDigest(token),expiresAt:new Date(Date.now()+12*3600000)}});
 await tx.activity.create({data:{restaurantId:p.restaurantId,actorUserId:p.userId,action:'table.paired',subjectId:a.id}});
 });return {token,expiresInHours:12};
}
export async function tableLogin(token:string) {
 const a=await db.tableAccess.findUnique({where:{tokenHash:tokenDigest(token)},include:{restaurant:true,table:true}});
 if(!a || !a.active || a.expiresAt<=new Date() || !a.restaurant.active || !a.table.enabled)throw new ApiError(401,'Código inválido ou expirado.');return a;
}
export async function catalog() {const a=await table();return {restaurant:a.restaurant.name,table:(a.table.data as Record<string,unknown>).name,accessId:a.id,resources:await db.resource.findMany({where:{restaurantId:a.restaurantId,kind:{in:['products','categories']},enabled:true},orderBy:{createdAt:'asc'},take:500})};}
export async function serviceRequest(input:unknown) {
 const a=await table();const {name}=z.object({name:z.enum(['Chamar atendente','Pedir a conta','Ajuda com pagamento'])}).strict().parse(input);
 return db.$transaction(async tx=>{await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${a.id}))`;
 const rows=await tx.resource.findMany({where:{restaurantId:a.restaurantId,kind:'service-requests',enabled:true}});
 const existing=rows.find(r=>{const d=r.data as Record<string,unknown>;return d.accessId===a.id && d.name===name && !d.resolved;});if(existing)return existing;
 return tx.resource.create({data:{restaurantId:a.restaurantId,kind:'service-requests',data:{name,accessId:a.id,tableName:(a.table.data as Record<string,string>).name,resolved:false}}});});
}
export async function resolveService(id:string) {const p=await staff();if(!['OWNER','MANAGER','WAITER','CASHIER'].includes(p.role))throw new ApiError(403,'Perfil não permitido.');
 return db.$transaction(async tx=>{const r=await tx.resource.findFirst({where:{id,restaurantId:p.restaurantId,kind:'service-requests'}});if(!r)throw new ApiError(404,'Solicitação não encontrada.');return tx.resource.update({where:{id},data:{data:{...(r.data as Record<string,string>),resolved:true}}});});}
export async function summary() {const p=await manager();const orders=await db.order.groupBy({by:['status'],where:{restaurantId:p.restaurantId},_count:true,_sum:{total:true}});return {orders,period:'Todo o histórico',paymentsAvailable:false};}
export async function platformRead(kind:string) {
 await platform();
 if(kind==='restaurants')return db.restaurant.findMany({orderBy:{createdAt:'desc'},take:200});
 if(kind==='users')return db.user.findMany({select:{id:true,name:true,email:true,platformAdmin:true},take:200});
 if(kind==='audit')return db.activity.findMany({orderBy:{createdAt:'desc'},take:200});
 if(kind==='devices')return db.resource.findMany({where:{kind:{in:['devices','terminals']}},take:200});
 if(kind==='payments')return {available:false,message:'Nenhum provedor de pagamento configurado. Não há liquidações registradas.'};
 if(kind==='dashboard')return {restaurants:await db.restaurant.count(),users:await db.user.count(),orders:await db.order.count()};
 if(!Object.hasOwn(platformSchemas,kind))throw new ApiError(404,'Recurso não encontrado.');
 return db.platformRecord.findMany({where:{kind},orderBy:{createdAt:'desc'},take:200});
}
export async function platformWrite(kind:string,input:unknown) {
 const p=await platform();
 if(kind==='restaurants') {const data=restaurantInput.parse(input);const passwordHash=await hashPassword(data.ownerPassword);return db.$transaction(async tx=>{const user=await tx.user.create({data:{name:data.ownerName,email:data.ownerEmail.toLowerCase(),passwordHash}});const r=await tx.restaurant.create({data:{name:data.name,slug:data.slug,memberships:{create:{userId:user.id,role:'OWNER'}}}});await tx.activity.create({data:{actorUserId:p.userId,action:'platform.restaurant.created',subjectId:r.id}});return r;});}
 if(!Object.hasOwn(platformSchemas,kind))throw new ApiError(404,'Recurso não encontrado.');
 const data=platformSchemas[kind as keyof typeof platformSchemas].parse(input);
 return db.$transaction(async tx=>{
 if(kind==='subscriptions') {const d=data as {restaurantId:string;planId:string};if(!await tx.restaurant.findUnique({where:{id:d.restaurantId}}) || !await tx.platformRecord.findFirst({where:{id:d.planId,kind:'plans'}}))throw new ApiError(400,'Restaurante ou plano inválido.');}
 const r=await tx.platformRecord.create({data:{kind,data:data as Prisma.InputJsonValue}});await tx.activity.create({data:{actorUserId:p.userId,action:`platform.${kind}.created`,subjectId:r.id}});return r;});
}
export async function bill() {const a=await table();const orders=await db.order.findMany({where:{accessId:a.id,restaurantId:a.restaurantId,status:{not:'CANCELLED'}},orderBy:{createdAt:'asc'}});return {orders,total:orders.reduce((s,o)=>s+o.total,0),paid:0,paymentAvailable:false};}
