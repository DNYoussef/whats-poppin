# What's Poppin: repository instructions

## Current status and source of truth

This repository contains an unfinished Next.js application. P00 implementation has begun; it is not production-ready. The approved plan is docs/crucible-20260907/PLAN.md, with source evidence in CLAIMS.md and protocol research in RESEARCH.md beside it. Older reports and specifications are historical where they conflict with that plan. Planning gates certify their original planning snapshot, not subsequent application changes. Current implementation gates live under docs/crucible-20260907/phases/.

## Product and scope

Help travelers and locals find nearby events by destination/GPS, interests, time and budget. Consolidate permitted venue, city and platform sources, using deterministic APIs/feeds/extraction first. A minimal OpenRouter browser worker handles exceptions and bounded nightly screenshot checks. Unsupported source access must remain a visible coverage gap.

Organizers pay a configurable small listing fee. Users pay USD 1 per month. Imported listings do not bill uninvolved organizers. Native digital purchases use store billing, website purchases use Stripe, and both share server-verified entitlements. Billing is planned, not implemented; do not invent live prices, revenue, profitability or processor fees.

An A2A adapter will let authorized organizer agents publish/manage events and attendee agents discover them through the same application contracts as the UI. Find a Friend will support mutual event-specific pairing and coordination.

No numerical review ratings, public or hidden global person scores, reputation ranks or leaderboards. Private feedback may refine the author's contextual preferences and pair-specific meet-again choice. Feedback from unrelated people must not change someone's ranking for a fixed pair. Separate immediate blocks and human safety review from compatibility feedback. P08 owns matching consent, proposed minimum-age attestation and privacy gates.

## Existing stack and deployment

Preserve the Next.js website and add one Expo/React Native mobile client for iOS App Store and Android. Use the same versioned HTTP contracts; initially mobile has its own package/lockfile and no cross-package source imports. Keep root npm ci for the website and npm ci --prefix apps/mobile for mobile when created. Do not replace the website. Preserve React, TypeScript, Supabase Auth/Postgres and the existing PostGIS/vector design. Reconcile the actual schema and clients incrementally; do not replace the stack. Existing AI helpers use OpenAI. OpenRouter is planned for ingestion. Both require server-enforced spend controls before public use.

Deployment is through GitHub-connected Railway. P00 owns push-triggered CI, isolated staging and configuration validation. P05 adds a finite scheduled browser worker beside the web service. Keep Supabase; Railway hosting does not imply a database migration to another provider. Use the current Railway CLI and project configuration workflow described in the plan, preserving existing resources and separating staging/production credentials. A production merge can trigger deployment and must follow the approved release process.

## Implementation order and evidence

Follow P00-P10 in the approved plan. First contain unsafe paths and establish checks; then connect authentication/schema and unfinished event flows, ingestion, billing, worker, agent interface, discovery and friend matching. Apply necessary security controls when each feature is connected. Run the broader bugs/security pass after wiring, then verify operations and the release candidate.

Use Crucible: Codex builds; Claude Opus at high effort audits. Write each unit's CHECK/EXPECT/EVIDENCE ledger before implementation. Demonstrate failing regression tests or planted bad controls, implement the smallest fix, rerun checks and have Opus independently inspect and execute them. Never call a phase complete because its documentation says it is. Keep incomplete phase requirements visible. One logical change per commit in an isolated worktree.

Treat authenticated principal identity, ownership, private location/feedback, request validation and cost reservations as server responsibilities. Do not trust payload user IDs, agent self-descriptions, scraped instructions or browser screenshots. Migrations must preserve supported old/new processes and existing data; unknown prices are not free prices. Use canonical event IDs and explicit timezone/source provenance.

## Local work

Docker does not work on this Windows device. Do not require or troubleshoot local Docker, WSL virtualization or local supabase start. Run Node checks locally and the full disposable Supabase stack on GitHub-hosted Ubuntu only. Plain PostgreSQL does not prove Supabase Auth, RLS or API integration. Use synthetic fixtures and disposable-stack credentials for unprivileged PR tests; remote rehearsal uses a separate test project and non-production GitHub Environment on reviewed trusted-branch pushes only. Missing hosted results block database wiring and release, not independent local work. Build the worker image and native apps on hosted runners.

Install from the existing lockfile with npm ci. Scripts are npm run dev, npm run typecheck, npm run lint:ci and npm run test:ci. Current tests run in Node; add real browser acceptance when implementing browser behavior. A local build requires explicit non-production public Supabase configuration. Never load production credentials just to make a test or build pass.

Read source before changing it. Prefer existing libraries, standard platform features and small direct code over new frameworks. Test error paths and preserve supported behavior. Claims of coverage, security, performance or readiness require fresh measurements; there are no assumed growth or revenue targets.

Write ASCII-only file content. Put scratch files and test artifacts under dedicated subdirectories, never in the repository root. Preserve user changes. Do not push, merge to a deployment branch, deploy, charge, crawl live sources or contact users unless the active session authorizes that action.

Native store delivery is required: P00 owns feasibility, P02-P08 native feature parity, P09 signed-build/device checks and P10 distinct website/store release evidence. A browser shortcut or upload does not establish store availability.
