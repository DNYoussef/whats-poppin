# Supabase staging handoff

Status: incomplete. No running Railway backend, volume, public endpoint, source attachment or application cutover. The existing production project's settings/domains/deployment readback matched the saved pre-change response on this run; a modified-response control was rejected.

Latest tested source: 25eb5b25f18ce26f704d46de1023d1e19886d59a on implement/whats-poppin-p00-20260907, pushed to DNYoussef/whats-poppin. Self-host CI run https://github.com/DNYoussef/whats-poppin/actions/runs/34175136268 failed at tests/self-host/probe.py:69: allowed Access-Control-Allow-Origin was not the expected localhost origin. The database and gateway startup failures from prior attempts are past this point: logs show PostgreSQL ready and Nginx workers started. Authentication, RLS, migration and persistence acceptance did not complete. Do not infer those outcomes from startup.

The baseline and mobile package checks passed at this source SHA. Native compilation was still running at the last readback. Local config and operator-query checks passed with negative controls. SELF-HOST-GATES:S1 was reverified mechanically; S2-S4 remain unmet. The Windows S2 rejection is intentional; its decisive runtime result is the failed GitHub Linux run above.

## Existing empty Railway resources

Project: whats-poppin-supabase-staging, 163e2a9c-94ff-460b-9a76-c3393af6f89d.
Workspace: 8e743f4d-7fb0-4f26-a7de-e40fb02a6383.
Environment: staging, 9bc55a09-5737-42df-a997-3827927b073b.

- sb-db: e160e951-6db7-4877-9e6e-c42f4d3b586f
- sb-auth: c93efb5e-acd8-43f4-b077-08f0127c00ee
- sb-rest: 13a2d01b-bf82-41da-a785-e45732e65ed4
- sb-gateway: 95789b90-8417-4c1e-8e50-8100aad8597e
- sb-mail: 86a58e21-726a-4f49-aa1c-96d2ca952101

Readback verified all five are empty, with no source, deployment, domain or TCP proxy. Do not recreate them. No production project variables were changed. Local credentials were generated in an owner-only Windows ACL directory outside the checkout and have not been sent to Railway or GitHub.

## Resume in the same plan

1. Diagnose the actual CORS response headers before changing the oracle. The gateway adds an origin header while GoTrue may also supply CORS headers; duplicate/upstream ownership is a hypothesis, not an observed header value. Inspect all header occurrences and keep the allowed-origin and denied-origin controls. Make one layer own CORS.
2. Resolve inspection 4's pre-execution conditions: give extension installation and Supabase CLI migration operations explicit longer timeouts while retaining the bounded restart loop; use explicit replace:false for Auth variable toggles and verify retained variable keys. Live schema introspection already confirms VariableCollectionUpsertInput.replace defaults to false, so the current omission is not evidence of destructive replacement.
3. Obtain a fresh independent review and green exact-commit hosted checks after the final implementation edits. The fourth inspection approved static snapshot 7854f9d84a294037ade711b0d1474af765f2fb63a7f65db1d5501533bbe71d70 for CI only, with conditional deployment permission that lapsed on the failed CI run. Do not treat it as deployment approval for changed bytes.
4. Continue SELF-HOST-DEPLOY.md from the existing empty services: volume/configuration, frozen GitHub source branch, private credentials, gateway domain, exact deployment success, then private operator acceptance and signup closure. H3a stays unmet until actual Railway Auth/RLS/migration/persistence evidence. H3b/H4, application schema repair, outbound SMTP and eventual production cutover remain separate work.

## Review budget and evidence

Three build rounds and all four declared inspection rounds were consumed. The Crucible budget rule requires a handoff with unresolved findings rather than another hidden inspection. No requirement was declared complete or abandoned to bypass the red gate.

External run directory: C:/Users/17175/.codex-work/poppin-supabase-9bdc2f4bfd7d4ce09bd5208953c71f23. It contains plan-audit.json, implementation-audit.json, round2-audit.json, round3-audit.json, snapshot manifests, round3-ci.log, empty-services.json, production-before.json and production-after.json. The private/staging-state.json file holds unpublished credentials; never print or commit it. Source SHA remains PENDING there until a reviewed green deployment commit exists. The pinned, checksum-verified Supabase CLI is bin/supabase.exe (2.117.0). Railway's default CLI link still points at an unrelated project; continue using explicit IDs.
