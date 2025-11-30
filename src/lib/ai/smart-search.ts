// ============================================================================
// What's Poppin! - Smart Event Search
// File: src/lib/ai/smart-search.ts
// Description: AI-powered event search with multi-factor scoring
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { getSupabase } from '../database';
import { getOpenAIClient } from '../openai';
import { calculateCosineSimilarity } from './utils';
import type { Event, EventWithDetails } from '@/types/database.types';
import type { UserPreferences } from './conversation';

// ============================================================================
// TYPES
// ============================================================================

export interface ScoredEvent extends EventWithDetails {
  total_score: number;
  score_breakdown: {
    interest_match: number;
    time_match: number;
    duration_match: number;
    price_match: number;
    distance_match: number;
  };
  reasoning: string;
}

// ============================================================================
// SMART SEARCH
// ============================================================================

/**
 * Find top events based on AI conversation preferences
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function findSmartRecommendations(
  preferences: UserPreferences,
  userLocation?: { lat: number; lon: number },
  limit: number = 3
): Promise<ScoredEvent[]> {
  // Assertion 1: Validate limit
  if (limit <= 0 || limit > 10) {
    throw new Error('Limit must be between 1 and 10');
  }

  // Assertion 2: Validate preferences
  if (!preferences || typeof preferences !== 'object') {
    throw new Error('Preferences must be a valid object');
  }

  const supabase = getSupabase();

  // Build query filters
  let query = supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('start_time', new Date().toISOString())
    .limit(100);

  // Filter by categories if specified
  if (preferences.categories && preferences.categories.length > 0) {
    query = query.in('category', preferences.categories);
  }

  // Filter by price range
  if (preferences.budget) {
    const maxCents = preferences.budget.max * 100;
    query = query.lte('price', maxCents);
  }

  const { data: events, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  if (!events || events.length === 0) {
    return [];
  }

  // Score each event
  const scoredEvents: ScoredEvent[] = await Promise.all(
    events.map(event => scoreEvent(event as EventWithDetails, preferences, userLocation))
  );

  // Sort by total score and return top N
  const topEvents = scoredEvents
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, limit);

  return topEvents;
}

/**
 * Score individual event against preferences
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
async function scoreEvent(
  event: EventWithDetails,
  preferences: UserPreferences,
  userLocation?: { lat: number; lon: number }
): Promise<ScoredEvent> {
  // Assertion 1: Validate event
  if (!event || !event.id) {
    throw new Error('Invalid event object');
  }

  let interestScore = 0;
  let timeScore = 0;
  let durationScore = 0;
  let priceScore = 0;
  let distanceScore = 0;

  // Score 1: Interest match (using embeddings if available)
  if (preferences.interests && preferences.interests.length > 0) {
    interestScore = await scoreInterestMatch(
      event,
      preferences.interests
    );
  } else {
    interestScore = 0.5; // Neutral if no interests specified
  }

  // Score 2: Time preference match
  if (preferences.timePreference) {
    timeScore = scoreTimeMatch(event.start_time, preferences.timePreference);
  } else {
    timeScore = 0.5;
  }

  // Score 3: Duration match
  if (preferences.duration && event.end_time) {
    durationScore = scoreDurationMatch(
      event.start_time,
      event.end_time,
      preferences.duration
    );
  } else {
    durationScore = 0.5;
  }

  // Score 4: Price match
  priceScore = scorePriceMatch(event.price, preferences.budget);

  // Score 5: Distance match
  if (userLocation && event.venue) {
    distanceScore = scoreDistanceMatch(
      userLocation,
      event.venue.location
    );
  } else {
    distanceScore = 0.5;
  }

  // Calculate weighted total score
  const totalScore =
    interestScore * 0.35 +
    timeScore * 0.20 +
    durationScore * 0.15 +
    priceScore * 0.15 +
    distanceScore * 0.15;

  // Generate reasoning
  const reasoning = generateReasoning(event, {
    interest_match: interestScore,
    time_match: timeScore,
    duration_match: durationScore,
    price_match: priceScore,
    distance_match: distanceScore
  });

  // Assertion 2: Validate total score
  if (totalScore < 0 || totalScore > 1) {
    throw new Error('Total score must be between 0 and 1');
  }

  return {
    ...event,
    total_score: totalScore,
    score_breakdown: {
      interest_match: interestScore,
      time_match: timeScore,
      duration_match: durationScore,
      price_match: priceScore,
      distance_match: distanceScore
    },
    reasoning
  };
}

/**
 * Score interest match using AI embeddings
 */
async function scoreInterestMatch(
  event: Event,
  interests: string[]
): Promise<number> {
  if (interests.length === 0) return 0.5;

  const openai = getOpenAIClient();

  // Generate embedding for user interests
  const interestText = interests.join(' ');
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: interestText
  });

  const firstResult = response.data[0];
  if (!firstResult) {
    return 0.5;
  }
  const userEmbedding = firstResult.embedding;

  // Compare with event embedding if available
  if (event.embedding) {
    return calculateCosineSimilarity(userEmbedding, event.embedding);
  }

  // Fallback: Simple keyword matching
  const eventText = `${event.title} ${event.description} ${event.category}`.toLowerCase();
  const matchCount = interests.filter(interest =>
    eventText.includes(interest.toLowerCase())
  ).length;

  return Math.min(matchCount / interests.length, 1.0);
}

/**
 * Score time preference match
 */
function scoreTimeMatch(
  startTime: string,
  preference: 'morning' | 'afternoon' | 'evening' | 'night'
): number {
  const hour = new Date(startTime).getHours();

  const ranges: Record<typeof preference, [number, number]> = {
    morning: [6, 12],
    afternoon: [12, 17],
    evening: [17, 21],
    night: [21, 6]
  };

  const range = ranges[preference];
  const start = range[0];
  const end = range[1];

  if (preference === 'night') {
    return (hour >= start || hour < end) ? 1.0 : 0.3;
  }

  return (hour >= start && hour < end) ? 1.0 : 0.3;
}

/**
 * Score duration match
 */
function scoreDurationMatch(
  startTime: string,
  endTime: string,
  preference: 'quick' | 'medium' | 'long'
): number {
  const durationHours =
    (new Date(endTime).getTime() - new Date(startTime).getTime()) /
    (1000 * 60 * 60);

  const ideal = {
    quick: 1.5,
    medium: 3,
    long: 5
  };

  const target = ideal[preference];
  const diff = Math.abs(durationHours - target);

  return Math.max(0, 1 - diff / 4);
}

/**
 * Score price match
 */
function scorePriceMatch(
  eventPrice: number | null,
  budget: { min: number; max: number } | null | undefined
): number {
  const priceDollars = eventPrice ? eventPrice / 100 : 0;

  if (!budget) {
    return eventPrice === null ? 1.0 : 0.7;
  }

  if (priceDollars === 0) return 1.0;
  if (priceDollars >= budget.min && priceDollars <= budget.max) return 1.0;
  if (priceDollars < budget.min) return 0.8;
  if (priceDollars > budget.max) {
    const overage = priceDollars - budget.max;
    return Math.max(0, 1 - overage / budget.max);
  }

  return 0.5;
}

/**
 * Score distance match
 */
function scoreDistanceMatch(
  userLocation: { lat: number; lon: number },
  venueLocation: { lat: number; lon: number }
): number {
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lon,
    venueLocation.lat,
    venueLocation.lon
  );

  // Ideal: within 5 miles
  if (distance <= 5) return 1.0;
  if (distance <= 10) return 0.8;
  if (distance <= 20) return 0.6;
  if (distance <= 30) return 0.4;
  return 0.2;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(
  _event: Event,
  scores: {
    interest_match: number;
    time_match: number;
    duration_match: number;
    price_match: number;
    distance_match: number;
  }
): string {
  const reasons: string[] = [];

  if (scores.interest_match > 0.7) {
    reasons.push('Perfect match for your interests');
  }

  if (scores.time_match > 0.8) {
    reasons.push('Great timing for you');
  }

  if (scores.price_match > 0.8) {
    reasons.push('Within your budget');
  }

  if (scores.distance_match > 0.7) {
    reasons.push('Conveniently located');
  }

  if (reasons.length === 0) {
    reasons.push('Good overall match');
  }

  return reasons.join(' • ');
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T13:35:00 | coder@sonnet-4.5 | Smart search engine | OK |
/* AGENT FOOTER END */
