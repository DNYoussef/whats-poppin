import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Native preparation only mutates a disposable GitHub checkout');
assert.equal(process.env.CI, 'true');
const platform = process.argv[2];
assert.ok(['android', 'ios'].includes(platform));
assert.equal(process.platform, platform === 'ios' ? 'darwin' : 'linux');
const rootLock = readFileSync('../../package-lock.json');
const mobileLock = readFileSync('package-lock.json');
const before = JSON.parse(readFileSync('package.json', 'utf8'));
const config = JSON.parse(readFileSync('app.json', 'utf8'));
config.expo.name = 'PoppinBuildSpike';
config.expo.ios = { ...config.expo.ios, bundleIdentifier: 'com.whatspoppin.buildspike' };
config.expo.android = { ...config.expo.android, package: 'com.whatspoppin.buildspike' };
writeFileSync('app.json', JSON.stringify(config, null, 2) + '\n');
const result = spawnSync(process.execPath, ['node_modules/expo/bin/cli', 'prebuild', '--no-install', '--platform', platform,
  '--template', 'expo-template-bare-minimum@57.0.22'], { stdio: 'inherit', timeout: 300000 });
assert.ifError(result.error);
assert.equal(result.status, 0, 'Pinned native prebuild failed');
const after = JSON.parse(readFileSync('package.json', 'utf8'));
assert.deepEqual(after.dependencies, before.dependencies);
assert.deepEqual(after.devDependencies, before.devDependencies);
assert.deepEqual(after.overrides, before.overrides);
assert.deepEqual(readFileSync('../../package-lock.json'), rootLock);
assert.deepEqual(readFileSync('package-lock.json'), mobileLock);
console.log('NATIVE_PROJECT_PREPARED', platform);
