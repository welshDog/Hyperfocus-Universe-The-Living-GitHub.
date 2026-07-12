# 🤖 AGENT-START: AI Agent Onboarding Guide

> **Quick-start guide for AI agents assisting with Hyperfocus Universe development**

---

## 🎯 Project Mission

**Hyperfocus Universe** is a living 3D GitHub visualization where:

- Every repository = A planet with its own biome, civilization, and story
- GitHub activity (commits, issues, releases) = Visible world events
- Built for neurodivergent minds with ADHD-friendly focus modes
- **Core Philosophy**: "A commit is no longer a line on a graph—it is a visible act of world-building."

---

## 📚 Project Context

### Who This Is For

**Creator**: Lyndon Williams (@welshDog)
- Neurodivergent developer (ADHD/dyslexia)
- Works in hyperfocus sprints
- Building interconnected Hyperfocus Zone ecosystem
- Values story-driven development over pure metrics

### Project Goals

1. Transform GitHub repos into a 3D living universe
2. Make project navigation intuitive for ADHD brains (NOW/NEXT/RESTING)
3. Honor all projects—even quiet/archived ones—as valuable worlds
4. Create an interactive portfolio that tells a narrative
5. Build with accessibility first (reduced motion, keyboard nav, screen readers)

---

## 🗂️ File Structure Overview

### 📝 Documentation Files

- **README.md** - Full project vision, features, roadmap, philosophy
- **CONTRIBUTING.md** - Setup guide, contribution guidelines, code of conduct
- **AGENT-START.md** (this file) - AI agent quick-start context
- **WHATS-DONE.md** - Living progress tracker (what's built, what's next)

### 💾 Data Files (`data/`)

- **planets.json** - Auto-generated GitHub API data (DO NOT EDIT MANUALLY)
- **lore.json** - Hand-written planet stories, biomes, civilizations (HUMAN EDITABLE)

### 🛠️ Config Files

- **package.json** - Dependencies (Next.js, React Three Fiber, TypeScript)
- **.gitignore** - Standard Next.js ignore patterns

### 📁 Code Structure (planned)

```
src/
  app/           # Next.js 14 App Router pages
  components/    # React Three Fiber 3D components
  lib/           # GitHub API utilities
  types/         # TypeScript type definitions

scripts/
  fetch-planets.js  # GitHub API fetcher

.github/workflows/
  refresh-planets.yml  # Auto-refresh GitHub data
```

---

## 🧠 Key Concepts

### The Planet System

Each repo becomes a planet with:

1. **GitHub Data** (from planets.json):
   - Stars, forks, watchers, open issues
   - Primary language, topics, creation/update dates
   - Contributors, releases, archived status

2. **Lore Data** (from lore.json):
   - `planetName` - Creative world name
   - `biome` - Visual environment type
   - `civilization` - Who lives there
   - `mission` - What the project does
   - `story` - Narrative description
   - `motto` - One-line tagline
   - `color` - Primary planet color
   - `manualConnections` - Related repos

3. **Visual Representation**:
   - Planet size ~ normalized activity score
   - Planet color ~ biome + language
   - Glow intensity ~ recent activity
   - Structures/buildings ~ commit history

### Biome Types (defined in lore.json)

- `neon-megacity` - TypeScript/urban projects
- `orbital-hub` - Central/portal projects
- `crystalline-library` - Archive/documentation
- `creative-workshop` - Art/content creation
- `industrial-foundry` - Hardware/3D printing
- `living-mirror` - Meta/observational projects

### Focus Modes

- **NOW** - One planet in focus, everything else dims
- **NEXT** - 1-3 planets in close orbit (upcoming work)
- **RESTING** - All other projects, calm and preserved

---

## ⚙️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **3D**: React Three Fiber + Drei + Three.js
- **Animation**: Framer Motion
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Data**: GitHub REST API + JSON files
- **Deploy**: Vercel (planned)

---

## 🛠️ Common Agent Tasks

### 1️⃣ Adding New Planet Lore

**File**: `data/lore.json`

```json
{
  "repoId": "repo-name",
  "planetName": "Cool World Name",
  "biome": "neon-megacity",
  "civilization": "The Builders",
  "mission": "One-line mission statement",
  "story": "3-5 sentence narrative",
  "motto": "Short tagline",
  "color": "#HEX",
  "manualConnections": ["related-repo-1"],
  "demoUrl": null,
  "docsUrl": null
}
```

### 2️⃣ Creating Components

**Location**: `src/components/`

**Key Components**:
- `Universe.tsx` - Main 3D scene with camera controls
- `Planet.tsx` - Individual planet mesh with hover/click
- `PlanetSheet.tsx` - Info panel showing planet details
- `FocusControl.tsx` - NOW/NEXT/RESTING mode switcher
- `Timeline.tsx` - Historical view slider

### 3️⃣ Fetching GitHub Data

**File**: `scripts/fetch-planets.js`

**Endpoint**: `GET https://api.github.com/user/repos`

**Fields to fetch**:
- name, description, url, language
- stargazers_count, forks_count, watchers_count
- open_issues_count, archived, private
- created_at, updated_at, pushed_at
- topics, default_branch

### 4️⃣ Updating Progress

**File**: `WHATS-DONE.md`

Mark items complete as you build them. This helps Lyndon see progress at a glance.

---

## 🌌 Hyper 3D Direction

The Universe view is a React Three Fiber layer over the **same** data pipeline.

Rules that must not be broken:

- 3D is a **visual enhancement layer** over the accessible 2D Hub. List view is the
  default and must always remain sufficient on its own.
- **All visuals derive from real repo / activity / quest / lore data.** Never build a
  decorative planet with no data meaning.
- **Measure a signal's real distribution before mapping a visual to it.** The first
  draft of the spec sized planets by stars — but this universe's max star count is 3,
  so it would have rendered 84 identical spheres. Codebase size (`sizeKb`) ranges
  1 → 481,833 and is the real size signal. See `docs/PLANET-VISUAL-MAPPING.md`.
- **Never recompute biome or colour in the 3D layer.** They are already resolved in
  `mergeData.ts`. A second derivation means a world can look like two different things.
- **Positions are computed** (deterministic hash of the repo slug + focus shell), never
  hand-placed. Hardcoded x/y is why the old `hyperfocus-constellation` froze at 24 stars.
- Preserve keyboard access: the canvas is `aria-hidden` and a real DOM button exists for
  every planet. Preserve `prefers-reduced-motion`, which stops **all** orbit and spin.

---

## 💡 Development Principles

### Accessibility First

- Reduced motion by default
- Keyboard navigation (arrow keys, tab, enter)
- High contrast mode option
- Screen reader labels
- Never remove accessibility features

### ADHD-Friendly Design

- Clear visual hierarchy
- One primary focus at a time
- Gentle feedback (celebrations, not guilt)
- Quick context switching
- No overwhelming dashboards

### Story Over Stats

- Every project has a purpose narrative
- Archived projects = honored ancient worlds, not failures
- Activity drives visuals, but worth ≠ metrics
- Manual lore > auto-generated descriptions

### Code Quality

- TypeScript for type safety
- Component-based architecture
- Clear file/function naming
- Comments for complex 3D math
- Accessible component patterns

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Fetch latest GitHub data
npm run fetch-planets

# Type check
npm run type-check
```

---

## 📌 Important Notes

### DO:

- Read `WHATS-DONE.md` to see current progress
- Edit `data/lore.json` to add planet stories
- Follow existing code patterns
- Ask clarifying questions if unclear
- Test accessibility features
- Update `WHATS-DONE.md` after completing tasks

### DON'T:

- Edit `data/planets.json` manually (auto-generated)
- Remove accessibility features
- Add guilt-inducing language/metrics
- Overwhelm with too many visible options
- Break focus mode principles

---

## 🔗 Related Projects

- **HyperFocus Zone Portal** - Main ecosystem hub
- **THE-HYPERCODE** - Visual coding for neurodivergent minds
- **Hyperfocus Constellation** - Original inspiration (3D research viz)
- **HyperFocus-The-Anime** - AI anime production pipeline
- **3D-Print-Genie** - 3D printing optimization

---

## 🎯 Current Status

**Phase**: Foundation (Level 1 MVP)

See `WHATS-DONE.md` for detailed progress.

---

## 💙 Remember

This isn't just a GitHub visualizer. It's:

- A **continuity system** for returning after distraction
- A **narrative framework** for understanding purpose
- A **focus tool** for ADHD minds
- A **celebration** of all work, not just active projects

**Every commit is world-building.** 🌌♾️
