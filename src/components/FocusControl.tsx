'use client';

import type { FocusState } from '@/types/planet';

export type FocusFilter = FocusState | 'ALL';

interface Props {
  value: FocusFilter;
  counts: Record<FocusState, number>;
  onChange: (next: FocusFilter) => void;
  biome: string;
  biomes: string[];
  onBiomeChange: (next: string) => void;
}

const HINT: Record<FocusFilter, string> = {
  ALL: 'Every world',
  NOW: 'Pushed in the last 7 days',
  NEXT: 'Pushed in the last 30 days',
  RESTING: 'Quiet, preserved, still yours',
};

/**
 * NOW / NEXT / RESTING.
 *
 * These are DERIVED from pushed_at, never hand-maintained — manual state goes
 * stale, and stale state is exactly the ADHD tax this project exists to remove.
 *
 * A real toggle group: aria-pressed on native buttons, so a screen reader
 * announces the state rather than relying on a colour change.
 */
export function FocusControl({
  value,
  counts,
  onChange,
  biome,
  biomes,
  onBiomeChange,
}: Props) {
  const options: FocusFilter[] = ['ALL', 'NOW', 'NEXT', 'RESTING'];
  const countFor = (option: FocusFilter) =>
    option === 'ALL' ? counts.NOW + counts.NEXT + counts.RESTING : counts[option];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label="Filter worlds by focus state"
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option)}
              title={HINT[option]}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border-focus bg-focus text-void'
                  : 'border-edge bg-surface text-inkDim hover:bg-surfaceHi hover:text-ink'
              }`}
            >
              {option === 'ALL' ? 'All' : option}{' '}
              <span className={active ? 'text-void/70' : 'text-inkDim'}>
                ({countFor(option)})
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="biome-filter" className="text-sm font-semibold text-inkDim">
          Biome
        </label>
        <select
          id="biome-filter"
          value={biome}
          onChange={(event) => onBiomeChange(event.target.value)}
          className="rounded-lg border border-edge bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="ALL">All biomes</option>
          {biomes.map((b) => (
            <option key={b} value={b}>
              {b
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
