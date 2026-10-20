import test from 'node:test';
import assert from 'node:assert/strict';
import { validateHostedEnvironment } from '../deploy/runtime-config.mjs';
const valid = {NODE_ENV:'production',DEPLOYMENT_ENV:'staging',COOKIE_SECURE:'true',APP_ORIGIN:'https://staging.example.test',RESTAURANT_ORIGIN:'https://staging.example.test',DATABASE_URL:'postgresql://application:unit-test-secret@db.example.test/zappy?sslmode=verify-full',PAYMENTS_LIVE_ENABLED:'false'};
test('hosted configuration accepts verified TLS and secure same-origin cookies',()=>assert.deepEqual(validateHostedEnvironment(valid),[]));
test('hosted configuration refuses HTTP, insecure cookies and unverified database TLS',()=>{
  const errors=validateHostedEnvironment({...valid,APP_ORIGIN:'http://staging.example.test',COOKIE_SECURE:'false',DATABASE_URL:'postgresql://application:unit-test-secret@db.example.test/zappy?sslmode=require'});
  assert(errors.some(e=>e.includes('HTTPS')));assert(errors.some(e=>e.includes('COOKIE_SECURE')));assert(errors.some(e=>e.includes('verify-full')));
  assert(!JSON.stringify(errors).includes('unit-test-secret'));
});
test('refuses live payments, exposed secrets, administrative credentials and TLS bypasses',()=>{
  for(const changed of [{PAYMENTS_LIVE_ENABLED:'true'},{NEXT_PUBLIC_DATABASE_URL:'secret'},{OWNER_PASSWORD:'secret'},{NODE_TLS_REJECT_UNAUTHORIZED:'0'},{PGSSLMODE:'disable'}]) assert(validateHostedEnvironment({...valid,...changed}).length>0);
});
test('missing configuration and malformed origins fail closed',()=>{
  assert(validateHostedEnvironment({}).length>0);
  assert(validateHostedEnvironment({...valid,APP_ORIGIN:'https://staging.example.test/path'}).length>0);
  assert(validateHostedEnvironment({...valid,KITCHEN_ORIGIN:'http://kitchen.example.test'}).length>0);
});
