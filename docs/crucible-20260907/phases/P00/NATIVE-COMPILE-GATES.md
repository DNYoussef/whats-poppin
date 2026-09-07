# Hosted native compilation spike

Scope: Compile the existing development notice into an Android release-variant test APK with a verified signature and an iOS simulator app built with code signing disabled and embedded Hermes bytecode. This is build feasibility only, not device execution, production signing, store acceptance, auth, GPS or purchase functionality. Codex authors; Opus high independently reviews read-only. Budget: three build rounds and three inspection rounds. No local Docker.

- [ ] C1: Artifact verification rejects malformed Android/iOS fixtures before hosted compilation is implemented.
  CHECK: python tests/mobile/check-native-artifacts.py --self-test
  CWD: ../../../..
  EXPECT: NATIVE_ARTIFACT_CONTROLS_VERIFIED
  EVIDENCE: pending; malformed archives, incorrect identifiers and empty native executables must fail the same artifact oracle.

- [ ] C2: Secret-free GitHub Linux/macOS jobs compile this source using pinned Expo template and toolchain choices; real package/executable/bundle inspection passes on the reviewed commit.
  EVIDENCE: pending; require ANDROID_NATIVE_COMPILE_VERIFIED and IOS_NATIVE_COMPILE_VERIFIED, binary hashes, exact source head and successful build steps. Simulators and physical devices are not run by this unit.

- [ ] C3: Independent Opus high approves the exact snapshot and web/database/mobile package regressions pass.
  EVIDENCE: pending; author excluded from reviewers. No EAS account, app-store identifier reservation or external deployment is performed.

Test-only app identity: com.whatspoppin.buildspike, project name PoppinBuildSpike. This temporary generated-build identity is not the production app identifier. Release remains blocked on the remaining PLAN.md native and backend gates.

- [ ] C4: Workflow contract rejects untrusted trigger/permission changes, optional compilation, removed native verification and missing contract prerequisites.
  CHECK: node tests/mobile/check-native-workflow.mjs
  CWD: ../../../..
  EXPECT: NATIVE_WORKFLOW_CONTRACT_VERIFIED
  EVIDENCE: pending; planted workflow mutations must be rejected. This is configuration checking, not compiled-binary evidence.
