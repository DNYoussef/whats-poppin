# Unfinished API containment

Scope: Keep all currently unverified API operations unavailable before public staging, as required by PLAN.md P00 and API-POLICY.md. Preserve the public health endpoint and cron credential rejection. This is deliberate containment, not completed authentication, budgets or feature wiring. Business libraries remain; prior controllers are recoverable from commit 12873d4. Enabling an operation requires its distinct inventory policy and applicable budget gates, not an environment bypass.

- [ ] A1: Unfinished handlers return a non-cacheable 503 before parsing a body or accessing providers/database/workers. Health still succeeds; cron rejects invalid credentials and pauses valid credentials before work.
  CHECK: node node_modules/vitest/vitest.mjs run tests/api/containment.test.ts tests/api/cron-auth.test.ts
  CWD: ../../../..
  EXPECT: 2 passed
  EVIDENCE: pending; run the new containment test against the original handlers before replacing them.

- [ ] A2: A real Chromium session can open the assistant, see its unavailable alert without a page error, and close it. Its live API returns 503; ordinary search remains present. Failed design generation also displays an error.
  CHECK: python tests/browser/containment.py
  CWD: ../../../..
  EXPECT: BROWSER_CONTAINMENT_VERIFIED
  EVIDENCE: pending; production build required first. The same browser check must fail before the UI/handler changes and run in GitHub web CI after the final build.

- [ ] A3: Source lint, strict types, regression tests and production build pass in hosted CI on the reviewed revision.
  EVIDENCE: pending; actual GitHub run required, including the browser check.

- [ ] A4: Opus high independently approves the exact snapshot; Codex authors are excluded from reviewers.
  EVIDENCE: pending; three build rounds and three inspection rounds maximum. Independent read-only review does not claim command execution.

Browser Supabase reads, auth callbacks and future API/native/agent routes need their own controls. No live service is deployed by this unit. Existing authenticated cron work is deliberately paused until bounded service budgets and worker scheduling are implemented; the earlier cron-success gate is superseded by this fail-closed pause contract, not silently treated as unchanged.

Cron containment is also structural: its handlers import no worker libraries. Legacy worker spies are regression tripwires, not independent proof of work prevention; the original-handler fail-first matrix exercises the prior paths.
