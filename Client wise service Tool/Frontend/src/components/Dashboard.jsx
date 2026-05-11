import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as RTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';

// ── Palette exactly matching the 5 Final_Status values ────────────────────────
const STATUS_META = {
  SUCCESS:              { color: '#34d399', label: 'Success',              icon: '✓' },
  FAILED:               { color: '#f87171', label: 'Failed',               icon: '✗' },
  'NOT SENT':           { color: '#fbbf24', label: 'Not Sent',             icon: '⊘' },
  'SERVICE MAPPED WRONG': { color: '#fb923c', label: 'Svc Mapped Wrong',   icon: '⚠' },
  'MESSAGE NOT MATCHED':  { color: '#a78bfa', label: 'Msg Not Matched',    icon: '≠' },
};

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 11,
  fontFamily: "'DM Mono', monospace",
};

const MONO = { fontFamily: "'DM Mono', monospace" };

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (sec) => {
  if (sec == null || sec === 0) return '—';
  if (sec < 60)   return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
};

const pctColor = (pct) => {
  if (pct >= 90) return '#34d399';
  if (pct >= 70) return '#fbbf24';
  return '#f87171';
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Sk({ h = 160 }) {
  return (
    <div className="animate-pulse rounded-xl"
      style={{ height: h, background: 'rgba(51,65,85,0.25)' }} />
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Panel({ title, children, className = '' }) {
  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
      style={{
        background: 'rgba(15,23,42,0.7)',
        borderColor: 'rgba(51,65,85,0.5)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: '#64748b', ...MONO }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARDS  (driven by summary RS1)
// ─────────────────────────────────────────────────────────────────────────────
function KpiCards({ s }) {
  const cards = [
    { key: 'Total',    val: s.total,              label: 'Total Records',        color: '#60a5fa', icon: '▤' },
    { key: 'Suc',      val: s.success,            label: 'Success',              color: '#34d399', icon: '✓',
      sub: `${s.success_Rate_Pct ?? 0}% rate` },
    { key: 'Fail',     val: s.failed,             label: 'Failed',               color: '#f87171', icon: '✗' },
    { key: 'NS',       val: s.notSent,            label: 'Not Sent',             color: '#fbbf24', icon: '⊘' },
    { key: 'SMW',      val: s.serviceMappedWrong, label: 'Svc Mapped Wrong',     color: '#fb923c', icon: '⚠' },
    { key: 'MNM',      val: s.messageNotMatched,  label: 'Msg Not Matched',      color: '#a78bfa', icon: '≠' },
    { key: 'AvgT',     val: fmtTime(s.avg_Processing_Time), label: 'Avg Process Time', color: '#38bdf8', icon: '⏱',
      raw: false },
    { key: 'MaxT',     val: fmtTime(s.max_Processing_Time), label: 'Max Process Time', color: '#e879f9', icon: '⏰',
      raw: false },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {cards.map(c => (
        <div key={c.key}
          className="rounded-xl border p-3 flex flex-col gap-1"
          style={{
            background: `linear-gradient(135deg, ${c.color}18 0%, transparent 100%)`,
            borderColor: `${c.color}35`,
          }}>
          <span style={{ color: c.color, fontSize: 18, ...MONO }}>{c.icon}</span>
          <span className="text-xl font-semibold leading-none"
            style={{ color: c.color, ...MONO }}>
            {c.raw === false ? c.val : (c.val ?? 0).toLocaleString()}
          </span>
          {c.sub && (
            <span className="text-xs" style={{ color: '#64748b', ...MONO }}>{c.sub}</span>
          )}
          <span className="text-xs leading-tight" style={{ color: '#94a3b8' }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS DONUT  (from summary RS1 counts)
// ─────────────────────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.04) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 10, ...MONO }}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

function StatusDonut({ s }) {
  const slices = Object.entries(STATUS_META).map(([key, meta]) => ({
    name: meta.label,
    value: ({
      SUCCESS: s.success,
      FAILED: s.failed,
      'NOT SENT': s.notSent,
      'SERVICE MAPPED WRONG': s.serviceMappedWrong,
      'MESSAGE NOT MATCHED': s.messageNotMatched,
    })[key] ?? 0,
    color: meta.color,
  })).filter(d => d.value > 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={slices} cx="50%" cy="50%"
            innerRadius={55} outerRadius={85}
            dataKey="value" labelLine={false} label={<PieLabel />}>
            {slices.map((s, i) => <Cell key={i} fill={s.color} />)}
          </Pie>
          <RTooltip contentStyle={TOOLTIP_STYLE}
            formatter={(v, n) => [v.toLocaleString(), n]} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="w-full space-y-1.5">
        {slices.map(sl => (
          <div key={sl.name} className="flex items-center justify-between text-xs" style={MONO}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: sl.color }} />
              <span style={{ color: '#cbd5e1' }}>{sl.name}</span>
            </span>
            <span style={{ color: sl.color }}>{sl.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS RATE GAUGE  (single big number)
// ─────────────────────────────────────────────────────────────────────────────
function SuccessGauge({ pct }) {
  const color = pctColor(pct);
  // Arc: SVG semi-circle gauge
  const r = 70, cx = 90, cy = 90;
  const angle = (pct / 100) * 180; // 0–180 degrees
  const rad   = (angle - 180) * (Math.PI / 180);
  const x2    = cx + r * Math.cos(rad);
  const y2    = cy + r * Math.sin(rad);
  const large = angle > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <svg width={180} height={100} viewBox="0 0 180 100">
        {/* Track */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(51,65,85,0.5)" strokeWidth={14} strokeLinecap="round" />
        {/* Fill */}
        {pct > 0 && (
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
            fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 6} textAnchor="middle"
          style={{ fontSize: 28, fontWeight: 700, fill: color, ...MONO }}>
          {pct}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle"
          style={{ fontSize: 10, fill: '#64748b', ...MONO }}>
          SUCCESS RATE
        </text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE STACKED BAR (RS2)
// ─────────────────────────────────────────────────────────────────────────────
function ServiceBar({ rows }) {
  if (!rows?.length) return <Sk />;

  const display = rows.slice(0, 12).map(r => ({
    name: r.serviceNameEnglish.length > 20
      ? r.serviceNameEnglish.slice(0, 18) + '…'
      : r.serviceNameEnglish,
    Success:            r.success,
    Failed:             r.failed,
    'Not Sent':         r.notSent,
    'Svc Mapped Wrong': r.serviceMappedWrong,
    'Msg Not Matched':  r.messageNotMatched,
  }));

  const bars = [
    { key: 'Success',            color: '#34d399' },
    { key: 'Failed',             color: '#f87171' },
    { key: 'Not Sent',           color: '#fbbf24' },
    { key: 'Svc Mapped Wrong',   color: '#fb923c' },
    { key: 'Msg Not Matched',    color: '#a78bfa' },
  ];

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, display.length * 32)}>
      <BarChart data={display} layout="vertical"
        margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
        <YAxis type="category" dataKey="name" width={130}
          tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <RTooltip contentStyle={TOOLTIP_STYLE}
          formatter={(v, n) => [v.toLocaleString(), n]} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} stackId="a" fill={b.color}
            radius={i === bars.length - 1 ? [0, 4, 4, 0] : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE TABLE (RS2)
// ─────────────────────────────────────────────────────────────────────────────
function ServiceTable({ rows }) {
  if (!rows?.length) return <Sk h={120} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse" style={MONO}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
            {['Service', 'Total', '✓ Success', '✗ Failed', '⊘ Not Sent',
              '⚠ Svc Wrong', '≠ Msg Match', 'Avg Time', 'Rate'].map(h => (
              <th key={h} className="pb-2 pr-4 text-left whitespace-nowrap"
                style={{ color: '#64748b', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.serviceId ?? i}
              className="transition-colors hover:bg-white/5"
              style={{ borderBottom: '1px solid rgba(51,65,85,0.25)' }}>
              <td className="py-2 pr-4 max-w-[180px] truncate" style={{ color: '#e2e8f0' }}
                title={r.serviceNameEnglish}>
                {r.serviceNameEnglish || '—'}
              </td>
              <td className="py-2 pr-4" style={{ color: '#60a5fa' }}>
                {r.total.toLocaleString()}
              </td>
              <td className="py-2 pr-4" style={{ color: '#34d399' }}>
                {r.success.toLocaleString()}
              </td>
              <td className="py-2 pr-4" style={{ color: '#f87171' }}>
                {r.failed.toLocaleString()}
              </td>
              <td className="py-2 pr-4" style={{ color: '#fbbf24' }}>
                {r.notSent.toLocaleString()}
              </td>
              <td className="py-2 pr-4" style={{ color: '#fb923c' }}>
                {r.serviceMappedWrong.toLocaleString()}
              </td>
              <td className="py-2 pr-4" style={{ color: '#a78bfa' }}>
                {r.messageNotMatched.toLocaleString()}
              </td>
              <td className="py-2 pr-4" style={{ color: '#94a3b8' }}>
                {fmtTime(r.avg_Processing_Time)}
              </td>
              <td className="py-2 font-semibold"
                style={{ color: pctColor(r.success_Rate_Pct) }}>
                {r.success_Rate_Pct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export function Dashboard({ filters }) {
  const { data, loading, error, refresh } = useDashboard(filters);

  const s  = data?.summary;
  const sb = data?.serviceBreakdown ?? [];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#64748b', ...MONO }}>
          Reconciliation Dashboard
        </span>
        <button onClick={refresh} disabled={loading}
          className="px-3 py-1 rounded-lg border text-xs transition-colors disabled:opacity-40"
          style={{ borderColor: 'rgba(51,65,85,0.6)', color: '#94a3b8', ...MONO }}>
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl border text-sm"
          style={{ borderColor: 'rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
          ⚠ {error}
        </div>
      )}

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {Array.from({ length: 8 }).map((_, i) => <Sk key={i} h={88} />)}
        </div>
      ) : s ? (
        <KpiCards s={s} />
      ) : null}

      {/* Row: Donut + Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Panel title="Status Distribution">
          {loading ? <Sk h={280} /> : s ? <StatusDonut s={s} /> : null}
        </Panel>

        <Panel title="Overall Success Rate">
          {loading ? <Sk h={180} /> : s ? (
            <div className="flex flex-col gap-4">
              <SuccessGauge pct={s.success_Rate_Pct ?? 0} />
              <div className="grid grid-cols-2 gap-3 text-xs" style={MONO}>
                <div className="rounded-lg p-3"
                  style={{ background: 'rgba(56,189,248,0.08)', borderColor: 'rgba(56,189,248,0.25)', border: '1px solid' }}>
                  <p style={{ color: '#64748b' }}>Avg Processing</p>
                  <p className="text-lg font-semibold mt-1" style={{ color: '#38bdf8' }}>
                    {fmtTime(s.avg_Processing_Time)}
                  </p>
                </div>
                <div className="rounded-lg p-3"
                  style={{ background: 'rgba(232,121,249,0.08)', borderColor: 'rgba(232,121,249,0.25)', border: '1px solid' }}>
                  <p style={{ color: '#64748b' }}>Max Processing</p>
                  <p className="text-lg font-semibold mt-1" style={{ color: '#e879f9' }}>
                    {fmtTime(s.max_Processing_Time)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </Panel>
      </div>

      {/* Service stacked bar */}
      <Panel title="Service Volume Breakdown (Stacked by Status)">
        {loading ? <Sk h={280} /> : <ServiceBar rows={sb} />}
      </Panel>

      {/* Service detail table */}
      <Panel title="Service-wise Detail">
        {loading ? <Sk h={160} /> : <ServiceTable rows={sb} />}
      </Panel>

      {/* Status legend footer */}
      <div className="flex flex-wrap gap-4 text-xs pt-1" style={{ ...MONO, color: '#64748b' }}>
        {Object.entries(STATUS_META).map(([, m]) => (
          <span key={m.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
            {m.icon} {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
