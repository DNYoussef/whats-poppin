# Self-hosted Supabase gates

Scope: SELF-HOST-PLAN.md. Four build rounds and four inspection rounds; user authorized Railway staging provisioning. This does not complete the application's P01 migration work or authorize production cutover.

- [ ] S1: Core deployment configuration rejects missing secrets, unpinned images, public internal services and disabled email confirmation; valid fixture configuration passes.
  CHECK: node tests/self-host/check-config.mjs
  CWD: ../../../..
  EXPECT: SELF_HOST_CONFIG_VERIFIED
  EVIDENCE: pending

- [ ] S2: Secret-free GitHub container execution proves real Auth confirmation/login/refresh, rejected invalid API keys/JWTs, concurrent user isolation, extension availability and durable probe migration history, with known-bad controls.
  CHECK: python -B tests/self-host/run-ci.py
  CWD: ../../../..
  EXPECT: SELF_HOST_CORE_VERIFIED
  EVIDENCE: pending; hosted Linux only; require SELF_HOST_EXTENSIONS, SELF_HOST_CONFIRMATION_VERIFIED, SELF_HOST_IDENTITY_RLS_VERIFIED, SELF_HOST_MIGRATIONS_VERIFIED, SELF_HOST_PERSISTENCE_VERIFIED, SELF_HOST_CLEANUP_VERIFIED, SELF_HOST_AUTH_LIFECYCLE_VERIFIED and SELF_HOST_CORE_VERIFIED in the exact-commit hosted workflow and decisive markers, not configuration inspection.

- [ ] S3: Independent Opus high approves the exact deployment snapshot before Railway changes; only new staging resources are created and original production configuration is preserved.
  EVIDENCE: pending; exact resource IDs, source and image pins, snapshot comparison, audit and before/after production readback required.

- [ ] S4: Each exact Railway deployment reaches SUCCESS and the running staging API passes Auth/RLS/migration checks; data and migration history survive a database restart.
  EVIDENCE: pending; record real API URL, bounded private database access and redacted results. Optional Supabase services and real SMTP are excluded explicitly; no full application compatibility claim.

S3 placement matrix: a new whats-poppin-supabase-staging project, environment staging, only the gateway has a public domain. DB PORT=5432 with PGDATA=/var/lib/postgresql/data/pgdata; gateway PORT=8080; Auth PORT=9999; REST PORT=3000. DB/Auth/REST receive distinct generated database passwords as applicable. JWT_SECRET goes only to DB/Auth/REST; gateway receives only the anon/service-role API keys. Auth API_EXTERNAL_URL is the actual gateway HTTPS URL; private hosts are sb-db, sb-auth, sb-rest, sb-mail under railway.internal. Signup starts disabled, opens only for the probe, and is disabled in finally with a denied-signup readback. Email limit is 2/hour and SMTP is private Mailpit with fixture-only credentials. No production app configuration changes.

Attempt log (no successful core runtime claim yet):
- Build round 1, inspection 2: e6a23183fbcf73e834bf7add7639d226e1e38edf, https://github.com/DNYoussef/whats-poppin/actions/runs/34173258555, database startup failed. Baseline/mobile/native checks passed. Inspection allowed secret-free CI only.
- Build round 2, inspection 3: 68d8cdec633364730d3f6e5a01422ee1f4eb0c97, https://github.com/DNYoussef/whats-poppin/actions/runs/34174243617. DB bootstrap failed on missing optional supabase_functions_admin role; gateway failed map_hash_bucket_size. Actual Mailpit logs show [::]:1025 and [::]:8025, disproving the review's IPv4-only premise. Build round 3 removes unused-role password updates and sizes the gateway map; runtime re-execution remains pending.
- Safe setup allowed by inspection 3: created private project 163e2a9c-94ff-460b-9a76-c3393af6f89d (whats-poppin-supabase-staging) in workspace 8e743f4d-7fb0-4f26-a7de-e40fb02a6383; default environment renamed staging, ID 9bc55a09-5737-42df-a997-3827927b073b. Readback confirmed no service instances. No variables, sources, volumes or deployments attached.
- Build round 3 local evidence: malformed-query control rejected; corrected project inventory query succeeded against the actual empty staging project. CLI api stdin, connect --tunnel-only help and pinned Supabase CLI version verified; SSH to a running staging service remains gated on deployment.
