-- ============================================================================
-- What's Poppin! - Database Verification Queries
-- File: VERIFICATION_QUERIES.sql
-- Description: Run these queries to verify successful migration and test functionality
-- ============================================================================

-- ============================================================================
-- STEP 1: VERIFY EXTENSIONS
-- ============================================================================

SELECT
    extname AS extension_name,
    extversion AS version,
    CASE
        WHEN extname = 'uuid-ossp' THEN 'UUID generation'
        WHEN extname = 'postgis' THEN 'Spatial/geography types'
        WHEN extname = 'vector' THEN 'AI embeddings (pgvector)'
        ELSE 'Other'
    END AS purpose
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'postgis', 'vector')
ORDER BY extname;
-- Expected: 3 rows (all three extensions)

-- ============================================================================
-- STEP 2: VERIFY TABLES CREATED
-- ============================================================================

SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected tables: event_recommendations, events, profiles, user_event_interactions, venues

-- ============================================================================
-- STEP 3: VERIFY INDEXES
-- ============================================================================

SELECT
    tablename,
    indexname,
    CASE
        WHEN indexname LIKE '%_pkey' THEN 'Primary Key'
        WHEN indexname LIKE '%location%' THEN 'Spatial (GIST)'
        WHEN indexname LIKE '%embedding%' THEN 'Vector (IVFFlat)'
        WHEN indexname LIKE '%search%' THEN 'Full-Text (GIN)'
        ELSE 'B-Tree'
    END AS index_type
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
-- Expected: Multiple indexes per table

-- ============================================================================
-- STEP 4: VERIFY FUNCTIONS
-- ============================================================================

SELECT
    routine_name AS function_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'calculate_distance',
    'get_nearby_events',
    'update_updated_at_column',
    'update_event_counters',
    'is_event_organizer',
    'is_admin'
)
ORDER BY routine_name;
-- Expected: 6 functions

-- ============================================================================
-- STEP 5: VERIFY RLS ENABLED
-- ============================================================================

SELECT
    tablename,
    CASE
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: All tables should show ENABLED

-- ============================================================================
-- STEP 6: VERIFY POLICIES
-- ============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    cmd AS operation,
    qual AS using_expression,
    with_check AS check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Expected: Multiple policies per table

-- ============================================================================
-- STEP 7: VERIFY SEED DATA (if 003_seed_data.sql was run)
-- ============================================================================

-- Count venues
SELECT 'Venues' AS table_name, COUNT(*) AS row_count FROM venues
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'Interactions', COUNT(*) FROM user_event_interactions
UNION ALL
SELECT 'Recommendations', COUNT(*) FROM event_recommendations;
-- Expected: 10 venues, 50 events (if seed data loaded)

-- ============================================================================
-- STEP 8: TEST SPATIAL QUERIES
-- ============================================================================

-- Test 1: Get nearby events (Downtown Austin)
SELECT
    event_id,
    event_title,
    venue_name,
    ROUND(distance_miles::numeric, 2) AS distance_miles,
    start_time
FROM get_nearby_events(
    30.2672,  -- Downtown Austin latitude
    -97.7431, -- Downtown Austin longitude
    25,       -- 25 mile radius
    5         -- limit to 5 results
)
ORDER BY distance_miles;
-- Expected: Up to 5 events sorted by distance

-- Test 2: Calculate distance between two points
SELECT
    calculate_distance(30.2672, -97.7431, 30.2840, -97.7336) AS distance_miles,
    'Downtown to UT Campus' AS route;
-- Expected: ~1.2 miles

-- Test 3: Find venues within 5 miles of Zilker Park
SELECT
    name,
    address,
    ROUND(
        (ST_Distance(
            location,
            ST_GeographyFromText('SRID=4326;POINT(-97.7674 30.2672)')
        ) / 1609.34)::numeric,
        2
    ) AS distance_miles
FROM venues
WHERE ST_DWithin(
    location,
    ST_GeographyFromText('SRID=4326;POINT(-97.7674 30.2672)'),
    8046.72  -- 5 miles in meters
)
ORDER BY distance_miles
LIMIT 5;
-- Expected: Venues near Zilker Park

-- ============================================================================
-- STEP 9: TEST FULL-TEXT SEARCH
-- ============================================================================

-- Search events for "music"
SELECT
    id,
    title,
    category,
    ROUND(
        ts_rank(
            to_tsvector('english', title || ' ' || description),
            to_tsquery('english', 'music')
        )::numeric,
        4
    ) AS relevance_score
FROM events
WHERE status = 'published'
AND to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', 'music')
ORDER BY relevance_score DESC
LIMIT 5;
-- Expected: Events matching "music" sorted by relevance

-- Search venues for "park"
SELECT
    name,
    category,
    address
FROM venues
WHERE to_tsvector('english', name || ' ' || COALESCE(description, ''))
      @@ to_tsquery('english', 'park')
LIMIT 5;
-- Expected: Park venues

-- ============================================================================
-- STEP 10: TEST VECTOR SIMILARITY (if embeddings exist)
-- ============================================================================

-- Find similar events to the first event
WITH first_event AS (
    SELECT id, title, embedding
    FROM events
    WHERE embedding IS NOT NULL
    AND status = 'published'
    LIMIT 1
)
SELECT
    e.id,
    e.title,
    e.category,
    ROUND((1 - (e.embedding <=> f.embedding))::numeric, 4) AS similarity_score
FROM events e
CROSS JOIN first_event f
WHERE e.id != f.id
AND e.embedding IS NOT NULL
AND e.status = 'published'
ORDER BY e.embedding <=> f.embedding
LIMIT 5;
-- Expected: Similar events based on embedding cosine similarity

-- ============================================================================
-- STEP 11: TEST EVENT QUERIES
-- ============================================================================

-- Get all event categories with counts
SELECT
    category,
    COUNT(*) AS event_count,
    COUNT(*) FILTER (WHERE price = 0) AS free_events,
    ROUND(AVG(price)::numeric, 2) AS avg_price
FROM events
WHERE status = 'published'
GROUP BY category
ORDER BY event_count DESC;
-- Expected: Distribution of events by category

-- Get upcoming events (next 7 days)
SELECT
    title,
    category,
    start_time,
    price,
    status
FROM events
WHERE status = 'published'
AND start_time BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY start_time
LIMIT 10;
-- Expected: Events in the next week

-- Get most popular events by RSVP count
SELECT
    e.title,
    e.rsvp_count,
    e.view_count,
    v.name AS venue_name
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
WHERE e.status = 'published'
ORDER BY e.rsvp_count DESC, e.view_count DESC
LIMIT 5;
-- Expected: Top events by engagement

-- ============================================================================
-- STEP 12: TEST TRIGGERS
-- ============================================================================

-- Test updated_at trigger (requires a test update)
-- This is a manual test - run these queries to verify:
/*
-- Create a test event
INSERT INTO events (title, description, start_time, category, status)
VALUES ('Test Event', 'Testing triggers', NOW() + INTERVAL '1 day', 'other', 'draft')
RETURNING id, created_at, updated_at;
-- Note the updated_at timestamp

-- Wait a second, then update
SELECT pg_sleep(1);
UPDATE events
SET title = 'Updated Test Event'
WHERE title = 'Test Event'
RETURNING id, created_at, updated_at;
-- updated_at should be newer than created_at

-- Clean up
DELETE FROM events WHERE title = 'Updated Test Event';
*/

-- ============================================================================
-- STEP 13: TEST RLS POLICIES
-- ============================================================================

-- Test as anonymous user
SET ROLE anon;

-- Should work: view published events
SELECT COUNT(*) AS published_events_visible
FROM events
WHERE status = 'published';

-- Should return 0: cannot see draft events
SELECT COUNT(*) AS draft_events_visible
FROM events
WHERE status = 'draft';

-- Should work: view all venues
SELECT COUNT(*) AS venues_visible
FROM venues;

-- Reset role
RESET ROLE;

-- ============================================================================
-- STEP 14: PERFORMANCE ANALYSIS
-- ============================================================================

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
-- Expected: Indexes should show usage after queries

-- Check table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
-- Expected: Size information for all tables

-- ============================================================================
-- STEP 15: DATA QUALITY CHECKS
-- ============================================================================

-- Check for events with invalid dates
SELECT
    COUNT(*) AS events_with_invalid_dates
FROM events
WHERE end_time IS NOT NULL
AND end_time <= start_time;
-- Expected: 0

-- Check for events without venues
SELECT
    COUNT(*) AS events_without_venue
FROM events
WHERE venue_id IS NULL;
-- Expected: May have some, but most should have venues

-- Check for venues without coordinates
SELECT
    COUNT(*) AS venues_without_location
FROM venues
WHERE location IS NULL;
-- Expected: 0 (all venues must have location)

-- Check for events with embeddings
SELECT
    COUNT(*) AS total_events,
    COUNT(embedding) AS events_with_embeddings,
    ROUND(100.0 * COUNT(embedding) / NULLIF(COUNT(*), 0), 2) AS embedding_percentage
FROM events;
-- Expected: Percentage depends on whether embeddings were generated

-- ============================================================================
-- SUMMARY QUERY
-- ============================================================================

SELECT
    'Database Migration Verification Summary' AS summary,
    (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'postgis', 'vector')) AS extensions,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tables,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') AS functions,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') AS rls_policies,
    (SELECT COUNT(*) FROM venues) AS venue_count,
    (SELECT COUNT(*) FROM events) AS event_count;
-- Expected: Summary of all database objects

-- ============================================================================
-- VERSION LOG
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-10-02
-- Author: Backend API Developer Agent
-- Changes: Initial verification query suite
--   - Extension verification
--   - Table and index checks
--   - Function testing
--   - RLS policy verification
--   - Spatial query tests
--   - Full-text search tests
--   - Vector similarity tests
--   - Performance analysis
--   - Data quality checks
-- ============================================================================
