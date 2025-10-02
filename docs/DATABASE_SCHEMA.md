# What's Poppin! Database Schema

## Overview

This document provides a comprehensive overview of the Supabase database schema for the What's Poppin! event discovery platform.

## Schema Diagram (Text-Based)

```
┌─────────────────┐
│   auth.users    │
│   (Supabase)    │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│    profiles     │◄──────────────┐
│                 │               │
│ - id (PK, FK)   │               │
│ - username      │               │ organizer_id
│ - full_name     │               │
│ - avatar_url    │               │
│ - bio           │               │
│ - location      │               │
│ - preferences   │               │
└─────────┬───────┘               │
          │                       │
          │ user_id               │
          │                       │
          ▼                       │
┌──────────────────────┐    ┌─────────────────┐
│ user_event_          │    │     events      │
│ interactions         │    │                 │
│                      │    │ - id (PK)       │
│ - id (PK)            │    │ - title         │
│ - user_id (FK)       │◄───┤ - description   │
│ - event_id (FK)      │    │ - venue_id (FK) │
│ - interaction_type   │    │ - organizer_id  │──┘
│ - metadata           │    │ - start_time    │
└──────────────────────┘    │ - end_time      │
                            │ - category      │
┌──────────────────────┐    │ - tags          │
│ event_               │    │ - price         │
│ recommendations      │    │ - status        │
│                      │    │ - embedding     │
│ - id (PK)            │    │ - view_count    │
│ - user_id (FK)       │◄───┤ - rsvp_count    │
│ - event_id (FK)      │    └────────┬────────┘
│ - score              │             │
│ - reason             │             │ venue_id
│ - algorithm          │             │
└──────────────────────┘             ▼
                            ┌─────────────────┐
                            │     venues      │
                            │                 │
                            │ - id (PK)       │
                            │ - name          │
                            │ - description   │
                            │ - address       │
                            │ - city          │
                            │ - location      │
                            │ - category      │
                            │ - capacity      │
                            └─────────────────┘
```

## Tables

### profiles

Extends Supabase's `auth.users` table with additional user information.

**Columns:**
- `id` (UUID, PK, FK → auth.users) - User ID
- `username` (TEXT, UNIQUE) - Unique username (3-30 chars, alphanumeric + underscore)
- `full_name` (TEXT) - User's full name
- `avatar_url` (TEXT) - Profile picture URL
- `bio` (TEXT) - User biography
- `location` (GEOGRAPHY) - User's location (PostGIS Point)
- `preferences` (JSONB) - User preferences for recommendations
- `created_at` (TIMESTAMPTZ) - Account creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes:**
- `idx_profiles_location` - GIST index on location for spatial queries

**Preferences JSONB Structure:**
```json
{
  "categories": ["music", "food"],
  "interests": ["live music", "indie rock"],
  "max_distance_miles": 25,
  "role": "user"
}
```

### venues

Physical locations where events take place.

**Columns:**
- `id` (UUID, PK) - Venue ID
- `name` (TEXT) - Venue name
- `description` (TEXT) - Venue description
- `address` (TEXT) - Street address
- `city` (TEXT) - City (default: Austin)
- `state` (TEXT) - State (default: TX)
- `zip_code` (TEXT) - ZIP code
- `location` (GEOGRAPHY) - Venue coordinates (PostGIS Point)
- `phone` (TEXT) - Contact phone
- `website` (TEXT) - Venue website
- `category` (TEXT[]) - Array of venue types
- `capacity` (INTEGER) - Maximum capacity
- `amenities` (JSONB) - Venue features
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes:**
- `idx_venues_location` - GIST index on location
- `idx_venues_category` - GIN index on category array
- `idx_venues_search` - Full-text search on name and description

**Amenities JSONB Structure:**
```json
{
  "parking": true,
  "wheelchair_accessible": true,
  "outdoor_seating": false,
  "wifi": true
}
```

### events

Core event information with AI-powered embeddings.

**Columns:**
- `id` (UUID, PK) - Event ID
- `title` (TEXT) - Event title (3-200 chars)
- `description` (TEXT) - Event description (min 10 chars)
- `venue_id` (UUID, FK → venues) - Associated venue
- `organizer_id` (UUID, FK → profiles) - Event organizer
- `start_time` (TIMESTAMPTZ) - Event start time
- `end_time` (TIMESTAMPTZ) - Event end time
- `category` (TEXT) - Event category (enum)
- `tags` (TEXT[]) - Searchable tags
- `image_url` (TEXT) - Event banner/poster
- `capacity` (INTEGER) - Maximum attendees
- `price` (NUMERIC) - Ticket price (0.00 = free)
- `ticket_url` (TEXT) - Link to ticket purchase
- `status` (TEXT) - Event status (draft/published/cancelled/completed)
- `embedding` (VECTOR(1536)) - OpenAI embedding for AI recommendations
- `view_count` (INTEGER) - Number of views
- `rsvp_count` (INTEGER) - Number of RSVPs
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Categories:** music, food, sports, arts, nightlife, community, education, fitness, other

**Statuses:** draft, published, cancelled, completed

**Indexes:**
- `idx_events_embedding` - IVFFlat index for vector similarity (pgvector)
- `idx_events_start_time` - B-tree index on start_time (published only)
- `idx_events_category` - B-tree index on category (published only)
- `idx_events_search` - Full-text search on title and description

### user_event_interactions

Tracks user engagement with events for recommendation engine.

**Columns:**
- `id` (UUID, PK) - Interaction ID
- `user_id` (UUID, FK → profiles) - User who interacted
- `event_id` (UUID, FK → events) - Event interacted with
- `interaction_type` (TEXT) - Type of interaction (enum)
- `metadata` (JSONB) - Additional context
- `created_at` (TIMESTAMPTZ) - Interaction timestamp

**Interaction Types:** view, save, rsvp, attend, share

**Unique Constraint:** (user_id, event_id, interaction_type)

**Indexes:**
- `idx_interactions_user` - B-tree index on (user_id, created_at DESC)
- `idx_interactions_event` - B-tree index on (event_id, interaction_type)

### event_recommendations

AI-powered event recommendations for users.

**Columns:**
- `id` (UUID, PK) - Recommendation ID
- `user_id` (UUID, FK → profiles) - User receiving recommendation
- `event_id` (UUID, FK → events) - Recommended event
- `score` (NUMERIC) - Recommendation confidence (0-1)
- `reason` (TEXT) - Human-readable explanation
- `algorithm` (TEXT) - Algorithm used
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `expires_at` (TIMESTAMPTZ) - Expiration (default: 7 days)

**Algorithms:** vector_similarity, collaborative_filtering, proximity, trending

**Indexes:**
- `idx_recommendations_user` - B-tree index on (user_id, score DESC)
- `idx_recommendations_expires` - B-tree index on expires_at

## Functions

### calculate_distance(lat1, lon1, lat2, lon2)

Calculates distance in miles between two coordinates using the Haversine formula.

**Parameters:**
- `lat1` (DOUBLE PRECISION) - First latitude
- `lon1` (DOUBLE PRECISION) - First longitude
- `lat2` (DOUBLE PRECISION) - Second latitude
- `lon2` (DOUBLE PRECISION) - Second longitude

**Returns:** DOUBLE PRECISION (distance in miles)

### get_nearby_events(user_lat, user_lon, radius_miles, result_limit)

Finds published events within specified radius using spatial queries.

**Parameters:**
- `user_lat` (DOUBLE PRECISION) - User latitude
- `user_lon` (DOUBLE PRECISION) - User longitude
- `radius_miles` (INTEGER, default: 25) - Search radius
- `result_limit` (INTEGER, default: 50) - Max results

**Returns:** TABLE (event_id, event_title, venue_name, distance_miles, start_time)

### update_updated_at_column()

Trigger function that automatically updates the `updated_at` timestamp.

**Usage:** Attached to BEFORE UPDATE triggers on profiles, venues, events

### update_event_counters()

Trigger function that updates view_count and rsvp_count on events table.

**Usage:** Attached to AFTER INSERT/DELETE triggers on user_event_interactions

## Row-Level Security (RLS) Policies

### profiles

- **SELECT**: Public read access (anyone can view)
- **INSERT**: Users can create their own profile
- **UPDATE**: Users can only update their own profile
- **DELETE**: Users can delete their own profile

### venues

- **SELECT**: Public read access (anyone can view)
- **INSERT**: Authenticated users can create venues
- **UPDATE**: Users who organized events at the venue can update it

### events

- **SELECT**: Public can view published events; organizers can view their drafts
- **INSERT**: Authenticated users can create events (must set organizer_id to self)
- **UPDATE**: Organizers can update their own events
- **DELETE**: Organizers can delete their own events

### user_event_interactions

- **SELECT**: Users can view only their own interactions
- **INSERT**: Users can create interactions for themselves
- **UPDATE**: Users can update their own interactions
- **DELETE**: Users can delete their own interactions

### event_recommendations

- **SELECT**: Users can view only their own recommendations
- **INSERT**: Service role can insert recommendations
- **DELETE**: Users can delete their own; system can delete expired

## Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "postgis";     -- Spatial/geography types
CREATE EXTENSION IF NOT EXISTS "vector";      -- pgvector for embeddings
```

## Performance Considerations

1. **Spatial Queries**: PostGIS GIST indexes enable fast proximity searches
2. **Vector Search**: IVFFlat index optimizes similarity search (configure lists parameter based on dataset size)
3. **Full-Text Search**: GIN indexes on tsvector for fast text search
4. **Partial Indexes**: Several indexes only cover `status = 'published'` to reduce size

## Migration Order

1. Run `001_initial_schema.sql` - Creates tables, indexes, functions
2. Run `002_enable_rls.sql` - Enables RLS and creates policies
3. Run `003_seed_data.sql` - (Optional) Loads sample data for development

## Version Log

**Version:** 1.0.0
**Date:** 2025-10-02
**Author:** Backend API Developer Agent
**Changes:** Initial schema documentation
