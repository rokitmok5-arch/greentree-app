import React, { useMemo, useRef, useState } from 'react';
import { Download, Edit, Lightbulb, Plus, Sparkles, Trash2, Upload } from 'lucide-react';
import { BarChart, Heatmap, IndexChart } from './charts.jsx';
import { KPIS } from './constants.js';
import { aggregate, kpiOnTrack, kpiValue, rankGroups, SCORING_GOALS } from './metrics.js';
import { fmtCompact, fmtCurrency, fmtDriver, fmtInt, fmtKpi, fmtMultiple, fmtPercent, plural, VERDICTS } from './format.js';

// ---------- shared pieces ----------

export const Card = ({ title, subtitle, action, children, className = '' }) => (
  <section className={`panel ${className}`}>
    {(title || action) && (
      <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
        <div>
          {title && <h3 className="font-display text-2xl text-stone-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="px-6 pb-6">{children}</div>
  </section>
);

const StatTile = ({ label, value, detail }) => (
  <div className="panel p-5">
    <p className="eyebrow">{label}</p>
    <p className="font-display text-3xl text-stone-900 tabular-nums mt-1">{value}</p>
    {detail && <p className="text-xs text-gray-500 mt-1">{detail}</p>}
  </div>
);

export const VerdictBadge = ({ verdict }) => {
  const v = VERDICTS[verdict];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap ${v.className}`}>
      <span aria-hidden="true">{v.symbol}</span>{v.label}
    </span>
  );
};

const statsTooltip = row => [
  ['Performance index', row.index ?? 'not enough data'],
  ['Campaigns', row.stats.count],
  ['Spend', fmtCurrency(row.stats.spend)],
  ['Impressions', fmtCompact(row.stats.impressions)],
  ['Engagement rate', fmtPercent(row.stats.engagementRate)],
  ['CTR', fmtPercent(row.stats.ctr)],
  ['Leads', fmtInt(row.stats.leads)],
  ['Cost per lead', fmtCurrency(row.stats.cpl)],
  ['ROAS', fmtMultiple(row.stats.roas)]
];

const Empty = ({ children }) => <p className="text-sm text-gray-500 py-4">{children}</p>;

// ---------- Dashboard ----------

export function Dashboard({ campaigns, goal, goToAnalysis }) {
  const totals = useMemo(() => aggregate(campaigns), [campaigns]);
  const tactics = useMemo(() => rankGroups(campaigns, c => c.tactic, goal), [campaigns, goal]);
  const platforms = useMemo(() => rankGroups(campaigns, c => c.platform, goal), [campaigns, goal]);

  const winners = tactics.filter(r => r.verdict === 'working').slice(0, 3);
  const losers = tactics.filter(r => r.verdict === 'not-working').reverse().slice(0, 3);
  const leadsByPlatform = [...platforms]
    .sort((a, b) => b.stats.leads - a.stats.leads)
    .map(r => ({ label: r.key, value: r.stats.leads, display: fmtInt(r.stats.leads), tooltip: statsTooltip(r) }));

  if (!campaigns.length) {
    return <Card title="No campaigns in this view"><Empty>Add a campaign or import a CSV on the Campaigns tab, or widen the filters above.</Empty></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatTile label="Spend" value={fmtCurrency(totals.spend)} detail={plural(totals.count, 'campaign')} />
        <StatTile label="Impressions" value={fmtCompact(totals.impressions)} detail={`${fmtCompact(totals.reach)} reach`} />
        <StatTile label="Engagement rate" value={fmtPercent(totals.engagementRate)} detail={`${fmtCompact(totals.engagements)} engagements`} />
        <StatTile label="Clicks" value={fmtCompact(totals.clicks)} detail={`${fmtPercent(totals.ctr)} CTR`} />
        <StatTile label="Leads" value={fmtInt(totals.leads)} detail={`${fmtCurrency(totals.cpl)} per paid lead`} />
        <StatTile label="Revenue" value={fmtCurrency(totals.revenue)} detail={`${fmtMultiple(totals.roas)} ROAS on paid`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TacticList title="What's working" rows={winners} empty="No tactic is clearly beating your average yet." onMore={goToAnalysis} />
        <TacticList title="What's not working" rows={losers} empty="No tactic is clearly underperforming. Nice." onMore={goToAnalysis} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tactic performance" subtitle={`Scored for ${SCORING_GOALS[goal].label.toLowerCase()}`}>
          <IndexChart rows={tactics.map(r => ({ ...r, tooltip: statsTooltip(r) }))} />
        </Card>
        <Card title="Leads by platform">
          <BarChart rows={leadsByPlatform} />
        </Card>
      </div>
    </div>
  );
}

function TacticList({ title, rows, empty, onMore }) {
  return (
    <Card title={title} action={<button onClick={onMore} className="text-sm text-gold hover:underline">Full analysis →</button>}>
      {rows.length ? (
        <ul className="space-y-3">
          {rows.map(r => (
            <li key={r.key} className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm text-gray-900">{r.key}</p>
                <p className="text-xs text-gray-600 mt-0.5">{r.drivers.slice(0, 2).map(fmtDriver).join(' · ')}</p>
              </div>
              <div className="text-right shrink-0">
                <VerdictBadge verdict={r.verdict} />
                <p className="text-xs text-gray-500 mt-1 tabular-nums">index {r.index}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty>{empty}</Empty>}
    </Card>
  );
}

// ---------- Campaigns ----------

export function CampaignsView({ campaigns, allCount, strategies, goal, onAdd, onEdit, onDelete, onImport, onExport, onResetSample, onClearAll }) {
  const fileInput = useRef(null);
  const [query, setQuery] = useState('');
  const scored = useMemo(() => {
    const ranked = new Map(rankGroups(campaigns, c => c.id, goal).map(r => [r.key, r]));
    return campaigns.map(c => ({ campaign: c, row: ranked.get(c.id) }));
  }, [campaigns, goal]);
  const strategyName = id => strategies.find(s => s.id === id)?.name;

  const q = query.trim().toLowerCase();
  const visible = q
    ? scored.filter(({ campaign: c }) => [c.name, c.platform, c.tactic, c.notes].some(v => String(v ?? '').toLowerCase().includes(q)))
    : scored;

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (file) file.text().then(onImport);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Performance tracking</p>
          <h2 className="font-display text-3xl text-stone-900">Campaigns & posts</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onAdd} className="btn-primary px-4 py-2 rounded-md flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />Add campaign
          </button>
          <button onClick={() => fileInput.current?.click()} className="border border-stone-300 bg-white px-4 py-2 rounded-md hover:bg-stone-50 flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />Import CSV
          </button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          <button onClick={onExport} className="border border-stone-300 bg-white px-4 py-2 rounded-md hover:bg-stone-50 flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />Export CSV
          </button>
        </div>
      </div>

      <div className="panel p-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name, platform, tactic, notes..."
          className="flex-1 min-w-[12rem] border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
        <span className="text-sm text-gray-500">{visible.length} of {allCount} campaigns</span>
        <button onClick={onResetSample} className="text-sm text-gray-600 hover:underline">Load sample data</button>
        <button onClick={onClearAll} className="text-sm text-red-600 hover:underline">Clear all</button>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Campaign', 'Spend', 'Impr.', 'Eng. rate', 'CTR', 'Leads', 'CPL', 'ROAS', 'Verdict', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${h === 'Campaign' || h === 'Verdict' ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visible.map(({ campaign: c, row }) => (
                <tr key={c.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 min-w-[14rem]">
                    <div className="font-medium text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.platform} · {c.tactic}{c.pillar ? ` · ${c.pillar}` : ''} · {c.objective}</div>
                    {strategyName(c.strategyId) && <div className="text-xs text-gold mt-0.5">↳ {strategyName(c.strategyId)}</div>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.spend > 0 ? fmtCurrency(c.spend) : <span className="text-gray-400">organic</span>}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtCompact(row.stats.impressions)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtPercent(row.stats.engagementRate)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtPercent(row.stats.ctr)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtInt(row.stats.leads)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtCurrency(row.stats.cpl)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtMultiple(row.stats.roas)}</td>
                  <td className="px-4 py-3"><VerdictBadge verdict={row.verdict} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button aria-label={`Edit ${c.name}`} onClick={() => onEdit(c)} className="text-gray-500 hover:text-gray-900"><Edit className="w-4 h-4" /></button>
                      <button aria-label={`Delete ${c.name}`} onClick={() => onDelete(c)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <p className="text-sm text-gray-500 p-6 text-center">No campaigns match.</p>}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        CSV columns: name, platform, tactic, pillar, objective, startDate, endDate, spend, impressions, reach, engagements, clicks, leads, conversions, revenue, notes.
        Common ad-export headers such as "Amount spent", "Link clicks", "Results" and "Campaign name" are recognized too.
      </p>
    </div>
  );
}

// ---------- Platforms ----------

const PLATFORM_METRICS = {
  leads: { label: 'Leads', get: s => s.leads, fmt: fmtInt },
  spend: { label: 'Spend', get: s => s.spend, fmt: fmtCurrency },
  impressions: { label: 'Impressions', get: s => s.impressions, fmt: fmtCompact },
  engagementRate: { label: 'Engagement rate', get: s => s.engagementRate, fmt: fmtPercent },
  ctr: { label: 'CTR', get: s => s.ctr, fmt: fmtPercent },
  cpl: { label: 'Cost per lead', get: s => (Number.isFinite(s.cpl) ? s.cpl : null), fmt: fmtCurrency },
  revenue: { label: 'Revenue', get: s => s.revenue, fmt: fmtCurrency }
};

export function PlatformsView({ campaigns, goal }) {
  const [metric, setMetric] = useState('leads');
  const platforms = useMemo(() => rankGroups(campaigns, c => c.platform, goal), [campaigns, goal]);
  // Score each platform+tactic combo against the overall baseline so they're comparable across platforms.
  const combos = useMemo(() => rankGroups(campaigns, c => `${c.platform}|${c.tactic}`, goal), [campaigns, goal]);

  const m = PLATFORM_METRICS[metric];
  const bars = platforms
    .map(r => ({ label: r.key, value: m.get(r.stats) ?? 0, display: m.fmt(m.get(r.stats)), tooltip: statsTooltip(r) }))
    .sort((a, b) => (metric === 'cpl' ? a.value - b.value : b.value - a.value));

  if (!campaigns.length) return <Card title="No campaigns in this view"><Empty>Add campaigns to compare platforms.</Empty></Card>;

  return (
    <div className="space-y-6">
      <Card
        title="Compare platforms"
        action={
          <select value={metric} onChange={e => setMetric(e.target.value)} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
            {Object.entries(PLATFORM_METRICS).map(([key, x]) => <option key={key} value={key}>{x.label}</option>)}
          </select>
        }
      >
        <BarChart rows={bars} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {platforms.map(p => {
          const onPlatform = combos.filter(c => c.key.startsWith(`${p.key}|`) && c.index !== null);
          const best = onPlatform[0];
          const worst = onPlatform.length > 1 ? onPlatform[onPlatform.length - 1] : null;
          return (
            <div key={p.key} className="panel p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-2xl text-stone-900">{p.key}</h3>
                  <p className="text-xs text-gray-500">{plural(p.stats.count, 'campaign')} · index {p.index ?? '—'}</p>
                </div>
                <VerdictBadge verdict={p.verdict} />
              </div>
              <dl className="grid grid-cols-3 gap-3 text-center mb-4">
                {[
                  ['Spend', fmtCurrency(p.stats.spend)],
                  ['Leads', fmtInt(p.stats.leads)],
                  ['CPL', fmtCurrency(p.stats.cpl)],
                  ['Eng. rate', fmtPercent(p.stats.engagementRate)],
                  ['CTR', fmtPercent(p.stats.ctr)],
                  ['ROAS', fmtMultiple(p.stats.roas)]
                ].map(([label, value]) => (
                  <div key={label}>
                    <dd className="font-bold text-gray-900 tabular-nums">{value}</dd>
                    <dt className="text-xs text-gray-500">{label}</dt>
                  </div>
                ))}
              </dl>
              <div className="text-sm space-y-1 border-t pt-3">
                {best ? <p><span className="text-gray-500">Best tactic:</span> <span className="font-medium">{best.key.split('|')[1]}</span> <span className="text-gray-500">({best.index})</span></p>
                  : <p className="text-gray-500">Not enough data to rank tactics here yet.</p>}
                {worst && <p><span className="text-gray-500">Weakest tactic:</span> <span className="font-medium">{worst.key.split('|')[1]}</span> <span className="text-gray-500">({worst.index})</span></p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Tactic analysis ----------

export function AnalysisView({ campaigns, strategies, goal }) {
  const tactics = useMemo(() => rankGroups(campaigns, c => c.tactic, goal), [campaigns, goal]);
  const platforms = useMemo(() => rankGroups(campaigns, c => c.platform, goal), [campaigns, goal]);
  const combos = useMemo(() => rankGroups(campaigns, c => `${c.platform}|${c.tactic}`, goal), [campaigns, goal]);
  const pillars = useMemo(() => rankGroups(campaigns.filter(c => c.pillar), c => c.pillar, goal), [campaigns, goal]);

  const cells = useMemo(() => new Map(combos.map(r => [r.key, { index: r.index, tooltip: statsTooltip(r) }])), [combos]);

  if (!campaigns.length) return <Card title="No campaigns in this view"><Empty>Add campaigns to see which tactics work.</Empty></Card>;

  return (
    <div className="space-y-6">
      <Card title="Which tactics work" subtitle={`Each tactic is compared with your overall average, scored for ${SCORING_GOALS[goal].label.toLowerCase()}. Change the goal in the filter bar.`}>
        <IndexChart rows={tactics.map(r => ({ ...r, tooltip: statsTooltip(r) }))} />
      </Card>

      <Card title="Which content pillars work" subtitle="Organic content grouped by pillar and compared with the average of all content that has a pillar. Paid ads are left out.">
        {pillars.length ? <IndexChart rows={pillars.map(r => ({ ...r, tooltip: statsTooltip(r) }))} />
          : <Empty>Tag campaigns with a content pillar to compare pillars.</Empty>}
      </Card>

      <Card title="Platform × tactic" subtitle="Where each tactic works best. Blue beats your average, red trails it, gray is about average.">
        <Heatmap rowKeys={platforms.map(p => p.key)} colKeys={tactics.map(t => t.key)} cells={cells} />
      </Card>

      <Card title="Tactic scorecard">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Tactic', 'Verdict', 'Index', 'Why', 'Spend', 'Leads', 'CPL', 'Eng. rate', 'CTR', 'ROAS'].map(h => (
                  <th key={h} className={`px-3 py-2 text-xs font-medium text-gray-500 uppercase ${['Tactic', 'Verdict', 'Why'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tactics.map(r => (
                <tr key={r.key} className="align-top">
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{r.key}<div className="text-xs text-gray-500 font-normal">{plural(r.stats.count, 'campaign')}</div></td>
                  <td className="px-3 py-2"><VerdictBadge verdict={r.verdict} /></td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{r.index ?? '—'}</td>
                  <td className="px-3 py-2 text-xs text-gray-600 min-w-[14rem]">{r.drivers.slice(0, 2).map(fmtDriver).join(' · ') || '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtCurrency(r.stats.spend)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtInt(r.stats.leads)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtCurrency(r.stats.cpl)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtPercent(r.stats.engagementRate)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtPercent(r.stats.ctr)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtMultiple(r.stats.roas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Cost per lead and ROAS only count paid campaigns. Groups with fewer than 5,000 impressions are marked "Not enough data".
        </p>
      </Card>

      <AIInsights campaigns={campaigns} strategies={strategies} goal={goal} tactics={tactics} platforms={platforms} combos={combos} pillars={pillars} />
    </div>
  );
}

const summarize = r => ({
  name: r.key,
  verdict: r.verdict,
  index: r.index,
  campaigns: r.stats.count,
  spend: r.stats.spend,
  impressions: r.stats.impressions,
  engagementRate: r.stats.engagementRate,
  ctr: r.stats.ctr,
  leadRate: r.stats.leadRate,
  leads: r.stats.leads,
  conversions: r.stats.conversions,
  revenue: r.stats.revenue,
  cpl: Number.isFinite(r.stats.cpl) ? r.stats.cpl : null,
  roas: r.stats.roas
});

const PRIORITY_STYLES = { high: 'bg-red-50 text-red-800', medium: 'bg-yellow-50 text-yellow-800', low: 'bg-gray-100 text-gray-700' };

function AIInsights({ campaigns, strategies, goal, tactics, platforms, combos, pillars }) {
  const [state, setState] = useState({ status: 'idle' });

  const run = async () => {
    setState({ status: 'loading' });
    try {
      const baseline = aggregate(campaigns);
      const response = await fetch('/api/analyze-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: SCORING_GOALS[goal].label,
          baseline: summarize({ key: 'All campaigns', verdict: 'average', index: 100, stats: baseline }),
          tactics: tactics.map(summarize),
          platforms: platforms.map(summarize),
          combos: combos.filter(c => c.index !== null).map(summarize),
          pillars: pillars.map(summarize),
          strategies: strategies.map(s => ({ name: s.name, objective: s.objective, status: s.status, kpi: s.kpi, target: s.target, hypothesis: s.hypothesis }))
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The analysis service is unavailable. Is the API server running (npm run server)?');
      setState({ status: 'done', data });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  };

  const data = state.data;
  return (
    <Card
      title="AI strategy review"
      subtitle="Claude reads these numbers and suggests what to double down on, what to cut, and what to test next."
      action={
        <button onClick={run} disabled={state.status === 'loading'} className="btn-primary px-4 py-2 rounded-md flex items-center gap-2 text-sm disabled:opacity-50 whitespace-nowrap">
          <Sparkles className="w-4 h-4" />{state.status === 'loading' ? 'Analyzing...' : data ? 'Re-run' : 'Analyze'}
        </button>
      }
    >
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}
      {state.status === 'idle' && <p className="text-sm text-gray-500">Runs on the current filters and goal.</p>}
      {data && (
        <div className="space-y-5">
          <p className="text-sm text-gray-800">{data.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['Double down on', data.working, 'working'], ['Cut or fix', data.notWorking, 'not-working']].map(([title, items, verdict]) => (
              <div key={title}>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">{title} <VerdictBadge verdict={verdict} /></h4>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item.name} className="text-sm p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{item.name}</span>
                      <p className="text-gray-600 mt-0.5">{item.evidence}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
            <ul className="space-y-2">
              {data.recommendations.map(rec => (
                <li key={rec.action} className="text-sm p-3 border rounded-lg flex gap-3">
                  <span className={`px-2 py-0.5 h-fit text-xs font-medium rounded-full ${PRIORITY_STYLES[rec.priority]}`}>{rec.priority}</span>
                  <div>
                    <p className="font-medium">{rec.action}</p>
                    <p className="text-gray-600 mt-0.5">{rec.rationale}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {data.experiments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" />Experiments to run</h4>
              <ul className="space-y-2">
                {data.experiments.map(x => (
                  <li key={x.hypothesis} className="text-sm p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{x.hypothesis}</p>
                    <p className="text-gray-600 mt-0.5">{x.howToTest}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ---------- Strategies ----------

const STATUS_STYLES = {
  Idea: 'bg-gray-100 text-gray-700',
  Testing: 'bg-yellow-100 text-yellow-800',
  Scaling: 'bg-green-100 text-green-800',
  Paused: 'bg-orange-100 text-orange-800',
  Retired: 'bg-gray-200 text-gray-500'
};

export function StrategiesView({ strategies, campaigns, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Growth plan</p>
          <h2 className="font-display text-3xl text-stone-900">Strategies</h2>
          <p className="text-sm text-gray-500">Write down a hypothesis, link campaigns to it, and track it against a target.</p>
        </div>
        <button onClick={onAdd} className="btn-primary px-4 py-2 rounded-md flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />New strategy
        </button>
      </div>

      {!strategies.length && <Card><Empty>No strategies yet.</Empty></Card>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strategies.map(s => {
          const linked = campaigns.filter(c => c.strategyId === s.id);
          const kpi = KPIS[s.kpi];
          const actual = linked.length ? kpiValue(aggregate(linked), s.kpi) : null;
          const onTrack = kpiOnTrack(Number.isFinite(actual) ? actual : null, s.target, kpi.better);
          return (
            <div key={s.id} className="panel p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-stone-900">{s.name}</h3>
                  <p className="text-xs text-gray-500">{s.objective}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                  <button aria-label={`Edit ${s.name}`} onClick={() => onEdit(s)} className="text-gray-500 hover:text-gray-900"><Edit className="w-4 h-4" /></button>
                  <button aria-label={`Delete ${s.name}`} onClick={() => onDelete(s)} className="text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {s.hypothesis && <p className="text-sm text-gray-700 mt-3 italic">"{s.hypothesis}"</p>}

              <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-gray-50 rounded-lg text-center">
                <div>
                  <p className="font-bold tabular-nums">{fmtKpi(actual, kpi.format)}</p>
                  <p className="text-xs text-gray-500">{kpi.label}</p>
                </div>
                <div>
                  <p className="font-bold tabular-nums">{s.target === '' ? '—' : fmtKpi(Number(s.target), kpi.format)}</p>
                  <p className="text-xs text-gray-500">Target ({kpi.better === 'lower' ? 'max' : 'min'})</p>
                </div>
                <div>
                  <p className={`font-bold ${onTrack === null ? 'text-gray-400' : onTrack ? 'text-green-700' : 'text-red-700'}`}>
                    {onTrack === null ? '—' : onTrack ? '✓ On track' : '✗ Behind'}
                  </p>
                  <p className="text-xs text-gray-500">Status</p>
                </div>
              </div>

              <div className="mt-4 text-sm">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Linked campaigns ({linked.length})</p>
                {linked.length ? (
                  <ul className="space-y-0.5">
                    {linked.map(c => <li key={c.id} className="text-gray-700">• {c.name} <span className="text-gray-400">({c.platform})</span></li>)}
                  </ul>
                ) : <p className="text-gray-500">Link campaigns from the campaign form.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
