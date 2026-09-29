const currency0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const currency2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

const DASH = '—';

export const fmtCurrency = v => (v === null || v === undefined ? DASH : !Number.isFinite(v) ? 'no results' : v === 0 || v >= 100 ? currency0.format(v) : currency2.format(v));
export const fmtCompact = v => (v === null || v === undefined ? DASH : compact.format(v));
export const fmtInt = v => (v === null || v === undefined ? DASH : integer.format(v));
export const fmtPercent = v => (v === null || v === undefined ? DASH : `${(v * 100).toFixed(v < 0.01 ? 2 : 1)}%`);
export const fmtMultiple = v => (v === null || v === undefined ? DASH : `${v.toFixed(1)}×`);

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function fmtKpi(value, format) {
  switch (format) {
    case 'currency': return fmtCurrency(value);
    case 'percent': return fmtPercent(value);
    case 'multiple': return fmtMultiple(value);
    default: return fmtInt(value);
  }
}

// "2.1× avg" / "40% below avg" style phrasing for a better-is->1 multiplier.
export function fmtDriver(driver) {
  const m = driver.multiplier;
  if (m >= 1) return `${driver.label} ${m >= 1.95 ? `${m.toFixed(1)}× better` : `${Math.round((m - 1) * 100)}% better`} than avg`;
  return `${driver.label} ${Math.round((1 - m) * 100)}% worse than avg`;
}

export const VERDICTS = {
  working: { label: 'Working', className: 'bg-blue-50 text-blue-800 border-blue-200', symbol: '▲' },
  average: { label: 'Average', className: 'bg-gray-50 text-gray-700 border-gray-200', symbol: '●' },
  'not-working': { label: 'Not working', className: 'bg-red-50 text-red-800 border-red-200', symbol: '▼' },
  insufficient: { label: 'Not enough data', className: 'bg-white text-gray-500 border-dashed border-gray-300', symbol: '○' }
};
