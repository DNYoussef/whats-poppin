import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

function verify(workflow) {
  assert.deepEqual(Object.keys(workflow.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.ok(!JSON.stringify(workflow).includes('secrets.'));
  assert.deepEqual(Object.keys(workflow.jobs).sort(), ['database-baseline', 'web-baseline']);
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
  for (const command of ['npm ci', 'node tests/hosted/check-workflow.mjs', 'npm run lint:ci', 'npm run typecheck:ci', 'npm run test:ci', 'npm run build']) assert.ok(web.some(step => step.run === command), command);
  const database = workflow.jobs['database-baseline'];
  assert.equal(database.steps.find(step => step.uses?.startsWith('supabase/setup-cli@')).with.version, '2.117.0');
  assert.ok(database.steps.some(step => step.run === 'supabase start --workdir tests/hosted'));
  assert.ok(database.steps.some(step => step.run === 'node tests/hosted/database-baseline.mjs'));
  assert.ok(database.steps.some(step => step.if === 'always()' && step.run === 'supabase stop --workdir tests/hosted --no-backup'));
}

const workflow = yaml.load(readFileSync('.github/workflows/baseline.yml', 'utf8'));
verify(workflow);
for (const mutate of [
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
]) {
  const bad = structuredClone(workflow);
  mutate(bad);
  assert.throws(() => verify(bad));
}
console.log('WORKFLOW_CONTRACT_VERIFIED');
