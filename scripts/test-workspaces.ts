import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { db } from '../packages/database/src/client';
import { hashPassword } from '../src/lib/password';
import { tokenDigest } from '../src/lib/auth';
async function main(){
const suffix=randomBytes(6).toString('hex'),password=randomBytes(24).toString('hex'),email=`workspaces-${suffix}@example.test`;
if(!process.env.DATABASE_URL||!['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname))throw new Error('Local test database required.');
let restaurantId='';
try{
 const r=await db.restaurant.create({data:{name:'Workspace check',slug:`workspace-${suffix}`,memberships:{create:{role:'OWNER',user:{create:{name:'Workspace test',email,passwordHash:await hashPassword(password)}}}}}});restaurantId=r.id;
 for(const port of [3001,3002,3003,3004,3005]){
  const base=`http://localhost:${port}`;
  assert.equal((await fetch(`${base}/api/health`)).status,200,`Health through ${port}`);
  const login=await fetch(`${base}/api/auth/login`,{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({restaurant:r.slug,email,password})});
  assert.equal(login.status,200,`Login through ${port}`);const cookie=login.headers.get('set-cookie')!.split(';')[0];
  const me=await fetch(`${base}/api/v1/me`,{headers:{cookie}});assert.equal(me.status,200);assert.equal((await me.json()).restaurant,r.name);
 }
 console.log('All five workspaces serve health checks and authenticated same-origin requests through the API.');
}finally{
 if(restaurantId){await db.authSession.deleteMany({where:{membership:{restaurantId}}});await db.restaurantMembership.deleteMany({where:{restaurantId}});await db.restaurant.delete({where:{id:restaurantId}});await db.user.deleteMany({where:{email}});await db.loginAttempt.deleteMany({where:{key:tokenDigest(email)}});}await db.$disconnect();
}

}
main().catch(()=>{console.error("Workspace smoke check failed; credentials were not logged.");process.exitCode=1;});
