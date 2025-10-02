'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import 3D components to avoid SSR issues
const CanvasWrapper = dynamic(
  () => import('@/components/three/common/Canvas').then((mod) => mod.CanvasWrapper),
  { ssr: false }
);
const HeroScene = dynamic(
  () => import('@/components/three/HeroScene').then((mod) => mod.HeroScene),
  { ssr: false }
);

/**
 * Landing page component for What's Poppin! with 3D background
 * Displays hero section with call-to-action buttons and animated particles
 * @returns Landing page JSX element
 */
export default function HomePage(): JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden">
      {/* 3D Particle Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <CanvasWrapper camera={{ position: [0, 0, 8], fov: 75 }}>
          <HeroScene />
        </CanvasWrapper>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl text-center">
        {/* Hero Text with Background */}
        <div className="mb-8 rounded-2xl bg-background/80 backdrop-blur-md p-8 border border-border/50">
          <h1 className="mb-6 text-6xl font-bold tracking-tight">
            What&apos;s Poppin! 🎉
          </h1>

          <p className="mb-8 text-xl text-muted-foreground">
            Discover amazing local events powered by AI.
            Find concerts, festivals, sports, and more happening around you.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-border px-8 py-3 text-lg font-semibold hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <FeatureCard
            title="AI-Powered"
            description="Smart recommendations based on your preferences"
          />
          <FeatureCard
            title="Real-Time"
            description="Always up-to-date event information"
          />
          <FeatureCard
            title="Local First"
            description="Discover events happening in your area"
          />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

/**
 * Feature card component for landing page
 * @param props - Component props
 * @param props.title - Feature title
 * @param props.description - Feature description
 * @returns Feature card JSX element
 */
function FeatureCard({ title, description }: FeatureCardProps): JSX.Element {
  // NASA Rule 10: Assertions
  if (!title || title.length === 0) {
    throw new Error('FeatureCard requires a non-empty title');
  }
  if (!description || description.length === 0) {
    throw new Error('FeatureCard requires a non-empty description');
  }

  return (
    <div className="rounded-lg border border-border/50 bg-background/70 backdrop-blur-sm p-6 hover:bg-background/80 transition-all">
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T00:00:00 | base-template@sonnet-4.5 | Initial landing page | OK |
// | 1.1.0   | 2025-10-02T12:45:00 | coder@sonnet-4.5 | Add 3D particle background | OK |
// | 1.2.0   | 2025-10-02T12:55:00 | coder@sonnet-4.5 | Add backdrop blur and opacity to cards | OK |
/* AGENT FOOTER END */
