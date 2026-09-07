# P00 search debounce repair

Scope: Cancel obsolete search timers and remove the search hook lint defect.

- [x] G1: Hook-mocked effect body schedules and cleanup cancels, with declared query/callback/delay dependencies; no renderer coverage claimed.
  CHECK: node node_modules/vitest/vitest.mjs run tests/search-debounce.test.ts
  CWD: ../../../..
  EXPECT: 1 passed
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=32d64807f6ac/78 entries; EXPECT=matched; output-sha256=844ee3327b195ba4fee40a84e46a5b9f9f99e93fb2b1aede31e1c06e4e72c35d; output-bytes=705

- [x] G2: Search component and regression test have no lint warnings.
  CHECK: node docs/crucible-20260907/phases/P00/check-search.mjs
  CWD: ../../../..
  EXPECT: SEARCH_LINT_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=32d64807f6ac/78 entries; EXPECT=matched; output-sha256=149ce699a87a093e4119ab5a353c88df07d2c0a12ffc24bb297ac626eae73cbc; output-bytes=21

- [x] G3: Independent Opus high audit approves the diff and gate.
  EVIDENCE: search-audit-final.json, Opus high session 8aae7ede-1103-41de-aca9-9b30b60beeae, APPROVED with ledger CWD correction. Applied the requested explicit CWD to both runnable gates; their own runner must freshly verify it. F1-F4 closed by the independent auditor. Timer-body/dependency checks only, not full browser evidence.
