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
import { Label } from './components/ui/label.jsx';
import { investors, schemes, documents, trendLine, trendBar, contexts, baseHistory } from './data.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const dotsForConfidence = (score) => {
  if (score >= 80) return { active: 6, label: 'High', tone: 'high', color: 'from-emerald-400 to-emerald-600' };
  if (score >= 60) return { active: 4, label: 'Medium', tone: 'mid', color: 'from-amber-300 to-amber-500' };
  return { active: 2, label: 'Low', tone: 'low', color: 'from-rose-300 to-rose-500' };
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
  const hasMalayalam = /[\u0D00-\u0D7F]/.test(text);
  if (hasHindi) return { lang: 'Hindi', translation: 'FinTech seed funding needed', responseLang: 'Hindi' };
  if (/தமிழ்|ஃபின்டெக்/i.test(text)) return { lang: 'Tamil', translation: 'Need seed funding for FinTech', responseLang: 'Tamil' };
  if (/తెలుగు/i.test(text)) return { lang: 'Telugu', translation: 'Need seed funding for FinTech', responseLang: 'Telugu' };
  if (hasMalayalam) return { lang: 'Malayalam', translation: 'Need seed funding for FinTech', responseLang: 'Malayalam' };
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

const promptLibrary = [
  {
    lang: 'English',
    badge: 'EN',
    items: [
      { text: 'Need pre-seed edtech capital in Mumbai', translation: 'Need pre-seed edtech capital in Mumbai', sector: 'EdTech', stage: 'Seed', location: 'Mumbai', amount: 2 },
      { text: 'Looking for healthtech Series A in Delhi', translation: 'Looking for healthtech Series A in Delhi', sector: 'HealthTech', stage: 'Series A', location: 'Delhi', amount: 12 },
      { text: 'Require SaaS bridge round 8 Cr in Bangalore', translation: 'Require SaaS bridge round 8 Cr in Bangalore', sector: 'SaaS', stage: 'Series A', location: 'Bangalore', amount: 8 },
      { text: 'Women-led fintech applying for gov grants in Chennai', translation: 'Women-led fintech applying for government grants in Chennai', sector: 'FinTech', stage: 'Seed', location: 'Chennai', amount: 3 },
      { text: 'D2C + fintech hybrid seeking seed in Pune', translation: 'D2C + fintech hybrid seeking seed in Pune', sector: 'FinTech', stage: 'Seed', location: 'Pune', amount: 4 }
    ]
  },
  {
    lang: 'Hindi',
    badge: 'HI',
    items: [
      { text: 'दिल्ली में हेल्थटेक सीरीज़ A निवेशक चाहिए', translation: 'Need healthtech Series A investor in Delhi', sector: 'HealthTech', stage: 'Series A', location: 'Delhi', amount: 10 },
      { text: 'मुंबई में प्री-सीड एडटेक फंडिंग खोज रहा हूँ', translation: 'Seeking pre-seed edtech funding in Mumbai', sector: 'EdTech', stage: 'Seed', location: 'Mumbai', amount: 2 },
      { text: 'बेंगलुरु में 8 करोड़ SaaS ब्रिज राउंड', translation: '8 Cr SaaS bridge round in Bangalore', sector: 'SaaS', stage: 'Series A', location: 'Bangalore', amount: 8 },
      { text: 'चेन्नई में फिनटेक महिला-नेतृत्व स्टार्टअप के लिए अनुदान', translation: 'Grant for women-led fintech startup in Chennai', sector: 'FinTech', stage: 'Seed', location: 'Chennai', amount: 3 },
      { text: 'पुणे में D2C + फिनटेक सीड फंडिंग', translation: 'D2C + fintech seed funding in Pune', sector: 'FinTech', stage: 'Seed', location: 'Pune', amount: 4 }
    ]
  },
  {
    lang: 'Tamil',
    badge: 'TA',
    items: [
      { text: 'சென்னைல் பெண்கள் தலைமையிலான ஃபின்டெக் மானியம்', translation: 'Women-led fintech grant in Chennai', sector: 'FinTech', stage: 'Seed', location: 'Chennai', amount: 3 },
      { text: 'பெங்களூருவில் 8 கோடி SaaS பால நிதி', translation: '8 Cr SaaS bridge round in Bangalore', sector: 'SaaS', stage: 'Series A', location: 'Bangalore', amount: 8 },
      { text: 'மும்பையில் ப்ரீ-சீட் எடுடெக் நிதி தேவை', translation: 'Need pre-seed edtech funding in Mumbai', sector: 'EdTech', stage: 'Seed', location: 'Mumbai', amount: 2 },
      { text: 'டெல்லியில் ஹெல்த்டெக் Series A முடிவு', translation: 'Healthtech Series A round in Delhi', sector: 'HealthTech', stage: 'Series A', location: 'Delhi', amount: 12 },
      { text: 'கோயம்புத்தூரில் D2C + ஃபின்டெக் விதை முதலீடு', translation: 'D2C + fintech seed investment in Coimbatore', sector: 'FinTech', stage: 'Seed', location: 'Chennai', amount: 4 }
    ]
  },
  {
    lang: 'Telugu',
    badge: 'TE',
    items: [
      { text: 'హైదరాబాద్‌లో ప్రీ-సీడ్ ఎడ్టెక్ ఫండింగ్ కావాలి', translation: 'Need pre-seed edtech funding in Hyderabad', sector: 'EdTech', stage: 'Seed', location: 'Hyderabad', amount: 2 },
      { text: 'విజయవాడలో హెల్త్టెక్ Series A పెట్టుబడి', translation: 'Healthtech Series A investment in Vijayawada', sector: 'HealthTech', stage: 'Series A', location: 'Hyderabad', amount: 10 },
      { text: 'బెంగళూరులో 8 కోట్లు SaaS బ్రిడ్జ్ రౌండ్', translation: '8 Cr SaaS bridge round in Bangalore', sector: 'SaaS', stage: 'Series A', location: 'Bangalore', amount: 8 },
      { text: 'చెన్నైలో ఫిన్‌టెక్ మహిళా స్టార్టప్ గ్రాంట్', translation: 'Fintech women startup grant in Chennai', sector: 'FinTech', stage: 'Seed', location: 'Chennai', amount: 3 },
      { text: 'పుణేలో D2C + ఫిన్‌టెక్ సీడ్ రైజ్', translation: 'D2C + fintech seed raise in Pune', sector: 'FinTech', stage: 'Seed', location: 'Pune', amount: 4 }
    ]
  },
  {
    lang: 'Malayalam',
    badge: 'ML',
    items: [
      { text: 'കൊച്ചിയിൽ പ്രീ-സീഡ് എഡ്ടെക് ഫണ്ടിംഗ് വേണം', translation: 'Need pre-seed edtech funding in Kochi', sector: 'EdTech', stage: 'Seed', location: 'Kochi', amount: 2 },
      { text: 'തിരുവനന്തപുരംയിൽ ഹെൽത്ത്റ്റെക് Series A നിക്ഷേപം', translation: 'Healthtech Series A investment in Trivandrum', sector: 'HealthTech', stage: 'Series A', location: 'Kochi', amount: 10 },
      { text: 'ബെംഗളൂരുവിൽ 8 കോടി SaaS ബ്രിഡ്ജ് റൗണ്ട്', translation: '8 Cr SaaS bridge round in Bangalore', sector: 'SaaS', stage: 'Series A', location: 'Bangalore', amount: 8 },
      { text: 'ചെന്നൈയിൽ വനിതാ ഫിൻടെക് സ്റ്റാർട്ടപ്പിന് ഗ്രാൻറ്', translation: 'Grant for women-led fintech startup in Chennai', sector: 'FinTech', stage: 'Seed', location: 'Chennai', amount: 3 },
      { text: 'പൂനെയിൽ D2C + ഫിൻടെക് സീഡ് ഫണ്ടിംഗ്', translation: 'D2C + fintech seed funding in Pune', sector: 'FinTech', stage: 'Seed', location: 'Pune', amount: 4 }
    ]
  }
];

const QuickPrompts = ({ onSelect }) => {
  const [langChoice, setLangChoice] = useState(promptLibrary[0].lang);
  const selected = promptLibrary.find((g) => g.lang === langChoice) || promptLibrary[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <SimpleHeader eyebrow="Jump in" title="Pick a prompt" subtitle="Choose a language then a prompt" />
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-[1fr,2fr] md:items-end">
        <div className="grid gap-1">
          <Label>Language</Label>
          <Select
            aria-label="Prompt language"
            value={langChoice}
            onChange={(e) => setLangChoice(e.target.value)}
            className="h-10 text-sm"
          >
            {promptLibrary.map((group) => (
              <option key={group.lang} value={group.lang}>{group.lang} ({group.badge})</option>
            ))}
          </Select>
        </div>
        <div className="grid gap-1">
          <Label>Prompt</Label>
          <Select
            aria-label={`${selected.lang} prompts`}
            defaultValue=""
            className="h-10 text-sm"
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              const prompt = selected.items.find((item) => item.text === value);
              if (prompt) onSelect({ ...prompt, lang: selected.lang });
            }}
          >
            <option value="">Select</option>
            {selected.items.map((item) => (
              <option key={item.text} value={item.text}>{item.text}</option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

const Hero = () => (
  <Card className="relative overflow-hidden bg-gradient-to-r from-[var(--panel)] via-[var(--card)] to-[var(--card)]">
    <div className="pointer-events-none absolute right-6 top-2 h-28 w-28 rounded-full bg-[var(--accent)]/15 blur-3xl" />
    <CardContent className="grid gap-4 md:grid-cols-[2fr,1fr] md:items-center">
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Investor radar</span>
        <h1 className="text-3xl font-semibold text-[var(--text)]">Find the right investors, quickly.</h1>
        <p className="text-sm text-[var(--muted)]">Pick a prompt in your language and get an instant fit with supporting evidence.</p>
      </div>
      <div className="grid gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--panel)]/60 p-4 text-sm text-[var(--muted)] shadow-inner">
        <div className="flex items-center justify-between text-[var(--text)]">
          <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Coverage</span>
          <Badge className="bg-[var(--accent)]/20 text-[var(--text)]">EN · HI · TA · TE · ML</Badge>
        </div>
        <div className="flex items-center justify-between text-[var(--text)]">
          <span>Prompt library</span>
          <span className="text-[var(--muted)]">25 curated asks</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const QueryPanel = ({
  query,
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
        <CardDescription>Pick a preset prompt; fields auto-fill</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="grid gap-3">
      <div className="grid gap-2">
        <Label>Selected prompt</Label>
        <div className="rounded-lg border border-[var(--hairline)] bg-[var(--card)]/70 p-3 text-sm text-[var(--text)]">
          {query ? query : 'Choose a prompt from the list above to populate fields.'}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>Language: {detected.lang} · Translation: {detected.translation}</span>
          <div className="flex gap-2">
            <Button onClick={runAnalysis} disabled={!query}>Run</Button>
            <Button variant="ghost" onClick={() => runAnalysis()}>Refresh</Button>
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
            <option value="Hyderabad">Hyderabad</option>
            <option value="Kochi">Kochi</option>
            <option value="Pune">Pune</option>
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
          <span>Auto-fill from prompt</span>
        </label>
      </div>
    </CardContent>
  </Card>
);

const InvestorsPanel = ({ scoredInvestors, confidence, topScore }) => {
  const primary = scoredInvestors.slice(0, 4);
  const rest = scoredInvestors.slice(4);
  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-2">
        <SimpleHeader eyebrow="Matches" title="Top investors" subtitle="Simple scores with reasons" />
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <div className="flex flex-col items-end">
            <span className="text-[var(--text)] font-semibold">Confidence {confidence.label}</span>
            <span className="text-[var(--muted)]">Score {topScore}/100</span>
          </div>
          <div className="relative h-10 w-28 overflow-hidden rounded-full border border-[var(--hairline)] bg-[var(--card)]">
            <div className={`absolute inset-y-1 left-1 right-1 rounded-full bg-gradient-to-r ${confidence.color}`} style={{ width: `${Math.min(100, Math.max(20, topScore))}%` }}></div>
            <div className="relative z-10 flex h-full items-center justify-center text-[11px] font-semibold text-[#04101a] mix-blend-screen">{confidence.label}</div>
          </div>
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
        <Card className="min-w-0 w-full h-full">
          <CardContent className="flex h-full min-w-0 w-full flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--text)]">Trajectory (INR Cr)</div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Badge variant="outline">{sector}</Badge>
                <span>{trendMeta.labels[0]} → {trendMeta.labels[trendMeta.labels.length - 1]}</span>
              </div>
            </div>
            <div className="flex-1 min-h-[320px] w-full min-w-0 max-w-full">
              <Line data={lineData} options={lineOptions} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
              <span>Peak: {trendMeta.maxAmount} Cr</span>
              <span>Points: {trendMeta.series.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 w-full h-full">
          <CardContent className="flex h-full min-w-0 w-full flex-col gap-2">
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
            <div className="grid gap-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Stage mix (deals)</span>
                <span className="text-xs text-[var(--muted)]">stacked</span>
              </div>
              <div className="h-[260px] w-full min-w-0 max-w-full">
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
  const [answer, setAnswer] = useState({ text: 'Run a query to see the reasoning.', sources: [], confidence: 'Low' });
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const detected = useMemo(() => {
    if (selectedPrompt && selectedPrompt.text === query) {
      return { lang: selectedPrompt.lang || selectedPrompt.badge || 'English', translation: selectedPrompt.translation, responseLang: selectedPrompt.lang || 'English' };
    }
    return detectLanguage(query);
  }, [query, selectedPrompt]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

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
    const cities = ['bangalore', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'kochi', 'pune'];
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

  const runAnalysis = (textOverride, metaOverride) => {
    const effectiveQuery = textOverride ?? query;
    const meta = metaOverride ?? (selectedPrompt && selectedPrompt.text === effectiveQuery ? selectedPrompt : null);
    const detectedNow = meta ? { lang: meta.lang || meta.badge || 'English', translation: meta.translation, responseLang: meta.lang || 'English' } : detectLanguage(effectiveQuery);
    const prof = autoFill
      ? meta
        ? { ...profile, ...meta, query: effectiveQuery, detected: detectedNow }
        : { ...profile, ...extractEntities(effectiveQuery), query: effectiveQuery, detected: detectedNow }
      : { ...profile, query: effectiveQuery, detected: detectedNow };
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
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--page)] px-4 py-8 text-[var(--text)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(52,211,153,0.12),transparent_30%),linear-gradient(140deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-[var(--hairline)] to-transparent opacity-60" />
      </div>

      <div className="mx-auto flex w-full max-w-none flex-col gap-4">
        <nav className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--card)]/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)]">AI</span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">ARGS</div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Ask · Retrieve · Ground · Share</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]" />
        </nav>

        <div className="grid gap-4">
          <Hero />
          <QuickPrompts
            onSelect={(prompt) => {
              setSelectedPrompt(prompt);
              setQuery(prompt.text);
              setSector(prompt.sector);
              setStage(prompt.stage);
              setLocation(prompt.location);
              setAmount(prompt.amount);
              runAnalysis(prompt.text, prompt);
            }}
          />
          <QueryPanel
            query={query}
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
          <InvestorsPanel scoredInvestors={scoredInvestors} confidence={confidence} topScore={topScore} />
          <SchemesPanel matchedSchemes={matchedSchemes} />
          <TrendsPanel trendMeta={trendMeta} sector={sector} />
          <SourcesPanel />
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}
