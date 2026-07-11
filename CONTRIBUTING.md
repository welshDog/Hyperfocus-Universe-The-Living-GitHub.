# Contributing to Hyperfocus Universe

Thank you for your interest in contributing to this project! This guide will help you get started.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup

```bash
# Clone the repo
git clone https://github.com/welshDog/Hyperfocus-Universe-The-Living-GitHub..git
cd Hyperfocus-Universe-The-Living-GitHub.

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📚 Project Structure

- `data/` - Planet data and lore (JSON files)
- `src/` - React components and Next.js app
- `scripts/` - GitHub API fetcher and utilities
- `.github/workflows/` - GitHub Actions for auto-refresh

## 🧠 Understanding the System

### Data Flow

1. **GitHub API** → `scripts/fetch-planets.js` fetches repo data
2. **planets.json** - Auto-generated GitHub metadata
3. **lore.json** - Hand-written planet stories (YOU EDIT THIS!)
4. **Frontend** - Merges both files to render the universe

### Key Files

- `data/planets.json` - **DO NOT EDIT MANUALLY** (auto-generated)
- `data/lore.json` - **EDIT THIS** to add planet stories and biomes
- `README.md` - Main project documentation

## ✨ How to Contribute

### 1️⃣ Adding Planet Lore

Edit `data/lore.json` to add or update planet stories:

```json
{
  "repoId": "YOUR-REPO-NAME",
  "planetName": "Cool Planet Name",
  "biome": "neon-megacity",
  "civilization": "The Builders",
  "mission": "What this project does",
  "story": "A short narrative about this world",
  "motto": "A one-liner motto",
  "color": "#FF6B9D"
}
```

### 2️⃣ Adding New Biomes

In `data/lore.json`, add to `biomeDefinitions`:

```json
"your-biome-name": {
  "description": "Visual description",
  "primaryColor": "#HEXCODE",
  "terrainType": "category"
}
```

### 3️⃣ Improving the 3D Universe

- Planet meshes: `src/components/Planet.tsx`
- Main scene: `src/components/Universe.tsx`
- Info panel: `src/components/PlanetSheet.tsx`

### 4️⃣ Enhancing the Fetcher

`scripts/fetch-planets.js` pulls GitHub data. You can:

- Add more API fields
- Improve error handling
- Add rate-limit checks

## 🧑‍💻 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing formatting (we'll add Prettier later)
- Component names: PascalCase
- File names: kebab-case or PascalCase for components

### Commit Messages

Use clear, descriptive messages:

```
Add Forgeworld lore to 3D-Print-Genie planet
Fix planet rotation speed in Universe component
Update fetch-planets.js to include topic data
```

### Accessibility

This project prioritizes neurodivergent-friendly design:

- Reduced motion by default
- High contrast options
- Keyboard navigation
- Screen reader support
- Clear, non-overwhelming UI

Never remove accessibility features. Add more!

## 🐛 Reporting Issues

Found a bug? Open an issue with:

- What you expected
- What actually happened
- Steps to reproduce
- Screenshots (if relevant)

## 🌟 Feature Requests

Have an idea? Open an issue and describe:

- The problem it solves
- How it fits the project vision
- Possible implementation approach

## 🛠️ Pull Request Process

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/cool-thing`
3. Make your changes
4. Test locally
5. Commit with clear messages
6. Push to your fork
7. Open a PR with a description

We'll review and provide feedback!

## 💙 Code of Conduct

- Be kind and respectful
- Welcome neurodivergent perspectives
- No gatekeeping or elitism
- Celebrate creative solutions
- Help others learn

This is a safe space for ADHD/neurodivergent developers.

## ❓ Questions?

Not sure where to start? Open a discussion or issue. We're here to help!

---

**Remember:** Your code isn't just commits. It's world-building. 🌌♾️
