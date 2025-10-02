import OpenAI from 'openai';

/**
 * Validates OpenAI API key environment variable
 * @throws Error if API key is missing
 */
function validateOpenAIEnv(): void {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.length === 0) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
}

// NASA Rule 10: Validate environment on initialization
validateOpenAIEnv();

/**
 * OpenAI client instance
 * Configured with API key from environment variables
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Type-safe helper for OpenAI client access
 * @returns OpenAI client instance
 */
export function getOpenAIClient(): OpenAI {
  return openai;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial OpenAI client setup | OK |
/* AGENT FOOTER END */
