# Independent audit and disposition

Author of plan/probes: Codex. Independent auditor: Claude CLI, --model opus --effort high --permission-mode plan. The CLI reported canonical model claude-opus-5. The Opus/high pairing returned the preflight token WHATS_POPPIN_OPUS_HIGH_OK. No model fallback was requested.

Round one completed with WHATS_POPPIN_PLAN_AUDIT_COMPLETE and a needs-revisions verdict. The auditor independently ran probe-baseline.mjs and inspected source/SQL. [Raw round-one result](audit-round1.json) includes the findings, execution metadata and permission denials. Some optional MCP augmentation calls were denied in the auditor environment; this is not represented as an augmentation success. Source reads and the baseline probe executed.

## Round-one findings and changes

| Finding | Disposition |
| --- | --- |
| B1: artifact checker misses untracked app files | Accepted. G2 now combines git diff with git ls-files --others --exclude-standard; its changed-list validator rejects a synthetic src/canary.ts and empty scan. |
| B2: invalid partial UNIQUE constraint in design migration | Accepted. C11 now records the actual invalid SQL, P00 reproduces it, and P01 owns the correct fresh/upgrade migration with a partial unique index. P02 owns payload mapping, atomic save and rendering. |
| B3: dollar/cents mismatch | Accepted. Added C16, executable formatPrice evidence with a working control, and P01/P02 migration/UI ownership with exact price round-trip acceptance. |
| M1: organizer identity/claim verification | Accepted. Data table and P01/P03 define profile-linked identity, ownership claims, verification evidence and rejected unauthorized takeovers. |
| M2: canonical venues and timezone | Accepted. P03 owns canonical venues, source links, explicit city/timezone and cross-source alias/cross-city nonmerge fixtures. |
| M3: export/deletion ownership | Accepted. P01 builds account operations; P04 covers billing retention; P08 extends to encounters, private feedback and derived state. |
| M4: invitation delivery | Accepted. P08 owns an in-app inbox and unread/expiry state, tested with a recipient returning later. |
| M5: query-time global scores | Accepted. P08 prohibits cross-pair incoming-feedback aggregates and adds positive/negative/nonresponse counterfactual invariance checks for a fixed pair. |
| M6: late source-access learning and all-or-nothing release | Accepted with full-scope preservation. Source-access spike starts P03. Added core/private and optional one-city release checkpoints with applicable P09 checks and independent audit before exposure. The later agent/nightly/friend work remains required; no partial release is overall completion. |
| N1: probe scope overstatement | Accepted. G1 names its actual claim IDs; CLAIMS distinguishes executable observations from source review. |
| N2: missing-link control | Accepted. G2's actual link validator is called on a deliberately broken relative link inside assert.throws. |
| N3: enumerate API containment | Accepted enumeration; qualified exploitability. CLAIMS lists AI/user/cron/design endpoints and the intentionally public health possibility. Configured cron routes do check secrets; broken initialization and RLS mean missing route guards alone do not prove successful unauthorized live writes. |
| N4: module-import configuration error | Accepted in C01 and P00 missing-config acceptance. |
| N5: agent quota | Accepted in P06: per-grant quota, 429 and Retry-After. |
| N6: discovery cost oracle | Accepted in P07: repeated deterministic searches require zero chat calls; bounded clarification and shared interest embedding work. |
| N7: conversation role spoofing | Accepted in P07 immediately: server owns state, client supplies only a bounded new user turn. P09 rechecks it. |
| N8: mid-task revocation | Accepted in P06: cancel work and recheck permission before side effects. |
| N9: event spam/takedown | Accepted in P02 with report, moderator hide/restore, cache invalidation and appeal/correction. |
| N10: A2A release claim | Qualified rather than withdrawn. A2A 1.0 was verified from its primary published specification in this session. RESEARCH now separates that dated observation from SDK/runtime compatibility to be proven during implementation. |
| N11: defer nightly samples/design rendering; name A2A consumer | Scope-preserving adjustment. The user requested nightly checks and finishing unfinished parts, so retain bounded visual sampling and finish the existing saved-design flow without expanding it. Cap the initial sample to one per city/night inside the daily budget, with explicit skipped outcomes. Named independent a2a-js client is the interoperability target. |

Additional builder review recorded C17 (category contract mismatch), design reasoning/description mismatch under C11, and at-least-once worker execution with fenced/idempotent effects. These refinements are included in the second audit scope.

## Verification interpretation

G1 verifies observations of defects, not repaired app behavior. G2 checks ASCII, local links and tracked/untracked file boundaries, not semantic plan quality. Both have failure controls. G3 and G4 deliberately remain manual judgments because a keyword scan cannot prove that a plan meets the user's intent or that a protocol design is sound.

Strict gate lint therefore reports two manual-gate warnings; it does not pass strict mode. The normal lint invocation reports those same warnings without a syntax error. This limitation is explicit; no dummy CHECK command was added to conceal the necessary independent judgment.

Second-round verdict: READY_FOR_IMPLEMENTATION_PLAN, with WHATS_POPPIN_PLAN_RECHECK_COMPLETE. [Raw recheck](audit-round2.json) records successful independent reruns of both checks. All prior blocking and major findings were resolved. Five residual minor issues were corrected immediately: all C01-C17 are included in baseline/final review, retry acceptance describes idempotent effects, skipped_budget has an explicit honesty test, design features/required description are mapped, and the multi-source takedown case belongs to P03.

One additional mechanical correction anchors G2's tracked diff to the inspected baseline commit instead of HEAD. This preserves the check if the planning files are later committed and prevents an intervening application commit from hiding changes. The final narrow recheck covers this change and the five minor corrections.

Round-three verdict (superseded; pre-Railway plan only): READY_FOR_IMPLEMENTATION_PLAN, with WHATS_POPPIN_FINAL_AUDIT_COMPLETE. [Raw final audit](audit-round3.json) confirms all five minor corrections, verifies the baseline commit, independently reruns both probes to exit 0 with their success markers, and reports no new findings. No blocking or major planning findings remain. This is approval of the plan and evidence trail only; application implementation and live-service verification remain future work.

## Railway/GitHub amendment

User clarified GitHub-connected Railway hosting. The plan now assigns CI gating, distinct web/finite worker services, replacement schedules, migration ownership, environment isolation and release evidence to P00/P01/P05/P10. C18 records repository facts and the limit that live infrastructure was not inspected. Independent amendment review is pending; previous approval covers the earlier plan.

[Railway amendment audit](audit-railway.json) returned READY_FOR_IMPLEMENTATION_PLAN with six minor findings. All were incorporated: record missing CI; condition builder migration on support/build evidence; alert on schema_incompatible; prove full-city overnight capacity; route retained manual cron triggers through the shared job queue; and replace dead-dispatcher wording. Subsequent primary-source research also corrected legacy TOML configuration to current project IaC, and a local preflight found CLI 4.30.5 with current-command compatibility still to verify. The user requested a new full-plan audit after these changes; G3/G4 remain open for that review.

## Fresh complete-plan review and corrections

[Full revised audit](audit-full-revised.json) did not approve the plan: five major and eight minor findings. Corrections now cover additive money/taxonomy transitions, explicit OpenAI plus OpenRouter budget ownership, P08 age-attestation enforcement, agent entitlement/privacy negative cases, and P00 correction of obsolete CLAUDE.md instructions. Minor corrections cover superseded approval labels, pending gate evidence, parsing JSON artifacts with malformed/empty controls, seed ownership, reuse of Supabase migration history, explicit environment/config ownership, phase-specific worker introduction, and accurate lease/ledger wording. The migration correction uses the documented remote db push workflow rather than assuming a local-default migration command is appropriate; concurrency remains an acceptance requirement. Audit output is now captured outside the repository and copied in only once complete, so G2 can reject empty JSON artifacts without racing a running auditor. Recheck pending.

[Full-plan correction audit](audit-full-recheck.json) returned READY_FOR_IMPLEMENTATION_PLAN with no blocking or major findings. Three remaining minor clarifications were incorporated: all conflicting agent instructions are in P00 scope with wider controls; shared Railway configuration is environment-neutral with plan/apply target selection and a cross-environment change test; unknown/quarantined prices cannot match price-bounded filters. The money/taxonomy paragraph was split for review. A final narrow verification checks these changes before closing the manual gates.

Final revised verdict: READY_FOR_IMPLEMENTATION_PLAN in [final verification](audit-last.json), with FINAL_REVISED_PLAN_AUDIT_COMPLETE. Opus high confirmed R1-R3, found no new contradiction and independently reran both probes successfully. All findings from the fresh full-plan audit are resolved. This approval applies to the final PLAN.md and planning evidence only; implementation and live Railway verification remain future work. Optional MCP augmentation tools were blocked in the full audit's plan-mode session; the auditor documented a direct requirement/check/evidence pass instead.

## Native scope amendment

User now requires iOS App Store, Android and website delivery. PLAN.md supersedes the earlier native exclusion and adds phase ownership for native architecture/auth, store billing, device tests and store releases. Previous final approval is historical for the pre-mobile plan. Independent Opus high review pending.

Native amendment final verdict: APPROVED by independent Opus high after three audit rounds. [Final native/first-unit audit](audit-mobile-final.json) confirms all findings resolved and required website, iOS App Store and Android scope. The code-unit verdict applies to the separate P00 implementation worktree only. Native apps remain future implementation; the plan approval is not store availability or production readiness.
