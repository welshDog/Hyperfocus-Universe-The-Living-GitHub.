'use client';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

/**
 * Searches quest text as well as names — "what was I doing about the parser?"
 * is a more common question than "which repo is called what?".
 */
export function SearchControl({ value, onChange }: Props) {
  return (
    <div className="w-full sm:max-w-sm">
      <label htmlFor="universe-search" className="sr-only">
        Search worlds and quests
      </label>
      <input
        id="universe-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search worlds and quests…"
        className="w-full rounded-lg border border-edge bg-surface px-4 py-2 text-sm
                   text-ink placeholder:text-inkDim"
      />
    </div>
  );
}
