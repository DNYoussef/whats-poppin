// ============================================================================
// What's Poppin! - Batch Embeddings API
// File: src/app/api/embeddings/batch/route.ts
// Description: Batch generate embeddings for multiple events
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { batchGenerateEventEmbeddings } from '@/lib/ai/embeddings';
import { batchSaveEventEmbeddings } from '@/lib/ai/database';

// ============================================================================
// POST /api/embeddings/batch
// ============================================================================

/**
 * Batch generate embeddings for multiple events
 * Body: { events: Array<{ id?, title, description, category, tags }> }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'events array is required' },
        { status: 400 }
      );
    }

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'events array cannot be empty' },
        { status: 400 }
      );
    }

    if (events.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 events per batch' },
        { status: 400 }
      );
    }

    const embeddings = await batchGenerateEventEmbeddings(events);

    const embeddingMap = new Map<string, number[]>();

    for (let i = 0; i < events.length; i++) {
      if (events[i].id) {
        embeddingMap.set(events[i].id, embeddings[i]);
      }
    }

    let savedCount = 0;

    if (embeddingMap.size > 0) {
      savedCount = await batchSaveEventEmbeddings(embeddingMap);
    }

    return NextResponse.json({
      generated: embeddings.length,
      saved: savedCount,
      embeddings,
    });
  } catch (error) {
    console.error('Batch embeddings error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate batch embeddings',
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
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Batch embeddings API | OK |
/* AGENT FOOTER END */
