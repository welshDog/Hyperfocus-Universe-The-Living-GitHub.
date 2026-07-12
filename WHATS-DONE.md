# ✅ WHATS-DONE: Progress Tracker

> **Last Updated**: 2026-07-12 (Sunday 12 AM BST)

---

## 🎯 Current Phase: **Level 1 COMPLETE — It Lives**

**Goal**: A trustworthy data pipeline and an accessible screen that answers one
question: *"What is my best next world and task?"*

**Status**: `npm run refresh && npm run dev` renders **84 real worlds**, 10 of them
NOW, with **13 real quests** pulled from live GitHub. Build is clean, typecheck passes,
and the `repoId` validator fails CI on orphaned lore. Not a mock — actual data.

---

## ✅ Completed

### 📝 Documentation

- [x] **README.md** - Full project vision, features, roadmap, philosophy
- [x] **CONTRIBUTING.md** - Setup guide, contribution guidelines, code of conduct  
- [x] **AGENT-START.md** - AI agent quick-start onboarding guide
- [x] **WHATS-DONE.md** (this file) - Living progress tracker
- [x] **LICENSE** - GPL-3.0 license file

### 💾 Data Layer

- [x] **data/planets.json** - Sample schema for GitHub repo data
  - ✅ Includes: name, description, url, language, stars, forks, watchers
  - ✅ Includes: open issues, archived status, timestamps, topics
  - ✅ Sample data for 3 repos (THE-HYPERCODE, HyperFocus-Zone-Portal, hyperfocus-constellation)

- [x] **data/lore.json** - Hand-written planet civilizations and biomes
  - ✅ 6 complete planet lores:
    - Syntax Prime (THE-HYPERCODE) - The Pattern Weavers
    - The Welcome World (HyperFocus-Zone-Portal) - The Guides
    - Archive of Origins (hyperfocus-constellation) - The Archivists
    - Studio Planet (HyperFocus-The-Anime) - The Dream Animators
    - Forgeworld (3D-Print-Genie) - The Makers
    - The Meta-Observatory (this repo) - The Watchers
  - ✅ 6 biome definitions (neon-megacity, orbital-hub, crystalline-library, creative-workshop, industrial-foundry, living-mirror)

### ⚙️ Configuration

- [x] **package.json** - Dependencies and scripts
  - ✅ Next.js 14, React 18, TypeScript
  - ✅ React Three Fiber, Drei, Three.js
  - ✅ Framer Motion, Zustand
  - ✅ Tailwind CSS, PostCSS, Autoprefixer
  - ✅ Scripts: dev, build, start, lint, fetch-planets, type-check

- [x] **.gitignore** - Standard Next.js ignore patterns

---

### 🔌 Data Pipeline (VERIFIED — run against live GitHub 2026-07-12)

- [x] **data/roster.seed.json** - 23 repo identities harvested from the old
  `hyperfocus-constellation` prototype (category, description, colour) + a
  12-category → 6-biome map. Facts only; no invented lore.
- [x] **scripts/fetch-planets.js** - live GitHub fetcher
  - ✅ Public repos only (`GET /users/:user/repos`) — private repos can never
    leak into a committed data file
  - ✅ Paginated (`per_page=100`)
  - ✅ Merges seed identity, computes fallback biome/colour when unseeded
  - ✅ Scrapes `WHATS-DONE.md` per repo → first 3 unchecked tasks become `quests`
  - ✅ Derives `focusState` (NOW/NEXT/RESTING) from `pushed_at` — never hand-maintained
  - ✅ Deterministic sorted output; **verified byte-identical across runs**
  - ✅ Tokens scrubbed from all output and logs
- [x] **scripts/validate-data.js** - guards the `repoId` join key
  - ✅ Orphaned lore = ERROR (exit 1, fails CI) with a "did you mean" suggestion
  - ✅ Stale roster/connections = WARNING (never fails)
- [x] **repoId bugs fixed** — found by the validator, not by luck:
  - `Hyperfocus-Universe-The-Living-GitHub.` → `Hyperfocus-Universe-The-Living-Hub`
  - `HyperFocus-The-Anime` → `HyperFocus-The-Anime-Build` (real slug)
  - Same trailing-dot slug fixed in `package.json`

---

## 🚧 In Progress

### 🟡 The universe is mostly quiet — and that's a data problem, not a code one

Quest sourcing is now: **`WHATS-DONE.md` wins → open issues fill the gap → quiet.**
That took the universe from 3 quests to **13 quests across 8 planets**.

But **76 of 84 planets still have nothing to say**, because there is no tracker
file *and* no open issue in those repos. The pipeline is doing its job; the
signal simply isn't there yet. The fix is not more code — it's you pushing a
`WHATS-DONE.md` (or opening one honest issue) in the repos you actually care
about. Every one you write lights up a planet.

---

### 🖥️ The 2D Hub (VERIFIED — `next build` clean, real data rendered 2026-07-12)

- [x] **Config** — `tsconfig.json`, `next.config.js`, `tailwind.config.ts` (v3, matching
  the locked dependency), `postcss.config.js`, `.eslintrc.json`
- [x] **src/types/planet.ts** — the shapes, with `repoId` documented as the only join key
- [x] **src/lib/mergeData.ts** — merges live facts + lore; lore is optional, so all
  84 worlds render whether or not anyone has written their story
- [x] **src/app/layout.tsx / page.tsx / globals.css** — skip link, starfield (decorative,
  `aria-hidden`, removed under reduced-motion)
- [x] **src/components/UniverseList.tsx** — grouping, filtering, `aria-live` count,
  RESTING collapsed by default
- [x] **src/components/PlanetCard.tsx** — `<article>` with two real actions; never a
  clickable div, never nested interactives
- [x] **src/components/PlanetSheet.tsx** — real `role="dialog"`, Escape closes, focus
  trapped, focus RESTORED to the triggering planet button
- [x] **src/components/FocusControl.tsx** — NOW/NEXT/RESTING + biome, `aria-pressed`
- [x] **src/components/SearchControl.tsx** — searches names, biomes AND quest text
- [x] **.github/workflows/refresh-planets.yml** — daily cron; validator failure fails the run

### ♿ Accessibility Gates — met, not promised

The old constellation *claimed* WCAG AA and shipped zero keyboard shortcuts and no
`prefers-reduced-motion`. These are in the code and verified in the built HTML:

- [x] Every card action is a native `<button>` or a labelled `<a>` — no clickable divs
- [x] Enter and Space open the sheet (native button semantics, not a keydown hack)
- [x] Escape closes the sheet and returns focus to the planet that opened it
- [x] Focus trapped inside the open dialog; visible high-contrast `:focus-visible` ring
- [x] No hover-only information — quests are on the card, not in a tooltip
- [x] Sheet has an accessible title (`aria-labelledby`) and a labelled Close button
- [x] Filter state announced via `aria-live="polite"` ("Showing 17 worlds · 13 quests")
- [x] `prefers-reduced-motion: reduce` kills all transitions and the starfield
- [ ] **Not yet done:** a real screen-reader pass (NVDA/VoiceOver) and axe audit. The
      markup is right; nobody has *driven* it yet. Don't tick this until someone has.

---

## 📋 Next Up

- [ ] Screen-reader + axe pass on the built page (see above — the last honest gap)
- [ ] Push `WHATS-DONE.md` into the repos that matter, to light up the 76 quiet worlds
- [ ] Deploy to Vercel
- [ ] **Level 3 — Three.js as the reward layer**, once the list view is worth opening daily.
      Positions must be COMPUTED from `activityScore` + focus state. The old prototype
      hardcoded x/y per repo and that is exactly why it froze at 24 stars forever.

---

## 🌟 Future (Level 3: It Becomes a Game)

- [ ] **Timeline component** - Historical universe view
- [ ] **Simple AI citizens** - Wandering, building, celebrating
- [ ] **Achievement system** - First star, 7-day streak, etc.
- [ ] **Event animations** - Fireworks for releases, rifts for issues
- [ ] **Visitor badges** - Explorer mode collectibles
- [ ] **Orbit connections** - Visual links between related repos
- [ ] **Soundscapes** - Optional ambient audio per biome

---

## 📊 Stats

> Measured by `npm run refresh` against live GitHub on 2026-07-12. Every number
> here comes from a script that ran. If it isn't verified, it doesn't go here.

**Public repos fetched**: 84  
**Planets rendered**: 84 (every repo gets a world — none are grey rocks)  
**Seeded identities matched**: 17  
**Computed fallback biomes**: 67  
**Hand-written lores**: 6 (0 orphaned)  
**Biomes defined**: 6  
**Quest sources**: 1 tracker · 7 open-issues · 76 quiet ⚠️  
**Quests extracted**: 13 across 8 planets ⚠️  
**Focus split**: 10 NOW · 7 NEXT · 67 RESTING  
**Validation**: 0 errors, 6 warnings (6 old roster repos deleted/renamed/private)  

---

## 💡 Notes for Returning After Distraction

### Where We Are

✅ **Foundation is SOLID**. The vision, data model, and lore are all documented and beautiful.

### Quick Wins Available

1. **Create tsconfig.json** - 5 minutes, gets TypeScript working
2. **Create scripts/fetch-planets.js** - 30 minutes, pulls real GitHub data
3. **Create next.config.js + tailwind.config.ts** - 10 minutes, sets up build

### Best Next Step

If hyperfocus hits:

→ **Start with `scripts/fetch-planets.js`** - this makes the data layer REAL by pulling your actual repos.

Or:

→ **Jump to Universe.tsx** - start building the 3D scene if you're in visual mode.

### Remember

This isn't a race. The foundation is world-class. Every file added is a win. 🌌

---

## 🔗 Related Files

- [README.md](README.md) - Full project vision
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [AGENT-START.md](AGENT-START.md) - AI agent onboarding
- [data/lore.json](data/lore.json) - Planet civilizations
- [data/planets.json](data/planets.json) - GitHub repo data

---

**Your code isn't just commits. It's a universe you're building, one world at a time.** 🌌♾️
