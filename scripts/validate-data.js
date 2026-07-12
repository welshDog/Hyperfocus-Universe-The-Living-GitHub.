#!/usr/bin/env node
/**
 * validate-data.js — guards the join key.
 *
 * repoId is the exact GitHub slug and it is the ONLY thing joining
 * planets.json <-> lore.json <-> roster.seed.json. A single typo means
 * hand-written lore silently never renders. This script makes that loud.
 *
 * ERRORS   fail CI (exit 1)  — lore that can never attach to a planet
 * WARNINGS never fail        — stale seed entries, soft data-health issues
 *
 * Usage: node scripts/validate-data.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));

const errors = [];
const warnings = [];
const infos = [];

/** Levenshtein — small inputs, clarity over speed. */
function distance(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(
        m[i - 1][j] + 1,
        m[i][j - 1] + 1,
        m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return m[a.length][b.length];
}

/** The whole point: a broken repoId should name its own fix. */
function didYouMean(bad, candidates) {
  const lower = bad.toLowerCase();
  const scored = candidates
    .map((c) => {
      const cl = c.toLowerCase();
      // exact-but-for-case, or one is a prefix of the other, are near-certain hits
      if (cl === lower) return { c, d: 0 };
      if (cl.startsWith(lower) || lower.startsWith(cl)) return { c, d: 1 };
      return { c, d: distance(lower, cl) };
    })
    .sort((a, b) => a.d - b.d);
  const best = scored[0];
  if (!best) return null;
  const threshold = Math.max(3, Math.floor(bad.length * 0.35));
  return best.d <= threshold ? best.c : null;
}

function main() {
  let planetsFile;
  try {
    planetsFile = read('planets.json');
  } catch {
    console.error('💥 data/planets.json missing or unreadable. Run: npm run fetch-planets');
    process.exit(1);
  }
  if (!Array.isArray(planetsFile.planets)) {
    console.error('💥 data/planets.json has no planets array. Re-run the fetcher.');
    process.exit(1);
  }

  const loreFile = read('lore.json');
  const seedFile = read('roster.seed.json');

  const planets = planetsFile.planets;
  const liveIds = planets.map((p) => p.repoId);
  const liveSet = new Set(liveIds);
  const biomes = new Set(Object.keys(loreFile.biomeDefinitions || {}));

  infos.push(`${planets.length} public repositories fetched.`);
  infos.push(`${planets.filter((p) => p.seeded).length} seeded identities matched.`);
  infos.push(`${planets.filter((p) => !p.seeded).length} generated with default biome.`);

  // --- planets.json internal integrity -------------------------------------
  const dupes = liveIds.filter((id, i) => liveIds.indexOf(id) !== i);
  for (const d of new Set(dupes)) errors.push(`duplicate repoId "${d}" in planets.json.`);

  for (const p of planets) {
    if (p.biome && !biomes.has(p.biome)) {
      errors.push(
        `planet "${p.repoId}" has biome "${p.biome}", which is not defined in lore.json biomeDefinitions.`
      );
    }
    if (!p.color) warnings.push(`planet "${p.repoId}" has no colour; it will render grey.`);
  }

  // --- lore.json: the orphan hunt (this is the blocker we built this for) ---
  const lore = loreFile.planetLore || [];
  infos.push(`${lore.length} lore entries checked.`);

  const loreIds = lore.map((l) => l.repoId);
  for (const d of new Set(loreIds.filter((id, i) => loreIds.indexOf(id) !== i))) {
    errors.push(`duplicate lore repoId "${d}".`);
  }

  let orphans = 0;
  for (const l of lore) {
    if (!liveSet.has(l.repoId)) {
      orphans++;
      const hint = didYouMean(l.repoId, liveIds);
      errors.push(
        `lore repoId "${l.repoId}" does not exist in fetched repository data.` +
          (hint ? `\n         Did you mean "${hint}"?` : '') +
          `\n         This lore will NEVER render. repoId must be the exact GitHub slug.`
      );
    }
    if (l.biome && !biomes.has(l.biome)) {
      errors.push(`lore "${l.repoId}" uses undefined biome "${l.biome}".`);
    }
    for (const conn of l.manualConnections || []) {
      if (!liveSet.has(conn)) {
        const hint = didYouMean(conn, liveIds);
        warnings.push(
          `lore "${l.repoId}" links to "${conn}", which is not a fetched public repo; ` +
            `that orbit line will not draw.` + (hint ? ` Did you mean "${hint}"?` : '')
        );
      }
    }
  }
  infos.push(`${orphans} orphaned lore entries.`);

  // --- roster.seed.json: soft, warnings only -------------------------------
  for (const s of seedFile.roster || []) {
    if (!liveSet.has(s.repoId)) {
      const hint = didYouMean(s.repoId, liveIds);
      warnings.push(
        `roster entry "${s.repoId}" does not match a fetched public repository ` +
          `(renamed, deleted, or now private).` + (hint ? ` Did you mean "${hint}"?` : '')
      );
    }
  }

  // --- data health ---------------------------------------------------------
  if (planetsFile._questsIncluded === false) {
    warnings.push(
      'planets.json was generated WITHOUT a token, so no quests were scraped. ' +
        'Re-run with GITHUB_TOKEN=$(gh auth token) for the quest logs.'
    );
  }

  // --- report --------------------------------------------------------------
  for (const i of infos) console.log(`INFO: ${i}`);
  if (infos.length) console.log('');
  for (const w of warnings) console.log(`WARNING: ${w}\n`);
  for (const e of errors) console.log(`ERROR: ${e}\n`);

  if (errors.length) {
    console.log(
      `❌ ${errors.length} error(s), ${warnings.length} warning(s). ` +
        `Errors mean hand-written lore is orphaned and will not render.`
    );
    process.exit(1);
  }
  console.log(`✅ Data is sound. ${warnings.length} warning(s), 0 errors.`);
}

main();
