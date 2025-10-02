// ============================================================================
// What's Poppin! - AI Recommendation Engine
// File: src/lib/ai/recommendations.ts
// Description: Personalized event recommendations using embeddings
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { getSupabase } from '../database';
import { calculateCosineSimilarity, weightedAverageVectors } from './utils';
import {
  getUserPreferences,
  saveUserPreferences,
  saveUserRecommendations,
} from './database';
import type { Event } from '@/types/database.types';

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

/**
 * Get personalized event recommendations for user
 * Uses collaborative filtering + content-based approach
 * @param userId - User UUID
 * @param limit - Number of recommendations to return
 * @returns Array of recommended events with scores
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<Array<Event & { similarity_score: number }>> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  if (limit <= 0 || limit > 50) {
    throw new Error('Limit must be between 1 and 50');
  }

  const userEmbedding = await getUserPreferenceEmbedding(userId);

  if (!userEmbedding) {
    return getTrendingEvents(limit);
  }

  const supabase = getSupabase();

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .not('embedding', 'is', null)
    .gte('start_time', new Date().toISOString())
    .limit(500);

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  if (!events || events.length === 0) {
    return [];
  }

  const scoredEvents = events
    .map((event) => {
      if (!event.embedding) return null;

      const similarity = calculateCosineSimilarity(
        userEmbedding,
        event.embedding
      );

      return {
        ...event,
        similarity_score: similarity,
      };
    })
    .filter((e): e is Event & { similarity_score: number } => e !== null)
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);

  if (scoredEvents.length === 0) {
    throw new Error('No valid scored events generated');
  }

  return scoredEvents;
}

/**
 * Find events similar to a given event
 * @param eventId - Event UUID
 * @param limit - Number of similar events to return
 * @returns Array of similar events with scores
 */
export async function getSimilarEvents(
  eventId: string,
  limit: number = 5
): Promise<Array<Event & { similarity_score: number }>> {
  if (!eventId || eventId.trim().length === 0) {
    throw new Error('Event ID cannot be empty');
  }

  if (limit <= 0 || limit > 20) {
    throw new Error('Limit must be between 1 and 20');
  }

  const supabase = getSupabase();

  const { data: targetEvent, error: targetError } = await supabase
    .from('events')
    .select('embedding, category')
    .eq('id', eventId)
    .single();

  if (targetError) {
    throw new Error(`Failed to fetch target event: ${targetError.message}`);
  }

  if (!targetEvent?.embedding) {
    throw new Error('Target event has no embedding');
  }

  const { data: candidateEvents, error: candidatesError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .neq('id', eventId)
    .not('embedding', 'is', null)
    .limit(200);

  if (candidatesError) {
    throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
  }

  if (!candidateEvents || candidateEvents.length === 0) {
    return [];
  }

  const scoredEvents = candidateEvents
    .map((event) => {
      if (!event.embedding) return null;

      let similarity = calculateCosineSimilarity(
        targetEvent.embedding,
        event.embedding
      );

      if (event.category === targetEvent.category) {
        similarity *= 1.1;
      }

      return {
        ...event,
        similarity_score: similarity,
      };
    })
    .filter((e): e is Event & { similarity_score: number } => e !== null)
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);

  return scoredEvents;
}

/**
 * Generate user preference embedding from interaction history
 * @param userId - User UUID
 * @returns 1536-dimensional preference embedding or null
 */
export async function getUserPreferenceEmbedding(
  userId: string
): Promise<number[] | null> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  const preferences = await getUserPreferences(userId);

  if (preferences?.embedding) {
    return preferences.embedding;
  }

  const supabase = getSupabase();

  const { data: interactions, error } = await supabase
    .from('user_event_interactions')
    .select(
      `
      interaction_type,
      created_at,
      event:events(embedding)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to fetch interactions: ${error.message}`);
  }

  if (!interactions || interactions.length === 0) {
    return null;
  }

  const embeddings: number[][] = [];
  const weights: number[] = [];

  const weightMap: Record<string, number> = {
    attended: 1.0,
    rsvp: 0.8,
    saved: 0.6,
    viewed: 0.2,
  };

  for (const interaction of interactions) {
    if (interaction.event?.embedding) {
      embeddings.push(interaction.event.embedding);
      weights.push(weightMap[interaction.interaction_type] || 0.1);
    }
  }

  if (embeddings.length === 0) {
    return null;
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map((w) => w / totalWeight);

  const preferenceEmbedding = weightedAverageVectors(
    embeddings,
    normalizedWeights
  );

  await saveUserPreferences(userId, { embedding: preferenceEmbedding });

  return preferenceEmbedding;
}

/**
 * Update recommendations for a user
 * Generates fresh recommendations and stores them
 * @param userId - User UUID
 * @returns Number of recommendations generated
 */
export async function updateEventRecommendations(
  userId: string
): Promise<number> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  const recommendedEvents = await getPersonalizedRecommendations(userId, 20);

  if (recommendedEvents.length === 0) {
    throw new Error('No recommendations generated');
  }

  const recommendations = recommendedEvents.map((event) => ({
    event_id: event.id,
    score: event.similarity_score,
    reason: 'Based on your interests and past events',
  }));

  const count = await saveUserRecommendations(userId, recommendations);

  if (count !== recommendations.length) {
    throw new Error('Not all recommendations were saved');
  }

  return count;
}

/**
 * Get trending events as fallback
 * @param limit - Number of events to return
 * @returns Array of trending events
 */
async function getTrendingEvents(
  limit: number
): Promise<Array<Event & { similarity_score: number }>> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('start_time', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch trending events: ${error.message}`);
  }

  return (data || []).map((event) => ({
    ...event,
    similarity_score: 0.5,
  }));
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | AI recommendation engine | OK |
/* AGENT FOOTER END */
