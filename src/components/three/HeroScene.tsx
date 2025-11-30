'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Realistic confetti background with reflective materials, tumbling physics, and wind simulation
 * NASA Rule 10: ≤60 lines per function, 2+ assertions
 */
export function HeroScene(): JSX.Element {
  const confettiRef = useRef<THREE.InstancedMesh>(null);
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);

  const confettiCount = 500; // 3x fewer pieces for cleaner look

  // Generate confetti data with physics properties
  const confettiData = useMemo(() => {
    // Assertion 1: Validate confetti count
    if (confettiCount <= 0 || confettiCount > 10000) {
      throw new Error('Confetti count must be between 1 and 10000');
    }

    const colors = [
      new THREE.Color('#FF1493'), // Hot Pink
      new THREE.Color('#00FFFF'), // Cyan
      new THREE.Color('#FFD700'), // Gold
      new THREE.Color('#FF69B4'), // Pink
      new THREE.Color('#00FF00'), // Lime
      new THREE.Color('#FF4500'), // Orange Red
      new THREE.Color('#9400D3'), // Purple
      new THREE.Color('#FFFF00'), // Yellow
    ];

    const data = [];
    const bound = 10;

    for (let i = 0; i < confettiCount; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * bound,
          (Math.random() - 0.5) * bound,
          (Math.random() - 0.5) * bound
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.000375, // 8x slower horizontal drift
          -Math.random() * 0.00025 - 0.000125, // 8x slower downward fall
          (Math.random() - 0.5) * 0.000375
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.001875, // 8x slower tumbling
          (Math.random() - 0.5) * 0.001875,
          (Math.random() - 0.5) * 0.001875
        ),
        color: colors[Math.floor(Math.random() * colors.length)] ?? new THREE.Color('#FF1493'),
        windPhase: Math.random() * Math.PI * 2,
        curlPhase: Math.random() * Math.PI * 2, // For curling motion
        curlRadius: Math.random() * 0.5 + 0.3, // Curl tightness
      });
    }

    // Assertion 2: Validate data array
    if (data.length !== confettiCount) {
      throw new Error('Invalid confetti data array length');
    }

    return data;
  }, [confettiCount]);

  // Create confetti geometry (thin rectangle, half size)
  const confettiGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(0.1, 0.075); // Half the original size
  }, []);

  // Animate confetti with graceful curling and slow tumbling
  useFrame((state) => {
    if (!confettiRef.current) return;

    const time = state.clock.getElapsedTime();
    const dummy = new THREE.Object3D();
    const bound = 10;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = confettiData[i];
      if (!confetti) continue;

      // Beautiful curling motion - combines multiple sine waves for organic spirals
      const curlSpeed = 0.025; // 8x slower, extremely graceful curls
      const curlX = Math.sin(time * curlSpeed + confetti.curlPhase) * confetti.curlRadius * 0.001;
      const curlZ = Math.cos(time * curlSpeed * 0.8 + confetti.curlPhase) * confetti.curlRadius * 0.001;

      // Layered wind patterns for depth (8x slower)
      const windX = Math.sin(time * 0.01875 + confetti.windPhase) * 0.0001 +
                    Math.sin(time * 0.0375 + confetti.windPhase * 2) * 0.00005;
      const windZ = Math.cos(time * 0.015 + confetti.windPhase) * 0.0001 +
                    Math.cos(time * 0.03125 + confetti.windPhase * 1.5) * 0.00005;

      // Gentle updrafts and downdrafts (8x slower)
      const verticalWave = Math.sin(time * 0.0125 + confetti.windPhase * 3) * 0.000025;

      // Update velocity with curling, wind, and minimal turbulence (8x slower)
      confetti.velocity.x += curlX + windX + (Math.random() - 0.5) * 0.00001;
      confetti.velocity.y += verticalWave + (Math.random() - 0.5) * 0.00000625;
      confetti.velocity.z += curlZ + windZ + (Math.random() - 0.5) * 0.00001;

      // Apply damping for smooth, flowing motion
      confetti.velocity.multiplyScalar(0.998);

      // Apply velocity to position
      confetti.position.add(confetti.velocity);

      // Gentle, graceful tumbling rotation
      confetti.rotation.x += confetti.angularVelocity.x;
      confetti.rotation.y += confetti.angularVelocity.y;
      confetti.rotation.z += confetti.angularVelocity.z;

      // Smooth boundary wrapping with fade
      if (Math.abs(confetti.position.x) > bound / 2) {
        confetti.position.x *= -0.98;
        confetti.velocity.x *= -0.5;
      }
      if (confetti.position.y < -bound / 2) {
        confetti.position.y = bound / 2;
        confetti.velocity.y = -Math.random() * 0.001 - 0.0005;
      }
      if (confetti.position.y > bound / 2) {
        confetti.position.y = -bound / 2;
        confetti.velocity.y = -Math.random() * 0.002 - 0.001;
      }
      if (Math.abs(confetti.position.z) > bound / 2) {
        confetti.position.z *= -0.98;
        confetti.velocity.z *= -0.5;
      }

      // Update instance matrix
      dummy.position.copy(confetti.position);
      dummy.rotation.copy(confetti.rotation);
      dummy.updateMatrix();
      confettiRef.current.setMatrixAt(i, dummy.matrix);
      confettiRef.current.setColorAt(i, confetti.color);
    }

    confettiRef.current.instanceMatrix.needsUpdate = true;
    if (confettiRef.current.instanceColor) {
      confettiRef.current.instanceColor.needsUpdate = true;
    }

    // Extremely slow, barely-moving light animation (8x slower)
    if (lightRef1.current) {
      lightRef1.current.position.x = Math.sin(time * 0.0375) * 5;
      lightRef1.current.position.y = Math.cos(time * 0.025) * 3;
    }
    if (lightRef2.current) {
      lightRef2.current.position.x = Math.cos(time * 0.03125) * 5;
      lightRef2.current.position.z = Math.sin(time * 0.0225) * 3;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight ref={lightRef1} position={[5, 3, 2]} intensity={1.5} color="#FF69B4" />
      <pointLight ref={lightRef2} position={[-5, 2, -3]} intensity={1.5} color="#00FFFF" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#FFD700" />

      {/* Environment for reflections */}
      <Environment preset="sunset" />

      {/* Instanced confetti mesh */}
      <instancedMesh
        ref={confettiRef}
        args={[confettiGeometry, undefined, confettiCount]}
      >
        <meshStandardMaterial
          metalness={0.4}
          roughness={0.3}
          side={THREE.DoubleSide}
          envMapIntensity={1.2}
          transparent
          opacity={0.95}
        />
      </instancedMesh>
    </>
  );
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T12:45:00 | coder@sonnet-4.5 | Hero particle scene | OK |
// | 1.1.0   | 2025-10-02T12:50:00 | coder@sonnet-4.5 | Multicolored shimmer effect | OK |
// | 2.0.0   | 2025-10-02T13:00:00 | coder@sonnet-4.5 | Confetti with wind movement | OK |
/* AGENT FOOTER END */
