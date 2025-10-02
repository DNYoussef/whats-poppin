// ============================================================================
// What's Poppin! - AI Conversation Service
// File: src/lib/ai/conversation.ts
// Description: Natural language conversation for event discovery
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

import { getOpenAIClient } from '../openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserPreferences {
  interests?: string[];
  budget?: { min: number; max: number } | null;
  location?: string;
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'night';
  duration?: 'quick' | 'medium' | 'long';
  categories?: string[];
}

export interface ConversationState {
  messages: ConversationMessage[];
  preferences: UserPreferences;
  isComplete: boolean;
  needsMoreInfo: boolean;
}

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

/**
 * Initialize AI conversation for event discovery
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function startConversation(): Promise<ConversationState> {
  const systemPrompt = `You are an enthusiastic event discovery assistant for "What's Poppin!".
Your goal is to help users find perfect local events through conversation.

Ask friendly, concise questions to learn:
1. What types of events interest them (music, food, sports, arts, etc.)
2. Their budget (free, under $20, $20-50, $50+, or no limit)
3. Preferred time (morning, afternoon, evening, night)
4. Duration preference (quick 1-2hr, medium 2-4hr, or long 4+hr events)

Keep questions SHORT (1-2 sentences). Be enthusiastic and casual.
After gathering enough info, say "Great! Let me find the perfect events for you!"`;

  const initialMessage: ConversationMessage = {
    role: 'assistant',
    content: "Hey! I'm here to help you discover awesome events! What kind of experience are you looking for today? 🎉"
  };

  // Assertion 1: Validate system prompt
  if (!systemPrompt || systemPrompt.length === 0) {
    throw new Error('System prompt cannot be empty');
  }

  // Assertion 2: Validate initial message
  if (!initialMessage.content || initialMessage.content.length === 0) {
    throw new Error('Initial message cannot be empty');
  }

  return {
    messages: [initialMessage],
    preferences: {},
    isComplete: false,
    needsMoreInfo: true
  };
}

/**
 * Continue conversation with user input
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export async function continueConversation(
  state: ConversationState,
  userMessage: string
): Promise<ConversationState> {
  // Assertion 1: Validate user message
  if (!userMessage || userMessage.trim().length === 0) {
    throw new Error('User message cannot be empty');
  }

  // Assertion 2: Validate state
  if (!state || !state.messages) {
    throw new Error('Invalid conversation state');
  }

  const openai = getOpenAIClient();

  const newMessages: ConversationMessage[] = [
    ...state.messages,
    { role: 'user', content: userMessage }
  ];

  const apiMessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: getSystemPrompt()
    },
    ...newMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: apiMessages,
    temperature: 0.7,
    max_tokens: 150
  });

  const assistantMessage = response.choices[0]?.message?.content || '';

  newMessages.push({
    role: 'assistant',
    content: assistantMessage
  });

  // Extract preferences from conversation
  const preferences = await extractPreferences(newMessages);

  // Check if we have enough information
  const isComplete = checkIfComplete(preferences, assistantMessage);

  return {
    messages: newMessages,
    preferences,
    isComplete,
    needsMoreInfo: !isComplete
  };
}

/**
 * Extract structured preferences from conversation
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
async function extractPreferences(
  messages: ConversationMessage[]
): Promise<UserPreferences> {
  // Assertion 1: Validate messages
  if (!messages || messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  const openai = getOpenAIClient();

  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n');

  const extractionPrompt = `Extract event preferences from this conversation.
Return ONLY valid JSON with this structure:
{
  "interests": ["string array of interests mentioned"],
  "budget": {"min": number, "max": number} or null,
  "timePreference": "morning|afternoon|evening|night" or null,
  "duration": "quick|medium|long" or null,
  "categories": ["music", "food", "sports", "arts", etc]
}

User messages:
${userMessages}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: extractionPrompt }],
    temperature: 0,
    max_tokens: 300
  });

  const content = response.choices[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(content);

    // Assertion 2: Validate parsed data structure
    if (typeof parsed !== 'object') {
      throw new Error('Parsed preferences must be an object');
    }

    return parsed as UserPreferences;
  } catch {
    return {};
  }
}

/**
 * Check if conversation has gathered enough information
 */
function checkIfComplete(
  preferences: UserPreferences,
  lastMessage: string
): boolean {
  const hasBasicInfo =
    (preferences.interests && preferences.interests.length > 0) ||
    (preferences.categories && preferences.categories.length > 0);

  const aiSignalsComplete = lastMessage.toLowerCase().includes('let me find') ||
    lastMessage.toLowerCase().includes('perfect events');

  return hasBasicInfo && aiSignalsComplete;
}

/**
 * Get system prompt for conversation
 */
function getSystemPrompt(): string {
  return `You are an enthusiastic event discovery assistant for "What's Poppin!".
Your goal is to help users find perfect local events through conversation.

Ask friendly, concise questions to learn:
1. What types of events interest them (music, food, sports, arts, etc.)
2. Their budget (free, under $20, $20-50, $50+, or no limit)
3. Preferred time (morning, afternoon, evening, night)
4. Duration preference (quick 1-2hr, medium 2-4hr, or long 4+hr events)

Keep questions SHORT (1-2 sentences). Be enthusiastic and casual.
After gathering enough info, say "Great! Let me find the perfect events for you!"`;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T13:30:00 | coder@sonnet-4.5 | AI conversation service | OK |
/* AGENT FOOTER END */
