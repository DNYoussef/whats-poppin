// ============================================================================
// What's Poppin! - Embeddings Tests
// File: tests/ai/embeddings.test.ts
// Description: Test suite for AI embeddings module
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import {
  generateEmbedding,
  generateEventEmbedding,
  getEmbeddingMetadata,
} from '@/lib/ai/embeddings';

vi.mock('@/lib/openai', () => ({
  getOpenAIClient: () => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [
          {
            embedding: new Array(1536).fill(0.1),
          },
        ],
      }),
    },
  }),
}));

describe('AI Embeddings Module', () => {
  describe('generateEmbedding', () => {
    it('should generate embedding for valid text', async () => {
      const text = 'Sample event description';
      const embedding = await generateEmbedding(text);

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1536);
    });

    it('should throw error for empty text', async () => {
      await expect(generateEmbedding('')).rejects.toThrow(
        'Cannot generate embedding for empty text'
      );
    });

    it('should throw error for text longer than 8000 chars', async () => {
      const longText = 'a'.repeat(8001);

      await expect(generateEmbedding(longText)).rejects.toThrow(
        'Text too long for embedding'
      );
    });
  });

  describe('generateEventEmbedding', () => {
    it('should generate embedding from event data', async () => {
      const event = {
        title: 'Summer Music Festival',
        description: 'Outdoor concert with live bands',
        category: 'Music',
        tags: ['outdoor', 'live music', 'summer'],
      };

      const embedding = await generateEventEmbedding(event);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(1536);
    });

    it('should throw error for event without title', async () => {
      const event = {
        description: 'Event description',
      };

      await expect(generateEventEmbedding(event)).rejects.toThrow(
        'Event must have a title'
      );
    });

    it('should handle event with minimal data', async () => {
      const event = {
        title: 'Simple Event',
      };

      const embedding = await generateEventEmbedding(event);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(1536);
    });
  });

  describe('getEmbeddingMetadata', () => {
    it('should return correct metadata', () => {
      const metadata = getEmbeddingMetadata();

      expect(metadata.model).toBe('text-embedding-3-small');
      expect(metadata.dimensions).toBe(1536);
      expect(metadata.maxBatchSize).toBe(100);
    });
  });
});

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Embeddings test suite | OK |
/* AGENT FOOTER END */
