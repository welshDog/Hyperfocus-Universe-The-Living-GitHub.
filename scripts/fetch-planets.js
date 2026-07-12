#!/usr/bin/env node
/**
 * fetch-planets.js — turns live GitHub repos into planets.
 *
 * Data precedence (highest wins):
 *   live GitHub facts  >  roster.seed.json identity  >  computed fallback
 * lore.json is NOT read here. It is optional narrative enrichment merged at
 * render time, so a planet always exists even with no lore written for it.
 *
 * Usage:
 *   GITHUB_TOKEN=$(gh auth token) node scripts/fetch-planets.js
 *   node scripts/fetch-planets.js --user someone-else
 *
 * Without a token the script still works but SKIPS quest scraping: that costs
 * one request per repo and the unauthenticated limit is 60/hour.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SEED_PATH = path.join(DATA_DIR, 'roster.seed.json');
const OUT_PATH = path.join(DATA_DIR, 'planets.json');

const API = 'https://api.github.com';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const QUEST_FILE = 'WHATS-DONE.md';
const MAX_QUESTS = 3;
const CONCURRENCY = 8;

const args = process.argv.slice(2);
const USER = argFlag('--user') || 'welshDog';
const INCLUDE_FORKS = args.includes('--include-forks');

function argFlag(name) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

/** Never let a token reach stdout or the generated file. */
function scrub(str) {
  const s = String(str);
  return TOKEN ? s.split(TOKEN).join('***') : s;
}
function log(...parts) {
  console.log(scrub(parts.join(' ')));
}

function headers() {
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'hyperfocus-universe-fetch-planets',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

async function gh(url, accept) {
  const h = headers();
  if (accept) h.Accept = accept;
  const res = await fetch(url, { headers: h });
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(res.headers.get('x-ratelimit-reset') || 0) * 1000;
    throw new Error(
      `GitHub rate limit exhausted. Resets at ${new Date(reset).toLocaleTimeString()}. ` +
        `Run with a token: GITHUB_TOKEN=$(gh auth token) npm run fetch-planets`
    );
  }
  return res;
}

/** GET /users/:user/repos — public repos only, by construction. */
async function fetchRepos(user) {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await gh(`${API}/users/${user}/repos?per_page=100&page=${page}&sort=full_name`);
    if (!res.ok) throw new Error(`repo list failed: ${res.status} ${res.statusText}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  // The public endpoint cannot return private repos, but belt-and-braces:
  // a private repo must never reach a committed data file.
  return all.filter((r) => !r.private);
}

const MAX_QUEST_CHARS = 120;

/** A quest is a nudge, not an essay. Cut at a word boundary, never mid-word. */
function clip(text) {
  if (text.length <= MAX_QUEST_CHARS) return text;
  const cut = text.slice(0, MAX_QUEST_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '') + '…';
}

/**
 * Pull WHATS-DONE.md and take the first N unchecked checkboxes.
 * Any failure (404, binary, malformed, network) yields [] — never throws.
 */
async function fetchTrackerQuests(user, repo) {
  try {
    const res = await gh(
      `${API}/repos/${user}/${repo}/contents/${QUEST_FILE}`,
      'application/vnd.github.raw'
    );
    if (!res.ok) return null;
    const md = await res.text();
    const lines = md.split(/\r?\n/);
    const quests = [];

    for (let i = 0; i < lines.length && quests.length < MAX_QUESTS; i++) {
      const m = /^\s*[-*]\s+\[ \]\s+(.+?)\s*$/.exec(lines[i]);
      if (!m) continue;

      // A markdown list item can wrap over several indented lines. Taking only
      // the first one truncates the task mid-sentence ("...the focus trap is the
      // risky"), which turns a real quest into gibberish. Absorb the wrapped
      // continuation lines, and stop at a blank line or the next item.
      let raw = m[1];
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j];
        if (!next.trim()) break;
        if (/^\s*([-*]|\d+\.)\s/.test(next)) break; // next bullet
        if (/^\s*#{1,6}\s/.test(next)) break; // next heading
        if (!/^\s{2,}/.test(next)) break; // not an indented continuation
        raw += ' ' + next.trim();
        i = j;
      }

      const text = raw
        .replace(/\*\*(.+?)\*\*/g, '$1') // strip bold
        .replace(/`(.+?)`/g, '$1') // strip code ticks
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // link -> label
        .replace(/\s+/g, ' ')
        .trim();

      if (text) quests.push({ title: clip(text), url: null });
    }
    return quests.length ? quests : null;
  } catch {
    return null;
  }
}

/**
 * Fallback quest source: open issues. Only 1 of 84 repos keeps a WHATS-DONE.md,
 * so without this almost every planet would have nothing to say.
 * open_issues_count INCLUDES pull requests, so a repo can report issues and have
 * none — PRs are filtered out here and the planet then honestly has no quests.
 */
async function fetchIssueQuests(user, repo) {
  try {
    const res = await gh(
      `${API}/repos/${user}/${repo}/issues?state=open&per_page=10&sort=updated`
    );
    if (!res.ok) return null;
    const issues = await res.json();
    if (!Array.isArray(issues)) return null;
    const quests = issues
      .filter((i) => !i.pull_request)
      .slice(0, MAX_QUESTS)
      .map((i) => ({ title: i.title, url: i.html_url }));
    return quests.length ? quests : null;
  } catch {
    return null;
  }
}

/** Tracker wins; issues fill the gap; otherwise the planet is genuinely quiet. */
async function fetchQuests(user, repo) {
  const tracker = await fetchTrackerQuests(user, repo.name);
  if (tracker) return { quests: tracker, questSource: 'tracker' };

  if (repo.open_issues_count > 0) {
    const issues = await fetchIssueQuests(user, repo.name);
    if (issues) return { quests: issues, questSource: 'issues' };
  }
  return { quests: [], questSource: 'none' };
}

/**
 * Signals the 3D layer needs and the repo list endpoint does not carry.
 *
 * closedIssuesRecent is what lets storms HEAL — without it a planet with open
 * issues is permanently stormy no matter how much work you do, which would make
 * the most emotionally important mechanic in the universe a lie.
 */
async function fetchHealthSignals(user, repo) {
  const out = { closedIssuesRecent: 0, releaseCount: 0, latestReleaseAt: null };
  const since = new Date(Date.now() - 30 * DAY).toISOString();

  try {
    const res = await gh(
      `${API}/repos/${user}/${repo.name}/issues?state=closed&since=${since}&per_page=100`
    );
    if (res.ok) {
      const issues = await res.json();
      if (Array.isArray(issues)) {
        out.closedIssuesRecent = issues.filter(
          (i) => !i.pull_request && i.closed_at && i.closed_at >= since
        ).length;
      }
    }
  } catch {
    /* a planet with no health signal is quiet, not broken */
  }

  try {
    const res = await gh(`${API}/repos/${user}/${repo.name}/releases?per_page=100`);
    if (res.ok) {
      const releases = await res.json();
      if (Array.isArray(releases)) {
        out.releaseCount = releases.length;
        out.latestReleaseAt = releases[0]?.published_at ?? null;
      }
    }
  } catch {
    /* ditto */
  }

  return out;
}

const LANGUAGE_BIOME = {
  TypeScript: 'neon-megacity',
  JavaScript: 'neon-megacity',
  Python: 'living-mirror',
  Jupyter: 'living-mirror',
  HTML: 'creative-workshop',
  CSS: 'creative-workshop',
  Rust: 'industrial-foundry',
  C: 'industrial-foundry',
  'C++': 'industrial-foundry',
  Go: 'industrial-foundry',
  Java: 'industrial-foundry',
  Shell: 'industrial-foundry',
};
const FALLBACK_BIOME = 'crystalline-library'; // docs, config, unknown
const BIOME_COLOR = {
  'neon-megacity': '#61DAFB',
  'orbital-hub': '#10B981',
  'crystalline-library': '#8B5CF6',
  'creative-workshop': '#FF6B9D',
  'industrial-foundry': '#F59E0B',
  'living-mirror': '#3B82F6',
};

const DAY = 86400000;

/** NOW / NEXT / RESTING derived from push recency — never hand-maintained. */
function focusState(pushedAt) {
  const age = (Date.now() - new Date(pushedAt).getTime()) / DAY;
  if (age <= 7) return 'NOW';
  if (age <= 30) return 'NEXT';
  return 'RESTING';
}

/** 0..1 activity, log-damped so one big repo can't flatten the rest. */
function activityScore(repo) {
  const age = (Date.now() - new Date(repo.pushed_at).getTime()) / DAY;
  const recency = Math.max(0, 1 - age / 365);
  const engagement = Math.log10(1 + repo.stargazers_count + repo.forks_count) / 2;
  return Math.round(Math.min(1, recency * 0.7 + Math.min(engagement, 1) * 0.3) * 1000) / 1000;
}

async function mapWithConcurrency(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

async function main() {
  const seedFile = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  const seedByRepo = new Map(seedFile.roster.map((r) => [r.repoId, r]));
  const categoryToBiome = seedFile.categoryToBiome || {};

  log(TOKEN ? '🔑 Authenticated request.' : '⚠️  No GITHUB_TOKEN — quest scraping will be SKIPPED.');
  log(`🌍 Fetching public repos for @${USER} ...`);

  let repos = await fetchRepos(USER);
  if (!INCLUDE_FORKS) {
    const before = repos.length;
    repos = repos.filter((r) => !r.fork);
    if (before !== repos.length) {
      log(`   Skipped ${before - repos.length} fork(s). Use --include-forks to keep them.`);
    }
  }
  log(`   ${repos.length} public repos.`);

  const questResults = TOKEN
    ? await mapWithConcurrency(repos, CONCURRENCY, (r) => fetchQuests(USER, r))
    : repos.map(() => ({ quests: [], questSource: 'none' }));

  if (TOKEN) {
    const bySource = (s) => questResults.filter((q) => q.questSource === s).length;
    log(
      `   Quests: ${bySource('tracker')} from ${QUEST_FILE} · ` +
        `${bySource('issues')} from open issues · ${bySource('none')} quiet.`
    );
  }

  const health = TOKEN
    ? await mapWithConcurrency(repos, CONCURRENCY, (r) => fetchHealthSignals(USER, r))
    : repos.map(() => ({ closedIssuesRecent: 0, releaseCount: 0, latestReleaseAt: null }));

  if (TOKEN) {
    const healed = health.filter((h) => h.closedIssuesRecent > 0).length;
    const shipped = health.filter((h) => h.releaseCount > 0).length;
    log(`   Health: ${healed} repos closed issues in 30d · ${shipped} have releases.`);
  }

  let seeded = 0;
  const planets = repos.map((repo, i) => {
    const seed = seedByRepo.get(repo.name);
    if (seed) seeded++;

    const biome =
      (seed && categoryToBiome[seed.category]) ||
      LANGUAGE_BIOME[repo.language] ||
      FALLBACK_BIOME;

    return {
      // CANONICAL JOIN KEY: the exact GitHub slug. Nothing else, ever.
      repoId: repo.name,
      url: repo.html_url,
      description: repo.description || (seed && seed.description) || null,

      // identity: seed if we have it, computed otherwise — always populated
      category: seed ? seed.category : 'Uncharted',
      biome,
      color: seed ? seed.color : BIOME_COLOR[biome],
      seeded: Boolean(seed),

      // live facts
      language: repo.language,
      topics: (repo.topics || []).slice().sort(),
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count,
      // Repo size in KB. This is the 3D layer's radius signal: stars max out at
      // 3 across the whole universe, so star-driven size would make all 84
      // planets identical. Codebase size actually varies by orders of magnitude.
      sizeKb: repo.size,
      closedIssuesRecent: health[i].closedIssuesRecent,
      releaseCount: health[i].releaseCount,
      latestReleaseAt: health[i].latestReleaseAt,
      archived: repo.archived,
      isFork: repo.fork,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,

      // derived — never hand-maintained
      focusState: focusState(repo.pushed_at),
      activityScore: activityScore(repo),

      // continuity: what you left unfinished here
      questSource: questResults[i].questSource, // 'tracker' | 'issues' | 'none'
      quests: questResults[i].quests,
    };
  });

  // Deterministic: sorted by join key, no timestamp in the payload. A daily
  // cron must produce a byte-identical file when nothing has actually changed,
  // or every diff becomes noise.
  planets.sort((a, b) => a.repoId.localeCompare(b.repoId));

  const output = {
    _note: 'AUTO-GENERATED by scripts/fetch-planets.js. Do not edit by hand. Narrative lives in lore.json.',
    _source: `https://github.com/${USER}`,
    _questsIncluded: Boolean(TOKEN),
    planetCount: planets.length,
    planets,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2) + '\n');

  log('');
  log(`✅ Wrote ${planets.length} planets to data/planets.json`);
  log(`   ${seeded} seeded identities matched, ${planets.length - seeded} using computed fallback.`);
  const now = planets.filter((p) => p.focusState === 'NOW').length;
  const next = planets.filter((p) => p.focusState === 'NEXT').length;
  log(`   Focus: ${now} NOW · ${next} NEXT · ${planets.length - now - next} RESTING`);
  const withQuests = planets.filter((p) => p.quests.length > 0).length;
  log(
    `   ${planets.reduce((n, p) => n + p.quests.length, 0)} quests across ` +
      `${withQuests} planets (${planets.length - withQuests} are quiet).`
  );
  log('');
  log('Next: node scripts/validate-data.js');
}

main().catch((err) => {
  console.error('\n💥 ' + scrub(err.message));
  process.exit(1);
});
