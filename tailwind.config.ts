import type { Config } from 'tailwindcss';

// Tailwind v3 (matches tailwindcss ^3.4 in package.json). Do not mix with v4
// setup instructions — v4 drops this file for CSS-first config.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f', // deep space background
        surface: '#14141c', // card
        surfaceHi: '#1e1e2a', // hover / raised
        edge: '#2e2e3f', // borders
        ink: '#f5f5f7', // primary text
        inkDim: '#a1a1b5', // secondary text — 7.0:1 on void, AAA
        focus: '#7dd3fc', // focus ring: high contrast against every biome colour
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
