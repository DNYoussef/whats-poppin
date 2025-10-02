// ============================================================================
// What's Poppin! - User Preferences API
// File: src/app/api/preferences/route.ts
// Description: API endpoints for user preferences
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  captureUserPreferences,
  getUserInteractionStats,
  hasCompletedOnboarding,
} from '@/lib/ai/preferences';
import { getUserPreferences } from '@/lib/ai/database';

// ============================================================================
// POST /api/preferences
// ============================================================================

/**
 * Save user preferences
 * Body: { userId, categories, interests }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, categories, interests } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category is required' },
        { status: 400 }
      );
    }

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: 'At least one interest is required' },
        { status: 400 }
      );
    }

    await captureUserPreferences(userId, { categories, interests });

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
    });
  } catch (error) {
    console.error('Save preferences error:', error);

    return NextResponse.json(
      {
        error: 'Failed to save preferences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/preferences
// ============================================================================

/**
 * Get user preferences
 * Query params: userId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const preferences = await getUserPreferences(userId);
    const stats = await getUserInteractionStats(userId);
    const onboardingComplete = await hasCompletedOnboarding(userId);

    return NextResponse.json({
      preferences,
      stats,
      onboardingComplete,
    });
  } catch (error) {
    console.error('Get preferences error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch preferences',
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
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Preferences API endpoint | OK |
/* AGENT FOOTER END */
