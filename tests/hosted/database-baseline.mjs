import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { verifyProfilePrivacy } from './profile-privacy.mjs';

assert.ok(process.platform === 'linux' && process.env.GITHUB_ACTIONS === 'true', 'HOSTED_ONLY: run on GitHub Ubuntu, never local Docker');
const workdir = 'tests/hosted';
const config = readFileSync(`${workdir}/supabase/config.toml`, 'utf8');
assert.match(config, /^project_id = "whats-poppin-ci"$/m);
const status = JSON.parse(execFileSync('supabase', ['status', '--workdir', workdir, '--output', 'json'], { encoding: 'utf8', timeout: 30_000 }));
const api = new URL(status.API_URL);
assert.ok(['127.0.0.1', 'localhost'].includes(api.hostname));
assert.equal(api.protocol, 'http:');
assert.equal(api.port, '54321');
const key = status.ANON_KEY || status.PUBLISHABLE_KEY;
assert.ok(key, 'Disposable API key missing; do not substitute a hosted-project credential');
for (const path of ['/auth/v1/health', '/rest/v1/']) {
  const response = await fetch(new URL(path, api), { headers: { apikey: key }, signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200, `Disposable service readiness failed: ${path}`);
}

function sql(input, mustPass = true) {
  const result = spawnSync('docker', ['exec', '-i', 'supabase_db_whats-poppin-ci', 'psql', '-U', 'postgres', '-d', 'postgres', '-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1'], { input, encoding: 'utf8', timeout: 120_000 });
  if (mustPass) assert.equal(result.status, 0, result.stderr || String(result.error));
  return result;
}
const control = sql("BEGIN; CREATE TEMP TABLE gate_control (value text NOT NULL); INSERT INTO gate_control VALUES ('poppin-write-canary'); SELECT value FROM gate_control; ROLLBACK;");
assert.ok(control.stdout.split(/\r?\n/).includes('poppin-write-canary'));
for (const path of ['src/database/migrations/001_initial_schema.sql', 'src/database/migrations/002_enable_rls.sql']) {
  sql(readFileSync(path, 'utf8'));
}
const versions = sql("SELECT json_object_agg(extname, extversion) FROM pg_extension WHERE extname IN ('postgis', 'vector', 'uuid-ossp');").stdout.trim();
const extensions = JSON.parse(versions);
assert.deepEqual(Object.keys(extensions).sort(), ['postgis', 'uuid-ossp', 'vector']);
console.log('BASELINE_EXTENSION_VERSIONS', versions);
const malformed = sql(readFileSync('supabase/migrations/20251002_event_designs.sql', 'utf8'), false);
assert.notEqual(malformed.status, 0, 'C11 changed: replace its expected-failure baseline with migration success gates');
assert.match(malformed.stderr, /syntax error at or near "WHERE"/);
assert.ok(sql("SELECT 'poppin-after-failure-canary';").stdout.includes('poppin-after-failure-canary'));
console.log('C11_SYNTAX_FAILURE_REPRODUCED');
console.log('HOSTED_BASELINE_REPRODUCED');
await verifyProfilePrivacy({ api, key, sql });
