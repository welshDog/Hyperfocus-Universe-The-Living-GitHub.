import type { Planet } from '@/types/planet';
import type { PlanetVisual } from '@/types/planetVisual';

/**
 * Repo data -> planet appearance.
 *
 * THE RULE: every value below traces to a GitHub fact. Nothing is random, and
 * nothing is decorative. If two worlds look different, they ARE different.
 *
 * Calibrated against the ACTUAL universe (84 repos, measured 2026-07-12), not
 * against an imagined popular one:
 *   stars  max 3   (6 repos non-zero)  -> USELESS as a size signal
 *   forks  max 1   (4 repos non-zero)  -> USELESS as a moon signal
 *   sizeKb 1..481,833 (84/84 non-zero) -> excellent, orders of magnitude apart
 * A spec that sized planets by stars would have rendered 84 identical spheres.
 */

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const log10 = (n: number) => Math.log10(n + 1);

/** Deterministic angle from the repo slug. Same world, same place, every load —
 *  a universe that reshuffles itself on refresh is a universe you can't learn. */
function hashAngle(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 3600) / 3600;
}

const SHELL: Record<Planet['focusState'], { radius: number; jitter: number; thickness: number }> = {
  NOW: { radius: 13, jitter: 2, thickness: 2.5 },
  NEXT: { radius: 26, jitter: 2.5, thickness: 3.5 },
  RESTING: { radius: 43, jitter: 4, thickness: 7 },
};

/**
 * Where a world sits: an evenly-spaced point on its focus RING.
 *
 * Three iterations, each one found by looking at the render, not the numbers:
 *
 *  1. First pass derived orbitRadius AND orbitAngle from the same hash, so the
 *     two were correlated and every planet landed on a SPIRAL. A smear.
 *  2. Second pass used a Fibonacci SPHERE per shell. Even spacing, no overlap —
 *     but a sphere projects to a filled disc, so 67 RESTING worlds scattered
 *     straight through the middle and the shells were unreadable.
 *  3. This pass: a flat RING per shell. NOW, NEXT and RESTING now render as
 *     three concentric orbits, which is the entire point of the view — you must
 *     be able to see what wants you today without reading a single word.
 *
 * Golden-angle stepping spaces the worlds evenly around each ring. Thickness and
 * jitter come from their own hashes, so the ring reads organic rather than
 * machined, and never re-correlates with the angle.
 *
 * Deterministic: same repos in, same universe out, every load.
 */
export function computeOrbit(
  index: number,
  total: number,
  focusState: Planet['focusState'],
  seed: string
) {
  const shell = SHELL[focusState];

  // Spread the ring's members evenly around the full circle, whatever the count.
  const theta = total > 0 ? (index / total) * Math.PI * 2 : 0;
  const distance = shell.radius + (hashAngle(seed + '~r') - 0.5) * shell.jitter * 2;
  const height = (hashAngle(seed + '~y') - 0.5) * shell.thickness;

  return {
    x: Math.cos(theta) * distance,
    y: height,
    z: Math.sin(theta) * distance,
    distance,
  };
}

export function computePlanetVisual(planet: Planet): PlanetVisual {
  const {
    focusState,
    archived,
    openIssues,
    closedIssuesRecent,
    releaseCount,
    sizeKb,
    quests,
    lore,
    color,
    activityScore,
  } = planet;

  const t = hashAngle(planet.repoId);
  const focusBoost = focusState === 'NOW' ? 1 : focusState === 'NEXT' ? 0.6 : 0.2;

  // 1 KB and 481,833 KB must both be legible on screen. Measured across the real
  // 84: this gives radius 0.66 (tiny) -> 1.49 (median) -> 2.54 (the monster),
  // 65 distinct sizes. Double-logging crushed the whole universe into 1.5-1.8.
  const mass = log10(sizeKb);

  // Open issues make a world turbulent; closing them calms it. Today every repo
  // reads 0 closed-in-30-days, so nothing is healing yet — that is a true fact
  // about the universe, and it will change the moment Lyndz closes an issue.
  const storm = clamp(openIssues * 0.03 - closedIssuesRecent * 0.05, 0, 1);

  return {
    baseColor: color,
    accentColor: lore?.color ?? color,

    // RESTING worlds are held to two-thirds size. 67 of them at full scale
    // swamped the 10 that actually matter — the focus hierarchy has to win over
    // the size signal, or the view stops answering "what should I work on?".
    radius: clamp(0.55 + mass * 0.35, 0.55, 2.6) * (focusState === 'RESTING' ? 0.65 : 1),

    orbitSpeed: archived ? 0 : focusState === 'NOW' ? 0.05 : focusState === 'NEXT' ? 0.03 : 0.012,
    spinSpeed: archived ? 0 : 0.05 + activityScore * 0.25,
    axialTilt: lore ? 0.45 : 0.18,

    glowIntensity: archived ? 0.05 : clamp(0.1 + focusBoost * 0.7 + activityScore * 0.4, 0.05, 1.4),
    atmosphereIntensity: archived ? 0.05 : clamp(0.15 + focusBoost * 0.5, 0.1, 1),

    stormIntensity: storm,
    lavaActivity: clamp(openIssues * 0.02, 0, 1),
    cloudCoverage: clamp(0.1 + storm * 0.5, 0.1, 0.9),
    surfaceRoughness: clamp(0.4 + storm * 0.4, 0.35, 1),
    surfaceMetalness: planet.biome === 'industrial-foundry' ? 0.5 : 0.12,

    // Rings must be EARNED. The original spec gated them on stars > 20, which no
    // repo here will ever hit — that would have meant zero rings, forever.
    ringPresence: Boolean(lore) || releaseCount > 0,
    ringDensity: clamp((lore ? 0.5 : 0) + log10(releaseCount) * 0.5, 0, 1),

    // Forks would give every planet zero moons. Lore connections mean something:
    // a moon is a world this world is bound to.
    moonCount: clamp(lore?.manualConnections.length ?? 0, 0, 5),

    questBeacons: clamp(quests.length, 0, 8),
    haloPulse: archived ? 0 : clamp(log10(releaseCount) * 0.9, 0, 1),
    frozen: archived,
  };
}
