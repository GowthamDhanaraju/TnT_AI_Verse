# ARGS prototype (Ask · Retrieve · Ground · Share)

Ask → Retrieve → Ground → Share: evidence-first answers with scoring and citations so founders act with confidence.

Evidence-first capital matching for founders: ask in English or Indic (with future voice support) and get ranked investors and government schemes with fit scores, inline citations, and confidence so outreach stays targeted and defensible.

## Demo
- Prototype walkthrough video: https://drive.google.com/file/d/1M_R_qFoQD4dkIDF0ZcnZc-sUCVVU7rNb/view?usp=sharing

## Unique selling propositions (USPs)
- Grounded answers with source citations to build trust and reduce misinformation.
- Investor matching that explains why each investor is a good fit, not just a search list.
- Indic-first multilingual support so funding intelligence is usable beyond English.
- India-specific context that combines investors, funding trends, and government schemes.

![Unique selling propositions](Extrass/Unique%20Selling%20Propositions.png)
*Four-part USP view showing grounding, fit-based matching, Indic-first reach, and India-specific context.*

## What’s shipped in this repo
- Single-page React + Vite frontend styled with Tailwind and shadcn-style UI primitives (Button, Card, Badge, Input, Select, Textarea, Label).
- Seeded data for investors, schemes, and trend charts in [src/data.js](src/data.js).
- Charting via Chart.js (react-chartjs-2) for trend visualizations.
- Utility helpers in [src/lib/utils.js](src/lib/utils.js) and UI components in [src/components/ui](src/components/ui).

## Frontend feature goals
- Multi-language prompts with detection and future voice input; auto-fill of sector, stage, geography, and ticket size.
- Hybrid results view: ranked investors with rationales + eligible schemes; confidence pill; inline citations; visible trend highs/lows.
- Quick prompts and recent history to guide new queries.
- Dark/light theme via CSS variables.

## How ARGS responds to a query (conceptual flow)
1) Founder asks in text or voice (Indic or English).
2) Language is detected and, if needed, translated.
3) Intent is identified (e.g., investor match or scheme eligibility).
4) Funding knowledge is retrieved and synthesized into a grounded answer.
5) Source citations and confidence scoring are attached so the founder can act.

![Query flow](Extrass/Process_Flow.png)
*High-level flow from question to grounded answer with citations and confidence.*

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


## Conceptual architecture snapshot
- Client UI (web/voice) connects over HTTPS with JWT and edge protections (CDN/WAF).
- API gateway handles auth, rate limiting, and validation before orchestrating requests.
- NLP preprocessing covers language detection and translation (Bhashini/IndicBERT).
- Retrieval controller fans out to vector search (Pinecone), keyword search (Postgres FTS/Elastic), and graph context (Neo4j).
- Feature aggregation feeds a scoring engine across sector, stage, ticket, geography, and recency.
- LLM reasoning (GPT-4/Claude) produces rationale with citations; fallback engine provides deterministic answers.
- Citation validator and response formatter return ranked results with confidence and trends.

![Conceptual architecture](Extrass/System_Architecture.png)
*Conceptual architecture covering edge protections, orchestration, retrieval, scoring, reasoning, and response formatting.*

## Scripts
- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run preview` – preview built app

## Team

<table style="width:100%; border-collapse:collapse; border:none;">
	<tr>
		<td align="center" style="border:none; padding:12px; width:25%;">
			<img src="Extrass/gowtham.png" alt="Gowtham SD" width="120" />
			<div><strong>Gowtham SD</strong></div>
			<div><a href="https://www.linkedin.com/in/gowtham-dhanaraju-4b482a28a/">LinkedIn</a></div>
		</td>
		<td align="center" style="border:none; padding:12px; width:25%;">
			<img src="Extrass/shruti.jpg" alt="Shruthi Sivakumar" width="120" />
			<div><strong>Shruthi Sivakumar</strong></div>
			<div><a href="https://www.linkedin.com/in/shrutisivakumar25/">LinkedIn</a></div>
		</td>
		<td align="center" style="border:none; padding:12px; width:25%;">
			<img src="Extrass/ashwin.jpg" alt="Ashwin JR" width="120" />
			<div><strong>Ashwin JR</strong></div>
			<div><a href="https://www.linkedin.com/in/ashwin-jayachandran/">LinkedIn</a></div>
		</td>
		<td align="center" style="border:none; padding:12px; width:25%;">
			<img src="Extrass/rithesh.jpg" alt="Rithesh SS" width="120" />
			<div><strong>Rithesh SS</strong></div>
			<div><a href="https://www.linkedin.com/in/rithesh-ss-aa653a373/">LinkedIn</a></div>
		</td>
	</tr>
</table>
