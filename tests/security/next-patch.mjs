// Next 14 fixes for GHSA-mwv6-3258-q52c and GHSA-5j59-xgg2-r9c4.
// Revisit the supported line and advisories before a major-version migration.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function patched(version) {
  const match = /^14\.2\.(\d+)$/.exec(version);
  return Boolean(match && Number(match[1]) >= 35);
}
assert.equal(patched('14.2.33'), false);
assert.equal(patched('14.2.34'), false);
assert.equal(patched('14.2.35'), true);
const lock = JSON.parse(readFileSync(new URL('../../package-lock.json', import.meta.url)));
// Captured with npm view next@14.2.35 version dependencies optionalDependencies dist.integrity --json.
const published = JSON.parse(readFileSync(new URL('./next-14.2.35-metadata.json', import.meta.url)));
const next = lock.packages['node_modules/next'].version;
assert.ok(patched(next), 'Next lockfile version lacks the required Next 14 security patches');
assert.equal(next, published.version, 'Refresh published metadata when changing the release pin');
assert.equal(lock.packages['node_modules/next'].integrity, published['dist.integrity']);
assert.deepEqual(lock.packages['node_modules/next'].dependencies, published.dependencies);
assert.deepEqual(lock.packages['node_modules/next'].optionalDependencies, published.optionalDependencies);
assert.equal(lock.packages['node_modules/eslint-config-next'].version, next);
assert.equal(lock.packages['node_modules/@next/eslint-plugin-next'].version, next);
assert.equal(lock.packages['node_modules/@next/env'].version, next);
function nativeBindings(packages) {
  for (const [name, version] of Object.entries(published.optionalDependencies)) {
    assert.equal(packages[`node_modules/${name}`]?.version, version, `Unexpected published binding for ${name}`);
  }
}
nativeBindings(lock.packages);
const binding = `node_modules/${Object.keys(published.optionalDependencies)[0]}`;
assert.throws(() => nativeBindings({ ...lock.packages, [binding]: { version: '0.0.0' } }));
console.log('NEXT_14_SECURITY_PATCH_VERIFIED');
