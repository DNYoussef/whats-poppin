# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**What's Poppin!** is an AI-powered event discovery platform that provides event organizers with professional marketing tools while delivering personalized event recommendations to users. The project follows a bootstrap strategy with zero seed funding, leveraging AI to create organic viral growth.

**Current Status**: Planning phase - comprehensive documentation exists but no source code has been implemented yet.

## Core Value Propositions

### For Event Organizers
- **AI Event Page Builder** (FR-013): Generates professional event listings from minimal input using Gemini Flash/Claude Haiku
- **AI Flyer Generator** (FR-014): Creates professional event flyers with QR codes using Stable Diffusion (self-hosted)
- **Smart QR Code System** (FR-015): Dynamic QR codes that track shares, offer referral bonuses, and redirect smartly

### For Users
- **AI Event Recommendations** (FR-016): PostgreSQL pgvector embeddings with collaborative filtering
- **Daily Curated Feed** (FR-017): AI-curated notifications with 3 perfect events daily

## Technology Stack (Evidence-Based Decisions)

### Mobile & Backend
- **Mobile**: React Native + TypeScript (superior GPS/native API integration)
- **Backend**: Node.js + NestJS (TypeScript consistency, enterprise patterns)
- **Database**: PostgreSQL 15 + PostGIS (5-50x faster spatial queries vs MongoDB)
- **Search**: Meilisearch Cloud Pro ($300/month fixed cost, sub-50ms latency)
- **Real-Time**: Supabase Realtime (native PostgreSQL integration, Row-Level Security)

### Cloud & Services
- **Cloud Provider**: Google Cloud Platform (15-20% cheaper than AWS, better PostgreSQL support)
- **Payments**: Stripe (marketplace API, PCI DSS Level 1, 2.9% + $0.30 fee)
- **Analytics**: PostHog (all-in-one platform at 1/5 cost of Amplitude/Mixpanel)
- **CDN**: Cloudflare Pro ($20/month unlimited bandwidth)

### AI Services (Bootstrap-Optimized)
- **Event Page Generation**: Gemini Flash (free tier) or Claude Haiku ($0.01-0.05/event)
- **Flyer Generation**: Stable Diffusion (self-hosted on GCP free tier, $0 cost)
- **Embeddings**: PostgreSQL pgvector + Sentence Transformers (free) OR OpenAI Embeddings ($0.13/1M tokens)

## Bootstrap Financial Model

### Target Milestones
- **Month 1-2**: $27 total cost (domain registration only)
- **Month 3-6**: $85/month infrastructure, ~$548/month revenue, profitable
- **Month 6**: Break-even achieved
- **Month 12**: $10,500/month revenue, $750/month costs, $9,750/month profit
- **Year 1 Total**: ~$40K profit

### Revenue Model
- **Ticketing**: 2.9% + $0.30 (Stripe) + 2% platform fee = 4.9% total (vs Eventbrite 7.4%)
- **Premium Tiers**: Free, Premium ($4.99), Premium Plus ($14.99), Business ($49.99)

## Development Roadmap

### Phase 1: MVP (Months 1-3) - $27K Budget
- **Month 1**: Infrastructure setup, database schema, authentication, basic APIs
- **Month 2**: Mobile app UI/UX, core features, search & discovery
- **Month 3**: Security hardening, GDPR compliance, content seeding (500+ events), beta testing

### Phase 2: Launch & Growth (Months 4-6) - $39K Budget
- **Month 4**: App Store launch, user acquisition (5K users target), growth optimization
- **Month 5**: Social features, AI recommendations, monetization (ticketing + subscriptions)
- **Month 6**: Multi-city expansion (Nashville, Denver), analytics optimization

### Phase 3: Scale (Months 7-12) - $20K Budget
- Advanced AI personalization, offline functionality, 10 cities, 50K users, $50K MRR

## Key Architecture Patterns

### Geospatial Queries (PostgreSQL + PostGIS)
- Primary indexes: `location` (GIST spatial), `category` (B-tree), `rating` (B-tree)
- Partitioning: Geographic sharding by city
- Read replicas: 2 replicas per region for read scaling
- Connection pooling: PgBouncer (6,000 connections → 100 DB connections)

### AI Recommendation Engine
- PostgreSQL pgvector for embeddings storage
- Cosine similarity for event matching
- Collaborative filtering: "Users like you enjoyed..."
- Content-based matching: event descriptions → user interests
- Time/location context awareness

### Real-Time Synchronization
- Supabase Realtime listening to PostgreSQL WAL
- Subscribe to: `events` table changes, `user_notifications` table
- Fallback: Polling every 30s if WebSocket connection fails
- Battery optimization: Disconnect WebSocket when app backgrounded

## Critical Implementation Notes

### Security & Compliance
- **GDPR Compliance**: 45-point checklist, privacy-by-design architecture
- **Authentication**: Supabase Auth with Row-Level Security (RLS), 100% policy coverage
- **Content Moderation**: Perspective API (text) + AWS Rekognition (images)
- **Rate Limiting**: 10 anonymous, 60 authenticated requests/minute
- **PCI DSS**: SAQ A compliance via Stripe integration

### Performance Requirements
- Search results: <2 seconds (p95)
- Map loading: <1 second
- Page navigation: <500ms
- API response: p95 <200ms, p99 <500ms
- Uptime: 99.9% SLA

### Quality Gates
- Unit test coverage: ≥80%
- Crash-free rate: >99.5%
- App Store rating: ≥4.5 stars
- Day 1 retention: >60%
- Day 7 retention: >30%
- Day 30 retention: >15% (5x industry average)

## Documentation Structure

All planning documents are in `/docs`:
- **SPEC.md**: Complete product specification with functional/non-functional requirements
- **TECH-STACK-DECISION.md**: Evidence-based technology selections with performance benchmarks
- **DEVELOPMENT-PLAN.md**: 6-month roadmap with detailed weekly breakdowns
- **BOOTSTRAP-STRATEGY.md**: Zero-funding growth strategy leveraging AI tools
- **RISK-REGISTER.md**: Comprehensive risk analysis across market, technical, security, business domains

## Getting Started (When Implementing)

### Initial Setup Commands
```bash
# GCP Project
gcloud projects create whats-poppin-prod
gcloud sql instances create whats-poppin-db --tier=db-n1-standard-1 --region=us-central1

# Database with PostGIS
psql -h [CLOUD_SQL_IP] -U postgres -c "CREATE EXTENSION postgis;"

# Mobile App (React Native)
npx react-native init WhatsPoppin --template react-native-template-typescript
npm install @react-navigation/native react-native-maps @supabase/supabase-js

# Backend API (NestJS)
npm i -g @nestjs/cli
nest new whats-poppin-api
npm install @nestjs/typeorm typeorm pg @nestjs/passport passport-jwt
```

### Environment Variables (Required)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/whats-poppin
POSTGRES_SSL=true

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# AI Services
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx

# Meilisearch
MEILISEARCH_HOST=https://xxx.meilisearch.io
MEILISEARCH_API_KEY=xxx

# Stripe
STRIPE_PUBLIC_KEY=pk_xxx
STRIPE_SECRET_KEY=sk_xxx

# GCP
GCP_PROJECT_ID=whats-poppin-prod
GCP_STORAGE_BUCKET=whats-poppin-assets
```

## File Organization (When Code Exists)

Files should be organized as:
- `/src` - All source code
- `/tests` - Test files
- `/docs` - Documentation (current)
- `/config` - Configuration files
- `/scripts` - Utility scripts

**Important**: Never save working files or tests to the root folder.

## Success Metrics Targets

### Year 1 Goals (Bootstrap)
- **Users**: 5,000 registered users
- **Organizers**: 150 active organizers
- **Events**: 1,500 events/month
- **Revenue**: $10,500/month MRR by Month 12
- **Retention**: 20% Day-30 (2.5x better than funded competitors)
- **CAC**: $0 (100% organic growth)

### Business Metrics
- **LTV:CAC Ratio**: >10:1 (currently projected 34:1)
- **Break-Even**: Month 6-9 (vs Month 18-24 with funding)
- **Conversion**: 3-5% free-to-premium
- **Churn**: <5% for premium users
