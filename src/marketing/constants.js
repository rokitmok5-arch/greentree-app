// Reference lists and seed data for the Marketing Hub.

export const PLATFORMS = [
  'Instagram',
  'Facebook',
  'TikTok',
  'YouTube',
  'LinkedIn',
  'Pinterest',
  'Google Ads',
  'Google Business Profile',
  'Email',
  'Website / SEO'
];

// Real estate content and ad formats, modeled on how luxury brokerage marketing
// programs package social: listing Reels and carousels, market and tip content,
// hyperlocal spotlights, client wins, plus listing, lead gen and retargeting ads.
export const TACTICS = [
  'Listing Reel',
  'Listing carousel',
  'Just Listed / Just Sold post',
  'Market update infographic',
  'Buyer & seller tip carousel',
  'Neighborhood spotlight',
  'Client testimonial',
  'Lifestyle / behind the scenes',
  'Stories',
  'Live / virtual open house',
  'Partner collab',
  'Listing ad',
  'Lead gen ad',
  'Retargeting ad',
  'Brand awareness ad',
  'Search ad',
  'Hyperlocal blog / SEO',
  'Email newsletter'
];

// Content pillars to rotate through so the feed isn't all listings.
export const PILLARS = {
  Listings: 'Listing Reels, carousels, open houses and Just Listed / Just Sold.',
  Educational: 'Buyer and seller tips, myth-busting, how the process works.',
  'Market authority': 'Market updates, price trends and your point of view on them.',
  Hyperlocal: 'Neighborhood spotlights, local businesses, events and hidden gems.',
  'Client wins': 'Testimonials, success stories and closings.',
  Lifestyle: 'Behind the scenes, day-in-the-life, the person behind the brand.'
};
export const PILLAR_NAMES = Object.keys(PILLARS);

export const OBJECTIVES = ['Awareness', 'Engagement', 'Traffic', 'Leads', 'Sales'];

export const STRATEGY_STATUSES = ['Idea', 'Testing', 'Scaling', 'Paused', 'Retired'];

// KPIs a strategy can be measured against. `better` tells the scorer which direction is good.
export const KPIS = {
  leads: { label: 'Leads', better: 'higher', format: 'number' },
  conversions: { label: 'Conversions', better: 'higher', format: 'number' },
  engagementRate: { label: 'Engagement rate', better: 'higher', format: 'percent' },
  ctr: { label: 'Click-through rate', better: 'higher', format: 'percent' },
  cpl: { label: 'Cost per lead', better: 'lower', format: 'currency' },
  roas: { label: 'Return on ad spend', better: 'higher', format: 'multiple' }
};

export const EMPTY_CAMPAIGN = {
  name: '',
  platform: PLATFORMS[0],
  tactic: TACTICS[0],
  pillar: '',
  objective: 'Leads',
  strategyId: '',
  startDate: '',
  endDate: '',
  spend: '',
  impressions: '',
  reach: '',
  engagements: '',
  clicks: '',
  leads: '',
  conversions: '',
  revenue: '',
  notes: ''
};

export const EMPTY_STRATEGY = {
  name: '',
  objective: 'Leads',
  status: 'Idea',
  kpi: 'leads',
  target: '',
  hypothesis: '',
  notes: ''
};

export const SAMPLE_STRATEGIES = [
  {
    id: 's1',
    name: 'Short-form video for listing awareness',
    objective: 'Awareness',
    status: 'Scaling',
    kpi: 'engagementRate',
    target: 0.05,
    hypothesis: 'Walkthrough reels will out-engage static listing photos by 2x.',
    notes: ''
  },
  {
    id: 's2',
    name: 'Home valuation lead funnel',
    objective: 'Leads',
    status: 'Testing',
    kpi: 'cpl',
    target: 40,
    hypothesis: 'A free home valuation offer can bring in seller leads for under $40 each.',
    notes: ''
  },
  {
    id: 's3',
    name: 'Partner & community collabs',
    objective: 'Engagement',
    status: 'Testing',
    kpi: 'leads',
    target: 30,
    hypothesis: 'Co-marketing with local businesses reaches warm audiences cheaply.',
    notes: ''
  }
];

export const SAMPLE_CAMPAIGNS = [
  { id: 'c1', name: 'Just Listed walkthrough Reels', platform: 'Instagram', tactic: 'Listing Reel', pillar: 'Listings', objective: 'Awareness', strategyId: 's1', startDate: '2026-06-01', endDate: '2026-06-30', spend: 0, impressions: 84000, reach: 52000, engagements: 5460, clicks: 1180, leads: 22, conversions: 3, revenue: 0, notes: 'Organic. Hooks in first 2s performed best.' },
  { id: 'c2', name: 'Neighborhood tour series', platform: 'TikTok', tactic: 'Neighborhood spotlight', pillar: 'Hyperlocal', objective: 'Awareness', strategyId: 's1', startDate: '2026-06-05', endDate: '2026-07-15', spend: 0, impressions: 156000, reach: 121000, engagements: 11200, clicks: 1650, leads: 18, conversions: 1, revenue: 0, notes: 'Organic.' },
  { id: 'c3', name: 'Oceanfront listing ad', platform: 'Instagram', tactic: 'Listing ad', pillar: '', objective: 'Leads', strategyId: 's1', startDate: '2026-07-01', endDate: '2026-07-31', spend: 1200, impressions: 98000, reach: 71000, engagements: 3100, clicks: 1420, leads: 31, conversions: 4, revenue: 9600, notes: 'Built from the MLS photos; ended when the listing went pending.' },
  { id: 'c4', name: 'Quarterly market update', platform: 'Instagram', tactic: 'Market update infographic', pillar: 'Market authority', objective: 'Engagement', strategyId: '', startDate: '2026-06-10', endDate: '2026-06-30', spend: 0, impressions: 31000, reach: 22000, engagements: 1240, clicks: 210, leads: 4, conversions: 0, revenue: 0, notes: 'Organic.' },
  { id: 'c5', name: 'Home valuation lead gen ad', platform: 'Facebook', tactic: 'Lead gen ad', pillar: '', objective: 'Leads', strategyId: 's2', startDate: '2026-06-01', endDate: '2026-07-31', spend: 2400, impressions: 142000, reach: 88000, engagements: 2300, clicks: 2980, leads: 96, conversions: 7, revenue: 21000, notes: 'Seller leads. Best CPL so far.' },
  { id: 'c6', name: 'Seller guide search ads', platform: 'Google Ads', tactic: 'Search ad', pillar: '', objective: 'Leads', strategyId: 's2', startDate: '2026-06-15', endDate: '2026-07-31', spend: 3100, impressions: 41000, reach: 30000, engagements: 0, clicks: 2050, leads: 58, conversions: 6, revenue: 18000, notes: 'High intent, higher CPC.' },
  { id: 'c7', name: 'Website visitor retargeting', platform: 'Facebook', tactic: 'Retargeting ad', pillar: '', objective: 'Sales', strategyId: 's2', startDate: '2026-07-01', endDate: '2026-08-15', spend: 900, impressions: 38000, reach: 12000, engagements: 610, clicks: 740, leads: 27, conversions: 4, revenue: 12000, notes: '' },
  { id: 'c8', name: 'Brand video awareness ad', platform: 'Facebook', tactic: 'Brand awareness ad', pillar: '', objective: 'Awareness', strategyId: '', startDate: '2026-06-01', endDate: '2026-06-30', spend: 1800, impressions: 210000, reach: 150000, engagements: 1470, clicks: 630, leads: 5, conversions: 0, revenue: 0, notes: 'Cheap reach, almost no leads.' },
  { id: 'c9', name: 'Coffee shop partner giveaway', platform: 'Instagram', tactic: 'Partner collab', pillar: 'Hyperlocal', objective: 'Engagement', strategyId: 's3', startDate: '2026-07-10', endDate: '2026-07-24', spend: 350, impressions: 46000, reach: 39000, engagements: 4800, clicks: 900, leads: 12, conversions: 0, revenue: 0, notes: 'Lots of engagement, low-quality leads.' },
  { id: 'c10', name: 'Interior designer collab', platform: 'Instagram', tactic: 'Partner collab', pillar: 'Lifestyle', objective: 'Engagement', strategyId: 's3', startDate: '2026-08-01', endDate: '2026-08-31', spend: 600, impressions: 62000, reach: 48000, engagements: 3900, clicks: 1100, leads: 19, conversions: 2, revenue: 6400, notes: '' },
  { id: 'c11', name: 'Monthly market newsletter', platform: 'Email', tactic: 'Email newsletter', pillar: 'Market authority', objective: 'Traffic', strategyId: '', startDate: '2026-06-01', endDate: '2026-08-31', spend: 90, impressions: 12600, reach: 12600, engagements: 1130, clicks: 820, leads: 14, conversions: 3, revenue: 9000, notes: 'Impressions = delivered, engagements = clicks + replies.' },
  { id: 'c12', name: 'Relocation tips for executives', platform: 'LinkedIn', tactic: 'Buyer & seller tip carousel', pillar: 'Educational', objective: 'Awareness', strategyId: '', startDate: '2026-06-01', endDate: '2026-08-31', spend: 0, impressions: 18000, reach: 11000, engagements: 540, clicks: 120, leads: 2, conversions: 0, revenue: 0, notes: 'Organic.' },
  { id: 'c13', name: 'Sponsored InMail to relocators', platform: 'LinkedIn', tactic: 'Lead gen ad', pillar: '', objective: 'Leads', strategyId: '', startDate: '2026-07-01', endDate: '2026-07-31', spend: 1500, impressions: 9000, reach: 9000, engagements: 180, clicks: 160, leads: 3, conversions: 0, revenue: 0, notes: 'Very expensive per lead.' },
  { id: 'c14', name: 'Open house live walkthrough', platform: 'Facebook', tactic: 'Live / virtual open house', pillar: 'Listings', objective: 'Engagement', strategyId: '', startDate: '2026-07-20', endDate: '2026-07-20', spend: 0, impressions: 7400, reach: 6100, engagements: 690, clicks: 140, leads: 6, conversions: 1, revenue: 0, notes: '' },
  { id: 'c15', name: 'Newport Beach neighborhood guide', platform: 'Website / SEO', tactic: 'Hyperlocal blog / SEO', pillar: 'Hyperlocal', objective: 'Traffic', strategyId: '', startDate: '2026-06-01', endDate: '2026-08-31', spend: 250, impressions: 22000, reach: 17000, engagements: 0, clicks: 1900, leads: 21, conversions: 2, revenue: 6000, notes: 'Impressions from Search Console.' },
  { id: 'c16', name: 'Coastal estates boards', platform: 'Pinterest', tactic: 'Listing carousel', pillar: 'Listings', objective: 'Awareness', strategyId: '', startDate: '2026-06-01', endDate: '2026-08-31', spend: 0, impressions: 26000, reach: 20000, engagements: 390, clicks: 180, leads: 0, conversions: 0, revenue: 0, notes: '' },
  { id: 'c17', name: 'Client testimonial films', platform: 'YouTube', tactic: 'Client testimonial', pillar: 'Client wins', objective: 'Engagement', strategyId: '', startDate: '2026-07-01', endDate: '2026-08-31', spend: 0, impressions: 15000, reach: 12000, engagements: 1050, clicks: 310, leads: 9, conversions: 1, revenue: 0, notes: '' },
  { id: 'c18', name: 'Behind-the-deal Stories', platform: 'Instagram', tactic: 'Stories', pillar: 'Lifestyle', objective: 'Engagement', strategyId: '', startDate: '2026-08-01', endDate: '2026-08-31', spend: 0, impressions: 21000, reach: 9000, engagements: 460, clicks: 95, leads: 1, conversions: 0, revenue: 0, notes: '' },
  { id: 'c19', name: 'Just Sold: Laguna Beach estate', platform: 'Instagram', tactic: 'Just Listed / Just Sold post', pillar: 'Client wins', objective: 'Engagement', strategyId: '', startDate: '2026-08-10', endDate: '2026-08-24', spend: 0, impressions: 24000, reach: 17000, engagements: 1300, clicks: 260, leads: 7, conversions: 1, revenue: 0, notes: 'Organic.' },
  { id: 'c20', name: 'Seller tip carousel series', platform: 'Instagram', tactic: 'Buyer & seller tip carousel', pillar: 'Educational', objective: 'Engagement', strategyId: '', startDate: '2026-07-01', endDate: '2026-08-31', spend: 0, impressions: 38000, reach: 26000, engagements: 2100, clicks: 420, leads: 9, conversions: 0, revenue: 0, notes: 'Organic.' }
];
