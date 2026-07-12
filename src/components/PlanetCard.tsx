'use client';

import { forwardRef } from 'react';
import type { Planet } from '@/types/planet';
import { timeAgo } from '@/lib/mergeData';

interface Props {
  planet: Planet;
  onOpen: (planet: Planet, trigger: HTMLButtonElement | null) => void;
}

const FOCUS_BADGE: Record<Planet['focusState'], string> = {
  NOW: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  NEXT: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
  RESTING: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
};

/**
 * A world.
 *
 * Deliberately NOT one big clickable div: the card is an <article> holding two
 * real, separately-labelled actions. Nesting a link inside a button is invalid
 * HTML and breaks keyboard and screen-reader users, which is exactly the trap
 * the old constellation fell into.
 *
 * Nothing here is hover-only. Everything a mouse reveals, the keyboard and a
 * touch screen get too.
 */
export const PlanetCard = forwardRef<HTMLButtonElement, Props>(function PlanetCard(
  { planet, onOpen },
  ref
) {
  const questCount = planet.quests.length;
  const questLabel =
    questCount === 0 ? 'no quests' : questCount === 1 ? '1 quest' : `${questCount} quests`;

  return (
    <article className="rounded-xl border border-edge bg-surface p-5 transition-colors hover:border-edge/80 hover:bg-surfaceHi">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: planet.color }}
              aria-hidden="true"
            />
            <span className="truncate">{planet.displayName}</span>
          </h3>
          {/* If lore renamed it, the real slug still has to be findable. */}
          {planet.displayName !== planet.repoId && (
            <p className="truncate text-sm text-inkDim">{planet.repoId}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${
            FOCUS_BADGE[planet.focusState]
          }`}
        >
          {planet.focusState}
        </span>
      </div>

      <p className="mt-3 text-sm text-inkDim">
        {planet.biomeLabel}
        {planet.language ? ` · ${planet.language}` : ''} · Updated {timeAgo(planet.pushedAt)}
      </p>

      {questCount > 0 ? (
        <>
          <p className="mt-4 text-sm font-semibold text-ink">
            {questLabel} waiting
            {planet.questSource === 'issues' && (
              <span className="ml-2 font-normal text-inkDim">from open issues</span>
            )}
          </p>
          <ul className="mt-2 space-y-1">
            {planet.quests.map((quest) => (
              <li key={quest.title} className="flex gap-2 text-sm text-inkDim">
                <span aria-hidden="true">•</span>
                <span className="min-w-0">{quest.title}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        /* Gentle, never guilt-inducing. A quiet world is not a failure. */
        <p className="mt-4 rounded-lg border border-dashed border-edge px-3 py-2 text-sm text-inkDim">
          No quest signal yet — add a <code className="text-ink">WHATS-DONE.md</code> or an issue
          to light this world up.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          ref={ref}
          type="button"
          onClick={(event) => onOpen(planet, event.currentTarget)}
          className="rounded-lg bg-surfaceHi px-3 py-2 text-sm font-semibold text-ink
                     border border-edge hover:bg-edge"
          /* The screen-reader label carries name, focus status and quest count —
             the three things a sighted user gets from the layout at a glance. */
          aria-label={`Open planet ${planet.displayName}. Status ${planet.focusState}. ${questLabel}.`}
        >
          Open Planet
        </button>
        <a
          href={planet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-inkDim
                     border border-edge hover:bg-surfaceHi hover:text-ink"
        >
          Open Repo{' '}
          <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
});
