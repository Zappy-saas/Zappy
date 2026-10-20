import 'dotenv/config';
import { z } from 'zod';
import { db } from '../packages/database/src/client';
async function main(){
 const email=z.email().parse(process.env.PLATFORM_ADMIN_EMAIL).toLowerCase();
 const user=await db.user.findUniqueOrThrow({where:{email}});
 if(!await db.restaurantMembership.findFirst({where:{userId:user.id,active:true,restaurant:{active:true}}}))throw new Error('Account must have an active membership to sign in.');
 await db.$transaction(async tx=>{await tx.user.update({where:{id:user.id},data:{platformAdmin:true}});await tx.activity.create({data:{action:'platform.admin.granted-by-cli',subjectId:user.id}});});
 console.log('Platform administrator granted to the existing account.');
}
main().catch(()=>{console.error('Grant failed. Check PLATFORM_ADMIN_EMAIL and existing membership.');process.exitCode=1;}).finally(()=>db.$disconnect());
