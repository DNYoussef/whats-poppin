'use client';

import Link from 'next/link';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error handler for App Router
 * Catches unhandled errors at the root level
 * Must be a Client Component and define its own html/body tags
 * NASA Rule 10: <=60 lines, 2+ assertions
 */
export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): JSX.Element {
  // Assertion 1: Validate error object
  if (!error) {
    throw new Error('GlobalError requires an error object');
  }

  // Assertion 2: Validate reset function
  if (typeof reset !== 'function') {
    throw new Error('GlobalError requires a reset function');
  }

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #faf5ff, #fdf2f8)',
            padding: '1rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontSize: '3.75rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem',
              }}
            >
              500
            </h1>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '1rem',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                color: '#4b5563',
                marginBottom: '2rem',
              }}
            >
              An unexpected error occurred. Please try again.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  display: 'inline-block',
                  borderRadius: '0.5rem',
                  backgroundColor: '#9333ea',
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <Link
                href="/"
                style={{
                  display: 'inline-block',
                  borderRadius: '0.5rem',
                  backgroundColor: '#6b7280',
                  padding: '0.75rem 1.5rem',
                  color: 'white',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-12-01T00:00:00 | claude@opus-4 | App Router global error handler | OK |
/* AGENT FOOTER END */
