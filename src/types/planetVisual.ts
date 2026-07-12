/**
 * The visual skin of a world.
 *
 * EVERY field here is derived from real repo data. Nothing is decorative and
 * nothing is random — if a planet looks different, it IS different, and you can
 * point at the GitHub fact that made it so.
 *
 * Note what is NOT here: biome and baseColor are NOT recomputed by the visual
 * layer. They already exist on the merged Planet (seed category -> language
 * fallback -> lore override). Re-deriving them here would let a world be
 * orbital-hub in the 2D hub and neon-megacity in 3D. The 3D view is a skin over
 * the same truth, not a second source of it.
 */
export type PlanetVisual = {
  /** Straight from planet.color — the 2D dot and the 3D sphere always agree. */
  baseColor: string;
  accentColor: string;

  /** Size from CODEBASE SIZE, not stars. Stars max out at 3 across the whole
   *  universe, so a star-driven radius would make all 84 worlds identical. */
  radius: number;

  /** Concentric shells: NOW inner, NEXT middle, RESTING outer. */
  orbitRadius: number;
  orbitAngle: number;
  orbitInclination: number;
  orbitSpeed: number;
  spinSpeed: number;
  axialTilt: number;

  /** Brightness of a live world. */
  glowIntensity: number;
  atmosphereIntensity: number;

  /** Turbulence from open issues; calmed by issues closed in the last 30 days.
   *  Close an issue and the storm actually recedes. */
  stormIntensity: number;
  lavaActivity: number;
  cloudCoverage: number;
  surfaceRoughness: number;
  surfaceMetalness: number;

  /** Rings are EARNED: written lore, or a shipped release. */
  ringPresence: boolean;
  ringDensity: number;

  /** Moons are the worlds this one is linked to in lore.manualConnections.
   *  Forks would give zero moons for all 84 planets — max forks is 1. */
  moonCount: number;

  /** One light per unfinished quest. A dark world has nothing waiting. */
  questBeacons: number;

  /** Rare celebration flare — only 2 repos have ever shipped a release. */
  haloPulse: number;

  /** Archived worlds are frozen museums, not failures. */
  frozen: boolean;
};
