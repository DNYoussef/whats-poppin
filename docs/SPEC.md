# What's Poppin! - Product Specification

## Executive Summary

**What's Poppin!** is an AI-powered city discovery platform that empowers event organizers with professional marketing tools while delivering personalized event recommendations to users—all bootstrapped with zero seed funding.

**Vision**: Become the #1 event discovery platform through AI-powered organizer success tools and viral organic growth—profitable by Month 6.

**Bootstrap Strategy**: Launch with $27 capital, leverage AI to create organizer success (free flyers, QR codes, page builders), achieve viral growth through QR code marketing, profitable Month 6-9.

**Target Market**:
- Primary: Event organizers needing marketing tools (saves them $50-200 per event)
- Secondary: Locals discovering events through AI personalization
- Tertiary: Travelers benefiting from comprehensive city discovery

**Market Opportunity**: $1.4T global events industry + untapped AI-powered organizer tool market. Bootstrap-friendly: profitable in 6-9 months with organic growth.

---

## 1. Functional Requirements

### 1.1 Core Discovery Features

**FR-001: Location-Based Search**
- Real-time geolocation with 10-meter accuracy
- Radius-based search (0.5 mi, 1 mi, 5 mi, 10 mi, 50 mi)
- Map view with cluster markers for high-density areas
- List view with distance sorting
- Filter by category, time, price, rating
- **Priority**: P0 (MVP Critical)

**FR-002: Multi-Category Discovery**
- Food & Dining (restaurants, cafes, food trucks, bars)
- Activities & Entertainment (museums, tours, nightlife, sports)
- Children's Activities (playgrounds, family events, kid-friendly venues)
- Group Meetups (networking, hobbies, sports leagues, social groups)
- Events (concerts, festivals, markets, workshops)
- **Priority**: P0 (MVP Critical)

**FR-003: Event Discovery & Ticketing**
- Browse upcoming events by date/category/location
- Event details (description, time, location, price, capacity)
- Free event listings (no commission)
- Paid event ticketing (low-fee alternative to Eventbrite)
- Calendar integration (add to Google/Apple Calendar)
- Event reminders and notifications
- **Priority**: P0 (MVP Critical)

**FR-004: Real-Time Information**
- Live event status (active, upcoming, ended, cancelled)
- Real-time attendance estimates
- Current wait times for popular venues
- Weather-aware recommendations
- Traffic-aware timing suggestions
- **Priority**: P2 (Future - requires funding)

---

## 1.2 AI-Powered Organizer Tools (Bootstrap Differentiation)

**FR-013: AI Event Page Builder**
- AI generates professional event listings from minimal input
- SEO-optimized titles and descriptions (Gemini Flash/Claude Haiku)
- Auto-suggest categories, tags, pricing based on similar events
- Optimal time slot recommendations (avoid conflicts)
- One-click publish workflow
- **Value Proposition**: Saves organizers 30+ minutes per event
- **Cost**: $0.01-0.05 per generation (free tier covers 500+ events/month)
- **Priority**: P0 (MVP Critical - this IS the viral hook)

**FR-014: AI Flyer Generator**
- Professional event flyers from event details (Stable Diffusion self-hosted)
- Multiple design templates auto-selected by event type
- Embedded QR codes with event links
- Instagram/Facebook optimized (1080x1080)
- Download PNG/PDF or post directly to social
- Branded watermark: "Created with What's Poppin!"
- **Value Proposition**: Saves organizers $50-200 per designer fee
- **Cost**: $0 (Stable Diffusion self-hosted on GCP free tier)
- **Priority**: P0 (MVP Critical - viral marketing engine)

**FR-015: Smart QR Code System**
- Dynamic QR codes that update after printing
- Share tracking and analytics ("50+ people scanned your code")
- Referral bonuses (50+ scans = free premium for organizer)
- Smart redirects (iOS App Store / Android Play Store / web fallback)
- Branded short URLs (whats.in/eventID)
- **Value Proposition**: Printed flyers = permanent free marketing
- **Cost**: $0 (URL shortening is free, we control redirects)
- **Priority**: P0 (MVP Critical - viral loop mechanism)

---

## 1.3 AI-Powered User Personalization

**FR-016: AI Event Recommendation Engine**
- Learn user preferences from onboarding quiz + behavior
- PostgreSQL pgvector embeddings + cosine similarity
- Collaborative filtering ("Users like you enjoyed...")
- Content-based matching (event descriptions → user interests)
- Time/location context awareness
- **Value Proposition**: Users find perfect events (10x engagement)
- **Cost**: $0-5/month (pgvector free, embeddings minimal)
- **Priority**: P0 (MVP Critical - retention driver)

**FR-017: Daily "Your Feed" Notifications**
- AI-curated daily notification with 3 perfect events
- Time-appropriate suggestions (no "tonight" at 9pm)
- Category diversity (not all concerts)
- Progressive exploration (suggest new categories gradually)
- Social proof ("3 friends RSVPed")
- **Value Proposition**: Daily habit formation = 5x retention
- **Cost**: $0 (push notifications free)
- **Priority**: P0 (MVP Critical - habit formation)

### 1.2 User Features

**FR-005: User Profiles & Preferences**
- Account creation (email, Google, Apple Sign-In)
- User preferences (food preferences, activity interests, budget)
- Saved favorites and wish lists
- Event history and check-ins
- Privacy controls (location sharing, profile visibility)
- **Priority**: P0 (MVP Critical)

**FR-006: Social & Community**
- User reviews and ratings (5-star + text)
- Photo sharing for venues and events
- Follow users and see their activity
- Create and join groups
- Share discoveries with friends
- Event invitations and RSVPs
- **Priority**: P1 (Post-MVP)

**FR-007: Personalization & AI**
- AI-powered recommendations based on history
- Daily discovery feed tailored to preferences
- "Surprise Me" feature for spontaneous discovery
- Trending now in your area
- Similar users' recommendations
- **Priority**: P1 (Post-MVP)

### 1.3 Organizer & Business Features

**FR-008: Event Creation & Management**
- Self-service event posting (free for unpaid events)
- Event editing and cancellation
- Attendee management and check-in
- Event analytics (views, RSVPs, attendance)
- Ticketing with 2.9% + $0.30 fee (vs Eventbrite 7.4%)
- **Priority**: P0 (MVP Critical)

**FR-009: Business Listings**
- Claim and verify business listings
- Business hours, menu, photos, description
- Special offers and promotions
- Analytics dashboard (views, clicks, conversions)
- Sponsored listing upgrades (Premium tier)
- **Priority**: P1 (Post-MVP)

### 1.4 Platform Features

**FR-010: Search & Discovery Engine**
- Full-text search across all content
- Autocomplete with suggested results
- Voice search integration
- Filter by multiple criteria simultaneously
- Sort by relevance, distance, rating, price, time
- **Priority**: P0 (MVP Critical)

**FR-011: Notifications & Alerts**
- Event reminders (1 day before, 1 hour before)
- New events in saved categories
- Friend activity notifications
- Deal alerts for saved venues
- Breaking news for major city events
- **Priority**: P1 (Post-MVP)

**FR-012: Offline Functionality**
- Download city data for offline access
- Saved favorites available offline
- Map caching for navigation
- Queue actions for sync when online
- **Priority**: P2 (Future)

---

## 2. Non-Functional Requirements

### 2.1 Performance

**NFR-001: Response Time**
- Search results: <2 seconds
- Map loading: <1 second
- Page navigation: <500ms
- API response time: p95 <200ms, p99 <500ms
- **Rationale**: Performance issues are #1 cause of app uninstalls

**NFR-002: Scalability**
- Support 10,000 concurrent users (Year 1)
- Support 100,000 concurrent users (Year 2)
- Database: Handle 10M+ venues and 100M+ events
- Search: Sub-50ms query latency at scale
- **Rationale**: Must scale with user growth without degradation

**NFR-003: Availability**
- 99.9% uptime SLA (43 minutes downtime/month max)
- Zero-downtime deployments
- Automated failover and recovery
- Geographic redundancy for disaster recovery
- **Rationale**: Trust and reliability are critical for adoption

### 2.2 Security & Privacy

**NFR-004: Authentication & Authorization**
- OAuth2/OIDC compliant authentication
- JWT-based session management
- Row-level security (RLS) for data isolation
- Multi-factor authentication (MFA) for premium users
- **Rationale**: Protect user data and prevent unauthorized access

**NFR-005: Data Privacy (GDPR/CCPA Compliance)**
- Explicit opt-in consent for location tracking
- Location disabled by default
- 30-day location retention, anonymize after 7 days
- User rights: access, rectification, erasure, portability
- Privacy-by-design architecture
- **Rationale**: GDPR fines up to 20M EUR or 4% revenue - compliance mandatory

**NFR-006: Payment Security (PCI DSS SAQ A)**
- Stripe integration (no raw card data handling)
- TLS 1.3 encryption for all transactions
- Tokenized payment methods
- Annual self-assessment compliance
- **Rationale**: Payment security is non-negotiable for trust

**NFR-007: Content Security**
- AI content moderation (Perspective API + AWS Rekognition)
- Auto-block high-risk content (>90% toxicity)
- Human review queue for medium-risk (70-90%)
- User reporting and flagging system
- **Rationale**: Platform safety prevents reputational damage

### 2.3 Usability & Accessibility

**NFR-008: User Experience**
- Intuitive navigation (max 3 taps to any feature)
- Consistent design language (Material/iOS guidelines)
- Onboarding completion in <2 minutes
- Accessibility: WCAG 2.1 AA compliance
- Multi-language support (English, Spanish initial)
- **Rationale**: Poor UX drives 2.8% retention - must exceed industry

**NFR-009: Mobile-First Design**
- iOS 14+ and Android 10+ support
- Responsive design for tablets
- Optimized for low-end devices (2GB RAM minimum)
- Battery-efficient location tracking
- **Rationale**: 90% of local searches happen on mobile

### 2.4 Operational

**NFR-010: Monitoring & Observability**
- Real-time error tracking (Sentry/similar)
- Performance monitoring (sub-2s page loads)
- User analytics (PostHog - retention, engagement)
- Infrastructure metrics (CPU, memory, database)
- Alerting for critical failures
- **Rationale**: Data-driven decisions require comprehensive visibility

**NFR-011: Maintainability**
- Code coverage: ≥80% unit tests
- Automated CI/CD pipeline
- Code review required for all changes
- Documentation for all APIs and components
- Semantic versioning for releases
- **Rationale**: Long-term sustainability requires maintainable code

---

## 3. User Stories

### Epic 1: Discovery & Search

**US-001: As a traveler**, I want to search for restaurants near me so that I can find dining options quickly.
- **Acceptance Criteria**: Search returns results within 2 seconds, sorted by distance, with ratings and price

**US-002: As a local**, I want to discover new events happening this weekend so that I can plan my activities.
- **Acceptance Criteria**: Filter events by date range, see calendar view, add to personal calendar

**US-003: As a parent**, I want to find child-friendly activities so that I can entertain my kids.
- **Acceptance Criteria**: Filter by "children's activities", see age ranges, safety ratings

### Epic 2: Events & Ticketing

**US-004: As an event organizer**, I want to create free event listings so that I can promote my community events.
- **Acceptance Criteria**: Create event in <3 minutes, preview before publishing, edit after publishing

**US-005: As an attendee**, I want to purchase event tickets in-app so that I don't have to visit external sites.
- **Acceptance Criteria**: Secure payment via Stripe, instant ticket delivery, QR code check-in

### Epic 3: Social & Community

**US-006: As a user**, I want to save my favorite venues so that I can easily find them later.
- **Acceptance Criteria**: One-tap save, organize into lists, access offline

**US-007: As a food enthusiast**, I want to follow other users with similar tastes so that I can discover new places.
- **Acceptance Criteria**: See follower activity feed, get notifications for their reviews

### Epic 4: Personalization

**US-008: As a user**, I want personalized recommendations so that I discover things I'll actually enjoy.
- **Acceptance Criteria**: Daily feed updates, learn from ratings/saves, "why recommended" explanations

**US-009: As a spontaneous explorer**, I want a "Surprise Me" button so that I can discover random interesting places.
- **Acceptance Criteria**: Random selection within preferences, quick re-roll option

---

## 4. Success Metrics

### 4.1 User Acquisition

- **Year 1**: 50,000 registered users
- **Year 2**: 500,000 registered users
- **CAC Target**: <$3.00 (60% organic, 40% paid)
- **Activation Rate**: >40% complete onboarding and perform first search

### 4.2 Engagement & Retention

- **Day 1 Retention**: >60%
- **Day 7 Retention**: >30%
- **Day 30 Retention**: >15% (5x industry average of 2.8%)
- **Daily Active Users**: >10% of registered users
- **Sessions per User**: >3 per week

### 4.3 Business Metrics

- **GMV (Gross Merchandise Value)**: $500K Year 1, $5M Year 2
- **Revenue**: $180K Year 1, $1.5M Year 2
- **LTV:CAC Ratio**: >3:1 (currently projected 34:1)
- **Break-Even**: Month 18-24
- **Monthly Churn**: <5% for premium users

### 4.4 Platform Quality

- **App Store Rating**: ≥4.5 stars
- **Crash-Free Rate**: >99.5%
- **Page Load Time**: p95 <2 seconds
- **Search Latency**: p95 <50ms
- **API Uptime**: >99.9%

---

## 5. Technical Specifications

### 5.1 Technology Stack (Evidence-Based Selection)

**Mobile**: React Native + TypeScript
- **Rationale**: Superior GPS/native API integration, 30% faster development vs native

**Backend**: Node.js + NestJS
- **Rationale**: TypeScript consistency, enterprise patterns, scalable architecture

**Database**: PostgreSQL 15 + PostGIS
- **Rationale**: 5-50x faster spatial queries vs MongoDB, ACID compliance

**Search**: Meilisearch Cloud Pro
- **Rationale**: Predictable $300/month cost, sub-50ms latency, typo tolerance

**Real-Time**: Supabase Realtime
- **Rationale**: Native PostgreSQL integration, Row-Level Security, free tier 50K MAU

**Cloud**: Google Cloud Platform (GCP)
- **Rationale**: 15-20% cheaper than AWS, better PostgreSQL support

**Payments**: Stripe
- **Rationale**: Superior marketplace API, PCI DSS Level 1, fraud prevention

**Analytics**: PostHog
- **Rationale**: All-in-one platform at 1/5 cost of Amplitude/Mixpanel

### 5.2 Architecture Patterns

- Microservices architecture for scalability
- Event-driven communication (message queues)
- API Gateway with rate limiting
- CDN for static assets (Cloudflare)
- Geographic sharding for database scaling
- Circuit breakers for third-party API failures

### 5.3 Security Implementation

- Supabase Auth (OAuth2/OIDC) with Row-Level Security
- TLS 1.3 with certificate pinning
- Content moderation: Perspective API (text) + AWS Rekognition (images)
- Rate limiting: 10 anonymous, 60 authenticated requests/minute
- Encrypted storage: iOS Keychain / Android Keystore
- PCI DSS SAQ A compliance via Stripe

---

## 6. Constraints & Assumptions

### 6.1 Technical Constraints

- **Mobile-First**: 90% of usage expected on mobile devices
- **Offline Limited**: Full offline requires 500MB+ download per city (not scalable)
- **Third-Party APIs**: Dependent on Google Maps, Stripe, payment processors
- **Battery Life**: Location tracking limited to preserve battery (<10% impact)

### 6.2 Business Constraints

- **Year 1 Budget**: <$100K total (infrastructure + development + marketing)
- **Team Size**: 2-3 developers initially
- **Time to Market**: MVP in 3 months, full v1.0 in 6 months
- **Geographic Launch**: Single city initially (Austin, Nashville, or Denver)

### 6.3 Assumptions

- **Cold Start**: Pre-seed 500+ events before user launch (partnerships required)
- **Data Quality**: Business data from Yelp/Google APIs (licensing verified)
- **User Behavior**: Users will create content (15-20% contributor rate)
- **Monetization**: 3-5% free-to-premium conversion rate achievable
- **Retention**: Design improvements can achieve 5x industry retention (15% vs 2.8%)

---

## 7. Risks & Mitigation Strategies

See comprehensive **RISK-REGISTER.md** for detailed analysis of 30+ identified risks across 4 categories (Market, Technical, Security, Business) with mitigation strategies.

**Critical Risks**:
1. Cold start problem (no events, no users)
2. Failed retention (stuck at 2.8% industry average)
3. Database performance degradation at scale
4. GDPR/security violations
5. Unsustainable infrastructure costs

**Mitigation Approach**: Iterative testing, geographic focus, partnerships, automated monitoring

---

## 8. Implementation Roadmap

### Phase 1: MVP (Months 1-3)
- Core location-based search
- Event discovery and listings
- User authentication and profiles
- Basic reviews and ratings
- iOS/Android apps + backend API
- **Launch**: Single city (500+ pre-seeded events)

### Phase 2: Growth (Months 4-6)
- Personalized recommendations
- Social features (follow, share)
- Event ticketing integration
- Business claim and verification
- Expand to 3 additional cities

### Phase 3: Scale (Months 7-12)
- AI-powered discovery
- Advanced filters and search
- Offline functionality
- Analytics dashboard for businesses
- Expand to 10+ cities nationwide

---

## Version & Run Log

| Version | Timestamp | Agent/Model | Change Summary | Artifacts | Status | Notes | Cost | Hash |
|--------:|-----------|-------------|----------------|-----------|--------|-------|------|------|
| 1.0.0   | 2025-10-01T22:00:00-04:00 | synthesis@Claude-Sonnet-4 | Loop 1 synthesis of 4 iterations | SPEC.md | OK | Market, Tech, Security, Business research complete | 0.00 | a7f3d9c |

### Receipt
- status: OK
- reason_if_blocked: --
- run_id: loop1-synthesis-whats-poppin
- inputs: ["iteration1/research-market.json", "iteration2/research-tech.json", "iteration3/research-security.json", "iteration4/research-business.json"]
- tools_used: ["researcher", "system-architect", "security-manager", "planner", "WebSearch", "Firecrawl"]
- versions: {"claude-sonnet-4":"2025-09-29","loop1-methodology":"4x-iteration"}
