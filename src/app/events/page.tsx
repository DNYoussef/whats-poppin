// ============================================================================
// What's Poppin! - Event Listing Page
// File: events/page.tsx
// Description: Server component wrapper for event discovery page
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

// Force dynamic rendering - server component with dynamic client imports
export const dynamic = 'force-dynamic';

import { EventsPageClient } from './EventsPageClient';

/**
 * Event listing page
 * Server component wrapper that renders the client-side events page
 * @returns Event discovery page
 */
export default function EventsPage() {
  return <EventsPageClient />;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial events page placeholder | OK |
// | 2.0.0   | 2025-10-02T14:30:00 | coder@sonnet-4.5 | Event listing page with search and filters | OK |
// | 2.1.0   | 2025-10-02T13:52:00 | coder@sonnet-4.5 | Integrate AI search assistant | OK |
// | 3.0.0   | 2025-12-01T00:00:00 | claude@opus-4.5 | Split into server/client components for SSG fix | OK |
/* AGENT FOOTER END */
