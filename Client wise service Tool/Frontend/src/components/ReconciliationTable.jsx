import { useState } from 'react';

// ── StatusBadge ───────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  'SUCCESS':              { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)', text: '#34d399' },
  'FAILED':               { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', text: '#f87171' },
  'NOT SENT':             { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)',  text: '#fbbf24' },
  'SERVICE MAPPED WRONG': { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.35)',  text: '#fb923c' },
  'MESSAGE NOT MATCHED':  { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', text: '#a78bfa' },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', text: '#64748b' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border whitespace-nowrap"
      style={{ background: s.bg, borderColor: s.border, color: s.text, fontFamily: "'DM Mono', monospace" }}>
      {status ?? '—'}
    </span>
  );
}

// ── Truncated cell ─────────────────────────────────────────────────────────────
function TruncCell({ text, maxLen = 50 }) {
  const [exp, setExp] = useState(false);
  if (!text) return <span style={{ color: '#475569' }}>—</span>;
  if (text.length <= maxLen) return <span>{text}</span>;
  return (
    <span>
      {exp ? text : text.slice(0, maxLen) + '…'}
      <button onClick={() => setExp(v => !v)}
        className="ml-1 text-xs underline" style={{ color: '#60a5fa' }}>
        {exp ? 'less' : 'more'}
      </button>
    </span>
  );
}

// ── Match % bar ───────────────────────────────────────────────────────────────
function MatchBar({ pct }) {
  const color = pct >= 90 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171';
  return (
    <div className="flex items-center gap-1.5 min-w-[70px]">
      <div className="flex-1 rounded-full overflow-hidden"
        style={{ height: 5, background: 'rgba(51,65,85,0.5)' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 9999 }} />
      </div>
      <span className="text-xs" style={{ color, fontFamily: "'DM Mono', monospace", minWidth: 38 }}>
        {pct}%
      </span>
    </div>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────
const COLS = [
  { key: 'serviceId',             label: 'Svc ID' },
  { key: 'serviceNameEnglish',    label: 'Service' },
  { key: 'source_Journey',        label: 'Journey' },
  { key: 'languageId',            label: 'Lang' },
  { key: 'mobileNumber',          label: 'Mobile' },
  { key: 'insertDate',            label: 'Insert Date' },
  { key: 'updatedOn',             label: 'Archived At' },
  { key: 'processing_Time_Seconds', label: 'Proc. Time' },
  { key: 'content_Match_Percentage', label: 'Match %' },
  { key: 'final_Status',          label: 'Status' },
];

const fmt = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const fmtTime = (sec) => {
  if (sec == null) return '—';
  if (sec < 60)   return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
};

// ── Table ─────────────────────────────────────────────────────────────────────
export function ReconciliationTable({ items = [], loading }) {
  const [sortKey, setSortKey] = useState('insertDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 50;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const sorted = [...items].sort((a, b) => {
    const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? '';
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged      = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading && !items.length) {
    return (
      <div className="flex flex-col items-center justify-center h-56 gap-3 text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
          Fetching data…
        </span>
      </div>
    );
  }

  if (!loading && !items.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm"
        style={{ fontFamily: "'DM Mono', monospace" }}>
        No records found.
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-700" style={{ background: 'rgba(15,23,42,0.8)' }}>
              {COLS.map(col => (
                <th key={col.key} onClick={() => handleSort(col.key)}
                  className="px-3 py-3 text-left cursor-pointer select-none whitespace-nowrap
                             hover:text-blue-400 transition-colors"
                  style={{ fontSize: 10, color: '#64748b', fontFamily: "'DM Mono', monospace",
                           letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1" style={{ color: '#60a5fa' }}>
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={`${row.serviceId}-${row.mobileNumber}-${i}`}
                className="border-b border-slate-800/50 hover:bg-blue-900/10 transition-colors"
                style={{ background: i % 2 === 0 ? 'rgba(15,23,42,0.4)' : 'transparent' }}>
                <td className="px-3 py-2.5 text-xs" style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
                  {row.serviceId ?? '—'}
                </td>
                <td className="px-3 py-2.5 max-w-[140px]" style={{ color: '#cbd5e1' }}>
                  <TruncCell text={row.serviceNameEnglish} maxLen={20} />
                </td>
                <td className="px-3 py-2.5 max-w-[160px]" style={{ color: '#94a3b8' }}>
                  <TruncCell text={row.source_Journey} maxLen={25} />
                </td>
                <td className="px-3 py-2.5 text-xs" style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}>
                  {row.languageId === 2 ? 'EN' : 'AR'}
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap"
                  style={{ color: '#cbd5e1', fontFamily: "'DM Mono', monospace" }}>
                  {row.mobileNumber ?? '—'}
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: '#64748b' }}>
                  {fmt(row.insertDate)}
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: '#64748b' }}>
                  {fmt(row.updatedOn)}
                </td>
                <td className="px-3 py-2.5 text-xs whitespace-nowrap"
                  style={{
                    color: row.processing_Time_Seconds > 300 ? '#f87171' : '#94a3b8',
                    fontFamily: "'DM Mono', monospace",
                  }}>
                  {fmtTime(row.processing_Time_Seconds)}
                  {row.processing_Time_Seconds > 300 && <span className="ml-1">⚠</span>}
                </td>
                <td className="px-3 py-2.5">
                  <MatchBar pct={row.content_Match_Percentage ?? 0} />
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={row.final_Status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-slate-500" style={{ fontFamily: "'DM Mono', monospace" }}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length.toLocaleString()}
          </span>
          <div className="flex gap-1">
            {[
              ['«', () => setPage(1),          page === 1],
              ['‹', () => setPage(p => p - 1), page === 1],
              ['›', () => setPage(p => p + 1), page === totalPages],
              ['»', () => setPage(totalPages),  page === totalPages],
            ].map(([label, fn, dis], i) => (
              <button key={i} onClick={fn} disabled={dis}
                className="px-2.5 py-1 text-xs rounded border border-slate-700 text-slate-400
                           hover:border-blue-500 hover:text-blue-400 disabled:opacity-30 transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
