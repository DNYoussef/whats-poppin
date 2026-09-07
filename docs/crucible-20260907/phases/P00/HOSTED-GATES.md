# P00 hosted database prerequisites

Scope: Results required before P00 backend completion and P01 database wiring. Local Docker is excluded. These external evidence gates stay unmet until the corresponding workflow and target exist; runnable checks must be authored with the workflow before its implementation, not replaced by invented run IDs or always-passing placeholders.

- [x] H1: Disposable full Supabase stack starts on GitHub-hosted Ubuntu; the baseline reproduces known migration defects and passes healthy controls with measured PostGIS/vector/uuid versions.
  EVIDENCE: https://github.com/DNYoussef/whats-poppin/actions/runs/34155357497 at c430dbc13a290fcae0ed7f0ba44acb85f68401ac; database-baseline succeeded with both healthy controls and C11_SYNTAX_FAILURE_REPRODUCED. PostGIS 3.3.7, vector 0.8.2, uuid-ossp 1.1. P01 corrected/upgrade migrations remain open.

- [ ] H2: Supabase Auth, RLS and API integration isolate two users and organizers, with published/draft/cancelled events across cities/timezones.
  EVIDENCE: pending; require workflow URL and reviewed commit SHA with allowed and denied cases; plain PostgreSQL or an auth.uid stub is insufficient.

- [ ] H3: Remote migration dry-run/apply and compatibility rehearsal pass against an explicitly named non-production target using its own migration history.
  EVIDENCE: pending; target not identified. Require trusted-branch workflow URL, commit SHA, non-secret project reference/schema version, dry-run/apply output and recovery evidence. Release stays blocked while absent.

- [ ] H4: GitHub/Railway deployment gate rejects failed or missing required hosted results and prevents untrusted PR code from receiving remote credentials.
  EVIDENCE: pending; require actual configuration and failed-check control. Disposable PR tests use no remote-project secrets; credentialed rehearsal uses a non-production GitHub Environment from reviewed trusted-branch code.
