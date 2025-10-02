// ============================================================================
// What's Poppin! - Event Design Save API
// File: api/events/[id]/design/route.ts
// Description: Save selected AI design to database
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Save selected AI design
 * PUT /api/events/[id]/design
 * Body: { design: EventPageDesign }
 * @param req - Next.js request object
 * @param params - Route parameters
 * @returns Saved design confirmation
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { design } = await req.json();
    const eventId = params.id;

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!design || typeof design !== 'object') {
      return NextResponse.json(
        { error: 'Design object is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Deactivate existing active designs
    await supabase
      .from('event_designs')
      .update({ is_active: false })
      .eq('event_id', eventId)
      .eq('is_active', true);

    // Insert new design
    const { data, error } = await supabase
      .from('event_designs')
      .insert({
        event_id: eventId,
        theme: design.theme,
        description: design.description,
        features: design.features,
        spec: design.spec,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save design: ${error.message}`);
    }

    return NextResponse.json({ success: true, design: data });
  } catch (error) {
    console.error('Design save error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save design',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get active design for event
 * GET /api/events/[id]/design
 * @param req - Next.js request object
 * @param params - Route parameters
 * @returns Active design or null
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const eventId = params.id;

    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('event_designs')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch design: ${error.message}`);
    }

    return NextResponse.json({ design: data || null });
  } catch (error) {
    console.error('Design fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch design',
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
// | 1.0.0   | 2025-10-02T16:32:00 | backend-dev@sonnet-4.5 | Design save API | OK |
/* AGENT FOOTER END */
