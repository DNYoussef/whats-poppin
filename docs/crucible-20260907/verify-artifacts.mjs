// Mechanical document checks. Semantic completeness belongs to the Opus audit.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const dir = 'docs/crucible-20260907';
const ascii = text => /^[\x00-\x7f]*$/.test(text);
assert.equal(ascii(String.fromCharCode(233)), false);
assert.equal(ascii('plain ASCII'), true);
assert.throws(() => JSON.parse(''));
assert.throws(() => JSON.parse('{invalid'));
assert.deepEqual(JSON.parse('{}'), {});
const files = fs.readdirSync(dir).filter(p => /\.(md|mjs|json|txt|py)$/.test(p));
for (const required of ['PLAN.md', 'CLAIMS.md', 'RESEARCH.md', 'AUDIT.md', 'GATES.md', 'graph-evidence.json']) {
  assert.ok(files.includes(required), `Missing ${required}`);
}
let links = 0;
function verifyLink(base, target) {
  assert.ok(fs.existsSync(path.resolve(base, target.split('#')[0])), `Broken local link: ${target}`);
}
assert.throws(() => verifyLink(dir, 'deliberately-missing-evidence-canary'));
for (const name of files) {
  const text = fs.readFileSync(path.join(dir, name), 'utf8');
  assert.ok(ascii(text), `Non-ASCII content: ${name}`);
  if (name.endsWith('.json')) JSON.parse(text);
  if (!name.endsWith('.md')) continue;
  for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^https?:/.test(m[1]) || m[1].startsWith('#')) continue;
    const target = m[1].split('#')[0];
    verifyLink(dir, target);
    links++;
  }
}
assert.ok(links > 0, 'No local evidence links checked');
// Anchor to the inspected baseline so committing this plan cannot hide app changes.
const baseline = '17998d8cb20bc44a9ca04113ea9236f9f9279e1a';
const tracked = execFileSync('git', ['diff', baseline, '--name-only', '-z'], { encoding: 'utf8' });
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' });
const changed = (tracked + untracked).split('\0').filter(Boolean);
const isPlan = p => p.startsWith(dir + '/');
function verifyChanges(paths) {
  assert.ok(paths.length > 0, 'No changed planning artifacts observed');
  assert.ok(paths.every(isPlan), `Application edits: ${paths.filter(p => !isPlan(p))}`);
}
assert.throws(() => verifyChanges([`${dir}/PLAN.md`, 'src/canary.ts']));
assert.throws(() => verifyChanges([]));
verifyChanges(changed);
console.log('PLAN_ARTIFACTS_VERIFIED');
