import React, { useEffect, useMemo, useState } from 'react';
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
  Filler,
} from 'chart.js';
import { Button } from './components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.jsx';
import { Badge } from './components/ui/badge.jsx';
import { Input } from './components/ui/input.jsx';
import { Select } from './components/ui/select.jsx';
import { Textarea } from './components/ui/textarea.jsx';
import { Label } from './components/ui/label.jsx';
import { investors, schemes, documents, trendLine, trendBar, contexts, baseHistory } from './data.js';

const freshnessTag = 'Demo data · last updated 15 days ago';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

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

const SimpleHeader = ({ eyebrow, title, subtitle }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{eyebrow}</span>
    <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
    {subtitle && <p className="text-sm text-[var(--muted)] max-w-2xl">{subtitle}</p>}
  </div>
);

const PageHeader = (props) => <SimpleHeader {...props} />;

const InvestorCard = ({ investor, score }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between gap-2">
        <div className="grid gap-1">
          <CardTitle className="text-base">{investor.name}</CardTitle>
          <CardDescription>{investor.geo.join(' · ')}</CardDescription>
        </div>
        <Badge variant="secondary">Score {score.total}</Badge>
      </div>
    </CardHeader>
    <CardContent className="grid gap-2 text-sm text-[var(--muted)]">
      <div className="flex flex-wrap gap-2 text-[var(--text)]">
        {investor.sectors.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
        <Badge variant="outline">{investor.stages.join(' / ')}</Badge>
        <Badge variant="outline">Ticket {investor.ticket[0]}-{investor.ticket[1]} Cr</Badge>
      </div>
      <div className="text-[var(--text)]">{investor.description}</div>
      <div className="text-xs">Why: {score.why}</div>
      <div className="text-xs">Latest: {investor.latest}</div>
      <div className="text-xs">Fit: {investor.fit}</div>
    </CardContent>
  </Card>
);

const SchemeCard = ({ scheme }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="text-base">{scheme.name}</CardTitle>
        <Badge variant="secondary">{scheme.location.join(', ')}</Badge>
      </div>
    </CardHeader>
    <CardContent className="grid gap-2 text-sm text-[var(--muted)]">
      <div className="text-[var(--text)]">{scheme.description}</div>
      <div className="text-xs">Eligibility: {scheme.eligibility}</div>
      <div className="text-xs">Sectors: {scheme.sectors.join(', ')}</div>
      <div className="text-xs">Stage: {scheme.stages.join(', ')}</div>
    </CardContent>
  </Card>
);

const AnswerCard = ({ answer }) => (
  <Card>
    <CardHeader>
      <CardTitle>Suggested next steps</CardTitle>
      <CardDescription>Plain text with cited snippets</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-3">
      <p className="text-sm whitespace-pre-line text-[var(--text)]">{answer.text}</p>
      <div className="grid gap-2 text-xs text-[var(--muted)]">
        <span>Confidence: {answer.confidence}</span>
        <div className="grid gap-1">
          {answer.sources.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 rounded border border-[var(--hairline)] px-3 py-2">
              <div>
                <div className="text-[var(--text)]">{s.title}</div>
                <div className="text-xs">Score {s.score}</div>
              </div>
              <Button variant="ghost" size="sm">Open</Button>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const QuickPrompts = ({ onSelect }) => (
  <Card>
    <CardHeader className="pb-2">
      <SimpleHeader eyebrow="Jump in" title="Try a prompt" subtitle="Different sectors and cities to show variation" />
    </CardHeader>
    <CardContent className="flex flex-wrap gap-2">
      {[
        'Need pre-seed edtech capital in Mumbai',
        'Looking for healthtech Series A in Delhi',
        'Require SaaS bridge round 8 Cr in Bangalore',
        'Women-led fintech applying for gov grants in Chennai',
        'D2C + fintech hybrid seeking seed in Pune'
      ].map((text) => (
        <Button key={text} variant="ghost" size="sm" onClick={() => onSelect(text)}>{text}</Button>
      ))}
    </CardContent>
  </Card>
);

const Hero = ({ onHindi, onTamil }) => (
  <Card className="bg-[var(--panel)]">
    <CardContent className="grid gap-3">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Find the right investors, quickly.</h1>
        <p className="text-sm text-[var(--muted)]">Ask in any language. We auto-fill your profile and give you a short list with reasons you can show anyone.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onHindi}>🇮🇳 Hindi example</Button>
        <Button variant="ghost" onClick={onTamil}>🌺 Tamil example</Button>
      </div>
    </CardContent>
  </Card>
);

const QueryPanel = ({
  query,
  setQuery,
  detected,
  runAnalysis,
  sector,
  setSector,
  stage,
  setStage,
  location,
  setLocation,
  amount,
  setAmount,
  autoFill,
  setAutoFill,
}) => (
  <Card>
    <CardHeader className="mb-2">
      <div>
        <CardTitle>Tell us what you need</CardTitle>
        <CardDescription>Language auto-detect on every query</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="grid gap-3">
      <div className="grid gap-2">
        <Label>Ask in any language</Label>
        <Textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Example: मुझे फिनटेक स्टार्टअप के लिए सीड फंडिंग चाहिए" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>Language: {detected.lang} · Translation: {detected.translation}</span>
          <div className="flex gap-2">
            <Button onClick={runAnalysis}>Run</Button>
            <Button variant="ghost" onClick={() => setQuery('')}>Clear</Button>
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="grid gap-1">
          <Label>Sector</Label>
          <Select value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="FinTech">FinTech</option>
            <option value="EdTech">EdTech</option>
            <option value="HealthTech">HealthTech</option>
            <option value="SaaS">SaaS</option>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label>Stage</Label>
          <Select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Series B">Series B</option>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label>Location</Label>
          <Select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Chennai">Chennai</option>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label>Capital needed (INR Cr)</Label>
          <Input type="number" min="1" max="50" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span>We will detect language, auto-fill fields, and rank investors.</span>
        <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <input type="checkbox" checked={autoFill} onChange={(e) => setAutoFill(e.target.checked)} />
          <span>Auto-fill from query</span>
        </label>
      </div>
    </CardContent>
  </Card>
);

const InvestorsPanel = ({ scoredInvestors, confidence }) => {
  const primary = scoredInvestors.slice(0, 4);
  const rest = scoredInvestors.slice(4);
  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-2">
        <SimpleHeader eyebrow="Matches" title="Top investors" subtitle="Simple scores with reasons" />
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className={`h-1.5 w-3 rounded-full ${i < confidence.active ? 'bg-[var(--accent)]' : 'bg-[var(--hairline)]'}`}></span>
            ))}
          </div>
          <span>Confidence {confidence.label}</span>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {primary.map(({ inv, score }) => (
          <InvestorCard key={inv.name} investor={inv} score={score} />
        ))}
      </div>
      {rest.length > 0 && (
        <details className="rounded border border-[var(--hairline)] bg-[var(--card)] p-3 text-sm text-[var(--muted)]">
          <summary className="cursor-pointer text-[var(--text)]">More investors ({rest.length})</summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {rest.map(({ inv, score }) => (
              <InvestorCard key={inv.name} investor={inv} score={score} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

const SchemesPanel = ({ matchedSchemes }) => (
  <div className="grid gap-3">
    <SimpleHeader eyebrow="Policy" title="Government schemes" subtitle="Quick eligibility hints" />
    <div className="grid gap-2 md:grid-cols-2">
      {matchedSchemes.map((s) => (
        <SchemeCard key={s.name} scheme={s} />
      ))}
    </div>
  </div>
);

const TrendsPanel = ({ trendMeta, sector }) => {
  const bars = trendMeta.series.map((value, idx) => ({
    label: trendMeta.labels[idx],
    value,
    height: Math.max(12, Math.round((value / (trendMeta.maxAmount || 1)) * 100))
  }));

  const lineData = useMemo(() => ({
    labels: trendMeta.labels,
    datasets: [
      {
        label: 'FinTech funding (Cr)',
        data: trendMeta.series,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#22c55e',
      },
    ],
  }), [trendMeta.labels, trendMeta.series]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index' } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.15)' }, beginAtZero: true },
    },
  }), []);

  const barData = useMemo(() => ({
    labels: trendMeta.stageMix.map((s) => s.label),
    datasets: [
      {
        label: 'Deals',
        data: trendMeta.stageMix.map((s) => s.count),
        backgroundColor: ['#22c55e', '#f97316', '#64748b'],
      },
    ],
  }), [trendMeta.stageMix]);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { intersect: false, mode: 'index' } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.15)' }, beginAtZero: true },
    },
  }), []);

  return (
    <div className="grid gap-3">
      <SimpleHeader eyebrow="Signals" title="Funding trends" subtitle="Two-column snapshot with a quick bar view" />
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardContent className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--text)]">Trajectory (INR Cr)</div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Badge variant="outline">{sector}</Badge>
                <span>{trendMeta.labels[0]} → {trendMeta.labels[trendMeta.labels.length - 1]}</span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <Line data={lineData} options={lineOptions} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
              <span>Peak: {trendMeta.maxAmount} Cr</span>
              <span>Points: {trendMeta.series.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-2">
            <div className="text-sm font-medium text-[var(--text)]">Snapshot</div>
            <div className="grid gap-2">
              <div className="rounded border border-[var(--hairline)] px-3 py-2">
                <div className="text-xs text-[var(--muted)]">Year lift</div>
                <div className="text-lg text-[var(--text)]">+{trendMeta.growth}%</div>
                <div className="text-xs text-[var(--muted)]">From Jan to latest month</div>
              </div>
              <div className="rounded border border-[var(--hairline)] px-3 py-2">
                <div className="text-xs text-[var(--muted)]">Recent momentum</div>
                <div className="text-lg text-[var(--text)]">+{trendMeta.mom}%</div>
                <div className="text-xs text-[var(--muted)]">Last interval move</div>
              </div>
              <div className="rounded border border-[var(--hairline)] px-3 py-2">
                <div className="text-xs text-[var(--muted)]">Deals counted</div>
                <div className="text-lg text-[var(--text)]">{trendMeta.totalDeals}</div>
                <div className="text-xs text-[var(--muted)]">Seed / A / B</div>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Stage mix (deals)</span>
                <span className="text-xs text-[var(--muted)]">stacked</span>
              </div>
              <div className="h-[240px] w-full">
                <Bar data={barData} options={barOptions} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {trendMeta.stageMix.map((s) => (
                  <Badge key={s.label} variant="outline">{s.label}: {s.count} · {s.share}%</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AnswerPanel = ({ answer }) => (
  <div className="grid gap-3">
    <SimpleHeader eyebrow="Output" title="Answer" subtitle="Cited, plain language" />
    <AnswerCard answer={answer} />
  </div>
);

const SourcesPanel = () => (
  <Card>
    <CardHeader className="pb-2">
      <SimpleHeader eyebrow="Grounding" title="Data sources" subtitle="What we read to justify the answer" />
    </CardHeader>
    <CardContent className="grid gap-2 text-sm text-[var(--muted)]">
      {contexts.map((c) => (
        <div key={c.title} className="flex items-start justify-between gap-3 rounded border border-[var(--hairline)] px-3 py-2">
          <div className="grid gap-1">
            <span className="text-[var(--text)]">{c.title}</span>
            <span className="text-xs">{c.detail}</span>
          </div>
          <span className="text-xs">{c.freshness}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

const HistoryPanel = () => (
  <Card>
    <CardHeader className="pb-2">
      <SimpleHeader eyebrow="Recent runs" title="Latest questions" subtitle="Keeps the page feeling alive" />
    </CardHeader>
    <CardContent className="grid gap-2 text-sm text-[var(--muted)]">
      {baseHistory.map((h, idx) => (
        <div key={idx} className="rounded border border-[var(--hairline)] p-3">
          <div className="text-[var(--text)]">User: {h.user}</div>
          <div className="text-xs">Answer: {h.bot}</div>
        </div>
      ))}
    </CardContent>
  </Card>
);


export default function App() {
  const [query, setQuery] = useState('मुझे फिनटेक स्टार्टअप के लिए सीड फंडिंग चाहिए');
  const [sector, setSector] = useState('FinTech');
  const [stage, setStage] = useState('Seed');
  const [location, setLocation] = useState('Bangalore');
  const [amount, setAmount] = useState(4);
  const [autoFill, setAutoFill] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [answer, setAnswer] = useState({ text: 'Run a query to see the reasoning.', sources: [], confidence: 'Low' });

  const detected = useMemo(() => detectLanguage(query), [query]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const profile = useMemo(() => ({ query, sector, stage, location, amount, detected }), [query, sector, stage, location, amount, detected]);

  const scoredInvestors = useMemo(() => {
    return investors.map((inv) => ({ inv, score: computeScore(profile, inv) }))
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
    const line = trendLine[sector] || trendLine.FinTech;
    const bar = trendBar[sector] || trendBar.FinTech;
    const amounts = line.data;
    const labels = line.labels;
    const start = amounts[0];
    const end = amounts[amounts.length - 1];
    const prev = amounts[amounts.length - 2];
    const growth = Math.round(((end - start) / start) * 100);
    const mom = Math.round(((end - prev) / prev) * 100);
    const stageCounts = bar.data;
    const totalDeals = stageCounts.reduce((a, b) => a + b, 0);
    const stageMix = (bar.labels || ['Seed', 'Series A', 'Series B']).map((label, idx) => ({
      label,
      count: stageCounts[idx],
      share: Math.round((stageCounts[idx] / totalDeals) * 100)
    }));
    const maxAmount = Math.max(...amounts);
    return { growth, mom, totalDeals, stageMix, series: amounts, labels, maxAmount };
  }, [sector]);

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

  const runAnalysis = (textOverride) => {
    const effectiveQuery = textOverride ?? query;
    const detectedNow = detectLanguage(effectiveQuery);
    const prof = autoFill ? extractEntities(effectiveQuery) : { ...profile, query: effectiveQuery, detected: detectedNow };
    if (autoFill) {
      setSector(prof.sector);
      setStage(prof.stage);
      setLocation(prof.location);
      setAmount(prof.amount);
    }
    const topDocs = retrieve(effectiveQuery);
    const bestInvestor = investors.map((inv) => ({ inv, score: computeScore(prof, inv) })).sort((a, b) => b.score.total - a.score.total)[0];
    const bestScheme = schemes.find(
      (s) => (s.sectors.includes('Any') || s.sectors.includes(prof.sector)) &&
        s.stages.includes(prof.stage) &&
        (s.location.includes('Pan-India') || s.location.includes(prof.location))
    );
    setAnswer({
      text: `• Investor: ${bestInvestor?.inv.name || 'N/A'} — ${bestInvestor?.score.why || ''}\n• Scheme: ${bestScheme?.name || 'None'} — ${bestScheme?.eligibility || 'N/A'}\n• Language: ${detectedNow.responseLang}.`,
      sources: topDocs,
      confidence: dotsForConfidence(bestInvestor?.score.total || 0).label
    });
  };

  return (
    <div className="min-h-screen bg-[var(--page)] px-4 py-6 text-[var(--text)]">
      <nav className="mb-6 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Funding Copilot</div>
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span>{freshnessTag}</span>
          <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
          </Button>
        </div>
      </nav>

      <div className="grid gap-4">
        <Hero
          onHindi={() => { const text = 'मुझे फिनटेक स्टार्टअप के लिए सीड फंडिंग चाहिए'; setQuery(text); runAnalysis(text); }}
          onTamil={() => { const text = 'என் ஃபின்டெக் ஸ்டார்ட்அப்புக்கு seed funding வேண்டும்'; setQuery(text); runAnalysis(text); }}
        />
        <QuickPrompts onSelect={(text) => { setQuery(text); runAnalysis(text); }} />
        <QueryPanel
          query={query}
          setQuery={setQuery}
          detected={detected}
          runAnalysis={runAnalysis}
          sector={sector}
          setSector={setSector}
          stage={stage}
          setStage={setStage}
          location={location}
          setLocation={setLocation}
          amount={amount}
          setAmount={setAmount}
          autoFill={autoFill}
          setAutoFill={setAutoFill}
        />
        <AnswerPanel answer={answer} />
        <InvestorsPanel scoredInvestors={scoredInvestors} confidence={confidence} />
        <SchemesPanel matchedSchemes={matchedSchemes} />
        <TrendsPanel trendMeta={trendMeta} sector={sector} />
        <SourcesPanel />
        <HistoryPanel />
      </div>
    </div>
  );
}
