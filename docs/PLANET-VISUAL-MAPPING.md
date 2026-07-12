# 🌌 Planet Visual Mapping System

## Purpose

Turn every GitHub repository into a living planet whose appearance evolves from real
repo data.

This is a visual layer on top of the existing truth layer (repositories, quests, focus
state, lore, activity). **The 3D system must never replace the accessible 2D Hub.**
List view is the default; Universe view is the reward.

---

## Core Rule

All planet visuals are derived from data, not random decoration. If two worlds look
different, they **are** different, and you can point at the GitHub fact that made it so.

---

## ⚠️ Calibration: this universe, not a hypothetical one

The first draft of this spec mapped **stars → size** and **forks → moons**. Measured
against the real 84 repos on 2026-07-12:

| Signal | Reality | Verdict |
|---|---|---|
| `stars` | max **3**, median 0, 6/84 non-zero | Useless. Star-driven radius made all 84 planets the same size. |
| `forks` | max **1**, 4/84 non-zero | Useless. **Every planet would have had zero moons.** |
| `sizeKb` | **1 → 481,833**, 84/84 non-zero | Excellent. Orders of magnitude apart. |
| `openIssues` | max 122, 21/84 non-zero | Strong. |

Shipping the original mapping would have produced 84 identical grey spheres with a
beautiful spec behind them. **Always measure a signal's real distribution before you
build a visual on it.** The mappings below are the recalibrated ones.

---

## Mapping (as built)

| Repo signal | Planet effect | Measured coverage |
|---|---|---|
| **`sizeKb`** (codebase size, log₁₀) | `radius` 0.66 → 2.54 | **65 distinct sizes** across 84 worlds |
| **`biome` + `color`** (already merged) | `baseColor`, surface material | all 84 |
| **`focusState`** | Orbit shell: NOW inner (r≈9), NEXT mid (r≈17), RESTING outer (r≈27) + glow + spin | 10 / 7 / 67 |
| **`activityScore`** | `glowIntensity`, `spinSpeed` | all 84 |
| **`openIssues`** | `stormIntensity`, `lavaActivity`, cloud cover, roughness | 21 worlds |
| **`closedIssuesRecent`** (30d) | **Subtracts** from storms — worlds visibly heal as you close issues | 0 today; lights up the moment you close one |
| **`quests`** | `questBeacons` — one light per unfinished task | 8 worlds |
| **`lore.manualConnections`** | `moonCount` — a moon is a world this world is bound to | 5 worlds, 11 moons |
| **lore present OR `releaseCount` > 0** | `ringPresence` / `ringDensity` — rings are **earned** | 7 worlds |
| **`releaseCount`** | `haloPulse` — a rare celebration flare | 2 worlds |
| **`archived`** | `frozen`: no spin, no orbit, near-zero glow. A quiet museum, never a failure. | 11 worlds |

### Why moons come from lore, not forks

Forks would give **zero moons to all 84 planets**. Lore connections are meaningful,
they vary, and they reward the one thing that makes this universe yours: writing the
story. Lore presence also earns rings and a stronger axial tilt.

### Biome is NOT recomputed here

Biome and colour already resolve through `seed category → language fallback → lore
override` in `mergeData.ts`. The visual layer **consumes** `planet.biome` and
`planet.color`. Re-deriving them would let a world be `orbital-hub` in the 2D hub and
`neon-megacity` in 3D — a second source of truth, which is exactly what this spec's own
core rule forbids.

---

## Accessibility Rules

**A `<canvas>` is one opaque element. You cannot Tab to a sphere inside it.** Pretending
otherwise is how a project ends up claiming keyboard support it does not have — see the
old `hyperfocus-constellation`, whose README advertised keyboard shortcuts that were
never written.

So we don't pretend:

- The canvas is `aria-hidden` and **not focusable**. It is decoration.
- Beside it, `UniverseScene` renders a real `<ul>` of real `<button>`s — **one per
  planet**, NOW-first. Those are Tab-reachable, they open the same `PlanetSheet`, and
  focusing one highlights its world in 3D.
- Keyboard and mouse reach **identical functionality**. Only the spectacle differs.
- `prefers-reduced-motion: reduce` stops orbit, spin, moons, starfield drift and camera
  auto-rotate. Planets stay exactly where the data placed them. Nothing in the universe
  requires movement to be understood.
- 3D is **never required**. List view is the default and always sufficient.
- three.js is dynamically imported (`ssr: false`), so the 2D hub does not pay for a
  renderer it isn't using. First Load JS: 103 kB list-only → 105 kB with the toggle.

---

## Scene Layout

Concentric shells — the most relevant worlds are literally closest to you:

- Inner shell: `NOW`
- Middle shell: `NEXT`
- Outer shell: `RESTING` (tilted into a soft cloud so 67 worlds don't form a wall)

Orbit angles are a **deterministic hash of the repo slug**. Same world, same place,
every load — a universe that reshuffles on refresh is a universe you cannot learn.

---

## Product Principle

The Living Hub is not a screensaver.

1. Make active work feel alive.
2. Make continuity emotionally rewarding.
3. Turn repo activity into visible world evolution.

The magic is only worth anything because it is tied to truth.
