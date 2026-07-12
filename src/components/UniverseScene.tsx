'use client';

import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import type { Planet } from '@/types/planet';
import { computePlanetVisual } from '@/lib/computePlanetVisual';
import { PlanetMesh } from './PlanetMesh';

interface Props {
  planets: Planet[];
  onSelect: (planet: Planet, trigger: HTMLButtonElement | null) => void;
}

/** Live, reactive answer to "does this person want motion?". */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * The universe.
 *
 * ACCESSIBILITY — the honest solution to "3D is unreachable by keyboard":
 * a <canvas> is one opaque element. You cannot Tab to a sphere inside it, and
 * pretending otherwise is how projects end up claiming keyboard support they
 * don't have (see: the old constellation).
 *
 * So we don't pretend. The canvas is aria-hidden and NOT focusable — it is
 * decoration. Beside it we render a real <ul> of real <button>s, one per planet,
 * in NOW-first order. Those buttons are the actual interface: they are
 * Tab-reachable, they open the same PlanetSheet, and focusing one highlights its
 * world in 3D. Keyboard and mouse reach identical functionality; only the
 * spectacle differs.
 */
export function UniverseScene({ planets, onSelect }: Props) {
  const reducedMotion = useReducedMotion();
  const [focused, setFocused] = useState<string | null>(null);

  const worlds = useMemo(
    () => planets.map((planet) => ({ planet, visual: computePlanetVisual(planet) })),
    [planets]
  );

  return (
    <div className="relative">
      <div className="h-[70vh] min-h-[420px] overflow-hidden rounded-xl border border-edge bg-black/40">
        <Canvas
          camera={{ position: [0, 14, 38], fov: 50 }}
          aria-hidden="true"
          tabIndex={-1}
          dpr={[1, 1.8]}
        >
          <ambientLight intensity={0.35} />
          <pointLight position={[0, 0, 0]} intensity={2.2} distance={80} />
          <directionalLight position={[20, 20, 20]} intensity={0.4} />

          {/* Decorative only, and it stops dead under reduced motion. */}
          <Stars radius={120} depth={50} count={2500} factor={4} fade speed={reducedMotion ? 0 : 1} />

          {/* The core: everything orbits the centre of the Hyperfocus Zone. */}
          <mesh>
            <sphereGeometry args={[1.6, 32, 32]} />
            <meshBasicMaterial color="#7dd3fc" />
          </mesh>

          {worlds.map(({ planet, visual }) => (
            <PlanetMesh
              key={planet.repoId}
              planet={planet}
              visual={visual}
              selected={focused === planet.repoId}
              still={reducedMotion}
              onSelect={(p) => onSelect(p, null)}
            />
          ))}

          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={70}
            // Auto-rotation is the first thing to go for a vestibular-sensitive
            // viewer. Never on when they've asked for stillness.
            autoRotate={!reducedMotion}
            autoRotateSpeed={0.25}
          />
        </Canvas>
      </div>

      <p className="mt-3 text-sm text-inkDim">
        Drag to orbit, scroll to zoom. Size is codebase size · glow is activity · storms are
        open issues · beacons are quests · rings are written lore.
        {reducedMotion && ' Motion is off because your system asks for reduced motion.'}
      </p>

      {/* THE REAL INTERFACE. Not a fallback — the keyboard path to every world. */}
      <h3 className="mt-6 text-sm font-bold uppercase tracking-widest text-inkDim">
        All {worlds.length} worlds
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {worlds.map(({ planet, visual }) => (
          <li key={planet.repoId}>
            <button
              type="button"
              onClick={(event) => onSelect(planet, event.currentTarget)}
              onFocus={() => setFocused(planet.repoId)}
              onBlur={() => setFocused(null)}
              onMouseEnter={() => setFocused(planet.repoId)}
              onMouseLeave={() => setFocused(null)}
              className="flex items-center gap-2 rounded-lg border border-edge bg-surface
                         px-3 py-1.5 text-sm text-inkDim hover:bg-surfaceHi hover:text-ink"
              aria-label={`Open planet ${planet.displayName}. Status ${planet.focusState}. ${
                planet.quests.length === 1 ? '1 quest' : `${planet.quests.length} quests`
              }.`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: visual.baseColor }}
                aria-hidden="true"
              />
              {planet.displayName}
              {planet.quests.length > 0 && (
                <span className="rounded-full bg-amber-300/20 px-1.5 text-xs text-amber-200">
                  {planet.quests.length}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
