# Sample Queries - What's Poppin! Database

This document contains example SQL queries and TypeScript code for common operations.

## Table of Contents

1. [Event Queries](#event-queries)
2. [Spatial Queries](#spatial-queries)
3. [Search Queries](#search-queries)
4. [User Interactions](#user-interactions)
5. [Recommendations](#recommendations)
6. [TypeScript Examples](#typescript-examples)

## Event Queries

### Get All Published Events

```sql
SELECT
    e.id,
    e.title,
    e.description,
    e.start_time,
    e.category,
    e.price,
    v.name AS venue_name,
    v.address,
    p.username AS organizer_username
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
LEFT JOIN profiles p ON e.organizer_id = p.id
WHERE e.status = 'published'
AND e.start_time > NOW()
ORDER BY e.start_time ASC
LIMIT 20;
```

### Get Events by Category

```sql
SELECT
    id,
    title,
    start_time,
    price,
    rsvp_count
FROM events
WHERE category = 'music'
AND status = 'published'
AND start_time BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY start_time ASC;
```

### Get Free Events This Weekend

```sql
SELECT
    e.title,
    e.start_time,
    v.name AS venue_name,
    e.category
FROM events e
JOIN venues v ON e.venue_id = v.id
WHERE e.price = 0.00
AND e.status = 'published'
AND EXTRACT(DOW FROM e.start_time) IN (0, 6)  -- Sunday=0, Saturday=6
AND e.start_time > NOW()
ORDER BY e.start_time;
```

### Get Most Popular Events

```sql
SELECT
    e.title,
    e.start_time,
    e.rsvp_count,
    e.view_count,
    v.name AS venue_name
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
WHERE e.status = 'published'
AND e.start_time > NOW()
ORDER BY e.rsvp_count DESC, e.view_count DESC
LIMIT 10;
```

## Spatial Queries

### Find Events Within 10 Miles

```sql
-- Using the helper function
SELECT * FROM get_nearby_events(
    30.2672,  -- Downtown Austin latitude
    -97.7431, -- Downtown Austin longitude
    10,       -- 10 miles radius
    20        -- limit to 20 results
);
```

### Manual Spatial Query

```sql
SELECT
    e.id,
    e.title,
    v.name AS venue_name,
    ST_Distance(
        v.location,
        ST_GeographyFromText('SRID=4326;POINT(-97.7431 30.2672)')
    ) / 1609.34 AS distance_miles
FROM events e
JOIN venues v ON e.venue_id = v.id
WHERE e.status = 'published'
AND e.start_time > NOW()
AND ST_DWithin(
    v.location,
    ST_GeographyFromText('SRID=4326;POINT(-97.7431 30.2672)'),
    16093.4  -- 10 miles in meters
)
ORDER BY distance_miles ASC;
```

### Find Venues Near User Location

```sql
SELECT
    name,
    address,
    category,
    ST_Distance(
        location,
        ST_GeographyFromText('SRID=4326;POINT(-97.7500 30.2700)')
    ) / 1609.34 AS distance_miles
FROM venues
WHERE ST_DWithin(
    location,
    ST_GeographyFromText('SRID=4326;POINT(-97.7500 30.2700)'),
    8046.72  -- 5 miles in meters
)
ORDER BY distance_miles;
```

### Events at Outdoor Venues in Radius

```sql
SELECT
    e.title,
    e.start_time,
    v.name AS venue_name,
    ST_Distance(
        v.location,
        ST_GeographyFromText('SRID=4326;POINT(-97.7431 30.2672)')
    ) / 1609.34 AS distance_miles
FROM events e
JOIN venues v ON e.venue_id = v.id
WHERE e.status = 'published'
AND 'outdoor' = ANY(v.category)
AND ST_DWithin(
    v.location,
    ST_GeographyFromText('SRID=4326;POINT(-97.7431 30.2672)'),
    16093.4
)
AND e.start_time > NOW()
ORDER BY distance_miles;
```

## Search Queries

### Full-Text Search Events

```sql
SELECT
    id,
    title,
    description,
    category,
    ts_rank(
        to_tsvector('english', title || ' ' || description),
        to_tsquery('english', 'live & music')
    ) AS rank
FROM events
WHERE status = 'published'
AND to_tsvector('english', title || ' ' || description)
    @@ to_tsquery('english', 'live & music')
ORDER BY rank DESC
LIMIT 20;
```

### Search by Tags

```sql
SELECT
    title,
    tags,
    category,
    start_time
FROM events
WHERE status = 'published'
AND tags @> ARRAY['live music', 'indie']  -- Contains all these tags
AND start_time > NOW()
ORDER BY start_time;
```

### Search Venues by Name

```sql
SELECT
    id,
    name,
    address,
    category,
    ts_rank(
        to_tsvector('english', name || ' ' || COALESCE(description, '')),
        to_tsquery('english', 'moody')
    ) AS rank
FROM venues
WHERE to_tsvector('english', name || ' ' || COALESCE(description, ''))
      @@ to_tsquery('english', 'moody')
ORDER BY rank DESC;
```

### Combined Search and Filter

```sql
SELECT
    e.title,
    e.category,
    e.price,
    e.start_time,
    v.name AS venue_name
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
WHERE e.status = 'published'
AND e.category IN ('music', 'nightlife')
AND e.price BETWEEN 0 AND 30
AND e.start_time BETWEEN NOW() AND NOW() + INTERVAL '14 days'
AND to_tsvector('english', e.title || ' ' || e.description)
    @@ to_tsquery('english', 'rock | punk | indie')
ORDER BY e.start_time;
```

## User Interactions

### Track Event View

```sql
INSERT INTO user_event_interactions (user_id, event_id, interaction_type, metadata)
VALUES (
    'auth-user-uuid',
    'event-uuid',
    'view',
    '{"device": "mobile", "source": "search"}'::jsonb
)
ON CONFLICT (user_id, event_id, interaction_type) DO NOTHING;
```

### User's Saved Events

```sql
SELECT
    e.id,
    e.title,
    e.start_time,
    e.category,
    v.name AS venue_name,
    i.created_at AS saved_at
FROM user_event_interactions i
JOIN events e ON i.event_id = e.id
LEFT JOIN venues v ON e.venue_id = v.id
WHERE i.user_id = 'auth-user-uuid'
AND i.interaction_type = 'save'
AND e.status = 'published'
ORDER BY i.created_at DESC;
```

### User's RSVPs

```sql
SELECT
    e.id,
    e.title,
    e.start_time,
    e.end_time,
    v.name AS venue_name,
    v.address
FROM user_event_interactions i
JOIN events e ON i.event_id = e.id
JOIN venues v ON e.venue_id = v.id
WHERE i.user_id = 'auth-user-uuid'
AND i.interaction_type = 'rsvp'
AND e.start_time > NOW()
ORDER BY e.start_time;
```

### User Activity Summary

```sql
SELECT
    interaction_type,
    COUNT(*) AS count
FROM user_event_interactions
WHERE user_id = 'auth-user-uuid'
GROUP BY interaction_type
ORDER BY count DESC;
```

### Events User Hasn't Interacted With

```sql
SELECT
    e.id,
    e.title,
    e.start_time,
    e.category
FROM events e
WHERE e.status = 'published'
AND e.start_time > NOW()
AND NOT EXISTS (
    SELECT 1
    FROM user_event_interactions i
    WHERE i.event_id = e.id
    AND i.user_id = 'auth-user-uuid'
    AND i.interaction_type IN ('view', 'save', 'rsvp')
)
ORDER BY e.start_time
LIMIT 20;
```

## Recommendations

### Get User Recommendations

```sql
SELECT
    r.score,
    r.reason,
    r.algorithm,
    e.title,
    e.start_time,
    e.category,
    v.name AS venue_name
FROM event_recommendations r
JOIN events e ON r.event_id = e.id
LEFT JOIN venues v ON e.venue_id = v.id
WHERE r.user_id = 'auth-user-uuid'
AND r.expires_at > NOW()
AND e.status = 'published'
AND e.start_time > NOW()
ORDER BY r.score DESC
LIMIT 10;
```

### Vector Similarity Search

```sql
-- Find events similar to a specific event
WITH target_event AS (
    SELECT embedding
    FROM events
    WHERE id = 'target-event-uuid'
)
SELECT
    e.id,
    e.title,
    e.category,
    1 - (e.embedding <=> (SELECT embedding FROM target_event)) AS similarity
FROM events e
WHERE e.id != 'target-event-uuid'
AND e.status = 'published'
AND e.start_time > NOW()
AND e.embedding IS NOT NULL
ORDER BY e.embedding <=> (SELECT embedding FROM target_event)
LIMIT 10;
```

### Trending Events (Last 7 Days)

```sql
SELECT
    e.id,
    e.title,
    e.category,
    e.start_time,
    COUNT(DISTINCT CASE WHEN i.interaction_type = 'view' THEN i.user_id END) AS unique_views,
    COUNT(DISTINCT CASE WHEN i.interaction_type = 'rsvp' THEN i.user_id END) AS unique_rsvps,
    COUNT(DISTINCT i.user_id) AS total_interactions
FROM events e
LEFT JOIN user_event_interactions i ON e.id = i.event_id
WHERE e.status = 'published'
AND e.start_time > NOW()
AND i.created_at > NOW() - INTERVAL '7 days'
GROUP BY e.id, e.title, e.category, e.start_time
ORDER BY total_interactions DESC, unique_rsvps DESC
LIMIT 20;
```

### Collaborative Filtering - Users Who Liked This Also Liked

```sql
-- Find events liked by users who liked a specific event
WITH users_who_liked AS (
    SELECT DISTINCT user_id
    FROM user_event_interactions
    WHERE event_id = 'target-event-uuid'
    AND interaction_type IN ('save', 'rsvp')
)
SELECT
    e.id,
    e.title,
    e.category,
    COUNT(DISTINCT i.user_id) AS common_users
FROM user_event_interactions i
JOIN events e ON i.event_id = e.id
WHERE i.user_id IN (SELECT user_id FROM users_who_liked)
AND i.event_id != 'target-event-uuid'
AND i.interaction_type IN ('save', 'rsvp')
AND e.status = 'published'
AND e.start_time > NOW()
GROUP BY e.id, e.title, e.category
ORDER BY common_users DESC
LIMIT 10;
```

## TypeScript Examples

### Initialize Supabase Client

```typescript
import { initSupabase } from '@/lib/database';

// In your app initialization
const supabase = initSupabase(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Get Event by ID

```typescript
import { getEventById } from '@/lib/database';

async function fetchEvent(eventId: string) {
  try {
    const event = await getEventById(eventId);
    console.log(event.title);
    console.log(event.venue?.name);
    console.log(event.organizer?.username);
  } catch (error) {
    console.error('Error fetching event:', error);
  }
}
```

### List Events with Filters

```typescript
import { listEvents, EventCategory } from '@/lib/database';

async function fetchMusicEvents() {
  const result = await listEvents(
    {
      category: EventCategory.MUSIC,
      min_price: 0,
      max_price: 50,
      start_date: new Date(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    { limit: 20, offset: 0 }
  );

  console.log(`Found ${result.count} total events`);
  console.log(`Has more: ${result.has_more}`);

  result.data.forEach(event => {
    console.log(`${event.title} - $${event.price}`);
  });
}
```

### Find Nearby Events

```typescript
import { getNearbyEvents } from '@/lib/database';

async function fetchNearbyEvents(lat: number, lon: number) {
  const events = await getNearbyEvents({
    user_lat: lat,
    user_lon: lon,
    radius_miles: 15,
    result_limit: 30
  });

  events.forEach(event => {
    console.log(`${event.event_title} - ${event.distance_miles.toFixed(1)} miles away`);
  });
}
```

### Track User Interaction

```typescript
import { trackInteraction, InteractionType } from '@/lib/database';

async function saveEvent(userId: string, eventId: string) {
  await trackInteraction({
    user_id: userId,
    event_id: eventId,
    interaction_type: InteractionType.SAVE,
    metadata: {
      device: 'mobile',
      source: 'event-detail-page'
    }
  });
}
```

### Create New Event

```typescript
import { createEvent, EventCategory, EventStatus } from '@/lib/database';

async function createNewEvent(organizerId: string, venueId: string) {
  const event = await createEvent({
    title: 'Live Jazz Night',
    description: 'Smooth jazz with local musicians',
    venue_id: venueId,
    organizer_id: organizerId,
    start_time: new Date('2025-11-01T20:00:00').toISOString(),
    end_time: new Date('2025-11-01T23:00:00').toISOString(),
    category: EventCategory.MUSIC,
    tags: ['jazz', 'live music', 'local'],
    price: 15.00,
    status: EventStatus.PUBLISHED,
    embedding: null, // Generate with OpenAI later
    capacity: 100
  });

  console.log(`Created event: ${event.id}`);
}
```

### Search Events

```typescript
import { searchEvents } from '@/lib/database';

async function searchForEvents(query: string) {
  const result = await searchEvents(
    query,
    { limit: 20, offset: 0 }
  );

  console.log(`Found ${result.count} events matching "${query}"`);

  result.data.forEach(event => {
    console.log(`- ${event.title} (${event.category})`);
  });
}
```

## Version Log

**Version:** 1.0.0
**Date:** 2025-10-02
**Author:** Backend API Developer Agent
**Changes:** Initial sample queries documentation
