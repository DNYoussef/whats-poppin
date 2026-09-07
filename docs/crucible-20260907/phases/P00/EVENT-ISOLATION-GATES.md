# Hosted event and interaction isolation

Scope: Disposable Supabase Auth/PostgREST fixtures; no local Docker or live database. Codex builds, Opus high inspects read-only, GitHub executes. Budget: three build rounds and three inspection rounds. P00/H2 application API integration remains separate.

- [x] E1: Two organizers in Austin and New York can manage their own events, while anonymous and cross-owner reads/writes respect published, draft, cancelled and completed visibility. Exact fixture IDs and stored timestamp instants are checked.
  EVIDENCE: run https://github.com/DNYoussef/whats-poppin/actions/runs/34158466905 at 12873d44ec3b4262187dd3c0a581da346e014d0e passed with EVENT_ISOLATION_VERIFIED and ANON_EVENT_UPDATE_PRIVILEGE_VERIFIED. Positive owner reads and writes must accompany denied cases.

- [x] E2: Interactions cannot be inserted or redirected to unpublished events, or written for another user; owners can read historical interactions after cancellation. Prove the unpublished-event oracle rejects the original policy before applying a forward correction.
  EVIDENCE: the same run passed with INTERACTION_LEAK_CONTROL_REJECTED and INTERACTION_ISOLATION_VERIFIED. Historical migrations stay unchanged.

- [x] E3: Independent Opus high review approves the exact source snapshot before branch CI testing.
  EVIDENCE: event-audit-2.json approved snapshot 84081C385A74858C39937D41A8F0C2D9E8A5229A5EB8E8B4AA6E040D110239F9 in session dab974de-65a7-4d82-9e23-09de86d3a434. Codex authored; Opus high inspected read-only; snapshot was unchanged before commit. Runtime approval additionally requires E1 and E2.

These are database API checks, not Next handler authentication, provider budgets, DST scheduling, remote migration rehearsal or native-client evidence. Named fixture zones describe January instants; the existing schema does not store event timezone identifiers. P01 must reconcile that contract.

Compatibility: this P00 containment intentionally denies new interactions on completed events, including attend, and denies updates to historical interactions when their event is no longer published. Owner reads and deletes remain available. The existing trackInteraction upsert can now throw on its conflict/update branch for a non-published event. P01 must map that outcome and define verified post-event attendance eligibility before enabling that flow; this policy is not the final attendance contract. No public or hidden person rating is introduced.
