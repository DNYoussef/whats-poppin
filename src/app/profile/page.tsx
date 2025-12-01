// Force dynamic rendering - server component with dynamic client imports
export const dynamic = 'force-dynamic';

import { ProfilePageClient } from './ProfilePageClient';

/**
 * User profile page
 * Server component wrapper that renders the client-side profile page
 * @returns Profile page
 */
export default function ProfilePage() {
  return <ProfilePageClient />;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | coder@sonnet-4.5 | Profile page implementation | OK |
// | 2.0.0   | 2025-12-01T00:00:00 | claude@opus-4.5 | Split into server/client components for SSG fix | OK |
/* AGENT FOOTER END */
