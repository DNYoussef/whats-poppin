import { NextRequest, NextResponse } from 'next/server';
import { startConversation, continueConversation } from '@/lib/ai/conversation';

/**
 * API Route: AI Search Conversation
 * Handles conversational event discovery
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messages } = body;

    // Assertion 1: Validate action
    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Assertion 2: Validate action type
    if (action !== 'start' && action !== 'continue') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "continue"' },
        { status: 400 }
      );
    }

    if (action === 'start') {
      const state = await startConversation();
      return NextResponse.json(state);
    }

    if (action === 'continue') {
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json(
          { error: 'Messages array is required for continue action' },
          { status: 400 }
        );
      }

      // Extract last user message
      const lastUserMessage = messages
        .filter((m: any) => m.role === 'user')
        .pop();

      if (!lastUserMessage) {
        return NextResponse.json(
          { error: 'No user message found' },
          { status: 400 }
        );
      }

      const currentState = {
        messages: messages.slice(0, -1), // All except the last user message
        preferences: {},
        isComplete: false,
        needsMoreInfo: true
      };

      const newState = await continueConversation(
        currentState,
        lastUserMessage.content
      );

      return NextResponse.json(newState);
    }

    return NextResponse.json(
      { error: 'Unknown error' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Conversation API error:', error);
    return NextResponse.json(
      { error: 'Failed to process conversation' },
      { status: 500 }
    );
  }
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T13:50:00 | coder@sonnet-4.5 | Conversation API route | OK |
/* AGENT FOOTER END */
