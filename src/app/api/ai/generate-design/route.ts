// ============================================================================
// What's Poppin! - AI Design Generation API
// File: api/ai/generate-design/route.ts
// Description: Generate AI-powered event page designs
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateEventDesigns } from '@/lib/ai/page-designer';
import { getSupabase } from '@/lib/database';

/**
 * Generate AI event page designs
 * POST /api/ai/generate-design
 * Body: { eventId: string }
 * @param req - Next.js request object
 * @returns Array of 3 design variations
 */
export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json();

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const designs = await generateEventDesigns(event);

    if (!designs || designs.length === 0) {
      throw new Error('No designs generated');
    }

    return NextResponse.json({ designs, eventId });
  } catch (error) {
    console.error('Design generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate designs',
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
// | 1.0.0   | 2025-10-02T16:25:00 | backend-dev@sonnet-4.5 | Design generation API | OK |
/* AGENT FOOTER END */
