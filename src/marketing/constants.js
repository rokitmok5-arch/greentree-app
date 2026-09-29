// Reference lists and seed data for the Marketing Hub.

export const PLATFORMS = [
  'Instagram',
  'Facebook',
  'TikTok',
  'YouTube',
  'LinkedIn',
  'X (Twitter)',
  'Pinterest',
  'Google Ads',
  'Email',
  'Website / SEO'
];

export const TACTICS = [
  'Short-form video',
  'Carousel / image post',
  'Stories',
  'Live stream',
  'Paid social ads',
  'Lead-form ads',
  'Search ads',
  'Retargeting',
  'Influencer / partner collab',
  'Giveaway / contest',
  'User-generated content',
  'Newsletter',
  'Blog / SEO content'
];

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
  { id: 'c1', name: 'Just Listed walkthrough reels', platform: 'Instagram', tactic: 'Short-form video', objective: 'Awareness', strategyId: 's1', startDate: '2026-06-01', endDate: '2026-06-30', spend: 0, impressions: 84000, reach: 52000, engagements: 5460, clicks: 1180, leads: 22, conversions: 3, revenue: 0, notes: 'Organic. Hooks in first 2s performed best.' },
  { id: 'c2', name: 'Neighborhood tour series', platform: 'TikTok', tactic: 'Short-form video', objective: 'Awareness', strategyId: 's1', startDate: '2026-06-05', endDate: '2026-07-15', spend: 0, impressions: 156000, reach: 121000, engagements: 11200, clicks: 1650, leads: 18, conversions: 1, revenue: 0, notes: 'Organic.' },
  { id: 'c3', name: 'Luxury listing boosted reels', platform: 'Instagram', tactic: 'Paid social ads', objective: 'Leads', strategyId: 's1', startDate: '2026-07-01', endDate: '2026-07-31', spend: 1200, impressions: 98000, reach: 71000, engagements: 3100, clicks: 1420, leads: 31, conversions: 4, revenue: 9600, notes: '' },
  { id: 'c4', name: 'Market update carousel', platform: 'Instagram', tactic: 'Carousel / image post', objective: 'Engagement', strategyId: '', startDate: '2026-06-10', endDate: '2026-06-30', spend: 0, impressions: 31000, reach: 22000, engagements: 1240, clicks: 210, leads: 4, conversions: 0, revenue: 0, notes: 'Organic.' },
  { id: 'c5', name: 'Home valuation lead form', platform: 'Facebook', tactic: 'Lead-form ads', objective: 'Leads', strategyId: 's2', startDate: '2026-06-01', endDate: '2026-07-31', spend: 2400, impressions: 142000, reach: 88000, engagements: 2300, clicks: 2980, leads: 96, conversions: 7, revenue: 21000, notes: 'Seller leads. Best CPL so far.' },
  { id: 'c6', name: 'Seller guide search ads', platform: 'Google Ads', tactic: 'Search ads', objective: 'Leads', strategyId: 's2', startDate: '2026-06-15', endDate: '2026-07-31', spend: 3100, impressions: 41000, reach: 30000, engagements: 0, clicks: 2050, leads: 58, conversions: 6, revenue: 18000, notes: 'High intent, higher CPC.' },
  { id: 'c7', name: 'Website visitor retargeting', platform: 'Facebook', tactic: 'Retargeting', objective: 'Sales', strategyId: 's2', startDate: '2026-07-01', endDate: '2026-08-15', spend: 900, impressions: 38000, reach: 12000, engagements: 610, clicks: 740, leads: 27, conversions: 4, revenue: 12000, notes: '' },
  { id: 'c8', name: 'Brand awareness display', platform: 'Facebook', tactic: 'Paid social ads', objective: 'Awareness', strategyId: '', startDate: '2026-06-01', endDate: '2026-06-30', spend: 1800, impressions: 210000, reach: 150000, engagements: 1470, clicks: 630, leads: 5, conversions: 0, revenue: 0, notes: 'Cheap reach, almost no leads.' },
  { id: 'c9', name: 'Coffee shop partner giveaway', platform: 'Instagram', tactic: 'Giveaway / contest', objective: 'Engagement', strategyId: 's3', startDate: '2026-07-10', endDate: '2026-07-24', spend: 350, impressions: 46000, reach: 39000, engagements: 4800, clicks: 900, leads: 12, conversions: 0, revenue: 0, notes: 'Lots of engagement, low-quality leads.' },
  { id: 'c10', name: 'Local designer collab', platform: 'Instagram', tactic: 'Influencer / partner collab', objective: 'Engagement', strategyId: 's3', startDate: '2026-08-01', endDate: '2026-08-31', spend: 600, impressions: 62000, reach: 48000, engagements: 3900, clicks: 1100, leads: 19, conversions: 2, revenue: 6400, notes: '' },
  { id: 'c11', name: 'Monthly market newsletter', platform: 'Email', tactic: 'Newsletter', objective: 'Traffic', strategyId: '', startDate: '2026-06-01', endDate: '2026-08-31', spend: 90, impressions: 12600, reach: 12600, engagements: 1130, clicks: 820, leads: 14, conversions: 3, revenue: 9000, notes: 'Impressions = delivered, engagements = clicks + replies.' },
  { id: 'c12', name: 'Thought leadership posts', platform: 'LinkedIn', tactic: 'Carousel / image post', objective: 'Awareness', strategyId: '', startDate: '2026-06-01', endDate: '2026-08-31', spend: 0, impressions: 18000, reach: 11000, engagements: 540, clicks: 120, leads: 2, conversions: 0, revenue: 0, notes: 'Organic.' },
  { id: 'c13', name: 'Sponsored InMail to relocators', platform: 'LinkedIn', tactic: 'Paid social ads', objective: 'Leads', strategyId: '', startDate: '2026-07-01', endDate: '2026-07-31', spend: 1500, impressions: 9000, reach: 9000, engagements: 180, clicks: 160, leads: 3, conversions: 0, revenue: 0, notes: 'Very expensive per lead.' },
  { id: 'c14', name: 'Open house live walkthrough', platform: 'Facebook', tactic: 'Live stream', objective: 'Engagement', strategyId: '', startDate: '2026-07-20', endDate: '2026-07-20', spend: 0, impressions: 7400, reach: 6100, engagements: 690, clicks: 140, leads: 6, conversions: 1, revenue: 0, notes: '' },
  { id: 'c15', name: 'Neighborhood guide blog', platform: 'Website / SEO', tactic: 'Blog / SEO content', objective: 'Traffic', strategyId: '', startDate: '2026-06-01', endDate: '2026-08-31', spend: 250, impressions: 22000, reach: 17000, engagements: 0, clicks: 1900, leads: 21, conversions: 2, revenue: 6000, notes: 'Impressions from Search Console.' },
  { id: 'c16', name: 'Dream home boards', platform: 'Pinterest', tactic: 'Carousel / image post', objective: 'Awareness', strategyId: '', startDate: '2026-06-01', endDate: '2026-08-31', spend: 0, impressions: 26000, reach: 20000, engagements: 390, clicks: 180, leads: 0, conversions: 0, revenue: 0, notes: '' },
  { id: 'c17', name: 'Client testimonial clips', platform: 'YouTube', tactic: 'User-generated content', objective: 'Engagement', strategyId: '', startDate: '2026-07-01', endDate: '2026-08-31', spend: 0, impressions: 15000, reach: 12000, engagements: 1050, clicks: 310, leads: 9, conversions: 1, revenue: 0, notes: '' },
  { id: 'c18', name: 'Behind-the-deal stories', platform: 'Instagram', tactic: 'Stories', objective: 'Engagement', strategyId: '', startDate: '2026-08-01', endDate: '2026-08-31', spend: 0, impressions: 21000, reach: 9000, engagements: 460, clicks: 95, leads: 1, conversions: 0, revenue: 0, notes: '' }
];
