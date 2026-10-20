import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/lib/password';
import { can } from '../src/lib/permissions';
import { assertOrigin, jsonBody } from '../src/lib/http';
test('passwords use independent salts; verification rejects incorrect passwords', async()=>{
  const a = await hashPassword('very-long-test-password'); const b = await hashPassword('very-long-test-password');
  assert.notEqual(a,b); assert(!a.includes('very-long-test-password'));
  assert(await verifyPassword('very-long-test-password',a)); assert(!await verifyPassword('wrong',a));
  assert(!await verifyPassword('anything','invalid'));
});
test('least privilege for operational roles',()=>{
  for (const role of ['WAITER','KITCHEN','CASHIER'] as const) { assert(can(role,'restaurant:read')); assert(!can(role,'restaurant:write')); assert(!can(role,'members:read')); assert(!can(role,'audit:read')); }
  assert(can('OWNER','restaurant:write')); assert(can('MANAGER','members:read'));
});
test('mutation requires the configured Origin; missing and cross-site origins fail',()=>{
  process.env.APP_ORIGIN='http://localhost:3000';
  assert.doesNotThrow(()=>assertOrigin(new Request('http://localhost:3000',{headers:{origin:'http://localhost:3000'}})));
  assert.throws(()=>assertOrigin(new Request('http://localhost:3000')));
  assert.throws(()=>assertOrigin(new Request('http://localhost:3000',{headers:{origin:'https://evil.example'}})));
});
test('JSON parser rejects oversized bodies even without content length',async()=>{
  const request = new Request('http://localhost:3000',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'a'.repeat(17000)})});
  await assert.rejects(()=>jsonBody(request), /muito grande/);
  await assert.rejects(()=>jsonBody(new Request('http://localhost:3000',{method:'POST',headers:{'content-type':'application/json'},body:'{'})), /inválido/);
});
