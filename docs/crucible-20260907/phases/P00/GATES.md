# Gates: P00 first implementation unit

OWNS: CLAUDE.md, vitest.config.ts, src/app/api/cron/**, tests/api/cron-auth.test.ts, docs/crucible-20260907/**

Scope: Close both missing-secret cron bypasses, run existing server tests without a DOM dependency, correct agent instructions, verify the CLI upgrade and audit the required website/iOS/Android plan amendment. This unit does not certify all P00 work.

- [x] G1: Both real cron handlers deny invalid configuration/credentials and pause authorized requests before unfinished work
  CHECK: node docs/crucible-20260907/phases/P00/check.mjs cron
  EXPECT: P00_CRON_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=84128ccea7f3/78 entries; EXPECT=matched; output-sha256=515a87f002c1b795a975ddf9f080e9d9b5f8b4d4aa7df754a60c2ea84b6f2aed; output-bytes=480

- [x] G2: Existing tests and new security regression tests pass in the configured runtime
  CHECK: node docs/crucible-20260907/phases/P00/check.mjs suite
  EXPECT: P00_SUITE_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=84128ccea7f3/78 entries; EXPECT=matched; output-sha256=6860475d1a54a0a7e00dd6cc6972dbd6d4dc69580a53e3285d0ed8ebda5aff7d; output-bytes=11443

- [x] G3: TypeScript remains valid
  CHECK: node docs/crucible-20260907/phases/P00/check.mjs types
  EXPECT: P00_TYPES_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=84128ccea7f3/78 entries; EXPECT=matched; output-sha256=b597dd6b0a128e4c249adcae642fef20da917facd5313d3f1d0d1dcfa6721da3; output-bytes=19

- [x] G5: Independent Opus high reviews the diff, instruction truth, failure controls and underlying gate commands
  EVIDENCE: audit-round3.json P00 FIRST UNIT APPROVED; independent reruns of all five commands passed with markers and no open findings. Author Codex; verifier Claude Opus high.

Railway CLI upgrade evidence: npm installed @railway/cli@5.49.3; railway --version returned 5.49.3 and config --help succeeded. Earlier 4.30.5 config --help failed with unrecognized subcommand. Agent setup installed missing integrations. No Railway service was mutated.

- [x] G4: Agent instructions describe the current stack and reject obsolete build directives
  CHECK: node docs/crucible-20260907/phases/P00/check.mjs instructions
  EXPECT: P00_INSTRUCTIONS_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=84128ccea7f3/78 entries; EXPECT=matched; output-sha256=f0ea575820584d7d1baef3a6f7d4aa88eefbefd4b457c15ba19e1a3de2102199; output-bytes=26

- [x] G6: Opus high verifies required website/iOS/Android phase ownership including store billing, privacy, device tests and separate release evidence
  EVIDENCE: audit-round3.json MOBILE PLAN APPROVED, P00_MOBILE_FINAL_AUDIT_COMPLETE; all prior mobile findings resolved. Native implementation remains future work.

- [x] G7: The explicitly listed cron and API containment source/tests/config pass lint without warnings; full src lint is additionally required by API-CONTAINMENT-GATES.md
  CHECK: node docs/crucible-20260907/phases/P00/check.mjs lint
  EXPECT: P00_LINT_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=84128ccea7f3/78 entries; EXPECT=matched; output-sha256=21f00cab0404a91418e04326ed353090701af31dd974484f38ebb9befb7639d8; output-bytes=18
