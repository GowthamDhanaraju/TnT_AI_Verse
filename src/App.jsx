import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  investors,
  schemes,
  contexts,
  documents,
  baseHistory,
  trendLine,
  trendBar
} from './data.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const freshnessTag = 'Demo data · last updated 15 days ago';

const PageHeader = ({ eyebrow, title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="page-title">{title}</h2>
      <p className="subtitle">{subtitle}</p>
    </div>
    {actions && <div className="header-actions">{actions}</div>}
  </div>
);

const dotsForConfidence = (score) => {
  if (score >= 80) return { active: 6, label: 'High', tone: 'high' };
  if (score >= 60) return { active: 4, label: 'Medium', tone: 'mid' };
  return { active: 2, label: 'Low', tone: 'low' };
};

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

const toVector = (text) => {
  const freq = new Map();
  normalize(text).split(/\s+/).filter(Boolean).forEach((w) => {
    freq.set(w, (freq.get(w) || 0) + 1);
  });
  return freq;
};

const cosine = (a, b) => {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  a.forEach((va, k) => {
    aMag += va * va;
    if (b.has(k)) dot += va * b.get(k);
  });
  b.forEach((vb) => { bMag += vb * vb; });
  if (!aMag || !bMag) return 0;
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
};

const detectLanguage = (text) => {
  const hasHindi = /[\u0900-\u097F]/.test(text);
  if (hasHindi) return { lang: 'Hindi', translation: 'FinTech seed funding needed', responseLang: 'Hindi' };
  if (/தமிழ்|ஃபின்டெக்/i.test(text)) return { lang: 'Tamil', translation: 'Need seed funding for FinTech', responseLang: 'Tamil' };
  if (/తెలుగు/i.test(text)) return { lang: 'Telugu', translation: 'Need seed funding for FinTech', responseLang: 'Telugu' };
  return { lang: 'English', translation: 'N/A', responseLang: 'English' };
};

const computeScore = (profile, investor) => {
  const sectorHit = investor.sectors.includes(profile.sector) ? 1 : 0;
  const sectorScore = sectorHit * 40;
  const stageHit = investor.stages.includes(profile.stage) ? 25 : 0;
  const amountMid = (investor.ticket[0] + investor.ticket[1]) / 2;
  const overlap = Math.max(0, 1 - Math.abs(amountMid - profile.amount) / (investor.ticket[1] + 0.0001));
  const ticketScore = Math.min(1, overlap) * 20;
  const geoHit = investor.geo.includes('Pan-India') ? 0.5 : investor.geo.includes(profile.location) ? 1 : 0;
  const geoScore = geoHit * 10;
  const recencyScore = investor.recencyDays <= 90 ? 5 : investor.recencyDays <= 180 ? 3 : 1;
  const total = Math.round(sectorScore + stageHit + ticketScore + geoScore + recencyScore);
  const why = `Sector ${sectorScore}/40; Stage ${stageHit}/25; Ticket ${ticketScore.toFixed(1)}/20; Geo ${geoScore}/10; Recency ${recencyScore}/5.`;
  return { total, why };
};

const SchemeCard = ({ scheme }) => (
  <div className="card">
    <div className="flex-between">
      <div>
        <div className="title-sm">{scheme.name}</div>
        <div className="muted sm">{scheme.doc}</div>
      </div>
      <span className="badge">Eligible</span>
    </div>
    <div className="meta-row">
      <span>Stage: {scheme.stages.join(', ')}</span>
      <span>Location: {scheme.location.join(', ')}</span>
      <span>Support: {scheme.amount}</span>
    </div>
    <div className="muted sm">Why: {scheme.eligibility}</div>
    <div className="divider" />
    <div className="muted tiny">Source: <a className="source-link" href={scheme.link} target="_blank" rel="noreferrer">{scheme.link}</a></div>
  </div>
);

const InvestorCard = ({ investor, score }) => (
  <div className="card">
    <div className="flex-between">
      <div>
        <div className="title-sm">{investor.name}</div>
        <div className="muted sm">{investor.portfolioNote}</div>
      </div>
      <div className="score">{score.total}%</div>
    </div>
    <div className="meta-row">
      <span>Sectors: {investor.sectors.slice(0, 2).join(', ')}{investor.sectors.length > 2 ? ' +' : ''}</span>
      <span>Stage: {investor.stages.join(', ')}</span>
      <span>Ticket: {investor.ticket[0]}-{investor.ticket[1]} Cr</span>
    </div>
    <div className="meta-row muted sm">Geo: {investor.geo.join(', ')}</div>
    <div className="muted sm">Why good fit: {score.why}</div>
    <div className="divider" />
    <div className="muted tiny">Sources: {investor.sources.join(', ')}</div>
  </div>
);

const ContextItem = ({ ctx }) => (
  <div className="history-item">
    <div className="title-sm">{ctx.title}</div>
    <div className="muted sm">{ctx.detail}</div>
    <div className="tiny">{ctx.freshness}</div>
  </div>
);

const HistoryItem = ({ entry }) => (
  <div className="history-item">
    <div><strong>User:</strong> {entry.user}</div>
    <div className="muted"><strong>Bot:</strong> {entry.bot}</div>
  </div>
);

const AnswerCard = ({ answer }) => (
  <div className="card">
    <div className="flex-between">
      <div className="title-sm">Grounded answer</div>
      <span className="badge">{answer.confidence} confidence</span>
    </div>
    <div className="muted sm" style={{ whiteSpace: 'pre-line' }}>{answer.text}</div>
    <div className="divider" />
    <div className="link-column">
      {answer.sources.map((s) => (
        <a key={s.id} className="source-link" href={s.url} target="_blank" rel="noreferrer">{s.source} · {s.title}</a>
      ))}
    </div>
  </div>
);

export default function App() {
  const [query, setQuery] = useState('मुझे फिनटेक स्टार्टअप के लिए सीड फंडिंग चाहिए');
  const [sector, setSector] = useState('FinTech');
  const [stage, setStage] = useState('Seed');
  const [location, setLocation] = useState('Bangalore');
  const [amount, setAmount] = useState(5);
  const [history, setHistory] = useState(baseHistory);
  const [autoFill, setAutoFill] = useState(true);
  const [answer, setAnswer] = useState({ text: 'Run analysis to generate a grounded answer.', sources: [], confidence: 'Low' });
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const profile = useMemo(() => ({ sector, stage, location, amount: Number(amount) || 5 }), [sector, stage, location, amount]);
  const detected = useMemo(() => detectLanguage(query), [query]);

  const scoredInvestors = useMemo(() => {
    return investors
      .map((inv) => ({ inv, score: computeScore(profile, inv) }))
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, 5);
  }, [profile]);

  const matchedSchemes = useMemo(() => {
    return schemes.filter(
      (s) => (s.sectors.includes('Any') || s.sectors.includes(profile.sector)) &&
        s.stages.includes(profile.stage) &&
        (s.location.includes('Pan-India') || s.location.includes(profile.location))
    ).slice(0, 3);
  }, [profile]);

  const topScore = scoredInvestors[0]?.score.total || 0;
  const confidence = dotsForConfidence(topScore);

  const trendMeta = useMemo(() => {
    const amounts = trendLine.data.datasets[0].data;
    const start = amounts[0];
    const end = amounts[amounts.length - 1];
    const prev = amounts[amounts.length - 2];
    const growth = Math.round(((end - start) / start) * 100);
    const mom = Math.round(((end - prev) / prev) * 100);
    const stageCounts = trendBar.data.datasets[0].data;
    const totalDeals = stageCounts.reduce((a, b) => a + b, 0);
    const stageMix = ['Seed', 'Series A', 'Series B'].map((label, idx) => ({
      label,
      count: stageCounts[idx],
      share: Math.round((stageCounts[idx] / totalDeals) * 100)
    }));
    return { growth, mom, totalDeals, stageMix };
  }, []);

  const retrieve = (text) => {
    const qVec = toVector(text);
    return documents.map((doc) => ({ doc, score: cosine(qVec, toVector(doc.text)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ doc, score }) => ({ ...doc, score: Number(score.toFixed(2)) }));
  };

  const extractEntities = (text) => {
    const lower = text.toLowerCase();
    const sectors = ['fintech', 'edtech', 'healthtech', 'saas'];
    const stages = ['seed', 'series a', 'series b'];
    const cities = ['bangalore', 'mumbai', 'delhi', 'chennai'];
    const foundSector = sectors.find((s) => lower.includes(s));
    const foundStage = stages.find((s) => lower.includes(s));
    const foundCity = cities.find((c) => lower.includes(c));
    const amountMatch = lower.match(/(\d+\.?\d*)\s*(cr|crore|crores)/);
    return {
      sector: foundSector ? foundSector.replace(/\b\w/, (m) => m.toUpperCase()) : sector,
      stage: foundStage ? foundStage.replace(/\b\w/, (m) => m.toUpperCase()) : stage,
      location: foundCity ? foundCity.charAt(0).toUpperCase() + foundCity.slice(1) : location,
      amount: amountMatch ? Number(amountMatch[1]) : amount
    };
  };

  const runAnalysis = () => {
    const prof = autoFill ? extractEntities(query) : profile;
    if (autoFill) {
      setSector(prof.sector);
      setStage(prof.stage);
      setLocation(prof.location);
      setAmount(prof.amount);
    }
    const topDocs = retrieve(query);
    const bestInvestor = investors.map((inv) => ({ inv, score: computeScore(prof, inv) })).sort((a, b) => b.score.total - a.score.total)[0];
    const bestScheme = schemes.find(
      (s) => (s.sectors.includes('Any') || s.sectors.includes(prof.sector)) &&
        s.stages.includes(prof.stage) &&
        (s.location.includes('Pan-India') || s.location.includes(prof.location))
    );
    const bot = `Top investors for ${prof.sector} at ${prof.stage} in ${prof.location}. Best fit: ${bestInvestor?.inv.name || 'N/A'} (${bestInvestor?.score.total || 0}%). Eligible scheme: ${bestScheme?.name || 'None'}. Responding in ${detected.responseLang}.`;
    setHistory((prev) => [...prev, { user: query || 'User query', bot }]);
    setAnswer({
      text: `• Investor: ${bestInvestor?.inv.name || 'N/A'} — ${bestInvestor?.score.why || ''}\n• Scheme: ${bestScheme?.name || 'None'} — ${bestScheme?.eligibility || 'N/A'}\n• Language: ${detected.responseLang}.`,
      sources: topDocs,
      confidence: dotsForConfidence(bestInvestor?.score.total || 0).label
    });
  };

  const addFollowup = () => {
    setHistory((prev) => [...prev, { user: 'Compare Accel vs Sequoia in EdTech', bot: 'Accel edges in early EdTech, Sequoia stronger in growth rounds.' }]);
  };
  const navLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

  const Hero = () => (
    <div className="hero">
      <div>
        <div className="pill">Investor Copilot · Multilingual · Cited</div>
        <h1>Capital answers you can show to LPs and founders.</h1>
        <div className="row top-gap">
          <span className="pill-inline">Vector + Graph + SQL</span>
          <span className="pill-inline">Grounded answers with sources</span>
          <span className="pill-inline">Built for India-first workflows</span>
        </div>
      </div>
      <div className="toggle-row">
        <button className="with-tip" data-tip="Prefill Hindi demo query" onClick={() => { setQuery('मुझे फिनटेक स्टार्टअप के लिए सीड फंडिंग चाहिए'); runAnalysis(); }}>
          <span className="icon">🇮🇳</span> Hindi demo
        </button>
        <button className="ghost with-tip" data-tip="Prefill Tamil demo query" onClick={() => { setQuery('என் ஃபின்டெக் ஸ்டார்ட்அப்புக்கு seed funding வேண்டும்'); runAnalysis(); }}>
          <span className="icon">🌺</span> Tamil demo
        </button>
      </div>
    </div>
  );

  const QueryPanel = () => (
    <div className="panel">
      <div className="flex-between">
        <div className="section-title"><h2>Query & Profile</h2><small>Auto language detect + investor preferences</small></div>
        <div className="link-row">
          <button className="ghost with-tip" data-tip="Record and transcribe via Bhashini STT (stub)">🎤 Voice (Bhashini)</button>
          <button className="ghost with-tip" data-tip="Upload pitch deck PDF for parsing (stub)">📄 Upload deck</button>
        </div>
      </div>
      <div className="controls">
        <div className="stack">
              <label>Ask in any language</label>
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Example: मुझे फिनटेक स्टार्टअप के लिए सीड फंडिंग चाहिए" />
          <div className="row space-between">
            <div className="tiny">Language: {detected.lang} · Translation: {detected.translation}</div>
                <div className="row">
                  <button className="with-tip" data-tip="Run entity extraction, scoring, retrieval">▶️ Run analysis</button>
                  <button className="ghost with-tip" data-tip="Reset the query box" onClick={() => setQuery('')}>✖ Clear</button>
            </div>
          </div>
        </div>
        <div className="stack">
          <div className="row wrap gap">
            <div className="stack grow">
              <label>Sector</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)}>
                <option value="FinTech">FinTech</option>
                <option value="EdTech">EdTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="SaaS">SaaS</option>
              </select>
            </div>
            <div className="stack grow">
              <label>Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)}>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
              </select>
            </div>
            <div className="stack grow">
              <label>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>
            <div className="stack grow">
              <label>Capital needed (INR Cr)</label>
              <input type="number" min="1" max="50" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="row space-between">
            <small>We will run hybrid retrieval (vector + graph + SQL), rank results, and answer in the detected language.</small>
            <label className="row" style={{ gap: '6px' }}>
              <input type="checkbox" checked={autoFill} onChange={(e) => setAutoFill(e.target.checked)} />
              <span className="tiny">Auto-fill from query</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const InvestorsPanel = () => (
    <div className="panel">
      <div className="flex-between">
        <div className="section-title"><h2>Top Investor Matches</h2><small>Scored with sector/stage/ticket/geo/recency</small></div>
        <div className="link-row">
          <button className="ghost with-tip" data-tip="Export shortlists as CSV (stub)">⬇ Export CSV</button>
          <button className="ghost with-tip" data-tip="Compare top two investors (stub)">📊 Compare</button>
          <div className="confidence" id="confidenceDots">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className={`dot ${i < confidence.active ? 'active ' + confidence.tone : ''}`}></span>
            ))}
            <small className="muted" id="confidenceLabel">Confidence: {confidence.label}</small>
          </div>
        </div>
      </div>
      <div className="card-list">
        {scoredInvestors.map(({ inv, score }) => (
          <InvestorCard key={inv.name} investor={inv} score={score} />
        ))}
      </div>
    </div>
  );

  const SchemesPanel = () => (
    <div className="panel">
      <div className="flex-between">
        <div className="section-title"><h2>Government Schemes</h2><small>Eligibility check (demo)</small></div>
        <span className="badge">Policy</span>
      </div>
      <div className="card-list">
        {matchedSchemes.map((s) => (
          <SchemeCard key={s.name} scheme={s} />
        ))}
      </div>
    </div>
  );

  const TrendsPanel = () => (
    <div className="panel">
      <div className="flex-between">
        <div className="section-title"><h2>Funding Trends</h2><small>Sample analytics (SQL aggregated)</small></div>
        <div className="row gap">
          <button className="ghost with-tip" data-tip="Show 2024 aggregates">2024</button>
          <button className="ghost with-tip" data-tip="Filter to FinTech examples">FinTech focus</button>
          <button className="ghost with-tip" data-tip="Download chart pack (stub)">🧾 Export</button>
          <span className="pill-badge">{freshnessTag}</span>
        </div>
      </div>
      <div className="row chart-row">
        <div className="chart-card">
          <Line options={trendLine.options} data={trendLine.data} height={220} />
        </div>
        <div className="chart-card">
          <Bar options={trendBar.options} data={trendBar.data} height={220} />
        </div>
      </div>
      <div className="stat-row">
        <div className="stat">
          <div className="tiny">Jan → Nov climb</div>
          <div className="title-sm">+{trendMeta.growth}%</div>
          <div className="muted sm">Based on monthly FinTech totals</div>
        </div>
        <div className="stat">
          <div className="tiny">Last interval (Sep → Nov)</div>
          <div className="title-sm">+{trendMeta.mom}%</div>
          <div className="muted sm">Momentum before year-end</div>
        </div>
        <div className="stat">
          <div className="tiny">Deals counted</div>
          <div className="title-sm">{trendMeta.totalDeals}</div>
          <div className="muted sm">Across Seed / A / B</div>
        </div>
      </div>
      <div className="card-list">
        <div className="card">
          <div className="title-sm">Narrative</div>
          <ul className="bullet-list">
            <li>Run-rate is up {trendMeta.growth}% from January; recent two-month lift is {trendMeta.mom}%.</li>
            <li>{trendMeta.stageMix[0].share}% of deals are Seed, indicating a strong early-stage skew.</li>
            <li>Series A holds {trendMeta.stageMix[1].share}% share; Series B is {trendMeta.stageMix[2].share}%.</li>
            <li>Use this to tune ticket sizes and which partners to approach first.</li>
          </ul>
        </div>
        <div className="card">
          <div className="title-sm">Stage mix snapshot</div>
          <div className="meta-row">
            {trendMeta.stageMix.map((s) => (
              <span key={s.label}>{s.label}: {s.count} deals · {s.share}%</span>
            ))}
          </div>
          <div className="divider" />
          <div className="tiny muted">SQL slice: SELECT stage, COUNT(*) FROM deals_2024 WHERE sector='FinTech' GROUP BY stage;</div>
          <div className="tiny muted">Timeseries slice: SELECT month, SUM(amount_cr) FROM deals_2024 GROUP BY month ORDER BY month;</div>
        </div>
      </div>
    </div>
  );

  const AnswerPanel = () => (
    <div className="panel">
      <div className="flex-between">
        <div className="section-title"><h2>Grounded answer & citations</h2></div>
        <div className="link-row">
          <button className="ghost with-tip" data-tip="Download PDF report (stub)">🧾 Export report</button>
          <span className="pill-badge">{freshnessTag}</span>
        </div>
      </div>
      {answer.confidence === 'Low' && (
        <div className="alert warn">
          <div className="title-sm">Low confidence</div>
          <div className="tiny">We did not find strong matching evidence. Refine the query or upload a deck for better grounding.</div>
        </div>
      )}
      <AnswerCard answer={answer} />
    </div>
  );

  const ContextPanel = () => (
    <div className="panel">
      <div className="section-title"><h2>Context used (RAG)</h2></div>
      <div className="history">
        {contexts.map((c) => <ContextItem key={c.title} ctx={c} />)}
      </div>
    </div>
  );

  const HistoryPanel = () => (
    <div className="panel">
      <div className="section-title"><h2>Conversation</h2></div>
      <div className="history">
        {history.map((h, idx) => <HistoryItem key={idx + h.user} entry={h} />)}
      </div>
      <button className="ghost with-tip" data-tip="Append a sample follow-up exchange" onClick={addFollowup}>Add followup</button>
    </div>
  );

  return (
    <Router>
      <div className="page">
        <nav className="nav">
          <div className="nav-brand">Funding Copilot</div>
          <div className="nav-links">
            <NavLink to="/" className={navLinkClass} end data-tip="Overview, query, quick answers" title="">🏠 Home</NavLink>
            <NavLink to="/investors" className={navLinkClass} data-tip="Ranked investors and scores">📈 Investors</NavLink>
            <NavLink to="/schemes" className={navLinkClass} data-tip="Government schemes eligibility">🎯 Schemes</NavLink>
            <NavLink to="/trends" className={navLinkClass} data-tip="Funding trend charts">📊 Trends</NavLink>
            <NavLink to="/context" className={navLinkClass} data-tip="RAG context and conversation">🗂 Context</NavLink>
          </div>
          <button className="ghost with-tip" data-tip="Toggle light/dark theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <span className="icon">{theme === 'dark' ? '🌞' : '🌙'}</span> {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="grid gap">
              <Hero />
              <div className="layout-2col balanced">
                <QueryPanel />
                <AnswerPanel />
              </div>
              <PageHeader eyebrow="Matches" title="Investor and policy fit" subtitle="Ranked recommendations with transparent reasons" />
              <div className="layout-2col split">
                <InvestorsPanel />
                <SchemesPanel />
              </div>
              <PageHeader eyebrow="Signals" title="Funding momentum" subtitle="Use recent deal flow to tune outreach" />
              <TrendsPanel />
            </div>
          } />
          <Route path="/investors" element={
            <div className="grid gap">
              <PageHeader
                eyebrow="Matches"
                title="Investor shortlists"
                subtitle="Sector, stage, ticket, geo, and recency weighted"
                actions={<><span className="pill-badge">{freshnessTag}</span><button className="ghost with-tip" data-tip="Export shortlists (stub)">⬇ Export</button></>}
              />
              <InvestorsPanel />
            </div>
          } />
          <Route path="/schemes" element={
            <div className="grid gap">
              <PageHeader
                eyebrow="Policy"
                title="Government schemes"
                subtitle="Eligibility snapshots for quick founder guidance"
                actions={<><span className="pill-badge">{freshnessTag}</span><button className="ghost with-tip" data-tip="Download policy pack (stub)">🧾 Export</button></>}
              />
              <SchemesPanel />
            </div>
          } />
          <Route path="/trends" element={
            <div className="grid gap">
              <PageHeader
                eyebrow="Signals"
                title="Funding trends"
                subtitle="Sample analytics to guide ticket sizing and timing"
                actions={<><span className="pill-badge">{freshnessTag}</span><button className="ghost with-tip" data-tip="Export charts (stub)">⬇ Export</button></>}
              />
              <TrendsPanel />
            </div>
          } />
          <Route path="/context" element={
            <div className="grid gap">
              <PageHeader
                eyebrow="Evidence"
                title="Context & conversation"
                subtitle="What was retrieved and how the bot responded"
                actions={<><span className="pill-badge">{freshnessTag}</span><button className="ghost with-tip" data-tip="Download transcript (stub)">🧾 Export</button></>}
              />
              <ContextPanel />
              <HistoryPanel />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}
