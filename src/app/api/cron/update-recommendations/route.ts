// ============================================================================
// What's Poppin! - Update Recommendations Cron Job
// File: src/app/api/cron/update-recommendations/route.ts
// Description: Background job to refresh user recommendations
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/database';
import { updateEventRecommendations } from '@/lib/ai/recommendations';
import { deleteExpiredRecommendations } from '@/lib/ai/database';

// ============================================================================
// GET /api/cron/update-recommendations
// ============================================================================

/**
 * Update recommendations for active users
 * Vercel Cron: Daily at 2 AM
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

    const deleted = await deleteExpiredRecommendations();

    const supabase = getSupabase();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activeUsers, error } = await supabase
      .from('user_event_interactions')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      throw new Error(`Failed to fetch active users: ${error.message}`);
    }

    const uniqueUserIds = [
      ...new Set(activeUsers?.map((u) => u.user_id) || []),
    ];

    let processedCount = 0;
    const errors: string[] = [];

    for (const userId of uniqueUserIds) {
      try {
        await updateEventRecommendations(userId);
        processedCount++;
      } catch (err) {
        errors.push(`${userId}: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total: uniqueUserIds.length,
      deleted,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    console.error('Update recommendations cron error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update recommendations',
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
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Recommendations cron job | OK |
/* AGENT FOOTER END */
