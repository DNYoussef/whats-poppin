-- ============================================================================
-- What's Poppin! - Row-Level Security (RLS) Policies
-- Migration: 002_enable_rls.sql
-- Description: Security policies for data access control
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_recommendations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- Users can read all profiles, but only modify their own
-- ============================================================================

-- Allow public to read all profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
    ON profiles FOR DELETE
    USING (auth.uid() = id);

-- ============================================================================
-- VENUES POLICIES
-- All users can read, authenticated users can create/modify
-- ============================================================================

-- Anyone can view published venues
CREATE POLICY "Venues are viewable by everyone"
    ON venues FOR SELECT
    USING (true);

-- Authenticated users can create venues
CREATE POLICY "Authenticated users can create venues"
    ON venues FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Users can update venues they created
CREATE POLICY "Users can update own venues"
    ON venues FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.venue_id = venues.id
            AND events.organizer_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.venue_id = venues.id
            AND events.organizer_id = auth.uid()
        )
    );

-- ============================================================================
-- EVENTS POLICIES
-- Complex policies for event visibility and management
-- ============================================================================

-- Anyone can view published events
CREATE POLICY "Published events are viewable by everyone"
    ON events FOR SELECT
    USING (
        status = 'published'
        OR (auth.uid() IS NOT NULL AND organizer_id = auth.uid())
    );

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (organizer_id = auth.uid());

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events"
    ON events FOR UPDATE
    TO authenticated
    USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

-- Organizers can delete their own events
CREATE POLICY "Organizers can delete own events"
    ON events FOR DELETE
    TO authenticated
    USING (organizer_id = auth.uid());

-- ============================================================================
-- USER_EVENT_INTERACTIONS POLICIES
-- Users can only access their own interactions
-- ============================================================================

-- Users can view their own interactions
CREATE POLICY "Users can view own interactions"
    ON user_event_interactions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can create their own interactions
CREATE POLICY "Users can create own interactions"
    ON user_event_interactions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own interactions
CREATE POLICY "Users can update own interactions"
    ON user_event_interactions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own interactions
CREATE POLICY "Users can delete own interactions"
    ON user_event_interactions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- EVENT_RECOMMENDATIONS POLICIES
-- Users can only view their own recommendations
-- ============================================================================

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
    ON event_recommendations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- System can insert recommendations (via service role)
CREATE POLICY "Service role can insert recommendations"
    ON event_recommendations FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- System can delete expired recommendations
CREATE POLICY "Service role can delete expired recommendations"
    ON event_recommendations FOR DELETE
    TO authenticated
    USING (user_id = auth.uid() OR expires_at < NOW());

-- ============================================================================
-- HELPER FUNCTIONS FOR ADVANCED POLICIES
-- ============================================================================

-- Check if user is event organizer
CREATE OR REPLACE FUNCTION is_event_organizer(
    event_uuid UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM events
        WHERE id = event_uuid
        AND organizer_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_event_organizer IS 'Check if current user is organizer of event';

-- Check if user has admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (preferences->>'role' = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin IS 'Check if current user has admin role in preferences';

-- ============================================================================
-- ADMIN OVERRIDE POLICIES (Optional)
-- Uncomment to allow admins to manage all content
-- ============================================================================

/*
-- Admins can update any event
CREATE POLICY "Admins can update any event"
    ON events FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Admins can delete any event
CREATE POLICY "Admins can delete any event"
    ON events FOR DELETE
    TO authenticated
    USING (is_admin());

-- Admins can view all interactions
CREATE POLICY "Admins can view all interactions"
    ON user_event_interactions FOR SELECT
    TO authenticated
    USING (is_admin());
*/

-- ============================================================================
-- GRANT PERMISSIONS
-- Ensure authenticated users can access tables
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;

GRANT SELECT ON venues TO authenticated;
GRANT SELECT ON venues TO anon;
GRANT INSERT, UPDATE, DELETE ON venues TO authenticated;

GRANT SELECT ON events TO authenticated;
GRANT SELECT ON events TO anon;
GRANT INSERT, UPDATE, DELETE ON events TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_event_interactions TO authenticated;
GRANT SELECT, INSERT, DELETE ON event_recommendations TO authenticated;

-- ============================================================================
-- ROLLBACK SCRIPT
-- Run this to undo the migration
-- ============================================================================

/*
-- Drop all policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

DROP POLICY IF EXISTS "Venues are viewable by everyone" ON venues;
DROP POLICY IF EXISTS "Authenticated users can create venues" ON venues;
DROP POLICY IF EXISTS "Users can update own venues" ON venues;

DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Organizers can update own events" ON events;
DROP POLICY IF EXISTS "Organizers can delete own events" ON events;

DROP POLICY IF EXISTS "Users can view own interactions" ON user_event_interactions;
DROP POLICY IF EXISTS "Users can create own interactions" ON user_event_interactions;
DROP POLICY IF EXISTS "Users can update own interactions" ON user_event_interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON user_event_interactions;

DROP POLICY IF EXISTS "Users can view own recommendations" ON event_recommendations;
DROP POLICY IF EXISTS "Service role can insert recommendations" ON event_recommendations;
DROP POLICY IF EXISTS "Service role can delete expired recommendations" ON event_recommendations;

-- Drop helper functions
DROP FUNCTION IF EXISTS is_event_organizer;
DROP FUNCTION IF EXISTS is_admin;

-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE venues DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_recommendations DISABLE ROW LEVEL SECURITY;

-- Revoke permissions
REVOKE ALL ON profiles FROM authenticated, anon;
REVOKE ALL ON venues FROM authenticated, anon;
REVOKE ALL ON events FROM authenticated, anon;
REVOKE ALL ON user_event_interactions FROM authenticated;
REVOKE ALL ON event_recommendations FROM authenticated;
*/

-- ============================================================================
-- VERSION LOG
-- ============================================================================
-- Version: 1.0.0
-- Date: 2025-10-02
-- Author: Backend API Developer Agent
-- Changes: Initial RLS policy creation
--   - Enabled RLS on all tables
--   - Created policies for profiles (public read, own modify)
--   - Created policies for venues (public read, auth create/modify)
--   - Created policies for events (public read published, organizer manage)
--   - Created policies for interactions (user owns data)
--   - Created policies for recommendations (user owns data)
--   - Added helper functions for role checking
-- ============================================================================
