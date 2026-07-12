'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import type { Planet } from '@/types/planet';
import type { PlanetVisual } from '@/types/planetVisual';

interface Props {
  planet: Planet;
  visual: PlanetVisual;
  selected: boolean;
  /** True when the viewer asked their OS to reduce motion. Nothing moves. */
  still: boolean;
  onSelect: (planet: Planet) => void;
}

/**
 * One world.
 *
 * Every visual property is passed in from computePlanetVisual — this component
 * renders data, it never invents it.
 *
 * The whole mesh is aria-hidden by virtue of living in a <canvas>: the canvas is
 * hidden from assistive tech and UniverseScene renders a real, focusable DOM
 * button for every planet alongside it. A screen-reader user never touches WebGL.
 */
export function PlanetMesh({ planet, visual, selected, still, onSelect }: Props) {
  const orbitRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Beacon positions are deterministic (golden-angle spiral), so a quest light
  // stays where it was last time you looked.
  const beacons = useMemo(
    () =>
      Array.from({ length: visual.questBeacons }, (_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / Math.max(visual.questBeacons, 1));
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = visual.radius * 1.02;
        return [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ] as [number, number, number];
      }),
    [visual.questBeacons, visual.radius]
  );

  const moons = useMemo(
    () =>
      Array.from({ length: visual.moonCount }, (_, i) => ({
        distance: visual.radius + 1.1 + i * 0.5,
        speed: 0.5 + i * 0.18,
        phase: (i / Math.max(visual.moonCount, 1)) * Math.PI * 2,
      })),
    [visual.moonCount, visual.radius]
  );

  useFrame((state, delta) => {
    // The single gate. Reduced motion means the universe holds perfectly still —
    // planets stay exactly where computePlanetVisual placed them.
    if (still) return;
    if (orbitRef.current && !visual.frozen) {
      orbitRef.current.rotation.y += visual.orbitSpeed * delta;
    }
    if (bodyRef.current && !visual.frozen) {
      bodyRef.current.rotation.y += visual.spinSpeed * delta;
    }
  });

  const active = selected || hovered;
  // Storms and lava ride the emissive channel: an issue-heavy world literally
  // burns. Closing issues cools it down.
  const emissive = visual.glowIntensity + visual.lavaActivity * 0.6 + (active ? 0.5 : 0);

  return (
    <group ref={orbitRef} rotation={[0, visual.orbitAngle, visual.orbitInclination]}>
      <group position={[visual.orbitRadius, 0, 0]} rotation={[visual.axialTilt, 0, 0]}>
        <mesh
          ref={bodyRef}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(planet);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[visual.radius, 32, 32]} />
          <meshStandardMaterial
            color={visual.baseColor}
            roughness={visual.surfaceRoughness}
            metalness={visual.surfaceMetalness}
            emissive={visual.baseColor}
            emissiveIntensity={emissive}
          />
        </mesh>

        {/* Atmosphere. Thicker on stormy worlds. */}
        {visual.atmosphereIntensity > 0.1 && (
          <mesh scale={1.08}>
            <sphereGeometry args={[visual.radius, 24, 24]} />
            <meshBasicMaterial
              color={visual.accentColor}
              transparent
              opacity={visual.atmosphereIntensity * 0.18 + visual.cloudCoverage * 0.12}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Selection ring — the keyboard focus indicator, in 3D. */}
        {active && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[visual.radius * 1.35, visual.radius * 1.45, 48]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.9} side={2} />
          </mesh>
        )}

        {/* Rings are earned: written lore, or a shipped release. */}
        {visual.ringPresence && (
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <ringGeometry args={[visual.radius * 1.6, visual.radius * 2.2, 64]} />
            <meshBasicMaterial
              color={visual.accentColor}
              transparent
              opacity={0.15 + visual.ringDensity * 0.35}
              side={2}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* One light per unfinished quest. A dark world has nothing waiting. */}
        {beacons.map((position, i) => (
          <mesh key={i} position={position}>
            <sphereGeometry args={[visual.radius * 0.08, 8, 8]} />
            <meshBasicMaterial color="#fde68a" />
          </mesh>
        ))}

        {/* Moons = worlds bound to this one in lore. */}
        {moons.map((moon, i) => (
          <Moon key={i} {...moon} color={visual.accentColor} still={still} />
        ))}

        {/* Release flare. Only two repos in the universe have ever earned this. */}
        {visual.haloPulse > 0 && (
          <mesh>
            <sphereGeometry args={[visual.radius * 1.25, 20, 20]} />
            <meshBasicMaterial
              color="#fff7ed"
              transparent
              opacity={visual.haloPulse * 0.18}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

function Moon({
  distance,
  speed,
  phase,
  color,
  still,
}: {
  distance: number;
  speed: number;
  phase: number;
  color: string;
  still: boolean;
}) {
  const ref = useRef<Group>(null);
  useFrame((state, delta) => {
    if (still || !ref.current) return;
    ref.current.rotation.y += speed * delta * 0.4;
  });
  return (
    <group ref={ref} rotation={[0, phase, 0.3]}>
      <mesh position={[distance, 0, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}
