import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document for Pages Router
 * Required to properly handle Pages Router error pages (404, 500)
 * This prevents SSG errors with @react-three/drei Html component
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
