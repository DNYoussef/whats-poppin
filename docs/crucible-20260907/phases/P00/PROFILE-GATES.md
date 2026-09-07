# Private profile containment

Scope: Forward SELECT containment for anon/authenticated roles, tested through real disposable Supabase Auth and PostgREST on GitHub Ubuntu. No live database migration. Historical migrations stay unchanged. Service-role access and broader event/API authorization are outside this unit.

- [ ] P1: The real hosted privacy oracle rejects the original public profile leak, then passes after the forward policy with anonymous and cross-user denial, owner read/update, and published event controls.
  EVIDENCE: pending; require reviewed commit, hosted run URL and PROFILE_PRIVACY_VERIFIED marker. The original public rows must first trip the same empty-result assertion.

- [ ] P2: Opus high independently approves the exact migration and probe snapshot.
  EVIDENCE: pending; Codex authors are excluded from reviewers. Three build rounds and three inspection rounds maximum.

This does not close all of HOSTED-GATES.md H2. Multi-city/timezone fixtures, organizer mutation isolation and application API integration remain required. Nonowners temporarily receive no organizer profile relation; the current event detail UI already conditionally renders that relation. A separately consented public organizer projection is later wiring work.

Compatibility: the currently unused isUsernameAvailable helper in src/lib/auth.ts queries profiles anonymously and will no longer detect taken names. P01 must map the database username uniqueness violation before connecting that flow; do not expose private rows to restore the precheck. Its separately existing session-less updateProfile client also remains P01 work. The hosted owner-update control validates the database policy through a real bearer token, not that application client.
