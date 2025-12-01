// Force dynamic rendering - server component with dynamic client imports
export const dynamic = 'force-dynamic';

import { HomePageClient } from './HomePageClient';

/**
 * Landing page for What's Poppin!
 * Server component wrapper that renders the client-side homepage
 * @returns Landing page JSX element
 */
export default function HomePage(): JSX.Element {
  return <HomePageClient />;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial landing page | OK |
// | 1.1.0   | 2025-10-02T12:45:00 | coder@sonnet-4.5 | Add 3D particle background | OK |
// | 1.2.0   | 2025-10-02T12:55:00 | coder@sonnet-4.5 | Add backdrop blur and opacity to cards | OK |
// | 2.0.0   | 2025-12-01T00:00:00 | claude@opus-4.5 | Split into server/client components for SSG fix | OK |
/* AGENT FOOTER END */
