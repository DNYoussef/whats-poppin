// ============================================================================
// What's Poppin! - AI Type Definitions
// File: src/types/ai.types.ts
// Description: TypeScript type definitions for AI features
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

export interface EmbeddingMetadata {
  model: string;
  dimensions: number;
  maxBatchSize: number;
}

export interface EventEmbeddingInput {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface RecommendationScore {
  event_id: string;
  score: number;
  reason: string;
}

export interface UserPreferenceInput {
  categories: string[];
  interests: string[];
}

export interface UserPreferenceData {
  user_id: string;
  categories: string[];
  interests: string[];
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface InteractionType {
  viewed: 'viewed';
  saved: 'saved';
  rsvp: 'rsvp';
  attended: 'attended';
}

export interface InteractionStats {
  viewed: number;
  saved: number;
  rsvp: number;
  attended: number;
}

export interface RecommendationResponse {
  recommendations: Array<any>;
  count: number;
  cached: boolean;
}

export interface SimilarEventsResponse {
  eventId: string;
  similarEvents: Array<any>;
  count: number;
}

export interface EmbeddingGenerationResponse {
  embedding: number[];
  dimensions: number;
  saved: boolean;
}

export interface BatchEmbeddingResponse {
  generated: number;
  saved: number;
  embeddings: number[][];
}

export interface CronJobResponse {
  success: boolean;
  processed: number;
  total?: number;
  deleted?: number;
  errors?: string[];
  message?: string;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | AI type definitions | OK |
/* AGENT FOOTER END */
