import OpenAI from 'openai';

// Lazy-loaded OpenAI client instance
// Avoids initialization during Next.js build when env vars aren't available
let _openaiClient: OpenAI | null = null;

/**
 * Get or create the OpenAI client instance
 * Validates API key on first access, not at module load time
 * @returns OpenAI client instance
 * @throws Error if API key is missing
 */
export function getOpenAIClient(): OpenAI {
  if (!_openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.length === 0) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }

    _openaiClient = new OpenAI({ apiKey });
  }

  return _openaiClient;
}

/**
 * @deprecated Use getOpenAIClient() instead for lazy initialization
 * Kept for backwards compatibility
 */
export const openai = {
  get chat() {
    return getOpenAIClient().chat;
  },
  get embeddings() {
    return getOpenAIClient().embeddings;
  },
};

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial OpenAI client setup | OK |
// | 1.1.0   | 2025-11-30T00:00:00 | claude@opus-4 | Lazy-load client to avoid build errors | OK |
/* AGENT FOOTER END */
