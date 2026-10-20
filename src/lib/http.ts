import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getPrincipal } from './auth';
import { can, type Permission } from './permissions';
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function authorize(permission: Permission) {
  const principal = await getPrincipal();
  if (!principal) throw new ApiError(401, 'Sua sessão expirou. Entre novamente.');
  if (!can(principal.role, permission)) throw new ApiError(403, 'Seu perfil não permite esta ação.');
  return principal;
}
export function assertOrigin(request: Request) {
  if (!process.env.APP_ORIGIN) throw new Error('APP_ORIGIN is required');
  if (request.headers.get('origin') !== process.env.APP_ORIGIN) throw new ApiError(403, 'Origem da solicitação não permitida.');
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new ApiError(403, 'Solicitação entre sites bloqueada.');
}
export async function jsonBody(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ApiError(415, 'Envie os dados no formato JSON.');
  // Read at most 16 KiB even when Content-Length is omitted or misleading.
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'Corpo da solicitação vazio.');
  let size = 0; const chunks: Uint8Array[] = [];
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16384) { await reader.cancel(); throw new ApiError(413, 'Solicitação muito grande.'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ApiError(400, 'JSON inválido.'); }
}
export function fail(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({error: error.message}, {status: error.status});
  if (error instanceof ZodError) return NextResponse.json({error: 'Revise os campos informados.', fields: error.flatten().fieldErrors}, {status: 400});
  console.error(JSON.stringify({event: 'request.failed', type: error instanceof Error ? error.name : 'UnknownError'}));
  return NextResponse.json({error: 'Não foi possível concluir. Tente novamente em instantes.'}, {status: 500});
}
