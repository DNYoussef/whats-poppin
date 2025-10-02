// ============================================================================
// What's Poppin! - Database Helper Functions
// File: database.ts
// Description: Type-safe query builders and database utilities
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Event,
  EventWithDetails,
  EventFilters,
  PaginationParams,
  PaginatedResponse,
  NearbyEventsParams,
  NearbyEvent,
  EventInsert,
  EventUpdate,
  Profile,
  Venue,
  UserEventInteraction,
  InteractionInsert,
  EventRecommendation,
  Point,
  GeographyPoint
} from '../types/database.types';

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let supabaseClient: SupabaseClient | null = null;

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  return supabaseClient;
}

// ============================================================================
// GEOGRAPHY UTILITIES
// ============================================================================

export function pointToGeography(lat: number, lon: number): string {
  return `SRID=4326;POINT(${lon} ${lat})`;
}

export function geographyToPoint(geography: Point): GeographyPoint {
  const [lon, lat] = geography.coordinates;
  return { lat, lon };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ============================================================================
// EVENT QUERIES
// ============================================================================

export async function getEventById(
  eventId: string
): Promise<EventWithDetails | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venue:venues(*),
      organizer:profiles(*)
    `)
    .eq('id', eventId)
    .single();

  if (error) throw error;
  return data;
}

export async function listEvents(
  filters: EventFilters = {},
  pagination: PaginationParams = { limit: 50, offset: 0 }
): Promise<PaginatedResponse<EventWithDetails>> {
  const supabase = getSupabase();
  let query = supabase
    .from('events')
    .select(`
      *,
      venue:venues(*),
      organizer:profiles(*)
    `, { count: 'exact' })
    .eq('status', 'published');

  query = applyEventFilters(query, filters);
  query = query.range(
    pagination.offset,
    pagination.offset + pagination.limit - 1
  );

  const { data, error, count } = await query;

  if (error) throw error;

  return buildPaginatedResponse(data, count, pagination);
}

function applyEventFilters(query: any, filters: EventFilters): any {
  if (filters.category) {
    const categories = Array.isArray(filters.category)
      ? filters.category
      : [filters.category];
    query = query.in('category', categories);
  }

  if (filters.tags?.length) {
    query = query.overlaps('tags', filters.tags);
  }

  if (filters.min_price !== undefined) {
    query = query.gte('price', filters.min_price);
  }

  if (filters.max_price !== undefined) {
    query = query.lte('price', filters.max_price);
  }

  if (filters.start_date) {
    query = query.gte('start_time', filters.start_date.toISOString());
  }

  if (filters.end_date) {
    query = query.lte('start_time', filters.end_date.toISOString());
  }

  return query;
}

// ============================================================================
// SPATIAL QUERIES
// ============================================================================

export async function getNearbyEvents(
  params: NearbyEventsParams
): Promise<NearbyEvent[]> {
  const supabase = getSupabase();
  const { user_lat, user_lon, radius_miles = 25, result_limit = 50 } = params;

  const { data, error } = await supabase.rpc('get_nearby_events', {
    user_lat,
    user_lon,
    radius_miles,
    result_limit
  });

  if (error) throw error;
  return data;
}

// ============================================================================
// SEARCH QUERIES
// ============================================================================

export async function searchEvents(
  searchQuery: string,
  pagination: PaginationParams = { limit: 50, offset: 0 }
): Promise<PaginatedResponse<EventWithDetails>> {
  const supabase = getSupabase();

  const { data, error, count } = await supabase
    .from('events')
    .select(`
      *,
      venue:venues(*),
      organizer:profiles(*)
    `, { count: 'exact' })
    .eq('status', 'published')
    .textSearch('title', searchQuery, {
      type: 'websearch',
      config: 'english'
    })
    .range(
      pagination.offset,
      pagination.offset + pagination.limit - 1
    );

  if (error) throw error;

  return buildPaginatedResponse(data, count, pagination);
}

// ============================================================================
// EVENT MUTATIONS
// ============================================================================

export async function createEvent(event: EventInsert): Promise<Event> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(
  eventId: string,
  updates: EventUpdate
): Promise<Event> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
}

// ============================================================================
// USER INTERACTIONS
// ============================================================================

export async function trackInteraction(
  interaction: InteractionInsert
): Promise<UserEventInteraction> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_event_interactions')
    .upsert(interaction, {
      onConflict: 'user_id,event_id,interaction_type'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserInteractions(
  userId: string,
  interactionType?: string
): Promise<UserEventInteraction[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('user_event_interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (interactionType) {
    query = query.eq('interaction_type', interactionType);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export async function getRecommendations(
  userId: string,
  limit: number = 20
): Promise<EventRecommendation[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('event_recommendations')
    .select(`
      *,
      event:events(
        *,
        venue:venues(*)
      )
    `)
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function buildPaginatedResponse<T>(
  data: T[] | null,
  count: number | null,
  pagination: PaginationParams
): PaginatedResponse<T> {
  const items = data || [];
  const total = count || 0;

  return {
    data: items,
    count: total,
    limit: pagination.limit,
    offset: pagination.offset,
    has_more: pagination.offset + pagination.limit < total
  };
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s-]/g, '')
    .substring(0, 100);
}

// ============================================================================
// VERSION LOG
// ============================================================================
// Version: 1.0.0
// Date: 2025-10-02
// Author: Backend API Developer Agent
// Changes: Initial database utility functions
//   - Client initialization and singleton pattern
//   - Geography conversion utilities
//   - Type-safe event CRUD operations
//   - Spatial queries for nearby events
//   - Full-text search implementation
//   - User interaction tracking
//   - Recommendation retrieval
//   - All functions ≤60 lines (NASA Rule 10 compliant)
// ============================================================================
