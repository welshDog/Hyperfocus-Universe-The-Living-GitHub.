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
- [x] **axe-core, WCAG 2.0/2.1 A + AA rules, across all three states: 0 violations.**
      Not just the default view this time — List, **Universe 3D**, and the **planet
      sheet OPEN** (the dialog + focus trap, the riskiest part, previously unscanned).
- [x] **Keyboard proven, not asserted:** driven in a real browser — Escape closed the
      dialog and focus returned to *the exact button that opened it*
      (`Open planet Mind Vault Ultimate Game`).
- [ ] **Still not done: a real screen-reader pass** (NVDA/Narrator/VoiceOver). axe
      catches only 20–50% of issues and cannot tell you whether the thing is
      *comprehensible*. Until a human drives it with assistive tech, we claim **no
      WCAG conformance**.

### 🌌 Hyper 3D — Universe View (built 2026-07-12)

- [x] `docs/PLANET-VISUAL-MAPPING.md` — the mapping system, **recalibrated to the real data**
- [x] `src/types/planetVisual.ts` + `src/lib/computePlanetVisual.ts`
- [x] `src/components/PlanetMesh.tsx` — sphere, atmosphere, rings, moons, quest beacons,
      storm/lava emissive, release flare
- [x] `src/components/UniverseScene.tsx` — concentric NOW/NEXT/RESTING shells, orbit camera
- [x] `src/components/UniverseViewToggle.tsx` — List ⇄ Universe 3D (List is the default)
- [x] Fetcher extended: `sizeKb`, `closedIssuesRecent`, `releaseCount`, `latestReleaseAt`
- [x] three.js dynamically imported (`ssr: false`) — **First Load JS 103 kB → 105 kB**,
      so the 2D hub does not pay for a renderer it isn't using

**🔴 The spec would have shipped 84 identical spheres.** It mapped stars → size and
forks → moons. Measured against reality: max stars is **3**, max forks is **1**. Every
planet would have been the same size with **zero moons**. Recalibrated to signals that
actually vary here:

| Instead of | Use | Result |
|---|---|---|
| stars → radius | **`sizeKb`** (1 → 481,833) | **65 distinct radii** across 84 worlds |
| forks → moons | **`lore.manualConnections`** | 5 worlds, 11 moons — and it rewards writing lore |
| stars > 20 → rings | **lore present or a release** | 7 ringed worlds (the original gate would have meant *zero rings forever*) |

Measured variety: 65 radii · 21 stormy · 8 with quest beacons · 7 ringed · 5 with moons ·
11 frozen archives. Only 10 worlds share a visual signature.

`closedIssuesRecent` currently reads **0 across all 84** — nothing is healing yet. That's
a true fact about the universe, not a bug: close an issue and that world's storm recedes.

**Accessibility:** the canvas is `aria-hidden` and not focusable, because you cannot Tab
to a sphere inside a `<canvas>` and pretending you can is how the old constellation
ended up advertising keyboard shortcuts it never had. Every planet gets a real DOM
`<button>` beside the canvas. `prefers-reduced-motion` stops orbit, spin, moons,
starfield and camera auto-rotate.

#### 👁️ The eye test — what looking at it caught that the numbers could not

Driven in a real browser (Playwright + headless Chrome, WebGL via SwiftShader) and
inspected frame by frame. Three bugs the passing build had happily hidden:

1. **🔴 HYDRATION BUG — and it was already LIVE on the 2D site.** `timeAgo()` called
   `Date.now()` during render, so the build-time HTML said "2 hours ago" and the browser
   computed something else at hydration → React errors #418/#425 on **every page load**.
   Never caught, because I had only ever checked the *served HTML*, never run the page.
   Fixed: the label is baked at build (`planet.pushedLabel`) and `<TimeAgo>` refreshes it
   after mount. Console is now clean.
2. **The spiral.** `orbitRadius` and `orbitAngle` were derived from the *same* hash, so
   radius and angle were correlated and every world fell on a spiral. The universe was a
   smear.
3. **The shells didn't read.** Fixing the spiral with a Fibonacci *sphere* gave even
   spacing — but a sphere projects to a filled disc, so 67 RESTING worlds scattered
   through the middle and NOW/NEXT/RESTING were indistinguishable. **This defeated the
   entire purpose of the view.** Fixed by making each shell a flat **ring**, raking the
   camera above the plane, and drawing faint orbit guides. It now reads as a solar system:
   NOW is the bright inner orbit, RESTING is the dim outer one.

Verified in-browser: reduced-motion frames are **byte-identical 3 seconds apart** (truly
frozen, not merely slowed), the scene is complete and calm rather than broken, Tab reaches
the planet buttons, no console errors, no horizontal overflow at 390px.

- [x] axe pass **on the Universe view** and on the open planet sheet: **0 violations**
- [x] **Readable world names.** 78 of 84 worlds had no lore and showed a raw slug
      (`-MIND-VAULT-ULTIMATE-GAME`, `hyper-help-zone-`). `prettifySlug()` is *typography,
      not lore*: it strips separators and calms SHOUTING, but never corrects spelling —
      `github-ai-mangaer-helper` still renders "Mangaer", because the hub must not
      quietly lie about what it found. The true `repoId` is always shown beneath.
      `ADHD` is protected from being rendered "Adhd".
- [x] **Multi-line quest parsing.** The parser took only a bullet's first physical line,
      so any wrapped task was truncated mid-sentence into gibberish. It now absorbs
      continuation lines and clips at a word boundary.

---

### 🪐 Descend mode — one hero world at a time (2026-07-12)

Two modes, one hero. **System view stays cheap and legible; the entire spectacle
budget is spent on the single world you descend into.**

Why, in one number: at system scale a planet renders at **12–58 pixels**. Shoreline
foam, cloud shadows and city lights are smaller than the anti-aliasing. Rendering a
6-layer procedural stack 84 times pays for detail that is *physically invisible*.
So it renders **once**, on the world you chose — and descending into one world **is**
choosing one world to work on. The spectacle became the reward for focusing.

- [x] `src/lib/planetDNA.ts` — the genome. **Shape comes from a hash of `repoId`
      (permanent — a world you can't learn is a world you can't return to); STATE
      comes from live GitHub data (storms, moons, cities — these change as you work).**
      A trait is never in both.
- [x] `src/components/HeroPlanet.tsx` — GLSL: terrain + ocean with depth and a
      shoreline band + ice caps + lava seams + night-side cities + drifting storm
      bands · parallax cloud shell · Fresnel atmosphere · rings · moons · quest beacons
- [x] `src/components/DescendCamera.tsx` — system ⇄ hero in one move; **cuts instead
      of flying under reduced motion** (a camera tween IS motion)
- [x] Fetcher gained `openPRs`, `languageMix`, `hasDocs`

**Third spec, third time the mapping table was calibrated for someone else's repos.**
Measured against the real 84:

| Spec wanted | Reality | What shipped |
|---|---|---|
| Stars → city lights | 6 of 84 have any stars | Kept — as a **rare reward**, never structural. Six worlds light up at night. |
| PRs → moons | **18 of 84** | ✅ Adopted. Beats forks (max 1) and lore links (5). |
| Language *mix* → biome bands | Only primary language was fetched | ✅ Now fetched. 65 of 84 have a real mix. |
| Deployment health → shield ring | **No such GitHub signal exists** | Cut. Invented data is a lie. |
| Docs quality → knowledge towers | No objective measure; 77 of 84 have a README | **Inverted**: the 7 worlds with *no* README render **barren**. "This world has no map." |

A signal can be rare and still good — but only as a **bonus**, never as the backbone.
Stars→size would have made 84 identical spheres. Stars→city-lights on six worlds is lovely.

#### 👁️ What the eye test caught (again)
1. Focusing the descend panel **scrolled the page**, leaving the world you just flew
   into above the fold. `preventScroll` + `scrollIntoView` on the canvas.
2. **Land and ocean were both blue** — a `living-mirror` world's biome colour *is* blue,
   so continents were invisible. Land is now pulled 55% toward warm terrain.
3. **Clouds smothered the planet** — the mottling was cloud, not land. The terrain
   shader was working perfectly and nobody could see it.
4. The atmosphere Fresnel was a **solid blue donut**; the ring was a **hairline** edge-on.

Verified: axe **0 violations on the descended state**, Escape returns to the system and
restores focus to the exact world, reduced-motion frames **byte-identical 3s apart**,
no shader compile errors, First Load JS **106 kB** (the whole shader stack is in the
lazy chunk — the 2D hub pays ~1 kB for it).

---

### 🚀 Deployed

- [x] **LIVE: https://hyperfocus-universe-the-living-hub.vercel.app** (production)
- [x] Live truth test passed: 17 cards (10 NOW / 7 NEXT), RESTING collapsed behind
      "Show 67", 12 empty states, and **live quest text matches `data/planets.json`
      byte-for-byte** (modulo HTML entity escaping)
- [ ] **Vercel ↔ GitHub auto-deploy is NOT connected.** `vercel git connect` failed:
      the Vercel GitHub App on the `bro-skis` team lacks access to this repo. Until
      Lyndz grants it in the dashboard, **pushes to `main` will NOT redeploy** — the
      site must be shipped with `npx vercel --prod --scope bro-skis`.

---

## 📋 Next Up

- [ ] Grant the Vercel GitHub App access to this repo, then `vercel git connect` (see above)
- [ ] Manual keyboard pass on the live URL: Tab / Shift+Tab / Enter / Space / Escape,
      and confirm focus returns to the exact planet that opened the sheet
- [ ] Windows "Reduce motion" on → refresh → confirm starfield and transitions stop
- [ ] Phone-width pass of the whole flow
- [ ] Screen-reader pass (see above — the last honest gap)
- [ ] Push `WHATS-DONE.md` into the repos that matter, to light up the 76 quiet worlds
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
