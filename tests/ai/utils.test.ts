// ============================================================================
// What's Poppin! - Vector Utils Tests
// File: tests/ai/utils.test.ts
// Description: Test suite for vector operations
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  dotProduct,
  vectorMagnitude,
  normalizeVector,
  calculateCosineSimilarity,
  euclideanDistance,
  chunkArray,
  averageVectors,
  weightedAverageVectors,
} from '@/lib/ai/utils';

describe('Vector Utilities', () => {
  describe('dotProduct', () => {
    it('should calculate dot product correctly', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [4, 5, 6];
      const result = dotProduct(vec1, vec2);

      expect(result).toBe(32); // 1*4 + 2*5 + 3*6
    });

    it('should throw error for mismatched dimensions', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [4, 5];

      expect(() => dotProduct(vec1, vec2)).toThrow('dimension mismatch');
    });
  });

  describe('vectorMagnitude', () => {
    it('should calculate magnitude correctly', () => {
      const vec = [3, 4];
      const magnitude = vectorMagnitude(vec);

      expect(magnitude).toBe(5); // sqrt(3^2 + 4^2)
    });

    it('should throw error for zero vector', () => {
      const vec = [0, 0, 0];

      expect(() => vectorMagnitude(vec)).toThrow('zero vector');
    });
  });

  describe('normalizeVector', () => {
    it('should normalize vector to unit length', () => {
      const vec = [3, 4];
      const normalized = normalizeVector(vec);

      expect(normalized[0]).toBeCloseTo(0.6);
      expect(normalized[1]).toBeCloseTo(0.8);
      expect(vectorMagnitude(normalized)).toBeCloseTo(1.0);
    });
  });

  describe('calculateCosineSimilarity', () => {
    it('should calculate similarity for identical vectors', () => {
      const vec = [1, 2, 3];
      const similarity = calculateCosineSimilarity(vec, vec);

      expect(similarity).toBeCloseTo(1.0);
    });

    it('should calculate similarity for orthogonal vectors', () => {
      const vec1 = [1, 0];
      const vec2 = [0, 1];
      const similarity = calculateCosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(0.0);
    });
  });

  describe('euclideanDistance', () => {
    it('should calculate distance correctly', () => {
      const vec1 = [0, 0];
      const vec2 = [3, 4];
      const distance = euclideanDistance(vec1, vec2);

      expect(distance).toBe(5);
    });
  });

  describe('chunkArray', () => {
    it('should split array into chunks', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const chunks = chunkArray(array, 3);

      expect(chunks.length).toBe(3);
      expect(chunks[0]).toEqual([1, 2, 3]);
      expect(chunks[1]).toEqual([4, 5, 6]);
      expect(chunks[2]).toEqual([7]);
    });

    it('should throw error for invalid chunk size', () => {
      expect(() => chunkArray([1, 2, 3], 0)).toThrow('must be positive');
    });
  });

  describe('averageVectors', () => {
    it('should average vectors correctly', () => {
      const vectors = [
        [2, 4, 6],
        [4, 6, 8],
      ];
      const avg = averageVectors(vectors);

      expect(avg).toEqual([3, 5, 7]);
    });

    it('should throw error for empty array', () => {
      expect(() => averageVectors([])).toThrow('empty vector array');
    });
  });

  describe('weightedAverageVectors', () => {
    it('should compute weighted average correctly', () => {
      const vectors = [
        [10, 20],
        [20, 40],
      ];
      const weights = [0.3, 0.7];
      const avg = weightedAverageVectors(vectors, weights);

      expect(avg[0]).toBeCloseTo(17); // 10*0.3 + 20*0.7
      expect(avg[1]).toBeCloseTo(34); // 20*0.3 + 40*0.7
    });

    it('should throw error if weights do not sum to 1', () => {
      const vectors = [[1, 2], [3, 4]];
      const weights = [0.5, 0.3];

      expect(() => weightedAverageVectors(vectors, weights)).toThrow(
        'must sum to 1.0'
      );
    });
  });
});

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Vector utils test suite | OK |
/* AGENT FOOTER END */
