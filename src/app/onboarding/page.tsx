// ============================================================================
// What's Poppin! - Onboarding Page
// File: src/app/onboarding/page.tsx
// Description: Server component wrapper for user onboarding flow
// NASA Rule 10: All functions ≤60 lines, 2+ assertions
// ============================================================================

// Force dynamic rendering - server component with dynamic client imports
export const dynamic = 'force-dynamic';

import { OnboardingPageClient } from './OnboardingPageClient';

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | backend-dev@sonnet-4.5 | Onboarding page | OK |
// | 2.0.0   | 2025-12-01T00:00:00 | claude@opus-4.5 | Split into server/client components for SSG fix | OK |
/* AGENT FOOTER END */
