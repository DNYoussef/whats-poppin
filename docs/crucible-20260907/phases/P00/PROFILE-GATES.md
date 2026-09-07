# Private profile containment

Scope: Forward SELECT containment for anon/authenticated roles, tested through real disposable Supabase Auth and PostgREST on GitHub Ubuntu. No live database migration. Historical migrations stay unchanged. Service-role access and broader event/API authorization are outside this unit.

- [x] P1: The real hosted privacy oracle rejects the original public profile leak, then passes after the forward policy with anonymous and cross-user denial, owner read/update, and published event controls.
  EVIDENCE: https://github.com/DNYoussef/whats-poppin/actions/runs/34156690206 at 2f22a8d0c1e45d9ddb7d9dea324ac2ed023ad411. database-baseline succeeded with PROFILE_LEAK_CONTROL_REJECTED and PROFILE_PRIVACY_VERIFIED. The direct-row and embedded-organizer assertions each rejected the real pre-migration rows for anon and Bob before passing after the migration. profile-hosted-run.json records the executed commit and successful job steps.

- [x] P2: Opus high independently approves the exact migration and probe snapshot.
  EVIDENCE: profile-audit-2.json, session 1cd23a95-8fdf-4a71-b306-ecb4456cff0a, requested opus/high, observed claude-opus-5. APPROVED for branch CI testing after two build/inspection rounds; no material findings. profile-review-snapshot.json SHA256 D2C48EB5A0F4CFF12E441DBF8D6AB0E282335F70AF0D820706B162DA5684BEC4 was rechecked unchanged before commit. Codex authored; Opus inspected read-only; GitHub executed independently. No claim that the confined auditor ran commands. Later ledger edits record evidence only.

This does not close all of HOSTED-GATES.md H2. Multi-city/timezone fixtures, organizer mutation isolation and application API integration remain required. Nonowners temporarily receive no organizer profile relation; the current event detail UI already conditionally renders that relation. A separately consented public organizer projection is later wiring work.

Compatibility: the currently unused isUsernameAvailable helper in src/lib/auth.ts queries profiles anonymously and will no longer detect taken names. P01 must map the database username uniqueness violation before connecting that flow; do not expose private rows to restore the precheck. Its separately existing session-less updateProfile client also remains P01 work. The hosted owner-update control validates the database policy through a real bearer token, not that application client.
