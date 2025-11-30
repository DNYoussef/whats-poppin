// ============================================================================
// What's Poppin! - AI Vector Utilities
// File: src/lib/ai/utils.ts
// Description: Vector operations for embeddings and similarity
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

// ============================================================================
// VECTOR OPERATIONS
// ============================================================================

/**
 * Calculate dot product of two vectors
 * @param vec1 - First vector
 * @param vec2 - Second vector
 * @returns Dot product value
 * @throws Error if vectors have different lengths
 */
export function dotProduct(vec1: number[], vec2: number[]): number {
  if (!vec1 || !vec2) {
    throw new Error('Vectors cannot be null or undefined');
  }

  if (vec1.length !== vec2.length) {
    throw new Error(
      `Vector dimension mismatch: ${vec1.length} vs ${vec2.length}`
    );
  }

  let sum = 0;
  const len = vec1.length;

  for (let i = 0; i < len; i++) {
    const v1 = vec1[i];
    const v2 = vec2[i];
    if (v1 !== undefined && v2 !== undefined) {
      sum += v1 * v2;
    }
  }

  return sum;
}

/**
 * Calculate magnitude (L2 norm) of a vector
 * @param vec - Input vector
 * @returns Vector magnitude
 */
export function vectorMagnitude(vec: number[]): number {
  if (!vec || vec.length === 0) {
    throw new Error('Vector cannot be null, undefined, or empty');
  }

  let sumSquares = 0;
  const len = vec.length;

  for (let i = 0; i < len; i++) {
    const v = vec[i];
    if (v !== undefined) {
      sumSquares += v * v;
    }
  }

  if (sumSquares === 0) {
    throw new Error('Cannot compute magnitude of zero vector');
  }

  return Math.sqrt(sumSquares);
}

/**
 * Normalize vector to unit length
 * @param vec - Input vector
 * @returns Normalized vector
 */
export function normalizeVector(vec: number[]): number[] {
  if (!vec || vec.length === 0) {
    throw new Error('Vector cannot be null, undefined, or empty');
  }

  const magnitude = vectorMagnitude(vec);
  const normalized = new Array(vec.length);
  const len = vec.length;

  for (let i = 0; i < len; i++) {
    const v = vec[i];
    if (v !== undefined) {
      normalized[i] = v / magnitude;
    }
  }

  return normalized;
}

/**
 * Calculate cosine similarity between two vectors
 * Range: -1 (opposite) to 1 (identical)
 * @param vec1 - First vector
 * @param vec2 - Second vector
 * @returns Cosine similarity score
 */
export function calculateCosineSimilarity(
  vec1: number[],
  vec2: number[]
): number {
  if (!vec1 || !vec2) {
    throw new Error('Vectors cannot be null or undefined');
  }

  if (vec1.length !== vec2.length) {
    throw new Error(
      `Vector dimension mismatch: ${vec1.length} vs ${vec2.length}`
    );
  }

  const dot = dotProduct(vec1, vec2);
  const mag1 = vectorMagnitude(vec1);
  const mag2 = vectorMagnitude(vec2);

  const similarity = dot / (mag1 * mag2);

  if (similarity < -1 || similarity > 1) {
    throw new Error(`Invalid cosine similarity: ${similarity}`);
  }

  return similarity;
}

/**
 * Calculate Euclidean distance between two vectors
 * @param vec1 - First vector
 * @param vec2 - Second vector
 * @returns Euclidean distance
 */
export function euclideanDistance(
  vec1: number[],
  vec2: number[]
): number {
  if (!vec1 || !vec2) {
    throw new Error('Vectors cannot be null or undefined');
  }

  if (vec1.length !== vec2.length) {
    throw new Error(
      `Vector dimension mismatch: ${vec1.length} vs ${vec2.length}`
    );
  }

  let sumSquares = 0;
  const len = vec1.length;

  for (let i = 0; i < len; i++) {
    const v1 = vec1[i];
    const v2 = vec2[i];
    if (v1 !== undefined && v2 !== undefined) {
      const diff = v1 - v2;
      sumSquares += diff * diff;
    }
  }

  return Math.sqrt(sumSquares);
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Split array into chunks of specified size
 * Useful for batch processing API requests
 * @param array - Input array
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  if (!array) {
    throw new Error('Array cannot be null or undefined');
  }

  if (size <= 0) {
    throw new Error('Chunk size must be positive');
  }

  if (array.length === 0) {
    return [];
  }

  const chunks: T[][] = [];
  const numChunks = Math.ceil(array.length / size);

  for (let i = 0; i < numChunks; i++) {
    const start = i * size;
    const end = Math.min(start + size, array.length);
    chunks.push(array.slice(start, end));
  }

  if (chunks.length === 0) {
    throw new Error('Failed to create chunks');
  }

  return chunks;
}

/**
 * Average multiple vectors element-wise
 * Used to create aggregate embeddings from multiple sources
 * @param vectors - Array of vectors to average
 * @returns Averaged vector
 */
export function averageVectors(vectors: number[][]): number[] {
  if (!vectors || vectors.length === 0) {
    throw new Error('Cannot average empty vector array');
  }

  const firstVector = vectors[0];
  if (!firstVector) {
    throw new Error('First vector is undefined');
  }
  const dimensions = firstVector.length;

  if (dimensions === 0) {
    throw new Error('Vectors cannot have zero dimensions');
  }

  for (let i = 1; i < vectors.length; i++) {
    const vec = vectors[i];
    if (!vec || vec.length !== dimensions) {
      throw new Error('All vectors must have same dimensions');
    }
  }

  const averaged = new Array(dimensions).fill(0) as number[];
  const count = vectors.length;

  for (let i = 0; i < count; i++) {
    const vec = vectors[i];
    if (vec) {
      for (let j = 0; j < dimensions; j++) {
        const val = vec[j];
        const curr = averaged[j];
        if (val !== undefined && curr !== undefined) {
          averaged[j] = curr + val;
        }
      }
    }
  }

  for (let j = 0; j < dimensions; j++) {
    const curr = averaged[j];
    if (curr !== undefined) {
      averaged[j] = curr / count;
    }
  }

  return averaged;
}

/**
 * Weighted average of multiple vectors
 * @param vectors - Array of vectors
 * @param weights - Array of weights (must sum to 1)
 * @returns Weighted average vector
 */
export function weightedAverageVectors(
  vectors: number[][],
  weights: number[]
): number[] {
  if (!vectors || vectors.length === 0) {
    throw new Error('Cannot average empty vector array');
  }

  if (!weights || weights.length !== vectors.length) {
    throw new Error('Weights array must match vectors array length');
  }

  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  if (Math.abs(weightSum - 1.0) > 0.0001) {
    throw new Error(`Weights must sum to 1.0, got ${weightSum}`);
  }

  const firstVector = vectors[0];
  if (!firstVector) {
    throw new Error('First vector is undefined');
  }
  const dimensions = firstVector.length;
  const averaged = new Array(dimensions).fill(0) as number[];

  for (let i = 0; i < vectors.length; i++) {
    const vec = vectors[i];
    const weight = weights[i];
    if (!vec || vec.length !== dimensions) {
      throw new Error('All vectors must have same dimensions');
    }
    if (weight === undefined) {
      throw new Error('Weight is undefined');
    }

    for (let j = 0; j < dimensions; j++) {
      const val = vec[j];
      const curr = averaged[j];
      if (val !== undefined && curr !== undefined) {
        averaged[j] = curr + val * weight;
      }
    }
  }

  return averaged;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Vector math utilities | OK |
/* AGENT FOOTER END */
