# 🌌 Hyperfocus Universe: The Living GitHub

> **"A commit is no longer a line on a graph—it is a visible act of world-building."**

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Made with React Three Fiber](https://img.shields.io/badge/Made%20with-React%20Three%20Fiber-61DAFB?logo=react)](https://docs.pmnd.rs/react-three-fiber)
[![Powered by GitHub API](https://img.shields.io/badge/Powered%20by-GitHub%20API-181717?logo=github)](https://docs.github.com/en/rest)

---

## 🚀 What is this?

**Hyperfocus Universe** transforms your GitHub repositories into a **living, breathing 3D solar system** where:

- 🪐 **Every repo is a planet** with its own biome, civilization, and personality
- ⚡ **GitHub activity drives the world**: commits build structures, issues create rifts, releases trigger celebrations
- 🎮 **It's a game AND a portfolio**: visitors explore your universe, you navigate your projects with focus
- 🧠 **Built for neurodivergent minds**: designed with ADHD-friendly focus modes, gentle visual feedback, and no guilt-inducing metrics

**This is NOT just a pretty visualization.** This is your **developer command center**, **live project map**, and **interactive portfolio** all in one.

---

## ✨ Core Features

### 🌍 Living Planets

Each repository becomes a unique world:

- **Biomes based on language**: TypeScript = neon megacity, Python = bio-tech jungle, Rust = volcanic forge
- **Activity-driven visuals**: recent commits = glowing halos, open issues = visible rifts, archived repos = peaceful museum worlds
- **Real GitHub data**: stars, forks, commits, contributors, releases all shape the planet
- **Custom lore**: hand-written civilization stories and missions for each project

### 🎯 Focus Mode

Built specifically for ADHD brains:

- **NOW**: Pick one planet to focus on - everything else dims
- **NEXT**: 1-3 planets in close orbit for upcoming work
- **RESTING**: All other projects, calm and preserved (never "dead" or "abandoned")
- **No overwhelm**: See only what matters, when it matters

### 🎮 Explorer Mode

For visitors and portfolio viewing:

- Fly through your developer universe
- Click planets to read their story
- See live activity and project health
- Jump to GitHub, docs, or live demos
- Collect exploration badges (optional)

### 🔄 Live Updates

Your universe stays current:

- GitHub Actions workflow auto-refreshes planet data
- Webhook support for instant updates (optional)
- Timeline slider to see your universe evolve over time
- Event system: releases = fireworks, issue fixes = celebrations

### ♿ Accessible by Design

- Reduced motion mode
- High contrast options
- Keyboard navigation
- Screen reader friendly
- Optional audio (always mutable)
- Works without 3D (2D fallback map)

---

## ♿ Accessibility status

The first interface is designed for keyboard use, visible focus, dialog focus management,
and reduced-motion preferences.

Automated accessibility testing and screen-reader testing are planned and tracked.
We do not currently claim WCAG conformance or a completed accessibility audit.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14+ (App Router) + TypeScript
- **3D Engine**: React Three Fiber + Drei + Three.js
- **GitHub Data**: REST API + GitHub Actions for auto-refresh
- **Styling**: Tailwind CSS + Framer Motion
- **Deployment**: Vercel (or any static host)
- **Data Storage**: JSON files (planets.json + lore.json)

---

## 📁 Project Structure

```
Hyperfocus-Universe-The-Living-GitHub/
├── data/
│   ├── planets.json          # Auto-generated from GitHub API
│   ├── lore.json             # Hand-written planet stories
│   └── universeState.json    # Merged data for frontend
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main universe page
│   │   └── layout.tsx        # App layout
│   ├── components/
│   │   ├── Universe.tsx      # Main 3D scene
│   │   ├── Planet.tsx        # Individual planet mesh
│   │   ├── PlanetSheet.tsx   # Info panel sidebar
│   │   ├── FocusControl.tsx  # NOW/NEXT/RESTING controls
│   │   └── Timeline.tsx      # Historical view slider
│   ├── lib/
│   │   ├── github.ts         # GitHub API utilities
│   │   └── planetUtils.ts    # Planet calculation logic
│   └── types/
│       └── planet.ts         # TypeScript types
├── scripts/
│   └── fetch-planets.js      # CLI script to fetch GitHub data
├── .github/
│   └── workflows/
│       └── refresh-planets.yml  # Auto-update action
├── public/
│   └── textures/             # Planet textures (optional)
├── PLANET_LORE_GUIDE.md      # Guide for adding planet lore
└── README.md                 # This file
```

---

## 🎯 Roadmap

### ✅ Level 1: It Lives (MVP)

- [x] GitHub API integration
- [ ] Basic 3D universe with clickable planets
- [ ] Planet colors based on primary language
- [ ] Activity glow for recent commits
- [ ] Side panel with repo info
- [ ] Focus mode (NOW/NEXT/RESTING)

### 🚧 Level 2: It Reacts

- [ ] Commit-driven structure generation
- [ ] Issue rifts and release fireworks
- [ ] Topic-based orbital connections
- [ ] Manual lore system
- [ ] Timeline slider (view universe history)
- [ ] Archived repo special visuals

### 🌟 Level 3: It Becomes a Game

- [ ] Simple AI citizens (wander, build, celebrate)
- [ ] Daily "kind quest" based on real tasks
- [ ] Achievement system (first star, 7-day streak, etc.)
- [ ] Visitor exploration mode with badges
- [ ] Museum mode for project history
- [ ] Soundtrack per biome (optional, always mutable)

---

## 🧠 Philosophy

### Why this exists

As a neurodivergent developer with ADHD, I found that traditional project dashboards were:

- **Overwhelming**: too many metrics, too much guilt
- **Disconnected**: no sense of continuity or story
- **Demotivating**: quiet projects felt like failures

This universe is different:

- **No guilt**: Resting projects are beautiful archives, not dead failures
- **Narrative-driven**: Every project has a purpose and story
- **Focus-oriented**: See only what you need to see
- **Continuity**: Return after distraction to a world that makes sense

### Design principles

1. **Activity != Worth**: Archived projects are honored, not hidden
2. **Focus over overwhelm**: Less is more
3. **Story over stats**: Why you built it matters more than star count
4. **Gentle feedback**: Celebrations, never shame
5. **Accessibility first**: Works for everyone, built for neurodivergent minds

---

## 🤝 Contributing

This is an open-source project built in the spirit of neurodivergent creativity. Contributions welcome!

### Ways to contribute

- 🐛 Report bugs or suggest features via Issues
- 🎨 Improve planet biome designs
- 🧪 Add new civilization archetypes
- 📝 Improve documentation
- ♿ Enhance accessibility features
- 🎮 Suggest game mechanics

---

## 📜 License

GPL-3.0 License - see [LICENSE](LICENSE) for details.

---

## 💙 About

Built by **[@welshDog](https://github.com/welshDog)** as part of the **Hyperfocus Zone** ecosystem.

Part of a larger vision to create neurodivergent-friendly developer tools that respect how our brains actually work.

### Other Hyperfocus projects

- 🎯 [HyperFocus Zone Portal](https://github.com/welshDog/HyperFocus-Zone-Portal) - Main hub
- 💻 [THE-HYPERCODE](https://github.com/welshDog/THE-HYPERCODE) - Visual coding for divergent minds
- 🌌 [Hyperfocus Constellation](https://github.com/welshDog/hyperfocus-constellation) - Original inspiration

---

## 🚀 Get Started

Coming soon: Installation and quick start guide.

For now, this is under active construction. Watch this repo to see it come alive! 🔥

---

**Remember**: Your code isn't just commits. It's a universe you're building, one world at a time. 🌌♾️
