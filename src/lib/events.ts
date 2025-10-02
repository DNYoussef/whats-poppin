// ============================================================================
// What's Poppin! - Event Service Functions
// File: events.ts
// Description: High-level event operations and business logic
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

import {
  getEventById,
  listEvents as dbListEvents,
  searchEvents as dbSearchEvents,
  getNearbyEvents as dbGetNearbyEvents,
  createEvent as dbCreateEvent,
  updateEvent as dbUpdateEvent,
  deleteEvent as dbDeleteEvent,
  trackInteraction,
  calculateDistance
} from './database';

import type {
  EventWithDetails,
  EventFilters,
  PaginationParams,
  PaginatedResponse,
  NearbyEvent,
  EventInsert,
  EventUpdate
} from '../types/database.types';

/**
 * Get single event with full details
 * @param id - Event ID
 * @returns Event with venue and organizer
 */
export async function getEvent(
  id: string
): Promise<EventWithDetails | null> {
  return getEventById(id);
}

/**
 * List events with filters and pagination
 * @param filters - Optional filters
 * @param pagination - Optional pagination params
 * @returns Paginated events
 */
export async function listEvents(
  filters?: EventFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<EventWithDetails>> {
  return dbListEvents(filters, pagination);
}

/**
 * Search events by query string
 * @param query - Search query
 * @param pagination - Optional pagination params
 * @returns Paginated search results
 */
export async function searchEvents(
  query: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<EventWithDetails>> {
  return dbSearchEvents(query, pagination);
}

/**
 * Get nearby events based on user location
 * @param lat - User latitude
 * @param lon - User longitude
 * @param radiusMiles - Search radius in miles
 * @param limit - Max results
 * @returns Events with distance
 */
export async function getNearbyEvents(
  lat: number,
  lon: number,
  radiusMiles: number = 25,
  limit: number = 50
): Promise<NearbyEvent[]> {
  return dbGetNearbyEvents({
    user_lat: lat,
    user_lon: lon,
    radius_miles: radiusMiles,
    result_limit: limit
  });
}

/**
 * Create new event
 * @param data - Event data
 * @returns Created event
 */
export async function createEvent(data: EventInsert) {
  return dbCreateEvent(data);
}

/**
 * Update existing event
 * @param id - Event ID
 * @param data - Updated fields
 * @returns Updated event
 */
export async function updateEvent(id: string, data: EventUpdate) {
  return dbUpdateEvent(id, data);
}

/**
 * Delete event
 * @param id - Event ID
 */
export async function deleteEvent(id: string): Promise<void> {
  return dbDeleteEvent(id);
}

/**
 * Save/bookmark event for user
 * @param userId - User ID
 * @param eventId - Event ID
 */
export async function saveEvent(
  userId: string,
  eventId: string
): Promise<void> {
  await trackInteraction({
    user_id: userId,
    event_id: eventId,
    interaction_type: 'saved'
  });
}

/**
 * RSVP to event
 * @param userId - User ID
 * @param eventId - Event ID
 */
export async function rsvpEvent(
  userId: string,
  eventId: string
): Promise<void> {
  await trackInteraction({
    user_id: userId,
    event_id: eventId,
    interaction_type: 'rsvp'
  });
}

/**
 * Track event view
 * @param userId - User ID
 * @param eventId - Event ID
 */
export async function viewEvent(
  userId: string,
  eventId: string
): Promise<void> {
  await trackInteraction({
    user_id: userId,
    event_id: eventId,
    interaction_type: 'view'
  });
}

/**
 * Calculate distance to event
 * @param userLat - User latitude
 * @param userLon - User longitude
 * @param event - Event with venue location
 * @returns Distance in miles
 */
export function getEventDistance(
  userLat: number,
  userLon: number,
  event: EventWithDetails
): number | null {
  if (!event.venue?.location) return null;

  const { lat, lon } = event.venue.location;
  return calculateDistance(userLat, userLon, lat, lon);
}

/**
 * Format distance for display
 * @param miles - Distance in miles
 * @returns Formatted string
 */
export function formatDistance(miles: number | null): string {
  if (miles === null) return 'Distance unknown';
  if (miles < 0.1) return 'Nearby';
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
  return `${miles.toFixed(1)} mi`;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event service functions | OK |
/* AGENT FOOTER END */
