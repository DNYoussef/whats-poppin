// ============================================================================
// What's Poppin! - User Preferences Module
// File: src/lib/ai/preferences.ts
// Description: Capture and track user preferences and interactions
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { getSupabase } from '../database';
import { generateEmbedding } from './embeddings';
import { saveUserPreferences } from './database';
import type { UserEventInteraction } from '@/types/database.types';

// ============================================================================
// PREFERENCE CAPTURE
// ============================================================================

/**
 * Capture explicit user preferences
 * @param userId - User UUID
 * @param preferences - User-selected preferences
 * @returns Saved preference record
 */
export async function captureUserPreferences(
  userId: string,
  preferences: {
    categories: string[];
    interests: string[];
  }
): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  if (!preferences.categories || preferences.categories.length === 0) {
    throw new Error('At least one category must be selected');
  }

  if (!preferences.interests || preferences.interests.length === 0) {
    throw new Error('At least one interest must be provided');
  }

  const interestText = preferences.interests.join('. ');
  const categoryText = preferences.categories.join(', ');
  const combinedText = `Categories: ${categoryText}\nInterests: ${interestText}`;

  const embedding = await generateEmbedding(combinedText);

  await saveUserPreferences(userId, {
    categories: preferences.categories,
    interests: preferences.interests,
    embedding,
  });
}

/**
 * Track user interaction with an event
 * @param userId - User UUID
 * @param eventId - Event UUID
 * @param type - Interaction type (viewed, saved, rsvp, attended)
 * @returns Created interaction record
 */
export async function trackEventInteraction(
  userId: string,
  eventId: string,
  type: 'viewed' | 'saved' | 'rsvp' | 'attended'
): Promise<UserEventInteraction> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  if (!eventId || eventId.trim().length === 0) {
    throw new Error('Event ID cannot be empty');
  }

  const validTypes = ['viewed', 'saved', 'rsvp', 'attended'];

  if (!validTypes.includes(type)) {
    throw new Error(`Invalid interaction type: ${type}`);
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_event_interactions')
    .upsert(
      {
        user_id: userId,
        event_id: eventId,
        interaction_type: type,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,event_id,interaction_type',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to track interaction: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned after tracking interaction');
  }

  return data;
}

/**
 * Extract implicit preferences from user interaction history
 * Analyzes categories and tags from interacted events
 * @param userId - User UUID
 * @returns Array of inferred interest keywords
 */
export async function getImplicitPreferences(
  userId: string
): Promise<string[]> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  const supabase = getSupabase();

  const { data: interactions, error } = await supabase
    .from('user_event_interactions')
    .select(
      `
      interaction_type,
      event:events(category, tags)
    `
    )
    .eq('user_id', userId)
    .in('interaction_type', ['saved', 'rsvp', 'attended'])
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch interactions: ${error.message}`);
  }

  if (!interactions || interactions.length === 0) {
    return [];
  }

  const categoryCount: Record<string, number> = {};
  const tagCount: Record<string, number> = {};

  for (const interaction of interactions) {
    if (!interaction.event) continue;

    const weight = interaction.interaction_type === 'attended' ? 3 :
                   interaction.interaction_type === 'rsvp' ? 2 : 1;

    if (interaction.event.category) {
      const cat = interaction.event.category;
      categoryCount[cat] = (categoryCount[cat] || 0) + weight;
    }

    if (interaction.event.tags) {
      for (const tag of interaction.event.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + weight;
      }
    }
  }

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((entry) => entry[0]);

  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((entry) => entry[0]);

  const preferences = [...topCategories, ...topTags];

  if (preferences.length === 0) {
    throw new Error('No implicit preferences found');
  }

  return preferences;
}

/**
 * Get user interaction statistics
 * @param userId - User UUID
 * @returns Interaction counts by type
 */
export async function getUserInteractionStats(
  userId: string
): Promise<Record<string, number>> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_event_interactions')
    .select('interaction_type')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch stats: ${error.message}`);
  }

  const stats: Record<string, number> = {
    viewed: 0,
    saved: 0,
    rsvp: 0,
    attended: 0,
  };

  if (data) {
    for (const interaction of data) {
      stats[interaction.interaction_type] =
        (stats[interaction.interaction_type] || 0) + 1;
    }
  }

  return stats;
}

/**
 * Check if user has completed onboarding
 * @param userId - User UUID
 * @returns True if user has set preferences
 */
export async function hasCompletedOnboarding(
  userId: string
): Promise<boolean> {
  if (!userId || userId.trim().length === 0) {
    throw new Error('User ID cannot be empty');
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check onboarding: ${error.message}`);
  }

  return data !== null;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | User preferences tracking | OK |
/* AGENT FOOTER END */
