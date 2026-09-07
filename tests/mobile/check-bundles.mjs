import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';

const run = args => {
  const result = spawnSync(process.execPath, ['node_modules/expo/bin/cli', ...args], {
    encoding: 'utf8', timeout: 180000, env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' },
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
};
const validate = (directory, platform) => {
  const metadata = JSON.parse(readFileSync(join(directory, 'metadata.json'), 'utf8'));
  const bundle = metadata.fileMetadata?.[platform]?.bundle;
  assert.equal(typeof bundle, 'string', `Missing ${platform} bundle`);
  const path = resolve(directory, bundle);
  const child = relative(directory, path);
  assert.ok(child && !child.startsWith('..') && !isAbsolute(child));
  assert.ok(statSync(path).isFile() && statSync(path).size > 0);
};
const output = mkdtempSync(join(tmpdir(), 'poppin-native-bundles-'));
// A directory without export metadata must never pass as a successful bundle.
assert.throws(() => validate(output, 'ios'));
run(['install', '--check']);
for (const platform of ['ios', 'android']) {
  const directory = join(output, platform);
  run(['export', '--platform', platform, '--output-dir', directory]);
  validate(directory, platform);
  console.log(`${platform.toUpperCase()}_BUNDLE_VERIFIED`);
}
console.log('MOBILE_BUNDLES_VERIFIED');
