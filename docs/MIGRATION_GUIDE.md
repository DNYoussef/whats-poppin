# Migration Guide - What's Poppin! Database

## Prerequisites

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Database Access**: Note your project's database credentials
3. **SQL Editor**: Access via Supabase Dashboard → SQL Editor

## Migration Steps

### Step 1: Enable Extensions

Before running migrations, ensure required PostgreSQL extensions are available.

**Via Supabase Dashboard:**
1. Navigate to **Database** → **Extensions**
2. Enable the following extensions:
   - `uuid-ossp` (should be enabled by default)
   - `postgis` (search for "postgis")
   - `vector` (search for "pgvector")

**Verification Query:**
```sql
SELECT * FROM pg_extension
WHERE extname IN ('uuid-ossp', 'postgis', 'vector');
```

### Step 2: Run Initial Schema Migration

**File:** `src/database/migrations/001_initial_schema.sql`

**What it does:**
- Creates all tables (profiles, venues, events, interactions, recommendations)
- Sets up PostGIS spatial indexes
- Configures pgvector indexes for AI embeddings
- Creates helper functions (distance calculation, nearby events)
- Sets up triggers for automatic timestamps

**Instructions:**
1. Open Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `001_initial_schema.sql`
4. Paste into SQL editor
5. Click **Run** or press `Ctrl+Enter`

**Expected Output:**
```
Success. No rows returned
```

**Verify Tables Created:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- `event_recommendations`
- `events`
- `profiles`
- `user_event_interactions`
- `venues`

### Step 3: Enable Row-Level Security

**File:** `src/database/migrations/002_enable_rls.sql`

**What it does:**
- Enables RLS on all tables
- Creates security policies for data access control
- Ensures users can only access appropriate data
- Sets up helper functions for role checking

**Instructions:**
1. Open new SQL query in Supabase Dashboard
2. Copy entire contents of `002_enable_rls.sql`
3. Paste and run

**Expected Output:**
```
Success. No rows returned
```

**Verify RLS Enabled:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rowsecurity = true`

### Step 4: Seed Sample Data (Optional - Development Only)

**File:** `src/database/migrations/003_seed_data.sql`

**⚠️ WARNING:** Only run this in development/staging environments, NOT production!

**What it does:**
- Inserts 10 sample venues in Austin, TX
- Creates 50 diverse events across categories
- Generates mock embedding vectors
- Provides realistic test data

**Instructions:**
1. Open new SQL query in Supabase Dashboard
2. Copy entire contents of `003_seed_data.sql`
3. Paste and run

**Expected Output:**
```
Success. 60 rows affected
(10 venues + 50 events)
```

**Verify Data:**
```sql
-- Count venues
SELECT COUNT(*) FROM venues;
-- Expected: 10

-- Count events
SELECT COUNT(*) FROM events;
-- Expected: 50

-- Check event distribution
SELECT category, COUNT(*) as count
FROM events
GROUP BY category
ORDER BY count DESC;
```

### Step 5: Test Functionality

Run these queries to verify everything is working:

#### Test Spatial Query
```sql
-- Find events near downtown Austin
SELECT * FROM get_nearby_events(
    30.2672,  -- latitude
    -97.7431, -- longitude
    25,       -- radius in miles
    10        -- limit
);
```

#### Test Full-Text Search
```sql
-- Search for music events
SELECT id, title, category
FROM events
WHERE to_tsvector('english', title || ' ' || description)
      @@ to_tsquery('english', 'music')
AND status = 'published'
LIMIT 5;
```

#### Test Vector Similarity (if embeddings exist)
```sql
-- Find similar events to event #1
SELECT
    e1.title AS source_event,
    e2.title AS similar_event,
    1 - (e1.embedding <=> e2.embedding) AS similarity
FROM events e1
CROSS JOIN events e2
WHERE e1.id = (SELECT id FROM events LIMIT 1)
AND e2.id != e1.id
AND e1.embedding IS NOT NULL
AND e2.embedding IS NOT NULL
ORDER BY e1.embedding <=> e2.embedding
LIMIT 5;
```

#### Test RLS Policies
```sql
-- This should work (public can view published events)
SET ROLE anon;
SELECT COUNT(*) FROM events WHERE status = 'published';

-- This should return 0 (anon cannot see drafts)
SELECT COUNT(*) FROM events WHERE status = 'draft';
```

## Rollback Procedure

Each migration file includes commented rollback scripts at the bottom.

### Rollback Order (reverse of migration order)

**1. Remove Seed Data:**
```sql
DELETE FROM user_event_interactions;
DELETE FROM event_recommendations;
DELETE FROM events;
DELETE FROM venues;
DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);
```

**2. Disable RLS:**
```sql
-- See rollback section in 002_enable_rls.sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_recommendations DISABLE ROW LEVEL SECURITY;

-- Drop all policies (see file for complete list)
```

**3. Drop Schema:**
```sql
-- See rollback section in 001_initial_schema.sql
DROP TABLE IF EXISTS event_recommendations CASCADE;
DROP TABLE IF EXISTS user_event_interactions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP FUNCTION IF EXISTS calculate_distance;
DROP FUNCTION IF EXISTS get_nearby_events;
DROP FUNCTION IF EXISTS update_updated_at_column;
DROP FUNCTION IF EXISTS update_event_counters;
```

## Common Issues and Solutions

### Issue: Extensions Not Available

**Error:**
```
ERROR: extension "postgis" is not available
```

**Solution:**
1. Go to Database → Extensions in Supabase Dashboard
2. Search for "postgis" or "vector"
3. Click to enable
4. Wait 30 seconds, then retry migration

### Issue: RLS Blocks Inserts

**Error:**
```
ERROR: new row violates row-level security policy
```

**Solution:**
Ensure you're authenticated when inserting data:
```sql
-- For testing, you can temporarily use service role key
-- or disable RLS on specific table
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- (Remember to re-enable after testing!)
```

### Issue: Vector Index Build Fails

**Error:**
```
ERROR: vector dimension mismatch
```

**Solution:**
Ensure all embeddings are exactly 1536 dimensions (OpenAI text-embedding-3-small):
```sql
-- Check embedding dimensions
SELECT id, array_length(embedding::float[], 1) as dims
FROM events
WHERE embedding IS NOT NULL;

-- Fix if needed: remove invalid embeddings
UPDATE events SET embedding = NULL
WHERE array_length(embedding::float[], 1) != 1536;
```

## Post-Migration Checklist

- [ ] All 5 tables created
- [ ] All indexes created successfully
- [ ] RLS enabled on all tables
- [ ] Helper functions working (test with SELECT)
- [ ] Sample data loaded (if running seed script)
- [ ] Spatial queries return results
- [ ] Full-text search working
- [ ] TypeScript types match schema

## Next Steps

1. **Set up TypeScript client**: Use the types in `src/types/database.types.ts`
2. **Configure environment variables**: Add Supabase URL and anon key
3. **Test API endpoints**: Use helper functions from `src/lib/database.ts`
4. **Generate embeddings**: Integrate OpenAI API to create real embeddings
5. **Build recommendation engine**: Use vector similarity for personalized suggestions

## Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For server-side only!
OPENAI_API_KEY=your-openai-key  # For generating embeddings
```

## Version Log

**Version:** 1.0.0
**Date:** 2025-10-02
**Author:** Backend API Developer Agent
**Changes:** Initial migration guide documentation
