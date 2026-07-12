'use client';

import { useMemo, useRef, useState } from 'react';
import type { FocusState, Planet } from '@/types/planet';
import { matchesQuery } from '@/lib/mergeData';
import { PlanetCard } from './PlanetCard';
import { PlanetSheet } from './PlanetSheet';
import { FocusControl, type FocusFilter } from './FocusControl';
import { SearchControl } from './SearchControl';

interface Props {
  planets: Planet[];
  biomes: string[];
}

const GROUPS: { state: FocusState; title: string; blurb: string }[] = [
  { state: 'NOW', title: 'NOW', blurb: 'Your brightest active worlds' },
  { state: 'NEXT', title: 'NEXT', blurb: 'Warm and close by' },
  { state: 'RESTING', title: 'RESTING', blurb: 'Quiet worlds, honoured and preserved' },
];

export function UniverseList({ planets, biomes }: Props) {
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<FocusFilter>('ALL');
  const [biome, setBiome] = useState('ALL');
  const [open, setOpen] = useState<Planet | null>(null);
  // RESTING is collapsed by default: 67 quiet worlds must never bury the 10
  // that actually want you today.
  const [showResting, setShowResting] = useState(false);

  // Focus must return to the exact button that opened the sheet, or a keyboard
  // user is dumped back at the top of the page having lost their place.
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const visible = useMemo(
    () =>
      planets.filter(
        (planet) =>
          (focus === 'ALL' || planet.focusState === focus) &&
          (biome === 'ALL' || planet.biome === biome) &&
          matchesQuery(planet, query)
      ),
    [planets, focus, biome, query]
  );

  const counts = useMemo(
    () =>
      planets.reduce(
        (acc, planet) => {
          acc[planet.focusState] += 1;
          return acc;
        },
        { NOW: 0, NEXT: 0, RESTING: 0 } as Record<FocusState, number>
      ),
    [planets]
  );

  function openPlanet(planet: Planet, trigger: HTMLButtonElement | null) {
    triggerRef.current = trigger;
    setOpen(planet);
  }

  function closeSheet() {
    setOpen(null);
    triggerRef.current?.focus();
  }

  const questsVisible = visible.reduce((n, planet) => n + planet.quests.length, 0);

  return (
    <>
      <div className="flex flex-col gap-4">
        <SearchControl value={query} onChange={setQuery} />
        <FocusControl
          value={focus}
          counts={counts}
          onChange={setFocus}
          biome={biome}
          biomes={biomes}
          onBiomeChange={setBiome}
        />
      </div>

      {/* Filtering is a state change a sighted user sees instantly. Announce it
          so a screen-reader user learns the same thing at the same moment. */}
      <p aria-live="polite" className="mt-4 text-sm text-inkDim">
        Showing {visible.length} {visible.length === 1 ? 'world' : 'worlds'} ·{' '}
        {questsVisible} {questsVisible === 1 ? 'quest' : 'quests'}
      </p>

      <div id="universe" className="mt-6 space-y-10">
        {GROUPS.map(({ state, title, blurb }) => {
          const group = visible.filter((planet) => planet.focusState === state);
          if (group.length === 0) return null;

          const isResting = state === 'RESTING';
          // A search or an explicit RESTING filter is the user asking to see
          // them — don't make them click twice.
          const collapsed = isResting && !showResting && !query && focus !== 'RESTING';

          return (
            <section key={state} aria-labelledby={`group-${state}`}>
              <div className="flex items-baseline justify-between gap-4 border-b border-edge pb-2">
                <h2 id={`group-${state}`} className="text-sm font-bold uppercase tracking-widest">
                  {title}{' '}
                  <span className="font-normal normal-case tracking-normal text-inkDim">
                    — {blurb} ({group.length})
                  </span>
                </h2>
                {isResting && !query && focus !== 'RESTING' && (
                  <button
                    type="button"
                    aria-expanded={showResting}
                    aria-controls="resting-grid"
                    onClick={() => setShowResting((v) => !v)}
                    className="shrink-0 rounded-lg border border-edge px-3 py-1.5 text-sm
                               font-semibold text-inkDim hover:bg-surfaceHi hover:text-ink"
                  >
                    {showResting ? 'Hide' : `Show ${group.length}`}
                  </button>
                )}
              </div>

              {!collapsed && (
                <ul
                  id={isResting ? 'resting-grid' : undefined}
                  className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
                >
                  {group.map((planet) => (
                    <li key={planet.repoId}>
                      <PlanetCard planet={planet} onOpen={openPlanet} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-edge px-4 py-10 text-center text-inkDim">
            No worlds match that. Try a different search or clear the filters.
          </p>
        )}
      </div>

      {open && <PlanetSheet planet={open} onClose={closeSheet} />}
    </>
  );
}
