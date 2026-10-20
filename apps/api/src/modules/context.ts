import { cookies } from 'next/headers';
import { getPrincipal, tokenDigest } from '../../../../src/lib/auth';
import { ApiError } from '../../../../src/lib/http';
import { db } from '../../../../packages/database/src/client';
export { db, ApiError };
export async function staff() { const p=await getPrincipal(); if(!p) throw new ApiError(401,'Entre com sua conta do restaurante.'); return p; }
export async function manager() {const p=await staff(); if(!['OWNER','MANAGER'].includes(p.role)) throw new ApiError(403,'Acesso restrito à gerência.'); return p;}
export async function platform() {const p=await staff(); if(!p.user.platformAdmin) throw new ApiError(403,'Acesso exclusivo à administração da Zappy.'); return p;}
export const TABLE_COOKIE='zappy_table';
export async function table() {
 const token=(await cookies()).get(TABLE_COOKIE)?.value;
 if(!token || !/^[a-f0-9]{64}$/.test(token)) throw new ApiError(401,'Vincule este tablet à mesa com o código fornecido pelo restaurante.');
 const access=await db.tableAccess.findUnique({where:{tokenHash:tokenDigest(token)},include:{restaurant:true,table:true}});
 if(!access || !access.active || access.expiresAt<=new Date() || !access.restaurant.active || !access.table.enabled) throw new ApiError(401,'Vínculo expirado. Solicite um novo código ao restaurante.');
 return access;
}
export async function event(restaurantId:string|null,actorUserId:string|null,action:string,subjectId?:string) {await db.activity.create({data:{restaurantId,actorUserId,action,subjectId}});}
