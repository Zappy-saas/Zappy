/** Build-time client generation without downloading native engines; local-only migrations.
 * Uses Prisma's pinned npm-distributed generator and WASM migration engine.
 * Internal APIs are version-sensitive: upgrade these packages together and run integration tests.
 */
import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { getGenerators } from '@prisma/internals';
import { PrismaClientJsGenerator } from '@prisma/client-generator-js';
import { bindMigrationAwareSqlAdapterFactory } from '@prisma/driver-adapter-utils';
import { PrismaPg } from '@prisma/adapter-pg';
async function main() {
  const command = process.argv[2];
  const root = path.resolve(import.meta.dirname, '..');
  const schemaPath = path.join(root, 'prisma/schema.prisma');
  if (command === 'generate') {
    const generators = await getGenerators({schemaPath, registry: {'prisma-client-js': {type: 'in-process', generator: new PrismaClientJsGenerator({cliCommand: 'generate', runtimePath: path.join(root, 'node_modules/@prisma/client/runtime')})}}, skipDownload: true, cliCommand: 'generate'});
    try { for (const generator of generators) await generator.generate(); }
    finally { for (const generator of generators) generator.stop(); }
    console.log('Prisma client generated from verified npm packages.');
    return;
  }
  if (command !== 'migrate') throw new Error('Expected generate or migrate.');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required.');
  const url = new URL(connectionString);
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || process.env.NODE_ENV === 'production') throw new Error('Portable migration runner is restricted to local development. Use prisma migrate deploy for production.');
  const baseDir = path.join(root, 'prisma/migrations');
  const entries = await readdir(baseDir, {withFileTypes: true});
  const migrationDirectories = await Promise.all(entries.filter(e=>e.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name)).map(async e=>({path:e.name,migrationFile:{path:'migration.sql',content:{tag:'ok' as const,value:await readFile(path.join(baseDir,e.name,'migration.sql'),'utf8')}}})));
  const adapter = bindMigrationAwareSqlAdapterFactory(new PrismaPg({connectionString}));
  const runtime = await import('@prisma/schema-engine-wasm/schema_engine_bg');
  const require = createRequire(import.meta.url);
  const wasmPath = path.join(path.dirname(require.resolve('@prisma/schema-engine-wasm/schema_engine_bg')), 'schema_engine_bg.wasm');
  const wasm = await WebAssembly.instantiate(await readFile(wasmPath), {'./schema_engine_bg.js': runtime});
  runtime.__wbg_set_wasm(wasm.instance.exports);
  (wasm.instance.exports.__wbindgen_start as () => void)();
  const engine = await runtime.SchemaEngine.new({datamodels: [[schemaPath, await readFile(schemaPath,'utf8')]]}, ()=>{}, adapter);
  try {
    const result = await engine.applyMigrations({migrationsList: {baseDir,lockfile:{path:'migration_lock.toml',content:await readFile(path.join(baseDir,'migration_lock.toml'),'utf8')},shadowDbInitScript:'',migrationDirectories},filters:{externalTables:[],externalEnums:[]}});
    console.log(JSON.stringify(result));

  } finally { engine.free(); }
}
main().catch(error=>{console.error(error instanceof Error ? error.message : 'Prisma operation failed');process.exitCode=1;});
