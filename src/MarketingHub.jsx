import React, { useCallback, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Filter, LayoutDashboard, ListChecks, Share2, Target } from 'lucide-react';
import { SAMPLE_CAMPAIGNS, SAMPLE_STRATEGIES } from './marketing/constants.js';
import { SCORING_GOALS } from './marketing/metrics.js';
import { campaignsToCsv, csvToCampaigns, downloadText, usePersistentState } from './marketing/data.js';
import { CampaignForm, Modal, StrategyForm } from './marketing/forms.jsx';
import { buildSamplePosts, ContentStudio } from './marketing/studio.jsx';
import { AnalysisView, CampaignsView, Dashboard, PlatformsView, StrategiesView } from './marketing/views.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'studio', label: 'Content Studio', icon: CalendarDays },
  { id: 'campaigns', label: 'Campaigns', icon: ListChecks },
  { id: 'platforms', label: 'Platforms', icon: Share2 },
  { id: 'analysis', label: 'Tactic Analysis', icon: BarChart3 },
  { id: 'strategies', label: 'Strategies', icon: Target }
];

const PERIODS = {
  all: { label: 'All time', days: null },
  30: { label: 'Last 30 days', days: 30 },
  90: { label: 'Last 90 days', days: 90 },
  180: { label: 'Last 6 months', days: 180 },
  365: { label: 'Last 12 months', days: 365 }
};

// A campaign is in the period if it was running at any point inside it. Undated campaigns always count.
function inPeriod(campaign, days) {
  if (!days) return true;
  const last = campaign.endDate || campaign.startDate;
  if (!last) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(last) >= cutoff;
}

const newId = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function MarketingHub() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = usePersistentState('campaigns', SAMPLE_CAMPAIGNS);
  const [strategies, setStrategies] = usePersistentState('strategies', SAMPLE_STRATEGIES);
  const [posts, setPosts] = usePersistentState('posts', buildSamplePosts);
  const [filters, setFilters] = usePersistentState('filters', { period: 'all', platform: '', goal: 'balanced' });
  const [editing, setEditing] = useState(null); // { kind: 'campaign' | 'strategy', item }
  const [notice, setNotice] = useState('');

  const platformOptions = useMemo(() => [...new Set(campaigns.map(c => c.platform))].sort(), [campaigns]);
  const visibleCampaigns = useMemo(
    () => campaigns.filter(c => (!filters.platform || c.platform === filters.platform) && inPeriod(c, PERIODS[filters.period]?.days)),
    [campaigns, filters]
  );
  const setFilter = field => e => setFilters(f => ({ ...f, [field]: e.target.value }));

  const saveCampaign = useCallback(item => {
    setCampaigns(prev => (item.id ? prev.map(c => (c.id === item.id ? item : c)) : [...prev, { ...item, id: newId('c') }]));
    setEditing(null);
  }, [setCampaigns]);

  const saveStrategy = useCallback(item => {
    setStrategies(prev => (item.id ? prev.map(s => (s.id === item.id ? item : s)) : [...prev, { ...item, id: newId('s') }]));
    setEditing(null);
  }, [setStrategies]);

  const deleteCampaign = c => {
    if (window.confirm(`Delete "${c.name}"?`)) setCampaigns(prev => prev.filter(x => x.id !== c.id));
  };

  const deleteStrategy = s => {
    if (!window.confirm(`Delete strategy "${s.name}"? Linked campaigns are kept but unlinked.`)) return;
    setStrategies(prev => prev.filter(x => x.id !== s.id));
    setCampaigns(prev => prev.map(c => (c.strategyId === s.id ? { ...c, strategyId: '' } : c)));
  };

  const importCsv = text => {
    const { campaigns: imported, skipped, unknownColumns } = csvToCampaigns(text);
    setCampaigns(prev => [...prev, ...imported]);
    const parts = [`Imported ${imported.length} campaign${imported.length === 1 ? '' : 's'}.`];
    if (skipped) parts.push(`Skipped ${skipped} row${skipped === 1 ? '' : 's'} without a name.`);
    if (unknownColumns.length) parts.push(`Ignored columns: ${unknownColumns.join(', ')}.`);
    setNotice(parts.join(' '));
  };

  const resetSample = () => {
    if (!window.confirm('Replace all campaigns and strategies with the sample data?')) return;
    setCampaigns(SAMPLE_CAMPAIGNS);
    setStrategies(SAMPLE_STRATEGIES);
    setPosts(buildSamplePosts());
  };

  const clearAll = () => {
    if (!window.confirm('Delete every campaign, strategy and scheduled post? Export a CSV first if you want a backup.')) return;
    setCampaigns([]);
    setStrategies([]);
    setPosts([]);
  };

  // Turn a published post into a campaign so its results count toward the tactic analysis.
  const logPostResults = post => {
    setActiveTab('campaigns');
    setEditing({
      kind: 'campaign',
      item: {
        name: post.title,
        platform: post.platforms[0] ?? 'Instagram',
        tactic: post.tactic,
        pillar: post.pillar,
        objective: 'Engagement',
        startDate: post.date,
        endDate: post.date,
        notes: post.platforms.length > 1 ? `Also posted to ${post.platforms.slice(1).join(', ')}.` : ''
      }
    });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard campaigns={visibleCampaigns} goal={filters.goal} goToAnalysis={() => setActiveTab('analysis')} />;
      case 'studio':
        return <ContentStudio posts={posts} setPosts={setPosts} onLogResults={logPostResults} />;
      case 'campaigns':
        return (
          <CampaignsView
            campaigns={visibleCampaigns}
            allCount={campaigns.length}
            strategies={strategies}
            goal={filters.goal}
            onAdd={() => setEditing({ kind: 'campaign', item: {} })}
            onEdit={c => setEditing({ kind: 'campaign', item: c })}
            onDelete={deleteCampaign}
            onImport={importCsv}
            onExport={() => downloadText('greentree-campaigns.csv', campaignsToCsv(campaigns))}
            onResetSample={resetSample}
            onClearAll={clearAll}
          />
        );
      case 'platforms':
        return <PlatformsView campaigns={visibleCampaigns} goal={filters.goal} />;
      case 'analysis':
        return <AnalysisView campaigns={visibleCampaigns} strategies={strategies} goal={filters.goal} />;
      case 'strategies':
        return (
          <StrategiesView
            strategies={strategies}
            campaigns={visibleCampaigns}
            onAdd={() => setEditing({ kind: 'strategy', item: {} })}
            onEdit={s => setEditing({ kind: 'strategy', item: s })}
            onDelete={deleteStrategy}
          />
        );
      default:
        return null;
    }
  };

  const selectClass = 'border border-stone-300 rounded-md px-3 py-1.5 text-sm bg-white focus-gold';

  return (
    <div className="min-h-screen">
      <header style={{ background: 'var(--brand)' }}>
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--gold)' }}>
              <span className="font-display text-xl text-gold">GT</span>
            </div>
            <div>
              <p className="font-display text-3xl leading-none text-white tracking-wide">Green Tree Properties</p>
              <p className="eyebrow mt-2">Marketing Studio</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white">Kevin Hood, Broker</p>
            <p className="text-xs" style={{ color: 'var(--gold-light)' }}>DRE# 01476642 · Orange County & North County San Diego</p>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-3 border-b-2 text-sm whitespace-nowrap transition-colors"
              style={activeTab === id
                ? { borderColor: 'var(--gold)', color: '#ffffff' }
                : { borderColor: 'transparent', color: 'rgb(255 255 255 / 0.6)' }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="bg-white border-b" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select aria-label="Period" value={filters.period} onChange={setFilter('period')} className={selectClass}>
            {Object.entries(PERIODS).map(([key, p]) => <option key={key} value={key}>{p.label}</option>)}
          </select>
          <select aria-label="Platform" value={filters.platform} onChange={setFilter('platform')} className={selectClass}>
            <option value="">All platforms</option>
            {platformOptions.map(p => <option key={p}>{p}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Optimize for
            <select value={filters.goal} onChange={setFilter('goal')} className={selectClass}>
              {Object.entries(SCORING_GOALS).map(([key, g]) => <option key={key} value={key}>{g.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {notice && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg flex justify-between gap-4">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} className="text-blue-800 hover:underline">Dismiss</button>
          </div>
        )}
        {renderTab()}
      </main>

      {editing?.kind === 'campaign' && (
        <Modal title={editing.item.id ? 'Edit campaign' : 'Add campaign'} onClose={() => setEditing(null)}>
          <CampaignForm initial={editing.item} strategies={strategies} onSave={saveCampaign} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {editing?.kind === 'strategy' && (
        <Modal title={editing.item.id ? 'Edit strategy' : 'New strategy'} onClose={() => setEditing(null)}>
          <StrategyForm initial={editing.item} onSave={saveStrategy} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
