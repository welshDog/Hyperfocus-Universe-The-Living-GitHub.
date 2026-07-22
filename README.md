# 🌌 Hyperfocus Universe: The Living Hub

> **"A commit is no longer a line on a graph — it is a visible act of world-building."**

[![Live Universe](https://img.shields.io/badge/🌌_Live_Universe-Visit_Now-7c3aed?style=for-the-badge)](https://hyperfocus-universe-the-living-hub.vercel.app)
[![HyperFocus Zone Portal](https://img.shields.io/badge/🗺️_Ecosystem_Map-Portal-0ea5e9?style=for-the-badge)](https://github.com/welshDog/HyperFocus-Zone-Portal)
[![Neuro Dev Stack](https://img.shields.io/badge/⚡_Neuro_Dev_Stack-Quickstart-22c55e?style=for-the-badge)](https://github.com/welshDog/HyperCode-V2.4)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

---

## 🚀 What is this?

**Hyperfocus Universe** transforms your GitHub repositories into a **living, breathing 3D solar system** where every commit is world-building and every repo is a planet with its own civilisation.

> 🧠 **Built for neurodivergent minds.** Designed with ADHD-friendly focus modes, no guilt-inducing metrics, and a narrative layer that makes your work feel like an adventure — not a checklist.

**This is NOT just a pretty visualisation.** It's your:
- 🗺️ **Developer command centre** — see your whole ecosystem at a glance
- 🌍 **Live project map** — GitHub activity drives the world in real time
- 🎮 **Interactive portfolio** — visitors explore your universe
- 🎯 **Focus engine** — NOW / NEXT / RESTING modes for ADHD clarity

---

## 🌠 Live Universe

**👉 [hyperfocus-universe-the-living-hub.vercel.app](https://hyperfocus-universe-the-living-hub.vercel.app)**

Fly through the universe. Click planets. Read their lore. See live GitHub activity.

---

## ✨ Core Features

### 🪐 Living Planets
Each repository becomes a unique world:
- **Biomes based on language**: TypeScript = neon megacity, Python = bio-tech jungle, Rust = volcanic forge
- **Activity-driven visuals**: recent commits = glowing halos, open issues = visible rifts, archived repos = peaceful museum worlds
- **Real GitHub data**: stars, forks, commits, contributors, releases all shape the planet
- **Custom lore**: hand-written civilisation stories and missions for each project

### 🎯 Focus Mode (ADHD-First)
Built specifically for neurodivergent brains:
- **NOW** — Pick one planet to focus on. Everything else dims.
- **NEXT** — 1–3 planets in close orbit for upcoming work
- **RESTING** — All other projects, calm and preserved (never "dead" or "abandoned")
- **No overwhelm**: See only what matters, when it matters

### 🎮 Explorer Mode
For visitors and portfolio viewing:
- Fly through your developer universe
- Click planets to read their story and see live stats
- Jump to GitHub, docs, or live demos
- Collect exploration badges (optional)

### 🔄 Live Updates
- GitHub Actions auto-refreshes planet data
- Webhook support for instant updates (optional)
- Timeline slider to see your universe evolve over time
- Event system: releases = fireworks, issue fixes = celebrations

### ♿ Accessible by Design
- Reduced motion mode
- High contrast options
- Keyboard navigation
- Screen reader friendly
- Optional audio (always mutable)
- 2D fallback map for non-3D environments

---

## 🗺️ Ecosystem Position

This is the **story layer** of the Hyperfocus Zone. Here's how it fits:

```
🌌 Hyperfocus Universe (YOU ARE HERE)
    ↓ story view of everything
🗺️ HyperFocus-Zone-Portal      → ecosystem map + front door
⚡ HyperCode-V2.4               → 32-agent engine (the power plant)
💻 HyperFocus-IDE-BROski-v1    → the IDE you actually code in
🧠 BROski-Obsidian-Brain       → long-term memory layer
🎓 Hyper-Vibe-Coding-Course    → learn the whole stack
🛠️ WelshDog-Mission-Control    → ops dashboard
```

📍 **Full ecosystem map** → [HyperFocus-Zone-Portal](https://github.com/welshDog/HyperFocus-Zone-Portal)

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript |
| 3D Engine | React Three Fiber + Drei + Three.js |
| GitHub Data | REST API + GitHub Actions |
| Styling | Tailwind CSS + Framer Motion |
| Deployment | Vercel |
| Data | JSON files (planets.json + lore.json) |

---

## 📁 Project Structure

```
Hyperfocus-Universe-The-Living-Hub/
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
│   └── fetch-planets.js      # CLI to fetch GitHub data
├── .github/workflows/
│   └── refresh-planets.yml   # Auto-update action
├── UNIVERSE-STORY.md         # 📖 The lore of this universe
├── CONNECT.md                # 🗺️ Navigate the whole ecosystem
└── README.md                 # This file
```

---

## 🎯 Roadmap

### ✅ Level 1: It Lives (MVP)
- [x] GitHub API integration
- [x] Basic 3D universe with clickable planets
- [x] Planet colours based on primary language
- [x] Activity glow for recent commits
- [x] Side panel with repo info
- [x] Focus mode (NOW/NEXT/RESTING)

### 🚧 Level 2: It Reacts
- [ ] Commit-driven structure generation
- [ ] Issue rifts and release fireworks
- [ ] Topic-based orbital connections
- [ ] Manual lore system
- [ ] Timeline slider (view universe history)
- [ ] Archived repo special visuals (Museum Worlds)

### 🌟 Level 3: It Becomes a Game
- [ ] Simple AI citizens (wander, build, celebrate)
- [ ] Daily "kind quest" based on real tasks
- [ ] Achievement system (first star, 7-day streak, etc.)
- [ ] Visitor exploration mode with badges
- [ ] Museum mode for project history
- [ ] Soundtrack per biome (optional, always mutable)

---

## 🧠 Philosophy

As a neurodivergent developer with ADHD, traditional project dashboards were:
- **Overwhelming** — too many metrics, too much guilt
- **Disconnected** — no sense of continuity or story
- **Demotivating** — quiet projects felt like failures

This universe is different:
- **No guilt** — Resting projects are beautiful archives, not dead failures
- **Narrative-driven** — Every project has a purpose and story
- **Focus-oriented** — See only what you need to see
- **Continuity** — Return after distraction to a world that makes sense

### Design Principles
1. **Activity ≠ Worth** — Archived projects are honoured, not hidden
2. **Focus over overwhelm** — Less is more
3. **Story over stats** — Why you built it matters more than star count
4. **Gentle feedback** — Celebrations, never shame
5. **Accessibility first** — Works for everyone, built for neurodivergent minds

---

## 🤝 Contributing

This is an open-source project built in the spirit of neurodivergent creativity. Contributions welcome!
- 🐛 Report bugs or suggest features via Issues
- 🎨 Improve planet biome designs
- 🧪 Add new civilisation archetypes
- 📝 Improve documentation
- ♿ Enhance accessibility features
- 🎮 Suggest game mechanics

---

## 🗺️ Navigate the Ecosystem

See **[CONNECT.md](CONNECT.md)** for the full map of every Hyperfocus Zone project and where to go next.

---

## 📜 License

GPL-3.0 — see [LICENSE](LICENSE) for details.

---

## 💙 Built by WelshDog

Built by **[@welshDog](https://github.com/welshDog)** from Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿

Part of the **[Hyperfocus Zone](https://github.com/welshDog/HyperFocus-Zone-Portal)** — a full neurodivergent-first developer ecosystem.

---

**Remember: Your code isn't just commits. It's a universe you're building, one world at a time. 🌌♾️**
