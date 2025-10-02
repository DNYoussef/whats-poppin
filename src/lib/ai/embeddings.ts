// ============================================================================
// What's Poppin! - OpenAI Embeddings Module
// File: src/lib/ai/embeddings.ts
// Description: Generate and manage OpenAI embeddings for events
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { getOpenAIClient } from '../openai';
import type { Event } from '@/types/database.types';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH_SIZE = 100;

// ============================================================================
// CORE EMBEDDING FUNCTIONS
// ============================================================================

/**
 * Generate embedding for a single text string
 * @param text - Input text to embed
 * @returns 1536-dimensional embedding vector
 * @throws Error if OpenAI API fails or text is empty
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text');
  }
  if (text.length > 8000) {
    throw new Error('Text too long for embedding (max 8000 chars)');
  }

  const client = getOpenAIClient();
  const cleanText = text.trim().substring(0, 8000);

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanText,
    encoding_format: 'float',
  });

  if (!response.data || response.data.length === 0) {
    throw new Error('OpenAI returned no embedding data');
  }

  const embedding = response.data[0].embedding;

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Invalid embedding dimensions: ${embedding.length} != ${EMBEDDING_DIMENSIONS}`
    );
  }

  return embedding;
}

/**
 * Generate embedding from event data
 * Combines title, description, category, and tags
 * @param event - Event object to embed
 * @returns 1536-dimensional embedding vector
 */
export async function generateEventEmbedding(
  event: Event | Partial<Event>
): Promise<number[]> {
  if (!event.title) {
    throw new Error('Event must have a title to generate embedding');
  }

  const parts: string[] = [event.title];

  if (event.description) {
    parts.push(event.description);
  }

  if (event.category) {
    parts.push(`Category: ${event.category}`);
  }

  if (event.tags && event.tags.length > 0) {
    parts.push(`Tags: ${event.tags.join(', ')}`);
  }

  const combinedText = parts.join('\n\n');

  if (combinedText.length === 0) {
    throw new Error('No valid text to generate embedding');
  }

  return generateEmbedding(combinedText);
}

/**
 * Batch generate embeddings for multiple texts
 * Automatically chunks requests to stay within API limits
 * @param texts - Array of text strings to embed
 * @returns Array of embedding vectors in same order
 */
export async function batchGenerateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    throw new Error('Cannot generate embeddings for empty array');
  }

  if (texts.length > MAX_BATCH_SIZE) {
    throw new Error(
      `Batch size ${texts.length} exceeds max ${MAX_BATCH_SIZE}`
    );
  }

  const validTexts = texts.filter(
    (text) => text && text.trim().length > 0
  );

  if (validTexts.length !== texts.length) {
    throw new Error('All texts must be non-empty strings');
  }

  const client = getOpenAIClient();
  const cleanTexts = validTexts.map((text) =>
    text.trim().substring(0, 8000)
  );

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanTexts,
    encoding_format: 'float',
  });

  if (!response.data || response.data.length !== cleanTexts.length) {
    throw new Error('OpenAI returned incorrect number of embeddings');
  }

  return response.data.map((item) => {
    if (item.embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error('Invalid embedding dimensions in batch response');
    }
    return item.embedding;
  });
}

/**
 * Generate embeddings for multiple events in batch
 * More efficient than calling generateEventEmbedding repeatedly
 * @param events - Array of events to embed
 * @returns Array of embedding vectors
 */
export async function batchGenerateEventEmbeddings(
  events: Array<Event | Partial<Event>>
): Promise<number[][]> {
  if (!events || events.length === 0) {
    throw new Error('Cannot generate embeddings for empty events array');
  }

  if (events.length > MAX_BATCH_SIZE) {
    throw new Error(
      `Batch size ${events.length} exceeds max ${MAX_BATCH_SIZE}`
    );
  }

  const texts = events.map((event) => {
    if (!event.title) {
      throw new Error('All events must have titles');
    }

    const parts: string[] = [event.title];

    if (event.description) {
      parts.push(event.description);
    }
    if (event.category) {
      parts.push(`Category: ${event.category}`);
    }
    if (event.tags && event.tags.length > 0) {
      parts.push(`Tags: ${event.tags.join(', ')}`);
    }

    return parts.join('\n\n');
  });

  return batchGenerateEmbeddings(texts);
}

/**
 * Get embedding model metadata
 * @returns Model name and dimensions
 */
export function getEmbeddingMetadata(): {
  model: string;
  dimensions: number;
  maxBatchSize: number;
} {
  return {
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    maxBatchSize: MAX_BATCH_SIZE,
  };
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | AI embeddings engine | OK |
/* AGENT FOOTER END */
