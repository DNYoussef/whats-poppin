// ============================================================================
// What's Poppin! - AI Module Index
// File: src/lib/ai/index.ts
// Description: Central export for all AI functionality
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

// Embeddings
export {
  generateEmbedding,
  generateEventEmbedding,
  batchGenerateEmbeddings,
  batchGenerateEventEmbeddings,
  getEmbeddingMetadata,
} from './embeddings';

// Recommendations
export {
  getPersonalizedRecommendations,
  getSimilarEvents,
  getUserPreferenceEmbedding,
  updateEventRecommendations,
} from './recommendations';

// Preferences
export {
  captureUserPreferences,
  trackEventInteraction,
  getImplicitPreferences,
  getUserInteractionStats,
  hasCompletedOnboarding,
} from './preferences';

// Database
export {
  saveEventEmbedding,
  batchSaveEventEmbeddings,
  getEventsWithoutEmbeddings,
  saveUserRecommendations,
  getUserRecommendations,
  deleteExpiredRecommendations,
  saveUserPreferences,
  getUserPreferences,
} from './database';

// Utilities
export {
  dotProduct,
  vectorMagnitude,
  normalizeVector,
  calculateCosineSimilarity,
  euclideanDistance,
  chunkArray,
  averageVectors,
  weightedAverageVectors,
} from './utils';

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | AI module index | OK |
/* AGENT FOOTER END */
