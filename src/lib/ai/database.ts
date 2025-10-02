// ============================================================================
// What's Poppin! - AI Database Helpers
// File: src/lib/ai/database.ts
// Description: Database operations for AI features and embeddings
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { getSupabase } from '../database';
import type {
  Event,
  EventRecommendation,
  UserPreference,
} from '@/types/database.types';

// ============================================================================
// EMBEDDING STORAGE
// ============================================================================

/**
 * Save event embedding to database
 * @param eventId - Event UUID
 * @param embedding - 1536-dimensional vector
 * @returns Updated event
 */
export async function saveEventEmbedding(
  eventId: string,
  embedding: number[]
): Promise<Event> {
  if (!eventId || eventId.trim().length === 0) {
    throw new Error('Event ID cannot be empty');
  }

  if (!embedding || embedding.length !== 1536) {
    throw new Error('Embedding must be 1536-dimensional array');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('events')
    .update({ embedding })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save embedding: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after saving embedding');
  }

  return data;
}

/**
 * Batch save embeddings for multiple events
 * @param embeddings - Map of event IDs to embeddings
 * @returns Number of events updated
 */
export async function batchSaveEventEmbeddings(
  embeddings: Map<string, number[]>
): Promise<number> {
  if (!embeddings || embeddings.size === 0) {
    throw new Error('Embeddings map cannot be empty');
  }

  const supabase = getSupabase();
  let updateCount = 0;

  for (const [eventId, embedding] of embeddings.entries()) {
    if (!embedding || embedding.length !== 1536) {
      throw new Error(`Invalid embedding for event ${eventId}`);
    }

    const { error } = await supabase
      .from('events')
      .update({ embedding })
      .eq('id', eventId);

    if (error) {
      throw new Error(
        `Failed to save embedding for ${eventId}: ${error.message}`
      );
    }

    updateCount++;
  }

  if (updateCount !== embeddings.size) {
    throw new Error('Not all embeddings were saved');
  }

  return updateCount;
}

/**
 * Get events without embeddings
 * @param limit - Maximum number of events to return
 * @returns Array of events needing embeddings
 */
export async function getEventsWithoutEmbeddings(
  limit: number = 100
): Promise<Event[]> {
  if (limit <= 0 || limit > 1000) {
    throw new Error('Limit must be between 1 and 1000');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .is('embedding', null)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from query');
  }

  return data;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Save user recommendations to database
 * @param userId - User UUID
 * @param recommendations - Array of recommendation objects
 * @returns Number of recommendations saved
 */
export async function saveUserRecommendations(
  userId: string,
  recommendations: Array<{
    event_id: string;
    score: number;
    reason: string;
  }>
): Promise<number> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  if (!recommendations || recommendations.length === 0) {
    throw new Error('Recommendations array cannot be empty');
  }

  const supabase = getSupabase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const records = recommendations.map((rec) => ({
    user_id: userId,
    event_id: rec.event_id,
    score: rec.score,
    reason: rec.reason,
    expires_at: expiresAt.toISOString(),
  }));

  const { data, error } = await supabase
    .from('event_recommendations')
    .upsert(records, {
      onConflict: 'user_id,event_id',
    })
    .select();

  if (error) {
    throw new Error(`Failed to save recommendations: ${error.message}`);
  }

  if (!data || data.length !== records.length) {
    throw new Error('Not all recommendations were saved');
  }

  return data.length;
}

/**
 * Get user recommendations from database
 * @param userId - User UUID
 * @param limit - Maximum recommendations to return
 * @returns Array of events with recommendation scores
 */
export async function getUserRecommendations(
  userId: string,
  limit: number = 20
): Promise<EventRecommendation[]> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  if (limit <= 0 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('event_recommendations')
    .select(
      `
      *,
      event:events(
        *,
        venue:venues(*)
      )
    `
    )
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recommendations: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from query');
  }

  return data;
}

/**
 * Delete expired recommendations
 * @returns Number of deleted recommendations
 */
export async function deleteExpiredRecommendations(): Promise<number> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('event_recommendations')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select();

  if (error) {
    throw new Error(`Failed to delete recommendations: ${error.message}`);
  }

  return data?.length || 0;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * Save user preferences to database
 * @param userId - User UUID
 * @param preferences - User preference data
 * @returns Saved preference record
 */
export async function saveUserPreferences(
  userId: string,
  preferences: {
    categories?: string[];
    interests?: string[];
    embedding?: number[];
  }
): Promise<UserPreference> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  if (!preferences.categories && !preferences.interests) {
    throw new Error('Must provide categories or interests');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        categories: preferences.categories || [],
        interests: preferences.interests || [],
        embedding: preferences.embedding || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save preferences: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after saving preferences');
  }

  return data;
}

/**
 * Get user preferences from database
 * @param userId - User UUID
 * @returns User preference record or null
 */
export async function getUserPreferences(
  userId: string
): Promise<UserPreference | null> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch preferences: ${error.message}`);
  }

  return data || null;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | AI database helpers | OK |
/* AGENT FOOTER END */
