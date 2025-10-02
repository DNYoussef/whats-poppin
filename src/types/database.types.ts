// ============================================================================
// What's Poppin! - Database Type Definitions
// File: database.types.ts
// Description: Type-safe database models and interfaces
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

// ============================================================================
// CORE TYPES
// ============================================================================

export interface Point {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeographyPoint {
  lat: number;
  lon: number;
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  location: GeographyPoint;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  venue_id: string;
  organizer_id: string;
  start_time: string;
  end_time: string | null;
  category: string;
  tags: string[];
  image_url: string | null;
  capacity: number | null;
  price: number | null; // Price in cents
  status: 'draft' | 'published' | 'cancelled';
  view_count: number;
  created_at: string;
  updated_at: string;
  embedding?: number[] | null;
}

export interface EventWithDetails extends Event {
  venue: Venue | null;
  organizer: Profile | null;
}

export interface UserEventInteraction {
  id: string;
  user_id: string;
  event_id: string;
  interaction_type: 'view' | 'saved' | 'rsvp' | 'share' | 'click';
  created_at: string;
}

export interface EventRecommendation {
  id: string;
  user_id: string;
  event_id: string;
  score: number;
  reason: string;
  expires_at: string;
  created_at: string;
  event?: Event;
}

export interface NearbyEvent extends Event {
  distance_miles: number;
  venue: Venue;
}

// ============================================================================
// INSERT TYPES
// ============================================================================

export interface EventInsert {
  title: string;
  description: string | null;
  venue_id: string;
  organizer_id: string;
  start_time: string;
  end_time?: string | null;
  category: string;
  tags?: string[];
  image_url?: string | null;
  capacity?: number | null;
  price?: number | null;
  status?: 'draft' | 'published' | 'cancelled';
}

export interface InteractionInsert {
  user_id: string;
  event_id: string;
  interaction_type: 'view' | 'saved' | 'rsvp' | 'share' | 'click';
}

// ============================================================================
// UPDATE TYPES
// ============================================================================

export interface EventUpdate {
  title?: string;
  description?: string | null;
  venue_id?: string;
  start_time?: string;
  end_time?: string | null;
  category?: string;
  tags?: string[];
  image_url?: string | null;
  capacity?: number | null;
  price?: number | null;
  status?: 'draft' | 'published' | 'cancelled';
}

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface EventFilters {
  category?: string | string[];
  tags?: string[];
  min_price?: number;
  max_price?: number;
  start_date?: Date;
  end_date?: Date;
  status?: 'draft' | 'published' | 'cancelled';
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface NearbyEventsParams {
  user_lat: number;
  user_lon: number;
  radius_miles?: number;
  result_limit?: number;
}

export interface UserPreference {
  user_id: string;
  categories: string[];
  interests: string[];
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CATEGORY CONSTANTS
// ============================================================================

export const EVENT_CATEGORIES = [
  'music',
  'food',
  'sports',
  'arts',
  'nightlife',
  'community',
  'education',
  'business',
  'outdoor',
  'other'
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function isValidCategory(category: string): category is EventCategory {
  return EVENT_CATEGORIES.includes(category as EventCategory);
}

export function isValidStatus(
  status: string
): status is 'draft' | 'published' | 'cancelled' {
  return ['draft', 'published', 'cancelled'].includes(status);
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Complete database types | OK |
/* AGENT FOOTER END */

// ============================================================================
// SUPABASE DATABASE SCHEMA
// ============================================================================

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      profiles: {
        Row: Profile;
      };
      venues: {
        Row: Venue;
      };
      user_event_interactions: {
        Row: UserEventInteraction;
        Insert: InteractionInsert;
      };
      event_recommendations: {
        Row: EventRecommendation;
      };
      user_preferences: {
        Row: UserPreference;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_nearby_events: {
        Args: NearbyEventsParams;
        Returns: NearbyEvent[];
      };
    };
    Enums: Record<string, never>;
  };
}
