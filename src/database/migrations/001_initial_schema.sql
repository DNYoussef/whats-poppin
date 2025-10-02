-- ============================================================================
-- What's Poppin! - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Core tables, indexes, and functions for event discovery platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- PROFILES TABLE
-- Extends auth.users with additional user information
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location GEOGRAPHY(POINT, 4326) DEFAULT ST_GeographyFromText('SRID=4326;POINT(-97.7431 30.2672)'), -- Austin, TX
    preferences JSONB DEFAULT '{"categories": [], "interests": [], "max_distance_miles": 25}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON COLUMN profiles.location IS 'User location for proximity-based recommendations';
COMMENT ON COLUMN profiles.preferences IS 'User preferences: {"categories": ["music", "food"], "interests": ["live music"], "max_distance_miles": 25}';

-- ============================================================================
-- VENUES TABLE
-- Physical locations where events take place
-- ============================================================================

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Austin' NOT NULL,
    state TEXT DEFAULT 'TX' NOT NULL,
    zip_code TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    phone TEXT,
    website TEXT,
    category TEXT[] DEFAULT ARRAY[]::TEXT[],
    capacity INTEGER,
    amenities JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT venue_name_length CHECK (char_length(name) >= 2),
    CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity > 0)
);

COMMENT ON TABLE venues IS 'Event venues with spatial data';
COMMENT ON COLUMN venues.category IS 'Venue types: bar, restaurant, music_venue, theater, park, etc.';
COMMENT ON COLUMN venues.amenities IS 'Venue features: {"parking": true, "wheelchair_accessible": true, "outdoor_seating": false}';

-- ============================================================================
-- EVENTS TABLE
-- Core event information with vector embeddings
-- ============================================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    image_url TEXT,
    capacity INTEGER,
    price NUMERIC(10, 2) DEFAULT 0.00,
    ticket_url TEXT,
    status TEXT DEFAULT 'published' NOT NULL,
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small
    view_count INTEGER DEFAULT 0,
    rsvp_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT event_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    CONSTRAINT event_description_length CHECK (char_length(description) >= 10),
    CONSTRAINT valid_times CHECK (end_time IS NULL OR end_time > start_time),
    CONSTRAINT valid_category CHECK (category IN ('music', 'food', 'sports', 'arts', 'nightlife', 'community', 'education', 'fitness', 'other')),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    CONSTRAINT valid_price CHECK (price >= 0)
);

COMMENT ON TABLE events IS 'Events with vector embeddings for AI recommendations';
COMMENT ON COLUMN events.embedding IS 'OpenAI embeddings (1536 dimensions) for semantic similarity search';
COMMENT ON COLUMN events.price IS 'Ticket price in USD; 0.00 = free event';
COMMENT ON COLUMN events.status IS 'Event lifecycle: draft, published, cancelled, completed';

-- ============================================================================
-- USER_EVENT_INTERACTIONS TABLE
-- Track user engagement with events
-- ============================================================================

CREATE TABLE user_event_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT valid_interaction CHECK (interaction_type IN ('view', 'save', 'rsvp', 'attend', 'share')),
    UNIQUE(user_id, event_id, interaction_type)
);

COMMENT ON TABLE user_event_interactions IS 'User engagement tracking for recommendation engine';
COMMENT ON COLUMN user_event_interactions.metadata IS 'Additional context: {"device": "mobile", "source": "search"}';

-- ============================================================================
-- EVENT_RECOMMENDATIONS TABLE
-- AI-powered event recommendations
-- ============================================================================

CREATE TABLE event_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    score NUMERIC(5, 4) NOT NULL,
    reason TEXT,
    algorithm TEXT DEFAULT 'vector_similarity',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

    CONSTRAINT valid_score CHECK (score >= 0 AND score <= 1),
    CONSTRAINT valid_algorithm CHECK (algorithm IN ('vector_similarity', 'collaborative_filtering', 'proximity', 'trending'))
);

COMMENT ON TABLE event_recommendations IS 'Cached recommendations with explanations';
COMMENT ON COLUMN event_recommendations.score IS 'Recommendation confidence (0-1)';
COMMENT ON COLUMN event_recommendations.reason IS 'Human-readable explanation';

-- ============================================================================
-- INDEXES
-- Performance optimization for queries
-- ============================================================================

-- Spatial indexes (PostGIS)
CREATE INDEX idx_venues_location ON venues USING GIST(location);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);

-- Vector similarity search (pgvector)
CREATE INDEX idx_events_embedding ON events USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Time-based queries
CREATE INDEX idx_events_start_time ON events(start_time) WHERE status = 'published';
CREATE INDEX idx_events_end_time ON events(end_time) WHERE status = 'published';
CREATE INDEX idx_events_timerange ON events(start_time, end_time) WHERE status = 'published';

-- Category and filtering
CREATE INDEX idx_events_category ON events(category) WHERE status = 'published';
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_venues_category ON venues USING GIN(category);

-- Full-text search
CREATE INDEX idx_events_search ON events USING GIN(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
) WHERE status = 'published';

CREATE INDEX idx_venues_search ON venues USING GIN(
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);

-- User interactions
CREATE INDEX idx_interactions_user ON user_event_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_event ON user_event_interactions(event_id, interaction_type);

-- Recommendations
CREATE INDEX idx_recommendations_user ON event_recommendations(user_id, score DESC);
CREATE INDEX idx_recommendations_expires ON event_recommendations(expires_at);

-- ============================================================================
-- FUNCTIONS
-- Helper functions for calculations and triggers
-- ============================================================================

-- Calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    earth_radius CONSTANT DOUBLE PRECISION := 3958.8; -- miles
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);

    a := sin(dlat / 2) * sin(dlat / 2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dlon / 2) * sin(dlon / 2);

    c := 2 * atan2(sqrt(a), sqrt(1 - a));

    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_distance IS 'Calculate distance in miles using Haversine formula';

-- Get nearby events using spatial query
CREATE OR REPLACE FUNCTION get_nearby_events(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_miles INTEGER DEFAULT 25,
    result_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    event_id UUID,
    event_title TEXT,
    venue_name TEXT,
    distance_miles DOUBLE PRECISION,
    start_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.title,
        v.name,
        ST_Distance(
            v.location,
            ST_GeographyFromText('SRID=4326;POINT(' || user_lon || ' ' || user_lat || ')')
        ) / 1609.34 AS distance_miles,
        e.start_time
    FROM events e
    JOIN venues v ON e.venue_id = v.id
    WHERE
        e.status = 'published'
        AND e.start_time > NOW()
        AND ST_DWithin(
            v.location,
            ST_GeographyFromText('SRID=4326;POINT(' || user_lon || ' ' || user_lat || ')'),
            radius_miles * 1609.34 -- convert miles to meters
        )
    ORDER BY distance_miles ASC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_nearby_events IS 'Find events within specified radius';

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function to update updated_at timestamp';

-- Update event counters
CREATE OR REPLACE FUNCTION update_event_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.interaction_type = 'view' THEN
            UPDATE events SET view_count = view_count + 1
            WHERE id = NEW.event_id;
        ELSIF NEW.interaction_type = 'rsvp' THEN
            UPDATE events SET rsvp_count = rsvp_count + 1
            WHERE id = NEW.event_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.interaction_type = 'rsvp' THEN
            UPDATE events SET rsvp_count = GREATEST(rsvp_count - 1, 0)
            WHERE id = OLD.event_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_event_counters IS 'Update view_count and rsvp_count on events';

-- ============================================================================
-- TRIGGERS
-- Automated actions on data changes
-- ============================================================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_interaction_counters
    AFTER INSERT OR DELETE ON user_event_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_event_counters();

-- ============================================================================
-- ROLLBACK SCRIPT
-- Run this to undo the migration
-- ============================================================================

/*
-- Drop triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_event_interaction_counters ON user_event_interactions;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_distance;
DROP FUNCTION IF EXISTS get_nearby_events;
DROP FUNCTION IF EXISTS update_updated_at_column;
DROP FUNCTION IF EXISTS update_event_counters;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS event_recommendations CASCADE;
DROP TABLE IF EXISTS user_event_interactions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop extensions (only if not used elsewhere)
-- DROP EXTENSION IF EXISTS vector;
-- DROP EXTENSION IF EXISTS postgis;
-- DROP EXTENSION IF EXISTS "uuid-ossp";
*/

-- ============================================================================
-- VERSION LOG
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-10-02
-- Author: Backend API Developer Agent
-- Changes: Initial schema creation
--   - Created profiles, venues, events, user_event_interactions, event_recommendations tables
--   - Added PostGIS spatial indexes for location-based queries
--   - Added pgvector indexes for AI-powered recommendations
--   - Created helper functions for distance calculation and nearby events
--   - Implemented triggers for automatic timestamp updates
-- ============================================================================
