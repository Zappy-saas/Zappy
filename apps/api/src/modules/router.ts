import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertOrigin, fail, jsonBody } from '../../../../src/lib/http';
import { secureCookies } from '../../../../src/lib/auth';
import { resourceSchemas, type ResourceKind } from '../../../../packages/shared/src/domain';
import { staff, manager, table, db, ApiError, TABLE_COOKIE } from './context';
import * as categories from './categories/routes';
import * as products from './products/routes';
import * as tables from './tables/routes';
import * as devices from './devices/routes';
import * as terminals from './terminals/routes';
import { listResources, saveResource, disableResource } from './resources';
const resourceModules={categories,products,tables,devices,terminals};
import { listOrders, placeOrder, transitionOrder } from './orders-service';
import * as ops from './operations';
import { events } from './events';
export async function handle(request:Request,{params}:{params:Promise<{path:string[]}>}) {
 try {
  const {path}=await params;const [area,kind,id]=path;const method=request.method;
  if(method!=='GET')assertOrigin(request);
  if(area==='events' && method==='GET')return await events(request);
  if(area==='mesa' && kind==='events' && method==='GET')return await events(request,true);
  let result:unknown;
  if(area==='me' && method==='GET'){const p=await staff();result={name:p.user.name,restaurant:p.restaurant.name,role:p.role,platformAdmin:p.user.platformAdmin};}
  else if(area==='resources' && Object.hasOwn(resourceSchemas,kind)) {
   const resource=kind as ResourceKind;
   const module=Object.hasOwn(resourceModules,resource)?resourceModules[resource as keyof typeof resourceModules]:null;
   if(method==='GET')result=module?await module.list():await listResources(resource);
   else if(method==='POST'){const body=await jsonBody(request);result=module?await module.save(body):await saveResource(resource,body);}
   else if(method==='PATCH' && id){const body=await jsonBody(request);result=module?await module.save(body,id):await saveResource(resource,body,id);}
   else if(method==='DELETE' && id)result=module?await module.disable(id):await disableResource(resource,id);
   else throw new ApiError(405,'Método não permitido.');
  }
  else if(area==='orders' && method==='GET')result=await listOrders();
  else if(area==='orders' && kind && method==='PATCH')result=await transitionOrder(kind,z.object({status:z.string()}).strict().parse(await jsonBody(request)).status);
  else if(area==='tables' && kind && method==='POST')result=await ops.pairTable(kind);
  else if(area==='users' && method==='POST')result=await ops.createMember(await jsonBody(request));
  else if(area==='summary' && method==='GET')result=await ops.summary();
  else if(area==='audit' && method==='GET'){const p=await manager();result=await db.activity.findMany({where:{restaurantId:p.restaurantId},orderBy:{createdAt:'desc'},take:200});}
  else if(area==='service-requests' && kind && method==='PATCH')result=await ops.resolveService(kind);
  else if(area==='admin') {
   if(method==='GET')result=await ops.platformRead(kind);
   else if(method==='POST')result=await ops.platformWrite(kind,await jsonBody(request));
   else throw new ApiError(405,'Método não permitido.');
  }
  else if(area==='mesa') {
   if(kind==='session' && method==='POST') {
    const {token}=z.object({token:z.string().regex(/^[a-f0-9]{64}$/)}).strict().parse(await jsonBody(request));const a=await ops.tableLogin(token);
    const response=NextResponse.json({ok:true});response.cookies.set(TABLE_COOKIE,token,{path:'/',httpOnly:true,sameSite:'lax',secure:secureCookies(),maxAge:Math.floor((a.expiresAt.getTime()-Date.now())/1000)});response.headers.set('Cache-Control','no-store');return response;
   }
   if(kind==='catalog' && method==='GET')result=await ops.catalog();
   else if(kind==='orders' && method==='GET')result=await listOrders(true);
   else if(kind==='orders' && method==='POST')result=await placeOrder(await jsonBody(request));
   else if(kind==='bill' && method==='GET')result=await ops.bill();
   else if(kind==='service' && method==='POST')result=await ops.serviceRequest(await jsonBody(request));
   else if(kind==='service' && method==='GET'){const a=await table();result=(await db.resource.findMany({where:{restaurantId:a.restaurantId,kind:'service-requests'},take:500})).filter(r=>(r.data as Record<string,unknown>).accessId===a.id);}
   else if(kind==='payments'){await table();throw new ApiError(503,'Pagamento indisponível: provedor e terminal ainda não configurados. Solicite atendimento.');}
   else throw new ApiError(404,'Rota não encontrada.');
  }
  else throw new ApiError(404,'Rota não encontrada.');
  return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(error){return fail(error);}
}
