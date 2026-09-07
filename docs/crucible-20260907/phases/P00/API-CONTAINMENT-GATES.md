# Unfinished API containment

Scope: Keep all currently unverified API operations unavailable before public staging, as required by PLAN.md P00 and API-POLICY.md. Preserve the public health endpoint and cron credential rejection. This is deliberate containment, not completed authentication, budgets or feature wiring. Business libraries remain; prior controllers are recoverable from commit 12873d4. Enabling an operation requires its distinct inventory policy and applicable budget gates, not an environment bypass.

- [x] A1: Unfinished handlers return a non-cacheable 503 before parsing a body or accessing providers/database/workers. Health still succeeds; cron rejects invalid credentials and pauses valid credentials before work.
  CHECK: node node_modules/vitest/vitest.mjs run tests/api/containment.test.ts tests/api/cron-auth.test.ts
  CWD: ../../../..
  EXPECT: 2 passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=a6fcd07f3f20/78 entries; EXPECT=matched; output-sha256=b1f27a88c773fa5c8086eed10be2ebf3a2f9bdb8bb054fd759b6abd26178e977; output-bytes=886

- [x] A2: A real Chromium session can open the assistant, see its unavailable alert without a page error, and close it. Its live API returns 503; ordinary search remains present. Failed design generation also displays an error.
  CHECK: python tests/browser/containment.py
  CWD: ../../../..
  EXPECT: BROWSER_CONTAINMENT_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=a6fcd07f3f20/78 entries; EXPECT=matched; output-sha256=1daed750281a75b81e7c60469718f7b12239b1d371db4be56015538ce3fb5b44; output-bytes=61

- [x] A3: Source lint, strict types, regression tests and production build pass in hosted CI on the reviewed revision.
  EVIDENCE: https://github.com/DNYoussef/whats-poppin/actions/runs/34161339691 at 1c27d5598bf40876d7ea0f77e13f92f3bcbc9d9d passed both jobs, including 96 tests and BROWSER_CONTAINMENT_VERIFIED. api-hosted-run.json records the exact head and jobs.

- [x] A4: Opus high independently approves the exact snapshot; Codex authors are excluded from reviewers.
  EVIDENCE: api-audit-2.json APPROVED in session 416ae35c-2096-4483-85c5-9994fd60fdb6, served claude-opus-5 at high effort; Codex is sole author, Opus read-only reviewer. api-review-snapshot.json was checked unchanged before commit. Two inspection rounds used. Independent inspection is separate from hosted execution.

Browser Supabase reads, auth callbacks and future API/native/agent routes need their own controls. No live service is deployed by this unit. Existing authenticated cron work is deliberately paused until bounded service budgets and worker scheduling are implemented; the earlier cron-success gate is superseded by this fail-closed pause contract, not silently treated as unchanged.

Cron containment is also structural: its handlers import no worker libraries. Legacy worker spies are regression tripwires, not independent proof of work prevention; the original-handler fail-first matrix exercises the prior paths.

Failure controls: api-fail-first.json records 46 failed containment cases and 5 controls passing against original handlers using the final test. browser-fail-first.txt records the final browser script rejecting the original UI after the paused API returned 503. Both final current-source checks were rerun after restoration.
