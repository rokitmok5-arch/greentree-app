// Pure metric math for the Marketing Hub: derived rates, roll-ups, and the
// "is this tactic working?" score. No React here so it can be tested directly.

export const COUNT_FIELDS = ['spend', 'impressions', 'reach', 'engagements', 'clicks', 'leads', 'conversions', 'revenue'];

const ratio = (num, den) => (den > 0 ? num / den : null);

// Rates are always computed from summed counts, never by averaging per-campaign rates,
// so a tiny campaign can't swing a platform's numbers.
// Cost metrics only use leads/conversions/revenue from paid campaigns, so free organic
// results don't make paid tactics look cheaper than they are.
export function deriveRates(totals) {
  const { spend, impressions, engagements, engagedImpressions, clicks, leads, conversions, paidLeads, paidConversions, paidRevenue } = totals;
  return {
    engagementRate: ratio(engagements, engagedImpressions),
    ctr: ratio(clicks, impressions),
    leadRate: ratio(leads, clicks),
    closeRate: ratio(conversions, leads),
    cpm: spend > 0 ? ratio(spend * 1000, impressions) : null,
    cpc: spend > 0 ? ratio(spend, clicks) : null,
    // Paid campaigns with zero leads/revenue get Infinity / 0 so they score as failures
    // instead of being silently skipped.
    cpl: spend > 0 ? (paidLeads > 0 ? spend / paidLeads : Infinity) : null,
    cpa: spend > 0 ? (paidConversions > 0 ? spend / paidConversions : Infinity) : null,
    roas: spend > 0 ? paidRevenue / spend : null
  };
}

export function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function aggregate(campaigns) {
  const totals = Object.fromEntries(COUNT_FIELDS.map(f => [f, 0]));
  totals.paidLeads = 0;
  totals.paidConversions = 0;
  totals.paidRevenue = 0;
  // Channels like search ads and SEO don't report engagements; 0 there means "not tracked",
  // so only impressions from campaigns that do report engagements count toward the rate.
  totals.engagedImpressions = 0;
  for (const c of campaigns) {
    for (const f of COUNT_FIELDS) totals[f] += toNumber(c[f]);
    if (toNumber(c.engagements) > 0) totals.engagedImpressions += toNumber(c.impressions);
    if (toNumber(c.spend) > 0) {
      totals.paidLeads += toNumber(c.leads);
      totals.paidConversions += toNumber(c.conversions);
      totals.paidRevenue += toNumber(c.revenue);
    }
  }
  return { count: campaigns.length, ...totals, ...deriveRates(totals) };
}

export function groupBy(campaigns, keyFn) {
  const groups = new Map();
  for (const c of campaigns) {
    const key = keyFn(c);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }
  return groups;
}

// Which metrics feed the score, and how much each counts, per optimization goal.
export const SCORING_GOALS = {
  balanced: { label: 'Balanced', weights: { engagementRate: 1, ctr: 1, leadRate: 1, cpl: 1, roas: 1 } },
  engagement: { label: 'Engagement', weights: { engagementRate: 3, ctr: 1 } },
  leads: { label: 'Lead generation', weights: { ctr: 1, leadRate: 2, cpl: 3 } },
  revenue: { label: 'Revenue', weights: { roas: 3, cpl: 1, leadRate: 1 } }
};

export const SCORED_METRICS = {
  engagementRate: { label: 'Engagement rate', better: 'higher' },
  ctr: { label: 'CTR', better: 'higher' },
  leadRate: { label: 'Lead rate', better: 'higher' },
  cpl: { label: 'Cost per lead', better: 'lower' },
  roas: { label: 'ROAS', better: 'higher' }
};

// Below this many impressions a group's rates are too noisy to judge.
export const MIN_IMPRESSIONS = 5000;
const WORKING_INDEX = 115;
const NOT_WORKING_INDEX = 85;
const MAX_RATIO = 4;

// Performance of `stats` relative to `baseline`, as a multiplier where >1 is better.
// Returns null when the metric can't be compared (e.g. organic content has no CPL).
function relativePerformance(metric, stats, baseline) {
  const value = stats[metric];
  const base = baseline[metric];
  if (value === null || base === null || !Number.isFinite(base) || base === 0) return null;
  const raw = SCORED_METRICS[metric].better === 'higher' ? value / base : base / value;
  if (Number.isNaN(raw)) return null;
  return Math.min(MAX_RATIO, Math.max(1 / MAX_RATIO, raw));
}

// Score a group against the baseline. The index is a weighted geometric mean of the
// per-metric multipliers, scaled so 100 = baseline average.
export function scoreAgainst(stats, baseline, goal = 'balanced') {
  const weights = SCORING_GOALS[goal].weights;
  const drivers = [];
  let weightedLog = 0;
  let totalWeight = 0;

  for (const [metric, weight] of Object.entries(weights)) {
    const rel = relativePerformance(metric, stats, baseline);
    if (rel === null) continue;
    weightedLog += Math.log2(rel) * weight;
    totalWeight += weight;
    drivers.push({ metric, label: SCORED_METRICS[metric].label, multiplier: rel });
  }

  if (totalWeight === 0 || stats.impressions < MIN_IMPRESSIONS) {
    return { index: null, verdict: 'insufficient', drivers };
  }

  const index = Math.round(100 * 2 ** (weightedLog / totalWeight));
  const verdict = index >= WORKING_INDEX ? 'working' : index <= NOT_WORKING_INDEX ? 'not-working' : 'average';
  drivers.sort((a, b) => Math.abs(Math.log2(b.multiplier)) - Math.abs(Math.log2(a.multiplier)));
  return { index, verdict, drivers };
}

// Aggregate + score every group produced by keyFn, sorted best first.
export function rankGroups(campaigns, keyFn, goal = 'balanced') {
  const baseline = aggregate(campaigns);
  const rows = [];
  for (const [key, members] of groupBy(campaigns, keyFn)) {
    const stats = aggregate(members);
    rows.push({ key, stats, ...scoreAgainst(stats, baseline, goal) });
  }
  return rows.sort((a, b) => (b.index ?? -1) - (a.index ?? -1));
}

export function kpiValue(stats, kpi) {
  return stats[kpi] ?? null;
}

export function kpiOnTrack(actual, target, better) {
  if (actual === null || target === '' || target === null || target === undefined) return null;
  return better === 'lower' ? actual <= Number(target) : actual >= Number(target);
}
