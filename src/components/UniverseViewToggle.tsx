'use client';

export type ViewMode = 'list' | 'universe';

interface Props {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}

const MODES = [
  { id: 'list' as const, label: 'List', hint: 'Your quests, as a calm command centre' },
  { id: 'universe' as const, label: 'Universe 3D', hint: 'The same worlds, as a solar system' },
];

/**
 * A real segmented control: one recessed track, one lit segment.
 *
 * List is the default, always. The 2D hub is the tool; the universe is the
 * reward. Someone on a weak machine, a screen reader, or a bad day should never
 * have to load WebGL to find out what they were working on.
 *
 * Still two native <button>s with aria-pressed — the polish is entirely in the
 * track and the glow, never in the semantics.
 */
export function UniverseViewToggle({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className="inline-flex rounded-xl border border-edge bg-void/60 p-1"
    >
      {MODES.map((mode) => {
        const active = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            aria-pressed={active}
            title={mode.hint}
            onClick={() => onChange(mode.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
                        transition-colors ${
                          active
                            ? 'bg-focus text-void shadow-[0_0_20px_-4px_theme(colors.focus)]'
                            : 'text-inkDim hover:text-ink'
                        }`}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {mode.id === 'list' ? '☰' : '🪐'}
            </span>
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
