"""Inspect generated native build artifacts; never certify store readiness."""
import hashlib
import os
from pathlib import Path
import plistlib
import re
import subprocess
import sys
from tempfile import TemporaryDirectory
import zipfile

APP_ID = 'com.whatspoppin.buildspike'
HERMES_MAGIC = bytes.fromhex('c61fbc03c103191f')


def bundle(data):
    assert len(data) >= 128 and data.startswith(HERMES_MAGIC), 'Missing Hermes bytecode bundle'


def android_id(output):
    match = re.search(r"^package: name='([^']+)'", output, re.MULTILINE)
    assert match and match.group(1) == APP_ID, 'Wrong APK identifier'


def android(path):
    with zipfile.ZipFile(path) as archive:
        assert archive.read('AndroidManifest.xml').startswith(b'\x03\x00\x08\x00'), 'Missing binary manifest'
        assert archive.read('classes.dex').startswith(b'dex\n'), 'Missing DEX executable'
        assert archive.read('lib/arm64-v8a/libreactnative.so').startswith(b'\x7fELF'), 'Missing native runtime'
        bundle(archive.read('assets/index.android.bundle'))


def ios(path):
    info = plistlib.loads((path / 'Info.plist').read_bytes())
    assert info['CFBundleIdentifier'] == APP_ID, 'Wrong test app identifier'
    assert 'iPhoneSimulator' in info['CFBundleSupportedPlatforms'], 'Not a simulator app'
    assert info['CFBundleExecutable'] == 'PoppinBuildSpike', 'Wrong executable name'
    executable = path / info['CFBundleExecutable']
    assert executable.read_bytes()[:4] in [b'\xcf\xfa\xed\xfe', b'\xca\xfe\xba\xbe', b'\xbe\xba\xfe\xca'], 'Missing Mach-O executable'
    bundle((path / 'main.jsbundle').read_bytes())
    return executable


def rejects(check):
    try:
        check()
    except (AssertionError, KeyError, FileNotFoundError, zipfile.BadZipFile):
        return
    raise AssertionError('Malformed artifact unexpectedly passed')


def controls():
    with TemporaryDirectory(prefix='poppin-native-controls-') as directory:
        root = Path(directory)
        apk = root / 'bad.apk'
        apk.write_bytes(b'not an APK')
        rejects(lambda: android(apk))
        with zipfile.ZipFile(apk, 'w') as archive:
            archive.writestr('AndroidManifest.xml', b'')
        rejects(lambda: android(apk))
        healthy = {
            'AndroidManifest.xml': b'\x03\x00\x08\x00',
            'classes.dex': b'dex\n',
            'lib/arm64-v8a/libreactnative.so': b'\x7fELF',
            'assets/index.android.bundle': HERMES_MAGIC + bytes(128),
        }
        with zipfile.ZipFile(apk, 'w') as archive:
            for name, data in healthy.items():
                archive.writestr(name, data)
        android(apk)  # Healthy structural fixture; not a signed executable APK.
        for broken in [None, b'', b'x']:
            with zipfile.ZipFile(apk, 'w') as archive:
                for name, data in healthy.items():
                    if name == 'assets/index.android.bundle':
                        if broken is None:
                            continue
                        data = broken
                    archive.writestr(name, data)
            rejects(lambda: android(apk))
        android_id(f"package: name='{APP_ID}' versionCode='1'")
        rejects(lambda: android_id("package: name='wrong'"))
        rejects(lambda: android_id(f"package: name='wrong'\napplication-label: package: name='{APP_ID}'"))
        app = root / 'bad.app'
        app.mkdir()
        info = {'CFBundleIdentifier': 'wrong', 'CFBundleSupportedPlatforms': ['iPhoneSimulator'], 'CFBundleExecutable': 'PoppinBuildSpike'}
        (app / 'Info.plist').write_bytes(plistlib.dumps(info))
        rejects(lambda: ios(app))
        info['CFBundleIdentifier'] = APP_ID
        (app / 'Info.plist').write_bytes(plistlib.dumps(info))
        (app / 'PoppinBuildSpike').write_bytes(b'')
        rejects(lambda: ios(app))
        (app / 'PoppinBuildSpike').write_bytes(b'\xcf\xfa\xed\xfe')
        rejects(lambda: ios(app))  # Bundle absent after all earlier assertions pass.
        for broken in [b'', b'x']:
            (app / 'main.jsbundle').write_bytes(broken)
            rejects(lambda: ios(app))
        (app / 'main.jsbundle').write_bytes(HERMES_MAGIC + bytes(128))
        assert ios(app) == app / 'PoppinBuildSpike'
        info['CFBundleSupportedPlatforms'] = ['iPhoneOS']
        (app / 'Info.plist').write_bytes(plistlib.dumps(info))
        rejects(lambda: ios(app))
    print('NATIVE_ARTIFACT_CONTROLS_VERIFIED')


if __name__ == '__main__':
    if sys.argv[1:] == ['--self-test']:
        controls()
    else:
        assert len(sys.argv) == 3 and sys.argv[1] in ['android', 'ios'], 'Expected platform and artifact path'
        platform, path = sys.argv[1], Path(sys.argv[2])
        if platform == 'android':
            android(path)
            sdk = Path(os.environ['ANDROID_HOME'])
            output = subprocess.check_output([str(sdk / 'build-tools/36.0.0/aapt2'), 'dump', 'badging', str(path)], text=True)
            android_id(output)
            signer = str(sdk / 'build-tools/36.0.0/apksigner')
            with TemporaryDirectory(prefix='poppin-unsigned-control-') as directory:
                unsigned = Path(directory) / 'unsigned.apk'
                # Repacking removes v2/v3 blocks; also remove v1 signature files.
                with zipfile.ZipFile(path) as source, zipfile.ZipFile(unsigned, 'w') as target:
                    for entry in source.infolist():
                        if not entry.filename.upper().startswith('META-INF/'):
                            target.writestr(entry, source.read(entry.filename))
                bad = subprocess.run([signer, 'verify', str(unsigned)], capture_output=True, text=True)
                assert bad.returncode != 0 and 'DOES NOT VERIFY' in bad.stdout + bad.stderr, 'Unsigned APK was not rejected'
            subprocess.run([signer, 'verify', str(path)], check=True)
            print('APK_SIGNATURE_CONTROL_VERIFIED')
            executable = path
        else:
            executable = ios(path)
        print(platform.upper() + '_NATIVE_COMPILE_VERIFIED', hashlib.sha256(executable.read_bytes()).hexdigest())
