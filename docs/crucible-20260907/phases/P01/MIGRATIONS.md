# P01a canonical application migration input

Status: candidate implementation; independent review and hosted execution evidence are recorded outside the frozen source in C:/Users/17175/.codex-work/poppin-p01-run-20260908/GATES.md and STATUS.md. Do not infer completion from this document.

Run `python scripts/migrations/prepare.py NEW_OUTPUT_DIRECTORY` to prepare a new CLI project. The command never connects to a database. Existing output paths fail. Source/version mappings and LF-normalized hashes are in scripts/migrations/manifest.json; provenance.json records exact copied-byte hashes. All historical SQL remains unchanged. The invalid historical design SQL is replaced only in this prepared path by scripts/migrations/event_designs.sql. Seed data is not a production migration.

Use Supabase CLI 2.117.0 with an explicit reviewed database URL and the prepared workdir. The existing Supabase migration history is the sole database ledger. Do not run root migrations or automatically repair a mismatched history. Preparation does not authorize a push to any live target.

Hosted application-migrations jobs execute fresh and upgrade modes without local Docker. The upgrade starts from the canonical initial schema, RLS and corrected design table, then adds both restrictive policies. It is not evidence that an unknown legacy deployment can be adopted. SQL role tests cover database authorization; existing HTTP auth tests remain separate.

Before live application migration: inventory the actual target schema/history, reconcile legacy identities explicitly, rehearse restore and serialize deployment. Existing Railway project industrious-compassion (b5dc8a11-2f0a-4956-a8ca-0899a0364649), staging 241b46e7-3a5d-489a-824e-57cd2618784f and GitHub DNYoussef/whats-poppin are retained. No new project or live mutation belongs to this unit. Production remains connected to main. The completed core activation handoff is C:/Users/17175/.codex-work/poppin-resume-9f40ef9687b143929ebfcb9fa2d6755a/HANDOFF.md.

P01 remains open for client/auth wiring, public profile projection and username precheck, preference/recommendation uniqueness/geography reconciliation, additive money/category/interaction transitions, export/deletion, native authenticated contracts, and target migration/restore/predeploy integration. SMTP/store accounts/device evidence remain external prerequisites. Native compilation alone is not store readiness. Peer feedback stays nonnumeric.
