import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

function verify(workflow) {
  assert.deepEqual(Object.keys(workflow.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.ok(!JSON.stringify(workflow).includes('secrets.'));
  assert.deepEqual(Object.keys(workflow.jobs).sort(), ['application-migrations', 'database-baseline', 'web-baseline']);
  for (const job of Object.values(workflow.jobs)) {
    assert.equal(job.permissions, undefined);
    assert.equal(job['runs-on'], 'ubuntu-24.04');
    assert.ok(job['timeout-minutes'] > 0 && job['timeout-minutes'] <= 30);
    const checkout = job.steps.find(step => step.uses?.startsWith('actions/checkout@'));
    assert.equal(checkout.with['persist-credentials'], false);
    assert.equal(job.steps.find(step => step.uses?.startsWith('actions/setup-node@')).with['node-version'], '22.22.0');
    for (const step of job.steps) if (step.uses) assert.match(step.uses, /@[a-f0-9]{40}$/);
  }
  assert.deepEqual(workflow.jobs['web-baseline'].env, {
    NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'ci-public-fixture',
  });
  const web = workflow.jobs['web-baseline'].steps;
  for (const command of ['node tests/security/next-patch.mjs', 'node tests/self-host/check-config.mjs', 'npm ci', 'node tests/hosted/check-workflow.mjs', 'npm run lint:ci', 'npm run typecheck:ci', 'npm run test:ci', 'npm run build', 'python -m pip install playwright==1.56.0', 'python -m playwright install --with-deps chromium', 'python tests/browser/containment.py']) assert.ok(web.some(step => step.run === command), command);
  assert.equal(web.find(step => step.uses?.startsWith('actions/setup-python@')).with['python-version'], '3.12');
  assert.ok(web.findIndex(step => step.run === 'python tests/browser/containment.py') > web.findIndex(step => step.run === 'npm run build'));
  const migrations = workflow.jobs['application-migrations'];
  assert.deepEqual(migrations.strategy, { 'fail-fast': false, matrix: { mode: ['fresh', 'upgrade'] } });
  for (const command of ['python tests/migrations/test_prepare.py', 'supabase start --workdir tests/hosted', 'python tests/migrations/hosted.py ${{ matrix.mode }}']) assert.ok(migrations.steps.some(step => step.run === command), command);
  assert.equal(migrations.steps.find(step => step.uses?.startsWith('supabase/setup-cli@')).with.version, '2.117.0');
  assert.equal(migrations.steps.find(step => step.uses?.startsWith('actions/setup-python@')).with['python-version'], '3.12');
  assert.ok(migrations.steps.some(step => step.if === 'always()' && step.run === 'supabase stop --workdir tests/hosted --no-backup'));
  const database = workflow.jobs['database-baseline'];
  assert.equal(database.steps.find(step => step.uses?.startsWith('supabase/setup-cli@')).with.version, '2.117.0');
  assert.ok(database.steps.some(step => step.run === 'supabase start --workdir tests/hosted'));
  assert.ok(database.steps.some(step => step.run === 'node tests/hosted/database-baseline.mjs'));
  assert.ok(database.steps.some(step => step.if === 'always()' && step.run === 'supabase stop --workdir tests/hosted --no-backup'));
}

const workflow = yaml.load(readFileSync('.github/workflows/baseline.yml', 'utf8'));
verify(workflow);
for (const mutate of [
  ...['python tests/migrations/test_prepare.py', 'supabase start --workdir tests/hosted', 'python tests/migrations/hosted.py ${{ matrix.mode }}', 'supabase stop --workdir tests/hosted --no-backup'].map(command => copy => { copy.jobs['application-migrations'].steps = copy.jobs['application-migrations'].steps.filter(step => step.run !== command); }),
  copy => { copy.jobs['application-migrations'].steps.find(step => step.uses?.startsWith('supabase/setup-cli@')).with.version = 'latest'; },
  copy => { copy.jobs['application-migrations'].strategy.matrix.mode = ['fresh']; },
  copy => { copy.jobs['application-migrations'].steps = copy.jobs['application-migrations'].steps.filter(step => !step.run?.startsWith('python tests/migrations/hosted.py')); },
  copy => { copy.jobs['web-baseline'].steps = copy.jobs['web-baseline'].steps.filter(step => step.run !== 'node tests/security/next-patch.mjs'); },
  copy => { copy.jobs['web-baseline'].steps = copy.jobs['web-baseline'].steps.filter(step => step.run !== 'node tests/self-host/check-config.mjs'); },
  copy => { copy.on.pull_request_target = {}; },
  copy => { copy.permissions.contents = 'write'; },
  copy => { copy.jobs['web-baseline'].steps[0].with['persist-credentials'] = true; },
  copy => { copy.env = { TOKEN: '${{ secrets.CANARY }}' }; },
  copy => { copy.jobs['database-baseline'].steps = []; },
  copy => { copy.on.workflow_run = {}; },
  copy => { copy.jobs.extra = { permissions: { 'id-token': 'write' } }; },
  copy => { copy.jobs['web-baseline'].permissions = { contents: 'write' }; },
  copy => { copy.jobs['database-baseline'].steps = copy.jobs['database-baseline'].steps.filter(step => step.run !== 'supabase start --workdir tests/hosted'); },
  copy => { copy.jobs['database-baseline'].steps = copy.jobs['database-baseline'].steps.filter(step => step.if !== 'always()'); },
  copy => { copy.jobs['web-baseline'].env.NEXT_PUBLIC_SUPABASE_URL = 'https://production-canary.invalid'; },
  copy => { copy.jobs['database-baseline'].steps.find(step => step.uses?.startsWith('supabase/setup-cli@')).with.version = 'latest'; },
  copy => { copy.jobs['web-baseline'].steps.find(step => step.run === 'npm run build').run = 'echo npm run build'; },
  copy => { copy.jobs['web-baseline'].steps = copy.jobs['web-baseline'].steps.filter(step => step.run !== 'node tests/hosted/check-workflow.mjs'); },
  copy => { copy.jobs['web-baseline'].steps = copy.jobs['web-baseline'].steps.filter(step => step.run !== 'python tests/browser/containment.py'); },
  copy => { copy.jobs['web-baseline'].steps = copy.jobs['web-baseline'].steps.filter(step => step.run !== 'python -m playwright install --with-deps chromium'); },
  copy => { copy.jobs['web-baseline'].steps.find(step => step.uses?.startsWith('actions/setup-python@')).with['python-version'] = '2.7'; },
  copy => { const steps = copy.jobs['web-baseline'].steps; steps.unshift(steps.splice(steps.findIndex(step => step.run === 'python tests/browser/containment.py'), 1)[0]); },
]) {
  const bad = structuredClone(workflow);
  mutate(bad);
  assert.throws(() => verify(bad));
}
console.log('WORKFLOW_CONTRACT_VERIFIED');
