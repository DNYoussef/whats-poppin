import Link from 'next/link';

/**
 * Custom 404 page for Pages Router compatibility
 */
export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
