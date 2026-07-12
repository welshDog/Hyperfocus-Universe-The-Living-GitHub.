import planetsFile from '@data/planets.json';
import loreFile from '@data/lore.json';
import type { BiomeDefinition, FocusState, Lore, Planet, RawPlanet } from '@/types/planet';

/**
 * Merge live GitHub facts with hand-written lore.
 *
 * Precedence (as specified):
 *   live GitHub facts  >  lore narrative overrides  >  seed/computed fallback
 *
 * Lore is OPTIONAL. A repo with no lore entry still becomes a planet — it just
 * uses its computed biome and colour. That is why 67 of 84 worlds render at all.
 */

// Through `unknown`: TypeScript infers a literal key union for every distinct
// languageMix shape in the JSON (35+ of them), which will never structurally
// match Record<string, number>. The runtime shape is guaranteed by
// scripts/validate-data.js, which is where this contract is actually enforced.
const raw = planetsFile.planets as unknown as RawPlanet[];
const lore = (loreFile.planetLore ?? []) as Lore[];
const biomeDefs = (loreFile.biomeDefinitions ?? {}) as Record<string, BiomeDefinition>;

const loreByRepoId = new Map(lore.map((l) => [l.repoId, l]));

function toBiomeLabel(biome: string): string {
  return biome
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Words that are genuinely acronyms and must stay shouting. ADHD earns its
 *  place at the front — this is the one project that must never render it "Adhd". */
const ACRONYMS = new Set([
  'adhd', 'asd', 'nd', 'ai', 'agi', 'api', 'cli', 'ui', 'ux', '3d', '2d', 'id',
  'os', 'pc', 'gpu', 'cpu', 'ram', 'npm', 'sdk', 'mcp', 'xp', 'db', 'ide', 'pi',
  'vr', 'ar', 'nft', 'llm', 'ml', 'gpt', 'css', 'html', 'json', 'yaml', 'sql',
  'aws', 'ci', 'cd', 'io', 'pdf', 'svg', 'mvp', 'tts', 'ocr',
]);

/**
 * Make a repo slug readable WITHOUT inventing anything.
 *
 * 78 of 84 worlds have no hand-written lore, so they display their slug — and
 * raw slugs are ugly: "-MIND-VAULT-ULTIMATE-GAME", "hyper-help-zone-".
 *
 * This is typography, not lore. It only strips separators and fixes SHOUTING.
 * It does NOT correct spelling: "github-ai-mangaer-helper" stays "Mangaer",
 * because the repo really is misspelled and the hub must not quietly lie about
 * what it found. The true repoId is always rendered underneath.
 *
 * lore.planetName still wins over this, always.
 */
export function prettifySlug(slug: string): string {
  return slug
    .replace(/^[-_.]+|[-_.]+$/g, '') // leading/trailing junk: "-hyper-zone-"
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      // SHOUTED words get calmed down; deliberate casing (HyperCode,
      // HYPERFOCUSzone, dOoK) is left exactly as the author wrote it.
      if (/^[A-Z0-9.]+$/.test(word) && word.length > 3) {
        return word.charAt(0) + word.slice(1).toLowerCase();
      }
      if (/^[a-z0-9.]+$/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

const merged: Planet[] = raw.map((planet) => {
  const l = loreByRepoId.get(planet.repoId) ?? null;
  // Lore overrides identity (biome/colour) but never live facts.
  const biome = l?.biome ?? planet.biome;
  return {
    ...planet,
    biome,
    color: l?.color ?? planet.color,
    // Lore name wins; otherwise a readable slug. The raw repoId is still shown
    // beneath it on the card, so nothing is hidden.
    displayName: l?.planetName ?? prettifySlug(planet.repoId),
    biomeLabel: toBiomeLabel(biome),
    // Computed ONCE, at build, and shipped in the HTML. Calling timeAgo() during
    // render breaks hydration: the server renders "2 hours ago" at build time and
    // the browser recomputes a different string, which is React error #425.
    // <TimeAgo> takes this as its stable initial value and refreshes it after mount.
    pushedLabel: timeAgo(planet.pushedAt),
    lore: l,
  };
});

const FOCUS_ORDER: Record<FocusState, number> = { NOW: 0, NEXT: 1, RESTING: 2 };

/** NOW first, then NEXT, then RESTING — each group most-recently-pushed first. */
export function getPlanets(): Planet[] {
  return [...merged].sort((a, b) => {
    const byFocus = FOCUS_ORDER[a.focusState] - FOCUS_ORDER[b.focusState];
    if (byFocus !== 0) return byFocus;
    return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
  });
}

export function getBiomes(): string[] {
  return [...new Set(merged.map((p) => p.biome))].sort();
}

export function getBiomeDefinitions(): Record<string, BiomeDefinition> {
  return biomeDefs;
}

/** Search name, slug, biome, description AND quest text — quests are the point. */
export function matchesQuery(planet: Planet, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    planet.displayName,
    planet.repoId,
    planet.biomeLabel,
    planet.category,
    planet.description ?? '',
    planet.language ?? '',
    ...planet.quests.map((quest) => quest.title),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

/** "2 hours ago" — plain words, no guilt, no precision theatre. */
export function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? 'yesterday' : `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;
  const years = Math.round(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}
