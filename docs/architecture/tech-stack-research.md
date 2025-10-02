# Technical Stack Research - What's Poppin!
## Comprehensive Technology Selection Analysis

## Executive Summary

This document provides evidence-based technology selection recommendations for the "What's Poppin!" all-in-one city directory application. Analysis covers mobile frameworks, databases, search engines, real-time synchronization, cloud hosting, and payment integration.

## 1. Mobile Framework Analysis

### React Native vs Flutter Performance Comparison

#### Flutter Performance Profile
- **Compilation**: Direct compilation to native ARM code, eliminating JavaScript bridge overhead
- **Rendering**: Custom rendering engine with new Impeller GPU optimizer (replaced Skia)
- **Performance Advantage**: Superior animation and graphics performance
- **Market Position**: 170k GitHub stars (higher popularity)
- **Best For**: Graphics-intensive apps, custom UI animations, consistent cross-platform design

#### React Native Performance Profile
- **Architecture**: Bridgeless New Architecture (v0.74+) with JavaScript Interface (JSI)
- **Performance**: Eliminated bridge, reduced latency, improved responsiveness
- **Native Integration**: Seamless connection with platform APIs (GPS, camera, sensors)
- **Market Position**: 121k GitHub stars, backed by Meta
- **Best For**: Apps requiring deep platform integration, GPS-heavy features, web code sharing

#### Recommendation for "What's Poppin!"
**SELECTED: React Native**

**Rationale**:
1. Superior native API integration critical for location services
2. Frequent GPS usage requires platform-specific optimization
3. Potential web version shares JavaScript codebase
4. Larger ecosystem of location-specific libraries
5. Better integration with mapping SDKs (Google Maps, Mapbox)

**Trade-offs Accepted**:
- Slightly lower raw performance for animations (acceptable for directory app)
- Less consistent UI across platforms (mitigated with design system)

## 2. Database Architecture Analysis

### PostgreSQL + PostGIS vs MongoDB Geospatial Comparison

#### PostgreSQL + PostGIS Profile
- **Performance**: Superior with indexes, better for complex spatial analysis
- **Functionality**: Comprehensive GIS toolset, extensive spatial functions
- **ACID Compliance**: Full transactional integrity
- **Index Performance**: Significant advantage with proper indexing
- **Best For**: Complex spatial queries, data integrity requirements, GIS tool integration

#### MongoDB Geospatial Profile
- **Performance**: Very fast for radius searches, faster full dataset retrieval
- **Caching**: Significant advantage in repeat query performance
- **Memory Usage**: Higher memory footprint than PostGIS
- **Functionality**: Subset of PostGIS operations (basic geospatial only)
- **Best For**: Simple point queries, flexible schemas, rapid radius searches

#### Recommendation for "What's Poppin!"
**SELECTED: PostgreSQL + PostGIS**

**Rationale**:
1. Complex spatial queries needed (within radius + filters + sorting)
2. ACID compliance critical for business listings and reviews
3. Future need for advanced spatial analysis (density maps, zones)
4. Better integration with analytics tools
5. Mature ecosystem for production deployments

**Implementation Strategy**:
- Use BRIN indexes for timestamp columns (business updates)
- GiST indexes for geospatial columns (location searches)
- Materialized views for common query patterns
- Partitioning by geographic region for scale

**Trade-offs Accepted**:
- Slightly slower simple radius searches (mitigated with proper indexing)
- More rigid schema (benefit for data integrity)

## 3. Search Engine Selection

### Elasticsearch vs Algolia vs Meilisearch Comparison

#### Algolia Profile
- **Pricing**: $1.00-$1.50 per 1,000 search requests + Premium plans (undisclosed)
- **Performance**: Fastest search, sub-50ms response times
- **Features**: NeuralSearch, typo tolerance, analytics, autocomplete, faceting
- **Target Market**: Enterprise, large budgets
- **Best For**: High-traffic apps requiring premium search experience

#### Meilisearch Profile
- **Pricing**: Build $30/month, Pro $300/month, Custom (quote-based)
- **Performance**: Sub-50ms search results, search-as-you-type
- **Features**: Typo tolerance, custom ranking, faceting (built-in), open-source
- **Deployment**: Self-hosted or managed cloud
- **Best For**: Mid-sized apps, cost-conscious startups, customization needs

#### Elasticsearch Profile
- **Pricing**: Open-source + resource costs, Elastic Cloud managed service available
- **Performance**: Slower than Algolia/Meilisearch, handles terabytes of data
- **Features**: Powerful API, machine learning, complex keyword searches, scalable
- **Learning Curve**: Steep, occasional documentation gaps
- **Best For**: Large-scale data, complex analytics, existing ElasticSearch expertise

#### Recommendation for "What's Poppin!"
**SELECTED: Meilisearch (Cloud, Pro Plan)**

**Rationale**:
1. Predictable $300/month cost vs usage-based Algolia pricing
2. Sub-50ms performance meets real-time search requirements
3. Open-source provides migration path if needs change
4. Built-in typo tolerance critical for user experience
5. 14-day trial without credit card for validation

**Implementation Strategy**:
- Index business names, categories, tags, descriptions
- Custom ranking: relevance score + rating + distance + popularity
- Facets: category, price range, rating, hours, features
- Typo tolerance: 1 char for 1-4 chars, 2 chars for 5+ chars
- Update index on business changes via PostgreSQL triggers

**Scaling Path**:
- Start with Pro plan ($300/month)
- Monitor query volume and response times
- Evaluate Custom plan at 100k+ daily searches
- Consider self-hosted if costs exceed $500/month

**Trade-offs Accepted**:
- Less advanced features than Algolia (acceptable for MVP)
- Smaller community than Elasticsearch (mitigated by excellent docs)

## 4. Real-Time Synchronization

### Firebase vs Supabase vs Custom WebSocket Comparison

#### Firebase Real-time Sync Profile
- **Architecture**: Managed platform, NoSQL database with real-time layer
- **Connection Limits**: Cloud Firestore ~1M concurrent, Realtime DB 200k concurrent
- **Features**: Built-in auth, offline caching, cross-platform SDKs, push notifications
- **Pricing**: Generous free tier, costs increase with usage
- **Best For**: Rapid MVPs, simple real-time needs, no server code

#### Supabase Real-time Sync Profile
- **Architecture**: PostgreSQL logical replication over WebSockets
- **Scaling**: Postgres scaling (joins, transactions, RLS), connection pooling, read replicas
- **Features**: SQL queries, ACID transactions, row-level security, self-hosting option
- **Pricing**: Predictable pricing, open-source flexibility
- **Best For**: Complex data relationships, fine-grained access control, cost predictability

#### Custom WebSocket (Socket.io) Profile
- **Architecture**: Build your own real-time infrastructure
- **Performance**: Maximum speed and flexibility
- **Complexity**: Requires server infrastructure, scaling expertise, DevOps resources
- **Best For**: Unique requirements, maximum control, existing WebSocket expertise

#### Recommendation for "What's Poppin!"
**SELECTED: Supabase Real-time**

**Rationale**:
1. Native PostgreSQL integration (already selected for primary DB)
2. Row-level security for multi-tenant business access control
3. ACID transactions for consistent real-time updates
4. Self-hosting option provides exit strategy
5. Predictable pricing model for budgeting

**Real-Time Use Cases**:
- Live business hours updates
- Real-time review posting
- Occupancy/wait time updates
- Event start notifications
- Special offer alerts

**Implementation Strategy**:
- Subscribe to specific business updates by location bounds
- Filter subscriptions by user preferences (followed businesses)
- Batch updates for efficiency (debounce 5s)
- Fallback to polling if WebSocket connection fails
- Store last-known state for offline resilience

**Trade-offs Accepted**:
- Slightly more complex than Firebase (benefit: SQL power)
- Requires PostgreSQL expertise (already in stack)

## 5. Cloud Hosting Provider

### AWS vs GCP vs Azure Cost Comparison

#### Pricing Analysis (Monthly, General Purpose Instances)
- **GCP Compute Engine**: $9.62 (US East), $10.27 (US West), $10.98 (UK) - LOWEST
- **Azure VM**: $10.11 (US East), $12.05 (US West), $11.42 (London)
- **AWS EC2**: $12.16 (US East), $14.49 (US West), $13.71 (UK)

#### Storage Pricing
- **Azure**: Consistently cheapest across all regions
- **GCP**: Competitive at $4.65/month flat
- **AWS S3**: $5.20-$5.87/month depending on region

#### Discount Programs
- **GCP**: Largest discounts (80% for Preemptible VMs)
- **AWS**: Up to 90% off with Spot Instances
- **Azure/AWS**: Similar one-year commitment discounts

#### Price Stability
- **GCP**: 0.35 price changes/month (most stable)
- **Azure**: 0.76 price changes/month
- **AWS**: 197 changes/month (least predictable)

#### Arm CPU Opportunity
- **Azure**: 65% discount for Arm vs x86 On-Demand, 69% for Spot
- **GCP/AWS**: Also offer Arm discounts but smaller gaps

#### Recommendation for "What's Poppin!"
**SELECTED: Google Cloud Platform (GCP)**

**Rationale**:
1. Lowest compute costs ($9.62/month baseline)
2. Most predictable pricing (0.35 changes/month)
3. Superior location services integration (Google Maps API synergy)
4. Best discounts for committed use (critical for cost control)
5. Excellent PostgreSQL managed service (Cloud SQL)

**Service Mapping**:
- **Compute**: Cloud Run (serverless) + GKE (Kubernetes for scaling)
- **Database**: Cloud SQL for PostgreSQL with PostGIS extension
- **Storage**: Cloud Storage (cheaper than S3)
- **CDN**: Cloud CDN for static assets
- **Load Balancing**: Global Load Balancer
- **Monitoring**: Cloud Monitoring + Logging

**Cost Optimization Strategy**:
- Start with Cloud Run (pay-per-request, scales to zero)
- Use Committed Use Discounts (1-year, 57% discount)
- Enable Preemptible VMs for batch jobs (80% discount)
- Use Cloud CDN to reduce origin requests
- Implement proper caching layers

**Estimated Monthly Costs (MVP)**:
- Cloud Run: $50 (10k active users)
- Cloud SQL: $100 (db-n1-standard-1 + 100GB)
- Cloud Storage: $20 (100GB + egress)
- Meilisearch Cloud: $300
- Total Infrastructure: ~$470/month

**Trade-offs Accepted**:
- Smaller market share than AWS (mitigated by excellent docs)
- Fewer third-party integrations (sufficient for our needs)

## 6. Payment Integration

### Stripe vs Square API Comparison

#### Stripe Profile
- **API**: Extremely developer-centric, 700+ partner apps
- **Customization**: Highly customizable checkout, extensive documentation
- **Payment Methods**: 100+ methods, 135 currencies
- **Integration**: CLI, VS Code extension, REST API, webhooks
- **Pricing**: 2.9% + 30 cents per transaction
- **Best For**: Online-first, complex integrations, international sales

#### Square Profile
- **API**: Easy-to-use, 150 marketplace apps, robust sandbox
- **Integrations**: Industry-specific focus, seamless POS integration
- **Payment Methods**: Major cards, digital wallets, BNPL
- **Pricing**: 2.9% + 30 cents (online), lower for in-person
- **Best For**: Small businesses, in-person + online, minimal technical skills

#### Recommendation for "What's Poppin!"
**SELECTED: Stripe**

**Rationale**:
1. Superior API for marketplace/platform scenarios
2. Stripe Connect enables payment splitting (app fee + business revenue)
3. Better support for subscription models (premium listings)
4. More flexible payout schedules for businesses
5. Extensive webhook system for real-time payment tracking

**Implementation Strategy**:
- Use Stripe Connect (Express accounts for businesses)
- Platform fee: 5-10% application fee on transactions
- Immediate payouts to businesses (Stripe handles risk)
- Support major cards + Apple Pay + Google Pay
- PCI compliance handled by Stripe (reduces liability)

**Use Cases**:
- Premium business listing subscriptions ($29-$99/month)
- Featured placement purchases (one-time or recurring)
- Event ticket sales (if expanded scope)
- Delivery/order payments (if marketplace features added)
- In-app advertising purchases

**Trade-offs Accepted**:
- Less in-person POS integration than Square (not needed for MVP)
- Higher complexity for simple use cases (benefit: future flexibility)

## Technology Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Mobile Framework | React Native | Native API integration, GPS optimization, code sharing |
| Database | PostgreSQL + PostGIS | Complex spatial queries, ACID compliance, mature tooling |
| Search Engine | Meilisearch Cloud Pro | Predictable cost, sub-50ms performance, open-source |
| Real-time Sync | Supabase Realtime | PostgreSQL integration, RLS, predictable pricing |
| Cloud Provider | Google Cloud Platform | Lowest compute cost, price stability, Maps API synergy |
| Payment Gateway | Stripe | Superior API, Connect for marketplace, subscription support |

## Risk Mitigation Strategies

### Database Performance Degradation
- **Mitigation**: Proper indexing (GiST, BRIN), query optimization, read replicas
- **Monitoring**: Query performance tracking, slow query logs, index usage stats
- **Scaling**: Vertical scaling first, then read replicas, then sharding by region

### Third-Party API Failures
- **Mitigation**: Circuit breakers, exponential backoff, fallback mechanisms
- **Monitoring**: API health checks, SLA tracking, error rate alerts
- **Redundancy**: Secondary search provider config, cached map tiles, offline mode

### Mobile App Crashes
- **Mitigation**: Comprehensive error boundaries, crash reporting (Sentry), beta testing
- **Monitoring**: Crash-free session rate >99%, ANR rate <0.1%
- **Testing**: Device farm testing (low-end Android), memory profiling, performance budgets

### Real-time Sync Conflicts
- **Mitigation**: Optimistic updates with rollback, conflict resolution strategies, last-write-wins
- **Monitoring**: Conflict rate tracking, sync latency metrics, connection stability
- **Fallback**: Polling fallback, offline queue with sync on reconnect

### Search Query Performance
- **Mitigation**: Query result caching, index optimization, query complexity limits
- **Monitoring**: P95 latency <100ms, cache hit rate >80%, index freshness
- **Scaling**: Meilisearch cluster for high traffic, CDN caching for common searches

## Next Steps

1. **Architecture Design**: Create detailed system architecture diagrams (Loop 1, Iteration 3)
2. **Cost Modeling**: Build detailed cost projections at 10k, 100k, 1M users
3. **Proof of Concept**: Validate critical technical assumptions
   - PostgreSQL PostGIS query performance at scale
   - Meilisearch search-as-you-type latency
   - React Native GPS battery usage profiling
4. **Vendor Evaluation**: Set up trial accounts and test integrations
5. **Security Architecture**: Design authentication, authorization, and data protection

<!-- AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE -->
## Version & Run Log
| Version | Timestamp | Agent/Model | Change Summary | Artifacts | Status | Notes | Cost | Hash |
|--------:|-----------|-------------|----------------|-----------|--------|-------|------|------|
| 1.0.0 | 2025-10-01T00:00:00Z | architect@sonnet-4 | Initial tech stack research with comprehensive analysis | tech-stack-research.md | OK | Evidence-based selection across 6 technology categories | 0.00 | a7f3c2d |

### Receipt
- status: OK
- reason_if_blocked: --
- run_id: loop1-iteration2-tech-research
- inputs: ["Web search results for 6 technology comparisons"]
- tools_used: ["WebSearch", "Write"]
- versions: {"model":"claude-sonnet-4-5","prompt":"loop1-iteration2"}
<!-- AGENT FOOTER END: DO NOT EDIT BELOW THIS LINE -->
