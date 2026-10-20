import { Prisma } from '@prisma/client';
import { orderInput, transitions, type OrderItem } from '../../../../packages/shared/src/domain';
import { db, table, staff, ApiError } from './context';
export async function placeOrder(input:unknown) {
 const a=await table(); const data=orderInput.parse(input);
 // Advisory lock serializes retries for this table session, including across server instances.
 return db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${a.tableId}))`;
  const current=await tx.tableAccess.findUnique({where:{id:a.id}});if(!current?.active || current.expiresAt<=new Date())throw new ApiError(401,'Vínculo da mesa expirado ou revogado.');
  const existing=await tx.order.findUnique({where:{accessId_requestKey:{accessId:a.id,requestKey:data.requestKey}}}); if(existing) return existing;
  const items:OrderItem[]=[];
  for(const item of data.items) {
   const product=await tx.resource.findFirst({where:{id:item.productId,restaurantId:a.restaurantId,kind:'products',enabled:true}});
   const p=product?.data as Record<string,unknown>|undefined;
   if(!p || !p.available) throw new ApiError(409,'Um produto não está mais disponível. Atualize o cardápio.');
   items.push({...item,name:String(p.name),price:Number(p.price)});
  }
  const order=await tx.order.create({data:{restaurantId:a.restaurantId,accessId:a.id,requestKey:data.requestKey,items:items as unknown as Prisma.InputJsonValue,total:items.reduce((s,i)=>s+i.price*i.quantity,0)}});
  await tx.activity.create({data:{restaurantId:a.restaurantId,action:'order.created',subjectId:order.id}}); return order;
 });
}
export async function listOrders(mesa=false) {
 const p=mesa?await table():await staff();
 const rows=await db.order.findMany({where:{restaurantId:p.restaurantId,...(mesa?{accessId:p.id}:{})},orderBy:{createdAt:'desc'},take:200,include:{access:{select:{table:{select:{data:true}}}}}});
 return rows.map(({access,...r})=>({...r,tableName:String((access.table.data as Record<string,unknown>).name)}));
}
export async function transitionOrder(id:string,status:string) {
 const p=await staff();
 const allowed=p.role==='KITCHEN'?['PREPARING','READY']:p.role==='WAITER'?['DELIVERED']:['OWNER','MANAGER'].includes(p.role)?['PREPARING','READY','DELIVERED','CANCELLED']:[];
 if(!allowed.includes(status)) throw new ApiError(403,'Seu perfil não permite esta alteração.');
 return db.$transaction(async tx=>{
 const order=await tx.order.findFirst({where:{id,restaurantId:p.restaurantId}});
 if(!order) throw new ApiError(404,'Pedido não encontrado.');
 if(!transitions[order.status]?.includes(status)) throw new ApiError(409,'O pedido mudou de estado. Atualize a tela.');
 const changed=await tx.order.updateMany({where:{id,restaurantId:p.restaurantId,status:order.status},data:{status}});
 if(!changed.count) throw new ApiError(409,'Outro operador já alterou este pedido.');
 await tx.activity.create({data:{restaurantId:p.restaurantId,actorUserId:p.userId,action:`order.${status}`,subjectId:id}});
 return {ok:true};
 });
}
