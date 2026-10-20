import { readFileSync, existsSync } from 'node:fs';
const routes=JSON.parse(readFileSync('docs/routes.json','utf8'));let count=0;
for(const [app,paths] of Object.entries(routes)){
 for(const path of paths){for(const root of [`apps/${app}/src/app`,`src/app/${app}`]){const file=`${root}/${path?path+'/':''}page.tsx`;if(!existsSync(file))throw new Error(`Missing ${file}`);}count++;}
 for(const name of ['layout','error','loading','not-found'])if(!existsSync(`apps/${app}/src/app/${name}.tsx`))throw new Error(`Missing ${app}/${name}`);
}
for(const name of ['auth','restaurants','users','tables','devices','terminals','categories','products','orders','kitchen','bills','payments','payment-providers','service-requests','subscriptions','reports','audit'])if(!existsSync(`apps/api/src/modules/${name}/routes.ts`))throw new Error(`Missing module ${name}`);
console.log(`${count} frontend routes verified in standalone apps and integrated gateway; 17 API modules present.`);
