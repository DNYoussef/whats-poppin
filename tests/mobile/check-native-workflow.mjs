import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const verify = workflow => {
  assert.deepEqual(Object.keys(workflow.on).sort(), ['pull_request', 'push']);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.deepEqual(Object.keys(workflow.jobs).sort(), ['android-compile', 'ios-compile', 'native-contract']);
  assert.ok(!JSON.stringify(workflow).includes('secrets.'));
  for (const [name, job] of Object.entries(workflow.jobs)) {
    assert.equal(job.permissions, undefined);
    assert.equal(job.if, undefined);
    assert.equal(job['continue-on-error'], undefined);
    assert.ok(job['timeout-minutes'] > 0 && job['timeout-minutes'] <= 45);
    assert.equal(job['runs-on'], name === 'ios-compile' ? 'macos-26' : 'ubuntu-24.04');
    assert.equal(job.steps[0].with['persist-credentials'], false);
    assert.equal(job.steps[1].with['node-version'], '22.22.0');
    for (const step of job.steps) {
      if (step.uses) assert.match(step.uses, /@[a-f0-9]{40}$/);
      assert.equal(step['continue-on-error'], undefined);
      assert.equal(step.if, undefined);
    }
    if (name === 'native-contract') {
      assert.ok(job.steps.some(step => step.run === 'python3 tests/mobile/check-native-artifacts.py --self-test'));
      continue;
    }
    const platform = name.split('-')[0];
    assert.equal(job.needs, 'native-contract');
    assert.equal(job.defaults.run['working-directory'], 'apps/mobile');
    assert.equal(job.env.CI, 'true');
    const commands = job.steps.filter(step => step.run).map(step => step.run);
    if (platform === 'ios') {
      assert.equal(job.env.DEVELOPER_DIR, '/Applications/Xcode_26.4.1.app/Contents/Developer');
      assert.deepEqual(commands, [
        'xcodebuild -version',
        'npm ci',
        'node ../../tests/mobile/prepare-native.mjs ios',
        'pod install --project-directory=ios',
        "xcodebuild -workspace ios/PoppinBuildSpike.xcworkspace -scheme PoppinBuildSpike -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath build/ios CODE_SIGNING_ALLOWED=NO -quiet",
        'python3 ../../tests/mobile/check-native-artifacts.py ios build/ios/Build/Products/Release-iphonesimulator/PoppinBuildSpike.app',
      ]);
    } else {
      const java = job.steps.find(step => step.uses?.startsWith('actions/setup-java@'));
      assert.deepEqual(java.with, { distribution: 'temurin', 'java-version': '17' });
      assert.equal(commands[1], "python3 - <<'PY'\nimport os\nimport subprocess\nsdkmanager = os.path.join(os.environ['ANDROID_HOME'], 'cmdline-tools/latest/bin/sdkmanager')\nsubprocess.run([sdkmanager, '--licenses'], input='y\\n' * 100, text=True, check=True, timeout=180)\nsubprocess.run([sdkmanager, 'platforms;android-36', 'build-tools;36.0.0'], check=True, timeout=300)\nPY\n");
      assert.deepEqual(commands.filter((_, index) => index !== 1), [
        'npm ci',
        'node ../../tests/mobile/prepare-native.mjs android',
        'bash android/gradlew -p android assembleRelease --no-daemon --max-workers=2 -PreactNativeArchitectures=arm64-v8a',
        'python3 ../../tests/mobile/check-native-artifacts.py android android/app/build/outputs/apk/release/app-release.apk',
      ]);
    }
    assert.ok(commands.includes(`node ../../tests/mobile/prepare-native.mjs ${platform}`));
    assert.ok(commands.at(-1).startsWith(`python3 ../../tests/mobile/check-native-artifacts.py ${platform} `));
    assert.ok(commands.some(command => platform === 'ios' ? command.startsWith('xcodebuild ') && command.includes('CODE_SIGNING_ALLOWED=NO') : command.startsWith('bash android/gradlew ') && command.includes('assembleRelease')));
  }
};
const workflow = yaml.load(readFileSync('.github/workflows/native-compile.yml', 'utf8'));
verify(workflow);
for (const mutate of [
  copy => { copy.on.pull_request_target = {}; },
  copy => { copy.permissions.contents = 'write'; },
  copy => { copy.jobs['ios-compile'].steps.pop(); },
  copy => { copy.jobs['android-compile']['continue-on-error'] = true; },
  copy => { copy.jobs['android-compile'].needs = []; },
  copy => { const step = copy.jobs['android-compile'].steps.find(step => step.run?.startsWith("python3 - <<'PY'")); step.run = step.run.replace("os.path.join(os.environ['ANDROID_HOME'], 'cmdline-tools/latest/bin/sdkmanager')", "'sdkmanager'"); },
  copy => { copy.jobs['android-compile'].steps.find(step => step.uses?.startsWith('actions/setup-java@')).with['java-version'] = '11'; },
  copy => { const step = copy.jobs['android-compile'].steps.find(step => step.run?.startsWith('bash android/gradlew ')); step.run = step.run.replace('arm64-v8a', 'x86_64'); },
  copy => { const step = copy.jobs['android-compile'].steps.find(step => step.run?.startsWith("python3 - <<'PY'")); step.run = step.run.replace('36.0.0', '35.0.0'); },
  copy => { const step = copy.jobs['ios-compile'].steps.find(step => step.run?.startsWith('xcodebuild -workspace')); step.run = step.run.replace('-configuration Release', '-configuration Debug'); },
  copy => { const step = copy.jobs['ios-compile'].steps.find(step => step.run?.startsWith('xcodebuild -workspace')); step.run = step.run.replace('-sdk iphonesimulator', '-sdk iphoneos'); },
  copy => { const step = copy.jobs['android-compile'].steps.at(-1); step.run = step.run.replace('app-release.apk', 'app-debug.apk'); },
  copy => { copy.jobs['ios-compile'].steps = copy.jobs['ios-compile'].steps.filter(step => !step.run?.startsWith('xcodebuild ')); },
]) {
  const bad = structuredClone(workflow);
  mutate(bad);
  assert.throws(() => verify(bad));
}
const verifyTemplate = source => assert.match(source, /'--template', 'expo-template-bare-minimum@57\.0\.22'/);
const preparation = readFileSync('tests/mobile/prepare-native.mjs', 'utf8');
verifyTemplate(preparation);
assert.throws(() => verifyTemplate(preparation.replace('expo-template-bare-minimum@57.0.22', 'expo-template-bare-minimum@latest')));
console.log('NATIVE_WORKFLOW_CONTRACT_VERIFIED');
