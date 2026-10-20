import 'dotenv/config';
import { spawn } from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const names=['mesa','restaurante','cozinha','admin','api'];
const mode=process.argv[2]??'build';
const env={...process.env,APP_ORIGINS:process.env.APP_ORIGINS??names.map((_,i)=>`http://localhost:${3001+i}`).join(',')};
const next=path.join(root,'node_modules/next/dist/bin/next');
function run(args,cwd){return spawn(process.execPath,[next,...args],{cwd,stdio:'inherit',env});}
if(mode==='dev'){
 const children=names.map((name,i)=>run(['dev','--hostname','0.0.0.0','--port',String(3001+i)],path.join(root,'apps',name)));
 const stop=()=>{for(const c of children)c.kill('SIGTERM');};process.on('SIGINT',stop);process.on('SIGTERM',stop);
 for(const c of children)c.on('exit',code=>{if(code){stop();process.exitCode=code;}});
}else{
 for(const name of [...names,'gateway']){
  console.log(`\nBuilding ${name}`);
  const code=await new Promise(resolve=>run(['build'],name==='gateway'?root:path.join(root,'apps',name)).on('exit',resolve));
  if(code!==0)process.exit(code??1);
 }
}
