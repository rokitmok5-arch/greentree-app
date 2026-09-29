import React, { useState } from 'react';
import { EMPTY_CAMPAIGN, EMPTY_STRATEGY, KPIS, OBJECTIVES, PLATFORMS, STRATEGY_STATUSES, TACTICS } from './constants.js';
import { COUNT_FIELDS, toNumber } from './metrics.js';

const inputClass = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent';

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, hint, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
    {children}
    {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
  </label>
);

// Keeps an existing value selectable even if it isn't in the standard list (e.g. from a CSV import).
const withCurrent = (options, current) => (current && !options.includes(current) ? [...options, current] : options);

const METRIC_FIELDS = [
  { field: 'spend', label: 'Spend ($)', hint: '0 for organic' },
  { field: 'impressions', label: 'Impressions' },
  { field: 'reach', label: 'Reach' },
  { field: 'engagements', label: 'Engagements', hint: 'Likes + comments + shares + saves. Leave 0 if not tracked.' },
  { field: 'clicks', label: 'Clicks' },
  { field: 'leads', label: 'Leads' },
  { field: 'conversions', label: 'Conversions' },
  { field: 'revenue', label: 'Revenue ($)' }
];

export function CampaignForm({ initial, strategies, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_CAMPAIGN, ...initial });
  const [error, setError] = useState('');
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const submit = () => {
    if (!form.name.trim()) return setError('Give the campaign a name.');
    const saved = { ...form, name: form.name.trim() };
    for (const f of COUNT_FIELDS) saved[f] = toNumber(form[f]);
    onSave(saved);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Campaign / post name *" className="md:col-span-2">
          <input className={inputClass} value={form.name} onChange={set('name')} placeholder="e.g., Spring listing reels" />
        </Field>
        <Field label="Platform">
          <select className={inputClass} value={form.platform} onChange={set('platform')}>
            {withCurrent(PLATFORMS, form.platform).map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Tactic">
          <select className={inputClass} value={form.tactic} onChange={set('tactic')}>
            {withCurrent(TACTICS, form.tactic).map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Objective">
          <select className={inputClass} value={form.objective} onChange={set('objective')}>
            {withCurrent(OBJECTIVES, form.objective).map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Strategy">
          <select className={inputClass} value={form.strategyId} onChange={set('strategyId')}>
            <option value="">None</option>
            {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Start date">
          <input type="date" className={inputClass} value={form.startDate} onChange={set('startDate')} />
        </Field>
        <Field label="End date">
          <input type="date" className={inputClass} value={form.endDate} onChange={set('endDate')} />
        </Field>
      </div>

      <h4 className="text-sm font-semibold text-gray-900 mt-6 mb-3">Results</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRIC_FIELDS.map(({ field, label, hint }) => (
          <Field key={field} label={label} hint={hint}>
            <input type="number" min="0" className={inputClass} value={form[field]} onChange={set(field)} placeholder="0" />
          </Field>
        ))}
      </div>

      <Field label="Notes" className="mt-4">
        <textarea className={inputClass} rows="2" value={form.notes} onChange={set('notes')} placeholder="Creative, audience, hook, anything worth remembering..." />
      </Field>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <FormButtons onSave={submit} onCancel={onCancel} />
    </>
  );
}

export function StrategyForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_STRATEGY, ...initial });
  const [error, setError] = useState('');
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));
  const kpi = KPIS[form.kpi];
  const isPercent = kpi.format === 'percent';

  const submit = () => {
    if (!form.name.trim()) return setError('Give the strategy a name.');
    onSave({ ...form, name: form.name.trim(), target: form.target === '' ? '' : Number(form.target) });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Strategy name *" className="md:col-span-2">
          <input className={inputClass} value={form.name} onChange={set('name')} placeholder="e.g., Video-first listing launches" />
        </Field>
        <Field label="Objective">
          <select className={inputClass} value={form.objective} onChange={set('objective')}>
            {OBJECTIVES.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputClass} value={form.status} onChange={set('status')}>
            {STRATEGY_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Success KPI">
          <select className={inputClass} value={form.kpi} onChange={set('kpi')}>
            {Object.entries(KPIS).map(([key, k]) => <option key={key} value={key}>{k.label}</option>)}
          </select>
        </Field>
        <Field label={`Target (${kpi.better === 'lower' ? 'at most' : 'at least'})`} hint={isPercent ? 'Enter as a decimal: 0.05 = 5%' : undefined}>
          <input type="number" min="0" step="any" className={inputClass} value={form.target} onChange={set('target')} />
        </Field>
        <Field label="Hypothesis" className="md:col-span-2">
          <textarea className={inputClass} rows="2" value={form.hypothesis} onChange={set('hypothesis')} placeholder="We believe [tactic] on [platform] will [result] because..." />
        </Field>
        <Field label="Notes" className="md:col-span-2">
          <textarea className={inputClass} rows="2" value={form.notes} onChange={set('notes')} />
        </Field>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <FormButtons onSave={submit} onCancel={onCancel} />
    </>
  );
}

const FormButtons = ({ onSave, onCancel }) => (
  <div className="flex gap-3 mt-6">
    <button onClick={onSave} className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">Save</button>
    <button onClick={onCancel} className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
  </div>
);
