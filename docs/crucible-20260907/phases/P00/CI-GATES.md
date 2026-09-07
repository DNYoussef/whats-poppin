# Hosted baseline workflow

Scope: Prepare and verify GitHub web and disposable Supabase baseline jobs. No local Docker or remote-project credentials. A baseline reproduction does not clear application release gates.

- [x] G1: baseline.yml enforces its two unprivileged baseline jobs and pinned tooling; other workflows need separate review.
  CHECK: node tests/hosted/check-workflow.mjs
  CWD: ../../../..
  EXPECT: WORKFLOW_CONTRACT_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=242ac168acdb/78 entries; EXPECT=matched; output-sha256=9b53f408197ec45f583ed742e59423607b250fd4506ab5a0740d40509d87d34c; output-bytes=27

- [x] G2: Real hosted Supabase baseline executes against the reviewed commit.
  EVIDENCE: https://github.com/DNYoussef/whats-poppin/actions/runs/34155357497 at c430dbc13a290fcae0ed7f0ba44acb85f68401ac; both jobs succeeded. Database log records C11_SYNTAX_FAILURE_REPRODUCED and HOSTED_BASELINE_REPRODUCED, PostGIS 3.3.7, vector 0.8.2 and uuid-ossp 1.1. This is evidence for that baseline revision; subsequent probe changes need a new run.

Optional Supabase services retain their pinned CLI defaults initially; measure hosted startup before trimming them. Studio and analytics are already disabled. This baseline tests Auth/PostgREST readiness and SQL, not every optional service.

- [x] G3: Opus high independently reviews workflow, database probe and API policy inventory.
  EVIDENCE: ci-final.json, session beff1d51-2f05-4dc3-9108-693c69b0e869, APPROVED for branch CI testing. All blocking findings closed; adopted the one-line self-invocation check and targeted removal control. Hosted execution is still required before G2 closes.

- [x] G4: Every current exported API method has an explicit required policy; missing and extra rows fail the inventory check.
  CHECK: node node_modules/vitest/vitest.mjs run tests/api-policy-inventory.test.ts
  CWD: ../../../..
  EXPECT: 1 passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=242ac168acdb/78 entries; EXPECT=matched; output-sha256=6c670742e16d97ba8f8bd1e03b5577d68ddd0bc186a549d82b4827d762eeda1d; output-bytes=717
