import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function run(args) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
}
const reportPath = join(mkdtempSync(join(tmpdir(), 'poppin-lifecycle-')), 'report.json');
run(['node_modules/vitest/vitest.mjs', 'run', 'tests/component-lifecycle.test.tsx', '--reporter=json', `--outputFile=${reportPath}`]);
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const cases = [
  'event detail reloads only when the event ID changes',
  'design requests follow the event ID, not params object identity',
  'recommendations reload for user and limit changes without a render loop',
  'assistant starts once per opening, not on unrelated renders',
];
function verify(results) {
  assert.deepEqual(results.map(result => result.fullName.trim()).sort(), [...cases].sort());
  assert.ok(results.every(result => result.status === 'passed'));
}
assert.equal(report.success, true);
const results = report.testResults.flatMap(file => file.assertionResults);
verify(results);
assert.throws(() => verify(results.slice(1)));
assert.throws(() => verify(results.map((result, index) => index ? result : { ...result, status: 'failed' })));
run(['node_modules/eslint/bin/eslint.js', 'tests/component-lifecycle.test.tsx', '--max-warnings', '0']);
console.log('LIFECYCLE_VERIFIED');
