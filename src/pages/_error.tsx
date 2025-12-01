import { NextPageContext } from 'next';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
}

/**
 * Custom Pages Router error page
 * Handles errors for Pages Router compatibility during build
 */
function Error({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          {statusCode || 'Error'}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {statusCode === 404
            ? 'Page Not Found'
            : 'An Error Occurred'}
        </h2>
        <p className="text-gray-600 mb-8">
          {statusCode === 404
            ? "The page you're looking for doesn't exist."
            : 'Something went wrong. Please try again later.'}
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

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
