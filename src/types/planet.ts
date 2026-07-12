/**
 * The shapes that flow through the universe.
 *
 * repoId is the exact GitHub slug and is the ONLY join key between
 * planets.json (live facts), lore.json (narrative) and roster.seed.json
 * (identity). scripts/validate-data.js fails CI if it ever drifts.
 */

export type FocusState = 'NOW' | 'NEXT' | 'RESTING';

/** Where a planet's unfinished work came from. */
export type QuestSource = 'tracker' | 'issues' | 'none';

export interface Quest {
  title: string;
  /** Issue-sourced quests link out; tracker-sourced ones have no URL. */
  url: string | null;
}

/** One entry in data/planets.json — generated, never hand-edited. */
export interface RawPlanet {
  repoId: string;
  url: string;
  description: string | null;
  category: string;
  biome: string;
  color: string;
  seeded: boolean;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  /** Codebase size in KB. The 3D radius signal — see planetVisual.ts. */
  sizeKb: number;
  /** Issues closed in the last 30 days. This is what lets storms heal. */
  closedIssuesRecent: number;
  releaseCount: number;
  latestReleaseAt: string | null;
  /** Open pull requests -> moons. 18 of 84 — beats forks (max 1) as a signal. */
  openPRs: number;
  /** Top 3 languages as fractions -> the hero planet's biome bands. */
  languageMix: Record<string, number>;
  /** Has a README (or a WHATS-DONE). 77 of 84 — so it is used INVERSELY:
   *  the 7 worlds with no docs render barren. "This world has no map." */
  hasDocs: boolean;
  archived: boolean;
  isFork: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  focusState: FocusState;
  activityScore: number;
  questSource: QuestSource;
  quests: Quest[];
}

/** One entry in data/lore.json — hand-written, optional enrichment. */
export interface Lore {
  repoId: string;
  planetName: string;
  biome: string;
  civilization: string;
  mission: string;
  story: string;
  motto: string;
  color: string;
  manualConnections: string[];
  demoUrl: string | null;
  docsUrl: string | null;
}

export interface BiomeDefinition {
  description: string;
  primaryColor: string;
  terrainType: string;
}

/** A fully merged world, ready to render. Lore is optional by design. */
export interface Planet extends RawPlanet {
  /** lore.planetName if written, otherwise the repo slug. Never empty. */
  displayName: string;
  /** "neon-megacity" -> "Neon Megacity" */
  biomeLabel: string;
  /** Relative time baked at BUILD. Never call timeAgo() during render — it uses
   *  Date.now() and desynchronises server HTML from client hydration. */
  pushedLabel: string;
  lore: Lore | null;
}
