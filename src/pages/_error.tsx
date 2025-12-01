import { NextPageContext } from 'next';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
}

/**
 * Custom Error page for Pages Router
 * Handles 404, 500, and other HTTP errors
 * This prevents SSG errors with @react-three/drei Html component
 */
function Error({ statusCode }: ErrorProps) {
  const title = statusCode === 404 ? 'Page Not Found' : 'Server Error';
  const message =
    statusCode === 404
      ? "The page you're looking for doesn't exist or has been moved."
      : 'Something went wrong on our end. Please try again later.';

  return (
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
          {statusCode || 'Error'}
        </h1>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            color: '#4b5563',
            marginBottom: '2rem',
          }}
        >
          {message}
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            borderRadius: '0.5rem',
            backgroundColor: '#9333ea',
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
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
