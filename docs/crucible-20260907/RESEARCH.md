# Research and architectural decisions

Researched September 7, 2026. Links below are primary sources. Protocol/provider capabilities must be pinned and checked again when implementation begins. These are design recommendations, not claims that the repository already implements them.

## Agent interoperability

| Option | Fit | Decision |
| --- | --- | --- |
| Ordinary HTTP API with OpenAPI | Small, explicit event operations shared by the web app and integrations; no agent discovery/task convention by itself | Keep as the business contract and test surface. |
| A2A | Agent discovery through Agent Cards, structured messages/artifacts, task lifecycle and authentication declarations | The 1.0 released specification was verified from the primary source on the research date. Use it as the proposed adapter target; revalidate and pin an SDK/runtime combination in the interoperability spike. |
| MCP | Lets an assistant call tools and access resources; HTTP authorization has its own requirements | Add a thin MCP adapter only if an actual target assistant needs it. It is not required to run the nightly worker. |

[A2A 1.0 specification](https://a2a-protocol.org/v1.0.0/specification/) defines Agent Cards, messages, tasks, structured data, and transport/authentication requirements. The [official JavaScript SDK](https://github.com/a2aproject/a2a-js) is preferable to hand-writing a lookalike protocol. The specification does not supply the application's event ownership, entitlement, or delegation policy. Those remain server-side responsibilities.

The [MCP HTTP authorization specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) is useful for an optional tool adapter; token audience checking and the authorization flow are substantive work, not something achieved by publishing tool names. The plan therefore avoids implementing two agent transports simultaneously without a concrete consumer.

Recommended implementation: one set of event operations, with a thin A2A server executor mapping validated structured requests to those operations. Browser and external agent requests enforce the same ownership rules and price quotes. An Agent Card is discovery metadata, not a credential. No arbitrary caller-provided callback URL is needed initially; use task polling and advertise capabilities honestly. All mandatory behavior for the chosen protocol binding still applies. An unsupported optional feature must be reported as unsupported, not faked.

No reputation protocol is adopted for Find a Friend. Portability of ratings is contrary to the product requirement. Neither A2A nor MCP should expose private feedback or a person score.

## Deterministic collection and browser exceptions

[Schema.org Event](https://schema.org/Event) supplies a reusable vocabulary for event name, dates, location, offers and status. [iCalendar RFC 5545](https://www.rfc-editor.org/info/rfc5545/) covers calendar identifiers, recurrence and timezone behavior. Prefer source API/feed data and JSON-LD before rendered HTML. Reuse an established calendar parser for recurrence rather than implementing calendar arithmetic ad hoc.

For rendered pages, [Playwright screenshots](https://playwright.dev/docs/screenshots) support a minimal browser evidence tool. [OpenRouter image inputs](https://openrouter.ai/docs/guides/overview/multimodal/image-understanding) accept image URLs or base64 data for compatible models. Screenshots can help read flyers and inspect layout changes; they do not prove a date or cancellation independently of the source being captured.

[OpenRouter client tool calling](https://openrouter.ai/docs/guides/features/tool-calling) leaves execution of supplied client tools with the application. Use a short tool loop around the existing TypeScript service and a browser worker, not a multi-agent orchestration framework. Its model output is a candidate extraction or proposed patch, never privileged executable instructions.

[OpenRouter provider routing](https://openrouter.ai/docs/guides/routing/provider-selection) documents parameter support checks, provider allowlists, data-collection restrictions, ZDR routing, and price limits. Those options help control routing; they do not replace application-level spend reservations, tool-call limits, redaction, or provider suitability checks. The initial ingestion agent gets public event material only. Private friend feedback stays out of this pipeline.

## Source access and realistic coverage

[Meetup's API documentation](https://www.meetup.com/graphql/) describes its GraphQL interface and links access to Meetup Pro. [Meetup's access guidance](https://help.meetup.com/hc/en-us/articles/41453576628749) says Pro members can apply for an OAuth consumer; purchasing a plan does not itself prove that arbitrary city-wide discovery is available. Test the granted queries and scopes before promising coverage.

[Meta's own explanation](https://about.fb.com/news/2021/04/how-we-combat-scraping/) states that automation without its permission violates its terms. The current Facebook automated collection terms URL redirected to login during this research, so this plan does not claim a fresh contractual interpretation. Track Facebook as an access-dependent source: approved integration, authorized organizer feed/export, or manual submission of event facts. Browser agents do not bypass logins, CAPTCHAs, access restrictions or source denials.

Recommended priority: official city/venue feeds and organizer submissions; supported public structured pages; deterministic rendered-page adapters; permitted visual exceptions; human exception review. Keep a city/source registry with enabled, access_pending, blocked and failing states. "All event pages" is the coverage objective, not a measurable promise to crawl the entire web each night. City expansion must be tied to an explicit source inventory and observed freshness/coverage gaps.

## Private feedback for reciprocal matching

[Reciprocal recommender systems survey](https://arxiv.org/abs/2007.16120) distinguishes people-to-people recommendation from item recommendation: success requires considering both participants' preferences. That supports the mutual-fit framing, not a claim that any particular algorithm will work for this app.

[Airbnb's review timing documentation](https://www.airbnb.com/help/article/13) describes holding publication until both submissions or the review window ends. Borrow the independence of submission to reduce direct retaliation opportunities; do not borrow public ratings or publication. Here feedback remains private even after both people respond. No claim is made that delayed visibility eliminates retaliation.

Recommended first version: consent-based eligibility, shared event interests, mutual availability, explicit interaction preferences, and categorical private feedback. Ask "Would you like to meet again?" and "What would make the next outing fit you better?" with optional private notes. Do not ask someone to rate another person's worth, attractiveness, reliability, or popularity. Only a user's own feedback should refine that user's matching preferences initially; another person's unverified complaint does not become a negative trait or global penalty attached to the subject.

Separate the compatibility feedback channel from block/report and human safety adjudication. Silence, a declined invitation, a cancellation, and sparse history are not negative reputation. Pairing may use private contextual relevance calculations internally, but never a persistent person-level reputation scalar, review rating, public numeric fit score, hidden global rank, or leaderboard. Keep explanations tied to shared activities and volunteered preferences.

## Payment reliability

[Stripe webhook guidance](https://docs.stripe.com/webhooks) describes signature verification, retries, duplicates and non-guaranteed event ordering. The plan uses a test-mode processor integration, an idempotent billing state machine, and reconciliation. The user's subscription price is exactly USD 1 per month; no processor fee or profitability assumption is inferred from that price. The organizer listing fee remains an explicit configurable product decision, not an invented number in this plan.

## Railway and GitHub deployment amendment

Checked September 7, 2026. [GitHub autodeploy documentation](https://docs.railway.com/deployments/github-autodeploys) supports branch-connected deployment and Wait for CI; the latter needs a GitHub workflow with a push trigger. This supports a required-check release branch, not an assumption that passing PR checks automatically gates every deployed push.

[Railway cron documentation](https://docs.railway.com/cron-jobs) describes UTC schedules, finite service executions and skipped starts if the preceding process remains active. Therefore the plan proposes one bounded scheduled worker with durable due jobs, rather than relying on Vercel HTTP cron declarations. The 15-minute tick and process deadlines are design choices to test, not Railway guarantees.

[Pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command) run before application deployment; a failed command blocks that deployment. They run in a separate container, and support a timeout. This motivates one bounded migration owner and independent schema compatibility checks in the worker; it does not create an atomic multi-service release or database rollback. [Railway health checks](https://docs.railway.com/deployments/healthchecks) concern deployment readiness; the plan separately requires ongoing web and worker monitoring.

[Current Config as Code documentation](https://docs.railway.com/config-as-code) marks legacy TOML/JSON configuration deprecated, unavailable to new services and subject to a December 1, 2026 cutoff. [Infrastructure as Code documentation](https://docs.railway.com/infrastructure-as-code) describes one project definition, resource omission as deletion, migration, and a GitHub action that applies a saved reviewed plan while checking environment/tree drift. The amended plan therefore uses project-level configuration, inventories existing resources before adoption and explicitly sequences configuration apply before app rollout. These current primary sources supersede the installed skill's older per-service configuration examples.

[Supabase CLI reference](https://supabase.com/docs/reference/cli/supabase-db-push) documents remote db push, dry-run and the existing migration history table. The plan reuses that migration mechanism and tests deployment concurrency instead of inventing another migration ledger.

## Native mobile scope amendment

Checked September 7, 2026. User now requires website, iOS App Store and Android. Add one Expo/React Native mobile client while retaining Next.js and Railway/Supabase.

[Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/) address app utility beyond a repackaged website, user-generated-content moderation and digital purchases. The plan requires useful native journeys, report/block/support controls and store billing; regional exceptions must be specifically verified.

[Google Play payments](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en) generally requires Play Billing for paid digital functionality with specified exceptions. The plan separates app subscriptions/listing placement from physical event tickets.

[Expo native purchases](https://docs.expo.dev/guides/in-app-purchases/) documents development builds and compatible libraries including expo-iap and react-native-purchases. A bounded spike chooses an adapter; Expo Go is not a native purchase test. [Store builds](https://docs.expo.dev/deploy/build-project/) and [submissions](https://docs.expo.dev/deploy/submit-to-app-stores/) support hosted builds/submission from Windows; memberships, signing, devices and store review remain separate requirements.

[Apple account deletion](https://developer.apple.com/support/offering-account-deletion-in-your-app) covers in-app deletion and subscription handling. [Google deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en-EN) cover in-app and external deletion access. Extend the existing account service. Recheck policies, supported pricing and target SDK requirements before submission.

[Apple subscription pricing](https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions) describes storefront-specific price points and the App Store Connect selection process. P04 must inspect the actual US product price options; the plan does not assert that USD 1 is already available. [Expo Maestro workflows](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) documents automated Android and iOS emulator/simulator runs. The plan uses these for core native flows, with explicit physical-device/manual evidence for cases automation does not cover.
