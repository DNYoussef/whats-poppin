// ============================================================================
// What's Poppin! - Similar Events API
// File: src/app/api/events/[id]/similar/route.ts
// Description: Get events similar to a given event
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSimilarEvents } from '@/lib/ai/recommendations';

// ============================================================================
// GET /api/events/[id]/similar
// ============================================================================

/**
 * Get events similar to specified event
 * Query params:
 *   - limit: Number of similar events (default: 5, max: 20)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');

    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    if (isNaN(limit) || limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 20' },
        { status: 400 }
      );
    }

    const similarEvents = await getSimilarEvents(eventId, limit);

    return NextResponse.json({
      eventId,
      similarEvents,
      count: similarEvents.length,
    });
  } catch (error) {
    console.error('Similar events API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch similar events',
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
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Similar events API | OK |
/* AGENT FOOTER END */
