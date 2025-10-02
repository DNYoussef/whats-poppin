# What's Poppin! - Database Documentation

Complete Supabase database schema for the event discovery platform.

## Quick Start

1. **Create Supabase Project**: [supabase.com](https://supabase.com)
2. **Enable Extensions**: `postgis`, `vector`, `uuid-ossp`
3. **Run Migrations** (in order):
   - `001_initial_schema.sql`
   - `002_enable_rls.sql`
   - `003_seed_data.sql` (optional, dev only)

## Files Created

### Migration Files

| File | Description | Size |
|------|-------------|------|
| `src/database/migrations/001_initial_schema.sql` | Core schema, tables, indexes, functions | ~400 lines |
| `src/database/migrations/002_enable_rls.sql` | Row-level security policies | ~250 lines |
| `src/database/migrations/003_seed_data.sql` | Sample Austin events and venues | ~300 lines |

### Type Definitions

| File | Description | Size |
|------|-------------|------|
| `src/types/database.types.ts` | TypeScript interfaces and enums | ~400 lines |
| `src/lib/database.ts` | Type-safe query helpers (NASA Rule 10) | ~350 lines |

### Documentation

| File | Description |
|------|-------------|
| `docs/DATABASE_SCHEMA.md` | Complete schema reference |
| `docs/MIGRATION_GUIDE.md` | Step-by-step migration instructions |
| `docs/SAMPLE_QUERIES.md` | SQL and TypeScript examples |
| `docs/DATABASE_README.md` | This file |

## Schema Overview

### Tables

1. **profiles** - User profiles extending `auth.users`
2. **venues** - Event locations with PostGIS coordinates
3. **events** - Core events with AI embeddings
4. **user_event_interactions** - Engagement tracking
5. **event_recommendations** - AI-powered suggestions

### Key Features

- **PostGIS Spatial Queries**: Find events by proximity
- **pgvector AI Search**: Semantic similarity recommendations
- **Full-Text Search**: Fast text search with PostgreSQL
- **Row-Level Security**: Fine-grained access control
- **Automatic Triggers**: Timestamp updates, counter management

## Technology Stack

- **Database**: PostgreSQL 15 (via Supabase)
- **Extensions**:
  - `postgis` 3.3 - Spatial/geography types
  - `vector` 0.5 - AI embeddings (OpenAI)
  - `uuid-ossp` - UUID generation
- **TypeScript Types**: Full type safety
- **ORM**: Supabase JS Client

## RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Public | Own | Own | Own |
| venues | Public | Auth | Creator | Creator |
| events | Published + Own | Auth | Organizer | Organizer |
| interactions | Own | Own | Own | Own |
| recommendations | Own | System | - | Own/Expired |

**Legend:**
- **Public**: Anyone (including anonymous)
- **Auth**: Authenticated users
- **Own**: User's own records
- **Organizer**: Event organizer only
- **System**: Service role only

## Index Strategy

### Spatial Indexes (GIST)
- `venues.location` - Fast proximity queries
- `profiles.location` - User location lookups

### Vector Indexes (IVFFlat)
- `events.embedding` - Cosine similarity search
- Configured for 1536 dimensions (OpenAI)

### Text Search (GIN)
- `events` - Full-text on title + description
- `venues` - Full-text on name + description

### B-Tree Indexes
- Time-based queries: `events.start_time`
- Category filtering: `events.category`
- User lookups: `interactions.user_id`

## Database Functions

### calculate_distance
```sql
calculate_distance(lat1, lon1, lat2, lon2) RETURNS DOUBLE PRECISION
```
Haversine formula for distance in miles.

### get_nearby_events
```sql
get_nearby_events(user_lat, user_lon, radius_miles, limit) RETURNS TABLE
```
Spatial query for events within radius.

### update_updated_at_column
```sql
update_updated_at_column() RETURNS TRIGGER
```
Auto-update timestamps on row modification.

### update_event_counters
```sql
update_event_counters() RETURNS TRIGGER
```
Maintain view_count and rsvp_count on events.

## Sample Data

**Seed script includes:**
- 10 realistic Austin venues with accurate GPS coordinates
- 50 diverse events across 9 categories
- Next 30 days of event dates
- Mix of free and paid events ($0-$89.99)
- Mock embedding vectors (1536 dimensions)

**Categories covered:**
- Music (live performances, concerts)
- Food (taco fest, BBQ competition, food trucks)
- Sports (basketball, 5K run)
- Fitness (yoga, cycling, paddleboard)
- Arts (galleries, street art, film)
- Nightlife (dancing, comedy, karaoke)
- Community (farmers markets, block parties)
- Education (workshops, meetups, classes)

## TypeScript Usage

### Basic Setup

```typescript
import { initSupabase, getSupabase } from '@/lib/database';

// Initialize once at app startup
initSupabase(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Use anywhere
const client = getSupabase();
```

### Query Examples

```typescript
import {
  listEvents,
  getNearbyEvents,
  searchEvents,
  createEvent,
  trackInteraction,
  EventCategory
} from '@/lib/database';

// Get music events
const { data, count } = await listEvents(
  { category: EventCategory.MUSIC },
  { limit: 20, offset: 0 }
);

// Find events near user
const nearby = await getNearbyEvents({
  user_lat: 30.2672,
  user_lon: -97.7431,
  radius_miles: 10
});

// Track user viewing event
await trackInteraction({
  user_id: userId,
  event_id: eventId,
  interaction_type: 'view',
  metadata: { source: 'search' }
});
```

## Performance Benchmarks

### Expected Query Times (on Supabase Free Tier)

- **Get event by ID**: < 10ms
- **List events (20 items)**: < 50ms
- **Nearby events (10 mile radius)**: < 100ms
- **Full-text search**: < 80ms
- **Vector similarity (10 results)**: < 150ms

### Optimization Tips

1. **Use indexed columns in WHERE clauses**
2. **Limit result sets** - Always use pagination
3. **Select only needed columns** - Avoid `SELECT *`
4. **Use prepared statements** - Reuse query plans
5. **Batch operations** - Group inserts/updates

## Common Queries

### Find Tonight's Events
```typescript
const tonight = new Date();
tonight.setHours(18, 0, 0, 0);
const midnight = new Date(tonight);
midnight.setHours(23, 59, 59, 999);

const events = await listEvents({
  start_date: tonight,
  end_date: midnight
});
```

### Get User's Upcoming RSVPs
```typescript
const interactions = await getUserInteractions(
  userId,
  'rsvp'
);
```

### Search Music Events Near Me
```typescript
const results = await searchEvents('live music', { limit: 10 });
```

## Environment Variables

```bash
# Public (client-side safe)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI (for generating embeddings)
OPENAI_API_KEY=sk-xxx...
```

## Security Best Practices

1. **Never expose service role key** - Server-side only
2. **Validate user input** - Use TypeScript types
3. **Use RLS policies** - Don't bypass with service key unnecessarily
4. **Sanitize search queries** - Prevent injection
5. **Rate limit API calls** - Prevent abuse
6. **Audit user actions** - Track via interactions table

## Testing RLS Policies

```sql
-- Test as anonymous user
SET ROLE anon;
SELECT * FROM events WHERE status = 'published'; -- Should work
SELECT * FROM events WHERE status = 'draft'; -- Should return empty

-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub TO 'user-uuid';
SELECT * FROM profiles WHERE id = 'user-uuid'; -- Should work
UPDATE profiles SET bio = 'Test' WHERE id = 'other-user-uuid'; -- Should fail

-- Reset
RESET ROLE;
```

## Troubleshooting

### Can't find PostGIS extension
**Solution**: Enable in Supabase Dashboard → Database → Extensions

### Vector index build fails
**Solution**: Ensure all embeddings are exactly 1536 dimensions

### RLS blocks legitimate queries
**Solution**: Check policy with `EXPLAIN` to see which policy applies

### Slow spatial queries
**Solution**: Verify GIST index exists with `\d+ venues`

### Full-text search returns no results
**Solution**: Check tsvector configuration and query syntax

## Migration Checklist

- [ ] Supabase project created
- [ ] Extensions enabled (postgis, vector, uuid-ossp)
- [ ] Migration 001 executed successfully
- [ ] Migration 002 executed successfully
- [ ] Migration 003 executed (if dev environment)
- [ ] RLS verified with test queries
- [ ] Spatial queries working
- [ ] Full-text search working
- [ ] TypeScript types imported
- [ ] Environment variables configured
- [ ] Sample query tested

## Next Steps

1. **Generate Real Embeddings**: Integrate OpenAI API
2. **Build Recommendation Engine**: Use vector similarity
3. **Add Analytics**: Track popular events, search terms
4. **Implement Caching**: Redis for frequent queries
5. **Set up Webhooks**: Real-time notifications
6. **Create Admin Dashboard**: Moderate events and users

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostGIS Manual**: https://postgis.net/docs/
- **pgvector Guide**: https://github.com/pgvector/pgvector
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## Version Log

**Version:** 1.0.0
**Date:** 2025-10-02
**Author:** Backend API Developer Agent
**Changes:** Initial database documentation package
