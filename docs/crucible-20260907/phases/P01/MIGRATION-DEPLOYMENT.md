# P01c migration deployment boundary

P01b installed the canonical application schema in the existing staging database.
Do not rerun its install procedure. P01c adds a hosted concurrency characterization;
it does not activate a Railway migration hook or finish parent P01.

## Authority and activation gates

Keep Supabase CLI 2.117.0 and supabase_migrations.schema_migrations as the migration
authority. The web pre-deploy command is the sole authorized migration entry point;
workers never run migrations and never receive migration credentials. Operator
maintenance must use the same serialized entry point, not a raw db push.

Require one database-scoped session advisory lock across every migration attempt,
including Railway manual redeploy and rollback. GitHub concurrency and Wait for CI
do not establish this property. Use bigint key 5786932351951843377 (the ASCII bytes
POPPIN01 interpreted as an unsigned big-endian integer, within signed bigint range)
in each database; PostgreSQL advisory locks are database-scoped. Record that key
next to the pre-deploy command, acquire it before the CLI reads pending history, and retain it until the
CLI exits. A lock inside an individual migration is too late to serialize reading
pending history. No bespoke applied-migrations ledger or SQL migration engine.

The proposed bounds are a 30-second lock-acquisition deadline, 240-second CLI
execution limit, and 300-second Railway pre-deploy timeout. Fail closed on lock
failure, timeout, cancellation or lost lock connection; never interpret these as
successful no-ops. These are proposed deployment settings, not active settings.

Before activation, prove in staging:

- Two actual deployment attempts overlap, with the second waiting or failing
  closed before reading pending history. Verify exact history and data afterward.
- Killing the holder releases the lock and permits a later attempt to complete.
- Losing the lock connection while its CLI child is alive prevents that child
  from continuing concurrently with another holder. A psql session plus a CLI
  subprocess does not establish this merely because normal completion works.
- A failed or timed-out pre-deploy command prevents the candidate rollout.
- Cancel an in-flight pre-deploy: no CLI child or lock holder continues, the
  current migration transaction leaves no partial DDL/history, earlier committed
  versions remain an exact valid prefix, and cancellation is never a successful no-op.
- Old worker/new web and new worker/old web combinations remain compatible.
  Workers reject incompatible schemas before taking jobs with schema_incompatible.
- The compatible application rollback target works against the migrated schema;
  database restore is a separate rehearsal, not an assumed side effect of rollback.

Do not enable the hook until its process/connection lifetime and all these gates
are proven. If a thin pinned-CLI wrapper cannot enforce the lock lifetime safely,
return that design for review rather than claiming a separate lock session suffices.

## Characterization and limits

tests/migrations/hosted.py runs tests/migrations/concurrency.py after the existing
transactional failure/retry control, in both fresh and upgrade matrix jobs. The
synthetic version 20990101000001 follows the existing 20990101000000 control.
Two CLI processes use separate copies of identical prepared inputs. The migration
sets application_name; observed backend PIDs distinguish the callers. A test-only
table lock holds the first attempt in flight until the second is observed waiting
or terminating. Terminal outcomes are classified; unrelated errors, wrong history,
missing/changed/duplicate canary rows and timeouts fail the probe. A real damaged
fixture row is a negative control, followed by repair and a successful CLI retry.

MIGRATION_CONCURRENCY_CHARACTERIZED is diagnostic evidence, not a production
serialization gate. The earlier ACTIVE_DESIGN_LOCK_OVERLAP_VERIFIED marker concerns
event-design inserts and supplies no migration serialization evidence. Exact-source
GitHub run IDs, observed branch and job results belong in the P01c run handoff.
Read-only model audits inspect the source; GitHub-hosted runners execute the database
checks. No local Docker is required. CI/staging share Postgres major 17, without a
claim of identical minor versions or extensions. Rollback evidence covers only the
transactional DDL tested, not arbitrary future nontransactional migrations.
History-corruption rejection is tested against the shared oracle offline; the
live-database corruption control changes the canary row. The migration body is
non-idempotent; an idempotent-body concurrency variant is not characterized here.

## Deployment location

Use DNYoussef/whats-poppin and existing Railway project industrious-compassion,
b5dc8a11-2f0a-4956-a8ca-0899a0364649. Staging is environment
241b46e7-3a5d-489a-824e-57cd2618784f. Its core DB/gateway remain on GitHub branch
deploy/supabase-staging-1d9e730 at 1d9e73042610d9d4bbb6a2891bbaf933550eb15e.
Production app ccc86351-94ec-4e97-80a8-78932ba45d46 follows main; preserve its staged
patch 0ee7b900-20d4-4c4f-8818-7c5976779075. This unit changes neither target.

Infrastructure configuration migration must first inventory/preserve the complete
existing project and sequence reviewed configuration apply before affected source
rollout, as required by the parent plan. No new Railway project or legacy config
is introduced here. Auth wiring, the real shared website/iOS/Android/agent contract,
and private nonnumerical friend feedback remain open parent-plan requirements.

Read-only P01c preparation found that Railway CLI 5.49.6 config pull misclassifies
the existing PostgREST service sb-rest as a postgres database and omits its source
and variables from the imported graph. The importer uses image.contains("postgres"),
which also matches "postgrest". Correct that resource from measured service state
and verify preservation of all resources, variables and sources before any apply;
the current import is not a safe deployment plan. Evidence and the rejecting
source-preservation check are recorded in the external P01c IAC-IMPORT-HANDOFF.md.

Sources: https://docs.railway.com/deployments/pre-deploy-command and
https://github.com/supabase/cli/blob/v2.117.0/apps/cli/src/command-internal/legacy-db-push-core.ts
https://github.com/railwayapp/cli/blob/v5.49.6/src/iac/compiler.rs
