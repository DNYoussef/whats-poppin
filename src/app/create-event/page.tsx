// ============================================================================
// What's Poppin! - Create Event Page
// File: create-event/page.tsx
// Description: Server component wrapper for event creation form
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

// Force dynamic rendering - server component with dynamic client imports
export const dynamic = 'force-dynamic';

import { CreateEventPageClient } from './CreateEventPageClient';

/**
 * Event creation page
 * Server component wrapper that renders the client-side form
 * @returns Event creation form
 */
export default function CreateEventPage() {
  return <CreateEventPageClient />;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event creation page | OK |
// | 2.0.0   | 2025-12-01T00:00:00 | claude@opus-4.5 | Split into server/client components for SSG fix | OK |
/* AGENT FOOTER END */
