import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const dockerfiles = Object.fromEntries(['db', 'gateway'].map(name => [name, readFileSync(`infra/supabase/${name}/Dockerfile`, 'utf8')]));
const verify = (config, files = dockerfiles) => {
  assert.deepEqual(Object.keys(config.services).sort(), ['auth', 'db', 'gateway', 'mail', 'rest']);
  for (const [name, service] of Object.entries(config.services)) {
    if (service.build) {
      assert.equal(service.image, `poppin-sb-${name}:ci`);
      assert.match(files[name], /^FROM [^\s]+@sha256:[a-f0-9]{64}$/m);
    } else assert.match(service.image, /@sha256:[a-f0-9]{64}$/);
    assert.equal(service.privileged, undefined);
    assert.equal(service.network_mode, undefined);
    if (name !== 'gateway') assert.equal(service.ports, undefined);
  }
  assert.deepEqual(config.services.gateway.ports, ['127.0.0.1:54329:8080']);
  assert.equal(config.services.mail.environment.MP_SMTP_BIND_ADDR, '[::]:1025');
  assert.equal(config.services.mail.environment.MP_UI_BIND_ADDR, '[::]:8025');
  assert.equal(config.services.auth.environment.GOTRUE_DISABLE_SIGNUP, 'false');
  assert.equal(config.services.auth.environment.GOTRUE_RATE_LIMIT_EMAIL_SENT, '2');
  assert.equal(config.services.auth.environment.GOTRUE_SMTP_MAX_FREQUENCY, '1s');
  assert.equal(config.services.rest.environment.PGRST_JWT_SECRET, '${JWT_SECRET:?required}');
  assert.equal(config.services.auth.environment.GOTRUE_DB_DATABASE_URL, 'postgres://supabase_auth_admin:${AUTH_DB_PASSWORD:?required}@db:5432/postgres');
  assert.equal(config.services.rest.environment.PGRST_DB_URI, 'postgres://authenticator:${REST_DB_PASSWORD:?required}@db:5432/postgres');
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
  copy => { copy.services.mail.environment.MP_SMTP_BIND_ADDR = '127.0.0.1:1025'; },
  copy => { copy.services.mail.image = 'axllent/mailpit:v1.27'; },
  copy => { copy.services.gateway.ports = ['54329:8080']; },
  copy => { copy.services.rest.environment.PGRST_JWT_SECRET = 'hardcoded'; },
  copy => { copy.services.auth.environment.GOTRUE_RATE_LIMIT_EMAIL_SENT = '100'; },
  copy => { copy.services.auth.environment.GOTRUE_DISABLE_SIGNUP = 'true'; },
  copy => { copy.services.db.ports = ['5432:5432']; },
  copy => { copy.services.auth.environment.GOTRUE_MAILER_AUTOCONFIRM = 'true'; },
  copy => { copy.services.db.image = 'supabase/postgres:latest'; },
  copy => { delete copy.services.gateway.environment.SERVICE_ROLE_KEY; },
]) {
  const bad = structuredClone(config);
  mutate(bad);
  assert.throws(() => verify(bad));
}
assert.throws(() => verify(config, {...dockerfiles, db: 'FROM supabase/postgres:latest'}));
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
  assert(job.steps.some(step => step.run === 'node tests/self-host/check-config.mjs'));
  assert(job.steps.some(step => step.run === 'python -B tests/self-host/run-ci.py'));
  assert(job.steps.some(step => step.run === 'python -B tests/self-host/run-railway.py --check'));
};
const workflow = readFileSync('.github/workflows/self-host.yml', 'utf8');
verifyWorkflow(workflow);
for (const bad of [
  workflow.replace('python -B tests/self-host/run-railway.py --check', 'echo skipped'),
  workflow.replace('node tests/self-host/check-config.mjs', 'echo skipped'),
  workflow.replace('pull_request:', 'pull_request_target:'),
  workflow.replace('contents: read', 'contents: write'),
  workflow.replace('persist-credentials: false', 'persist-credentials: true'),
  workflow.replace('python -B tests/self-host/run-ci.py', 'echo skipped'),
  workflow + '\n# secrets.RAILWAY_TOKEN\n',
]) assert.throws(() => verifyWorkflow(bad));
console.log('SELF_HOST_CONFIG_VERIFIED');
