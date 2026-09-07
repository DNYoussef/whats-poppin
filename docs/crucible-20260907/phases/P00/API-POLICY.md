# API containment inventory

These are required policies, not completed-authentication claims. The unfinished operations below currently return 503 without starting work. Health remains the public liveness exception. Cron requests still reject invalid credentials with 401; valid credentials reach the 503 pause. API-CONTAINMENT-GATES.md verifies this temporary contract. Each operation must satisfy its distinct authorization, input, privacy and applicable budget gates before reconnection; there is no environment-variable bypass. No endpoint is cleared for public release by this inventory.

| Method | Route | Required principal | Additional gate before enabling |
| --- | --- | --- | --- |
| GET | /api/health | public-read | Liveness only; do not claim database or worker health |
| POST | /api/ai/search-conversation | authenticated-user | Verified subject, bounded conversation, entitlement, per-user and provider/project budget; start currently deterministic, continue can spend |
| POST | /api/ai/recommend-events | authenticated-user | Verified subject, bounded preferences/location, entitlement, search/embedding budget |
| POST | /api/ai/generate-design | organizer | Verify event ownership before model invocation; bounded inputs and budget |
| POST | /api/ai/refine-design | organizer | Resolve owned event/design server-side; do not trust client-supplied design; bounded feedback and budget |
| POST | /api/embeddings | worker | Scoped service credential, canonical event payload, bounded text and provider/project budget |
| POST | /api/embeddings/batch | worker | Scoped service credential, bounded count AND per-event text/total bytes, provider/project budget |
| GET | /api/cron/update-embeddings | worker | Existing fail-closed secret guard; bounded service work and budget still required |
| GET | /api/cron/update-recommendations | worker | Existing fail-closed secret guard; bounded work, private user data and schema compatibility |
| GET | /api/events/[id]/similar | public-read | Target and every result must be published; bounded limit; do not expose embeddings/private columns |
| GET | /api/events/[id]/design | public-read | Active design of a published event only, explicit public projection |
| PUT | /api/events/[id]/design | organizer | Verify ownership, validate stored design fields, atomic replacement |
| GET | /api/preferences | authenticated-user | Read only verified subject's preferences and statistics |
| POST | /api/preferences | authenticated-user | Derive subject from verified identity, bounded values, embedding budget before work |
| POST | /api/interactions | authenticated-user | Derive subject from verified identity; canonical interaction and event visibility |
| GET | /api/recommendations | authenticated-user | Derive subject from verified identity; bounded fresh/cache work and private projection |

Use handler-level authorization, not middleware alone. P01 owns request-scoped clients and RLS-backed wiring; P00 must not turn the currently uninitialized database singleton into a service-role bypass. Agent and native clients will use the same verified subject and ownership policies. Raw body/query userId and organizer_id are not identity.

This inventory covers Next API handlers only. Browser Supabase queries, SQL RLS/public-profile exposure, authentication callbacks and future agent/native routes require their own gates. The private profile surface must be contained before real location data is used. Provider and project budget reservations must be atomic across requests/processes; a per-process counter is insufficient. P02/P07 may reconnect paid paths only after these controls work.
