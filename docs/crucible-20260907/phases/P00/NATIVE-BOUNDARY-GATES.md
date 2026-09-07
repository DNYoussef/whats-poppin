# Native package boundary spike

Scope: P00 package/build topology only. Codex builds; Opus high reviews read-only; GitHub executes. Three build rounds and three review rounds maximum. No native product functionality, signed binary, simulator/device execution, auth, GPS or purchase claim. Those P00/P02 prerequisites remain open.

- [ ] N1: Mobile has an independent locked npm package; its install preserves the existing root lockfile. A planted mobile TypeScript error fails mobile checking while root types and tests pass. Mobile test fixtures cannot enter the web suite.
  CHECK: node tests/mobile/check-boundary.mjs
  CWD: ../../../..
  EXPECT: MOBILE_BOUNDARY_VERIFIED
  EVIDENCE: pending; fail first on missing package, then exercise planted errors against the unisolated root configuration before fixing it.

- [ ] N2: The locked mobile dependencies pass Expo compatibility checking and produce fresh iOS and Android JavaScript bundles.
  CHECK: npm run bundle --prefix apps/mobile
  CWD: ../../../..
  EXPECT: MOBILE_BUNDLES_VERIFIED
  EVIDENCE: pending; output must contain both platform bundles. Bundles are not native binaries or app-store acceptance.

- [ ] N3: Independent Opus high approves the exact change and hosted web/database/mobile checks pass on that revision.
  EVIDENCE: pending; no signing credentials, production API, Docker on Windows or provider spending.

The Next website remains the root package. There is no workspace conversion or shared business-code package. Railway web deployment configuration and native build/signing feasibility remain separately gated; this spike does not configure an active mobile deployment.
