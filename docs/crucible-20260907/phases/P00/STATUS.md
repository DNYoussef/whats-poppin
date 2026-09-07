# P00 progress

P00 is incomplete. The implementation branch contains reviewed local fixes; database wiring and public release remain gated.

Completed local units:
- Cron handlers reject missing/invalid secrets before work, with authorized success/error controls. Original fail-first evidence is cron-fail-first.txt.
- Node test runtime and truthful CLAUDE.md instructions restored. Generated .next output is excluded from coverage; application source remains included.
- Search timers cancel obsolete work. HOOK-GATES.md and search-audit-final.json record the bounded hook-body evidence.
- Four remaining hook lint failures repaired without new suppressions. LIFECYCLE-GATES.md and lifecycle-final.json record real React renderer request-trigger tests, exact-case gates and independent Opus approval. Configured src lint now passes; pre-existing suppressions elsewhere remain outside this unit.
- Production build and strict typecheck pass locally. The build still warns about Supabase Node APIs in the Edge runtime and stale browser compatibility data. Neither warning establishes a runtime failure or a clean production release.

Infrastructure and CI:
- Railway MCP now performs authenticated project/service reads in this session after the stable CLI/configuration repair. RAILWAY-INVENTORY.md records the exact project, main-branch source, disabled Wait for CI and the older successful deployment revision.
- Docker cannot work on this Windows device. Do not attempt local Docker or Supabase containers. The approved PLAN.md sends the real Supabase test stack to GitHub-hosted Ubuntu; remote-project rehearsal uses a separate non-production target.
- GitHub run 34155357497 passed both baseline jobs at c430dbc13a290fcae0ed7f0ba44acb85f68401ac, including web lint/types/tests/build and the disposable Supabase baseline with healthy controls and the C11 syntax defect. CI-GATES.md and HOSTED-GATES.md H1 record evidence; full RLS safety and release readiness remain open.
- API-POLICY.md maps the required principal and containment checks for each current API operation. Its inventory test does not implement those policies or authorize release.

Remaining P00 work:
- Handler authentication, bounded paid requests and atomic provider/project budgets; keep unfinished endpoints unavailable before public staging.
- Private profile containment and synthetic fixtures with two users, separate organizers, multiple cities/timezones and published/draft/cancelled events.
- Hosted migration/constraint/Auth/RLS evidence, source-claim reproductions, remote migration dry-run and recovery/compatibility checks. HOSTED-GATES.md remains open.
- Effective Railway staging/configuration and required push-check rollout; do not treat the new baseline workflow as an enabled production gate.
- Native build/auth/location/store-purchase feasibility, signing/account/device access and separate website/iOS/Android release evidence.

The top-level planning GATES.md and probe-baseline.mjs certify the historical planning snapshot. Use the current phase ledgers for implementation; the old C09 defect probe must not be treated as an implementation pass after its fix. No production deployment, live database migration, model spending, crawl, billing or store submission has been performed in this work.
