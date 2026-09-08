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
