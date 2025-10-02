// ============================================================================
// What's Poppin! - Event Interactions API
// File: src/app/api/interactions/route.ts
// Description: Track user interactions with events
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { trackEventInteraction } from '@/lib/ai/preferences';

// ============================================================================
// POST /api/interactions
// ============================================================================

/**
 * Track user interaction with event
 * Body: { userId, eventId, type: 'viewed' | 'saved' | 'rsvp' | 'attended' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, eventId, type } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    const validTypes = ['viewed', 'saved', 'rsvp', 'attended'];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const interaction = await trackEventInteraction(userId, eventId, type);

    return NextResponse.json({
      success: true,
      interaction,
    });
  } catch (error) {
    console.error('Track interaction error:', error);

    return NextResponse.json(
      {
        error: 'Failed to track interaction',
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
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Interactions API endpoint | OK |
/* AGENT FOOTER END */
