'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for root layout errors
 * Must include its own html and body tags
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // Log error for debugging (in production, send to error tracking service)
  console.error('Global error:', error);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Server Error
            </h2>
            <p className="text-gray-600 mb-8">
              Something went wrong on our end. Please try again later.
            </p>
            <button
              onClick={reset}
              className="inline-block rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
