import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const verify = config => {
  assert.deepEqual(Object.keys(config.services).sort(), ['auth', 'db', 'gateway', 'mail', 'rest']);
  for (const [name, service] of Object.entries(config.services)) {
    if (service.build) {
      assert.equal(service.image, `poppin-sb-${name}:ci`);
      assert.match(readFileSync(`infra/supabase/${name}/Dockerfile`, 'utf8'), /^FROM [^\s]+@sha256:[a-f0-9]{64}$/m);
    } else assert.match(service.image, /@sha256:[a-f0-9]{64}$/);
    assert.equal(service.privileged, undefined);
    assert.equal(service.network_mode, undefined);
    if (name !== 'gateway') assert.equal(service.ports, undefined);
  }
  assert.deepEqual(config.services.db.volumes, ['db-data:/var/lib/postgresql/data']);
  assert.equal(config.services.auth.environment.GOTRUE_MAILER_AUTOCONFIRM, 'false');
  assert.equal(config.services.auth.environment.GOTRUE_SMTP_HOST, 'mail');
  assert.equal(config.services.auth.environment.GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED, 'false');
  assert.equal(config.services.rest.environment.PGRST_DB_ANON_ROLE, 'anon');
  assert.equal(config.services.rest.environment.PGRST_DB_SCHEMAS, 'public');
  assert.equal(config.services.db.environment.POSTGRES_PASSWORD, '${POSTGRES_PASSWORD:?required}');
  assert.equal(config.services.auth.environment.GOTRUE_JWT_SECRET, '${JWT_SECRET:?required}');
  assert.equal(config.services.gateway.environment.ANON_KEY, '${ANON_KEY:?required}');
  assert.equal(config.services.gateway.environment.SERVICE_ROLE_KEY, '${SERVICE_ROLE_KEY:?required}');
};
const config = yaml.load(readFileSync('infra/supabase/compose.yml', 'utf8'));
verify(config);
for (const mutate of [
  copy => { copy.services.db.ports = ['5432:5432']; },
  copy => { copy.services.auth.environment.GOTRUE_MAILER_AUTOCONFIRM = 'true'; },
  copy => { copy.services.db.image = 'supabase/postgres:latest'; },
  copy => { delete copy.services.gateway.environment.SERVICE_ROLE_KEY; },
]) {
  const bad = structuredClone(config);
  mutate(bad);
  assert.throws(() => verify(bad));
}
const verifyWorkflow = text => {
  assert.doesNotMatch(text, /secrets\.|pull_request_target|workflow_run/);
  const workflow = yaml.load(text);
  assert.deepEqual(Object.keys(workflow.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(workflow.permissions, {contents: 'read'});
  assert.deepEqual(Object.keys(workflow.jobs), ['core']);
  const job = workflow.jobs.core;
  assert.equal(job['runs-on'], 'ubuntu-24.04');
  assert.equal(job.environment, undefined);
  assert.equal(job['timeout-minutes'], 30);
  for (const step of job.steps) {
    if (step.uses) assert.match(step.uses, /@[a-f0-9]{40}$/);
    if (step.uses?.startsWith('actions/checkout@')) assert.equal(step.with['persist-credentials'], false);
  }
  assert(job.steps.some(step => step.run === 'python -B tests/self-host/run-ci.py'));
};
const workflow = readFileSync('.github/workflows/self-host.yml', 'utf8');
verifyWorkflow(workflow);
for (const bad of [
  workflow.replace('pull_request:', 'pull_request_target:'),
  workflow.replace('contents: read', 'contents: write'),
  workflow.replace('persist-credentials: false', 'persist-credentials: true'),
  workflow.replace('python -B tests/self-host/run-ci.py', 'echo skipped'),
  workflow + '\n# secrets.RAILWAY_TOKEN\n',
]) assert.throws(() => verifyWorkflow(bad));
console.log('SELF_HOST_CONFIG_VERIFIED');
