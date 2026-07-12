import { UniverseList } from '@/components/UniverseList';
import { getBiomes, getPlanets } from '@/lib/mergeData';

/**
 * The first screen answers exactly one question:
 *   "What is my best next world and task?"
 *
 * Server component: the data is read from data/planets.json at build time, so
 * there is no client fetch, no loading state, and no GitHub token in the browser.
 */
export default function Page() {
  const planets = getPlanets();
  const biomes = getBiomes();

  const now = planets.filter((p) => p.focusState === 'NOW').length;
  const quests = planets.reduce((n, p) => n + p.quests.length, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hyperfocus Universe</h1>
        <p className="mt-2 max-w-2xl text-inkDim">
          {planets.length} worlds. {now} burning bright right now, {quests} quests waiting. Every
          commit is world-building.
        </p>
      </header>

      <UniverseList planets={planets} biomes={biomes} />
    </main>
  );
}
