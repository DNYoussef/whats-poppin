# Self-hosted Supabase gates

Scope: SELF-HOST-PLAN.md. Four build rounds and four inspection rounds; user authorized Railway staging provisioning. This does not complete the application's P01 migration work or authorize production cutover.

- [ ] S1: Core deployment configuration rejects missing secrets, unpinned images, public internal services and disabled email confirmation; valid fixture configuration passes.
  CHECK: node tests/self-host/check-config.mjs
  CWD: ../../../..
  EXPECT: SELF_HOST_CONFIG_VERIFIED
  EVIDENCE: pending

- [ ] S2: Secret-free GitHub container execution proves real Auth confirmation/login/refresh, rejected invalid API keys/JWTs, concurrent user isolation, extension availability and durable probe migration history, with known-bad controls.
  EVIDENCE: pending; requires exact-commit hosted workflow and decisive markers, not configuration inspection.

- [ ] S3: Independent Opus high approves the exact deployment snapshot before Railway changes; only new staging resources are created and original production configuration is preserved.
  EVIDENCE: pending; exact resource IDs, source and image pins, snapshot comparison, audit and before/after production readback required.

- [ ] S4: Each exact Railway deployment reaches SUCCESS and the running staging API passes Auth/RLS/migration checks; data and migration history survive a database restart.
  EVIDENCE: pending; record real API URL, bounded private database access and redacted results. Optional Supabase services and real SMTP are excluded explicitly; no full application compatibility claim.
