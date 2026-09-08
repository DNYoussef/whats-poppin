# Self-hosted Supabase gates

Scope: SELF-HOST-PLAN.md. Prior unit: four build rounds and four inspection rounds; resumed continuation: six build rounds and six inspection rounds; user authorized Railway staging provisioning. This does not complete the application's P01 migration work or authorize production cutover.

- [x] S1: Core deployment configuration rejects missing secrets, unpinned images, public internal services and disabled email confirmation; valid fixture configuration passes.
  CHECK: node tests/self-host/check-config.mjs
  CWD: ../../../..
  EXPECT: SELF_HOST_CONFIG_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=7edd7175e9c2/78 entries; EXPECT=matched; output-sha256=b64ef7f234187322e9e86d90562cd7c3da456a1c4edf100c07bf3d5d773be7b7; output-bytes=26

- [ ] S2: Secret-free GitHub container execution proves real Auth confirmation/login/refresh, rejected invalid API keys/JWTs, concurrent user isolation, extension availability and durable probe migration history, with known-bad controls.
  CHECK: python -B tests/self-host/run-ci.py
  CWD: ../../../..
  EXPECT: SELF_HOST_CORE_VERIFIED
  EVIDENCE: pending; hosted Linux only; require SELF_HOST_CORS_VERIFIED, SELF_HOST_SIGNUP_DENIAL_VERIFIED, SELF_HOST_EXTENSIONS, SELF_HOST_CONFIRMATION_VERIFIED, SELF_HOST_IDENTITY_RLS_VERIFIED, SELF_HOST_MIGRATIONS_VERIFIED, SELF_HOST_PERSISTENCE_VERIFIED, SELF_HOST_CLEANUP_VERIFIED, SELF_HOST_AUTH_LIFECYCLE_VERIFIED and SELF_HOST_CORE_VERIFIED in the exact-commit hosted workflow and decisive markers, not configuration inspection.

- [ ] S3: Independent Opus high approves the exact deployment snapshot before Railway changes; only new staging resources are created and original production configuration is preserved.
  EVIDENCE: pending; exact resource IDs, source and image pins, snapshot comparison, audit and before/after production readback required.

- [ ] S4: Each exact Railway deployment reaches SUCCESS and the running staging API passes Auth/RLS/migration checks; data and migration history survive a database restart.
  EVIDENCE: pending; record real API URL, bounded private database access and redacted results. Optional Supabase services and real SMTP are excluded explicitly; no full application compatibility claim.

S3 placement matrix: a new whats-poppin-supabase-staging project, environment staging, only the gateway has a public domain. DB PORT=5432 with PGDATA=/var/lib/postgresql/data/pgdata; gateway PORT=8080; Auth PORT=9999; REST PORT=3000. DB/Auth/REST receive distinct generated database passwords as applicable. JWT_SECRET goes only to DB/Auth/REST; gateway receives only the anon/service-role API keys. Auth API_EXTERNAL_URL is the actual gateway HTTPS URL; private hosts are sb-db, sb-auth, sb-rest, sb-mail under railway.internal. Signup starts disabled, opens only for the probe, and is disabled in finally with a denied-signup readback. Email limit is 2/hour and SMTP is private Mailpit without SMTP authentication. No production app configuration changes.

Attempt log (no successful core runtime claim yet):
- Build round 1, inspection 2: e6a23183fbcf73e834bf7add7639d226e1e38edf, https://github.com/DNYoussef/whats-poppin/actions/runs/34173258555, database startup failed. Baseline/mobile/native checks passed. Inspection allowed secret-free CI only.
- Build round 2, inspection 3: 68d8cdec633364730d3f6e5a01422ee1f4eb0c97, https://github.com/DNYoussef/whats-poppin/actions/runs/34174243617. DB bootstrap failed on missing optional supabase_functions_admin role; gateway failed map_hash_bucket_size. Actual Mailpit logs show [::]:1025 and [::]:8025, disproving the review's IPv4-only premise. Build round 3 removes unused-role password updates and sizes the gateway map; runtime re-execution remains pending.
- Safe setup allowed by inspection 3: created private project 163e2a9c-94ff-460b-9a76-c3393af6f89d (whats-poppin-supabase-staging) in workspace 8e743f4d-7fb0-4f26-a7de-e40fb02a6383; default environment renamed staging, ID 9bc55a09-5737-42df-a997-3827927b073b. Readback confirmed no service instances. No variables, sources, volumes or deployments attached.
- Build round 3 local evidence: malformed-query control rejected; corrected project inventory query succeeded against the actual empty staging project. CLI api stdin, connect --tunnel-only help and pinned Supabase CLI version verified; SSH to a running staging service remains gated on deployment.

Prior-unit runtime status: build round 3 at 25eb5b25f18ce26f704d46de1023d1e19886d59a failed the CORS assertion in probe.py:69 in run 34175136268 after database/gateway startup. Inspection budget exhausted; S2-S4 remain unmet. See SELF-HOST-HANDOFF.md for exact empty resources and remaining work. No backend was deployed.

Continuation attempt log:
- Build/inspection 1: 31ef03c, https://github.com/DNYoussef/whats-poppin/actions/runs/34176094640. Diagnostic CI observed allowed origins ["*", "http://localhost:3000"] and denied origins ["*"], then failed the preserved oracle.
- Build/inspection 2: 333fcb2, fixes gateway ownership, exact assertions over all origin-header occurrences, long operation limits and Auth variable retention. Opus approved secret-free CI only; hosted run pending.
- Build/inspection 3: follow-up changes CI timeout failure to builtin TimeoutError so ready() cannot swallow it, requires complete credential state, and corrects this procedure and evidence record. Review pending.

Current status: runtime and Railway acceptance remain unmet. The gateway exposes only content-range to browser clients; application compatibility rehearsal must evaluate any additional response headers needed. Added non-Railway variables are not rejected by the toggle readback; dropped or changed preexisting variables are rejected.

- Build 2 hosted result: https://github.com/DNYoussef/whats-poppin/actions/runs/34176638782 passed CORS and measured PostGIS 3.3.7/vector 0.8.2/uuid-ossp 1.1, then failed signup HTTP 500. Auth logs were omitted by the global output tail; no successful Auth lifecycle claim.
- Build/inspection 3 statically approved follow-up; Dockerfile path field existence condition resolved by live ServiceInstanceUpdateInput introspection (dockerfilePath: String). No deployment executed.
- Build/inspection 4 removes fake SMTP authentication from the private Mailpit fixture, adds per-service bounded redacted failure logs, and validates credential value types. Pinned GoTrue uses gomail 81ebce5c23df, which chooses smtp.PlainAuth when PLAIN is advertised; Mailpit accepts PLAIN and LOGIN, while Go PlainAuth refuses non-TLS non-localhost hosts. This is a source-based explanation for the HTTP 500, pending actual hosted confirmation. Static fixture test failed on the old SMTP_USER before removal.
