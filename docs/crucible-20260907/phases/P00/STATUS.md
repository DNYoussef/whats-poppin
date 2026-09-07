# P00 progress

September 7 execution constraint: the user confirmed Docker does not work on this device. Local container setup is removed from the execution path. PLAN.md now assigns the full disposable Supabase test stack to GitHub-hosted Ubuntu, with remote rehearsal against a separate non-production target. HOSTED-GATES.md tracks the open backend prerequisites. Those database gates remain open until executed; continue local Node work meanwhile. Opus high approved the amendment in docker-plan-final.json after correcting database fidelity, secret scope and release gating. Hosted checks remain unexecuted.

The first unit fixes missing-secret authorization in both cron handlers, restores Node-based server tests and replaces stale agent instructions. Railway CLI 5.49.3 is installed and config help works. Agent integration setup completed; newly configured tools require restart to load.

Fail-first evidence: cron-fail-first.txt records six failures and ten allowed/other passing cases before the guard fix. The old test configuration also failed with missing jsdom; existing suites exercise server code, so the configured environment is now Node. The instruction check rejected the old CLAUDE.md and includes injected obsolete-directive controls. A unit is not the whole phase.

Remaining P00 work: authenticated/bounded paid-API containment and shared provider budgets; route-policy inventory; public-profile privacy containment; clean build and isolated SQL migration baseline; source-claim reproductions; GitHub push CI and effective Railway environment inventory/configuration; native build/auth/location/store-purchase feasibility and platform account/device prerequisites. None is marked complete by the first unit. Broad lint still reports the five pre-existing hook warnings outside this diff. No production service, database, billing, crawl or store submission changed.

The copied top-level GATES.md and probe-baseline.mjs belong to the original planning snapshot. Do not treat the old C09 defect probe as an implementation gate after fixing C09. Current unit checks are in this directory's GATES.md. The native scope amendment requires fresh manual review of the plan.


Additional open P00 requirements: fixtures for two users, separate organizers, multiple cities/timezones and draft/published/cancelled events; unfinished endpoints unavailable in public staging; recorded full lint result and repair before required CI activation. Full npm run lint:ci currently exits 1 on the five baseline hook warnings. P00 must fix them with behavioral checks before enabling the deployment CI gate, rather than omit lint or defer those baseline failures to P09. Scoped lint for this unit is a separate passing check, not a substitute for the full lint gate.

Audit corrections: removed the redundant trim predicate because real Headers normalization already prevents a blank secret from matching; the blank case remains a transport regression, not one of the six pre-fix failures. Secret comparison now uses fixed-size SHA-256 digests with timingSafeEqual. Added a random second valid credential, explicit test-report scenario/coverage checks and malformed/missing-case controls. Removed the unused historical-line exemption in the instruction checker. Updated cron comments to label their legacy Vercel schedule; Railway scheduling is still not claimed working.

First unit independently approved by Opus high; all seven unit gates are ready for final re-verification. The remaining P00 requirements above are still open. Native plan is approved, but no mobile app has been built or submitted.

Search debounce unit: removed the hand-written debounce helper and cancelled pending timers through effect cleanup. HOOK-GATES.md records the independent Opus review, regression and scoped lint. Full repository lint still has four pre-existing hook warnings. The production build passed after the source fix; no browser-renderer or live-service result is claimed by the hook-mocked test.
