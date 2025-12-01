// ============================================================================
// What's Poppin! - Update Embeddings Cron Job
// File: src/app/api/cron/update-embeddings/route.ts
// Description: Background job to generate embeddings for new events
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

// Force dynamic rendering - this route uses request.headers
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getEventsWithoutEmbeddings } from '@/lib/ai/database';
import { batchGenerateEventEmbeddings } from '@/lib/ai/embeddings';
import { batchSaveEventEmbeddings } from '@/lib/ai/database';
import { chunkArray } from '@/lib/ai/utils';

// ============================================================================
// GET /api/cron/update-embeddings
// ============================================================================

/**
 * Generate embeddings for events that don't have them
 * Vercel Cron: Every 6 hours
 * Auth: Bearer token in CRON_SECRET env var
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const events = await getEventsWithoutEmbeddings(200);

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All events have embeddings',
        processed: 0,
      });
    }

    const chunks = chunkArray(events, 50);
    let totalProcessed = 0;

    for (const chunk of chunks) {
      const embeddings = await batchGenerateEventEmbeddings(chunk);

      const embeddingMap = new Map<string, number[]>();

      for (let i = 0; i < chunk.length; i++) {
        const event = chunk[i];
        const embedding = embeddings[i];
        if (event && embedding) {
          embeddingMap.set(event.id, embedding);
        }
      }

      const saved = await batchSaveEventEmbeddings(embeddingMap);
      totalProcessed += saved;
    }

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      total: events.length,
    });
  } catch (error) {
    console.error('Update embeddings cron error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update embeddings',
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
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Embeddings cron job | OK |
/* AGENT FOOTER END */
