# Edge Cases Not Previously Considered - What's Poppin!

## 1. Technical Edge Cases

### 1.1 Geospatial Query Edge Cases

**EDGE CASE**: Event location at International Date Line or poles
- **Scenario**: Concert venue in Fiji (crosses date line) or research station in Antarctica
- **Impact**: PostGIS distance calculations may fail or return incorrect results
- **Current handling**: NOT ADDRESSED in schema or query design
- **Mitigation**: Add validation to reject coordinates >85° latitude, handle date line crossings

**EDGE CASE**: Event spans multiple time zones
- **Scenario**: Train tour event from NYC to LA (crosses 3 time zones)
- **Impact**: "Events happening now" query shows incorrect results based on user location
- **Current handling**: Single `event_time` field assumes single time zone
- **Mitigation**: Store `timezone` field per event, calculate "local time" for queries

**EDGE CASE**: Venue location changes during event (mobile events)
- **Scenario**: Food truck rally where trucks move between locations
- **Impact**: Users navigate to original location, find nothing
- **Current handling**: Static `location` field
- **Mitigation**: Support `location_history` with time-based updates, "Live tracking" mode

### 1.2 Search Engine Edge Cases

**EDGE CASE**: Search query contains special characters (SQL injection attempt)
- **Scenario**: User searches for `"'; DROP TABLE events; --"`
- **Impact**: If not sanitized, could execute malicious SQL
- **Current handling**: Meilisearch handles this, but API layer may not
- **Mitigation**: Input validation and sanitization at API Gateway level

**EDGE CASE**: Search for emoji or non-Latin characters
- **Scenario**: User searches for "🎉 party" or "日本料理" (Japanese food)
- **Impact**: Meilisearch tokenization may fail or return no results
- **Current handling**: NOT TESTED with emoji or CJK characters
- **Mitigation**: Test with multilingual queries, configure Meilisearch tokenizer

**EDGE CASE**: Zero search results but events exist nearby
- **Scenario**: User searches "concerts" but all nearby events categorized as "live music"
- **Impact**: Poor UX, appears like app has no content
- **Current handling**: Return empty array
- **Mitigation**: "Did you mean...?" suggestions, show similar categories, expand search radius automatically

### 1.3 Real-Time Sync Edge Cases

**EDGE CASE**: User offline for 7 days, then reconnects
- **Scenario**: User on airplane mode for week-long trip
- **Impact**: 10,000+ queued sync operations, app hangs on reconnect
- **Current handling**: Queue ALL operations for sync
- **Mitigation**: Limit queue to 100 most recent operations, discard older changes

**EDGE CASE**: Simultaneous RSVP to event at capacity limit
- **Scenario**: Event has 1 seat left, 10 users RSVP simultaneously
- **Impact**: Oversold event, 9 users get rejected after thinking they got a spot
- **Current handling**: Optimistic locking may fail under high concurrency
- **Mitigation**: Pessimistic locking for capacity-critical operations, queue-based RSVP system

**EDGE CASE**: Event organizer deletes event while user is viewing
- **Scenario**: User on event detail page, organizer deletes event
- **Impact**: Real-time update shows "Event not found" error mid-viewing
- **Current handling**: Supabase Realtime triggers deletion notification
- **Mitigation**: Graceful "This event has been cancelled" message with explanation

### 1.4 Database Edge Cases

**EDGE CASE**: Duplicate event from multiple sources (Yelp scrape + manual entry)
- **Scenario**: Restaurant posts event on Yelp, also manually adds to platform
- **Impact**: Same event appears twice in search results
- **Current handling**: No deduplication logic
- **Mitigation**: Fuzzy matching on (name + location + time), flag potential duplicates for review

**EDGE CASE**: Event with invalid date (Feb 30, leap year issues)
- **Scenario**: Organizer enters "February 30, 2025" for event
- **Impact**: Database accepts invalid date, causes query failures
- **Current handling**: PostgreSQL DATE type validates, but form may not
- **Mitigation**: Client-side and server-side date validation, reject impossible dates

**EDGE CASE**: Circular geofence (event area is ring-shaped)
- **Scenario**: Marathon route (ring around city), concert with "GA floor" vs "balcony seats"
- **Impact**: Point-in-polygon queries may fail for non-simple polygons
- **Current handling**: PostGIS handles complex polygons, but UI may not
- **Mitigation**: Support multi-polygon geometries, render correctly on map

---

## 2. User Behavior Edge Cases

### 2.1 Authentication Edge Cases

**EDGE CASE**: User signs up with work email, company domain blocks verification email
- **Scenario**: Corporate firewall blocks emails from SendGrid
- **Impact**: User never receives verification email, account stuck in limbo
- **Current handling**: Resend verification email
- **Mitigation**: Alternative verification methods (SMS, in-app code), corporate email detection

**EDGE CASE**: User creates account, deletes it, re-registers with same email
- **Scenario**: GDPR "right to erasure" invoked, then user changes mind
- **Impact**: Deleted user UUID still exists in logs, new signup may fail
- **Current handling**: Hard delete removes all data including UUID
- **Mitigation**: Soft delete with 30-day grace period, prevent re-registration during grace period

**EDGE CASE**: OAuth provider (Google) account suspended mid-session
- **Scenario**: User's Google account banned while logged into app
- **Impact**: JWT still valid, but refresh fails, app shows cryptic errors
- **Current handling**: JWT expires eventually (24 hours)
- **Mitigation**: Periodic OAuth token validation, graceful logout with explanation

### 2.2 Payment Edge Cases

**EDGE CASE**: User's credit card expires between ticket purchase and event date
- **Scenario**: Buy ticket 6 months in advance, card expires before event
- **Impact**: Cannot process refunds or updates to same card
- **Current handling**: Stripe stores expired card, refund may fail
- **Mitigation**: Update payment method flow, notify user of expiring cards 30 days prior

**EDGE CASE**: Event organizer account suspended AFTER ticket sales
- **Scenario**: Fraud detected, organizer account frozen with $10K in pending payouts
- **Impact**: Attendees show up to event that doesn't exist, demand refunds
- **Current handling**: Freeze organizer payouts, but event still live
- **Mitigation**: Automatic event cancellation if organizer suspended, instant refunds

**EDGE CASE**: Chargeback filed AFTER event occurred and succeeded
- **Scenario**: Attendee enjoyed event, files chargeback 60 days later for free ticket
- **Impact**: Organizer loses money despite successful event
- **Current handling**: Stripe dispute process (2-3 months)
- **Mitigation**: QR code check-in proof, photo evidence, submit to Stripe automatically

### 2.3 Content Edge Cases

**EDGE CASE**: Event name contains profanity but is legitimate
- **Scenario**: Band named "F*** Buttons" (real band), art exhibit "The S*** Show"
- **Impact**: AI moderation auto-blocks despite being legitimate artist names
- **Current handling**: Perspective API blocks high toxicity scores
- **Mitigation**: Allowlist for known artists/venues, human review queue

**EDGE CASE**: Copied event description from another platform (copyright)
- **Scenario**: Organizer copy-pastes Eventbrite description word-for-word
- **Impact**: Potential DMCA takedown notice
- **Current handling**: No plagiarism detection
- **Mitigation**: Similarity check against other platforms, watermark detection

**EDGE CASE**: Event description in language different from app locale
- **Scenario**: Spanish-language event in Austin (30% Hispanic population)
- **Impact**: English-speaking users confused, Spanish-speaking users can't find it
- **Current handling**: Single language per event
- **Mitigation**: Multi-language event descriptions, auto-translate with Google Translate API

---

## 3. Business Logic Edge Cases

### 3.1 Pricing Edge Cases

**EDGE CASE**: Free event requires "ticket" for capacity tracking
- **Scenario**: Library event, free entry, but wants RSVP count
- **Impact**: Users confused why they need to "purchase" $0 ticket
- **Current handling**: Stripe minimum is $0.50
- **Mitigation**: Separate "RSVP" flow for free events, no payment processing

**EDGE CASE**: Event price changes AFTER users purchased tickets
- **Scenario**: Early bird $20, then price increases to $40
- **Impact**: Users who paid $40 demand refund seeing others paid $20
- **Current handling**: No price history tracking
- **Mitigation**: Show "You saved $20 with early bird pricing" on confirmation

**EDGE CASE**: Group ticket purchase with one attendee canceling
- **Scenario**: User buys 4 tickets, one friend cancels, wants partial refund
- **Impact**: Stripe doesn't support partial refunds easily
- **Current handling**: All-or-nothing refund
- **Mitigation**: Individual ticket IDs, allow per-ticket cancellation

### 3.2 Geographic Edge Cases

**EDGE CASE**: User's GPS location is inaccurate (tunnel, building)
- **Scenario**: User in subway, GPS shows location 2 miles away
- **Impact**: "Events near me" shows wrong results
- **Current handling**: Use GPS coordinates as-is
- **Mitigation**: GPS accuracy threshold (reject if accuracy >100m), fallback to city-level location

**EDGE CASE**: Event on border of two cities
- **Scenario**: Venue in Arlington, VA (border of DC), searchable from both cities?
- **Impact**: Users in DC don't see it (different city in database)
- **Current handling**: Single `city` field
- **Mitigation**: Multi-city tagging, search includes neighboring cities

**EDGE CASE**: Virtual event (no physical location)
- **Scenario**: Online concert, Zoom webinar
- **Impact**: Cannot store NULL location (PostGIS requires coordinates)
- **Current handling**: Schema requires `location` field
- **Mitigation**: Add `is_virtual` boolean, use (0,0) coordinates with special handling

### 3.3 Temporal Edge Cases

**EDGE CASE**: All-day event (no specific start time)
- **Scenario**: Street festival 10am-10pm, user searches "events tonight 8pm"
- **Impact**: All-day events don't match time-specific queries
- **Current handling**: Single `event_time` timestamp
- **Mitigation**: `start_time` and `end_time` fields, fuzzy time matching

**EDGE CASE**: Recurring event (weekly vs one-time)
- **Scenario**: Trivia night every Tuesday, user RSVPs - which date?
- **Impact**: Database stores single occurrence, not recurrence pattern
- **Current handling**: No recurrence support
- **Mitigation**: `recurrence_rule` field (iCal RRULE format), generate instances dynamically

**EDGE CASE**: Event in past but still shows in "upcoming"
- **Scenario**: Event at 8pm, user searches at 8:30pm, still shows as "happening now"
- **Impact**: Users arrive late to ended events
- **Current handling**: Query filters `event_time > NOW()`
- **Mitigation**: Add `end_time`, filter `end_time > NOW()`, show "Recently ended" tag

---

## 4. Integration Edge Cases

### 4.1 Third-Party API Edge Cases

**EDGE CASE**: Google Maps API quota exceeded mid-day
- **Scenario**: Viral day, 100K users search locations, hit 28K free tier limit at 2pm
- **Impact**: All map searches fail for rest of day
- **Current handling**: API returns error, app crashes
- **Mitigation**: Fallback to Mapbox API, cache map tiles aggressively, show cached map with warning

**EDGE CASE**: Stripe webhook delivery fails (network timeout)
- **Scenario**: Stripe sends payment confirmation, our server is down
- **Impact**: Payment succeeded but user never gets ticket
- **Current handling**: Webhook lost forever
- **Mitigation**: Stripe retries webhooks for 3 days, poll Stripe API for missed events

**EDGE CASE**: Yelp API returns outdated business info (closed venue)
- **Scenario**: Scrape Yelp, venue closed 6 months ago but still listed
- **Impact**: Users navigate to non-existent venue
- **Current handling**: Trust Yelp data
- **Mitigation**: User reporting "Venue closed", verify with Google Places API cross-reference

### 4.2 App Store Edge Cases

**EDGE CASE**: iOS app approved, Android rejected (or vice versa)
- **Scenario**: Privacy policy meets Apple requirements but not Google's
- **Impact**: Launch delayed, single-platform only
- **Current handling**: Assume simultaneous approval
- **Mitigation**: Staggered submission (iOS first, Android after iOS approval), separate privacy policies

**EDGE CASE**: App update rejected mid-marketing campaign
- **Scenario**: New feature promoted, but Apple rejects update for Guideline violation
- **Impact**: Users download app expecting feature that doesn't exist
- **Current handling**: No rollback plan
- **Mitigation**: Feature flags (enable remotely), submit update 2 weeks before marketing

**EDGE CASE**: User reviews app in different language than app supports
- **Scenario**: Spanish-speaking user leaves 1-star review in Spanish (app is English-only)
- **Impact**: Cannot respond to review, potential users see poor rating
- **Current handling**: No multilingual review monitoring
- **Mitigation**: Google Translate API for review translation, respond in user's language

---

## 5. Compliance & Legal Edge Cases

### 5.1 GDPR Edge Cases

**EDGE CASE**: User in EU requests data export, includes deleted content
- **Scenario**: User posts event, deletes it, then requests GDPR data export
- **Impact**: Deleted data should not be exported (conflicts with "right to erasure")
- **Current handling**: Export all data from backups (includes deleted)
- **Mitigation**: Hard delete user-deleted content, only export current state

**EDGE CASE**: User under 16 signs up (GDPR age restriction)
- **Scenario**: Teen enters fake birthdate to access events
- **Impact**: GDPR violation if processing data without parental consent
- **Current handling**: No age verification
- **Mitigation**: Age gate at signup, block users <16 in EU countries

**EDGE CASE**: Data transfer to US (Schrems II ruling)
- **Scenario**: EU user data processed on GCP us-central1 servers
- **Impact**: Violates GDPR data transfer restrictions (Uber case: EUR 290M fine)
- **Current handling**: GCP us-central1 region (US servers)
- **Mitigation**: GCP europe-west1 for EU users, data residency controls

### 5.2 Content Moderation Edge Cases

**EDGE CASE**: Political event flagged as "controversial"
- **Scenario**: Campaign rally for legitimate candidate
- **Impact**: Platform accused of political bias if blocked
- **Current handling**: AI may flag political content
- **Mitigation**: Allowlist for registered political campaigns, human review for political content

**EDGE CASE**: User reports competitor's event as "spam" (sabotage)
- **Scenario**: Competing bar flags rival's happy hour event to suppress it
- **Impact**: Legitimate events removed by bad actors
- **Current handling**: Auto-block after 3 reports
- **Mitigation**: Weight reports by user reputation, verify reporter attended different events

**EDGE CASE**: Event photos contain minors (child privacy)
- **Scenario**: Family festival photos include children's faces
- **Impact**: COPPA violation if photos processed without parental consent
- **Current handling**: AWS Rekognition detects faces but not age
- **Mitigation**: Blur faces under 18, require parental consent for child events

---

## 6. Performance & Scale Edge Cases

### 6.1 Caching Edge Cases

**EDGE CASE**: Event updated during user's cache TTL
- **Scenario**: User loads event at 5:00pm (5-min cache), organizer changes time at 5:02pm
- **Impact**: User sees stale information until 5:05pm
- **Current handling**: Redis 5-minute TTL
- **Mitigation**: Cache invalidation on event updates, WebSocket push for critical changes

**EDGE CASE**: Cache stampede during major event launch
- **Scenario**: 50K users load same event page simultaneously, cache expires
- **Impact**: All 50K hit database simultaneously, database crashes
- **Current handling**: No stampede protection
- **Mitigation**: Probabilistic early expiration, request coalescing, queue-based cache warming

### 6.2 Concurrency Edge Cases

**EDGE CASE**: Two users save same event to list simultaneously
- **Scenario**: User on phone and tablet, both click "Save" at same instant
- **Impact**: Duplicate entries in favorites list
- **Current handling**: No duplicate prevention
- **Mitigation**: UNIQUE constraint on (user_id, event_id), upsert instead of insert

**EDGE CASE**: Organizer edits event while admin is moderating
- **Scenario**: Moderator reviewing flagged event, organizer fixes issue and saves
- **Impact**: Moderator's decision based on outdated content
- **Current handling**: Last write wins
- **Mitigation**: Versioning system, show moderator "Content updated during review" warning

---

## 7. Mobile-Specific Edge Cases

### 7.1 Device Edge Cases

**EDGE CASE**: User on iPad (tablet) vs iPhone (phone)
- **Scenario**: Layout optimized for phone, looks broken on tablet
- **Impact**: Poor UX on 15% of iOS users (iPad market share)
- **Current handling**: React Native responsive design
- **Mitigation**: Test on iPad Pro, iPad Mini, use Platform.isPad detection

**EDGE CASE**: User on very old device (iPhone 8, Android 10)
- **Scenario**: Device has 2GB RAM, app optimized for 4GB+
- **Impact**: App crashes on launch
- **Current handling**: NFR-009 targets 2GB RAM minimum
- **Mitigation**: Test on actual iPhone 8 and Samsung Galaxy A10 devices

**EDGE CASE**: User switches between light/dark mode mid-session
- **Scenario**: iOS setting changes to dark mode while app is open
- **Impact**: App colors don't update until restart
- **Current handling**: Detect appearance changes
- **Mitigation**: React Native Appearance listener, hot-reload theme

### 7.2 Network Edge Cases

**EDGE CASE**: User on airplane WiFi (high latency, unreliable)
- **Scenario**: 2-3 second latency, 50% packet loss
- **Impact**: Requests timeout, infinite loading spinners
- **Current handling**: Default 30s timeout
- **Mitigation**: Retry with exponential backoff, show "Slow connection" warning

**EDGE CASE**: User on cellular data with data cap
- **Scenario**: Downloads 100MB of event images, exceeds data limit
- **Impact**: User's data plan charges, blames app
- **Current handling**: Preload images over WiFi
- **Mitigation**: "Data saver mode" toggle, reduce image quality on cellular

---

## 8. Operational Edge Cases

### 8.1 Deployment Edge Cases

**EDGE CASE**: Database migration fails mid-deployment
- **Scenario**: Schema change requires 10 minutes, fails at 60% complete
- **Impact**: Database in inconsistent state, app crashes
- **Current handling**: "Zero-downtime deployments" assumed
- **Mitigation**: Blue-green deployments, migration rollback scripts, test on staging first

**EDGE CASE**: New app version incompatible with old backend API
- **Scenario**: iOS users auto-update to v2.0, but backend still v1.9
- **Impact**: API calls fail with 400 errors
- **Current handling**: Assume synchronized releases
- **Mitigation**: API versioning (v1, v2), support 2 versions simultaneously

### 8.2 Monitoring Edge Cases

**EDGE CASE**: Sentry error limit exceeded (too many errors)
- **Scenario**: Bug causes crash loop, 100K error reports in 1 hour
- **Impact**: Sentry bill skyrockets, older errors purged
- **Current handling**: Unlimited error reporting
- **Mitigation**: Error rate limiting, sampling (report 10% of errors), circuit breaker

**EDGE CASE**: PostHog analytics quota exceeded mid-month
- **Scenario**: Viral growth, 500K MAU on 50K tier
- **Impact**: Analytics stop working, blind to user behavior
- **Current handling**: PostHog hard limits
- **Mitigation**: Sampling (track 50% of events), upgrade to next tier automatically

---

## Summary Statistics

**Total Edge Cases Identified**: 52
**By Category**:
- Technical: 15
- User Behavior: 9
- Business Logic: 9
- Integration: 9
- Compliance: 6
- Performance: 2
- Mobile: 6
- Operational: 4

**Critical Edge Cases** (cause data loss or legal issues): 8
**High Severity** (cause poor UX or revenue loss): 18
**Medium Severity** (minor UX degradation): 26

**Edge Cases Completely Missed in Iterations 1-4**: 43 (83%)

---

## Version & Run Log

| Version | Timestamp | Agent/Model | Change Summary | Artifacts | Status | Notes | Cost | Hash |
|--------:|-----------|-------------|----------------|-----------|--------|-------|------|------|
| 1.0.0   | 2025-10-01T23:55:00-04:00 | qa-specialist@Claude-Sonnet-4 | Comprehensive edge case analysis across 8 categories | edge-cases.md | OK | 52 edge cases identified, 83% new | 0.00 | f8c2a4e |

### Receipt
- status: OK
- reason_if_blocked: --
- run_id: loop1-iteration5-edge-cases
- inputs: ["research-validation.json", "failure-modes.md", "SPEC.md", "TECH-STACK-DECISION.md"]
- tools_used: ["qa-specialist", "edge-case-analysis"]
- versions: {"claude-sonnet-4":"2025-09-29","categories":"8"}
