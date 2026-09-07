# Hosted native compilation spike

Scope: Compile the existing development notice into an Android release-variant test APK with a verified signature and an iOS simulator app built with code signing disabled and embedded Hermes bytecode. This is build feasibility only, not device execution, production signing, store acceptance, auth, GPS or purchase functionality. Codex authors; Opus high independently reviews read-only. Budget: three build rounds and three inspection rounds. No local Docker.

- [x] C1: Artifact verification rejects malformed Android/iOS fixtures before hosted compilation is implemented.
  CHECK: python tests/mobile/check-native-artifacts.py --self-test
  CWD: ../../../..
  EXPECT: NATIVE_ARTIFACT_CONTROLS_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=cb02142949a1/78 entries; EXPECT=matched; output-sha256=40470ace0c594119c636d9a53b13077b9af99144dd51d3712a2ca37918c540be; output-bytes=35

- [x] C2: Secret-free GitHub Linux/macOS jobs compile this source using pinned Expo template and toolchain choices; real package/executable/bundle inspection passes on the reviewed commit.
  EVIDENCE: https://github.com/DNYoussef/whats-poppin/actions/runs/34165280167 passed every job at 37fe217792a13f7208f6dafeffb7bac6f4213220, including both native binary markers and APK_SIGNATURE_CONTROL_VERIFIED. native-compile-hosted-runs.json records exact jobs, markers and binary hashes. Simulators and physical devices were not run.

- [x] C3: Independent Opus high approves the exact snapshot and web/database/mobile package regressions pass.
  EVIDENCE: native-compile-audit-3.json APPROVED the unchanged native-compile-snapshot.json before commit, in Opus high session f718ef73-1dc0-4c1b-9e45-62e6d88d86b1. Codex authored, Opus reviewed read-only, GitHub executed. Baseline run 34165280159 and mobile-package run 34165280154 both passed at the same final head. Three build and three inspection rounds used; no budget reset. No EAS account, store identifier reservation or deployment was performed.

Test-only app identity: com.whatspoppin.buildspike, project name PoppinBuildSpike. This temporary generated-build identity is not the production app identifier. Release remains blocked on the remaining PLAN.md native and backend gates.

- [x] C4: Workflow contract rejects untrusted trigger/permission changes, optional compilation, removed native verification and missing contract prerequisites.
  CHECK: node tests/mobile/check-native-workflow.mjs
  CWD: ../../../..
  EXPECT: NATIVE_WORKFLOW_CONTRACT_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=cb02142949a1/78 entries; EXPECT=matched; output-sha256=7bef010fc6dbbaf82a6837a87ade060f55d35e9f6805ddfa9591a1ea908e138b; output-bytes=34

Native builds link vendor-prebuilt React Native and Expo components; this is not a claim that every third-party library was compiled from source. The artifacts are test builds, not store releases. Dependency findings remain open in DEPENDENCY-FOLLOWUP.md.
