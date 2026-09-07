// Source-level baseline probes, not a certification of the deployed app.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const read = p => fs.readFileSync(p, 'utf8');
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
function calls(text, name) {
  const source = ts.createSourceFile('probe.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let count = 0;
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(source) === name) count++;
    ts.forEachChild(node, visit);
  }
  visit(source);
  return count;
}
function load(file, dependencies) {
  const exports = {};
  const js = ts.transpileModule(read(file), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020
  }}).outputText;
  vm.runInNewContext(js, { exports, process: { env: {} }, console,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency ${name}`);
      return dependencies[name];
    }
  }, { filename: file });
  return exports;
}

assert.equal(calls('function initSupabase() {}', 'initSupabase'), 0);
assert.equal(calls('initSupabase("canary", "key")', 'initSupabase'), 1);
assert.throws(() => assert.equal(calls('initSupabase()', 'initSupabase'), 0));
const sourceFiles = files('src').filter(p => /\.tsx?$/.test(p));
assert.equal(sourceFiles.reduce((n, p) => n + calls(read(p), 'initSupabase'), 0), 0);

const marker = { canary: 'initialized-client' };
const db = load('src/lib/database.ts', { '@supabase/supabase-js': { createClient: () => marker } });
assert.throws(() => db.getSupabase(), /Supabase client not initialized/);
db.initSupabase('https://fixture.invalid', 'fixture');
assert.equal(db.getSupabase(), marker);

const createPage = read('src/app/create-event/CreateEventPageClient.tsx');
const organizer = createPage.match(/organizer_id:\s*'([^']+)'/)[1];
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
assert.ok(uuid.test('00000000-0000-4000-8000-000000000001'));
assert.ok(!uuid.test(organizer));
assert.match(read('src/database/migrations/001_initial_schema.sql'), /organizer_id UUID/);

const sql = files('src/database/migrations').concat(files('supabase/migrations'))
  .filter(p => p.endsWith('.sql')).map(read).join('\n').replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '');
const hasTable = (text, name) => new RegExp(`CREATE TABLE(?: IF NOT EXISTS)? ${name}\\s*\\(`, 'i').test(text);
assert.ok(hasTable(sql, 'profiles'));
assert.ok(hasTable(sql + '\nCREATE TABLE user_preferences (id uuid);', 'user_preferences'));
assert.throws(() => assert.equal(hasTable('CREATE TABLE user_preferences (id uuid);', 'user_preferences'), false));
assert.equal(hasTable(sql, 'user_preferences'), false);
assert.match(read('src/lib/ai/database.ts'), /\.from\('user_preferences'\)/);

const allowed = sql.match(/interaction_type IN \(([^)]+)\)/)[1];
assert.match(allowed, /'save'/);
assert.ok(!allowed.includes("'saved'"));
assert.match(read('src/lib/ai/preferences.ts'), /'viewed', 'saved', 'rsvp', 'attended'/);

let workerCalls = 0;
const cron = load('src/app/api/cron/update-embeddings/route.ts', {
  'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
  '@/lib/ai/database': { getEventsWithoutEmbeddings: async () => { workerCalls++; return []; } },
  '@/lib/ai/embeddings': {}, '@/lib/ai/utils': {}
});
const response = await cron.GET({ headers: { get: () => null } });
assert.equal(response.status, 200);
assert.equal(workerCalls, 1);
// A fail-closed oracle must reject this observed behavior.
assert.throws(() => assert.equal(workerCalls, 0));

const dates = load('src/lib/date-utils.ts', {});
assert.equal(dates.formatPrice(2500), '$25.00');
assert.equal(dates.formatPrice(89.99), '$0.90');
assert.throws(() => assert.equal(dates.formatPrice(89.99), '$89.99'));
assert.match(read('src/database/migrations/003_seed_data.sql'), /89\.99, 'published'/);
assert.match(read('src/database/migrations/001_initial_schema.sql'), /Ticket price in USD/);
assert.match(createPage, /Math\.round\(parseFloat\(formData\.price\) \* 100\)/);

console.log(JSON.stringify({
  observations: {
    directInitializerCalls: 0,
    uninitializedDatabaseThrows: true,
    invalidOrganizerId: organizer,
    userPreferencesTableMissingFromBundledMigrations: true,
    interactionContractMismatch: true,
    cronWithoutSecretReachedWorker: true,
    seededDollarPriceFormattedAsCents: true
  },
  limits: 'Isolated module and source probes. No deployed database or external AI service was contacted.'
}, null, 2));
console.log('BASELINE_EVIDENCE_VERIFIED');
