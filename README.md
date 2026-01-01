# Funding Copilot (ARGS prototype)

Evidence-first capital matching: founders ask in natural language (English/Indic; future voice), ARGS returns investors and government schemes ranked by fit with transparent scoring and citations.

## What’s shipped in this repo
- Single-page React + Vite frontend styled with Tailwind and shadcn-style UI primitives (Button, Card, Badge, Input, Select, Textarea, Label).
- Static data for investors, schemes, and trend charts in [src/data.js](src/data.js); no backend calls yet.
- Charting via Chart.js (react-chartjs-2) for trend visualizations.
- Utility helpers in [src/lib/utils.js](src/lib/utils.js) and UI components in [src/components/ui](src/components/ui).

## Proposed end-to-end architecture
```
[Client: Web/Voice]
	| https + JWT + size clamps
[CDN/WAF]
	|
[API Gateway]
	|-- auth, rate limit, validation
	v
[Orchestrator (Node/TS + LangChain)]
	|-- language detect/translate (Bhashini/IndicBERT)
	|-- intent routing (investor vs scheme)
	|-- safety filters + guardrails
	|-- retrieval + scoring + LLM synthesis
	|
	+--> [Vector: Pinecone (multilingual-e5-large)]
	+--> [Keyword: Postgres FT/Elastic]
	+--> [Graph: Neo4j edges sector-stage-geo-ticket]
	+--> [Scoring: sector/stage/ticket/geo/recency]
	+--> [LLM: GPT-4/Claude w/ timeouts]
	+--> [Fallback: deterministic scoring + snippets]
	+--> [Citation validator]
	v
[Response] ranked investors/schemes + rationale + confidence + trend data
```

## Frontend feature goals
- Multi-language prompts with detection and future voice input; auto-fill of sector, stage, geography, and ticket size.
- Hybrid results view: ranked investors with rationales + eligible schemes; confidence pill; inline citations; visible trend highs/lows.
- Quick prompts and recent history to guide new queries.
- Dark/light theme via CSS variables.

## Data/Retrieval strategy (backend plan)
- Vector search: Pinecone (multilingual-e5-large embeddings), namespace per corpus.
- Keyword search: Postgres full-text or Elastic for high-precision filters.
- Graph context: Neo4j capturing investor–sector–stage–geo–round links with recency weights.
- Scoring: sector, stage, ticket, geography, recency → confidence.
- LLM synthesis: GPT-4/Claude with timeouts; inline citation IDs; guarded by safety filters.
- Fallback: deterministic scoring + retrieved snippets if LLM fails.

## Ops and safety (backend plan)
- Guardrails: input length clamps, PII/abuse filters, citation ID validation, retries with budgets.
- Observability: OpenTelemetry traces, Sentry errors, structured logs.
- Deployment: frontend on Vercel/Netlify; API on Fly/Render/AWS; managed Pinecone/Neo4j/Postgres/Elastic.

## Local development
```bash
npm install
npm run dev
```
Defaults to port 5173 (see [vite.config.js](vite.config.js)).

## Build and preview
```bash
npm run build
npm run preview
```

## Project structure
- [src/main.jsx](src/main.jsx) mounts the app and pulls in global styles.
- [src/App.jsx](src/App.jsx) renders the single-page experience.
- [src/data.js](src/data.js) holds mock investors, schemes, and trend data.
- [src/styles.css](src/styles.css) contains Tailwind directives and theme tokens.
- [src/components/ui](src/components/ui) houses shared UI primitives.

## Next steps (suggested)
1) Add API layer + LangChain orchestration to replace static data.
2) Wire hybrid retrieval (Pinecone + Postgres/Elastic + Neo4j) and scoring service.
3) Add voice capture to the UI and connect to speech endpoint.
4) Implement inline citation validation and confidence pill from backend scores.
5) Add telemetry (OTel) and error reporting (Sentry) to frontend and API.

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview built app

## Team
- Gowtham SD
- Shruthi Sivakumar
- Ashwin JR
- Rithesh SS
