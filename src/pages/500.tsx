import Link from 'next/link';

/**
 * Custom 500 page for Pages Router
 * This prevents SSG errors with @react-three/drei Html component
 */
export default function Custom500() {
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
          Server Error
        </h2>
        <p
          style={{
            color: '#4b5563',
            marginBottom: '2rem',
          }}
        >
          Something went wrong on our end. Please try again later.
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
