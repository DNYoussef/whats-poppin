/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    // typedRoutes disabled - causes issues with dynamic redirect URLs
    // typedRoutes: true,
  },
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Transpile Three.js packages to avoid SSG issues with @react-three/drei Html component
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Webpack configuration to handle Three.js packages in SSR
  webpack: (config, { isServer }) => {
    // Prevent @react-three/drei Html component from importing next/document during SSG
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'next/document': 'next/document',
      });
    }
    return config;
  },
};

module.exports = nextConfig;

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial Next.js configuration | OK |
/* AGENT FOOTER END */
