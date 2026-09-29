// Lightweight HTML charts for the Marketing Hub. Colors come from the --viz-* CSS
// variables in index.html (blue = above average, red = below, gray = neutral).
import React, { useCallback, useState } from 'react';

export function useTooltip() {
  const [tip, setTip] = useState(null);
  const show = useCallback((event, content) => setTip({ x: event.clientX, y: event.clientY, content }), []);
  const hide = useCallback(() => setTip(null), []);
  const node = tip && (
    <div
      role="tooltip"
      className="fixed z-50 pointer-events-none rounded-md shadow-lg px-3 py-2 text-xs max-w-xs"
      style={{ left: tip.x + 14, top: tip.y + 14, background: 'var(--viz-tooltip-bg)', color: 'var(--viz-tooltip-ink)' }}
    >
      {tip.content}
    </div>
  );
  return { show, hide, node };
}

const TooltipBody = ({ title, lines }) => (
  <>
    <div className="font-semibold mb-1">{title}</div>
    {lines.map(([label, value]) => (
      <div key={label} className="flex justify-between gap-4">
        <span style={{ opacity: 0.75 }}>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
    ))}
  </>
);

// Horizontal bars for one measure across categories.
// rows: [{ label, value, display, tooltip: [[label, value], ...] }]
export function BarChart({ rows, emptyText = 'No data yet' }) {
  const { show, hide, node } = useTooltip();
  const max = Math.max(0, ...rows.map(r => r.value || 0));
  if (!rows.length || max === 0) return <p className="text-sm text-gray-500 py-6 text-center">{emptyText}</p>;

  return (
    <div className="space-y-2">
      {rows.map(row => (
        <div
          key={row.label}
          className="grid grid-cols-[minmax(0,9rem)_1fr_4.5rem] items-center gap-3 py-0.5 rounded hover:bg-gray-50"
          onMouseMove={e => show(e, <TooltipBody title={row.label} lines={row.tooltip ?? [['Value', row.display]]} />)}
          onMouseLeave={hide}
        >
          <span className="text-sm truncate" style={{ color: 'var(--viz-ink-2)' }}>{row.label}</span>
          <div className="h-4 flex items-center" style={{ borderLeft: '1px solid var(--viz-axis)' }}>
            <div
              className="h-3"
              style={{ width: `${(row.value / max) * 100}%`, minWidth: row.value > 0 ? 2 : 0, background: 'var(--viz-good)', borderRadius: '0 4px 4px 0' }}
            />
          </div>
          <span className="text-sm text-right tabular-nums" style={{ color: 'var(--viz-ink-1)' }}>{row.display}</span>
        </div>
      ))}
      {node}
    </div>
  );
}

// Diverging bars around the 100 = average line. Uses a log scale so 2× better and
// 2× worse get equal-length bars.
// rows: [{ key, index, verdict, stats, drivers, tooltip }]
const LOG_DOMAIN = 2; // ±2 → 25..400

export function IndexChart({ rows, onSelect }) {
  const { show, hide, node } = useTooltip();
  if (!rows.length) return <p className="text-sm text-gray-500 py-6 text-center">No data yet</p>;

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,6.5rem)_1fr_2.5rem] sm:grid-cols-[minmax(0,10rem)_1fr_3rem] gap-3 text-xs mb-1" style={{ color: 'var(--viz-ink-3)' }}>
        <span />
        <div className="flex justify-between">
          <span>← below average</span>
          <span>above average →</span>
        </div>
        <span />
      </div>
      <div className="space-y-1.5">
        {rows.map(row => {
          const pos = row.index === null ? 0 : Math.max(-LOG_DOMAIN, Math.min(LOG_DOMAIN, Math.log2(row.index / 100)));
          const widthPct = (Math.abs(pos) / LOG_DOMAIN) * 50;
          const above = pos >= 0;
          return (
            <div
              key={row.key}
              className={`grid grid-cols-[minmax(0,6.5rem)_1fr_2.5rem] sm:grid-cols-[minmax(0,10rem)_1fr_3rem] items-center gap-3 py-0.5 rounded hover:bg-gray-50 ${onSelect ? 'cursor-pointer' : ''}`}
              onClick={onSelect ? () => onSelect(row.key) : undefined}
              onMouseMove={e => show(e, <TooltipBody title={row.key} lines={row.tooltip} />)}
              onMouseLeave={hide}
            >
              <span className="text-sm truncate" style={{ color: 'var(--viz-ink-2)' }}>{row.key}</span>
              <div className="relative h-5">
                <div className="absolute inset-y-0 left-1/2" style={{ borderLeft: '1px solid var(--viz-axis)' }} />
                {row.index === null ? (
                  <span className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--viz-ink-3)' }}>not enough data</span>
                ) : (
                  <div
                    className="absolute top-1 h-3"
                    style={{
                      left: above ? '50%' : `${50 - widthPct}%`,
                      width: `${Math.max(widthPct, 0.5)}%`,
                      background: above ? 'var(--viz-good)' : 'var(--viz-bad)',
                      borderRadius: above ? '0 4px 4px 0' : '4px 0 0 4px'
                    }}
                  />
                )}
              </div>
              <span className="text-sm text-right tabular-nums font-medium" style={{ color: 'var(--viz-ink-1)' }}>{row.index ?? '—'}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--viz-ink-3)' }}>
        Performance index: 100 = your overall average. 200 means twice as good, 50 means half as good.
      </p>
      {node}
    </div>
  );
}

// Diverging cell color on a log scale around 100.
function cellStyle(index) {
  if (index === null || index === undefined) return { background: 'transparent', color: 'var(--viz-ink-3)' };
  const t = Math.max(-1, Math.min(1, Math.log2(index / 100) / 1.5));
  if (Math.abs(t) < 0.12) return { background: 'var(--viz-neutral)', color: 'var(--viz-ink-1)' };
  const alpha = 0.18 + 0.72 * Math.abs(t);
  const rgb = t > 0 ? 'var(--viz-good-rgb)' : 'var(--viz-bad-rgb)';
  return { background: `rgb(${rgb} / ${alpha.toFixed(2)})`, color: alpha > 0.55 ? '#ffffff' : 'var(--viz-ink-1)' };
}

// Platform × tactic grid. cells: Map of `${row}|${col}` → { index, tooltip }
export function Heatmap({ rowKeys, colKeys, cells }) {
  const { show, hide, node } = useTooltip();
  return (
    <div className="overflow-x-auto">
      <table className="border-separate" style={{ borderSpacing: 2 }}>
        <thead>
          <tr>
            <th />
            {colKeys.map(col => (
              <th key={col} className="text-xs font-medium px-1 pb-1 align-bottom text-left" style={{ color: 'var(--viz-ink-2)', minWidth: 72 }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowKeys.map(row => (
            <tr key={row}>
              <th className="text-sm font-medium text-left pr-3 whitespace-nowrap" style={{ color: 'var(--viz-ink-2)' }}>{row}</th>
              {colKeys.map(col => {
                const cell = cells.get(`${row}|${col}`);
                if (!cell) return <td key={col} className="text-center text-xs" style={{ color: 'var(--viz-axis)' }}>·</td>;
                return (
                  <td
                    key={col}
                    className="text-center text-sm font-semibold tabular-nums rounded h-10"
                    style={cellStyle(cell.index)}
                    onMouseMove={e => show(e, <TooltipBody title={`${row} · ${col}`} lines={cell.tooltip} />)}
                    onMouseLeave={hide}
                  >
                    {cell.index ?? <span className="font-normal text-xs">low data</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {node}
    </div>
  );
}
