import { readFile } from 'node:fs/promises';
const readiness = JSON.parse(await readFile(new URL('./release-readiness.json',import.meta.url),'utf8'));
if (readiness.missing.length) {
  console.error(JSON.stringify({status:'blocked',scope:readiness.scope,missing:readiness.missing}));
  process.exitCode=1;
} else {
  console.log(JSON.stringify({status:'requires-staging-validation-and-external-access',scope:readiness.scope}));
}
