# P00 hosted database prerequisites

Scope: Results required before P00 backend completion and P01 database wiring. Local Docker is excluded. These external evidence gates stay unmet until the corresponding workflow and target exist; runnable checks must be authored with the workflow before its implementation, not replaced by invented run IDs or always-passing placeholders.

- [ ] H1: Disposable full Supabase stack starts on GitHub-hosted Ubuntu; the baseline reproduces known migration defects and passes healthy controls with measured PostGIS/vector/uuid versions.
  EVIDENCE: pending; require workflow URL, reviewed commit SHA, pinned CLI/config, exact C11 syntax-failure result and healthy control. P01 owns corrected migration and upgrade success; this P00 gate must not require those later repairs as its prerequisite.

- [ ] H2: Supabase Auth, RLS and API integration isolate two users and organizers, with published/draft/cancelled events across cities/timezones.
  EVIDENCE: pending; require workflow URL and reviewed commit SHA with allowed and denied cases; plain PostgreSQL or an auth.uid stub is insufficient.

- [ ] H3: Remote migration dry-run/apply and compatibility rehearsal pass against an explicitly named non-production target using its own migration history.
  EVIDENCE: pending; target not identified. Require trusted-branch workflow URL, commit SHA, non-secret project reference/schema version, dry-run/apply output and recovery evidence. Release stays blocked while absent.

- [ ] H4: GitHub/Railway deployment gate rejects failed or missing required hosted results and prevents untrusted PR code from receiving remote credentials.
  EVIDENCE: pending; require actual configuration and failed-check control. Disposable PR tests use no remote-project secrets; credentialed rehearsal uses a non-production GitHub Environment from reviewed trusted-branch code.
