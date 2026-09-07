import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import yaml from 'js-yaml';

const rootBytes = readFileSync('package-lock.json');
const checkLock = bytes => assert.equal(
  createHash('sha256').update(bytes.toString('utf8').replaceAll('\r\n', '\n')).digest('hex'),
  readFileSync('tests/mobile/root-lock.sha256', 'utf8').trim(),
);
// Git uses LF; Windows checkout uses CRLF. Only line endings are normalized.
assert.throws(() => checkLock(Buffer.concat([rootBytes, Buffer.from(' ')])));
checkLock(rootBytes);
const verifyWorkflow = workflow => {
  assert.deepEqual(Object.keys(workflow.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.ok(!JSON.stringify(workflow).includes('secrets.'));
  const job = workflow.jobs['mobile-boundary'];
  assert.equal(job['runs-on'], 'ubuntu-24.04');
  assert.equal(job.permissions, undefined);
  assert.equal(job.steps[0].with['persist-credentials'], false);
  assert.equal(job.steps[1].with['node-version'], '22.22.0');
  for (const step of job.steps) if (step.uses) assert.match(step.uses, /@[a-f0-9]{40}$/);
  assert.deepEqual(job.steps.filter(step => step.run).map(step => step.run), [
    'npm ci', 'npm ci --prefix apps/mobile', 'node tests/mobile/check-boundary.mjs', 'npm run bundle --prefix apps/mobile',
  ]);
};
const workflow = yaml.load(readFileSync('.github/workflows/mobile.yml', 'utf8'));
verifyWorkflow(workflow);
const missingBundle = structuredClone(workflow);
missingBundle.jobs['mobile-boundary'].steps.pop();
assert.throws(() => verifyWorkflow(missingBundle));
const root = JSON.parse(readFileSync('package.json', 'utf8'));
const mobile = JSON.parse(readFileSync('apps/mobile/package.json', 'utf8'));
const lock = JSON.parse(readFileSync('apps/mobile/package-lock.json', 'utf8'));
assert.equal(root.workspaces, undefined);
const independentLock = candidate => {
  for (const [path, entry] of Object.entries(candidate.packages)) {
    assert.ok(path === '' || (path.startsWith('node_modules/') && !path.split('/').includes('..')), `External package path: ${path}`);
    assert.notEqual(entry.link, true, `Linked package: ${path}`);
    if (entry.resolved) assert.match(entry.resolved, /^https:\/\//, `Local resolution: ${path}`);
  }
};
independentLock(lock);
const linkedLock = structuredClone(lock);
linkedLock.packages['node_modules/whats-poppin'] = { resolved: '../..', link: true };
assert.throws(() => independentLock(linkedLock));
const parentLock = structuredClone(lock);
parentLock.packages['../..'] = {};
assert.throws(() => independentLock(parentLock));
for (const group of ['dependencies', 'devDependencies', 'optionalDependencies']) {
  assert.equal(mobile[group]?.[root.name], undefined);
}
assert.equal(mobile.private, true);
assert.deepEqual(lock.packages[''].dependencies, mobile.dependencies);
assert.deepEqual(lock.packages[''].devDependencies, mobile.devDependencies);
const run = (args, cwd = process.cwd()) => {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 120000 });
  assert.ifError(result.error);
  return result;
};
const success = result => assert.equal(result.status, 0, result.stdout + result.stderr);
const mobileTypes = () => run(['node_modules/typescript/bin/tsc', '--noEmit'], 'apps/mobile');
success(mobileTypes());
const typeCanary = 'apps/mobile/boundary-canary.ts';
const testCanary = 'apps/mobile/boundary-canary.test.ts';
let wroteType = false;
let wroteTest = false;
try {
  writeFileSync(typeCanary, 'export const mobileBoundaryCanary: string = 42;\n', { flag: 'wx' }); wroteType = true;
  writeFileSync(testCanary, "throw new Error('MOBILE_TEST_MUST_NOT_ENTER_WEB');\n", { flag: 'wx' }); wroteTest = true;
  const bad = mobileTypes();
  assert.notEqual(bad.status, 0);
  assert.match(bad.stdout + bad.stderr, /boundary-canary.ts.*TS2322/);
  success(run(['node_modules/typescript/bin/tsc', '--noEmit', '--strict']));
  const reportPath = join(mkdtempSync(join(tmpdir(), 'poppin-mobile-boundary-')), 'tests.json');
  success(run(['node_modules/vitest/vitest.mjs', 'run', '--reporter=json', `--outputFile=${reportPath}`]));
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  assert.equal(report.success, true);
  assert.ok(report.numPassedTests >= 96);
  assert.ok(report.testResults.every(file => !file.name.replaceAll('\\', '/').includes('/apps/mobile/')));
  console.log('MOBILE_FAILURE_ISOLATED_FROM_WEB');
} finally {
  if (wroteTest) unlinkSync(testCanary);
  if (wroteType) unlinkSync(typeCanary);
}
success(mobileTypes());
assert.deepEqual(readFileSync('package-lock.json'), rootBytes);
checkLock(rootBytes);
console.log('MOBILE_BOUNDARY_VERIFIED');
