import { Prisma } from '@prisma/client';
import { resourceSchemas, type ResourceKind } from '../../../../packages/shared/src/domain';
import { db, staff, manager, ApiError } from './context';
export async function listResources(kind: ResourceKind) {
 const p=await staff(); return db.resource.findMany({where:{restaurantId:p.restaurantId,kind},orderBy:{createdAt:'asc'},take:500});
}
export async function saveResource(kind:ResourceKind,input:unknown,id?:string) {
 const p=await manager(); const data=resourceSchemas[kind].parse(input);
 return db.$transaction(async tx=>{
  for (const [field,target] of [['categoryId','categories'],['tableId','tables']] as const) {
   const ref=(data as Record<string,unknown>)[field];
   if(ref && !await tx.resource.findFirst({where:{id:String(ref),restaurantId:p.restaurantId,kind:target,enabled:true}})) throw new ApiError(400,'Referência inválida ou de outro restaurante.');
  }
  if(id && !await tx.resource.findFirst({where:{id,restaurantId:p.restaurantId,kind}})) throw new ApiError(404,'Registro não encontrado.');
  const result=id?await tx.resource.update({where:{id},data:{data:data as Prisma.InputJsonValue}}):await tx.resource.create({data:{restaurantId:p.restaurantId,kind,data:data as Prisma.InputJsonValue}});
  await tx.activity.create({data:{restaurantId:p.restaurantId,actorUserId:p.userId,action:`${kind}.${id?'updated':'created'}`,subjectId:result.id}}); return result;
 });
}
export async function disableResource(kind:ResourceKind,id:string) {
 const p=await manager(); return db.$transaction(async tx=>{
 const r=await tx.resource.updateMany({where:{id,restaurantId:p.restaurantId,kind},data:{enabled:false}});
 if(!r.count) throw new ApiError(404,'Registro não encontrado.');
 await tx.activity.create({data:{restaurantId:p.restaurantId,actorUserId:p.userId,action:`${kind}.disabled`,subjectId:id}});return {ok:true};});
}
