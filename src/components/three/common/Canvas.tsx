'use client';

import { Canvas as R3FCanvas } from '@react-three/fiber';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

interface CanvasWrapperProps {
  children: ReactNode;
  className?: string;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
}

/**
 * Shared Canvas wrapper for all Three.js scenes
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export function CanvasWrapper({
  children,
  className = '',
  camera = { position: [0, 0, 5], fov: 75 },
}: CanvasWrapperProps): JSX.Element {
  // Assertion 1: Validate children
  if (!children) {
    throw new Error('CanvasWrapper requires children');
  }

  // Assertion 2: Validate camera position
  if (camera.position && camera.position.length !== 3) {
    throw new Error('Camera position must have exactly 3 coordinates');
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <R3FCanvas
        camera={camera}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </R3FCanvas>
    </div>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T12:45:00 | coder@sonnet-4.5 | Base Canvas wrapper | OK |
/* AGENT FOOTER END */
