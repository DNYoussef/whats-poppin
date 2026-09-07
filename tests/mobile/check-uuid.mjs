import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRequire = createRequire(new URL('../../apps/mobile/package.json', import.meta.url));
const xcodeRequire = createRequire(mobileRequire.resolve('xcode/lib/pbxProject.js'));
const uuid = xcodeRequire('uuid');
const resolved = relative(fileURLToPath(new URL('../../apps/mobile/', import.meta.url)), xcodeRequire.resolve('uuid'));
assert.ok(!isAbsolute(resolved) && !resolved.split(/[\\/]/).includes('..'));
const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const namespaceBytes = Buffer.from(namespace.replaceAll('-', ''), 'hex');

// Independent digest oracle; do not use uuid to compute its own expected output.
for (const [method, algorithm, version] of [['v3', 'md5', 3], ['v5', 'sha1', 5]]) {
  const expected = createHash(algorithm).update(namespaceBytes).update('poppin-fixture').digest().subarray(0, 16);
  expected[6] = (expected[6] & 15) | (version << 4);
  expected[8] = (expected[8] & 63) | 128;
  const valid = new Uint8Array(24).fill(170);
  assert.equal(uuid[method]('poppin-fixture', namespace, valid, 4), valid);
  assert.deepEqual(Buffer.from(valid.subarray(4, 20)), expected);
  assert.ok(valid.subarray(0, 4).every(byte => byte === 170));
  assert.ok(valid.subarray(20).every(byte => byte === 170));
  for (const [size, offset] of [[8, 0], [16, 1], [16, -1]]) {
    const bad = new Uint8Array(size).fill(170);
    assert.throws(() => uuid[method]('poppin-fixture', namespace, bad, offset), RangeError, `${method}: reject ${size}/${offset}`);
    assert.ok(bad.every(byte => byte === 170), `${method}: reject before writing`);
  }
}

// v6 is present in the patched release, not in the old uuid 7 dependency.
assert.equal(typeof uuid.v6, 'function');
const options = { msecs: 0, nsecs: 0, clockseq: 0, node: [1, 2, 3, 4, 5, 6] };
const validV6 = new Uint8Array(24).fill(170);
assert.equal(uuid.v6(options, validV6, 4), validV6);
assert.equal(Buffer.from(validV6.subarray(4, 20)).toString('hex'), '1b21dd21381460008000010203040506');
assert.ok(validV6.subarray(0, 4).every(byte => byte === 170));
assert.ok(validV6.subarray(20).every(byte => byte === 170));
for (const [size, offset] of [[8, 0], [16, 1], [16, -1]]) {
  const bad = new Uint8Array(size).fill(170);
  assert.throws(() => uuid.v6(options, bad, offset), RangeError);
  assert.ok(bad.every(byte => byte === 170));
}

const project = mobileRequire('xcode').project('unused-fixture.pbxproj');
project.hash = { project: { objects: { PBXGroup: {} } } };
for (let i = 0; i < 128; i++) {
  const id = project.generateUuid();
  assert.match(id, /^[0-9A-F]{24}$/);
  assert.ok(!project.allUuids().includes(id));
  project.hash.project.objects.PBXGroup[id] = {};
}
assert.equal(project.allUuids().length, 128);
// Force the collision branch without replacing uuid's read-only CJS exports.
const originalAllUuids = project.allUuids;
let collisionChecks = 0;
try {
  project.allUuids = () => ({ indexOf: () => ++collisionChecks === 1 ? 0 : -1 });
  assert.match(project.generateUuid(), /^[0-9A-F]{24}$/);
  assert.equal(collisionChecks, 2);
} finally {
  project.allUuids = originalAllUuids;
}
assert.equal(xcodeRequire('uuid/package.json').version, '11.1.1');
console.log('MOBILE_UUID_COMPATIBILITY_VERIFIED');
