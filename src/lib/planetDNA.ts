import type { Planet } from '@/types/planet';

/**
 * Planet DNA — the genome of a single world, for descend mode only.
 *
 * Two sources, and the split is deliberate:
 *
 *   SEED traits   come from a hash of repoId. They decide the world's SHAPE —
 *                 where the continents fall, how the mountains run. Arbitrary,
 *                 but stable forever: the same repo always regenerates the same
 *                 world. This is the "infinite variety" the spec wanted, and it
 *                 costs no API calls.
 *
 *   DATA traits   come from live GitHub facts. They decide the world's STATE —
 *                 storms, lava, city lights, moons, whether it's frozen. These
 *                 CHANGE as you work. Close an issue and the storms recede.
 *
 * A trait must never be in both. If activity decided continent shape, the map
 * of your world would rearrange itself every time you pushed — and a world you
 * can't learn is a world you can't return to.
 */
export interface PlanetDNA {
  seed: number;

  // ---- shape: from the seed. permanent. ----
  landmass: number; // 0 ocean world .. 1 supercontinent
  ruggedness: number; // smooth plains .. shattered peaks
  continentScale: number; // few huge landmasses .. archipelago
  axialTilt: number;
  iceCaps: number; // polar cap size

  // ---- state: from the data. changes as you work. ----
  /** Primary land colour, from the world's biome. */
  landColor: string;
  /** Second band, from the 2nd language in the mix. Null if a monoglot world. */
  bandColor: string | null;
  oceanColor: string;
  /** Open issues. Storm bands and cyclones. */
  storms: number;
  /** Open issues. Glowing tectonic seams. */
  lava: number;
  /** Stars. A rare reward: only 6 worlds in the universe light up at night. */
  cityLights: number;
  /** Open PRs. Moons — work in flight, orbiting. */
  moons: number;
  /** Lore, or a shipped release. Rings are earned. */
  rings: number;
  /** Unfinished quests. Beacons on the surface, with a beam to the sky. */
  beacons: number;
  /** No README. The surface goes barren and unmapped. */
  barren: boolean;
  /** Archived. Frozen, still, pale. A museum, not a failure. */
  frozen: boolean;
  /** A recent release. A halo pulse. Only 2 worlds have ever earned this. */
  celebration: number;
}

/** FNV-1a. Deterministic across machines, unlike anything involving Math.random. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable pseudo-random in [0,1) for a named trait of a given world. */
function trait(repoId: string, name: string): number {
  return (hash(repoId + '::' + name) % 10000) / 10000;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const log10 = (n: number) => Math.log10(n + 1);

/** Language -> a colour for that biome band. Falls back to the planet's own hue. */
const LANGUAGE_COLOR: Record<string, string> = {
  TypeScript: '#3b82f6',
  JavaScript: '#eab308',
  Python: '#22c55e',
  HTML: '#f97316',
  CSS: '#a855f7',
  Shell: '#64748b',
  Rust: '#f97316',
  Go: '#06b6d4',
  Java: '#ef4444',
  'C++': '#ec4899',
  C: '#94a3b8',
  Solidity: '#8b5cf6',
  Dockerfile: '#0ea5e9',
};

export function computePlanetDNA(planet: Planet): PlanetDNA {
  const id = planet.repoId;

  const languages = Object.keys(planet.languageMix ?? {});
  const second = languages[1];

  return {
    seed: hash(id),

    // Shape: seed only. This world looks like this forever.
    landmass: 0.25 + trait(id, 'landmass') * 0.55,
    ruggedness: 0.2 + trait(id, 'rugged') * 0.8,
    continentScale: 1.6 + trait(id, 'scale') * 3.4,
    axialTilt: (trait(id, 'tilt') - 0.5) * 0.9,
    iceCaps: planet.archived
      ? 0.55 // an archived world ices over
      : 0.06 + trait(id, 'ice') * 0.22,

    // State: live data. This world is LIKE THIS because of what you did.
    landColor: planet.color,
    bandColor: second ? (LANGUAGE_COLOR[second] ?? null) : null,
    oceanColor: planet.biome === 'industrial-foundry' ? '#3b1d0e' : '#0a2a4a',

    storms: clamp(planet.openIssues * 0.03 - planet.closedIssuesRecent * 0.05, 0, 1),
    lava: clamp(planet.openIssues * 0.02, 0, 1),
    // Stars are near-zero across this universe (max 3), which is exactly why they
    // are a REWARD and not a backbone. Six worlds get a night side full of cities.
    cityLights: clamp(log10(planet.stars) * 1.4, 0, 1),
    moons: clamp(planet.openPRs, 0, 5),
    rings: planet.lore ? 0.8 : planet.releaseCount > 0 ? 0.5 : 0,
    beacons: clamp(planet.quests.length, 0, 8),
    barren: !planet.hasDocs,
    frozen: planet.archived,
    celebration: clamp(log10(planet.releaseCount) * 0.9, 0, 1),
  };
}
