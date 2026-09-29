import React, { useCallback, useMemo, useState } from 'react';
import { BarChart3, Filter, LayoutDashboard, ListChecks, Share2, Target } from 'lucide-react';
import { SAMPLE_CAMPAIGNS, SAMPLE_STRATEGIES } from './marketing/constants.js';
import { SCORING_GOALS } from './marketing/metrics.js';
import { campaignsToCsv, csvToCampaigns, downloadText, usePersistentState } from './marketing/data.js';
import { CampaignForm, Modal, StrategyForm } from './marketing/forms.jsx';
import { AnalysisView, CampaignsView, Dashboard, PlatformsView, StrategiesView } from './marketing/views.jsx';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
  };

  const clearAll = () => {
    if (!window.confirm('Delete every campaign and strategy? Export a CSV first if you want a backup.')) return;
    setCampaigns([]);
    setStrategies([]);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard campaigns={visibleCampaigns} goal={filters.goal} goToAnalysis={() => setActiveTab('analysis')} />;
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

  const selectClass = 'border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GT</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GreenTree Marketing Hub</h1>
            <p className="text-sm text-gray-500">Strategies, social platforms, and which tactics actually work</p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="bg-white border-b">
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
