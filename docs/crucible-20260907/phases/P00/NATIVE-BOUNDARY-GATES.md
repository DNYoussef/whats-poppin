# Native package boundary spike

Scope: P00 package/build topology only. Codex builds; Opus high reviews read-only; GitHub executes. Three build rounds and three review rounds maximum. No native product functionality, signed binary, simulator/device execution, auth, GPS or purchase claim. Those P00/P02 prerequisites remain open.

- [x] N1: Mobile has an independent locked npm package; its install preserves the existing root lockfile. A planted mobile TypeScript error fails mobile checking while root types and tests pass. Mobile test fixtures cannot enter the web suite.
  CHECK: node tests/mobile/check-boundary.mjs
  CWD: ../../../..
  EXPECT: MOBILE_BOUNDARY_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=f13d4986d164/78 entries; EXPECT=matched; output-sha256=453619b5eca4d14d82ea9811f8fe0bfd4a09df3122aaee6f9889ce72aeaf16bb; output-bytes=58

- [x] N2: The locked mobile dependencies pass Expo compatibility checking and produce fresh iOS and Android JavaScript bundles.
  CHECK: npm run bundle --prefix apps/mobile
  CWD: ../../../..
  EXPECT: MOBILE_BUNDLES_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=f13d4986d164/78 entries; EXPECT=matched; output-sha256=9ea782ff6b4135ed4e865ca73c9f547e5dc3b4fe687da2b121f57eca1276b3a0; output-bytes=149

- [x] N3: Independent Opus high approves the exact change and hosted web/database/mobile checks pass on that revision.
  EVIDENCE: native-audit-2.json APPROVED snapshot native-review-snapshot.json in Opus high session d7603fe2-bd08-4d05-ab1c-f6cffb394d58; author Codex excluded from reviewers. Snapshot unchanged before commit. GitHub runs 34162899704 (mobile) and 34162899665 (web/database) passed at 955b924d3766ffa86d36058108637863cb7b9113 with both platform bundle markers, MOBILE_BOUNDARY_VERIFIED, browser and interaction controls. native-hosted-runs.json records exact jobs. Three build rounds and two inspection rounds used.

The Next website remains the root package. There is no workspace conversion or shared business-code package. Railway web deployment configuration and native build/signing feasibility remain separately gated; this spike does not configure an active mobile deployment.

Failure controls: native-types-fail-first.txt, native-vitest-fail-first.json and native-link-fail-first.txt. Root lock checks normalize checkout line endings only; raw bytes are also compared within the boundary check. No native executable or device behavior is certified here.
