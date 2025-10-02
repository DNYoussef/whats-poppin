// ============================================================================
// What's Poppin! - Embeddings API
// File: src/app/api/embeddings/route.ts
// Description: API endpoints for generating embeddings
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  generateEventEmbedding,
  batchGenerateEventEmbeddings,
} from '@/lib/ai/embeddings';

// ============================================================================
// POST /api/embeddings/generate
// ============================================================================

/**
 * Generate embedding for a single event
 * Body: { eventId, title, description, category, tags }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { eventId, title, description, category, tags } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    const embedding = await generateEventEmbedding({
      title,
      description,
      category,
      tags,
    });

    let saved = false;

    if (eventId) {
      await saveEventEmbedding(eventId, embedding);
      saved = true;
    }

    return NextResponse.json({
      embedding,
      dimensions: embedding.length,
      saved,
    });
  } catch (error) {
    console.error('Generate embedding error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate embedding',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Embeddings API endpoint | OK |
/* AGENT FOOTER END */
