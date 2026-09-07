# P00 effect dependencies

Scope: Remove remaining hook lint failures while preserving request triggers using the real React 18 renderer. Browser, native and backend authorization checks remain separate.

- [x] G1: Configured src lint passes with zero warnings; no new suppressions is a separate audit claim.
  CHECK: npm run lint:ci
  CWD: ../../../..
  EXPECT: No ESLint warnings or errors
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=8c655a258b13/78 entries; EXPECT=matched; output-sha256=0f8b6f80b88bc0893fbcb0d3ddd2b56f85d4db4d823f0539700960ded9a6c95f; output-bytes=93

- [x] G2: React lifecycle request triggers follow event, user and dialog changes without render loops.
  CHECK: node docs/crucible-20260907/phases/P00/check-lifecycle.mjs
  CWD: ../../../..
  EXPECT: LIFECYCLE_VERIFIED
  EVIDENCE: exit=0; shell=C:\WINDOWS\system32\cmd.exe; cwd=C:\Users\17175\.codex-work\whats-poppin-p00-20260907; path=8c655a258b13/78 entries; EXPECT=matched; output-sha256=63f2e3f07e9d2edb1d483d0c71c0af458160a5d907d25cf230af51664a8ad48b; output-bytes=19

- [x] G3: Independent Opus high approves code and checks.
  EVIDENCE: lifecycle-final.json, session 58021984-3b08-4536-9920-12d242da7259, APPROVED after gate wording, exact named-case reporting and test lint corrections. Actual React renderer checks, not browser or backend authorization evidence.
