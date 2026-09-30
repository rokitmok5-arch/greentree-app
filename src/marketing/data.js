// Persistence (browser localStorage) and CSV import/export for campaigns.
import { useEffect, useState } from 'react';
import { COUNT_FIELDS, toNumber } from './metrics.js';

const STORAGE_KEY = 'greentree.marketing.v1';

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Like useState, but the value survives reloads. Falls back to in-memory state when
// storage is unavailable (private windows, blocked site data).
export function usePersistentState(field, initialValue) {
  const [value, setValue] = useState(() => readStored()?.[field] ?? (typeof initialValue === 'function' ? initialValue() : initialValue));
  useEffect(() => {
    try {
      const current = readStored() ?? {};
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, [field]: value }));
    } catch {
      // Storage unavailable; keep working in memory.
    }
  }, [field, value]);
  return [value, setValue];
}

export const CSV_COLUMNS = ['name', 'platform', 'tactic', 'pillar', 'objective', 'startDate', 'endDate', ...COUNT_FIELDS, 'notes'];

// Common column names from ad-platform exports, mapped to our fields.
const HEADER_ALIASES = {
  'campaign': 'name',
  'campaign name': 'name',
  'channel': 'platform',
  'network': 'platform',
  'format': 'tactic',
  'content type': 'tactic',
  'content pillar': 'pillar',
  'goal': 'objective',
  'start': 'startDate',
  'start date': 'startDate',
  'reporting starts': 'startDate',
  'end': 'endDate',
  'end date': 'endDate',
  'reporting ends': 'endDate',
  'cost': 'spend',
  'amount spent': 'spend',
  'amount spent (usd)': 'spend',
  'engagement': 'engagements',
  'post engagements': 'engagements',
  'interactions': 'engagements',
  'link clicks': 'clicks',
  'results': 'leads',
  'purchases': 'conversions',
  'conversion value': 'revenue',
  'purchases conversion value': 'revenue'
};

const CANONICAL = Object.fromEntries(CSV_COLUMNS.map(c => [c.toLowerCase(), c]));

function escapeCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function campaignsToCsv(campaigns) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const c of campaigns) lines.push(CSV_COLUMNS.map(col => escapeCell(c[col])).join(','));
  return lines.join('\n');
}

// RFC 4180-style parser: handles quoted cells, escaped quotes and newlines in quotes.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

// Returns { campaigns, skipped, unknownColumns }.
export function csvToCampaigns(text) {
  const rows = parseCsv(text.replace(/^﻿/, ''));
  if (rows.length < 2) return { campaigns: [], skipped: 0, unknownColumns: [] };

  const unknownColumns = [];
  const fields = rows[0].map(h => {
    const key = h.trim().toLowerCase();
    const field = CANONICAL[key] ?? HEADER_ALIASES[key] ?? null;
    if (!field && key) unknownColumns.push(h.trim());
    return field;
  });

  const campaigns = [];
  let skipped = 0;
  rows.slice(1).forEach((cells, i) => {
    const c = {};
    fields.forEach((field, col) => { if (field) c[field] = (cells[col] ?? '').trim(); });
    if (!c.name) { skipped++; return; }
    for (const f of COUNT_FIELDS) c[f] = toNumber(String(c[f] ?? '').replace(/[$,%\s]/g, ''));
    campaigns.push({
      platform: 'Other',
      tactic: 'Other',
      pillar: '',
      objective: 'Leads',
      strategyId: '',
      startDate: '',
      endDate: '',
      notes: '',
      ...c,
      id: `import-${Date.now()}-${i}`
    });
  });
  return { campaigns, skipped, unknownColumns };
}

export function downloadText(filename, text, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
