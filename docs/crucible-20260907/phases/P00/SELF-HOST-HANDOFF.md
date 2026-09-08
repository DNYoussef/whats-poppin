# Supabase staging handoff

## Latest implementation handoff: September 8 operator and empty staging

Tested and pushed source: 902064a4a825dfa6be72fc55b5d3b0c798fd6132 on implement/whats-poppin-p00-20260907. Native SSH forwarding and existing-project staging guards are implemented; the old code-blocker paragraphs below are historical. No live backend or private SSH acceptance has been claimed.

All required workflows passed on that exact source: baseline https://github.com/DNYoussef/whats-poppin/actions/runs/34225484893, mobile https://github.com/DNYoussef/whats-poppin/actions/runs/34225484902, self-host https://github.com/DNYoussef/whats-poppin/actions/runs/34225484904, native https://github.com/DNYoussef/whats-poppin/actions/runs/34225484883. Native includes successful iOS and Android release compilation. Hosted self-host logs include operator controls and full Auth/RLS/migration/persistence/closure markers. These are hosted disposable results, not Railway backend acceptance.

The EXISTING industrious-compassion project b5dc8a11-2f0a-4956-a8ca-0899a0364649 now contains staging environment 241b46e7-3a5d-489a-824e-57cd2618784f. Empty core instances were created by staging and committing only patch 975303f7-7829-4e51-afcb-344454e562c2 with skipDeploys=true:

- sb-db: 31c6f075-0e7e-4b5f-82ed-47a0aa90aaf6
- sb-auth: 9511acfa-8263-4541-aae2-10a22b4b13a0
- sb-rest: a0f3930b-7d95-4aaa-b5dc-f62c57445b99
- sb-gateway: 8ebf2f7b-f89d-47b4-8dd1-d3f5adc6a7a7
- sb-mail: a07c3c33-eae4-4d05-a0e6-64278d42e14e

Final live readback: no core sources, variables, volumes, domains, TCP proxies or deployments. Production deployed configuration, active deployment IDs/statuses and staged patch 0ee7b900-20d4-4c4f-8818-7c5976779075 exactly match this unit's private baseline. One read returned degraded:[networking] and omitted networking; setup halted until a subsequent complete response matched the ORIGINAL baseline exactly. Never normalize away real domain differences or silently replace the baseline.

External run: C:/Users/17175/.codex-work/poppin-operator-7cbdfe512dc64fc2b0cccae619d03589. private/staging-state.json now reuses the unpublished credentials with the actual new IDs and sshIdentityFile. sourceSha is PENDING and api absent until reviewed configuration. Private directory/files were verified owner-only. A dedicated personal Railway public key is registered as 11d83ec3-bc90-4093-86af-05414c9076e2, fingerprint SHA256:6NdzcNl4N5EzAHXi5VPpER1dLmu/mr2++vpzZApNhZs. It is account-scoped, not Railway-enforced staging-only; protect and revoke it when operator access ends. CLI keys add cannot load this external path; registration used sshPublicKeyCreate, with personal ownership and fingerprint read back. Windows ssh-keygen added default admin/system ACLs; these were removed and owner-only ACL verified after public-key registration, before any SSH use. Use icacls for these explicit ACEs; Set-Acl attempted a privilege unavailable to this process.

Review record: four declared edit/review rounds consumed. Opus high served claude-opus-5; inspection 2 approved code/secret-free CI snapshot 92801c3912c9695aa82da29339acbbfd13b87ab3e54786783b542cc6fb14014d. Inspection 4 approved only empty-staging/key setup snapshot bddf77031d0b074d8f13fedeb2b27a22ab14d9704c8774207c9c68f86499df05. Raw reviews, manifests, source/schema, private before/after evidence, setup-state.json and GATES.md are in the external run. No approval covers backend activation yet. Residual low code notes: post-connect child-liveness race has inspection coverage but no dedicated race control; migration callback could additionally check child liveness immediately before opening the URL. Existing controls reject occupied ports and prove child/listener cleanup.

Next bounded unit in the SAME plan: prepare and review the concrete configuration for THESE existing staging instances; do not create another environment/project/core set or rerun empty-service creation. Registering another key or regenerating credentials is unnecessary. Follow SELF-HOST-DEPLOY for frozen GitHub source, Wait for CI and deliberate failing-check control, roots, image pins, private variables, DB volume and sole gateway domain. Include complete target/config/credential-placement and known-host verification in the next review. Supply the pinned Supabase CLI from the earlier run's bin directory without changing its version. Then run full live operator acceptance, fix actual runtime failures within the next declared review budget, and only close S3/S4/H3a from evidence. H3b/H4, real SMTP, application migration rehearsal and production cutover remain open.

All sections below record earlier units and are superseded where they describe current targets or unfinished operator implementation.

## September 8 resumed documentation unit

The previous unit paused at the weekly Opus limit. The user resumed this morning with Opus high; reviewer confinement preflight now passes. The main PLAN.md Railway section now saves the verified existing project, connected DNYoussef/whats-poppin repository/main branch and placement for web/API, Supabase, worker and native apps. See PLACEMENT-AUDIT.md for the new documentation review result; it does not approve the unchanged operator implementation.

The self-host plan, procedure and gate placement now use the existing project. Old instructions below to continue from the extra project's empty services are superseded and must not be executed. Resolve/create staging within industrious-compassion and record its actual IDs; never reuse the extra project's IDs. Keep unpublished credentials private and remap state only after target verification. The operator's project guard and private tunnel still need implementation changes and fresh acceptance. No infrastructure changed during this documentation wrap-up.

## Latest user correction: reuse the existing app project

The user explicitly directed reuse of the existing Railway project; do not create another project. Live Railway readback confirms industrious-compassion (b5dc8a11-2f0a-4956-a8ca-0899a0364649), containing whats-poppin (ccc86351-94ec-4e97-80a8-78932ba45d46) in production (ca92fc09-72e1-4d21-a8e4-5b1480d58b73).

The plan now uses this target. Before deployment, revise operator target guards to support Supabase within this existing project while preserving the app service. The extra whats-poppin-supabase-staging project was already created in an earlier unit; its empty resources are historical inventory, not the intended target. Do not deploy to it or delete it merely to reconcile this correction. No infrastructure was changed in recording this instruction.

Status: hosted core verified; Railway deployment blocked by the private-access runner. No running staging backend, attached sources, volumes, public endpoint, service variables or application cutover. Original production configuration readback matched this continuation's saved baseline; a modified-response control was rejected.

## Exact tested source

Source: dc9f41e14a157ffcae99dd6707ba4a3fb58db357 on implement/whats-poppin-p00-20260907, pushed to DNYoussef/whats-poppin.

All completed successfully on this exact source:
- Self-host core: https://github.com/DNYoussef/whats-poppin/actions/runs/34178060368
- Baseline: https://github.com/DNYoussef/whats-poppin/actions/runs/34178060331
- Mobile package: https://github.com/DNYoussef/whats-poppin/actions/runs/34178060355
- Native iOS and Android compilation: https://github.com/DNYoussef/whats-poppin/actions/runs/34178060324

The actual hosted core log contains CORS, extensions, confirmation, identity/RLS, migrations, persistence, cleanup, Auth lifecycle, core and final signup-denial success markers. Extension versions are PostGIS 3.3.7, vector 0.8.2 and uuid-ossp 1.1. This is disposable GitHub runtime evidence, not Railway acceptance. SELF-HOST-GATES S2 is met; S3/S4 and HOSTED-GATES H3a remain unmet.

## Remaining blocker

Railway CLI 5.49.3 `connect --tunnel-only` identifies the database from service source.image only. The planned database builds from GitHub, so source.repo is populated and source.image is absent. DATABASE_URL/PGHOST variables do not change this classifier. Exact CLI source: https://github.com/railwayapp/cli/blob/v5.49.3/src/commands/connect.rs, lines 119-140 and 187-190. Saved source SHA256: 0bc4d63d4eaf712be66fb8151f96fc81aa549ae25fdc157c6aa549a4781c4739.

Observed read-only command against the existing empty service:
railway connect sb-db --project 163e2a9c-94ff-460b-9a76-c3393af6f89d --environment 9bc55a09-5737-42df-a997-3827927b073b --tunnel-only --port 55439
Exit 1: No supported database found in service.

The command's rejection is observed; the future GitHub-backed rejection follows from the inspected image-only source classifier. No source was attached merely to reproduce it. Do not spoof source metadata or expose a public database proxy to bypass it.

Next bounded unit in the SAME P00 plan:
1. Replace the operator's `railway connect` tunnel with native SSH forwarding that does not classify the service by image. The installed CLI supports `railway ssh config --dry-run` with explicit project/environment/service, --path and --alias. Use an external temporary config, not the user's global SSH config. Inspect the exact native forwarding and key-registration behavior before implementation.
2. Verify Windows process cleanup. The current npm railway.cmd launches Node and then railway.exe; terminating the wrapper may leave descendants. The native binary is C:/Users/17175/AppData/Roaming/npm/node_modules/@railway/cli/bin/railway.exe. Prefer a directly owned native ssh process for forwarding and prove its listener closes on every exit path. This process-tree risk has not been exercised on a live tunnel yet.
3. Add a meaningful failure control for unsupported GitHub-backed discovery/forwarding cleanup, obtain fresh independent Opus high review, and rerun exact-source checks after any code change. Preserve all existing Auth/RLS/migration/persistence/closure gates; no local Docker.
4. Follow the reconciled SELF-HOST-DEPLOY inside the existing project after target and tunnel fixes. Resolve/create staging and its core instances; never use the extra project IDs below. Attach only the DB volume, configure roots and private variables, freeze the green GitHub source, generate only the gateway domain, deploy exact sources/images, and run the full private operator acceptance through SELF_HOST_RAILWAY_VERIFIED. Signup starts disabled and must be closed after probing. Do not claim backend ready from gateway health alone.
5. H3b/H4, application schema rehearsal, outbound SMTP and production cutover remain separate. Private Mailpit has no SMTP credentials; email confirmation is still required. Do not recreate already-generated credentials.

## Historical unused extra-project resources

Project: whats-poppin-supabase-staging, 163e2a9c-94ff-460b-9a76-c3393af6f89d.
Workspace: 8e743f4d-7fb0-4f26-a7de-e40fb02a6383.
Environment: staging, 9bc55a09-5737-42df-a997-3827927b073b.

- sb-db: e160e951-6db7-4877-9e6e-c42f4d3b586f
- sb-auth: c93efb5e-acd8-43f4-b077-08f0127c00ee
- sb-rest: 13a2d01b-bf82-41da-a785-e45732e65ed4
- sb-gateway: 95789b90-8417-4c1e-8e50-8100aad8597e
- sb-mail: 86a58e21-726a-4f49-aa1c-96d2ca952101

The continuation readback verified all five still had no source, deployment, domain or TCP proxy. No Railway mutation was performed in this continuation. The CLI default link points at an unrelated project; always use explicit IDs.

## Review budget and artifacts

This continuation consumed its declared six build rounds and six inspection rounds. Inspection6 independently approved static snapshot c70f9c54bf9611210b302bebf02fe70fd50d481fdd0ede70efe4eca6ba6b54fd. All requested reviews used Opus high, with served model claude-opus-5 reported by the CLI. The newly discovered private-access blocker needs changed code and a fresh review; it cannot be waived by the existing approval or the green hosted core gate.

Current external run: C:/Users/17175/.codex-work/poppin-supabase-continue-a5595ac0cca84e91af11f28aba8d4627. Contains audit1 through audit6 JSON and prompts, snapshot manifests, exact CI logs/status, all-checks.json, production before/after, staging-before.json, CLI source/schema evidence and focused control scripts. Its GATES.md records current local checks separately from the inherited requirement ledger.

Prior run: C:/Users/17175/.codex-work/poppin-supabase-9bdc2f4bfd7d4ce09bd5208953c71f23. Reuse unpublished credentials in private/staging-state.json with owner-only Windows ACLs, but remap its old resource IDs only after verifying the new staging target; credentials remain unpublished, api is absent and sourceSha remains PENDING until an approved green deployment source is selected. Never print or commit that file. Pinned Supabase CLI is bin/supabase.exe version2.117.0, checksum verified in the prior unit and version rechecked here.

Final evidence-only updates to this handoff and SELF-HOST-GATES are local working-tree changes; implementation through dc9f41e is committed and pushed.
