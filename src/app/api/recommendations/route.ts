// ============================================================================
// What's Poppin! - Recommendations API
// File: src/app/api/recommendations/route.ts
// Description: API endpoint for personalized event recommendations
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPersonalizedRecommendations } from '@/lib/ai/recommendations';
import { getUserRecommendations } from '@/lib/ai/database';

// ============================================================================
// GET /api/recommendations
// ============================================================================

/**
 * Get personalized event recommendations for user
 * Query params:
 *   - userId: User UUID (required)
 *   - limit: Number of recommendations (default: 10, max: 50)
 *   - fresh: If true, generate new recommendations (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const freshParam = searchParams.get('fresh');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    const useFresh = freshParam === 'true';

    let recommendations;

    if (useFresh) {
      recommendations = await getPersonalizedRecommendations(userId, limit);
    } else {
      const cached = await getUserRecommendations(userId, limit);

      if (cached && cached.length > 0) {
        recommendations = cached.map((rec) => ({
          ...rec.event,
          similarity_score: rec.score,
        }));
      } else {
        recommendations = await getPersonalizedRecommendations(userId, limit);
      }
    }

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
      cached: !useFresh,
    });
  } catch (error) {
    console.error('Recommendations API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch recommendations',
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
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Recommendations API endpoint | OK |
/* AGENT FOOTER END */
