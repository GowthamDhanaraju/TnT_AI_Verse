export const investors = [
  { name: 'Sequoia Capital India', sectors: ['FinTech', 'SaaS'], stages: ['Seed', 'Series A'], ticket: [5, 15], geo: ['Pan-India'], recencyDays: 45, deals: 12, sources: ['Crunchbase', 'Website'], portfolioNote: '12 FinTech investments in 2024' },
  { name: 'Accel India', sectors: ['FinTech', 'EdTech', 'SaaS'], stages: ['Seed', 'Series A'], ticket: [3, 10], geo: ['Bangalore', 'Pan-India'], recencyDays: 80, deals: 8, sources: ['Inc42', 'Website'], portfolioNote: '8 FinTech/EdTech bets last year' },
  { name: 'Blume Ventures', sectors: ['SaaS', 'Consumer', 'FinTech'], stages: ['Seed'], ticket: [1, 5], geo: ['Mumbai', 'Bangalore'], recencyDays: 25, deals: 14, sources: ['Crunchbase'], portfolioNote: 'Active micro VC, recent seed rounds' },
  { name: 'Matrix Partners India', sectors: ['FinTech', 'Consumer'], stages: ['Seed', 'Series A', 'Series B'], ticket: [4, 20], geo: ['Pan-India'], recencyDays: 120, deals: 10, sources: ['VCCEdge'], portfolioNote: 'Multi-stage investor with consumer tilt' },
  { name: 'Elevation Capital', sectors: ['FinTech', 'EdTech', 'HealthTech'], stages: ['Seed', 'Series A'], ticket: [5, 18], geo: ['Delhi', 'Pan-India'], recencyDays: 60, deals: 9, sources: ['Crunchbase'], portfolioNote: 'Recent seed focus in fintech infra' },
  { name: 'Chiratae Ventures', sectors: ['HealthTech', 'FinTech', 'DeepTech'], stages: ['Series A', 'Series B'], ticket: [8, 25], geo: ['Bangalore'], recencyDays: 200, deals: 6, sources: ['Inc42'], portfolioNote: 'Later-stage preference, health heavy' },
  { name: 'India Quotient', sectors: ['FinTech', 'Consumer'], stages: ['Pre-Seed', 'Seed'], ticket: [0.5, 3], geo: ['Mumbai', 'Delhi'], recencyDays: 30, deals: 11, sources: ['Website'], portfolioNote: 'Very active at pre-seed' },
  { name: 'Lightspeed India', sectors: ['FinTech', 'SaaS', 'Consumer'], stages: ['Seed', 'Series A', 'Series B'], ticket: [6, 22], geo: ['Delhi', 'Bangalore', 'Pan-India'], recencyDays: 70, deals: 13, sources: ['News', 'Website'], portfolioNote: 'FinTech infra and SaaS heavy in 2024' },
  { name: 'Athera Ventures', sectors: ['HealthTech', 'SaaS', 'FinTech'], stages: ['Seed', 'Series A'], ticket: [2, 9], geo: ['Hyderabad', 'Bangalore'], recencyDays: 40, deals: 7, sources: ['FounderNetwork'], portfolioNote: 'Regional focus in South India with SaaS overlap' },
  { name: 'Strive VC', sectors: ['SaaS', 'FinTech'], stages: ['Seed'], ticket: [1, 4], geo: ['Kochi', 'Bangalore', 'Chennai'], recencyDays: 18, deals: 5, sources: ['Reports'], portfolioNote: 'Cross-border fund backing B2B SaaS and payments' }
];

export const schemes = [
  { name: 'Startup India Seed Fund', sectors: ['Any'], stages: ['Seed', 'Pre-Seed'], location: ['Pan-India'], amount: 'Up to INR 2 Cr', doc: 'Startup India Portal', eligibility: 'Incorporated <2 years, DPIIT recognized, tech/innovation', link: 'https://www.startupindia.gov.in' },
  { name: 'SIDBI Fund of Funds', sectors: ['Any'], stages: ['Seed', 'Series A'], location: ['Pan-India'], amount: 'FoF via AIFs', doc: 'SIDBI', eligibility: 'Early stage, high growth potential', link: 'https://www.sidbi.in' },
  { name: 'Karnataka Elevate', sectors: ['Any'], stages: ['Seed'], location: ['Bangalore', 'Karnataka'], amount: 'Grant up to INR 50L', doc: 'Karnataka Govt', eligibility: 'Registered in Karnataka, product focus', link: 'https://startup.karnataka.gov.in' },
  { name: 'Tamil Nadu Startup Seed Grant', sectors: ['Any'], stages: ['Seed'], location: ['Chennai', 'Tamil Nadu'], amount: 'Grant up to INR 50L', doc: 'TANSIM', eligibility: 'TN registered, DPIIT recommended', link: 'https://www.tansim.in' }
];

export const contexts = [
  { title: 'Crunchbase export Jan 2025', detail: 'FinTech investors, last 12 months rounds', freshness: 'Updated 15 days ago' },
  { title: 'Neo4j graph traversal', detail: 'MATCH (i)-[:FUNDED]->(s:Startup {sector:"FinTech"}) RETURN i, count(*)', freshness: 'Updated 3 days ago' },
  { title: 'Policy PDF (Startup India)', detail: 'Eligibility clauses pages 2-4', freshness: 'Updated 30 days ago' },
  { title: 'SQL aggregate', detail: 'SELECT investor_name, SUM(amount) WHERE sector="FinTech" AND date > 2023', freshness: 'Updated 1 day ago' }
];

export const documents = [
  {
    id: 'cb-fintech',
    title: 'Crunchbase FinTech India 2024',
    source: 'Crunchbase',
    url: 'https://www.crunchbase.com',
    text: 'Sequoia Capital India closed 12 FinTech seed and Series A deals in 2024 with ticket sizes INR 5-15 Cr.',
    date: '2025-01-15'
  },
  {
    id: 'inc42-fintech',
    title: 'Inc42 FinTech Funding Pulse',
    source: 'Inc42',
    url: 'https://inc42.com',
    text: 'Accel India announced 8 FinTech and SaaS rounds, mostly seed, with activity concentrated in Bangalore.',
    date: '2024-12-20'
  },
  {
    id: 'neo4j-graph',
    title: 'Graph traversal output',
    source: 'Neo4j',
    url: '#',
    text: 'MATCH (i)-[:FUNDED]->(s:Startup {sector: "FinTech", stage: "Seed"}) RETURN i, count(*) ORDER BY count(*) DESC;',
    date: '2025-01-02'
  },
  {
    id: 'policy-startup-india',
    title: 'Startup India Seed Fund Scheme PDF',
    source: 'Startup India',
    url: 'https://www.startupindia.gov.in',
    text: 'Eligibility: DPIIT recognized, incorporated under 2 years, tech or innovation led; grants up to INR 2 Cr.',
    date: '2024-11-01'
  },
  {
    id: 'sidbi-fof',
    title: 'SIDBI Fund of Funds FAQ',
    source: 'SIDBI',
    url: 'https://www.sidbi.in',
    text: 'FoF backs AIFs investing in early stage startups across India; typical check sizes align with Series A.',
    date: '2024-10-10'
  },
  {
    id: 'nasscom-report',
    title: 'NASSCOM SaaS 2024 snapshot',
    source: 'NASSCOM',
    url: 'https://nasscom.in',
    text: 'Bangalore and Delhi NCR remain top hubs; seed deals dominate 2024 with strong SaaS and FinTech overlap.',
    date: '2024-12-05'
  },
  {
    id: 'lightspeed-note',
    title: 'Lightspeed India memo',
    source: 'Internal',
    url: '#',
    text: 'Lightspeed wrote 13 India checks in 2024 across SaaS and FinTech; average ticket INR 6-22 Cr with Delhi/Bangalore focus.',
    date: '2025-01-05'
  },
  {
    id: 'regional-south',
    title: 'South India funding brief',
    source: 'Analyst note',
    url: '#',
    text: 'Hyderabad and Kochi rounds skew toward SaaS + HealthTech with emerging FinTech infra; active funds include Athera and Strive.',
    date: '2024-12-28'
  }
];

export const baseHistory = [
  { user: 'मुझे फिनटेक स्टार्टअप के लिए सीड फंडिंग चाहिए', bot: 'Top investors: Sequoia (92%), Accel (87%). Cited: Crunchbase Jan 2025, Sequoia site.' },
  { user: 'सरकारी योजनाएं क्या हैं?', bot: 'Eligible: Startup India Seed Fund (95% confidence), SIDBI FoF (88%).' },
  { user: 'சென்னைல் 8 கோடி SaaS பால நிதி தேவை', bot: 'Shortlist: Sequoia, Accel, Athera. Cited: regional brief, SaaS snapshot.' },
  { user: 'Hyderabad healthtech Series A', bot: 'Match: Athera (78%), Chiratae (72%). Cited: South India brief.' }
];

export const trendLine = {
  FinTech: {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    data: [180, 160, 240, 210, 330, 280],
  },
  EdTech: {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    data: [110, 90, 130, 120, 170, 150],
  },
  HealthTech: {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    data: [150, 170, 140, 190, 180, 210],
  },
  SaaS: {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    data: [220, 200, 260, 230, 310, 290],
  },
};

export const trendBar = {
  FinTech: {
    labels: ['Seed', 'Series A', 'Series B'],
    data: [72, 38, 26],
  },
  EdTech: {
    labels: ['Seed', 'Series A', 'Series B'],
    data: [46, 22, 10],
  },
  HealthTech: {
    labels: ['Seed', 'Series A', 'Series B'],
    data: [30, 34, 12],
  },
  SaaS: {
    labels: ['Seed', 'Series A', 'Series B'],
    data: [64, 58, 28],
  },
};
