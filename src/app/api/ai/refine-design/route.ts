// ============================================================================
// What's Poppin! - AI Design Refinement API
// File: api/ai/refine-design/route.ts
// Description: Refine AI-generated designs based on feedback
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { refineDesign } from '@/lib/ai/page-designer';
import type { EventPageDesign } from '@/lib/ai/page-designer';

/**
 * Refine AI event page design
 * POST /api/ai/refine-design
 * Body: { design: EventPageDesign, feedback: string }
 * @param req - Next.js request object
 * @returns Refined design
 */
export async function POST(req: NextRequest) {
  try {
    const { design, feedback } = await req.json();

    if (!design || typeof design !== 'object') {
      return NextResponse.json(
        { error: 'Design object is required' },
        { status: 400 }
      );
    }

    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      );
    }

    const refinedDesign = await refineDesign(
      design as EventPageDesign,
      feedback.trim()
    );

    if (!refinedDesign) {
      throw new Error('Failed to refine design');
    }

    return NextResponse.json({ refinedDesign });
  } catch (error) {
    console.error('Design refinement error:', error);
    return NextResponse.json(
      {
        error: 'Failed to refine design',
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
// | 1.0.0   | 2025-10-02T16:26:00 | backend-dev@sonnet-4.5 | Design refinement API | OK |
/* AGENT FOOTER END */
