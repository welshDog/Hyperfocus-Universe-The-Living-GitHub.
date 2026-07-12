'use client';

import { useEffect, useRef } from 'react';
import type { Planet } from '@/types/planet';
import { timeAgo } from '@/lib/mergeData';

interface Props {
  planet: Planet;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The inspect step of discover -> inspect -> act.
 *
 * A real modal dialog: Escape closes it, focus moves in on open and is
 * RESTORED to the planet's button on close (handled by the parent, which owns
 * the trigger ref), and Tab is trapped so keyboard users can't fall out of the
 * dialog into the page behind it.
 */
export function PlanetSheet({ planet, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const questCount = planet.quests.length;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      {/* Backdrop. Clicking it closes, but it is NOT the only way out — Escape
          and the close button both work, so this is never a keyboard trap. */}
      <div
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="planet-sheet-title"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl
                   border border-edge bg-surface p-6 sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="planet-sheet-title"
              className="flex items-center gap-2 text-xl font-bold text-ink"
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: planet.color }}
                aria-hidden="true"
              />
              <span className="truncate">{planet.displayName}</span>
            </h2>
            <p className="mt-1 text-sm text-inkDim">
              {planet.repoId} · {planet.biomeLabel} · {planet.focusState}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-edge px-3 py-1.5 text-sm
                       font-semibold text-inkDim hover:bg-surfaceHi hover:text-ink"
          >
            Close
          </button>
        </div>

        {planet.lore ? (
          <div className="mt-5 space-y-2 border-l-2 pl-4" style={{ borderColor: planet.color }}>
            <p className="text-sm font-semibold text-ink">{planet.lore.civilization}</p>
            <p className="text-sm italic text-inkDim">&ldquo;{planet.lore.motto}&rdquo;</p>
            <p className="text-sm leading-relaxed text-inkDim">{planet.lore.story}</p>
          </div>
        ) : (
          planet.description && (
            <p className="mt-5 text-sm leading-relaxed text-inkDim">{planet.description}</p>
          )
        )}

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Fact label="Last push" value={timeAgo(planet.pushedAt)} />
          <Fact label="Language" value={planet.language ?? '—'} />
          <Fact label="Stars" value={String(planet.stars)} />
          <Fact label="Open issues" value={String(planet.openIssues)} />
        </dl>

        <section className="mt-6" aria-labelledby="quest-heading">
          <h3 id="quest-heading" className="text-sm font-bold uppercase tracking-wide text-inkDim">
            Quest log
          </h3>
          {questCount > 0 ? (
            <ul className="mt-3 space-y-2">
              {planet.quests.map((quest) => (
                <li
                  key={quest.title}
                  className="rounded-lg border border-edge bg-surfaceHi px-3 py-2 text-sm"
                >
                  {quest.url ? (
                    <a
                      href={quest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink hover:underline"
                    >
                      {quest.title} <span aria-hidden="true">↗</span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  ) : (
                    <span className="text-ink">{quest.title}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-edge px-3 py-3 text-sm text-inkDim">
              No quest signal yet — add a <code className="text-ink">WHATS-DONE.md</code> or an
              issue to light this world up.
            </p>
          )}
        </section>

        <a
          href={planet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-lg border border-edge bg-surfaceHi px-4 py-2
                     text-sm font-semibold text-ink hover:bg-edge"
        >
          Open Repo <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-inkDim">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}
