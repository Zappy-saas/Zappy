import { db, staff, table } from './context';
// Database-backed change hints work across application instances. Clients fetch authorized data again.
export async function events(request:Request,mesa=false) {
 const p=mesa?await table():await staff();let cleanup=()=>{};
 const stream=new ReadableStream<Uint8Array>({start(controller){
  let closed=false,busy=false,last='';const encoder=new TextEncoder();
  const close=()=>{if(closed)return;closed=true;clearInterval(timer);clearTimeout(deadline);request.signal.removeEventListener('abort',close);try{controller.close();}catch{}};
  cleanup=close;
  const tick=async()=>{if(busy||closed)return;busy=true;try{
   // Revalidate revocation and expiry on every heartbeat.
   if(mesa)await table();else await staff();
   const [orders,resources]=await Promise.all([
    db.order.aggregate({where:{restaurantId:p.restaurantId,...(mesa?{accessId:p.id}:{})},_max:{updatedAt:true},_count:true}),
    db.resource.aggregate({where:{restaurantId:p.restaurantId},_max:{updatedAt:true},_count:true})]);
   const revision=JSON.stringify([orders._max.updatedAt,orders._count,resources._max.updatedAt,resources._count]);
   if(!closed){controller.enqueue(encoder.encode(revision===last?': heartbeat\n\n':'data: {"changed":true}\n\n'));last=revision;}
  }catch{close();}finally{busy=false;}};
  const timer=setInterval(()=>void tick(),3000);const deadline=setTimeout(close,20000);
  request.signal.addEventListener('abort',close,{once:true});void tick();
 },cancel(){cleanup();}});
 return new Response(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-store','Connection':'keep-alive','X-Accel-Buffering':'no'}});
}
