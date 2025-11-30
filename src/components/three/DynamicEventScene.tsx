// ============================================================================
// What's Poppin! - Dynamic Event Scene Component
// File: DynamicEventScene.tsx
// Description: Renders AI-generated 3D event page designs
// NASA Rule 10: All functions ≤60 lines
// ============================================================================

'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Design3DSpec } from '@/lib/ai/page-designer';

interface DynamicEventSceneProps {
  design: Design3DSpec;
  eventTitle?: string;
  eventDescription?: string;
}

/**
 * Dynamic 3D scene based on AI-generated design specs
 * @param design - 3D design specifications
 * @param eventTitle - Event title for text overlay
 * @param eventDescription - Event description for text overlay
 * @returns 3D scene component
 */
export function DynamicEventScene({
  design,
  eventTitle,
  eventDescription: _eventDescription
}: DynamicEventSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          position={design.camera.position as [number, number, number]}
        />

        <DynamicLighting lighting={design.lighting} />
        <DynamicParticles particles={design.particles} />
        <DynamicCenterpiece centerpiece={design.centerpiece} />

        {eventTitle && (
          <DynamicText
            text={eventTitle}
            position={[0, 2, 0]}
            size={design.text.titleSize}
            animation={design.text.titleAnimation}
          />
        )}

        {design.camera.animation !== 'static' && (
          <DynamicCamera
            animation={design.camera.animation}
            speed={design.camera.speed}
          />
        )}

        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}

/**
 * Dynamic lighting based on design specs
 */
function DynamicLighting({ lighting }: { lighting: Design3DSpec['lighting'] }) {
  return (
    <>
      <ambientLight
        intensity={lighting.ambient.intensity}
        color={lighting.ambient.color}
      />

      {lighting.spotlights.map((spotlight, index) => (
        <spotLight
          key={index}
          position={spotlight.position as [number, number, number]}
          angle={spotlight.angle}
          intensity={spotlight.intensity}
          penumbra={spotlight.penumbra}
          color={spotlight.color}
        />
      ))}
    </>
  );
}

/**
 * Dynamic particle system based on design specs
 */
function DynamicParticles({
  particles
}: {
  particles: Design3DSpec['particles'];
}) {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particles.count * 3);
    const colors = new Float32Array(particles.count * 3);
    const spread = 15;

    for (let i = 0; i < particles.count; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = (Math.random() - 0.5) * spread;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;

      const colorIndex = i % particles.colors.length;
      const colorValue = particles.colors[colorIndex] ?? '#ffffff';
      const color = new THREE.Color(colorValue);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return { positions, colors };
  }, [particles.count, particles.colors]);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const positionAttr = particlesRef.current.geometry.attributes.position;
    if (!positionAttr) return;

    const time = clock.getElapsedTime();
    const positions = positionAttr.array as Float32Array;

    for (let i = 0; i < particles.count; i++) {
      const i3 = i * 3;
      const x = positions[i3] ?? 0;
      const y = positions[i3 + 1] ?? 0;
      const z = positions[i3 + 2] ?? 0;

      let newX = x;
      let newY = y;
      let newZ = z;

      if (particles.movement === 'wind') {
        newX += Math.sin(time + i) * 0.0005 * particles.speed;
        newY += Math.cos(time + i) * 0.0003 * particles.speed;
      } else if (particles.movement === 'float') {
        newY += Math.sin(time + i) * 0.001 * particles.speed;
      } else if (particles.movement === 'orbit') {
        const radius = Math.sqrt(x ** 2 + z ** 2);
        const angle = Math.atan2(z, x);
        const newAngle = angle + 0.001 * particles.speed;
        newX = radius * Math.cos(newAngle);
        newZ = radius * Math.sin(newAngle);
      }

      positions[i3] = Math.abs(newX) > 15 ? newX * -0.5 : newX;
      positions[i3 + 1] = Math.abs(newY) > 15 ? newY * -0.5 : newY;
      positions[i3 + 2] = Math.abs(newZ) > 15 ? newZ * -0.5 : newZ;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particles.size}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Dynamic centerpiece based on design specs
 */
function DynamicCenterpiece({
  centerpiece
}: {
  centerpiece: Design3DSpec['centerpiece'];
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();

    if (centerpiece.animation === 'rotate') {
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.rotation.x = time * 0.2;
    } else if (centerpiece.animation === 'pulse') {
      const scale = 1 + Math.sin(time * 2) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
    } else if (centerpiece.animation === 'morph') {
      meshRef.current.rotation.y = time * 0.3;
      const scale = 1 + Math.sin(time) * 0.1;
      meshRef.current.scale.set(scale, 1, scale);
    }
  });

  const geometry = useMemo(() => {
    switch (centerpiece.type) {
      case 'sphere':
        return <sphereGeometry args={[centerpiece.size, 32, 32]} />;
      case 'box':
        return <boxGeometry args={[centerpiece.size, centerpiece.size, centerpiece.size]} />;
      case 'torus':
        return <torusGeometry args={[centerpiece.size, centerpiece.size * 0.4, 16, 100]} />;
      default:
        return <sphereGeometry args={[centerpiece.size, 32, 32]} />;
    }
  }, [centerpiece.type, centerpiece.size]);

  const material = useMemo(() => {
    const baseProps = {
      color: centerpiece.material.color,
      transparent: true,
      opacity: centerpiece.material.opacity
    };

    switch (centerpiece.material.type) {
      case 'standard':
        return (
          <meshStandardMaterial
            {...baseProps}
            metalness={centerpiece.material.metalness || 0.5}
            roughness={centerpiece.material.roughness || 0.5}
          />
        );
      case 'phong':
        return (
          <meshPhongMaterial
            {...baseProps}
            shininess={centerpiece.material.shininess || 30}
          />
        );
      case 'glass':
        return (
          <meshPhysicalMaterial
            {...baseProps}
            metalness={0.1}
            roughness={0.1}
            transmission={0.9}
            thickness={0.5}
          />
        );
      default:
        return <meshStandardMaterial {...baseProps} />;
    }
  }, [centerpiece.material]);

  return (
    <mesh ref={meshRef} position={centerpiece.position as [number, number, number]}>
      {geometry}
      {material}
    </mesh>
  );
}

/**
 * Dynamic text with animations
 */
function DynamicText({
  text,
  position,
  size,
  animation
}: {
  text: string;
  position: [number, number, number];
  size: number;
  animation: string;
}) {
  const textRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (!textRef.current) return;

    const time = clock.getElapsedTime();

    if (animation === 'float') {
      textRef.current.position.y = position[1] + Math.sin(time) * 0.2;
    } else if (animation === 'pulse') {
      const scale = 1 + Math.sin(time * 2) * 0.1;
      textRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={size}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
      maxWidth={10}
    >
      {text}
    </Text>
  );
}

/**
 * Dynamic camera animations
 */
function DynamicCamera({
  animation,
  speed
}: {
  animation: string;
  speed: number;
}) {
  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime() * speed;

    if (animation === 'orbit') {
      camera.position.x = Math.cos(time * 0.2) * 8;
      camera.position.z = Math.sin(time * 0.2) * 8;
      camera.lookAt(0, 0, 0);
    } else if (animation === 'zoom') {
      camera.position.z = 8 + Math.sin(time) * 2;
    } else if (animation === 'dolly') {
      camera.position.y = 3 + Math.sin(time * 0.5) * 1;
    }
  });

  return null;
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-10-02T16:00:00 | coder@sonnet-4.5 | Dynamic 3D scene renderer | OK |
/* AGENT FOOTER END */
