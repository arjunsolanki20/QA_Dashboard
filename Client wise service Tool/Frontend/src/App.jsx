import { useState } from 'react';
import { FilterBar }           from './components/FilterBar';
import { ReconciliationTable } from './components/ReconciliationTable';
import { Dashboard }           from './components/Dashboard';
import { useReconciliation }   from './hooks/useReconciliation';
import { exportReconciliation } from './services/api';
import InsertRecords from './components/InsertRecords';
import { Sidebar } from './components/Sidebar';

// Status options aligned with new SP Final_Status values
const STATUS_OPTIONS = [
  { value: '',                     label: 'All Statuses' },
  { value: 'SUCCESS',              label: '✓  Success' },
  { value: 'FAILED',               label: '✗  Failed' },
  { value: 'NOT SENT',             label: '⊘  Not Sent' },
  { value: 'SERVICE MAPPED WRONG', label: '⚠  Service Mapped Wrong' },
  { value: 'MESSAGE NOT MATCHED',  label: '≠  Message Not Matched' },
];

export default function App() {
  const [filters,       setFilters]       = useState({});
  const [activeTab,     setActiveTab]     = useState(() => {
    if (typeof window === 'undefined') return 'table';

    const tabParam = new URLSearchParams(window.location.search).get('tab');
    const tabMap = {
      dashboard: 'dashboard',
      records: 'table',
      table: 'table',
      insert: 'insert',
    };

    return tabMap[tabParam] ?? 'table';
  });
  const [exportLoading, setExportLoading] = useState(false);

  const { data, loading, error, lastFetch, countdown, refresh } =
    useReconciliation(filters);

  const items = data?.items ?? [];

  const handleExport = async () => {
    setExportLoading(true);
    try { await exportReconciliation(filters); }
    catch (e) { alert('Export failed: ' + e.message); }
    finally   { setExportLoading(false); }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-200"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Top bar ── */}
      <header className="border-b border-slate-800 bg-navy-800/80 backdrop-blur-sm sticky top-0 z-20 ml-56">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700
                            flex items-center justify-center text-white text-xs font-bold"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              P
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                QA <span className="text-blue-400">DASHBOARD</span>
              </h1>
              <p className="text-xs text-slate-500">SMS Event Processing Reconciliation</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span style={{ fontFamily: "'DM Mono', monospace" }}>
                Auto-refresh in {countdown}s
              </span>
              <button onClick={refresh} disabled={loading}
                className="px-2.5 py-1 rounded border border-slate-700 text-slate-400
                           hover:border-blue-500 hover:text-blue-400 transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {loading ? '…' : '↻'}
              </button>
            </div>

            {lastFetch && (
              <span className="text-slate-600 hidden sm:block"
                style={{ fontFamily: "'DM Mono', monospace" }}>
                Last: {lastFetch.toLocaleTimeString()}
              </span>
            )}

            <span className="px-3 py-1 rounded-full bg-navy-700 border border-slate-700 text-slate-300"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {items.length.toLocaleString()} records
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="ml-56 px-6 py-6">

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10
                          text-red-400 text-sm flex items-center gap-3">
            <span>⚠ {error}</span>
            <button onClick={refresh} className="ml-auto underline">Retry</button>
          </div>
        )}

        {/* ── Records tab ── */}
        {activeTab === 'table' && (
          <>
            <FilterBar
              statusOptions={STATUS_OPTIONS}
              onFilter={setFilters}
              onExport={handleExport}
              loading={loading || exportLoading}
            />

            <div className="bg-navy-800/30 border border-slate-700/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest"
                  style={{ fontFamily: "'DM Mono', monospace" }}>
                  Reconciliation Records
                </h2>
                {loading && items.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500"
                    style={{ fontFamily: "'DM Mono', monospace" }}>
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Refreshing…
                  </div>
                )}
              </div>
              <ReconciliationTable items={items} loading={loading} />
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> SUCCESS
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" /> FAILED
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> NOT SENT
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" /> SERVICE MAPPED WRONG
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400" /> MESSAGE NOT MATCHED
              </span>
            </div>
          </>
        )}

{/* ── Dashboard tab ── */}
{activeTab === 'dashboard' && (
  <Dashboard filters={filters} />
)}

{activeTab === 'insert' && (
  <div style={{ padding: "20px", color: "white" }}>
    <h2>Insert Records Tab Loaded</h2>
    <InsertRecords />
  </div>
)}
      </main>
    </div>
  );
}
