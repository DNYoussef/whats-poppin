import { NextRequest, NextResponse } from 'next/server';
import { findSmartRecommendations } from '@/lib/ai/smart-search';
import type { UserPreferences } from '@/lib/ai/conversation';

/**
 * API Route: AI Event Recommendations
 * Returns personalized event recommendations
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { preferences, userLocation, limit = 3 } = body;

    // Assertion 1: Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Preferences object is required' },
        { status: 400 }
      );
    }

    // Assertion 2: Validate limit
    if (typeof limit !== 'number' || limit < 1 || limit > 10) {
      return NextResponse.json(
        { error: 'Limit must be a number between 1 and 10' },
        { status: 400 }
      );
    }

    const recommendations = await findSmartRecommendations(
      preferences as UserPreferences,
      userLocation,
      limit
    );

    return NextResponse.json({
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T13:51:00 | coder@sonnet-4.5 | Recommendations API route | OK |
/* AGENT FOOTER END */
