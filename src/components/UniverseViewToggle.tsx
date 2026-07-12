'use client';

export type ViewMode = 'list' | 'universe';

interface Props {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}

/**
 * List is the default, always. The 2D hub is the tool; the universe is the
 * reward. Someone on a weak machine, a screen reader, or a bad day should never
 * have to load WebGL to find out what they were working on.
 */
export function UniverseViewToggle({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="View mode" className="flex gap-2">
      {(['list', 'universe'] as const).map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(mode)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? 'border-focus bg-focus text-void'
                : 'border-edge bg-surface text-inkDim hover:bg-surfaceHi hover:text-ink'
            }`}
          >
            {mode === 'list' ? 'List' : 'Universe 3D'}
          </button>
        );
      })}
    </div>
  );
}
