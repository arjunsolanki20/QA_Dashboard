import { useState } from 'react';

export function FilterBar({ statusOptions = [], onFilter, onExport, loading }) {
  const [mobile,   setMobile]   = useState('');
  const [status,   setStatus]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const handleApply = () => {
    onFilter({
      mobileNumber: mobile   || undefined,
      statusFilter: status   || undefined,
      dateFrom:     dateFrom || undefined,
      dateTo:       dateTo   || undefined,
    });
  };

  const handleClear = () => {
    setMobile(''); setStatus(''); setDateFrom(''); setDateTo('');
    onFilter({});
  };

  const inputCls =
    'bg-navy-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 ' +
    'placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors w-full';

  return (
    <div className="bg-navy-800/60 border border-slate-700/50 rounded-xl p-4 mb-5 backdrop-blur-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">

        <div>
          <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider"
            style={{ fontFamily: "'DM Mono', monospace" }}>Mobile Number</label>
          <input type="text" placeholder="Search mobile…"
            value={mobile} onChange={e => setMobile(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider"
            style={{ fontFamily: "'DM Mono', monospace" }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className={inputCls + ' cursor-pointer'}>
            {statusOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider"
            style={{ fontFamily: "'DM Mono', monospace" }}>Date From</label>
          <input type="datetime-local" value={dateFrom}
            onChange={e => setDateFrom(e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider"
            style={{ fontFamily: "'DM Mono', monospace" }}>Date To</label>
          <input type="datetime-local" value={dateTo}
            onChange={e => setDateTo(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={handleClear}
          className="px-4 py-2 text-sm rounded-lg border border-slate-600 text-slate-400
                     hover:border-slate-500 hover:text-slate-200 transition-colors">
          Clear
        </button>
        <button onClick={handleApply} disabled={loading}
          className="px-5 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white
                     transition-colors disabled:opacity-50">
          {loading ? 'Loading…' : 'Apply Filters'}
        </button>
        <button onClick={onExport}
          className="px-5 py-2 text-sm rounded-lg border border-emerald-600/60 text-emerald-400
                     hover:bg-emerald-600/20 transition-colors flex items-center gap-2">
          ↓ Export Excel
        </button>
      </div>
    </div>
  );
}
