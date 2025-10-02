import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "What's Poppin! - Discover Local Events",
  description: 'AI-powered event discovery platform connecting you to the best local experiences',
  keywords: ['events', 'discovery', 'local', 'entertainment', 'AI'],
  authors: [{ name: "What's Poppin Team" }],
  openGraph: {
    title: "What's Poppin!",
    description: 'Discover amazing local events powered by AI',
    type: 'website',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout component for the Next.js application
 * Provides global HTML structure, fonts, and metadata
 * @param props - Component props
 * @param props.children - Child components to render
 * @returns Root layout with children
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  // NASA Rule 10: Assertions
  if (!children) {
    throw new Error('RootLayout requires children');
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial root layout | OK |
/* AGENT FOOTER END */
