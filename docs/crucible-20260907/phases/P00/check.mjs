import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function run(args, quiet = false) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  if (!quiet) process.stdout.write((result.stdout ?? '') + (result.stderr ?? ''));
  assert.ifError(result.error);
  assert.equal(result.status, 0, `Command failed: node ${args.join(' ')}`);
}
assert.throws(() => run(['-e', 'process.exit(17)'], true));

function checkInstructions(text) {
  assert.doesNotMatch(text, /NestJS|Meilisearch|GCP|flyer generat|QR referral|no source code has been implemented/i);
  for (const required of ['Next.js', 'Supabase', 'USD 1', 'Railway', 'OpenRouter', 'No numerical', 'Opus', 'P00', 'Expo/React Native', 'iOS App Store', 'Android']) {
    assert.ok(text.includes(required), `Missing current instruction: ${required}`);
  }
}
function checkRuntime(text) { assert.match(text, /^\s*environment:\s*'node'/m); }
assert.throws(() => checkRuntime("environment: 'jsdom'"));

function checkCronReport(report) {
  assert.equal(report.success, true);
  const cases = report.testResults.flatMap(file => file.assertionResults);
  for (const name of ['embeddings', 'recommendations']) {
    const group = cases.filter(test => test.ancestorTitles.includes(`${name} cron authorization`));
    // Six denial scenarios, two valid credentials paused before work, and failing dependencies never started.
    assert.equal(group.length, 9, `Missing ${name} regression cases`);
    assert.equal(group.filter(test => test.title.startsWith('rejects secret=')).length, 6);
    assert.equal(group.filter(test => test.title.startsWith('allows configured credential')).length, 2);
    assert.equal(group.filter(test => test.title === 'does not start failing dependencies after valid authorization').length, 1);
    assert.equal(new Set(group.map(test => test.title)).size, group.length);
    assert.ok(group.every(test => test.status === 'passed'));
  }
}
assert.throws(() => checkCronReport({ success: true, testResults: [] }));

const command = process.argv[2];
if (command === 'instructions') {
  const text = readFileSync('CLAUDE.md', 'utf8');
  for (const directive of ['Build with NestJS', 'Build flyer generation', 'Build QR referrals', 'Use Meilisearch', 'Deploy to GCP']) {
    assert.throws(() => checkInstructions(text + '\n' + directive));
  }
  checkInstructions(text);
} else if (command === 'cron' || command === 'suite') {
  checkRuntime(readFileSync('vitest.config.ts', 'utf8'));
  // Unique temporary output prevents a stale report from satisfying this run.
  const reportPath = join(mkdtempSync(join(tmpdir(), 'whats-poppin-gate-')), 'report.json');
  const selection = command === 'cron' ? ['tests/api/cron-auth.test.ts'] : ['--coverage'];
  run(['node_modules/vitest/vitest.mjs', 'run', ...selection, '--no-file-parallelism', '--reporter=json', `--outputFile=${reportPath}`]);
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  checkCronReport(report);
  const missingCase = structuredClone(report);
  const cronFile = missingCase.testResults.find(file => file.assertionResults.some(test => test.ancestorTitles.includes('embeddings cron authorization')));
  cronFile.assertionResults.shift();
  assert.throws(() => checkCronReport(missingCase));
  if (command === 'suite') {
    // Baseline observed 21 existing tests; additions must not erase their coverage.
    assert.ok(report.numPassedTests >= 39);
    for (const file of ['utils.test.ts', 'embeddings.test.ts']) {
      assert.ok(report.testResults.some(test => test.name.replaceAll('\\', '/').endsWith(`/tests/ai/${file}`) && test.status === 'passed'));
    }
  }
  console.log(`Verified ${report.numPassedTests} passing tests from a fresh report.`);
} else {
  const commands = {
    types: ['node_modules/typescript/bin/tsc', '--noEmit'],
    lint: ['node_modules/eslint/bin/eslint.js', 'src/app/api/cron/update-embeddings/route.ts', 'src/app/api/cron/update-recommendations/route.ts', 'tests/api/cron-auth.test.ts', 'tests/api/containment.test.ts', 'vitest.config.ts', '--max-warnings', '0'],
  };
  assert.ok(Object.hasOwn(commands, command), 'Unknown check');
  if (command === 'types') {
    const canary = join(mkdtempSync(join(tmpdir(), 'whats-poppin-types-')), 'canary.ts');
    const args = ['node_modules/typescript/bin/tsc', '--noEmit', '--skipLibCheck', '--types', 'node', canary];
    writeFileSync(canary, 'const canaryNumber: number = 1;', 'ascii');
    run(args, true);
    writeFileSync(canary, 'const canaryNumber: number = "invalid";', 'ascii');
    const bad = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.ifError(bad.error);
    assert.equal(bad.status, 2);
    assert.match(bad.stdout, /TS2322/);
  } else {
    const bad = spawnSync(process.execPath, ['node_modules/eslint/bin/eslint.js', '--stdin', '--stdin-filename', 'src/app/api/cron/update-embeddings/route.ts'], { input: 'const =', encoding: 'utf8' });
    assert.ifError(bad.error);
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /Parsing error/);
  }
  run(commands[command]);
}
console.log(`P00_${command.toUpperCase()}_VERIFIED`);
