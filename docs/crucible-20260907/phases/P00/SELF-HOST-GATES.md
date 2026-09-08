# Self-hosted Supabase gates

Latest September 8 activation: existing staging configuration, DB volume, sole gateway domain and CI-denial control are verified. Mailpit runs; DB build failed on the old Next dependency. The mobile root-lock anchor is corrected; the security patch needs fresh review/CI before retarget/deploy. S3/S4/H3a remain open; SELF-HOST-HANDOFF.md has exact current resources, evidence and next steps. Older empty-staging paragraphs below are historical.

September 8 continuation: source 902064a4a825dfa6be72fc55b5d3b0c798fd6132 passed self-host34225484904, baseline34225484893, mobile34225484902 and native34225484883 (both platforms). Operator target/tunnel fixes are implemented and code/CI reviewed. Empty staging core exists within the original project; exact IDs, personal operator key and private state are in SELF-HOST-HANDOFF.md. No backend deployed yet: S3/S4 and H3a remain open. Four inspection rounds ended with approval only for code/CI and empty-staging/key setup; actual configuration/deployment needs the next bounded review. Earlier evidence below remains historical.

Scope: SELF-HOST-PLAN.md. Prior unit: four build rounds and four inspection rounds; resumed continuation: six build rounds and six inspection rounds; user authorized Railway staging provisioning. This does not complete the application's P01 migration work or authorize production cutover.

- [x] S1: Core deployment configuration rejects missing secrets, unpinned images, public internal services and disabled email confirmation; valid fixture configuration passes.
  CHECK: node tests/self-host/check-config.mjs
  CWD: ../../../..
  EXPECT: SELF_HOST_CONFIG_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=7edd7175e9c2/78 entries; EXPECT=matched; output-sha256=b64ef7f234187322e9e86d90562cd7c3da456a1c4edf100c07bf3d5d773be7b7; output-bytes=26

- [x] S2: Secret-free GitHub container execution proves real Auth confirmation/login/refresh, rejected invalid API keys/JWTs, concurrent user isolation, extension availability and durable probe migration history, with known-bad controls.
  CHECK: python -B tests/self-host/run-ci.py
  CWD: ../../../..
  EXPECT: SELF_HOST_CORE_VERIFIED
  EVIDENCE: historical hosted Linux only; not runnable on this Windows device; exact source dc9f41e14a157ffcae99dd6707ba4a3fb58db357; GitHub run https://github.com/DNYoussef/whats-poppin/actions/runs/34178060368 succeeded; fresh log read contains SELF_HOST_CORS_VERIFIED, SELF_HOST_SIGNUP_DENIAL_VERIFIED, SELF_HOST_EXTENSIONS, SELF_HOST_CONFIRMATION_VERIFIED, SELF_HOST_IDENTITY_RLS_VERIFIED, SELF_HOST_MIGRATIONS_VERIFIED, SELF_HOST_PERSISTENCE_VERIFIED, SELF_HOST_CLEANUP_VERIFIED, SELF_HOST_AUTH_LIFECYCLE_VERIFIED and SELF_HOST_CORE_VERIFIED in the exact-commit hosted workflow and decisive markers, not configuration inspection.

- [ ] S3: Independent Opus high approves the exact deployment snapshot before Railway changes; only intended staging resources in the existing project are provisioned; original production deployed configuration and staged patches are preserved. Runner target allowlist and native SSH forwarding must pass fresh controls before this gate can close.
  EVIDENCE: pending; exact resource IDs, source and image pins, snapshot comparison, audit and before/after production readback required.

- [ ] S4: Each exact Railway deployment reaches SUCCESS and the running staging API passes Auth/RLS/migration checks; data and migration history survive a database restart.
  EVIDENCE: pending; record real API URL, bounded private database access and redacted results. Optional Supabase services and real SMTP are excluded explicitly; no full application compatibility claim.

S3 placement matrix: existing industrious-compassion project b5dc8a11-2f0a-4956-a8ca-0899a0364649, verified staging environment 241b46e7-3a5d-489a-824e-57cd2618784f; among core services, only the gateway has a public domain. DB PORT=5432 with PGDATA=/var/lib/postgresql/data/pgdata; gateway PORT=8080; Auth PORT=9999; REST PORT=3000. DB/Auth/REST receive distinct generated database passwords as applicable. JWT_SECRET goes only to DB/Auth/REST; gateway receives only the anon/service-role API keys. Auth API_EXTERNAL_URL is the actual gateway HTTPS URL; private hosts are sb-db, sb-auth, sb-rest, sb-mail under railway.internal. Signup starts disabled, opens only for the probe, and is disabled in finally with a denied-signup readback. Email limit is 2/hour and SMTP is private Mailpit without SMTP authentication. No production app configuration changes.

Historical attempt log (statuses below describe those attempts, not the current S2 result):
- Build round 1, inspection 2: e6a23183fbcf73e834bf7add7639d226e1e38edf, https://github.com/DNYoussef/whats-poppin/actions/runs/34173258555, database startup failed. Baseline/mobile/native checks passed. Inspection allowed secret-free CI only.
- Build round 2, inspection 3: 68d8cdec633364730d3f6e5a01422ee1f4eb0c97, https://github.com/DNYoussef/whats-poppin/actions/runs/34174243617. DB bootstrap failed on missing optional supabase_functions_admin role; gateway failed map_hash_bucket_size. Actual Mailpit logs show [::]:1025 and [::]:8025, disproving the review's IPv4-only premise. Build round 3 removes unused-role password updates and sizes the gateway map; runtime re-execution remains pending.
- Safe setup allowed by inspection 3: created private project 163e2a9c-94ff-460b-9a76-c3393af6f89d (whats-poppin-supabase-staging) in workspace 8e743f4d-7fb0-4f26-a7de-e40fb02a6383; default environment renamed staging, ID 9bc55a09-5737-42df-a997-3827927b073b. Readback confirmed no service instances. No variables, sources, volumes or deployments attached.
- Build round 3 local evidence: malformed-query control rejected; corrected project inventory query succeeded against the actual empty staging project. CLI api stdin, connect --tunnel-only help and pinned Supabase CLI version verified; SSH to a running staging service remains gated on deployment.

Prior-unit runtime status: build round 3 at 25eb5b25f18ce26f704d46de1023d1e19886d59a failed the CORS assertion in probe.py:69 in run 34175136268 after database/gateway startup. Inspection budget exhausted; S2-S4 remain unmet. See SELF-HOST-HANDOFF.md for exact empty resources and remaining work. No backend was deployed.

Continuation attempt log:
- Build/inspection 1: 31ef03c, https://github.com/DNYoussef/whats-poppin/actions/runs/34176094640. Diagnostic CI observed allowed origins ["*", "http://localhost:3000"] and denied origins ["*"], then failed the preserved oracle.
- Build/inspection 2: 333fcb2, fixes gateway ownership, exact assertions over all origin-header occurrences, long operation limits and Auth variable retention. Opus approved secret-free CI only; hosted run pending.
- Build/inspection 3: follow-up changes CI timeout failure to builtin TimeoutError so ready() cannot swallow it, requires complete credential state, and corrects this procedure and evidence record. Review pending.

Historical intermediate status: runtime and Railway acceptance were unmet at that attempt. The gateway exposes only content-range to browser clients; application compatibility rehearsal must evaluate any additional response headers needed. Added non-Railway variables are not rejected by the toggle readback; dropped or changed preexisting variables are rejected.

- Build 2 hosted result: https://github.com/DNYoussef/whats-poppin/actions/runs/34176638782 passed CORS and measured PostGIS 3.3.7/vector 0.8.2/uuid-ossp 1.1, then failed signup HTTP 500. Auth logs were omitted by the global output tail; no successful Auth lifecycle claim.
- Build/inspection 3 statically approved follow-up; Dockerfile path field existence condition resolved by live ServiceInstanceUpdateInput introspection (dockerfilePath: String). No deployment executed.
- Build/inspection 4 removes fake SMTP authentication from the private Mailpit fixture, adds per-service bounded redacted failure logs, and validates credential value types. Pinned GoTrue uses gomail 81ebce5c23df, which chooses smtp.PlainAuth when PLAIN is advertised; Mailpit accepts PLAIN and LOGIN, while Go PlainAuth refuses non-TLS non-localhost hosts. This is a source-based explanation for the HTTP 500, pending actual hosted confirmation. Static fixture test failed on the old SMTP_USER before removal.

- Build 4 hosted result at 062f5d7d33147418df9348c46dba6198567678ed: https://github.com/DNYoussef/whats-poppin/actions/runs/34177309671 passed CORS, extension versions, confirmation, identity/RLS, migrations, persistence, cleanup and Auth lifecycle. Final forced-signup-disable check failed parsing a temporary non-JSON gateway error during Auth replacement. Full workflow remains red; no deployment permission from these partial results.
- Build/inspection 5: reject unexpected signup HTTP status before JSON parsing so existing readiness retries handle gateway replacement; on Railway require actual denied-signup response before reporting closure after the new Auth deployment. Fixture controls reject HTML 502 and wrong-error 403, and accept the exact signup_disabled 422 response. Full hosted re-execution pending.

- Build/inspection 5 approved CI at a95f7b8 but found that denial probes can create disabled-control@poppin.invalid while signup is enabled. Build/inspection 6 explicitly deletes this fixed staging control identity in finally after signup closure attempts, reports cleanup failures, preserves final zero-residue assertion, and bounds each signup readiness loop by 300 seconds as well as 90 iterations. Deployment remains gated on independent review and exact-source hosted checks.

Final continuation evidence:
- Exact source dc9f41e14a157ffcae99dd6707ba4a3fb58db357: self-host34178060368, baseline34178060331, mobile34178060355 and native34178060324 all completed SUCCESS. Native includes actual iOS and Android compilation. Complete self-host log includes every S2 marker, including final signup denial.
- Inspection6 approved snapshot c70f9c54bf9611210b302bebf02fe70fd50d481fdd0ede70efe4eca6ba6b54fd with no material code finding; execution was conditional on exact-source CI. New CLI preflight/source finding now blocks the documented operator path: railway connect recognizes databases only from source.image, while the planned DB uses source.repo. Real connect against the current empty DB service returned No supported database found in service; the pinned CLI source proves adding a GitHub repo does not satisfy its image-only classifier.
- No backend deployment, source, variable, domain or volume was attached in this continuation. Original production readback matched this continuation's baseline; modified-response control rejected. S3/S4 remain unmet. Six build/inspection rounds consumed; remaining fix is recorded in SELF-HOST-HANDOFF.md.
