# Mobile uuid correction gates

Scope: Correct GHSA-w5hq-g745-h8pq in the new native build dependency with a scoped xcode override, preserve the website lockfile, and verify native compatibility. This advances P00 native prerequisites; it does not complete the P09 security audit. Codex builds, Opus high reviews read-only, GitHub executes independently. Budget: three build rounds and three inspection rounds including the initial plan inspection. No local Docker or remote project credentials.

- [x] D1: The uuid actually resolved by xcode rejects out-of-bounds v3/v5/v6 buffers before writing, preserves exact valid output, and supports xcode's project identifier generation.
  CHECK: node tests/mobile/check-uuid.mjs
  CWD: ../../../..
  EXPECT: MOBILE_UUID_COMPATIBILITY_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=8753b081a1e1/78 entries; EXPECT=matched; output-sha256=d850300ec0e04e6fffc5b9e988a15631ee600e41c57285f88c04a6c763a913f8; output-bytes=35

- [x] D2: Mobile remains isolated from the web lockfile and test/type traversal, and CI requires the dependency regression check.
  CHECK: node tests/mobile/check-boundary.mjs
  CWD: ../../../..
  EXPECT: MOBILE_BOUNDARY_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=8753b081a1e1/78 entries; EXPECT=matched; output-sha256=453619b5eca4d14d82ea9811f8fe0bfd4a09df3122aaee6f9889ce72aeaf16bb; output-bytes=58

- [x] D3: Both mobile JavaScript bundles build with the corrected dependency.
  CHECK: npm run bundle --prefix apps/mobile
  CWD: ../../../..
  EXPECT: MOBILE_BUNDLES_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=8753b081a1e1/78 entries; EXPECT=matched; output-sha256=9ea782ff6b4135ed4e865ca73c9f547e5dc3b4fe687da2b121f57eca1276b3a0; output-bytes=149

- [ ] D4: Independent Opus high approves the unchanged reviewed snapshot; exact-commit GitHub web/database/mobile and Android/iOS native compilation checks pass. Hosted npm ci --prefix apps/mobile establishes clean lock/override/registry consistency before the dependency check.
  EVIDENCE: pending

- [x] D5: Native preparation preserves the dependency override; an in-memory prebuild that drops it is rejected and removal of that guard is detected.
  CHECK: node tests/mobile/check-native-workflow.mjs
  CWD: ../../../..
  EXPECT: NATIVE_WORKFLOW_CONTRACT_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=8753b081a1e1/78 entries; EXPECT=matched; output-sha256=7bef010fc6dbbaf82a6837a87ade060f55d35e9f6805ddfa9591a1ea908e138b; output-bytes=34

Supplementary evidence: capture npm audit before and after, inspect the actual installed dependency chain and xcode call site. Registry audit output is not a proof of complete application security or runtime exposure. Keep historical raw audit evidence and describe the scope of the correction.

D1 negative control: dependency-fail-first.txt records the final test's SHA256, resolved old consumer version and failure against xcode 3.0.1 / uuid 7.0.3 installed in an external scratch directory. Execution stops at the first v3 bounds assertion; it does not claim old-version v6 execution (uuid 7 has no v6). The patched release runs every assertion. No vulnerable dependency is retained in the application or its CI lock.
