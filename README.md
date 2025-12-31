# Funding Copilot

Minimal single-page React + Vite app using Tailwind and shadcn-style components to surface investor and scheme matches with transparent scoring.

## Stack
- React 18 + Vite
- Tailwind CSS 3
- Chart.js via react-chartjs-2
- Custom lightweight shadcn-like UI primitives (Button, Card, Badge, Input, Select, Textarea, Label)

## Run locally
```bash
npm install
npm run dev
```
App defaults to port 5173 (see vite.config.js).

## Build
```bash
npm run build
npm run preview
```

## Features
- Multi-language queries with simple language detection.
- Auto-fill entity extraction for sector, stage, location, amount.
- Investor scoring (sector/stage/ticket/geo/recency) with confidence dots and reasoning.
- Government scheme suggestions.
- Trends charts (line + bar) driven by selected sector.
- Quick prompts, recent history, and data-source grounding list.
- Dark/light toggle via CSS variables.

## Notes
- Tailwind directives live in src/styles.css.
- Trends data and investors/schemes live in src/data.js.
- No routing; single-page experience.

## Team
- Gowtham SD
- Shruthi Sivakumar
- Ashwin JR
- Rithesh SS

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview built app
