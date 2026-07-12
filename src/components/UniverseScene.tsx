'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import type { FocusState, Planet } from '@/types/planet';
import { computeOrbit, computePlanetVisual } from '@/lib/computePlanetVisual';
import { computePlanetDNA } from '@/lib/planetDNA';
import { PlanetMesh } from './PlanetMesh';
import { HeroPlanet } from './HeroPlanet';
import { DescendCamera } from './DescendCamera';

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
  /** The one world we have descended into. null = system view. */
  const [hero, setHero] = useState<Planet | null>(null);
  const heroTrigger = useRef<HTMLButtonElement | null>(null);
  const heroPanel = useRef<HTMLDivElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);

  const descend = useCallback((planet: Planet, trigger: HTMLButtonElement | null) => {
    heroTrigger.current = trigger;
    setHero(planet);
  }, []);

  const ascend = useCallback(() => {
    setHero(null);
    // Focus must come back to the exact world you left from, or a keyboard user
    // returns to the system with no idea where they were.
    heroTrigger.current?.focus();
  }, []);

  // Escape gets you out of a world, the same way it gets you out of the sheet.
  useEffect(() => {
    if (!hero) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        ascend();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hero, ascend]);

  // Move focus into the panel on descend, so a screen reader announces where it
  // just landed instead of sitting silently on a button that now does something
  // else. preventScroll is load-bearing: the descend buttons live BELOW the
  // canvas, so a default focus() yanks the page down and the world you just flew
  // into is left above the fold. Bring the canvas into view instead.
  useEffect(() => {
    if (!hero) return;
    heroPanel.current?.focus({ preventScroll: true });
    canvasWrap.current?.scrollIntoView({
      block: 'center',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [hero, reducedMotion]);

  const heroDNA = useMemo(() => (hero ? computePlanetDNA(hero) : null), [hero]);

  // Distribute WITHIN each focus shell, so a world's position depends on its
  // index among its own peers. This is what makes NOW / NEXT / RESTING read as
  // three distinct rings instead of one undifferentiated smear.
  const worlds = useMemo(() => {
    const shells: Record<FocusState, Planet[]> = { NOW: [], NEXT: [], RESTING: [] };
    // Sort first so the layout is stable regardless of incoming order.
    [...planets]
      .sort((a, b) => a.repoId.localeCompare(b.repoId))
      .forEach((planet) => shells[planet.focusState].push(planet));

    return (Object.keys(shells) as FocusState[]).flatMap((state) =>
      shells[state].map((planet, index) => {
        const orbit = computeOrbit(index, shells[state].length, state, planet.repoId);
        return {
          planet,
          visual: computePlanetVisual(planet),
          position: [orbit.x, orbit.y, orbit.z] as [number, number, number],
        };
      })
    );
  }, [planets]);

  return (
    <div className="relative">
      <div
        ref={canvasWrap}
        className="relative h-[70vh] min-h-[420px] overflow-hidden rounded-xl border border-edge bg-black/40"
      >
        {/* Camera sits back far enough to hold the whole RESTING shell (r≈47) in
            frame. The first pass framed at z=38 and the outer worlds swung right
            past the lens — one planet filled a third of the screen. */}
        {/* Raked from above so the three focus rings read as concentric orbits.
            Straight-on, they collapse into one another and the hierarchy is lost. */}
        <Canvas
          camera={{ position: [0, 46, 84], fov: 45 }}
          aria-hidden="true"
          tabIndex={-1}
          dpr={[1, 1.8]}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 0, 0]} intensity={3.5} distance={140} decay={1.4} />
          <directionalLight position={[30, 30, 30]} intensity={0.35} />

          {/* Decorative only, and it stops dead under reduced motion. */}
          <Stars radius={200} depth={60} count={2500} factor={4} fade speed={reducedMotion ? 0 : 1} />

          <DescendCamera descended={Boolean(hero)} still={reducedMotion} />

          {/* ONE world at full detail. Everything else in the system is unmounted
              while we are down here — the entire GPU budget goes to this planet. */}
          {hero && heroDNA && <HeroPlanet dna={heroDNA} still={reducedMotion} />}

          {/* The core: the centre of the Hyperfocus Zone, and the light source
              every world is lit by. */}
          {!hero && (
            <mesh>
              <sphereGeometry args={[2.4, 32, 32]} />
              <meshBasicMaterial color="#7dd3fc" />
            </mesh>
          )}

          {/* Faint guides for the three focus rings. Without them the shells are
              just a scatter; with them you can SEE that NOW is the inner orbit. */}
          {!hero &&
            (
              [
                { r: 13, opacity: 0.3 },
                { r: 26, opacity: 0.16 },
                { r: 43, opacity: 0.08 },
              ] as const
            ).map(({ r, opacity }) => (
              <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[r - 0.06, r + 0.06, 128]} />
                <meshBasicMaterial color="#7dd3fc" transparent opacity={opacity} side={2} />
              </mesh>
            ))}

          {!hero &&
            worlds.map(({ planet, visual, position }) => (
              <PlanetMesh
                key={planet.repoId}
                planet={planet}
                visual={visual}
                position={position}
                selected={focused === planet.repoId}
                still={reducedMotion}
                onSelect={(p) => descend(p, null)}
              />
            ))}

          {/* Camera control is disabled during the descent flight, or the tween
              and the user fight each other for the camera. */}
          <OrbitControls
            enablePan={false}
            enabled={!hero}
            minDistance={20}
            maxDistance={160}
            // Auto-rotation is the first thing to go for a vestibular-sensitive
            // viewer. Never on when they've asked for stillness.
            autoRotate={!reducedMotion && !hero}
            autoRotateSpeed={0.25}
          />
        </Canvas>

        {/* The descend panel. A real, focusable DOM surface over the canvas —
            because a <canvas> announces nothing, and a world you cannot read is
            a world you cannot work in. */}
        {hero && (
          <div
            ref={heroPanel}
            tabIndex={-1}
            role="region"
            aria-label={`Descended into ${hero.displayName}`}
            className="absolute inset-x-0 bottom-0 rounded-b-xl border-t border-edge
                       bg-void/85 p-5 backdrop-blur-sm sm:inset-y-0 sm:left-auto sm:right-0
                       sm:w-96 sm:overflow-y-auto sm:rounded-l-xl sm:rounded-br-xl sm:border-l sm:border-t-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-ink">{hero.displayName}</h3>
                <p className="truncate text-sm text-inkDim">
                  {hero.repoId} · {hero.biomeLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={ascend}
                className="shrink-0 rounded-lg border border-edge px-3 py-1.5 text-sm
                           font-semibold text-inkDim hover:bg-surfaceHi hover:text-ink"
              >
                ← Back
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-inkDim">
              <Reading label="Moons" value={`${hero.openPRs} open PR${hero.openPRs === 1 ? '' : 's'}`} />
              <Reading label="Storms" value={`${hero.openIssues} open issue${hero.openIssues === 1 ? '' : 's'}`} />
              <Reading label="Beacons" value={`${hero.quests.length} quest${hero.quests.length === 1 ? '' : 's'}`} />
              <Reading
                label="Surface"
                value={hero.hasDocs ? 'Mapped' : 'Barren — no README'}
              />
            </dl>

            {hero.quests.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {hero.quests.map((quest) => (
                  <li
                    key={quest.title}
                    className="rounded-lg border border-edge bg-surface px-3 py-2 text-sm text-ink"
                  >
                    {quest.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-edge px-3 py-3 text-sm text-inkDim">
                No quest signal yet — this world has no beacons lit.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={(event) => onSelect(hero, event.currentTarget)}
                className="rounded-lg border border-edge bg-surfaceHi px-3 py-2 text-sm
                           font-semibold text-ink hover:bg-edge"
              >
                Open quest log
              </button>
              <a
                href={hero.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-edge px-3 py-2 text-sm font-semibold
                           text-inkDim hover:bg-surfaceHi hover:text-ink"
              >
                Open Repo <span aria-hidden="true">↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-inkDim">
        {hero
          ? 'Press Escape or Back to return to the system. Continents come from the repo name and never change; storms, moons and city lights come from live GitHub data and do.'
          : 'Drag to orbit, scroll to zoom. Pick a world to descend into it. Size is codebase size · glow is activity · storms are open issues · beacons are quests · rings are written lore.'}
        {reducedMotion && ' Motion is off because your system asks for reduced motion.'}
      </p>

      {/* THE REAL INTERFACE. Not a fallback — the keyboard path into every world. */}
      <h3 className="mt-6 text-sm font-bold uppercase tracking-widest text-inkDim">
        All {worlds.length} worlds
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {worlds.map(({ planet, visual }) => {
          const isHero = hero?.repoId === planet.repoId;
          return (
            <li key={planet.repoId}>
              <button
                type="button"
                onClick={(event) =>
                  isHero ? ascend() : descend(planet, event.currentTarget)
                }
                onFocus={() => setFocused(planet.repoId)}
                onBlur={() => setFocused(null)}
                onMouseEnter={() => setFocused(planet.repoId)}
                onMouseLeave={() => setFocused(null)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                  isHero
                    ? 'border-focus bg-focus/15 text-ink'
                    : 'border-edge bg-surface text-inkDim hover:bg-surfaceHi hover:text-ink'
                }`}
                aria-label={
                  isHero
                    ? `Leave ${planet.displayName} and return to the system.`
                    : `Descend into ${planet.displayName}. Status ${planet.focusState}. ${
                        planet.quests.length === 1 ? '1 quest' : `${planet.quests.length} quests`
                      }.`
                }
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
          );
        })}
      </ul>
    </div>
  );
}

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-edge bg-surface px-2.5 py-1.5">
      <dt className="uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}
