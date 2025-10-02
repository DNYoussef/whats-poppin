'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Mesh } from 'three';

interface EventCard3DProps {
  color?: string;
  position?: [number, number, number];
  onHover?: (hovered: boolean) => void;
}

/**
 * 3D event card with hover effects
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export function EventCard3D({
  color = '#8b5cf6',
  position = [0, 0, 0],
  onHover,
}: EventCard3DProps): JSX.Element {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Assertion 1: Validate position
  if (position.length !== 3) {
    throw new Error('Position must have exactly 3 coordinates');
  }

  // Assertion 2: Validate color format
  if (!color.startsWith('#') || (color.length !== 7 && color.length !== 4)) {
    throw new Error('Color must be a valid hex code');
  }

  // Animate on hover
  useFrame(() => {
    if (!meshRef.current) return;

    const targetRotation = hovered ? 0.1 : 0;
    const targetY = hovered ? position[1] + 0.2 : position[1];

    meshRef.current.rotation.x +=
      (targetRotation - meshRef.current.rotation.x) * 0.1;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.1;
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[2, 3, 0.2]}
      position={position}
      radius={0.1}
      smoothness={4}
      onPointerOver={() => {
        setHovered(true);
        onHover?.(true);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover?.(false);
      }}
    >
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
    </RoundedBox>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T12:47:00 | coder@sonnet-4.5 | 3D event card | OK |
/* AGENT FOOTER END */
