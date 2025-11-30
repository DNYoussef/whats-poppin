'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh } from 'three';

interface VenueSceneProps {
  eventTheme?: 'music' | 'sports' | 'food' | 'art' | 'default';
}

/**
 * 3D venue visualization for event detail pages
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export function VenueScene({ eventTheme = 'default' }: VenueSceneProps): JSX.Element {
  const meshRef = useRef<Mesh>(null);

  // Assertion 1: Validate theme
  const validThemes = ['music', 'sports', 'food', 'art', 'default'];
  if (!validThemes.includes(eventTheme)) {
    throw new Error(`Invalid event theme: ${eventTheme}`);
  }

  // Theme colors
  const themeColors: Record<string, string> = {
    music: '#8b5cf6',
    sports: '#3b82f6',
    food: '#f59e0b',
    art: '#ec4899',
    default: '#6366f1',
  };

  // Assertion 2: Validate theme color exists
  const color = themeColors[eventTheme];
  if (!color) {
    throw new Error(`No color defined for theme: ${eventTheme}`);
  }

  // Animate mesh
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    meshRef.current.rotation.y = time * 0.2;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
        />
      </Sphere>
    </>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T12:45:00 | coder@sonnet-4.5 | Venue 3D scene | OK |
/* AGENT FOOTER END */
